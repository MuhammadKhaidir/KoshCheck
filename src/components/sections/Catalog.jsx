import { useMemo, useState } from 'react'
import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import Button from '../ui/Button.jsx'
import KosItem from './KosItem.jsx'
import { catalog } from '../../content/site.js'
import { kos, FASILITAS, HARGA_MIN, HARGA_MAX, HARGA_STEP } from '../../data/kos.js'
import { rupiah } from '../../lib/format.js'
import s from './Catalog.module.css'

/** Katalog dengan filter harga, fasilitas, dan status verifikasi. Data dari src/data/kos.js. */
export default function Catalog() {
  const [maxPrice, setMaxPrice] = useState(HARGA_MAX)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [picked, setPicked] = useState([])

  const togglePick = (name) =>
    setPicked((current) => (current.includes(name) ? current.filter((f) => f !== name) : [...current, name]))

  const reset = () => {
    setMaxPrice(HARGA_MAX)
    setOnlyVerified(false)
    setPicked([])
  }

  const results = useMemo(
    () =>
      kos.filter(
        (k) =>
          k.harga <= maxPrice &&
          (!onlyVerified || k.verified) &&
          picked.every((f) => k.fasilitas.includes(f)),
      ),
    [maxPrice, onlyVerified, picked],
  )

  return (
    <Section id="katalog" tone="sunk">
      <SectionHead title={catalog.title} lede={catalog.lede} />

      <div className={s.toolbar} role="group" aria-label="Saring katalog">
        <div className={s.field}>
          <label className={s.label} htmlFor="harga-maks">
            Harga maksimal per bulan
          </label>
          <div className={s.rangeRow}>
            <input
              id="harga-maks"
              className={s.range}
              type="range"
              min={HARGA_MIN}
              max={HARGA_MAX}
              step={HARGA_STEP}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <output className={s.rangeValue} htmlFor="harga-maks">
              {rupiah(maxPrice)}
            </output>
          </div>
        </div>

        <div className={s.field}>
          <span className={s.label} id="label-fasilitas">
            Fasilitas
          </span>
          <div className={s.chips} role="group" aria-labelledby="label-fasilitas">
            {FASILITAS.map((name) => (
              <button
                key={name}
                type="button"
                className={s.chip}
                aria-pressed={picked.includes(name)}
                onClick={() => togglePick(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <label className={s.check}>
          <input type="checkbox" checked={onlyVerified} onChange={(e) => setOnlyVerified(e.target.checked)} />
          <span>Hanya yang terverifikasi</span>
        </label>
      </div>

      <p className={s.count} role="status">
        {results.length} kos ditemukan
      </p>

      {results.length > 0 ? (
        <ul className={s.list}>
          {results.map((k) => (
            <KosItem key={k.id} kos={k} />
          ))}
        </ul>
      ) : (
        <div className={s.empty}>
          <p>Belum ada kos yang cocok. Naikkan batas harga atau lepas salah satu filter.</p>
          <Button as="button" variant="secondary" size="sm" onClick={reset}>
            Atur ulang filter
          </Button>
        </div>
      )}

      <p className={s.sample}>{catalog.sampleNote}</p>
    </Section>
  )
}
