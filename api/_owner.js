/*
  Bantuan login pemilik kos (dipakai api/owner.js). Berawalan "_" jadi bukan endpoint.
  - Password disimpan sebagai hash scrypt (garam acak per akun), bukan teks biasa.
  - Token sesi bertanda tangan HMAC, 2 jam. Kuncinya diturunkan dari "owner:" + OWNER_SECRET (atau ADMIN_KEY),
    jadi token pemilik TIDAK bisa dipakai sebagai token admin, dan sebaliknya.
*/
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { sameSecret } from './_auth.js'

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000

/** Password lama yang tidak boleh digunakan kembali (opsional). */
export const defaultPassword = (env) => env.OWNER_DEFAULT_PASSWORD || ''

const secretOf = (env) => {
  const base = env.OWNER_SECRET || env.ADMIN_KEY
  return base ? `owner:${base}` : ''
}
export const ownerEnabled = (env) => Boolean(secretOf(env))

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(String(password), salt, 32).toString('hex')}`
}

export function checkPassword(password, stored) {
  const [salt, hash] = String(stored ?? '').split(':')
  if (!salt || !hash) return false
  const given = scryptSync(String(password ?? ''), salt, 32)
  const expected = Buffer.from(hash, 'hex')
  return given.length === expected.length && timingSafeEqual(given, expected)
}

const sign = (payload, secret) => createHmac('sha256', secret).update(payload).digest('base64url')

export function makeOwnerToken(env, ownerId, passwordHash, now = Date.now()) {
  const expiresAt = now + TOKEN_TTL_MS
  const payload = Buffer.from(JSON.stringify({ oid: ownerId, exp: expiresAt, ver: sign(passwordHash, secretOf(env)) })).toString('base64url')
  return { token: `${payload}.${sign(payload, secretOf(env))}`, expiresAt }
}

/** Id pemilik dari header Authorization: Bearer <token>, atau null bila tidak sah / kedaluwarsa. */
export const ownerTokenMatches = (env, session, owner) => Boolean(session && owner && sameSecret(session.ver, sign(owner.pass_hash, secretOf(env))))

export function ownerIdFromRequest(req, env) {
  const secret = secretOf(env)
  const token = /^Bearer\s+(\S+)$/i.exec(req?.headers?.authorization ?? '')?.[1]
  if (!secret || !token) return null
  const parts = token.split('.')
  if (parts.length !== 2 || !sameSecret(parts[1], sign(parts[0], secret))) return null
  try {
    const { oid, exp, ver } = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
    return typeof oid === 'string' && typeof ver === 'string' && exp > Date.now() ? { oid, ver } : null
  } catch {
    return null
  }
}
