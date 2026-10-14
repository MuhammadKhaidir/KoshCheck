import Container from './Container.jsx'
import s from './Section.module.css'

/**
 * Pembungkus section dengan padding vertikal dan warna latar seragam.
 * tone: 'paper' (terang) | 'sunk' (terang, sedikit lebih gelap) | 'ink' (gelap)
 */
export default function Section({ id, tone = 'paper', children }) {
  return (
    <section id={id} className={`${s.section} ${s[tone]}`}>
      <Container>{children}</Container>
    </section>
  )
}
