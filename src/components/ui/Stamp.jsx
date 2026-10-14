import { useId } from 'react'
import s from './Stamp.module.css'

const VARIANTS = {
  verified: { text: 'KOS TERVERIFIKASI • KOSCHECK •', label: 'Kos Terverifikasi', glyph: 'M42 62l12 12 25-28' },
  rejected: { text: 'BELUM LOLOS • KOSCHECK •', label: 'Belum lolos verifikasi', glyph: 'M44 44l32 32M76 44 44 76' },
}

/** Stempel bulat. variant: 'verified' | 'rejected'. Atur posisi lewat className dari pemakai. */
export default function Stamp({ variant = 'verified', className = '' }) {
  const id = `ring-${useId().replace(/:/g, '')}`
  const v = VARIANTS[variant] ?? VARIANTS.verified

  return (
    <svg
      className={`${s.stamp} ${s[variant]} ${className}`}
      viewBox="0 0 120 120"
      role="img"
      aria-label={v.label}
    >
      <defs>
        <path id={id} d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="2" />
      <text className={s.text} fill="currentColor" fontSize="10.5">
        <textPath href={`#${id}`} textLength="266" lengthAdjust="spacing">
          {v.text}
        </textPath>
      </text>
      <path d={v.glyph} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
