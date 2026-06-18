'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';

interface HeroProps {
  spotifyAuthUrl: string;
}

export default function Hero({ spotifyAuthUrl }: HeroProps) {
  return (
    <section className="hero">
      <div className="page hero-grid">
        <div>
          <div className="hero-head">
            <div className="hero-head-top">
              <Reveal>
                <h1 className="hero-title">
                  Sort your<br />
                  playlists<br />
                  <span className="lo">faster than a</span><br />
                  heartbeat<span className="blink">&nbsp;</span>
                </h1>
              </Reveal>
              <Reveal>
                <div className="hero-sub">
                  <p style={{ margin: 0 }}>
                    {'// a utility that reads your playlists, detects the genres, and splits them into new, clean ones — in seconds, not evenings.'}
                  </p>
                  <p className="mute" style={{ margin: 0 }}>
                    Free. Open source. No ads. No model training.<br />
                    Works on every playlist you own or follow.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal>
              <div className="hero-cta">
                <a className="btn btn-solid" href={spotifyAuthUrl}>
                  <span>Connect Spotify</span>
                  <span className="arrow">→</span>
                </a>
                <a className="btn" href="#how">
                  <span>How it works</span>
                </a>
                <span className="hero-cta-note">◇ no card · no signup · oauth only</span>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="hero-canvas-wrap">
              <DitherCanvas
                animated
                animType="soundwave"
                type="soundwave"
                scale={3}
                contrast={0.95}
                className="hero-canvas"
              />
              <div className="hero-canvas-overlay" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="cell" />
                ))}
              </div>
              <div className="hero-canvas-corner tl">[ waveform::gradient_01 ]</div>
              <div className="hero-canvas-corner tr">bayer 8×8 · mono</div>
              <div className="hero-canvas-corner bl">input: 12,408 tracks</div>
              <div className="hero-canvas-corner br">output: 27 playlists</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
