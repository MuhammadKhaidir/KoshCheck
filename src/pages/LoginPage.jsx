import { useId, useState } from 'react'
import Container from '../components/ui/Container.jsx'
import Button from '../components/ui/Button.jsx'
import { saveToken as saveAdminToken } from '../lib/adminSession.js'
import { saveOwnerToken } from '../lib/ownerSession.js'
import s from './AdminPage.module.css'
import a from './Auth.module.css'

/*
  Halaman masuk (#/masuk), dibuka dari tombol "Masuk" di header. Dua jalur: Pemilik Kos dan Admin.
  Password dikirim langsung ke server (/api/owner atau /api/admin-login), tidak lewat chat AI.
*/
async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.token) throw new Error(data.error || 'Gagal masuk. Coba lagi sebentar.')
  return data
}

function keep(save, token) {
  try {
    save(token)
  } catch {
    throw new Error('Browser menolak menyimpan sesi. Matikan mode privat, lalu coba lagi.')
  }
}

export default function LoginPage() {
  const uid = useId()
  const [role, setRole] = useState('pemilik')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pickRole = (next) => {
    setRole(next)
    setError('')
    setPassword('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (role === 'admin') {
        const data = await post('/api/admin-login', { password })
        keep(saveAdminToken, data.token)
        window.location.hash = '#/admin'
      } else {
        const data = await post('/api/owner', { action: 'login', whatsapp, password })
        keep(saveOwnerToken, data.token)
        window.location.hash = '#/pemilik'
      }
    } catch (err) {
      setError(err.message)
      setPassword('')
      setBusy(false)
    }
  }

  return (
    <main className={s.page}>
      <Container>
        <header className={s.top}>
          <div>
            <p className={s.kicker}>KOSCHECK</p>
            <h1 className={s.title}>Masuk</h1>
          </div>
        </header>

        <div className={a.card}>
          <div className={a.tabs}>
            <button type="button" className={a.tab} aria-pressed={role === 'pemilik'} onClick={() => pickRole('pemilik')}>
              Pemilik Kos
            </button>
            <button type="button" className={a.tab} aria-pressed={role === 'admin'} onClick={() => pickRole('admin')}>
              Admin
            </button>
          </div>

          <form className={a.form} onSubmit={submit}>
            {role === 'pemilik' && (
              <div className={a.field}>
                <label htmlFor={`${uid}-wa`}>Nomor WhatsApp</label>
                <input
                  id={`${uid}-wa`}
                  className={a.input}
                  type="tel"
                  inputMode="tel"
                  autoComplete="username"
                  maxLength={20}
                  placeholder="08xxxxxxxxxx"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            )}
            <div className={a.field}>
              <label htmlFor={`${uid}-pw`}>Password</label>
              <input
                id={`${uid}-pw`}
                className={a.input}
                type="password"
                autoComplete="current-password"
                maxLength={200}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {role === 'pemilik' && (
              <p className={a.hint}>
                Pakai nomor WhatsApp yang didaftarkan untuk kosmu. Login pertama memakai password awal dari tim
                KOSCHECK, lalu kamu diminta menggantinya.
              </p>
            )}
            {error && (
              <p className={a.error} role="alert">
                {error}
              </p>
            )}
            <Button as="button" type="submit" disabled={busy || !password}>
              {busy ? 'Memeriksa…' : 'Masuk'}
            </Button>
          </form>

          <Button as="a" variant="secondary" size="sm" href="#top">
            Kembali ke situs
          </Button>
        </div>
      </Container>
    </main>
  )
}
