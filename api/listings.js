/*
  Endpoint pendaftaran kos oleh pemilik (Vercel Serverless Function).
  Menyimpan pendaftaran ke database dengan status 'baru' untuk ditinjau tim KOSCHECK.

  POST /api/listings  { nama, whatsapp, kos, area, catatan }
    -> 201 { listingId }
*/
import { insertListing, newId } from './_db.js'

const clip = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function createListing(body, env) {
  const nama = clip(body?.nama, 60)
  const kos = clip(body?.kos, 100)
  const area = clip(body?.area, 150)
  const catatan = clip(body?.catatan, 300)
  const whatsapp = clip(body?.whatsapp, 20).replace(/[^\d+]/g, '')

  if (!nama || !kos || !area) return { status: 400, data: { error: 'Nama, nama kos, dan area wajib diisi.' } }
  if (whatsapp.replace(/\D/g, '').length < 8) return { status: 400, data: { error: 'Nomor WhatsApp belum benar.' } }

  const id = newId('KL')
  try {
    await insertListing(env, { id, nama, whatsapp, kos, area, catatan })
  } catch (err) {
    console.error('[listings]', err)
    return { status: 500, data: { error: 'Pendaftaran belum bisa disimpan. Coba lagi sebentar.' } }
  }
  return { status: 201, data: { listingId: id } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await createListing(req.body, process.env)
  res.status(status).json(data)
}
