// Kinetic typography + HUD, drawn on a 2D canvas every frame and composited
// in the final post pass. Design space is 1920x1080; all timing is on the beat.
import * as THREE from 'three';
import { BAR, BEAT, at, bar, beatInfo, clamp, ease, hash, lerp, range, sectionAt } from './timeline.js';
import { FORMATIONS } from './choreo.js';

const W = 1920, H = 1080;
const CREAM = '#f4f4ef', MINT = '#b9ffe5', FOCUS = '#178378', RED = '#ff3347', INK = '#0b0f12';
const DISPLAY = 'Manrope, sans-serif';
const MONO = '"JetBrains Mono", monospace';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

export function createHud(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const g = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.premultiplyAlpha = false;

  // ------------------------------------------------------------ primitives
  const font = (size, weight = 800, family = DISPLAY) => `${weight} ${size}px ${family}`;
  function text(str, x, y, o = {}) {
    g.save();
    g.globalAlpha *= o.alpha ?? 1;
    g.font = font(o.size ?? 40, o.weight ?? 800, o.family ?? DISPLAY);
    g.letterSpacing = `${o.spacing ?? 0}px`;
    g.textAlign = o.align ?? 'left';
    g.textBaseline = o.baseline ?? 'alphabetic';
    if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.color ?? CREAM; g.strokeText(str, x, y); }
    else { g.fillStyle = o.color ?? CREAM; g.fillText(str, x, y); }
    g.restore();
  }
  function measure(str, size, weight = 800, family = DISPLAY, spacing = 0) {
    g.save(); g.font = font(size, weight, family); g.letterSpacing = `${spacing}px`;
    const w = g.measureText(str).width; g.restore(); return w;
  }
  function scramble(str, k, seed = 0, t = 0) {
    const n = str.length, done = Math.floor(clamp(k) * n);
    let out = '';
    const frame = Math.floor(t * 30);
    for (let i = 0; i < n; i++) {
      const ch = str[i];
      if (i < done || ch === ' ') out += ch;
      else if (i < done + 6) out += GLYPHS[Math.floor(hash(i * 13 + frame * 7 + seed) * GLYPHS.length)];
      else out += ' ';
    }
    return out;
  }
  // RGB-split draw for the first frames of a hit
  function splitText(str, x, y, o, amount) {
    if (amount <= 0.001) { text(str, x, y, o); return; }
    g.save();
    g.globalCompositeOperation = 'lighter';
    text(str, x - amount, y, { ...o, color: '#ff2040' });
    text(str, x + amount, y, { ...o, color: '#20ffd0' });
    text(str, x, y + amount * 0.3, { ...o, color: '#3050ff', alpha: (o.alpha ?? 1) * 0.6 });
    g.restore();
    text(str, x, y, { ...o, alpha: (o.alpha ?? 1) * 0.85 });
  }

  // Slam: word hits on t0, holds, squashes out.
  function slam(str, t, t0, hold, o = {}) {
    const local = t - t0;
    if (local < 0 || local > hold + 0.18) return;
    const size = o.size ?? 220;
    const inK = ease.outExpo(clamp(local / 0.16));
    const outK = ease.inCubic(clamp((local - hold) / 0.18));
    const s = (1 + (1 - inK) * 0.6) * (1 + local * (o.drift ?? 0.04));
    const x = o.x ?? W / 2, y = o.y ?? H / 2;
    g.save();
    g.translate(x, y);
    g.scale(s, s * (1 - outK));
    if (o.rotate) g.rotate(o.rotate * (1 - inK));
    // ghost trails
    for (let i = 3; i >= 1; i--) {
      const gs = 1 + i * 0.07 * (1 - inK);
      if (local < 0.25) {
        g.save(); g.scale(gs, gs);
        text(str, 0, 0, { ...o, size, align: 'center', baseline: 'middle', alpha: 0.18 / i, color: o.ghost ?? MINT });
        g.restore();
      }
    }
    splitText(str, 0, 0, { ...o, size, align: 'center', baseline: 'middle' }, (1 - clamp(local / 0.2)) * 22);
    g.restore();
  }

  // Letters rise out of a mask, staggered.
  function rise(str, t, t0, o = {}) {
    const size = o.size ?? 120, spacing = o.spacing ?? 0, stagger = o.stagger ?? 0.035;
    const total = measure(str, size, o.weight ?? 800, o.family ?? DISPLAY, spacing);
    let x = (o.x ?? W / 2) - (o.align === 'left' ? 0 : o.align === 'right' ? total : total / 2);
    const y = o.y ?? H / 2;
    const outK = o.out !== undefined ? ease.inExpo(range(t, o.out, o.out + 0.25)) : 0;
    g.save();
    g.beginPath(); g.rect(0, y - size * 1.05, W, size * 1.3); g.clip();
    [...str].forEach((ch, i) => {
      const k = ease.outExpo(range(t, t0 + i * stagger, t0 + i * stagger + 0.5));
      const w = measure(ch, size, o.weight ?? 800, o.family ?? DISPLAY, spacing);
      const dy = (1 - k) * size * 1.1 - outK * size * 1.2;
      text(ch, x, y + dy, { ...o, size, alpha: (o.alpha ?? 1) * clamp(k * 3) });
      x += w;
    });
    g.restore();
  }

  // Outlined echo stack scrolling vertically behind a solid word.
  function echo(str, t, t0, t1, o = {}) {
    if (t < t0 || t > t1) return;
    const size = o.size ?? 260;
    const k = range(t, t0, t1);
    const inK = ease.outExpo(range(t, t0, t0 + 0.2)), outK = ease.inExpo(range(t, t1 - 0.2, t1));
    const x = o.x ?? W / 2, y = o.y ?? H / 2;
    g.save();
    g.globalAlpha = inK * (1 - outK);
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const yy = y + i * size * 0.82 + ((k * size * 0.82 * 2) % (size * 0.82)) * (o.dir ?? 1);
      text(str, x, yy, { size, align: 'center', baseline: 'middle', stroke: 2, color: o.color ?? CREAM, alpha: 0.5 - Math.abs(i) * 0.1 });
    }
    splitText(str, x, y, { size, align: 'center', baseline: 'middle', color: o.fill ?? CREAM }, (1 - clamp((t - t0) / 0.15)) * 20);
    g.restore();
  }

  // Text band scrolling across the frame at an angle.
  function band(str, y, angle, speed, t, o = {}) {
    const size = o.size ?? 90;
    const unit = str + '   ·   ';
    const w = measure(unit, size, o.weight ?? 800, o.family ?? DISPLAY, o.spacing ?? 0);
    g.save();
    g.translate(W / 2, y); g.rotate(angle);
    if (o.bg) { g.fillStyle = o.bg; g.fillRect(-W, -size * 0.72, W * 2, size * 1.3); }
    let x = -W - ((t * speed) % w + w) % w;
    while (x < W) { text(unit, x, size * 0.34, { ...o, size }); x += w; }
    g.restore();
  }

  // Letters of a phrase arranged around a circle.
  function radial(str, cx, cy, r, rot, size, o = {}) {
    const chars = [...str];
    chars.forEach((ch, i) => {
      const a = rot + (i / chars.length) * Math.PI * 2;
      g.save(); g.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.rotate(a + Math.PI / 2);
      text(ch, 0, 0, { ...o, size, align: 'center', baseline: 'middle' });
      g.restore();
    });
  }

  // Letters explode outward from a word.
  function shatter(str, t, t0, dur, o = {}) {
    const local = t - t0;
    if (local < 0 || local > dur) return;
    const size = o.size ?? 300;
    const total = measure(str, size);
    let x = W / 2 - total / 2;
    const k = ease.outCubic(local / dur);
    [...str].forEach((ch, i) => {
      const w = measure(ch, size);
      const cx = x + w / 2, dx = cx - W / 2;
      const vx = dx * 1.8 + (hash(i * 3.1) - 0.5) * 900, vy = (hash(i * 7.3) - 0.5) * 1100;
      g.save();
      g.translate(cx + vx * k, H / 2 + vy * k);
      g.rotate((hash(i * 5.7) - 0.5) * 4 * k);
      g.scale(1 + k * 0.8, 1 + k * 0.8);
      text(ch, 0, 0, { size, align: 'center', baseline: 'middle', alpha: 1 - k, color: o.color ?? CREAM });
      g.restore();
      x += w;
    });
  }

  function line(x1, y1, x2, y2, color = MINT, w = 1.5, alpha = 1) {
    g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = w;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
  }

  // Leader-line callout anchored to a projected 3D point.
  function callout(anchor, label, sub, t, t0, t1, dir = 1, lift = -110) {
    if (!anchor || !anchor.visible || t < t0 || t > t1) return;
    const k = range(t, t0, t0 + 0.35), out = range(t, t1 - 0.2, t1);
    const a = 1 - out;
    const ex = anchor.x + dir * 60, ey = anchor.y + lift;
    const lx = ex + dir * 220;
    const p1 = ease.outCubic(clamp(k * 2)), p2 = ease.outCubic(clamp(k * 2 - 1));
    g.save(); g.globalAlpha = a;
    g.strokeStyle = MINT; g.lineWidth = 2;
    g.beginPath(); g.arc(anchor.x, anchor.y, 7 + Math.sin(t * 12) * 2, 0, Math.PI * 2); g.stroke();
    g.fillStyle = MINT; g.beginPath(); g.arc(anchor.x, anchor.y, 3, 0, Math.PI * 2); g.fill();
    line(anchor.x, anchor.y, lerp(anchor.x, ex, p1), lerp(anchor.y, ey, p1), MINT, 1.5);
    if (p2 > 0) line(ex, ey, lerp(ex, lx, p2), ey, MINT, 1.5);
    const tx = dir > 0 ? ex + 8 : lx + 8;
    text(scramble(label.toUpperCase(), range(t, t0 + 0.15, t0 + 0.6), label.length, t), tx, ey - 12, { size: 22, weight: 700, family: MONO, color: CREAM, spacing: 1 });
    text(scramble(sub, range(t, t0 + 0.25, t0 + 0.7), 5, t), tx, ey + 22, { size: 15, weight: 400, family: MONO, color: MINT, spacing: 2 });
    g.restore();
  }

  // Engineering dimension line between two projected points.
  function dimension(a, b, label, t, t0, offset = 40) {
    if (!a?.visible || !b?.visible || t < t0) return;
    const k = ease.outCubic(range(t, t0, t0 + 0.5));
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * offset, ny = dx / len * offset;
    const A = { x: a.x + nx, y: a.y + ny }, B = { x: a.x + nx + dx * k, y: a.y + ny + dy * k };
    line(a.x, a.y, A.x + nx * 0.2, A.y + ny * 0.2, MINT, 1, 0.6);
    line(b.x, b.y, b.x + nx * 1.2, b.y + ny * 1.2, MINT, 1, 0.6 * k);
    line(A.x, A.y, B.x, B.y, MINT, 1.5);
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    g.save(); g.translate(mx, my); let ang = Math.atan2(dy, dx); if (Math.abs(ang) > Math.PI / 2) ang += Math.PI; g.rotate(ang);
    text(label, 0, -10, { size: 18, weight: 700, family: MONO, color: MINT, align: 'center', alpha: k, spacing: 2 });
    g.restore();
  }

  function wordmark(x, y, size, k, t, o = {}) {
    // "object bloom." — lower-case wordmark with the mint full stop
    const str = 'object bloom';
    const spacing = lerp(size * 0.6, -size * 0.02, ease.outExpo(k));
    const total = measure(str, size, 800, DISPLAY, spacing) + size * 0.3;
    let cx = x - total / 2;
    [...str].forEach((ch, i) => {
      const lk = ease.outExpo(clamp(k * 1.6 - i * 0.05));
      const w = measure(ch, size, 800, DISPLAY, spacing);
      text(ch, cx, y + (1 - lk) * size * 0.6, { size, weight: 800, color: o.color ?? CREAM, alpha: lk * (o.alpha ?? 1), spacing });
      cx += w;
    });
    const dk = ease.outElastic(clamp(k * 1.4 - 0.5));
    g.save(); g.fillStyle = MINT; g.globalAlpha = (o.alpha ?? 1) * clamp(dk * 2);
    g.beginPath(); g.arc(cx + size * 0.12, y - size * 0.08, size * 0.085 * Math.max(0, dk), 0, Math.PI * 2); g.fill(); g.restore();
  }

  function bloomMark(cx, cy, r, k, rot) {
    // eight petals opening (the parts-bloom formation, as a mark)
    for (let i = 0; i < 8; i++) {
      const pk = ease.outBack(clamp(k * 1.5 - i * 0.06));
      if (pk <= 0) continue;
      const a = rot + (i / 8) * Math.PI * 2;
      g.save(); g.translate(cx, cy); g.rotate(a);
      g.globalAlpha = clamp(pk);
      const grd = g.createLinearGradient(0, 0, r * pk, 0);
      grd.addColorStop(0, FOCUS); grd.addColorStop(1, MINT);
      g.fillStyle = grd;
      g.beginPath(); g.ellipse(r * 0.55 * pk, 0, r * 0.5 * pk, r * 0.18 * pk, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.save(); g.fillStyle = CREAM; g.globalAlpha = clamp(k * 3);
    g.beginPath(); g.arc(cx, cy, r * 0.11 * clamp(k * 2), 0, Math.PI * 2); g.fill(); g.restore();
  }

  // ------------------------------------------------------------ frame chrome
  function chrome(t, info, alpha) {
    if (alpha <= 0) return;
    g.save(); g.globalAlpha = alpha;
    const m = 44, L = 34;
    g.strokeStyle = CREAM; g.lineWidth = 2;
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke();
    }
    const bi = beatInfo(t);
    const sec = sectionAt(t);
    text('object bloom.', m + 12, m + 42, { size: 22, weight: 800, color: CREAM });
    text(sec.label, m + 12, m + 70, { size: 14, weight: 700, family: MONO, color: MINT, spacing: 3 });
    // timecode + beat
    const fr = Math.floor((t % 1) * 30);
    const tc = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
    text(tc, W - m - 12, m + 40, { size: 20, weight: 700, family: MONO, align: 'right', color: CREAM, spacing: 2 });
    if (bi.frac < 0.5) { g.fillStyle = RED; g.beginPath(); g.arc(W - m - 190, m + 33, 6, 0, Math.PI * 2); g.fill(); }
    text('128 BPM  ·  BAR ' + String(bi.barIndex + 1).padStart(2, '0'), W - m - 12, m + 68, { size: 13, weight: 400, family: MONO, align: 'right', color: MINT, spacing: 3 });
    // beat meter
    for (let i = 0; i < 4; i++) {
      const on = i === bi.inBar;
      g.fillStyle = on ? MINT : 'rgba(244,244,239,0.25)';
      g.fillRect(W - m - 12 - (4 - i) * 22, H - m - 26, 16, on ? 16 * (1 - bi.frac * 0.5) + 4 : 4);
    }
    // detail counter
    text(`DETAILS ${String(info.visibleCount).padStart(3, '0')} / ${info.total}`, m + 12, H - m - 14, { size: 14, weight: 700, family: MONO, color: CREAM, spacing: 3 });
    g.restore();
  }

  function ticker(t, info, y, alpha) {
    if (alpha <= 0) return;
    const names = info.tickerNames;
    const str = names.join('   /   ');
    g.save(); g.globalAlpha = alpha * 0.8;
    band(str, y, 0, 260, t, { size: 15, weight: 400, family: MONO, color: MINT, spacing: 2 });
    g.restore();
  }

  // ------------------------------------------------------------ the script
  function draw(t, info) {
    const s = width / W;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, width, height);
    g.setTransform(s, 0, 0, s, 0, 0);
    const b = t / BAR;
    const bi = beatInfo(t);

    // ===== 00 IGNITION (letterboxed, type lives in the band)
    if (b < 4) {
      text(scramble('OBJECT BLOOM  —  458 PARTS STUDY  —  930 DETAILS', range(t, 0.1, 1.4), 1, t), W / 2, 205, { size: 16, weight: 700, family: MONO, align: 'center', color: MINT, spacing: 5, alpha: 1 - range(t, bar(3.8), bar(4)) });
      slam('ONE', t, at(0, 1), BEAT * 0.9, { size: 250, x: W / 2 - 250 });
      slam('CAR.', t, at(0, 2), BEAT * 1.9, { size: 250, x: W / 2 + 230 });
      // 930 count-up
      if (b >= 1 && b < 2) {
        const k = ease.outExpo(range(t, bar(1), at(1, 1.6)));
        const n = String(Math.round(k * 930)).padStart(3, '0');
        const pop = 1 + Math.exp(-bi.frac * 9) * 0.05;
        g.save(); g.translate(W / 2 - 180, H / 2); g.scale(pop, pop);
        splitText(n, 0, 0, { size: 330, weight: 800, align: 'center', baseline: 'middle', family: DISPLAY, color: CREAM }, (1 - k) * 18);
        g.restore();
        rise('DETAILS.', t, at(1, 2), { size: 120, x: W / 2 + 330, y: H / 2 + 45, color: MINT, stagger: 0.03, out: at(1, 3.7) });
      }
      if (b >= 2 && b < 3) {
        rise('A CLOSER LOOK', t, bar(2), { size: 110, y: H / 2 - 20, stagger: 0.028, out: at(2, 3.6) });
        rise('AT EVERY LAYER.', t, at(2, 1.5), { size: 110, y: H / 2 + 105, color: MINT, stagger: 0.028, out: at(2, 3.6) });
      }
      if (b >= 3 && b < 4) {
        const k = range(t, bar(3), at(3, 2));
        const glitchy = b >= 3.5 ? 1 : 0;
        g.save();
        if (glitchy) g.translate((hash(Math.floor(t * 30)) - 0.5) * 40, 0);
        wordmark(W / 2, H / 2 + 50, 190, k, t);
        g.restore();
        text(scramble('TAKE IT APART.  LOOK INSIDE.', range(t, at(3, 1), at(3, 2.5)), 3, t), W / 2, H / 2 + 150, { size: 20, weight: 700, family: MONO, align: 'center', color: MINT, spacing: 6 });
      }
    }

    // ===== 01 REVEAL
    if (b >= 4 && b < 8) {
      // 458 Italia. title block (explorer typography: Manrope + Georgia italic)
      const k = range(t, at(4, 0.25), at(4, 1.5));
      const out = range(t, at(5, 3), bar(6));
      g.save(); g.globalAlpha = 1 - out;
      rise('458', t, at(4, 0.25), { size: 170, x: 120, y: H - 150, align: 'left', stagger: 0.05 });
      text('Italia.', 120 + measure('458', 170) + 24, H - 150, { size: 120, weight: 400, family: 'Georgia, serif', color: CREAM, alpha: ease.outCubic(range(t, at(4, 1), at(4, 1.6))) });
      text(scramble('ONE CAR. A CLOSER LOOK AT EVERY LAYER.', k, 9, t), 124, H - 100, { size: 18, weight: 700, family: MONO, color: MINT, spacing: 4 });
      g.restore();
      // speed type while tracking (bar 5)
      if (b >= 5 && b < 6) {
        const a = ease.outExpo(range(t, bar(5), at(5, 0.5))) * (1 - range(t, at(5, 3.5), bar(6)));
        g.save(); g.globalAlpha = a;
        band('IN MOTION', 250, 0, -2600, t, { size: 150, color: 'rgba(244,244,239,0.9)' });
        g.restore();
      }
      // overhead: EVERY ANGLE rotates with the camera
      if (b >= 6 && b < 7) {
        g.save(); g.translate(W / 2, H / 2); g.rotate(-range(t, bar(6), bar(7)) * Math.PI / 2 * 0.5);
        g.translate(-W / 2, -H / 2);
        echo('EVERY ANGLE.', t, at(6, 0), at(6, 3.9), { size: 150 });
        g.restore();
      }
      // paint swaps on each beat (explorer finishes)
      if (b >= 7 && b < 8) {
        rise('MAKE IT YOURS.', t, bar(7), { size: 110, x: 120, y: 270, align: 'left', stagger: 0.03, out: at(7, 3.7) });
        const sw = info.paintHistory[bi.inBar];
        if (sw) {
          const lk = range(t, at(7, bi.inBar), at(7, bi.inBar) + 0.25);
          g.save(); g.fillStyle = sw.hex; g.strokeStyle = CREAM; g.lineWidth = 3;
          g.beginPath(); g.arc(150, 360, 26 * ease.outBack(lk), 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
          text(scramble(sw.name.toUpperCase(), lk, bi.inBar, t), 196, 370, { size: 28, weight: 700, family: MONO, color: CREAM, spacing: 4 });
        }
      }
    }

    // ===== 02 X-RAY
    if (b >= 8 && b < 12) {
      slam('LOOK INSIDE.', t, bar(8), BEAT * 1.6, { size: 190, ghost: MINT });
      // scan readout riding the scan sheet
      if (info.scan && info.scan.screen?.visible) {
        const sx = info.scan.screen.x;
        line(sx, 140, sx, H - 140, MINT, 1.5, 0.6);
        text(`SCAN ${String(Math.round(info.scan.progress * 100)).padStart(3, '0')}%`, sx + 14, 170, { size: 18, weight: 700, family: MONO, color: MINT, spacing: 3 });
        text(info.scan.mode, sx + 14, 195, { size: 13, weight: 400, family: MONO, color: CREAM, spacing: 3 });
      }
      // callouts synced to the bleeps
      info.callouts.forEach((c) => callout(c.screen, c.label, c.sub, t, c.t0, c.t1, c.dir, c.lift));
      if (b >= 10 && b < 11.5) text('THERMAL', W - 110, 150, { size: 64, weight: 800, align: 'right', color: '#ff8a3d', alpha: 0.9 * (0.6 + 0.4 * Math.exp(-bi.frac * 5)) });
    }

    // ===== 03 DECONSTRUCT
    if (b >= 12 && b < 16) {
      if (b < 14) {
        // split slabs "TAKE IT" / "APART."
        const k = ease.outExpo(range(t, bar(12), at(12, 0.6)));
        const out = ease.inExpo(range(t, at(13, 3), bar(14)));
        g.save(); g.beginPath(); g.rect(0, 0, W, H / 2); g.clip();
        text('TAKE IT', W / 2 - (1 - k) * 1400 - out * 1400, H / 2 + 20, { size: 230, align: 'center', baseline: 'alphabetic' });
        g.restore();
        g.save(); g.beginPath(); g.rect(0, H / 2, W, H / 2); g.clip();
        text('APART.', W / 2 + (1 - k) * 1400 + out * 1400, H / 2 + 185, { size: 230, align: 'center', color: MINT });
        g.restore();
      }
      // detached assemblies list
      const list = info.detachList;
      list.forEach((d, i) => {
        if (t < d.t) return;
        const k = ease.outExpo(range(t, d.t, d.t + 0.3));
        const y = 190 + i * 44;
        g.save(); g.globalAlpha = k * (1 - range(t, at(15, 2.5), at(15, 3)));
        text(scramble(d.name.toUpperCase(), k, i, t), 90 + (1 - k) * -60, y, { size: 22, weight: 700, family: MONO, color: CREAM, spacing: 3 });
        text(String(d.count).padStart(3, '0'), 470, y, { size: 22, weight: 700, family: MONO, color: MINT });
        g.restore();
      });
      const detached = list.reduce((a, d) => a + (t >= d.t ? d.count : 0), 0);
      if (b < 15.75) text(`DETACHED ${String(detached).padStart(3, '0')} / 930`, W - 90, H - 120, { size: 40, weight: 800, align: 'right', color: CREAM });
      // countdown
      ['3', '2', '1'].forEach((n, i) => slam(n, t, at(15, i), BEAT * 0.8, { size: 420, ghost: RED }));
      if (t >= at(15, 3) && t < bar(16)) text('bloom.', W / 2, H / 2, { size: 44, weight: 800, align: 'center', baseline: 'middle', color: MINT, alpha: range(t, at(15, 3), at(15, 3.4)) });
    }

    // ===== 04 DROP
    if (b >= 16 && b < 24) {
      // the hit: giant BLOOM fills the frame then shatters with the parts
      if (t < at(16, 0.35)) {
        const k = range(t, bar(16), at(16, 0.35));
        g.save(); g.translate(W / 2, H / 2); g.scale(1 + k * 0.15, 1 + k * 0.15); g.translate(-W / 2, -H / 2);
        splitText('BLOOM', W / 2, H / 2, { size: 520, align: 'center', baseline: 'middle', color: CREAM }, 30 * (1 - k));
        g.restore();
      }
      shatter('BLOOM', t, at(16, 0.35), BEAT * 1.4, { size: 520 });
      // lyric words, one per beat
      const words = [
        [at(16, 2), 'EVERY', {}], [at(16, 3), 'PIECE', { color: MINT }],
        [at(17, 0), 'IN', {}], [at(17, 1), 'UNI-', {}], [at(17, 2), 'FORM.', { color: MINT }],
        [at(20, 2), 'INSIDE', { stroke: 3 }], [at(20, 3), 'OUT.', { color: RED }],
        [at(21, 2), '930', { color: MINT }], [at(21, 3), 'DETAILS', {}],
      ];
      for (const [t0, w, o] of words) slam(w, t, t0, BEAT * 0.92, { size: 240, ...o, rotate: (hash(t0) - 0.5) * 0.3 });
      // formation labels, scramble in each cut
      const fi = Math.min(3, Math.floor((b - 16) / 2));
      const f = FORMATIONS[fi];
      const fk = range(t, bar(f.from), at(f.from, 1));
      text(scramble(`FORMATION 0${fi + 1}  //  ${f.name}`, fk, fi, t), W / 2, 120, { size: 20, weight: 700, family: MONO, align: 'center', color: MINT, spacing: 6 });
      // ORBIT echo stack
      echo('ORBIT', t, bar(18), at(18, 1.9), { size: 260 });
      // part-name bands (bar 19)
      if (b >= 19 && b < 20) {
        const a = ease.outExpo(range(t, bar(19), at(19, 0.4))) * (1 - range(t, at(19, 3.5), bar(20)));
        g.save(); g.globalAlpha = a;
        band(info.tickerNames.slice(0, 40).join('  ·  ').toUpperCase(), 330, -0.12, 900, t, { size: 46, bg: 'rgba(11,15,18,0.55)', color: CREAM });
        band(info.tickerNames.slice(40, 80).join('  ·  ').toUpperCase(), 760, -0.12, -1100, t, { size: 46, bg: 'rgba(185,255,229,0.9)', color: INK });
        g.restore();
      }
      // X-RAY strobe title (bar 20)
      if (b >= 20 && b < 20.5) {
        const on = Math.floor(t / (BEAT / 4)) % 2 === 0;
        text('X-RAY', W / 2, H / 2, { size: 300, align: 'center', baseline: 'middle', color: on ? CREAM : MINT, stroke: on ? 0 : 4 });
      }
      // radial letters around the bloom (bars 22-24)
      if (b >= 22 && b < 24) {
        const k = ease.outExpo(range(t, bar(22), at(22, 1)));
        const out = range(t, at(23, 3), bar(24));
        g.save(); g.globalAlpha = k * (1 - out);
        radial('OBJECT BLOOM · OBJECT BLOOM · ', W / 2, H / 2, 420 * k + Math.exp(-bi.frac * 6) * 12, t * 0.5, 44, { color: CREAM, weight: 800 });
        radial('930 DETAILS · ONE RHYTHM · ', W / 2, H / 2, 330 * k, -t * 0.7, 22, { color: MINT, family: MONO, weight: 700 });
        g.restore();
        slam('BLOOM.', t, at(23, 2), BEAT * 1.4, { size: 280, ghost: MINT });
      }
      ticker(t, info, H - 92, 1);
    }

    // ===== 05 BLUEPRINT
    if (b >= 24 && b < 28) {
      const a = ease.outCubic(range(t, bar(24), at(24, 1))) * (1 - range(t, at(27, 3), bar(28)));
      g.save(); g.globalAlpha = a;
      // faint drafting grid
      g.strokeStyle = 'rgba(70,255,196,0.035)'; g.lineWidth = 1;
      for (let x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      rise('EXPLORE', t, bar(24), { size: 150, x: 110, y: 270, align: 'left', stagger: 0.04 });
      rise('THE PARTS.', t, at(24, 1), { size: 150, x: 110, y: 420, align: 'left', stagger: 0.04, color: MINT });
      // title block
      const tb = [['PROJECT', 'OBJECT BLOOM · 458 PARTS STUDY'], ['DETAILS', '930  (882 MODELED + 48 ILLUSTRATIVE V8)'],
        ['ASSEMBLIES', '8'], ['SHEET', '05 / 07'], ['NOTE', 'ILLUSTRATIVE OFFSETS · NOT A SERVICE REFERENCE']];
      const x0 = W - 720, y0 = H - 290;
      g.strokeStyle = MINT; g.lineWidth = 1.5; g.strokeRect(x0, y0, 630, 220);
      tb.forEach(([k, v], i) => {
        const tk = range(t, at(24, 2) + i * BEAT * 0.5, at(24, 2) + i * BEAT * 0.5 + 0.4);
        line(x0, y0 + 44 * (i + 1), x0 + 630, y0 + 44 * (i + 1), MINT, 1, 0.4);
        text(k, x0 + 14, y0 + 28 + 44 * i, { size: 13, weight: 400, family: MONO, color: MINT, spacing: 3 });
        text(scramble(v, tk, i, t), x0 + 150, y0 + 28 + 44 * i, { size: 15, weight: 700, family: MONO, color: CREAM, spacing: 1 });
      });
      // dimensions from projected model points
      const d = info.dims;
      if (d) {
        dimension(d.front, d.rear, `${d.length.toFixed(2)} m  OVERALL`, t, at(25, 0), 70);
        dimension(d.wf, d.wr, `${d.wheelbase.toFixed(2)} m  WHEELBASE`, t, at(25, 2), -60);
        dimension(d.floor, d.roof, `${d.height.toFixed(2)} m`, t, at(26, 0), 60);
      }
      // assembly legend with counts
      info.assemblies.forEach((s, i) => {
        const k = range(t, at(26, 0) + i * BEAT * 0.25, at(26, 0) + i * BEAT * 0.25 + 0.3);
        text(scramble(`${s.name.toUpperCase().padEnd(22, ' ')}${String(s.count).padStart(3, '0')}`, k, i, t), 112, 520 + i * 32, { size: 17, weight: 700, family: MONO, color: i % 2 ? MINT : CREAM, spacing: 2 });
      });
      g.restore();
    }

    // ===== 06 REBUILD
    if (b >= 28 && b < 30) {
      const pct = info.assembledPct;
      text(`ASSEMBLY ${String(Math.round(pct * 100)).padStart(3, '0')}%`, W / 2, H - 150, { size: 64, weight: 800, align: 'center', color: CREAM });
      g.save(); g.fillStyle = 'rgba(244,244,239,0.2)'; g.fillRect(W / 2 - 400, H - 120, 800, 6); g.fillStyle = MINT; g.fillRect(W / 2 - 400, H - 120, 800 * pct, 6); g.restore();
      info.landList.forEach((d) => {
        if (t < d.t || t > d.t + BEAT * 0.95) return;
        slam(d.name.toUpperCase(), t, d.t, BEAT * 0.75, { size: 96, y: 200, ghost: MINT });
      });
      rise('REASSEMBLE.', t, at(29, 2), { size: 130, y: H / 2 - 60, stagger: 0.03, color: MINT, out: bar(30) - 0.05 });
    }

    // ===== 07 OUTRO
    if (b >= 30) {
      const k = range(t, at(30, 0.5), at(31, 0));
      const fade = range(t, at(32, 0), at(32, 2));
      // darken bottom for legibility
      const grd = g.createLinearGradient(0, H * 0.45, 0, H);
      grd.addColorStop(0, 'rgba(11,15,18,0)'); grd.addColorStop(1, `rgba(11,15,18,${0.75 + fade * 0.25})`);
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      const y = lerp(H - 250, H / 2 + 40, ease.inOutCubic(fade));
      bloomMark(W / 2, y - 190 - fade * 20, 70, range(t, at(30, 0.25), at(31, 1)), t * 0.3);
      wordmark(W / 2, y, 150, k, t);
      text(scramble('ONE CAR. A CLOSER LOOK AT EVERY LAYER.', range(t, at(30, 2), at(31, 1)), 4, t), W / 2, y + 70, { size: 20, weight: 700, family: MONO, align: 'center', color: MINT, spacing: 6 });
      // url typed with a caret
      const url = 'objectbloom.com';
      const n = Math.floor(range(t, at(31, 0), at(31, 2)) * url.length);
      const caret = Math.floor(t * 2.5) % 2 ? '_' : ' ';
      if (t >= at(31, 0)) text(url.slice(0, n) + caret, W / 2, y + 140, { size: 44, weight: 800, align: 'center', color: CREAM });
      text('Independent visualization study. Source model by vicent091036. Not affiliated with Ferrari. The V8 is illustrative.', W / 2, H - 58,
        { size: 13, weight: 400, family: MONO, align: 'center', color: 'rgba(244,244,239,0.55)', spacing: 1, alpha: range(t, at(31, 2), at(32, 0)) });
    }

    // frame chrome everywhere except the black open and the logo hold
    const chromeA = range(t, at(0, 3), bar(1)) * (b < 4 ? 0.6 : 1) * (1 - range(t, at(30, 0), at(30, 2)));
    chrome(t, info, chromeA);
    texture.needsUpdate = true;
  }

  return { canvas, texture, draw };
}

export const HUD_SIZE = { W, H };
