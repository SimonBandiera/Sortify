'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';

const GENRE_CELLS = [
  ['Electronic', 412, 10],
  ['Indie', 308, 25],
  ['Hip-hop', 287, 40],
  ['Rock', 265, 55],
  ['R&B', 198, 70],
  ['Synthwave', 176, 85],
  ['Jazz', 154, 100],
  ['Ambient', 142, 115],
  ['Trip-hop', 121, 130],
  ['Folk', 98, 145],
  ['Classical', 87, 160],
  ['House', 74, 175],
  ['Metal', 62, 190],
  ['Techno', 58, 205],
  ['Lo-fi', 44, 220],
  ['Soul', 31, 235],
  ['Punk', 22, 250],
  ['...38 more', null, 0],
] as const;

export default function GenreGrid() {
  return (
    <section className="section" id="genres">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">004 · Catalog</div>
            <h2 className="section-title">42 buckets. Every edge case.</h2>
            <div className="tiny mute">Sample · 18 of 42</div>
          </div>
        </Reveal>

        <div className="genre-grid">
          {GENRE_CELLS.map(([name, count, angle]) => (
            <div key={name} className="genre-cell">
              <div className="genre-name">{name}</div>
              <div className="genre-mini">
                <DitherCanvas
                  type="linear"
                  angle={angle as number}
                  scale={1}
                  contrast={1}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>
              <div className="genre-count">
                {count ? `${count.toLocaleString()} tracks` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
