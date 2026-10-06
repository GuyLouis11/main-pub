import React, {useMemo} from 'react';

/* A brilliant-cut diamond rendered as crisp SVG by a tiny facet renderer: a real 3D faceted model (table, star, kite,
   upper-girdle, girdle and pavilion facets), rotated, back-face culled, depth-sorted, and each facet shaded by what its
   mirror reflection would see in a studio of softboxes. Facets snap between white, black and faint fire as it turns,
   like a jeweler's photo, with no flicker (shading is a smooth function of rotation). */

type V = [number, number, number];
const N = 16; // radial symmetry (a real round brilliant is 8-fold with split facets; 16 reads as 57+ facets)

const ring = (r: number, y: number, off: number): V[] =>
  Array.from({length: N}, (_, i) => {
    const a = ((i + off) / N) * Math.PI * 2;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });

/** facet polygons of the model (each an array of 3D points) */
const model = (() => {
  const table = ring(0.56, 0.36, 0);
  const star = ring(0.74, 0.28, 0.5);
  const upper = ring(0.9, 0.13, 0);
  const girdleT = ring(1.0, 0.03, 0.5);
  const girdleB = ring(1.0, -0.03, 0.5);
  const lower = ring(0.62, -0.42, 0);
  const culet: V = [0, -0.86, 0];
  const top: V = [0, 0.36, 0];
  const F: V[][] = [];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    F.push([top, table[i], table[j]]); // table (as a fan, flat → shares one normal)
    F.push([table[i], star[i], table[j]]); // star facets
    F.push([table[i], upper[i], star[i]]); // kite halves
    F.push([star[i], upper[i], girdleT[i]]);
    F.push([star[i], girdleT[i], upper[j]]);
    F.push([table[j], star[i], upper[j]]);
    F.push([girdleT[i], girdleB[i], girdleB[j], girdleT[j]].length ? [girdleT[i], girdleB[i], girdleB[(i + 1) % N], girdleT[(i + 1) % N]] : []); // girdle band
    F.push([girdleB[i], lower[j], girdleB[j]]); // lower girdle
    F.push([girdleB[i], lower[i], lower[j]]);
    F.push([lower[i], culet, lower[j]]); // pavilion mains
  }
  return F.filter((f) => f.length);
})();

const rotate = (p: V, ry: number, rx: number): V => {
  const [x, y, z] = p;
  const x1 = x * Math.cos(ry) + z * Math.sin(ry);
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
  const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
  return [x1, y2, z2];
};
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V): V => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// studio softboxes (direction, width, color) seen in reflections
const BOXES: {d: V; w: number; c: [number, number, number]}[] = [
  {d: norm([0, 1, 0.4]), w: 0.22, c: [1, 1, 1]},
  {d: norm([-1, 0.3, 0.6]), w: 0.12, c: [1, 1, 1]},
  {d: norm([1, 0.2, 0.3]), w: 0.1, c: [1, 1, 1]},
  {d: norm([0.3, -0.6, 1]), w: 0.08, c: [1, 1, 1]},
  {d: norm([-0.6, -0.4, 0.8]), w: 0.06, c: [0.62, 0.78, 1]},
  {d: norm([0.7, 0.6, 0.6]), w: 0.06, c: [1, 0.8, 0.55]},
  {d: norm([0, 0.2, 1]), w: 0.05, c: [1, 1, 1]},
  // overhead and behind: what the crown and table reflect
  {d: norm([0, 0.8, -0.6]), w: 0.13, c: [1, 1, 1]},
  {d: norm([-0.55, 0.6, -0.6]), w: 0.1, c: [0.85, 0.92, 1]},
  {d: norm([0.55, 0.55, -0.65]), w: 0.09, c: [1, 0.93, 0.85]},
  {d: norm([0, 0.3, -1]), w: 0.07, c: [1, 1, 1]},
];
const env = (r: V): [number, number, number] => {
  let c: [number, number, number] = [0.05, 0.055, 0.07];
  BOXES.forEach((b) => {
    const cos = r[0] * b.d[0] + r[1] * b.d[1] + r[2] * b.d[2];
    const k = Math.max(0, (cos - (1 - b.w)) / b.w); // inside the box's cone
    const s = Math.min(1, k * 3) ** 1.5;
    c = [c[0] + b.c[0] * s, c[1] + b.c[1] * s, c[2] + b.c[2] * s];
  });
  return c;
};

export const Gem: React.FC<{size: number; rotY: number; tilt?: number; tint?: string; glow?: number; style?: React.CSSProperties}> = ({
  size,
  rotY,
  tilt = 0.42,
  glow = 0.6,
  style,
}) => {
  const polys = useMemo(() => {
    const out: {pts: string; fill: string; z: number; stroke: string}[] = [];
    for (const f of model) {
      const P = f.map((p) => rotate(p, rotY, tilt));
      const n = norm(cross(sub(P[1], P[0]), sub(P[2], P[0])));
      // outward normal: flip so it points away from the gem's centre
      const cen = P.reduce((a, p) => [a[0] + p[0] / P.length, a[1] + p[1] / P.length, a[2] + p[2] / P.length] as V, [0, 0, 0] as V);
      const nn: V = n[0] * cen[0] + n[1] * cen[1] + n[2] * cen[2] < 0 ? [-n[0], -n[1], -n[2]] : n;
      if (nn[2] <= 0.02) continue; // back-facing (camera looks down −z toward +z… viewer at +z)
      const v: V = [0, 0, -1]; // view direction (into the scene)
      const d = v[0] * nn[0] + v[1] * nn[1] + v[2] * nn[2];
      const r: V = [v[0] - 2 * d * nn[0], v[1] - 2 * d * nn[1], v[2] - 2 * d * nn[2]];
      const c = env(r);
      const tone = (x: number) => Math.round(255 * Math.min(1, x));
      out.push({
        pts: P.map((p) => `${(p[0] * 0.46 + 0.5) * size},${(-p[1] * 0.46 + 0.52) * size}`).join(' '),
        fill: `rgb(${tone(c[0])},${tone(c[1])},${tone(c[2])})`,
        stroke: `rgba(255,255,255,${0.08 + 0.12 * Math.min(1, (c[0] + c[1] + c[2]) / 3)})`,
        z: cen[2],
      });
    }
    return out.sort((a, b) => a.z - b.z);
  }, [rotY, tilt, size]);
  return (
    <svg width={size} height={size} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${size * 0.05 * glow}px rgba(200,225,255,.55))` : undefined, ...style}}>
      {polys.map((p, i) => (
        <polygon key={i} points={p.pts} fill={p.fill} stroke={p.stroke} strokeWidth={size / 500} strokeLinejoin="round" />
      ))}
    </svg>
  );
};

/** soft four-point star glints that bloom and fade (sparse and slow; never strobing) */
export const Glints: React.FC<{f: number; size: number; spots: [number, number, number][]}> = ({f, size, spots}) => (
  <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', mixBlendMode: 'screen'}}>
    {spots.map(([x, y, at], i) => {
      const t = ((f - at) % 75 + 75) % 75;
      const a = t < 24 ? Math.sin((t / 24) * Math.PI) : 0;
      if (a <= 0.01) return null;
      const s = size * 0.06 * a;
      return (
        <g key={i} transform={`translate(${x * size} ${y * size}) rotate(${t * 2})`} opacity={a}>
          <path d={`M0 ${-s} L${s * 0.12} ${-s * 0.12} L${s} 0 L${s * 0.12} ${s * 0.12} L0 ${s} L${-s * 0.12} ${s * 0.12} L${-s} 0 L${-s * 0.12} ${-s * 0.12} Z`} fill="#fff" />
          <circle r={s * 0.25} fill="#fff" />
        </g>
      );
    })}
  </svg>
);
