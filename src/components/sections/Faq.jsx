import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import { faq } from '../../content/site.js'
import s from './Faq.module.css'

export default function Faq() {
  return (
    <Section id="faq">
      <div className={s.grid}>
        <SectionHead title={faq.title} />
        <div className={s.list}>
          {faq.items.map((item) => (
            <details key={item.q} className={s.item}>
              <summary className={s.summary}>{item.q}</summary>
              <p className={s.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
