'use client';

import { useRef, useEffect, useCallback } from 'react';
import { paintDither, paintCover, paintOrb, paintHalo, paintDoneCover } from './dither';
import type { DitherOpts, CoverStyle } from './dither';

interface DitherCanvasProps {
  type?: DitherOpts['type'];
  coverStyle?: CoverStyle;
  coverSeed?: number;
  animated?: boolean;
  animType?: 'soundwave' | 'orb' | 'halo' | 'doneCover';
  scale?: number;
  contrast?: number;
  seed?: number;
  angle?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function DitherCanvas({
  type,
  coverStyle,
  coverSeed = 0,
  animated = false,
  animType,
  scale = 3,
  contrast = 0.95,
  seed = 0.4,
  angle = 0,
  className,
  style,
}: DitherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastTsRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (coverStyle) {
      paintCover(canvas, coverStyle, coverSeed);
      return;
    }

    if (animType === 'orb') {
      paintOrb(canvas, timeRef.current);
      return;
    }
    if (animType === 'halo') {
      paintHalo(canvas, timeRef.current);
      return;
    }
    if (animType === 'doneCover') {
      paintDoneCover(canvas, timeRef.current);
      return;
    }

    paintDither(canvas, {
      type: type || 'wave',
      scale,
      contrast,
      seed,
      angle,
      time: timeRef.current,
    });
  }, [type, coverStyle, coverSeed, animType, scale, contrast, seed, angle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (animated) {
      const loop = (ts: number) => {
        const dt = lastTsRef.current ? (ts - lastTsRef.current) / 1000 : 0;
        lastTsRef.current = ts;
        timeRef.current += dt;
        draw();
        rafRef.current = requestAnimationFrame(loop);
      };
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    }

    draw();
  }, [animated, draw]);

  useEffect(() => {
    if (animated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let timeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(draw, 150);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [animated, draw]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
