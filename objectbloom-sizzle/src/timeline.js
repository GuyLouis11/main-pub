// Musical clock + easing helpers. Every visual and every sound is a pure
// function of time `t` (seconds), so realtime playback, scrubbing and the
// frame-exact MP4 export all produce the same picture on the same beat.

export const BPM = 128;
export const BEAT = 60 / BPM;          // 0.46875 s
export const BAR = BEAT * 4;           // 1.875 s
export const TOTAL_BARS = 33;          // 32 bars of show + 1 bar tail
export const DURATION = TOTAL_BARS * BAR;

export const bar = (b) => b * BAR;
export const beat = (n) => n * BEAT;
export const at = (barN, beatN = 0) => barN * BAR + beatN * BEAT;

// Section map (in bars). Keep music.js, camera.js, choreo.js and hud.js in
// lockstep with this table.
export const SECTIONS = [
  { id: 'intro',       label: '00 // IGNITION',     from: 0,  to: 4 },
  { id: 'reveal',      label: '01 // REVEAL',       from: 4,  to: 8 },
  { id: 'xray',        label: '02 // X-RAY',        from: 8,  to: 12 },
  { id: 'deconstruct', label: '03 // DECONSTRUCT',  from: 12, to: 16 },
  { id: 'drop',        label: '04 // BLOOM',        from: 16, to: 24 },
  { id: 'holo',        label: '05 // BLUEPRINT',    from: 24, to: 28 },
  { id: 'rebuild',     label: '06 // REBUILD',      from: 28, to: 30 },
  { id: 'outro',       label: '07 // OBJECTBLOOM',  from: 30, to: 33 },
];

export function sectionAt(t) {
  const b = t / BAR;
  for (const s of SECTIONS) if (b >= s.from && b < s.to) return s;
  return SECTIONS[SECTIONS.length - 1];
}

// ---------------------------------------------------------------- math
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const smoothstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const fract = (x) => x - Math.floor(x);

export const ease = {
  linear: (k) => k,
  inQuad: (k) => k * k,
  outQuad: (k) => 1 - (1 - k) * (1 - k),
  inOutQuad: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  inCubic: (k) => k * k * k,
  inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  inExpo: (k) => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10)),
  inOutExpo: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2),
  outBack: (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  inBack: (k) => { const c1 = 1.70158, c3 = c1 + 1; return c3 * k * k * k - c1 * k * k; },
  outElastic: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
};

// Deterministic hash noise (no Math.random anywhere in the show).
export function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
export function noise1(x) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u) * 2 - 1;
}

// ---------------------------------------------------------------- beat helpers
export function beatInfo(t) {
  const b = t / BEAT;
  const index = Math.floor(b);
  return { index, frac: b - index, barIndex: Math.floor(index / 4), inBar: index % 4 };
}

// Exponential decay envelope that re-triggers on every beat (1 on the hit).
export const kickEnv = (t, decay = 7) => Math.exp(-beatInfo(t).frac * BEAT * decay);

// Envelope that fires once at `hitTime` and decays.
export function hitEnv(t, hitTime, decay = 6) {
  if (t < hitTime) return 0;
  return Math.exp(-(t - hitTime) * decay);
}

// Sum of decays for a list of hit times.
export function hitsEnv(t, times, decay = 6) {
  let v = 0;
  for (const h of times) if (t >= h && t - h < 3) v = Math.max(v, Math.exp(-(t - h) * decay));
  return v;
}

// Big impacts (used by camera shake, flashes, chroma and the sound design).
export const IMPACTS = [bar(4), bar(8), bar(12), bar(16), bar(18), bar(20), bar(22), bar(24), bar(28), bar(30)];

// Hard camera cuts (white flash + whoosh).
export const CUTS = (() => {
  const c = [];
  for (let b = 1; b < 4; b++) c.push(bar(b));               // intro macro shots
  for (let b = 4; b < 8; b++) c.push(bar(b));               // reveal: one shot per bar
  c.push(bar(10));
  for (let b = 16; b < 24; b++) c.push(bar(b), at(b, 2));   // drop: every half bar
  c.push(bar(24), bar(26), bar(28), bar(30));
  return c;
})();
