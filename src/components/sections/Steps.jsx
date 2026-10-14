import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import { steps } from '../../content/site.js'
import s from './Steps.module.css'

export default function Steps() {
  return (
    <Section id="cara-kerja" tone="sunk">
      <SectionHead title={steps.title} />
      <ol className={s.list}>
        {steps.items.map((step, i) => (
          <li key={step.title} className={s.step}>
            <span className={s.num} aria-hidden="true">
              {i + 1}
            </span>
            <h3 className={s.title}>{step.title}</h3>
            <p className={s.body}>{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
