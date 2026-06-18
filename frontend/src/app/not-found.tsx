import Link from 'next/link';
import Nav from '@/components/ui/Nav';

export default function NotFound() {
  return (
    <>
      <Nav />
      <div className="page" style={{ padding: '200px 0', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(44px, 7vw, 96px)',
          fontWeight: 500,
          letterSpacing: '-0.035em',
          margin: 0,
          lineHeight: 1,
        }}>
          4<span style={{ color: 'var(--accent)' }}>0</span>4
        </h1>
        <p style={{
          color: 'var(--fg-dim)',
          fontSize: 13,
          marginTop: 24,
          maxWidth: '44ch',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}>
          {'// there is nothing there. the page you are looking for does not exist or has been moved.'}
        </p>
        <Link
          className="btn btn-solid"
          href="/"
          style={{ marginTop: 32, display: 'inline-flex' }}
        >
          <span>Back to home</span>
          <span className="arrow">→</span>
        </Link>
      </div>
    </>
  );
}
