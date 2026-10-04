/* Gas Is the Bait — motion design. Every beat sits on a spoken word (W(id, k)). Frame 0 == last frame (loops). */
const R = RT_INIT();
const { tl, S, E, V, VE, W, rnd, $, div, cue, TOTAL } = R;
const svg = (html, css) => { const d = document.createElement('div'); d.className = 'abs'; d.innerHTML = html; if (css) d.style.cssText += css; return d; };
const put = (host, el) => { (typeof host === 'string' ? $(host) : host).appendChild(el); return el; };
const sc = id => $(`[data-scene="${id}"]`);
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const commas = v => Math.round(v).toLocaleString('en-US');
const Y = '#ffd23f', O = '#f08c4f', RED = '#ff5a3c', GRN = '#3dff9a', CREAM = '#fff4d6';
const through = (id, { first = false, last = false, sfx = 'whoosh' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) { tl.set(s, { opacity: 0, scale: .94 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .3, ease: 'power3.out' }, S(id)); if (sfx) cue(S(id), sfx, .5); }
  if (!last) tl.to(s, { opacity: 0, scale: 1.06, duration: .24, ease: 'power2.in' }, E(id) - .24);
};
const pop = (el, t, from = .4, d = .32) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)' }, t); };
const up = (el, t, y = 40, d = .32) => { tl.set(el, { opacity: 0, y }, 0); tl.to(el, { opacity: 1, y: 0, duration: d, ease: 'power3.out' }, t); };
const slam = (el, t, from = 2.2) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, t); };
const punch = (t, a = 1.05) => { tl.to('#stage', { scale: a, duration: .12, ease: 'power2.out', transformOrigin: '50% 40%' }, t).to('#stage', { scale: 1, duration: .38, ease: 'power2.inOut' }, t + .12); };
const src = (host, txt, t) => { const e = div('mono abs', host, txt, 'left:0;top:1178px;width:1080px;text-align:center;font-size:22px;color:rgba(255,244,214,.75);letter-spacing:2px'); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .3 }, t); };

/* ---------- assets ---------- */
const NOZZLE = (w = 140, c = Y) => `<svg viewBox="0 0 140 140" style="width:${w}px;height:${w}px"><path d="M20,30 L80,30 L96,48 L96,70 L70,70 L64,110 L40,110 L46,70 L20,70 Z" fill="${c}"/><path d="M96,52 L128,60 L128,70 L96,66 Z" fill="#c9c9d6"/><path d="M50,74 Q60,96 76,86" stroke="#2a2160" stroke-width="6" fill="none"/></svg>`;
const ICON = {
  coffee: `<svg viewBox="0 0 120 120"><path d="M30,30 L90,30 L82,108 L38,108 Z" fill="${CREAM}"/><rect x="26" y="22" width="68" height="12" rx="4" fill="#6b3b1e"/><rect x="34" y="56" width="52" height="22" fill="#c0392b"/></svg>`,
  can: `<svg viewBox="0 0 120 120"><rect x="38" y="14" width="44" height="94" rx="10" fill="#2ee6a8"/><rect x="38" y="44" width="44" height="30" fill="#14234d"/><path d="M52,50 L62,60 L56,62 L66,72" stroke="#ffd23f" stroke-width="4" fill="none"/></svg>`,
  chips: `<svg viewBox="0 0 120 120"><path d="M28,14 L92,14 L98,106 L22,106 Z" fill="#ff8a2a"/><path d="M22,30 L98,30 M22,92 L98,92" stroke="#c45a10" stroke-width="5"/><circle cx="60" cy="60" r="18" fill="#ffd23f"/></svg>`,
  dog: `<svg viewBox="0 0 120 120"><path d="M10,64 Q10,44 30,44 L90,44 Q110,44 110,64 Q110,84 90,84 L30,84 Q10,84 10,64 Z" fill="#e9b872"/><path d="M8,60 Q8,52 18,52 L102,52 Q112,52 112,60 Q112,68 102,68 L18,68 Q8,68 8,60 Z" fill="#b5462c"/></svg>`,
  nozzle: NOZZLE(120, '#ffd23f'),
  coin: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="#ffd23f"/><text x="60" y="76" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="40" fill="#a8700a">¢</text></svg>`,
  card: `<svg viewBox="0 0 120 120"><rect x="8" y="28" width="104" height="66" rx="10" fill="#3b2466" stroke="#fff4d6" stroke-width="3"/><rect x="20" y="46" width="22" height="16" rx="3" fill="#ffd23f"/></svg>`,
  drop: `<svg viewBox="0 0 120 120"><path d="M60,10 Q90,56 90,76 A30,30 0 0 1 30,76 Q30,56 60,10 Z" fill="#ff8a2a"/></svg>`,
};
const BRAND = (w = 360) => `<svg viewBox="0 0 360 120" style="width:${w}px;height:${w / 3}px"><rect x="0" y="0" width="360" height="120" rx="18" fill="#14234d" stroke="#ffd23f" stroke-width="6"/><text x="180" y="78" text-anchor="middle" font-family="Anton" font-size="62" fill="#ffd23f" letter-spacing="4">FUEL+MART</text></svg>`;

/* ================= world: skyline + highway along the bottom, drifting props, glow ================= */
(() => {
  const w = put('#stage', svg(`<svg viewBox="0 0 1080 760" style="width:1080px;height:760px">
    <defs><linearGradient id="rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d4a"/><stop offset="1" stop-color="#120c24"/></linearGradient></defs>
    <g fill="#2a1a52" opacity=".9">${Array.from({ length: 16 }, (_, i) => { const h = 80 + ((i * 53) % 160); return `<rect x="${i * 70 - 10}" y="${260 - h}" width="62" height="${h}"/>`; }).join('')}</g>
    <g fill="#ffd23f" opacity=".5">${Array.from({ length: 60 }, (_, i) => `<rect x="${(i * 71) % 1080}" y="${150 + (i * 37) % 100}" width="8" height="10"/>`).join('')}</g>
    <rect x="0" y="260" width="1080" height="500" fill="url(#rd)"/>
    <path d="M0,420 L1080,420" stroke="#ffd23f" stroke-width="8" stroke-dasharray="60 50" opacity=".55"/></svg>`, 'left:0;top:1160px'));
  w.dataset.drift = '1'; $('#stage').insertBefore(w, $('#stage').firstChild);
  tl.fromTo(w.querySelector('path'), { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': -1100 }, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
  const cv = $('#fx'), cx = cv.getContext('2d');
  const P = []; for (let i = 0; i < 70; i++) P.push({ x: rnd() * 1080, y: rnd() * 1300, s: 1 + rnd() * 2.5, sp: 6 + rnd() * 16, ph: rnd() * 6.3 });
  const draw = t => { cx.clearRect(0, 0, 1080, 1920); for (const p of P) { let y = (p.y - t * p.sp) % 1300; if (y < 0) y += 1300; const f = Math.min(1, y / 150, (1300 - y) / 150); cx.fillStyle = `rgba(255,220,140,${(.35 * f).toFixed(3)})`; cx.beginPath(); cx.arc(p.x + Math.sin(t * .5 + p.ph) * 12, y, p.s, 0, 6.28); cx.fill(); } };
  const pr = { t: 0 }; tl.fromTo(pr, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(pr.t) }, 0);
  // drifting props behind the scenes; they drift out and back so the last frame matches frame 0
  const L = document.createElement('div'); L.className = 'abs'; L.style.cssText = 'inset:0'; L.dataset.drift = '1'; $('#stage').parentNode.insertBefore(L, $('#stage'));
  Object.values(ICON).concat(Object.values(ICON)).concat(Object.values(ICON)).forEach((ic, i) => {
    const d = div('abs', L, ic, `left:${(i * 173) % 1000}px;top:${120 + (i * 263) % 1050}px;width:120px;height:120px;opacity:${.2 + rnd() * .15}`); d.dataset.drift = '1';
    tl.set(d, { scale: .55 + rnd() * .7, rotation: (rnd() - .5) * 50 }, 0);
    tl.to(d, { y: -(50 + rnd() * 110), x: (rnd() - .5) * 70, rotation: '+=' + ((rnd() - .5) * 60), duration: TOTAL / 2, ease: 'sine.inOut', yoyo: true, repeat: 1, data: 'drift' }, 0);
  });
})();
{
  const lab = { hook: 'THE PUMP', two: 'THE MATH', swipe: 'THE FEES', bait: 'THE TRICK', split: 'THE SPLIT', inside: 'THE STORE', walk: 'THE WALK-IN', sign: 'THE SIGN', outro: 'YOUR TURN' };
  Object.keys(lab).forEach((id, i, a) => {
    const c = div('chip', $('#chips'), `<b>${String(i + 1).padStart(2, '0')}</b>${lab[id]}`);
    tl.set(c, { opacity: 0, y: -24, xPercent: -50 }, 0);
    tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, i ? S(id) + .1 : .35);
    tl.to(c, { opacity: 0, y: -24, duration: .15 }, i < a.length - 1 ? E(id) - .15 : TOTAL - 1.4);
  });
}

/* ================= frame 0 (and last frame): the station price sign + "13¢" ================= */
const f0 = put('#stage', svg(`
  <div style="position:absolute;left:250px;top:190px;width:580px;padding:26px;border-radius:26px;background:#14234d;border:6px solid ${Y};box-shadow:0 0 60px rgba(255,210,63,.35)">
    <div style="text-align:center">${BRAND(300)}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:22px;padding:14px 20px;border-radius:14px;background:#000"><span class="anton" style="font-size:44px;color:${CREAM}">REGULAR</span><span class="led" style="font-size:76px">3.49<sup style="font-size:36px">9</sup></span></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:14px 20px;border-radius:14px;background:#000"><span class="anton" style="font-size:44px;color:${CREAM}">DIESEL</span><span class="led" style="font-size:76px">3.89<sup style="font-size:36px">9</sup></span></div></div>
  <div id="f0c" class="big greentx" style="position:absolute;left:0;top:800px;width:1080px;text-align:center;font-size:210px">13¢</div>`, 'inset:0'));

/* ---------- 1 · HOOK: 13 cents a gallon — so why sell gas? ---------- */
{
  const t13 = W('G01', 9), tGal = W('G01', 12), tWhy = W('G01', 14), tNev = W('G01', 17), tGas = W('G01', 21);
  tl.to('#f0c', { scale: 1.06, duration: .5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .05); cue(.05, 'blip', .4, 0, { f: 900 });
  tl.to('#f0c', { scale: 1.2, duration: .15, yoyo: true, repeat: 1 }, t13); cue(t13, 'impact', .7);
  const per = put(sc('hook'), svg(`<div class="pill" style="position:relative;background:${Y};color:#120d04;font-size:40px">PROFIT PER GALLON</div>`, 'left:540px;top:1040px')); center(per); pop(per, tGal - .1); cue(tGal - .1, 'pop', .5);
  tl.to(f0, { y: -120, scale: .82, opacity: .9, duration: .4, ease: 'power3.inOut', transformOrigin: '50% 20%' }, tWhy - .3);
  tl.to(per, { opacity: 0, duration: .2 }, tWhy - .3);
  const q = put(sc('hook'), svg(`<div class="big greentx" style="font-size:150px">WHY SELL</div><div class="big" style="font-size:150px;color:${O};text-shadow:0 0 40px rgba(240,140,79,.7)">GAS?</div>`, 'left:0;top:840px;width:1080px;text-align:center'));
  up(q, tNev - .15, 50); cue(tNev, 'impact', .6);
  const car = put(sc('hook'), svg(`<svg viewBox="0 0 300 140" style="width:300px;height:140px"><path d="M20,90 Q30,50 80,46 L120,20 L200,20 L240,50 Q284,56 286,90 L286,110 L20,110 Z" fill="#ff5a3c"/><rect x="128" y="30" width="60" height="26" fill="#9fd3ff"/><rect x="84" y="34" width="38" height="22" fill="#9fd3ff"/><circle cx="80" cy="112" r="24" fill="#120c24"/><circle cx="230" cy="112" r="24" fill="#120c24"/></svg>`, 'left:-340px;top:1080px'));
  tl.to(car, { x: 1500, duration: 1.4, ease: 'power1.inOut' }, tWhy - .2); cue(tWhy - .2, 'swoosh', .6);
  tl.to(f0, { opacity: 0, duration: .25 }, E('hook') - .25);
  through('hook', { first: true });
}

/* ---------- 2 · TWO: 15 gallons → about two bucks ---------- */
{
  through('two');
  const host = sc('two'), t15 = W('G02', 2), tOwn = W('G02', 6), tTwo = W('G02', 9);
  const pump = put(host, svg(`<div style="position:relative;width:560px;height:760px;border-radius:40px 40px 20px 20px;background:linear-gradient(180deg,#e9e4f5,#b9b2d6);box-shadow:0 30px 80px rgba(0,0,0,.45)">
    <div style="position:absolute;left:30px;top:30px;width:500px;height:120px;border-radius:16px;background:#14234d;display:flex;align-items:center;justify-content:center">${BRAND(260)}</div>
    <div style="position:absolute;left:40px;top:180px;width:480px;padding:20px;border-radius:14px;background:#000">
      <div class="mono" style="font-size:26px;color:#9a9ab8">GALLONS</div><div id="galN" class="ledg" style="font-size:84px">0.000</div>
      <div class="mono" style="font-size:26px;color:#9a9ab8;margin-top:10px">SALE $</div><div id="saleN" class="ledg" style="font-size:84px">0.00</div></div>
    <div style="position:absolute;left:200px;top:560px">${NOZZLE(160, '#14234d')}</div></div>`, 'left:80px;top:220px'));
  up(pump, S('two') + .05, 60); cue(S('two') + .05, 'thud', .5);
  R.count('#galN', t15 - .2, tOwn - t15 + .4, 0, 15, v => v.toFixed(3), 'power1.inOut'); cue(t15 - .2, 'pumpfill', .7, 0, { dur: tOwn - t15 + .4 });
  R.count('#saleN', t15 - .2, tOwn - t15 + .4, 0, 52.49, v => v.toFixed(2), 'power1.inOut');
  const keep = put(host, svg(`<div class="card" style="position:relative;width:360px;padding:26px;text-align:center"><div class="kick" style="position:relative;width:auto;font-size:24px;color:${CREAM}">owner keeps</div><div id="keepN" class="big greentx" style="font-size:66px;margin-top:12px">$0</div><div class="mono" style="font-size:22px;color:#c9b8e8;margin-top:10px">≈ 13¢ × 15 gal</div></div>`, 'left:660px;top:420px'));
  up(keep, tOwn - .1, 40);
  R.count('#keepN', tTwo - .2, .5, 0, 1.95, v => '$' + v.toFixed(2), 'power3.out'); cue(tTwo, 'coins', .7, .4);
  for (let i = 0; i < 2; i++) { const c = div('abs', host, ICON.coin, `left:${740 + i * 90}px;top:760px;width:110px;height:110px`); tl.set(c, { opacity: 0, y: -200 }, 0); tl.to(c, { opacity: 1, y: 0, duration: .35, ease: 'bounce.out' }, tTwo + i * .12); }
  punch(tTwo);
}

/* ---------- 3 · SWIPE: the card swipe eats 8¢ of every gallon ---------- */
{
  through('swipe');
  const host = sc('swipe'), tCard = W('G03', 1), tSw = W('G03', 2), t8 = W('G03', 5), tGal = W('G03', 9);
  const card = put(host, svg(`<div style="position:relative;width:420px;height:262px;border-radius:24px;background:linear-gradient(135deg,#5b2a6e,#14234d);border:3px solid rgba(255,244,214,.5);box-shadow:0 20px 60px rgba(0,0,0,.5)"><div style="position:absolute;left:30px;top:90px;width:70px;height:52px;border-radius:10px;background:${Y}"></div><div class="mono" style="position:absolute;left:30px;top:180px;font-size:30px;color:${CREAM}">•••• •••• 4821</div></div>`, 'left:120px;top:200px'));
  tl.set(card, { opacity: 0, x: -300, rotation: -8 }, 0); tl.to(card, { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, S('swipe') + .05);
  tl.to(card, { x: 420, rotation: 0, duration: .3, ease: 'power2.in' }, tSw); tl.to(card, { x: 0, duration: .3, ease: 'power2.out' }, tSw + .32); cue(tSw + .1, 'swipe', .8);
  // where the ~35¢ markup goes (NACS): fees 8.4¢, other costs 15¢, owner keeps 13¢
  const wf = put(host, svg(`<div class="kick" style="position:relative;width:900px;color:${CREAM};font-size:26px;text-align:left">where the ~35¢ markup goes</div>
    <div style="display:flex;gap:0;margin-top:16px;height:120px;border-radius:16px;overflow:hidden;width:900px">
      <div id="wfFee" style="width:216px;background:${RED};display:flex;align-items:center;justify-content:center;font:800 40px 'JetBrains Mono';color:#fff">8.4¢</div>
      <div id="wfCost" style="width:386px;background:#7a6aa8;display:flex;align-items:center;justify-content:center;font:800 40px 'JetBrains Mono';color:#fff">15¢</div>
      <div id="wfKeep" style="width:298px;background:${GRN};display:flex;align-items:center;justify-content:center;font:800 40px 'JetBrains Mono';color:#06301a">13¢</div></div>
    <div style="display:flex;width:900px;margin-top:12px;font:700 24px 'Space Grotesk';color:${CREAM}"><div style="width:216px">CARD FEES</div><div style="width:386px">SHIPPING, STAFF, LIGHTS</div><div style="width:298px">OWNER KEEPS</div></div>`, 'left:90px;top:560px;width:900px'));
  tl.set('#wfFee, #wfCost, #wfKeep', { scaleX: 0, transformOrigin: '0 50%' }, 0); tl.set(wf, { opacity: 0 }, 0); tl.to(wf, { opacity: 1, duration: .2 }, t8 - .35);
  tl.to('#wfFee', { scaleX: 1, duration: .3, ease: 'power3.out' }, t8 - .1); cue(t8 - .1, 'impact', .6);
  tl.to('#wfCost', { scaleX: 1, duration: .3, ease: 'power3.out' }, tGal - .2); tl.to('#wfKeep', { scaleX: 1, duration: .3, ease: 'power3.out' }, tGal + .1); cue(tGal + .1, 'ding', .4);
  const bite = put(host, svg(`<div class="stamp red" style="position:relative;font-size:72px">−8¢ / GALLON</div>`, 'left:740px;top:300px')); center(bite); slam(bite, t8); R.shake(t8 + .2, 12, .25);
  src(host, 'source: NACS, "Who Makes Money Selling Gas?" (2024 data)', t8);
  punch(t8);
}

/* ---------- 4 · BAIT: gas isn't the business — gas is the bait ---------- */
{
  through('bait');
  const host = sc('bait'), tIsnt = W('G04', 2), tBait = W('G04', 8);
  const line = put(host, svg(`<svg viewBox="0 0 300 640" style="width:300px;height:640px;overflow:visible"><path d="M150,0 L150,420" stroke="${CREAM}" stroke-width="5"/><path d="M150,420 L150,520 Q150,580 200,580 Q240,580 240,540" stroke="#c9c9d6" stroke-width="16" fill="none" stroke-linecap="round"/></svg>
    <div style="position:absolute;left:70px;top:300px">${NOZZLE(170, Y)}</div>`, 'left:390px;top:120px'));
  tl.set(line, { y: -700 }, 0); tl.to(line, { y: 0, duration: .6, ease: 'bounce.out' }, S('bait') + .05); cue(S('bait') + .2, 'fall', .5);
  tl.to(line, { rotation: 6, duration: .6, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '50% 0%' }, S('bait') + .7);
  const no = put(host, svg(`<div class="stamp red" style="position:relative;font-size:66px">NOT THE BUSINESS</div>`, 'left:540px;top:820px')); center(no); slam(no, tIsnt + .3); cue(tIsnt + .5, 'stamp', .7);
  tl.to(no, { opacity: 0, duration: .2 }, tBait - .4);
  const b = put(host, svg(`<div class="big greentx" style="font-size:200px">BAIT</div>`, 'left:540px;top:820px')); center(b); slam(b, tBait - .1); cue(tBait + .1, 'impact', .9); R.shake(tBait + .1, 16, .3); punch(tBait + .1);
}

/* ---------- 5 · SPLIT: 65% of sales, only ~39% of profit ---------- */
{
  through('split');
  const host = sc('split'), t65 = W('G05', 2), tBut = W('G05', 8), t39 = W('G05', 11), tProf = W('G05', 14);
  const bar = (top, lab, pct, id) => put(host, svg(`<div class="anton" style="font-size:52px;color:${CREAM}">${lab}</div>
    <div style="margin-top:12px;width:900px;height:130px;border-radius:20px;overflow:hidden;background:rgba(255,244,214,.12);display:flex">
      <div id="${id}F" style="width:${pct}%;background:linear-gradient(90deg,#ff8a2a,${O});display:flex;align-items:center;padding-left:24px;font:800 52px 'JetBrains Mono';color:#fff">⛽ ${pct}%</div>
      <div id="${id}S" style="flex:1;background:linear-gradient(90deg,#2ee6a8,#1fb98a);display:flex;align-items:center;justify-content:flex-end;padding-right:24px;font:800 52px 'JetBrains Mono';color:#06301a">🛒 ${100 - pct}%</div></div>`, `left:90px;top:${top}px;width:900px`));
  const a = bar(240, 'SHARE OF SALES', 65, 'sa'), b = bar(640, 'SHARE OF PROFIT', 39, 'sb');
  up(a, t65 - .3, 40); tl.set('#saF', { width: '0%' }, 0); tl.to('#saF', { width: '65%', duration: .6, ease: 'power3.out' }, t65 - .2); cue(t65 - .2, 'slide', .5);
  up(b, tBut - .1, 40); tl.set('#sbF', { width: '0%' }, 0); tl.to('#sbF', { width: '39%', duration: .6, ease: 'power3.out' }, t39 - .2); cue(t39, 'impact', .7);
  tl.to('#sbS', { boxShadow: '0 0 60px #2ee6a8', duration: .3, yoyo: true, repeat: 1 }, tProf);
  const ins = put(host, svg(`<div class="pill" style="position:relative;background:#2ee6a8;color:#06301a;font-size:40px">61% OF PROFIT = INSIDE THE STORE</div>`, 'left:540px;top:900px')); center(ins); pop(ins, tProf - .05); cue(tProf, 'ding', .5);
  src(host, 'source: NACS State of the Industry, 2025 data', t65);
  punch(t39);
}

/* ---------- 6 · INSIDE: coffee, hot dogs, energy drinks and snacks ---------- */
{
  through('inside');
  const host = sc('inside'), tIn = W('G06', 4), items = [['G06', 5, ICON.coffee, 'COFFEE'], ['G06', 6, ICON.dog, 'HOT DOGS'], ['G06', 8, ICON.can, 'ENERGY DRINKS'], ['G06', 11, ICON.chips, 'SNACKS']];
  const store = put(host, svg(`<div style="position:relative;width:940px;height:860px;border-radius:30px;background:linear-gradient(180deg,#3b2466,#2a1d4a);border:5px solid ${Y};overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:100%;height:110px;background:${Y};display:flex;align-items:center;justify-content:center"><span class="anton" style="font-size:70px;color:#14234d;letter-spacing:6px">INSIDE THE STORE</span></div>
    ${[260, 470, 680].map(y => `<div style="position:absolute;left:30px;top:${y}px;width:880px;height:14px;border-radius:7px;background:#c9b8e8"></div>`).join('')}</div>`, 'left:70px;top:200px'));
  up(store, S('inside') + .05, 60); cue(S('inside') + .05, 'ding', .4);
  items.forEach(([id, k, ic, lab], i) => {
    const t = W(id, k) - .05, x = 100 + i * 220;
    const it = put(host, svg(`<div style="width:180px;height:180px">${ic.replace('<svg ', '<svg style="width:180px;height:180px" ')}</div><div class="tag" style="position:relative;margin-top:8px;font-size:24px;text-align:center">${lab}</div>`, `left:${x}px;top:${360 + (i % 2) * 210}px`));
    tl.set(it, { opacity: 0, y: -260, rotation: (i % 2 ? 12 : -12) }, 0); tl.to(it, { opacity: 1, y: 0, rotation: 0, duration: .4, ease: 'bounce.out' }, t); cue(t + .2, 'pop', .5, -.6 + i * .4);
    // extra stock fills the shelves
    for (let j = 0; j < 3; j++) { const s = div('abs', host, ic.replace('<svg ', '<svg style="width:90px;height:90px;opacity:.75" '), `left:${110 + i * 220 + j * 60}px;top:${830}px;width:90px;height:90px`); tl.set(s, { opacity: 0, scale: .3 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .25, ease: 'back.out(2)' }, t + .15 + j * .06); }
  });
  const margin = put(host, svg(`<div class="pill" style="position:relative;background:#2ee6a8;color:#06301a;font-size:34px">THIS IS WHERE THE PROFIT IS</div>`, 'left:540px;top:1080px')); center(margin); pop(margin, W('G06', 11) + .3);
}

/* ---------- 7 · WALK: 57% of drivers who fill up walk right in ---------- */
{
  through('walk');
  const host = sc('walk'), t57 = W('G07', 1), tWalk = W('G07', 7), tIn = W('G07', 9);
  const n = put(host, svg(`<div id="wN" class="big greentx" style="font-size:180px">0%</div><div class="anton" style="font-size:54px;color:${CREAM};margin-top:6px">OF DRIVERS WHO FILL UP</div>`, 'left:0;top:190px;width:1080px;text-align:center'));
  up(n, S('walk') + .05, 40); R.count('#wN', t57 - .1, .8, 0, 57, v => Math.round(v) + '%', 'power3.out'); cue(t57 - .1, 'counter', .5, 0, { dur: .8 });
  const grid = put(host, svg('', 'left:90px;top:560px;width:900px;height:520px'));
  for (let i = 0; i < 100; i++) {
    const p = div('abs', grid, `<svg viewBox="0 0 60 100" style="width:46px;height:76px"><circle cx="30" cy="20" r="16" fill="currentColor"/><path d="M4,100 L8,52 Q30,38 52,52 L56,100 Z" fill="currentColor"/></svg>`, `left:${(i % 20) * 45}px;top:${Math.floor(i / 20) * 100}px;color:rgba(255,244,214,.3)`);
    tl.set(p, { opacity: 0 }, 0); tl.to(p, { opacity: 1, duration: .1 }, S('walk') + .1 + (i % 20) * .01 + Math.floor(i / 20) * .03);
    if (i < 57) tl.to(p, { color: '#2ee6a8', duration: .1 }, t57 + i * .012);
    if (i < 57) tl.to(p, { y: -16, duration: .25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tWalk + (i % 20) * .02);
  }
  const door = put(host, svg(`<div class="pill" style="position:relative;background:#2ee6a8;color:#06301a;font-size:40px">WALK INSIDE 🛒</div>`, 'left:540px;top:1080px')); center(door); pop(door, tIn - .1); cue(tIn, 'ding', .5);
  src(host, 'source: NACS consumer research', t57);
  punch(t57 + .4);
}

/* ---------- 8 · SIGN: the price sign's real job is getting you off the road ---------- */
{
  through('sign');
  const host = sc('sign'), tBig = W('G08', 2), tJob = W('G08', 7), tOff = W('G08', 11);
  const road = put(host, svg(`<svg viewBox="0 0 1080 900" style="width:1080px;height:900px;overflow:visible">
    <path d="M0,300 L1080,300 L1080,460 L0,460 Z" fill="#2a1d4a"/><path d="M0,380 L1080,380" stroke="${Y}" stroke-width="8" stroke-dasharray="60 40"/>
    <path id="exitP" d="M300,420 C420,520 520,560 640,720" stroke="${Y}" stroke-width="12" fill="none" stroke-dasharray="20 18"/>
    <rect x="560" y="700" width="420" height="160" rx="14" fill="#3b2466" stroke="${Y}" stroke-width="5"/><text x="770" y="800" text-anchor="middle" font-family="Anton" font-size="60" fill="${Y}">FUEL+MART</text></svg>`, 'left:0;top:260px'));
  up(road, S('sign') + .05, 40);
  const pole = put(host, svg(`<div style="width:300px;padding:16px;border-radius:18px;background:#14234d;border:5px solid ${Y}"><div class="led" style="text-align:center;font-size:84px">3.49<sup style="font-size:40px">9</sup></div></div><div style="margin:0 auto;width:24px;height:200px;background:#c9c9d6"></div>`, 'left:80px;top:180px'));
  pop(pole, tBig - .2, .4); cue(tBig, 'pop', .5); tl.to(pole, { scale: 1.08, duration: .3, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '50% 100%' }, tBig + .3);
  R.draw('#exitP', tJob - .1, .5);
  for (let i = 0; i < 4; i++) {
    const car = div('abs', host, `<svg viewBox="0 0 160 80" style="width:150px;height:75px"><path d="M10,50 Q14,28 44,26 L64,10 L110,10 L130,28 Q154,32 154,52 L154,62 L10,62 Z" fill="${[RED, '#2ee6a8', Y, '#9fd3ff'][i]}"/><circle cx="44" cy="64" r="12" fill="#120c24"/><circle cx="124" cy="64" r="12" fill="#120c24"/></svg>`, `left:-180px;top:${560 + (i % 2) * 40}px`);
    const t = S('sign') + .1 + i * .7;
    tl.to(car, { x: 400, duration: .6, ease: 'none' }, t);
    if (i >= 1) { tl.to(car, { x: 820, y: 360, rotation: 30, duration: .6, ease: 'power1.inOut' }, t + .6); tl.to(car, { opacity: 0, duration: .2 }, t + 1.1); }
    else tl.to(car, { x: 1400, duration: .8, ease: 'none' }, t + .6);
  }
  cue(tOff, 'swoosh', .6);
  const off = put(host, svg(`<div class="stamp green" style="position:relative;font-size:72px">OFF THE ROAD →</div>`, 'left:540px;top:1060px')); center(off); slam(off, tOff - .1); cue(tOff + .1, 'stamp', .7);
}

/* ---------- 9 · OUTRO: your coffee pays for the gas → question → frame 0 ---------- */
{
  through('outro', { last: true });
  const host = sc('outro'), tCof = W('G09', 1), tPays = W('G09', 2), tGas = W('G09', 5), tEnd = VE('G09');
  const cup = put(host, svg(ICON.coffee.replace('<svg ', '<svg style="width:300px;height:300px" '), 'left:200px;top:220px')); pop(cup, tCof - .2, .5);
  const arrow = put(host, svg(`<svg viewBox="0 0 220 80" style="width:220px;height:80px"><path id="cArr" d="M10,40 L190,40 M160,12 L196,40 L160,68" stroke="${Y}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`, 'left:470px;top:330px'));
  R.draw('#cArr', tPays - .1, .3);
  const noz = put(host, svg(NOZZLE(260, O), 'left:680px;top:240px')); pop(noz, tGas - .25, .5);
  const paid = put(host, svg(`<div class="stamp green" style="position:relative;font-size:84px">GAS: PAID FOR ✓</div>`, 'left:540px;top:600px')); center(paid);
  slam(paid, tGas + .05); cue(tGas + .25, 'coins', .8); punch(tGas + .25);
  const q = put(host, svg(`<div class="qcard" style="position:relative;left:0"><div class="anton" style="font-size:66px;color:#fff">DO YOU GO INSIDE</div><div class="anton greentx" style="font-size:92px;margin-top:6px">WHEN YOU FILL UP?</div><div class="mono" style="font-size:34px;color:${CREAM};margin-top:18px">YES or NO in the comments 👇</div></div>`, 'left:90px;top:820px;width:900px'));
  up(q, tEnd - .05, 60, .35); cue(tEnd, 'whoosh', .5);
  tl.to(q, { scale: 1.04, duration: .3, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, tEnd + .5);
  tl.to(host, { opacity: 0, duration: .3 }, TOTAL - .45);
  tl.set(f0, { y: 0, scale: 1 }, TOTAL - .5); tl.to(f0, { opacity: 1, duration: .3 }, TOTAL - .45);
}

// a slow camera drift on every scene so no beat ever sits still
R.tim.scenes.forEach(x => { const h = sc(x.id); tl.fromTo(h, { y: 0 }, { y: -18, duration: E(x.id) - S(x.id), ease: 'sine.inOut', immediateRender: false }, S(x.id)); });
[['G01', 9], ['G02', 9], ['G03', 5], ['G04', 8], ['G05', 11], ['G07', 1], ['G09', 5]].forEach(() => {});

R.captions($('#caps'));
R.finish('gas');
