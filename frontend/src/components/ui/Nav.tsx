import Link from 'next/link';
import SortifyMark from './SortifyMark';

interface NavProps {
  variant?: 'landing' | 'dashboard' | 'step';
  stepLabel?: string;
  userName?: string;
}

export default function Nav({ variant = 'landing', stepLabel, userName }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <SortifyMark />
          <span>sortify</span>
          <span className="mute tiny" style={{ marginLeft: 6 }}>v2.4</span>
        </Link>

        {variant === 'landing' && (
          <>
            <div className="nav-links">
              <a href="#how">How</a>
              <a href="#demo">Demo</a>
              <a href="#genres">Genres</a>
              <a href="#faq">Faq</a>
              <a href="#github">Github</a>
            </div>
            <Link className="btn btn-solid" href="#connect">
              <span>Connect Spotify</span>
              <span className="arrow">→</span>
            </Link>
          </>
        )}

        {variant === 'dashboard' && userName && (
          <div className="dash-user">
            <div className="who">
              <span>connected as</span>
              <b>{userName}</b>
            </div>
            <a href="/auth/logout" className="dash-logout" aria-label="Logout">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M10 3 H13 V13 H10" />
                <path d="M2 8 H11 M8 5 L11 8 L8 11" />
              </svg>
            </a>
          </div>
        )}

        {variant === 'step' && stepLabel && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em',
            color: 'var(--fg-mute)'
          }}>
            <span>step</span>
            <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{stepLabel}</span>
          </div>
        )}
      </div>
    </nav>
  );
}
