/* EXTRAS: narration-matched illustrations layered over the base scenes (window.SCX[id] runs after SC[id]). */
window.SCX = window.SCX || {};
const SVGNS = 'http://www.w3.org/2000/svg';

/* ---------- alarm: a bedroom at 5:59 → 6:00 ---------- */
SCX.alarm = (R, K, h, id) => {
  const { tl, cue, S } = R;
  // window with moonlight and rain beyond
  const win = K.text(h, '', 'left:1310px;top:110px;width:440px;height:270px;border-radius:8px;background:linear-gradient(180deg,#1d2d55,#0b1430);box-shadow:inset 0 0 0 10px #070a12,0 0 80px rgba(90,130,255,.25);overflow:hidden');
  K.text(win, '', 'left:215px;top:0;width:10px;height:270px;background:#070a12');
  K.text(win, '', 'left:0;top:130px;width:440px;height:10px;background:#070a12');
  const moon = K.text(win, '', 'left:300px;top:40px;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#f4f2e6,#b9b6a6);box-shadow:0 0 40px rgba(240,240,220,.55)');
  for (let i = 0; i < 24; i++) { const d = K.text(win, '', `left:${(i * 53) % 440}px;top:${-40 - (i * 37) % 200}px;width:2px;height:26px;background:rgba(190,210,255,.5);transform:rotate(12deg)`); tl.fromTo(d, { y: 0 }, { y: 420, duration: .9 + (i % 5) * .12, ease: 'none', repeat: Math.ceil(R.D(id) / .9), immediateRender: false, data: 'drift' }, S(id)); d.dataset.drift = 1; }
  R.up(win, S(id) + .2, .8, 0);
  // bedside lamp
  const lamp = K.text(h, '<div style="position:absolute;left:30px;top:0;width:110px;height:70px;background:linear-gradient(180deg,#e9c991,#b8894a);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)"></div><div style="position:absolute;left:80px;top:70px;width:10px;height:90px;background:#2a2f3e"></div><div style="position:absolute;left:45px;top:160px;width:80px;height:12px;border-radius:6px;background:#2a2f3e"></div>',
    'left:560px;top:648px;width:170px;height:172px');
  const lg = K.text(h, '', 'left:440px;top:520px;width:420px;height:400px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,200,120,.28),transparent 65%)');
  tl.set([lamp, lg], { opacity: 0 }, 0); tl.to([lamp, lg], { opacity: 1, duration: .6 }, S(id) + .3);
  // 5:59 → 6:00
  const ph = h.querySelector('.phone'), clock = ph.querySelector('.clock');
  const t6 = WT(R, 'P01', 5);
  tl.set(clock, { textContent: '5:59' }, 0);
  tl.to(clock, { y: -30, opacity: 0, duration: .12 }, t6 - .2);
  tl.set(clock, { textContent: '6:00', y: 30 }, t6 - .08);
  tl.to(clock, { y: 0, opacity: 1, duration: .14 }, t6 - .08);
  // alarm rings radiating from the phone
  for (let i = 0; i < 4; i++) {
    const r = K.text(h, '', 'left:960px;top:540px;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;border:3px solid rgba(140,170,255,.6)');
    tl.set(r, { opacity: 0, scale: .6 }, 0);
    tl.to(r, { opacity: .8, duration: .05 }, t6 + i * .3).to(r, { scale: 2.4, opacity: 0, duration: 1.1, ease: 'power2.out' }, t6 + i * .3 + .05);
  }
};

/* ---------- sentence: the market ticks by behind the email ---------- */
SCX.sentence = (R, K, h, id) => {
  const { tl, S, D } = R;
  const items = ['INDEX ▲0.42%', 'TECH ▼0.31%', 'ENERGY ▲1.08%', 'BANKS ▼0.12%', 'RETAIL ▲0.27%', 'GOLD ▲0.64%', 'BONDS ▼0.05%', 'TRANSPORT ▲0.51%'];
  const band = K.text(h, '', 'left:0;top:940px;width:1920px;height:64px;background:rgba(8,12,24,.75);border-top:1px solid rgba(170,190,240,.18);border-bottom:1px solid rgba(170,190,240,.18);overflow:hidden');
  const strip = K.text(band, items.concat(items, items).map(t => `<span style="margin:0 46px;color:${t.includes('▲') ? '#3dff9a' : '#ff3b4f'}">${t}</span>`).join(''), 'left:0;top:18px;white-space:nowrap;font:700 26px JetBrains Mono');
  R.up(band, S(id) + .2, .4, 20);
  tl.fromTo(strip, { x: 0 }, { x: -1900, duration: R.D(id) + .5, ease: 'none', immediateRender: false }, S(id));
};

/* ---------- stakes: a house for the mortgage, a cap for college ---------- */
SCX.stakes = (R, K, h, id) => {
  const { tl, cue } = R;
  const s = K.svg(h, 1920, 1080, 'left:0;top:0');
  const house = R.el('path', { d: 'M905,215 L965,160 L1025,215 L1025,245 L905,245 Z M950,245 L950,215 L980,215 L980,245', fill: 'none', stroke: '#ffb347', 'stroke-width': 5, 'stroke-linejoin': 'round', class: 'hs-house', style: 'filter:drop-shadow(0 0 8px #ffb347)' }, s);
  R.draw('.hs-house', WT(R, 'P07', 5) - .15, .6);
  const cap = R.el('path', { d: 'M1360,300 L1440,270 L1520,300 L1440,330 Z M1395,315 L1395,345 C1420,360 1460,360 1485,345 L1485,315 M1520,300 L1520,345', fill: 'none', stroke: '#ff9ad5', 'stroke-width': 5, 'stroke-linejoin': 'round', class: 'hs-cap', style: 'filter:drop-shadow(0 0 8px #ff9ad5)' }, s);
  R.draw('.hs-cap', WT(R, 'P07', 8) - .1, .6);
  tl.to(s, { opacity: .25, duration: .4 }, WT(R, 'P07', 13) - .2);
};

/* ---------- daniel: the freight board he runs every day ---------- */
SCX.daniel = (R, K, h, id) => {
  const { tl, cue, V } = R;
  const panel = K.text(h, '', 'left:980px;top:480px;width:760px;height:400px;overflow:hidden', 'glass');
  const t0 = WT(R, 'P20', 4) - .1;
  R.up(panel, t0, .45, 30); cue(t0, 'swoosh', .5);
  K.text(panel, 'DISPATCH · COLUMBUS HUB', 'left:28px;top:22px;font-size:18px;color:#ffb347', 'label');
  const s = K.svg(panel, 760, 400, 'left:0;top:0');
  const hub = [300, 230];
  const cities = [['CHICAGO', 90, 110], ['DETROIT', 330, 70], ['PITTSBURGH', 560, 170], ['CINCINNATI', 210, 340], ['INDIANAPOLIS', 70, 260], ['CLEVELAND', 520, 80]];
  const routes = cities.map(([n, x, y], i) => {
    const mx = (hub[0] + x) / 2 + (i % 2 ? 40 : -40), my = (hub[1] + y) / 2 - 30;
    const p = R.el('path', { d: `M${hub[0]},${hub[1]} Q${mx},${my} ${x},${y}`, fill: 'none', stroke: 'rgba(170,190,240,.35)', 'stroke-width': 3, 'stroke-dasharray': '8 8', class: 'rt' + i }, s);
    R.el('circle', { cx: x, cy: y, r: 7, fill: '#9fb7ff' }, s);
    const lb = R.el('text', { x: x + 12, y: y + 6, fill: '#aab6dc', 'font-family': 'JetBrains Mono', 'font-size': 17, 'font-weight': 700 }, s); lb.textContent = n;
    tl.set([p], { opacity: 0 }, 0); tl.to(p, { opacity: 1, duration: .3 }, t0 + .2 + i * .12);
    return p;
  });
  R.el('circle', { cx: hub[0], cy: hub[1], r: 14, fill: '#ffb347', style: 'filter:drop-shadow(0 0 10px #ffb347)' }, s);
  // trucks travelling the routes
  routes.forEach((p, i) => {
    const g = R.el('g', {}, s);
    R.el('rect', { x: -18, y: -10, width: 26, height: 20, rx: 3, fill: '#ffe2b8', style: 'filter:drop-shadow(0 0 6px #ffb347)' }, g);
    R.el('rect', { x: 8, y: -7, width: 12, height: 17, rx: 3, fill: '#ffb347' }, g);
    const pr = { k: 0 }, st = t0 + .5 + i * .35, dur = 2.6 + (i % 3) * .5;
    tl.set(g, { opacity: 0 }, 0); tl.set(g, { opacity: 1 }, st);
    tl.to(pr, { k: 1, duration: dur, ease: 'sine.inOut', repeat: 2, yoyo: true, onUpdate: () => { const L = p.getTotalLength(), a = p.getPointAtLength(L * pr.k), b = p.getPointAtLength(Math.min(L, L * pr.k + 1)); g.setAttribute('transform', `translate(${a.x},${a.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 57.3})`); } }, st);
  });
  // the schedule board
  const rows = [['TRK 14', 'CHICAGO', '06:30'], ['TRK 07', 'DETROIT', '07:15'], ['TRK 22', 'PITTSBURGH', '08:00'], ['TRK 03', 'CINCINNATI', '08:40']];
  rows.forEach((r, i) => {
    const row = K.text(panel, `<span style="color:#8e9bc4">${r[0]}</span>&nbsp; ${r[1]}<span style="float:right;color:#3dff9a">${r[2]} ✓</span>`, `left:470px;top:${200 + i * 44}px;width:270px;font:700 15px JetBrains Mono;color:#e8eefc;white-space:nowrap`);
    R.up(row, t0 + .8 + i * .25, .3, 10); cue(t0 + .8 + i * .25, 'tick', .25, .5, { f: 1500 });
  });
  // twenty-two years at the same desk
  const yr = K.text(h, '2003', 'left:1500px;top:915px;font-size:56px', 'mono cold');
  const ty = WT(R, 'P20', 12);
  R.up(yr, ty, .3, 10);
  R.count(yr, ty + .1, 1.1, 2003, 2025, v => String(Math.round(v)), 'power1.inOut'); cue(ty + .1, 'counter', .35, .5, { dur: 1.1 });
};

/* ---------- family: night shifts, the hand-offs, the acceptance letter ---------- */
SCX.family = (R, K, h, id) => {
  const { tl, cue, V } = R;
  // heart monitor for the night-shift nurse
  const s = K.svg(h, 520, 90, 'left:160px;top:160px');
  let d = 'M0,45'; for (let x = 0; x <= 520; x += 130) d += ` L${x + 50},45 L${x + 62},20 L${x + 72},78 L${x + 84},8 L${x + 96},60 L${x + 104},45 L${x + 130},45`;
  const ecg = R.el('path', { d, fill: 'none', stroke: '#56e0c8', 'stroke-width': 4, 'stroke-linejoin': 'round', class: 'ecg', style: 'filter:drop-shadow(0 0 8px #56e0c8)' }, s);
  const te = WT(R, 'P21', 5);
  R.draw('.ecg', te - .2, 1.6, 'none'); cue(te - .2, 'beep', .35, -.6);
  const moon = K.text(h, '☾', 'left:720px;top:130px;font-size:70px;color:#cfd8f5;text-shadow:0 0 20px rgba(200,215,255,.7)');
  R.up(moon, te, .4, 10);
  // icons for the hand-offs
  ['🚗', '🍽️', '😟'].forEach((e, i) => { const ic = K.text(h, e, `left:720px;top:${328 + i * 120}px;font-size:54px`, 'emoji'); R.pop(ic, WT(R, 'P21', [10, 12, 15][i]) - .05, .3, .3); });
  // Lily's acceptance letter
  const env = K.text(h, '', 'left:1580px;top:140px;width:240px;height:150px;border-radius:8px;background:#f2ead9;box-shadow:0 20px 50px rgba(0,0,0,.5);overflow:visible');
  const letter = K.text(env, '<div style="font:800 20px Space Grotesk;color:#c2187a;letter-spacing:3px;text-align:center;margin-top:20px">ACCEPTED</div><div style="height:8px;width:70%;margin:14px auto 0;background:#e6e1d4;border-radius:4px"></div><div style="height:8px;width:55%;margin:8px auto 0;background:#e6e1d4;border-radius:4px"></div>',
    'left:20px;top:10px;width:200px;height:140px;background:#fffdf8;border-radius:6px');
  const flap = K.text(env, '', 'left:0;top:0;width:240px;height:80px;background:#e4d8bd;clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:50% 0');
  const ta = WT(R, 'P22', 7);
  R.up(env, ta - .6, .4, 20); cue(ta - .6, 'paper', .5, .6);
  tl.to(flap, { rotationX: 180, duration: .4, ease: 'power2.inOut' }, ta - .2);
  tl.to(letter, { y: -78, duration: .5, ease: 'power3.out' }, ta + .1); cue(ta + .1, 'sparkle', .45, .6, { dur: .5 });
};

/* ---------- tuition: a jar filling, one paycheck at a time ---------- */
SCX.tuition = (R, K, h, id) => {
  const { tl, cue } = R;
  const s = K.svg(h, 200, 230, 'left:1210px;top:800px');
  R.el('path', { d: 'M30,20 L170,20 L170,40 C190,60 190,80 185,110 L180,210 C178,222 168,228 156,228 L44,228 C32,228 22,222 20,210 L15,110 C10,80 10,60 30,40 Z', fill: 'rgba(170,200,255,.08)', stroke: '#cfd8f5', 'stroke-width': 4 }, s);
  const t0 = WT(R, 'P24', 16) - .4;
  tl.set(s, { opacity: 0 }, 0); tl.to(s, { opacity: 1, duration: .3 }, t0 - .3);
  for (let i = 0; i < 26; i++) {
    const row = Math.floor(i / 6), col = i % 6;
    const c = R.el('ellipse', { cx: 42 + col * 23 + (row % 2) * 10, cy: 210 - row * 15, rx: 12, ry: 7, fill: '#ffb347', stroke: '#a35a10', 'stroke-width': 2 }, s);
    const t = t0 + i * (1.6 / 26);
    tl.set(c, { opacity: 0, y: -260 }, 0); tl.to(c, { opacity: 1, duration: .05 }, t).to(c, { y: 0, duration: .32, ease: 'bounce.out' }, t);
    if (i % 4 === 0) cue(t + .3, 'coin_land', .2, .4);
  }
};

/* ---------- w8: the cash, stacked ---------- */
SCX.w8 = (R, K, h, id) => {
  const { tl, cue, V } = R;
  const t0 = WT(R, 'P38', 5) - .1;
  const bills = [];
  for (let i = 0; i < 10; i++) {
    const b = K.text(h, '<div style="position:absolute;left:12px;top:10px;right:12px;bottom:10px;border:2px solid rgba(20,60,30,.4);border-radius:6px"></div><div style="position:absolute;left:0;width:100%;top:20px;text-align:center;font:800 26px Unbounded;color:rgba(20,60,30,.6)">$1,000</div>',
      `left:${200 + (i % 2) * 8}px;top:${880 - i * 16}px;width:300px;height:76px;border-radius:8px;background:linear-gradient(135deg,#a8d8a0,#6fae6a);box-shadow:0 6px 14px rgba(0,0,0,.45);transform:rotate(${(i % 3 - 1) * 2}deg)`);
    tl.set(b, { opacity: 0, y: -300 }, 0); tl.to(b, { opacity: 1, duration: .05 }, t0 + i * .08).to(b, { y: 0, duration: .3, ease: 'power3.in' }, t0 + i * .08);
    if (i % 3 === 0) cue(t0 + i * .08 + .3, 'paper', .25, -.5);
    bills.push(b);
  }
  tl.to(bills, { opacity: .12, duration: .4 }, V('P40') - .1);
};

/* ---------- who: in the car — wipers, wheel, rain ---------- */
SCX.who = (R, K, h, id) => {
  const { tl, cue, V, E } = R;
  const tN = V('P48') - .1;
  const s = K.svg(h, 1920, 1080, 'left:0;top:0');
  h.prepend(s);
  R.el('path', { d: 'M80,770 C300,140 1620,140 1840,770', fill: 'none', stroke: 'rgba(170,190,240,.28)', 'stroke-width': 10 }, s);
  const wheel = R.el('circle', { cx: 960, cy: 900, r: 230, fill: 'none', stroke: 'rgba(255,179,71,.35)', 'stroke-width': 26 }, s);
  const wl = R.el('line', { x1: 560, y1: 770, x2: 1060, y2: 360, stroke: 'rgba(150,165,205,.55)', 'stroke-width': 9, 'stroke-linecap': 'round' }, s);
  const wr = R.el('line', { x1: 1160, y1: 770, x2: 1660, y2: 360, stroke: 'rgba(150,165,205,.55)', 'stroke-width': 9, 'stroke-linecap': 'round' }, s);
  tl.set(s, { opacity: 0 }, 0); tl.to(s, { opacity: 1, duration: .5 }, tN);
  const n = Math.ceil((E(id) - tN) / 1.3);
  [[wl, '560 770'], [wr, '1160 770']].forEach(([w, o]) => {
    tl.set(w, { rotation: 0, svgOrigin: o }, 0);
    for (let i = 0; i < n; i++) { tl.to(w, { rotation: -58, svgOrigin: o, duration: .55, ease: 'sine.inOut' }, tN + i * 1.3); tl.to(w, { rotation: 0, svgOrigin: o, duration: .55, ease: 'sine.inOut' }, tN + i * 1.3 + .6); }
  });
  cue(tN, 'wipers', .4, 0, { dur: E(id) - tN });
};

/* ---------- maya: the kitchen clock keeps going ---------- */
SCX.maya = (R, K, h, id) => {
  const { tl, cue, S, E } = R;
  const clk = K.text(h, '', 'left:1660px;top:120px;width:150px;height:150px;border-radius:50%;border:5px solid #cfd8f5;background:rgba(10,14,26,.8);box-shadow:0 0 30px rgba(200,215,255,.25)');
  const hr = K.text(clk, '', 'left:70px;top:30px;width:5px;height:45px;border-radius:3px;background:#cfd8f5;transform-origin:50% 100%;transform:rotate(330deg)');
  const mn = K.text(clk, '', 'left:71px;top:14px;width:4px;height:61px;border-radius:2px;background:#cfd8f5;transform-origin:50% 100%;transform:rotate(240deg)');
  const sc = K.text(clk, '', 'left:72px;top:10px;width:2px;height:65px;background:#ff3b4f;transform-origin:50% 100%');
  R.up(clk, S(id) + .3, .4, 10);
  const n = Math.floor(E(id) - S(id));
  for (let i = 0; i < n; i++) tl.set(sc, { rotation: i * 6 }, S(id) + i);
  tl.to(mn, { rotation: 246, duration: E(id) - S(id), ease: 'none' }, S(id));
};

/* ---------- kitchen: dawn comes up while he tells her ---------- */
SCX.kitchen = (R, K, h, id) => {
  const { tl, cue, S, E, V } = R;
  const win = h.children[0];
  tl.fromTo(win, { background: 'linear-gradient(180deg, rgb(36, 54, 94), rgb(13, 22, 48))' }, { background: 'linear-gradient(180deg, rgb(255, 176, 120), rgb(84, 70, 120))', duration: E(id) - S(id), ease: 'sine.in', immediateRender: false }, S(id));
  win.style.overflow = 'hidden';
  const sun = K.text(win, '', 'left:190px;top:470px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,#ffd9a0,#ff9a4a 60%,transparent 70%)');
  tl.fromTo(sun, { y: 140, opacity: 0 }, { y: -40, opacity: .9, duration: E(id) - S(id), ease: 'sine.out', immediateRender: false }, S(id));
  // coffee going cold
  const mug = K.text(h, '<div style="position:absolute;left:0;top:30px;width:90px;height:80px;border-radius:0 0 18px 18px;background:#d9d4c7"></div><div style="position:absolute;left:84px;top:44px;width:30px;height:40px;border:8px solid #d9d4c7;border-left:none;border-radius:0 20px 20px 0"></div>',
    'left:640px;top:690px;width:120px;height:110px');
  R.up(mug, S(id) + .3, .4, 10);
  for (let i = 0; i < 3; i++) {
    const st = K.text(h, '', `left:${662 + i * 22}px;top:640px;width:6px;height:50px;border-radius:3px;background:linear-gradient(180deg,transparent,rgba(230,230,230,.45),transparent)`);
    tl.fromTo(st, { y: 20, opacity: 0, x: 0 }, { y: -50, opacity: .8, x: (i - 1) * 8, duration: 1.6, ease: 'sine.inOut', repeat: Math.ceil((E(id) - S(id)) / 1.6), immediateRender: false }, S(id) + i * .5);
  }
};

/* ---------- lily: she made it ---------- */
SCX.lily = (R, K, h, id) => {
  const { tl, cue } = R;
  const cap = K.text(h, '🎓', 'left:1570px;top:380px;font-size:72px', 'emoji');
  const t = WT(R, 'P80', 15);
  tl.set(cap, { opacity: 0 }, 0);
  tl.to(cap, { opacity: 1, duration: .1 }, t).fromTo(cap, { y: 0, rotation: 0 }, { y: -160, rotation: 360, duration: .55, ease: 'power2.out', immediateRender: false }, t).to(cap, { y: 0, duration: .5, ease: 'bounce.out' }, t + .55);
  cue(t, 'sparkle', .4, .6, { dur: .6 });
  tl.to(cap, { opacity: 0, duration: .3 }, R.V('P81') - .3);
};
