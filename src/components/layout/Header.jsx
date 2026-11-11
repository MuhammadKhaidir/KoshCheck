import { useEffect, useState } from 'react'
import Container from '../ui/Container.jsx'
import Logo from '../ui/Logo.jsx'
import Icon from '../ui/Icon.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import { headerNav } from '../../content/site.js'
import s from './Header.module.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#top')
  const close = () => setOpen(false)

  /* Tandai menu sesuai bagian halaman yang sedang dibaca. Di paling atas = Beranda. */
  useEffect(() => {
    const targets = headerNav
      .filter((item) => item.href !== '#top')
      .map((item) => document.querySelector(item.href))
      .filter(Boolean)
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.35
      let current = '#top'
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= line) current = `#${el.id}`
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className={s.header}>
      <Container className={s.bar}>
        <a href="#top" className={s.brand} aria-label="KOSCHECK, kembali ke atas" onClick={close}>
          <Logo />
        </a>

        <nav id="menu-utama" className={`${s.nav} ${open ? s.open : ''}`} aria-label="Navigasi utama">
          <ul className={s.list}>
            {headerNav.map((item) => (
              <li key={item.href}>
                <a
                  className={s.link}
                  href={item.href}
                  aria-current={active === item.href ? 'location' : undefined}
                  onClick={close}
                >
                  {item.icon && <Icon name={item.icon} size={18} />}
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
            <Icon name="bars" size={16} />
            Pesan survei
            <Icon name="arrow" size={16} />
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
