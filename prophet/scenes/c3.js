/* CH5 THE OFFER: w10 · offer · math · maya · wire */
window.SC = window.SC || {};

SC.w10 = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 5, 'The Offer');
  K.hudShow(S(id), false); K.hudShow(V('P49') + .1);
  K.weather(S(id), { rain: 1, drops: 1, warm: 0, bokeh: 1 }, 1);
  const c = K.chart(h, 260, 300, 900, 380, { label: 'WEEK 10' });
  R.up(c.wrap, V('P49') - .1, .3, 20);
  c.draw(V('P49'), WT(R, 'P49', 5) - V('P49'), K.walk(-1.2, 30, .4), 2.5);
  K.mark(10, 'D', WT(R, 'P49', 5));
  const oc = K.text(h, 'OF COURSE.', 'left:1240px;top:440px;font-size:80px', 'kin red');
  R.up(oc, WT(R, 'P49', 5), .3, 16);
  const t10 = V('P50');
  tl.to([c.wrap, oc], { opacity: 0, duration: .3 }, t10 - .2);
  const ten = K.text(h, '10 FOR 10', 'top:340px;font-size:220px', 'center kin green');
  R.slam(ten, t10 - .1, 2.2, .18); cue(t10 + .08, 'impact', .9); R.flash(t10 + .08, .2, .4);
  const od = K.text(h, '1 IN 1,024', 'top:620px;font-size:130px', 'center mono amber');
  R.up(od, WT(R, 'P50', 3), .4, 20);
  K.tallyBox.forEach((b, i) => tl.to(b, { y: -8, duration: .12, yoyo: true, repeat: 1 }, t10 + .1 + i * .04));
};

SC.offer = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.hudShow(V('P52'), false);
  const ph = K.phone(h, 140, 130, .95, { date: 'Monday, May 12' });
  R.up(ph.el, S(id), .4, 30);
  const t6 = WT(R, 'P51', 6);
  ph.wake(t6 - .1); ph.notify(t6 + .3, 'Week 11', '');
  const np = K.text(h, 'NO PREDICTION.', 'left:700px;top:300px;font-size:90px', 'kin cold');
  R.up(np, WT(R, 'P51', 10), .35, 16); cue(WT(R, 'P51', 10), 'drone_hit', .6);
  tl.to(np, { opacity: 0, duration: .25 }, V('P52') - .1);
  const m = K.mail(h, 680, 180, 1100, { subj: 'Week 11' });
  m.style.minHeight = '640px';
  R.up(m, V('P52') - .1, .45, 40);
  const body = 'You’ve seen what I can do.\n52 more weeks of predictions.\nThe fee is $50,000.\nYou have until Friday.';
  m.bd.style.whiteSpace = 'pre-line';
  // type in sync with the narration: each line starts on its spoken words
  const parts = body.split('\n'), starts = [V('P53'), WT(R, 'P53', 6), WT(R, 'P53', 11), WT(R, 'P53', 16)];
  tl.set(m.bd, { textContent: '' }, 0);
  let acc = '';
  parts.forEach((p, i) => { const base = acc; for (let k = 1; k <= p.length; k++) tl.set(m.bd, { textContent: base + p.slice(0, k) }, starts[i] + k / 34); acc = base + p + '\n'; cue(starts[i], 'type', .45, 0, { dur: p.length / 34 }); });
  const fee = K.text(h, '', 'left:0;top:0'); // placeholder
  const chip = K.text(h, '⏱ 4 DAYS', 'left:1500px;top:860px;background:#ff3b4f;color:#fff;box-shadow:0 0 30px rgba(255,59,79,.6)', 'chip');
  R.pop(chip, WT(R, 'P53', 16), .3, .4); cue(WT(R, 'P53', 16), 'tick', .6);
  tl.to(chip, { scale: 1.08, duration: .2, yoyo: true, repeat: 3 }, WT(R, 'P53', 18));
  ph.dim(V('P52') + .5);
};

SC.math = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  // fee vs the Lily tab
  const bar = (x, label, v, col, t) => {
    const hh = v / 52000 * 420;
    const b = K.text(h, '', `left:${x}px;top:${760 - hh}px;width:200px;height:${hh}px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,${col},rgba(20,28,52,.6));transform-origin:50% 100%;box-shadow:0 0 30px ${col}55`);
    const n = K.text(h, K.money(v), `left:${x - 60}px;top:${760 - hh - 70}px;width:320px;text-align:center;font-size:52px`, 'mono ' + (col === '#ffb347' ? 'amber' : 'cold'));
    const l = K.text(h, label, `left:${x - 60}px;top:790px;width:320px;text-align:center;font-size:22px`, 'label');
    tl.set(b, { scaleY: 0 }, 0); tl.to(b, { scaleY: 1, duration: .5, ease: 'power3.out' }, t); R.up([n, l], t + .3, .3, 10);
    return [b, n, l];
  };
  const A = bar(300, 'THE FEE', 50000, '#ff3b4f', V('P54') - .1);
  const B = bar(620, 'THE LILY TAB', 52000, '#ff9ad5', WT(R, 'P54', 6));
  const al = K.text(h, 'ALMOST EXACTLY', 'left:250px;top:190px;font-size:56px', 'kin amber');
  R.up(al, WT(R, 'P54', 2), .3, 16); cue(WT(R, 'P54', 6), 'soft', .5);
  // the dream curve
  const s = K.svg(h, 900, 520, 'left:960px;top:260px');
  const grid = R.el('path', { d: 'M0,480 L880,480 M0,0 L0,480', stroke: 'rgba(170,190,240,.35)', 'stroke-width': 2 }, s);
  let d = 'M0,470';
  for (let i = 1; i <= 52; i++) { const v = 50000 * Math.pow(10, i / 52); d += ` L${i / 52 * 860},${470 - (v - 50000) / 450000 * 440}`; }
  const curve = R.el('path', { d, fill: 'none', stroke: '#3dff9a', 'stroke-width': 6, 'stroke-linecap': 'round', class: 'dream', style: 'filter:drop-shadow(0 0 12px #3dff9a)' }, s);
  const t0 = WT(R, 'P55', 4);
  R.up(s, t0 - .3, .3, 10);
  R.draw('.dream', t0, WT(R, 'P55', 15) - t0, 'power1.in');
  const v1 = K.text(h, '$50K', 'left:960px;top:760px;font-size:30px', 'mono cold'), v2 = K.text(h, '$500K', 'left:1700px;top:220px;font-size:44px', 'mono green');
  R.up(v1, t0, .3, 10); R.up(v2, WT(R, 'P55', 15) - .1, .3, 10); cue(WT(R, 'P55', 15) - .1, 'rise', .6, .5);
  const ifk = K.text(h, 'IF THE PREDICTIONS KEPT COMING…', 'left:980px;top:200px;font-size:22px', 'label');
  R.up(ifk, t0 - .2, .3, 10);
  const col = K.text(h, 'COLLEGE × 10', 'left:1300px;top:860px;font-size:70px', 'kin green');
  R.up(col, WT(R, 'P55', 21), .35, 16);
  for (let i = 0; i < 10; i++) { const c = K.text(h, '🎓', `left:${960 + i * 86}px;top:960px;font-size:56px`, 'emoji'); R.pop(c, WT(R, 'P55', 21) + .1 + i * .05, .2, .2); }
  cue(WT(R, 'P55', 21), 'sparkle', .5, .4, { dur: .6 });
  tl.to([...A, ...B, al], { opacity: .35, duration: .4 }, t0);
};

SC.maya = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.weather(S(id), { rain: .8, bokeh: .5, warm: 1 }, 1);
  K.text(h, '', 'left:0;top:800px;width:1920px;height:280px;background:linear-gradient(180deg,#0f0c10,#050406)');
  const lamp = K.text(h, '', 'left:660px;top:-200px;width:600px;height:900px;background:radial-gradient(ellipse at 50% 30%,rgba(255,200,130,.22),transparent 60%)');
  const pM = K.person(h, 'maya', 240, 300, 620, { rim: '#9fb7ff' });
  const pD = K.person(h, 'daniel', 1200, 300, 620, { rim: '#ffb347', flip: true });
  R.up([pM, pD], S(id), .5, 20, .1);
  const lap = K.text(h, '<div style="padding:16px;font:700 15px Space Grotesk;color:#18223a">LILY · $52,000<br><span style="color:#d93025">THE EMAILS · 10/10</span></div>', 'left:820px;top:640px;width:280px;height:170px;background:#f7f8fb;border-radius:10px;box-shadow:0 0 50px rgba(200,220,255,.5)');
  R.up(lap, V('P56') + .2, .4, 10);
  const clk = K.text(h, 'THURSDAY · 11:40 PM', 'left:780px;top:150px;width:360px;text-align:center;font-size:22px', 'label');
  R.up(clk, V('P56'), .3, 10);
  const q = K.text(h, '&ldquo;How do you know he&rsquo;s real?&rdquo;', 'top:330px;font-size:90px;font-style:italic', 'center serif cold');
  tl.set(q, { opacity: 0, filter: 'blur(10px)' }, 0); tl.to(q, { opacity: 1, filter: 'blur(0px)', duration: .6 }, WT(R, 'P57', 6) - .2);
  cue(WT(R, 'P57', 6) - .2, 'soft', .5, -.4);
  tl.to(q, { opacity: .25, y: -80, scale: .8, duration: .5 }, V('P58') - .1);
  const a = K.text(h, '&ldquo;Because he&rsquo;s never been wrong.&rdquo;', 'top:470px;font-size:84px;font-style:italic', 'center serif amber');
  tl.set(a, { opacity: 0, filter: 'blur(10px)' }, 0); tl.to(a, { opacity: 1, filter: 'blur(0px)', duration: .6 }, WT(R, 'P58', 8) - .2);
  cue(WT(R, 'P58', 8) - .2, 'soft', .5, .4);
};

SC.wire = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const ui = K.text(h, '', 'left:460px;top:200px;width:1000px;height:560px', 'glass');
  R.up(ui, S(id), .4, 30);
  K.text(ui, 'WIRE TRANSFER · FRIDAY 9:02 AM', 'left:50px;top:46px;font-size:22px', 'label');
  const amt = K.text(ui, '$50,000.00', 'left:50px;top:100px;font-size:120px', 'big cold');
  K.text(ui, 'FROM: LILY (SAVINGS)  →  TO: ACCOUNT ••••4091', 'left:54px;top:260px;font-size:26px;color:#8e9bc4;letter-spacing:2px', 'mono');
  const pb = K.text(ui, '', 'left:50px;top:340px;width:900px;height:22px;border-radius:11px;background:rgba(170,190,240,.15)');
  const fill = K.text(pb, '', 'left:0;top:0;width:900px;height:22px;border-radius:11px;background:linear-gradient(90deg,#ffb347,#ff8a3d);transform-origin:0 50%;box-shadow:0 0 20px rgba(255,179,71,.6)');
  const sent = K.text(ui, 'SENT ✓', 'left:50px;top:400px;font-size:90px', 'kin green');
  const tw = WT(R, 'P59', 4);
  tl.set(fill, { scaleX: 0 }, 0); tl.to(fill, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, tw - .4); cue(tw - .4, 'wire', .7, 0, { dur: 1.1 });
  R.slam(sent, tw + .7, 1.8, .16); cue(tw + .86, 'cash_out', .8);
  const bal = K.text(ui, 'LILY: $52,000', 'left:560px;top:430px;font-size:46px', 'mono amber');
  R.up(bal, tw + .9, .3, 10);
  R.count(bal, tw + 1.2, .9, 52000, 2000, v => 'LILY: ' + K.money(v), 'power2.in');
  // the question that mattered
  const tq = V('P60');
  tl.to(ui, { opacity: 0, scale: .92, duration: .5 }, tq - .1);
  K.weather(tq, { bokeh: .2, rain: .4 }, 1.2);
  const q1 = K.text(h, 'NOT: HOW WAS HE RIGHT?', 'top:300px;font-size:76px', 'center kin cold');
  R.up(q1, WT(R, 'P60', 8) - .1, .35, 16);
  tl.to(q1, { opacity: .25, duration: .3 }, WT(R, 'P60', 13) - .2);
  const q2 = K.text(h, 'HOW MANY PEOPLE<br>DID HE START WITH?', 'top:450px;font-size:130px;line-height:1.02', 'center kin amber');
  R.up(q2, WT(R, 'P60', 13) - .1, .45, 30); cue(WT(R, 'P60', 13) - .1, 'drone_hit', 1);
  tl.to(q2, { scale: 1.05, duration: 2, ease: 'sine.out' }, WT(R, 'P60', 13) + .3);
};
