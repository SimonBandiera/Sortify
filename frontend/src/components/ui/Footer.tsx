import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-brand">
              sortify
            </div>
            <p>
              A small utility for people with too much music and not enough
              patience.
            </p>
          </div>

          <div>
            <h5>Source</h5>
            <ul>
              <li><Link href="https://github.com/SimonBandiera/Sortify">Github ↗</Link></li>
              <li><span>License · MIT</span></li>
            </ul>
          </div>

          <div className="footer-authors">
            <h5>Crafted by</h5>
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
          <span>© 2022–2026 sortify · made in FR</span>
          <span>not affiliated with Spotify AB.</span>
        </div>
      </div>
    </footer>
  );
}
