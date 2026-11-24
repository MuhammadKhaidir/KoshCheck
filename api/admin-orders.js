/* Endpoint khusus admin untuk menghapus satu riwayat pesanan survei. */
import { isAdmin } from './_auth.js'
import { deleteOrder as removeOrderById } from './_db.js'

export async function deleteOrder(body, env, req) {
  if (!env.ADMIN_KEY) return { status: 503, data: { error: 'ADMIN_KEY belum diisi.' } }
  if (!isAdmin(req, env)) return { status: 401, data: { error: 'Belum masuk atau sesi sudah habis.' } }

  const id = typeof body?.id === 'string' ? body.id.trim() : ''
  if (!id || id.length > 100) return { status: 400, data: { error: 'ID pesanan tidak valid.' } }

  try {
    const row = await removeOrderById(env, id)
    if (!row) return { status: 404, data: { error: 'Riwayat transaksi tidak ditemukan.' } }
  } catch (err) {
    console.error('[admin-orders:delete]', err)
    return { status: 500, data: { error: 'Riwayat transaksi belum bisa dihapus.' } }
  }

  return { status: 200, data: { deleted: true, orderId: id } }
}

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Gunakan DELETE.' })
  const { status, data } = await deleteOrder(req.body, process.env, req)
  res.status(status).json(data)
}
