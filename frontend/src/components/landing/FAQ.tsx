'use client';

import { useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import { useT } from '@/lib/translations';

export default function FAQ() {
  const t = useT();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const FAQS = [
    [t.faq_q1, t.faq_a1],
    [t.faq_q2, t.faq_a2],
    [t.faq_q3, t.faq_a3],
    [t.faq_q4, t.faq_a4],
    [t.faq_q5, t.faq_a5],
    [t.faq_q6, t.faq_a6],
  ];

  return (
    <section className="section" id="faq">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">{t.faq_label}</div>
            <h2 className="section-title">{t.faq_title}</h2>
            <div className="tiny mute">6 entries</div>
          </div>
        </Reveal>

        <Reveal>
          <div className="faq-list">
            {FAQS.map(([q, a], i) => (
              <div key={i} className={`faq ${openIdx === i ? 'open' : ''}`}>
                <button
                  className="faq-q"
                  aria-expanded={openIdx === i}
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                >
                  <span className="q-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="q-text">{q}</span>
                  <span className="q-toggle">+</span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{a}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
