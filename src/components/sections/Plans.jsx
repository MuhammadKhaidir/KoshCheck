import Section from '../ui/Section.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import Icon from '../ui/Icon.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import { plans } from '../../content/site.js'
import { rupiah } from '../../lib/format.js'
import s from './Plans.module.css'

export default function Plans() {
  const { compare } = plans
  const bars = [
    { ...compare.selfTrip, kind: 'trip' },
    ...[...plans.items].sort((a, b) => b.price - a.price).map((p) => ({ label: p.name, price: p.price, kind: 'plan' })),
  ]
  const max = Math.max(...bars.map((b) => b.price))

  return (
    <Section id="harga">
      <SectionHead title={plans.title} lede={plans.lede} />

      <div className={s.layout}>
        <figure className={s.compare}>
          <figcaption className={s.compareTitle}>{compare.title}</figcaption>
          <ul className={s.bars}>
            {bars.map((bar) => (
              <li key={bar.label}>
                <div className={s.barHead}>
                  <span>{bar.label}</span>
                  <strong>{rupiah(bar.price)}</strong>
                </div>
                <div className={s.track}>
                  <div className={s.fill} data-kind={bar.kind} style={{ width: `${(bar.price / max) * 100}%` }} />
                </div>
                {bar.detail && <p className={s.barDetail}>{bar.detail}</p>}
              </li>
            ))}
          </ul>
          <p className={s.compareNote}>{compare.note}</p>
        </figure>

        <ul className={s.plans}>
          {plans.items.map((plan) => (
            <li key={plan.id} className={s.plan} data-featured={plan.featured ? 'true' : 'false'}>
              <div>
                <h3 className={s.planName}>{plan.name}</h3>
                <p className={s.planSummary}>{plan.summary}</p>
              </div>
              <p className={s.price}>{rupiah(plan.price)}</p>
              <ul className={s.includes}>
                {plan.includes.map((line) => (
                  <li key={line}>
                    <Icon name="check" size={18} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <OrderButton
                intent={{ mode: 'survei', plan: plan.id }}
                variant={plan.featured ? 'marker' : 'secondary'}
                className={s.cta}
              >
                Pilih {plan.name}
              </OrderButton>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
