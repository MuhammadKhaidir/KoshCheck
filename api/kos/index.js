import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Kolom yang boleh tampil ke publik. nama_pemilik & status sengaja tidak disertakan.
const PUBLIC_COLUMNS =
  'id, nama, alamat, kota, tipe, harga, whatsapp, deskripsi, fasilitas, foto, latitude, longitude, created_at';

const TIPE = ['putra', 'putri', 'campur'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const first = (v) => (Array.isArray(v) ? v[0] : v);

function toInt(value, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number.parseInt(first(value), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

// Buang karakter yang punya arti khusus di filter PostgREST / pola ILIKE.
const sanitizeSearch = (s) => String(s).replace(/[,()%*_\\]/g, ' ').trim().slice(0, 60);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Detail satu kos: GET /api/kos?id=<uuid>
    const id = first(req.query.id);
    if (id) {
      if (!UUID_RE.test(id)) {
        return res.status(400).json({ error: 'Parameter id tidak valid' });
      }
      const { data, error } = await supabase
        .from('kos')
        .select(PUBLIC_COLUMNS)
        .eq('id', id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Kos tidak ditemukan' });

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ data });
    }

    // List: hanya kos yang sudah di-approve
    const page = toInt(req.query.page, 1, { min: 1, max: 10000 });
    const limit = toInt(req.query.limit, 12, { min: 1, max: 50 });
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('kos')
      .select(PUBLIC_COLUMNS, { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    const tipe = first(req.query.tipe);
    if (tipe) {
      if (!TIPE.includes(tipe)) {
        return res.status(400).json({ error: `tipe harus salah satu dari: ${TIPE.join(', ')}` });
      }
      query = query.eq('tipe', tipe);
    }

    const kota = first(req.query.kota);
    if (kota) {
      const k = sanitizeSearch(kota);
      if (k) query = query.ilike('kota', k);
    }

    const minHarga = toInt(req.query.min_harga, null, { min: 0 });
    const maxHarga = toInt(req.query.max_harga, null, { min: 0 });
    if (minHarga !== null) query = query.gte('harga', minHarga);
    if (maxHarga !== null) query = query.lte('harga', maxHarga);

    const q = first(req.query.q);
    if (q) {
      const s = sanitizeSearch(q);
      if (s) query = query.or(`nama.ilike.%${s}%,alamat.ilike.%${s}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      data: data ?? [],
      meta: {
        page,
        limit,
        total: count ?? 0,
        total_pages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    });
  } catch (err) {
    console.error('[api/kos] gagal mengambil data:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
}
