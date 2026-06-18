'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SortifyMark from '@/components/ui/SortifyMark';
import DitherCanvas from '@/components/dither/DitherCanvas';

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

export default function LoadingScreen({ playlistId, playlistName = 'Playlist' }: LoadingScreenProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [trackName, setTrackName] = useState('—');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const wsRef = useRef<WebSocket | null>(null);

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  // Elapsed timer
  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed((Date.now() - startTime.current) / 1000);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // WebSocket connection — connect directly to the backend since Next.js rewrites can't proxy WebSocket upgrades
  const connectWs = useCallback(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const wsUrl = backendUrl.replace(/^http/, 'ws') + `/ws/sort/${playlistId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'start') {
        setTotal(data.total);
      } else if (data.type === 'progress') {
        setCurrent(data.current);
        if (data.track) {
          const parts = data.track.split(' — ');
          if (parts.length === 2) {
            setTrackArtist(parts[0]);
            setTrackName(parts[1]);
          } else {
            setTrackName(data.track);
          }
        }
        if (data.genre) setTrackGenre(data.genre);
      } else if (data.type === 'finish') {
        router.push(`/create/${playlistId}`);
      } else if (data.type === 'error') {
        router.push('/dashboard');
      }
    };

    ws.onerror = () => {
      // Fall back to demo mode on connection failure
    };

    return ws;
  }, [playlistId, router]);

  useEffect(() => {
    const ws = connectWs();
    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [connectWs]);

  // Demo simulation when no real WS connection
  useEffect(() => {
    if (total > 0) return; // real data coming in
    const DEMO_TRACKS = [
      ['Strobe', 'deadmau5', 'electronic'],
      ['Midnight City', 'M83', 'synthwave'],
      ['Teardrop', 'Massive Attack', 'trip-hop'],
      ['Paranoid Android', 'Radiohead', 'rock'],
      ['Redbone', 'Childish Gambino', 'r&b'],
      ['Time', 'Hans Zimmer', 'ambient'],
      ['Flashing Lights', 'Kanye West', 'hip-hop'],
      ['Fade Into You', 'Mazzy Star', 'indie'],
    ];
    const TOTAL = 101;
    setTotal(TOTAL);
    let i = 0;
    const tick = () => {
      if (i >= TOTAL) return;
      i++;
      setCurrent(i);
      const t = DEMO_TRACKS[i % DEMO_TRACKS.length];
      setTrackName(t[0]);
      setTrackArtist(t[1]);
      setTrackGenre(t[2]);
      setTimeout(tick, 120 + Math.random() * 300);
    };
    const timeout = setTimeout(tick, 400);
    return () => clearTimeout(timeout);
  }, [total]);

  const eta = total > 0 && current > 0 ? Math.max(0, (elapsed / current) * total - elapsed) : 0;

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
          <SortifyMark size={18} />
          <span>sortify</span>
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
            <span className="pct">{pct}%</span>
          </div>
          <div className="l-progress-track">
            <div className="bar" style={{ width: `${pct}%` }} />
            <div className="ticks">
              {Array.from({ length: 20 }).map((_, i) => <i key={i} />)}
            </div>
          </div>
        </div>
        <div className="col right">
          <span>eta</span>
          <b>~{fmt(eta)}</b>
        </div>
      </footer>
    </div>
  );
}
