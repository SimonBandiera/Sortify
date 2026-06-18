const BAYER8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

function threshold(x: number, y: number): number {
  return (BAYER8[y & 7][x & 7] + 0.5) / 64;
}

export type DitherType = 'wave' | 'sphere' | 'linear' | 'soundwave';
export type CoverStyle = 'radial' | 'linear' | 'sphere' | 'wave' | 'rings' | 'grid';

export interface DitherOpts {
  type?: DitherType;
  scale?: number;
  seed?: number;
  contrast?: number;
  amp?: number;
  angle?: number;
  time?: number;
  fg?: [number, number, number];
  bg?: [number, number, number];
}

function paintPixel(
  data: Uint8ClampedArray,
  idx: number,
  on: boolean,
  fg: [number, number, number],
  bg: [number, number, number]
) {
  const c = on ? fg : bg;
  data[idx] = c[0];
  data[idx + 1] = c[1];
  data[idx + 2] = c[2];
  data[idx + 3] = 255;
}

function setupCanvas(canvas: HTMLCanvasElement, scale: number) {
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  const w = Math.max(1, Math.floor(cssW / scale));
  const h = Math.max(1, Math.floor(cssH / scale));
  canvas.width = w;
  canvas.height = h;
  canvas.style.imageRendering = 'pixelated';
  return { w, h };
}

export function paintWave(canvas: HTMLCanvasElement, opts: DitherOpts = {}) {
  const scale = opts.scale || 2;
  const { w, h } = setupCanvas(canvas, scale);
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const seed = opts.seed || 0;
  const amp = opts.amp || 0.35;
  const contrast = opts.contrast || 1.0;
  const fg = opts.fg || [244, 242, 237];
  const bg = opts.bg || [10, 10, 10];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const horizon = 0.35;
      const perspective = Math.max(0, v - horizon) / (1 - horizon);
      const waveY = horizon + 0.15 * Math.sin(u * Math.PI * 1.2 + seed) * (1 - perspective * 0.3);
      const dist = Math.abs(v - waveY);
      let intensity = Math.exp(-dist * dist * 12) * (0.3 + perspective * 0.9);
      const ridge2 = horizon + 0.05 + 0.08 * Math.sin(u * Math.PI * 2.1 + seed * 1.3);
      intensity += Math.exp(-Math.pow(v - ridge2, 2) * 40) * 0.4 * perspective;
      if (v < horizon) {
        const dx = (u - 0.5) * 2;
        intensity += Math.exp(-dx * dx * 1.5) * (horizon - v) * 0.6;
      }
      intensity = Math.max(0, Math.min(1, intensity * contrast + amp * 0.1));
      const n = (Math.sin(x * 12.9898 + y * 78.233 + seed * 43.758) * 43758.5453) % 1;
      const noise = Math.abs(n) * 0.04;
      intensity = Math.max(0, Math.min(1, intensity + noise - 0.02));
      const t = threshold(x, y);
      paintPixel(data, (y * w + x) * 4, intensity > t, fg, bg);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintSphere(canvas: HTMLCanvasElement, opts: DitherOpts = {}) {
  const scale = opts.scale || 2;
  const { w, h } = setupCanvas(canvas, scale);
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const fg = opts.fg || [244, 242, 237];
  const bg = opts.bg || [10, 10, 10];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w - 0.5;
      const v = y / h - 0.5;
      const d = Math.sqrt(u * u + v * v) / 0.4;
      let intensity = 0;
      if (d <= 1) {
        const z = Math.sqrt(Math.max(0, 1 - d * d));
        intensity = Math.max(0, u * -0.5 + v * -0.7 + z * 0.5) * 1.2;
        intensity += (1 - d) * 0.1;
      } else {
        intensity = Math.max(0, 0.2 - (d - 1) * 0.5);
      }
      const t = threshold(x, y);
      paintPixel(data, (y * w + x) * 4, intensity > t, fg, bg);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintLinear(canvas: HTMLCanvasElement, opts: DitherOpts = {}) {
  const scale = opts.scale || 2;
  const { w, h } = setupCanvas(canvas, scale);
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const fg = opts.fg || [244, 242, 237];
  const bg = opts.bg || [10, 10, 10];
  const angle = (opts.angle || 0) * Math.PI / 180;
  const ca = Math.cos(angle), sa = Math.sin(angle);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w - 0.5;
      const v = y / h - 0.5;
      const g = u * ca + v * sa + 0.5;
      const intensity = Math.max(0, Math.min(1, 1 - g));
      const t = threshold(x, y);
      paintPixel(data, (y * w + x) * 4, intensity > t, fg, bg);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintSoundwave(canvas: HTMLCanvasElement, opts: DitherOpts = {}) {
  const scale = opts.scale || 2;
  const { w, h } = setupCanvas(canvas, scale);
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const fg = opts.fg || [244, 242, 237];
  const bg = opts.bg || [10, 10, 10];
  const t = opts.time || 0;
  const contrast = opts.contrast || 1.0;
  const cy = 0.5;

  const amp = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    const u = x / w;
    const env = 0.55 + 0.45 * Math.sin(u * Math.PI * 2 - t * 0.8);
    const detail =
      0.55 * Math.sin(u * 22 + t * 1.7) +
      0.32 * Math.sin(u * 47 - t * 2.3 + 1.2) +
      0.22 * Math.sin(u * 91 + t * 3.1 + 0.6) +
      0.14 * Math.sin(u * 131 - t * 4.5);
    const breath = 0.85 + 0.15 * Math.sin(t * 0.6 + u * 2);
    amp[x] = Math.abs(detail) * env * breath * 0.42;
  }

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const dy = v - cy;
    for (let x = 0; x < w; x++) {
      const a = amp[x];
      const d = Math.abs(dy) / (a + 0.001);
      let intensity = 0;
      if (d < 1) {
        intensity = 1 - d * d;
      } else {
        intensity = Math.exp(-(d - 1) * 3.5) * 0.55;
      }
      intensity += Math.exp(-Math.pow(dy, 2) * 600) * 0.25;
      intensity += Math.max(0, (v - 0.7)) * 0.12 * a * 3;
      intensity = Math.max(0, Math.min(1, intensity * contrast));
      const th = threshold(x, y);
      paintPixel(data, (y * w + x) * 4, intensity > th, fg, bg);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintDither(canvas: HTMLCanvasElement, opts: DitherOpts = {}) {
  const type = opts.type || 'wave';
  if (type === 'wave') paintWave(canvas, opts);
  else if (type === 'sphere') paintSphere(canvas, opts);
  else if (type === 'linear') paintLinear(canvas, opts);
  else if (type === 'soundwave') paintSoundwave(canvas, opts);
}

export function paintCover(canvas: HTMLCanvasElement, style: CoverStyle, seed: number) {
  const scale = 2;
  const cssW = canvas.clientWidth || 200;
  const cssH = canvas.clientHeight || 200;
  const w = Math.max(1, Math.floor(cssW / scale));
  const h = Math.max(1, Math.floor(cssH / scale));
  canvas.width = w;
  canvas.height = h;
  canvas.style.imageRendering = 'pixelated';
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const fg: [number, number, number] = [255, 90, 31];
  const bg: [number, number, number] = [10, 10, 10];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h;
      let I = 0;

      if (style === 'radial') {
        const dx = u - (0.3 + seed * 0.4);
        const dy = v - (0.4 + seed * 0.2);
        const d = Math.sqrt(dx * dx + dy * dy);
        I = 1 - d * 1.4;
      } else if (style === 'linear') {
        const a = seed * Math.PI * 2;
        I = 1 - ((u * Math.cos(a) + v * Math.sin(a)) * 0.8 + 0.1);
      } else if (style === 'sphere') {
        const dx = u - 0.5, dy = v - 0.5;
        const d = Math.sqrt(dx * dx + dy * dy) / 0.4;
        if (d <= 1) {
          const z = Math.sqrt(Math.max(0, 1 - d * d));
          I = Math.max(0, -0.5 * dx - 0.7 * dy + 0.5 * z) * 1.5;
        } else {
          I = Math.max(0, 0.2 - (d - 1) * 0.6);
        }
      } else if (style === 'wave') {
        const wy = 0.5 + 0.15 * Math.sin(u * 6 + seed * 6);
        I = Math.exp(-Math.pow(v - wy, 2) * 30);
        I += Math.exp(-Math.pow(v - wy - 0.12, 2) * 60) * 0.4;
      } else if (style === 'rings') {
        const dx = u - 0.5, dy = v - 0.5;
        const d = Math.sqrt(dx * dx + dy * dy);
        I = 0.5 + 0.5 * Math.sin(d * 40 + seed * 8);
      } else if (style === 'grid') {
        const gx = Math.floor(u * 8) ^ Math.floor(v * 8);
        I = ((gx + Math.floor(seed * 16)) % 3) / 3 + 0.1;
      }

      I = Math.max(0, Math.min(1, I));
      const t = threshold(x, y);
      paintPixel(data, (y * w + x) * 4, I > t, fg, bg);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintOrb(canvas: HTMLCanvasElement, time: number) {
  const SCALE = 3;
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.floor(rect.width / SCALE));
  const H = Math.max(1, Math.floor(rect.height / SCALE));
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  canvas.style.imageRendering = 'pixelated';
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const data = img.data;
  const cx = 0.5, cy = 0.5;
  const aspect = W / H;
  const BARS = 48;
  const barAmp = new Float32Array(BARS);
  for (let i = 0; i < BARS; i++) {
    barAmp[i] = Math.abs(
      (0.5 + 0.45 * Math.sin(time * 1.2 + i * 0.7) *
        Math.sin(time * 0.5 + i * 0.3) *
        (0.6 + 0.4 * Math.sin(time * 2 + i)))
    );
  }

  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const dx = (u - cx) * aspect;
      const dy = (v - cy);
      const r = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx);
      let I = 0;
      const rings = 0.5 + 0.5 * Math.sin(r * 36 - time * 2.4);
      const ringMask = Math.max(0, 1 - Math.pow(r / 0.55, 2));
      I += rings * ringMask * 0.6;
      const coreMask = Math.exp(-Math.pow(r * 6, 2));
      I += coreMask * (0.7 + 0.1 * Math.sin(time * 3));
      const barIdx = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * BARS) % BARS;
      const barA = barAmp[barIdx];
      const ringR = 0.3;
      const ringThickness = 0.12 * barA + 0.02;
      const ringDist = Math.abs(r - ringR - ringThickness * 0.3);
      if (ringDist < ringThickness) {
        I += (1 - ringDist / ringThickness) * 0.9;
      }
      const wisps = 0.5 + 0.5 * Math.sin(ang * 3 + time * 0.8 + r * 10);
      const wispMask = Math.max(0, Math.min(1, (r - 0.4) / 0.15)) *
        Math.max(0, Math.min(1, (0.7 - r) / 0.1));
      I += wisps * wispMask * 0.5;
      const scan = Math.exp(-Math.pow(r - ((time * 0.22) % 0.9), 2) * 300);
      I += scan * 0.35;
      I *= Math.max(0, 1 - Math.pow(r * 1.4, 2.2));
      const th = threshold(x, y);
      const on = I > th;
      const idx = (y * W + x) * 4;
      if (on) {
        data[idx] = 244; data[idx + 1] = 242; data[idx + 2] = 237; data[idx + 3] = 255;
      } else {
        data[idx] = 10; data[idx + 1] = 10; data[idx + 2] = 10; data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintHalo(canvas: HTMLCanvasElement, time: number) {
  const scale = 4;
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.floor(rect.width / scale));
  const H = Math.max(1, Math.floor(rect.height / scale));
  canvas.width = W;
  canvas.height = H;
  canvas.style.imageRendering = 'pixelated';
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const data = img.data;
  const aspect = W / H;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x / W - 0.5) * aspect;
      const dy = (y / H - 0.5);
      const r = Math.sqrt(dx * dx + dy * dy);
      const rings = 0.5 + 0.5 * Math.sin(r * 22 - time * 0.8);
      const mask = Math.max(0, 1 - Math.pow(r * 2.2, 1.8));
      let I = rings * mask * 0.8;
      I += Math.exp(-Math.pow(r - ((time * 0.18) % 0.8), 2) * 120) * 0.5;
      const th = threshold(x, y);
      const on = I > th;
      const idx = (y * W + x) * 4;
      if (on) {
        data[idx] = 244; data[idx + 1] = 242; data[idx + 2] = 237; data[idx + 3] = 255;
      } else {
        data[idx] = 10; data[idx + 1] = 10; data[idx + 2] = 10; data[idx + 3] = 0;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function paintDoneCover(canvas: HTMLCanvasElement, time: number) {
  const scale = 3;
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.floor(rect.width / scale));
  const H = Math.max(1, Math.floor(rect.height / scale));
  canvas.width = W;
  canvas.height = H;
  canvas.style.imageRendering = 'pixelated';
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const data = img.data;

  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const dx = u - 0.5, dy = v - 0.55;
      const r = Math.sqrt(dx * dx + dy * dy);
      const orb = Math.exp(-Math.pow(r * 3.2, 2)) * (0.9 + 0.1 * Math.sin(time));
      const wave1 = Math.exp(-Math.pow(v - (0.7 + 0.06 * Math.sin(u * 6 + time)), 2) * 40);
      const wave2 = Math.exp(-Math.pow(v - (0.82 + 0.04 * Math.sin(u * 9 - time * 0.7)), 2) * 80);
      const rings = 0.5 + 0.5 * Math.sin(r * 40 - time * 1.2);
      const ringMask = Math.max(0, 1 - r * 2.2) * 0.4;
      let I = orb + wave1 * 0.6 + wave2 * 0.5 + rings * ringMask;
      I *= Math.max(0, 1 - Math.pow(r * 1.5, 2.5));
      const th = threshold(x, y);
      const on = I > th;
      const idx = (y * W + x) * 4;
      if (on) {
        data[idx] = 244; data[idx + 1] = 242; data[idx + 2] = 237; data[idx + 3] = 255;
      } else {
        data[idx] = 10; data[idx + 1] = 10; data[idx + 2] = 10; data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}
