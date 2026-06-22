'use client';

import { useRef, useEffect, useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import { useT } from '@/lib/translations';

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

export default function Stats() {
  const t = useT();

  const STATS = [
    { label: t.stat_songs_label, target: 8421736, suffix: '', sub: t.stat_songs_sub },
    { label: t.stat_playlists_label, target: 41280, suffix: '', sub: t.stat_playlists_sub },
    { label: t.stat_genres_label, target: 1482, suffix: '', sub: t.stat_genres_sub },
    { label: t.stat_runtime_label, target: 4, suffix: 's', sub: t.stat_runtime_sub },
  ];

  return (
    <section className="section">
      <div className="page">
        <Reveal>
          <div className="section-head">
            <div className="section-label">{t.stats_label}</div>
            <h2 className="section-title">{t.stats_title}</h2>
            <div className="tiny mute">{t.stats_live}</div>
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
