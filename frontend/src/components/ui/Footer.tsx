import Link from 'next/link';
import SortifyMark from './SortifyMark';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-brand">
              <SortifyMark />
              <span>sortify</span>
            </div>
            <p>
              A small utility for people with too much music and not enough
              patience. Built and maintained by two humans, in their spare time.
            </p>
          </div>

          <div>
            <h5>Product</h5>
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#genres">Genres</a></li>
              <li><a href="#faq">Faq</a></li>
            </ul>
          </div>

          <div>
            <h5>Source</h5>
            <ul>
              <li><Link href="https://github.com/SimonBandiera/Sortify">Github</Link></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Self-host</a></li>
              <li><a href="#">License · MIT</a></li>
            </ul>
          </div>

          <div>
            <h5>Crafted by</h5>
            <ul>
              <li><Link href="https://hgalan.dev">Hugo Galan ↗</Link></li>
              <li><Link href="https://sbandiera.dev">Simon Bandiera ↗</Link></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2022–2026 sortify.fr · made in FR</span>
          <span>not affiliated with Spotify AB.</span>
        </div>
      </div>
    </footer>
  );
}
