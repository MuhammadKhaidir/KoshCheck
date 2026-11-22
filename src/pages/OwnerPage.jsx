import { useCallback, useEffect, useId, useState } from 'react'
import Container from '../components/ui/Container.jsx'
import Button from '../components/ui/Button.jsx'
import { rupiah } from '../lib/format.js'
import { clearOwnerToken, getOwnerToken } from '../lib/ownerSession.js'
import s from './AdminPage.module.css'
import a from './Auth.module.css'

/*
  Halaman Pemilik Kos (#/pemilik). Hanya menampilkan kos milik akun yang login, beserta status pesanannya.
  Selama password awal belum diganti, server tidak mengirim data kos: yang tampil hanya form ganti password.
*/
const REFRESH_MS = 30000

const STATUS = {
  dipesan: { label: 'Sudah dipesan', tone: s.ok },
  menunggu: { label: 'Menunggu pembayaran', tone: s.warn },
  belum: { label: 'Belum dipesan', tone: a.plain },
}

async function call(body) {
  const res = await fetch('/api/owner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${getOwnerToken()}` },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

const FIELDS = [
  ['password', 'Password saat ini (password awal)', 'current-password'],
  ['newPassword', 'Password baru (minimal 8 karakter)', 'new-password'],
  ['again', 'Ulangi password baru', 'new-password'],
]

function ChangePassword({ onDone }) {
  const uid = useId()
  const [form, setForm] = useState({ password: '', newPassword: '', again: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    if (form.newPassword.length < 8) return setError('Password baru minimal 8 karakter.')
    if (form.newPassword !== form.again) return setError('Ulangi password baru dengan sama persis.')
    setBusy(true)
    setError('')
    try {
      const { res, data } = await call({ action: 'password', password: form.password, newPassword: form.newPassword })
      if (!res.ok) throw new Error(data.error || 'Password belum bisa diganti.')
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className={s.notice} role="alert">
      <h2 className={s.h2}>Wajib ganti password</h2>
      <p>Kamu masih memakai password awal. Ganti dulu dengan password baru sebelum melihat data kosmu.</p>
      <form className={a.form} onSubmit={submit}>
        {FIELDS.map(([key, label, autoComplete]) => (
          <div className={a.field} key={key}>
            <label htmlFor={`${uid}-${key}`}>{label}</label>
            <input
              id={`${uid}-${key}`}
              className={a.input}
              type="password"
              autoComplete={autoComplete}
              maxLength={200}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required
            />
          </div>
        ))}
        {error && <p className={a.error}>{error}</p>}
        <Button as="button" type="submit" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Simpan password baru'}
        </Button>
      </form>
    </div>
  )
}

export default function OwnerPage() {
  const [state, setState] = useState(() => (getOwnerToken() ? 'loading' : 'nologin')) // loading | ready | nologin | error
  const [owner, setOwner] = useState(null)
  const [kos, setKos] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!getOwnerToken()) return setState('nologin')
    try {
      const { res, data } = await call({ action: 'data' })
      if (res.status === 401) {
        clearOwnerToken()
        return setState('nologin')
      }
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setOwner(data.owner)
      setKos(data.kos ?? [])
      setError('')
      setState('ready')
    } catch (err) {
      setError(err.message)
      setState((prev) => (prev === 'ready' ? 'ready' : 'error'))
    }
  }, [])

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'Pemilik Kos | KOSCHECK'
    window.scrollTo(0, 0)
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      clearInterval(timer)
      document.title = oldTitle
    }
  }, [load])

  function logout() {
    clearOwnerToken()
    window.location.hash = '#top'
  }

  return (
    <main className={s.page}>
      <Container>
        <header className={s.top}>
          <div>
            <p className={s.kicker}>KOSCHECK</p>
            <h1 className={s.title}>Kos Saya</h1>
            {owner && <p className={s.sub}>Masuk sebagai {owner.nama}.</p>}
          </div>
          <div className={s.topActions}>
            {state === 'ready' && !owner?.mustChange && (
              <Button as="button" variant="secondary" size="sm" onClick={load}>
                Muat ulang
              </Button>
            )}
            <Button as="a" variant="secondary" size="sm" href="#top">
              Kembali ke situs
            </Button>
            {state !== 'nologin' && (
              <Button as="button" size="sm" onClick={logout}>
                Keluar
              </Button>
            )}
          </div>
        </header>

        {state === 'loading' && (
          <p className={s.notice} role="status">
            Memuat data…
          </p>
        )}

        {state === 'nologin' && (
          <div className={s.notice}>
            <p>Sesi tidak ada atau sudah habis. Silakan masuk lagi.</p>
            <Button as="a" href="#/masuk">
              Masuk
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className={s.notice} role="alert">
            <p>Data belum bisa dimuat: {error}</p>
            <Button as="button" onClick={load}>
              Coba lagi
            </Button>
          </div>
        )}

        {state === 'ready' && owner.mustChange && <ChangePassword onDone={load} />}

        {state === 'ready' && !owner.mustChange && (
          <section className={s.block} aria-labelledby="owner-kos">
            <div className={s.blockHead}>
              <h2 id="owner-kos" className={s.h2}>
                Kos yang terdaftar atas nomor {owner.whatsapp}
              </h2>
            </div>
            {error && (
              <p className={s.error} role="alert">
                Gagal memperbarui: {error}
              </p>
            )}
            {kos.length === 0 ? (
              <p className={s.empty}>Belum ada kos yang terhubung dengan akun ini.</p>
            ) : (
              <div className={s.scroll} role="region" aria-label="Tabel kos saya" tabIndex={0}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th scope="col">Nama kos</th>
                      <th scope="col">Area</th>
                      <th scope="col">Tipe</th>
                      <th scope="col">Harga / bulan</th>
                      <th scope="col">Status pesanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kos.map((k) => {
                      const st = STATUS[k.status] ?? STATUS.belum
                      return (
                        <tr key={k.id}>
                          <td className={s.wrap}>{k.kos}</td>
                          <td className={s.wrap}>{k.area}</td>
                          <td>{k.tipe || '-'}</td>
                          <td className={s.nowrap}>{k.harga ? rupiah(k.harga) : '-'}</td>
                          <td>
                            <span className={`${s.badge} ${st.tone}`}>{st.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </Container>
    </main>
  )
}
