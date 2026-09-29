// The director: turns a time value into a fully posed frame.
import * as THREE from 'three';
import {
  BAR, BEAT, CUTS, DURATION, IMPACTS, at, bar, beatInfo, ease, hash, hitEnv, hitsEnv, lerp, range,
} from './timeline.js';
import { clip, BRAND, updateStreaks } from './stage.js';
import { fxUniforms, PAINTS, SYSTEM_LABELS } from './parts.js';
import { XRAY_TINT, HOLO_TINT, detailState } from './choreo.js';
import { updateCamera } from './camera.js';

const DETACH_ORDER = [['glass'], ['lighting'], ['body'], ['details'], ['wheels'], ['cabin', 'steering'], ['engine']];
const LAND_ORDER = [['engine'], ['cabin', 'steering'], ['wheels'], ['details'], ['body'], ['lighting'], ['glass']];

// car speed (m/s) -> distance travelled drives wheel roll, floor scroll and streaks
function speedAt(t) {
  const b = t / BAR;
  if (b < 4) return lerp(2, 4, b / 4);
  if (b < 8) return lerp(10, 26, ease.outCubic(range(t, bar(4), at(4, 2))));
  if (b < 9) return lerp(26, 0, ease.outCubic(range(t, bar(8), bar(9))));
  if (b >= 30) return lerp(6, 0, ease.outCubic(range(t, bar(30), bar(32))));
  return 0;
}
function distanceAt(t) {
  const steps = 400, dt = t / steps;
  let d = 0;
  for (let i = 0; i < steps; i++) d += speedAt((i + 0.5) * dt) * dt;
  return d;
}

export function createShow({ stage, assembly, hud, type3d }) {
  const { parts, solidBatches, solidMaterials, xray, holo, wheelCenters } = assembly;
  const { scene, camera, composer, final, bloom, floor, dust, streaks, scanSheet, lights } = stage;
  const ctx = { wheelCenters, roll: 0 };
  const state = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: 1, glow: 0, solid: 1, xray: 0, holo: 0 };
  const m4 = new THREE.Matrix4(), sc = new THREE.Vector3(), col = new THREE.Color();

  const paintMat = solidMaterials.find((m) => m.userData.source === 'body');
  const ledMats = solidMaterials.filter((m) => m.userData.source === 'leds');
  const redMats = solidMaterials.filter((m) => m.userData.source === 'lights_red' || m.userData.source === 'brakes');

  // ---- static info for the HUD
  const bySystem = {};
  for (const p of parts) bySystem[p.system] = (bySystem[p.system] || 0) + 1;
  const assemblies = Object.entries(SYSTEM_LABELS).map(([k, name]) => ({ name, count: bySystem[k] || 0 }));
  const detachList = DETACH_ORDER.map((sys, i) => ({
    name: sys.map((s) => SYSTEM_LABELS[s]).join(' + '), count: sys.reduce((a, s) => a + (bySystem[s] || 0), 0), t: at(12, i),
  }));
  const landList = LAND_ORDER.map((sys, i) => ({ name: sys.map((s) => SYSTEM_LABELS[s]).join(' + '), t: at(28, i) }));
  const titles = [...new Set(parts.map((p) => p.label))];
  const tickerNames = titles.map((x, i) => ({ x, k: hash(i * 9.1) })).sort((a, b) => a.k - b.k).map((o) => o.x);

  const find = (re) => parts.find((p) => re.test(p.title));
  const calloutDefs = [
    [/^Windscreen$/, 9, 0], [/Front left brake rotor/, 9, 1.5], [/Left red cam cover/, 9, 2.5],
    [/^Intake plenum/, 10, 0], [/Transmission casing/, 10, 1.5], [/Steering rim leather/, 10, 2.5],
    [/Right headlamp LED/, 11, 0], [/Rear right tire/, 11, 1.5], [/^V8 crankcase/, 11, 2.5],
  ];
  const callouts = calloutDefs.map(([re, b, beat]) => {
    const p = find(re);
    if (!p) return null;
    return { p, label: p.title, sub: `DETAIL ${p.code} · ${SYSTEM_LABELS[p.system].toUpperCase()}`, t0: at(b, beat), t1: at(b, beat) + BEAT * 1.9 };
  }).filter(Boolean);

  // car extents for blueprint dimensions
  const ext = new THREE.Box3();
  for (const p of parts) {
    if (p.system === 'engine') continue;
    const h = new THREE.Vector3(...p.size).multiplyScalar(0.5);
    ext.expandByPoint(p.home.clone().sub(h)); ext.expandByPoint(p.home.clone().add(h));
  }
  const wf = wheelCenters['Front right'], wr = wheelCenters['Rear right'];

  const paintSchedule = (t) => {
    const b = t / BAR, bi = beatInfo(t);
    if (b >= 7 && b < 8) return PAINTS[[1, 2, 3, 4][bi.inBar]];
    if (b >= 16 && b < 24) return PAINTS[(bi.barIndex - 16) % PAINTS.length];
    return PAINTS[0];
  };

  const project = (v) => {
    const p = v.clone().project(camera);
    return { x: (p.x * 0.5 + 0.5) * 1920, y: (1 - (p.y * 0.5 + 0.5)) * 1080, visible: p.z < 1 && p.z > -1 };
  };

  const tmpColor = new THREE.Color();
  const bgIntro = new THREE.Color('#06080a'), bgXray = new THREE.Color('#081013'), bgHolo = new THREE.Color('#031219');

  function update(t) {
    const b = t / BAR;
    const bi = beatInfo(t);
    const kick = Math.exp(-bi.frac * BEAT * 9);
    const imp = hitsEnv(t, IMPACTS, 6);
    const dist = distanceAt(t);
    ctx.roll = dist / 0.36;

    // ------------------------------------------------ looks by section
    // x-ray wipe (s = scan z; solid keeps z > s, fx keeps z < s)
    let s = null, scanMode = '', scanProg = 0;
    if (b >= 8 && b < 9) { s = lerp(-2.7, 2.7, ease.inOutQuad(range(t, bar(8), bar(9)))); scanMode = 'X-RAY PASS'; scanProg = range(t, bar(8), bar(9)); }
    else if (b >= 9 && b < 11.5) s = 100;
    else if (b >= 11.5 && b < 12) { s = lerp(2.7, -2.7, ease.inOutQuad(range(t, at(11, 2), bar(12)))); scanMode = 'RESTORE'; scanProg = range(t, at(11, 2), bar(12)); }
    clip.set(s);
    let heat = -99;
    if (b >= 10 && b < 11) heat = lerp(-2.7, 2.7, ease.inOutQuad(range(t, bar(10), bar(11))));
    else if (b >= 11 && b < 12) heat = 99;
    fxUniforms.uHeat.value = heat;
    const scanZ = (s !== null && Math.abs(s) < 50) ? s : (b >= 10 && b < 11 ? heat : null);
    fxUniforms.uScan.value = scanZ ?? -99;
    fxUniforms.uTime.value = t;
    scanSheet.visible = scanZ !== null;
    if (scanSheet.visible) {
      scanSheet.position.z = scanZ;
      scanSheet.material.uniforms.uOpacity.value = 1;
      scanSheet.material.uniforms.uTime.value = t;
      scanSheet.material.uniforms.uColor.value.set(b >= 10 && b < 11 ? '#ff8a3d' : '#7dffd6');
    }
    if (b >= 10 && b < 11) { scanMode = 'THERMAL PASS'; scanProg = range(t, bar(10), bar(11)); }

    const inXray = b >= 8 && b < 12;
    const strobeStep = Math.floor(t / (BEAT / 4));
    const coil = Math.floor(t / (BEAT / 2)) % 8;

    // ------------------------------------------------ details
    let visibleCount = 0, landed = 0;
    for (const p of parts) {
      detailState(p, t, ctx, state);
      let solid = state.solid, xr = state.xray, ho = state.holo;
      if (inXray) {
        solid = 1; xr = 1;
        if (/ignition coil/.test(p.label)) xr += (parseInt(p.label.slice(-1), 10) - 1 + (p.label.startsWith('Right') ? 4 : 0)) === coil ? 3 : 0;
        if (/exhaust primary/.test(p.label)) xr += 0.6 * kick;
      } else if (b >= 16 && b < 24) {
        const f = Math.floor((b - 16) / 2);
        if (f === 0) xr = state.glow * 0.9;
        else if (f === 1) ho = state.glow * 0.8;
        else if (f === 2) { const on = (p.order + strobeStep) % 2 === 0 || b < 20.25; solid = on ? 1 : 0; xr = on ? state.glow * 0.3 : 1.1; }
        else xr = state.glow * 0.55;
      }
      if (b >= 28 && t >= p.landTime) landed++;

      sc.setScalar(Math.max(1e-4, state.scale));
      m4.compose(state.pos, state.quat, sc);
      p.solidBatch.setMatrixAt(p.solidId, m4);
      p.solidBatch.setVisibleAt(p.solidId, solid > 0.5);
      const xOn = xr > 0.01, hOn = ho > 0.01;
      xray.setVisibleAt(p.xrayId, xOn);
      holo.setVisibleAt(p.holoId, hOn);
      if (xOn) { xray.setMatrixAt(p.xrayId, m4); xray.setColorAt(p.xrayId, col.copy(XRAY_TINT[p.system]).multiplyScalar(xr * 0.16)); }
      if (hOn) { holo.setMatrixAt(p.holoId, m4); holo.setColorAt(p.holoId, col.copy(HOLO_TINT[p.system]).multiplyScalar(ho * (b >= 24 && b < 29 ? 0.42 : 0.2))); }
      if (solid > 0.5 || xOn || hOn) visibleCount++;
    }

    // ------------------------------------------------ paint, lamps
    const paint = paintSchedule(t);
    paintMat.color.set(paint.hex);
    const ign = b < 4 ? (t > at(0, 1) ? (0.6 + 0.4 * (hash(Math.floor(t * 20)) > 0.2 ? 1 : 0.3)) * ease.outCubic(range(t, at(0, 1), at(0, 1.3))) : 0) : 1;
    const outroLamps = b >= 30 ? 1 + hitEnv(t, bar(30), 3) * 4 : 0;
    for (const m of ledMats) m.emissiveIntensity = b < 4 ? ign * 2.5 : b >= 30 ? 0.6 + outroLamps * 0.3 : 0.5;
    for (const m of redMats) m.emissiveIntensity = b < 3 ? 0 : b < 4 ? 2.5 * ease.outCubic(range(t, bar(3), at(3, 0.3))) : b >= 30 ? 2.2 : 0.6;

    // ------------------------------------------------ lights, env, background, fog
    const L = lights;
    let env = 1, key = 2.2, fill = 1.4, hemi = 0.6, rim = 24 + kick * 30, head = 0;
    let bg = BRAND.studio;
    if (b < 4) {
      env = 0.12 + 0.06 * Math.sin(t * 2); key = 0.12; fill = 0.05; hemi = 0.03; rim = 7 + kick * 5; bg = bgIntro;
    } else if (inXray) {
      env = 0.35; key = 0.7; fill = 0.5; hemi = 0.2; rim = 10; bg = bgXray;
    } else if (b >= 24 && b < 28) {
      env = 0.25; key = 0.3; fill = 0.2; hemi = 0.1; rim = 0; bg = bgHolo;
    } else if (b >= 30) {
      env = 1.0; head = 0; rim = 18;
    } else if (b >= 16 && b < 24) {
      env = 1.1; rim = 20 + kick * 60;
    }
    env += imp * 0.25;
    scene.environmentIntensity = env;
    scene.environmentRotation.set(0, t * 0.15 + (b < 4 ? bi.barIndex * 1.3 : 0), 0);
    L.key.intensity = key; L.fill.intensity = fill; L.hemi.intensity = hemi;
    L.rimA.intensity = rim; L.rimB.intensity = rim * 0.8;
    L.head.intensity = head;
    // intro light sweep along the car body, one pass per bar
    L.sweep.intensity = 0;
    if (b < 4) {
      const k = (t % BAR) / BAR;
      L.sweep.position.set(1.7 * (bi.barIndex === 1 ? -1 : 1), 1.2, lerp(-2.8, 2.8, k));
      L.sweep.intensity = 5 * Math.sin(Math.PI * k);
    }
    scene.background.copy(tmpColor.copy(bg));
    scene.fog.color.copy(scene.background);
    scene.fog.density = b >= 16 && b < 24 ? 0.008 : b >= 24 && b < 28 ? 0.01 : 0.014;

    // floor
    const fu = floor.material.uniforms;
    fu.uScroll.value = -dist;
    fu.uGrid.value = b < 4 ? 0.12 : inXray ? 0.9 : b >= 24 && b < 28 ? 0.14 : b >= 16 && b < 24 ? 0.7 : 0.55;
    fu.uPulse.value = (b >= 4 && b < 12) || (b >= 16 && b < 24) || b >= 28 ? kick * (b >= 16 && b < 24 ? 1 : 0.5) : 0;
    fu.uPulseR.value = bi.frac * (b >= 16 && b < 24 ? 34 : 12);
    fu.uShadow.value = b < 12 || b >= 29 ? 1 : 0.3;
    fu.uGlow.value = b < 4 ? 0.15 : b >= 30 ? 0.6 + hitEnv(t, bar(30), 2) : 0.35;
    fu.uFadeR.value = b >= 16 && b < 24 ? 40 : b >= 24 && b < 28 ? 11 : 24;
    fu.uColor.value.set(b >= 24 && b < 28 ? '#2fd6ff' : b >= 10 && b < 11 ? '#ff7a2a' : '#23b88a');
    fu.uBase.value.copy(scene.background).multiplyScalar(0.75);

    // dust + streaks
    dust.material.uniforms.uTime.value = t;
    dust.material.uniforms.uFlow.value = dist * 0.4 + (b >= 16 && b < 24 ? (t - bar(16)) * 6 : 0);
    dust.material.uniforms.uOpacity.value = b < 4 ? 0.35 : b >= 16 && b < 24 ? 0.9 : 0.55;
    const streakI = b < 4 ? 0.25 : b < 8.5 ? 1 : b >= 16 && b < 24 ? 0.55 + kick * 0.3 : b >= 30 ? 0.2 : 0;
    updateStreaks(streaks, t, b >= 16 && b < 24 ? 55 : Math.max(8, speedAt(t) * 2.4), streakI);

    // ------------------------------------------------ 3D type + camera
    updateCamera(camera, t);
    type3d.update(t, camera);

    // ------------------------------------------------ HUD
    const scan = scanZ !== null ? { screen: project(new THREE.Vector3(0, 1.45, scanZ)), progress: scanProg, mode: scanMode } : null;
    for (const c of callouts) {
      // current world position of the detail
      c.p.solidBatch.getMatrixAt(c.p.solidId, m4);
      c.screen = project(new THREE.Vector3().setFromMatrixPosition(m4));
      c.dir = c.screen.x < 960 ? 1 : -1;
      c.lift = c.screen.y > 540 ? -120 : -90;
    }
    const dims = {
      front: project(new THREE.Vector3(0, 0.02, ext.min.z)), rear: project(new THREE.Vector3(0, 0.02, ext.max.z)),
      wf: project(new THREE.Vector3(wf.x + 0.3, 0.02, wf.z)), wr: project(new THREE.Vector3(wr.x + 0.3, 0.02, wr.z)),
      floor: project(new THREE.Vector3(ext.max.x + 0.4, 0, ext.min.z + 0.4)), roof: project(new THREE.Vector3(ext.max.x + 0.4, ext.max.y, ext.min.z + 0.4)),
      length: ext.max.z - ext.min.z, wheelbase: wr.z - wf.z, height: ext.max.y,
    };
    hud.draw(t, {
      total: parts.length, visibleCount, tickerNames, scan, callouts, detachList, landList, assemblies, dims,
      assembledPct: b >= 28 ? landed / parts.length : 0,
      paintHistory: [PAINTS[1], PAINTS[2], PAINTS[3], PAINTS[4]],
    });

    // ------------------------------------------------ post
    const u = final.uniforms;
    const cut = hitsEnv(t, CUTS, 20);
    u.uTime.value = t;
    u.tHud.value = hud.texture;
    u.uFlash.value = cut * 0.16 + hitsEnv(t, IMPACTS, 14) * (b >= 18 && b < 24 ? 0.2 : 0.32) + (t < at(16, 0.08) && t >= bar(16) ? 0.6 : 0);
    u.uFlashColor.value.set(b >= 24 && b < 28 ? '#8ffcff' : '#ffffff');
    u.uChroma.value = 0.0025 + imp * 0.02 + (b >= 16 && b < 24 ? kick * 0.006 : 0) + cut * 0.01;
    let glitch = 0;
    if (t >= at(3, 2) && t < bar(4)) glitch = lerp(0.25, 1, range(t, at(3, 2), bar(4)));
    for (const g0 of [at(0, 1), at(0, 2), at(19, 3), at(23, 3)]) if (t >= g0 && t < g0 + (g0 > bar(10) ? BEAT : 0.12)) glitch = Math.max(glitch, 0.75);
    if (t >= bar(24) && t < bar(24) + 0.2) glitch = 0.6;
    u.uGlitch.value = glitch;
    u.uHudChroma.value = glitch * 0.004 + imp * 0.002;
    u.uInvert.value = (t >= bar(16) && t < bar(16) + 0.07) || (t >= bar(20) && t < bar(20) + 0.06) ? 1 : 0;
    u.uLetterbox.value = b < 4 ? 0.128 : 0.128 * (1 - ease.outExpo(range(t, bar(4), bar(4) + 0.3)));
    u.uSceneFade.value = range(t, 0, 0.5) * (1 - range(t, at(32, 0), at(32, 2)) * 0.85);
    u.uFade.value = 1 - range(t, DURATION - 0.35, DURATION);
    u.uZoom.value = 1 + (b >= 16 && b < 24 ? kick * 0.02 : 0) + imp * 0.03;
    u.uVignette.value = b < 4 ? 0.95 : 0.7;
    bloom.strength = 0.35 + (inXray ? 0.25 : 0) + (b >= 24 && b < 28 ? 0.3 : 0) + (b >= 16 && b < 24 ? kick * 0.2 : 0) + imp * 0.15 + (b >= 30 ? 0.1 : 0);
    bloom.radius = b >= 24 && b < 28 ? 0.8 : 0.55;

    composer.render();
  }

  return { update };
}
