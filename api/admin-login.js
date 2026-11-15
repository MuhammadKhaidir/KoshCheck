/*
  Login admin (Vercel Serverless Function). Dipanggil dari kolom password di widget chat.
  Password dikirim ke sini langsung, TIDAK lewat /api/chat, jadi tidak pernah dibaca AI.

  Env:
    ADMIN_KEY  password admin (maks 200 karakter). Kosong = login nonaktif.

  POST /api/admin-login  { password }
    -> 200 { token, expiresAt }   token dipakai sebagai  Authorization: Bearer <token>  di /api/admin
    -> 401 password salah, 429 terlalu banyak percobaan
*/
import { clearFailures, clientIp, lockedMinutes, makeToken, recordFailure, sameSecret } from './_auth.js'

export async function adminLogin(body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'Halaman database belum diaktifkan.' } }

  const ip = clientIp(req)
  const menit = lockedMinutes(ip)
  if (menit) return { status: 429, data: { error: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.` } }

  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : ''
  if (!sameSecret(password, env.ADMIN_KEY)) {
    recordFailure(ip)
    await new Promise((resolve) => setTimeout(resolve, 400)) // memperlambat tebak-tebakan
    return { status: 401, data: { error: 'Password salah.' } }
  }

  clearFailures(ip)
  return { status: 200, data: makeToken(env) }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await adminLogin(req.body, process.env, req)
  res.status(status).json(data)
}
