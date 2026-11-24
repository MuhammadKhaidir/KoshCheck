import { useEffect, useId, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import { rupiah } from '../../lib/format.js'
import s from './DummyPay.module.css'

/*
  TAMPILAN DUMMY pembayaran bergaya Midtrans. Tidak terhubung ke Midtrans sama sekali.
  Tombol Bayar memanggil /api/pay-dummy, yang hanya mengubah status pesanan di database.

  Nanti, saat akun Midtrans siap: di Order.jsx ganti <DummyPay> dengan alur payWithSnap()
  (src/lib/snap.js + /api/pay), lalu isi MIDTRANS_SERVER_KEY. Endpoint dummy otomatis mati.

  order   : { orderId, amount, planName }
  onFinish(hasil)  hasil = 'paid' | 'failed', dipanggil setelah status tersimpan di server
  onClose()        pengguna menutup tanpa menyelesaikan pembayaran
*/
const METHODS = [
  { id: 'qris', label: 'QRIS', note: 'Semua e-wallet dan m-banking' },
  { id: 'bca_va', label: 'BCA Virtual Account', note: 'ATM, m-banking, atau internet banking' },
  { id: 'gopay', label: 'GoPay', note: 'Bayar lewat aplikasi' },
  { id: 'shopeepay', label: 'ShopeePay', note: 'Bayar lewat aplikasi' },
  { id: 'indomaret', label: 'Indomaret', note: 'Bayar tunai di kasir' },
]

/** Angka tetap dari id pesanan, supaya tidak berubah tiap render. */
function seedOf(text) {
  return [...text].reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) >>> 0, 5381)
}

function fakeVa(orderId) {
  const digits = String(seedOf(orderId)).padStart(12, '0')
  return `8077${digits}`.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** Pola kotak-kotak mirip QR. Tidak bisa dipindai. */
function FakeQr({ seed }) {
  const size = 21
  let x = seedOf(seed)
  const cells = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)
      x = (x * 1664525 + 1013904223) >>> 0
      if (!inFinder && x & 0x10000) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />)
    }
  }
  const finders = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]
  return (
    <svg className={s.qr} viewBox={`-1 -1 ${size + 2} ${size + 2}`} role="img" aria-label="Kode QR pembayaran">
      <rect x="-1" y="-1" width={size + 2} height={size + 2} fill="#fff" />
      <g fill="#0e2f33">
        {cells}
        {finders.map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect x={fx} y={fy} width="7" height="7" />
            <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="#fff" />
            <rect x={fx + 2} y={fy + 2} width="3" height="3" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function Detail({ method, orderId }) {
  if (method.id === 'qris') {
    return (
      <>
        <FakeQr seed={orderId} />
        <p className={s.detailNote}>Pindai kode QR dengan aplikasi e-wallet atau m-banking.</p>
      </>
    )
  }
  if (method.id === 'bca_va') {
    return (
      <>
        <p className={s.detailLabel}>Nomor Virtual Account</p>
        <p className={s.va}>{fakeVa(orderId)}</p>
      </>
    )
  }
  if (method.id === 'indomaret') {
    return (
      <>
        <p className={s.detailLabel}>Kode pembayaran</p>
        <p className={s.va}>{`KC${seedOf(orderId) % 10_000_000}`}</p>
      </>
    )
  }
  return <p className={s.detailNote}>Kamu akan diarahkan ke aplikasi {method.label} untuk menyelesaikan pembayaran.</p>
}

export default function DummyPay({ order, onFinish, onClose }) {
  const titleId = useId()
  const radioName = useId()
  const dialogRef = useRef(null)
  const [methodId, setMethodId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const method = METHODS.find((m) => m.id === methodId)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  async function simulate(hasil) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/pay-dummy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, hasil, metode: method.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Pembayaran gagal diproses. Coba lagi.')
      onFinish(hasil)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={s.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault() // Esc
        if (!busy) onClose()
      }}
    >
      <div className={s.body}>
        <h2 id={titleId} className={s.title}>
          Simulasi pembayaran (tanpa uang sungguhan)
        </h2>

        <dl className={s.summary}>
          <div>
            <dt>Nomor pesanan</dt>
            <dd>{order.orderId}</dd>
          </div>
          <div>
            <dt>{order.amount === 0 ? `Survei ${order.planName}` : order.planName}</dt>
            <dd className={s.total}>{rupiah(order.amount)}</dd>
          </div>
        </dl>

        <fieldset className={s.methods} disabled={busy}>
          <legend>Pilih metode pembayaran</legend>
          {METHODS.map((m) => (
            <label key={m.id} className={s.method}>
              <input type="radio" name={radioName} value={m.id} checked={methodId === m.id} onChange={() => setMethodId(m.id)} />
              <span>
                <strong>{m.label}</strong>
                <small>{m.note}</small>
              </span>
            </label>
          ))}
        </fieldset>

        {method && (
          <div className={s.detail} aria-live="polite">
            <Detail method={method} orderId={order.orderId} />
          </div>
        )}

        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}

        <div className={s.actions}>
          <Button as="button" disabled={!method || busy} onClick={() => simulate('paid')}>
            {busy ? 'Memproses pembayaran' : `Bayar ${rupiah(order.amount)}`}
          </Button>
          <Button as="button" variant="secondary" size="sm" disabled={busy} onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </dialog>
  )
}
