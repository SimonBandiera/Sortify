'use client';

import Reveal from '@/components/ui/Reveal';
import DitherCanvas from '@/components/dither/DitherCanvas';
import { useT } from '@/lib/translations';

export default function HowItWorks() {
  const t = useT();

  const STEPS = [
    { num: '01', label: t.how_step1_label, angle: 180, title: t.how_step1_title, body: t.how_step1_body },
    { num: '02', label: t.how_step2_label, angle: 200, title: t.how_step2_title, body: t.how_step2_body },
    { num: '03', label: t.how_step3_label, angle: 220, title: t.how_step3_title, body: t.how_step3_body },
  ];

  return (
    <section className="section" id="how">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">{t.how_label}</div>
            <h2 className="section-title">{t.how_title}</h2>
            <div className="tiny mute">{t.how_runtime}</div>
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
