'use client';

import Link from 'next/link';
import { useT } from '@/lib/translations';
import { useLangPath } from '@/lib/useLocale';

export default function Footer() {
  const t = useT();
  const lp = useLangPath();

  return (
    <footer className="footer">
      <div className="page">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-brand">
              sortify
            </div>
            <p>{t.footer_tagline}</p>
          </div>

          <div>
            <h5>{t.footer_source}</h5>
            <ul>
              <li><Link href="https://github.com/SimonBandiera/Sortify">Github ↗</Link></li>
              <li><span>{t.footer_license}</span></li>
            </ul>
          </div>

          <div className="footer-authors">
            <h5>{t.footer_crafted_by}</h5>
            <div className="footer-author-cards">
              <a href="https://hgalan.dev" className="footer-author">
                <span className="footer-author-name">Hugo Galan</span>
                <span className="footer-author-link">hgalan.dev ↗</span>
              </a>
              <a href="https://sbandiera.dev" className="footer-author">
                <span className="footer-author-name">Simon Bandiera</span>
                <span className="footer-author-link">sbandiera.dev ↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t.footer_bottom}</span>
          <span>{t.footer_disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
