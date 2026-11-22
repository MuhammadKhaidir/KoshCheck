/*
  Login dan data Pemilik Kos (Vercel Serverless Function). Satu endpoint untuk tiga aksi supaya jumlah
  function di Vercel tidak bertambah banyak. Semuanya POST dengan body { action, ... }.

    { action: 'login', whatsapp, password }       -> { token, expiresAt, mustChange, nama }
    { action: 'data' }                            -> { owner: { nama, whatsapp, mustChange }, kos: [...] }
    { action: 'password', password, newPassword } -> { ok: true }
  'data' dan 'password' memakai header  Authorization: Bearer <token>  dari login.

  Akun pemilik dibuat otomatis saat nomor WhatsApp-nya login pertama kali, bila nomor itu sudah ada di
  data kos (listings). Password awalnya sama untuk semua (env OWNER_DEFAULT_PASSWORD) dan wajib diganti:
  selama belum diganti, 'data' tidak mengembalikan kos sama sekali.
  Pemilik hanya menerima kos miliknya (listings.owner_id). Data pemesan tidak ikut, hanya statusnya.
*/
import { clearFailures, clientIp, lockedMinutes, recordFailure, sameSecret } from './_auth.js'
import {
  getOwnerById, getOwnerByWa, insertOwner, listingsByWa, listOwnerKos, newId, normWa, setListingsOwner, setOwnerPassword,
} from './_db.js'
import { checkPassword, defaultPassword, hashPassword, makeOwnerToken, ownerEnabled, ownerIdFromRequest } from './_owner.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const fail = (status, error) => ({ status, data: { error } })

/** Hubungkan kos yang nomor WhatsApp-nya sama dengan akun ini (termasuk kos yang ditambah belakangan). */
async function linkListings(env, owner) {
  const free = (await listingsByWa(env, owner.whatsapp)).filter((l) => !l.owner_id).map((l) => l.id)
  if (free.length) await setListingsOwner(env, free, owner.id)
}

async function login(body, env, req) {
  const ip = `owner:${clientIp(req)}`
  const menit = lockedMinutes(ip)
  if (menit) return fail(429, `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`)

  const wa = normWa(body?.whatsapp)
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : ''

  let owner = wa.length >= 8 ? await getOwnerByWa(env, wa) : null
  if (!owner && wa.length >= 8) {
    const kos = await listingsByWa(env, wa)
    if (kos.length) {
      owner = await insertOwner(env, { id: newId('OW'), whatsapp: wa, nama: kos[0].nama, pass_hash: hashPassword(defaultPassword(env)) })
    }
  }
  if (!owner || !checkPassword(password, owner.pass_hash)) {
    recordFailure(ip)
    await wait(400)
    return fail(401, 'Nomor WhatsApp atau password salah.')
  }

  clearFailures(ip)
  await linkListings(env, owner)
  return { status: 200, data: { ...makeOwnerToken(env, owner.id), mustChange: Boolean(owner.must_change), nama: owner.nama } }
}

async function currentOwner(env, req) {
  const id = ownerIdFromRequest(req, env)
  return id ? getOwnerById(env, id) : null
}

async function data(env, req) {
  const owner = await currentOwner(env, req)
  if (!owner) return fail(401, 'Belum masuk atau sesi sudah habis.')
  await linkListings(env, owner)
  const mustChange = Boolean(owner.must_change)
  const kos = mustChange ? [] : await listOwnerKos(env, owner.id)
  return { status: 200, data: { owner: { nama: owner.nama, whatsapp: owner.whatsapp, mustChange }, kos } }
}

async function changePassword(body, env, req) {
  const owner = await currentOwner(env, req)
  if (!owner) return fail(401, 'Belum masuk atau sesi sudah habis.')

  const ip = `owner:${clientIp(req)}`
  const menit = lockedMinutes(ip)
  if (menit) return fail(429, `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`)

  const current = typeof body?.password === 'string' ? body.password.slice(0, 200) : ''
  const next = typeof body?.newPassword === 'string' ? body.newPassword : ''
  if (!checkPassword(current, owner.pass_hash)) {
    recordFailure(ip)
    return fail(400, 'Password saat ini salah.')
  }
  if (next.length < 8 || next.length > 200) return fail(400, 'Password baru minimal 8 karakter.')
  if (sameSecret(next, current) || sameSecret(next, defaultPassword(env))) {
    return fail(400, 'Password baru harus berbeda dari password awal.')
  }

  clearFailures(ip)
  await setOwnerPassword(env, owner.id, hashPassword(next))
  return { status: 200, data: { ok: true } }
}

export async function ownerApi(body, env, req) {
  if (!ownerEnabled(env)) return fail(503, 'Login pemilik belum aktif. Isi ADMIN_KEY atau OWNER_SECRET di env.')
  try {
    if (body?.action === 'login') return await login(body, env, req)
    if (body?.action === 'data') return await data(env, req)
    if (body?.action === 'password') return await changePassword(body, env, req)
    return fail(400, 'Aksi tidak dikenal.')
  } catch (err) {
    console.error('[owner]', err)
    return fail(500, 'Terjadi masalah di server. Coba lagi sebentar.')
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await ownerApi(req.body, process.env, req)
  res.status(status).json(data)
}
