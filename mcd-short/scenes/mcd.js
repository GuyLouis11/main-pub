/* McDonald's Is a Landlord — motion design. Every beat sits on a spoken word (W(id, k)). Frame 0 == last frame (loops). */
const R = RT_INIT();
const { tl, S, E, V, VE, W, rnd, $, div, cue, TOTAL } = R;
const svg = (html, css) => { const d = document.createElement('div'); d.className = 'abs'; d.innerHTML = html; if (css) d.style.cssText += css; return d; };
const put = (host, el) => { (typeof host === 'string' ? $(host) : host).appendChild(el); return el; };
const sc = id => $(`[data-scene="${id}"]`);
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const GOLD = '#ffc72c', RED = '#da291c', CREAM = '#fff1c4', DARK = '#3a0408';
const through = (id, { first = false, last = false, sfx = 'whoosh' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) { tl.set(s, { opacity: 0, scale: .94 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .3, ease: 'power3.out' }, S(id)); if (sfx) cue(S(id), sfx, .5); }
  if (!last) tl.to(s, { opacity: 0, scale: 1.06, duration: .24, ease: 'power2.in' }, E(id) - .24);
};
const pop = (el, t, from = .4, d = .32) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)' }, t); };
const up = (el, t, y = 40, d = .32) => { tl.set(el, { opacity: 0, y }, 0); tl.to(el, { opacity: 1, y: 0, duration: d, ease: 'power3.out' }, t); };
const slam = (el, t, from = 2.2) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, t); };
const punch = (t, a = 1.05) => { tl.to('#stage', { scale: a, duration: .12, ease: 'power2.out', transformOrigin: '50% 40%' }, t).to('#stage', { scale: 1, duration: .38, ease: 'power2.inOut' }, t + .12); };
const src = (host, txt, t) => { const e = div('mono abs', host, txt, 'left:0;top:1178px;width:1080px;text-align:center;font-size:22px;color:rgba(255,241,196,.8);letter-spacing:2px'); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .3 }, t); };

/* ---------- assets (drawn here; brand marks used editorially) ---------- */
const ARCHES = (w = 300, c = GOLD) => `<svg viewBox="0 0 300 260" style="width:${w}px;height:${w * 260 / 300}px"><path d="M20,250 L20,140 C20,30 70,10 95,10 C125,10 150,60 150,120 C150,60 175,10 205,10 C230,10 280,30 280,140 L280,250 L238,250 L238,150 C238,80 222,56 205,56 C186,56 172,90 172,150 L172,250 L128,250 L128,150 C128,90 114,56 95,56 C78,56 62,80 62,150 L62,250 Z" fill="${c}"/></svg>`;
const BURGER = (w = 260) => `<svg viewBox="0 0 260 200" style="width:${w}px;height:${w * 200 / 260}px"><path d="M20,80 Q20,10 130,10 Q240,10 240,80 Z" fill="#e8a33a"/><g fill="#fff6d0"><ellipse cx="80" cy="40" rx="6" ry="3"/><ellipse cx="130" cy="30" rx="6" ry="3"/><ellipse cx="180" cy="44" rx="6" ry="3"/></g><rect x="14" y="80" width="232" height="18" rx="9" fill="#5fae3a"/><rect x="20" y="96" width="220" height="16" fill="#ffd23f"/><rect x="16" y="110" width="228" height="34" rx="12" fill="#6b3b1e"/><path d="M20,146 L240,146 Q240,190 130,190 Q20,190 20,146 Z" fill="#e8a33a"/></svg>`;
const FRIES = `<svg viewBox="0 0 120 120"><g fill="#ffd23f">${[30, 42, 54, 66, 78].map((x, i) => `<rect x="${x}" y="${12 + (i % 2) * 8}" width="10" height="56" rx="3"/>`).join('')}</g><path d="M24,52 L96,52 L88,112 L32,112 Z" fill="${RED}"/><path d="M44,72 C44,64 60,64 60,76 C60,64 76,64 76,72" stroke="${GOLD}" stroke-width="5" fill="none"/></svg>`;
const ICON = {
  fries: FRIES,
  burger: `<svg viewBox="0 0 120 120"><path d="M14,52 Q14,18 60,18 Q106,18 106,52 Z" fill="#e8a33a"/><rect x="10" y="52" width="100" height="10" rx="5" fill="#5fae3a"/><rect x="12" y="62" width="96" height="18" rx="7" fill="#6b3b1e"/><path d="M14,82 L106,82 Q106,104 60,104 Q14,104 14,82 Z" fill="#e8a33a"/></svg>`,
  key: `<svg viewBox="0 0 120 120"><circle cx="40" cy="60" r="22" fill="none" stroke="${GOLD}" stroke-width="10"/><path d="M62,60 L108,60 M92,60 L92,78 M104,60 L104,74" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/></svg>`,
  house: `<svg viewBox="0 0 120 120"><path d="M14,58 L60,18 L106,58 L96,58 L96,104 L24,104 L24,58 Z" fill="${CREAM}"/><rect x="50" y="70" width="20" height="34" fill="${RED}"/></svg>`,
  coin: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="${GOLD}"/><text x="60" y="76" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="40" fill="#a8700a">$</text></svg>`,
  cup: `<svg viewBox="0 0 120 120"><path d="M30,24 L90,24 L82,110 L38,110 Z" fill="${CREAM}"/><rect x="26" y="16" width="68" height="12" rx="4" fill="${RED}"/><path d="M44,56 C44,46 60,46 60,60 C60,46 76,46 76,56" stroke="${GOLD}" stroke-width="5" fill="none"/></svg>`,
  deed: `<svg viewBox="0 0 120 120"><rect x="24" y="12" width="72" height="96" rx="6" fill="${CREAM}"/><g stroke="#c9b48a" stroke-width="5"><path d="M36,34 L84,34 M36,50 L84,50 M36,66 L70,66"/></g><circle cx="74" cy="90" r="10" fill="${RED}"/></svg>`,
};

/* ================= world: gold dust, a drifting prop layer, a street of restaurants along the bottom ================= */
(() => {
  const cv = $('#fx'), cx = cv.getContext('2d');
  const P = []; for (let i = 0; i < 80; i++) P.push({ x: rnd() * 1080, y: rnd() * 1920, s: 1 + rnd() * 2.6, sp: 8 + rnd() * 20, ph: rnd() * 6.3 });
  const draw = t => { cx.clearRect(0, 0, 1080, 1920); for (const p of P) { let y = (p.y - t * p.sp) % 1920; if (y < 0) y += 1920; const f = Math.min(1, y / 200, (1920 - y) / 200); cx.fillStyle = `rgba(255,214,90,${(.35 * f).toFixed(3)})`; cx.beginPath(); cx.arc(p.x + Math.sin(t * .5 + p.ph) * 12, y, p.s, 0, 6.28); cx.fill(); } };
  const pr = { t: 0 }; tl.fromTo(pr, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(pr.t) }, 0);
  const L = document.createElement('div'); L.className = 'abs'; L.style.cssText = 'inset:0'; L.dataset.drift = '1'; $('#stage').parentNode.insertBefore(L, $('#stage'));
  const ics = Object.values(ICON); for (let i = 0; i < 24; i++) {
    const d = div('abs', L, ics[i % ics.length], `left:${(i * 181) % 1000}px;top:${110 + (i * 271) % 1100}px;width:120px;height:120px;opacity:${.16 + rnd() * .14}`); d.dataset.drift = '1';
    tl.set(d, { scale: .55 + rnd() * .7, rotation: (rnd() - .5) * 50 }, 0);
    tl.to(d, { y: -(50 + rnd() * 110), x: (rnd() - .5) * 70, rotation: '+=' + ((rnd() - .5) * 60), duration: TOTAL / 2, ease: 'sine.inOut', yoyo: true, repeat: 1, data: 'drift' }, 0);
  }
  const street = put('#stage', svg(`<svg viewBox="0 0 1080 700" style="width:1080px;height:700px">
    <rect x="0" y="300" width="1080" height="400" fill="#5a0a10"/>
    ${Array.from({ length: 6 }, (_, i) => `<g transform="translate(${i * 190 - 20} 140)"><rect x="0" y="40" width="160" height="120" fill="#7a0e16"/><path d="M-6,46 L80,0 L166,46 Z" fill="#9a1a20"/><g transform="translate(52 52) scale(.19)">${ARCHES(300).replace(/^<svg[^>]*>/, '').replace('</svg>', '')}</g><rect x="60" y="110" width="40" height="50" fill="#ffd8a0" opacity=".8"/></g>`).join('')}
    <path d="M0,420 L1080,420" stroke="${GOLD}" stroke-width="8" stroke-dasharray="60 50" opacity=".5"/></svg>`, 'left:0;top:1160px'));
  street.dataset.drift = '1'; $('#stage').insertBefore(street, $('#stage').firstChild);
})();
{
  const lab = { hook: 'THE BUSINESS', rent: 'THE RENT', land: 'THE LAND', vs: 'THE NUMBERS', quote: 'THE CONFESSION', door: 'THE DOOR', outro: 'YOUR TURN' };
  Object.keys(lab).forEach((id, i, a) => {
    const c = div('chip', $('#chips'), `<b>${String(i + 1).padStart(2, '0')}</b>${lab[id]}`);
    tl.set(c, { opacity: 0, y: -24, xPercent: -50 }, 0);
    tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, i ? S(id) + .1 : .35);
    tl.to(c, { opacity: 0, y: -24, duration: .15 }, i < a.length - 1 ? E(id) - .15 : TOTAL - 1.4);
  });
}

/* ================= frame 0 (and last frame): the arches + "$10.4B" ================= */
const f0 = put('#stage', svg(`<div id="f0a" style="position:absolute;left:340px;top:200px;filter:drop-shadow(0 0 40px rgba(255,199,44,.6))">${ARCHES(400)}</div>
  <div id="f0n" class="big greentx" style="position:absolute;left:0;top:620px;width:1080px;text-align:center;font-size:200px">$10.4B</div>
  <div class="kick" style="position:absolute;left:0;top:860px;width:1080px;color:${CREAM}">every year</div>`, 'inset:0'));

/* ---------- 1 · HOOK: its biggest business — something you can't eat ---------- */
{
  const tEat = W('M01', 1), tNev = W('M01', 6), tBiz = W('M01', 10), tN = W('M01', 11), tSome = W('M01', 16), tCant = W('M01', 18);
  tl.to('#f0a', { y: -16, duration: .6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .05); cue(.05, 'ding', .4);
  const tray = put(sc('hook'), svg(`<div style="display:flex;gap:30px;align-items:flex-end">${BURGER(240)}<div style="width:140px;height:140px">${FRIES.replace('<svg ', '<svg style="width:140px;height:140px" ')}</div><div style="width:130px;height:130px">${ICON.cup.replace('<svg ', '<svg style="width:130px;height:130px" ')}</div></div>`, 'left:200px;top:930px'));
  up(tray, tEat - .1, 60); cue(tEat, 'pop', .5);
  tl.to('#f0n', { scale: 1.15, duration: .15, yoyo: true, repeat: 1 }, tN); cue(tN, 'impact', .8); punch(tN);
  const x = put(sc('hook'), svg(`<div class="stamp red" style="position:relative;font-size:76px;color:#fff;border-color:#fff;background:rgba(58,4,8,.85)">NOT THE FOOD</div>`, 'left:540px;top:960px')); center(x);
  slam(x, tCant - .05); cue(tCant + .15, 'stamp', .9); R.shake(tCant + .15, 14, .3);
  tl.to(tray, { opacity: .3, duration: .2 }, tCant);
  tl.to(f0, { opacity: 0, duration: .25 }, E('hook') - .25);
  through('hook', { first: true });
}

/* ---------- 2 · RENT: 95% franchised — and they pay rent to McDonald's ---------- */
{
  through('rent', { sfx: null });
  const host = sc('rent'), tRent = W('M02', 1), t95 = W('M02', 3), tFr = W('M02', 10), tPay = W('M02', 15), tMcd = W('M02', 18);
  cue(S('rent'), 'impact', .9); R.flash(S('rent') + .05, .3, .4, '#fff1c4');
  const lease = put(host, svg(`<div class="paper" style="position:relative;width:420px;height:520px;padding:34px;transform:rotate(-4deg)"><div class="anton" style="font-size:70px;color:${RED}">LEASE</div>
    <div style="height:12px;background:#cfc8b4;border-radius:6px;margin-top:24px"></div><div style="height:12px;background:#cfc8b4;border-radius:6px;margin-top:16px;width:80%"></div><div style="height:12px;background:#cfc8b4;border-radius:6px;margin-top:16px;width:90%"></div>
    <div class="mono" style="font-size:26px;margin-top:40px;color:#5b4a3a">LANDLORD:</div><div style="margin-top:10px">${ARCHES(110, RED)}</div>
    <div class="mono" style="font-size:26px;margin-top:20px;color:#5b4a3a">TENANT: franchisee</div></div>`, 'left:60px;top:220px'));
  slam(lease, tRent - .15, 1.6); R.shake(tRent + .05, 12, .25);
  const grid = put(host, svg('', 'left:520px;top:240px;width:500px;height:520px'));
  for (let i = 0; i < 20; i++) {
    const r = div('abs', grid, `<svg viewBox="0 0 100 100" style="width:90px;height:90px"><rect x="8" y="34" width="84" height="60" fill="currentColor"/><path d="M2,38 L50,8 L98,38 Z" fill="currentColor"/><g transform="translate(34 46) scale(.11)">${ARCHES(300, GOLD).replace(/^<svg[^>]*>/, '').replace('</svg>', '')}</g></svg>`, `left:${(i % 4) * 120}px;top:${Math.floor(i / 4) * 102}px;color:rgba(255,241,196,.35)`);
    pop(r, t95 - .2 + i * .02, .4, .2);
    if (i < 19) tl.to(r, { color: CREAM, duration: .12 }, t95 + .2 + i * .04);
  }
  const p95 = put(host, svg(`<div class="big greentx" style="font-size:110px">95%</div><div class="anton" style="font-size:40px;color:${CREAM}">FRANCHISED</div>`, 'left:560px;top:790px;text-align:center;width:400px')); up(p95, t95, 30); cue(t95, 'counter', .4, 0, { dur: .8 });
  // rent flows back to the arches
  for (let i = 0; i < 10; i++) { const c = div('abs', host, ICON.coin.replace('<svg ', '<svg style="width:60px;height:60px" '), `left:${560 + (i % 4) * 110}px;top:${300 + Math.floor(i / 4) * 140}px;width:60px;height:60px`);
    const t = tPay + i * .08; tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .08 }, t); tl.to(c, { x: -380 - (i % 4) * 110, y: 420 - Math.floor(i / 4) * 140, scale: .6, duration: .6, ease: 'power2.in' }, t); tl.to(c, { opacity: 0, duration: .1 }, t + .55); }
  cue(tPay, 'coins', .6, -.3);
  tl.to(lease, { scale: 1.06, duration: .2, yoyo: true, repeat: 1 }, tMcd); cue(tMcd, 'ding', .5);
}

/* ---------- 3 · LAND: owns the land under more than half; ~80% of the buildings ---------- */
{
  through('land');
  const host = sc('land'), tOwn = W('M03', 5), tLand = W('M03', 7), tHalf = W('M03', 11), t80 = W('M03', 16), tBld = W('M03', 19);
  const map = put(host, svg(`<div class="kick" style="position:relative;width:900px;color:${CREAM}">a city block · bird's-eye view</div>
    <div id="lots" style="position:relative;margin-top:14px;width:900px;height:640px;border-radius:20px;background:#5a0a10;border:4px solid rgba(255,199,44,.5)"></div>`, 'left:90px;top:200px'));
  up(map, S('land') + .05, 40);
  const lots = map.querySelector('#lots');
  const owned = [0, 2, 3, 5, 7, 8, 10, 13, 14];  // 9 of 16 ≈ 56%
  for (let i = 0; i < 16; i++) {
    const x = 20 + (i % 4) * 220, y = 20 + Math.floor(i / 4) * 155;
    const lot = div('abs', lots, `<div class="lotFill" style="position:absolute;inset:0;border-radius:12px;background:${GOLD};opacity:0"></div><div style="position:absolute;left:58px;top:24px">${ICON.house.replace('<svg ', '<svg style="width:90px;height:90px" ')}</div>`, `left:${x}px;top:${y}px;width:200px;height:135px;border-radius:12px;border:3px dashed rgba(255,241,196,.4)`);
    pop(lot, S('land') + .15 + i * .03, .5, .2);
    if (owned.includes(i)) { tl.to(lot.querySelector('.lotFill'), { opacity: .85, duration: .2 }, tLand + owned.indexOf(i) * .09); }
    if (i < 13) tl.to(lot.querySelector('div:last-child'), { scale: 1.15, filter: 'drop-shadow(0 0 14px #ffc72c)', duration: .2 }, t80 + i * .04);
  }
  cue(tLand, 'stream', .4, 0, { dur: .9 });
  const l1 = put(host, svg(`<div class="pill" style="position:relative;background:${GOLD};color:${DARK};font-size:36px">LAND OWNED: 56%</div>`, 'left:300px;top:930px')); center(l1); pop(l1, tHalf - .05); cue(tHalf, 'ding', .5);
  const l2 = put(host, svg(`<div class="pill" style="position:relative;background:${CREAM};color:${DARK};font-size:36px">BUILDINGS: 80%</div>`, 'left:780px;top:930px')); center(l2); pop(l2, tBld - .2); cue(tBld, 'ding', .5);
  src(host, 'source: McDonald\'s 2025 Form 10-K (consolidated markets)', tLand);
  punch(tHalf);
}

/* ---------- 4 · VS: royalties ~$6B vs rent $10.4B ---------- */
{
  through('vs');
  const host = sc('vs'), tRoy = W('M04', 1), t6 = W('M04', 7), tRent = W('M04', 10), t104 = W('M04', 11);
  const bar = (x, h, col, top, lab, icon, id) => put(host, svg(`<div class="mono" id="${id}N" style="text-align:center;font-size:66px;color:#fff">${top}</div>
    <div id="${id}B" style="margin:14px auto 0;width:300px;height:${h}px;border-radius:22px 22px 0 0;background:${col};transform-origin:50% 100%;display:flex;align-items:flex-end;justify-content:center;padding-bottom:20px">${icon}</div>
    <div class="anton" style="text-align:center;font-size:52px;color:#fff;margin-top:14px">${lab}</div>`, `left:${x}px;top:${1070 - h}px;width:380px`));
  const a = bar(90, 400, `linear-gradient(180deg,${CREAM},#c9b48a)`, '$6.0B', 'BURGER ROYALTIES', BURGER(180), 'a');
  const b = bar(610, 700, `linear-gradient(180deg,${GOLD},#c88a10)`, '$10.4B', 'RENT', ICON.key.replace('<svg ', '<svg style="width:160px;height:160px" '), 'b');
  up(a, tRoy - .1, 60); tl.set('#aB', { scaleY: 0 }, 0); tl.to('#aB', { scaleY: 1, duration: .5, ease: 'power3.out' }, tRoy); tl.set('#aN', { textContent: '$?' }, 0); tl.set('#aN', { textContent: '$6.0B' }, t6 - .05); cue(t6, 'ding', .5);
  up(b, tRent - .2, 60); tl.set('#bB', { scaleY: 0 }, 0); tl.to('#bB', { scaleY: 1, duration: .6, ease: 'back.out(1.2)' }, tRent - .1); cue(tRent - .1, 'riser', .4, 0, { dur: .5 });
  tl.set('#bN', { textContent: '$?' }, 0); tl.set('#bN', { textContent: '$10.4B' }, t104 - .05); cue(t104 + .1, 'impact', .9); punch(t104 + .1); R.shake(t104 + .1, 14, .3);
  tl.to('#bB', { boxShadow: '0 0 90px rgba(255,199,44,.9)', duration: .4, yoyo: true, repeat: 1 }, t104 + .3);
  { const e = div('mono abs', host, 'source: McDonald\'s 2025 Form 10-K', 'left:0;top:180px;width:1080px;text-align:center;font-size:22px;color:rgba(255,241,196,.8);letter-spacing:2px'); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .3 }, tRoy); }
}

/* ---------- 5 · QUOTE: Harry Sonneborn, 1950s ---------- */
{
  through('quote');
  const host = sc('quote'), tFif = W('M05', 3), tHarry = W('M05', 7), tWe = W('M06', 0), tFood = W('M06', 6), tReal = W('M06', 12);
  const sep = put(host, svg(`<div style="position:relative;width:360px;height:440px;border-radius:24px;background:linear-gradient(180deg,#e9dcc0,#b8a27a);overflow:hidden;filter:sepia(.6);box-shadow:0 20px 60px rgba(0,0,0,.5)">
    <svg viewBox="0 0 360 440" style="position:absolute;inset:0"><path d="M100,120 L260,120 L240,90 L120,90 Z" fill="#3a2a1a"/><rect x="150" y="70" width="60" height="30" fill="#3a2a1a"/><circle cx="180" cy="170" r="60" fill="#5a4630"/><path d="M60,440 L80,280 Q180,230 280,280 L300,440 Z" fill="#3a2a1a"/><path d="M170,280 L190,280 L186,380 L174,380 Z" fill="${RED}"/></svg></div>
    <div class="tag" style="position:relative;margin-top:16px;text-align:center;font-size:26px">HARRY SONNEBORN · 1950s</div>`, 'left:60px;top:220px'));
  up(sep, S('quote') + .05, 60); cue(S('quote') + .05, 'paper', .5);
  const yr = put(host, svg(`<div class="big greentx" style="font-size:110px">1950s</div>`, 'left:470px;top:300px')); pop(yr, tFif - .1); cue(tFif, 'pop', .4);
  const role = put(host, svg(`<div class="pill" style="position:relative;background:${GOLD};color:${DARK};font-size:32px">FINANCE CHIEF</div>`, 'left:470px;top:460px')); pop(role, tHarry - .1);
  const q = put(host, svg(`<div class="paper" style="position:relative;padding:34px 40px;border:6px solid ${GOLD}"><div id="qT" class="serif" style="font-size:62px;line-height:1.12;color:#101418"></div><div style="margin-top:14px;font:700 24px/1 'JetBrains Mono';color:#6b6457;text-align:right">— Harry Sonneborn (attributed)</div></div>`, 'left:90px;top:760px;width:900px'));
  up(q, tWe - .3, 40, .3);
  'We are not technically in the food business. We are in the real estate business.'.split(' ').forEach((w, i) => { const sp = document.createElement('span'); sp.textContent = w + ' '; sp.style.cssText = 'display:inline-block;white-space:pre'; if (i >= 10) sp.style.color = RED; $('#qT').appendChild(sp); tl.set(sp, { opacity: 0, y: 12 }, 0); tl.to(sp, { opacity: 1, y: 0, duration: .14 }, W('M06', i) - .03); });
  tl.to([sep, yr, role], { y: -40, opacity: .6, duration: .3 }, tWe);
  const st = put(host, svg(`<div class="stamp red" style="position:relative;font-size:70px;color:#fff;border-color:#fff;background:rgba(58,4,8,.85)">REAL ESTATE</div>`, 'left:700px;top:560px')); center(st); slam(st, tReal); cue(tReal + .2, 'stamp', .9); punch(tReal + .2);
}

/* ---------- 6 · DOOR: the burger gets you in — the door is what they own ---------- */
{
  through('door');
  const host = sc('door'), tBur = W('M07', 1), tDoor = W('M07', 6), tOwn = W('M07', 12);
  const front = put(host, svg(`<div style="position:relative;width:760px;height:760px">
    <div style="position:absolute;left:0;top:140px;width:760px;height:620px;background:#7a0e16;border-radius:12px;border:6px solid ${GOLD}"></div>
    <div style="position:absolute;left:-20px;top:60px;width:800px;height:110px;background:${RED};border-radius:12px;display:flex;align-items:center;justify-content:center">${ARCHES(110)}</div>
    <div id="dr" style="position:absolute;left:250px;top:330px;width:260px;height:430px;background:#2a0306;border:8px solid ${CREAM};transform-origin:0 50%"></div>
    <div style="position:absolute;left:40px;top:300px;width:170px;height:160px;background:#ffd8a0;opacity:.8"></div><div style="position:absolute;left:550px;top:300px;width:170px;height:160px;background:#ffd8a0;opacity:.8"></div></div>`, 'left:160px;top:180px'));
  up(front, S('door') + .05, 60);
  const bg = put(host, svg(BURGER(200), 'left:440px;top:990px')); pop(bg, tBur - .1, .5); cue(tBur, 'pop', .4);
  tl.to(bg, { x: 0, y: -360, scale: .5, opacity: 0, duration: .6, ease: 'power2.in' }, tDoor - .4);
  tl.set('#dr', { rotationY: 0, transformPerspective: 1200 }, 0); tl.to('#dr', { rotationY: -70, duration: .4, ease: 'power2.out' }, tDoor - .2); cue(tDoor - .2, 'creak', .5);
  const deed = put(host, svg(`<div class="paper" style="position:relative;padding:20px 30px;border:5px solid ${GOLD}"><div class="anton" style="font-size:48px;color:${RED}">PROPERTY DEED</div><div class="mono" style="font-size:24px;color:#5b4a3a;margin-top:8px">OWNER:</div><div style="margin-top:6px">${ARCHES(90, RED)}</div></div>`, 'left:600px;top:840px'));
  tl.set(deed, { opacity: 0, rotation: 12, scale: .4 }, 0); tl.to(deed, { opacity: 1, rotation: -4, scale: 1, duration: .3, ease: 'back.out(2)' }, tOwn - .1); cue(tOwn + .1, 'stamp', .8); punch(tOwn + .1);
}

/* ---------- 7 · OUTRO: your Big Mac pays the rent → question → frame 0 ---------- */
{
  through('outro', { last: true });
  const host = sc('outro'), tBig = W('M08', 1), tPays = W('M08', 3), tRent = W('M08', 5), tEnd = VE('M08');
  const b = put(host, svg(BURGER(300), 'left:150px;top:260px')); pop(b, tBig - .2, .5);
  const arr = put(host, svg(`<svg viewBox="0 0 200 80" style="width:200px;height:80px"><path id="oArr" d="M10,40 L170,40 M140,12 L176,40 L140,68" stroke="${GOLD}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`, 'left:470px;top:340px')); R.draw('#oArr', tPays - .1, .3);
  const rc = put(host, svg(`<div class="paper" style="position:relative;width:280px;padding:20px 24px;font:700 26px/1.5 'JetBrains Mono';color:#101418"><div style="text-align:center;font-size:28px">RENT RECEIPT</div><div style="border-top:3px dashed #b9b2a2;margin:10px 0"></div><div>PAID TO: <span style="color:${RED}">McD</span></div><div>STATUS: ✓</div></div>`, 'left:690px;top:280px'));
  pop(rc, tRent - .2, .5); cue(tRent, 'coins', .7); punch(tRent + .1);
  const q = put(host, svg(`<div class="qcard" style="position:relative;left:0"><div class="anton" style="font-size:50px;color:#fff">WOULD YOU RATHER OWN A McDONALD'S…</div><div class="anton greentx" style="font-size:84px;margin-top:8px">OR THE LAND UNDER IT?</div><div class="mono" style="font-size:32px;color:${CREAM};margin-top:16px">Tell me in the comments 👇</div></div>`, 'left:90px;top:720px;width:900px'));
  up(q, tEnd - .05, 60, .35); cue(tEnd, 'whoosh', .5);
  tl.to(q, { scale: 1.04, duration: .3, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, tEnd + .5);
  tl.to(host, { opacity: 0, duration: .3 }, TOTAL - .45);
  tl.set(f0, { y: 0, scale: 1 }, TOTAL - .5); tl.to(f0, { opacity: 1, duration: .3 }, TOTAL - .45);
}

R.tim.scenes.forEach(x => { const h = sc(x.id); tl.fromTo(h, { y: 0 }, { y: -18, duration: E(x.id) - S(x.id), ease: 'sine.inOut', immediateRender: false }, S(x.id)); });

R.captions($('#caps'));
R.finish('mcd');
