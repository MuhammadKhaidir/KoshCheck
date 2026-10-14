import { useEffect, useId, useState } from 'react'
import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import Button from '../ui/Button.jsx'
import { useOrderIntent } from '../../context/OrderIntent.jsx'
import { order, plans, contact, brand } from '../../content/site.js'
import { rupiah } from '../../lib/format.js'
import s from './Order.module.css'

const MODES = [
  { id: 'survei', label: 'Pesan survei' },
  { id: 'pemilik', label: 'Pasang listing kos' },
]

const initialForms = {
  survei: { nama: '', kos: '', paket: plans.items[0].id, catatan: '' },
  pemilik: { nama: '', kos: '', area: '', catatan: '' },
}

/** Susun teks pesan yang dikirim ke tim KOSCHECK. Ubah template di sini. */
function composeMessage(mode, f) {
  const nama = f.nama.trim() || '(nama)'
  const catatan = f.catatan.trim() ? ` Catatan: ${f.catatan.trim()}` : ''

  if (mode === 'pemilik') {
    const kos = f.kos.trim() || '(nama kos)'
    const area = f.area.trim() || '(area kos)'
    return `Halo ${brand.name}, saya ${nama}, pemilik ${kos} di ${area}. Saya ingin memasang listing kos di katalog.${catatan}`
  }

  const plan = plans.items.find((p) => p.id === f.paket) ?? plans.items[0]
  const kos = f.kos.trim() || '(nama kos atau link iklan)'
  return `Halo ${brand.name}, saya ${nama}. Saya ingin memesan survei ${plan.name} (${rupiah(plan.price)}) untuk kos: ${kos}.${catatan}`
}

export default function Order() {
  const uid = useId().replace(/:/g, '')
  const { intent } = useOrderIntent()
  const [mode, setMode] = useState('survei')
  const [forms, setForms] = useState(initialForms)
  const [status, setStatus] = useState('')

  // Tombol lain di halaman (paket, katalog, pemilik kos) mengisi form lewat intent
  useEffect(() => {
    if (!intent.nonce) return
    setMode(intent.mode)
    setStatus('')
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

  const message = composeMessage(mode, form)
  const waUrl = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}` : ''

  async function handleSubmit(event) {
    event.preventDefault()
    if (waUrl) {
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      setStatus('Membuka WhatsApp.')
      return
    }
    try {
      await navigator.clipboard.writeText(message)
      setStatus('Pesan disalin. Tempel ke WhatsApp atau email tim KOSCHECK!.')
    } catch {
      setStatus('Pesan belum bisa disalin otomatis. Salin dari kotak pratinjau di atas.')
    }
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
              <p className={s.previewLabel}>Pesan yang akan dikirim</p>
              <p className={s.previewText}>{message}</p>
            </div>

            <Button as="button" type="submit">
              {waUrl ? 'Kirim lewat WhatsApp' : 'Salin pesan'}
            </Button>

            <p className={s.status} role="status">
              {status}
            </p>

            {import.meta.env.DEV && !contact.whatsapp && (
              <p className={s.devHint}>
                Mode pengembangan: isi <code>contact.whatsapp</code> di <code>src/content/site.js</code> agar tombol
                ini membuka WhatsApp.
              </p>
            )}
          </form>
        </div>
      </div>
    </Section>
  )
}
