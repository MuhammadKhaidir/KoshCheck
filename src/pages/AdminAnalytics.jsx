import { useMemo, useState } from 'react'
import s from './AdminAnalytics.module.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const CURRENT_YEAR = new Date().getFullYear()

function TrendChart({ title, items, variant }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const max = Math.max(1, ...items.map((item) => item.value))
  const left = 38
  const top = 18
  const plotWidth = 664
  const plotHeight = 166
  const baseline = top + plotHeight
  const step = plotWidth / Math.max(items.length, 1)
  const barWidth = Math.min(34, Math.max(8, step * 0.58))

  return (
    <article className={s.card}>
      <div className={s.cardHead}>
        <div>
          <h3>{title}</h3>
          <p>Jumlah data: <strong>{total.toLocaleString('id-ID')}</strong></p>
        </div>
      </div>
      <div className={s.chartWrap}>
        <svg className={s.chart} viewBox="0 0 720 232" role="img" aria-label={`Grafik ${title}`}>
          {[0, 0.5, 1].map((ratio) => {
            const y = top + plotHeight * (1 - ratio)
            const value = Math.round(max * ratio)
            return (
              <g key={ratio}>
                <line className={s.gridLine} x1={left} x2={left + plotWidth} y1={y} y2={y} />
                <text className={s.axisText} x={left - 9} y={y + 4} textAnchor="end">{value}</text>
              </g>
            )
          })}
          {items.map((item, index) => {
            const height = (item.value / max) * plotHeight
            const x = left + index * step + (step - barWidth) / 2
            const y = baseline - height
            return (
              <g key={item.label}>
                <rect className={variant === 'orders' ? s.orderBar : s.listingBar} x={x} y={y} width={barWidth} height={height} rx="4" />
                {item.value > 0 && <text className={s.barValue} x={x + barWidth / 2} y={Math.max(top + 11, y - 7)} textAnchor="middle">{item.value}</text>}
                <text className={s.axisText} x={x + barWidth / 2} y={baseline + 22} textAnchor="middle">{item.label}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </article>
  )
}

export default function AdminAnalytics({ analytics }) {
  const [mode, setMode] = useState('monthly')
  const [year, setYear] = useState(CURRENT_YEAR)
  const orders = analytics?.orders ?? []
  const listings = analytics?.listings ?? []

  const years = useMemo(() => {
    const found = new Set([...orders, ...listings].map((item) => Number(item.year)).filter(Number.isFinite))
    found.add(CURRENT_YEAR)
    return [...found].sort((a, b) => b - a)
  }, [orders, listings])

  const makeItems = (rows) => {
    if (mode === 'monthly') {
      return MONTHS.map((label, index) => ({
        label,
        value: rows.filter((item) => Number(item.year) === Number(year) && Number(item.month) === index + 1)
          .reduce((sum, item) => sum + Number(item.total || 0), 0),
      }))
    }
    return [...years].sort((a, b) => a - b).map((targetYear) => ({
      label: String(targetYear),
      value: rows.filter((item) => Number(item.year) === targetYear)
        .reduce((sum, item) => sum + Number(item.total || 0), 0),
    }))
  }

  const orderItems = useMemo(() => makeItems(orders), [orders, mode, year, years])
  const listingItems = useMemo(() => makeItems(listings), [listings, mode, year, years])

  return (
    <section className={s.section} aria-labelledby="admin-analytics">
      <div className={s.head}>
        <div>
          <p className={s.eyebrow}>STATISTIK</p>
          <h2 id="admin-analytics">Aktivitas KOSCHECK</h2>
          <p className={s.description}>Tren pemesanan survei dan pendaftaran kos berdasarkan waktu data masuk.</p>
        </div>
        <div className={s.controls}>
          <div className={s.mode} role="group" aria-label="Periode grafik">
            <button type="button" aria-pressed={mode === 'monthly'} onClick={() => setMode('monthly')}>Per bulan</button>
            <button type="button" aria-pressed={mode === 'yearly'} onClick={() => setMode('yearly')}>Per tahun</button>
          </div>
          {mode === 'monthly' && (
            <label className={s.yearSelect}>
              <span>Tahun</span>
              <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                {years.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>
      <div className={s.grid}>
        <TrendChart title="Pemesanan survei" items={orderItems} variant="orders" />
        <TrendChart title="Listing kos" items={listingItems} variant="listings" />
      </div>
    </section>
  )
}
