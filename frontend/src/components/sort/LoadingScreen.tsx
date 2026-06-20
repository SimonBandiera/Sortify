'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DitherCanvas from '@/components/dither/DitherCanvas';
import PixelProgressBar from './PixelProgressBar';

const PHASES = ['Fetching tracks', 'Analysing', 'Deduplicating genres', 'Sorting buckets', 'Finalising'];

function getPhase(pct: number) {
  if (pct < 15) return PHASES[0];
  if (pct < 70) return PHASES[1];
  if (pct < 85) return PHASES[2];
  if (pct < 97) return PHASES[3];
  return PHASES[4];
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}

interface LoadingScreenProps {
  playlistId: string;
  playlistName?: string;
}

export default function LoadingScreen({ playlistId, playlistName: propName }: LoadingScreenProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [trackName, setTrackName] = useState('—');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const [error, setError] = useState<string | null>(null);
  const smoothedEta = useRef(0);

  const playlistName = propName ?? (() => { try { return sessionStorage.getItem('sortify_sort_name') ?? 'Playlist'; } catch { return 'Playlist'; } })();

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  // Elapsed timer
  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed((Date.now() - startTime.current) / 1000);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let active = true;

    async function poll() {
      while (active) {
        try {
          const res = await fetch(`/api/sort/${playlistId}/status`);
          if (!res.ok) {
            setError('Could not connect to the sorting service.');
            return;
          }
          const data = await res.json();
          if (data.total > 0) setTotal(data.total);
          if (data.current >= 0) setCurrent(data.current);
          if (data.track) {
            const parts = (data.track as string).split(' — ');
            if (parts.length === 2) { setTrackArtist(parts[0]); setTrackName(parts[1]); }
            else setTrackName(data.track);
          }
          if (data.genre) setTrackGenre(data.genre);
          if (data.done) { router.push(`/create/${playlistId}`); return; }
          if (data.error) { router.push('/dashboard'); return; }
        } catch {
          setError('Could not connect to the sorting service.');
          return;
        }
        await new Promise<void>(r => setTimeout(r, 800));
      }
    }

    poll();
    return () => { active = false; };
  }, [playlistId, router]);

  const rawEta = total > 0 && current > 0 ? Math.max(0, (elapsed / current) * total - elapsed) : 0;
  if (current > 0) {
    smoothedEta.current = smoothedEta.current === 0
      ? rawEta
      : 0.1 * rawEta + 0.9 * smoothedEta.current;
  }
  const eta = smoothedEta.current;

  if (error) {
    return (
      <div className="loader">
        <span className="l-corner tl" />
        <span className="l-corner tr" />
        <span className="l-corner bl" />
        <span className="l-corner br" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: 'var(--fg-mute)', fontSize: 13 }}>
          <span>{error}</span>
          <button className="btn" style={{ padding: '8px 16px', fontSize: 11 }} onClick={() => router.push('/dashboard')}>
            <span>Back to dashboard</span><span className="arrow">←</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loader">
      <span className="l-corner tl" />
      <span className="l-corner tr" />
      <span className="l-corner bl" />
      <span className="l-corner br" />

      <header className="l-head">
        <div className="col">
          <span>process</span>
          <b>sortify::analyse</b>
        </div>
        <div className="l-brand">
          sortify
        </div>
        <div className="col right">
          <span>source</span>
          <b>{playlistName}</b>
        </div>
      </header>

      <section className="l-stage">
        <div className="l-center">
          <div className="l-phase">{getPhase(pct)}</div>
          <h1 className="l-title">Loa<span className="lo">ding</span><span className="cur" /></h1>
          <p className="l-sub">
            {'// fetching the genres of your music, hold tight.'}<br />
            <span className="mute">up to 500ms per track · no data leaves this worker</span>
          </p>

          <div className="l-ticker">
            <span className="l-tag">now</span>
            <div className="l-current">
              <b>{trackName}</b>{trackArtist && <span> — {trackArtist}</span>}
              {trackGenre && <span className="g" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--fg-mute)', marginLeft: 10 }}>{trackGenre}</span>}
            </div>
            <span className="l-idx"><b>{current}</b>/{total}</span>
          </div>
        </div>

        <div className="l-stage-canvas-wrap">
          <DitherCanvas
            animated
            animType="orb"
            className="l-canvas"
          />
        </div>
      </section>

      <footer className="l-foot">
        <div className="col">
          <span>elapsed</span>
          <b>{fmt(elapsed)}</b>
        </div>
        <div className="col l-progress">
          <div className="l-progress-label">
            <span>progress</span>
            <span className="pct-small">{pct}%</span>
          </div>
          <PixelProgressBar pct={pct} />
        </div>
        <div className="col right">
          <span>eta</span>
          <b>~{fmt(eta)}</b>
        </div>
      </footer>
    </div>
  );
}
