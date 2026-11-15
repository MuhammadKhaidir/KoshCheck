/*
  Pembayaran SIMULASI (pengganti sementara Midtrans). Dipanggil oleh tampilan dummy di
  src/components/pay/DummyPay.jsx. Tidak ada uang dan tidak ada panggilan ke Midtrans.

  POST /api/pay-dummy  { orderId, hasil: 'paid' | 'failed' | 'pending', metode }
    -> 200 { orderId, status }

  Pengaman: begitu MIDTRANS_SERVER_KEY diisi (Midtrans asli aktif), endpoint ini menolak semua
  permintaan, supaya tidak ada yang bisa menandai pesanan "lunas" tanpa membayar.
*/
import { getOrder, setOrderStatus } from './_db.js'

const HASIL = ['paid', 'failed', 'pending']
const clip = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function dummyPay(body, env) {
  if (env.MIDTRANS_SERVER_KEY) {
    return { status: 403, data: { error: 'Simulasi pembayaran dimatikan karena Midtrans asli sudah aktif.' } }
  }
  const orderId = clip(body?.orderId, 60)
  const hasil = body?.hasil
  const metode = clip(body?.metode, 30) || null
  if (!orderId || !HASIL.includes(hasil)) return { status: 400, data: { error: 'Data simulasi tidak lengkap.' } }

  try {
    const order = await getOrder(env, orderId)
    if (!order) return { status: 404, data: { error: 'Pesanan tidak ditemukan.' } }
    if (order.status === 'paid') {
      // Sudah lunas: ulangan 'paid' dianggap sukses, selain itu ditolak (status lunas tidak boleh turun).
      return hasil === 'paid'
        ? { status: 200, data: { orderId, status: 'paid' } }
        : { status: 409, data: { error: 'Pesanan ini sudah lunas.' } }
    }
    const row = await setOrderStatus(env, orderId, hasil, metode)
    return { status: 200, data: { orderId, status: row.status } }
  } catch (err) {
    console.error('[pay-dummy]', err)
    return { status: 500, data: { error: 'Status pembayaran belum bisa disimpan. Coba lagi sebentar.' } }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await dummyPay(req.body, process.env)
  res.status(status).json(data)
}
