/* s1: the hook, chapter 1 (the gossip files, 1899–1975), chapter 2 (turning people into math, 1956–1995) */
const at = (host, html, x, y, css = '') => put(host, svg(html, `left:${x}px;top:${y}px;${css}`));
const bubble = (host, txt, x, y, t, { w = 0, bg = '#fff4d6', fg = '#1a1208', size = 34, tail = 'left' } = {}) => {
  const b = at(host, `<div style="position:relative;${w ? `width:${w}px;white-space:normal;` : 'white-space:nowrap;'}padding:18px 28px;border-radius:26px;background:${bg};color:${fg};font:700 ${size}px/1.15 'Space Grotesk';box-shadow:0 18px 40px rgba(0,0,0,.4)">${txt}<i style="position:absolute;${tail}:40px;bottom:-22px;border:14px solid transparent;border-top:18px solid ${bg}"></i></div>`, x, y);
  pop(b, t, .3); cue(t, 'pop', .4, (x - 960) / 960); return b;
};
const BILL = (w = 220) => `<svg viewBox="0 0 220 100" style="width:${w}px;height:${w * .45}px"><rect x="2" y="2" width="216" height="96" rx="8" fill="#7fc47a" stroke="#2f6a2c" stroke-width="4"/><circle cx="110" cy="50" r="30" fill="#a9dca4" stroke="#2f6a2c" stroke-width="3"/><text x="110" y="64" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="38" fill="#2f6a2c">$</text><text x="22" y="30" font-family="Anton" font-size="22" fill="#2f6a2c">100</text><text x="168" y="88" font-family="Anton" font-size="22" fill="#2f6a2c">100</text></svg>`;

/* ================= HOOK 1: the three-digit number that decides everything ================= */
{
  const id = 'hook1', host = sc(id);
  through(id, { first: true });
  // frame 0: the gauge is already spinning through scores (motion + a number before the first word)
  const g = gauge(host, 110, 170, 780, { score: 300, label: 'YOUR SCORE', hide: false });
  tl.fromTo(g.arc, { attr: { 'stroke-dashoffset': 754 } }, { attr: { 'stroke-dashoffset': 0 }, duration: .9, ease: 'power2.out' }, 0);
  tl.fromTo(g.g, { rotationX: 40, scale: .85, transformPerspective: 1600 }, { rotationX: 8, scale: 1, duration: 1.1, ease: 'back.out(1.3)' }, 0);
  cue(0.02, 'riser', .35, 0, { dur: .5 }); cue(0.05, 'whoosh', .5);
  g.to(0.05, 812, .7, 'power2.out'); g.to(.8, 568, .5); g.to(W('H1', 'decides'), 742, .5, 'back.out(1.4)');
  tl.to(g.g, { rotationX: 0, duration: 3, ease: 'sine.inOut' }, 1.2);
  const tx = put(host, svg(`<div class="anton" style="font-size:56px;color:${CREAM}">THREE DIGITS. <span style="color:${GOLD}">YOUR WHOLE LIFE.</span></div>`, 'left:150px;top:720px'));
  up(tx, W('H1', 'decides') - .1, 30);
  // what it decides: four tiles on the right, wired to the gauge
  const tiles = [['house', A.house(200, '#ffb347'), 'MORTGAGE RATE'], ['car', A.car(250, '#4fc3ff'), 'AUTO LOAN'], ['apartment', A.building(120, '#9b7bff', 5), 'RENTAL APPROVAL'], ['job', A.brief(170), 'GETTING HIRED']];
  const tileEls = tiles.map(([w, art, lbl], i) => {
    const x = 1000 + (i % 2) * 430, y = 140 + Math.floor(i / 2) * 360, t = W('H1', w) - .1;
    const c = at(host, `<div class="card" style="position:relative;width:390px;height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px">${art}<div class="mono" style="font-size:28px;color:${CREAM};letter-spacing:2px">${lbl}</div></div>`, x, y);
    tl.set(c, { opacity: 0, rotationY: -70, transformPerspective: 1400, transformOrigin: '0 50%' }, 0);
    tl.to(c, { opacity: 1, rotationY: 0, duration: .45, ease: 'back.out(1.5)' }, t); cue(t, 'flip', .4, .5);
    stream(host, 640, 420, x + 20, y + 160, t, t + .7, i % 2 ? '#4fc3ff' : GOLD, .1, 10);
    return c;
  });
  const hired = stampOn(host, 'HIRED?', 'gold', 1460, 560, W('H1', 'job') + .2, -10, 54);
  tl.to(g.g, { scale: 1.05, duration: .15, yoyo: true, repeat: 1 }, W('H1', 'decides'));
  // H2: you never signed up; you can't opt out; three companies build it right now
  const tOut = V('H2') - .15;
  tl.to([...tileEls, hired, tx], { opacity: 0, y: 40, duration: .3, stagger: .04 }, tOut);
  const form = at(host, `<div class="paper" style="position:relative;width:420px;padding:30px 34px"><div class="mono" style="font-size:30px;color:#2a2418">SIGN-UP FORM</div>
    <div style="margin-top:22px;display:flex;align-items:center;gap:18px;font:700 32px 'Space Grotesk';color:#2a2418"><i style="display:block;width:44px;height:44px;border:5px solid #2a2418;border-radius:8px"></i>I agree</div>
    <div style="margin-top:20px;height:16px;border-radius:8px;background:#ddd2b8"></div><div style="margin-top:12px;width:70%;height:16px;border-radius:8px;background:#ddd2b8"></div></div>`, 1000, 170);
  up(form, W('H2', 'never') - .15, 50);
  const no = stampOn(host, 'NEVER SIGNED', 'red', 990, 400, W('H2', 'signed') + .05, -8, 46);
  const sw = at(host, `<div style="display:flex;align-items:center;gap:26px"><div class="mono" style="font-size:34px;color:${CREAM}">OPT OUT</div><div style="position:relative;width:170px;height:84px;border-radius:42px;background:#3dff9a"><i class="kn" style="position:absolute;left:94px;top:8px;width:68px;height:68px;border-radius:50%;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.4)"></i></div></div>`, 1480, 230);
  up(sw, W('H2', "can't") - .2, 40);
  const kn = sw.querySelector('.kn'), tOpt = W('H2', 'opt');
  tl.to(kn, { x: -80, duration: .18, ease: 'power2.out' }, tOpt); tl.to(kn, { x: 0, duration: .3, ease: 'back.out(3)' }, tOpt + .22); cue(tOpt, 'clunk', .5, .7);
  tl.to(kn, { x: -60, duration: .15 }, tOpt + .6); tl.to(kn, { x: 0, duration: .3, ease: 'back.out(3)' }, tOpt + .78); cue(tOpt + .78, 'buzz', .4, .7);
  const lock = at(host, A.lock(70, RED), 1700, 140); pop(lock, tOpt + .85);
  // three private companies: three 3D towers with the bureau marks
  const tThree = W('H2', 'three');
  tl.to([form, no, sw, lock], { opacity: 0, duration: .3 }, tThree - .25);
  const marks = [A.equifax(230), A.experian(250), A.transunion(250)];
  const towers = marks.map((m, i) => {
    const x = 1010 + i * 290, h = 360 + (i === 1 ? 80 : 0);
    const b = box3d(host, { x, y: 800 - h, w: 220, h, d: 90, top: '#5a6aa8', front: 'linear-gradient(180deg,#2c3a72,#141c3e)', side: '#1c2652', html: `<div style="position:absolute;inset:16px;background:repeating-linear-gradient(0deg,rgba(255,233,168,.5) 0 10px,transparent 10px 26px),repeating-linear-gradient(90deg,transparent 0 22px,rgba(10,14,34,.9) 22px 30px)"></div>` });
    tl.set(b, { rotationY: -24, rotationX: -6, transformPerspective: 2000, scaleY: 0, transformOrigin: '50% 100%' }, 0);
    tl.to(b, { scaleY: 1, duration: .5, ease: 'back.out(1.4)' }, tThree + i * .12); cue(tThree + i * .12, 'thud', .5, .3 + i * .2);
    const lg = at(host, m, x - 10, 760 - h - 70); pop(lg, W('H2', 'companies') + i * .1, .4);
    return b;
  });
  const you = pill(host, 'YOU', GOLD, '#120d04', 440, 640, 40); pop(you, W('H2', 'about') - .1);
  stream(host, 500, 420, 1120, 380, W('H2', 'building'), VE('H2') + .4, '#4fc3ff', .07, 10);
  stream(host, 500, 420, 1410, 300, W('H2', 'building') + .03, VE('H2') + .4, VIOLET, .07, 10);
  stream(host, 500, 420, 1700, 380, W('H2', 'building') + .06, VE('H2') + .4, GOLD, .07, 10);
  const rec = at(host, `<div style="display:flex;align-items:center;gap:14px;padding:10px 22px;border-radius:30px;background:rgba(10,8,30,.85);border:2px solid ${RED}"><i style="display:block;width:26px;height:26px;border-radius:50%;background:${RED};box-shadow:0 0 18px ${RED}"></i><span class="mono" style="font-size:30px;color:#fff">LIVE · RIGHT NOW</span></div>`, 1340, 120);
  pop(rec, W('H2', 'right') - .1); cue(W('H2', 'right'), 'blip', .4, .6, { f: 1500 });
  tl.to(rec.querySelector('i'), { opacity: .25, duration: .4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, W('H2', 'right') + .3);
  g.to(W('H2', 'building'), 701, 1.2);
  cam(id, { z: 1.05, x: -10, rx: 4 });
}

/* ================= HOOK 2: you're the product + the three promises ================= */
{
  const id = 'hook2', host = sc(id); through(id);
  const gift = at(host, `<svg viewBox="0 0 220 220" style="width:240px;height:240px"><rect x="20" y="80" width="180" height="130" rx="10" fill="#e8322b"/><rect x="10" y="60" width="200" height="40" rx="8" fill="#ff5a4d"/><rect x="98" y="60" width="24" height="150" fill="${GOLD}"/><path d="M110,60 Q70,10 60,40 Q56,60 110,60 Q150,10 162,40 Q166,60 110,60" fill="${GOLD}"/></svg>`, 200, 260);
  pop(gift, S(id) + .1, .5); cue(S(id) + .15, 'pop', .4, -.5);
  const tFill = W('H3', "you're", 10) - .4;
  [A.equifax(250), A.experian(270), A.transunion(270)].forEach((m, i) => {
    const y = 150 + i * 150, lg = at(host, m, 1420, y); tl.set(lg, { opacity: 0, x: 120 }, 0); tl.to(lg, { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, S(id) + .2 + i * .12); tl.to(lg, { opacity: 0, x: 120, duration: .3 }, tFill + i * .05);
    for (let k = 0; k < 6; k++) { const c = at(host, A.coin(54), 1180 + (k % 3) * 60, 860); const t = S(id) + .5 + i * .3 + k * .45; if (t > tFill - .6) continue; tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .1 }, t); tl.to(c, { x: 260 + i * 10, y: y - 830, scale: .5, duration: .6, ease: 'power2.in' }, t); tl.to(c, { opacity: 0, duration: .1 }, t + .55); if (k % 2 === 0) cue(t + .55, 'coins', .18, .7); }
  });
  const fav = stampOn(host, 'NOT A FAVOR', 'red', 120, 540, W('H3', 'favor') - .05, -8, 52);
  const badge = at(host, `<div style="position:relative;padding:30px 50px;border-radius:24px;background:#fff;color:#1a2347;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,.45)"><div class="mono" style="font-size:24px;color:#8390b5">HELLO, I'M THE</div><div class="anton" style="font-size:96px">CUSTOMER</div><i class="strike" style="position:absolute;left:30px;right:30px;top:96px;height:14px;border-radius:7px;background:${RED}"></i></div>`, 720, 220);
  up(badge, W('H3', 'business') - .2, 50);
  const strike = badge.querySelector('.strike'); tl.set(strike, { scaleX: 0, transformOrigin: '0 50%' }, 0); tl.to(strike, { scaleX: 1, duration: .3, ease: 'power3.out' }, W('H3', 'customer') + .15); cue(W('H3', 'customer') + .15, 'slash', .6);
  // "you're the product": a person on a conveyor gets a barcode tag and is boxed
  const tProd = W('H3', 'product');
  const belt = at(host, `<div style="width:760px;height:44px;border-radius:22px;background:repeating-linear-gradient(90deg,#3a4670 0 40px,#2a3452 40px 80px);box-shadow:0 20px 40px rgba(0,0,0,.4)"></div>`, 1020, 700);
  up(belt, W('H3', "you're", 10) - .3, 30);
  tl.fromTo(belt.firstChild, { backgroundPosition: '0px 0px' }, { backgroundPosition: '-320px 0px', duration: 4, ease: 'none', immediateRender: false }, W('H3', "you're", 10) - .3);
  const per = at(host, A.person(170, CREAM), 1300, 400, `color:${CREAM}`);
  tl.set(per, { opacity: 0, x: -300 }, 0); tl.to(per, { opacity: 1, x: 0, duration: .6, ease: 'power2.out' }, W('H3', "you're", 10) - .3);
  const tag = at(host, `<div style="padding:14px 18px;border-radius:12px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.4)"><div style="width:180px;height:70px;background:repeating-linear-gradient(90deg,#111 0 4px,#fff 4px 7px,#111 7px 9px,#fff 9px 14px)"></div><div class="mono" style="font-size:22px;color:#111;margin-top:8px;text-align:center">PRODUCT · YOU</div></div>`, 1480, 360);
  tl.set(tag, { opacity: 0, rotation: 30, scale: 2 }, 0); tl.to(tag, { opacity: 1, rotation: 8, scale: 1, duration: .25, ease: 'power4.in' }, tProd - .05); cue(tProd + .18, 'stamp', .8); R.shake(tProd + .2, 10, .25);
  // H4: three promises — three flip panels
  const tOut = V('H4') - .2;
  tl.to([gift, fav, badge, belt, per, tag], { opacity: 0, y: -30, duration: .3, stagger: .03 }, tOut);
  const P = [
    ['invented', 'WHO INVENTED IT', `<div class="big" style="font-size:120px;color:#bfe0ff">1956</div><div class="serif" style="font-size:40px;color:#bfe0ff">two men and a formula</div>`, '#1f5fa8'],
    ['rich', "WHO'S GETTING RICH", `<div style="display:flex;gap:10px">${[0, 1, 2].map(i => `<div style="display:flex;flex-direction:column-reverse">${Array(4 + i).fill(A.coin(70)).map(c => `<div style="height:20px;overflow:visible">${c}</div>`).join('')}</div>`).join('')}</div><div class="big" style="font-size:80px;color:${GOLD};margin-top:60px">$18B</div>`, '#6b4f12'],
    ['cash', 'WHY CASH CAN HURT YOU', `${BILL(260)}<div class="anton" style="font-size:70px;color:${RED};margin-top:18px">SCORE ↓</div>`, '#7a1a26'],
  ];
  const panels = P.map(([w, title, art, bg], i) => {
    const t = W('H4', w) - .25, x = 140 + i * 560;
    const p = at(host, `<div style="position:relative;width:520px;height:560px;border-radius:30px;background:linear-gradient(160deg,${bg},#0c0a2c);border:3px solid rgba(255,255,255,.3);box-shadow:0 40px 80px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;overflow:hidden">
      <div class="mono" style="position:absolute;top:34px;font-size:28px;letter-spacing:3px;color:${CREAM}">${title}</div>${art}<div class="big" style="position:absolute;right:24px;bottom:16px;font-size:60px;color:rgba(255,255,255,.18)">${i + 1}</div></div>`, x, 170);
    tl.set(p, { opacity: 0, rotationY: 90, transformPerspective: 1600 }, 0); tl.to(p, { opacity: 1, rotationY: 0, duration: .5, ease: 'back.out(1.4)' }, t); cue(t, 'flip', .5, -.6 + i * .6);
    tl.to(p, { y: -10, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + .5);
    return p;
  });
  const tHurt = W('H4', 'hurt');
  tl.to(panels[2], { scale: 1.08, duration: .15 }, tHurt); tl.to(panels[2], { scale: 1, duration: .4 }, tHurt + .15);
  R.shake(tHurt + .05, 14, .35); cue(tHurt, 'impact', .7, .6);
  tl.to([panels[0], panels[1]], { opacity: .45, duration: .3 }, tHurt);
  cam(id, { z: 1.06, ry: -3 });
}

/* ================= CHAPTER 1: THE GOSSIP FILES ================= */
propLayer('archive', [A.env(110, '#e8d9b0', '#9a7a4a'), A.hat(70, '#2a1a0e', false), `<div class="mono" style="font-size:60px;color:#f1e4c8">?</div>`, A.phoneOld(110, '#2a1a0e')], S('p0'), E('p4'), 16, .16);
chapterCard('p0', 1, 'THE GOSSIP FILES', 'Atlanta, 1899 — 1975', A.hat(190, '#f1e4c8'), AMBER, 'archive');

// p1: Atlanta 1899, two brothers, the grocers' lists → Retail Credit
{
  const id = 'p1', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'ATLANTA, 1899', 1);
  const pin = at(host, `<div style="display:flex;align-items:center;gap:16px"><svg viewBox="0 0 60 80" style="width:54px;height:72px"><path d="M30,78 Q2,40 2,28 A28,28 0 0 1 58,28 Q58,40 30,78 Z" fill="${RED}"/><circle cx="30" cy="28" r="11" fill="#fff"/></svg><span class="anton" style="font-size:72px;color:${CREAM};letter-spacing:6px">ATLANTA, GA</span></div>`, 140, 140);
  tl.set(pin, { opacity: 0, y: -80 }, 0); tl.to(pin, { opacity: 1, y: 0, duration: .45, ease: 'bounce.out' }, V('P1')); cue(V('P1') + .3, 'thud', .5, -.6);
  const yr = at(host, `<div class="serif" style="font-size:230px;color:#f1e4c8;text-shadow:0 10px 0 rgba(0,0,0,.35)">1899</div>`, 140, 230); up(yr, W('P1', '1899') - .1, 60);
  const bro = [['CATOR', 120], ['GUY', 360]].map(([n, x], i) => {
    const h = at(host, `<div style="text-align:center">${A.hat(170, '#1e140b')}<div class="mono" style="font-size:30px;color:${CREAM};margin-top:6px">${n}</div></div>`, x, 520);
    tl.set(h, { opacity: 0, y: 60 }, 0); tl.to(h, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' }, W('P1', i ? 'guy' : 'cator') - .15); cue(W('P1', i ? 'guy' : 'cator'), 'pop', .35, -.6);
    tl.to(h, { y: -6, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: 5 }, W('P1', 'guy') + .4);
    return h;
  });
  const shop = at(host, `<div style="position:relative;width:640px;height:420px">
    <div style="position:absolute;left:0;top:0;width:640px;height:90px;border-radius:12px;background:#3a2410;display:flex;align-items:center;justify-content:center"><span class="anton" style="font-size:64px;color:#ffd27a;letter-spacing:10px">GROCER</span></div>
    <div style="position:absolute;left:-20px;top:90px;width:680px;height:80px;background:repeating-linear-gradient(90deg,#c8102e 0 60px,#f5f1e6 60px 120px);clip-path:polygon(0 0,100% 0,96% 100%,4% 100%)"></div>
    <div style="position:absolute;left:30px;top:170px;width:580px;height:250px;background:#5a3a1e"></div>
    <div style="position:absolute;left:70px;top:200px;width:220px;height:170px;background:#ffe9a8;opacity:.85"></div><div style="position:absolute;left:350px;top:200px;width:220px;height:220px;background:#2a1a0e"></div></div>`, 1180, 130);
  tl.set(shop, { opacity: 0, rotationY: -40, transformPerspective: 1600, x: 200 }, 0); tl.to(shop, { opacity: 1, rotationY: -12, x: 0, duration: .6, ease: 'power3.out' }, W('P1', 'brothers') - .2); cue(W('P1', 'brothers') - .2, 'whoosh', .4, .6);
  tl.to(shop, { scale: 1.06, duration: .2, yoyo: true, repeat: 1 }, W('P1', 'grocers'));
  const led = at(host, `<div class="paper" style="position:relative;width:600px;height:400px;padding:34px 40px;background:#efe3c4"><div class="anton" style="font-size:40px;color:#5a3a1e;letter-spacing:4px">CUSTOMER LEDGER</div><div class="rows" style="margin-top:20px"></div></div>`, 560, 470);
  tl.set(led, { opacity: 0, y: 80, rotation: -3 }, 0); tl.to(led, { opacity: 1, y: 0, rotation: -2, duration: .45, ease: 'back.out(1.4)' }, W('P1', 'lists') - .2); cue(W('P1', 'lists') - .1, 'paper', .5);
  const rows = led.querySelector('.rows');
  const L = [['MR. HALE', 'PAYS', GRN, 'pays'], ['MRS. DUNN', 'PAYS', GRN, 'time'], ['J. PRATT', 'LATE', RED, 'who'], ['T. COBB', 'NEVER', RED, "doesn't"]];
  L.forEach(([n, v, c, w], i) => { const t = w === 'who' ? W('P1', 'who', 15) : W('P1', w); dline(rows, `${n} <span style="color:#a08a60">·········</span> <b style="color:${c === GRN ? '#1f7a3a' : '#b3262e'}">${v} ${c === GRN ? '✓' : '✗'}</b>`, t - .05, 'font-size:32px;margin-bottom:10px'); });
  // P1c: the lists sell → Retail Credit
  const tSell = W('P1c', 'sell');
  tl.to([yr, ...bro, pin], { opacity: .2, duration: .4 }, tSell - .3);
  tl.to(led, { x: -360, y: 40, scale: .7, duration: .5, ease: 'power3.inOut' }, tSell - .3);
  for (let i = 0; i < 5; i++) {
    const c = at(host, `<div class="paper" style="width:150px;height:96px;background:#efe3c4;padding:12px"><div style="height:8px;background:#c9b98f;margin:8px 0"></div><div style="height:8px;background:#c9b98f;margin:8px 0;width:70%"></div><div style="height:8px;background:#c9b98f;width:85%"></div></div>`, 500, 640);
    tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .1 }, tSell + i * .1);
    tl.to(c, { x: 520 + i * 160, y: -60 + (i % 2) * 60, rotation: (i - 2) * 8, duration: .6, ease: 'power3.out' }, tSell + i * .1);
    const coin = at(host, A.coin(56), 1070 + i * 160, 540 + (i % 2) * 60); pop(coin, tSell + .5 + i * .1, .3);
    cue(tSell + .5 + i * .1, 'coins', .25, -.6 + i * .3);
  }
  const sign = at(host, `<div style="position:relative;padding:26px 60px;border-radius:16px;background:linear-gradient(180deg,#4a2a12,#2a170a);border:8px solid #b8892e;box-shadow:0 30px 60px rgba(0,0,0,.6)"><div class="anton" style="font-size:96px;color:#ffd27a;letter-spacing:8px;text-shadow:0 4px 0 #6b4320">RETAIL CREDIT CO.</div><div class="mono" style="font-size:26px;color:#e8c98a;text-align:center;margin-top:6px;letter-spacing:8px">EST. 1899 · ATLANTA</div></div>`, 960, 120);
  center(sign); tl.set(sign, { opacity: 0, rotationX: -100, transformOrigin: '50% 0%', transformPerspective: 1400 }, 0);
  tl.to(sign, { opacity: 1, rotationX: 0, duration: .9, ease: 'elastic.out(1,.5)' }, W('P1c', 'retail') - .2); cue(W('P1c', 'retail') - .1, 'creak', .6);
  tl.to(shop, { opacity: 0, duration: .3 }, W('P1c', 'retail') - .3);
  const mag = at(host, `<svg viewBox="0 0 160 160" style="width:200px;height:200px"><circle cx="64" cy="64" r="50" fill="rgba(191,224,255,.25)" stroke="#e8c98a" stroke-width="12"/><rect x="98" y="104" width="22" height="64" rx="10" fill="#6b4320" transform="rotate(-45 109 136)"/></svg>`, 980, 470);
  tl.set(mag, { opacity: 0 }, 0); tl.to(mag, { opacity: 1, duration: .2 }, W('P1c', 'find') - .2); tl.fromTo(mag, { x: 0, y: 0 }, { x: 560, y: 60, duration: 1.4, ease: 'sine.inOut', immediateRender: false }, W('P1c', 'find') - .2);
  stampOn(host, 'TRUSTED?', 'gold', 1330, 650, W('P1c', 'trusted') - .05, -10, 64);
  cam(id, { z: 1.05, x: -16 });
}

// p2: investigators ask your neighbors, landlord, boss → 1968 car insurance → 7,000 investigators, 42 million files
{
  const id = 'p2', host = sc(id); through(id); chip(id, 'THE INVESTIGATORS', 1);
  const street = at(host, `<div style="width:1920px;height:16px;background:#2a1a0e"></div>`, 0, 790);
  const B = [['neighbors', A.house(330, '#c98a4a', '#ffe9a8'), 160, 'Does he pay on time?'], ['landlord', A.building(230, '#8a6a4a', 6), 820, 'Ever late on rent?'], ['boss', `<div style="text-align:center">${A.building(280, '#6a5a7a', 4)}</div>`, 1440, 'Is he reliable?']];
  const bl = B.map(([w, art, x, q], i) => {
    const e = at(host, art, x, 790, 'transform-origin:50% 100%'); tl.set(e, { yPercent: -100, opacity: .6, filter: 'brightness(.6)' }, 0);
    tl.to(e, { opacity: 1, filter: 'brightness(1.15)', duration: .3 }, W('P2', w) - .1); cue(W('P2', w), 'ding', .35, -.6 + i * .6);
    bubble(host, q, x + 40, 230 + (i === 1 ? -40 : 0), W('P2', w) + .05, { size: 32 });
    return e;
  });
  const inv = at(host, A.hat(150, '#140c06'), -200, 520);
  tl.to(inv, { x: 340, duration: 1.2, ease: 'power2.out' }, W('P2', 'sending') - .2);
  tl.to(inv, { x: 900, duration: .7, ease: 'power2.inOut' }, W('P2', 'landlord') - .6);
  tl.to(inv, { x: 1480, duration: .7, ease: 'power2.inOut' }, W('P2', 'boss') - .6);
  tl.to(inv, { y: -8, duration: .2, yoyo: true, repeat: 9, ease: 'sine.inOut' }, W('P2', 'sending') - .2);
  cue(W('P2', 'sending') - .2, 'slide', .4, -.6);
  // P2b: 1968, car insurance, a stranger calls your neighbour
  const t68 = V('P2b') - .15;
  tl.to([...bl, street, inv], { opacity: 0, y: 60, duration: .35 }, t68);
  tl.to(host.querySelectorAll('.pill, [style*="border-radius:26px"]'), { opacity: 0, duration: .25 }, t68);
  const cal = at(host, `<div style="width:260px;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div class="anton" style="background:${RED};color:#fff;font-size:40px;text-align:center;padding:10px">MAY</div><div class="big" style="background:#f5f1e6;color:#1a1208;font-size:72px;text-align:center;padding:30px 0">1968</div></div>`, 140, 150);
  tl.set(cal, { opacity: 0, rotationX: -90, transformOrigin: '50% 0%', transformPerspective: 1200 }, 0); tl.to(cal, { opacity: 1, rotationX: 0, duration: .5, ease: 'back.out(1.6)' }, W('P2b', '1968') - .15); cue(W('P2b', '1968'), 'flip', .5, -.7);
  const form = at(host, `<div class="paper" style="position:relative;width:640px;padding:34px 40px;background:#efe3c4"><div class="anton" style="font-size:44px;color:#3a2410;letter-spacing:3px">AUTO INSURANCE</div><div class="mono" style="font-size:24px;color:#7a5a24;margin-top:6px">APPLICATION · FORM 7-B</div>
    <div style="margin-top:26px;font:700 30px/2 'JetBrains Mono';color:#3a2410">NAME ............ J. DOE<br>VEHICLE ......... 1966 SEDAN<br>RISK ............ <span class="rk" style="color:#b3262e">PENDING</span></div></div>`, 470, 150);
  up(form, W('P2b', 'apply') - .15, 50); cue(W('P2b', 'apply'), 'paper', .5);
  const car = at(host, A.car(300, '#4fc3ff'), 560, 600); tl.set(car, { opacity: 0, x: -400 }, 0); tl.to(car, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, W('P2b', 'car') - .15); cue(W('P2b', 'car') - .1, 'swoosh', .5, -.3);
  const str = at(host, A.hat(150, '#140c06'), 1250, 380); up(str, W('P2b', 'stranger') - .2, 60);
  const ph = at(host, A.phoneOld(170, '#1a1a1a'), 1420, 640); pop(ph, W('P2b', 'called') - .2);
  tl.to(ph, { rotation: 8, duration: .05, yoyo: true, repeat: 9 }, W('P2b', 'called')); cue(W('P2b', 'called'), 'buzz', .4, .6);
  const nb = at(host, A.house(230, '#c98a4a'), 1640, 560); up(nb, W('P2b', 'neighbor') - .2, 40);
  const cord = at(host, `<svg viewBox="0 0 300 120" style="width:300px;height:120px;overflow:visible"><path d="M0,60 C60,0 100,120 160,60 S260,0 300,60" fill="none" stroke="${CREAM}" stroke-width="5" stroke-dasharray="10 8"/></svg>`, 1500, 560);
  tl.set(cord, { opacity: 0 }, 0); tl.to(cord, { opacity: .8, duration: .3 }, W('P2b', 'neighbor'));
  bubble(host, '“How much does he <span style="color:#b3262e">drink?</span>”', 1180, 170, W('P2b', 'ask') - .05, { size: 40 });
  tl.set(form.querySelector('.rk'), { textContent: 'PENDING' }, 0); tl.set(form.querySelector('.rk'), { textContent: 'HIGH ✗' }, W('P2b', 'drink') + .1);
  ring(host, 780, 395, 280, 90, W('P2b', 'drink') + .1);
  // P3: the wall of files and the counters
  const tW = V('P3') - .2;
  tl.to([cal, form, car, str, ph, nb, cord], { opacity: 0, duration: .3 }, tW);
  tl.to(host.querySelectorAll('[style*="border-radius:26px"]'), { opacity: 0, duration: .25 }, tW);
  const wall = div('abs', host, '', 'left:-200px;top:150px;width:2600px;height:640px;transform-style:preserve-3d');
  for (let r = 0; r < 4; r++) for (let q = 0; q < 16; q++) div('abs', wall, `<div style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:70px;height:16px;border-radius:8px;background:#b8a27a"></div><div class="mono" style="position:absolute;left:12px;top:10px;font-size:15px;color:#4a3214">${String.fromCharCode(65 + (q + r * 5) % 26)}–${String.fromCharCode(66 + (q * 3 + r) % 25)}</div>`, `left:${q * 160}px;top:${r * 160}px;width:150px;height:150px;border-radius:8px;background:linear-gradient(180deg,#8a6a40,#5a4224);border:3px solid #3a2810;box-shadow:inset 0 2px 0 rgba(255,255,255,.2)`);
  tl.set(wall, { opacity: 0, rotationY: 32, transformPerspective: 1500, z: -300, x: 300 }, 0);
  tl.to(wall, { opacity: .9, duration: .5 }, tW); tl.to(wall, { x: -500, duration: VE('P3') - tW + .6, ease: 'sine.inOut' }, tW);
  cue(tW, 'rumble', .4, 0, { dur: 1.2 });
  const c1 = bigCount(host, 140, 300, 'INVESTIGATORS', 110, AMBER, W('P3', '7000') - .1, .9, 0, 7000, commas);
  const hats = at(host, `<div style="display:grid;grid-template-columns:repeat(20,34px);gap:6px">${Array(60).fill(A.hat(34, '#140c06', true)).join('')}</div>`, 140, 560);
  tl.set(hats, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, 0); tl.to(hats, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: .9, ease: 'power2.out' }, W('P3', '7000'));
  const c2 = bigCount(host, 860, 300, 'FILES ON PEOPLE', 110, RED, W('P3', '42') - .1, 1.1, 0, 42e6, commas);
  cue(W('P3', 'people'), 'impact', .5);
  cam(id, { z: 1.06, y: -10 });
}

// p3: what the files covered + the quota for bad news
{
  const id = 'p3', host = sc(id); through(id); chip(id, 'WHAT THEY WROTE', 1);
  const F = folder(host, 200, 170, 940, 640, 'FILE #42-118-907', '');
  tl.set(F.f, { rotationX: 14, rotationY: 6 }, 0);
  F.open(S(id) + .2, .8);
  const pol0 = at(host, `<div style="position:relative;width:300px;padding:18px 18px 60px;background:#f5f1e6;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div style="height:250px;background:linear-gradient(180deg,#4a3a2a,#2a1e14);display:flex;align-items:flex-end;justify-content:center">${A.person(150, '#120c06')}</div><div class="serif" style="position:absolute;left:0;bottom:12px;width:100%;text-align:center;font-size:32px;color:#3a2410">J. Doe, 1968</div><i style="position:absolute;left:130px;top:-16px;width:40px;height:40px;border-radius:50%;background:${RED};box-shadow:0 4px 8px rgba(0,0,0,.5)"></i></div>`, 1380, 470);
  tl.set(pol0, { opacity: 0, rotation: 14, y: -60 }, 0); tl.to(pol0, { opacity: 1, rotation: 6, y: 0, duration: .5, ease: 'back.out(1.6)' }, S(id) + .6); cue(S(id) + .9, 'thud', .4, .6);
  const pg = F.page;
  div('', pg, `<div class="anton" style="font-size:44px;color:#3a2410;letter-spacing:3px;margin-bottom:24px">SUBJECT: J. DOE</div>`);
  dline(pg, 'MARRIAGE ..... "troubled"', W('P4', 'marriage') - .05);
  dline(pg, 'DRINKING ..... "heavy, per neighbor"', W('P4', 'drinking') - .05);
  dline(pg, 'PRIVATE LIFE . <span style="background:#2a2418;color:#2a2418">████████████</span>', W('P4', 'sex') - .05);
  const pol = dline(pg, 'POLITICS ..... <span style="color:#b3262e">"radical?"</span>', W('P4', 'politics') - .05);
  ring(host, 540, 455, 280, 90, W('P4', 'politics') + .3);
  // quota board
  const qb = at(host, `<div class="card" style="position:relative;width:560px;padding:36px 40px"><div class="mono" style="font-size:26px;color:${CREAM};letter-spacing:3px">WEEKLY QUOTA</div><div class="anton" style="font-size:66px;color:#fff;margin-top:10px">NEGATIVE REPORTS</div>
    <div style="display:flex;gap:16px;margin-top:30px">${[0, 1, 2, 3, 4].map(i => `<i class="q${i}" style="display:block;width:80px;height:80px;border-radius:14px;border:4px solid rgba(255,255,255,.4)"></i>`).join('')}</div>
    <div class="mono qn" style="font-size:40px;color:${RED};margin-top:24px">0 / 5</div></div>`, 1240, 170);
  tl.set(qb, { opacity: 0, x: 300 }, 0); tl.to(qb, { opacity: 1, x: 0, duration: .45, ease: 'power3.out' }, W('P5', 'quotas') - .3); cue(W('P5', 'quotas') - .3, 'whoosh', .4, .6);
  for (let i = 0; i < 5; i++) { const t = W('P5', 'negative') + i * .16; tl.to(qb.querySelector('.q' + i), { backgroundColor: RED, borderColor: RED, duration: .12 }, t); tl.set(qb.querySelector('.qn'), { textContent: `${i + 1} / 5` }, t); cue(t, 'tick', .3, .6, { f: 1200 + i * 150 }); }
  tl.set(qb.querySelector('.qn'), { textContent: '0 / 5' }, 0);
  // no right to see it
  const tNo = W('P5', 'no');
  F.close(tNo - .1, .45);
  const lk = at(host, A.lock(150, GOLD), 600, 380); pop(lk, tNo + .35, .3); cue(tNo + .4, 'lock', .7);
  const eye = at(host, `<svg viewBox="0 0 300 180" style="width:260px;height:156px"><path d="M10,90 Q150,-20 290,90 Q150,200 10,90 Z" fill="${CREAM}"/><circle cx="150" cy="90" r="46" fill="#1a1208"/><path d="M30,170 L270,10" stroke="${RED}" stroke-width="18" stroke-linecap="round"/></svg>`, 1390, 620);
  pop(eye, W('P5', 'see') - .1, .4); tl.to(pol0, { opacity: .25, duration: .3 }, W('P5', 'see') - .2); cue(W('P5', 'see'), 'slash', .5, .6);
  cam(id, { z: 1.05, x: 10, rx: 3 });
}

// p4: computers → Congress → FCRA 1970 → Retail Credit becomes Equifax
{
  const id = 'p4', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE LAW', 1);
  const main = at(host, `<div style="display:flex;gap:14px">${[0, 1, 2].map(() => `<div style="width:170px;height:420px;border-radius:12px;background:linear-gradient(180deg,#c9c3b0,#9a947f);border:4px solid #5a5446;padding:20px 16px">
    <div style="display:flex;gap:12px;justify-content:center"><i class="reel" style="display:block;width:62px;height:62px;border-radius:50%;border:8px solid #2a2418;background:radial-gradient(circle,#2a2418 22%,#e8e2cf 24%)"></i><i class="reel" style="display:block;width:62px;height:62px;border-radius:50%;border:8px solid #2a2418;background:radial-gradient(circle,#2a2418 22%,#e8e2cf 24%)"></i></div>
    <div style="margin-top:30px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${Array(16).fill('<i style="display:block;height:14px;border-radius:7px;background:#ffb347"></i>').join('')}</div></div>`).join('')}</div>`, 160, 230);
  tl.set(main, { opacity: 0, y: 80 }, 0); tl.to(main, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' }, W('P6', 'planning') - .2); cue(W('P6', 'planning'), 'clunk', .5, -.6);
  main.querySelectorAll('.reel').forEach((r, i) => tl.to(r, { rotation: 720 * (i % 2 ? 1 : -1), duration: 4, ease: 'none' }, W('P6', 'planning')));
  for (let i = 0; i < 8; i++) { const f = at(host, `<div style="width:90px;height:64px;border-radius:6px;background:#d9b779;border:3px solid #a07a3a"></div>`, 1000 + (i % 4) * 80, 200 + Math.floor(i / 4) * 300); tl.set(f, { opacity: 0 }, 0); tl.to(f, { opacity: 1, duration: .1 }, W('P6', 'computers') - .3 + i * .07); tl.to(f, { x: -700 + (i % 4) * -40, y: 160 - Math.floor(i / 4) * 200, scale: .3, rotation: 200, duration: .55, ease: 'power2.in' }, W('P6', 'computers') - .3 + i * .07); tl.to(f, { opacity: 0, duration: .1 }, W('P6', 'computers') + .25 + i * .07); }
  cue(W('P6', 'computers') - .2, 'stream', .4, 0, { dur: .8 });
  const dome = at(host, A.dome(560, '#f1ead6'), 1180, 200); tl.set(dome, { opacity: 0, y: 200 }, 0); tl.to(dome, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, W('P6', 'congress') - .25); cue(W('P6', 'congress') - .2, 'riser', .3, .5, { dur: .5 });
  const gv = at(host, A.gavel(300), 880, 420); tl.set(gv, { opacity: 0, rotation: -40, transformOrigin: '80% 90%' }, 0);
  tl.to(gv, { opacity: 1, duration: .1 }, W('P6', 'stepped') - .3); tl.to(gv, { rotation: 8, duration: .2, ease: 'power4.in' }, W('P6', 'stepped') - .2); tl.to(gv, { rotation: 0, duration: .3 }, W('P6', 'stepped'));
  cue(W('P6', 'stepped'), 'clang', .8); R.shake(W('P6', 'stepped'), 16, .35); punch(W('P6', 'stepped'));
  // P6b: the Fair Credit Reporting Act, 1970
  const t70 = V('P6b') - .2;
  tl.to([main, dome, gv], { opacity: 0, duration: .3 }, t70);
  const y70 = at(host, `<div class="serif" style="font-size:220px;color:#f1e4c8">1970</div>`, 120, 300); up(y70, W('P6b', '1970') - .1, 60);
  const doc = at(host, `<div class="paper" style="position:relative;width:860px;padding:44px 56px;background:#f5f1e6"><div class="mono" style="font-size:24px;color:#7a5a24;letter-spacing:3px">PUBLIC LAW 91-508 · TITLE VI</div><div class="anton" style="font-size:78px;color:#1a2347;margin-top:10px;line-height:1.05">FAIR CREDIT<br>REPORTING ACT</div><div class="ck" style="margin-top:34px"></div></div>`, 860, 140);
  tl.set(doc, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, 0); tl.to(doc, { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: .7, ease: 'power2.out' }, W('P6b', 'law') - .2); cue(W('P6b', 'law') - .2, 'paper', .6);
  const ck = doc.querySelector('.ck');
  [['SEE YOUR FILE', 'see'], ["DISPUTE WHAT'S WRONG", 'fight']].forEach(([txt, w]) => { const e = div('', ck, `<b style="display:inline-block;width:56px;height:56px;border-radius:12px;background:#1f7a3a;color:#fff;text-align:center;font:900 40px/56px 'Unbounded';margin-right:20px">✓</b>${txt}`, `font:700 46px/1 'Space Grotesk';color:#1a2347;margin:16px 0;display:flex;align-items:center`); tl.set(e, { opacity: 0, x: -30 }, 0); tl.to(e, { opacity: 1, x: 0, duration: .3, ease: 'back.out(2)' }, W('P6b', w) - .1); cue(W('P6b', w), 'ding', .45, .4); });
  // P7: the rename
  const tR = V('P7') - .2;
  tl.to([y70, doc], { opacity: 0, y: -40, duration: .3 }, tR);
  const fl = flap(host, 380, 300, 'RETAIL CREDIT', '   EQUIFAX   ', W('P7', 'changed'), 130);
  tl.set(fl, { opacity: 0 }, 0); tl.to(fl, { opacity: 1, duration: .3 }, tR + .1);
  const eq = at(host, A.equifax(560), 960, 560); center(eq); pop(eq, W('P7', 'equifax') - .05, .4); cue(W('P7', 'equifax'), 'impact', .6);
  ring(host, 640, 520, 640, 200, W('P7', 'remember') - .05);
  const pinr = at(host, `<div class="pill" style="position:relative;background:${RED};color:#fff;font-size:34px">⚑ REMEMBER THIS NAME</div>`, 1160, 760); pop(pinr, W('P7', 'name', 14) - .1);
  const back = at(host, `<div class="anton" style="font-size:60px;color:${GOLD}">IT COMES BACK →</div>`, 220, 770); fromL(back, W('P7', 'comes') - .1, -150);
  cam(id, { z: 1.05, x: -12 });
}

/* ================= CHAPTER 2: TURNING PEOPLE INTO MATH ================= */
propLayer('blueprint', [`<div class="serif" style="font-size:90px;color:#bfe0ff">ƒ(x)</div>`, `<div class="mono" style="font-size:70px;color:#bfe0ff">%</div>`, `<svg viewBox="0 0 100 100" style="width:100px"><circle cx="50" cy="50" r="30" fill="none" stroke="#bfe0ff" stroke-width="12" stroke-dasharray="14 10"/></svg>`, A.env(100, '#cfe3ff', '#7aa7d8')], S('f0'), E('f4'), 16, .16);
chapterCard('f0', 2, 'TURNING PEOPLE INTO MATH', '1956 — 1995', `<div class="serif" style="font-size:210px;color:#bfe0ff;text-shadow:0 0 40px #4fc3ff">ƒ(x)</div>`, SKY, 'blueprint');

// f1: gossip is slow → the loan officer decides → Fair & Isaac's formula
{
  const id = 'f1', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'BEFORE THE SCORE', 2);
  const gs = ['“I heard he gambles…”', '“His wife told my wife…”', '“Seems shifty.”'].map((q, i) => bubble(host, q, 140 + i * 90, 160 + i * 140, W('F1', 'gossip') - .2 + i * .18, { size: 34 }));
  const snail = at(host, `<svg viewBox="0 0 260 150" style="width:260px;height:150px"><path d="M20,130 Q40,110 120,112 L240,112 Q256,112 250,128 Z" fill="#c9a26a"/><circle cx="110" cy="80" r="52" fill="#8a5a2b"/><path d="M110,80 m-30,0 a30,30 0 1,0 60,0 a20,20 0 1,0 -40,0" fill="none" stroke="#5a3418" stroke-width="7"/><path d="M220,112 L230,60 M240,112 L256,64" stroke="#c9a26a" stroke-width="7" stroke-linecap="round"/><rect x="70" y="20" width="80" height="40" rx="4" fill="#d9b779" stroke="#a07a3a" stroke-width="3" transform="rotate(-8 110 40)"/></svg>`, 160, 650);
  tl.set(snail, { opacity: 0 }, 0); tl.to(snail, { opacity: 1, duration: .2 }, W('F1', 'slow') - .2); tl.to(snail, { x: 260, duration: 4, ease: 'none' }, W('F1', 'slow') - .2); cue(W('F1', 'slow'), 'boing', .3, -.5);
  const sw = at(host, `<svg viewBox="0 0 200 220" style="width:220px;height:242px"><rect x="86" y="0" width="28" height="22" rx="6" fill="${CREAM}"/><circle cx="100" cy="124" r="88" fill="#0b1a33" stroke="${CREAM}" stroke-width="12"/><g class="hand"><rect x="96" y="56" width="8" height="72" rx="4" fill="${GOLD}"/></g><circle cx="100" cy="124" r="10" fill="${GOLD}"/></svg>`, 1200, 200);
  pop(sw, W('F1', 'faster') - .2, .4); tl.to(sw.querySelector('.hand'), { rotation: 720, svgOrigin: '100 124', duration: 1.6, ease: 'power2.inOut' }, W('F1', 'faster') - .1); cue(W('F1', 'faster'), 'swoosh', .5, .5);
  const tagc = at(host, `<div style="position:relative;padding:20px 34px;border-radius:16px;background:${GOLD};color:#120d04;font:900 64px/1 'Unbounded'">$$$<i style="position:absolute;left:12px;right:12px;top:50%;height:10px;background:${RED};transform:rotate(-12deg)"></i></div>`, 1520, 470);
  pop(tagc, W('F1', 'cheaper') - .15, .4); cue(W('F1', 'cheaper'), 'slash', .5, .7);
  // F1b: the loan officer
  const tLO = V('F1b') - .2;
  tl.to([...gs, snail, sw, tagc], { opacity: 0, duration: .3 }, tLO);
  const desk = box3d(host, { x: 560, y: 560, w: 800, h: 220, d: 140, top: '#7a5634', front: 'linear-gradient(180deg,#5a3a1e,#3a2410)', side: '#4a2e16' });
  tl.set(desk, { rotationX: -12, transformPerspective: 1800, opacity: 0, y: 120 }, 0); tl.to(desk, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' }, tLO + .1);
  const off = at(host, A.hat(230, '#0b1a33'), 840, 230); up(off, W('F1b', 'officer') - .25, 60);
  const plate = at(host, `<div style="padding:10px 26px;border-radius:8px;background:linear-gradient(180deg,#d8b45a,#a07a2a);font:700 30px/1 'JetBrains Mono';color:#2a1a08">LOAN OFFICER</div>`, 960, 600); center(plate); up(plate, W('F1b', 'officer'), 20);
  const items = [['clothes', `<svg viewBox="0 0 120 110" style="width:120px;height:110px"><path d="M30,10 L50,4 Q60,20 70,4 L90,10 L116,34 L100,52 L92,44 L92,106 L28,106 L28,44 L20,52 L4,34 Z" fill="#ff8fb1"/></svg>`, 'CLOTHES'], ['neighborhood', A.house(130, '#9a7a5a'), 'NEIGHBORHOOD'], ['last', `<div style="width:170px;border-radius:12px;overflow:hidden;background:#fff"><div style="background:#c8102e;color:#fff;font:700 18px/1 'Space Grotesk';padding:8px;text-align:center">HELLO my name is</div><div class="serif" style="color:#111;font-size:40px;text-align:center;padding:12px">_____</div></div>`, 'LAST NAME']];
  items.forEach(([w, art, lbl], i) => {
    const c = at(host, `<div class="card" style="position:relative;width:300px;height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">${art}<div class="mono" style="font-size:26px;color:${CREAM}">${lbl}</div></div>`, 140, 110 + i * 260);
    tl.set(c, { opacity: 0, x: -300 }, 0); tl.to(c, { opacity: 1, x: 0, duration: .45, ease: 'power3.out' }, W('F1b', w) - .15); cue(W('F1b', w) - .1, 'swoosh', .4, -.7);
  });
  stampOn(host, 'DENIED', 'red', 1300, 380, W('F1b', 'no', 20) - .05, -10, 110);
  // F2: 1956, Bill Fair and Earl Isaac, a formula
  const t56 = V('F2') - .2;
  tl.to(host.querySelectorAll('.card, .stamp'), { opacity: 0, duration: .3 }, t56);
  tl.to([desk, off, plate], { opacity: 0, duration: .3 }, t56);
  const y56 = at(host, `<div class="big glow" style="font-size:180px;--acc:${SKY}">1956</div>`, 140, 150); up(y56, W('F2', '1956') - .1, 60);
  const port = (name, role, icon, x, w) => { const p = at(host, `<div class="card" style="position:relative;width:420px;height:300px;display:flex;align-items:center;gap:24px;padding:30px"><div>${A.person(110, '#bfe0ff')}</div><div><div class="anton" style="font-size:56px;color:#fff">${name}</div><div class="mono" style="font-size:24px;color:${SKY};margin-top:10px">${role}</div><div style="margin-top:16px">${icon}</div></div></div>`, x, 410); tl.set(p, { opacity: 0, rotationY: 80, transformPerspective: 1400 }, 0); tl.to(p, { opacity: 1, rotationY: 0, duration: .45, ease: 'back.out(1.5)' }, W('F2', w) - .2); cue(W('F2', w) - .1, 'flip', .4, x < 800 ? -.6 : -.1); return p; };
  const gear = `<svg class="gear" viewBox="0 0 80 80" style="width:70px;height:70px"><circle cx="40" cy="40" r="22" fill="none" stroke="${GOLD}" stroke-width="12" stroke-dasharray="10 7"/><circle cx="40" cy="40" r="8" fill="${GOLD}"/></svg>`;
  const p1 = port('BILL FAIR', 'ENGINEER', gear, 140, 'fair'); const p2 = port('EARL ISAAC', 'MATHEMATICIAN', `<div class="serif" style="font-size:64px;color:${GOLD};line-height:1">∑ π</div>`, 600, 'isaac');
  tl.to(p1.querySelector('.gear'), { rotation: 360, svgOrigin: '40 40', duration: 4, ease: 'none' }, W('F2', 'fair'));
  // the formula machine: people in, numbers out
  const tF = W('F2', 'radical') - .2;
  const bp = at(host, `<div style="position:relative;width:560px;height:620px;border:3px solid rgba(191,224,255,.5);border-radius:12px;background:repeating-linear-gradient(0deg,rgba(191,224,255,.12) 0 2px,transparent 2px 40px),repeating-linear-gradient(90deg,rgba(191,224,255,.12) 0 2px,transparent 2px 40px)">
    <svg viewBox="0 0 560 620" style="position:absolute;inset:0;width:560px;height:620px"><g fill="none" stroke="#bfe0ff" stroke-width="4" stroke-dasharray="12 8"><path class="bpp" d="M80,420 A200,200 0 0 1 480,420" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path d="M280,420 L400,280"/><circle cx="280" cy="420" r="16"/></g></svg>
    <div class="mono" style="position:absolute;left:24px;bottom:22px;font-size:22px;color:#bfe0ff">FAIR, ISAAC &amp; CO. · DRAWING 001</div></div>`, 1220, 160);
  tl.set(bp, { opacity: 0, rotationY: -30, transformPerspective: 1600 }, 0); tl.to(bp, { opacity: 1, rotationY: -8, duration: .5, ease: 'power3.out' }, V('F2') + .2);
  tl.to(bp.querySelector('.bpp'), { attr: { 'stroke-dashoffset': 0 }, duration: 1.4, ease: 'power2.inOut' }, V('F2') + .4); cue(V('F2') + .4, 'paper', .4, .6);
  tl.to(bp, { opacity: 0, duration: .3 }, tF - .1);
  const mach = at(host, `<div style="position:relative;width:520px;height:620px"><svg viewBox="0 0 520 620" style="position:absolute;inset:0;width:520px;height:620px"><path d="M40,40 L480,40 L320,300 L320,400 L200,400 L200,300 Z" fill="rgba(79,195,255,.18)" stroke="${SKY}" stroke-width="6"/><rect x="130" y="400" width="260" height="140" rx="20" fill="#0b2a52" stroke="${SKY}" stroke-width="6"/></svg>
    <div class="serif" style="position:absolute;left:0;top:130px;width:520px;text-align:center;font-size:62px;color:#fff">P(repay) = ƒ(x)</div><div class="mono out" style="position:absolute;left:130px;top:430px;width:260px;text-align:center;font-size:84px;color:${GRN}">···</div></div>`, 1240, 170);
  tl.set(mach, { opacity: 0, scale: .8 }, 0); tl.to(mach, { opacity: 1, scale: 1, duration: .45, ease: 'back.out(1.6)' }, tF); cue(tF, 'clunk', .6, .6);
  for (let i = 0; i < 6; i++) { const p = at(host, A.person(50, '#fff4d6'), 1310 + (i % 3) * 140, 70, `color:${CREAM}`); tl.set(p, { opacity: 0 }, 0); tl.to(p, { opacity: 1, duration: .1 }, W('F2', 'decide') - .4 + i * .15); tl.to(p, { y: 300, x: (1500 - (1310 + (i % 3) * 140)) * .8, scale: .4, duration: .5, ease: 'power2.in' }, W('F2', 'decide') - .4 + i * .15); tl.to(p, { opacity: 0, duration: .1 }, W('F2', 'decide') + .05 + i * .15); }
  const outn = mach.querySelector('.out'); ['712', '655', '804', '590', '741'].forEach((v, i) => { tl.set(outn, { textContent: v, color: scoreColor(+v) }, W('F2', 'decide') + i * .3); cue(W('F2', 'decide') + i * .3, 'blip', .3, .6, { f: 1000 + i * 120 }); });
  tl.set(outn, { textContent: '···' }, 0);
  const coin = coin3d(host, 1440, 760, 90, W('F2', 'back') - .3, 2);
  cam(id, { z: 1.05, y: -12 });
}

// f2: fifty letters, forty-nine never answered, one did → an empire
{
  const id = 'f2', host = sc(id); through(id); chip(id, '50 LETTERS', 2);
  const tW = W('F2b', 'wrote') - .1, envs = [];
  for (let i = 0; i < 50; i++) {
    const q = i % 10, r = Math.floor(i / 10), x = 230 + q * 150, y = 170 + r * 120;
    const e = at(host, A.env(110, '#e9f2ff', '#7aa7d8'), 905, 700);
    tl.set(e, { opacity: 0, scale: .3 }, 0);
    tl.to(e, { opacity: 1, scale: 1, x: x - 905, y: y - 700, rotation: (q - 5) * 2, duration: .5, ease: 'power3.out' }, tW + i * .025);
    envs.push(e);
  }
  cue(tW, 'paper', .5); cue(tW + .4, 'stream', .3, 0, { dur: .8 });
  const cnt = at(host, `<div class="pill" style="position:relative;background:${SKY};color:#04121f">50 BIGGEST LENDERS</div>`, 960, 790); center(cnt); pop(cnt, W('F2b', 'fifty') - .05);
  const tNo = W('F2b', 'forty-nine');
  envs.forEach((e, i) => { if (i !== 27) tl.to(e, { opacity: .12, filter: 'grayscale(1)', duration: .25 }, tNo + (i % 10) * .02); });
  const nr = at(host, `<div class="anton" style="font-size:120px;color:${RED};text-shadow:0 8px 0 rgba(0,0,0,.5)">49 × NO REPLY</div>`, 960, 330); center(nr); slam(nr, W('F2b', 'never') - .05); cue(W('F2b', 'never') + .15, 'impact', .6);
  tl.set(cnt.firstChild, { textContent: '50 BIGGEST LENDERS' }, 0);
  // F2c: one did
  const tOne = V('F2c');
  tl.to(nr, { opacity: 0, duration: .25 }, tOne - .1); tl.to(cnt, { opacity: 0, duration: .2 }, tOne - .1);
  const one = envs[27];
  tl.to(one, { x: 960 - 55 - 905, y: 300 - 700, scale: 2.6, rotation: 0, duration: .6, ease: 'power3.inOut' }, tOne); tl.to(one, { filter: 'drop-shadow(0 0 30px #ffc640)', duration: .3 }, tOne + .3);
  cue(tOne + .2, 'ding', .6);
  const yes = at(host, `<div class="paper" style="position:relative;padding:22px 34px;background:#fffaf0"><div class="serif" style="font-size:48px;color:#1a2347">“Let's talk.”</div><div class="mono" style="font-size:20px;color:#7a6a3a;margin-top:6px">— the one reply, 1958</div></div>`, 1150, 330);
  pop(yes, W('F2c', 'reply') - .2, .5);
  const tE = W('F2c', 'empire') - .3;
  tl.to([one, yes], { opacity: 0, y: -60, duration: .3 }, tE - .1);
  for (let i = 0; i < 9; i++) { const h = 3 + (i * 7) % 6; const b = at(host, A.building(150, ['#4f7ac9', '#3a62b0', '#5a8ad8'][i % 3], h), 180 + i * 175, 790, 'transform-origin:50% 100%'); tl.set(b, { yPercent: -100, scaleY: 0 }, 0); tl.to(b, { scaleY: 1, duration: .45, ease: 'back.out(1.4)' }, tE + Math.abs(4 - i) * .07); }
  cue(tE, 'rumble', .5, 0, { dur: .8 });
  const crown = at(host, A.fico(330), 960, 170); center(crown); pop(crown, tE + .4, .4); cue(tE + .45, 'impact', .6);
  cam(id, { z: 1.05, rx: 3 });
}

// f3: 1989 — the FICO score, from 300 to 850
{
  const id = 'f3', host = sc(id); through(id); chip(id, '1989', 2);
  const crt = at(host, `<div style="width:620px;height:470px;border-radius:30px;background:#cfc6b0;padding:34px;box-shadow:0 40px 80px rgba(0,0,0,.5)"><div class="scr" style="width:100%;height:100%;border-radius:22px;background:radial-gradient(ellipse at 50% 40%,#0c3a22,#04140b);padding:30px 34px;font:700 34px/1.5 'JetBrains Mono';color:#3dff9a;text-shadow:0 0 10px #3dff9a"></div></div>`, 130, 190);
  tl.set(crt, { opacity: 0, rotationY: 30, transformPerspective: 1600 }, 0); tl.to(crt, { opacity: 1, rotationY: 12, duration: .5, ease: 'power3.out' }, S(id) + .05); cue(S(id) + .1, 'clunk', .5, -.6);
  const scr = crt.querySelector('.scr');
  [['> BOOT 1989', V('F3')], ['> LOAD FORMULA', W('F3', 'launched')], ['> GENERAL PURPOSE', W('F3', 'general-purpose')], ['> FICO SCORE  OK_', W('F3', 'fico')]].forEach(([s, t]) => { const l = div('', scr, s); tl.set(l, { opacity: 0 }, 0); tl.to(l, { opacity: 1, duration: .05 }, t); cue(t, 'key', .3, -.6, { f: 1300 }); });
  const lg = at(host, A.fico(300), 1110, 140); slam(lg, W('F3', 'fico') - .05); cue(W('F3', 'fico') + .15, 'impact', .6, .5);
  const g = gauge(host, 920, 280, 860, { score: 300, label: 'FICO SCORE · 1989' });
  g.show(W('F3', 'score', 9) - .1);
  g.to(W('F4', '300') - .1, 300, .3); g.to(W('F4', '850') - .3, 850, .9, 'power2.out');
  tl.to(g.num, { scale: 1.12, duration: .2, yoyo: true, repeat: 1 }, W('F4', 'one'));
  const op = bubble(host, '“Seems like a nice fella…”', 150, 720, W('F4', 'stranger\'s') - .4, { size: 34 });
  tl.to(op, { scaleY: .02, scaleX: 1.2, opacity: 0, duration: .25, ease: 'power3.in' }, W('F4', 'opinion') + .2); cue(W('F4', 'opinion') + .2, 'crash', .4, -.5);
  g.to(W('F4', 'one') + .2, 712, .8);
  cam(id, { z: 1.05, x: -14 });
}

// f4: 1995 Fannie & Freddie → mortgages → overnight → who gets a home; FICO says 90% of top lenders
{
  const id = 'f4', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE MORTGAGE KEY', 2);
  const sky = div('abs', host, '', 'left:0;top:0;width:1920px;height:1080px;background:linear-gradient(180deg,#0a1a3a,#05081a);opacity:0');
  const y95 = at(host, `<div class="big glow" style="font-size:160px;--acc:${SKY}">1995</div>`, 140, 140); up(y95, W('F5', '1995') - .1, 50);
  const fm = at(host, A.fannie(380), 900, 150); fromL(fm, W('F5', 'fannie') - .1, 300); cue(W('F5', 'fannie'), 'pop', .4, .3);
  const fd = at(host, A.freddie(380), 1360, 150); fromL(fd, W('F5', 'freddie') - .1, 300); cue(W('F5', 'freddie'), 'pop', .4, .6);
  const hs = [0, 1, 2, 3, 4].map(i => { const h = at(host, A.house(250, ['#ffb347', '#ff8fb1', '#9b7bff', '#4fc3ff', '#3dff9a'][i], '#ffe9a8'), 150 + i * 340, 520); up(h, W('F5', 'mortgages') - .3 + i * .08, 60); return h; });
  cue(W('F5', 'mortgages') - .2, 'stack', .4, 0, { dur: .5 });
  const sun = at(host, `<svg viewBox="0 0 120 120" style="width:120px;height:120px"><circle cx="60" cy="60" r="44" fill="${GOLD}"/></svg>`, 200, 360);
  tl.set(sun, { opacity: 0 }, 0); const tN = W('F5', 'overnight') - .3;
  tl.to(sun, { opacity: 1, duration: .2 }, tN); tl.to(sun, { x: 1500, y: -60, duration: 1.1, ease: 'sine.inOut' }, tN); tl.to(sun, { opacity: 0, duration: .25 }, tN + .9);
  tl.to(sky, { opacity: .6, duration: .5 }, tN + .4); tl.to(sky, { opacity: 0, duration: .5 }, tN + 1.2); cue(tN, 'whoosh', .5);
  const verdict = [1, 0, 1, 1, 0];
  hs.forEach((h, i) => { const ok = verdict[i]; const b = at(host, `<div style="padding:10px 20px;border-radius:30px;background:${ok ? GRN : RED};color:#06120a;font:900 30px/1 'Unbounded'">${ok ? 740 + i * 9 : 590 + i * 7} ${ok ? '✓' : '✗'}</div>`, 190 + i * 340, 450); pop(b, W('F5', 'deciding') - .1 + i * .12); cue(W('F5', 'deciding') + i * .12, ok ? 'ding' : 'buzz', .3, -.8 + i * .4); if (!ok) tl.to(h, { opacity: .35, filter: 'grayscale(1)', duration: .3 }, W('F5', 'deciding') + i * .12); });
  const key = at(host, `<svg viewBox="0 0 160 80" style="width:160px;height:80px"><circle cx="40" cy="40" r="30" fill="none" stroke="${GOLD}" stroke-width="14"/><rect x="66" y="34" width="90" height="14" fill="${GOLD}"/><rect x="128" y="44" width="12" height="22" fill="${GOLD}"/><rect x="146" y="44" width="10" height="16" fill="${GOLD}"/></svg>`, 845, 700);
  tl.set(key, { opacity: 0, rotation: -90 }, 0); tl.to(key, { opacity: 1, rotation: 0, duration: .4, ease: 'back.out(2)' }, W('F5', 'home') - .1); cue(W('F5', 'home'), 'lock', .6);
  tl.to(hs[2], { filter: 'drop-shadow(0 0 30px #ffe9a8) brightness(1.2)', duration: .3 }, W('F5', 'home'));
  // F6: 90% of top lenders
  const t90 = V('F6') - .2;
  tl.to([y95, fm, fd, ...hs, key, ...host.querySelectorAll('[style*="border-radius:30px"]')], { opacity: 0, duration: .3 }, t90);
  const banks = [];
  for (let i = 0; i < 10; i++) { const b = at(host, `<div style="position:relative">${A.bank(230, '#e8e2cf')}<div class="fb" style="position:absolute;left:50%;top:-30px;transform:translateX(-50%)">${A.fico(130)}</div></div>`, 140 + (i % 5) * 340, 230 + Math.floor(i / 5) * 300); up(b, t90 + .2 + i * .05, 50); banks.push(b); tl.set(b.querySelector('.fb'), { opacity: 0 }, 0); if (i < 9) { tl.to(b.querySelector('.fb'), { opacity: 1, duration: .15 }, W('F6', '90') + i * .08); cue(W('F6', '90') + i * .08, 'tick', .25, -.8 + (i % 5) * .4, { f: 1500 + i * 60 }); } else tl.to(b, { opacity: .3, duration: .3 }, W('F6', '90') + .7); }
  const n90 = at(host, `<div class="big glow" style="font-size:120px;--acc:${RED}">90%</div>`, 1460, 620); slam(n90, W('F6', '90') - .05); cue(W('F6', '90') + .15, 'impact', .5, .7);
  src(host, 'Source: FICO', W('F6', 'scores'));
  cam(id, { z: 1.05, y: -10 });
}
