import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import Icon from '../ui/Icon.jsx'
import { problems } from '../../content/site.js'
import s from './Problems.module.css'

export default function Problems() {
  return (
    <Section id="masalah">
      <SectionHead title={problems.title} lede={problems.lede} />
      <ul className={s.list}>
        {problems.items.map((item) => (
          <li key={item.worry} className={s.row}>
            <p className={s.worry}>{item.worry}</p>
            <p className={s.answer}>
              <span className={s.tick}>
                <Icon name="check" size={16} />
              </span>
              <span>{item.answer}</span>
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
