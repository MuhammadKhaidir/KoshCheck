/*
  Penyimpanan data: pesanan survei dan pendaftaran kos.
  File berawalan "_" tidak dianggap endpoint oleh Vercel, jadi aman dipakai bersama oleh api/*.js.

  Env:
    DATABASE_URL  Connection string Postgres (Supabase, Neon, Vercel Postgres, dll).
                  Tabel dibuat otomatis saat pertama dipakai, tidak perlu migrasi manual.
    Kosong di lokal  -> data disimpan di file .data/koshcheck.json (cukup untuk dev, tidak perlu setup).
    Kosong di Vercel -> error, karena disk Vercel tidak permanen.
*/
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** newId('KC') -> "KC-MH3X9A2B-1F2E3D" */
export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`.toUpperCase()

const usePostgres = (env) => Boolean(env.DATABASE_URL)

/* ---------- Postgres ---------- */

function getSql(env) {
  const g = globalThis // dipakai ulang antar-request (dan antar-reload di npm run dev)
  if (g.__koshDb?.url !== env.DATABASE_URL) {
    const ready = (async () => {
      const { default: postgres } = await import('postgres')
      const sql = postgres(env.DATABASE_URL, { max: 1, idle_timeout: 5, connect_timeout: 10 })
      await sql`
        create table if not exists orders (
          id         text primary key,
          nama       text not null,
          whatsapp   text not null,
          kos        text not null,
          paket      text not null,
          harga      integer not null,
          catatan    text not null default '',
          status     text not null default 'pending',
          metode     text,
          created_at timestamptz not null default now(),
          paid_at    timestamptz
        )`
      await sql`
        create table if not exists listings (
          id         text primary key,
          nama       text not null,
          whatsapp   text not null,
          kos        text not null,
          area       text not null,
          catatan    text not null default '',
          status     text not null default 'baru',
          created_at timestamptz not null default now()
        )`
      await sql`alter table listings add column if not exists foto text`
      return sql
    })()
    g.__koshDb = { url: env.DATABASE_URL, ready }
    ready.catch(() => {
      if (g.__koshDb?.ready === ready) g.__koshDb = null // coba sambung lagi di request berikutnya
    })
  }
  return g.__koshDb.ready
}

/* ---------- File JSON (khusus dev lokal) ---------- */

const FILE = path.resolve('.data', 'koshcheck.json')

function assertFileAllowed(env) {
  if (env.VERCEL) throw new Error('DATABASE_URL belum diisi. Di Vercel, data tidak bisa disimpan ke file.')
}

async function readJson() {
  try {
    const db = JSON.parse(await readFile(FILE, 'utf8'))
    return { orders: db.orders ?? [], listings: db.listings ?? [] }
  } catch (err) {
    if (err.code === 'ENOENT') return { orders: [], listings: [] }
    throw err // file rusak: jangan ditimpa diam-diam
  }
}

async function writeJson(db) {
  await mkdir(path.dirname(FILE), { recursive: true })
  const tmp = `${FILE}.tmp`
  await writeFile(tmp, JSON.stringify(db, null, 2))
  await rename(tmp, FILE)
}

/** Baca-ubah-tulis berurutan supaya dua request bersamaan tidak saling menimpa. */
function updateJson(fn) {
  const g = globalThis
  const run = async () => {
    const db = await readJson()
    const out = await fn(db)
    await writeJson(db)
    return out
  }
  const next = (g.__koshQueue ?? Promise.resolve()).then(run, run)
  g.__koshQueue = next.catch(() => {})
  return next
}

/* ---------- API yang dipakai endpoint ---------- */

export async function insertOrder(env, o) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const row = { ...o, status: 'pending', metode: null, created_at: new Date().toISOString(), paid_at: null }
      db.orders.push(row)
      return row
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`
    insert into orders (id, nama, whatsapp, kos, paket, harga, catatan)
    values (${o.id}, ${o.nama}, ${o.whatsapp}, ${o.kos}, ${o.paket}, ${o.harga}, ${o.catatan})
    returning *`
  return row
}

export async function getOrder(env, id) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return (await readJson()).orders.find((o) => o.id === id) ?? null
  }
  const sql = await getSql(env)
  const [row] = await sql`select * from orders where id = ${id}`
  return row ?? null
}

/** status: 'pending' | 'paid' | 'failed'. Mengembalikan baris terbaru, atau null bila id tidak ada. */
export async function setOrderStatus(env, id, status, metode) {
  const paidAt = status === 'paid' ? new Date() : null
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const row = db.orders.find((o) => o.id === id)
      if (!row) return null
      Object.assign(row, { status, metode: metode ?? null, paid_at: paidAt?.toISOString() ?? null })
      return row
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`
    update orders set status = ${status}, metode = ${metode ?? null}, paid_at = ${paidAt}
    where id = ${id}
    returning *`
  return row ?? null
}

export async function insertListing(env, l) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const row = { ...l, foto: l.foto ?? null, status: 'baru', created_at: new Date().toISOString() }
      db.listings.push(row)
      return row
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`
    insert into listings (id, nama, whatsapp, kos, area, catatan, foto)
    values (${l.id}, ${l.nama}, ${l.whatsapp}, ${l.kos}, ${l.area}, ${l.catatan}, ${l.foto ?? null})
    returning *`
  return row
}

/** Data terbaru di atas, maksimal 500 baris per tabel. */
export async function listAll(env) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    const db = await readJson()
    const newest = (rows) => [...rows].reverse().slice(0, 500)
    return { orders: newest(db.orders), listings: newest(db.listings) }
  }
  const sql = await getSql(env)
  const [orders, listings] = await Promise.all([
    sql`select * from orders order by created_at desc limit 500`,
    sql`select * from listings order by created_at desc limit 500`,
  ])
  return { orders, listings }
}
