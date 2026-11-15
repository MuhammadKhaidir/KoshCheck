/*
  Daftar pesanan dan pendaftaran kos untuk tim (Vercel Serverless Function).
  Dilindungi kunci: kirim header  x-admin-key: <ADMIN_KEY>.

  Env:
    ADMIN_KEY  kunci rahasia buatanmu sendiri (bebas, panjang lebih aman). Kosong = endpoint nonaktif.

  Contoh:
    curl -H "x-admin-key: KUNCIMU" http://localhost:5173/api/admin
    -> { orders: [...], listings: [...] }   (terbaru di atas)
*/
import { timingSafeEqual } from 'node:crypto'
import { listAll } from './_db.js'

function sameKey(given, expected) {
  const a = Buffer.from(typeof given === 'string' ? given : '')
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function listData(_body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!sameKey(req?.headers?.['x-admin-key'], env.ADMIN_KEY)) {
    return { status: 401, data: { error: 'Kunci admin salah.' } }
  }
  try {
    return { status: 200, data: await listAll(env) }
  } catch (err) {
    console.error('[admin]', err)
    return { status: 500, data: { error: 'Data belum bisa dibaca.' } }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' })
  const { status, data } = await listData(null, process.env, req)
  res.status(status).json(data)
}
