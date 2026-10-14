import Section from '../ui/Section.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import { owners } from '../../content/site.js'
import s from './Owners.module.css'

export default function Owners() {
  return (
    <Section id="pemilik" tone="ink">
      <div className={s.grid}>
        <div>
          <h2 className={s.statement}>{owners.statement}</h2>
          <p className={s.body}>{owners.body}</p>
          <div className={s.actions}>
            <OrderButton intent={{ mode: 'pemilik' }} variant="marker">
              {owners.cta}
            </OrderButton>
          </div>
          <p className={s.reassure}>{owners.reassurance}</p>
        </div>

        <dl className={s.offers}>
          {owners.offers.map((offer) => (
            <div key={offer.title} className={s.offer}>
              <dt className={s.offerTitle}>{offer.title}</dt>
              <dd className={s.offerBody}>{offer.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}
