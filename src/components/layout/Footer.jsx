import Container from '../ui/Container.jsx'
import Logo from '../ui/Logo.jsx'
import { brand, nav, disclaimer } from '../../content/site.js'
import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={s.footer}>
      <Container>
        <div className={s.top}>
          <div className={s.about}>
            <Logo onDark />
            <p className={s.tagline}>{brand.tagline}</p>
            <p className={s.area}>
              Platform pencarian dan verifikasi kos di {brand.city}, {brand.region}.
            </p>
          </div>
          <nav aria-label="Navigasi footer">
            <ul className={s.links}>
              {nav.map((item) => (
                <li key={item.href}>
                  <a className={s.link} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={s.bottom}>
          <p>{disclaimer}</p>
          <p>© {new Date().getFullYear()} {brand.name}</p>
        </div>
      </Container>
    </footer>
  )
}
