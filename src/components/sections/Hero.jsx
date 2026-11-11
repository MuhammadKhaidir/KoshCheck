import Container from '../ui/Container.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import SurveyReport from './SurveyReport.jsx'
import { hero } from '../../content/site.js'
import s from './Hero.module.css'

export default function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      {/* Hiasan ombak hijau tua di kiri bawah */}
      <svg className={s.wave} viewBox="0 0 480 120" preserveAspectRatio="none" aria-hidden="true">
        <path className={s.waveFill} d="M0 30C110 52 230 104 480 120H0z" />
        <path className={s.waveLine} d="M0 14C120 38 250 94 480 114" />
      </svg>

      <Container className={s.grid}>
        <div className={s.copy}>
          <p className={s.badge}>
            <Icon name="star" size={18} className={s.badgeIcon} />
            {hero.badge}
          </p>
          <h1 id="hero-title" className={s.title}>
            <span className={s.line}>Cek dulu,</span>{' '}
            <span className={s.line}>
              <svg className={s.box} viewBox="0 0 64 64" aria-hidden="true">
                <rect className={s.boxFrame} x="4" y="4" width="56" height="56" rx="11" />
                <path className={s.tick} pathLength="1" d="M17 34 28 45 49 20" />
              </svg>
              baru{' '}
              <span className={s.emph}>
                yakin
                <svg className={s.swoosh} viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 11C45 3 105 3 150 8s40 3 47-3" />
                </svg>
              </span>
              .
            </span>
          </h1>
          <p className={s.lede}>{hero.lede}</p>
          <div className={s.actions}>
            <OrderButton intent={{ mode: 'survei' }}>
              <Icon name="play" size={16} filled />
              {hero.primaryCta}
            </OrderButton>
            <Button href="#katalog" variant="secondary">
              <Icon name="gift" size={18} />
              {hero.secondaryCta}
            </Button>
          </div>
          <ul className={s.features}>
            {hero.features.map((feature) => (
              <li key={feature.text} className={s.feature}>
                <Icon name={feature.icon} size={30} className={s.featureIcon} />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
          <p className={s.note}>{hero.note}</p>
        </div>

        <SurveyReport />
      </Container>
    </section>
  )
}
