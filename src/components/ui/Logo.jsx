import s from './Logo.module.css'

export default function Logo({ onDark = false }) {
  return (
    <span className={`${s.logo} ${onDark ? s.onDark : ''}`}>
      <svg className={s.mark} viewBox="0 0 32 32" aria-hidden="true">
        <rect className={s.markBg} width="32" height="32" rx="7" />
        <path className={s.markFg} d="M8 15 16 8l8 7v9H8z" />
        <path className={s.markFg} d="m12.5 18.5 2.6 2.6 5-5.2" />
      </svg>
      <span className={s.word}>KOSCHECK</span>
    </span>
  )
}
