import { brand, nav, hero } from '../data/content';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <a href="#" className="brand" aria-label={brand.name}>
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="var(--river)" />
            <path d="M7 14.5l4.5 4.5L21 9.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {brand.name}
        </a>
        <nav className="nav__links" aria-label="Navigasi utama">
          {nav.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <a className="btn btn--primary btn--sm" href={hero.primary.href}>{hero.primary.label}</a>
      </div>
    </header>
  );
}
