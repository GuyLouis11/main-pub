/* CH1 WEEK ONE: w1 · twice · w1close · w2w3 · stopdel     CH2 DANIEL: daniel · family · tuition · track · bet5 · name */
window.SC = window.SC || {};

SC.w1 = (R, K, h, id) => {
  const { tl, cue, S, V } = R;
  K.chapter(id, 1, 'Week One');
  // calendar page
  const cal = K.text(h, '<div style="background:#ff3b4f;color:#fff;font:800 30px/1 Space Grotesk;letter-spacing:6px;padding:16px 0">MARCH</div><div class="big" style="font-size:150px;color:#121a2c;margin-top:26px">3</div><div style="font:700 26px Space Grotesk;letter-spacing:8px;color:#5b6582;margin-top:18px">MONDAY</div>',
    'left:220px;top:300px;width:300px;height:330px;border-radius:22px;background:#f3f5fb;text-align:center;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6)');
  R.up(cal, V('P09') - .1, .5, 40); cue(V('P09') - .1, 'paper', .5);
  tl.fromTo(cal, { rotationX: 70, transformOrigin: '50% 0%' }, { rotationX: 0, duration: .6, ease: 'back.out(1.4)', immediateRender: false }, V('P09') - .1);
  // the email and what it lacks
  const m = K.mail(h, 640, 230, 1060, { subj: '' });
  m.style.minHeight = '470px';
  R.up(m, V('P10') - .2, .45, 40);
  const ghost = (x, y, w, hh, label, t) => {
    const g = K.text(h, `<div style="font:700 20px Space Grotesk;letter-spacing:5px;color:#ff3b4f;position:absolute;left:0;top:${hh + 12}px;white-space:nowrap">${label}</div>`, `left:${x}px;top:${y}px;width:${w}px;height:${hh}px;border:3px dashed rgba(255,59,79,.75);border-radius:12px`);
    const st = K.text(g, '', `left:-10px;top:${hh / 2 - 3}px;width:${w + 20}px;height:6px;background:#ff3b4f;border-radius:3px;transform-origin:0 50%;box-shadow:0 0 12px #ff3b4f`);
    R.pop(g, t, .25, .6); tl.set(st, { scaleX: 0 }, 0); tl.to(st, { scaleX: 1, duration: .2, ease: 'power2.out' }, t + .2); cue(t + .2, 'slash', .5);
  };
  ghost(1440, 300, 220, 90, 'NO LOGO', WT(R, 'P10', 0));
  ghost(690, 560, 300, 64, 'NO LINK', WT(R, 'P10', 2));
  ghost(1050, 560, 300, 64, 'NO NAME', WT(R, 'P10', 4));
  const ts = WT(R, 'P10', 11);
  tl.set(m.sj, { textContent: '' }, 0);
  K.type(m.sj, 'Week 1', ts, 16);
  K.type(m.bd, 'The market will go down this week.', V('P11'), 24);
  tl.to(m, { scale: 1.05, duration: 1.8, ease: 'sine.out' }, V('P11'));
};

SC.twice = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { warm: 1, bokeh: .6 }, .5);
  const glow = K.text(h, '', 'left:700px;top:330px;width:700px;height:500px;border-radius:50%;background:radial-gradient(ellipse,rgba(120,160,255,.35),transparent 65%)');
  const pD = K.person(h, 'daniel', 720, 260, 600, { rim: '#9fb7ff' });
  K.text(h, '', 'left:0;top:780px;width:1920px;height:300px;background:linear-gradient(180deg,#0c1222,#05070d);box-shadow:0 -2px 0 rgba(160,180,255,.18)');
  const lap = K.text(h, '', 'left:820px;top:690px;width:300px;height:180px;background:linear-gradient(180deg,#1b2440,#0b1020);border-radius:12px 12px 4px 4px;transform:perspective(600px) rotateX(-12deg);box-shadow:0 0 60px rgba(120,160,255,.5)');
  R.up([pD, lap], S(id) + .1, .5, 30);
  const tw = K.text(h, 'READ IT TWICE.', 'left:180px;top:360px;font-size:86px', 'kin cold');
  R.up(tw, WT(R, 'P12', 2), .35, 20);
  const tw2 = K.text(h, 'ALWAYS.', 'left:182px;top:460px;font-size:86px', 'kin amber');
  R.up(tw2, WT(R, 'P12', 5), .35, 20);
  // [clue] the screen hiccups on "always reads"
  tl.set('#stage', { filter: 'hue-rotate(70deg) contrast(1.4)' }, WT(R, 'P12', 5)); tl.set('#stage', { filter: 'none' }, WT(R, 'P12', 5) + .08);
  tl.set('#stage', { x: 12 }, WT(R, 'P12', 5) + .03); tl.set('#stage', { x: 0 }, WT(R, 'P12', 5) + .09);
  cue(WT(R, 'P12', 5), 'glitch_soft', .35);
  // deleted
  const card = K.text(h, '<b style="font:700 26px Space Grotesk">Week 1</b><br><span style="font:500 22px Space Grotesk;color:#9aa6cb">The market will go down this week.</span>', 'left:1240px;top:400px;width:480px;padding:26px 30px;border-radius:18px;background:rgba(22,30,56,.92);border:1px solid rgba(170,190,240,.25)');
  const bin = K.text(h, '🗑', 'left:1660px;top:700px;font-size:110px', 'emoji');
  R.up(card, WT(R, 'P12', 1), .35, 20);
  const td = WT(R, 'P12', 9);
  R.pop(bin, td - .35, .3, .4);
  tl.to(card, { x: 300, y: 330, scale: .1, rotation: 25, opacity: 0, duration: .45, ease: 'power2.in' }, td - .1); cue(td - .1, 'trash', .7);
  tl.to(bin, { scale: 1.2, duration: .1, yoyo: true, repeat: 1 }, td + .35);
};

SC.w1close = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(S(id) + .2);
  const c = K.chart(h, 260, 330, 1100, 420, { label: 'THE MARKET · WEEK 1' });
  R.up(c.wrap, S(id) + .1, .4, 30);
  c.draw(S(id) + .3, VE('P13') - S(id) - .2, K.walk(-1.3, 46, .45), 2.5);
  K.mark(1, 'D', VE('P13'));
  const cl = K.text(h, 'CLOSED DOWN', 'left:1430px;top:470px;font-size:70px', 'kin red');
  R.up(cl, VE('P13') - .05, .3, 20);
  // a coin flip
  const tc = V('P14');
  tl.to([c.wrap, cl], { opacity: .2, duration: .4 }, tc);
  const coin = K.text(h, '<div class="big" style="font-size:90px;color:#1a1204;line-height:260px">▼</div>', 'left:830px;top:300px;width:260px;height:260px;border-radius:50%;text-align:center;background:radial-gradient(circle at 35% 30%,#ffe7a8,#ffb347 55%,#b46a12);box-shadow:0 0 50px rgba(255,179,71,.6),inset 0 -10px 20px rgba(0,0,0,.3)');
  R.pop(coin, WT(R, 'P14', 9) - .3, .3, .3);
  const tf = WT(R, 'P14', 9) - .1;
  for (let i = 0; i < 9; i++) tl.to(coin, { scaleX: i % 2 ? 1 : .05, duration: .07, ease: 'none' }, tf + i * .07);
  tl.fromTo(coin, { y: 0 }, { y: -220, duration: .32, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, tf);
  cue(tf, 'coin', .8); cue(tf + .64, 'coin_land', .7);
  const lb = K.text(h, 'A COIN FLIP', 'top:640px;font-size:60px', 'center kin cold');
  R.up(lb, WT(R, 'P14', 9), .3, 16);
};

SC.w2w3 = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const ph = K.phone(h, 200, 130, .92, { date: 'Monday, March 10' });
  R.up(ph.el, S(id) + .05, .4, 40);
  const t6 = WT(R, 'P15', 4);
  ph.wake(t6); ph.notify(t6 + .5, 'Week 2', 'The market will go up this week.');
  const c2 = K.chart(h, 760, 220, 960, 270, { label: 'WEEK 2' });
  R.up(c2.wrap, V('P16') - .4, .3, 20);
  c2.draw(V('P16') - .3, .9, K.walk(1.1, 30, .4), 2.5); K.mark(2, 'U', V('P16') + .6);
  const c3 = K.chart(h, 760, 620, 960, 270, { label: 'WEEK 3' });
  R.up(c3.wrap, WT(R, 'P17', 2) - .5, .3, 20);
  c3.draw(WT(R, 'P17', 2) - .3, 1.0, K.walk(-.9, 30, .4), 2.5); K.mark(3, 'D', WT(R, 'P17', 4) + .1);
};

SC.stopdel = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const box = K.text(h, '<div class="label" style="color:#ffb347;font-size:22px;padding:28px 34px 10px">★ STARRED</div>', 'left:560px;top:180px;width:800px;height:640px;border-radius:24px;background:rgba(12,18,36,.92);border:1px solid rgba(170,190,240,.22);box-shadow:0 40px 100px rgba(0,0,0,.6)');
  R.up(box, S(id) + .05, .4, 40);
  const subs = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  subs.forEach((s, i) => {
    const r = K.text(box, `<span style="color:#ffb347">★</span>&nbsp;&nbsp;<b>${s}</b><span style="float:right;color:#8e9bc4;font-family:JetBrains Mono;font-size:20px">MON 6:00 AM</span>`, `left:30px;top:${90 + i * 110}px;width:740px;padding:24px 26px;border-radius:14px;background:rgba(30,40,72,.85);font:600 28px Space Grotesk`);
    R.up(r, V('P18') + .15 + i * .18, .3, 20); cue(V('P18') + .15 + i * .18, 'star', .4, -.3 + i * .2);
  });
  const k = K.text(h, 'KEPT.', 'left:1430px;top:720px;font-size:120px', 'kin amber');
  R.slam(k, WT(R, 'P18', 6) - .05, 2, .18); cue(WT(R, 'P18', 6) + .13, 'hit', .6);
};

/* ---------------- CHAPTER 2 · DANIEL ---------------- */
SC.daniel = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 2, 'Daniel');
  K.hudShow(S(id), false);
  const pD = K.person(h, 'daniel', 300, 250, 720, { rim: '#ffb347', glow: 20 });
  R.up(pD, V('P19') - .1, .6, 30);
  const card = K.text(h, '', 'left:980px;top:300px;width:700px;height:470px', 'glass');
  R.up(card, V('P20') - .3, .4, 30);
  const rows = [['NAME', 'Daniel Hale', V('P20') - .1], ['AGE', '44', WT(R, 'P20', 0)], ['JOB', 'Freight scheduler · Columbus, OH', WT(R, 'P20', 4)], ['SAME DESK', '22 years', WT(R, 'P20', 13)]];
  rows.forEach(([k, v, t], i) => {
    K.text(card, k, `left:44px;top:${46 + i * 102}px;font-size:20px`, 'label');
    const val = K.text(card, '', `left:44px;top:${74 + i * 102}px;font:600 38px/1.2 Space Grotesk;color:#f2f6ff;white-space:nowrap`);
    K.type(val, v, t, 34);
  });
  const big = K.text(h, '22 YEARS', 'left:1000px;top:820px;font-size:90px', 'kin amber');
  R.up(big, WT(R, 'P20', 13) + .2, .35, 20);
};

SC.family = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const pM = K.person(h, 'maya', 200, 300, 600, { rim: '#9fb7ff' });
  R.up(pM, V('P21') - .1, .5, 30);
  const lm = K.text(h, 'MAYA · NIGHT-SHIFT NURSE', 'left:180px;top:250px;font-size:24px;color:#9fb7ff', 'label');
  R.up(lm, WT(R, 'P21', 2), .3, 16);
  // car · dishes · worrying, passed back and forth
  const items = ['THE CAR', 'THE DISHES', 'THE WORRYING'];
  items.forEach((it, i) => {
    const t = WT(R, 'P21', [10, 12, 15][i]) - .05;
    const b = K.text(h, it, `left:800px;top:${330 + i * 120}px;font-size:56px`, 'kin ' + (i === 2 ? 'amber' : 'cold'));
    R.up(b, t, .3, 20);
    tl.to(b, { x: 60, duration: .3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + .35);
  });
  // Lily, 400 miles away
  const tL = V('P22');
  tl.to(`[data-scene="${id}"] .kin`, { opacity: .15, duration: .3 }, tL - .2);
  const pL = K.person(h, 'lily', 1260, 300, 560, { rim: '#ff9ad5' });
  R.up(pL, tL, .5, 30);
  const ll = K.text(h, 'LILY · ACCEPTED: ENGINEERING', 'left:1170px;top:250px;font-size:24px;color:#ff9ad5', 'label');
  R.up(ll, WT(R, 'P22', 3), .3, 16);
  const s = K.svg(h, 1920, 1080, 'left:0;top:0');
  const arc = R.el('path', { d: 'M760,900 C960,760 1200,760 1400,900', fill: 'none', stroke: '#ff9ad5', 'stroke-width': 4, 'stroke-dasharray': '12 12' }, s);
  arc.setAttribute('class', 'arc400');
  R.draw('.arc400', WT(R, 'P22', 12) - .3, .8);
  const mi = K.text(h, '400 MILES', 'left:960px;top:780px;font-size:44px', 'mono amber');
  R.count(mi, WT(R, 'P22', 12) - .2, .8, 0, 400, v => Math.round(v) + ' MILES');
  R.up(mi, WT(R, 'P22', 12) - .2, .3, 10);
  cue(WT(R, 'P22', 12) - .3, 'swoosh', .5);
};

SC.tuition = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const letter = K.text(h, '<div style="font:700 22px Space Grotesk;letter-spacing:6px;color:#8a93ad">STATEMENT</div><div style="font:700 44px Space Grotesk;margin-top:16px;color:#121a2c">Tuition &amp; Fees</div><div style="margin-top:30px;height:14px;width:80%;background:#e1e5ee;border-radius:7px"></div><div style="margin-top:16px;height:14px;width:60%;background:#e1e5ee;border-radius:7px"></div><div style="margin-top:44px;font:700 26px Space Grotesk;color:#ff3b4f">AMOUNT DUE BY AUGUST 1</div>',
    'left:200px;top:220px;width:560px;height:600px;padding:50px;border-radius:12px;background:#f7f5ef;box-shadow:0 30px 80px rgba(0,0,0,.6);transform:rotate(-4deg)');
  R.up(letter, V('P23') - .1, .5, 50); cue(V('P23') - .1, 'paper', .6);
  const e4 = K.text(h, '+ EMAIL #4', 'left:240px;top:860px;font-size:40px', 'mono amber');
  R.up(e4, WT(R, 'P23', 8), .3, 16);
  const sh = K.sheet(h, 900, 230, 820, ['Mortgage', 'Car', 'Lily'], 0, [['ITEM', 420], ['AMOUNT', 380]], [['Monthly payment', '$1,640'], ['Balance', '$188,400'], ['', '']]);
  R.up(sh, V('P24') - .1, .45, 40);
  const tLily = WT(R, 'P24', 13);
  [1, 2].forEach(i => tl.set(sh.tabs[i], { background: '#d5dbe8', color: '#5a6584' }, 0));
  tl.set(sh.tabs[0], { background: '#f7f8fb', color: '#18223a' }, 0);
  tl.set(sh.tabs[1], { background: '#f7f8fb', color: '#18223a' }, WT(R, 'P24', 9)); tl.set(sh.tabs[0], { background: '#d5dbe8', color: '#5a6584' }, WT(R, 'P24', 9));
  tl.set(sh.tabs[2], { background: '#fff', color: '#c2187a' }, tLily); tl.set(sh.tabs[1], { background: '#d5dbe8', color: '#5a6584' }, tLily);
  tl.set(sh.rows[0].children[0], { textContent: 'Saved since the day she was born' }, tLily);
  tl.set(sh.rows[0].children[1], { textContent: '' }, tLily);
  tl.set(sh.rows[1].children[0], { textContent: 'One paycheck at a time' }, tLily);
  tl.set(sh.rows[1].children[1], { textContent: '' }, tLily);
  cue(tLily, 'click', .6);
  const tot = K.text(h, '$0', 'left:900px;top:640px;width:820px;text-align:center;font-size:150px', 'big amber');
  R.up(tot, tLily + .2, .3, 20);
  R.count(tot, WT(R, 'P24', 16) - .4, 1.6, 0, 52000, K.money, 'power2.out'); cue(WT(R, 'P24', 16) - .4, 'counter', .5, 0, { dur: 1.6 });
};

SC.track = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(S(id) + .2);
  const sh = K.sheet(h, 420, 220, 1080, ['Mortgage', 'Car', 'Lily', 'The Emails'], 3, [['WEEK', 220], ['SAID', 300], ['MARKET DID', 320], ['RIGHT?', 240]],
    [['1', '▼ Down', '▼ Down', '✓'], ['2', '▲ Up', '▲ Up', '✓'], ['3', '▼ Down', '▼ Down', '✓'], ['4', '▲ Up', '', '']]);
  R.up(sh, S(id) + .1, .45, 40);
  sh.rows.forEach((r, i) => {
    const t = WT(R, 'P25', 13) + i * .2;
    tl.set(r, { opacity: 0, x: -30 }, 0); tl.to(r, { opacity: 1, x: 0, duration: .25 }, t);
    [1, 2].forEach(k => { const v = r.children[k]; v.style.color = v.textContent.includes('▲') ? '#0f9d58' : '#d93025'; v.style.fontWeight = 700; });
    if (i < 3) r.children[3].style.cssText += ';color:#0f9d58;font-weight:800';
  });
  const t4 = WT(R, 'P26', 4);
  tl.set(sh.rows[3].children[2], { textContent: '▲ Up', color: '#0f9d58', fontWeight: 700 }, t4);
  tl.set(sh.rows[3].children[3], { textContent: '✓', color: '#0f9d58', fontWeight: 800 }, t4 + .15);
  K.mark(4, 'U', t4);
  const f4 = K.text(h, '4 FOR 4', 'top:840px;font-size:110px', 'center kin green');
  R.slam(f4, WT(R, 'P26', 6) - .1, 2, .18); cue(WT(R, 'P26', 6) + .08, 'hit', .6);
};

SC.bet5 = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const slip = K.text(h, '<div class="label" style="font-size:20px">POSITION</div><div class="kin red" style="font-size:76px;margin-top:14px">MARKET DOWN</div><div class="label" style="font-size:20px;margin-top:30px">AMOUNT</div><div class="mono" style="font-size:80px;margin-top:12px;color:#fff">$500</div>',
    'left:200px;top:260px;width:560px;height:440px;padding:46px', 'glass');
  R.up(slip, WT(R, 'P27', 13) - .1, .45, 40); cue(WT(R, 'P27', 13) - .1, 'click', .6);
  const amt = slip.querySelector('.mono');
  R.count(amt, WT(R, 'P27', 13), 1.0, 0, 500, K.money, 'power2.out'); cue(WT(R, 'P27', 13), 'counter', .4, -.4, { dur: 1.0 });
  tl.to(slip, { boxShadow: '0 0 40px rgba(255,59,79,.45)', borderColor: 'rgba(255,59,79,.7)', duration: .3, yoyo: true, repeat: 3 }, WT(R, 'P27', 13) + 1.0);
  const fl = K.text(h, 'FIRST BET OF HIS LIFE', 'left:200px;top:740px;font-size:24px;color:#ffb347', 'label');
  R.up(fl, WT(R, 'P27', 14), .3, 16);
  const rules = K.text(h, '<span class="green">MARKET FALLS → HE WINS</span><br><span class="red">MARKET RISES → HE LOSES IT ALL</span>', 'left:860px;top:250px;font:700 40px/1.6 Space Grotesk;white-space:nowrap');
  R.up(rules, V('P28') + .5, .4, 20);
  const c = K.chart(h, 860, 470, 860, 300, { label: 'WEEK 5' });
  R.up(c.wrap, V('P29') - .5, .3, 20);
  c.draw(V('P29') - .3, WT(R, 'P29', 5) - V('P29') + .3, K.walk(-1.6, 34, .45), 2.5);
  K.mark(5, 'D', WT(R, 'P29', 5));
  const win = K.text(h, '+$1,100', 'left:200px;top:820px;font-size:110px', 'big green');
  R.slam(win, WT(R, 'P29', 7) - .1, 2, .18); cue(WT(R, 'P29', 7) + .08, 'cash', .9);
  tl.to(rules, { opacity: .3, duration: .3 }, V('P29'));
};

SC.name = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const f5 = K.text(h, '5 FOR 5', 'top:200px;font-size:96px', 'center kin green');
  R.up(f5, V('P30') - .1, .35, 20);
  const m = K.mail(h, 460, 380, 1000, { subj: 'Week 6' });
  R.up(m, WT(R, 'P30', 4), .4, 40);
  const tn = WT(R, 'P30', 9);
  m.bd.innerHTML = '';
  const g = K.text(m.bd, '', 'position:relative;display:inline');
  K.type(g, 'Good morning, ', tn - .2, 30);
  const nm = K.text(m.bd, 'Daniel.', 'position:relative;display:inline;color:#d9780a');
  tl.set(nm, { opacity: 0 }, 0); tl.set(nm, { opacity: 1 }, tn + .3);
  tl.to(nm, { textShadow: '0 0 18px rgba(255,140,40,.9)', duration: .3 }, tn + .35);
  cue(tn + .3, 'sting', .8); R.glitch(m, tn + .4, .2);
  tl.to(`[data-scene="${id}"] .cam`, { scale: 1.12, duration: 1.2, ease: 'power2.inOut' }, tn + .2);
};
SC.name.opts = { nocam: true };
