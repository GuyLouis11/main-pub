/* COLD OPEN: alarm · sentence · never · offer0 · stakes · nobody · title */
window.SC = window.SC || {};
// safe word time: k-th word of a line (clamped), or a fraction of the line
const WT = (R, id, k) => { const ws = R.tim.vo[id].words || []; if (!ws.length) return R.V(id) + k * .35; return R.V(id) + ws[Math.min(k, ws.length - 1)][1]; };
const WF = (R, id, f) => R.V(id) + f * (R.VE(id) - R.V(id));
window.WT = WT; window.WF = WF;

SC.alarm = (R, K, h, id) => {
  const { tl, cue, S, E } = R;
  K.weather(S(id), { rain: 1, bokeh: .9, drops: 1 }, .1);
  // nightstand glow
  const desk = K.text(h, '', 'left:0;top:820px;width:1920px;height:260px;background:linear-gradient(180deg,#0a0f1d,#04060c)');
  const ph = K.phone(h, 760, 130, .98, { date: 'Monday, March 3', time: '6:00' });
  tl.fromTo(ph.el, { y: 40, rotation: -2 }, { y: 0, rotation: 0, duration: 2.2, ease: 'power2.out', immediateRender: false }, S(id));
  const t6 = WT(R, 'P01', 5);
  ph.wake(t6 - .1);
  ph.notify(t6 + .35, 'Week 1', 'The market will go down this week.');
  const L = K.text(h, 'MONDAY', 'left:150px;top:390px;font-size:28px;letter-spacing:12px', 'label');
  const T = K.text(h, '6:00 AM', 'left:146px;top:430px;font-size:120px', 'mono amber');
  R.up([L, T], t6 - .2, .5, 30, .1);
  const nm = K.text(h, 'SOMEONE HE&#8217;D<br>NEVER MET', 'left:1270px;top:420px;font-size:96px;line-height:1.02;white-space:normal;width:600px', 'kin cold');
  R.up(nm, WT(R, 'P01', 13) - .1, .5, 30);
  tl.to(nm, { letterSpacing: '4px', duration: 2, ease: 'power2.out' }, WT(R, 'P01', 13));
};

SC.sentence = (R, K, h, id) => {
  const { tl, cue, S, E, V } = R;
  const m = K.mail(h, 360, 170, 1200, { subj: 'Week 1' });
  R.up(m, S(id) + .1, .5, 50);
  const end = K.type(m.bd, 'The market will go down this week.', WT(R, 'P02', 3), 26);
  const one = K.text(h, 'ONE SENTENCE.', 'left:360px;top:120px;font-size:30px;letter-spacing:10px', 'label');
  R.up(one, WT(R, 'P02', 3) - .2, .4, 16);
  // Up. Down. Down. Up.
  const seq = ['U', 'D', 'D', 'U'];
  tl.to(m, { y: -60, scale: .82, opacity: .25, duration: .4, ease: 'power3.inOut' }, V('P03') - .25);
  seq.forEach((d, i) => {
    const t = WT(R, 'P03', i);
    const a = K.text(h, d === 'U' ? '▲' : '▼', `left:${300 + i * 350}px;top:520px;width:300px;text-align:center;font-size:260px`, 'big ' + (d === 'U' ? 'green' : 'red'));
    const w = K.text(h, d === 'U' ? 'UP' : 'DOWN', `left:${300 + i * 350}px;top:820px;width:300px;text-align:center;font-size:64px`, 'kin ' + (d === 'U' ? 'green' : 'red'));
    R.slam(a, t - .1, 2.2, .16); R.up(w, t, .3, 20);
    cue(t + .06, d === 'U' ? 'up' : 'down', .8, -.6 + i * .4);
  });
};

SC.never = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  // giant tally, filling at speed
  const row = K.text(h, '', 'left:210px;top:330px;width:1500px;height:200px');
  const seq = K.TRUTH;
  const t0 = WT(R, 'P04', 3), t1 = WT(R, 'P04', 9);
  for (let i = 0; i < 10; i++) {
    const b = K.text(row, `<div class="mono" style="font-size:22px;color:#7f8bb0;margin-top:14px">W${i + 1}</div><div class="big ${seq[i] === 'U' ? 'green' : 'red'}" style="font-size:64px;margin-top:20px">${seq[i] === 'U' ? '▲' : '▼'}</div>`,
      `left:${i * 150}px;top:0;width:126px;height:170px;border-radius:18px;border:2px solid rgba(170,190,240,.3);background:rgba(10,16,32,.6);text-align:center`);
    const ok = K.text(b, '✓', 'right:-14px;top:-16px;width:44px;height:44px;border-radius:50%;background:#3dff9a;color:#04060c;font:900 28px/44px Space Grotesk;text-align:center;box-shadow:0 0 20px #3dff9a');
    const t = t0 + (t1 - t0) * i / 9;
    R.pop(b, t, .25, .4); tl.set(ok, { opacity: 0, scale: 2.4 }, 0); tl.to(ok, { opacity: 1, scale: 1, duration: .14, ease: 'power4.in' }, t + .12);
    tl.to(b, { borderColor: 'rgba(61,255,154,.9)', duration: .1 }, t + .12);
    cue(t + .12, 'check', .55 + i * .03, -.7 + i * .15);
  }
  const nw = K.text(h, 'NEVER WRONG.', 'top:620px;font-size:110px', 'center kin cold');
  R.up(nw, WT(R, 'P04', 3) - .1, .4, 30);
  // 1 in 1,024
  tl.to(row, { y: -150, scale: .8, duration: .45, ease: 'power3.inOut' }, V('P05') - .2);
  tl.to(nw, { opacity: 0, duration: .25 }, V('P05') - .2);
  const od = K.text(h, '1 IN 2', 'top:520px;font-size:200px', 'center mono amber');
  const lab = K.text(h, 'THE ODDS OF GUESSING TEN IN A ROW', 'top:470px;font-size:26px;letter-spacing:8px', 'center label');
  R.up(lab, V('P05'), .3, 16);
  R.pop(od, WT(R, 'P05', 3) - .1, .3, .6);
  const ta = WT(R, 'P05', 3), tb = VE('P05') - .1;
  for (let k = 1; k <= 10; k++) { const t = ta + (tb - ta) * (k - 1) / 9; tl.set(od, { textContent: '1 IN ' + K.fmt(Math.pow(2, k)) }, t); if (k % 2 === 0) cue(t, 'tick', .4, 0, { f: 600 + k * 120 }); }
  tl.to(od, { scale: 1.12, duration: .2, yoyo: true, repeat: 1 }, tb);
  cue(tb, 'hit', .7);
};

SC.offer0 = (R, K, h, id) => {
  const { tl, cue, S, V } = R;
  const m = K.mail(h, 460, 200, 1000, { subj: 'Week 11', when: 'Monday 6:00 AM' });
  R.up(m, S(id) + .05, .4, 40);
  K.type(m.bd, 'No prediction this week.', V('P06') + .3, 30);
  const fee = K.text(h, '$50,000', 'top:600px;font-size:230px', 'center big amber');
  const tf = WT(R, 'P06', 6);
  R.slam(fee, tf - .12, 2.4, .2); cue(tf + .08, 'impact', 1); R.shake(tf + .08, 14, .3, `[data-scene="${id}"] .cam`); R.flash(tf + .08, .25, .35);
  tl.to(m, { opacity: .3, duration: .3 }, tf);
  R.glitch(fee, tf + .6, .25);
};

SC.stakes = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const pD = K.person(h, 'daniel', 780, 300, 560, { rim: '#ffb347' });
  const pM = K.person(h, 'maya', 380, 380, 480, { rim: '#9fb7ff' });
  const pL = K.person(h, 'lily', 1180, 400, 460, { rim: '#ff9ad5' });
  R.up(pD, S(id) + .05, .5, 30);
  const lab = (x, y, t, c) => K.text(h, t, `left:${x}px;top:${y}px;font-size:24px;letter-spacing:6px;color:${c}`, 'label');
  const lw = lab(430, 330, 'A WIFE', '#9fb7ff'), lm = lab(860, 250, 'A MORTGAGE', '#ffb347'), ll = lab(1210, 350, 'A DAUGHTER · COLLEGE', '#ff9ad5');
  R.up([pM, lw], WT(R, 'P07', 3) - .1, .45, 30); R.up(lm, WT(R, 'P07', 5) - .1, .4, 20); R.up([pL, ll], WT(R, 'P07', 8) - .1, .45, 30);
  cue(WT(R, 'P07', 3) - .1, 'soft', .4, -.5); cue(WT(R, 'P07', 8) - .1, 'soft', .4, .5);
  // and ten perfect predictions
  const tI = WT(R, 'P07', 13);
  tl.to([pD, pM, pL, lw, lm, ll], { opacity: .25, duration: .4 }, tI - .2);
  const inbox = K.text(h, '', 'left:560px;top:150px;width:800px;height:800px');
  for (let i = 0; i < 10; i++) {
    const r = K.text(inbox, `<span class="mono" style="font-size:22px;color:#8e9bc4">MON 6:00</span>&nbsp;&nbsp;&nbsp;<b style="font:700 26px Space Grotesk;color:#fff">Week ${i + 1}</b><span style="float:right;color:#3dff9a;font:800 26px Space Grotesk">✓</span>`,
      `left:0;top:${i * 72}px;width:800px;padding:18px 26px;border-radius:14px;background:rgba(20,28,52,.85);border:1px solid rgba(170,190,240,.2)`);
    R.up(r, tI + i * .07, .3, -20); if (i % 3 === 0) cue(tI + i * .07, 'tick', .3, 0, { f: 1400 });
  }
};

SC.nobody = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { bokeh: .4 }, 1);
  const pS = K.person(h, 'sender', 760, 230, 600, { rim: '#9b7bff', glow: 24 });
  tl.set(pS, { opacity: 0 }, 0); tl.to(pS, { opacity: .55, duration: 1.4, ease: 'power1.in' }, S(id) + .1);
  const q = K.text(h, 'SENDER:', 'left:300px;top:420px;font-size:28px;letter-spacing:10px', 'label');
  const u = K.text(h, 'UNKNOWN', 'left:296px;top:466px;font-size:110px', 'kin violet');
  R.up([q, u], WT(R, 'P08', 1), .4, 20, .1); cue(WT(R, 'P08', 1), 'drone_hit', .6);
  tl.to(u, { opacity: .2, duration: .06, yoyo: true, repeat: 5 }, WT(R, 'P08', 3));
  const how = K.text(h, 'HOW IT WORKED', 'left:1180px;top:470px;font-size:100px', 'kin amber');
  R.up(how, WT(R, 'P08', 13) - .1, .4, 30);
};
SC.nobody.opts = { zoom: 1.08 };

SC.title = (R, K, h, id) => {
  const { tl, cue, S, E } = R;
  K.weather(S(id), { bokeh: .2, rain: .6 }, .5);
  const t = K.text(h, 'The Prophet', 'top:390px;font-size:240px;font-style:italic', 'center serif cold');
  const sub = K.text(h, 'A STORY BASED ON A REAL SCAM', 'top:690px;font-size:26px;letter-spacing:14px', 'center label');
  const rule = K.text(h, '', 'left:660px;top:660px;width:600px;height:2px;background:linear-gradient(90deg,transparent,#ffb347,transparent);transform-origin:50% 50%');
  tl.set(t, { opacity: 0, filter: 'blur(24px)', scale: 1.15, letterSpacing: '40px' }, 0);
  tl.to(t, { opacity: 1, filter: 'blur(0px)', scale: 1, letterSpacing: '0px', duration: 1.3, ease: 'power3.out' }, S(id) + .2);
  tl.set(rule, { scaleX: 0 }, 0); tl.to(rule, { scaleX: 1, duration: .9, ease: 'power3.out' }, S(id) + .9);
  R.up(sub, S(id) + 1.2, .5, 16);
  R.glitch(t, S(id) + 2.6, .2);
  cue(S(id) + .2, 'title', 1);
  tl.to(t, { scale: 1.04, duration: E(id) - S(id) - 1.5, ease: 'none' }, S(id) + 1.5);
  tl.to('#tag', { opacity: 0, duration: .4 }, E(id) - .2);
};
SC.title.opts = { nocam: true };
