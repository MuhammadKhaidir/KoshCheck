import { steps } from '../data/content';

export default function Steps() {
  return (
    <section id="cara-kerja" className="section section--dark">
      <div className="wrap">
        <h2 className="section__title">{steps.title}</h2>
        <ol className="steps">
          {steps.items.map((s) => (
            <li key={s.title} className="step">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
