'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import DitherCanvas from '@/components/dither/DitherCanvas';

interface DoneScreenProps {
  playlistId: string;
}

export default function DoneScreen({ playlistId }: DoneScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') router.push('/dashboard');
      if (e.key.toLowerCase() === 'r') router.push('/dashboard');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [router]);

  return (
    <>
      <Nav variant="step" stepLabel="done" />
      <div className="done-wrap">
        <span className="d-corner tl" /><span className="d-corner tr" />
        <span className="d-corner bl" /><span className="d-corner br" />

        <header className="d-head">
          <div className="col">
            <span>process</span>
            <b>sortify::write</b>
          </div>
          <div className="center">
            <span>exit code</span>
            <span className="status">0 · success</span>
          </div>
          <div className="col right">
            <span>duration</span>
            <b>00:04.82</b>
          </div>
        </header>

        <main className="d-main">
          {/* LEFT */}
          <div className="d-side">
            <div className="d-side-inner">
              <div className="d-phase">Complete</div>
              <h1 className="d-title">
                {"It's"}<br />
                <span className="lo">done.</span>
              </h1>
              <p className="d-sub">
                {'// your new playlist has been written to your spotify.'}<br />
                <span className="mute">source untouched · 3 tracks skipped (no genre data)</span>
              </p>
              <div className="d-kvs">
                <div className="d-kv"><span className="k">Tracks</span><span className="v">87</span></div>
                <div className="d-kv"><span className="k">Genres</span><span className="v">4</span></div>
                <div className="d-kv"><span className="k">Runtime</span><span className="v">5h 04m</span></div>
                <div className="d-kv"><span className="k">Written</span><span className="v">04:82s</span></div>
              </div>
              <div className="d-chips">
                <span className="c">electronic</span>
                <span className="c">house</span>
                <span className="c">synthwave</span>
                <span className="c">techno</span>
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="d-card-wrap">
            <div className="d-card-halo">
              <DitherCanvas animated animType="halo" style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="d-card">
              <div className="d-cover">
                <DitherCanvas animated animType="doneCover" style={{ width: '100%', height: '100%', display: 'block' }} />
                <span className="d-cover-tag">Sortify</span>
                <span className="d-cover-id">#00041</span>
              </div>
              <div className="d-card-meta">
                <div className="d-card-name">electronic + house +2</div>
                <div className="d-card-sub"><b>87</b><br />tracks</div>
              </div>
              <div className="d-card-foot">
                <span>user · just now</span>
                <a className="open" href="#" target="_blank" rel="noopener noreferrer">
                  <span>Open in Spotify</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="d-side right d-side-right">
            <div className="d-side-inner">
              <div className="d-phase">Next</div>
              <p className="d-sub">
                {'// do it again with a different source, or head back to the dashboard to review all your playlists.'}
              </p>
              <div className="d-actions">
                <Link className="btn btn-solid" href="/dashboard">
                  <span>Return to dashboard</span><span className="arrow">→</span>
                </Link>
                <Link className="btn" href="/dashboard">
                  <span>Sort another playlist</span><span className="arrow">↻</span>
                </Link>
                <a className="btn" href="#" style={{ borderColor: 'var(--border)' }}>
                  <span>Share sortify</span><span className="arrow">↗</span>
                </a>
              </div>
            </div>
          </div>
        </main>

        <footer className="d-foot">
          <div className="col"><span>written to</span> · <b>Spotify / user</b></div>
          <div className="tip">tip · press <b>D</b> for dashboard · <b>R</b> to run again</div>
          <div className="col right">sortify · v2.4 · build 04.18.26</div>
        </footer>
      </div>
    </>
  );
}
