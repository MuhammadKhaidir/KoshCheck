/*
  Endpoint pembayaran (Vercel Serverless Function) - Midtrans Snap.
  Server Key hanya dibaca di sini lewat environment variable, tidak pernah sampai ke browser.

  Env:
    MIDTRANS_SERVER_KEY      Server Key dari dashboard Midtrans (sandbox: diawali SB-Mid-server-)
    MIDTRANS_CLIENT_KEY      Client Key (sandbox: diawali SB-Mid-client-)
    MIDTRANS_IS_PRODUCTION   'true' untuk transaksi uang sungguhan. Selain itu = sandbox (uji coba).

  Alur: browser kirim { nama, kos, paket, whatsapp, catatan } -> fungsi ini membuat transaksi di
  Midtrans -> browser menerima token dan membuka jendela pembayaran (snap.js).
  Harga TIDAK diambil dari browser. Browser hanya mengirim id paket, harganya dicari di content/site.js.
*/
import { randomBytes } from 'node:crypto'
import { plans } from '../src/content/site.js'

const SNAP_API = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  production: 'https://app.midtrans.com/snap/v1/transactions',
}
const SNAP_JS = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
  production: 'https://app.midtrans.com/snap/snap.js',
}

const clip = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function createPayment(body, env) {
  const serverKey = env.MIDTRANS_SERVER_KEY
  const clientKey = env.MIDTRANS_CLIENT_KEY
  if (!serverKey || !clientKey) {
    console.error('[pay] MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY belum diisi.')
    return { status: 503, data: { error: 'Pembayaran online belum aktif. Pesan lewat WhatsApp dulu ya.' } }
  }
  const mode = env.MIDTRANS_IS_PRODUCTION === 'true' ? 'production' : 'sandbox'

  const plan = plans.items.find((p) => p.id === body?.paket)
  const nama = clip(body?.nama, 60)
  const kos = clip(body?.kos, 200)
  const catatan = clip(body?.catatan, 200)
  const whatsapp = clip(body?.whatsapp, 20).replace(/[^\d+]/g, '')

  if (!plan) return { status: 400, data: { error: 'Paket tidak dikenal.' } }
  if (!nama || !kos) return { status: 400, data: { error: 'Nama dan kos wajib diisi.' } }
  if (whatsapp.replace(/\D/g, '').length < 8) return { status: 400, data: { error: 'Nomor WhatsApp belum benar.' } }

  // order_id harus unik di Midtrans (maks 50 karakter)
  const orderId = `KC-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`.toUpperCase()

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: plan.price },
    item_details: [{ id: plan.id, price: plan.price, quantity: 1, name: `Survei ${plan.name}`.slice(0, 50) }],
    customer_details: { first_name: nama, phone: whatsapp },
    custom_field1: kos,
    custom_field2: catatan,
    custom_field3: plan.id,
  }

  try {
    const res = await fetch(SNAP_API[mode], {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.token) {
      console.error('[pay] Midtrans membalas', res.status, JSON.stringify(data))
      return { status: 502, data: { error: 'Pembayaran belum bisa dimulai. Coba lagi sebentar.' } }
    }
    return {
      status: 200,
      data: { orderId, token: data.token, redirectUrl: data.redirect_url, clientKey, snapUrl: SNAP_JS[mode], mode },
    }
  } catch (err) {
    console.error('[pay]', err)
    return { status: 502, data: { error: 'Midtrans tidak bisa dihubungi.' } }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await createPayment(req.body, process.env)
  res.status(status).json(data)
}
