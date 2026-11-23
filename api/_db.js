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
      await sql`
        alter table listings
          add column if not exists foto text,
          add column if not exists harga integer,
          add column if not exists tipe text,
          add column if not exists fasilitas text,
          add column if not exists publik boolean not null default false`
      await sql`
        create table if not exists owners (
          id          text primary key,
          whatsapp    text not null unique,
          nama        text not null,
          pass_hash   text not null,
          must_change boolean not null default true,
          created_at  timestamptz not null default now()
        )`
      await sql`alter table listings add column if not exists owner_id text references owners(id)`
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
    return { orders: db.orders ?? [], listings: db.listings ?? [], owners: db.owners ?? [] }
  } catch (err) {
    if (err.code === 'ENOENT') return { orders: [], listings: [], owners: [] }
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
      const row = {
        ...l,
        foto: l.foto ?? null,
        harga: l.harga ?? null,
        tipe: l.tipe ?? null,
        fasilitas: l.fasilitas ?? null,
        publik: l.publik ?? false,
        status: 'baru',
        created_at: new Date().toISOString(),
      }
      db.listings.push(row)
      return row
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`
    insert into listings (id, nama, whatsapp, kos, area, catatan, foto, harga, tipe, fasilitas, publik)
    values (${l.id}, ${l.nama}, ${l.whatsapp}, ${l.kos}, ${l.area}, ${l.catatan}, ${l.foto ?? null},
            ${l.harga ?? null}, ${l.tipe ?? null}, ${l.fasilitas ?? null}, ${l.publik ?? false})
    returning *`
  return row
}

/** Ubah data listing tanpa mengubah status publik, pemilik, atau tanggal pendaftaran. */
export async function updateListing(env, id, l) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const row = db.listings.find((item) => item.id === id)
      if (!row) return null
      Object.assign(row, l)
      return row
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`
    update listings set
      nama = ${l.nama}, whatsapp = ${l.whatsapp}, kos = ${l.kos},
      area = ${l.area}, catatan = ${l.catatan}, foto = ${l.foto},
      harga = ${l.harga}, tipe = ${l.tipe}, fasilitas = ${l.fasilitas}
    where id = ${id}
    returning *`
  return row ?? null
}

/** Hapus listing. Riwayat orders sengaja tidak disentuh. */
export async function deleteListing(env, id) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const index = db.listings.findIndex((item) => item.id === id)
      if (index < 0) return null
      return db.listings.splice(index, 1)[0]
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`delete from listings where id = ${id} returning id`
  return row ?? null
}

/** Listing yang ditandai publik (ditambah admin), untuk katalog di halaman utama. Terbaru di atas, maks 100. */
export async function listPublicListings(env) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return (await readJson()).listings.filter((l) => l.publik).reverse().slice(0, 100)
  }
  const sql = await getSql(env)
  return sql`
    select id, kos, area, tipe, harga, fasilitas, foto from listings
    where publik order by created_at desc limit 100`
}

/** Data terbaru di atas, maksimal 500 baris per tabel. */
export async function listAll(env) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    const db = await readJson()
    const newest = (rows) => [...rows].reverse().slice(0, 500)
    const summarize = (rows) => {
      const grouped = new Map()
      for (const row of rows) {
        const date = new Date(row.created_at)
        if (Number.isNaN(date.getTime())) continue
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric',
        }).formatToParts(date)
        const year = Number(parts.find((part) => part.type === 'year')?.value)
        const month = Number(parts.find((part) => part.type === 'month')?.value)
        const key = `${year}-${month}`
        const item = grouped.get(key) ?? { year, month, total: 0 }
        item.total += 1
        grouped.set(key, item)
      }
      return [...grouped.values()].sort((a, b) => a.year - b.year || a.month - b.month)
    }
    return {
      orders: newest(db.orders),
      listings: newest(db.listings),
      analytics: { orders: summarize(db.orders), listings: summarize(db.listings) },
    }
  }
  const sql = await getSql(env)
  const [orders, listings, orderTrend, listingTrend] = await Promise.all([
    sql`select * from orders order by created_at desc limit 500`,
    sql`select * from listings order by created_at desc limit 500`,
    sql`select
          extract(year from created_at at time zone 'Asia/Jakarta')::int as year,
          extract(month from created_at at time zone 'Asia/Jakarta')::int as month,
          count(*)::int as total
        from orders group by 1, 2 order by 1, 2`,
    sql`select
          extract(year from created_at at time zone 'Asia/Jakarta')::int as year,
          extract(month from created_at at time zone 'Asia/Jakarta')::int as month,
          count(*)::int as total
        from listings group by 1, 2 order by 1, 2`,
  ])
  return { orders, listings, analytics: { orders: orderTrend, listings: listingTrend } }
}

/* ---------- Pemilik kos ---------- */

/** Nomor WhatsApp -> digit saja, awalan 0 jadi 62. Dipakai mencocokkan akun pemilik dengan data kosnya. */
export const normWa = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits
}

export async function getOwnerByWa(env, wa) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return (await readJson()).owners.find((o) => o.whatsapp === wa) ?? null
  }
  const sql = await getSql(env)
  const [row] = await sql`select * from owners where whatsapp = ${wa}`
  return row ?? null
}

export async function getOwnerById(env, id) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return (await readJson()).owners.find((o) => o.id === id) ?? null
  }
  const sql = await getSql(env)
  const [row] = await sql`select * from owners where id = ${id}`
  return row ?? null
}

/** Akun baru selalu wajib ganti password (must_change). Nomor yang sudah punya akun mengembalikan akun lama. */
export async function insertOwner(env, o) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const found = db.owners.find((x) => x.whatsapp === o.whatsapp)
      if (found) return found
      const row = { ...o, must_change: true, created_at: new Date().toISOString() }
      db.owners.push(row)
      return row
    })
  }
  const sql = await getSql(env)
  const [row] = await sql`
    insert into owners (id, whatsapp, nama, pass_hash)
    values (${o.id}, ${o.whatsapp}, ${o.nama}, ${o.pass_hash})
    on conflict (whatsapp) do nothing
    returning *`
  return row ?? getOwnerByWa(env, o.whatsapp)
}

export async function setOwnerPassword(env, id, passHash) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      const row = db.owners.find((o) => o.id === id)
      if (row) Object.assign(row, { pass_hash: passHash, must_change: false })
    })
  }
  const sql = await getSql(env)
  await sql`update owners set pass_hash = ${passHash}, must_change = false where id = ${id}`
}

/** Semua kos yang nomor WhatsApp-nya (setelah dinormalkan) sama dengan wa. Isi: id, nama, whatsapp, owner_id. */
export async function listingsByWa(env, wa) {
  let rows
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    rows = (await readJson()).listings
  } else {
    const sql = await getSql(env)
    rows = await sql`
      select id, nama, whatsapp, owner_id from listings
      where regexp_replace(whatsapp, '[^0-9]', '', 'g') like ${'%' + wa.slice(-8)}`
  }
  return rows.filter((r) => normWa(r.whatsapp) === wa)
}

export async function setListingsOwner(env, ids, ownerId) {
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    return updateJson((db) => {
      for (const l of db.listings) if (ids.includes(l.id) && !l.owner_id) l.owner_id = ownerId
    })
  }
  const sql = await getSql(env)
  await sql`update listings set owner_id = ${ownerId} where id in ${sql(ids)} and owner_id is null`
}

/**
 * Kos milik satu pemilik, terbaru di atas, dengan status pesanan survei:
 * 'dipesan' (ada pesanan lunas), 'menunggu' (ada pesanan belum bayar), 'belum'.
 * Pesanan dicocokkan lewat nama kos (orders.kos). Data pemesan tidak ikut.
 */
export async function listOwnerKos(env, ownerId) {
  const key = (v) => String(v ?? '').trim().toLowerCase()
  let listings
  let orders
  if (!usePostgres(env)) {
    assertFileAllowed(env)
    const db = await readJson()
    listings = db.listings.filter((l) => l.owner_id === ownerId).reverse()
    orders = db.orders
  } else {
    const sql = await getSql(env)
    listings = await sql`
      select id, kos, area, tipe, harga, created_at from listings
      where owner_id = ${ownerId} order by created_at desc`
    orders = listings.length
      ? await sql`select kos, status from orders where lower(trim(kos)) in ${sql(listings.map((l) => key(l.kos)))}`
      : []
  }
  return listings.map((l) => {
    const mine = orders.filter((o) => key(o.kos) === key(l.kos))
    const status = mine.some((o) => o.status === 'paid') ? 'dipesan' : mine.some((o) => o.status === 'pending') ? 'menunggu' : 'belum'
    return { id: l.id, kos: l.kos, area: l.area, tipe: l.tipe, harga: l.harga, created_at: l.created_at, status }
  })
}
