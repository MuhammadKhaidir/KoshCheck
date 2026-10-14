const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** 39000 -> "Rp 39.000" */
export const rupiah = (n) => idr.format(n)

const dateShort = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const dateLong = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** '2026-08-12' -> "12 Agu 2026" (atau "12 Agustus 2026" bila long = true) */
export const tanggal = (iso, long = false) => (long ? dateLong : dateShort).format(new Date(iso))
