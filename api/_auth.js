/*
  Login admin untuk halaman database. Bantuan bersama untuk api/admin.js dan api/admin-login.js.

  Password = ADMIN_KEY (env). Setelah password benar, server mengeluarkan token bertanda tangan (HMAC)
  yang berlaku 1 jam. Token itulah yang dipakai halaman database, jadi password tidak disimpan di
  browser dan tidak pernah lewat chat AI.
*/
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 60 * 60 * 1000
const MAX_FAILS = 5
const WINDOW_MS = 10 * 60 * 1000

const digest = (value) => createHash('sha256').update(String(value ?? '')).digest()

/** Perbandingan waktu-konstan. Panjang input ikut tersamarkan karena yang dibandingkan hash-nya. */
export const sameSecret = (given, expected) => timingSafeEqual(digest(given), digest(expected))

const sign = (payload, secret) => createHmac('sha256', secret).update(payload).digest('base64url')

export function makeToken(env, now = Date.now()) {
  const expiresAt = now + TOKEN_TTL_MS
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString('base64url')
  return { token: `${payload}.${sign(payload, env.ADMIN_KEY)}`, expiresAt }
}

export function verifyToken(token, env, now = Date.now()) {
  if (!env.ADMIN_KEY || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2 || !sameSecret(parts[1], sign(parts[0], env.ADMIN_KEY))) return false
  try {
    return JSON.parse(Buffer.from(parts[0], 'base64url').toString()).exp > now
  } catch {
    return false
  }
}

/** true bila request membawa token login yang sah, atau (untuk curl) header x-admin-key yang benar. */
export function isAdmin(req, env) {
  if (!env.ADMIN_KEY) return false
  const h = req?.headers ?? {}
  const bearer = /^Bearer\s+(\S+)$/i.exec(h.authorization ?? '')?.[1]
  return verifyToken(bearer, env) || sameSecret(h['x-admin-key'], env.ADMIN_KEY)
}

/* ---------- Pembatasan percobaan password ----------
   Per IP: 5 kali salah dalam 10 menit -> dikunci sampai jendela 10 menit itu habis.
   Hitungan disimpan di memori server, jadi di Vercel berlaku per instance (cukup sebagai rem,
   bukan jaminan). Pakai password yang panjang. */
const fails = () => (globalThis.__koshFails ??= new Map())

export function clientIp(req) {
  const forwarded = String(req?.headers?.['x-forwarded-for'] ?? '').split(',')[0].trim()
  return forwarded || req?.socket?.remoteAddress || 'unknown'
}

/** Menit tersisa bila IP ini sedang dikunci, selain itu 0. */
export function lockedMinutes(ip, now = Date.now()) {
  const entry = fails().get(ip)
  if (!entry || now - entry.first > WINDOW_MS || entry.count < MAX_FAILS) return 0
  return Math.max(1, Math.ceil((entry.first + WINDOW_MS - now) / 60000))
}

export function recordFailure(ip, now = Date.now()) {
  const map = fails()
  const entry = map.get(ip)
  if (!entry || now - entry.first > WINDOW_MS) map.set(ip, { count: 1, first: now })
  else entry.count += 1
  if (map.size > 1000) map.clear() // jaga memori
}

export const clearFailures = (ip) => fails().delete(ip)
