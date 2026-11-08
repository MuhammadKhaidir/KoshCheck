import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';

// Body parser bawaan dimatikan supaya formidable bisa membaca multipart/form-data.
export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const BUCKET = 'kos-foto';
const MAX_FOTO = 5;
const MIN_FOTO = 1;
const MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5 MB per foto
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB total
const TIPE = ['putra', 'putri', 'campur'];

// ---------- helpers ----------

const field = (fields, key) => String(fields[key]?.[0] ?? '').trim();

// Cek tipe file dari isi sebenarnya (magic bytes), bukan dari header/ekstensi dari client.
function detectImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  if (
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  return null;
}

// Terima 08xx, 628xx, +628xx -> simpan sebagai 628xx
function normalizeWhatsapp(raw) {
  const cleaned = raw.replace(/[\s\-().]/g, '');
  if (!/^(\+62|62|0)8[1-9]\d{7,11}$/.test(cleaned)) return null;
  return cleaned.replace(/^\+?62/, '62').replace(/^0/, '62');
}

function parseFasilitas(fields) {
  const raw = fields.fasilitas ?? [];
  const items = raw
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(items)];
}

function validate(fields) {
  const errors = {};

  const nama = field(fields, 'nama');
  if (nama.length < 3 || nama.length > 100) errors.nama = 'Nama kos 3-100 karakter';

  const namaPemilik = field(fields, 'nama_pemilik');
  if (namaPemilik.length < 3 || namaPemilik.length > 100) {
    errors.nama_pemilik = 'Nama pemilik 3-100 karakter';
  }

  const alamat = field(fields, 'alamat');
  if (alamat.length < 10 || alamat.length > 300) errors.alamat = 'Alamat 10-300 karakter';

  const kota = field(fields, 'kota');
  if (kota.length < 2 || kota.length > 60) errors.kota = 'Kota 2-60 karakter';

  const tipe = field(fields, 'tipe').toLowerCase();
  if (!TIPE.includes(tipe)) errors.tipe = `Tipe harus salah satu dari: ${TIPE.join(', ')}`;

  // Boleh dikirim "1.500.000" atau "1500000"
  const hargaRaw = field(fields, 'harga').replace(/[.\s]/g, '');
  const harga = /^\d+$/.test(hargaRaw) ? Number(hargaRaw) : NaN;
  if (!Number.isInteger(harga) || harga < 50_000 || harga > 50_000_000) {
    errors.harga = 'Harga per bulan harus angka antara Rp50.000 dan Rp50.000.000';
  }

  const whatsapp = normalizeWhatsapp(field(fields, 'whatsapp'));
  if (!whatsapp) errors.whatsapp = 'Nomor WhatsApp tidak valid (contoh: 081234567890)';

  const deskripsi = field(fields, 'deskripsi');
  if (deskripsi.length > 2000) errors.deskripsi = 'Deskripsi maksimal 2000 karakter';

  const fasilitas = parseFasilitas(fields);
  if (fasilitas.length > 20 || fasilitas.some((f) => f.length > 40)) {
    errors.fasilitas = 'Maksimal 20 fasilitas, masing-masing maksimal 40 karakter';
  }

  // Koordinat opsional, tapi kalau diisi harus lengkap dan masuk akal untuk Indonesia
  let latitude = null;
  let longitude = null;
  const latRaw = field(fields, 'latitude');
  const lngRaw = field(fields, 'longitude');
  if (latRaw || lngRaw) {
    latitude = Number(latRaw);
    longitude = Number(lngRaw);
    const ok =
      latRaw &&
      lngRaw &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -11.5 &&
      latitude <= 6.5 &&
      longitude >= 94 &&
      longitude <= 141.5;
    if (!ok) errors.koordinat = 'Koordinat tidak valid (harus berada di wilayah Indonesia)';
  }

  return {
    errors,
    value: {
      nama,
      nama_pemilik: namaPemilik,
      alamat,
      kota,
      tipe,
      harga,
      whatsapp,
      deskripsi,
      fasilitas,
      latitude,
      longitude,
    },
  };
}

function parseForm(req) {
  const form = formidable({
    multiples: true,
    maxFiles: MAX_FOTO,
    maxFileSize: MAX_FOTO_SIZE,
    maxTotalFileSize: MAX_TOTAL_SIZE,
    allowEmptyFiles: false,
    filter: ({ name }) => name === 'foto', // abaikan file di field lain
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

// ---------- handler ----------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return res.status(415).json({ error: 'Gunakan multipart/form-data' });
  }

  let tmpFiles = [];
  const uploadedPaths = [];

  try {
    let parsed;
    try {
      parsed = await parseForm(req);
    } catch (err) {
      const status = err.httpCode === 413 ? 413 : 400;
      const message =
        status === 413
          ? `Foto terlalu besar (maks ${MAX_FOTO_SIZE / 1024 / 1024} MB per foto)`
          : 'Form tidak dapat dibaca atau jumlah foto melebihi batas';
      return res.status(status).json({ error: message });
    }

    const { fields, files } = parsed;
    tmpFiles = files.foto ?? [];

    // Honeypot: bot biasanya mengisi semua input. Pura-pura sukses, jangan simpan apa pun.
    if (field(fields, 'website')) {
      return res.status(201).json({ message: 'Pendaftaran diterima' });
    }

    const { errors, value } = validate(fields);

    if (tmpFiles.length < MIN_FOTO || tmpFiles.length > MAX_FOTO) {
      errors.foto = `Upload ${MIN_FOTO}-${MAX_FOTO} foto`;
    }

    // Validasi isi file foto
    const images = [];
    if (!errors.foto) {
      for (const f of tmpFiles) {
        const buf = await readFile(f.filepath);
        const type = detectImage(buf);
        if (!type) {
          errors.foto = 'Foto harus berformat JPG, PNG, atau WebP';
          break;
        }
        images.push({ buf, ...type });
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: 'Validasi gagal', details: errors });
    }

    // Upload foto ke storage
    const id = randomUUID();
    const urls = [];
    for (let i = 0; i < images.length; i++) {
      const { buf, ext, contentType: ct } = images[i];
      const path = `${id}/${i + 1}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: ct, upsert: false });
      if (upErr) throw upErr;
      uploadedPaths.push(path);
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }

    // Simpan data. Kolom status SELALU 'pending' dan tidak pernah dibaca dari input client.
    const { error: insErr } = await supabase
      .from('kos')
      .insert({ id, ...value, foto: urls, status: 'pending' });
    if (insErr) throw insErr;

    return res.status(201).json({
      message: 'Pendaftaran diterima dan menunggu verifikasi tim KoshCheck',
      id,
      status: 'pending',
    });
  } catch (err) {
    console.error('[api/kos/register] gagal:', err);
    // Bersihkan foto yang sudah terlanjur terupload supaya tidak jadi file yatim
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths).catch(() => {});
    }
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  } finally {
    await Promise.all(tmpFiles.map((f) => unlink(f.filepath).catch(() => {})));
  }
}
