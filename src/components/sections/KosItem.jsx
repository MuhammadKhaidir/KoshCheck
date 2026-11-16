import { useState } from 'react'
import Icon from '../ui/Icon.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import { FASILITAS } from '../../data/kos.js'
import { rupiah, tanggal } from '../../lib/format.js'
import s from './KosItem.module.css'

/**
 * Satu baris kos di katalog. Bentuk props mengikuti objek di src/data/kos.js.
 * Seluruh kartu bisa diklik untuk membuka/menutup detail (tombol aslinya ada di judul, kartu ini
 * memakai pola "stretched click target" supaya tombol "Pesan survei" tetap bisa diklik sendiri).
 */
export default function KosItem({ kos }) {
  const { id, nama, area, tipe, harga, fasilitas, verified, dicekPada, foto } = kos
  const [open, setOpen] = useState(false)
  const panelId = `detail-${id}`

  return (
    <li className={`${s.item} ${open ? s.open : ''}`}>
      <div className={s.row}>
        <div className={s.photo}>
          {foto ? <img src={foto} alt="" loading="lazy" /> : <Icon name="home" size={30} />}
        </div>

        <div className={s.info}>
          <h3 className={s.name}>
            <button
              type="button"
              className={s.toggle}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((o) => !o)}
            >
              {nama}
              <span className={s.chevron} aria-hidden="true">
                <Icon name="arrow" size={18} />
              </span>
            </button>
          </h3>
          <p className={s.meta}>
            {area}, kos {tipe.toLowerCase()}
          </p>
          <ul className={s.tags}>
            {fasilitas.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className={s.side}>
          <p className={s.price}>
            <strong>{rupiah(harga)}</strong>
            <span className={s.unit}> per bulan</span>
          </p>
          {verified ? (
            <p className={s.verified}>
              <span className={s.verifiedTitle}>
                <Icon name="check" size={16} />
                Terverifikasi
              </span>
              <span className={s.date}>Diperiksa {tanggal(dicekPada)}</span>
            </p>
          ) : (
            <>
              <p className={s.unchecked}>Belum disurvei</p>
              <OrderButton intent={{ mode: 'survei', kos: nama }} variant="secondary" size="sm" className={s.action}>
                Pesan survei
              </OrderButton>
            </>
          )}
        </div>
      </div>

      {/* Panel detail: tinggi dianimasikan lewat grid-template-rows 0fr -> 1fr. inert = tidak bisa difokus saat tertutup. */}
      <div id={panelId} className={s.panel} inert={!open}>
        <div className={s.panelInner}>
          <div className={s.panelBody}>
            <dl className={s.details}>
              <div>
                <dt>Area</dt>
                <dd>{area}</dd>
              </div>
              <div>
                <dt>Tipe</dt>
                <dd>Kos {tipe.toLowerCase()}</dd>
              </div>
              <div>
                <dt>Harga</dt>
                <dd>{rupiah(harga)} per bulan</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className={verified ? s.okText : undefined}>
                  {verified ? `Terverifikasi, ${tanggal(dicekPada, true)}` : 'Belum disurvei'}
                </dd>
              </div>
            </dl>

            <div>
              <p className={s.panelLabel}>Fasilitas</p>
              <ul className={s.facilities}>
                {FASILITAS.map((f, i) => {
                  const has = fasilitas.includes(f)
                  return (
                    <li key={f} data-has={has} style={{ '--i': i }}>
                      <Icon name={has ? 'check' : 'cross'} size={16} />
                      {f}
                      {!has && <span className="visually-hidden"> (tidak tersedia)</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
