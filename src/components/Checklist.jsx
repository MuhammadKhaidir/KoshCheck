import { useState } from 'react';
import { checklist } from '../data/content';

export default function Checklist() {
  const [checked, setChecked] = useState([]);
  const total = checklist.items.length;
  const done = checked.length === total;

  const toggle = (i) =>
    setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  return (
    <section className="checklist" aria-labelledby="cl-title">
      <div className={`stamp${done ? ' is-on' : ''}`} aria-hidden="true">{checklist.stamp}</div>
      <div className="checklist__head">
        <h2 id="cl-title">{checklist.title}</h2>
        <span className="checklist__count">{checked.length}/{total}</span>
      </div>
      <div className="checklist__bar" aria-hidden="true">
        <span style={{ width: `${(checked.length / total) * 100}%` }} />
      </div>
      <ul>
        {checklist.items.map((item, i) => (
          <li key={item}>
            <label>
              <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} />
              <span className="box" aria-hidden="true" />
              <span className="label">{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="checklist__status" role="status">
        {done ? checklist.doneText : checklist.hint}
      </p>
    </section>
  );
}
