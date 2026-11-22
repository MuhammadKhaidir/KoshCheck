import { useCallback, useEffect, useMemo, useState } from 'react'
import Container from '../components/ui/Container.jsx'
import Button from '../components/ui/Button.jsx'
import AddListingForm from './AddListingForm.jsx'
import { plans } from '../content/site.js'
import { rupiah } from '../lib/format.js'
import { clearToken, getToken } from '../lib/adminSession.js'
import s from './AdminPage.module.css'

/*
  Halaman database (#/admin). Dibuka dari chat AI setelah password benar (lihat ChatWidget.jsx).
  Data diambil dari GET /api/admin dengan token login, dan diperbarui otomatis.
*/
const REFRESH_MS = 20000

const STATUS = {
  paid: { label: 'Lunas', tone: s.ok },
  pending: { label: 'Belum bayar', tone: s.warn },
  failed: { label: 'Gagal', tone: s.bad },
}

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'paid', label: 'Lunas' },
  { id: 'pending', label: 'Belum bayar' },
  { id: 'failed', label: 'Gagal' },
]

const METODE = { qris: 'QRIS', bca_va: 'BCA VA', gopay: 'GoPay', shopeepay: 'ShopeePay', indomaret: 'Indomaret' }

const dateTime = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })
const clock = new Intl.DateTimeFormat('id-ID', { timeStyle: 'medium', timeZone: 'Asia/Jakarta' })
const when = (iso) => (iso ? dateTime.format(new Date(iso)) : '-')

const planName = (id) => plans.items.find((p) => p.id === id)?.name ?? id

function WhatsApp({ number }) {
  const digits = String(number).replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return (
    <a href={`https://wa.me/${intl}`} target="_blank" rel="noopener noreferrer">
      {number}
    </a>
  )
}

export default function AdminPage() {
  const [state, setState] = useState(() => (getToken() ? 'loading' : 'nologin')) // loading | ready | nologin | error
  const [data, setData] = useState({ orders: [], listings: [] })
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return setState('nologin')
    try {
      const res = await fetch('/api/admin', { headers: { authorization: `Bearer ${token}` } })
      if (res.status === 401) {
        clearToken()
        return setState('nologin')
      }
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setData({ orders: json.orders ?? [], listings: json.listings ?? [] })
      setUpdatedAt(new Date())
      setError('')
      setState('ready')
    } catch (err) {
      setError(err.message)
      setState((prev) => (prev === 'ready' ? 'ready' : 'error')) // data lama tetap tampil bila refresh gagal
    }
  }, [])

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'Database | KOSCHECK'
    window.scrollTo(0, 0)
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      clearInterval(timer)
      document.title = oldTitle
    }
  }, [load])

  const { orders, listings } = data
  const stats = useMemo(() => {
    const count = (status) => orders.filter((o) => o.status === status).length
    const paidTotal = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.harga, 0)
    return { paid: count('paid'), pending: count('pending'), failed: count('failed'), paidTotal }
  }, [orders])

  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  function logout() {
    clearToken()
    window.location.hash = '#top'
  }

  return (
    <main className={s.page}>
      <Container>
        <header className={s.top}>
          <div>
            <p className={s.kicker}>KOSCHECK</p>
            <h1 className={s.title}>Database</h1>
            <p className={s.sub}>
              Siapa yang sudah daftar dan statusnya.
              {updatedAt && ` Diperbarui ${clock.format(updatedAt)}, otomatis tiap ${REFRESH_MS / 1000} detik.`}
            </p>
          </div>
          <div className={s.topActions}>
            {state !== 'nologin' && (
              <Button as='button' variant='secondary' size='sm' onClick={load}>
                Muat ulang
              </Button>
            )}
            <Button as='a' variant='secondary' size='sm' href='#top'>
              Kembali ke situs
            </Button>
            {state !== 'nologin' && (
              <Button as='button' size='sm' onClick={logout}>
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
            <p>
              Sesi admin tidak ada atau sudah habis. Silakan masuk lagi.
            </p>
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

        {state === 'ready' && (
          <>
            {error && (
              <p className={s.error} role="alert">
                Pembaruan terakhir gagal ({error}). Data di bawah mungkin belum terbaru.
              </p>
            )}

            <dl className={s.stats}>
              <div className={s.stat}>
                <dt>Pesanan masuk</dt>
                <dd>{orders.length}</dd>
              </div>
              <div className={s.stat}>
                <dt>Lunas</dt>
                <dd>{stats.paid}</dd>
                <p className={s.statNote}>{rupiah(stats.paidTotal)}</p>
              </div>
              <div className={s.stat}>
                <dt>Belum bayar</dt>
                <dd>{stats.pending}</dd>
              </div>
              <div className={s.stat}>
                <dt>Gagal</dt>
                <dd>{stats.failed}</dd>
              </div>
              <div className={s.stat}>
                <dt>Pendaftaran kos</dt>
                <dd>{listings.length}</dd>
              </div>
            </dl>

            <section className={s.block} aria-labelledby="admin-orders">
              <div className={s.blockHead}>
                <h2 id="admin-orders" className={s.h2}>
                  Pesanan survei
                </h2>
                <div className={s.filters} role="group" aria-label="Filter status">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={s.filter}
                      aria-pressed={filter === f.id}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {shown.length === 0 ? (
                <p className={s.empty}>{orders.length === 0 ? 'Belum ada pesanan.' : 'Tidak ada pesanan dengan status ini.'}</p>
              ) : (
                <div className={s.scroll} role="region" aria-label="Tabel pesanan survei" tabIndex={0}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th scope="col">Waktu</th>
                        <th scope="col">Nama</th>
                        <th scope="col">WhatsApp</th>
                        <th scope="col">Kos yang dicek</th>
                        <th scope="col">Paket</th>
                        <th scope="col">Status</th>
                        <th scope="col">Metode</th>
                        <th scope="col">No. pesanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((o) => {
                        const st = STATUS[o.status] ?? { label: o.status, tone: '' }
                        return (
                          <tr key={o.id}>
                            <td className={s.nowrap}>{when(o.created_at)}</td>
                            <td>{o.nama}</td>
                            <td className={s.nowrap}>
                              <WhatsApp number={o.whatsapp} />
                            </td>
                            <td className={s.wrap}>
                              {o.kos}
                              {o.catatan && <span className={s.cell2}>Catatan: {o.catatan}</span>}
                            </td>
                            <td className={s.nowrap}>
                              {planName(o.paket)}
                              <span className={s.cell2}>{rupiah(o.harga)}</span>
                            </td>
                            <td className={s.nowrap}>
                              <span className={`${s.badge} ${st.tone}`}>{st.label}</span>
                              {o.status === 'paid' && <span className={s.cell2}>{when(o.paid_at)}</span>}
                            </td>
                            <td className={s.nowrap}>{METODE[o.metode] ?? o.metode ?? '-'}</td>
                            <td className={s.nowrap}>{o.id}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className={s.block} aria-labelledby="admin-listings">
              <div className={s.blockHead}>
                <h2 id="admin-listings" className={s.h2}>
                  Pendaftaran kos
                </h2>
              </div>

              <AddListingForm onSaved={load} />

              {listings.length === 0 ? (
                <p className={s.empty}>Belum ada pendaftaran.</p>
              ) : (
                <div className={s.scroll} role="region" aria-label="Tabel pendaftaran kos" tabIndex={0}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th scope="col">Foto</th>
                        <th scope="col">Waktu</th>
                        <th scope="col">Pemilik</th>
                        <th scope="col">WhatsApp</th>
                        <th scope="col">Nama kos</th>
                        <th scope="col">Area</th>
                        <th scope="col">Catatan</th>
                        <th scope="col">No. pendaftaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((l) => (
                        <tr key={l.id}>
                          <td>
                            {l.foto ? (
                              <img className={s.thumb} src={l.foto} alt={`Foto ${l.kos}`} loading="lazy" />
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className={s.nowrap}>{when(l.created_at)}</td>
                          <td>{l.nama}</td>
                          <td className={s.nowrap}>
                            <WhatsApp number={l.whatsapp} />
                          </td>
                          <td className={s.wrap}>
                            {l.kos}
                            {l.publik && (
                              <span className={s.cell2}>
                                Tayang di katalog: {rupiah(l.harga)}, {l.tipe}
                                {l.fasilitas ? `, ${l.fasilitas.split(',').join(', ')}` : ''}
                              </span>
                            )}
                          </td>
                          <td className={s.wrap}>{l.area}</td>
                          <td className={s.wrap}>{l.catatan || '-'}</td>
                          <td className={s.nowrap}>{l.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </Container>
    </main>
  )
}
