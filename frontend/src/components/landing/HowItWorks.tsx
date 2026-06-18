'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';

const STEPS = [
  {
    num: '01',
    label: 'Read',
    angle: 180,
    title: 'We read every track in your playlist.',
    body: 'Spotify oauth token, scoped to read + modify. Nothing is stored server-side. Your library stays yours.',
  },
  {
    num: '02',
    label: 'Analyse',
    angle: 200,
    title: 'We pull the genres from each song.',
    body: 'Artist metadata, audio features, collaborative tags. We run them through a dedup pass and land on ~40 canonical buckets.',
  },
  {
    num: '03',
    label: 'Sort',
    angle: 220,
    title: 'You pick. We build the new playlists.',
    body: 'Select any combination of genres. Sortify spins up fresh playlists on your Spotify, titled and ordered. Keep, rename, delete.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">001 · Process</div>
            <h2 className="section-title">How it works.</h2>
            <div className="tiny mute">Est. runtime · 3–12s</div>
          </div>
        </Reveal>

        <div className="steps">
          {STEPS.map((step) => (
            <Reveal key={step.num} className="step">
              <div className="step-num">
                <span>Step <b>{step.num}</b></span>
                <span>{step.label}</span>
              </div>
              <div className="step-visual">
                <DitherCanvas
                  type="linear"
                  angle={step.angle}
                  scale={2}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-body">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
