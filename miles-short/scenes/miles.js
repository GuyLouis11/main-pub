/* Airlines Are Credit Card Companies — motion design. Every beat sits on a spoken word (W(id, k)). Frame 0 == last frame. */
const R = RT_INIT();
const { tl, S, E, V, VE, W, rnd, $, div, cue, TOTAL } = R;
const svg = (html, css) => { const d = document.createElement('div'); d.className = 'abs'; d.innerHTML = html; if (css) d.style.cssText += css; return d; };
const put = (host, el) => { (typeof host === 'string' ? $(host) : host).appendChild(el); return el; };
const sc = id => $(`[data-scene="${id}"]`);
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const SKY = '#4fc3ff', GOLD = '#ffc640', RED = '#ff4a3d';
const through = (id, { first = false, last = false, sfx = 'whoosh' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) { tl.set(s, { opacity: 0, scale: .94 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .3, ease: 'power3.out' }, S(id)); if (sfx) cue(S(id), sfx, .5); }
  if (!last) tl.to(s, { opacity: 0, scale: 1.06, duration: .24, ease: 'power2.in' }, E(id) - .24);
};
const pop = (el, t, from = .4, d = .32) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)' }, t); };
const up = (el, t, y = 40, d = .32) => { tl.set(el, { opacity: 0, y }, 0); tl.to(el, { opacity: 1, y: 0, duration: d, ease: 'power3.out' }, t); };
const slam = (el, t, from = 2.2) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, t); };
const PLANE = (w, c = '#e3eef9') => `<svg viewBox="0 0 120 120" style="width:${w}px;height:${w}px"><path d="M60,6 L68,44 L112,62 L112,72 L68,64 L66,92 L80,102 L80,110 L60,104 L40,110 L40,102 L54,92 L52,64 L8,72 L8,62 L52,44 Z" fill="${c}"/></svg>`;
const CARD = (label, sub, a = '#1b3a6b', b = '#0b1a33') => `<div style="position:relative;width:560px;height:350px;border-radius:30px;background:linear-gradient(135deg,${a},${b});border:3px solid rgba(255,255,255,.35);box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden">
  <div style="position:absolute;left:40px;top:120px;width:96px;height:72px;border-radius:12px;background:linear-gradient(135deg,#e9d38a,#b8912a)"></div>
  <div class="anton" style="position:absolute;left:40px;top:34px;font-size:52px;color:#fff;letter-spacing:3px">${label}</div>
  <div class="mono" style="position:absolute;left:40px;top:230px;font-size:38px;color:#dbe9f7">•••• •••• •••• 2025</div>
  <div class="mono" style="position:absolute;left:40px;top:290px;font-size:26px;color:${GOLD}">${sub}</div>
  <div style="position:absolute;right:40px;top:40px">${PLANE(70, 'rgba(255,255,255,.85)')}</div></div>`;

/* ================= world: drifting clouds + contrails ================= */
(() => {
  const cv = $('#fx'), cx = cv.getContext('2d');
  const C = []; for (let i = 0; i < 14; i++) C.push({ x: rnd() * 1400 - 160, y: 120 + rnd() * 1700, r: 80 + rnd() * 160, sp: 8 + rnd() * 20 });
  const draw = t => { cx.clearRect(0, 0, 1080, 1920); for (const c of C) { let x = (c.x + t * c.sp) % 1500 - 210; const g = cx.createRadialGradient(x, c.y, 0, x, c.y, c.r); g.addColorStop(0, 'rgba(160,200,255,.07)'); g.addColorStop(1, 'rgba(160,200,255,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(x, c.y, c.r, 0, 6.28); cx.fill(); } };
  const pr = { t: 0 }; tl.fromTo(pr, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(pr.t) }, 0);
  tl.fromTo('#grid', { y: 0 }, { y: 90, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
})();
{
  const lab = { hook: 'THE MONEY', amex: 'THE SWIPE', profit: 'THE PROFIT', united: 'THE COLLATERAL', half: 'THE AIRLINE', side: 'THE REAL BUSINESS', outro: 'YOUR TURN' };
  Object.keys(lab).forEach((id, i, a) => {
    const c = div('chip', $('#chips'), `<b>${String(i + 1).padStart(2, '0')}</b>${lab[id]}`);
    tl.set(c, { opacity: 0, y: -24, xPercent: -50 }, 0);
    tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, i ? S(id) + .1 : .35);
    tl.to(c, { opacity: 0, y: -24, duration: .15 }, i < a.length - 1 ? E(id) - .15 : TOTAL - 1.4);
  });
}

/* ================= frame 0 (and the last frame): a plane over "$8.2B" ================= */
const f0 = put('#stage', svg(`<div id="f0p" style="position:absolute;left:390px;top:300px">${PLANE(300)}</div>
  <div id="f0n" class="big greentx" style="position:absolute;left:0;top:700px;width:1080px;text-align:center;font-size:190px">$8.2B</div>`, 'inset:0'));

/* ---------- 1 · HOOK: $8.2B from a company that doesn't fly ---------- */
{
  const tLast = W('A01', 0), t82 = W('A01', 4), tFrom = W('A01', 6), tComp = W('A01', 8), tFly = W('A01', 11), tPlane = W('A01', 14);
  tl.to('#f0p', { y: -20, duration: .6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .02); cue(.05, 'jet', .4, 0, { dur: 1.2 });
  tl.to('#f0n', { scale: 1.1, duration: .2, yoyo: true, repeat: 1 }, t82); cue(t82, 'impact', .7);
  tl.to(f0, { y: -260, scale: .7, duration: .45, ease: 'power3.inOut', transformOrigin: '50% 30%' }, tFrom - .1);
  const who = put(sc('hook'), svg(`<div style="position:relative;width:520px;height:330px;border-radius:30px;background:#0b1a33;border:4px dashed ${SKY};display:flex;align-items:center;justify-content:center">
    <div class="big greentx" style="font-size:180px">?</div></div><div class="mono" style="margin-top:20px;font-size:34px;color:#dbe9f7">a company that flies…</div>`, 'left:280px;top:720px;text-align:center'));
  up(who, tComp - .2, 60); cue(tComp - .2, 'pop', .5);
  const zero = put(sc('hook'), svg(`<div class="stamp red" style="position:relative;font-size:84px">0 PLANES</div>`, 'left:540px;top:1110px')); center(zero);
  slam(zero, tPlane - .1); cue(tPlane + .1, 'stamp', .9); R.shake(tPlane + .1, 14, .3);
  tl.to(f0, { opacity: 0, duration: .25 }, E('hook') - .25);
  through('hook', { first: true });
}

/* ---------- 2 · AMEX: every swipe, Amex buys miles from Delta — in cash ---------- */
{
  through('amex', { sfx: null });
  const host = sc('amex'), tAm = W('A03', 0), tSw = W('A03', 5), tCard = W('A03', 8), tBuys = W('A03', 11), tMiles = W('A03', 12), tDelta = W('A03', 14), tCash = W('A03', 17);
  cue(S('amex'), 'impact', .8); R.flash(S('amex') + .05, .3, .4, '#d6ecff');
  const reveal = put(host, svg(`<div class="big" style="font-size:96px;color:#fff">AMERICAN</div><div class="big greentx" style="font-size:96px;margin-top:6px">EXPRESS</div>`, 'left:0;top:180px;width:1080px;text-align:center'));
  pop(reveal, tAm - .05, .6);
  tl.to(reveal, { scale: .6, y: 10, opacity: .5, duration: .4, ease: 'power3.inOut', transformOrigin: '50% 0%' }, tSw - .4);
  // the card swipes through a terminal
  const term = put(host, svg(`<div style="position:relative;width:300px;height:420px;border-radius:30px;background:linear-gradient(180deg,#2a3340,#151b22);border:3px solid #5a6878"><div style="position:absolute;left:30px;top:30px;width:240px;height:120px;border-radius:12px;background:#0b1a33;border:2px solid ${SKY}"><div id="termT" class="mono" style="position:absolute;left:0;top:40px;width:240px;text-align:center;font-size:34px;color:${SKY}">READY</div></div><div style="position:absolute;left:-20px;top:200px;width:340px;height:14px;border-radius:7px;background:#000"></div></div>`, 'left:700px;top:470px'));
  up(term, tSw - .3, 60);
  const card = put(host, svg(CARD('DELTA', 'co-brand · issued by Amex'), 'left:60px;top:500px'));
  tl.set(card, { opacity: 0, x: -400, rotation: -6 }, 0); tl.to(card, { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, tSw - .35);
  tl.to(card, { x: 400, y: 30, rotation: 0, duration: .3, ease: 'power2.in' }, tSw + .05); tl.to(card, { x: 0, y: 0, duration: .35, ease: 'power2.out' }, tSw + .4);
  cue(tSw + .2, 'swipe', .8);
  tl.set('#termT', { textContent: 'APPROVED' }, tSw + .3); tl.to('#termT', { color: '#3dff9a', duration: .1 }, tSw + .3); cue(tSw + .35, 'ding', .6);
  // miles flow to Delta, cash flows from Amex
  const flow = put(host, svg('', 'left:0;top:0;width:1080px;height:1240px'));
  const lane = (y, txt, col, dir, t0) => {
    const l = put(flow, svg(`<div class="tag" style="position:relative;font-size:30px;border-color:${col};color:${col}">${txt}</div>`, `left:540px;top:${y - 70}px`)); center(l); up(l, t0, 20);
    for (let i = 0; i < 7; i++) {
      const p = div('', flow, dir > 0 ? PLANE(54, col) : `<div class="mono" style="font-size:52px;color:${col};text-shadow:0 0 12px ${col}">$</div>`, `left:${dir > 0 ? 120 : 900}px;top:${y}px`);
      const t = t0 + .1 + i * .18; tl.set(p, { opacity: 0 }, 0); tl.to(p, { opacity: 1, duration: .08 }, t);
      tl.to(p, { x: dir * 780, duration: .9, ease: 'none' }, t); tl.to(p, { opacity: 0, duration: .1 }, t + .8);
    }
  };
  tl.to([card, term], { opacity: .25, y: '+=40', duration: .3 }, tBuys - .2);
  const ends = put(host, svg(`<div class="anton" style="position:absolute;left:60px;top:0;font-size:60px;color:#fff">AMEX</div><div class="anton" style="position:absolute;right:60px;top:0;font-size:60px;color:#fff">DELTA</div>`, 'left:0;top:900px;width:1080px;height:80px'));
  up(ends, tBuys - .2, 20);
  lane(1010, 'MILES →', SKY, 1, tMiles - .1); lane(1150, '← CASH', GOLD, -1, tCash - .25);
  cue(tMiles, 'stream', .4, 0, { dur: 1.2 }); cue(tCash, 'coins', .6, .3);
}

/* ---------- 3 · PROFIT: $8.2B is more than Delta's whole profit ($6.2B pre-tax) ---------- */
{
  through('profit');
  const host = sc('profit'), tMore = W('A04', 1), tProf = W('A04', 5), t62 = W('A04', 9), tTax = W('A04', 12);
  const bar = (x, h, col, top, lab, sub, id) => put(host, svg(`<div class="mono" id="${id}N" style="text-align:center;font-size:60px;color:#fff">${top}</div>
    <div id="${id}B" style="margin:16px auto 0;width:280px;height:${h}px;border-radius:20px 20px 0 0;background:${col};transform-origin:50% 100%"></div>
    <div class="anton" style="text-align:center;font-size:48px;color:#fff;margin-top:16px">${lab}</div><div class="mono" style="text-align:center;font-size:26px;color:#9fb6d0;margin-top:8px">${sub}</div>`, `left:${x}px;top:${1050 - h}px;width:360px`));
  const a = bar(110, 640, `linear-gradient(180deg,${GOLD},#a8700a)`, '$8.2B', 'AMEX PAID', 'to Delta, 2025', 'a');
  const d = bar(610, 484, `linear-gradient(180deg,${SKY},#1b5a8f)`, '$6.2B', 'DELTA PROFIT', 'pre-tax, 2025', 'd');
  up(a, S('profit') + .05, 60); tl.set('#aB', { scaleY: 0 }, 0); tl.to('#aB', { scaleY: 1, duration: .5, ease: 'power3.out' }, S('profit') + .1); cue(S('profit') + .1, 'slide', .5);
  up(d, tProf - .3, 60); tl.set('#dB', { scaleY: 0 }, 0); tl.to('#dB', { scaleY: 1, duration: .5, ease: 'power3.out' }, tProf - .2);
  tl.set('#dN', { textContent: '$?' }, 0); tl.set('#dN', { textContent: '$6.2B' }, t62 - .05); tl.to('#dN', { scale: 1.2, duration: .15, yoyo: true, repeat: 1 }, t62); cue(t62, 'ding', .5);
  const more = put(host, svg(`<div class="stamp green" style="position:relative;font-size:56px">MORE THAN ALL PROFIT</div>`, 'left:540px;top:180px')); center(more);
  slam(more, tMore + .1); cue(tMore + .3, 'impact', .8); R.shake(tMore + .3, 14, .3);
  tl.to('#aB', { boxShadow: `0 0 80px ${GOLD}`, duration: .4, yoyo: true, repeat: 1 }, tTax);
}

/* ---------- 4 · UNITED: 2020, borrowed against the miles program, valued at $22B ---------- */
{
  through('united');
  const host = sc('united'), tJust = W('A05', 3), t20 = W('A05', 6), tUn = W('A05', 7), tBor = W('A05', 8), tProg = W('A05', 12), tVal = W('A05', 15), t22 = W('A05', 17);
  const not = put(host, svg(`<div class="anton" style="font-size:88px;color:#fff">NOT JUST <span style="color:${SKY}">DELTA</span></div>`, 'left:0;top:190px;width:1080px;text-align:center')); up(not, S('united') + .05, 30);
  const doc = put(host, svg(`<div class="paper" style="position:relative;width:640px;height:560px;padding:44px">
    <div class="mono" style="font-size:28px;color:#5b6b63">LOAN · <span id="yr">2020</span></div>
    <div class="anton" style="font-size:64px;margin-top:16px;color:#101418">UNITED AIRLINES</div>
    <div style="height:14px;background:#cfcabd;border-radius:7px;margin-top:30px;width:90%"></div><div style="height:14px;background:#cfcabd;border-radius:7px;margin-top:18px;width:70%"></div>
    <div class="mono" style="font-size:30px;margin-top:40px;color:#5b6b63">COLLATERAL:</div>
    <div id="coll" class="anton" style="font-size:60px;margin-top:10px;color:#1b5a8f">THE MILES PROGRAM</div>
    <div id="valL" class="mono" style="font-size:30px;margin-top:34px;color:#5b6b63">APPRAISED VALUE:</div>
    <div id="valN" class="big" style="font-size:80px;margin-top:8px;color:#0c7a45">$0</div></div>`, 'left:220px;top:320px'));
  tl.set(doc, { opacity: 0, y: 80, rotation: -3 }, 0); tl.to(doc, { opacity: 1, y: 0, rotation: 0, duration: .4, ease: 'power3.out' }, S('united') + .12); cue(S('united') + .12, 'paper', .6); tl.to('#yr', { color: '#1b5a8f', duration: .2, yoyo: true, repeat: 1 }, t20);
  tl.set('#coll', { opacity: 0 }, 0); tl.to('#coll', { opacity: 1, duration: .2 }, tProg - .1); cue(tProg - .1, 'stamp', .5);
  tl.set('#valL, #valN', { opacity: 0 }, 0); tl.to('#valL, #valN', { opacity: 1, duration: .2 }, tVal - .1);
  R.count('#valN', tVal, t22 - tVal + .3, 0, 21.9, v => '$' + v.toFixed(1) + 'B', 'power3.out'); cue(tVal, 'counter', .5, 0, { dur: t22 - tVal + .3 });
  tl.to(doc, { scale: 1.04, duration: .2, yoyo: true, repeat: 1, transformOrigin: '50% 80%' }, t22 + .3); cue(t22 + .3, 'impact', .6);
  const src = put(host, svg(`<div class="mono" style="font-size:22px;color:#9fb6d0">source: United SEC filing, 2020</div>`, 'left:0;top:1170px;width:1080px;text-align:center')); up(src, tVal, 10);
}

/* ---------- 5 · HALF: the whole airline was worth about half that ---------- */
{
  through('half');
  const host = sc('half'), tWhole = W('A06', 1), tPlanes = W('A06', 3), tHalf = W('A06', 9);
  const box = (x, w, h, col, big, lab, id) => put(host, svg(`<div id="${id}" style="position:relative;width:${w}px;height:${h}px;border-radius:26px;background:${col};display:flex;align-items:center;justify-content:center;flex-direction:column">
    <div class="big" style="font-size:${w > 400 ? 90 : 64}px;color:#fff">${big}</div><div class="anton" style="font-size:40px;color:#fff;margin-top:10px">${lab}</div></div>`, `left:${x}px;top:${1100 - h}px`));
  const m = box(90, 470, 700, `linear-gradient(180deg,${GOLD},#a8700a)`, '$21.9B', 'MILES PROGRAM', 'mB');
  const a = box(600, 390, 350, `linear-gradient(180deg,${SKY},#1b5a8f)`, '$10.6B', 'WHOLE AIRLINE', 'aB');
  pop(m, S('half') + .05, .7); up(a, tWhole - .2, 80); cue(tWhole - .2, 'slide', .5);
  const fleet = put(host, svg(Array.from({ length: 6 }, () => PLANE(56)).join(''), 'left:610px;top:640px;width:380px;display:flex;flex-wrap:wrap;gap:6px'));
  up(fleet, tPlanes - .1, 20); cue(tPlanes, 'jet', .3, .4, { dur: .8 });
  const h = put(host, svg(`<div class="stamp red" style="position:relative;font-size:96px">≈ HALF</div>`, 'left:790px;top:300px')); center(h);
  slam(h, tHalf - .1); cue(tHalf + .1, 'stamp', 1); R.shake(tHalf + .1, 16, .3);
  const k = put(host, svg(`<div class="mono" style="font-size:22px;color:#9fb6d0">equity value per 2020 bond documents</div>`, 'left:0;top:1170px;width:1080px;text-align:center')); up(k, tHalf, 10);
}

/* ---------- 6 · SIDE: they don't just sell seats — they sell miles to banks ---------- */
{
  through('side');
  const host = sc('side'), tSeats = W('A07', 4), tSell = W('A07', 6), tMiles = W('A07', 7), tBanks = W('A07', 9), tBil = W('A07', 12);
  const seats = put(host, svg(`<div style="display:grid;grid-template-columns:repeat(6,80px);gap:14px">${Array.from({ length: 18 }, () => `<div style="width:80px;height:90px;border-radius:18px 18px 8px 8px;background:#2a4a7a;border:3px solid #6f9fd8"></div>`).join('')}</div>
    <div class="anton" style="text-align:center;font-size:60px;color:#fff;margin-top:20px">SEATS</div>`, 'left:258px;top:220px'));
  pop(seats, S('side') + .05, .7); cue(S('side') + .1, 'pop', .4);
  tl.to(seats, { scale: .55, x: -230, y: -40, opacity: .5, duration: .4, ease: 'power3.inOut', transformOrigin: '50% 0%' }, tSell - .2);
  const miles = put(host, svg(`<div style="position:relative;width:420px;height:300px;border-radius:30px;background:linear-gradient(135deg,${GOLD},#a8700a);display:flex;align-items:center;justify-content:center;flex-direction:column;box-shadow:0 0 80px rgba(255,198,64,.5)">${PLANE(110, '#3a2500')}<div class="anton" style="font-size:70px;color:#3a2500">MILES</div></div>`, 'left:560px;top:250px'));
  pop(miles, tMiles - .15, .4); cue(tMiles - .15, 'impact', .6);
  const banks = put(host, svg(`<svg viewBox="0 0 860 300" style="width:860px;height:300px;overflow:visible"><path id="toBank" d="M640,10 C640,180 430,140 430,280" stroke="${GOLD}" stroke-width="10" fill="none" stroke-dasharray="18 14"/></svg>`, 'left:110px;top:560px'));
  R.draw('#toBank', tBanks - .3, .4);
  const bk = put(host, svg(`<svg viewBox="0 0 300 200" style="width:300px;height:200px"><path d="M10,60 L150,10 L290,60 Z" fill="#dbe9f7"/><g fill="#dbe9f7"><rect x="40" y="70" width="30" height="100"/><rect x="100" y="70" width="30" height="100"/><rect x="170" y="70" width="30" height="100"/><rect x="230" y="70" width="30" height="100"/></g><rect x="10" y="176" width="280" height="20" fill="#dbe9f7"/></svg><div class="anton" style="text-align:center;font-size:56px;color:#fff">BANKS</div>`, 'left:390px;top:860px'));
  up(bk, tBanks - .1, 40); cue(tBanks, 'ding', .5);
  const bil = put(host, svg(`<div class="pill" style="position:relative;background:${GOLD};color:#1a1204;font-size:40px">BY THE BILLION</div>`, 'left:790px;top:960px')); center(bil); pop(bil, tBil - .1); cue(tBil, 'coins', .5);
}

/* ---------- 7 · OUTRO: every swipe → the airline gets paid → question → frame 0 ---------- */
{
  through('outro', { last: true });
  const host = sc('outro'), tSw = W('A08', 4), tAir = W('A08', 8), tPaid = W('A08', 10), tEnd = VE('A08');
  const card = put(host, svg(CARD('MILES CARD', 'earns miles on every purchase'), 'left:260px;top:220px'));
  up(card, S('outro') + .05, 60);
  tl.to(card, { x: 120, rotation: 4, duration: .25, yoyo: true, repeat: 1, ease: 'power2.inOut' }, tSw - .1); cue(tSw, 'swipe', .7);
  const paid = put(host, svg(`<div class="stamp green" style="position:relative;font-size:72px">AIRLINE GETS PAID ✓</div>`, 'left:540px;top:690px')); center(paid);
  slam(paid, tPaid - .1); cue(tPaid + .1, 'coins', .8); R.shake(tPaid + .1, 10, .25);
  const q = put(host, svg(`<div class="qcard" style="position:relative;left:0"><div class="anton" style="font-size:66px;color:#fff">DO YOU PAY WITH A</div><div class="anton greentx" style="font-size:96px;margin-top:6px">MILES CARD?</div><div class="mono" style="font-size:32px;color:#dbe9f7;margin-top:18px">Worth it or a trap? Comment 👇</div></div>`, 'left:90px;top:820px;width:900px'));
  up(q, tEnd - .1, 60, .35); cue(tEnd - .1, 'whoosh', .5);
  tl.to(q, { scale: 1.04, duration: .3, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, tEnd + .35);
  tl.to(host, { opacity: 0, duration: .3 }, TOTAL - .45);
  tl.set(f0, { y: 0, scale: 1 }, TOTAL - .5); tl.to(f0, { opacity: 1, duration: .3 }, TOTAL - .45);
}

/* ================= polish pass: punch-ins, riders, extra detail ================= */
const punch = (t, a = 1.05) => { tl.to('#stage', { scale: a, duration: .12, ease: 'power2.out', transformOrigin: '50% 40%' }, t).to('#stage', { scale: 1, duration: .38, ease: 'power2.inOut' }, t + .12); };
const rider = (pathSel, host, t0, dur, n, html, gap) => {
  const p = $(pathSel), L = p.getTotalLength(), box = p.ownerSVGElement;
  for (let i = 0; i < n; i++) {
    const d = div('', host, html, 'left:0;top:0'), pr = { u: 0 };
    const mv = () => { const pt = p.getPointAtLength(pr.u * L), m = box.getScreenCTM(), hm = host.getScreenCTM ? null : host.getBoundingClientRect();
      const r = box.getBoundingClientRect(), hr = host.getBoundingClientRect(), vb = box.viewBox.baseVal, sx = r.width / vb.width, sy = r.height / vb.height;
      d.style.transform = `translate(${r.left - hr.left + pt.x * sx - 22}px, ${r.top - hr.top + pt.y * sy - 22}px)`; };
    const t = t0 + i * gap;
    tl.set(d, { opacity: 0 }, 0); tl.to(d, { opacity: 1, duration: .1 }, t);
    tl.fromTo(pr, { u: 0 }, { u: 1, duration: dur, ease: 'none', onUpdate: mv, onStart: mv, immediateRender: false }, t);
    tl.to(d, { opacity: 0, duration: .15 }, t + dur - .15);
  }
};
const src = (host, txt, t) => { const e = div('mono', host, txt, 'left:0;top:1176px;width:1080px;text-align:center;font-size:22px;color:rgba(219,233,247,.6);letter-spacing:2px'); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .3 }, t); };

[[ 'A01', 4 ], [ 'A03', 0 ], [ 'A04', 1 ], [ 'A05', 17 ], [ 'A06', 9 ], [ 'A07', 12 ], [ 'A08', 10 ]].forEach(([id, k]) => punch(W(id, k)));
// hook: the plane leaves a contrail across the frame
{
  const tr = put('#stage', svg(`<svg viewBox="0 0 1080 400" style="width:1080px;height:400px;overflow:visible"><path id="trail" d="M-40,360 C300,300 600,120 1120,80" stroke="rgba(219,233,247,.55)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="2 18"/></svg>`, 'left:0;top:160px'));
  R.draw('#trail', .05, 1.6, 'power1.inOut'); tl.to(tr, { opacity: 0, duration: .3 }, E('hook') - .3);
  tl.to('#f0p', { x: 30, rotation: 6, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, .05);
}
// profit + united: sources on screen
src(sc('profit'), 'source: Delta Air Lines full-year 2025 results', W('A04', 5));
// side: a stream of $ from banks back to the airline
{
  const host = sc('side'), t0 = W('A07', 9) + .2;
  for (let i = 0; i < 10; i++) { const d = div('mono', host, '$', `left:540px;top:900px;font-size:58px;color:${GOLD};text-shadow:0 0 14px ${GOLD}`);
    const t = t0 + i * .12; tl.set(d, { opacity: 0 }, 0); tl.to(d, { opacity: 1, duration: .06 }, t); tl.to(d, { x: 230 + (i % 3) * 20, y: -560 + (i % 2) * 30, duration: .7, ease: 'power1.in' }, t); tl.to(d, { opacity: 0, duration: .1 }, t + .6); }
  cue(t0, 'coins', .4, .3);
}
// outro: a running "miles → $" ticker under the card
{
  const host = sc('outro'), t = W('A08', 1);
  const tk = put(host, svg(`<div class="mono" id="tkN" style="font-size:44px;color:${GOLD}">AIRLINE EARNS: $0</div>`, 'left:540px;top:610px')); center(tk);
  tl.set(tk, { opacity: 0 }, 0); tl.to(tk, { opacity: 1, duration: .2 }, t);
  R.count('#tkN', t, W('A08', 10) - t, 0, 38, v => 'AIRLINE EARNS: $' + v.toFixed(2) + ' per $1,000', 'power1.in');
}

/* ================= assets pass: brand wordmarks + a drifting prop layer ================= */
const propLayer = (icons, n, alpha) => {
  const L = document.createElement('div'); L.className = 'abs'; L.style.cssText = 'inset:0;pointer-events:none'; L.dataset.drift = '1';
  $('#stage').parentNode.insertBefore(L, $('#stage'));
  for (let i = 0; i < n; i++) {
    const d = div('', L, icons[i % icons.length], `left:${(i * 197) % 1000 + rnd() * 60 - 20}px;top:${(i * 311) % 1700 + 120}px;opacity:${alpha * (.6 + rnd() * .6)};width:120px;height:120px`);
    d.dataset.drift = '1';
    const s = .6 + rnd() * .9; tl.set(d, { scale: s, rotation: (rnd() - .5) * 40 }, 0);
    // drift out and back over the whole Short, so the last frame matches frame 0 (loop)
    tl.to(d, { y: -(60 + rnd() * 120), x: (rnd() - .5) * 80, rotation: '+=' + ((rnd() - .5) * 60), duration: TOTAL / 2, ease: 'sine.inOut', yoyo: true, repeat: 1, data: 'drift' }, 0);
  }
};
const logoIn = (host, html, css, t, t2) => { const e = put(host, svg(html, css)); tl.set(e, { opacity: 0, scale: .6 }, 0); tl.to(e, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, t); if (t2) tl.to(e, { opacity: 0, duration: .2 }, t2); return e; };

const DELTA = (w = 300) => `<svg viewBox="0 0 340 110" style="width:${w}px;height:${w * 110 / 340}px"><path d="M10,96 L52,14 L94,96 Z" fill="#c8102e"/><path d="M52,14 L94,96 L60,96 Z" fill="#8b0d22"/><text x="110" y="84" font-family="Space Grotesk" font-weight="700" font-size="74" fill="#fff" letter-spacing="2">DELTA</text></svg>`;
const AMEX = (w = 220) => `<div style="width:${w}px;height:${w}px;background:#016fd0;border-radius:${w * .06}px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 ${w * .19}px/1.02 'Space Grotesk';color:#fff;letter-spacing:-1px;text-align:center"><div>AMERICAN</div><div>EXPRESS</div></div>`;
const UNITED = (w = 300) => `<svg viewBox="0 0 300 100" style="width:${w}px;height:${w / 3}px"><circle cx="50" cy="50" r="40" fill="#005daa"/><g stroke="#fff" stroke-width="4" fill="none"><ellipse cx="50" cy="50" rx="18" ry="40"/><path d="M10,50 L90,50 M16,30 L84,30 M16,70 L84,70"/></g><text x="104" y="68" font-family="Space Grotesk" font-weight="700" font-size="54" fill="#fff" letter-spacing="3">UNITED</text></svg>`;
const ICON = {
  pass: `<svg viewBox="0 0 120 120"><rect x="6" y="30" width="108" height="60" rx="8" fill="#dbe9f7"/><path d="M80,30 L80,90" stroke="#9fb6d0" stroke-width="3" stroke-dasharray="5 5"/><text x="16" y="56" font-family="JetBrains Mono" font-weight="800" font-size="16" fill="#0b1a33">JFK → ATL</text><rect x="16" y="66" width="50" height="10" fill="#9fb6d0"/></svg>`,
  lug: `<svg viewBox="0 0 120 120"><rect x="30" y="34" width="60" height="74" rx="10" fill="#4fc3ff"/><rect x="48" y="16" width="24" height="22" rx="6" fill="none" stroke="#4fc3ff" stroke-width="6"/><path d="M30,60 L90,60" stroke="#0b1a33" stroke-width="5"/></svg>`,
  card: `<svg viewBox="0 0 120 120"><rect x="8" y="28" width="104" height="66" rx="10" fill="#1b3a6b" stroke="#dbe9f7" stroke-width="3"/><rect x="20" y="46" width="22" height="16" rx="3" fill="#ffc640"/></svg>`,
  coin: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="#ffc640"/><text x="60" y="76" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="40" fill="#a8700a">$</text></svg>`,
  plane: `<svg viewBox="0 0 120 120"><path d="M60,6 L68,44 L112,62 L112,72 L68,64 L66,92 L80,102 L80,110 L60,104 L40,110 L40,102 L54,92 L52,64 L8,72 L8,62 L52,44 Z" fill="#dbe9f7"/></svg>`,
  mi: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="none" stroke="#4fc3ff" stroke-width="6"/><text x="60" y="74" text-anchor="middle" font-family="Anton" font-size="40" fill="#4fc3ff">MI</text></svg>`,
};
propLayer(Object.values(ICON), 22, .15);
// brand marks where the story names each company
logoIn(sc('hook'), DELTA(300), 'left:390px;top:930px', W('A01', 2) - .1, W('A01', 6) - .2);
logoIn(sc('amex'), AMEX(170), 'left:455px;top:440px', W('A03', 0) + .3, W('A03', 5) - .4);
logoIn(sc('amex'), AMEX(110), 'left:40px;top:780px', W('A03', 10) - .2);
logoIn(sc('amex'), DELTA(220), 'left:820px;top:790px', W('A03', 13) - .2);
logoIn(sc('profit'), AMEX(90), 'left:245px;top:900px', S('profit') + .3);
logoIn(sc('profit'), DELTA(170), 'left:705px;top:960px', W('A04', 5));
logoIn(sc('united'), UNITED(300), 'left:390px;top:1060px', W('A05', 7) - .1);
logoIn(sc('half'), UNITED(260), 'left:410px;top:240px', S('half') + .15);

// a slow camera drift on every scene so no beat ever sits still
R.tim.scenes.forEach(x => { const h = sc(x.id); tl.fromTo(h, { y: 0 }, { y: -18, duration: E(x.id) - S(x.id), ease: 'sine.inOut', immediateRender: false }, S(x.id)); });

R.captions($('#caps'));
R.finish('miles');
