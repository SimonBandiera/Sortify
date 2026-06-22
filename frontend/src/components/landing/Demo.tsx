'use client';

import { useState, useCallback } from 'react';
import Reveal from '@/components/ui/Reveal';
import { useT } from '@/lib/translations';

const TRACKS = [
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

const GENRES = Array.from(new Set(TRACKS.map((t) => t[2])));

export default function Demo() {
  const t = useT();
  const [selected, setSelected] = useState<Set<string>>(new Set(['electronic', 'synthwave']));
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [stateLabel, setStateLabel] = useState('idle');
  const [progLabel, setProgLabel] = useState('ready');
  const [matched, setMatched] = useState<string[][]>([]);

  const toggleGenre = (g: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const outputTracks = running ? matched : TRACKS.filter((tr) => selected.has(tr[2]));

  const runSort = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setMatched([]);
    setProgress(0);
    const m: string[][] = [];

    for (let i = 0; i < TRACKS.length; i++) {
      setProgress((i + 1) / TRACKS.length);
      setCursorPos(i + 1);
      setStateLabel(t.demo_state_reading);
      setProgLabel(`analysing ${TRACKS[i][0].toLowerCase()}`);
      setHighlightIdx(i);
      await new Promise((r) => setTimeout(r, 95));
      if (selected.has(TRACKS[i][2])) {
        m.push(TRACKS[i]);
        setMatched([...m]);
      }
    }
    setStateLabel(t.demo_state_done.replace('{n}', String(m.length)));
    setProgLabel(t.demo_state_done.replace('{n}', String(m.length)));
    setHighlightIdx(-1);
    setRunning(false);
  }, [selected, running, t]);

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
          <div className="demo">
            <div className="demo-pane">
              <div className="demo-header">
                <span className="h-label">{t.demo_input_label}</span>
                <span className="h-count">24 tracks</span>
              </div>
              <ul className="track-list">
                {TRACKS.map((tr, i) => (
                  <li key={i} className={`track ${highlightIdx === i ? 'matched' : ''}`}>
                    <span className="t-idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t-name">
                      <b>{tr[0]}</b> <span>— {tr[1]}</span>
                    </span>
                    <span className="t-genre">{tr[2]}</span>
                  </li>
                ))}
              </ul>
              <div className="demo-footer">
                <span>{t.demo_cursor} {cursorPos} / 24</span>
                <span>{stateLabel}</span>
              </div>
            </div>

            <div className="demo-pane">
              <div className="demo-header">
                <span className="h-label">{t.demo_output_label}</span>
                <span className="h-count">{outputTracks.length} track{outputTracks.length === 1 ? '' : 's'}</span>
              </div>
              <div className="genre-select">
                {GENRES.map((g) => (
                  <span
                    key={g}
                    className={`chip ${selected.has(g) ? 'on' : ''}`}
                    onClick={() => toggleGenre(g)}
                  >
                    {g}
                  </span>
                ))}
              </div>
              <ul className="track-list" style={{ flex: 1 }}>
                {outputTracks.map((tr, i) => (
                  <li key={i} className="track">
                    <span className="t-idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t-name">
                      <b>{tr[0]}</b> <span>— {tr[1]}</span>
                    </span>
                    <span className="t-genre">{tr[2]}</span>
                  </li>
                ))}
              </ul>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>
              <div className="demo-footer" style={{ borderTop: 0, paddingTop: 10 }}>
                <span>{progLabel}</span>
                <button
                  className="btn"
                  onClick={runSort}
                  disabled={running}
                  style={{ padding: '6px 12px', fontSize: 10 }}
                >
                  <span>{t.demo_run_sort}</span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
