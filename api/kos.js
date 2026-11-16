/*
  Katalog kos dari database untuk halaman utama (Vercel Serverless Function). Publik, tanpa login.
  Hanya listing yang ditambah admin (publik = true) dan hanya field yang aman ditampilkan:
  nomor WhatsApp dan nama pemilik TIDAK ikut. Pendaftaran dari form pemilik tidak tampil di sini.

  GET /api/kos  -> { kos: [{ id, nama, area, tipe, harga, fasilitas[], verified, dicekPada, foto }] }
  Bentuk objeknya sama dengan src/data/kos.js, jadi Catalog bisa menggabungkan keduanya.
*/
import { listPublicListings } from './_db.js'

export async function listKos(_body, env) {
  try {
    const rows = await listPublicListings(env)
    const kos = rows.map((r) => ({
      id: r.id,
      nama: r.kos,
      area: r.area,
      tipe: r.tipe || 'Campur',
      harga: Number(r.harga) || 0,
      fasilitas: r.fasilitas ? r.fasilitas.split(',') : [],
      verified: false,
      dicekPada: null,
      foto: r.foto || null,
    }))
    return { status: 200, data: { kos } }
  } catch (err) {
    console.error('[kos]', err)
    return { status: 500, data: { error: 'Katalog belum bisa dimuat.' } }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' })
  const { status, data } = await listKos(null, process.env)
  if (status === 200) res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
  res.status(status).json(data)
}
