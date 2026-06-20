'use client';

import { useRef, useEffect } from 'react';

const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

// Waveform amplitudes per column (Bayer-cell units, 0–5 scale).
// Two asymmetric humps — reads as a real audio waveform, not geometry.
const WAVE = [1, 2, 3, 5, 4, 2, 4, 5, 3, 1];

export default function SortifyMark({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 20, 20);

    // 10×10 grid of 2×2-pixel Bayer cells — makes dither visible at 20 px
    for (let bx = 0; bx < 10; bx++) {
      const amp = WAVE[bx];             // half-height in Bayer-cell units
      for (let by = 0; by < 10; by++) {
        const dist = Math.abs(by - 4.5);  // distance from vertical centre
        if (dist >= amp) continue;
        const fillRatio = 1 - dist / amp;
        const threshold = BAYER4[by % 4][bx % 4] / 16;
        if (fillRatio > threshold) {
          ctx.fillStyle = color;
          ctx.fillRect(bx * 2, by * 2, 2, 2);
        }
      }
    }
  }, [color]);

  return (
    <canvas
      ref={ref}
      width={20}
      height={20}
      className="mark"
      style={{ width: size, height: size, imageRendering: 'pixelated', display: 'block' }}
      aria-hidden="true"
    />
  );
}
