import { useEffect, useId, useState } from 'react'
import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import Button from '../ui/Button.jsx'
import DummyPay from '../pay/DummyPay.jsx'
import { useOrderIntent } from '../../context/OrderIntent.jsx'
import { order, plans, contact, brand } from '../../content/site.js'
import { rupiah } from '../../lib/format.js'
import s from './Order.module.css'

const MODES = [
  { id: 'survei', label: 'Pesan survei' },
  { id: 'pemilik', label: 'Pasang listing kos' },
]

const initialForms = {
  survei: { nama: '', whatsapp: '', kos: '', paket: plans.items[0].id, catatan: '' },
  pemilik: { nama: '', whatsapp: '', kos: '', area: '', catatan: '' },
}

const PAY_MESSAGE = {
  paid: 'Pembayaran berhasil. Terima kasih!',
  failed: 'Pembayaran gagal. Kamu bisa mencoba lagi.',
  unpaid: 'Pesanan sudah tercatat, tapi belum dibayar.',
}

/** Teks WhatsApp untuk bertanya sebelum memesan survei. Ubah template di sini. */
function composeMessage(f) {
  const nama = f.nama.trim() || '(nama)'
  const catatan = f.catatan.trim() ? ` Catatan: ${f.catatan.trim()}` : ''
  const plan = plans.items.find((p) => p.id === f.paket) ?? plans.items[0]
  const kos = f.kos.trim() || '(nama kos atau link iklan)'
  return `Halo ${brand.name}, saya ${nama}. Saya ingin memesan ${plan.price === 0 ? 'survei ' : ''}${plan.name} (${rupiah(plan.price)}) untuk kos: ${kos}.${catatan}`
}

/** Kirim JSON ke backend. Melempar Error dengan pesan yang aman ditampilkan ke pengguna. */
async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Permintaan belum bisa diproses. Coba lagi sebentar.')
  return data
}

export default function Order() {
  const uid = useId().replace(/:/g, '')
  const { intent } = useOrderIntent()
  const [mode, setMode] = useState('survei')
  const [forms, setForms] = useState(initialForms)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [dummy, setDummy] = useState(null) // pesanan yang sedang dibayar di tampilan dummy
  const [done, setDone] = useState(null)

  // Tombol lain di halaman (paket, katalog, pemilik kos) mengisi form lewat intent
  useEffect(() => {
    if (!intent.nonce) return
    setMode(intent.mode)
    setStatus('')
    setError('')
    setDone(null)
    if (intent.mode === 'survei') {
      setForms((prev) => ({
        ...prev,
        survei: {
          ...prev.survei,
          ...(intent.plan && { paket: intent.plan }),
          ...(intent.kos && { kos: intent.kos }),
        },
      }))
    }
  }, [intent])

  const form = forms[mode]
  const update = (field) => (event) => {
    const value = event.target.value
    setForms((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }))
  }

  const waMessage = composeMessage(forms.survei)
  const waUrl = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(waMessage)}` : ''

  const plan = plans.items.find((p) => p.id === forms.survei.paket) ?? plans.items[0]

  /** Pesan survei: simpan pesanan ke backend (/api/orders), lalu buka tampilan pembayaran dummy. */
  async function startOrder() {
    setStatus('')
    setError('')
    setDone(null)
    setSending(true)
    try {
      const data = await postJson('/api/orders', form)
      setDummy({
        orderId: data.orderId,
        amount: data.amount,
        planName: data.planName,
        nama: form.nama.trim(),
        kos: form.kos.trim(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  /** state: 'paid' | 'failed' | 'unpaid' (jendela ditutup sebelum bayar) */
  function afterPay(order, state) {
    setDummy(null)
    setDone({ kind: 'order', state, order })
    setStatus('')
    setError('')
    if (state === 'failed') setError(PAY_MESSAGE.failed)
    else setStatus(PAY_MESSAGE[state])
  }

  /** Pasang listing: simpan pendaftaran kos ke backend (/api/listings). */
  async function registerListing() {
    setStatus('')
    setError('')
    setDone(null)
    setSending(true)
    try {
      const data = await postJson('/api/listings', form)
      setDone({ kind: 'listing', id: data.listingId, nama: form.nama.trim(), kos: form.kos.trim() })
      setStatus('Pendaftaran kos tercatat. Tim KOSCHECK akan menghubungi lewat WhatsApp.')
      setForms((prev) => ({ ...prev, pemilik: initialForms.pemilik }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const confirmText = !done
    ? ''
    : done.kind === 'listing'
      ? `Halo ${brand.name}, saya ${done.nama}. Saya sudah mendaftarkan kos ${done.kos} (nomor ${done.id}).`
      : `Halo ${brand.name}, saya ${done.order.nama}. Pesanan ${done.order.orderId}: ${done.order.amount === 0 ? 'survei ' : ''}${done.order.planName} untuk kos ${done.order.kos}.` +
        (done.state === 'paid' ? ' Pembayaran sudah selesai.' : '')
  const confirmUrl = confirmText && contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(confirmText)}` : ''

  function handleSubmit(event) {
    event.preventDefault()
    return mode === 'survei' ? startOrder() : registerListing()
  }

  const id = (name) => `${uid}-${name}`

  return (
    <Section id="pesan">
      <div className={s.grid}>
        <SectionHead title={order.title} lede={order.lede} />

        <div className={s.panel}>
          <div className={s.modes} role="group" aria-label="Jenis pesanan">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={s.mode}
                aria-pressed={mode === m.id}
                onClick={() => {
                  setMode(m.id)
                  setStatus('')
                  setError('')
                  setDone(null)
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form className={s.form} onSubmit={handleSubmit}>
            <div className={s.field}>
              <label htmlFor={id('nama')}>Nama</label>
              <input id={id('nama')} type="text" required autoComplete="name" value={form.nama} onChange={update('nama')} />
            </div>

            <div className={s.field}>
              <label htmlFor={id('whatsapp')}>Nomor WhatsApp</label>
              <input
                id={id('whatsapp')}
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                placeholder="Contoh: 081234567890"
                value={form.whatsapp}
                onChange={update('whatsapp')}
              />
              <p className={s.hint}>
                {mode === 'survei'
                  ? 'Tim KOSCHECK memakai nomor ini untuk mengirim laporan survei.'
                  : 'Tim KOSCHECK memakai nomor ini untuk menghubungimu soal listing.'}
              </p>
            </div>

            <div className={s.field}>
              <label htmlFor={id('kos')}>{mode === 'survei' ? 'Kos yang ingin dicek' : 'Nama kosmu'}</label>
              <input
                id={id('kos')}
                type="text"
                required
                placeholder={mode === 'survei' ? 'Nama kos, alamat, atau link iklan' : 'Contoh: Kos Melati'}
                value={form.kos}
                onChange={update('kos')}
              />
            </div>

            {mode === 'survei' ? (
              <div className={s.field}>
                <label htmlFor={id('paket')}>Paket</label>
                <select id={id('paket')} value={form.paket} onChange={update('paket')}>
                  {plans.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}, {rupiah(p.price)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={s.field}>
                <label htmlFor={id('area')}>Area atau alamat kos</label>
                <input
                  id={id('area')}
                  type="text"
                  required
                  placeholder="Contoh: Bukit Besar, Palembang"
                  value={form.area}
                  onChange={update('area')}
                />
              </div>
            )}

            <div className={s.field}>
              <label htmlFor={id('catatan')}>Catatan (opsional)</label>
              <textarea id={id('catatan')} rows={3} value={form.catatan} onChange={update('catatan')} />
            </div>

            <div className={s.preview}>
              {mode === 'survei' ? (
                <>
                  <p className={s.previewLabel}>Yang kamu bayar</p>
                  <p className={s.previewText}>
                    {plan.price === 0 ? 'Survei ' : ''}{plan.name}, {rupiah(plan.price)}. Metode pembayaran dipilih di langkah berikutnya.
                  </p>
                </>
              ) : (
                <>
                  <p className={s.previewLabel}>Yang akan didaftarkan</p>
                  <p className={s.previewText}>
                    {form.kos.trim() || '(nama kos)'} di {form.area.trim() || '(area kos)'}, atas nama{' '}
                    {form.nama.trim() || '(nama)'}.
                  </p>
                </>
              )}
            </div>

            {mode === 'survei' ? (
              <div className={s.actions}>
                <Button as="button" type="submit" disabled={sending}>
                  {sending ? 'Menyiapkan pembayaran' : `Bayar ${rupiah(plan.price)}`}
                </Button>
                {waUrl && (
                  <Button as="a" variant="secondary" href={waUrl} target="_blank" rel="noopener noreferrer">
                    Tanya dulu lewat WhatsApp
                  </Button>
                )}
              </div>
            ) : (
              <Button as="button" type="submit" disabled={sending}>
                {sending ? 'Menyimpan pendaftaran' : 'Daftarkan kos'}
              </Button>
            )}

            <p className={s.status} role="status">
              {status}
            </p>

            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}

            {done && (
              <div className={s.done}>
                <p>
                  {done.kind === 'listing' ? 'Nomor pendaftaran' : 'Nomor pesanan'}:{' '}
                  <strong>{done.kind === 'listing' ? done.id : done.order.orderId}</strong>
                </p>
                {done.kind === 'order' && done.state !== 'paid' && (
                  <Button
                    as="button"
                    size="sm"
                    onClick={() => {
                      setDummy(done.order)
                      setDone(null)
                      setStatus('')
                      setError('')
                    }}
                  >
                    Lanjutkan pembayaran
                  </Button>
                )}
                {confirmUrl && (
                  <Button as="a" variant="secondary" size="sm" href={confirmUrl} target="_blank" rel="noopener noreferrer">
                    {done.kind === 'listing' ? 'Kirim nomor pendaftaran ke WhatsApp' : 'Kirim nomor pesanan ke WhatsApp'}
                  </Button>
                )}
              </div>
            )}

            {import.meta.env.DEV && !contact.whatsapp && (
              <p className={s.devHint}>
                Mode pengembangan: isi <code>contact.whatsapp</code> di <code>src/content/site.js</code> agar tombol
                ini membuka WhatsApp.
              </p>
            )}
          </form>

          {dummy && (
            <DummyPay
              order={dummy}
              onFinish={(hasil) => afterPay(dummy, hasil === 'paid' ? 'paid' : 'failed')}
              onClose={() => afterPay(dummy, 'unpaid')}
            />
          )}
        </div>
      </div>
    </Section>
  )
}
