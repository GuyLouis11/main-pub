/* CH6 10,240 (twist #1): back · split · halving · ten · survived · guess · parable · cost */
window.SC = window.SC || {};

// one persistent dots field across back → ten (outside the scene clips so it never blinks between scenes)
let DOTS = null;
const dotsLayer = (R, K) => {
  if (DOTS) return DOTS;
  const { tl, S, E } = R;
  const layer = R.div('abs', null, null, 'inset:0'); R.$('#stage').prepend(layer);
  layer.id = 'dotsLayer';
  DOTS = K.dots(layer, 160, 150, 1600, 860);
  DOTS.layer = layer;
  tl.set(layer, { opacity: 0 }, 0);
  tl.to(layer, { opacity: 1, duration: .4 }, R.V('P62') - .2);
  tl.to(layer, { opacity: 0, duration: .4 }, E('ten') - .4);
  return DOTS;
};
const counter = (R, K, h, t, v, cls = 'amber') => {
  const c = K.text(h, K.fmt(v), 'top:46px;font-size:84px', 'center mono ' + cls);
  return c;
};

SC.back = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  K.chapter(id, 6, '10,240');
  K.weather(S(id), { rain: .5, bokeh: .35 }, 1);
  // rewind: weeks fly backwards
  const wk = K.text(h, 'WEEK 10', 'top:400px;font-size:200px', 'center kin cold');
  const tr = V('P61');
  tl.set(wk, { opacity: 0 }, 0); tl.to(wk, { opacity: 1, duration: .1 }, tr);
  for (let i = 10; i >= 1; i--) tl.set(wk, { textContent: 'WEEK ' + i }, tr + (10 - i) * ((VE('P61') - tr) / 10));
  const lines = K.text(h, '', 'inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 9px)');
  tl.set(lines, { opacity: 0 }, 0); tl.to(lines, { opacity: 1, duration: .1 }, tr); tl.to(lines, { opacity: 0, duration: .2 }, VE('P61'));
  tl.fromTo(lines, { y: 0 }, { y: 180, duration: VE('P61') - tr, ease: 'none', immediateRender: false }, tr);
  cue(tr, 'rewind', .8, 0, { dur: VE('P61') - tr });
  tl.to(wk, { opacity: 0, scale: .5, duration: .2 }, VE('P61'));
  // one dot: Daniel... then everyone
  const D = dotsLayer(R, K);
  D.set(0, { week: 0, zoom: 0, hl: 1, split: 0, dim: 1 });
  const lab = K.text(h, 'DANIEL · #4,091', 'top:720px;font-size:34px', 'center mono amber');
  R.up(lab, V('P62') + .1, .3, 10);
  tl.to(lab, { opacity: 0, duration: .3 }, WT(R, 'P62', 6));
  const tz = WT(R, 'P62', 6);
  D.to(tz - .2, { zoom: 1 }, VE('P62') - tz + .6, 'power2.inOut');
  cue(tz - .2, 'zoom_out', 1, 0, { dur: VE('P62') - tz + .6 });
  const n = counter(R, K, h, 0, 10240);
  tl.set(n, { opacity: 0 }, 0);
  tl.to(n, { opacity: 1, duration: .3 }, WT(R, 'P62', 10));
  R.count(n, WT(R, 'P62', 10), VE('P62') - WT(R, 'P62', 10), 1, 10240, K.fmt, 'power3.out');
  const pl = K.text(h, 'PEOPLE', 'top:146px;font-size:22px', 'center label');
  R.up(pl, VE('P62') - .3, .3, 8);
};
SC.back.opts = { nocam: true };

SC.split = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const D = dotsLayer(R, K);
  const n = K.text(h, '10,240', 'top:46px;font-size:84px', 'center mono amber');
  D.set(S(id), { zoom: 1, week: 0, hl: .9, nextW: 1 });
  D.to(WT(R, 'P63', 0), { split: 1 }, .8, 'power2.out'); cue(WT(R, 'P63', 0), 'split', .8);
  const up = K.text(h, '5,120 WERE TOLD ▲ UP', 'left:170px;top:1000px;font-size:34px', 'mono green');
  const dn = K.text(h, '5,120 WERE TOLD ▼ DOWN', 'left:1170px;top:1000px;font-size:34px', 'mono red');
  R.up(up, WT(R, 'P63', 6), .3, 10); R.up(dn, WT(R, 'P63', 13), .3, 10);
  // Friday: one group was right
  const tf = WT(R, 'P64', 2);
  D.to(tf, { week: 1 }, 1.0, 'power1.inOut'); D.to(tf + .9, { split: 0 }, .4);
  cue(tf, 'wipe_out', .9);
  R.count(n, tf, .9, 10240, 5120, K.fmt, 'power2.out');
  const gone = K.text(h, 'NEVER HEARD FROM AGAIN', 'top:1000px;font-size:34px', 'center mono red');
  tl.to([up, dn], { opacity: 0, duration: .2 }, WT(R, 'P64', 7));
  R.up(gone, WT(R, 'P64', 9), .3, 10);
};
SC.split.opts = { nocam: true };

SC.halving = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const D = dotsLayer(R, K);
  const n = K.text(h, '5,120', 'top:46px;font-size:84px', 'center mono amber');
  const wl = K.text(h, 'AFTER WEEK 1', 'top:146px;font-size:22px', 'center label');
  // P65: half again (week 2 guess), P66: weeks 2–4 resolve, P67: weeks 5–7
  const steps = [
    [2, 2560, WT(R, 'P66', 0)], [3, 1280, WT(R, 'P66', 8)], [4, 640, WT(R, 'P66', 14)],
    [5, 320, WT(R, 'P67', 2)], [6, 160, WT(R, 'P67', 6)], [7, 80, WT(R, 'P67', 10)]];
  D.set(S(id), { week: 1, split: 0, nextW: 2 });
  D.to(WT(R, 'P65', 11), { split: 1 }, .5); cue(WT(R, 'P65', 11), 'split', .7);
  const ud = K.text(h, '▲ UP · ▼ DOWN', 'top:1000px;font-size:34px', 'center mono cold');
  R.up(ud, WT(R, 'P65', 15), .3, 10);
  tl.to(ud, { opacity: 0, duration: .2 }, steps[0][2] - .1);
  let prev = 5120;
  steps.forEach(([w, v, t], i) => {
    D.set(t - .02, { nextW: w, split: i === 0 ? 1 : .6 });
    D.to(t, { week: w }, .7, 'power1.inOut');
    if (i < steps.length - 1) D.set(t + .72, { nextW: w + 1 });
    R.count(n, t, .6, prev, v, K.fmt, 'power2.out'); prev = v;
    tl.set(wl, { textContent: 'AFTER WEEK ' + w }, t);
    cue(t, 'wipe_out', .6 + i * .05, 0, { f: 300 + i * 60 });
  });
  D.to(steps[5][2] + .8, { split: 0 }, .4);
  tl.set(n, { textContent: '5,120' }, S(id));
  const pr = K.text(h, 'THE ONES LEFT SAW A PERFECT RECORD', 'top:1000px;font-size:34px', 'center mono amber');
  R.up(pr, WT(R, 'P67', 12), .3, 10);
};
SC.halving.opts = { nocam: true };

SC.ten = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const D = dotsLayer(R, K);
  const n = K.text(h, '80', 'top:46px;font-size:84px', 'center mono amber');
  const wl = K.text(h, 'AFTER WEEK 7', 'top:146px;font-size:22px', 'center label');
  D.set(S(id), { week: 7, nextW: 8, split: 0 });
  const steps = [[8, 40, WT(R, 'P68', 0)], [9, 20, WT(R, 'P68', 3)], [10, 10, WT(R, 'P68', 6) + .5]];
  let prev = 80;
  steps.forEach(([w, v, t], i) => {
    D.to(t, { week: w }, .7, 'power1.inOut');
    R.count(n, t, .6, prev, v, K.fmt, 'power2.out'); prev = v;
    tl.set(wl, { textContent: 'AFTER WEEK ' + w }, t);
    cue(t, 'wipe_out', .7 + i * .1);
  });
  tl.set(n, { textContent: '80' }, S(id));
  // the ten survivors light up
  const tp = V('P69');
  const ring = [];
  D.surv.forEach((i, k) => {
    const [x, y] = D.screen(i);
    const r = K.text(D.layer, '', `left:${160 + x - 26}px;top:${150 + y - 26}px;width:52px;height:52px;border-radius:50%;border:4px solid #ffb347;box-shadow:0 0 24px #ffb347`);
    R.pop(r, tp + .1 + k * .12, .3, 2.5, 'power3.out'); ring.push(r);
    cue(tp + .1 + k * .12, 'ping', .4, -.8 + k * .18, { f: 900 + k * 80 });
  });
  const t10 = K.text(h, '10 PERFECT RECORDS', 'top:1000px;font-size:40px', 'center mono amber');
  R.up(t10, WT(R, 'P69', 9), .3, 10);
  tl.to(n, { scale: 1.2, duration: .2, yoyo: true, repeat: 1 }, tp);
};
SC.ten.opts = { nocam: true };

SC.survived = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  // 10,000 coins
  const cv = document.createElement('canvas'); cv.width = 1500; cv.height = 600; cv.style.cssText = 'position:absolute;left:210px;top:360px'; h.appendChild(cv);
  const cx = cv.getContext('2d');
  const hot = new Set(); for (let k = 0; k < 10; k++) hot.add(Math.floor((k * 997 + 431) % 10000));
  const st = { lit: 0, flip: 0 };
  const draw = () => {
    cx.clearRect(0, 0, 1500, 600);
    for (let i = 0; i < 10000; i++) {
      const x = (i % 200) * 7.5 + 3.75, y = Math.floor(i / 200) * 12 + 6, isHot = hot.has(i);
      const ph = Math.sin(i * 12.9898 + st.flip * 9) > 0;
      cx.fillStyle = isHot && st.lit > 0 ? `rgba(255,179,71,${.4 + .6 * st.lit})` : (ph ? 'rgba(200,210,240,.45)' : 'rgba(120,130,170,.25)');
      cx.beginPath(); cx.arc(x, y, isHot && st.lit > 0 ? 3.6 : 2.6, 0, 6.2832); cx.fill();
    }
  };
  draw();
  tl.set(cv, { opacity: 0 }, 0); tl.to(cv, { opacity: 1, duration: .4 }, WT(R, 'P70', 15) - .4);
  tl.to(st, { flip: 1, duration: 1.4, ease: 'none', onUpdate: draw }, WT(R, 'P70', 15) - .4);
  tl.to(st, { lit: 1, duration: .4, onUpdate: draw }, WT(R, 'P70', 9));
  const t1 = K.text(h, 'HE WASN&#8217;T CHOSEN.', 'top:150px;font-size:100px', 'center kin cold');
  const t2 = K.text(h, 'HE SURVIVED.', 'top:260px;font-size:100px', 'center kin amber');
  R.up(t1, V('P70'), .35, 20); R.up(t2, WT(R, 'P70', 3) - .05, .35, 20); cue(WT(R, 'P70', 3), 'hit', .7);
  const hh = K.text(h, 'H H H H H H H H H H', 'top:980px;font-size:40px;letter-spacing:6px', 'center mono amber');
  R.up(hh, WT(R, 'P70', 9), .3, 10);
  const cf = K.text(h, '10,000 COINS FLIPPED', 'left:210px;top:320px;font-size:22px', 'label');
  R.up(cf, WT(R, 'P70', 15), .3, 8); cue(WT(R, 'P70', 15) - .4, 'coins', .7, 0, { dur: 1.4 });
};

SC.guess = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  // the decision tree: every branch is a guess; Daniel's path is just the one that kept landing
  const s = K.svg(h, 1800, 860, 'left:60px;top:140px');
  const depth = 6, path = K.TRUTH;
  let node = 0;
  const nodes = [];
  for (let d = 0; d <= depth; d++) {
    const n = Math.pow(2, d);
    for (let i = 0; i < n; i++) nodes.push({ d, i, x: 900 + (i - (n - 1) / 2) * (1700 / Math.max(1, n)) * (d === 0 ? 0 : 1), y: 40 + d * 120 });
  }
  const at = (d, i) => nodes.find(n => n.d === d && n.i === i);
  let di = 0;
  const onPath = new Set(['0,0']);
  for (let d = 1; d <= depth; d++) { di = di * 2 + (path[d - 1] === 'U' ? 0 : 1); onPath.add(d + ',' + di); }
  const t0 = V('P71') + .1, span = VE('P71') - t0 - .3;
  for (let d = 1; d <= depth; d++) {
    const n = Math.pow(2, d);
    for (let i = 0; i < n; i++) {
      const a = at(d - 1, i >> 1), b = at(d, i), hot = onPath.has(d + ',' + i) && onPath.has((d - 1) + ',' + (i >> 1));
      const ln = R.el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: hot ? '#ffb347' : ((i % 2) ? 'rgba(255,90,110,.45)' : 'rgba(61,255,154,.45)'), 'stroke-width': hot ? 7 : 2.5, style: hot ? 'filter:drop-shadow(0 0 8px #ffb347)' : '' }, s);
      const t = t0 + span * (d - 1) / depth;
      tl.set(ln, { opacity: 0 }, 0); tl.to(ln, { opacity: 1, duration: .3 }, t + (hot ? .2 : 0));
    }
    cue(t0 + span * (d - 1) / depth, 'branch', .4, 0, { f: 500 + d * 90 });
  }
  nodes.forEach(nd => {
    const hot = onPath.has(nd.d + ',' + nd.i);
    const c = R.el('circle', { cx: nd.x, cy: nd.y, r: hot ? 12 : Math.max(3, 8 - nd.d), fill: hot ? '#ffb347' : '#c9d2ff' }, s);
    tl.set(c, { opacity: 0 }, 0); tl.to(c, { opacity: hot ? 1 : .7, duration: .2 }, t0 + span * Math.max(0, nd.d - 1) / depth + .15);
  });
  const lb = K.text(h, 'EVERY PREDICTION WAS A GUESS', 'top:60px;font-size:58px', 'center kin cold');
  R.up(lb, WT(R, 'P71', 12), .35, 16);
  const dl = K.text(h, 'DANIEL&#8217;S PATH', 'left:1500px;top:900px;font-size:24px;color:#ffb347', 'label');
  R.up(dl, t0 + span * .8, .3, 10);
};

SC.parable = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const card = K.text(h, '', 'left:180px;top:200px;width:760px;height:620px', 'glass');
  R.up(card, V('P72') + .2, .4, 30);
  K.text(card, 'THE PARABLE OF THE', 'left:60px;top:70px;font-size:24px', 'label');
  K.text(card, 'Baltimore<br>Stockbroker', 'left:56px;top:110px;font-size:108px;line-height:1;font-style:italic;white-space:nowrap', 'serif cold');
  K.text(card, 'Jordan Ellenberg · <i>How Not to Be Wrong</i> (2014)', 'left:60px;top:370px;font:500 26px/1.3 Space Grotesk;color:#a9b4d6;white-space:nowrap');
  const a = K.text(card, '10,240 LETTERS → 10 PERFECT RECORDS', 'left:60px;top:470px;font-size:30px', 'mono amber');
  R.up(a, WT(R, 'P72', 25), .3, 10); cue(WT(R, 'P72', 8), 'paper', .5);
  // TV special
  const tv = K.text(h, '', 'left:1040px;top:200px;width:700px;height:520px;border-radius:40px;background:linear-gradient(145deg,#2b2a33,#141319);box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 0 0 10px #0b0b10');
  const scr = K.text(tv, '', 'left:40px;top:40px;width:620px;height:440px;border-radius:26px;background:radial-gradient(ellipse,#1e2b44,#070b14);overflow:hidden');
  R.up(tv, V('P73') - .1, .4, 30); cue(V('P73'), 'tv_on', .6);
  K.text(scr, '2008 · BRITISH TV', 'left:30px;top:26px;font-size:20px', 'label');
  K.text(scr, 'Derren Brown: <i>The System</i>', 'left:30px;top:60px;font:600 30px Space Grotesk;color:#e8eefc;white-space:nowrap');
  const tiers = [7776, 1296, 216, 36, 6, 1];
  tiers.forEach((v, i) => {
    const t = WT(R, 'P73', 15) + i * .35;
    const row = K.text(scr, `<span class="emoji" style="font-size:30px">🐎</span>&nbsp;&nbsp;${K.fmt(v)}`, `left:${40 + i * 18}px;top:${120 + i * 50}px;font-size:${34 - i * 2}px;color:${i === 5 ? '#ffb347' : '#cfd8f5'}`, 'mono');
    R.up(row, t, .25, 10); cue(t, 'tick', .35, .5, { f: 800 + i * 120 });
  });
  const one = K.text(h, 'ONE WOMAN LEFT', 'left:1080px;top:760px;font-size:56px', 'kin amber');
  R.up(one, WT(R, 'P73', 26), .35, 16);
};

SC.cost = (R, K, h, id) => {
  const { tl, cue, S, V, VE } = R;
  const led = K.text(h, '', 'left:240px;top:200px;width:820px;height:600px', 'glass');
  R.up(led, V('P74'), .4, 30);
  K.text(led, 'THE PROPHET&#8217;S LEDGER', 'left:50px;top:50px;font-size:24px', 'label');
  const r1 = K.text(led, 'COST · 10,240 EMAILS', 'left:50px;top:130px;font:600 34px Space Grotesk;color:#cfd8f5;white-space:nowrap');
  const v1 = K.text(led, '$0', 'left:600px;top:122px;font-size:52px', 'mono green');
  R.up([r1, v1], WT(R, 'P74', 7), .3, 10, .1);
  const r2 = K.text(led, 'REVENUE', 'left:50px;top:330px;font:600 34px Space Grotesk;color:#cfd8f5');
  const v2 = K.text(led, '$0', 'left:50px;top:390px;font-size:110px', 'big amber');
  R.up([r2, v2], V('P75'), .3, 10);
  R.count(v2, WT(R, 'P75', 5), 1.4, 0, 350000, K.money, 'power2.out'); cue(WT(R, 'P75', 5), 'counter', .5, 0, { dur: 1.4 });
  const sub = K.text(led, '7 × $50,000 · FOR TEN WEEKS OF COIN FLIPS', 'left:50px;top:530px;font-size:24px;color:#a9b4d6', 'mono');
  R.up(sub, WT(R, 'P75', 12), .3, 10);
  // seven of ten
  for (let k = 0; k < 10; k++) {
    const p = K.person(h, 'daniel', 1140 + (k % 5) * 130, 250 + Math.floor(k / 5) * 270, 220, { rim: k < 7 ? '#ffb347' : '#3a4566', glow: k < 7 ? 12 : 0 });
    R.up(p, V('P75') + k * .07, .25, 10);
    if (k < 7) tl.to(p, { y: -10, duration: .15, yoyo: true, repeat: 1 }, WT(R, 'P75', 3) + k * .06);
  }
  const sv = K.text(h, '7 OF 10 PAID', 'left:1140px;top:840px;font-size:70px', 'kin amber');
  R.up(sv, WT(R, 'P75', 3), .35, 16); cue(WT(R, 'P75', 3), 'cash', .7);
};
