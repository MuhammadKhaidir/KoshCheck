import { useEffect, useId, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import { rupiah } from '../../lib/format.js'
import { qrisConfirmationUrl } from '../../lib/qrisPayment.js'
import s from './DummyPay.module.css'

// Simpan gambar QRIS statis asli merchant di public/qris/gopay-merchant.png.
const QR_IMAGE = `${import.meta.env.BASE_URL}qris/gopay-merchant.png`

export default function QrisPay({ order, whatsapp, onClose }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const [imageState, setImageState] = useState('loading')
  const confirmUrl = qrisConfirmationUrl(whatsapp, order)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog ref={dialogRef} className={s.dialog} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className={s.body}>
        <h2 id={titleId} className={s.title}>Pembayaran QRIS</h2>
        <dl className={s.summary}>
          <div><dt>Nomor pesanan</dt><dd>{order.orderId}</dd></div>
          <div><dt>{order.planName}</dt><dd className={s.total}>{rupiah(order.amount)}</dd></div>
          <div><dt>Status</dt><dd>Menunggu pembayaran / verifikasi</dd></div>
        </dl>
        <div className={s.detail}>
          <strong>QRIS GoPay Merchant KOSCHECK</strong>
          {imageState !== 'error' && (
            <img src={QR_IMAGE} alt="QRIS GoPay Merchant KOSCHECK"
              style={{ width: '100%', maxWidth: '19rem', height: 'auto', background: '#fff' }}
              onLoad={() => setImageState('ready')} onError={() => setImageState('error')} />
          )}
          {imageState === 'loading' && <p role="status">Memuat QRIS...</p>}
          {imageState === 'error' && <p className={s.error} role="alert">QRIS belum tersedia. Jangan transfer sebelum mendapat QRIS resmi dari tim KOSCHECK.</p>}
          {imageState === 'ready' && <a href={QR_IMAGE} download="QRIS-KOSCHECK.png">Unduh gambar QRIS</a>}
          <p className={s.detailNote}>Pindai QRIS melalui aplikasi pembayaran. Pastikan nama merchant benar dan masukkan nominal tepat {rupiah(order.amount)}. Simpan bukti transaksi.</p>
        </div>
        <p className={s.detailNote}>Kirim bukti pembayaran melalui WhatsApp. Pesanan tidak otomatis lunas; tim KOSCHECK harus memeriksa transaksi masuk.</p>
        <div className={s.actions}>
          {confirmUrl && <Button as="a" href={confirmUrl} target="_blank" rel="noopener noreferrer">{imageState === 'ready' ? 'Konfirmasi via WhatsApp' : 'Hubungi tim via WhatsApp'}</Button>}
          <Button as="button" type="button" variant="secondary" onClick={onClose}>Tutup / bayar nanti</Button>
        </div>
      </div>
    </dialog>
  )
}
