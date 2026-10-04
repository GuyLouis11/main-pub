/* credit-score kit (widescreen, from the hidden-money kit): runtime handles, helpers, drawn brand marks, 3D components, chapter worlds, the countdown rail.
   Everything is keyed to spoken words through W(id, k) — k is a word index or the word itself. */
const R = RT_INIT();
const { tl, S, E, V, VE, W, WE, rnd, $, $$, div, cue, TOTAL } = R;
const NS = 'http://www.w3.org/2000/svg';
const svg = (html, css) => { const d = document.createElement('div'); d.className = 'abs'; d.innerHTML = html; d.dataset.f = '1'; if (css) d.style.cssText += css; return d; };
const put = (host, el) => { (typeof host === 'string' ? $(host) : host).appendChild(el); return el; };
const sc = id => $(`[data-scene="${id}"]`);
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const commas = v => Math.round(v).toLocaleString('en-US');
const GOLD = '#ffc640', CREAM = '#fff4d6', RED = '#ff4a3d', GRN = '#3dff9a', SKY = '#4fc3ff';

/* ---------- motion helpers ---------- */
const through = (id, { first = false, last = false, sfx = 'whoosh', mode = 'zoom' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) {
    if (mode === 'slide') { tl.set(s, { opacity: 0, x: 160 }, 0); tl.to(s, { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, S(id)); }
    else { tl.set(s, { opacity: 0, scale: .94 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .32, ease: 'power3.out' }, S(id)); }
    if (sfx) cue(S(id), sfx, .45);
  }
  if (!last) tl.to(s, { opacity: 0, scale: 1.05, duration: .24, ease: 'power2.in' }, E(id) - .24);
};
const pop = (el, t, from = .4, d = .32) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)' }, t); };
const up = (el, t, y = 40, d = .32) => { tl.set(el, { opacity: 0, y }, 0); tl.to(el, { opacity: 1, y: 0, duration: d, ease: 'power3.out' }, t); };
const fromL = (el, t, x = -200, d = .35) => { tl.set(el, { opacity: 0, x }, 0); tl.to(el, { opacity: 1, x: 0, duration: d, ease: 'power3.out' }, t); };
const slam = (el, t, from = 2.2, col = '#ffc640') => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, t); burst(el, t + .2, col, 14, 200); };
const out = (el, t, d = .25) => tl.to(el, { opacity: 0, duration: d }, t);
const punch = (t, a = 1.04) => { tl.to('#stage', { scale: a, duration: .12, ease: 'power2.out', transformOrigin: '50% 45%' }, t).to('#stage', { scale: 1, duration: .38, ease: 'power2.inOut' }, t + .12); };
const countTo = (el, t, d, a, b, fmt) => { const e = typeof el === 'string' ? $(el) : el; R.count(e, t, d, a, b, fmt); };
const src = (host, txt, t) => { const e = div('mono abs', host, txt, 'left:0;top:868px;width:1920px;text-align:center;font-size:20px;color:rgba(255,244,214,.75);letter-spacing:2px'); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .3 }, t); };
// camera move on a whole scene: a slow push/pan with a little 3D tilt
const cam = (id, { z = 1.06, x = 0, y = -14, rx = 0, ry = 0 } = {}) => { const h = sc(id); tl.fromTo(h, { scale: 1, x: 0, y: 0, rotationX: rx, rotationY: ry, transformPerspective: 2200 }, { scale: z, x, y, rotationX: 0, rotationY: 0, duration: E(id) - S(id), ease: 'sine.inOut', immediateRender: false }, S(id)); };
const typeWords = (host, text, id, from = 0, css = '', redFrom = 999) => {
  text.split(' ').forEach((w, i) => { const sp = document.createElement('span'); sp.textContent = w + ' '; sp.style.cssText = 'display:inline-block;white-space:pre;' + (i >= redFrom ? 'color:#c8102e;' : '') + css; host.appendChild(sp);
    tl.set(sp, { opacity: 0, y: 12 }, 0); tl.to(sp, { opacity: 1, y: 0, duration: .14 }, W(id, from + i) - .03); });
};

/* ---------- drawn assets (brand marks used editorially) ---------- */
const A = {
  costco: (w = 420) => `<svg viewBox="0 0 420 150" style="width:${w}px;height:${w * 150 / 420}px"><text x="226" y="92" text-anchor="middle" font-family="Anton" font-size="104" fill="#e31837" transform="skewX(-10)" letter-spacing="2">COSTCO</text><rect x="40" y="102" width="340" height="36" fill="#005daa"/><text x="210" y="130" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="28" fill="#fff" letter-spacing="10">WHOLESALE</text></svg>`,
  arches: (w = 300, c = '#ffc72c') => `<svg viewBox="0 0 300 260" style="width:${w}px;height:${w * 260 / 300}px"><path d="M20,250 L20,140 C20,30 70,10 95,10 C125,10 150,60 150,120 C150,60 175,10 205,10 C230,10 280,30 280,140 L280,250 L238,250 L238,150 C238,80 222,56 205,56 C186,56 172,90 172,150 L172,250 L128,250 L128,150 C128,90 114,56 95,56 C78,56 62,80 62,150 L62,250 Z" fill="${c}"/></svg>`,
  delta: (w = 320) => `<svg viewBox="0 0 340 110" style="width:${w}px;height:${w * 110 / 340}px"><path d="M10,96 L52,14 L94,96 Z" fill="#c8102e"/><path d="M52,14 L94,96 L60,96 Z" fill="#8b0d22"/><text x="110" y="84" font-family="Space Grotesk" font-weight="700" font-size="74" fill="#fff" letter-spacing="2">DELTA</text></svg>`,
  amex: (w = 200) => `<div style="width:${w}px;height:${w}px;background:#016fd0;border-radius:${w * .06}px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 ${w * .19}px/1.02 'Space Grotesk';color:#fff;letter-spacing:-1px;text-align:center"><div>AMERICAN</div><div>EXPRESS</div></div>`,
  united: (w = 300) => `<svg viewBox="0 0 300 100" style="width:${w}px;height:${w / 3}px"><circle cx="50" cy="50" r="40" fill="#005daa"/><g stroke="#fff" stroke-width="4" fill="none"><ellipse cx="50" cy="50" rx="18" ry="40"/><path d="M10,50 L90,50 M16,30 L84,30 M16,70 L84,70"/></g><text x="104" y="68" font-family="Space Grotesk" font-weight="700" font-size="54" fill="#fff" letter-spacing="3">UNITED</text></svg>`,
  starbucks: (w = 220) => `<svg viewBox="0 0 220 220" style="width:${w}px;height:${w}px"><circle cx="110" cy="110" r="104" fill="#00704a"/><circle cx="110" cy="110" r="82" fill="none" stroke="#fff" stroke-width="6"/><path d="M110,58 L120,88 L152,88 L126,106 L136,136 L110,118 L84,136 L94,106 L68,88 L100,88 Z" fill="#fff"/><text x="110" y="182" text-anchor="middle" font-family="Anton" font-size="26" fill="#fff" letter-spacing="3">COFFEE</text></svg>`,
  amazon: (w = 360) => `<svg viewBox="0 0 360 130" style="width:${w}px;height:${w * 130 / 360}px"><text x="180" y="76" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="84" fill="#fff" letter-spacing="-2">amazon</text><path d="M70,96 Q180,140 290,96" stroke="#ff9900" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M272,86 L298,94 L284,116" stroke="#ff9900" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  fuel: (w = 360) => `<svg viewBox="0 0 360 120" style="width:${w}px;height:${w / 3}px"><rect x="0" y="0" width="360" height="120" rx="18" fill="#14234d" stroke="#ffd23f" stroke-width="6"/><text x="180" y="78" text-anchor="middle" font-family="Anton" font-size="62" fill="#ffd23f" letter-spacing="4">FUEL+MART</text></svg>`,
  hotdog: (w = 420) => `<svg viewBox="0 0 520 400" style="width:${w}px;height:${w * 400 / 520}px;overflow:visible"><ellipse cx="220" cy="372" rx="200" ry="18" fill="rgba(0,0,0,.35)"/><rect x="380" y="90" width="110" height="280" rx="14" fill="#e8322b"/><rect x="380" y="150" width="110" height="60" fill="#fff" opacity=".9"/><rect x="372" y="70" width="126" height="30" rx="10" fill="#f2efe6"/><rect x="430" y="10" width="12" height="70" rx="6" fill="#f2efe6"/><path d="M30,250 Q30,190 90,190 L330,190 Q380,190 380,250 Q380,330 300,330 L110,330 Q30,330 30,250 Z" fill="#e9b872"/><path d="M20,230 Q20,200 50,200 L350,200 Q385,200 385,232 Q385,262 350,262 L50,262 Q20,262 20,230 Z" fill="#b5462c"/><path d="M50,226 Q90,204 130,226 T210,226 T290,226 T360,224" stroke="#ffcf3a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M40,262 Q40,300 90,300 L330,300 Q372,300 372,262 Z" fill="#d9a35a"/></svg>`,
  burger: (w = 260) => `<svg viewBox="0 0 260 200" style="width:${w}px;height:${w * 200 / 260}px"><path d="M20,80 Q20,10 130,10 Q240,10 240,80 Z" fill="#e8a33a"/><g fill="#fff6d0"><ellipse cx="80" cy="40" rx="6" ry="3"/><ellipse cx="130" cy="30" rx="6" ry="3"/><ellipse cx="180" cy="44" rx="6" ry="3"/></g><rect x="14" y="80" width="232" height="18" rx="9" fill="#5fae3a"/><rect x="20" y="96" width="220" height="16" fill="#ffd23f"/><rect x="16" y="110" width="228" height="34" rx="12" fill="#6b3b1e"/><path d="M20,146 L240,146 Q240,190 130,190 Q20,190 20,146 Z" fill="#e8a33a"/></svg>`,
  cup: (w = 200, c = '#00704a') => `<svg viewBox="0 0 120 150" style="width:${w}px;height:${w * 1.25}px"><path d="M22,30 L98,30 L88,146 L32,146 Z" fill="#f5f1e6"/><rect x="16" y="18" width="88" height="16" rx="6" fill="#fff"/><rect x="40" y="4" width="40" height="16" rx="6" fill="#fff"/><circle cx="60" cy="88" r="22" fill="${c}"/><path d="M60,74 L64,84 L74,84 L66,90 L69,100 L60,94 L51,100 L54,90 L46,84 L56,84 Z" fill="#fff"/></svg>`,
  nozzle: (w = 140, c = '#ffd23f') => `<svg viewBox="0 0 140 140" style="width:${w}px;height:${w}px"><path d="M20,30 L80,30 L96,48 L96,70 L70,70 L64,110 L40,110 L46,70 L20,70 Z" fill="${c}"/><path d="M96,52 L128,60 L128,70 L96,66 Z" fill="#c9c9d6"/></svg>`,
  plane: (w = 120, c = '#e3eef9') => `<svg viewBox="0 0 120 120" style="width:${w}px;height:${w}px"><path d="M60,6 L68,44 L112,62 L112,72 L68,64 L66,92 L80,102 L80,110 L60,104 L40,110 L40,102 L54,92 L52,64 L8,72 L8,62 L52,44 Z" fill="${c}"/></svg>`,
  box: (w = 160) => `<svg viewBox="0 0 160 140" style="width:${w}px;height:${w * .875}px"><path d="M10,40 L80,10 L150,40 L80,70 Z" fill="#e0b47a"/><path d="M10,40 L80,70 L80,134 L10,104 Z" fill="#c8944f"/><path d="M150,40 L80,70 L80,134 L150,104 Z" fill="#b07b3a"/><path d="M40,92 Q80,110 120,92" stroke="#1a1a1a" stroke-width="5" fill="none" transform="translate(-30 0)"/></svg>`,
  person: (w = 60, c = 'currentColor') => `<svg viewBox="0 0 60 100" style="width:${w}px;height:${w * 1.66}px"><circle cx="30" cy="20" r="16" fill="${c}"/><path d="M4,100 L8,52 Q30,38 52,52 L56,100 Z" fill="${c}"/></svg>`,
  coin: (w = 80, sym = '$', c = '#ffc640') => `<svg viewBox="0 0 120 120" style="width:${w}px;height:${w}px"><circle cx="60" cy="60" r="50" fill="${c}"/><circle cx="60" cy="60" r="38" fill="none" stroke="#a8700a" stroke-width="5"/><text x="60" y="78" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="46" fill="#a8700a">${sym}</text></svg>`,
  card: (w = 420, label = 'CARD', a = '#1b3a6b', b = '#0b1a33') => `<div style="position:relative;width:${w}px;height:${w * .63}px;border-radius:${w * .06}px;background:linear-gradient(135deg,${a},${b});border:3px solid rgba(255,255,255,.35);box-shadow:0 30px 70px rgba(0,0,0,.55);overflow:hidden"><div style="position:absolute;left:8%;top:38%;width:16%;height:22%;border-radius:10px;background:linear-gradient(135deg,#e9d38a,#b8912a)"></div><div class="anton" style="position:absolute;left:8%;top:9%;font-size:${w * .1}px;color:#fff;letter-spacing:3px">${label}</div><div class="mono" style="position:absolute;left:8%;top:72%;font-size:${w * .065}px;color:#dbe9f7">•••• •••• •••• 2025</div></div>`,
};

/* ---------- 3D: an extruded box (building, server, crate) ---------- */
const box3d = (host, { x, y, w, h, d, top = '#ccc', front = '#999', side = '#777', html = '' }) => {
  const b = div('box3d', host, '', `left:${x}px;top:${y}px;width:${w}px;height:${h}px`);
  const f = (css, bg, inner = '') => { const e = document.createElement('i'); e.style.cssText = css + `;background:${bg}`; e.innerHTML = inner; b.appendChild(e); };
  f(`width:${w}px;height:${h}px;transform:translateZ(${d / 2}px)`, front, html);
  f(`width:${d}px;height:${h}px;left:${w - d / 2}px;transform:rotateY(90deg)`, side);
  f(`width:${w}px;height:${d}px;top:${-d / 2}px;transform:rotateX(90deg)`, top);
  f(`width:${d}px;height:${h}px;left:${-d / 2}px;transform:rotateY(-90deg)`, side);
  return b;
};
// a coin that spins in 3D
const coin3d = (host, x, y, w, t0, turns = 2, sym = '$') => {
  const c = div('box3d', host, '', `left:${x}px;top:${y}px;width:${w}px;height:${w}px`);
  for (const r of [0, 180]) { const e = document.createElement('i'); e.style.cssText = `width:${w}px;height:${w}px;transform:rotateY(${r}deg) translateZ(4px)`; e.innerHTML = A.coin(w, sym); c.appendChild(e); }
  tl.set(c, { rotationY: 0, transformPerspective: 900, opacity: 0, scale: .4 }, 0); tl.to(c, { opacity: 1, scale: 1, duration: .25, ease: 'back.out(2)' }, t0);
  tl.to(c, { rotationY: 360 * turns, duration: 1.4 * turns, ease: 'power2.out' }, t0);
  return c;
};

/* ---------- chapter worlds (backgrounds that crossfade per chapter) ---------- */
const WORLDS = {
  intro: 'radial-gradient(ellipse 90% 80% at 50% 40%,#2a2370 0%,#1a1450 50%,#0c0a2c 100%)',
  archive: 'radial-gradient(ellipse 90% 80% at 50% 40%,#7a5634 0%,#4a321d 50%,#1e140b 100%)',
  blueprint: 'radial-gradient(ellipse 90% 80% at 50% 40%,#1f5fa8 0%,#123e78 50%,#071a38 100%)',
  formula: 'radial-gradient(ellipse 90% 80% at 50% 40%,#11806e 0%,#0b5248 50%,#04221f 100%)',
  product: 'radial-gradient(ellipse 90% 80% at 50% 40%,#2e3b6e 0%,#1a2347 50%,#0a0e22 100%)',
  alert: 'radial-gradient(ellipse 90% 80% at 50% 40%,#8e1f2e 0%,#55101c 50%,#1f050b 100%)',
  cost: 'radial-gradient(ellipse 90% 80% at 50% 40%,#2f7d3a 0%,#1b4f25 50%,#08200f 100%)',
  outro: 'radial-gradient(ellipse 90% 80% at 50% 40%,#5a2a8a 0%,#2b1d6b 50%,#0e0a2c 100%)',
};
const worldLayer = {};
(() => {
  Object.entries(WORLDS).forEach(([k, bg]) => { const w = div('world', $('#bg'), '', `background:${bg}`); worldLayer[k] = w; });
  tl.set(worldLayer.intro, { opacity: 1 }, 0);
})();
const toWorld = (k, t, from = null) => { Object.entries(worldLayer).forEach(([n, w]) => { if (n === k) tl.to(w, { opacity: 1, duration: .6 }, t); else tl.to(w, { opacity: 0, duration: .6 }, t); }); };

/* ---------- ambient particles + drifting prop layer (themed per chapter) ---------- */
const PROPS = {};
(() => {
  const cv = $('#fx'), cx = cv.getContext('2d');
  const P = []; for (let i = 0; i < 90; i++) P.push({ x: rnd() * 1920, y: rnd() * 1080, s: 1 + rnd() * 2.6, sp: 6 + rnd() * 16, ph: rnd() * 6.3 });
  const draw = t => { cx.clearRect(0, 0, 1920, 1080); for (const p of P) { let y = (p.y - t * p.sp) % 1080; if (y < 0) y += 1080; const f = Math.min(1, y / 120, (1080 - y) / 120); cx.fillStyle = `rgba(255,230,170,${(.3 * f).toFixed(3)})`; cx.beginPath(); cx.arc(p.x + Math.sin(t * .5 + p.ph) * 14, y, p.s, 0, 6.28); cx.fill(); } };
  const pr = { t: 0 }; tl.fromTo(pr, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(pr.t) }, 0);
  tl.fromTo('#grid', { y: 0 }, { y: 120, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
})();
// a layer of floating props for a chapter (fades in/out with the chapter; drifts and returns)
const propLayer = (key, icons, t0, t1, n = 18, alpha = .18) => {
  const L = document.createElement('div'); L.className = 'abs'; L.style.cssText = 'inset:0'; L.dataset.drift = '1'; $('#stage').parentNode.insertBefore(L, $('#stage'));
  for (let i = 0; i < n; i++) {
    const d = div('abs', L, icons[i % icons.length], `left:${(i * 233) % 1840}px;top:${60 + (i * 157) % 800}px;width:110px;height:110px;opacity:${alpha * (.7 + rnd() * .6)}`); d.dataset.drift = '1';
    tl.set(d, { scale: .6 + rnd() * .7, rotation: (rnd() - .5) * 50 }, 0);
    tl.to(d, { y: -(40 + rnd() * 90), x: (rnd() - .5) * 90, rotation: '+=' + ((rnd() - .5) * 60), duration: (t1 - t0) / 2, ease: 'sine.inOut', yoyo: true, repeat: 1, data: 'drift' }, t0);
  }
  tl.set(L, { opacity: 0 }, 0); tl.to(L, { opacity: 1, duration: .6 }, t0); tl.to(L, { opacity: 0, duration: .6 }, t1 - .6);
  PROPS[key] = L; return L;
};

/* ---------- chapter rail (1 → 6) ---------- */
const RAIL = {};
(() => { const r = div('', $('#root'), '', ''); r.id = 'rail'; [1, 2, 3, 4, 5, 6].forEach(n => { RAIL[n] = div('pip', r, String(n)); }); tl.set(r, { opacity: 0 }, 0); RAIL.el = r; })();
const railTo = (n, t) => {
  tl.to(RAIL.el, { opacity: 1, duration: .3 }, t);
  [1, 2, 3, 4, 5, 6].forEach(k => {
    const p = RAIL[k];
    if (k === n) tl.to(p, { backgroundColor: GOLD, color: '#120d04', borderColor: GOLD, scale: 1.15, duration: .3, ease: 'back.out(2)' }, t);
    else if (k < n) tl.to(p, { backgroundColor: 'rgba(255,198,64,.25)', color: 'rgba(255,255,255,.8)', borderColor: 'rgba(255,198,64,.6)', scale: 1, duration: .3 }, t);
  });
  cue(t, 'tick', .4, -.8, { f: 1400 + n * 120 });
};

/* ---------- chapter chip (one per scene) ---------- */
const chip = (id, label, n) => {
  const c = div('chip', $('#chips'), `<b>${n}</b>${label}`);
  tl.set(c, { opacity: 0, y: -24, xPercent: -50 }, 0);
  tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, S(id) + .12);
  tl.to(c, { opacity: 0, y: -24, duration: .15 }, E(id) - .15);
};

/* ---------- the chapter card: CHAPTER 0n flips in, title slides, an icon on a 3D plinth ---------- */
const chapterCard = (id, n, title, sub, icon, accent, world) => {
  const host = sc(id), t = S(id);
  toWorld(world, t - .2);
  railTo(n, t + .3);
  const k = put(host, svg(`<div class="kick" style="letter-spacing:14px;color:${accent}">CHAPTER</div>`, 'left:180px;top:170px')); up(k, t + .05, 20);
  const num = put(host, svg(`<div class="big glow" style="font-size:300px;--acc:${accent}">0${n}</div>`, 'left:160px;top:215px'));
  tl.set(num, { opacity: 0, rotationY: -90, transformPerspective: 1400, transformOrigin: '50% 50%' }, 0);
  tl.to(num, { opacity: 1, rotationY: 0, duration: .6, ease: 'back.out(1.4)' }, t + .1);
  const bar = put(host, svg(`<div style="width:1560px;height:10px;border-radius:5px;background:${accent};box-shadow:0 0 30px ${accent}"></div>`, 'left:180px;top:545px'));
  tl.set(bar, { scaleX: 0, transformOrigin: '0 50%' }, 0); tl.to(bar, { scaleX: 1, duration: .6, ease: 'power3.out' }, t + .3);
  const nm = put(host, svg(`<div class="anton" style="font-size:124px;color:#fff;text-shadow:0 8px 0 rgba(0,0,0,.5)">${title}</div>`, 'left:180px;top:585px'));
  fromL(nm, t + .35, -160, .45);
  const sb = put(host, svg(`<div class="serif" style="font-size:54px;color:${CREAM};white-space:nowrap">${sub}</div>`, 'left:184px;top:745px')); up(sb, t + .6, 30);
  const ic = put(host, svg(`<div style="width:420px;height:420px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.16),rgba(255,255,255,0) 70%)">${icon}</div>`, 'left:1320px;top:105px'));
  tl.set(ic, { opacity: 0, scale: .4, rotationY: 80, transformPerspective: 1200 }, 0); tl.to(ic, { opacity: 1, scale: 1, rotationY: 0, duration: .6, ease: 'back.out(1.6)' }, t + .45);
  tl.to(ic, { rotationY: -14, y: -16, duration: E(id) - t - 1, ease: 'sine.inOut' }, t + 1.05);
  cue(t + .1, 'impact', .8); cue(t + .15, 'riser', .3, 0, { dur: .4 }); cue(t + .45, 'whoosh', .4, .5);
  tl.to(num, { rotationY: 12, duration: E(id) - t - .4, ease: 'sine.inOut' }, t + .7);
  const band = put(host, svg(`<div style="width:1920px;height:64px;background:linear-gradient(90deg,${accent},${accent}cc);transform:rotate(-2deg);box-shadow:0 10px 40px rgba(0,0,0,.4);overflow:hidden"><div class="mq anton" style="font-size:44px;line-height:64px;color:#0a0618;white-space:nowrap">${Array(12).fill(title + ' &nbsp;✦&nbsp; ').join('')}</div></div>`, 'left:0;top:850px'));
  tl.set(band, { opacity: 0, x: -300 }, 0); tl.to(band, { opacity: 1, x: 0, duration: .45, ease: 'power3.out' }, t + .2);
  tl.fromTo(band.querySelector('.mq'), { x: 0 }, { x: -700, duration: E(id) - t, ease: 'none', immediateRender: false }, t);
  cam(id, { z: 1.05 });
  through(id, { sfx: null });
};
