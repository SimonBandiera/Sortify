'use client';

import { useRef, useEffect, useState } from 'react';
import Reveal from '@/components/ui/Reveal';

interface CounterProps {
  target: number;
  suffix?: string;
}

function Counter({ target, suffix = '' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || triggered.current) return;
          triggered.current = true;
          const dur = 1600;
          const start = performance.now();
          const frame = (t: number) => {
            const k = Math.min(1, (t - start) / dur);
            const ease = 1 - Math.pow(1 - k, 3);
            setValue(Math.floor(target * ease));
            if (k < 1) requestAnimationFrame(frame);
            else setValue(target);
          };
          requestAnimationFrame(frame);
          io.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-val">
      {value.toLocaleString('en-US')}{suffix}
    </span>
  );
}

const STATS = [
  { label: 'Songs analysed', target: 8421736, suffix: '', sub: '+ ~1,200/hour across active sessions.' },
  { label: 'Playlists sorted', target: 41280, suffix: '', sub: 'Since launch, april 2022.' },
  { label: 'Genres detected', target: 1482, suffix: '', sub: 'Deduped to 42 canonical buckets.' },
  { label: 'Median runtime', target: 4, suffix: 's', sub: 'Per 500-track playlist.' },
];

export default function Stats() {
  return (
    <section className="section">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">003 · Counters</div>
            <h2 className="section-title">Already at work.</h2>
            <div className="tiny mute">Live · updates every 60s</div>
          </div>
        </Reveal>

        <div className="stats">
          {STATS.map((stat) => (
            <Reveal key={stat.label} className="stat">
              <span className="stat-label">{stat.label}</span>
              <Counter target={stat.target} suffix={stat.suffix} />
              <span className="stat-sub">{stat.sub}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
