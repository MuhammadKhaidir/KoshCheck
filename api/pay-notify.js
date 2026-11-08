/*
  Webhook notifikasi Midtrans (Vercel Serverless Function).
  Midtrans memanggil URL ini setiap status pembayaran berubah (pending, lunas, kedaluwarsa, dll).
  Daftarkan di dashboard Midtrans: Settings > Configuration > Payment Notification URL:
    https://DOMAIN-KAMU/api/pay-notify

  Keamanan: setiap notifikasi diverifikasi lewat signature_key = SHA512(order_id + status_code +
  gross_amount + ServerKey). Notifikasi dengan signature salah ditolak, jadi orang lain tidak bisa
  memalsukan status "lunas" dengan memanggil URL ini.
*/
import { createHash, timingSafeEqual } from 'node:crypto'

export function verifySignature(n, serverKey) {
  const expected = createHash('sha512')
    .update(`${n.order_id}${n.status_code}${n.gross_amount}${serverKey}`)
    .digest('hex')
  const given = typeof n.signature_key === 'string' ? n.signature_key : ''
  const a = Buffer.from(expected)
  const b = Buffer.from(given)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Ringkas status Midtrans jadi: paid | review | pending | failed | other */
export function paymentState(n) {
  switch (n.transaction_status) {
    case 'settlement':
      return 'paid'
    case 'capture': // kartu kredit
      return n.fraud_status === 'accept' ? 'paid' : 'review'
    case 'pending':
      return 'pending'
    case 'deny':
    case 'cancel':
    case 'expire':
    case 'failure':
      return 'failed'
    default:
      return 'other' // refund, chargeback, dll
  }
}

/*
  Dipanggil saat pembayaran terverifikasi lunas. Midtrans bisa mengirim notifikasi yang sama lebih
  dari sekali, jadi isi fungsi ini harus aman dijalankan berulang (kunci: order_id).
  Tambahkan di sini: kirim email/WhatsApp ke tim, simpan ke database, dan sebagainya.
*/
async function onPaid(n) {
  console.log('[pay] LUNAS', n.order_id, n.gross_amount, n.payment_type)
}

export async function notify(body, env) {
  if (!env.MIDTRANS_SERVER_KEY) return { status: 503, data: { error: 'Kunci Midtrans belum diisi.' } }
  if (!body?.order_id || !verifySignature(body, env.MIDTRANS_SERVER_KEY)) {
    return { status: 403, data: { error: 'Signature tidak valid.' } }
  }
  const state = paymentState(body)
  console.log('[pay]', body.order_id, body.transaction_status, state)
  if (state === 'paid') await onPaid(body)
  return { status: 200, data: { ok: true } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' })
  const { status, data } = await notify(req.body, process.env)
  res.status(status).json(data)
}
