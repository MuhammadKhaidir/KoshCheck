/*
  Endpoint pesanan survei (Vercel Serverless Function).
  Menyimpan pesanan ke database dengan status 'pending'. Pembayarannya menyusul (sekarang: simulasi,
  lihat api/pay-dummy.js). Harga TIDAK diambil dari browser, hanya id paket yang dicari di content/site.js.

  POST /api/orders  { nama, whatsapp, kos, paket, catatan }
    -> 201 { orderId, amount, planName }
*/
import { plans } from '../src/content/site.js'
import { insertOrder, newId } from './_db.js'

const clip = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function createOrder(body, env) {
  const plan = plans.items.find((p) => p.id === body?.paket)
  const nama = clip(body?.nama, 60)
  const kos = clip(body?.kos, 200)
  const catatan = clip(body?.catatan, 200)
  const whatsapp = clip(body?.whatsapp, 20).replace(/[^\d+]/g, '')

  if (!plan) return { status: 400, data: { error: 'Paket tidak dikenal.' } }
  if (!nama || !kos) return { status: 400, data: { error: 'Nama dan kos wajib diisi.' } }
  if (whatsapp.replace(/\D/g, '').length < 8) return { status: 400, data: { error: 'Nomor WhatsApp belum benar.' } }

  const id = newId('KC')
  try {
    await insertOrder(env, { id, nama, whatsapp, kos, paket: plan.id, harga: plan.price, catatan })
  } catch (err) {
    console.error('[orders]', err)
    return { status: 500, data: { error: 'Pesanan belum bisa disimpan. Coba lagi sebentar.' } }
  }
  return { status: 201, data: { orderId: id, amount: plan.price, planName: plan.name } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await createOrder(req.body, process.env)
  res.status(status).json(data)
}
