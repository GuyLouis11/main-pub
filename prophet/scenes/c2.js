/* CH3 THE BELIEVER: w6w7 · marcus · head · w8      CH4 WEEK NINE: nine · nosleep · friday · who */
window.SC = window.SC || {};

SC.w6w7 = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 3, 'The Believer');
  K.hudShow(S(id), false); K.hudShow(V('P31') + .2);
  const m = K.mail(h, 160, 230, 760, { subj: 'Week 6' });
  R.up(m, V('P31') - .1, .4, 30);
  K.type(m.bd, 'Good morning, Daniel. Up.', WT(R, 'P31', 2) - .1, 26);
  // his bets, growing
  const base = 800, X0 = 1060;
  K.text(h, 'HIS BETS', `left:${X0}px;top:250px;font-size:24px`, 'label');
  const bets = [[500, 'W5', V('P31')], [2000, 'W6', WT(R, 'P32', 1)], [4000, 'W7', WT(R, 'P33', 4)]];
  bets.forEach(([v, w, t], i) => {
    const hh = 40 + v / 4000 * 420;
    const b = K.text(h, '', `left:${X0 + i * 230}px;top:${base - hh}px;width:150px;height:${hh}px;border-radius:12px 12px 0 0;background:linear-gradient(180deg,#ffb347,#a35a10);box-shadow:0 0 30px rgba(255,179,71,.35);transform-origin:50% 100%`);
    const lb = K.text(h, K.money(v), `left:${X0 + i * 230 - 30}px;top:${base - hh - 56}px;width:210px;text-align:center;font-size:36px`, 'mono amber');
    K.text(h, w, `left:${X0 + i * 230}px;top:${base + 16}px;width:150px;text-align:center;font-size:22px`, 'label');
    tl.set(b, { scaleY: 0 }, 0); tl.to(b, { scaleY: 1, duration: .5, ease: 'power3.out' }, t); R.up(lb, t + .3, .3, 12); cue(t, 'rise', .5, .3);
  });
  K.text(h, '', `left:${X0 - 20}px;top:${base}px;width:720px;height:3px;background:rgba(170,190,240,.4)`);
  K.mark(6, 'U', WT(R, 'P32', 6));
  tl.set(m.sj, { textContent: 'Week 7' }, V('P33'));
  tl.set(m.bd, { textContent: 'Down.' }, V('P33') + .4);
  K.mark(7, 'D', WT(R, 'P33', 9));
};

SC.marcus = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { warm: 1, bokeh: 1.2 }, .5);
  K.text(h, '', 'left:0;top:820px;width:1920px;height:260px;background:linear-gradient(180deg,#1a1208,#07050a)');
  const pD = K.person(h, 'daniel', 260, 300, 620, { rim: '#ffb347' });
  const pM = K.person(h, 'marcus', 1180, 300, 620, { rim: '#56e0c8', flip: true });
  R.up([pD, pM], S(id) + .05, .5, 30, .1);
  const b1 = K.text(h, '🍺', 'left:700px;top:700px;font-size:110px', 'emoji'), b2 = K.text(h, '🍺', 'left:1110px;top:700px;font-size:110px', 'emoji');
  R.up([b1, b2], S(id) + .3, .4, 20, .1);
  const lm = K.text(h, 'MARCUS · BEST FRIEND', 'left:1240px;top:250px;font-size:24px;color:#56e0c8', 'label');
  R.up(lm, WT(R, 'P34', 4), .3, 16);
  const ha = K.text(h, 'HA HA HA', 'left:1250px;top:170px;font-size:70px', 'kin cold');
  R.up(ha, WT(R, 'P34', 9) - .1, .25, 20); cue(WT(R, 'P34', 9), 'laugh', .4, .5);
  tl.to(ha, { y: -10, duration: .1, yoyo: true, repeat: 5 }, WT(R, 'P34', 9));
  const ph = K.text(h, '', 'left:640px;top:520px;width:110px;height:200px;border-radius:18px;background:#1b2440;border:3px solid #3a4158;box-shadow:0 0 40px rgba(120,160,255,.6)');
  R.up(ph, WT(R, 'P34', 12) - .2, .25, 10);
  tl.to(ph, { x: 520, rotation: 12, duration: .6, ease: 'power2.inOut' }, WT(R, 'P34', 14)); cue(WT(R, 'P34', 14), 'swoosh', .4);
  tl.to(ha, { opacity: 0, duration: .2 }, WT(R, 'P34', 16));
  const q = K.text(h, '…', 'left:1300px;top:150px;font-size:120px', 'kin cold');
  R.up(q, WT(R, 'P34', 19), .4, 10);
  const st = K.text(h, 'HE STOPPED LAUGHING.', 'top:110px;font-size:64px', 'center kin amber');
  R.up(st, WT(R, 'P34', 20), .35, 16); cue(WT(R, 'P34', 20), 'drone_hit', .5);
};

SC.head = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(S(id), false);
  const yours = K.text(h, 'AND IN YOURS.', 'top:200px;font-size:84px', 'center kin amber');
  R.up(yours, WT(R, 'P35', 12) - .1, .35, 20);
  tl.to(yours, { opacity: 0, duration: .3 }, V('P36') - .1);
  const l1 = K.text(h, '1 RIGHT GUESS → <span class="green">LUCK</span>', 'left:240px;top:260px;font-size:58px', 'kin cold');
  const l2 = K.text(h, '2 → <span class="amber">COINCIDENCE</span>', 'left:240px;top:350px;font-size:58px', 'kin cold');
  const l3 = K.text(h, 'MORE → <span class="red">HARDER TO EXPLAIN</span>', 'left:240px;top:440px;font-size:58px', 'kin cold');
  R.up(l1, WT(R, 'P36', 3), .3, 16); R.up(l2, WT(R, 'P36', 6) - .05, .3, 16); R.up(l3, WT(R, 'P36', 11), .3, 16);
  // the odds staircase
  const st = [[1, 2], [2, 4], [3, 8], [4, 16], [5, 32], [6, 64], [7, 128], [8, 256]];
  const t0 = V('P37') - .3;
  const tt = { 5: WT(R, 'P37', 0), 7: WT(R, 'P37', 7), 8: WT(R, 'P37', 15) };
  st.forEach(([n, d], i) => {
    const hh = 30 + n * 46, x = 1000 + i * 100;
    const b = K.text(h, '', `left:${x}px;top:${880 - hh}px;width:80px;height:${hh}px;border-radius:10px 10px 0 0;background:linear-gradient(180deg,${n >= 5 ? '#ffb347' : '#5b6ea8'},rgba(20,28,52,.8));transform-origin:50% 100%`);
    const lb = K.text(h, '1/' + d, `left:${x - 20}px;top:${880 - hh - 44}px;width:120px;text-align:center;font-size:${n >= 5 ? 26 : 20}px;color:${n >= 5 ? '#ffe2b8' : '#8390b5'}`, 'mono');
    K.text(h, n, `left:${x}px;top:900px;width:80px;text-align:center;font-size:20px`, 'label');
    const t = tt[n] || (t0 + i * .25);
    tl.set(b, { scaleY: 0 }, 0); tl.to(b, { scaleY: 1, duration: .35, ease: 'power3.out' }, t); R.up(lb, t + .15, .25, 8);
    if (tt[n]) { tl.to(b, { boxShadow: '0 0 40px rgba(255,179,71,.6)', duration: .2 }, t); cue(t, 'tick', .5, .3, { f: 500 + n * 90 }); }
  });
  K.text(h, 'IN A ROW', 'left:1000px;top:940px;font-size:20px', 'label');
  tl.to([l1, l2, l3], { opacity: .35, duration: .3 }, V('P37'));
};

SC.w8 = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(S(id) + .1);
  const stack = K.text(h, '$0', 'left:160px;top:330px;font-size:150px', 'big amber');
  const lab = K.text(h, 'WEEK 8 · ALL IN', 'left:166px;top:290px;font-size:24px', 'label');
  R.up([lab, stack], WT(R, 'P38', 5) - .2, .35, 20);
  R.count(stack, WT(R, 'P38', 5) - .1, .8, 0, 10000, K.money, 'power3.out'); cue(WT(R, 'P38', 5) - .1, 'counter', .5, 0, { dur: .8 });
  const most = K.text(h, 'THE MOST HE&#8217;D EVER RISKED', 'left:166px;top:510px;font-size:40px', 'kin cold');
  R.up(most, WT(R, 'P38', 10), .3, 16);
  const c = K.chart(h, 980, 300, 760, 360, { label: 'WEEK 8' });
  R.up(c.wrap, V('P39') - .7, .3, 20);
  c.draw(V('P39') - .6, .9, K.walk(1.4, 34, .45), 2.5);
  K.mark(8, 'U', WT(R, 'P39', 2));
  const f8 = K.text(h, '8 FOR 8', 'left:980px;top:760px;font-size:110px', 'kin green');
  R.slam(f8, WT(R, 'P39', 3) - .05, 2, .16); cue(WT(R, 'P39', 3) + .11, 'hit', .6);
  // "week nine almost broke him"
  const t9 = V('P40');
  tl.to([stack, lab, most, c.wrap, f8], { opacity: .12, duration: .4 }, t9 - .1);
  const nb = K.text(h, 'WEEK NINE', 'top:420px;font-size:200px', 'center kin red');
  R.up(nb, t9, .4, 20); cue(WT(R, 'P40', 3), 'crack', .8);
  tl.fromTo(nb, { scale: 1 }, { scale: 1.08, duration: 1.4, ease: 'power2.out', immediateRender: false }, WT(R, 'P40', 3));
};

/* ---------------- CHAPTER 4 · WEEK NINE ---------------- */
SC.nine = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 4, 'Week Nine');
  K.hudShow(S(id), false); K.hudShow(V('P41') + .3);
  K.weather(S(id), { rain: 1.4, bokeh: .6 }, 1);
  const said = K.text(h, '<div class="label" style="font-size:24px">THE EMAIL SAID</div><div class="big green" style="font-size:150px;margin-top:20px">▲ UP</div>', 'left:150px;top:330px');
  R.up(said, V('P41') - .1, .4, 30); cue(V('P41'), 'up', .6);
  const c = K.chart(h, 760, 300, 980, 420, { label: 'WEEK 9' });
  R.up(c.wrap, V('P42') - .4, .3, 20);
  // Mon down, Tue down, Thu worst day — stop at Thursday's close
  const pts = [0, -.3, -.7, -.5, -.9, -1.1, -1.4, -1.2, -1.6, -1.8, -1.5, -1.9, -2.2, -2.6, -3.1, -2.9];
  const dr = c.draw(V('P42') - .2, VE('P42') - V('P42'), pts, 3.5);
  ['MON', 'TUE', 'THU'].forEach((d, i) => {
    const t = WT(R, 'P42', [1, 5, 9][i]);
    const tg = K.text(h, d + ' ▼', `left:${790 + [0, 230, 640][i]}px;top:760px;font-size:26px`, 'mono red');
    R.up(tg, t, .25, 10); cue(t, 'down', .45, .2);
  });
  const worst = K.text(h, 'WORST DAY IN MONTHS', 'left:1130px;top:820px;font-size:44px', 'kin red');
  R.up(worst, WT(R, 'P42', 11), .3, 16);
};

SC.nosleep = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(S(id), false);
  K.text(h, '', 'inset:0;background:repeating-linear-gradient(90deg,rgba(60,90,80,.18) 0 118px,rgba(0,0,0,.4) 118px 122px),repeating-linear-gradient(0deg,rgba(60,90,80,.12) 0 118px,rgba(0,0,0,.4) 118px 122px)');
  const ph = K.phone(h, 760, 130, .95, { date: 'Wednesday', time: '3:12' });
  R.up(ph.el, S(id), .4, 30); ph.wake(S(id) + .1, false);
  // refresh, refresh, refresh
  const times = ['2:14 AM', '3:02 AM', '9:41 AM', '11:58 AM', '2:30 PM'];
  times.forEach((tm, i) => {
    const t = S(id) + .5 + i * (VE('P43') - S(id) - .8) / times.length;
    tl.set(ph.clock, { textContent: tm.split(' ')[0] }, t);
    const lb = K.text(h, '↻ ' + tm, `left:${i % 2 ? 1250 : 330}px;top:${290 + i * 110}px;font-size:40px;color:#8390b5`, 'mono');
    R.up(lb, t, .25, 10); tl.to(lb, { opacity: .25, duration: .6 }, t + .6); cue(t, 'refresh', .4, i % 2 ? .5 : -.5);
  });
  const risk = K.text(h, '$12,000 RIDING ON IT', 'top:900px;font-size:66px', 'center kin red');
  R.up(risk, WT(R, 'P43', 13), .35, 16);
  for (let i = 0; i < 4; i++) tl.to(risk, { scale: 1.05, duration: .18, yoyo: true, repeat: 1 }, WT(R, 'P43', 13) + .4 + i * .7);
  cue(S(id) + .2, 'heartbeat_loop', .7, 0, { dur: D_(R, id) });
};
const D_ = (R, id) => R.D(id);

SC.friday = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(S(id) + .1);
  const clk = K.text(h, '3:00', 'left:140px;top:300px;font-size:210px', 'mono cold');
  const pm = K.text(h, 'PM · FRIDAY', 'left:150px;top:530px;font-size:30px', 'label');
  R.up([clk, pm], V('P44') - .1, .35, 20);
  const left = K.text(h, 'ONE HOUR LEFT', 'left:150px;top:600px;font-size:54px', 'kin red');
  R.up(left, WT(R, 'P44', 4), .3, 16);
  const c = K.chart(h, 820, 300, 940, 420, { label: 'FRIDAY · LAST HOUR', days: ['3:00', '3:15', '3:30', '3:45', '4:00'] });
  R.up(c.wrap, V('P44') + .3, .3, 20);
  // intraday: still down... then the turn in the last forty minutes
  const pts = [];
  for (let i = 0; i <= 40; i++) { const k = i / 40; pts.push(k < .45 ? -2.9 + Math.sin(i * 1.7) * .15 : -2.9 + Math.pow((k - .45) / .55, 1.6) * 3.32 + Math.sin(i * 2.3) * .1 * (1 - k)); }
  pts[40] = .42;
  const tStart = WT(R, 'P44', 6), tEnd = WT(R, 'P46', 5);
  c.draw(tStart, tEnd - tStart, pts, 3.5);
  const cs = { m: 0 };
  tl.to(cs, { m: 60, duration: tEnd - V('P44') - .1, ease: 'none', onUpdate: () => { const m = Math.min(59, Math.floor(cs.m)); clk.textContent = cs.m >= 59.9 ? '4:00' : '3:' + String(m).padStart(2, '0'); } }, V('P44'));
  tl.set(clk, { textContent: '3:00' }, 0);
  const turn = K.text(h, 'THE TURN', 'left:1460px;top:760px;font-size:56px', 'kin green');
  R.up(turn, WT(R, 'P45', 6), .3, 16); cue(WT(R, 'P45', 6), 'rise', .7, .4);
  const why = K.text(h, 'A SPEECH? A RUMOR? A RATE?', 'left:820px;top:820px;font-size:34px;color:#8390b5', 'mono');
  R.up(why, WT(R, 'P45', 9), .3, 10);
  const close = K.text(h, 'CLOSED +0.42%', 'top:880px;font-size:84px', 'center kin green');
  R.slam(close, WT(R, 'P46', 5) - .05, 2, .16); cue(WT(R, 'P46', 5) + .1, 'bell', .9); R.flash(WT(R, 'P46', 5) + .1, .18, .4);
  tl.to([left, why], { opacity: 0, duration: .2 }, WT(R, 'P46', 5));
  tl.to(clk, { color: '#3dff9a', textShadow: '0 0 20px rgba(61,255,154,.8)', duration: .2 }, WT(R, 'P46', 5));
};

SC.who = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.mark(9, 'U', V('P47') - .1);
  const n9 = K.text(h, '9 FOR 9', 'top:420px;font-size:200px', 'center kin green');
  R.slam(n9, V('P47') - .1, 2, .16); cue(V('P47') + .06, 'hit', .7);
  const tN = V('P48');
  tl.to(n9, { opacity: 0, duration: .3 }, tN - .2);
  K.hudShow(tN - .2, false);
  K.weather(tN - .2, { rain: 2.2, drops: 2, bokeh: .7, warm: 1 }, 1);
  // inside the car, in the driveway
  const dash = K.text(h, '', 'left:0;top:760px;width:1920px;height:320px;background:linear-gradient(180deg,#0b0d14,#020306);border-top:3px solid rgba(255,179,71,.25)');
  const glow = K.text(h, '', 'left:820px;top:780px;width:280px;height:80px;border-radius:12px;background:rgba(255,160,60,.25);box-shadow:0 0 60px rgba(255,160,60,.45)');
  const pD = K.person(h, 'daniel', 760, 330, 560, { rim: '#ffb347', fill: '#020306', back: true });
  R.up([pD], tN - .1, .6, 20); tl.set([dash, glow], { opacity: 0 }, 0); tl.to([dash, glow], { opacity: 1, duration: .5 }, tN - .1);
  tl.set(pD, { zIndex: 0 }, 0);
  const q = K.text(h, 'Who are you?', 'top:200px;font-size:150px;font-style:italic', 'center serif cold');
  tl.set(q, { opacity: 0, filter: 'blur(16px)' }, 0);
  const tq = WT(R, 'P48', 16);
  tl.to(q, { opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, tq - .1);
  cue(tq - .1, 'whisper_hit', .7);
};
