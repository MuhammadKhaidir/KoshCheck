// Jadwal tetap WIB; batas akhir eksklusif agar tepat saat pergantian tanggal.
export const PROMO_START = Date.parse('2026-11-23T00:00:00+07:00')
export const PROMO_END = Date.parse('2026-12-01T00:00:00+07:00')
export const OPENING_PRICES = Object.freeze({ premium: 29000, ultimate: 169000, dasar: 79000, lengkap: 129000 })
export function promoActive(now = Date.now()) {
  return now >= PROMO_START && now < PROMO_END
}
export function pricePlan(plan, now = Date.now()) {
  if (!plan) return plan
  const normalPrice = plan.price
  const discount = Object.hasOwn(OPENING_PRICES, plan.id) ? OPENING_PRICES[plan.id] : null
  const promo = promoActive(now) && discount !== null && discount < normalPrice
  return { ...plan, normalPrice, price: promo ? discount : normalPrice, promo }
}
export function countdown(now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((PROMO_END - now) / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  return `${Math.floor(seconds / 86400)} hari ${pad(Math.floor(seconds / 3600) % 24)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`
}
