import { useRef, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import { clearToken, getToken } from '../lib/adminSession.js'
import { compressImage } from '../lib/image.js'
import { FASILITAS, TIPE } from '../data/kos.js'
import s from './AddListingForm.module.css'

const EMPTY = { nama: '', whatsapp: '', kos: '', area: '', catatan: '', tipe: '', harga: '', periode_harga: '' }

/** Form tambah listing kos (+ foto) di halaman database. onSaved() dipanggil setelah berhasil disimpan. */
export default function AddListingForm({ onSaved, listing = null, onCancel }) {
  const editing = Boolean(listing)
  const [form, setForm] = useState(() => listing ? {
    nama: listing.nama ?? '', whatsapp: listing.whatsapp ?? '', kos: listing.kos ?? '',
    area: listing.area ?? '', catatan: listing.catatan ?? '', tipe: listing.tipe ?? '',
    harga: listing.harga == null ? '' : String(listing.harga),
    periode_harga: listing.periode_harga ?? '',
  } : EMPTY)
  const [fasilitas, setFasilitas] = useState(() => String(listing?.fasilitas ?? '').split(',').map((item) => item.trim()).filter(Boolean))
  const [foto, setFoto] = useState(listing?.foto ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { ok: boolean, text: string }
  const fileRef = useRef(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleFasilitas = (name) =>
    setFasilitas((cur) => (cur.includes(name) ? cur.filter((f) => f !== name) : [...cur, name]))

  async function pickFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMsg(null)
    try {
      setFoto(await compressImage(file))
    } catch (err) {
      setFoto('')
      e.target.value = ''
      setMsg({ ok: false, text: err.message })
    }
  }

  function removeFoto() {
    setFoto('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch('/api/admin-listings', {
        method,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, id: listing?.id, harga: Number(form.harga), fasilitas, foto }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 401) {
        clearToken()
        onSaved() // halaman akan memuat ulang dan menampilkan "sesi habis"
        return
      }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      if (!editing) {
        setForm(EMPTY)
        setFasilitas([])
        removeFoto()
      }
      setMsg({ ok: true, text: editing ? 'Perubahan listing berhasil disimpan.' : `Listing tersimpan dan tayang di katalog (${json.listingId}).` })
      onSaved()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={s.form} onSubmit={submit}>
      <h3 className={s.title}>{editing ? 'Ubah data listing kos' : 'Tambah listing kos'}</h3>

      <div className={s.grid}>
        <div className={s.field}>
          <label htmlFor="al-kos">Nama kos</label>
          <input id="al-kos" required maxLength={100} value={form.kos} onChange={set('kos')} />
        </div>
        <div className={s.field}>
          <label htmlFor="al-area">Area</label>
          <input id="al-area" required maxLength={150} value={form.area} onChange={set('area')} />
        </div>
        <div className={s.field}>
          <label htmlFor="al-tipe">Tipe</label>
          <select id="al-tipe" required value={form.tipe} onChange={set('tipe')}>
            <option value="" disabled>
              Pilih tipe
            </option>
            {TIPE.map((t) => (
              <option key={t} value={t}>
                Kos {t.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label htmlFor="al-harga">Harga sewa (Rp)</label>
          <input id="al-harga" required type="number" inputMode="numeric" min={50000} max={50000000} step={1} value={form.harga} onChange={set('harga')} />
          <label htmlFor="al-periode">Periode harga</label>
          <select id="al-periode" required value={form.periode_harga} onChange={set('periode_harga')}>
            <option value="">Pilih periode</option>
            <option value="bulan">Per bulan</option>
            <option value="tahun">Per tahun</option>
          </select>
        </div>
        <fieldset className={`${s.field} ${s.wide} ${s.checks}`}>
          <legend>Fasilitas</legend>
          {FASILITAS.map((f) => (
            <label key={f} className={s.check}>
              <input type="checkbox" checked={fasilitas.includes(f)} onChange={() => toggleFasilitas(f)} />
              {f}
            </label>
          ))}
        </fieldset>
        <div className={s.field}>
          <label htmlFor="al-nama">Nama pemilik</label>
          <input id="al-nama" required maxLength={60} value={form.nama} onChange={set('nama')} />
        </div>
        <div className={s.field}>
          <label htmlFor="al-wa">WhatsApp pemilik</label>
          <input id="al-wa" required inputMode="tel" maxLength={20} value={form.whatsapp} onChange={set('whatsapp')} />
        </div>
        <div className={`${s.field} ${s.wide}`}>
          <label htmlFor="al-catatan">Catatan (opsional)</label>
          <textarea id="al-catatan" rows={2} maxLength={300} value={form.catatan} onChange={set('catatan')} />
        </div>
        <div className={`${s.field} ${s.wide}`}>
          <label htmlFor="al-foto">Foto (opsional)</label>
          <input id="al-foto" ref={fileRef} type="file" accept="image/*" onChange={pickFile} />
        </div>
      </div>

      {foto && (
        <div className={s.preview}>
          <img src={foto} alt="Pratinjau foto kos" />
          <Button as="button" variant="secondary" size="sm" onClick={removeFoto}>
            Hapus foto
          </Button>
        </div>
      )}

      <div className={s.actions}>
        <Button as="button" type="submit" size="sm" disabled={busy}>
          {busy ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan listing'}
        </Button>
        {editing && <Button as="button" type="button" variant="secondary" size="sm" onClick={onCancel}>Batal</Button>}
        {msg && (
          <p className={msg.ok ? s.ok : s.bad} role={msg.ok ? 'status' : 'alert'}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  )
}
