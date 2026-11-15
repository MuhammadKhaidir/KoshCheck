/*
  Daftar pesanan dan pendaftaran kos untuk tim (Vercel Serverless Function).
  Dilindungi salah satu dari:
    Authorization: Bearer <token>   token dari /api/admin-login (dipakai halaman database)
    x-admin-key: <ADMIN_KEY>        untuk curl / terminal

  Env:
    ADMIN_KEY  password admin buatanmu sendiri (bebas, makin panjang makin aman). Kosong = endpoint nonaktif.

  Contoh:
    curl -H "x-admin-key: PASSWORDMU" http://localhost:5173/api/admin
    -> { orders: [...], listings: [...] }   (terbaru di atas)
*/
import { isAdmin } from './_auth.js'
import { listAll } from './_db.js'

export async function listData(_body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!isAdmin(req, env)) return { status: 401, data: { error: 'Belum masuk atau sesi sudah habis.' } }
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
