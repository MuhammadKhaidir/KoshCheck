import { useState } from 'react'
import Container from '../ui/Container.jsx'
import Logo from '../ui/Logo.jsx'
import Icon from '../ui/Icon.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import { nav } from '../../content/site.js'
import s from './Header.module.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className={s.header}>
      <Container className={s.bar}>
        <a href="#top" className={s.brand} aria-label="KOSCHECK, kembali ke atas" onClick={close}>
          <Logo />
        </a>

        <nav id="menu-utama" className={`${s.nav} ${open ? s.open : ''}`} aria-label="Navigasi utama">
          <ul className={s.list}>
            {nav.map((item) => (
              <li key={item.href}>
                <a className={s.link} href={item.href} onClick={close}>
                  {item.label}
                </a>
              </li>
            ))}
            <li className={s.mobileCta}>
              <OrderButton intent={{ mode: 'survei' }} onClick={close}>
                Pesan survei
              </OrderButton>
            </li>
          </ul>
        </nav>

        <div className={s.actions}>
          <OrderButton intent={{ mode: 'survei' }} size="sm" className={s.cta} onClick={close}>
            Pesan survei
          </OrderButton>
          <button
            type="button"
            className={s.toggle}
            aria-expanded={open}
            aria-controls="menu-utama"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} />
            <span className="visually-hidden">{open ? 'Tutup menu' : 'Buka menu'}</span>
          </button>
        </div>
      </Container>
    </header>
  )
}
