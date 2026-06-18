'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';

interface OpenSourceCTAProps {
  spotifyAuthUrl: string;
}

export default function OpenSourceCTA({ spotifyAuthUrl }: OpenSourceCTAProps) {
  return (
    <section className="section" id="github">
      <div className="page">
        <Reveal>
          <div className="os-cta">
            <div className="os-cta-bg os-cta-bg-side">
              <DitherCanvas
                type="linear"
                angle={135}
                scale={3}
                contrast={0.95}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
            <div className="os-cta-content">
              <div className="section-label" style={{ marginBottom: 14 }}>006 · Open</div>
              <h3>Free. Open source. Yours to fork.</h3>
              <p>
                Sortify is MIT-licensed and runs on a single python worker. Read
                the source, host your own, or ship a PR.
              </p>
            </div>
            <div className="os-cta-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <a className="btn btn-solid" id="connect" href={spotifyAuthUrl}>
                <span>Connect Spotify</span>
                <span className="arrow">→</span>
              </a>
              <a className="btn" href="https://github.com/SimonBandiera/Sortify">
                <span>View source</span>
                <span className="arrow">↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
