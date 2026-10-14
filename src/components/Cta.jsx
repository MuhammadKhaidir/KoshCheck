import { cta } from '../data/content';

export default function Cta() {
  return (
    <section id="mulai" className="section cta">
      <div className="wrap">
        <h2 className="section__title">{cta.title}</h2>
        <p className="cta__text">{cta.text}</p>
        <a className="btn btn--primary" href={cta.button.href}>{cta.button.label}</a>
      </div>
    </section>
  );
}
