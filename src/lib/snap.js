/*
  Membuka jendela pembayaran Midtrans (Snap) di atas halaman.
  snap.js dimuat saat pertama kali dibutuhkan, memakai alamat dan Client Key dari /api/pay,
  jadi sandbox atau production cukup diatur lewat environment variable di server.
*/
let loading = null

function loadSnap({ snapUrl, clientKey }) {
  if (window.snap) return Promise.resolve(window.snap)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const el = document.createElement('script')
      el.src = snapUrl
      el.setAttribute('data-client-key', clientKey)
      el.async = true
      el.onload = () => resolve(window.snap)
      el.onerror = () => {
        loading = null
        el.remove()
        reject(new Error('Jendela pembayaran gagal dimuat. Periksa koneksi, lalu coba lagi.'))
      }
      document.head.appendChild(el)
    })
  }
  return loading
}

/**
 * payment : balasan /api/pay ({ token, clientKey, snapUrl, ... })
 * handlers: { onSuccess, onPending, onError, onClose }
 */
export async function payWithSnap(payment, handlers) {
  const snap = await loadSnap(payment)
  snap.pay(payment.token, handlers)
}
