import Container from '../ui/Container.jsx'
import Button from '../ui/Button.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import SurveyReport from './SurveyReport.jsx'
import { hero } from '../../content/site.js'
import s from './Hero.module.css'

export default function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <Container className={s.grid}>
        <div className={s.copy}>
          <h1 id="hero-title" className={s.title}>
            <span className={s.line}>Cek dulu,</span>{' '}
            <span className={s.line}>
              <svg className={s.box} viewBox="0 0 64 64" aria-hidden="true">
                <rect className={s.boxFrame} x="4" y="4" width="56" height="56" rx="11" />
                <path className={s.tick} pathLength="1" d="M17 34 28 45 49 20" />
              </svg>
              baru yakin.
            </span>
          </h1>
          <p className={s.lede}>{hero.lede}</p>
          <div className={s.actions}>
            <OrderButton intent={{ mode: 'survei' }}>{hero.primaryCta}</OrderButton>
            <Button href="#katalog" variant="secondary">
              {hero.secondaryCta}
            </Button>
          </div>
          <p className={s.note}>{hero.note}</p>
        </div>

        <SurveyReport />
      </Container>
    </section>
  )
}
