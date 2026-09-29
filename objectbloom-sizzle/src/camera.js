// Shot list. Every shot is [startBar, endBar, fn(k, t) -> {pos, target, fov, roll}]
// with k = eased local progress. Cuts land on bars / half-bars.
import * as THREE from 'three';
import { IMPACTS, bar, beatInfo, clamp, ease, hitsEnv, lerp, noise1 } from './timeline.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, k) => a.clone().lerp(b, k);

function move(p0, p1, t0, t1, fov0, fov1 = fov0, roll0 = 0, roll1 = roll0) {
  return (k) => ({ pos: lerpV(p0, p1, k), target: lerpV(t0, t1, k), fov: lerp(fov0, fov1, k), roll: lerp(roll0, roll1, k) });
}
function orbit(target, a0, a1, r0, r1, y0, y1, fov0, fov1 = fov0, roll = 0) {
  return (k) => {
    const a = lerp(a0, a1, k), r = lerp(r0, r1, k), y = lerp(y0, y1, k);
    return { pos: V(target.x + Math.sin(a) * r, y, target.z + Math.cos(a) * r), target: target.clone(), fov: lerp(fov0, fov1, k), roll };
  };
}

const SHOTS = [
  // ---- 00 IGNITION: macro details in the dark
  [0, 1, move(V(1.55, 0.66, -3.35), V(1.1, 0.6, -3.0), V(0.66, 0.58, -2.1), V(0.55, 0.56, -2.1), 26, 24, 0.04, -0.02)],
  [1, 2, move(V(-2.2, 0.42, -0.2), V(-2.05, 0.4, -0.75), V(-0.84, 0.36, -1.16), V(-0.84, 0.36, -1.16), 30, 27)],
  [2, 3, move(V(2.7, 0.42, -2.4), V(2.7, 0.55, 2.1), V(0.7, 0.5, -1.6), V(0.7, 0.58, 2.1), 32)],
  [3, 4, move(V(2.3, 0.8, 4.1), V(1.5, 0.7, 3.7), V(0.62, 0.62, 2.15), V(0.6, 0.6, 2.15), 30, 26, -0.05, 0.03)],
  // ---- 01 REVEAL (car drives)
  [4, 5, move(V(4.3, 0.55, -5.1), V(3.5, 0.48, -4.3), V(0, 0.5, 0), V(0, 0.5, -0.1), 34, 32, 0.06, 0.0)],
  [5, 6, move(V(4.5, 0.95, 1.0), V(4.4, 0.8, -1.0), V(0, 0.5, 0.3), V(0, 0.5, -0.3), 36)],
  [6, 7, orbit(V(0, 0, 0.1), 0, Math.PI / 2, 0.5, 0.5, 9.5, 8.2, 40)],
  [7, 8, orbit(V(0, 0.5, 0.1), 2.55, 2.05, 6.3, 5.6, 1.4, 1.0, 32)],
  // ---- 02 X-RAY
  [8, 10, orbit(V(0, 0.55, 0.15), 1.95, 1.3, 6.4, 6.0, 2.0, 2.5, 34)],
  [10, 12, orbit(V(0, 0.6, 0.9), 0.55, -0.35, 4.6, 4.2, 2.6, 2.3, 34)],
  // ---- 03 DECONSTRUCT
  [12, 14, orbit(V(0, 1.0, 0.1), 2.3, 1.55, 7.2, 10.5, 2.3, 3.8, 36)],
  [14, 16, orbit(V(0, 1.1, 0.1), 1.55, 0.55, 10.5, 9.0, 3.8, 3.0, 36, 32)],
  // ---- 04 BLOOM / tray
  [16, 16.5, orbit(V(0, 0, 0), 0.2, 0.9, 6, 6, 44, 38, 52)],
  [16.5, 17, move(V(0, 1.1, -24), V(0, 1.7, -15), V(0, 0.4, 10), V(0, 0.6, 12), 40, 44, 0.08, -0.05)],
  [17, 17.5, move(V(25, 15, -25), V(18, 10, -18), V(0, 0, 0), V(0, 0, 0), 38)],
  [17.5, 18, move(V(-14, 3.4, 5.5), V(14, 3.4, 5.5), V(-12, 0.4, 0), V(12, 0.4, 0), 44, 44, -0.1, 0.1)],
  // rings
  [18, 18.5, (k, t) => { const a = t * 1.1; return { pos: V(0, 2.6, 0), target: V(Math.sin(a) * 10, 2.4, Math.cos(a) * 10), fov: 64, roll: 0.1 }; }],
  [18.5, 19, move(V(0, 22, 25), V(9, 19, 22), V(0, 1.6, 0), V(0, 1.6, 0), 40)],
  [19, 19.5, orbit(V(0, 2.2, 0), -0.4, 0.9, 17.5, 16, 0.9, 1.4, 44, 44, 0.0)],
  [19.5, 20, (k) => ({ pos: V(Math.sin(k * 2) * 0.4, 34 - k * 6, Math.cos(k * 2) * 0.4), target: V(0, 0, 0), fov: 48, roll: k * 1.2 })],
  // helix (fly-throughs along the axis)
  [20, 20.5, (k) => ({ pos: V(0, 3.1, -32 + k * 30), target: V(0, 3.1, -32 + k * 30 + 10), fov: 70, roll: k * Math.PI })],
  [20.5, 21, move(V(19, 4, 2), V(18, 4.5, -6), V(0, 3, 0), V(0, 3, -2), 46)],
  [21, 21.5, (k) => ({ pos: V(0.4, 3.3, 30 - k * 28), target: V(0, 3.1, 30 - k * 28 - 10), fov: 70, roll: -k * Math.PI })],
  [21.5, 22, move(V(11, 13, -22), V(8, 11, -16), V(0, 3, 0), V(0, 3, 2), 44)],
  // bloom
  [22, 22.5, (k) => ({ pos: V(0, 27 - k * 6, 0.1), target: V(0, 0, 0), fov: 46, roll: k * 0.8 })],
  [22.5, 23, move(V(0, 19, 13), V(6, 17, 11), V(0, 1.5, 0), V(0, 1.5, 0), 46)],
  [23, 23.5, orbit(V(0, 2, 0), 0.4, 1.4, 15, 13, 17, 15, 44)],
  [23.5, 24, move(V(0, 15, 15), V(0, 9.5, 9.5), V(0, 2.5, 0), V(0, 2.0, 0), 42, 50)],
  // ---- 05 BLUEPRINT (long lens, near-orthographic)
  [24, 26, orbit(V(0.6, 1.3, 0.1), 0.75, 1.6, 17, 16, 11, 9.5, 26, 25)],
  [26, 28, move(V(16, 4.5, 3), V(16, 5, -3), V(0, 1.4, 0.9), V(0, 1.4, -0.9), 26, 25)],
  // ---- 06 REBUILD
  [28, 30, orbit(V(0, 0.6, 0.1), 0.85, 2.45, 8.4, 6.2, 2.6, 1.2, 34, 32)],
  // ---- 07 OUTRO hero
  [30, 32, move(V(3.95, 0.62, -4.7), V(3.3, 0.56, -3.95), V(0, 0.55, -0.25), V(0, 0.55, -0.35), 32, 30)],
  [32, 34, move(V(3.3, 0.56, -3.95), V(3.1, 0.95, -3.7), V(0, 0.55, -0.35), V(0, 0.6, -0.3), 30, 29)],
];

const _up = new THREE.Vector3();
export function updateCamera(camera, t, extraShake = 0) {
  const b = t / bar(1);
  let shot = SHOTS[SHOTS.length - 1];
  for (const s of SHOTS) if (b >= s[0] && b < s[1]) { shot = s; break; }
  const kLin = clamp((b - shot[0]) / (shot[1] - shot[0]));
  const k = ease.inOutQuad(kLin) * 0.35 + kLin * 0.65; // mostly linear drift, softened ends
  const s = shot[2](k, t);

  // shake: impacts + kicks in the drop
  const imp = hitsEnv(t, IMPACTS, 5);
  const drop = b >= 16 && b < 24 ? Math.exp(-beatInfo(t).frac * 8) * 0.25 : 0;
  const amp = (imp * 0.09 + drop * 0.05 + extraShake) * Math.max(1, s.pos.distanceTo(s.target) * 0.12);
  s.pos.x += noise1(t * 23) * amp; s.pos.y += noise1(t * 29 + 7) * amp; s.pos.z += noise1(t * 31 + 3) * amp;
  s.target.x += noise1(t * 19 + 11) * amp * 0.5; s.target.y += noise1(t * 17 + 5) * amp * 0.5;

  camera.position.copy(s.pos);
  camera.fov = s.fov * (1 - imp * 0.04);
  const fwd = s.target.clone().sub(s.pos).normalize();
  // roll: rotate world-up around the view direction (guard for top-down shots)
  const baseUp = Math.abs(fwd.y) > 0.97 ? V(0, 0, -1) : V(0, 1, 0);
  _up.copy(baseUp).applyAxisAngle(fwd, s.roll + noise1(t * 13) * amp * 0.3);
  camera.up.copy(_up);
  camera.lookAt(s.target);
  camera.updateProjectionMatrix();
  return { shotStart: shot[0], local: kLin };
}

