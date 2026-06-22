'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/ui/Nav';
import DitherCanvas from '@/components/dither/DitherCanvas';
import { useT } from '@/lib/translations';
import { useLangPath } from '@/lib/useLocale';

interface DoneScreenProps {
  playlistId: string;
}

interface DoneData {
  spotifyUrl: string;
  name: string;
  genres: string[];
  tracks: number;
  tracksAdded: number;
  durationMs?: number;
  ownerName?: string;
}

export default function DoneScreen({ playlistId }: DoneScreenProps) {
  const router = useRouter();
  const t = useT();
  const lp = useLangPath();
  const [data, setData] = useState<DoneData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sortify_done');
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const trackCount = data?.tracksAdded ?? data?.tracks ?? 0;
  const genreCount = data?.genres?.length ?? 0;
  const mins = Math.floor(trackCount * 3.5);
  const runtime = (mins >= 60 ? Math.floor(mins / 60) + 'h ' : '') + String(mins % 60).padStart(2, '0') + 'm';
  const cardName = data?.genres && data.genres.length > 2
    ? data.genres.slice(0, 2).join(' + ') + ' +' + (data.genres.length - 2)
    : data?.genres?.join(' + ') ?? '—';
  const duration = data?.durationMs != null
    ? `${String(Math.floor(data.durationMs / 60000)).padStart(2, '0')}:${String(Math.floor((data.durationMs % 60000) / 1000)).padStart(2, '0')}.${String(Math.floor((data.durationMs % 1000) / 10)).padStart(2, '0')}`
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') router.push(lp('/dashboard'));
      if (e.key.toLowerCase() === 'r') router.push(lp('/dashboard'));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [router, lp]);

  return (
    <>
      <Nav variant="step" stepLabel="done" />
      <div className="done-wrap">
        <span className="d-corner tl" /><span className="d-corner tr" />
        <span className="d-corner bl" /><span className="d-corner br" />

        <header className="d-head">
          <div className="col">
            <span>{t.done_process}</span>
            <b>{t.done_process_name}</b>
          </div>
          <div className="center">
            <span>{t.done_status_label}</span>
            <span className="status">{t.done_status}</span>
          </div>
          {duration && (
            <div className="col right">
              <span>{t.done_duration_label}</span>
              <b>{duration}</b>
            </div>
          )}
        </header>

        <main className="d-main">
          <div className="d-side">
            <div className="d-side-inner">
              <div className="d-phase">{t.done_phase_complete}</div>
              <h1 className="d-title">
                {t.done_title_1}<br />
                <span className="lo">{t.done_title_2}</span>
              </h1>
              <p className="d-sub">
                {t.done_sub_technical}<br />
                <span className="mute">{t.done_source_untouched} {data?.name ?? '—'}</span>
              </p>
              <div className="d-kvs">
                <div className="d-kv"><span className="k">{t.done_kv_tracks}</span><span className="v">{trackCount || '—'}</span></div>
                <div className="d-kv"><span className="k">{t.done_kv_genres}</span><span className="v">{genreCount || '—'}</span></div>
                <div className="d-kv"><span className="k">{t.done_kv_runtime}</span><span className="v">{trackCount ? runtime : '—'}</span></div>
              </div>
              <div className="d-chips">
                {data?.genres?.map((g) => <span key={g} className="c">{g}</span>) ?? null}
              </div>
            </div>
          </div>

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
                <div className="d-card-name">{cardName}</div>
                <div className="d-card-sub"><b>{trackCount || '—'}</b><br />tracks</div>
              </div>
              <div className="d-card-foot">
                <span>{t.done_user_now}</span>
                <a className="open" href={data?.spotifyUrl || '#'} target="_blank" rel="noopener noreferrer">
                  <span>{t.done_open_spotify}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          <div className="d-side right d-side-right">
            <div className="d-side-inner">
              <div className="d-phase">{t.done_phase_next}</div>
              <p className="d-sub">{t.done_next_sub}</p>
              <div className="d-actions">
                <Link className="btn btn-solid" href={lp('/dashboard')}>
                  <span>{t.done_return}</span><span className="arrow">→</span>
                </Link>
                <Link className="btn" href={lp('/dashboard')}>
                  <span>{t.done_sort_another}</span><span className="arrow">↻</span>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="d-foot">
          <div className="col"><span>{t.done_written_to}</span> · <b>Spotify / {data?.ownerName ?? 'user'}</b></div>
          <div className="tip">{t.done_tip}</div>
          <div className="col right" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
            <span style={{ color: 'var(--fg-mute)', fontSize: 11 }}>{t.done_made_by}</span>
            <a href="https://sbandiera.dev" target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '4px 10px', fontSize: 11 }}>
              <span>simon</span><span className="arrow">↗</span>
            </a>
            <a href="https://hgalan.dev" target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '4px 10px', fontSize: 11 }}>
              <span>hugo</span><span className="arrow">↗</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
