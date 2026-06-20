'use client';

import { useRef, useEffect } from 'react';

const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

const COLS = 80;
const ROWS = 4;
const DITHER_ZONE = 0.12;
const COLOR_FILLED  = '#ff5a1f';
const COLOR_EMPTY   = '#1c1c1c';

interface Props {
  pct: number;
}

export default function PixelProgressBar({ pct }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const f = pct / 100;

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const x = c / COLS;
        const bayer = BAYER4[r % 4][c % 4] / 16;
        const filled = x < f - DITHER_ZONE / 2 + bayer * DITHER_ZONE;
        ctx.fillStyle = filled ? COLOR_FILLED : COLOR_EMPTY;
        ctx.fillRect(c, r, 1, 1);
      }
    }
  }, [pct]);

  return (
    <canvas
      ref={ref}
      width={COLS}
      height={ROWS}
      style={{ width: '100%', height: 12, imageRendering: 'pixelated', display: 'block' }}
    />
  );
}
