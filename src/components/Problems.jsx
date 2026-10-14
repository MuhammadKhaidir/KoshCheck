import { problems } from '../data/content';

export default function Problems() {
  return (
    <section id="masalah" className="section">
      <div className="wrap">
        <h2 className="section__title">{problems.title}</h2>
        <div className="problems">
          {problems.items.map((p) => (
            <article key={p.title} className="problem">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
