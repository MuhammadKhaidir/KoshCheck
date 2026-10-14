import { hero } from '../data/content';
import Checklist from './Checklist.jsx';

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero__grid">
        <div>
          <h1>{hero.title}</h1>
          <p className="hero__text">{hero.text}</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href={hero.primary.href}>{hero.primary.label}</a>
            <a className="btn btn--ghost" href={hero.secondary.href}>{hero.secondary.label}</a>
          </div>
        </div>
        <Checklist />
      </div>
    </section>
  );
}
