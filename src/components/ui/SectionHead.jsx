import s from './SectionHead.module.css'

export default function SectionHead({ title, lede }) {
  return (
    <header className={s.head}>
      <h2 className={s.title}>{title}</h2>
      {lede && <p className={s.lede}>{lede}</p>}
    </header>
  )
}
