'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';
import type { CoverStyle } from '@/components/dither/dither';

const GENRE_CELLS: [string, CoverStyle, number][] = [
  ['Electronic',  'rings',   0.15],
  ['Indie',       'wave',    0.4],
  ['Hip-hop',     'radial',  0.7],
  ['Rock',        'grid',    0.25],
  ['R&B',         'sphere',  0.5],
  ['Synthwave',   'linear',  0.1],
  ['Jazz',        'wave',    0.85],
  ['Ambient',     'radial',  0.3],
  ['Trip-hop',    'rings',   0.65],
  ['Folk',        'linear',  0.55],
  ['Classical',   'sphere',  0.2],
  ['House',       'grid',    0.75],
  ['Metal',       'radial',  0.9],
  ['Techno',      'rings',   0.45],
  ['Lo-fi',       'wave',    0.6],
  ['Soul',        'sphere',  0.35],
  ['Punk',        'grid',    0.8],
  ['+ anything on Last.fm', 'linear', 0.5],
];

export default function GenreGrid() {
  return (
    <section className="section" id="genres">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">004 · Catalog</div>
            <h2 className="section-title">Every genre. No limits.</h2>
            <div className="tiny mute">Powered by community tags</div>
          </div>
        </Reveal>

        <div className="genre-grid">
          {GENRE_CELLS.map(([name, style, seed]) => (
            <div key={name} className="genre-cell">
              <div className="genre-bg">
                <DitherCanvas
                  coverStyle={style}
                  coverSeed={seed}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>
              <div className="genre-name">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
