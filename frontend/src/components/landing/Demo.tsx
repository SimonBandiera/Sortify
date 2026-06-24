'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';
import type { CoverStyle } from '@/components/dither/dither';
import { useT } from '@/lib/translations';

const TRACKS: [string, string, string][] = [
  ['Strobe', 'deadmau5', 'electronic'],
  ['Redbone', 'Childish Gambino', 'r&b'],
  ['Midnight City', 'M83', 'synthwave'],
  ['Teardrop', 'Massive Attack', 'trip-hop'],
  ['Black Hole Sun', 'Soundgarden', 'rock'],
  ['Sunflower', 'Rex Orange County', 'indie'],
  ['Fade Into You', 'Mazzy Star', 'indie'],
  ['Flashing Lights', 'Kanye West', 'hip-hop'],
  ['Time', 'Hans Zimmer', 'ambient'],
  ['Porcelain', 'Moby', 'electronic'],
  ['Come Down', 'Anderson .Paak', 'r&b'],
  ['Paranoid Android', 'Radiohead', 'rock'],
  ['Moon River', 'Frank Ocean', 'r&b'],
  ['Motion Picture Soundtrack', 'Radiohead', 'rock'],
  ['Weightless', 'Marconi Union', 'ambient'],
  ['DNA.', 'Kendrick Lamar', 'hip-hop'],
  ['Ribs', 'Lorde', 'indie'],
  ['Nightcall', 'Kavinsky', 'synthwave'],
  ['Take Five', 'Dave Brubeck', 'jazz'],
  ['Blue in Green', 'Miles Davis', 'jazz'],
  ['So What', 'Miles Davis', 'jazz'],
  ['Unfinished Sympathy', 'Massive Attack', 'trip-hop'],
  ['Breathe', 'Télépopmusik', 'trip-hop'],
  ['Alive', 'Daft Punk', 'electronic'],
];

// Output buckets, in display order. The genre id matches TRACKS[i][2].
const BUCKETS: { id: string; name: string; style: CoverStyle; seed: number }[] = [
  { id: 'electronic', name: 'Electronic', style: 'rings', seed: 0.15 },
  { id: 'indie', name: 'Indie', style: 'wave', seed: 0.4 },
  { id: 'rock', name: 'Rock', style: 'grid', seed: 0.25 },
  { id: 'r&b', name: 'R&B', style: 'sphere', seed: 0.5 },
  { id: 'hip-hop', name: 'Hip-hop', style: 'radial', seed: 0.7 },
  { id: 'jazz', name: 'Jazz', style: 'wave', seed: 0.85 },
  { id: 'trip-hop', name: 'Trip-hop', style: 'rings', seed: 0.65 },
  { id: 'synthwave', name: 'Synthwave', style: 'linear', seed: 0.1 },
  { id: 'ambient', name: 'Ambient', style: 'radial', seed: 0.3 },
];

// Accent (vermilion) for the soundwave, matching --accent. Module-level so the
// array identity is stable across renders.
const WAVE_FG: [number, number, number] = [255, 90, 31];

export default function Demo() {
  const t = useT();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(-1);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      const full: Record<string, number> = {};
      for (const [, , g] of TRACKS) full[g] = (full[g] || 0) + 1;
      setCounts(full);
      setActiveIdx(TRACKS.length);
      setDone(true);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(setTimeout(res, ms));
      });

    const run = async () => {
      while (!cancelled) {
        setCounts({});
        setActiveIdx(-1);
        setFlashId(null);
        setDone(false);
        await wait(700);
        if (cancelled) return;

        const acc: Record<string, number> = {};
        for (let i = 0; i < TRACKS.length; i++) {
          if (cancelled) return;
          setActiveIdx(i);
          await wait(150);
          if (cancelled) return;
          const g = TRACKS[i][2];
          acc[g] = (acc[g] || 0) + 1;
          setCounts({ ...acc });
          setFlashId(g);
        }
        setActiveIdx(TRACKS.length);
        setFlashId(null);
        setDone(true);
        await wait(2800);
      }
    };
    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Keep the track being read centered in the (capped) list, so the sort stays
  // visible without making the list its full 24-row height — key for mobile.
  useEffect(() => {
    const ul = listRef.current;
    if (!ul || activeIdx < 0) return;
    const li = ul.children[activeIdx] as HTMLElement | undefined;
    if (!li) return;
    const target = li.offsetTop - ul.clientHeight / 2 + li.clientHeight / 2;
    ul.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [activeIdx]);

  const cursor = Math.min(Math.max(activeIdx + 1, 0), TRACKS.length);

  return (
    <section className="section" id="demo">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">{t.demo_label}</div>
            <h2 className="section-title">{t.demo_title}</h2>
            <div className="tiny mute">{t.demo_sample}</div>
          </div>
        </Reveal>

        <Reveal>
          <div className="sortflow">
            {/* input — one messy playlist */}
            <div className="sf-pane">
              <div className="demo-header">
                <span className="h-label">{t.demo_input_label}</span>
                <span className="h-count">24 tracks</span>
              </div>
              <ul className="track-list sf-tracks" ref={listRef}>
                {TRACKS.map((tr, i) => (
                  <li
                    key={i}
                    className={`track ${activeIdx === i ? 'reading' : ''} ${
                      done || activeIdx > i ? 'sorted' : ''
                    }`}
                  >
                    <span className="t-idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t-name">
                      <b>{tr[0]}</b> <span>— {tr[1]}</span>
                    </span>
                    <span className="t-genre">{tr[2]}</span>
                  </li>
                ))}
              </ul>
              <div className="demo-footer">
                <span>{t.demo_cursor} {cursor} / 24</span>
                <span>{done ? t.demo_state_done.replace('{n}', '24') : t.demo_state_reading}</span>
              </div>
            </div>

            {/* flow — the signature: a dithered soundwave that is the arrow */}
            <div className="sf-flow" aria-hidden="true">
              <div className="sf-wave">
                <DitherCanvas
                  animated
                  animType="soundwave"
                  scale={2}
                  fg={WAVE_FG}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>
              <span className="sf-arrow sf-arrow-h">→</span>
              <span className="sf-arrow sf-arrow-v">↓</span>
            </div>

            {/* output — clean genre playlists, filling live */}
            <div className="sf-pane">
              <div className="demo-header">
                <span className="h-label">{t.demo_output_label}</span>
                <span className="h-count">9 playlists</span>
              </div>
              <div className="sf-buckets">
                {BUCKETS.map((b) => (
                  <div
                    key={b.id}
                    className={`sf-bucket ${counts[b.id] ? 'on' : ''} ${
                      flashId === b.id ? 'flash' : ''
                    }`}
                  >
                    <div className="sf-bg">
                      <DitherCanvas
                        coverStyle={b.style}
                        coverSeed={b.seed}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      />
                    </div>
                    <div className="sf-bucket-name">{b.name}</div>
                    <div className="sf-bucket-count">{counts[b.id] || 0}</div>
                  </div>
                ))}
              </div>
              <div className="demo-footer">
                <span>{t.genres_title}</span>
                <span>{t.genres_powered}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
