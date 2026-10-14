import { useId, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import Stamp from '../ui/Stamp.jsx'
import { reports } from '../../data/reports.js'
import { tanggal } from '../../lib/format.js'
import s from './SurveyReport.module.css'

const STATUS = {
  ok: { label: 'Sesuai', icon: 'check' },
  warn: { label: 'Beda dari iklan', icon: 'alert' },
  bad: { label: 'Tidak sesuai', icon: 'cross' },
}

/** Lembar laporan survei contoh: membandingkan isi iklan dengan hasil pemeriksaan. */
export default function SurveyReport() {
  const uid = useId().replace(/:/g, '')
  const [activeId, setActiveId] = useState(reports[0].id)
  const tabRefs = useRef([])

  const report = reports.find((r) => r.id === activeId)
  const counts = report.items.reduce(
    (acc, item) => ({ ...acc, [item.status]: acc[item.status] + 1 }),
    { ok: 0, warn: 0, bad: 0 },
  )

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const current = reports.findIndex((r) => r.id === activeId)
    const step = event.key === 'ArrowRight' ? 1 : -1
    const next = (current + step + reports.length) % reports.length
    setActiveId(reports[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <figure className={s.wrap}>
      <div className={s.tabs} role="tablist" aria-label="Pilih contoh laporan" onKeyDown={onKeyDown}>
        {reports.map((r, i) => (
          <button
            key={r.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${r.id}`}
            aria-selected={r.id === activeId}
            aria-controls={`${uid}-panel`}
            tabIndex={r.id === activeId ? 0 : -1}
            className={s.tab}
            onClick={() => setActiveId(r.id)}
          >
            {r.tab}
          </button>
        ))}
      </div>

      <div
        className={s.sheet}
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${report.id}`}
      >
        <div className={s.head}>
          <div>
            <h2 className={s.title}>{report.title}</h2>
            <p className={s.meta}>{report.area}</p>
          </div>
          <div className={s.docInfo}>
            <p className={s.docLabel}>Laporan survei</p>
            <p className={s.meta}>Diperiksa {tanggal(report.checkedAt, true)}</p>
          </div>
        </div>

        <table className={s.table}>
          <caption className="visually-hidden">Perbandingan isi iklan dengan hasil survei</caption>
          <thead>
            <tr>
              <th scope="col">Diperiksa</th>
              <th scope="col">Kata iklan</th>
              <th scope="col">Hasil survei</th>
              <th scope="col">
                <span className="visually-hidden">Status</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {report.items.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td data-label="Kata iklan">{item.claim}</td>
                <td data-label="Hasil survei" className={s.found} data-status={item.status}>
                  {item.found}
                </td>
                <td>
                  <span className={`${s.statusIcon} ${s[item.status]}`}>
                    <Icon name={STATUS[item.status].icon} size={14} />
                    <span className="visually-hidden">{STATUS[item.status].label}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.foot}>
          <p className={s.summary}>
            {counts.ok} sesuai, {counts.warn} beda, {counts.bad} tidak sesuai
          </p>
          <p className={s.note}>{report.note}</p>
        </div>

        <Stamp variant={report.verdict} className={s.stamp} />
      </div>

      <figcaption className={s.caption}>Contoh ilustrasi. Kos dan datanya fiktif.</figcaption>
    </figure>
  )
}
