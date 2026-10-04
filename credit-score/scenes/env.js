/* env: the living environment under every scene — an illustrated backdrop per chapter world, a 3D perspective floor,
   drifting light leaks, a HUD frame — plus the FX engine (impact bursts, card light sweeps, floating layers,
   breathing silhouettes) and the emotion layers (tension heartbeat, warm bloom). */
const SVGW = (inner, css = '') => `<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:1920px;height:1080px;${css}">${inner}</svg>`;
const drift = (el, vars, d = 9, t0 = 0) => { const n = Math.max(1, Math.floor((TOTAL - t0) / d)); tl.to(el, { ...vars, duration: d, ease: 'sine.inOut', yoyo: true, repeat: n - 1, data: 'drift' }, t0); };
const spin = (el, deg, origin, t0 = 0, t1 = TOTAL) => tl.fromTo(el, { rotation: 0 }, { rotation: deg, svgOrigin: origin, duration: t1 - t0, ease: 'none', data: 'drift', immediateRender: true }, t0);
const bd = (k, html) => { const L = div('abs', worldLayer[k], html, 'inset:0;overflow:hidden'); L.dataset.drift = '1'; return L; };
const rr = (a, b) => a + rnd() * (b - a);
const RECIPE0 = [[.35, '#3dff9a'], [.30, '#4fc3ff'], [.15, '#ffb347'], [.10, '#9b7bff'], [.10, '#ff8fb1']];

/* ---------- per-world backdrops ---------- */
(() => {
  // INTRO: orbiting score rings + ghost numbers
  {
    let rings = ''; [260, 420, 600, 800].forEach((r, i) => { rings += `<circle class="r${i}" cx="1460" cy="540" r="${r}" fill="none" stroke="#fff" stroke-opacity="${.09 - i * .015}" stroke-width="${i % 2 ? 2 : 6}" stroke-dasharray="${i % 2 ? '4 14' : '60 30 8 30'}"/>`; });
    const L = bd('intro', SVGW(`<defs><radialGradient id="eiA"><stop offset="0" stop-color="#7b5cff" stop-opacity=".45"/><stop offset="1" stop-color="#7b5cff" stop-opacity="0"/></radialGradient></defs><circle cx="1460" cy="540" r="700" fill="url(#eiA)"/>${rings}
      ${['742', '688', '801', '615', '760', '579'].map((n, i) => `<text class="gn" x="${120 + i * 300}" y="${180 + (i % 3) * 330}" font-family="Unbounded" font-weight="900" font-size="${120 + (i % 2) * 60}" fill="#fff" fill-opacity=".04">${n}</text>`).join('')}`));
    [0, 1, 2, 3].forEach(i => spin(L.querySelector('.r' + i), i % 2 ? -40 : 30, '1460 540'));
    L.querySelectorAll('.gn').forEach((g, i) => drift(g, { y: i % 2 ? -60 : 60 }, 7 + i));
  }
  // ARCHIVE: 1899 Atlanta skyline at dusk, telegraph wires, chimney smoke, ledger texture
  {
    let sky = '', x = 0, k = 0;
    while (x < 1960) { const w = 90 + ((k * 53) % 120), h = 160 + ((k * 97) % 230); sky += `<rect x="${x}" y="${1080 - h}" width="${w}" height="${h}" fill="#1e140b"/><rect x="${x - 4}" y="${1080 - h}" width="${w + 8}" height="10" fill="#2a1c10"/>`;
      for (let r = 0; r < Math.floor(h / 60); r++) for (let c = 0; c < Math.floor(w / 34); c++) if ((r * 3 + c + k) % 4 === 0) sky += `<rect x="${x + 12 + c * 34}" y="${1080 - h + 26 + r * 60}" width="14" height="22" fill="#ffb347" fill-opacity=".55"/>`;
      if (k % 3 === 1) sky += `<rect x="${x + w * .6}" y="${1080 - h - 50}" width="18" height="50" fill="#1e140b"/>`;
      x += w + 6; k++; }
    sky += `<path d="M1180,1080 L1180,620 L1210,520 L1240,620 L1240,1080 Z" fill="#1a1109"/><path d="M1205,500 L1215,500 L1215,470 L1205,470 Z" fill="#1a1109"/>`;
    const poles = [140, 640, 1500].map(px => `<rect x="${px}" y="560" width="10" height="520" fill="#120b05"/><rect x="${px - 40}" y="590" width="90" height="8" fill="#120b05"/>`).join('');
    const wires = `<path d="M145,594 Q395,680 645,594 Q1070,700 1505,594 Q1720,650 1960,600" fill="none" stroke="#120b05" stroke-width="3"/><path d="M145,610 Q395,700 645,610 Q1070,720 1505,610" fill="none" stroke="#120b05" stroke-width="2"/>`;
    const L = bd('archive', SVGW(`<defs><radialGradient id="eaS" cx=".7" cy=".75" r=".6"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".5"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>
      <pattern id="eaL" width="1920" height="44" patternUnits="userSpaceOnUse"><line x1="0" y1="43" x2="1920" y2="43" stroke="#f1e4c8" stroke-opacity=".05" stroke-width="2"/></pattern></defs>
      <rect width="1920" height="1080" fill="url(#eaL)"/><line x1="230" y1="0" x2="230" y2="1080" stroke="#c8102e" stroke-opacity=".08" stroke-width="3"/><rect width="1920" height="1080" fill="url(#eaS)"/>
      <g class="sky" opacity=".85">${sky}${poles}${wires}</g>`));
    drift(L.querySelector('.sky'), { x: -40 }, 14);
    for (let i = 0; i < 10; i++) { const p = div('abs', L, '', `left:${[260, 900, 1520, 1780][i % 4]}px;top:${700 - (i % 3) * 60}px;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,rgba(241,228,200,.22),rgba(241,228,200,0) 70%)`);
      const per = 6, t0 = i * .9; tl.set(p, { opacity: 0, scale: .5 }, 0);
      for (let t = t0; t < TOTAL - per; t += per * 1.2) { tl.fromTo(p, { opacity: 0, y: 0, scale: .5 }, { opacity: .9, y: -160, scale: 1.4, duration: per / 2, ease: 'sine.out', immediateRender: false, data: 'drift' }, t); tl.to(p, { opacity: 0, y: -320, scale: 2.2, duration: per / 2, ease: 'sine.in', data: 'drift' }, t + per / 2); }
    }
  }
  // BLUEPRINT: rotating gears, an S-curve chart, dimension lines, formulas
  {
    const gear = (cx, cy, r, n, cls) => { let t = ''; for (let i = 0; i < n; i++) { const a = i / n * 360; t += `<rect x="${cx - 9}" y="${cy - r - 22}" width="18" height="30" rx="3" transform="rotate(${a} ${cx} ${cy})"/>`; } return `<g class="${cls}" fill="none" stroke="#bfe0ff" stroke-opacity=".22" stroke-width="3"><circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r * .35}"/>${t}<path d="M${cx - r},${cy} H${cx + r} M${cx},${cy - r} V${cy + r}" stroke-dasharray="10 8"/></g>`; };
    const L = bd('blueprint', SVGW(`${gear(260, 860, 200, 18, 'g1')}${gear(560, 1010, 120, 12, 'g2')}${gear(1700, 200, 170, 16, 'g3')}
      <g fill="none" stroke="#bfe0ff" stroke-opacity=".2" stroke-width="3"><path d="M1180,980 H1860 M1180,980 V560"/><path class="sc" d="M1180,960 C1400,960 1450,600 1840,580" stroke-opacity=".45" stroke-width="5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>
      <path d="M1180,1010 H1860" stroke-dasharray="6 6"/><path d="M1180,1000 V1020 M1860,1000 V1020"/></g>
      <text x="1190" y="545" font-family="JetBrains Mono" font-size="22" fill="#bfe0ff" fill-opacity=".35">P(repay | file)</text>
      <text x="80" y="140" font-family="Instrument Serif" font-style="italic" font-size="64" fill="#bfe0ff" fill-opacity=".12">score = Σ wᵢ·xᵢ</text>
      <text x="820" y="1040" font-family="JetBrains Mono" font-size="20" fill="#bfe0ff" fill-opacity=".25">DWG 001 · SCALE 1:1 · FAIR, ISAAC &amp; CO.</text>`));
    spin(L.querySelector('.g1'), 60, '260 860'); spin(L.querySelector('.g2'), -100, '560 1010'); spin(L.querySelector('.g3'), -50, '1700 200');
    tl.to(L.querySelector('.sc'), { attr: { 'stroke-dashoffset': 0 }, duration: 4, ease: 'power1.inOut', data: 'drift' }, S('f0'));
  }
  // FORMULA: a giant slow donut, rising bars, floating percents
  {
    const C = 2 * Math.PI * 380; let a0 = 0, seg = '';
    RECIPE0.forEach(([f, c]) => { seg += `<circle cx="1560" cy="560" r="380" fill="none" stroke="${c}" stroke-opacity=".12" stroke-width="120" stroke-dasharray="${f * C - 10} ${C}" transform="rotate(${-90 + a0 * 360} 1560 560)"/>`; a0 += f; });
    let bars = ''; for (let i = 0; i < 22; i++) bars += `<rect class="eb" x="${40 + i * 44}" y="760" width="26" height="320" rx="6" fill="#9fffe0" fill-opacity=".07"/>`;
    const L = bd('formula', SVGW(`<g class="dn">${seg}</g>${bars}${['%', '35', '30', '15', '10', '%'].map((t, i) => `<text class="fp" x="${160 + i * 300}" y="${220 + (i % 2) * 200}" font-family="Unbounded" font-weight="900" font-size="110" fill="#9fffe0" fill-opacity=".05">${t}</text>`).join('')}`));
    spin(L.querySelector('.dn'), 45, '1560 560');
    L.querySelectorAll('.eb').forEach((b, i) => { tl.set(b, { transformOrigin: '50% 100%' }, 0); drift(b, { scaleY: .3 + ((i * 37) % 10) / 14 }, 2.2 + (i % 5) * .5, i * .07); });
    L.querySelectorAll('.fp').forEach((g, i) => drift(g, { y: i % 2 ? -50 : 50 }, 6 + i));
  }
  // PRODUCT: a night city with searchlights and a money haze
  {
    const city = (y0, col, lit, seed, sc) => { let s = '', x = -20, k = seed; while (x < 1960) { const w = 70 + (k * 41) % 110, h = (180 + (k * 89) % 300) * sc; s += `<rect x="${x}" y="${y0 - h}" width="${w}" height="${h + 10}" fill="${col}"/>`;
      for (let r = 0; r < Math.floor(h / 30); r++) for (let c = 0; c < Math.floor(w / 22); c++) if ((r * 5 + c * 3 + k) % 5 < 2) s += `<rect x="${x + 6 + c * 22}" y="${y0 - h + 10 + r * 30}" width="10" height="14" fill="${lit}"/>`;
      x += w + 4; k++; } return s; };
    const beams = [300, 960, 1600].map((bx, i) => `<path class="sb${i}" d="M${bx},1080 L${bx - 120},0 L${bx + 120},0 Z" fill="url(#epB)" />`).join('');
    const L = bd('product', SVGW(`<defs><linearGradient id="epB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></linearGradient>
      <radialGradient id="epM" cx=".8" cy=".15" r=".25"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>
      <rect width="1920" height="1080" fill="url(#epM)"/>${beams}<g class="far" opacity=".55">${city(1000, '#141b3a', 'rgba(255,233,168,.25)', 3, .9)}</g><g class="near">${city(1090, '#0b1028', 'rgba(255,233,168,.5)', 11, .75)}</g>`));
    [0, 1, 2].forEach(i => { const b = L.querySelector('.sb' + i); tl.set(b, { svgOrigin: `${[300, 960, 1600][i]} 1080`, rotation: -18 + i * 14 }, 0); drift(b, { rotation: 18 - i * 14 }, 6 + i * 1.3); });
    drift(L.querySelector('.far'), { x: -30 }, 16); drift(L.querySelector('.near'), { x: -70 }, 16);
  }
  // ALERT: server-room silhouettes with breathing LEDs, a scan bar, hazard bands
  {
    let racks = ''; for (let i = 0; i < 9; i++) { const x = i * 220 - 30, h = 520 + (i % 3) * 80; racks += `<rect x="${x}" y="${1080 - h}" width="180" height="${h}" rx="8" fill="#1a0509"/>`; for (let r = 0; r < 12; r++) racks += `<rect x="${x + 16}" y="${1080 - h + 20 + r * 40}" width="148" height="26" rx="4" fill="#2a0a10"/><circle class="led" cx="${x + 30}" cy="${1080 - h + 33 + r * 40}" r="4" fill="${r % 3 ? '#ff4a3d' : '#ffb347'}"/>`; }
    const haz = y => `<rect x="0" y="${y}" width="1920" height="26" fill="url(#ehz)"/>`;
    const L = bd('alert', SVGW(`<defs><pattern id="ehz" width="60" height="26" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)"><rect width="30" height="26" fill="#ffd23f" fill-opacity=".14"/></pattern>
      <linearGradient id="esc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a3d" stop-opacity="0"/><stop offset=".5" stop-color="#ff4a3d" stop-opacity=".25"/><stop offset="1" stop-color="#ff4a3d" stop-opacity="0"/></linearGradient></defs>
      <g opacity=".75">${racks}</g>${haz(0)}${haz(1054)}<rect class="scan" x="0" y="-160" width="1920" height="160" fill="url(#esc)"/>`));
    L.querySelectorAll('.led').forEach((l, i) => drift(l, { opacity: .15 }, 1.2 + (i % 7) * .3, (i % 11) * .2));
    tl.fromTo(L.querySelector('.scan'), { y: 0 }, { y: 1240, duration: 4.5, ease: 'none', repeat: Math.floor(TOTAL / 4.5), data: 'drift' }, 0);
  }
  // COST: a suburban street at golden hour
  {
    let row = ''; for (let i = 0; i < 12; i++) { const x = i * 170 - 20, h = 90 + (i % 3) * 30; row += `<path d="M${x},${1080 - 120} L${x},${1080 - 120 - h} L${x + 70},${1080 - 120 - h - 60} L${x + 140},${1080 - 120 - h} L${x + 140},${1080 - 120} Z" fill="#0d2a14"/><rect x="${x + 50}" y="${1080 - 120 - h + 30}" width="30" height="26" fill="#ffe9a8" fill-opacity=".45"/>`;
      row += `<circle cx="${x + 155}" cy="${1080 - 170 - (i % 2) * 30}" r="${40 + (i % 3) * 10}" fill="#0a2410"/><rect x="${x + 152}" y="${1080 - 140}" width="6" height="40" fill="#0a2410"/>`; }
    const L = bd('cost', SVGW(`<defs><radialGradient id="ecS" cx=".5" cy=".95" r=".6"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
      <rect width="1920" height="1080" fill="url(#ecS)"/><circle class="sun" cx="960" cy="1000" r="160" fill="#ffd27a" fill-opacity=".25"/><g class="st">${row}<rect x="0" y="960" width="1920" height="120" fill="#081a0c"/></g>
      ${[0, 1, 2, 3, 4, 5].map(i => `<text class="ds" x="${150 + i * 300}" y="${260 + (i % 2) * 220}" font-family="Unbounded" font-weight="900" font-size="90" fill="#c9f5cf" fill-opacity=".06">$</text>`).join('')}`));
    drift(L.querySelector('.st'), { x: -50 }, 18); L.querySelectorAll('.ds').forEach((g, i) => drift(g, { y: -70, rotation: i % 2 ? 12 : -12 }, 6 + i * .7));
  }
  // OUTRO: aurora ribbons and soft stars
  {
    let stars = ''; for (let i = 0; i < 70; i++) stars += `<circle class="sx" cx="${rr(0, 1920)}" cy="${rr(0, 600)}" r="${rr(1, 3)}" fill="#fff" fill-opacity="${rr(.2, .7)}"/>`;
    const rib = (y, c, cls) => `<path class="${cls}" d="M-200,${y} C300,${y - 160} 700,${y + 140} 1100,${y - 40} S1800,${y - 180} 2200,${y}" fill="none" stroke="${c}" stroke-opacity=".22" stroke-width="140" filter="url(#eoB)"/>`;
    const L = bd('outro', SVGW(`<defs><filter id="eoB" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs>${stars}${rib(380, '#3dff9a', 'a1')}${rib(520, '#9b7bff', 'a2')}${rib(300, '#4fc3ff', 'a3')}`));
    ['a1', 'a2', 'a3'].forEach((c, i) => drift(L.querySelector('.' + c), { y: i % 2 ? 80 : -80, x: i % 2 ? -120 : 120 }, 7 + i * 2));
    L.querySelectorAll('.sx').forEach((s, i) => { if (i % 3 === 0) drift(s, { opacity: .2 }, 2 + (i % 5) * .6, (i % 7) * .3); });
  }
})();

/* ---------- global depth: perspective floor, light leaks ---------- */
(() => {
  const wrap = div('abs', $('#bg'), '', 'left:0;top:0;width:1920px;height:1080px;perspective:700px;overflow:hidden'); wrap.dataset.drift = '1';
  const floor = div('abs', wrap, '', `left:-1200px;top:640px;width:4320px;height:1600px;transform-origin:50% 0%;transform:rotateX(76deg);
    background:repeating-linear-gradient(90deg,rgba(255,255,255,.16) 0 3px,transparent 3px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.16) 0 3px,transparent 3px 120px);
    -webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 30%,#000 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 30%,#000 100%)`);
  floor.dataset.drift = '1';
  tl.fromTo(floor, { backgroundPosition: '0px 0px' }, { backgroundPosition: `0px ${Math.round(TOTAL * 40)}px`, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
  const hz = div('abs', wrap, '', 'left:0;top:560px;width:1920px;height:200px;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(255,255,255,.12),transparent 70%)'); hz.dataset.drift = '1';
  [['#ff7ad9', 300, 200, 900], ['#4fc3ff', 1500, 300, 1000], ['#ffc640', 900, 900, 800]].forEach(([c, x, y, s], i) => {
    const b = div('abs', $('#bg'), '', `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;border-radius:50%;mix-blend-mode:screen;opacity:.16;background:radial-gradient(circle,${c},transparent 65%)`); b.dataset.drift = '1';
    drift(b, { x: i % 2 ? -260 : 260, y: i ? -120 : 140, scale: 1.25 }, 11 + i * 3);
  });
})();

/* ---------- HUD frame: corner brackets + scrolling edge data ---------- */
(() => {
  const h = $('#hud');
  const br = (x, y, sx, sy) => `<path d="M${x},${y + sy * 60} V${y} H${x + sx * 60}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`;
  h.innerHTML = SVGW(`${br(24, 120, 1, 1)}${br(1896, 120, -1, 1)}${br(24, 1056, 1, -1)}${br(1896, 1056, -1, -1)}
    ${Array.from({ length: 30 }, (_, i) => `<line x1="1904" y1="${180 + i * 26}" x2="${i % 5 ? 1912 : 1918}" y2="${180 + i * 26}" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>`).join('')}`);
  const nums = Array.from({ length: 90 }, (_, i) => `${300 + (i * 137) % 551}`).join('<br>');
  const col = div('abs', h, `<div>${nums}</div>`, "left:8px;top:160px;width:44px;height:760px;overflow:hidden;font:700 13px/26px 'JetBrains Mono';color:rgba(255,255,255,.18)");
  tl.fromTo(col.firstChild, { y: 0 }, { y: -1500, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
})();

/* ---------- FX engine ---------- */
// sparks + shockwave from the centre of an element at time t
function burst(el, t, color = '#ffc640', n = 16, r = 230) {
  if (!el) return;
  const c = div('abs', el, '', 'left:50%;top:50%;width:0;height:0;pointer-events:none');
  const w = div('wave', c, '', `width:60px;height:60px;margin:-30px 0 0 -30px;border:6px solid ${color};box-shadow:0 0 30px ${color}`);
  tl.set(w, { opacity: 0, scale: .2 }, 0); tl.to(w, { opacity: .9, scale: .6, duration: .05 }, t); tl.to(w, { opacity: 0, scale: 5.5, duration: .55, ease: 'power2.out' }, t + .05);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * .3, d = r * (.6 + rnd() * .6);
    const s = div('spark', c, '', `background:${color};box-shadow:0 0 12px ${color};margin:-3px 0 0 -13px`);
    tl.set(s, { opacity: 0, rotation: a * 180 / Math.PI, x: 0, y: 0, scaleX: 1 }, 0);
    tl.to(s, { opacity: 1, duration: .03 }, t); tl.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, scaleX: .2, duration: .5 + rnd() * .2, ease: 'power3.out' }, t);
    tl.to(s, { opacity: 0, duration: .25 }, t + .35);
  }
}
const tensionPulse = (t, k = .7, beats = 2) => { for (let i = 0; i < beats; i++) { const tt = t + i * .85; tl.fromTo('#tension', { opacity: 0 }, { opacity: k, duration: .12, ease: 'power2.out', immediateRender: false }, tt); tl.to('#tension', { opacity: k * .35, duration: .2 }, tt + .14); tl.to('#tension', { opacity: k * .8, duration: .1 }, tt + .34); tl.to('#tension', { opacity: 0, duration: .4, ease: 'power2.in' }, tt + .44); cue(tt, 'heartbeat', .7 * k + .2); } };
const bloomAt = (t, k = .9, d = 1.6) => { tl.fromTo('#bloom', { opacity: 0 }, { opacity: k, duration: .35, ease: 'power2.out', immediateRender: false }, t); tl.to('#bloom', { opacity: 0, duration: d, ease: 'sine.inOut' }, t + .35); };
tl.set(['#tension', '#bloom'], { opacity: 0 }, 0);
// a gentle 3D camera drift on the whole stage (separate props from punch/shake)
tl.set('#stage', { transformPerspective: 2600 }, 0); drift('#stage', { rotationY: 1.4, rotationX: -.8 }, 6.5);

// called from finish.js once every scene is built
const polish = () => {
  // light sweeps across every card, paper and question card
  $$('.scene .card, .scene .paper, .scene .qcard').forEach((c, i) => {
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    const sh = div('shine', c, '<i></i>'); const k = sh.firstChild;
    const per = 5 + (i % 4), t0 = 1 + (i * 1.37) % per;
    tl.fromTo(k, { xPercent: -160 }, { xPercent: 420, duration: 1.1, ease: 'power2.inOut', repeat: Math.floor((TOTAL - t0) / per) - 1, repeatDelay: per - 1.1, data: 'drift', immediateRender: false }, t0);
  });
  // silhouettes breathe
  $$('.scene svg.prs').forEach((p, i) => { tl.set(p, { transformOrigin: '50% 100%' }, 0); drift(p, { scaleY: 1.025, scaleX: .99 }, 1.6 + (i % 5) * .2, (i % 7) * .23); });
  // every placed layer floats on its own slow current
  $$('.scene').forEach(host => {
    const id = host.dataset.scene, t0 = S(id), t1 = E(id);
    [...host.children].filter(c => c.dataset && c.dataset.f === '1').forEach((c, i) => {
      const w = document.createElement('div'); w.className = 'abs'; w.style.cssText = 'inset:0;pointer-events:none'; host.insertBefore(w, c); w.appendChild(c);
      const per = 2.8 + (i % 4) * .45, n = Math.max(1, Math.floor((t1 - t0) / per));
      tl.to(w, { y: (i % 2 ? -1 : 1) * (5 + (i % 3) * 2), x: (i % 3 - 1) * 3, duration: per, ease: 'sine.inOut', yoyo: true, repeat: n - 1, data: 'drift' }, t0);
    });
  });
};
