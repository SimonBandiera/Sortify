'use client';

import { useState } from 'react';
import Reveal from '@/components/ui/Reveal';

const FAQS = [
  ['Is it really free?', 'Yes. Sortify is free and will stay free. It costs us about €4/month to run. No paywalls, no premium tier, no dark patterns.'],
  ['Does Sortify store my data?', 'No. We use Spotify oauth to read your playlists on-the-fly, compute the genres in memory, and write the new playlists back. Nothing is persisted server-side beyond session duration. Full source is on github if you want to verify.'],
  ['How accurate are the genres?', "Good enough. We look up each track on Last.fm and use the community-voted genre tags to classify it. Results are cached so repeat runs are instant. Edge cases exist, a pop-punk track might land in \"rock\" or \"punk\" depending on how the community tagged it. You can re-run at any time."],
  ['Will it modify my original playlist?', "Never. Sortify only reads the source playlist and creates new ones. Your originals are untouched. You can delete the generated ones from Spotify anytime if you don't like them."],
  ["Why is it only for Spotify?", "Because that's what we use. If you'd like to see it on Apple Music, Deezer, or Tidal, open an issue or send a PR. The core sort logic is platform-agnostic."],
  ['Can I self-host it?', "Yes. The repo includes a docker-compose and a small python worker. You'll need to register your own Spotify developer app. Takes ~10 minutes if you've done oauth before."],
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="section" id="faq">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">005 · Q&A</div>
            <h2 className="section-title">Common questions.</h2>
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
