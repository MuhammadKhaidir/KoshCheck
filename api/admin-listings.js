/*
  Tambah listing kos (dengan foto) dari halaman database. Khusus admin.
  Dilindungi sama seperti api/admin.js: Authorization: Bearer <token> atau x-admin-key.

  POST /api/admin-listings  { nama, whatsapp, kos, area, catatan, foto? }
    foto = data URL JPEG (dikecilkan dulu di browser, lihat src/lib/image.js). Opsional.
    -> 201 { listingId }

  Foto disimpan sebagai teks di kolom listings.foto, jadi jalan di Postgres, di file JSON lokal,
  dan di Vercel (yang tidak punya disk permanen) tanpa layanan penyimpanan tambahan.
*/
import { isAdmin } from './_auth.js'
import { insertListing, newId } from './_db.js'
import { parseListing } from './listings.js'

export const FOTO_MAX_CHARS = 400_000
const FOTO_RE = /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/

export async function addListing(body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!isAdmin(req, env)) return { status: 401, data: { error: 'Belum masuk atau sesi sudah habis.' } }

  const { error, value } = parseListing(body)
  if (error) return { status: 400, data: { error } }

  let foto = null
  if (body?.foto) {
    if (typeof body.foto !== 'string' || body.foto.length > FOTO_MAX_CHARS || !FOTO_RE.test(body.foto)) {
      return { status: 400, data: { error: 'Foto tidak valid atau terlalu besar.' } }
    }
    foto = body.foto
  }

  const id = newId('KL')
  try {
    await insertListing(env, { id, ...value, foto })
  } catch (err) {
    console.error('[admin-listings]', err)
    return { status: 500, data: { error: 'Listing belum bisa disimpan. Coba lagi sebentar.' } }
  }
  return { status: 201, data: { listingId: id } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await addListing(req.body, process.env, req)
  res.status(status).json(data)
}
