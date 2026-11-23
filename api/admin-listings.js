/*
  Tambah listing kos (dengan foto) dari halaman database. Khusus admin.
  Dilindungi sama seperti api/admin.js: Authorization: Bearer <token> atau x-admin-key.

  POST /api/admin-listings  { nama, whatsapp, kos, area, catatan, tipe, harga, fasilitas[], foto? }
    Listing ini langsung tayang di katalog halaman utama (lewat GET /api/kos).
    foto = data URL JPEG (dikecilkan dulu di browser, lihat src/lib/image.js). Opsional.
    -> 201 { listingId }

  Foto disimpan sebagai teks di kolom listings.foto, jadi jalan di Postgres, di file JSON lokal,
  dan di Vercel (yang tidak punya disk permanen) tanpa layanan penyimpanan tambahan.
*/
import { isAdmin } from './_auth.js'
import { insertListing, newId, updateListing as saveListing, deleteListing as removeListingById } from './_db.js'
import { parseListing } from './listings.js'
import { FASILITAS, TIPE } from '../src/data/kos.js'

export const FOTO_MAX_CHARS = 400_000
const FOTO_RE = /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/

export async function addListing(body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!isAdmin(req, env)) return { status: 401, data: { error: 'Belum masuk atau sesi sudah habis.' } }

  const { error, value } = parseListing(body)
  if (error) return { status: 400, data: { error } }

  const tipe = TIPE.find((t) => t === body?.tipe)
  const harga = Number(body?.harga)
  if (!tipe) return { status: 400, data: { error: 'Tipe kos belum dipilih.' } }
  if (!Number.isInteger(harga) || harga < 50_000 || harga > 50_000_000) {
    return { status: 400, data: { error: 'Harga per bulan belum benar.' } }
  }
  const fasilitas = FASILITAS.filter((f) => Array.isArray(body?.fasilitas) && body.fasilitas.includes(f)).join(',')

  let foto = null
  if (body?.foto) {
    if (typeof body.foto !== 'string' || body.foto.length > FOTO_MAX_CHARS || !FOTO_RE.test(body.foto)) {
      return { status: 400, data: { error: 'Foto tidak valid atau terlalu besar.' } }
    }
    foto = body.foto
  }

  const id = newId('KL')
  try {
    await insertListing(env, { id, ...value, foto, tipe, harga, fasilitas, publik: true })
  } catch (err) {
    console.error('[admin-listings]', err)
    return { status: 500, data: { error: 'Listing belum bisa disimpan. Coba lagi sebentar.' } }
  }
  return { status: 201, data: { listingId: id } }
}

export async function editListing(body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!isAdmin(req, env)) return { status: 401, data: { error: 'Belum masuk atau sesi sudah habis.' } }
  const id = typeof body?.id === 'string' ? body.id.trim() : ''
  if (!id) return { status: 400, data: { error: 'ID listing tidak valid.' } }

  const { error, value } = parseListing(body)
  if (error) return { status: 400, data: { error } }
  const tipe = TIPE.find((item) => item === body?.tipe)
  const harga = Number(body?.harga)
  if (!tipe) return { status: 400, data: { error: 'Tipe kos belum dipilih.' } }
  if (!Number.isInteger(harga) || harga < 50_000 || harga > 50_000_000) {
    return { status: 400, data: { error: 'Harga per bulan belum benar.' } }
  }

  let foto = null
  if (body?.foto) {
    if (typeof body.foto !== 'string' || body.foto.length > FOTO_MAX_CHARS || !FOTO_RE.test(body.foto)) {
      return { status: 400, data: { error: 'Foto tidak valid atau terlalu besar.' } }
    }
    foto = body.foto
  }
  const fasilitas = FASILITAS.filter((item) => Array.isArray(body?.fasilitas) && body.fasilitas.includes(item)).join(',')

  try {
    const row = await saveListing(env, id, { ...value, foto, tipe, harga, fasilitas })
    if (!row) return { status: 404, data: { error: 'Listing tidak ditemukan.' } }
  } catch (err) {
    console.error('[admin-listings:update]', err)
    return { status: 500, data: { error: 'Perubahan listing belum bisa disimpan.' } }
  }
  return { status: 200, data: { listingId: id } }
}

export async function deleteListing(body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!isAdmin(req, env)) return { status: 401, data: { error: 'Belum masuk atau sesi sudah habis.' } }
  const id = typeof body?.id === 'string' ? body.id.trim() : ''
  if (!id) return { status: 400, data: { error: 'ID listing tidak valid.' } }
  try {
    const row = await removeListingById(env, id)
    if (!row) return { status: 404, data: { error: 'Listing tidak ditemukan.' } }
  } catch (err) {
    console.error('[admin-listings:delete]', err)
    return { status: 500, data: { error: 'Listing belum bisa dihapus.' } }
  }
  return { status: 200, data: { deleted: true, listingId: id } }
}

export default async function handler(req, res) {
  const actions = { POST: addListing, PATCH: editListing, DELETE: deleteListing }
  const action = actions[req.method]
  if (!action) return res.status(405).json({ error: 'Gunakan POST, PATCH, atau DELETE.' })
  const { status, data } = await action(req.body, process.env, req)
  res.status(status).json(data)
}
