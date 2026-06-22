'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';
import { useT } from '@/lib/translations';

interface HeroProps {
  spotifyAuthUrl: string;
}

export default function Hero({ spotifyAuthUrl }: HeroProps) {
  const t = useT();

  return (
    <section className="hero">
      <div className="page hero-grid">
        <div>
          <div className="hero-head">
            <div className="hero-head-top">
              <Reveal>
                <h1 className="hero-title">
                  {t.hero_title_1}<br />
                  {t.hero_title_2}<br />
                  <span className="lo">{t.hero_title_3}</span><br />
                  {t.hero_title_4}<span className="blink">&nbsp;</span>
                </h1>
              </Reveal>
              <Reveal>
                <div className="hero-sub">
                  <p style={{ margin: 0 }}>{t.hero_sub_technical}</p>
                  <p className="mute" style={{ margin: 0 }}>{t.hero_sub_note}</p>
                </div>
              </Reveal>
            </div>
            <Reveal>
              <div className="hero-cta">
                <a className="btn btn-solid" href={spotifyAuthUrl}>
                  <span>{t.nav_connect_spotify}</span>
                  <span className="arrow">→</span>
                </a>
                <a className="btn" href="#how">
                  <span>{t.hero_cta_how}</span>
                </a>
                <span className="hero-cta-note">{t.hero_cta_note}</span>
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
