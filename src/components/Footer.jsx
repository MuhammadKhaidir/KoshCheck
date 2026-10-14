import { brand, footer } from '../data/content';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <strong>{brand.name}</strong>
        <span>{footer.note}</span>
      </div>
    </footer>
  );
}
