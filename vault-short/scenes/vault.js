/* The Richest Room on Earth — motion design. Every beat is placed on a spoken word (W(id, k) = start of word k).
   Scene layout comes from shared/rt.js (mirror of tools/bake.py). Frame 0 and the last frame are the same street shot. */
const R = RT_INIT();
const { tl, S, E, V, VE, W, WE, rnd, $, $$, div, cue, TOTAL } = R;
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const commas = v => Math.round(v).toLocaleString('en-US');

/* ---------- gold bar component (top face + front face + stamp) ---------- */
(() => {
  const st = document.createElement('style');
  st.textContent = `
  .gbar { position:absolute; }
  .gbar .t { position:absolute; left:0; top:0; width:100%; height:42%; clip-path:polygon(9% 0,91% 0,100% 100%,0 100%);
    background:linear-gradient(180deg,#fff7d6,#ffd877 60%,#f0b43a); }
  .gbar .f { position:absolute; left:0; top:42%; width:100%; height:58%; background:linear-gradient(180deg,#e9a72c,#c4850f 55%,#8a5a06);
    box-shadow:inset 0 2px 0 rgba(255,240,190,.6); }
  .gbar .f i { position:absolute; left:30%; top:22%; width:40%; height:42%; border-radius:3px; border:2px solid rgba(255,230,160,.45); }
  .gbar.flat .t { display:none } .gbar.flat .f { top:0; height:100%; border-radius:6px; background:linear-gradient(160deg,#fff0b8,#ffc640 45%,#b8800f); }
  .cage { position:absolute; border-radius:8px; border:3px solid #8fa3b8; background:
    repeating-linear-gradient(45deg,rgba(143,163,184,.25) 0 2px,transparent 2px 14px),
    repeating-linear-gradient(-45deg,rgba(143,163,184,.25) 0 2px,transparent 2px 14px), radial-gradient(circle at 50% 70%,rgba(255,198,64,.35),rgba(20,16,10,.9) 70%); }
  .cage .lk { position:absolute; left:50%; top:50%; width:22px; height:18px; margin:-4px 0 0 -11px; border-radius:4px; background:#ffc640; box-shadow:0 0 10px #ffc640; }
  .cage .lk:before { content:''; position:absolute; left:4px; top:-12px; width:10px; height:12px; border:3px solid #ffc640; border-bottom:none; border-radius:8px 8px 0 0; }
  .coin { position:absolute; width:56px; height:56px; border-radius:50%; background:radial-gradient(circle at 35% 30%,#fff6d0,#ffc640 45%,#a8700a); box-shadow:0 0 18px rgba(255,198,64,.7); }
  .spark { position:absolute; width:8px; height:30px; border-radius:4px; background:linear-gradient(180deg,#fff,#ffd36b); box-shadow:0 0 12px #ffd36b; }
  .serial { position:absolute; left:0; width:430px; height:150px; }
  .serial .gbar { left:0; top:28px; }
  .serial .sn { position:absolute; left:170px; top:36px; font:800 40px/1 'JetBrains Mono',monospace; color:#fff3cf; }
  .serial .oz { position:absolute; left:170px; top:88px; font:600 26px/1 'JetBrains Mono',monospace; color:#8a8578; }
  .ship { position:absolute; top:40px; width:300px; height:300px; }
  .ship svg { width:300px; height:220px; }
  .ship .x { position:absolute; left:20px; top:100px; width:260px; height:14px; border-radius:7px; background:#ff4a3d; box-shadow:0 0 20px #ff4a3d; transform-origin:0 50%; }
  `;
  document.head.appendChild(st);
})();
const goldBar = (host, x, y, w, cls = '') => {
  const b = div('gbar ' + cls, host, '<div class="t"></div><div class="f"><i></i></div>', `left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * .42)}px`);
  return b;
};
// scenes enter from below (we're always going deeper), leave upward
const through = (id, { first = false, last = false, sfx = 'whoosh' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) { tl.set(s, { opacity: 0, y: 90 }, 0); tl.to(s, { opacity: 1, y: 0, duration: .34, ease: 'power3.out' }, S(id)); if (sfx) cue(S(id), sfx, .55); }
  if (!last) tl.to(s, { opacity: 0, y: -70, duration: .26, ease: 'power2.in' }, E(id) - .26);
};
// slow camera push on a scene's content (never a beat on its own; stops dead scenes looking frozen)
const push = (sel, id, to = 1.06) => { tl.set(sel, { scale: 1 }, 0); tl.to(sel, { scale: to, duration: E(id) - S(id), ease: 'sine.inOut', transformOrigin: '50% 45%' }, S(id)); };

/* ================= world: drifting gold dust ================= */
const dustK = { v: .35 };
(() => {
  const cv = $('#dust'), cx = cv.getContext('2d');
  const P = []; for (let i = 0; i < 140; i++) P.push({ x: rnd() * 1080, y: rnd() * 1920, s: .6 + rnd() * 2.4, sp: 8 + rnd() * 26, ph: rnd() * 6.28, a: .2 + rnd() * .6 });
  const draw = t => {
    cx.clearRect(0, 0, 1080, 1920);
    for (const p of P) {
      let y = (p.y - t * p.sp) % 1920; if (y < 0) y += 1920;
      const x = p.x + Math.sin(t * .6 + p.ph) * 18;
      const fade = Math.min(1, y / 200, (1920 - y) / 200);           // fade at the wrap, never teleport
      const a = p.a * dustK.v * fade;
      if (a < .01) continue;
      cx.fillStyle = `rgba(255,214,120,${a.toFixed(3)})`;
      cx.beginPath(); cx.arc(x, y, p.s, 0, 6.2832); cx.fill();
    }
  };
  const prox = { t: 0 };
  tl.fromTo(prox, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(prox.t) }, 0);
})();
const dust = (t, v, d = .6) => tl.to(dustK, { v, duration: d, ease: 'sine.inOut', data: 'drift' }, t);

/* ================= the shaft (built once; used by the hook and the outro) ================= */
const SHAFT_Y = -2900;
(() => {
  // skyline
  const sky = $('#skyline'), win = $('#windows');
  let x = -20; const r0 = { s: 77 };
  const rr = () => { r0.s = (r0.s * 16807) % 2147483647; return (r0.s - 1) / 2147483646; };
  while (x < 1100) {
    const w = 70 + rr() * 120, h = 260 + rr() * 380;
    if (x + w > 320 && x < 760) { x = 760; continue; }                 // leave room for the Fed building
    svgEl('rect', { x, y: 760 - h, width: w, height: h }, sky);
    for (let wy = 760 - h + 24; wy < 740; wy += 34) for (let wx = x + 12; wx < x + w - 16; wx += 26)
      if (rr() < .32) svgEl('rect', { x: wx, y: wy, width: 12, height: 16, fill: rr() < .7 ? '#ffd88a' : '#9fc2ff', opacity: .35 + rr() * .5 }, win);
    x += w + 6;
  }
  const fw = $('#fedWin');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) svgEl('rect', { x: 352 + c * 68, y: 340 + r * 72, width: 34, height: 48, rx: 17, opacity: .5 + ((r + c) % 3) * .2 }, fw);
  // subway ties
  for (let i = 0; i < 40; i++) svgEl('rect', { x: i * 28, y: 300, width: 14, height: 10 }, $('#ties'));
  // schist foliation: wavy bands + mica glints
  const sc = $('#schist');
  for (let i = 0; i < 26; i++) {
    const y0 = 40 + i * 52; let d = `M-20,${y0}`;
    for (let k = 0; k <= 12; k++) d += ` Q${k * 95 + 47},${y0 + (rr() - .5) * 60} ${k * 95 + 95},${y0 + (rr() - .5) * 26}`;
    svgEl('path', { d, stroke: i % 3 ? 'rgba(120,135,160,.18)' : 'rgba(180,190,210,.14)', 'stroke-width': 2 + rr() * 5, fill: 'none' }, sc);
  }
  for (let i = 0; i < 90; i++) svgEl('circle', { cx: rr() * 1080, cy: rr() * 1360, r: 1 + rr() * 2.2, fill: '#e8eefc', opacity: .15 + rr() * .4 }, sc);
  // the vault wall: brick-stacked bars
  const vw = $('#vaultWall');
  for (let r = 0; r < 12; r++) for (let c = -1; c < 7; c++) goldBar(vw, c * 150 + (r % 2 ? 75 : 0), r * 72, 146);
  // depth gauge ticks
  for (let i = 0; i <= 8; i++) div('tick', $('#gauge'), null, `top:${i * 95}px;${i % 4 ? '' : 'width:40px'}`);
})();
const depthFmt = v => (v < .5 ? '0' : '−' + Math.round(v)) + ' FT';

/* ---------- 1 · HOOK: 80 feet down; more gold than Fort Knox ---------- */
{
  const t0 = .05, tSits = W('V01', 7), tGold = W('V01', 9), tFort = W('V01', 11);
  const tD = tSits - .08;
  tl.set('#shaft', { y: 0 }, 0);
  tl.to('#shaft', { y: SHAFT_Y, duration: tD - t0, ease: 'power2.inOut' }, t0);
  R.count('#depth', t0, tD - t0, 0, 80, depthFmt, 'power2.inOut');
  tl.set('#gauge .fill', { scaleY: 0 }, 0); tl.to('#gauge .fill', { scaleY: 1, duration: tD - t0, ease: 'power2.inOut' }, t0);
  cue(t0, 'rumble', .8, 0, { dur: tD - t0 });
  // street sign + skyline drift as we drop
  tl.to('#sign', { y: -40, duration: 1.0, ease: 'power1.in' }, t0);
  // subway train streaks past on "street in Manhattan"
  const tTrain = W('V01', 4) - .3;
  tl.set('#train', { x: 0 }, 0); tl.to('#train', { x: 2800, duration: 1.0, ease: 'none' }, tTrain); cue(tTrain + .1, 'train', .8, 0);
  // arrive: the wall of gold lights up
  tl.set('#vaultWall', { filter: 'brightness(.25)' }, 0);
  tl.to('#vaultWall', { filter: 'brightness(1.05)', duration: .5, ease: 'power2.out' }, tSits - .1);
  tl.set('#sheen', { opacity: 1, x: 0 }, tGold - .2); tl.to('#sheen', { x: 2000, duration: .9, ease: 'power2.inOut' }, tGold - .2);
  cue(tSits - .05, 'shimmer', .7); dust(tSits - .1, 1, .6);
  R.flash(tD + .02, .25, .5, '#ffe9b0'); cue(tD, 'thud', .7);
  tl.to('#depth', { scale: 1.12, duration: .18, yoyo: true, repeat: 1, ease: 'sine.inOut', transformOrigin: '0% 50%' }, tD);
  // Fort Knox comparison
  tl.set('#cmp', { opacity: 0, y: 60 }, 0);
  tl.to('#cmp', { opacity: 1, y: 0, duration: .3, ease: 'power3.out' }, tFort - .32); cue(tFort - .32, 'swoosh', .55);
  tl.to('#shaftWrap', { opacity: .4, duration: .3 }, tFort - .32);
  tl.to('#depth, #depthL, #gauge', { opacity: 0, duration: .25 }, tFort - .32);
  tl.set('#colK, #colF', { scaleY: 0 }, 0);
  tl.to('#colK', { scaleY: 1, duration: .45, ease: 'power3.out' }, tFort - .2);
  tl.to('#colF', { scaleY: 1, duration: .55, ease: 'back.out(1.4)' }, tFort + .12); cue(tFort + .12, 'riser', .5, 0, { dur: .5 });
  R.count('#numK', tFort - .2, .45, 0, 4582, commas); R.count('#numF', tFort + .12, .55, 0, 6331, commas);
  R.pop('#moreTag', W('V01', 12) + .3, .3, .3); cue(W('V01', 12) + .3, 'impact', .8); R.shake(W('V01', 12) + .3, 12, .25);
  tl.to('#colF', { boxShadow: '0 0 90px rgba(255,198,64,.95)', duration: .4, ease: 'sine.inOut' }, W('V01', 12) + .3);
  // hand-off: the shaft, gauge and depth leave with the hook
  tl.to('#shaftWrap, #depth, #depthL, #gauge', { opacity: 0, duration: .3 }, E('hook') - .3);
  through('hook', { first: true });
}

/* ---------- 2 · MASS: tons → bars → dollars ---------- */
{
  through('mass');
  const tTons = W('V02', 1), tHalf = W('V02', 3), tBars = W('V02', 6), tWorth = W('V02', 7), t800 = W('V02', 9), tBil = W('V02', 10);
  // brick wall of bars on a canvas: built bottom-up, then zoomed out to "half a million"
  const cv = $('#wall'), cx = cv.getContext('2d'), Wd = 1080, Ht = 1180;
  const tile = document.createElement('canvas'); tile.width = 300; tile.height = 120;
  (() => {
    const g = tile.getContext('2d');
    const bar = (x, y) => {
      const w = 146, h = 58;
      let gr = g.createLinearGradient(0, y, 0, y + h * .42); gr.addColorStop(0, '#fff7d6'); gr.addColorStop(1, '#f0b43a');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x + w * .09, y); g.lineTo(x + w * .91, y); g.lineTo(x + w, y + h * .42); g.lineTo(x, y + h * .42); g.fill();
      gr = g.createLinearGradient(0, y + h * .42, 0, y + h); gr.addColorStop(0, '#e9a72c'); gr.addColorStop(1, '#8a5a06');
      g.fillStyle = gr; g.fillRect(x, y + h * .42, w, h * .58);
      g.strokeStyle = 'rgba(255,230,160,.4)'; g.lineWidth = 2; g.strokeRect(x + w * .3, y + h * .55, w * .4, h * .26);
    };
    g.fillStyle = '#120d06'; g.fillRect(0, 0, 300, 120);
    bar(2, 1); bar(152, 1); bar(-73, 61); bar(77, 61); bar(227, 61);
  })();
  const pat = cx.createPattern(tile, 'repeat');
  const st = { build: 0, zoom: 1, sheen: -1 };
  const draw = () => {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, Wd, Ht);
    const z = st.zoom, cxp = Wd / 2, cyp = Ht * .55;
    cx.save();
    const top = Ht * (1 - st.build);
    cx.beginPath(); cx.rect(0, top, Wd, Ht - top); cx.clip();
    cx.setTransform(z, 0, 0, z, cxp - cxp * z, cyp - cyp * z);
    cx.fillStyle = pat; cx.fillRect(-cxp / z - 300, -cyp / z - 300, Wd / z + 600, Ht / z + 600);
    cx.restore();
    if (st.sheen > -1 && st.sheen < 2) {
      const sx = st.sheen * Wd; const g = cx.createLinearGradient(sx - 200, 0, sx + 200, 0);
      g.addColorStop(0, 'rgba(255,250,220,0)'); g.addColorStop(.5, 'rgba(255,250,220,.4)'); g.addColorStop(1, 'rgba(255,250,220,0)');
      cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g; cx.fillRect(0, Ht * (1 - st.build), Wd, Ht); cx.globalCompositeOperation = 'source-over';
    }
  };
  tl.fromTo(st, { build: 0 }, { build: 1, duration: tHalf - tTons + .2, ease: 'power1.inOut', onUpdate: draw }, tTons - .25);
  cue(tTons - .25, 'stack', .7, 0, { dur: tHalf - tTons + .2 });
  tl.fromTo(st, { zoom: 1 }, { zoom: .09, duration: tWorth - tHalf + .1, ease: 'power2.in', onUpdate: draw, immediateRender: false }, tHalf - .1);
  cue(tHalf - .1, 'zoom', .6, 0, { dur: tWorth - tHalf + .1, f: 220 });
  tl.fromTo(st, { sheen: -.3 }, { sheen: 1.4, duration: .9, ease: 'sine.inOut', onUpdate: draw, immediateRender: false }, tBars - .2);
  tl.set('#wallShade', { opacity: .6 }, 0);
  // tons
  tl.set('#tonsBox', { opacity: 0, scale: .8 }, 0);
  tl.to('#tonsBox', { opacity: 1, scale: 1, duration: .3, ease: 'back.out(1.8)' }, tTons - .15);
  R.count('#tonsN', tTons - .1, .95, 0, 6331, commas, 'power3.out'); cue(tTons - .1, 'counter', .6, 0, { dur: .95 });
  tl.to('#tonsBox', { opacity: 0, y: -60, duration: .25, ease: 'power2.in' }, tHalf - .2);
  // bars
  tl.set('#barsBox', { opacity: 0, y: 60 }, 0);
  tl.to('#barsBox', { opacity: 1, y: 0, duration: .3, ease: 'power3.out' }, tHalf - .05);
  R.count('#barsN', tHalf, tBars - tHalf + .25, 0, 507000, commas, 'power2.out'); cue(tHalf, 'counter', .6, 0, { dur: tBars - tHalf + .25 });
  tl.to('#barsN', { scale: 1.08, duration: .16, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tBars + .25); cue(tBars + .25, 'clank', .6);
  tl.to('#barsBox', { opacity: 0, y: -60, duration: .25, ease: 'power2.in' }, tWorth - .15);
  tl.to('#wallShade', { opacity: 1, duration: .3 }, tWorth - .15);
  // dollars
  tl.set('#valBox', { opacity: 0 }, 0); tl.set('#valN', { scale: 2.4, opacity: 0 }, 0); tl.set('#valLong', { opacity: 0 }, 0);
  tl.to('#valBox', { opacity: 1, duration: .2 }, tWorth - .05);
  R.count('#valLong', t800 - .2, .75, 0, 8e11, v => '$' + commas(v), 'power3.out'); tl.to('#valLong', { opacity: 1, duration: .15 }, t800 - .2);
  cue(t800 - .2, 'counter', .55, 0, { dur: .75 });
  tl.to('#valN', { scale: 1, opacity: 1, duration: .24, ease: 'power4.in' }, tBil - .1);
  cue(tBil + .14, 'impact', 1); R.shake(tBil + .14, 22, .35); R.flash(tBil + .14, .45, .5, '#fff1c4');
  // coin burst
  for (let i = 0; i < 26; i++) {
    const c = div('coin', $('#coins'), null, `left:${512}px;top:${560}px`);
    const ang = -Math.PI / 2 + (rnd() - .5) * 2.4, sp = 380 + rnd() * 520, t = tBil + .14;
    const dx = Math.cos(ang) * sp, dy = Math.sin(ang) * sp;
    tl.set(c, { opacity: 0, scale: .4 }, 0);
    tl.set(c, { opacity: 1 }, t);
    tl.to(c, { x: dx, duration: 1.3, ease: 'power1.out' }, t);
    tl.to(c, { y: dy, scale: .9 + rnd() * .5, rotation: (rnd() - .5) * 360, duration: .5, ease: 'power2.out' }, t);
    tl.to(c, { y: dy + 900, duration: .8, ease: 'power2.in' }, t + .5);
    tl.to(c, { opacity: 0, duration: .3 }, t + 1.0);
  }
  cue(tBil + .2, 'coins', .7);
  tl.to('#valN', { scale: 1.05, duration: .9, ease: 'sine.inOut' }, tBil + .4);
}

/* ---------- 3 · OWNER: almost none of it is America's ---------- */
{
  through('owner');
  const tA = W('V03', 0), tNone = W('V03', 2), tUS = W('V03', 7);
  const C = 2 * Math.PI * 270;
  tl.set('#arcF', { attr: { 'stroke-dasharray': `0 ${C}` } }, 0);
  tl.set('#arcU', { attr: { 'stroke-dasharray': `0 ${C}`, 'stroke-dashoffset': 0 } }, 0);
  tl.to('#arcF', { attr: { 'stroke-dasharray': `${C * .955} ${C}` }, duration: .75, ease: 'power3.inOut' }, tA);
  cue(tA, 'riser', .45, 0, { dur: .75 });
  tl.set('#arcU', { attr: { 'stroke-dashoffset': -C * .962 } }, 0);
  tl.to('#arcU', { attr: { 'stroke-dasharray': `${C * .03} ${C}` }, duration: .3, ease: 'power2.out' }, tNone + .1);
  R.up('#ownK', tA - .05, .3, 20);
  tl.set('#ringIn', { opacity: 0, scale: .7 }, 0);
  tl.to('#ringIn', { opacity: 1, scale: 1, duration: .35, ease: 'back.out(1.8)' }, tNone - .05); cue(tNone - .05, 'pop', .6);
  R.pop('#usTag', tUS - .25, .3, .4); cue(tUS - .25, 'blip', .6, .4, { f: 900 });
  tl.to('#arcU', { attr: { 'stroke-width': 110 }, duration: .2, yoyo: true, repeat: 1 }, tUS - .2);
  center('#notUS'); R.slam('#notUS', tUS + .2, 2.4, .22); cue(tUS + .42, 'stamp', 1); R.shake(tUS + .42, 16, .3);
  tl.to('#ring', { rotation: 8, duration: E('owner') - tA, ease: 'sine.inOut', transformOrigin: '50% 50%' }, tA);
  dust(S('owner'), .45);
}

/* ---------- 4 · DOOR: no door — a 90-ton cylinder that turns shut ---------- */
{
  through('door');
  const tNo = W('V04', 1), tDoor = W('V04', 3), tWalk = W('V04', 4), t90 = W('V04', 9), tCyl = W('V04', 11), tTurns = W('V04', 13), tShut = W('V04', 17);
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832; svgEl('circle', { cx: 300 + Math.cos(a) * 274, cy: 300 + Math.sin(a) * 274, r: 9 }, $('#bolts')); }
  tl.set('#roundDoor', { opacity: 0, scale: .6, rotation: -30 }, 0);
  tl.to('#roundDoor', { opacity: 1, scale: 1, rotation: 0, duration: .45, ease: 'back.out(1.5)', transformOrigin: '50% 50%' }, S('door') + .05);
  tl.to('#spokes', { rotation: 90, duration: .9, ease: 'power2.inOut', svgOrigin: '300 300' }, tNo - .1); cue(tNo - .1, 'creak', .5);
  tl.set('#xA, #xB', { scaleX: 0 }, 0);
  tl.to('#xA', { scaleX: 1, duration: .16, ease: 'power2.out' }, tDoor - .05); cue(tDoor - .05, 'slash', .7, -.2);
  tl.to('#xB', { scaleX: 1, duration: .16, ease: 'power2.out' }, tDoor + .1); cue(tDoor + .1, 'slash', .7, .2);
  center('#noDoor'); R.slam('#noDoor', tDoor + .15, 2, .2); cue(tDoor + .35, 'stamp', .8);
  tl.to('#roundDoor, #xA, #xB, #noDoor', { opacity: 0, y: 80, duration: .3, ease: 'power2.in' }, tWalk - .2);
  // the cylinder rises into place
  tl.set('#cyl', { opacity: 0, y: 140, scale: .92 }, 0);
  tl.to('#cyl', { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'power3.out' }, tWalk - .1); cue(tWalk - .1, 'rumble', .6, 0, { dur: .6 });
  // a person walks through the slot
  tl.set('#walker', { x: -90, opacity: 0 }, 0);
  tl.to('#walker', { opacity: 1, duration: .2 }, tWalk + .2);
  tl.to('#walker', { x: 90, duration: 1.6, ease: 'none' }, tWalk + .2);
  tl.to('#walker', { y: -6, duration: .2, yoyo: true, repeat: 7, ease: 'sine.inOut' }, tWalk + .2);
  tl.to('#walker', { opacity: 0, duration: .2 }, tWalk + 1.6);
  // 90 tons
  center('#tonTag'); R.pop('#tonTag', t90 - .2, .35, .4); R.count('#tonN', t90 - .15, .6, 0, 90, v => Math.round(v), 'power3.out'); cue(t90 - .15, 'counter', .5, 0, { dur: .6 });
  cue(t90 + .45, 'clank', .6);
  R.up('#frameTag', tCyl + .1, .3, 20); cue(tCyl + .1, 'blip', .4, .3, { f: 700 });
  tl.set('#frame', { opacity: .35 }, 0); tl.to('#frame', { opacity: 1, duration: .4 }, tCyl);
  // it turns: the slot slides round the curve and narrows to nothing, the shading bands scroll with it
  tl.to('#slot', { x: 250, scaleX: .1, duration: tShut - tTurns + .15, ease: 'power2.in' }, tTurns - .1);
  tl.to('#bands', { x: 420, duration: tShut - tTurns + .15, ease: 'power2.in' }, tTurns - .1);
  cue(tTurns - .1, 'grind', .8, 0, { dur: tShut - tTurns + .15 });
  tl.to('#slot', { opacity: 0, duration: .08 }, tShut + .02);
  cue(tShut + .05, 'clang', 1); R.shake(tShut + .05, 26, .45); R.flash(tShut + .05, .3, .4, '#dbe4ec');
  center('#sealed'); R.slam('#sealed', tShut + .12, 2.2, .2);
  push('#cyl', 'door', 1.04);
}

/* ---------- 5 · CAGES: 122 locked compartments, one owner each ---------- */
{
  through('cages');
  const tIn = W('V05', 0), t122 = W('V05', 2), tLock = W('V05', 3), tOne = W('V05', 5), tMost = W('V05', 8), tCtry = W('V05', 10);
  const grid = $('#cageGrid'), cols = 11, cw = 76, ch = 68, gx = 4.8, gy = 6;
  const cells = [];
  for (let i = 0; i < 122; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const e = div('cage', grid, '<div class="lk"></div>', `left:${c * (cw + gx)}px;top:${r * (ch + gy)}px;width:${cw}px;height:${ch}px`);
    cells.push(e);
  }
  // the 122nd cage sits alone at the start of a 12th row
  const dur = tLock - t122 + .05;
  cells.forEach((e, i) => {
    const t = t122 - .1 + dur * Math.pow(i / 121, .8);
    tl.set(e, { opacity: 0, scale: .3 }, 0); tl.to(e, { opacity: 1, scale: 1, duration: .14, ease: 'back.out(2)' }, t);
    if (i % 6 === 0) cue(t, 'tick', .35, (i % cols) / cols - .5, { f: 1800 + i * 6 });
    const lk = e.querySelector('.lk');
    tl.set(lk, { opacity: 0, y: -12 }, 0); tl.to(lk, { opacity: 1, y: 0, duration: .1, ease: 'power2.in' }, tLock + .02 * (i % 20) + .01 * Math.floor(i / 20));
  });
  cue(tLock, 'lock', .9); cue(tLock + .25, 'lock', .6, .3);
  R.up('#cageHead', tIn - .05, .3, 30);
  R.count('#cageN', t122 - .1, dur, 0, 122, v => Math.round(v), 'power1.out'); cue(t122 - .1, 'counter', .45, 0, { dur });
  // one owner each: zoom into a single cage
  const pick = cells[60], pr = Math.floor(60 / cols), pc = 60 % cols;
  const px = 96 + pc * (cw + gx) + cw / 2, py = 330 + pr * (ch + gy) + ch / 2;
  tl.to('#cageCam', { scale: 2.6, x: 540 - px, y: 640 - py, duration: .55, ease: 'power3.inOut', transformOrigin: `${px}px ${py}px` }, tOne - .15);
  cue(tOne - .15, 'zoom', .5, 0, { dur: .55, f: 300 });
  tl.to(pick, { boxShadow: '0 0 30px #ffc640', borderColor: '#ffc640', duration: .3 }, tOne + .2);
  tl.to('#cageHead', { opacity: 0, y: -40, duration: .25 }, tOne - .1);
  center('#ownerTag'); R.pop('#ownerTag', tOne + .25, .3, .4); cue(tOne + .25, 'pop', .6);
  // mostly other countries: zoom back out, redacted owner tags pop on cages
  tl.to('#cageCam', { scale: 1, x: 0, y: 0, duration: .5, ease: 'power3.inOut' }, tMost - .2);
  tl.to('#ownerTag', { opacity: 0, duration: .2 }, tMost - .2);
  [3, 17, 30, 44, 52, 71, 85, 98, 104, 116].forEach((k, j) => {
    const r = Math.floor(k / cols), c = k % cols;
    const tg = div('tag', $('#cageCam'), `<span class="redact" style="width:${60 + (j * 37) % 70}px"></span>`, `left:${96 + c * (cw + gx) - 20}px;top:${330 + r * (ch + gy) - 30}px;font-size:22px;padding:8px 12px 6px`);
    const t = tMost + .25 + j * ((tCtry - tMost + .1) / 10);
    tl.set(tg, { opacity: 0, scale: .4 }, 0); tl.to(tg, { opacity: 1, scale: 1, duration: .18, ease: 'back.out(2.4)' }, t);
    cue(t, 'bloop', .4, c / cols - .5, { f: 500 + j * 60 });
  });
  R.up('#secret', tCtry + .1, .35, 20);
}

/* ---------- 6 · STACK: magnesium shoe covers; a 27-pound bar ---------- */
{
  through('stack');
  const tWork = W('V06', 1), tStack = W('V06', 3), tMg = W('V06', 6), tShoe = W('V06', 10), tBec = W('V06', 11), tBar = W('V06', 13), t27 = W('V06', 15), tLb = W('V06', 16);
  // the wall being stacked, one bar per beat
  const sw = $('#stackWall'); const placed = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) placed.push(goldBar(sw, c * 152 + (r % 2 ? 76 : 0) - 30, 560 - r * 66, 148));
  placed.forEach((b, i) => {
    if (i < 14) { tl.set(b, { opacity: 1 }, 0); return; }
    const t = tWork + (i - 14) * ((tMg - tWork) / 10);
    tl.set(b, { opacity: 0, x: -160, y: -40 }, 0); tl.to(b, { opacity: 1, x: 0, y: 0, duration: .22, ease: 'power3.out' }, t);
    cue(t + .2, 'clank', .35, .3);
  });
  tl.set('#worker', { opacity: 0, x: -120 }, 0); tl.to('#worker', { opacity: 1, x: 0, duration: .4, ease: 'power3.out' }, S('stack') + .05);
  tl.to('#armR', { rotation: -24, duration: .35, yoyo: true, repeat: 3, ease: 'sine.inOut', svgOrigin: '200 150' }, tWork);
  tl.to('#worker', { y: -8, duration: .35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tWork);
  goldBar($('#heldBar'), 0, 0, 150); tl.set('#heldBar', { opacity: 0 }, 0); tl.to('#heldBar', { opacity: 1, duration: .2 }, tWork);
  tl.to('#heldBar', { x: 120, y: -60, opacity: 0, duration: .5, ease: 'power2.in' }, tStack + .2);
  // magnesium: the lens zooms onto the boot, the element tile lands
  tl.set('#lens', { opacity: 0, scale: .2 }, 0);
  tl.to('#lens', { opacity: 1, scale: 1, duration: .4, ease: 'back.out(1.6)', transformOrigin: '20% 90%' }, tMg - .2); cue(tMg - .2, 'zoom', .5, .3, { dur: .4, f: 400 });
  tl.to('#stackWall', { opacity: .25, duration: .3 }, tMg - .2);
  tl.set('#mgTile', { opacity: 0, rotationY: -90, transformPerspective: 900 }, 0);
  tl.to('#mgTile', { opacity: 1, rotationY: 0, duration: .45, ease: 'back.out(1.6)' }, tMg); cue(tMg, 'chime', .55);
  tl.fromTo('#lensShine', { opacity: .2 }, { opacity: 1, duration: .3, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false }, tMg + .3);
  tl.to('#toeCap', { attr: { fill: '#ffffff' }, duration: .25, yoyo: true, repeat: 1 }, tShoe - .1); cue(tShoe - .1, 'blip', .4, -.2, { f: 1500 });
  // a bar is raised above the toe cap… and dropped on "27"
  goldBar($('#dropBar'), 0, 0, 200);
  tl.set('#dropBar', { y: 0, rotation: -6 }, 0);
  tl.to('#dropBar', { y: 120, duration: .45, ease: 'power2.out' }, tBec);
  tl.to('#dropBar', { rotation: 6, duration: .5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tBec + .4);
  const tHit = t27 + .18;
  tl.to('#dropBar', { y: 296, rotation: 0, duration: .22, ease: 'power3.in' }, tHit - .22); cue(tHit - .3, 'fall', .6);
  tl.to('#dropBar', { y: 270, duration: .12, ease: 'power2.out' }, tHit).to('#dropBar', { y: 296, duration: .12, ease: 'power2.in' }, tHit + .12);
  cue(tHit, 'clank', 1); cue(tHit, 'thud', .7); R.shake(tHit, 20, .35); R.flash(tHit, .25, .3, '#fff');
  for (let i = 0; i < 14; i++) {
    const s = div('spark', $('#sparks'), null, `left:${292}px;top:${206}px`);
    const a = -Math.PI / 2 + (rnd() - .5) * 2.2, d = 90 + rnd() * 140;
    tl.set(s, { opacity: 0, rotation: a * 57.3 + 90 }, 0);
    tl.set(s, { opacity: 1 }, tHit); tl.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, duration: .45, ease: 'power2.out' }, tHit);
  }
  tl.set('#lbTag', { opacity: 0 }, 0);
  R.slam('#lbN', tLb - .15, 2.2, .2); tl.to('#lbTag', { opacity: 1, duration: .1 }, tLb - .15); cue(tLb + .05, 'impact', .7);
  dust(S('stack'), .35);
}

/* ---------- 7 · TWIST: the part nobody believes ---------- */
{
  through('twist', { sfx: null });
  const tBut = W('V07', 0), tNb = W('V07', 4), tBel = W('V07', 5);
  tl.to('#dim', { opacity: .55, duration: .25 }, S('twist')); tl.to('#dim', { opacity: 0, duration: .3 }, E('twist') - .3);
  dust(S('twist'), .1, .3);
  tl.set('#cone', { opacity: 0, scaleX: .2 }, 0);
  tl.to('#cone', { opacity: 1, scaleX: 1, duration: .5, ease: 'power2.out', transformOrigin: '50% 0%' }, tBut - .1); cue(tBut - .1, 'spot', .8);
  R.up('#butT', tBut - .05, .45, 40);
  tl.to('#butT', { scale: .9, y: -40, duration: E('twist') - tBut, ease: 'sine.inOut' }, tBut + .4);
  R.up('#nbT', tNb - .1, .3, 30);
  tl.set('#nbT2', { opacity: 0, scale: 1.8 }, 0); tl.to('#nbT2', { opacity: 1, scale: 1, duration: .22, ease: 'power4.in' }, tBel - .05);
  cue(tBel + .17, 'heartbeat', 1); R.shake(tBel + .17, 10, .2);
  tl.set('#pulse', { opacity: 0, scale: .2 }, 0);
  tl.to('#pulse', { opacity: .9, duration: .02 }, tBel + .17).to('#pulse', { scale: 5, opacity: 0, duration: .9, ease: 'power2.out' }, tBel + .19);
}

/* ---------- 8 · PAY: nothing gets shipped — a cart, the cage next door ---------- */
{
  through('pay');
  const tWhen = W('V08', 0), tPays = W('V08', 3), tGold = W('V08', 6), tNo = W('V08', 7), tGets = W('V08', 8), tShip = W('V08', 9);
  const tLoad = W('V09', 2), tCart = W('V09', 7), tWheel = W('V09', 9), tNext = W('V09', 14), tDoor = W('V09', 15);
  const flag = (host, name, hue) => div('', host,
    `<div style="position:absolute;left:30px;top:34px;width:150px;height:100px;border-radius:10px;overflow:hidden;background:linear-gradient(135deg,${hue},#1d1d22);border:3px solid rgba(255,255,255,.25)"><div style="position:absolute;left:0;top:0;width:150px;height:100px;font:900 64px/100px 'Unbounded';text-align:center;color:rgba(255,255,255,.75)">?</div></div>
     <div class="anton" style="position:absolute;left:200px;top:44px;font-size:56px;color:#fff3cf">${name}</div>
     <div class="mono" style="position:absolute;left:30px;top:160px;font-size:26px;color:#8a8578">account <span class="redact" style="width:120px"></span></div>`);
  flag($('#cA'), 'COUNTRY A', '#6b5a8f'); flag($('#cB'), 'COUNTRY B', '#3f7f7a');
  tl.set('#cA', { opacity: 0, x: -200 }, 0); tl.to('#cA', { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, tWhen - .05); cue(tWhen - .05, 'swoosh', .5, -.5);
  tl.set('#cB', { opacity: 0, x: 200 }, 0); tl.to('#cB', { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, W('V08', 4) - .1); cue(W('V08', 4) - .1, 'swoosh', .5, .5);
  R.draw('#payPath', tPays - .1, .35); R.draw('#payHead', tPays + .2, .15); cue(tPays - .1, 'slide', .5);
  center('#payLab'); R.pop('#payLab', tGold - .1, .3, .4); cue(tGold - .1, 'coins', .4);
  // plane, ship, truck — each crossed out on "nothing gets shipped"
  const icons = [
    '<path d="M150,30 L166,96 L262,140 L262,160 L166,140 L162,190 L190,206 L190,218 L150,208 L110,218 L110,206 L138,190 L134,140 L38,160 L38,140 L134,96 Z" fill="#c9d6e3"/>',
    '<path d="M30,130 L270,130 L236,190 L64,190 Z" fill="#c9d6e3"/><rect x="90" y="70" width="110" height="60" fill="#8fa3b8"/><rect x="120" y="36" width="34" height="36" fill="#c9d6e3"/><path d="M10,200 Q75,186 150,200 T290,200" stroke="#5c9ccf" stroke-width="8" fill="none"/>',
    '<rect x="30" y="70" width="180" height="100" rx="10" fill="#8fa3b8"/><path d="M210,100 L256,100 L280,136 L280,170 L210,170 Z" fill="#c9d6e3"/><circle cx="80" cy="180" r="24" fill="#2a3038" stroke="#c9d6e3" stroke-width="8"/><circle cx="236" cy="180" r="24" fill="#2a3038" stroke="#c9d6e3" stroke-width="8"/><rect x="60" y="96" width="120" height="44" rx="6" fill="#2a3038"/>'];
  icons.forEach((svg, i) => {
    const sh = div('ship', $('#ships'), `<svg viewBox="0 0 300 220">${svg}</svg><div class="x"></div>`, `left:${45 + i * 335}px`);
    tl.set(sh, { opacity: 0, y: 60 }, 0); tl.to(sh, { opacity: 1, y: 0, duration: .3, ease: 'back.out(1.6)' }, tGold + .05 + i * .1);
    const x = sh.querySelector('.x'); const tx = [tNo, tGets, tShip][i] + .05;
    tl.set(x, { scaleX: 0, rotation: -18 }, 0); tl.to(x, { scaleX: 1, duration: .14, ease: 'power2.out' }, tx); cue(tx, 'slash', .6, i - 1);
    tl.to(sh, { opacity: .4, duration: .2 }, tx + .15);
  });
  R.slam('#shippedT', tShip + .3, 1.8, .2); cue(tShip + .5, 'stamp', .8);
  tl.to('#payTop', { opacity: 0, y: -80, duration: .3, ease: 'power2.in' }, V('V09') - .3);
  // floor plan
  tl.set('#plan', { opacity: 0, y: 80 }, 0); tl.to('#plan', { opacity: 1, y: 0, duration: .35, ease: 'power3.out' }, V('V09') - .1); cue(V('V09') - .1, 'whoosh', .5);
  const aBars = [], moving = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) aBars.push(goldBar($('#barsA'), 10 + c * 96, 10 + r * 64, 88, 'flat'));
  const bBars = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) bBars.push(goldBar($('#barsB'), 10 + c * 96, 10 + r * 64, 88, 'flat'));
  bBars.forEach(b => tl.set(b, { opacity: 0 }, 0));
  // the cart rolls in under cage A
  tl.set('#cart', { x: -200, opacity: 0 }, 0);
  tl.to('#cart', { x: 0, opacity: 1, duration: .45, ease: 'power2.out' }, V('V09') + .05); cue(V('V09') + .05, 'cart', .6, -.4, { dur: .45 });
  // load: the bottom bars of A hop onto the cart
  for (let i = 0; i < 6; i++) {
    const b = aBars[17 - i]; const t = tLoad + i * ((tCart - tLoad + .1) / 6);
    const idx = 17 - i, r = Math.floor(idx / 3), c = idx % 3;
    const dx = (264 + (i % 3) * 36 + 18) - (160 + c * 96 + 44), dy = (902 + Math.floor(i / 3) * 30 + 7.5) - (360 + r * 64 + 18.5);
    tl.to(b, { x: dx, y: dy, scale: .4, duration: .2, ease: 'power2.in' }, t);
    tl.to(b, { opacity: 0, duration: .05 }, t + .2);
    cue(t + .18, 'clank', .35, -.4);
    const cl = goldBar($('#cartLoad'), (i % 3) * 36, Math.floor(i / 3) * 30, 36, 'flat'); moving.push(cl);
    tl.set(cl, { opacity: 0 }, 0); tl.set(cl, { opacity: 1 }, t + .2);
  }
  // wheel it along the dashed track to cage B
  R.draw('#trackPath', tCart - .1, .4);
  tl.to('#cart', { y: 60, duration: .35, ease: 'power2.inOut' }, tWheel - .1);
  tl.to('#cart', { x: 480, duration: tNext - tWheel - .05, ease: 'power1.inOut' }, tWheel + .2);
  tl.to('#cart', { y: 0, duration: .3, ease: 'power2.inOut' }, tNext + .1);
  cue(tWheel - .1, 'cart', .8, 0, { dur: tNext - tWheel + .5 });
  // unload into B
  moving.forEach((cl, i) => {
    const t = tDoor + .05 + i * .07;
    tl.to(cl, { opacity: 0, duration: .05 }, t);
    const b = bBars[17 - i]; tl.set(b, { y: 60, scale: .5 }, 0);
    tl.to(b, { opacity: 1, y: 0, scale: 1, duration: .2, ease: 'back.out(2)' }, t); cue(t + .15, 'clank', .3, .4);
  });
  tl.to('#cageB', { borderColor: '#ffc640', boxShadow: '0 0 40px rgba(255,198,64,.6)', duration: .3 }, tDoor + .1);
  R.pop('#ledA', tDoor + .2, .3, .5); R.pop('#ledB', tDoor + .3, .3, .5); cue(tDoor + .2, 'blip', .5, -.4, { f: 600 }); cue(tDoor + .3, 'blip', .5, .4, { f: 1200 });
}

/* ---------- 9 · ROOM: billions change countries; nothing leaves ---------- */
{
  through('room');
  const tBil = W('V10', 0), tChange = W('V10', 1), tCtry = W('V10', 2), tGold = W('V10', 5), tNever = W('V10', 6), tRoom = W('V10', 9);
  const os = $('#ownStack');
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) goldBar(os, c * 166 + (r % 2 ? 40 : 0) - 10, 290 - r * 70, 160);
  tl.set('#ownStack', { opacity: 0, scale: .8 }, 0); tl.to('#ownStack', { opacity: 1, scale: 1, duration: .35, ease: 'back.out(1.6)' }, S('room') + .05);
  tl.set('#bilN', { opacity: 0 }, 0); tl.to('#bilN', { opacity: 1, duration: .15 }, tBil - .1);
  R.count('#bilN', tBil - .1, .9, 0, 1e9, v => '$' + commas(v) + (v > 9.99e8 ? '+' : ''), 'power3.out'); cue(tBil - .1, 'counter', .55, 0, { dur: .9 });
  center('#ownTag'); tl.set('#ownTag', { left: 540 }, 0); R.pop('#ownTag', tChange - .15, .3, .5);
  // the owner flips, the gold doesn't move
  const own = $('#ownL');
  tl.to(own, { y: -60, opacity: 0, duration: .14, ease: 'power2.in' }, tCtry);
  tl.set(own, { textContent: 'COUNTRY B', y: 60 }, tCtry + .14);
  tl.to(own, { y: 0, opacity: 1, duration: .16, ease: 'power2.out' }, tCtry + .14); cue(tCtry, 'flip', .6);
  tl.to('#ownTag', { borderColor: '#3dff9a', duration: .2 }, tCtry + .14);
  tl.to('#ownStack', { filter: 'brightness(1.4)', duration: .2, yoyo: true, repeat: 1 }, tCtry + .1);
  R.up('#miles', tGold - .1, .35, 30); cue(tGold - .1, 'blip', .5, 0, { f: 800 });
  center('#sameRoom'); R.slam('#sameRoom', tRoom - .12, 2.4, .2); cue(tRoom + .08, 'stamp', 1); R.shake(tRoom + .08, 14, .3);
  tl.to('#ownStack', { opacity: .45, duration: .2 }, tRoom);
  push('#ownStack', 'room', 1.05);
}

/* ---------- 10 · RENT: no rent; the exact same bars come back ---------- */
{
  through('rent');
  const tFed = W('V11', 1), tNo = W('V11', 3), tRent = W('V11', 4), tAnd = W('V11', 5), tBack = W('V11', 12), tGets = W('V11', 14), tExact = W('V11', 16), tBars = W('V11', 18);
  tl.set('#receipt', { y: -640 }, 0);
  tl.to('#receipt', { y: 0, duration: tRent - tFed + .1, ease: 'steps(14)' }, tFed - .15); cue(tFed - .15, 'print', .8, 0, { dur: tRent - tFed + .1 });
  center('#noRent'); R.slam('#noRent', tRent + .05, 2.4, .2); cue(tRent + .25, 'stamp', 1); R.shake(tRent + .25, 16, .3);
  tl.to('#receiptMask, #slotTop, #noRent', { opacity: 0, y: -80, duration: .3, ease: 'power2.in' }, tAnd - .1);
  // deposited vs returned: the same serial numbers
  const sns = ['A-48213', 'A-48214', 'A-48215', 'A-48216'], ozs = ['400.12 oz', '399.87 oz', '400.31 oz', '401.04 oz'];
  const mk = (host, i) => { const s = div('serial', host, `<div class="sn">${sns[i]}</div><div class="oz">${ozs[i]}</div>`, `top:${i * 190}px`); goldBar(s, 0, 28, 150); return s; };
  const dep = sns.map((_, i) => mk($('#colDep'), i)), ret = sns.map((_, i) => mk($('#colRet'), [2, 0, 3, 1][i]));
  tl.set('#match .kick', { opacity: 0 }, 0); tl.to('#match .kick', { opacity: 1, duration: .25 }, tAnd);
  dep.forEach((s, i) => { tl.set(s, { opacity: 0, x: -80 }, 0); tl.to(s, { opacity: 1, x: 0, duration: .25, ease: 'power3.out' }, tAnd + i * .12); cue(tAnd + i * .12, 'tick', .4, -.5, { f: 1600 }); });
  ret.forEach((s, i) => { tl.set(s, { opacity: 0, x: 80 }, 0); tl.to(s, { opacity: 1, x: 0, duration: .25, ease: 'power3.out' }, tBack + i * .12); cue(tBack + i * .12, 'tick', .4, .5, { f: 2000 }); });
  // match lines: deposit i ↔ returned row where that serial sits
  const pos = [1, 3, 0, 2];
  sns.forEach((_, i) => {
    const y1 = 60 + i * 190 + 62, y2 = 60 + pos[i] * 190 + 62;
    const p = svgEl('path', { d: `M330,${y1} C450,${y1} 410,${y2} 520,${y2}`, stroke: '#3dff9a', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, $('#links'));
    p.style.filter = 'drop-shadow(0 0 8px #3dff9a)';
    R.draw(p, tExact - .1 + i * .12, .3);
    cue(tExact - .1 + i * .12, 'blip', .45, 0, { f: 1300 + i * 200 });
  });
  center('#sameBars'); R.slam('#sameBars', tBars - .1, 2, .2); cue(tBars + .1, 'chime', .7); R.flash(tBars + .1, .2, .4, '#c8ffe0');
}

/* ---------- 11 · OUTRO: back up to the street… look down (lands on frame 0) ---------- */
{
  const tSo = W('V12', 0), tLib = W('V12', 6), tLook = W('V12', 8), tDown = W('V12', 9);
  through('outro', { last: true, sfx: null });
  // the shaft comes back at the vault and rises to the street
  tl.to('#shaftWrap, #depth, #depthL, #gauge', { opacity: 1, duration: .3 }, S('outro'));
  tl.set('#shaft', { y: SHAFT_Y }, S('outro') - .01);
  tl.set('#vaultWall', { filter: 'brightness(1.05)' }, S('outro') - .01);
  tl.to('#shaft', { y: 0, duration: tLib - tSo + .1, ease: 'power2.inOut' }, tSo);
  const dep = { v: 80 }; tl.set('#depth', { textContent: depthFmt(80) }, S('outro') - .01);
  tl.to(dep, { v: 0, duration: tLib - tSo + .1, ease: 'power2.inOut', onUpdate: () => { $('#depth').textContent = depthFmt(dep.v); } }, tSo);
  tl.set('#gauge .fill', { scaleY: 1 }, S('outro') - .01);
  tl.to('#gauge .fill', { scaleY: 0, duration: tLib - tSo + .1, ease: 'power2.inOut' }, tSo);
  cue(tSo, 'rumble', .7, 0, { dur: tLib - tSo + .1 }); cue(tSo + .3, 'riser', .4, 0, { dur: tLib - tSo - .2 });
  tl.set('#sign', { y: -40 }, S('outro') - .01);
  tl.to('#sign', { y: 0, duration: .5, ease: 'back.out(1.6)' }, tLib - .1);
  tl.to('#sign', { scale: 1.12, duration: .2, yoyo: true, repeat: 1, ease: 'sine.inOut', transformOrigin: '50% 100%' }, tLib + .2); cue(tLib + .1, 'chime', .5);
  dust(S('outro'), .35);
  // look down: an arrow points at the street, then fades so the last frame matches the first
  tl.set('#downArrow', { opacity: 0, y: -60 }, 0);
  tl.to('#downArrow', { opacity: 1, y: 0, duration: .3, ease: 'back.out(2)' }, tLook - .1); cue(tLook - .1, 'whoosh', .5);
  tl.to('#downArrow', { y: 40, duration: .3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tDown + .15);
  tl.to('#downArrow', { opacity: 0, duration: .35 }, TOTAL - .55);
  cue(tDown + .3, 'boom', .6);
}

R.captions($('#caps'));
R.finish('vault');
