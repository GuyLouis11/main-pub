/* CH7 MONDAY: w12 · kitchen · lily · real · today · ask       CH8 THE SENDER: turn · how · sender · again · end */
window.SC = window.SC || {};

SC.w12 = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 7, 'Monday');
  K.weather(S(id), { rain: 1.2, bokeh: .7, warm: 0 }, 1);
  const m = K.mail(h, 160, 230, 700, { subj: 'Week 12' });
  R.up(m, V('P76') - .1, .4, 30);
  K.type(m.bd, 'Up.', WT(R, 'P76', 2), 10);
  const c = K.chart(h, 980, 260, 760, 330, { label: 'WEEK 12' });
  R.up(c.wrap, WT(R, 'P76', 4) - .3, .3, 20);
  c.draw(WT(R, 'P76', 4) - .2, VE('P76') - WT(R, 'P76', 4) + .2, K.walk(-3.0, 34, .5), 3.5);
  const wr = K.text(h, '✗ WRONG', 'left:980px;top:660px;font-size:90px', 'kin red');
  R.slam(wr, VE('P76') - .05, 2, .16); cue(VE('P76') + .11, 'buzz_wrong', .8);
  // week 13: nothing
  const t13 = V('P77');
  tl.to([m, c.wrap, wr], { opacity: 0, duration: .3 }, t13 - .2);
  const ib = K.text(h, '<div class="label" style="padding:30px 36px 0;font-size:22px">INBOX</div><div style="text-align:center;margin-top:120px;font:600 40px Space Grotesk;color:#6f7ba0">No new mail</div>', 'left:560px;top:200px;width:800px;height:440px;border-radius:24px;background:rgba(12,18,36,.9);border:1px solid rgba(170,190,240,.2)');
  R.up(ib, t13, .35, 20);
  const clk = K.text(h, '6:00', 'left:1420px;top:220px;font-size:80px', 'mono amber');
  R.up(clk, t13 + .2, .3, 10);
  ['6:01', '6:15', '6:40', '7:30'].forEach((tm, i) => tl.set(clk, { textContent: tm }, t13 + .6 + i * .45));
  // reply bounces
  const t8 = V('P78');
  const bo = K.text(h, '<b style="color:#ff3b4f">Delivery failed</b><br><span style="color:#8e9bc4">Address not found. The account you tried to reach does not exist.</span>', 'left:560px;top:700px;width:800px;padding:26px 32px;border-radius:18px;background:rgba(60,10,20,.75);border:1px solid rgba(255,59,79,.6);font:500 28px/1.4 Space Grotesk');
  R.up(bo, WT(R, 'P78', 5), .35, 20); cue(WT(R, 'P78', 5), 'bounce', .8);
  const gone = K.text(h, 'SO WAS THE MONEY.', 'top:930px;font-size:70px', 'center kin red');
  R.up(gone, WT(R, 'P78', 11), .35, 16); cue(WT(R, 'P78', 11), 'drone_hit', .8);
};

SC.kitchen = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { rain: .5, bokeh: .4, warm: 0 }, 1);
  const dawn = K.text(h, '', 'left:1200px;top:120px;width:520px;height:560px;border-radius:12px;background:linear-gradient(180deg,#24365e,#0d1630);box-shadow:inset 0 0 0 14px #0a0d16');
  R.up(dawn, S(id), .6, 0);
  K.text(h, '', 'left:0;top:800px;width:1920px;height:280px;background:linear-gradient(180deg,#0b0f19,#04060b)');
  const pD = K.person(h, 'daniel', 260, 330, 600, { rim: '#9fb7ff' });
  const pM = K.person(h, 'maya', 760, 330, 600, { rim: '#9fb7ff', flip: true });
  R.up([pD, pM], S(id) + .1, .6, 20, .2);
  const ov = K.text(h, '6:00', 'left:1360px;top:740px;font-size:70px;padding:10px 26px;background:#05070d;border-radius:10px', 'mono amber');
  R.up(ov, WT(R, 'P79', 6), .4, 10); cue(WT(R, 'P79', 6), 'beep', .5);
  for (let i = 0; i < 4; i++) tl.to(ov, { opacity: .3, duration: .25, yoyo: true, repeat: 1 }, WT(R, 'P79', 8) + i * .8);
  const tx = K.text(h, 'THE SAME TIME THE EMAILS USED TO COME', 'left:180px;top:200px;font-size:30px;letter-spacing:6px;color:#9fb7ff', 'label');
  R.up(tx, WT(R, 'P79', 11), .4, 10);
};

SC.lily = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const pL = K.person(h, 'lily', 200, 300, 640, { rim: '#ff9ad5' });
  R.up(pL, V('P80') - .1, .5, 20);
  const line = K.text(h, '', 'left:780px;top:560px;width:820px;height:4px;background:rgba(255,154,213,.5);transform-origin:0 50%');
  tl.set(line, { scaleX: 0 }, 0); tl.to(line, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, WT(R, 'P80', 5));
  const st = [['COMMUNITY COLLEGE', '2 YEARS', 780, WT(R, 'P80', 5)], ['WORKING WEEKENDS', '', 1190, WT(R, 'P80', 12)], ['ENGINEER', 'NOW', 1600, WT(R, 'P80', 14)]];
  const tlParts = [];
  st.forEach(([a, b, x, t]) => {
    const d = K.text(h, '', `left:${x - 12}px;top:548px;width:28px;height:28px;border-radius:50%;background:#ff9ad5;box-shadow:0 0 18px #ff9ad5`);
    const l = K.text(h, a, `left:${x - 20}px;top:470px;font-size:20px;letter-spacing:4px;color:#ffd1ea`, 'label');
    const l2 = K.text(h, b, `left:${x - 20}px;top:610px;font-size:20px`, 'label');
    tlParts.push(d, l, l2);
    R.pop(d, t, .25, .3); R.up([l, l2], t + .1, .3, 10); cue(t, 'soft', .35, .3);
  });
  const nt = K.text(h, 'SHE DOESN&#8217;T TALK ABOUT THAT SPRING.', 'left:780px;top:760px;font-size:44px;font-style:italic;font-family:Instrument Serif;text-transform:none;letter-spacing:0', 'cold');
  R.up(nt, WT(R, 'P80', 16), .5, 10);
  // Daniel: still awake at six
  const tD = V('P81');
  tl.to([pL, line, nt], { opacity: 0, duration: .4 }, tD - .2);
  tl.to(tlParts, { opacity: 0, duration: .4 }, tD - .2);
  const pD = K.person(h, 'daniel', 300, 330, 600, { rim: '#ffb347' });
  R.up(pD, tD, .5, 20);
  const ph = K.phone(h, 1050, 130, .9, { date: 'Monday', time: '6:00' });
  R.up(ph.el, tD + .2, .4, 20);
  const dates = ['June 2', 'Sept 8', 'Jan 12', 'May 4', 'Oct 6'];
  dates.forEach((d, i) => { const t = tD + .6 + i * .55; tl.set(ph.el.querySelector('.date'), { textContent: 'Monday, ' + d }, t); ph.wake(t, false); cue(t, 'buzz', .35, .4); });
  const cs = K.text(h, 'HE CAN&#8217;T STOP.', 'left:1500px;top:820px;font-size:60px', 'kin amber');
  R.up(cs, WT(R, 'P81', 12), .35, 16);
};

SC.real = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { rain: .2, bokeh: .3 }, .8);
  const stp = K.text(h, 'NOT FICTION', 'left:960px;top:200px;color:#ff3b4f', 'stamp');
  tl.set(stp, { xPercent: -50, rotation: -6, opacity: 0, scale: 2.6 }, 0);
  tl.to(stp, { opacity: 1, scale: 1, duration: .16, ease: 'power4.in' }, WT(R, 'P82', 3) - .1); cue(WT(R, 'P82', 3) + .06, 'stamp', 1);
  tl.to(stp, { y: -60, scale: .55, duration: .4, ease: 'power3.inOut' }, V('P83') - .2);
  // FTC 2024
  const ch = K.text(h, '', 'left:300px;top:360px;width:1320px;height:540px');
  K.text(ch, 'REPORTED LOSSES TO FRAUD · UNITED STATES · 2024', 'left:0;top:0;font-size:24px', 'label');
  const bars = [['ALL REPORTED FRAUD', 12.5, '#5b6ea8', WT(R, 'P83', 6) - .3], ['INVESTMENT SCAMS', 5.7, '#ff3b4f', WT(R, 'P83', 6)], ['IMPOSTER SCAMS (NEXT LARGEST)', 2.95, '#7f8bb0', WT(R, 'P83', 15)]];
  bars.forEach(([lab, v, col, t], i) => {
    const w = v / 12.5 * 1000;
    K.text(ch, lab, `left:0;top:${80 + i * 140}px;font-size:22px;color:${i === 1 ? '#ffb3bd' : '#8390b5'}`, 'label');
    const b = K.text(ch, '', `left:0;top:${116 + i * 140}px;width:${w}px;height:62px;border-radius:0 12px 12px 0;background:linear-gradient(90deg,${col},${col}aa);transform-origin:0 50%;box-shadow:${i === 1 ? '0 0 30px rgba(255,59,79,.5)' : 'none'}`);
    const n = K.text(ch, '$' + v + 'B', `left:${w + 24}px;top:${118 + i * 140}px;font-size:54px`, 'mono ' + (i === 1 ? 'red' : 'cold'));
    tl.set(b, { scaleX: 0 }, 0); tl.to(b, { scaleX: 1, duration: .6, ease: 'power3.out' }, t); R.up(n, t + .4, .3, 10);
    cue(t, 'rise', .45, 0);
  });
  const src = K.text(h, 'SOURCE: FEDERAL TRADE COMMISSION, CONSUMER SENTINEL DATA (2024)', 'left:300px;top:930px;font-size:18px', 'label');
  R.up(src, WT(R, 'P83', 17), .3, 8);
  const most = K.text(h, 'MORE THAN ANY OTHER KIND OF FRAUD', 'left:300px;top:310px;font-size:34px', 'kin amber');
  R.up(most, WT(R, 'P83', 10), .3, 10);
};

SC.today = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const mk = (x, rot, title, lines, t) => {
    const p = K.text(h, `<div style="padding:30px 26px 14px;font:700 24px Space Grotesk;color:#fff;border-bottom:1px solid rgba(255,255,255,.1)">${title}</div>` +
      lines.map(l => `<div style="margin:16px 20px 0;padding:16px 18px;border-radius:16px;background:rgba(40,52,90,.85);font:600 22px/1.3 Space Grotesk;color:#e8eefc">${l}</div>`).join(''),
      `left:${x}px;top:170px;width:420px;height:760px;border-radius:44px;background:#0b1020;box-shadow:0 40px 100px rgba(0,0,0,.7),inset 0 0 0 8px #1d2232;transform:rotate(${rot}deg)`);
    R.up(p, t, .45, 60); cue(t, 'whoosh', .5);
    return p;
  };
  const t0 = WT(R, 'P84', 7);
  mk(260, -6, '📈 VIP Trading Group', ['✅ CALLED IT. +18%', '🔥 10 wins in a row', 'Spots closing tonight'], t0 - .1);
  mk(750, 0, '⚡ Signals Channel', ['TOMORROW: ▼ DOWN', '✅ Perfect record this month', 'DM to join'], WT(R, 'P84', 10) - .1);
  mk(1240, 6, '@perfect.record', ['📊 screenshot: +412%', '📊 screenshot: 10/10', 'link in bio'], WT(R, 'P84', 13) - .1);
  const fic = K.text(h, 'ILLUSTRATIVE EXAMPLES', 'top:960px;font-size:18px', 'center label');
  R.up(fic, t0 + .5, .3, 8);
  const nd = K.text(h, 'NO EMAIL NEEDED.', 'top:70px;font-size:70px', 'center kin cold');
  R.up(nd, WT(R, 'P84', 4), .35, 16);
};

SC.ask = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { bokeh: .2, rain: .4 }, 1);
  const a = K.text(h, 'DON&#8217;T ASK HOW THEY WERE RIGHT.', 'top:300px;font-size:84px', 'center kin cold');
  const b = K.text(h, 'ASK HOW MANY PEOPLE<br>THEY STARTED WITH.', 'top:440px;font-size:120px;line-height:1.02', 'center kin amber');
  R.up(a, WT(R, 'P85', 9) - .1, .35, 16); R.up(b, WT(R, 'P85', 14) - .1, .45, 24); cue(WT(R, 'P85', 14) - .1, 'hit', .7);
  // the other email, everywhere
  const t0 = V('P86');
  tl.to([a, b], { opacity: .12, duration: .4 }, t0);
  for (let i = 0; i < 46; i++) {
    const x = 60 + (i % 9) * 205 + (Math.floor(i / 9) % 2) * 100, y = 90 + Math.floor(i / 9) * 190;
    const c = K.text(h, '<b style="font:700 18px Space Grotesk;color:#cfd8f5">Week 1</b><br><span style="font:500 16px Space Grotesk;color:#ff9aac">The market will go up this week.</span>', `left:${x}px;top:${y}px;width:190px;padding:14px 16px;border-radius:12px;background:rgba(30,20,40,.8);border:1px solid rgba(255,90,110,.35)`);
    tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: .2 + (i % 5) * .1, duration: .4 }, t0 + .2 + (i * 37 % 46) * .03);
  }
  cue(t0 + .2, 'swell', .6, 0, { dur: 2 });
  const o = K.text(h, 'THE OTHER EMAIL', 'top:500px;font-size:110px', 'center kin red');
  R.up(o, WT(R, 'P86', 8), .4, 20);
};

/* ---------------- CHAPTER 8 · THE SENDER ---------------- */
SC.turn = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 8, 'The Sender');
  K.weather(S(id), { rain: .3, bokeh: .15, warm: 0 }, 1.5);
  const q = K.text(h, 'SENDER:', 'left:300px;top:420px;font-size:28px;letter-spacing:10px', 'label');
  const u = K.text(h, 'UNKNOWN', 'left:296px;top:466px;font-size:150px', 'kin violet');
  R.up([q, u], V('P87') + .2, .4, 20, .1);
  const tn = V('P88');
  const chars = 'UNKNOWN'.split('');
  for (let i = 0; i < 10; i++) tl.set(u, { textContent: chars.map(() => String.fromCharCode(65 + Math.floor(R.rnd() * 26))).join('') }, tn + i * .05);
  tl.set(u, { textContent: 'NOT QUITE.' }, tn + .5);
  R.glitch(u, tn, .5); cue(tn, 'glitch', .8); R.shake(tn + .1, 10, .3, `[data-scene="${id}"] .cam`);
  tl.to(u, { color: '#fff', textShadow: '0 0 30px rgba(155,123,255,1)', duration: .2 }, tn + .5);
};

SC.how = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { rain: 0, drops: .3, bokeh: .1 }, .5);
  const cards = [['READS EVERYTHING TWICE', 'daniel', WT(R, 'P89', 7)], ['ALONE IN HIS CAR, ASKING WHO I WAS', 'daniel', WT(R, 'P89', 13)], ['EXACTLY SEVEN OF THE TEN PAID', '7', WT(R, 'P89', 25)]];
  cards.forEach(([txt, kind, t], i) => {
    const c = K.text(h, '', `left:${140 + i * 560}px;top:280px;width:520px;height:520px;overflow:hidden`, 'glass');
    if (kind === 'daniel') { const p = K.person(c, 'daniel', 130, 70, 300, { rim: i === 1 ? '#ffb347' : '#9fb7ff' }); }
    else K.text(c, '7/10', 'left:0;top:120px;width:520px;text-align:center;font-size:150px', 'big amber');
    K.text(c, txt, 'left:0;top:400px;width:520px;height:120px;padding:26px 30px 0;background:rgba(6,9,18,.85);font:700 24px/1.3 Space Grotesk;letter-spacing:2px;color:#e8eefc;white-space:normal;text-align:center');
    R.up(c, t - .2, .35, 40); cue(t - .2, 'rewind_tick', .7, -.6 + i * .6);
    tl.to(c, { borderColor: 'rgba(155,123,255,.8)', boxShadow: '0 0 40px rgba(155,123,255,.4)', duration: .3 }, t + .1);
  });
  const hw = K.text(h, 'HOW WOULD I KNOW?', 'top:860px;font-size:70px', 'center kin violet');
  R.up(hw, VE('P89') - .5, .35, 16);
};

SC.sender = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { rain: 0, drops: 0, bokeh: 0 }, .3);
  // the room: three monitors, the outbox
  const mon = (x, w, rot) => K.text(h, '', `left:${x}px;top:170px;width:${w}px;height:500px;border-radius:18px;background:#070b16;border:10px solid #1a1f2c;box-shadow:0 0 120px rgba(155,123,255,.25);transform:perspective(1400px) rotateY(${rot}deg)`);
  const mL = mon(80, 520, 22), mC = mon(640, 640, 0), mR = mon(1320, 520, -22);
  R.up([mL, mC, mR], S(id), .6, 20, .1); cue(S(id), 'crt_on', .7);
  // outbox rows
  const names = ['R. Okafor', 'J. Lindqvist', 'M. Alvarez', 'C. Whitfield', 'S. Park', 'T. Brennan', 'A. Novak', 'K. Mensah', 'L. Duarte', 'P. Ivers'];
  const list = K.text(mC, '', 'left:20px;top:70px;width:580px;height:400px;overflow:hidden');
  K.text(mC, 'OUTBOX · WEEK 1 · 10,240 SENT', 'left:24px;top:24px;font-size:18px;color:#9b7bff', 'label');
  const rows = K.text(list, '', 'left:0;top:0;width:580px');
  for (let i = 0; i < 40; i++) {
    const num = 4071 + i, isD = num === 4091;
    const nm = isD ? 'D. Hale' : names[(i * 7) % names.length];
    K.text(rows, `<span style="color:#6f7ba0">#${K.fmt(num)}</span>&nbsp;&nbsp;${nm}<span style="float:right;color:${(i % 2) ? '#3dff9a' : '#ff6680'}">${(i % 2) ? '▲ UP' : '▼ DOWN'}</span>`,
      `left:0;top:${i * 40}px;width:560px;padding:8px 12px;font:600 20px JetBrains Mono;color:${isD ? '#ffb347' : '#cfd8f5'};${isD ? 'background:rgba(255,179,71,.14);border:1px solid #ffb347;border-radius:6px' : ''}`);
  }
  const tl0 = S(id) + .3, tD = WT(R, 'P91', 3);
  tl.fromTo(rows, { y: 0 }, { y: -20 * 40 + 160, duration: tD - tl0, ease: 'power2.out', immediateRender: false }, tl0);
  cue(tl0, 'scroll', .5, 0, { dur: tD - tl0 });
  K.text(mL, '<div class="mono" style="font-size:16px;color:#3dff9a;line-height:1.7;padding:24px">▲ UP · 5,120<br>▼ DOWN · 5,120<br><br>WEEK 2 ▲ 2,560<br>WEEK 2 ▼ 2,560<br><br>WEEK 3 ▲ 1,280<br>WEEK 3 ▼ 1,280</div>', 'inset:0');
  K.text(mR, '<div class="mono" style="font-size:16px;color:#ffb347;line-height:1.7;padding:24px">WEEK 11 · OFFER<br>RECIPIENTS: 10<br>PAID: 7<br><br>TOTAL: $350,000</div>', 'inset:0');
  // the sender, from behind
  const pS = K.person(h, 'sender', 760, 520, 620, { rim: '#9b7bff', glow: 28 });
  R.up(pS, WT(R, 'P90', 1), .7, 30);
  const wr = K.text(h, 'I WROTE EVERY ONE.', 'top:80px;font-size:70px', 'center kin violet');
  R.up(wr, WT(R, 'P90', 1), .4, 16); cue(WT(R, 'P90', 1), 'reveal_low', 1);
  const all = K.text(h, '10,240', 'left:120px;top:720px;font-size:120px', 'mono violet');
  R.up(all, WT(R, 'P90', 9), .35, 16);
  const dn = K.text(h, 'DANIEL · #4,091', 'left:1360px;top:740px;font-size:44px', 'mono amber');
  R.up(dn, tD, .35, 16); cue(tD, 'ping', .7, .5);
};

SC.again = (R, K, h, id) => {
  const { tl, cue, S, V, VE, E } = R;
  const sch = K.text(h, '', 'left:460px;top:200px;width:1000px;height:520px', 'glass');
  R.up(sch, S(id), .4, 30);
  K.text(sch, 'SCHEDULE SEND', 'left:50px;top:50px;font-size:22px;color:#9b7bff', 'label');
  K.text(sch, '<span style="color:#8390b5">When</span>&nbsp;&nbsp;&nbsp;Monday · 6:00 AM<br><span style="color:#8390b5">To</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10,240 recipients<br><span style="color:#8390b5">Subject</span>&nbsp;&nbsp;Week 1', 'left:50px;top:110px;font:600 40px/1.6 Space Grotesk;color:#f2f6ff;white-space:nowrap');
  const btn = K.text(sch, 'SCHEDULE', 'left:50px;top:400px;padding:22px 44px;border-radius:14px;background:#9b7bff;color:#fff;font:800 30px Space Grotesk;letter-spacing:4px');
  const cur = K.text(h, '', 'left:0;top:0;width:0;height:0;border-left:18px solid #fff;border-top:10px solid transparent;border-bottom:30px solid transparent;transform:rotate(-20deg)');
  tl.set(cur, { x: 1300, y: 900 }, 0);
  const tc = WT(R, 'P92', 6);
  tl.to(cur, { x: 640, y: 640, duration: .8, ease: 'power2.inOut' }, tc - .9);
  tl.to(btn, { scale: .94, duration: .06, yoyo: true, repeat: 1 }, tc); cue(tc, 'click', .9);
  tl.set(btn, { textContent: 'SCHEDULED ✓', background: '#3dff9a', color: '#04060c' }, tc + .1);
  // check your inbox: the viewer's phone, in the dark
  const t3 = V('P93');
  tl.to([sch, cur], { opacity: 0, duration: .25 }, t3 - .3);
  tl.to('#black', { opacity: .92, duration: .3 }, t3 - .3);
  const nt = K.text(R.$('#root'), '<div style="font:700 17px Space Grotesk;color:#b9c6e8"><b style="display:inline-block;width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#5d7cff,#8c5bff);vertical-align:middle;margin-right:10px"></b>Mail · now</div><div style="margin-top:10px;font:700 26px Space Grotesk;color:#fff">Week 1</div><div style="margin-top:6px;font:500 24px Space Grotesk;color:#d4dcf3">The market will go up this week.</div>',
    'left:660px;top:420px;width:600px;padding:24px 28px;border-radius:28px;background:rgba(235,240,255,.16);border:1px solid rgba(255,255,255,.18);z-index:90');
  tl.set(nt, { opacity: 0, y: -60 }, 0);
  tl.to(nt, { opacity: 1, y: 0, duration: .45, ease: 'back.out(1.5)' }, WT(R, 'P93', 2) + .15); cue(WT(R, 'P93', 2) + .15, 'notif', 1);
  tl.to(nt, { opacity: 0, duration: .15 }, E(id) - .15);
  tl.to('#black', { opacity: 1, duration: .1 }, E(id) - .15);
};
SC.again.opts = { dout: 0 };

SC.end = (R, K, h, id) => {
  const { tl, cue, S, V, VE, E } = R;
  tl.to('#black', { opacity: 0, duration: 1.2 }, S(id) + 1.0);
  K.weather(S(id), { rain: .6, bokeh: .5, drops: .6 }, 2);
  const a = K.text(h, 'Daniel is fictional.', 'top:240px;font-size:96px;font-style:italic', 'center serif cold');
  const b = K.text(h, 'The math — and the scam — are real.', 'top:360px;font-size:70px;font-style:italic', 'center serif amber');
  R.up(a, S(id) + 1.6, .8, 20); R.up(b, S(id) + 2.6, .8, 20);
  const src = K.text(h, 'SOURCES · J. ELLENBERG, HOW NOT TO BE WRONG (2014) · DERREN BROWN: THE SYSTEM (CHANNEL 4, 2008) · FTC CONSUMER SENTINEL DATA (2024)', 'top:925px;font-size:16px;letter-spacing:3px', 'center label');
  R.up(src, S(id) + 3.4, .6, 8);
  tl.to('#tag', { opacity: 1, duration: .6 }, S(id) + 3.4);
  // end-screen slots (YouTube elements sit over these)
  const slot = (x) => { const s = K.text(h, '<div class="label" style="position:absolute;left:0;top:-38px;font-size:18px">WATCH NEXT</div>', `left:${x}px;top:520px;width:600px;height:338px;border-radius:18px;border:2px solid rgba(170,190,240,.25);background:rgba(20,28,52,.35)`); R.up(s, S(id) + 4.2, .6, 20); return s; };
  slot(260); slot(1060);
  tl.to([a, b], { y: -10, duration: E(id) - S(id) - 2, ease: 'sine.inOut' }, S(id) + 2);
  cue(S(id) + .2, 'outro', 1, 0, { dur: E(id) - S(id) });
  tl.to('#black', { opacity: 1, duration: .8 }, E(id) - .8);
};
SC.end.opts = { din: 0, dout: 0 };
