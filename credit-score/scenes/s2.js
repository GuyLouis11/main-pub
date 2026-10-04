/* s2: chapter 3 (the formula) and chapter 4 (you are the product) */

/* a donut chart of the FICO recipe; segments draw on cue */
const RECIPE = [[.35, '#3dff9a', 'PAYMENT HISTORY'], [.30, '#4fc3ff', 'AMOUNTS OWED'], [.15, '#ffb347', 'LENGTH OF HISTORY'], [.10, '#9b7bff', 'NEW CREDIT'], [.10, '#ff8fb1', 'CREDIT MIX']];
const donut = (host, x, y, size, drawn = 0) => {
  const C = 2 * Math.PI * 230; let a0 = 0, segs = '';
  RECIPE.forEach(([f, c], i) => { segs += `<circle class="sg${i}" cx="300" cy="300" r="230" fill="none" stroke="${c}" stroke-width="96" stroke-dasharray="${f * C - 6} ${C}" stroke-dashoffset="${i < drawn ? 0 : f * C}" transform="rotate(${-90 + a0 * 360} 300 300)"/>`; a0 += f; });
  const d = at(host, `<div style="position:relative;width:${size}px;height:${size}px"><svg viewBox="0 0 600 600" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 30px 40px rgba(0,0,0,.45))"><circle cx="300" cy="300" r="230" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="96"/>${segs}</svg>
    <div class="big dn" style="position:absolute;left:0;top:${size * .38}px;width:100%;text-align:center;font-size:${size * .17}px;color:#fff">${drawn ? '' : '?'}</div></div>`, x, y);
  tl.set(d, { rotationX: 30, transformPerspective: 1400 }, 0);
  const o = { el: d, num: d.querySelector('.dn'), prev: null };
  o.seg = (i, t, d2 = .6) => { const f = RECIPE[i][0]; const cs = d.querySelector('.sg' + i); if (o.prev) tl.to(o.prev, { attr: { 'stroke-width': 96 }, duration: .3 }, t); tl.to(cs, { attr: { 'stroke-width': 124 }, duration: .35, ease: 'back.out(2)' }, t); o.prev = cs; tl.to(d.querySelector('.sg' + i), { attr: { 'stroke-dashoffset': 0 }, duration: d2, ease: 'power2.out' }, t); tl.set(o.num, { textContent: Math.round(f * 100) + '%', color: RECIPE[i][1] }, t); cue(t, 'swoosh', .4); };
  return o;
};
const legendRow = (host, i, x, y, t, extra = '') => {
  const [f, c, n] = RECIPE[i];
  const r = at(host, `<div style="display:flex;align-items:center;gap:26px;width:940px;padding:20px 30px;border-radius:22px;background:rgba(4,20,18,.72);border:3px solid ${c}"><div class="big" style="font-size:66px;color:${c};width:190px">${Math.round(f * 100)}%</div><div class="anton" style="font-size:54px;color:#fff;flex:1">${n}</div>${extra}</div>`, x, y);
  tl.set(r, { opacity: 0, x: 120 }, 0); tl.to(r, { opacity: 1, x: 0, duration: .4, ease: 'back.out(1.6)' }, t); return r;
};

/* ================= CHAPTER 3: THE FORMULA ================= */
propLayer('formula', [`<div class="mono" style="font-size:80px;color:#9fffe0">%</div>`, ccard(120, '', '#0b5248', '#04221f'), `<div class="big" style="font-size:60px;color:#9fffe0">✓</div>`, A.coin(90, '$', '#9fffe0')], S('j0'), E('j4'), 16, .14);
chapterCard('j0', 3, 'THE FORMULA', 'What actually goes into your number', `<svg viewBox="0 0 200 200" style="width:300px;height:300px"><circle cx="100" cy="100" r="70" fill="none" stroke="#3dff9a" stroke-width="40" stroke-dasharray="154 440" transform="rotate(-90 100 100)"/><circle cx="100" cy="100" r="70" fill="none" stroke="#4fc3ff" stroke-width="40" stroke-dasharray="132 440" transform="rotate(36 100 100)"/><circle cx="100" cy="100" r="70" fill="none" stroke="#ffb347" stroke-width="40" stroke-dasharray="66 440" transform="rotate(144 100 100)"/><circle cx="100" cy="100" r="70" fill="none" stroke="#9b7bff" stroke-width="40" stroke-dasharray="44 440" transform="rotate(198 100 100)"/><circle cx="100" cy="100" r="70" fill="none" stroke="#ff8fb1" stroke-width="40" stroke-dasharray="44 440" transform="rotate(234 100 100)"/></svg>`, GRN, 'formula');

// j1: the recipe — 35% payment history, 30% amounts owed
{
  const id = 'j1', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE RECIPE', 3);
  const dn = donut(host, 130, 150, 640);
  tl.set(dn.el, { opacity: 0, rotation: -90, scale: .6 }, 0); tl.to(dn.el, { opacity: 1, rotation: 0, scale: 1, duration: .7, ease: 'back.out(1.4)' }, W('J1', 'goes') - .2); cue(W('J1', 'goes') - .2, 'whoosh', .5, -.5);
  tl.to(dn.el.querySelector('svg'), { rotation: 8, duration: E(id) - W('J1', 'goes') - 1, ease: 'sine.inOut' }, W('J1', 'goes') + .6);
  const rc = at(host, `<div class="paper" style="position:relative;width:640px;padding:34px 44px;background:#fffaf0;transform:rotate(3deg)"><div class="serif" style="font-size:64px;color:#04221f">Recipe: <i>your score</i></div><div class="mono" style="font-size:24px;color:#0b5248;margin-top:6px">PUBLISHED BY FICO</div>
    ${RECIPE.map(([f, c, n]) => `<div style="display:flex;justify-content:space-between;font:700 30px/1 'JetBrains Mono';color:#2a2418;margin-top:20px"><span>${n.toLowerCase()}</span><span style="color:${c === '#3dff9a' ? '#1f7a3a' : '#555'}">· · ·</span></div>`).join('')}</div>`, 960, 150);
  tl.set(rc, { opacity: 0, y: 100, rotation: 10 }, 0); tl.to(rc, { opacity: 1, y: 0, rotation: 0, duration: .5, ease: 'back.out(1.5)' }, W('J1', 'recipe') - .25); cue(W('J1', 'recipe') - .2, 'paper', .5, .5);
  tl.to(rc, { opacity: 0, x: 200, duration: .3 }, V('J2') - .2);
  dn.seg(0, W('J2', '35') - .1);
  const cal = `<div style="display:grid;grid-template-columns:repeat(6,34px);gap:6px">${Array(12).fill(0).map((_, i) => `<i class="m${i}" style="display:block;width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.15)"></i>`).join('')}</div>`;
  const r0 = legendRow(host, 0, 860, 200, W('J2', '35'), cal);
  for (let i = 0; i < 12; i++) { const t = W('J2', 'pay') + i * .07; tl.to(r0.querySelector('.m' + i), { backgroundColor: i === 7 ? RED : GRN, duration: .1 }, t); }
  cue(W('J2', 'pay'), 'counter', .3, .5, { dur: .8 });
  dn.seg(1, W('J3', '30') - .1);
  const bar = `<div style="width:170px;height:34px;border-radius:17px;background:rgba(255,255,255,.15);overflow:hidden"><i class="ub" style="display:block;width:100%;height:100%;background:#4fc3ff;transform-origin:0 50%"></i></div>`;
  const r1 = legendRow(host, 1, 860, 380, W('J3', '30'), bar);
  tl.set(r1.querySelector('.ub'), { scaleX: 0 }, 0); tl.to(r1.querySelector('.ub'), { scaleX: .7, duration: 1, ease: 'power2.out' }, W('J3', 'available'));
  const cc = at(host, ccard(420, 'CREDIT', '#0d6b8a', '#04243a'), 1180, 560);
  tl.set(cc, { opacity: 0, rotationY: 80, transformPerspective: 1400 }, 0); tl.to(cc, { opacity: 1, rotationY: -10, duration: .5, ease: 'back.out(1.5)' }, W('J3', 'owe') - .1); cue(W('J3', 'owe'), 'swipe', .4, .6);
  tl.to(cc, { rotationY: 10, duration: 3, ease: 'sine.inOut' }, W('J3', 'owe') + .5);
  cam(id, { z: 1.05, x: -10 });
}

// j2: utilization example, then 15 / 10 / 10
{
  const id = 'j2', host = sc(id); through(id); chip(id, 'HOW MUCH YOU USE', 3);
  const cc = at(host, ccard(560, 'VISA-ISH', '#1b3a6b', '#0b1a33', '•••• •••• •••• 3000'), 140, 130);
  tl.set(cc, { opacity: 0, rotationY: -60, rotationX: 20, transformPerspective: 1400 }, 0); tl.to(cc, { opacity: 1, rotationY: -12, rotationX: 6, duration: .55, ease: 'back.out(1.4)' }, S(id) + .1); cue(S(id) + .15, 'swipe', .5, -.6);
  tl.to(cc, { rotationY: 8, rotationX: 0, duration: 4, ease: 'sine.inOut' }, S(id) + .7);
  const lim = at(host, `<div class="mono" style="font-size:34px;color:${CREAM}">LIMIT <span class="big" style="font-size:56px;color:#fff">$10,000</span></div>`, 140, 530); up(lim, W('J3b', '10000') - .1, 20); cue(W('J3b', '10000'), 'blip', .3, -.5);
  const bar = at(host, `<div style="position:relative;width:1040px;height:90px;border-radius:45px;background:rgba(255,255,255,.12);border:3px solid rgba(255,255,255,.35);overflow:hidden"><i class="fill" style="position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(90deg,#3dff9a,#ffb347 40%,#ff3b4f);transform-origin:0 50%"></i>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<i style="position:absolute;left:${k * 10}%;top:0;width:2px;height:100%;background:rgba(0,0,0,.3)"></i>`).join('')}</div>`, 140, 610);
  up(bar, W('J3b', 'limit') - .1, 30);
  const fill = bar.querySelector('.fill'); tl.set(fill, { scaleX: 0 }, 0);
  tl.to(fill, { scaleX: .3, duration: .7, ease: 'power2.out' }, W('J3b', '3000') - .05); cue(W('J3b', '3000'), 'counter', .35, 0, { dur: .7 });
  const bal = at(host, `<div class="mono" style="font-size:34px;color:${CREAM}">BALANCE <span class="big bv" style="font-size:56px;color:${AMBER}">$0</span></div>`, 140, 730); up(bal, W('J3b', '3000') - .15, 20);
  countTo(bal.querySelector('.bv'), W('J3b', '3000'), .7, 0, 3000, v => '$' + commas(v));
  const pct = at(host, `<div class="big glow" style="font-size:150px;--acc:${AMBER}">30%</div>`, 1280, 560); slam(pct, W('J3b', 'thirty') - .05); cue(W('J3b', 'thirty') + .15, 'impact', .5, .5);
  const g = gauge(host, 1250, 120, 560, { score: 690, label: 'YOUR SCORE' }); g.show(W('J3b', 'balance') - .1);
  const tLow = W('J3b', 'lower');
  tl.to(fill, { scaleX: .09, duration: .8, ease: 'power2.inOut' }, tLow); tl.set(pct.firstChild, { textContent: '30%' }, 0); tl.set(pct.firstChild, { textContent: '9%' }, tLow + .3);
  countTo(bal.querySelector('.bv'), tLow, .8, 3000, 900, v => '$' + commas(v));
  g.to(tLow + .1, 736, 1, 'power2.out');
  const pd = stampOn(host, 'PAID IN FULL ✓', 'green', 220, 300, W('J3b', 'full') - .1, -8, 56);
  const note = at(host, `<div class="mono" style="font-size:28px;color:${CREAM};opacity:.9">↳ the balance on your statement is what gets reported</div>`, 140, 820);
  up(note, W('J3b', 'month') - .2, 20);
  // J4: the other three slices
  const t4 = V('J4') - .25;
  tl.to([cc, lim, bar, bal, pct, g.g, pd, note], { opacity: 0, y: 30, duration: .3, stagger: .02 }, t4);
  const dn = donut(host, 130, 150, 620, 2);
  tl.set(dn.el, { opacity: 0, scale: .7 }, 0); tl.to(dn.el, { opacity: 1, scale: 1, duration: .45, ease: 'back.out(1.5)' }, t4 + .15);
  tl.to(dn.el.querySelector('svg'), { rotation: -8, duration: VE('J4') - t4, ease: 'sine.inOut' }, t4 + .15);
  const clock = `<svg viewBox="0 0 60 60" style="width:56px;height:56px"><circle cx="30" cy="30" r="26" fill="none" stroke="#ffb347" stroke-width="6"/><path class="hd" d="M30,30 L30,12" stroke="#ffb347" stroke-width="6" stroke-linecap="round"/></svg>`;
  dn.seg(2, W('J4', '15') - .05); const r2 = legendRow(host, 2, 860, 190, W('J4', '15'), clock);
  tl.to(r2.querySelector('.hd'), { rotation: 360, svgOrigin: '30 30', duration: 1.5, ease: 'power2.inOut' }, W('J4', 'long'));
  dn.seg(3, W('J4', '10') - .05); legendRow(host, 3, 860, 390, W('J4', '10'), `<div class="big" style="font-size:40px;color:#9b7bff">NEW</div>`);
  dn.seg(4, W('J4', '10', 8) - .05); legendRow(host, 4, 860, 590, W('J4', '10', 8), `<div style="display:flex;gap:8px;align-items:center">${ccard(60, '', '#ff8fb1', '#7a2a44')}${A.car(70, '#ff8fb1')}${A.house(50, '#ff8fb1')}</div>`);
  tl.set(dn.num, { textContent: '100%', color: '#fff' }, W('J4', 'accounts'));
  cam(id, { z: 1.05, y: -10 });
}

// j3: what's missing — income, savings, cash; it measures debt
{
  const id = 'j3', host = sc(id); through(id); chip(id, "WHAT'S MISSING", 3);
  const dn = donut(host, 130, 160, 560, 5); tl.set(dn.num, { textContent: '100%' }, 0);
  tl.set(dn.el, { opacity: 0, scale: .8 }, 0); tl.to(dn.el, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(1.5)' }, S(id) + .05);
  const gap = at(host, `<div class="anton" style="font-size:60px;color:${RED}">NOT ON THE LIST:</div>`, 780, 150); fromL(gap, W('J5', 'missing') - .2, -100);
  const items = [['income', A.paycheck(300), 'YOUR INCOME'], ['savings', A.piggy(220), 'YOUR SAVINGS'], ['cash', `<div style="display:flex;flex-direction:column;gap:6px">${BILL(200)}${BILL(200)}</div>`, 'CASH IN THE BANK']];
  const cards = items.map(([w, art, lbl], i) => {
    const x = 780 + i * 370, t = W('J5', w) - .1;
    const c = at(host, `<div class="card" style="position:relative;width:340px;height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px">${art}<div class="anton" style="font-size:44px;color:#fff">${lbl}</div><svg class="x" viewBox="0 0 100 100" style="position:absolute;inset:40px;width:260px;height:340px" preserveAspectRatio="none"><path d="M10,10 L90,90 M90,10 L10,90" stroke="${RED}" stroke-width="10" stroke-linecap="round" fill="none" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg></div>`, x, 260);
    up(c, t, 60); cue(t, 'pop', .4, -.2 + i * .4);
    tl.to(c.querySelector('.x path'), { attr: { 'stroke-dashoffset': 0 }, duration: .3, ease: 'power2.in' }, t + .45); cue(t + .5, 'slash', .45, -.2 + i * .4);
    return c;
  });
  // J6: good with money ✗ — handles debt ✓
  const t6 = V('J6') - .2;
  tl.to([gap, ...cards], { opacity: 0, y: -40, duration: .3, stagger: .03 }, t6);
  tl.to(dn.el, { x: -40, scale: .85, duration: .4 }, t6);
  const l1 = at(host, `<div style="display:flex;align-items:center;gap:30px"><div class="anton" style="font-size:110px;color:rgba(255,255,255,.55);position:relative">GOOD WITH MONEY<i class="st" style="position:absolute;left:-10px;right:-10px;top:52%;height:14px;border-radius:7px;background:${RED}"></i></div><div class="big" style="font-size:100px;color:${RED}">✗</div></div>`, 760, 250);
  up(l1, W('J6', 'good') - .2, 40); tl.set(l1.querySelector('.st'), { scaleX: 0, transformOrigin: '0 50%' }, 0); tl.to(l1.querySelector('.st'), { scaleX: 1, duration: .3 }, W('J6', 'money') + .2); cue(W('J6', 'money') + .2, 'slash', .5, .4);
  const l2 = at(host, `<div style="display:flex;align-items:center;gap:30px"><div class="anton" style="font-size:150px;color:${GRN};text-shadow:0 0 30px rgba(61,255,154,.5)">HANDLES DEBT</div><div class="big" style="font-size:110px;color:${GRN}">✓</div></div>`, 760, 480);
  slam(l2, W('J6', 'handle') - .05); cue(W('J6', 'handle') + .15, 'impact', .7, .4); punch(W('J6', 'debt'));
  cam(id, { z: 1.05, x: 10 });
}

// j4: the credit-invisible trap
{
  const id = 'j4', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE TRAP', 3);
  const per = at(host, A.person(220, CREAM), 520, 300, `color:${CREAM}`); up(per, S(id) + .1, 50);
  const beam = at(host, `<div style="width:420px;height:24px;border-radius:12px;background:${SKY};box-shadow:0 0 40px ${SKY},0 0 90px ${SKY}"></div>`, 420, 280);
  tl.set(beam, { opacity: 0 }, 0); tl.to(beam, { opacity: .9, duration: .2 }, W('J7', 'never') - .3); tl.to(beam, { y: 380, duration: .8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, W('J7', 'never') - .3); tl.to(beam, { opacity: 0, duration: .2 }, W('J7', 'never') + 1.3); cue(W('J7', 'never') - .3, 'stream', .4, -.3, { dur: 1.6 });
  const mon = at(host, `<div style="width:640px;height:400px;border-radius:24px;background:#0b1a1a;border:8px solid #2a4a48;padding:40px;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div class="mono" style="font-size:30px;color:#9fffe0">CREDIT FILE LOOKUP</div><div class="mono st" style="font-size:52px;color:#9fffe0;margin-top:60px">SEARCHING…</div></div>`, 1080, 220);
  up(mon, W('J7', 'borrowed') - .3, 50);
  const stt = mon.querySelector('.st'); tl.set(stt, { textContent: 'SEARCHING…', color: '#9fffe0' }, 0); tl.set(stt, { textContent: 'NO FILE FOUND', color: RED }, W('J7', "can't")); cue(W('J7', "can't"), 'buzz', .5, .5);
  tl.to(per, { opacity: .25, duration: .4 }, W('J7', 'see'));
  const ghost = at(host, `<div style="width:220px;height:366px;border:6px dashed ${CREAM};border-radius:110px 110px 20px 20px"></div>`, 520, 300); tl.set(ghost, { opacity: 0 }, 0); tl.to(ghost, { opacity: .8, duration: .3 }, W('J7', 'see') + .1);
  const jaws = at(host, `<svg viewBox="0 0 400 140" style="width:400px;height:140px"><g class="jl"><path d="M0,130 Q100,0 200,130 Z" fill="#8390b5"/>${[0, 1, 2, 3].map(i => `<path d="M${40 + i * 40},${80 - (i % 2) * 6} l14,-30 l14,30 Z" fill="#cfd6ea"/>`).join('')}</g><g class="jr"><path d="M200,130 Q300,0 400,130 Z" fill="#8390b5"/>${[0, 1, 2, 3].map(i => `<path d="M${240 + i * 40},${80 - (i % 2) * 6} l14,-30 l14,30 Z" fill="#cfd6ea"/>`).join('')}</g></svg>`, 430, 690);
  up(jaws, W('J7', 'strange') - .2, 30);
  tl.to(jaws.querySelector('.jl'), { rotation: 30, svgOrigin: '200 130', duration: .15, ease: 'power4.in' }, W('J7', 'trap')); tl.to(jaws.querySelector('.jr'), { rotation: -30, svgOrigin: '200 130', duration: .15, ease: 'power4.in' }, W('J7', 'trap')); cue(W('J7', 'trap') + .12, 'clang', .7, -.3); R.shake(W('J7', 'trap') + .12, 12, .25);
  // J8: 26 million + 19 million
  const t8 = V('J8') - .2;
  tl.to([per, beam, mon, ghost, jaws], { opacity: 0, duration: .3 }, t8);
  const ppl = people(host, 150, 330, 25, 4, 46, 22, 'rgba(255,255,255,.8)');
  ppl.forEach((p, i) => { tl.set(p, { opacity: 0 }, 0); tl.to(p, { opacity: 1, duration: .15 }, t8 + .1 + (i % 25) * .015 + Math.floor(i / 25) * .05); });
  cue(t8 + .1, 'stack', .35, 0, { dur: .6 });
  const inv = [3, 11, 18, 27, 34, 46, 52, 63, 71, 88], thin = [6, 21, 39, 44, 58, 66, 80, 95];
  inv.forEach((k, j) => { tl.to(ppl[k], { opacity: .18, duration: .2 }, W('J8', '26') + j * .05); });
  thin.forEach((k, j) => { tl.set(ppl[k], { color: 'rgba(255,255,255,.8)' }, 0); tl.to(ppl[k], { color: AMBER, duration: .2 }, W('J8', '19') + j * .05); });
  thin.forEach(k => { ppl[k].querySelectorAll('circle,path:not(.hl)').forEach(e => e.setAttribute('fill', 'currentColor')); });
  const k1 = bigCount(host, 150, 120, 'NO CREDIT HISTORY AT ALL', 96, CREAM, W('J8', '26') - .05, .9, 0, 26, v => Math.round(v) + 'M');
  const k2 = bigCount(host, 980, 120, 'TOO THIN OR TOO OLD TO SCORE', 96, AMBER, W('J8', '19') - .05, .9, 0, 19, v => Math.round(v) + 'M');
  src(host, 'Source: CFPB, “Data Point: Credit Invisibles” (2015)', W('J8', 'score') - .3);
  // J9: cash-only vs the juggler
  const t9 = V('J9') - .2;
  tl.to([...ppl, k1, k2], { opacity: 0, duration: .3 }, t9);
  tl.to(host.querySelectorAll('.mono.abs'), { opacity: 0, duration: .2 }, t9);
  const L = at(host, `<div class="card" style="position:relative;width:780px;height:640px"><div class="anton" style="position:absolute;left:40px;top:34px;font-size:60px;color:#fff">CASH ONLY, FOR LIFE</div><div style="position:absolute;left:60px;top:170px">${A.person(200, '#9fffe0')}</div><div style="position:absolute;left:300px;top:200px;display:flex;flex-direction:column;gap:12px">${BILL(240)}${BILL(240)}${BILL(240)}</div></div>`, 120, 160);
  fromL(L, W('J9', 'cash') - .2, -200); cue(W('J9', 'cash'), 'whoosh', .4, -.6);
  const Rt = at(host, `<div class="card" style="position:relative;width:780px;height:640px"><div class="anton" style="position:absolute;left:40px;top:34px;font-size:60px;color:#fff">JUGGLING 3 CARDS</div><div style="position:absolute;left:290px;top:250px">${A.person(200, '#ffb347')}</div></div>`, 1020, 160);
  tl.set(Rt, { opacity: 0, x: 200 }, 0); tl.to(Rt, { opacity: 1, x: 0, duration: .4, ease: 'power3.out' }, W('J9', 'someone') - .3); cue(W('J9', 'someone') - .2, 'whoosh', .4, .6);
  const jug = [];
  [['#c8102e', '#5a0810'], ['#1b6bd8', '#0b1a33'], ['#ffb347', '#7a4a10']].forEach(([a, b], i) => {
    const c = at(host, ccard(150, '', a, b), 1330, 300); jug.push(c);
    tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .2 }, W('J9', 'juggling') - .2 + i * .1);
    const t0 = W('J9', 'juggling') - .2 + i * .1;
    for (let k = 0; k < 3; k++) { tl.to(c, { x: (i - 1) * 190, y: -120 - i * 20, rotation: 180 * (k + 1), duration: .35, ease: 'power1.out' }, t0 + k * .7); tl.to(c, { x: (1 - i) * 150, y: 60, rotation: 360 * (k + 1), duration: .35, ease: 'power1.in' }, t0 + k * .7 + .35); }
    cue(t0, 'boing', .25, .6);
  });
  const sL = stampOn(host, 'RISKIER', 'red', 220, 560, W('J9', 'riskier') - .05, -8, 80);
  const sR = stampOn(host, 'LOOKS SAFER', 'green', 1120, 600, W('J9', 'cards') - .05, 6, 64);
  // J10: not a bug → follow the money
  const t10 = V('J10') - .15;
  tl.to([L, Rt, sL, sR, ...jug], { opacity: 0, duration: .3 }, t10);
  const bug = at(host, `<div style="display:flex;align-items:center;gap:30px"><svg viewBox="0 0 120 120" style="width:170px;height:170px"><ellipse cx="60" cy="66" rx="28" ry="36" fill="#9fffe0"/><circle cx="60" cy="30" r="14" fill="#9fffe0"/><path d="M32,56 L12,46 M32,72 L10,76 M32,88 L14,104 M88,56 L108,46 M88,72 L110,76 M88,88 L106,104" stroke="#9fffe0" stroke-width="6"/><path d="M10,110 L110,10" stroke="${RED}" stroke-width="12" stroke-linecap="round"/></svg><div class="anton" style="font-size:150px;color:#fff">NOT A BUG.</div></div>`, 300, 260);
  slam(bug, W('J10', 'bug') - .1); cue(W('J10', 'bug') + .1, 'impact', .6);
  const tM = W('J10', 'follow') - .2;
  for (let i = 0; i < 14; i++) { const c = at(host, A.coin(70), 260 + i * 120, 640 + Math.sin(i * .8) * 50); tl.set(c, { opacity: 0, scale: .3 }, 0); tl.to(c, { opacity: 1, scale: 1, duration: .2, ease: 'back.out(2)' }, tM + i * .06); }
  cue(tM, 'coins', .5, .4);
  const ar = at(host, `<div class="anton" style="font-size:90px;color:${GOLD}">FOLLOW THE MONEY →</div>`, 900, 480); fromL(ar, W('J10', 'money') - .3, -200);
  tl.to(sc(id), { x: -120, duration: .8, ease: 'power2.in' }, E(id) - .8);
}

/* ================= CHAPTER 4: YOU ARE THE PRODUCT ================= */
propLayer('product', [A.coin(90), A.building(70, '#5a6aa8', 4), `<div class="mono" style="font-size:70px;color:#ffe9a8">$</div>`, A.env(100, '#e9f2ff', '#7aa7d8')], S('b0'), E('b4'), 16, .15);
chapterCard('b0', 4, 'YOU ARE THE PRODUCT', 'The $18-billion business of you', `<div style="padding:22px;border-radius:20px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,.5)"><div style="width:230px;height:120px;background:repeating-linear-gradient(90deg,#111 0 6px,#fff 6px 10px,#111 10px 13px,#fff 13px 20px)"></div><div class="mono" style="font-size:26px;color:#111;margin-top:10px;text-align:center">YOU · $$$</div></div>`, GOLD, 'product');

// b1: three companies, $18 billion
{
  const id = 'b1', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE BIG THREE', 4);
  const q = at(host, `<div class="big glow" style="font-size:300px;--acc:${GOLD}">?</div>`, 960, 200); center(q); pop(q, V('B1') - .1, .3);
  tl.to(q, { rotationY: 360, duration: 1.4, ease: 'power2.inOut' }, V('B1')); tl.to(q, { opacity: 0, scale: .5, duration: .3 }, V('B2') - .1);
  for (let i = 0; i < 16; i++) { const c = at(host, A.coin(60), 200 + (i * 113) % 1500, -100); tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .05 }, V('B1') + i * .08); tl.to(c, { y: 900 + (i % 3) * 40, rotation: 360, duration: 1.1, ease: 'power2.in' }, V('B1') + i * .08); tl.to(c, { opacity: 0, duration: .15 }, V('B1') + i * .08 + .95); }
  cue(V('B1'), 'coins', .5);
  const T = [['equifax', A.equifax(260), 6.1, '#9e1b32', 260], ['experian', A.experian(290), 7.5, '#6d2077', 800], ['transunion', A.transunion(290), 4.5, '#00a6ca', 1340]];
  const tw = T.map(([w, lg, rev, c, x], i) => {
    const h = rev * 52;
    const b = box3d(host, { x, y: 800 - h, w: 300, h, d: 110, top: c, front: `linear-gradient(180deg,${c},#0a0e22)`, side: '#141a3a', html: `<div style="position:absolute;inset:18px;background:repeating-linear-gradient(0deg,rgba(255,233,168,.55) 0 10px,transparent 10px 28px),repeating-linear-gradient(90deg,transparent 0 30px,rgba(10,14,34,.85) 30px 40px)"></div>` });
    tl.set(b, { rotationY: -20, rotationX: -8, transformPerspective: 2200, scaleY: 0, transformOrigin: '50% 100%' }, 0);
    const t = W('B2', w) - .15;
    tl.to(b, { scaleY: 1, duration: .55, ease: 'back.out(1.3)' }, t); cue(t, 'thud', .6, -.6 + i * .6);
    const l = at(host, lg, x - 10, 800 - h - 110); pop(l, t + .2, .4);
    const v = at(host, `<div class="big" style="font-size:54px;color:#fff;text-shadow:0 4px 0 rgba(0,0,0,.5)">$${rev}B</div>`, x + 70, 800 - h - 190); up(v, W('B3', '18') + i * .12, 20);
    return [b, l, v];
  });
  const tot = at(host, `<div class="kick">PER YEAR, COMBINED</div><div class="big glow cnt" style="font-size:130px;--acc:${GOLD}">$0B</div>`, 1240, 120); up(tot, W('B3', 'together') - .1, 30); countTo(tot.querySelector('.cnt'), W('B3', '18') - .1, .9, 0, 18, v => '$' + Math.round(v) + 'B'); cue(W('B3', '18'), 'counter', .4, 0, { dur: .9 }); cue(W('B3', 'billion') + .3, 'coins', .5);
  // B3b: Equifax alone
  const t6 = V('B3b') - .1;
  tl.to([tw[1][0], tw[2][0], tw[1][1], tw[2][1], tw[1][2], tw[2][2]], { opacity: .3, duration: .3 }, t6);
  tl.to(tw[0][0], { scale: 1.08, duration: .3, ease: 'back.out(2)' }, t6);
  const e6 = at(host, `<div class="pill" style="position:relative;background:#9e1b32;color:#fff;font-size:40px">EQUIFAX ≈ $6 BILLION</div>`, 200, 600); pop(e6, W('B3b', '6') - .1); cue(W('B3b', '6'), 'ding', .5, -.6);
  src(host, 'Sources: Equifax 2025 10-K · Experian FY25 report · TransUnion 2025 guidance', W('B3', '18') + .5);
  cam(id, { z: 1.05, y: -14, rx: 3 });
}

// b2: you're not the customer → prescreen lists → you can't delete it
{
  const id = 'b2', host = sc(id); through(id); chip(id, 'WHO PAYS WHOM', 4);
  const you = at(host, `<div style="text-align:center">${A.person(150, CREAM)}<div class="anton" style="font-size:56px;color:#fff;margin-top:8px">YOU</div></div>`, 150, 300, `color:${CREAM}`); up(you, S(id) + .1, 40);
  const bur = box3d(host, { x: 780, y: 230, w: 300, h: 460, d: 100, top: '#5a6aa8', front: 'linear-gradient(180deg,#2c3a72,#141c3e)', side: '#1c2652', html: `<div class="anton" style="position:absolute;left:0;top:30px;width:100%;text-align:center;font-size:52px;color:${GOLD}">BUREAU</div><div style="position:absolute;inset:110px 20px 20px;background:repeating-linear-gradient(0deg,rgba(255,233,168,.5) 0 10px,transparent 10px 28px)"></div>` });
  tl.set(bur, { rotationY: -16, transformPerspective: 2000, opacity: 0, y: 100 }, 0); tl.to(bur, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' }, S(id) + .2); cue(S(id) + .25, 'thud', .5);
  const buyers = [['banks', A.bank(170), 'BANKS'], ['landlords', A.building(110, '#9b7bff', 4), 'LANDLORDS'], ['insurers', A.shield(110, '#4fc3ff'), 'INSURERS']].map(([w, art, lbl], i) => {
    const y = 130 + i * 250;
    const b = at(host, `<div class="card" style="position:relative;width:380px;height:210px;display:flex;align-items:center;gap:22px;padding:0 26px">${art}<div class="anton" style="font-size:48px;color:#fff">${lbl}</div></div>`, 1420, y);
    tl.set(b, { opacity: 0, x: 200 }, 0); tl.to(b, { opacity: 1, x: 0, duration: .4, ease: 'power3.out' }, W('B4', w) - .15); cue(W('B4', w) - .1, 'pop', .4, .7);
    stream(host, 1420, y + 105, 1080, 400 + i * 40, W('B4', w) + .2, VE('B4') + .6, GOLD, .14, 16);
    return b;
  });
  stream(host, 320, 420, 780, 420, W('B4', 'miss'), VE('B4') + .6, SKY, .1, 12);
  const dl = at(host, `<div class="mono" style="font-size:28px;color:${SKY}">YOUR DATA →</div>`, 400, 360); up(dl, W('B4', 'miss'), 20);
  const ml = at(host, `<div class="mono" style="font-size:28px;color:${GOLD}">← $$$ FOR YOUR FILE</div>`, 1100, 710); up(ml, W('B4', 'buy') - .1, 20);
  const tag = at(host, `<div class="pill" style="position:relative;background:#fff;color:#1a2347;font-size:38px">THE CUSTOMER</div>`, 100, 160);
  pop(tag, W('B4', "you're") - .1); const st = at(host, `<div style="width:380px;height:12px;border-radius:6px;background:${RED}"></div>`, 100, 190); tl.set(st, { scaleX: 0, transformOrigin: '0 50%' }, 0); tl.to(st, { scaleX: 1, duration: .25 }, W('B4', 'customer') + .1); cue(W('B4', 'customer') + .1, 'slash', .5, -.6);
  tl.to(st, { opacity: 0, duration: .2 }, W('B4', 'are') - .5);
  tl.to(tag, { x: 1340, y: -100, duration: .6, ease: 'power3.inOut' }, W('B4', 'are') - .45); tl.to(tag, { backgroundColor: GOLD, duration: .3 }, W('B4', 'are')); cue(W('B4', 'are') - .4, 'whoosh', .5, .6); cue(W('B4', 'are') + .1, 'ding', .5, .7);
  // B5: prescreened offers
  const t5 = V('B5') - .2;
  tl.to([you, bur, ...buyers, dl, ml, tag], { opacity: 0, duration: .3 }, t5);
  const mb = at(host, A.mailbox(260), 140, 330); up(mb, t5 + .2, 50);
  const envs = [];
  for (let i = 0; i < 7; i++) { const e = at(host, `<div style="position:relative">${A.env(150, '#fff', '#c9b98f')}<div style="position:absolute;left:10px;top:30px;padding:4px 8px;border-radius:6px;background:${RED};font:900 15px/1 'Unbounded';color:#fff">PRE-APPROVED!</div></div>`, 300 + i * 30, -160); tl.set(e, { opacity: 0, rotation: -20 + i * 7 }, 0); tl.to(e, { opacity: 1, duration: .05 }, W('B5', 'pre-approved') - .3 + i * .1); tl.to(e, { y: 520 - i * 14, x: -110 + (i % 3) * 20, rotation: (i % 2 ? 1 : -1) * 12, duration: .45, ease: 'power2.in' }, W('B5', 'pre-approved') - .3 + i * .1); cue(W('B5', 'pre-approved') + i * .1, 'paper', .25, -.6); envs.push(e); }
  const list = at(host, `<div class="paper" style="position:relative;width:820px;padding:34px 44px;background:#f7f9ff"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="anton" style="font-size:52px;color:#1a2347">PRESCREEN LIST</div><div class="mono" style="font-size:22px;color:#8390b5">FOR: CARD LENDER</div></div><div class="rows" style="margin-top:20px"></div></div>`, 900, 130);
  tl.set(list, { opacity: 0, rotationY: -40, transformPerspective: 1600 }, 0); tl.to(list, { opacity: 1, rotationY: 0, duration: .5, ease: 'power3.out' }, W('B5', 'law') - .2); cue(W('B5', 'law'), 'paper', .5, .5);
  const rows = list.querySelector('.rows');
  const N = [['A. ADAMS', 781], ['K. BROOKS', 642], ['M. CHEN', 755], ['D. DIAZ', 598], ['R. EVANS', 712], ['S. FOX', 803]];
  const rowEls = N.map(([n, sc0], i) => { const r = div('', rows, `<span>${n}</span><span style="color:#8390b5">····</span><span style="color:${scoreColor(sc0).replace('rgb', 'rgb')};font-weight:800">${sc0}</span>`, `position:absolute;left:44px;top:${96 + i * 62}px;width:732px;display:flex;justify-content:space-between;font:700 34px/1 'JetBrains Mono';color:#1a2347`); tl.set(r, { opacity: 0, x: -30 }, 0); tl.to(r, { opacity: 1, x: 0, duration: .2 }, W('B5', 'lists') + i * .08); return [r, sc0]; });
  list.firstChild.style.height = (96 + 6 * 62 + 20) + 'px';
  cue(W('B5', 'lists'), 'type', .4, .5, { dur: .5 });
  const order = rowEls.map((r, i) => i).sort((a, b) => rowEls[b][1] - rowEls[a][1]);
  order.forEach((ri, pos) => { tl.to(rowEls[ri][0], { y: (pos - ri) * 62, duration: .5, ease: 'power3.inOut' }, W('B5', 'sorted')); });
  cue(W('B5', 'sorted'), 'slide', .5, .5);
  const sell = pill(host, '$ SOLD TO LENDERS', GOLD, '#120d04', 980, 640, 38); pop(sell, W('B5', 'sell') - .05); cue(W('B5', 'sell'), 'coins', .4, .5);
  const op = stampOn(host, 'ON PAPER', 'gold', 1380, 620, W('B5', 'paper') - .1, -8, 60);
  // B5c: can't delete, can freeze, can dispute — it's theirs
  const tc = V('B5c') - .2;
  tl.to([mb, list, sell, op, ...envs], { opacity: 0, duration: .3 }, tc);
  const F = folder(host, 200, 180, 760, 520, 'YOUR FILE', `<div class="anton" style="font-size:46px;color:#3a2410">CREDIT FILE</div>`);
  tl.set(F.f, { opacity: 0, rotationX: 10, rotationY: 10 }, 0); tl.to(F.f, { opacity: 1, duration: .3 }, tc + .2); cue(tc + .2, 'thud', .5, -.5);
  const btn = (lbl, bg, y, w) => { const b = at(host, `<div style="position:relative;width:560px;height:130px;border-radius:24px;background:${bg};display:flex;align-items:center;justify-content:center;font:900 52px/1 'Unbounded';color:#fff;box-shadow:0 14px 0 rgba(0,0,0,.35)">${lbl}</div>`, 1160, y); tl.set(b, { opacity: 0, x: 160 }, 0); tl.to(b, { opacity: 1, x: 0, duration: .35, ease: 'back.out(1.6)' }, W('B5c', w) - .2); return b; };
  const bD = btn('DELETE', '#5a5f78', 170, 'delete'); tl.to(bD, { x: 14, duration: .05, yoyo: true, repeat: 7 }, W('B5c', 'delete') + .25); cue(W('B5c', 'delete') + .25, 'buzz', .5, .6);
  const no = at(host, `<div class="mono" style="font-size:30px;color:${RED}">✗ NOT AN OPTION</div>`, 1180, 310); up(no, W('B5c', 'file') - .1, 10);
  const bF = btn('❄ FREEZE', '#2a8ad8', 380, 'freeze'); cue(W('B5c', 'freeze'), 'ding', .45, .6);
  const ice = at(host, `<div style="width:760px;height:520px;border-radius:12px;background:linear-gradient(135deg,rgba(191,232,255,.55),rgba(191,232,255,.15));border:4px solid rgba(255,255,255,.6)"></div>`, 200, 180); tl.set(ice, { opacity: 0 }, 0); tl.to(ice, { opacity: 1, duration: .4 }, W('B5c', 'freeze') + .1);
  const bP = btn('⚑ DISPUTE', '#c9862a', 590, 'dispute'); cue(W('B5c', 'dispute'), 'ding', .45, .6);
  stampOn(host, 'PROPERTY OF THE BUREAUS', 'red', 160, 380, W('B5c', 'theirs') - .1, -8, 54);
  cam(id, { z: 1.04, x: -10 });
}

// b3: The Work Number — payroll records, job titles, start dates, salary
{
  const id = 'b3', host = sc(id); through(id); chip(id, 'BEYOND CREDIT', 4);
  const bcard = at(host, ccard(520, 'CREDIT', '#1b3a6b', '#0b1a33'), 300, 260); tl.set(bcard, { rotationY: -14, transformPerspective: 1400 }, 0); pop(bcard, S(id) + .1, .6);
  const bey = at(host, `<div class="anton" style="font-size:150px;color:#fff;text-shadow:0 10px 0 rgba(0,0,0,.5)">WAY <span style="color:${GOLD}">BEYOND</span> →</div>`, 900, 380); fromL(bey, W('B5b', 'way') - .1, -200); cue(W('B5b', 'way'), 'whoosh', .5, .4);
  tl.to(bcard, { x: -500, rotation: -20, opacity: 0, duration: .5, ease: 'power2.in' }, W('B5b', 'credit') + .1); cue(W('B5b', 'credit') + .1, 'swoosh', .4, -.6);
  tl.to(bey, { x: 600, opacity: 0, duration: .4, ease: 'power2.in' }, W('B5b', 'equifax') - .35);
  const db = at(host, `<div style="position:relative;width:360px;height:500px">${[0, 1, 2, 3].map(i => `<div style="position:absolute;left:0;top:${60 + i * 100}px;width:360px;height:110px;border-radius:50%/40px;background:linear-gradient(180deg,#3a4a8a,#1a2347);border:3px solid #5a6aa8"></div>`).join('')}<div style="position:absolute;left:0;top:0;width:360px;height:120px;border-radius:50%;background:radial-gradient(ellipse,#6a7ac8,#2c3a72);border:3px solid #8a9ae8"></div>
    <div class="anton" style="position:absolute;left:0;top:200px;width:360px;text-align:center;font-size:52px;color:#fff;line-height:1.05">THE WORK<br>NUMBER</div></div>`, 160, 200);
  tl.set(db, { opacity: 0, y: 120, rotationX: 30, transformPerspective: 1400 }, 0); tl.to(db, { opacity: 1, y: 0, rotationX: 0, duration: .55, ease: 'back.out(1.4)' }, W('B5b', 'equifax') - .1); cue(W('B5b', 'equifax'), 'thud', .6, -.6); tl.to(db, { scale: 1.05, duration: .2, yoyo: true, repeat: 1 }, W('B5b', 'database'));
  const eqx = at(host, A.equifax(240), 220, 140); pop(eqx, W('B5b', 'equifax') - .1); cue(W('B5b', 'equifax'), 'pop', .4, -.6);
  const emp = ['ACME CO.', 'PAYROLL INC', 'MEGAMART', 'CITY HOSP.'];
  emp.forEach((n, i) => { const e = at(host, `<div class="pill" style="position:relative;background:rgba(10,14,34,.85);border:2px solid ${SKY};color:${SKY};font-size:22px">${n}</div>`, 40 + (i % 2) * 260, i > 1 ? 730 : 800); pop(e, W('B5b', 'employer') - .2 + i * .08, .5); stream(host, 160 + (i % 2) * 240, i > 1 ? 730 : 800, 330, 640, W('B5b', 'payroll') + i * .05, VE('B5b'), SKY, .16, 10); });
  const H = ['EMPLOYER', 'JOB TITLE', 'START DATE', 'SALARY'];
  const D = [['ACME CO.', 'Analyst II', '03/2019', '$68,400'], ['MEGAMART', 'Shift Lead', '11/2021', '$41,250'], ['CITY HOSP.', 'RN', '06/2016', '$83,900'], ['PAYROLL INC', 'Designer', '01/2023', '$57,300'], ['ACME CO.', 'Driver', '08/2020', '$49,800']];
  const cols = [260, 260, 230, 230];
  const tb = at(host, `<div class="card" style="position:relative;width:1040px;padding:26px 30px"><div style="display:flex">${H.map((h, i) => `<div class="mono h${i}" style="width:${cols[i]}px;font-size:26px;color:${CREAM};padding:10px 12px;border-radius:10px">${h}</div>`).join('')}</div>
    ${D.map(r => `<div style="display:flex;border-top:2px solid rgba(255,255,255,.12)">${r.map((c, i) => `<div class="c${i}" style="width:${cols[i]}px;font:700 30px/1 'JetBrains Mono';color:#fff;padding:20px 12px;${i === 3 ? 'filter:blur(9px);' : ''}">${c}</div>`).join('')}</div>`).join('')}</div>`, 700, 150);
  tl.set(tb, { opacity: 0, rotationY: -30, transformPerspective: 1800 }, 0); tl.to(tb, { opacity: 1, rotationY: -6, duration: .55, ease: 'power3.out' }, W('B5b', 'called') - .2); cue(W('B5b', 'called') - .1, 'type', .4, .5, { dur: .6 });
  tl.to(tb, { scale: 1.03, duration: .2, yoyo: true, repeat: 1 }, W('B5b', 'records'));
  const hi = (i, t) => { tl.to(tb.querySelector('.h' + i), { backgroundColor: GOLD, color: '#120d04', duration: .2 }, t); tl.to(tb.querySelectorAll('.c' + i), { color: GOLD, duration: .2 }, t); cue(t, 'blip', .35, .5, { f: 1000 + i * 200 }); };
  hi(1, W('B5b', 'job') - .05); hi(2, W('B5b', 'start') - .05); hi(3, W('B5b', 'salary') - .05);
  tl.to(tb.querySelectorAll('.c3'), { filter: 'blur(0px)', duration: .4 }, W('B5b', 'salary'));
  const ct = at(host, `<div class="pill" style="position:relative;background:${GOLD};color:#120d04;font-size:36px">HUNDREDS OF MILLIONS OF RECORDS</div>`, 860, 760); pop(ct, W('B5b', 'hundreds') - .1); cue(W('B5b', 'hundreds'), 'impact', .5, .4);
  const mg = at(host, `<svg viewBox="0 0 160 160" style="width:180px;height:180px"><circle cx="64" cy="64" r="50" fill="rgba(255,255,255,.15)" stroke="${GOLD}" stroke-width="12"/><rect x="98" y="104" width="22" height="64" rx="10" fill="${GOLD}" transform="rotate(-45 109 136)"/></svg>`, 1500, 300);
  tl.set(mg, { opacity: 0 }, 0); tl.to(mg, { opacity: 1, duration: .2 }, W('B5b', 'salary') - .3); tl.fromTo(mg, { y: 0 }, { y: 260, duration: 1, ease: 'sine.inOut', immediateRender: false }, W('B5b', 'salary') - .3);
  src(host, 'Source: Equifax, The Work Number', W('B5b', 'number') + .3);
  cam(id, { z: 1.05, x: -12, ry: 2 });
}

// b4: FICO's toll, Credit Karma, and the score you see vs the one they see
{
  const id = 'b4', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE MIDDLEMEN', 4);
  const fl = at(host, A.fico(320), 160, 150); pop(fl, W('B6', 'fico') - .1); cue(W('B6', 'fico'), 'pop', .5, -.6);
  const reg = at(host, `<div style="position:relative;width:520px;height:330px;border-radius:26px;background:linear-gradient(180deg,#2c3a72,#141c3e);border:4px solid #5a6aa8;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div class="mono" style="position:absolute;left:30px;top:24px;font-size:24px;color:${CREAM}">SCORE PULLS TODAY</div><div class="big pc" style="position:absolute;left:30px;top:96px;font-size:80px;color:${GOLD}">0</div><div class="mono" style="position:absolute;left:30px;bottom:30px;font-size:26px;color:#9fd3ff">FICO GETS PAID EACH TIME</div></div>`, 140, 380);
  up(reg, V('B6') + .25, 50);
  const pc = reg.querySelector('.pc'); ['paid', 'pull', 'score'].forEach((w, i) => { const t = W('B6', w); tl.set(pc, { textContent: commas((i + 1) * 1e6 + 234567 * (i + 1)) }, t); tl.to(reg, { scale: 1.04, duration: .1, yoyo: true, repeat: 1 }, t); cue(t, 'coins', .4, -.5); const c = at(host, A.coin(70), 600, 520); tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .05 }, t); tl.to(c, { x: -280, y: -370, scale: .5, duration: .5, ease: 'power2.in' }, t); tl.to(c, { opacity: 0, duration: .1 }, t + .45); });
  tl.set(pc, { textContent: '0' }, 0);
  const pb = at(host, `<div class="card" style="position:relative;width:1000px;padding:40px 50px"><div class="mono" style="font-size:28px;color:${CREAM}">PRICE OF ONE MORTGAGE SCORE</div><div style="display:flex;align-items:center;gap:30px;margin-top:20px"><div class="big" style="font-size:76px;color:rgba(255,255,255,.55)">$3.50</div><div class="big" style="font-size:60px;color:${GOLD}">→</div><div class="big pv" style="font-size:92px;color:#fff">$3.50</div></div></div>`, 820, 170);
  up(pb, W('B6', '2025') - .2, 50); cue(W('B6', '2025'), 'whoosh', .4, .5);
  countTo(pb.querySelector('.pv'), W('B6', 'raised'), 1, 3.5, 4.95, v => '$' + v.toFixed(2)); cue(W('B6', 'raised'), 'counter', .4, .5, { dur: 1 });
  const up41 = at(host, `<div class="big glow" style="font-size:150px;--acc:${RED}">+41%</div>`, 900, 520); slam(up41, W('B6', '41') - .05); cue(W('B6', '41') + .15, 'impact', .7, .5); R.shake(W('B6', '41') + .15, 10, .3);
  src(host, 'Source: FICO mortgage royalty, 2025 ($3.50 → $4.95 per score)', W('B6', '41') + .3);
  // B7: Credit Karma
  const t7 = V('B7') - .2;
  tl.to([fl, reg, pb, up41], { opacity: 0, duration: .3 }, t7);
  tl.to(host.querySelectorAll('.mono.abs'), { opacity: 0, duration: .2 }, t7);
  const ph = phone(host, 220, 110, 330, `<div style="padding:24px;text-align:center"><div style="margin-top:6px">${A.karma(250)}</div><div class="mono" style="font-size:20px;color:#9aa;margin-top:30px">YOUR SCORE</div><div class="big" style="font-size:96px;color:#3dff9a">712</div><div class="fr" style="display:inline-block;margin-top:10px;padding:8px 22px;border-radius:20px;background:#3dff9a;color:#04221f;font:900 26px/1 'Unbounded'">FREE</div><div class="feed" style="position:relative;margin-top:26px;height:240px;overflow:hidden"></div></div>`, '#0b7a3e');
  tl.set(ph, { opacity: 0, y: 200, rotationY: 30, transformPerspective: 1600 }, 0); tl.to(ph, { opacity: 1, y: 0, rotationY: 8, duration: .6, ease: 'power3.out' }, W('B7', 'apps') - .3); cue(W('B7', 'apps') - .2, 'whoosh', .5, -.5);
  tl.to(ph, { rotationY: -6, duration: 4, ease: 'sine.inOut' }, W('B7', 'apps') + .4);
  const fr = ph.querySelector('.fr'); tl.set(fr, { scale: 0 }, 0); tl.to(fr, { scale: 1, duration: .3, ease: 'back.out(3)' }, W('B7', 'free') - .05); cue(W('B7', 'free'), 'pop', .5, -.5);
  const deal = at(host, `<div class="card" style="position:relative;width:900px;padding:40px 50px"><div style="display:flex;align-items:center;gap:30px">${A.karma(300)}<div class="big" style="font-size:60px;color:${GOLD}">→</div>${A.intuit(240)}</div><div class="kick" style="margin-top:34px">SOLD FOR</div><div class="big glow dv" style="font-size:120px;margin-top:10px;--acc:${GOLD}">$0.0B</div></div>`, 800, 150);
  up(deal, W('B7', 'credit') - .2, 50); cue(W('B7', 'sold'), 'ding', .5, .5);
  countTo(deal.querySelector('.dv'), W('B7', '71') - .1, .8, 0, 7.1, v => '$' + v.toFixed(1) + 'B'); cue(W('B7', '71'), 'counter', .4, .5, { dur: .8 });
  const feed = ph.querySelector('.feed');
  [['CARD OFFER · APPLY', '#c8102e'], ['CARD OFFER · APPLY', '#1b6bd8'], ['PERSONAL LOAN', '#ffb347']].forEach(([txt, c], i) => { const o = div('', feed, txt, `position:absolute;left:0;top:${i * 78}px;width:100%;padding:18px 0;border-radius:14px;background:${c};font:800 20px/1 'Unbounded';color:#fff`); tl.set(o, { opacity: 0, y: 60 }, 0); tl.to(o, { opacity: 1, y: 0, duration: .3, ease: 'back.out(2)' }, W('B7', i < 2 ? 'more' : 'loans') - .1 + i * .15); cue(W('B7', i < 2 ? 'more' : 'loans') + i * .15, 'pop', .35, -.5); });
  const fee = at(host, `<div class="pill" style="position:relative;background:${GOLD};color:#120d04;font-size:34px">$ REFERRAL FEES</div>`, 900, 660); pop(fee, W('B7', 'recommending') - .1);
  for (let i = 0; i < 5; i++) { const c = at(host, A.coin(56), 520, 600); const t = W('B7', 'recommending') + i * .2; tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: 1, duration: .05 }, t); tl.to(c, { x: 460 + i * 30, y: 60, duration: .5, ease: 'power2.inOut' }, t); tl.to(c, { opacity: 0, duration: .1 }, t + .45); }
  cue(W('B7', 'recommending'), 'coins', .4, .3);
  // B7b: the score you see vs the score they see
  const tb = V('B7b') - .2;
  tl.to([deal, fee], { opacity: 0, duration: .3 }, tb);
  tl.set(fr, { textContent: 'FREE' }, 0); tl.set(fr, { textContent: 'VANTAGESCORE', fontSize: '19px' }, W('B7b', 'vantagescore')); tl.set(fr, { fontSize: '26px' }, 0);
  tl.to(fr, { backgroundColor: '#9b7bff', color: '#fff', duration: .2 }, W('B7b', 'vantagescore')); cue(W('B7b', 'vantagescore'), 'blip', .4, -.5);
  const lm = at(host, `<div style="width:640px;height:420px;border-radius:24px;background:#0b1430;border:8px solid #3a4670;padding:36px 44px;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div class="mono" style="font-size:26px;color:${CREAM}">LENDER VIEW · FICO</div><div class="big lv" style="font-size:150px;color:${AMBER};margin-top:40px">???</div><div class="mono" style="font-size:26px;color:#8390b5;margin-top:10px">MORTGAGE MODEL</div></div>`, 1120, 140);
  up(lm, W('B7b', 'fico') - .3, 50); cue(W('B7b', 'fico'), 'whoosh', .4, .6);
  tl.set(lm.querySelector('.lv'), { textContent: '???' }, 0); tl.set(lm.querySelector('.lv'), { textContent: '688' }, W('B7b', 'see') - .1); cue(W('B7b', 'see'), 'impact', .5, .6);
  const ne = at(host, `<div class="big glow" style="font-size:150px;--acc:${RED}">≠</div>`, 760, 260); slam(ne, W('B7b', "isn't") - .05); cue(W('B7b', "isn't") + .15, 'stamp', .5);
  const V2 = ['FICO 2', 'FICO 4', 'FICO 5', 'FICO 8', 'FICO 9', 'FICO 10T', 'AUTO 8', 'BANKCARD 8', 'VANTAGE 3', 'VANTAGE 4'];
  V2.forEach((v, i) => { const c = at(host, `<div class="tag">${v}</div>`, 1080 + (i % 5) * 140, 620 + Math.floor(i / 5) * 76); tl.set(c, { opacity: 0, y: 40, rotation: (i % 3 - 1) * 6 }, 0); tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, W('B7b', 'dozens') - .1 + i * .07); cue(W('B7b', 'dozens') + i * .07, 'tick', .2, .6, { f: 1700 + i * 80 }); });
  cam(id, { z: 1.05, y: -10 });
}
