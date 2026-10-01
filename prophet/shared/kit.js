/* THE PROPHET — component kit (1920×1080). Every component is built from DOM/SVG/canvas and animated on R.tl.
   Decoration that never counts as a story beat is marked data-drift. */
window.KIT = function (R) {
  const { tl, rnd, $, $$, el, div, cue, S, E, D, V, VE, W, TOTAL } = R;
  const K = {};
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (host, w, h, css = '') => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.setAttribute('width', w); s.setAttribute('height', h); s.style.cssText = 'position:absolute;overflow:visible;' + css; host && host.appendChild(s); return s; };
  K.svg = svg;
  K.fmt = v => Math.round(v).toLocaleString('en-US');
  K.money = v => '$' + Math.round(v).toLocaleString('en-US');

  /* ---------- world: city bokeh behind rain-streaked glass ---------- */
  K.P = { rain: 1, bokeh: 1, warm: 0, drops: 1 };   // tweened by scenes (data:'drift')
  K.world = () => {
    const cv = $('#world'), cx = cv.getContext('2d');
    const lights = [], streaks = [], drops = [];
    for (let i = 0; i < 70; i++) lights.push({ x: rnd() * 1920, y: 300 + rnd() * 700, r: 18 + rnd() * 70, a: .05 + rnd() * .16, warm: rnd() < .55, sp: (rnd() - .5) * 6, ph: rnd() * 6 });
    for (let i = 0; i < 260; i++) streaks.push({ x: rnd() * 2200 - 140, ph: rnd(), v: .55 + rnd() * .6, len: 30 + rnd() * 70, a: .05 + rnd() * .12 });
    for (let i = 0; i < 160; i++) drops.push({ x: rnd() * 1920, y: rnd() * 1080, r: 1.5 + rnd() * 4.5, t0: rnd() * TOTAL, v: 20 + rnd() * 90, dl: 1.5 + rnd() * 5 });
    const draw = t => {
      const P = K.P;
      cx.clearRect(0, 0, 1920, 1080);
      cx.globalCompositeOperation = 'lighter';
      for (const L of lights) {
        const x = (L.x + L.sp * t) % 2000 - 40, y = L.y + Math.sin(t * .3 + L.ph) * 6;
        const g = cx.createRadialGradient(x, y, 0, x, y, L.r);
        const c = L.warm ? (P.warm > .5 ? '255,190,120' : '255,170,90') : '110,150,255';
        g.addColorStop(0, `rgba(${c},${(L.a * P.bokeh).toFixed(3)})`); g.addColorStop(1, `rgba(${c},0)`);
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, L.r, 0, 6.2832); cx.fill();
      }
      cx.globalCompositeOperation = 'source-over';
      if (P.rain > .01) {
        cx.lineWidth = 1.4;
        for (const s of streaks) {
          const y = ((s.ph + t * s.v) % 1) * 1300 - 120, x = s.x - y * .18;
          cx.strokeStyle = `rgba(190,210,255,${(s.a * P.rain).toFixed(3)})`;
          cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - s.len * .18, y + s.len); cx.stroke();
        }
      }
      if (P.drops > .01) for (const d of drops) {
        const k = Math.max(0, t - d.t0) % (d.dl + 4), y = d.y + (k > d.dl ? (k - d.dl) * d.v : 0);
        cx.fillStyle = `rgba(200,220,255,${(.14 * P.drops).toFixed(3)})`;
        cx.beginPath(); cx.arc(d.x, y % 1100, d.r, 0, 6.2832); cx.fill();
        cx.fillStyle = `rgba(255,255,255,${(.18 * P.drops).toFixed(3)})`;
        cx.beginPath(); cx.arc(d.x - d.r * .35, (y % 1100) - d.r * .35, d.r * .35, 0, 6.2832); cx.fill();
      }
    };
    const pr = { t: 0 };
    tl.fromTo(pr, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(pr.t) }, 0);
    for (let t = 0; t < TOTAL; t += 1 / 12) tl.set('#grain', { x: Math.round((rnd() - .5) * 120), y: Math.round((rnd() - .5) * 120) }, t);
  };
  K.weather = (t, v, d = 1) => tl.to(K.P, { ...v, duration: d, ease: 'sine.inOut', data: 'drift' }, t);

  /* ---------- camera drift for a scene ---------- */
  K.cam = (id, from = 1.0, to = 1.045, x = 0, y = 0) => {
    const c = $(`[data-scene="${id}"] .cam`);
    c.dataset.drift = '1';
    tl.fromTo(c, { scale: from, x: 0, y: 0 }, { scale: to, x, y, duration: D(id) + .3, ease: 'sine.inOut', immediateRender: false, data: 'drift' }, S(id));
    return c;
  };
  K.host = id => $(`[data-scene="${id}"] .cam`);
  K.fade = (id, din = .35, dout = .35) => {
    const s = `[data-scene="${id}"]`;
    tl.set(s, { opacity: 0 }, 0);
    tl.to(s, { opacity: 1, duration: din, ease: 'power1.out' }, S(id));
    if (dout) tl.to(s, { opacity: 0, duration: dout, ease: 'power1.in' }, E(id) - dout);
  };

  /* ---------- typography ---------- */
  K.text = (host, html, css, cls = '') => div('abs ' + cls, host, html, css);
  K.type = (elm, text, t, cps = 28, snd = true) => {
    const n = text.length;
    tl.set(elm, { textContent: '' }, 0);
    for (let i = 1; i <= n; i++) tl.set(elm, { textContent: text.slice(0, i) }, t + i / cps);
    if (snd) cue(t, 'type', .5, 0, { dur: n / cps });
    return t + n / cps;
  };
  K.words = (elm, t, d = .08) => {          // reveal an element's words one by one
    const ws = elm.textContent.split(' '); elm.textContent = '';
    ws.forEach((w, i) => { const s = div('', elm, w + (i < ws.length - 1 ? '&nbsp;' : '')); s.style.display = 'inline-block'; tl.set(s, { opacity: 0, y: 24 }, 0); tl.to(s, { opacity: 1, y: 0, duration: .3, ease: 'power3.out' }, t + i * d); });
  };
  K.slam = (elm, t, from = 1.8, snd = 'hit', g = .8) => { R.slam(elm, t, from, .2); if (snd) cue(t + .2, snd, g); };

  /* ---------- chapter card ---------- */
  K.chapter = (id, num, title) => {
    const host = $(`[data-scene="${id}"]`);
    const c = div('chap', host, `<div class="n">CHAPTER ${num}</div><div class="t">${title}</div><div class="r"></div>`);
    c.style.zIndex = 40;
    const t = S(id) + .15, out = V(R.tim.scenes.find(s => s.id === id).vo[0]) - .25;
    tl.set(c, { opacity: 0 }, 0);
    tl.set(c.querySelector('.t'), { opacity: 0, y: 30, filter: 'blur(14px)' }, 0);
    tl.to(c, { opacity: 1, duration: .2 }, t);
    tl.to(c.querySelector('.n'), { letterSpacing: '20px', duration: 1.4, ease: 'power2.out' }, t);
    tl.to(c.querySelector('.t'), { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7, ease: 'power3.out' }, t + .1);
    tl.to(c.querySelector('.r'), { width: 520, duration: .8, ease: 'power3.out' }, t + .3);
    tl.to(c, { opacity: 0, duration: .35 }, out);
    cue(t, 'chapter', 1);
    return c;
  };

  /* ---------- phone ---------- */
  K.phone = (host, x, y, s = 1, o = {}) => {
    const p = div('phone', host, `<div class="glow"></div><div class="scr"><div class="isl"></div><div class="date">${o.date || 'Monday, March 3'}</div><div class="clock">${o.time || '6:00'}</div>
      <div class="notif"><div class="app"><b></b>Mail · now</div><div class="sub"></div><div class="pre"></div></div>
      <div class="mail"><div class="from">From: <span class="fr">the.prophet@mail.example</span><br>To: <span class="to">daniel.hale@mail.example</span></div><div class="subj"></div><div class="hr"></div><div class="body"></div></div></div>`,
      `left:${x}px;top:${y}px;transform:scale(${s});transform-origin:50% 50%`);
    const q = c => p.querySelector(c);
    const P = { el: p, scr: q('.scr'), notif: q('.notif'), sub: q('.notif .sub'), pre: q('.notif .pre'), mail: q('.mail'), subj: q('.mail .subj'), body: q('.mail .body'), glow: q('.glow'), clock: q('.clock') };
    tl.set(P.scr, { filter: 'brightness(.12)' }, 0);
    tl.set(P.notif, { opacity: 0, y: -50 }, 0);
    tl.set(P.mail, { yPercent: 100 }, 0);
    P.wake = (t, snd = true) => {
      tl.to(P.scr, { filter: 'brightness(1)', duration: .25 }, t);
      tl.to(P.glow, { opacity: 1, duration: .15 }, t).to(P.glow, { opacity: .45, duration: .8 }, t + .2);
      if (snd) cue(t, 'buzz', .8);
      for (let i = 0; i < 8; i++) tl.to(p, { x: (i % 2 ? 6 : -6), duration: .04 }, t + i * .045);
      tl.to(p, { x: 0, duration: .05 }, t + .36);
    };
    P.notify = (t, sub, pre, snd = true) => {
      tl.set(P.sub, { textContent: sub }, t); tl.set(P.pre, { textContent: pre }, t);
      tl.to(P.notif, { opacity: 1, y: 0, duration: .4, ease: 'back.out(1.6)' }, t);
      if (snd) cue(t, 'notif', .8);
    };
    P.open = (t, subj, body) => {
      tl.set(P.subj, { textContent: subj }, t); tl.set(P.body, { textContent: '' }, 0);
      tl.to(P.mail, { yPercent: 0, duration: .45, ease: 'power3.out' }, t);
      cue(t, 'swipe', .5);
      return K.type(P.body, body, t + .4, 30, false);
    };
    P.close = t => tl.to(P.mail, { yPercent: 100, duration: .35, ease: 'power2.in' }, t);
    P.dim = t => { tl.to(P.scr, { filter: 'brightness(.12)', duration: .5 }, t); tl.to(P.glow, { opacity: 0, duration: .5 }, t); };
    return P;
  };

  /* ---------- big email card (desktop style) ---------- */
  K.mail = (host, x, y, w, o) => {
    const m = div('mailcard', host, `<div class="bar"><i></i><i></i><i></i></div><div class="hd">From: <b>${o.from || 'the.prophet@mail.example'}</b><br>To: ${o.to || 'daniel.hale@mail.example'} · ${o.when || 'Monday 6:00 AM'}</div><div class="sj">${o.subj || ''}</div><div class="bd"></div>`,
      `left:${x}px;top:${y}px;width:${w}px`);
    m.bd = m.querySelector('.bd'); m.sj = m.querySelector('.sj');
    return m;
  };

  /* ---------- weekly market chart ---------- */
  // pts: values (percent change from Monday open) sampled across the week; draws Mon→Fri
  K.chart = (host, x, y, w, h, o = {}) => {
    const wrap = div('abs', host, null, `left:${x}px;top:${y}px;width:${w}px;height:${h}px`);
    const s = svg(wrap, w, h);
    const g = el('g', {}, s);
    for (let i = 0; i <= 4; i++) { const yy = h * i / 4; el('line', { x1: 0, y1: yy, x2: w, y2: yy, stroke: 'rgba(170,190,240,.12)', 'stroke-width': 1.5 }, g); }
    (o.days || ['MON', 'TUE', 'WED', 'THU', 'FRI']).forEach((d, i) => { const t = el('text', { x: (w - 40) * i / 4 + 20, y: h + 38, fill: '#6f7ba0', 'font-family': 'JetBrains Mono', 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle' }, g); t.textContent = d; });
    el('line', { x1: 0, y1: h / 2, x2: w, y2: h / 2, stroke: 'rgba(200,210,240,.35)', 'stroke-width': 2, 'stroke-dasharray': '8 10' }, g);
    const lab = div('mono abs', wrap, o.label || 'THE MARKET', `left:0;top:-48px;font-size:22px;color:#8390b5;letter-spacing:4px`);
    const val = div('mono abs', wrap, '0.00%', `right:0;top:-58px;font-size:44px;color:#cfd8f5`);
    const C = { wrap, s, val, lab, path: null };
    C.draw = (t, d, pts, range = 3) => {
      const n = pts.length, X = i => i / (n - 1) * w, Y = v => h / 2 - v / range * (h / 2);
      let dstr = `M${X(0)},${Y(pts[0])}`;
      for (let i = 1; i < n; i++) { const x0 = X(i - 1), x1 = X(i); dstr += ` C${x0 + (x1 - x0) / 2},${Y(pts[i - 1])} ${x0 + (x1 - x0) / 2},${Y(pts[i])} ${x1},${Y(pts[i])}`; }
      const up = pts[n - 1] >= 0, col = up ? '#3dff9a' : '#ff3b4f';
      const fillp = el('path', { d: dstr + ` L${w},${h / 2} L0,${h / 2} Z`, fill: up ? 'rgba(61,255,154,.10)' : 'rgba(255,59,79,.10)' }, s);
      const p = el('path', { d: dstr, fill: 'none', stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round', style: `filter:drop-shadow(0 0 10px ${col})` }, s);
      const dot = el('circle', { r: 10, fill: col, style: `filter:drop-shadow(0 0 12px ${col})` }, s);
      p.setAttribute('pathLength', 1); p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('stroke-dashoffset', 1);
      tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, t);
      tl.set(fillp, { opacity: 0 }, 0); tl.to(fillp, { opacity: 1, duration: .4 }, t + d);
      const pr = { k: 0 };
      tl.set(dot, { opacity: 0 }, 0); tl.set(dot, { opacity: 1 }, t);
      tl.to(pr, { k: 1, duration: d, ease: 'none', onUpdate: () => {
        p.setAttribute('stroke-dashoffset', 1 - pr.k);
        const L = p.getTotalLength(), pt = p.getPointAtLength(L * pr.k); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        const i = Math.min(n - 1, pr.k * (n - 1)), a = Math.floor(i), b = Math.min(n - 1, a + 1), v = pts[a] + (pts[b] - pts[a]) * (i - a);
        val.textContent = (v >= 0 ? '+' : '') + v.toFixed(2) + '%'; val.style.color = v >= 0 ? '#3dff9a' : '#ff3b4f';
        const cc = v >= 0 ? '#3dff9a' : '#ff3b4f'; p.setAttribute('stroke', cc); dot.setAttribute('fill', cc); p.style.filter = dot.style.filter = `drop-shadow(0 0 10px ${cc})`;
      } }, t);
      cue(t, 'tick_run', .35, 0, { dur: d });
      return { p, dot, fillp };
    };
    return C;
  };
  // a plausible intraweek path ending at `end` (%), deterministic
  K.walk = (end, n = 40, vol = .5, shape = null) => {
    const pts = [0]; let v = 0;
    for (let i = 1; i < n; i++) { v += (rnd() - .5) * vol; pts.push(v); }
    const drift = (end - pts[n - 1]);
    return pts.map((p, i) => (shape ? shape(i / (n - 1)) : p + drift * i / (n - 1)));
  };

  /* ---------- HUD: weekly tally + streak odds ---------- */
  K.hud = () => {
    const ta = $('#tally');
    const boxes = [];
    for (let i = 1; i <= 10; i++) { const b = div('tb', ta, `W${i}<div class="ar"></div>`); boxes.push(b); }
    const odds = $('#odds');
    tl.set('#hud', { opacity: 0 }, 0);
    K.tallyBox = boxes;
    K.mark = (w, dir, t, snd = true) => {
      const b = boxes[w - 1], ar = b.querySelector('.ar');
      tl.set(ar, { textContent: dir === 'U' ? '▲' : '▼', color: dir === 'U' ? '#3dff9a' : '#ff3b4f' }, t);
      const ok = div('ok', b, '✓'); tl.set(ok, { opacity: 0, scale: 2.5 }, 0); tl.to(ok, { opacity: 1, scale: 1, duration: .18, ease: 'power4.in' }, t + .15);
      tl.to(b, { borderColor: 'rgba(61,255,154,.8)', boxShadow: '0 0 16px rgba(61,255,154,.45)', duration: .2 }, t + .15);
      tl.set(odds.querySelector('.v'), { textContent: '1 IN ' + K.fmt(Math.pow(2, w)) }, t + .15);
      tl.fromTo(odds.querySelector('.v'), { scale: 1.3 }, { scale: 1, duration: .3, immediateRender: false, transformOrigin: '0% 50%' }, t + .15);
      if (snd) cue(t + .15, 'check', .7, .7);
    };
    K.hudShow = (t, on = true) => tl.to('#hud', { opacity: on ? 1 : 0, duration: .35 }, t);
  };

  /* ---------- silhouettes (rim-lit busts) ---------- */
  const BODY = 'M200,64 C256,64 288,108 288,164 C288,220 260,258 226,270 L229,302 C302,317 362,352 382,422 L394,980 L6,980 L18,422 C38,352 98,317 171,302 L174,270 C140,258 112,220 112,164 C112,108 144,64 200,64 Z';
  const HAIR = {
    daniel: 'M110,170 C100,96 148,50 202,52 C258,54 300,96 290,172 C280,128 250,110 200,110 C152,110 122,126 110,170 Z',
    maya: 'M200,40 C228,40 248,58 248,82 C248,100 238,110 226,116 C266,124 296,150 296,196 C296,150 262,118 200,118 C142,118 104,150 104,196 C104,150 134,124 174,116 C162,110 152,100 152,82 C152,58 172,40 200,40 Z',
    lily: 'M110,176 C102,96 148,52 204,54 C262,56 302,100 292,176 C318,196 330,250 318,330 C306,280 296,240 286,214 C278,140 252,112 200,112 C150,112 124,138 116,190 Z',
    marcus: 'M108,150 C110,96 150,60 204,60 C258,60 296,96 296,150 L330,156 C334,166 320,172 296,170 L106,170 C98,166 100,154 108,150 Z',
    sender: 'M200,24 C292,24 336,98 336,190 C336,262 312,312 290,330 L110,330 C88,312 64,262 64,190 C64,98 108,24 200,24 Z',
  };
  K.person = (host, kind, x, y, h, o = {}) => {
    const rim = o.rim || '#ffb347', s = svg(host, 400, 520, `left:${x}px;top:${y}px;width:${h * 400 / 520}px;height:${h}px;filter:drop-shadow(0 0 ${o.glow || 14}px ${rim}66)`);
    s.setAttribute('width', h * 400 / 520); s.setAttribute('height', h);
    if (o.flip) s.style.transform = 'scaleX(-1)';
    const fill = o.fill || '#060912';
    if (HAIR[kind] && kind !== 'sender') el('path', { d: HAIR[kind], fill, stroke: rim, 'stroke-width': 4, 'stroke-opacity': .9 }, s);
    if (kind === 'sender') {
      el('path', { d: HAIR.sender, fill, stroke: rim, 'stroke-width': 4 }, s);
      el('path', { d: 'M6,980 L18,430 C40,350 110,320 150,316 L250,316 C290,320 360,350 382,430 L394,980 Z', fill, stroke: rim, 'stroke-width': 4 }, s);
      el('path', { d: 'M130,180 C130,120 160,90 200,90 C240,90 270,120 270,180 C270,250 240,290 200,290 C160,290 130,250 130,180 Z', fill: '#000', stroke: 'none' }, s);
    } else el('path', { d: BODY, fill, stroke: rim, 'stroke-width': 4 }, s);
    if (kind === 'daniel' && !o.back) { el('rect', { x: 140, y: 152, width: 50, height: 34, rx: 10, fill: 'none', stroke: rim, 'stroke-width': 3, 'stroke-opacity': .7 }, s); el('rect', { x: 210, y: 152, width: 50, height: 34, rx: 10, fill: 'none', stroke: rim, 'stroke-width': 3, 'stroke-opacity': .7 }, s); el('path', { d: 'M190,166 L210,166', stroke: rim, 'stroke-width': 3, 'stroke-opacity': .7 }, s); }
    if (kind === 'maya') el('path', { d: 'M170,300 L200,350 L230,300', fill: 'none', stroke: rim, 'stroke-width': 3, 'stroke-opacity': .6 }, s);
    return s;
  };

  /* ---------- spreadsheet ---------- */
  K.sheet = (host, x, y, w, tabs, on, cols, rows) => {
    const sh = div('sheet', host, null, `left:${x}px;top:${y}px;width:${w}px`);
    const tb = div('tabs', sh); tabs.forEach((t, i) => div('tab' + (i === on ? ' on' : ''), tb, t));
    const head = div('row h', sh); cols.forEach(c => div('', head, c[0], `width:${c[1]}px`));
    const R_ = rows.map(r => { const row = div('row', sh); r.forEach((v, i) => div('', row, v, `width:${cols[i][1]}px`)); return row; });
    sh.rows = R_; sh.tabs = tb.children;
    return sh;
  };

  /* ---------- the 10,240 engine ---------- */
  // 128×80 dots. Dot i's ten weekly guesses are bits of p(i) = (i % 1024) XOR MASK; Daniel (#4,091, i = 4090) gets the story's
  // sequence, so each week exactly half of the remaining people get the losing guess.
  K.TRUTH = 'DUDUDUDUUD';
  const tbits = [...K.TRUTH].map(c => c === 'U' ? 1 : 0);
  const TRUE_P = tbits.reduce((a, b) => a * 2 + b, 0);
  const MASK = (4090 % 1024) ^ TRUE_P;
  K.alive = (i, w) => { const p = (i % 1024) ^ MASK; for (let k = 0; k < w; k++) if (((p >> (9 - k)) & 1) !== tbits[k]) return false; return true; };
  K.outAt = i => { const p = (i % 1024) ^ MASK; for (let k = 0; k < 10; k++) if (((p >> (9 - k)) & 1) !== tbits[k]) return k + 1; return 99; };
  K.dots = (host, x, y, cw, ch) => {
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; cv.style.cssText = `position:absolute;left:${x}px;top:${y}px`; host.appendChild(cv);
    const cx = cv.getContext('2d'), COLS = 128, ROWS = 80, SP = 12;
    // seat people at random (seeded); Daniel (person 4090) keeps seat 4090 so the camera can start on him
    const perm = new Int32Array(10240); for (let i = 0; i < 10240; i++) perm[i] = i;
    let sd = 4091; const r2 = () => { sd = (sd * 48271) % 2147483647; return sd / 2147483647; };
    for (let i = 10239; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    const q = perm.indexOf(4090); perm[q] = perm[4090]; perm[4090] = 4090;
    const out = new Int8Array(10240); for (let i = 0; i < 10240; i++) out[i] = K.outAt(perm[i]);
    const surv = []; for (let i = 0; i < 10240; i++) if (out[i] === 99) surv.push(i);
    const DX = (4090 % COLS) * SP, DY = Math.floor(4090 / COLS) * SP;
    // st: { week (float, resolved weeks), zoom 0..1 (0 = Daniel close-up, 1 = whole grid), hl (highlight Daniel), split (0..1 colour by guess of next week) }
    const st = { week: 0, zoom: 0, hl: 1, split: 0, nextW: 1, dim: 1 };
    const draw = () => {
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cw, ch);
      const fullScale = Math.min(cw / (COLS * SP), ch / (ROWS * SP)) * .96;
      const zs = 9 * Math.pow(fullScale / 9, st.zoom);       // exponential zoom
      const ox = cw / 2 - (DX + (COLS * SP / 2 - DX) * st.zoom) * zs, oy = ch / 2 - (DY + (ROWS * SP / 2 - DY) * st.zoom) * zs;
      cx.setTransform(zs, 0, 0, zs, ox, oy);
      const wk = Math.floor(st.week), fr = st.week - wk;
      for (let i = 0; i < 10240; i++) {
        const gx = (i % COLS) * SP, gy = Math.floor(i / COLS) * SP, o = out[i];
        let col, a = 1;
        if (o <= wk) { col = '255,59,79'; a = .07; }                      // eliminated earlier
        else if (o === wk + 1 && fr > 0) { col = '255,59,79'; a = 1 - .93 * Math.min(1, fr * 1.6); }   // eliminating now
        else if (st.split > 0 && o >= st.nextW) {                          // colour the coming guess
          const p = (perm[i] % 1024) ^ MASK, up = ((p >> (9 - (st.nextW - 1))) & 1) === 1;
          col = up ? '61,255,154' : '255,120,140'; a = .35 + .65 * st.split;
        } else col = '232,238,252';
        cx.fillStyle = `rgba(${col},${(a * st.dim).toFixed(3)})`;
        cx.fillRect(gx + 2, gy + 2, 8, 8);
      }
      if (st.hl > 0) {
        cx.strokeStyle = `rgba(255,179,71,${st.hl})`; cx.lineWidth = 2.5 / Math.max(.25, zs / 9) ;
        cx.strokeRect(DX - 2, DY - 2, 16, 16);
        cx.fillStyle = `rgba(255,179,71,${st.hl})`; cx.fillRect(DX + 2, DY + 2, 8, 8);
      }
    };
    draw();
    const D_ = { cv, st, draw, DX, DY, SP, surv };
    D_.screen = i => { const fs = Math.min(cw / (COLS * SP), ch / (ROWS * SP)) * .96; return [cw / 2 - COLS * SP / 2 * fs + ((i % COLS) * SP + 6) * fs, ch / 2 - ROWS * SP / 2 * fs + (Math.floor(i / COLS) * SP + 6) * fs]; };
    D_.to = (t, v, d = 1, ease = 'power2.inOut') => tl.to(st, { ...v, duration: d, ease, onUpdate: draw }, t);
    D_.set = (t, v) => tl.to(st, { ...v, duration: .001, onUpdate: draw }, t);
    return D_;
  };

  return K;
};
