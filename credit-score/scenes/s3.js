/* s3: chapter 5 (when the file is wrong), chapter 6 (what it costs you), the fixes, the twist, the debate + end screen */
const report = (host, x, y, w, rows, title = 'CREDIT REPORT') => at(host, `<div class="paper" style="position:relative;width:${w}px;padding:30px 40px;background:#f7f9ff"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="anton" style="font-size:44px;color:#1a2347">${title}</div><div class="mono" style="font-size:20px;color:#8390b5">J. DOE · PAGE 2</div></div>
  ${rows.map(([a, b, c], i) => `<div class="rr${i}" style="display:flex;justify-content:space-between;font:700 28px/1 'JetBrains Mono';color:#1a2347;padding:16px 0;border-top:2px solid #e3e8f5"><span>${a}</span><span style="color:${c || '#1f7a3a'}">${b}</span></div>`).join('')}</div>`, x, y);

/* ================= CHAPTER 5: WHEN THE FILE IS WRONG ================= */
const TRI = (w, c = '#ffd23f') => `<svg viewBox="0 0 200 180" style="width:${w}px;height:${w * .9}px"><path d="M100,10 L192,170 L8,170 Z" fill="${c}" stroke="#1a0a0a" stroke-width="8" stroke-linejoin="round"/><rect x="90" y="60" width="20" height="60" rx="8" fill="#1a0a0a"/><circle cx="100" cy="142" r="12" fill="#1a0a0a"/></svg>`;
propLayer('alert', [TRI(90, '#ff8a8a'), A.lock(80, '#ff8a8a'), `<div class="mono" style="font-size:60px;color:#ffb3b3">!</div>`, A.env(100, '#ffd6d6', '#c97a7a')], S('e0'), E('e2'), 16, .13);
chapterCard('e0', 5, 'WHEN THE FILE IS WRONG', 'Errors, disputes — and a breach', TRI(280), RED, 'alert');

// e1: the FTC numbers + the dispute machine
{
  const id = 'e1', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE ERRORS', 5);
  const tri = at(host, TRI(300), 960, 280); center(tri); pop(tri, V('E1') - .1, .4); cue(V('E1'), 'buzz', .5);
  tl.to(tri, { scale: 1.1, duration: .35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, V('E1') + .3);
  const wr = at(host, `<div class="anton" style="font-size:90px;color:#fff">THIS SHOULD WORRY YOU</div>`, 960, 620); center(wr); up(wr, W('E1', 'worry') - .15, 30);
  tl.to([tri, wr], { opacity: 0, duration: .3 }, V('E2') - .2);
  const ftc = at(host, A.ftc(270), 140, 170); pop(ftc, W('E2', 'federal') - .1, .4); cue(W('E2', 'federal'), 'clunk', .5, -.7);
  const five = [0, 1, 2, 3, 4].map(i => { const p = at(host, A.person(120, CREAM), 640 + i * 230, 160, `color:${CREAM}`); up(p, W('E2', 'one') - .2 + i * .06, 40); return p; });
  const err = at(host, `<div class="pill" style="position:relative;background:${RED};color:#fff;font-size:30px">ERROR</div>`, 1120, 380);
  tl.to(five[2], { color: RED, duration: .2 }, W('E2', 'five') - .05); five[2].querySelectorAll('circle,path').forEach(e => e.setAttribute('fill', 'currentColor'));
  pop(err, W('E2', 'five')); cue(W('E2', 'five'), 'buzz', .45, .2);
  const k5 = at(host, `<div class="big glow" style="font-size:96px;--acc:${RED}">1 in 5</div>`, 140, 480); slam(k5, W('E2', 'one') - .05);
  const rp = report(host, 640, 470, 1100, [['CITY AUTO LOAN', 'PAID AS AGREED'], ['VISA •••• 4421', 'CURRENT'], ['MEDCOLL AGENCY', 'LATE 90 DAYS', '#b3262e']]);
  tl.set(rp, { opacity: 0, y: 80 }, 0); tl.to(rp, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' }, W('E2', 'error') - .3); cue(W('E2', 'error') - .2, 'paper', .5, .4);
  ring(rp, 620, 190, 480, 96, W('E2', 'reports') - .2);
  const ny = at(rp, `<div class="mono" style="font-size:26px;color:#b3262e">↑ not even yours</div>`, 700, 300); up(ny, W('E2', 'reports'), 10);
  // E3: one in twenty pay more
  const t3 = V('E3') - .2;
  tl.to([...five, err, k5], { opacity: 0, duration: .25 }, t3);
  const twenty = []; for (let i = 0; i < 20; i++) { const p = at(host, A.person(56, CREAM), 640 + (i % 10) * 110, 150 + Math.floor(i / 10) * 120, `color:${CREAM}`); tl.set(p, { opacity: 0 }, 0); tl.to(p, { opacity: 1, duration: .15 }, t3 + .1 + i * .03); twenty.push(p); }
  twenty[13].querySelectorAll('circle,path').forEach(e => e.setAttribute('fill', 'currentColor'));
  tl.to(twenty[13], { color: AMBER, scale: 1.3, duration: .25 }, W('E3', 'twenty') - .05); cue(W('E3', 'twenty'), 'ding', .4, .4);
  const k20 = at(host, `<div class="big glow" style="font-size:96px;--acc:${AMBER}">1 in 20</div>`, 140, 480); slam(k20, W('E3', 'one') - .05);
  const pm = at(host, `<div class="pill" style="position:relative;background:${AMBER};color:#1a0a0a;font-size:30px">$ PAYS MORE ↑</div>`, 1000, 400); pop(pm, W('E3', 'pay') - .05); cue(W('E3', 'pay'), 'coins', .4, .3);
  src(host, 'Source: FTC report to Congress on credit report accuracy (2012)', W('E3', 'loan'));
  // E3b: the dispute machine
  const tb = V('E3b') - .2;
  tl.to([ftc, ...twenty, k20, pm, ny], { opacity: 0, duration: .3 }, tb);
  tl.to(rp, { x: 0, y: 160, scale: .78, opacity: .9, duration: .5, ease: 'power3.inOut' }, tb);
  tl.to(host.querySelectorAll('.mono.abs'), { opacity: 0, duration: .2 }, tb);
  const let1 = at(host, `<div class="paper" style="position:relative;width:340px;height:400px;padding:30px;background:#fffaf0"><div class="serif" style="font-size:40px;color:#1a2347">Dear Bureau,</div>${[90, 80, 95, 70, 88, 60].map(w => `<div style="height:10px;width:${w}%;margin:22px 0;background:#c9cfe0;border-radius:5px"></div>`).join('')}<div class="serif" style="font-size:34px;color:#1a2347">— J. Doe</div></div>`, 140, 130);
  tl.set(let1, { opacity: 0, x: -200, rotation: -8 }, 0); tl.to(let1, { opacity: 1, x: 0, rotation: -3, duration: .45, ease: 'back.out(1.5)' }, W('E3b', 'dispute') - .15); cue(W('E3b', 'dispute'), 'paper', .5, -.7);
  const mach = at(host, `<div style="position:relative;width:380px;height:300px;border-radius:28px;background:linear-gradient(180deg,#5a6278,#2a3042);border:5px solid #8a92a8;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div class="mono" style="position:absolute;left:0;top:30px;width:100%;text-align:center;font-size:26px;color:${CREAM}">DISPUTE SYSTEM</div><div class="pr" style="position:absolute;left:40px;right:40px;top:90px;height:24px;border-radius:12px;background:${RED}"></div><div class="mono" style="position:absolute;left:0;bottom:30px;width:100%;text-align:center;font-size:22px;color:#9aa">2–3 DIGIT CODES</div></div>`, 700, 160);
  up(mach, W('E3b', 'letter') - .2, 50);
  const tBoil = W('E3b', 'boiled');
  tl.to(let1, { x: 600, y: 60, scaleX: .2, scaleY: .05, rotation: 0, duration: .55, ease: 'power3.in' }, tBoil - .1); tl.to(let1, { opacity: 0, duration: .1 }, tBoil + .4);
  tl.to(mach, { scaleY: .9, duration: .1, yoyo: true, repeat: 3 }, tBoil + .4); cue(tBoil + .4, 'crash', .5, -.2);
  const chipc = at(host, `<div style="padding:12px 22px;border-radius:10px;background:${GOLD};font:800 34px/1 'JetBrains Mono';color:#120d04;box-shadow:0 0 20px ${GOLD}">CODE 001</div>`, 820, 470);
  pop(chipc, W('E3b', 'code') - .05, .3); cue(W('E3b', 'code'), 'blip', .5, 0, { f: 1800 });
  const lend = at(host, `<div style="text-align:center">${A.bank(230)}<div class="mono" style="font-size:24px;color:${CREAM};margin-top:8px">WHOEVER REPORTED IT</div></div>`, 1440, 140);
  up(lend, W('E3b', 'sent') - .2, 40);
  tl.to(chipc, { x: 680, y: -230, duration: .6, ease: 'power2.inOut' }, W('E3b', 'sent')); cue(W('E3b', 'sent'), 'swoosh', .5, .6);
  tl.to(chipc, { opacity: 0, duration: .15 }, W('E3b', 'sent') + .55);
  const ver = stampOn(host, 'VERIFIED ✓', 'green', 1380, 420, W('E3b', 'confirm') - .05, -8, 56);
  const st = stampOn(host, 'ERROR STAYS', 'red', 760, 640, W('E3b', 'stays') - .1, -6, 64);
  cam(id, { z: 1.04, x: -10 });
}

// e1b: medical debt
{
  const id = 'e1b', host = sc(id); through(id); chip(id, 'MEDICAL BILLS', 5);
  const bill = at(host, `<div class="paper" style="position:relative;width:520px;padding:34px 40px;background:#fffaf0"><div style="display:flex;align-items:center;gap:20px">${A.cross(80)}<div class="anton" style="font-size:48px;color:#1a2347">CITY HOSPITAL</div></div>${['ER VISIT ........ $1,240', 'X-RAY ............ $380', 'LAB ............... $96'].map(l => `<div class="mono" style="font-size:28px;color:#1a2347;margin-top:22px">${l}</div>`).join('')}</div>`, 140, 160);
  tl.set(bill, { opacity: 0, rotation: -12, y: 100 }, 0); tl.to(bill, { opacity: 1, rotation: -4, y: 0, duration: .5, ease: 'back.out(1.5)' }, S(id) + .1); cue(S(id) + .15, 'paper', .5, -.6);
  const paid = stampOn(host, 'PAID ✓', 'green', 330, 400, W('E3c', 'paid-off') - .05, -10, 64);
  const cal = at(host, `<div style="width:330px;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)"><div class="anton" style="background:${RED};color:#fff;font-size:30px;text-align:center;padding:10px">STILL ON YOUR REPORT</div><div class="big yv" style="background:#f5f1e6;color:#1a1208;font-size:96px;text-align:center;padding:28px 0">2016</div></div>`, 760, 160);
  up(cal, W('E3c', 'report') - .3, 50);
  const yv = cal.querySelector('.yv'); ['2017', '2018', '2019', '2020', '2021'].forEach((y, i) => { const t = W('E3c', 'years') - .1 + i * .14; tl.set(yv, { textContent: y }, t); cue(t, 'flip', .25, .1); }); tl.set(yv, { textContent: '2016' }, 0);
  const rp = report(host, 1140, 160, 640, [['MEDICAL COLLECTION', '$1,716', '#b3262e'], ['MEDICAL COLLECTION', '$310', '#b3262e'], ['VISA •••• 4421', 'CURRENT']], 'YOUR REPORT');
  up(rp, W('E3c', 'sit') - .2, 50);
  const y22 = at(host, `<div class="big glow" style="font-size:110px;--acc:${GRN}">2022</div>`, 140, 570); slam(y22, W('E3c', '2022') - .05); cue(W('E3c', '2022') + .15, 'impact', .5, -.5);
  const er = (i, t) => { const r = rp.querySelector('.rr' + i); tl.to(r, { opacity: .15, x: 60, duration: .35, ease: 'power2.in' }, t); cue(t, 'dissolve', .4, .6); };
  er(0, W('E3c', 'removing'));
  const y23 = at(host, `<div class="big glow" style="font-size:110px;--acc:${GRN}">2023</div>`, 620, 570); slam(y23, W('E3c', '2023') - .05); cue(W('E3c', '2023') + .15, 'impact', .4, 0);
  er(1, W('E3c', '2023') + .3);
  const blocks = at(host, `<div style="display:flex;gap:12px">${Array(10).fill(0).map((_, i) => `<i class="bk${i}" style="display:block;width:64px;height:110px;border-radius:12px;background:${RED};box-shadow:0 0 18px rgba(255,74,61,.5)"></i>`).join('')}</div>`, 1060, 600);
  up(blocks, W('E3c', 'nearly') - .3, 30);
  for (let i = 0; i < 7; i++) { const t = W('E3c', '70') + i * .1; tl.to(blocks.querySelector('.bk' + i), { opacity: .08, scale: .6, duration: .2 }, t); cue(t, 'pop', .25, .5); }
  const k70 = at(host, `<div class="big glow" style="font-size:100px;--acc:${GRN}">−70%</div>`, 1060, 740); up(k70, W('E3c', 'gone') - .2, 20);
  src(host, 'Source: Equifax, Experian, TransUnion joint announcement (2022–2023)', W('E3c', 'gone'));
  cam(id, { z: 1.05, y: -12 });
}

// e2: the 2017 breach, the settlement, no take-backs → it costs you every month
{
  const id = 'e2', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE BREACH', 5);
  const rem = at(host, `<div style="display:flex;align-items:center;gap:26px"><div class="pill" style="position:relative;background:${RED};color:#fff;font-size:34px">⚑ REMEMBER?</div>${A.equifax(380)}</div>`, 960, 140); center(rem);
  pop(rem, W('E4', 'remember') - .1, .5); cue(W('E4', 'remember'), 'ding', .5);
  const racks = [0, 1, 2].map(i => { const r = at(host, A.server(200), 600 + i * 250, 300); up(r, W('E4', '2017') - .2 + i * .08, 60); return r; });
  const y17 = at(host, `<div class="big glow" style="font-size:120px;--acc:${RED}">2017</div>`, 120, 330); slam(y17, W('E4', '2017') - .05);
  const tH = W('E4', 'hacked');
  racks.forEach((r, i) => { tl.to(r.firstChild, { borderColor: RED, backgroundColor: '#3a0e14', duration: .15 }, tH + i * .05); tl.to(r, { x: 6, duration: .04, yoyo: true, repeat: 9 }, tH + i * .05); });
  cue(tH, 'buzz', .7); cue(tH + .1, 'crash', .5); R.shake(tH + .1, 14, .4);
  const ban = at(host, `<div style="padding:16px 40px;background:${RED};font:900 64px/1 'Unbounded';color:#fff;letter-spacing:6px;box-shadow:0 0 50px rgba(255,74,61,.7)">DATA BREACH</div>`, 960, 230); center(ban); slam(ban, tH + .05);
  tl.to(rem, { opacity: 0, duration: .2 }, tH);
  const D3 = [['names', 'NAME ....... ████ ██████'], ['birth', 'BIRTH DATE . ██/██/19██'], ['social', 'SSN ........ ███-██-████']];
  const rows = D3.map(([w, txt], i) => { const r = at(host, `<div style="padding:16px 26px;border-radius:12px;background:rgba(20,4,8,.85);border:2px solid ${RED};font:700 32px/1 'JetBrains Mono';color:#ffd6d6">${txt}</div>`, 1360, 520 + i * 90); tl.set(r, { opacity: 0, x: -300 }, 0); tl.to(r, { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, W('E4', w) - .1); cue(W('E4', w), 'type', .35, .6, { dur: .3 }); return r; });
  stream(host, 960, 500, 1400, 600, W('E4', 'names'), W('E4', 'exposed') + .4, RED, .08, 12);
  const k = bigCount(host, 120, 560, 'PEOPLE', 110, RED, W('E4', '147') - .05, 1.1, 0, 147e6, commas);
  const tX = W('E4', 'exposed');
  R.flash(tX - .02, .5);
  stampOn(host, 'EXPOSED', 'red', 560, 650, tX + .05, -8, 90);
  // E4b: the settlement check
  const tS = V('E4b') - .2;
  tl.to([...racks, y17, ban, ...rows, k], { opacity: 0, duration: .3 }, tS);
  tl.to(host.querySelectorAll('.stamp'), { opacity: 0, duration: .25 }, tS);
  const chk = at(host, `<div style="position:relative;width:1200px;height:440px;border-radius:20px;background:linear-gradient(135deg,#e9f5e1,#cfe8c4);border:4px solid #5a8a4a;box-shadow:0 40px 80px rgba(0,0,0,.5);padding:44px 56px;color:#244a1a">
    <div style="display:flex;justify-content:space-between"><div class="anton" style="font-size:52px">EQUIFAX INC.</div><div class="mono" style="font-size:28px">NO. 2019-0722</div></div>
    <div class="mono" style="font-size:30px;margin-top:40px">PAY TO THE ORDER OF: <b>SETTLEMENTS</b></div>
    <div style="display:flex;align-items:center;gap:30px;margin-top:30px"><div class="mono" style="font-size:30px">UP TO</div><div class="big cv" style="font-size:96px;color:#1a3a10">$0</div></div>
    <svg viewBox="0 0 400 80" style="position:absolute;right:60px;bottom:40px;width:400px;height:80px"><path class="sig" d="M10,60 C60,0 90,80 140,30 S220,70 260,30 S340,10 390,50" fill="none" stroke="#1a3a10" stroke-width="5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg></div>`, 360, 220);
  tl.set(chk, { opacity: 0, rotationX: 60, transformPerspective: 1600, y: 100 }, 0); tl.to(chk, { opacity: 1, rotationX: 0, y: 0, duration: .55, ease: 'back.out(1.4)' }, tS + .15); cue(tS + .2, 'paper', .6);
  countTo(chk.querySelector('.cv'), W('E4b', '700m') - .1, 1, 0, 700e6, v => '$' + commas(v)); cue(W('E4b', '700m'), 'counter', .4, 0, { dur: 1 });
  tl.to(chk.querySelector('.sig'), { attr: { 'stroke-dashoffset': 0 }, duration: .7, ease: 'power2.inOut' }, W('E4b', 'settlements') - .1); cue(W('E4b', 'settlements'), 'snip', .4, .5);
  // E5: you never chose; no take-backs
  const t5 = V('E5') - .2;
  tl.to(chk, { opacity: 0, y: -80, duration: .35 }, t5);
  const me = at(host, A.person(220, CREAM), 280, 330, `color:${CREAM}`); up(me, t5 + .15, 50);
  const bits = ['NAME', 'SSN', 'DOB', 'ADDRESS', 'ACCOUNTS', 'EMPLOYER'].map((b, i) => { const e = at(host, `<div class="tag">${b}</div>`, 560 + (i % 3) * 30, 360 + i * 60); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .15 }, W('E5', 'give') - .2 + i * .06); tl.to(e, { x: 700 + (i % 3) * 160, y: -200 + (i % 2) * 120, rotation: (i % 2 ? 1 : -1) * 12, duration: 2.8, ease: 'power1.inOut' }, W('E5', 'give') + i * .06); tl.to(e, { opacity: .25, duration: .5 }, W('E5', 'back') + .1); return e; });
  cue(W('E5', 'give'), 'stream', .35, .4, { dur: 1.2 });
  const arm = at(host, `<div style="width:300px;height:30px;border-radius:15px;background:${CREAM};transform-origin:0 50%"></div>`, 420, 470);
  tl.set(arm, { opacity: 0, scaleX: .2 }, 0); tl.to(arm, { opacity: 1, scaleX: 1.5, duration: .35, ease: 'power2.out' }, W('E5', 'take') - .15); tl.to(arm, { scaleX: .4, duration: .4, ease: 'power2.in' }, W('E5', 'take') + .35); cue(W('E5', 'take'), 'whoosh', .4, 0);
  const ntb = at(host, `<div class="anton" style="font-size:110px;color:#fff;text-shadow:0 8px 0 rgba(0,0,0,.5)">NO TAKE-BACKS.</div>`, 600, 720); fromL(ntb, W('E5', 'back') - .1, -150); cue(W('E5', 'back'), 'thud', .5);
  // E5b: the quieter cost, every month
  const tq = V('E5b') - .2;
  tl.to([me, ...bits, arm, ntb], { opacity: 0, duration: .3 }, tq);
  const big = at(host, `<div class="anton" style="font-size:120px;color:rgba(255,255,255,.4);position:relative">THE HACK<i class="st" style="position:absolute;left:-10px;right:-10px;top:50%;height:14px;border-radius:7px;background:${RED}"></i></div>`, 140, 200);
  up(big, W('E5b', 'cost') - .2, 30); tl.set(big.querySelector('.st'), { scaleX: 0, transformOrigin: '0 50%' }, 0); tl.to(big.querySelector('.st'), { scaleX: 1, duration: .25 }, W('E5b', 'hack') + .1); cue(W('E5b', 'hack') + .1, 'slash', .5, -.5);
  const qu = at(host, `<div class="anton" style="font-size:96px;color:#fff">IT'S <span style="color:${GOLD}">QUIETER.</span></div>`, 140, 340); fromL(qu, W('E5b', 'quieter') - .15, -150); cue(W('E5b', 'quieter'), 'whoosh', .3, -.5);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  months.forEach((m, i) => { const e = at(host, `<div style="width:120px;padding:14px 0;border-radius:14px;background:rgba(20,4,8,.8);border:2px solid ${GOLD};text-align:center"><div class="mono" style="font-size:24px;color:${CREAM}">${m}</div><div class="big" style="font-size:30px;color:${GOLD};margin-top:8px">−$</div></div>`, 140 + i * 140, 520); tl.set(e, { opacity: 0, y: 40 }, 0); tl.to(e, { opacity: 1, y: 0, duration: .2, ease: 'back.out(2)' }, W('E5b', 'pay') - .2 + i * .07); if (i % 3 === 0) cue(W('E5b', 'pay') - .2 + i * .07, 'coins', .2, -.8 + i * .14); });
  tl.to(sc(id), { x: -100, duration: .7, ease: 'power2.in' }, E(id) - .7);
}

/* ================= CHAPTER 6: WHAT IT COSTS YOU ================= */
propLayer('cost', [A.house(100, '#9fe0a8'), A.coin(90, '$', '#9fe0a8'), `<div class="mono" style="font-size:70px;color:#c9f5cf">%</div>`, A.car(110, '#9fe0a8')], S('c0'), E('c2'), 16, .14);
chapterCard('c0', 6, 'WHAT IT COSTS YOU', 'Same house. Different number.', A.house(300, '#3dff9a', '#eafff0'), GRN, 'cost');

// c1: the $300,000 mortgage, two scores
{
  const id = 'c1', host = sc(id); through(id, { mode: 'slide' }); chip(id, 'THE REAL PRICE', 6);
  const qt = at(host, `<div style="position:relative;padding:22px 50px;border-radius:24px;background:${GOLD};color:#120d04;font:900 110px/1 'Unbounded';box-shadow:0 0 60px rgba(255,198,64,.5)">$???</div>`, 960, 320); center(qt);
  tl.set(qt, { opacity: 0, rotation: -12, scale: .5 }, 0); tl.to(qt, { opacity: 1, rotation: 0, scale: 1, duration: .5, ease: 'back.out(2)' }, V('C1')); cue(V('C1') + .05, 'pop', .5);
  tl.to(qt, { rotationY: 360, duration: 1.2, ease: 'power2.inOut' }, W('C1', 'worth')); tl.to(qt, { opacity: 0, scale: .4, duration: .3 }, V('C2') - .15);
  const ban = at(host, `<div class="pill" style="position:relative;background:#fff;color:#08200f;font-size:44px">$300,000 MORTGAGE · 30 YEARS</div>`, 960, 130); center(ban); pop(ban, W('C2', '300000') - .1); cue(W('C2', '300000'), 'ding', .5);
  const col = (x, sc0, hue, side) => {
    const h = at(host, A.house(300, hue, '#ffe9a8'), x + 10, 200); up(h, W('C2', 'mortgage') - .15 + side * .1, 60);
    const p = at(host, A.person(90, CREAM), x + 325, 330, `color:${CREAM}`); up(p, W('C2', 'mortgage') + side * .1, 40);
    const g = gauge(host, x + 430, 180, 400, { score: 760, label: 'SCORE' }); g.show(W('C2', 'mortgage') + .1 + side * .1, .45);
    const rate = at(host, `<div class="mono" style="font-size:28px;color:${CREAM}">RATE</div><div class="big rv" style="font-size:84px;color:#fff">6.5%</div>`, x + 20, 510);
    const pay = at(host, `<div class="mono" style="font-size:28px;color:${CREAM}">PER MONTH</div><div class="big pv" style="font-size:84px;color:#fff">$0</div>`, x + 430, 510);
    return { h, p, g, rate, pay };
  };
  const L = col(120, 760, '#3dff9a', 0), Rr = col(1000, 760, '#ffb347', 1);
  const div1 = at(host, `<div style="width:6px;height:600px;border-radius:3px;background:rgba(255,255,255,.25)"></div>`, 957, 200); up(div1, W('C2', 'mortgage'), 20);
  Rr.g.to(W('C2', 'lower') - .05, 640, .8); cue(W('C2', 'lower'), 'drop', .5, .6);
  [L, Rr].forEach((c, i) => up(c.rate, W('C2', 'rate') - .1 + i * .1, 20));
  tl.set(Rr.rate.querySelector('.rv'), { textContent: '6.5%' }, 0);
  countTo(Rr.rate.querySelector('.rv'), W('C2', 'point'), 1, 6.5, 8.0, v => v.toFixed(1) + '%'); tl.to(Rr.rate.querySelector('.rv'), { color: RED, duration: .3 }, W('C2', 'higher')); cue(W('C2', 'point'), 'counter', .4, .6, { dur: 1 });
  [L, Rr].forEach((c, i) => up(c.pay, V('C3') - .2 + i * .1, 20));
  countTo(L.pay.querySelector('.pv'), V('C3'), .9, 0, 1896, v => '$' + commas(v)); countTo(Rr.pay.querySelector('.pv'), V('C3') + .1, .9, 0, 2201, v => '$' + commas(v)); cue(V('C3'), 'counter', .4, 0, { dur: .9 });
  const d300 = at(host, `<div class="pill" style="position:relative;background:${RED};color:#fff;font-size:40px">+$305 / MONTH</div>`, 1300, 655); pop(d300, W('C3', '300') - .05); cue(W('C3', '300'), 'impact', .5, .6);
  const life = at(host, `<div style="position:relative;width:1680px;height:96px;border-radius:48px;background:rgba(255,255,255,.1);border:3px solid rgba(255,255,255,.3);overflow:hidden"><i class="lf" style="position:absolute;left:0;top:0;height:100%;width:100%;background:linear-gradient(90deg,#ffb347,#ff3b4f);transform-origin:0 50%"></i><div class="big lv" style="position:absolute;left:40px;top:16px;font-size:56px;color:#fff">+$0 OVER 30 YEARS</div></div>`, 120, 755);
  up(life, W('C3', '100000') - .3, 30);
  tl.set(life.querySelector('.lf'), { scaleX: 0 }, 0); tl.to(life.querySelector('.lf'), { scaleX: 1, duration: 1.4, ease: 'power2.out' }, W('C3', '100000') - .1);
  countTo(life.querySelector('.lv'), W('C3', '100000') - .1, 1.4, 0, 109830, v => '+$' + commas(v) + ' OVER 30 YEARS'); cue(W('C3', '100000'), 'counter', .45, 0, { dur: 1.4 }); cue(W('C3', 'years') + .2, 'coins', .5);
  // C4: same house, same person, different number
  const eq = (t, y, ch, c) => { const e = at(host, `<div class="big glow" style="font-size:110px;--acc:${c}">${ch}</div>`, 960, y); center(e); slam(e, t); cue(t + .15, 'stamp', .5); return e; };
  tl.to([d300, div1], { opacity: 0, duration: .2 }, V('C4') - .1);
  eq(W('C4', 'house') - .1, 230, '=', GRN); eq(W('C4', 'person') - .1, 340, '=', GRN);
  const ne = eq(W('C4', 'three-digit') - .1, 450, '≠', RED);
  [L.g.g, Rr.g.g].forEach(g => tl.to(g, { scale: 1.08, duration: .25, yoyo: true, repeat: 1 }, W('C4', 'number')));
  src(host, 'Illustrative: $300k, 30-yr fixed, 6.5% vs 8.0% APR', W('C3', 'years'));
  cam(id, { z: 1.04, y: -10 });
}

// c2: insurers and employers
{
  const id = 'c2', host = sc(id); through(id); chip(id, 'BEYOND LOANS', 6);
  const car = at(host, A.car(420, '#4fc3ff'), 140, 260); tl.set(car, { opacity: 0, x: -500 }, 0); tl.to(car, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, V('C5') + .1); cue(V('C5') + .2, 'swoosh', .5, -.6);
  tl.to(car, { x: 30, duration: .3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, W('C5', 'car') - .1);
  const st = pill(host, 'IN MOST STATES', '#fff', '#08200f', 140, 150, 32); pop(st, W('C5', 'states') - .1);
  const pol = at(host, `<div class="card" style="position:relative;width:640px;padding:30px 40px"><div class="mono" style="font-size:26px;color:${CREAM}">AUTO INSURANCE PREMIUM</div><div style="display:flex;align-items:baseline;gap:20px;margin-top:10px"><div class="big pv" style="font-size:96px;color:#fff">$128</div><div class="mono" style="font-size:30px;color:${CREAM}">/ month</div></div><div class="mono" style="font-size:24px;color:#9fe0a8;margin-top:10px">RATED WITH A CREDIT-BASED SCORE</div></div>`, 140, 520);
  up(pol, W('C5', 'credit-based') - .25, 40);
  countTo(pol.querySelector('.pv'), W('C5', 'price') - .1, .9, 128, 187, v => '$' + Math.round(v)); tl.to(pol.querySelector('.pv'), { color: RED, duration: .3 }, W('C5', 'price') + .5); cue(W('C5', 'price'), 'counter', .4, -.5, { dur: .9 });
  const app = at(host, `<div class="paper" style="position:relative;width:780px;padding:36px 46px;background:#fffaf0"><div class="anton" style="font-size:52px;color:#1a2347">EMPLOYMENT APPLICATION</div>
    <div style="display:flex;align-items:center;gap:20px;margin-top:30px;font:700 30px/1.2 'Space Grotesk';color:#1a2347"><i class="cb" style="display:flex;align-items:center;justify-content:center;width:52px;height:52px;border:5px solid #1a2347;border-radius:10px;font:900 38px/1 'Unbounded';color:#1f7a3a"></i>I authorize a credit report check</div>
    <div style="margin-top:40px;border-bottom:3px solid #1a2347;height:70px;position:relative"><svg viewBox="0 0 400 70" style="position:absolute;left:10px;top:0;width:400px;height:70px"><path class="sig" d="M10,50 C50,0 80,70 120,30 S200,60 240,20 S320,10 390,40" fill="none" stroke="#1a2347" stroke-width="5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg></div><div class="mono" style="font-size:20px;color:#8390b5;margin-top:8px">SIGNATURE</div></div>`, 1000, 150);
  tl.set(app, { opacity: 0, rotationY: -40, transformPerspective: 1600 }, 0); tl.to(app, { opacity: 1, rotationY: -6, duration: .5, ease: 'power3.out' }, W('C5', 'employers') - .25); cue(W('C5', 'employers') - .2, 'paper', .5, .6);
  const cb = app.querySelector('.cb'); tl.set(cb, { textContent: '' }, 0); tl.set(cb, { textContent: '✓' }, W('C5', 'permission')); cue(W('C5', 'permission'), 'key', .5, .6, { f: 1500 });
  tl.to(app.querySelector('.sig'), { attr: { 'stroke-dashoffset': 0 }, duration: .6, ease: 'power2.inOut' }, W('C5', 'permission') + .2);
  const br = at(host, A.brief(190), 1120, 620); pop(br, W('C5', 'hire') - .2);
  stampOn(host, 'HIRED?', 'gold', 1380, 640, W('C5', 'hire') + .05, -8, 70);
  cam(id, { z: 1.05, x: -10 });
}

/* ================= THE FIXES, THE TWIST, THE DEBATE ================= */
// x1: what you can do
{
  const id = 'x1', host = sc(id); toWorld('outro', S(id) - .2); through(id); chip(id, 'WHAT YOU CAN DO', '★');
  tl.to(RAIL.el, { opacity: 0, duration: .4 }, S(id));
  const sh = at(host, A.shield(260, GRN), 960, 200); center(sh); pop(sh, V('X1') - .05, .4); cue(V('X1'), 'riser', .4, 0, { dur: .6 });
  tl.to(sh, { scale: 1.08, duration: .5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, W('X1', 'power'));
  const pw = at(host, `<div class="anton" style="font-size:100px;color:#fff">MORE POWER THAN THEY <span style="color:${GRN}">ADVERTISE</span></div>`, 960, 540); center(pw); up(pw, W('X1', 'power') - .15, 30);
  tl.to([sh, pw], { opacity: 0, y: -40, duration: .3 }, V('X2') - .2);
  const card = (i, w, html) => { const c = at(host, `<div class="card" style="position:relative;width:540px;height:470px;padding:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;text-align:center">${html}</div>`, 120 + i * 580, 170); tl.set(c, { opacity: 0, rotationY: 80, transformPerspective: 1500 }, 0); tl.to(c, { opacity: 1, rotationY: 0, duration: .5, ease: 'back.out(1.4)' }, W('X2', w) - .25); cue(W('X2', w) - .2, 'flip', .45, -.6 + i * .6); return c; };
  const c1 = card(0, 'check', `<div style="width:460px;border-radius:14px;background:#fff;padding:14px 18px;text-align:left"><div style="display:flex;gap:8px">${['#ff5f57', '#febc2e', '#28c840'].map(c => `<i style="display:block;width:14px;height:14px;border-radius:50%;background:${c}"></i>`).join('')}</div><div class="mono url" style="margin-top:12px;padding:10px 12px;border-radius:8px;background:#eef1f8;font-size:26px;color:#1a2347;white-space:nowrap;overflow:hidden"></div></div><div class="anton" style="font-size:58px;color:#fff">ALL 3 REPORTS</div><div style="display:flex;gap:12px"><span class="pill pf" style="position:relative;background:${GRN};color:#04221f;font-size:26px">FREE</span><span class="pill pw" style="position:relative;background:${SKY};color:#04121f;font-size:26px">WEEKLY</span></div>`);
  [['.pf', 'free'], ['.pw', 'week']].forEach(([q, w]) => { const e = c1.querySelector(q); tl.set(e, { scale: 0 }, 0); tl.to(e, { scale: 1, duration: .3, ease: 'back.out(3)' }, W('X2', w) - .05); cue(W('X2', w), 'pop', .35, -.6); });
  tl.to(c1, { y: -12, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, W('X2', 'free') + .3);
  const url = c1.querySelector('.url'); const U = 'AnnualCreditReport.com';
  for (let i = 0; i <= U.length; i++) tl.set(url, { textContent: U.slice(0, i) + (i < U.length ? '|' : '') }, W('X2', 'annualcreditreportcom') - .3 + i * .04);
  tl.set(url, { textContent: '' }, 0); cue(W('X2', 'annualcreditreportcom') - .3, 'type', .4, -.6, { dur: .9 });
  const c2 = card(1, 'freeze', `<div style="position:relative">${A.lock(150, '#bfe8ff')}<div style="position:absolute;right:-50px;top:-30px">${A.snow(100)}</div></div><div class="anton" style="font-size:58px;color:#fff">FREEZE YOUR CREDIT</div><span class="pill" style="position:relative;background:${GRN};color:#04221f;font-size:26px">FREE</span>`);
  const c3 = card(2, 'opt', `<div style="position:relative">${A.mailbox(170)}<svg viewBox="0 0 100 100" style="position:absolute;left:30px;top:20px;width:120px;height:120px"><circle cx="50" cy="50" r="42" fill="none" stroke="${RED}" stroke-width="10"/><path d="M20,80 L80,20" stroke="${RED}" stroke-width="10"/></svg></div><div class="anton" style="font-size:52px;color:#fff">STOP THE MAILERS</div><div class="mono" style="font-size:24px;color:${GOLD}">OptOutPrescreen.com</div>`);
  // X2b: the basics
  const tb = V('X2b') - .2;
  tl.to([c1, c2, c3], { opacity: 0, y: -40, duration: .3, stagger: .04 }, tb);
  const B = [['time', 'PAY ON TIME', '35%'], ['low', 'KEEP BALANCES LOW', '30%'], ['oldest', 'KEEP YOUR OLDEST CARD', '15%']];
  B.forEach(([w, txt, pc], i) => { const r = at(host, `<div style="display:flex;align-items:center;gap:30px;width:1300px;padding:26px 40px;border-radius:24px;background:rgba(10,8,30,.7);border:3px solid rgba(61,255,154,.6)"><b style="display:block;width:76px;height:76px;border-radius:18px;background:${GRN};color:#04221f;text-align:center;font:900 54px/76px 'Unbounded'">✓</b><div class="anton" style="font-size:66px;color:#fff;flex:1">${txt}</div><div class="big" style="font-size:44px;color:${GRN}">${pc}</div></div>`, 310, 170 + i * 200); tl.set(r, { opacity: 0, x: -200 }, 0); tl.to(r, { opacity: 1, x: 0, duration: .4, ease: 'back.out(1.5)' }, W('X2b', w) - .3); cue(W('X2b', w) - .2, 'ding', .45, -.4 + i * .4); });
  cam(id, { z: 1.04, y: -8 });
}

// x2: the twist — it's a profit score
{
  const id = 'x2', host = sc(id); through(id, { sfx: null }); chip(id, 'THE TRUTH', '★');
  const g = gauge(host, 460, 150, 1000, { score: 742, label: 'CREDIT SCORE' });
  g.show(S(id) + .3, .7); cue(S(id) + .3, 'riser', .4, 0, { dur: .7 });
  const spot = div('abs', host, '', 'inset:0;background:radial-gradient(ellipse 40% 50% at 50% 45%,transparent 30%,rgba(0,0,0,.65) 80%);opacity:0'); tl.to(spot, { opacity: 1, duration: .8 }, W('X3', 'truth') - .2);
  const you = pill(host, 'ABOUT YOU', GOLD, '#120d04', 960, 790, 40); tl.set(you, { xPercent: -50 }, 0); pop(you, W('X3', 'credit') - .1);
  tl.to(you, { y: 260, rotation: 25, opacity: 0, duration: .6, ease: 'power2.in' }, W('X3', 'never') + .1); cue(W('X3', 'never') + .2, 'fall', .5);
  const q = at(host, `<div class="big glow" style="font-size:150px;--acc:${GOLD}">?</div>`, 1560, 200); pop(q, W('X4', 'question') - .1, .4); cue(W('X4', 'question'), 'pop', .4, .7);
  [A.bank(160), A.bank(160)].forEach((b, i) => { const e = at(host, b, 120 + i * 1540 - (i ? 40 : 0), 600); up(e, W('X4', 'lending') - .1 + i * .1, 40); });
  // the reveal: CREDIT SCORE → PROFIT SCORE
  const tP = W('X4', 'profitable');
  tl.set(g.lbl, { textContent: 'CREDIT SCORE' }, 0);
  tl.to(g.lbl, { rotationX: 90, duration: .15, ease: 'power2.in' }, tP - .15); tl.set(g.lbl, { textContent: 'PROFIT SCORE', color: GOLD, fontSize: '64px' }, tP); tl.to(g.lbl, { rotationX: 0, duration: .2, ease: 'back.out(3)' }, tP);
  tl.set(g.lbl, { color: CREAM, fontSize: '42px' }, 0);
  tl.to(g.num, { color: GOLD, duration: .2 }, tP); g.to(tP, 850, .7, 'power2.out');
  cue(tP, 'impact', 1); R.shake(tP + .05, 16, .4); punch(tP + .05, 1.06);
  for (let i = 0; i < 14; i++) { const c = at(host, `<div class="big" style="font-size:${50 + (i % 3) * 20}px;color:${GOLD}">$</div>`, 940, 430); tl.set(c, { opacity: 0 }, 0); const a = i / 14 * Math.PI * 2; tl.to(c, { opacity: 1, duration: .05 }, tP + .05); tl.to(c, { x: Math.cos(a) * 600, y: Math.sin(a) * 340, rotation: (i - 7) * 20, duration: .9, ease: 'power3.out' }, tP + .05); tl.to(c, { opacity: 0, duration: .3 }, tP + .7); }
  cue(tP + .1, 'coins', .7);
}

// x3: the debate, subscribe, the end screen
{
  const id = 'x3', host = sc(id); through(id, { last: true }); chip(id, 'YOUR TAKE', '★');
  const qc = at(host, `<div class="qcard" style="position:relative;width:1500px"><div class="mono" style="font-size:28px;color:${GOLD};letter-spacing:4px">THE QUESTION</div><div class="anton" style="font-size:72px;color:#fff;margin-top:16px;white-space:normal;line-height:1.1">SHOULD COMPANIES YOU NEVER SIGNED UP WITH DECIDE WHAT YOUR LIFE COSTS?</div></div>`, 960, 130);
  center(qc); tl.set(qc, { opacity: 0, rotationX: -60, transformPerspective: 1600 }, 0); tl.to(qc, { opacity: 1, rotationX: 0, duration: .55, ease: 'back.out(1.4)' }, W('X5', 'should') - .2); cue(W('X5', 'should') - .1, 'riser', .3, 0, { dur: .4 });
  const opt = (x, lbl, c, w, pct) => { const o = at(host, `<div style="position:relative;width:640px;padding:26px 34px;border-radius:24px;background:rgba(10,8,30,.85);border:4px solid ${c}"><div class="anton" style="font-size:64px;color:${c}">${lbl}</div><div style="margin-top:16px;height:30px;border-radius:15px;background:rgba(255,255,255,.12);overflow:hidden"><i class="vb" style="display:block;height:100%;width:${pct}%;background:${c};transform-origin:0 50%"></i></div></div>`, x, 520); tl.set(o, { opacity: 0, y: 60 }, 0); tl.to(o, { opacity: 1, y: 0, duration: .4, ease: 'back.out(1.6)' }, W('X5', w) - .15); tl.set(o.querySelector('.vb'), { scaleX: 0 }, 0); tl.to(o.querySelector('.vb'), { scaleX: 1, duration: 1.2, ease: 'power2.out' }, W('X5', w) + .2); cue(W('X5', w), 'pop', .45, x < 900 ? -.6 : .6); return o; };
  const o1 = opt(240, '✗ IT\'S RIGGED', RED, 'decide', 58), o2 = opt(1040, '✓ IT\'S FAIR', GRN, 'fairest', 42);
  const coms = ['“Paid off my car — score dropped 30 pts!”', '“Cash only for 10 years. Couldn\'t rent.”', '“Without it, lending would be worse.”'];
  const cm = coms.map((c, i) => { const b = at(host, `<div style="padding:16px 26px;border-radius:22px;background:#fff;color:#1a2347;font:700 28px/1.2 'Space Grotesk';box-shadow:0 14px 30px rgba(0,0,0,.4);white-space:nowrap">${c}</div>`, [180, 1000, 560][i], [710, 710, 790][i]); pop(b, W('X5', 'comments') - .1 + i * .18, .4); cue(W('X5', 'comments') + i * .18, 'pop', .35, -.6 + i * .6); return b; });
  // X6: subscribe
  const t6 = V('X6') - .2;
  tl.to([qc, o1, o2, ...cm], { opacity: 0, y: -30, duration: .3, stagger: .03 }, t6);
  const sub = at(host, `<div style="display:flex;align-items:center;gap:30px"><div class="sb" style="white-space:nowrap;padding:30px 70px;border-radius:20px;background:#ff0033;font:900 76px/1 'Unbounded';color:#fff;box-shadow:0 18px 0 #8a001c">SUBSCRIBE</div><svg class="bell" viewBox="0 0 100 110" style="width:120px;height:132px"><path d="M50,8 C28,8 20,28 20,48 L20,72 L8,86 L92,86 L80,72 L80,48 C80,28 72,8 50,8 Z" fill="${GOLD}"/><circle cx="50" cy="98" r="10" fill="${GOLD}"/></svg></div>`, 960, 230);
  center(sub); pop(sub, W('X6', 'subscribe') - .1, .5);
  const sb = sub.querySelector('.sb'); tl.to(sb, { y: 14, boxShadow: '0 4px 0 #8a001c', duration: .1 }, W('X6', 'subscribe') + .5); tl.to(sb, { y: 0, boxShadow: '0 18px 0 #8a001c', backgroundColor: '#3a3f52', duration: .2 }, W('X6', 'subscribe') + .6); tl.set(sb, { textContent: 'SUBSCRIBE' }, 0); tl.set(sb, { textContent: 'SUBSCRIBED ✓' }, W('X6', 'subscribe') + .6); cue(W('X6', 'subscribe') + .5, 'key', .6, 0, { f: 900 });
  tl.to(sub.querySelector('.bell'), { rotation: 18, svgOrigin: '50 8', duration: .08, yoyo: true, repeat: 7 }, W('X6', 'money')); cue(W('X6', 'money'), 'ding', .5, .5);
  const g = gauge(host, 660, 400, 600, { score: 742, label: 'CHECK YOUR NUMBER' }); g.show(W('X6', 'tonight') - .2, .5);
  tl.to(g.g, { filter: 'drop-shadow(0 0 40px #ffc640)', duration: .4 }, W('X6', 'check'));
  // end screen: two video slots + subscribe (YouTube end-screen elements go over these)
  const tE = VE('X6') + .6;
  tl.to([sub, g.g], { opacity: 0, duration: .4 }, tE - .3);
  const es = at(host, `<div style="position:relative;width:1920px;height:1080px">
    <div class="anton" style="position:absolute;left:0;top:120px;width:1920px;text-align:center;font-size:84px;color:#fff">WATCH NEXT</div>
    ${[140, 1020].map(x => `<div style="position:absolute;left:${x}px;top:280px;width:760px;height:428px;border-radius:24px;border:4px dashed rgba(255,255,255,.5);background:rgba(10,8,30,.45)"></div>`).join('')}
    <div class="ring" style="position:absolute;left:870px;top:760px;width:180px;height:180px;border-radius:50%;border:4px dashed rgba(255,198,64,.7);background:rgba(10,8,30,.45)"></div></div>`, 0, 0);
  tl.to(es.querySelector('.ring'), { rotation: 120, duration: E(id) - tE, ease: 'none' }, tE);
  tl.set(es, { opacity: 0 }, 0); tl.to(es, { opacity: 1, duration: .5 }, tE);
  tl.fromTo(es, { scale: 1.04 }, { scale: 1, duration: E(id) - tE, ease: 'sine.out', immediateRender: false }, tE);
  tl.to('#caps', { opacity: 0, duration: .3 }, tE); tl.set('#caps', { opacity: 1 }, 0);
}
