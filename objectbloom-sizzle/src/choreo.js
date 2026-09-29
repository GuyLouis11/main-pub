// Per-detail choreography: where every one of the 930 details is, how it is
// oriented/scaled and how it looks (solid / x-ray / contour hologram), as a
// pure function of time.
import * as THREE from 'three';
import { BEAT, at, bar, beatInfo, clamp, ease, hash, lerp, range } from './timeline.js';

const SYSTEM_ORDER = ['body', 'engine', 'wheels', 'glass', 'cabin', 'steering', 'lighting', 'details'];
// deconstruct: one assembly per beat (bars 12-13); rebuild lands in reverse (bars 28-29)
const DETACH_BEAT = { glass: 0, lighting: 1, body: 2, details: 3, wheels: 4, cabin: 5, steering: 5, engine: 6 };
const LAND_BEAT = { engine: 0, cabin: 1, steering: 1, wheels: 2, details: 3, body: 4, lighting: 5, glass: 6 };

export const XRAY_TINT = {
  body: new THREE.Color('#7dffd6'), glass: new THREE.Color('#b9ffe5'), details: new THREE.Color('#5fe8c0'),
  lighting: new THREE.Color('#ffffff'), wheels: new THREE.Color('#5fc8ff'), cabin: new THREE.Color('#9dffb0'),
  steering: new THREE.Color('#d6fff0'), engine: new THREE.Color('#ff8a3d'),
};
export const HOLO_TINT = {
  body: new THREE.Color('#46ffc4'), glass: new THREE.Color('#9ffff0'), details: new THREE.Color('#2fd6a6'),
  lighting: new THREE.Color('#ffffff'), wheels: new THREE.Color('#4cc3ff'), cabin: new THREE.Color('#46ffc4'),
  steering: new THREE.Color('#b9ffe5'), engine: new THREE.Color('#ffae42'),
};

export const FORMATIONS = [
  { id: 'tray', name: 'PARTS TRAY', from: 16 },
  { id: 'rings', name: 'ORBIT', from: 18 },
  { id: 'helix', name: 'DOUBLE HELIX', from: 20 },
  { id: 'bloom', name: 'BLOOM', from: 22 },
];

export function prepareChoreo(parts, wheelCenters) {
  const N = parts.length;
  // explorer tray order: assembly, then size
  const sorted = [...parts].sort((a, b) =>
    SYSTEM_ORDER.indexOf(a.system) - SYSTEM_ORDER.indexOf(b.system) || b.maxSize - a.maxSize || a.id - b.id);
  sorted.forEach((p, i) => { p.order = i; });
  const trayCols = 37, trayRows = Math.ceil(N / trayCols), traySpacing = 1.25;
  // counts per system for staggering
  const sysIndex = new Map();
  for (const p of sorted) {
    const k = sysIndex.get(p.system) || 0; sysIndex.set(p.system, k + 1); p.sysRank = k;
  }
  const sysCount = Object.fromEntries([...sysIndex.entries()]);
  const ringSplit = [0.24, 0.58];
  for (const p of parts) {
    p.seed = hash(p.id * 7.31 + 0.5);
    p.spinAxis = new THREE.Vector3(hash(p.id * 1.7) - 0.5, hash(p.id * 2.9) - 0.5, hash(p.id * 4.3) - 0.5).normalize();
    p.detachTime = at(12, DETACH_BEAT[p.system] ?? 3) + (p.sysRank / Math.max(1, sysCount[p.system])) * BEAT * 0.45;
    p.landTime = at(28, LAND_BEAT[p.system] ?? 3) - (1 - p.sysRank / Math.max(1, sysCount[p.system])) * BEAT * 0.12;
    p.exploded = p.home.clone().addScaledVector(p.offset, 1.0);
    p.holoPos = p.home.clone().addScaledVector(p.offset, 1.35).multiply(new THREE.Vector3(1.15, 1, 1.15));
    // tray (knolled on the floor)
    const c = p.order % trayCols, r = Math.floor(p.order / trayCols);
    p.trayPos = new THREE.Vector3(((trayCols - 1) / 2 - c) * traySpacing, 0.5, (r - (trayRows - 1) / 2) * traySpacing);
    p.trayScale = (0.95 * traySpacing / 1.65) / p.maxSize;
    p.uniScale = 0.62 / p.maxSize;
    // rings
    const u = p.order / N;
    p.ring = u < ringSplit[0] ? 0 : u < ringSplit[1] ? 1 : 2;
    const lo = [0, ringSplit[0], ringSplit[1]][p.ring], hi = [ringSplit[0], ringSplit[1], 1][p.ring];
    p.ringU = (u - lo) / (hi - lo);
    // helix
    p.strand = p.order % 2;
    // bloom petals
    p.petal = p.order % 8;
    const k = Math.floor(p.order / 8) / Math.ceil(N / 8);
    p.petalK = Math.sqrt(k);
    p.petalSide = (Math.floor(p.order / 8) % 3) - 1;
  }
  return { N, wheelCenters, trayCols, trayRows, traySpacing };
}

// ------------------------------------------------------------------ formations
const Y = new THREE.Vector3(0, 1, 0);
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler();

function stateTray(p, t, out) {
  const d = Math.hypot(p.trayPos.x, p.trayPos.z);
  const bi = beatInfo(t);
  const r = bi.frac * 34;                                   // ripple radius each beat
  const bump = Math.exp(-Math.pow((d - r) / 2.2, 2));
  const passed = ease.outCubic(clamp((r - d) / 3));
  out.pos.copy(p.trayPos); out.pos.y += bump * 1.6 + 0.08 * Math.sin(t * 3 + p.seed * 6);
  const ang = (bi.index + passed) * Math.PI / 2;
  out.quat.setFromEuler(_e.set(0.5 + bump * 0.8, ang, 0));
  out.scale = p.trayScale * (1 + bump * 0.25);
  out.glow = bump;
}

function stateRings(p, t, out) {
  const R = [6.5, 9.5, 12.5][p.ring];
  const dir = p.ring % 2 ? -1 : 1;
  const bi = beatInfo(t);
  const kick = Math.exp(-bi.frac * 5);
  const a = p.ringU * Math.PI * 2 + dir * t * (0.55 - p.ring * 0.1);
  const wave = Math.sin(p.ringU * Math.PI * 2 * 5 - t * 5 + p.ring);
  const rr = R + kick * 0.45;
  out.pos.set(Math.cos(a) * rr, 1.6 + p.ring * 0.9 + wave * 0.9, Math.sin(a) * rr);
  out.quat.setFromAxisAngle(Y, -a).multiply(_q1.setFromAxisAngle(p.spinAxis, t * 2.2 + p.seed * 6));
  out.scale = p.uniScale * 1.1;
  out.glow = Math.max(0, wave) * 0.6;
}

function stateHelix(p, t, out) {
  const s = p.order / 930;
  const z = (s - 0.5) * 52;
  const a = s * Math.PI * 2 * 5 + t * 1.8 + p.strand * Math.PI;
  const kick = Math.exp(-beatInfo(t).frac * 6);
  const r = 2.9 + kick * 0.35 + Math.sin(z * 0.5 + t * 3) * 0.3;
  out.pos.set(Math.cos(a) * r, 3.1 + Math.sin(a) * r, z);
  out.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a).multiply(_q1.setFromAxisAngle(p.spinAxis, t * 3));
  out.scale = p.uniScale * 0.95;
  out.glow = kick;
}

function stateBloom(p, t, out) {
  const open = ease.outCubic(range(t, bar(22), at(22, 3))) * 0.8 + ease.inOutCubic(range(t, bar(23), bar(24))) * 0.2;
  const kick = Math.exp(-beatInfo(t).frac * 5);
  const k = p.petalK;
  const L = 0.6 + k * 10.5;
  const elev = lerp(1.35, 0.28, open) + (1 - k) * 0.25 - kick * 0.05;
  const width = Math.sin(Math.PI * Math.min(1, k * 1.05)) * 2.9 * (0.55 + open * 0.45);
  const yaw = (p.petal / 8) * Math.PI * 2 + t * 0.35;
  const radial = L * Math.cos(elev), up = L * Math.sin(elev);
  const dir = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
  const perp = new THREE.Vector3(-dir.z, 0, dir.x);
  out.pos.set(0, 0.4, 0).addScaledVector(dir, radial).addScaledVector(perp, width * p.petalSide).addScaledVector(Y, up * 0.85);
  out.quat.setFromAxisAngle(Y, -yaw).multiply(_q1.setFromAxisAngle(p.spinAxis, t * 1.4 + p.seed * 5));
  out.scale = p.uniScale * (0.9 + (1 - k) * 0.3) * (1 + kick * 0.12);
  out.glow = kick * (1 - k * 0.5);
}

const FORMATION_FN = { tray: stateTray, rings: stateRings, helix: stateHelix, bloom: stateBloom };

// ------------------------------------------------------------------ detail state
const tmpA = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1, glow: 0 };
const tmpB = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1, glow: 0 };

function explodedState(p, t, out, contract = 0) {
  out.pos.copy(p.exploded);
  out.pos.y += Math.sin(t * 1.3 + p.seed * 12) * 0.035;
  if (contract > 0) {
    out.pos.lerp(new THREE.Vector3(0, 0.9, 0.1), contract * 0.22);
    out.pos.x += (hash(p.id + Math.floor(t * 40)) - 0.5) * 0.02 * contract;
  }
  out.quat.identity();
  out.scale = 1;
  out.glow = 0;
}

function formationState(p, t, idx, out) {
  FORMATION_FN[FORMATIONS[idx].id](p, t, out);
}

function blend(a, b, k, lift, spin, p, out) {
  out.pos.lerpVectors(a.pos, b.pos, k);
  out.pos.y += Math.sin(Math.PI * k) * lift;
  out.quat.slerpQuaternions(a.quat, b.quat, k);
  if (spin) out.quat.multiply(_q2.setFromAxisAngle(p.spinAxis, Math.sin(Math.PI * k) * spin));
  out.scale = lerp(a.scale, b.scale, k);
  out.glow = Math.max(lerp(a.glow, b.glow, k), Math.sin(Math.PI * k));
}

// wheel roll (while the car "drives")
const _axle = new THREE.Vector3(1, 0, 0);
function wheelRoll(p, ctx, angle, out) {
  const c = ctx.wheelCenters[p.wheel];
  if (!c || !angle) return;
  _q1.setFromAxisAngle(_axle, angle);
  out.pos.sub(c).applyQuaternion(_q1).add(c);
  out.quat.premultiply(_q1);
}

export function detailState(p, t, ctx, out) {
  const b = t / bar(1);
  out.solid = 1; out.xray = 0; out.holo = 0;

  if (b < 12) {
    out.pos.copy(p.home); out.quat.identity(); out.scale = 1; out.glow = 0;
    if (p.wheel) wheelRoll(p, ctx, -ctx.roll, out);
    return out;
  }
  if (b < 16) {
    const k = ease.outExpo(range(t, p.detachTime, p.detachTime + BEAT * 0.9));
    const contract = ease.inCubic(range(t, at(15, 2.5), bar(16)));
    explodedState(p, t, tmpB, contract);
    const lift = 0.5 + p.seed * 0.6;
    out.pos.lerpVectors(p.home, tmpB.pos, k);
    out.pos.y += Math.sin(Math.PI * k) * lift * 0.5;
    out.quat.identity();
    const wob = Math.sin(Math.PI * k) * 0.6;
    if (wob) out.quat.setFromAxisAngle(p.spinAxis, wob);
    out.scale = 1;
    out.xray = Math.exp(-Math.max(0, t - p.detachTime) * 3.2) * (t >= p.detachTime ? 1 : 0);
    out.glow = out.xray;
    return out;
  }
  if (b < 24) {
    const idx = Math.min(3, Math.floor((b - 16) / 2));
    const start = bar(FORMATIONS[idx].from);
    formationState(p, t, idx, tmpB);
    if (idx === 0) {
      const k = ease.outExpo(range(t, start + p.seed * BEAT * 0.12, start + BEAT * 0.75));
      explodedState(p, t, tmpA, 1);
      blend(tmpA, tmpB, k, 2.5, Math.PI * 2, p, out);
    } else {
      const delay = (p.order / 930) * BEAT * 0.8;
      const k = ease.inOutExpo(range(t, start + delay - BEAT * 0.2, start + delay + BEAT * 0.8));
      if (k < 1) {
        formationState(p, t, idx - 1, tmpA);
        blend(tmpA, tmpB, k, 3, Math.PI * 2, p, out);
      } else {
        out.pos.copy(tmpB.pos); out.quat.copy(tmpB.quat); out.scale = tmpB.scale; out.glow = tmpB.glow;
      }
    }
    return out;
  }
  if (b < 28) {
    const delay = (p.order / 930) * BEAT * 0.6;
    const k = ease.inOutExpo(range(t, bar(24) + delay - BEAT * 0.3, bar(24) + delay + BEAT * 0.9));
    tmpB.pos.copy(p.holoPos); tmpB.pos.y += Math.sin(t * 1.1 + p.seed * 9) * 0.05;
    tmpB.quat.identity(); tmpB.scale = 1; tmpB.glow = 0;
    if (k < 1) { formationState(p, t, 3, tmpA); blend(tmpA, tmpB, k, 2, Math.PI * 2, p, out); }
    else { out.pos.copy(tmpB.pos); out.quat.identity(); out.scale = 1; out.glow = 0; }
    out.solid = 0; out.holo = 0.25 + 0.75 * k; out.xray = 0.12 * k;
    return out;
  }
  // 28+: rebuild then assembled
  const k = ease.inCubic(range(t, p.landTime - BEAT * 0.8, p.landTime));
  if (k < 1) {
    tmpA.pos.copy(p.holoPos); tmpA.quat.identity(); tmpA.scale = 1; tmpA.glow = 0;
    tmpB.pos.copy(p.home); tmpB.quat.identity(); tmpB.scale = 1; tmpB.glow = 0;
    blend(tmpA, tmpB, k, 0.8, Math.PI * 0.5, p, out);
    out.solid = 0; out.holo = 1; out.xray = 0.12 + k * 0.5;
  } else {
    out.pos.copy(p.home); out.quat.identity(); out.scale = 1;
    const since = t - p.landTime;
    out.solid = 1; out.holo = 0; out.xray = Math.exp(-since * 4) * 1.2;
    out.glow = out.xray;
    if (p.wheel && b >= 30) wheelRoll(p, ctx, -ctx.roll, out);
  }
  return out;
}
