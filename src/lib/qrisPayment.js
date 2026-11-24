/** Pesan konfirmasi hanya meminta verifikasi; tidak menyatakan pesanan lunas. */
export function qrisConfirmationUrl(whatsapp, order) {
  if (!/^\d{8,15}$/.test(String(whatsapp ?? ''))) return ''
  if (!order?.orderId || !Number.isSafeInteger(order.amount) || order.amount <= 0) return ''
  const message = `Halo KOSCHECK, saya ${order.nama || 'pelanggan'}. Mohon bantuan verifikasi pembayaran QRIS untuk pesanan ${order.orderId}, ${order.planName}, nominal Rp${order.amount}. Bukti transaksi akan saya lampirkan jika sudah membayar.`
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
}
