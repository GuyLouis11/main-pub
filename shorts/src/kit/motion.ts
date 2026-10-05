import {Easing, interpolate, spring} from 'remotion';

// After Effects-style easing presets
export const EZ = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo-ish ("Easy Ease Out" pushed hard)
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot
  linear: Easing.linear,
};

/** keyframes: [[frame, value], ...] with one easing per segment (default EZ.inOut). Holds outside the range. */
export const kf = (frame: number, keys: [number, number][], ease: ((t: number) => number) | ((t: number) => number)[] = EZ.inOut) => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (frame <= f1) {
      const e = Array.isArray(ease) ? ease[Math.min(i, ease.length - 1)] : ease;
      if (f1 === f0) return v1;
      return interpolate(frame, [f0, f1], [v0, v1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    }
  }
  return keys[keys.length - 1][1];
};

/** 0→1 progress between two frames */
export const prog = (frame: number, a: number, b: number, ease: (t: number) => number = EZ.out) =>
  interpolate(frame, [a, b], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** spring that starts at frame `at` */
export const spr = (frame: number, fps: number, at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  spring({frame: frame - at, fps, config: {damping: 14, stiffness: 170, mass: 0.8, ...cfg}});

/** in/out visibility envelope: fades up over `fin` frames at `a`, down over `fout` at `b` */
export const env = (frame: number, a: number, b: number, fin = 6, fout = 6) =>
  Math.min(prog(frame, a, a + fin, EZ.soft), 1 - prog(frame, b - fout, b, EZ.soft));

/** deterministic pseudo-random from an integer seed */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
