/* Casino Noir component kit, built on the FILM runtime (film.js). Call after FILM_INIT():  const N = NOIR(FILM);
   Every animation goes on FILM.tl, so it is deterministic and seekable. */
window.NOIR = function (F) {
  const { tl, rnd, $, $$, el, div } = F;
  const NS = 'http://www.w3.org/2000/svg';
  const R2D = 180 / Math.PI;
  // American wheel order (38 pockets, 0 and 00): 5.26% house edge
  const ORDER = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, '00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2];
  const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  let uid = 0;
  const defs = (svg) => svg.querySelector('defs') || el('defs', {}, svg);

  const N = {
    ORDER,
    /* ───── roulette wheel (SVG) ─────
       wheel(svg, cx, cy, R) → { g, rotor, ball, state, run(t0,dur,o), idle(t0,dur,degPerSec), octant(i, t, d) } */
    wheel(svg, cx, cy, R, opt = {}) {
      const id = 'wh' + (++uid), d = defs(svg);
      d.innerHTML += `
        <radialGradient id="${id}wood" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#8a4a22"/><stop offset=".6" stop-color="#5a2c12"/><stop offset="1" stop-color="#2b1407"/></radialGradient>
        <radialGradient id="${id}cone" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#b8703a"/><stop offset=".7" stop-color="#6e3816"/><stop offset="1" stop-color="#3a1b09"/></radialGradient>
        <radialGradient id="${id}brass" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff0b8"/><stop offset=".45" stop-color="#e0b04a"/><stop offset="1" stop-color="#7a5314"/></radialGradient>
        <radialGradient id="${id}ball" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e9e4da"/><stop offset="1" stop-color="#9b958a"/></radialGradient>
        <linearGradient id="${id}track" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b1d0b"/><stop offset=".5" stop-color="#6b3818"/><stop offset="1" stop-color="#2a1306"/></linearGradient>
        <filter id="${id}sh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${R * .012}"/></filter>`;
      const g = el('g', { transform: `translate(${cx} ${cy})` }, svg);
      el('circle', { r: R * 1.06, fill: '#000', opacity: .55, filter: `url(#${id}sh)`, cy: R * .04 }, g);
      el('circle', { r: R, fill: `url(#${id}wood)` }, g);
      el('circle', { r: R * .975, fill: 'none', stroke: `url(#${id}brass)`, 'stroke-width': R * .02 }, g);
      el('circle', { r: R * .905, fill: 'none', stroke: `url(#${id}track)`, 'stroke-width': R * .1 }, g);                  // ball track
      el('circle', { r: R * .855, fill: 'none', stroke: 'rgba(255,220,160,.18)', 'stroke-width': R * .006 }, g);
      for (let i = 0; i < 8; i++) {                                                                                         // brass deflectors
        const a = i * 45 + 22.5, r = R * .8;
        el('path', { d: `M0,${-R * .018} L${R * .03},0 L0,${R * .018} L${-R * .03},0 Z`, fill: `url(#${id}brass)`, transform: `rotate(${a}) translate(0 ${-r}) rotate(90)` }, g);
      }
      const rotor = el('g', {}, g);
      const n = ORDER.length, step = 360 / n, r0 = R * .6, r1 = R * .76;
      const arc = (a0, a1, ra, rb) => { const p = (a, r) => [(Math.sin(a / R2D) * r).toFixed(2), (-Math.cos(a / R2D) * r).toFixed(2)];
        const [x0, y0] = p(a0, rb), [x1, y1] = p(a1, rb), [x2, y2] = p(a1, ra), [x3, y3] = p(a0, ra);
        return `M${x0},${y0} A${rb},${rb} 0 0 1 ${x1},${y1} L${x2},${y2} A${ra},${ra} 0 0 0 ${x3},${y3} Z`; };
      ORDER.forEach((num, i) => {
        const a = i * step, col = (num === 0 || num === '00') ? '#0f6b3c' : REDS.has(num) ? '#b3261a' : '#141414';
        el('path', { d: arc(a - step / 2, a + step / 2, r0 * .92, r1), fill: col }, rotor);
        el('path', { d: arc(a - step / 2, a + step / 2, r0 * .78, r0 * .92), fill: col, opacity: .75 }, rotor);            // pocket floor
        const t = el('text', { x: 0, y: -(r1 - R * .045), 'text-anchor': 'middle', 'font-family': 'Big Shoulders Display, Impact', 'font-weight': 900,
          'font-size': R * .052, fill: '#f3ead6', transform: `rotate(${a})` }, rotor);
        t.textContent = num;
        el('line', { x1: 0, y1: -r0 * .78, x2: 0, y2: -r1, stroke: `url(#${id}brass)`, 'stroke-width': R * .007, transform: `rotate(${a + step / 2})` }, rotor);
      });
      el('circle', { r: r1, fill: 'none', stroke: `url(#${id}brass)`, 'stroke-width': R * .012 }, rotor);
      el('circle', { r: r0 * .78, fill: `url(#${id}cone)` }, rotor);
      for (let i = 0; i < 4; i++) {                                                                                          // turret
        const arm = el('g', { transform: `rotate(${i * 90})` }, rotor);
        el('rect', { x: -R * .018, y: -R * .34, width: R * .036, height: R * .3, rx: R * .015, fill: `url(#${id}brass)` }, arm);
        el('circle', { cy: -R * .35, r: R * .035, fill: `url(#${id}brass)` }, arm);
      }
      el('circle', { r: R * .09, fill: `url(#${id}brass)` }, rotor);
      el('circle', { r: R * .035, fill: '#fff4c8', opacity: .8 }, rotor);
      const oct = el('g', { opacity: 0 }, g);                                                                                // octant highlight (prediction)
      const octPath = el('path', { d: arc(-22.5, 22.5, R * .56, R * .99), fill: 'rgba(143,227,255,.22)', stroke: '#8fe3ff', 'stroke-width': R * .01 }, oct);
      const trail = [], ghosts = 7;
      for (let k = ghosts; k >= 1; k--) trail.push(el('circle', { r: R * .026, fill: '#fff', opacity: 0 }, g));
      const ball = el('circle', { r: R * .028, fill: `url(#${id}ball)` }, g);
      const st = { rot: opt.rot || 0 };
      const pos = (ang, r) => [Math.sin(ang / R2D) * r, -Math.cos(ang / R2D) * r];
      const setBall = (ang, r, vel) => {
        const [x, y] = pos(ang, r); ball.setAttribute('cx', x); ball.setAttribute('cy', y);
        const sp = Math.min(1, Math.abs(vel) / 900);
        trail.forEach((c, k) => { const lag = (k + 1) * 3.2 * Math.sign(vel || 1) * sp; const [tx, ty] = pos(ang + lag, r);
          c.setAttribute('cx', tx); c.setAttribute('cy', ty); c.setAttribute('opacity', (.32 * (1 - k / ghosts) * sp).toFixed(3)); });
      };
      const setRot = a => { st.rot = a; rotor.setAttribute('transform', `rotate(${a.toFixed(3)})`); };
      setRot(st.rot); setBall(opt.ball ?? 200, R * .905, 0);
      const W = {
        g, rotor, ball, oct, R, pocketAngle: i => i * step,
        indexOf: num => ORDER.findIndex(v => String(v) === String(num)),
        /* full spin: rotor turns, ball races the track (decelerating), drops, clatters, settles into pocket `land` */
        run(t0, dur, o = {}) {
          const rot0 = o.rot0 ?? st.rot, wr = o.rotorSpeed ?? 55, ball0 = o.ball0 ?? 30, bw = o.ballSpeed ?? 820;
          const Td = dur * (o.drop ?? .62), land = W.indexOf(o.land ?? 17);
          const rotA = tau => rot0 + wr * tau - .25 * wr * tau * tau / dur;
          const k = bw / Td * .78;                                                                            // ball decel on the track
          const ballA = tau => ball0 - (bw * tau - .5 * k * tau * tau);
          const relDrop = ballA(Td) - rotA(Td);
          let target = land * step; while (target > relDrop) target -= 360; if (relDrop - target < 250) target -= 360;
          const pr = { t: 0 };
          const draw = () => {
            const tau = pr.t; setRot(rotA(tau));
            if (tau <= Td) { setBall(ballA(tau), R * .905, -(bw - k * tau)); return; }
            const s = Math.min(1, (tau - Td) / (dur - Td)), e = 1 - Math.pow(1 - s, 2.6);
            const rel = relDrop + (target - relDrop) * e + Math.sin(s * Math.PI * 5) * (1 - s) * 7;
            const rr = R * .69 + (R * .905 - R * .69) * Math.pow(1 - Math.min(1, s * 1.6), 2) + Math.abs(Math.sin(s * Math.PI * 4)) * (1 - s) * R * .07;
            setBall(rotA(tau) + rel, rr, (1 - s) * -300);
          };
          tl.fromTo(pr, { t: 0 }, { t: dur, duration: dur, ease: 'none', onUpdate: draw, immediateRender: false }, t0);
          return { end: t0 + dur, dropAt: t0 + Td, landAngle: tau => rotA(tau) + target };
        },
        /* rotor turning slowly with the ball resting in `pocket` (after a run) or no ball */
        idle(t0, dur, dps = 18, pocket = null) {
          const pr = { t: 0 }, a0 = st.rot;
          tl.fromTo(pr, { t: 0 }, { t: dur, duration: dur, ease: 'none', immediateRender: false,
            onUpdate: () => { setRot(a0 + dps * pr.t); if (pocket != null) setBall(st.rot + W.indexOf(pocket) * step, R * .69, 0); } }, t0);
        },
        /* ball racing the track only (no drop), for suspense shots */
        race(t0, dur, dps = 700, rotDps = 50) {
          const pr = { t: 0 }, a0 = st.rot, b0 = 40;
          tl.fromTo(pr, { t: 0 }, { t: dur, duration: dur, ease: 'none', immediateRender: false,
            onUpdate: () => { setRot(a0 + rotDps * pr.t); setBall(b0 - dps * pr.t, R * .905, -dps); } }, t0);
        },
        octant(i, t, d = 1.2) {                                                                                             // light one eighth of the wheel
          octPath.setAttribute('transform', `rotate(${i * 45})`);
          tl.fromTo(oct, { opacity: 0 }, { opacity: 1, duration: .15, immediateRender: false }, t);
          tl.to(oct, { opacity: 0, duration: .3 }, t + d);
        },
      };
      return W;
    },

    /* ───── playing card ───── card(parent, 'A','♠', x, y, {scale, faceUp}) */
    card(parent, rank, suit, x, y, o = {}) {
      const c = div('pcard ' + ('♥♦'.includes(suit) ? 'red' : 'blk'), parent,
        `<div class="face"><div class="ix tl">${rank}<small>${suit}</small></div><div class="pip">${suit}</div><div class="ix br">${rank}<small>${suit}</small></div></div><div class="back"></div>`);
      c.style.left = x + 'px'; c.style.top = y + 'px';
      gsap.set(c, { scale: o.scale || 1, rotationY: o.faceUp ? 0 : 180, rotation: o.rot || 0, transformPerspective: 1400 });
      return c;
    },
    /* deal: card slides in face-down from (fx,fy) offset, then flips face-up */
    deal(c, t, o = {}) {
      tl.fromTo(c, { x: o.fx ?? -700, y: o.fy ?? -300, rotation: (o.rot || 0) - 40, opacity: 0 },
        { x: 0, y: 0, rotation: o.rot || 0, opacity: 1, duration: o.d ?? .45, ease: 'power3.out', immediateRender: false }, t);
      tl.set(c, { opacity: 0 }, 0);
      if (o.flip !== false) tl.to(c, { rotationY: 0, duration: .35, ease: 'power2.inOut' }, t + (o.d ?? .45) - .05);
    },

    /* ───── chips ───── stack(parent, x, y, n, color, label) → [chips] (bottom first) */
    stack(parent, x, y, n, color = '#b3261a', label = '') {
      const out = [];
      for (let i = 0; i < n; i++) {
        const c = div('chip', parent, i === n - 1 && label ? `<b>${label}</b>` : '');
        c.style.setProperty('--c', color); c.style.left = x + 'px'; c.style.top = (y - i * 12) + 'px'; c.style.zIndex = i + 1;
        out.push(c);
      }
      return out;
    },
    dropStack(chips, t, stagger = .06) {
      chips.forEach((c, i) => { tl.fromTo(c, { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: .28, ease: 'bounce.out', immediateRender: false }, t + i * stagger); tl.set(c, { opacity: 0 }, 0); });
    },

    /* ───── stamp slam ───── */
    stamp(parent, text, x, y, size = 120, rot = -8, color) {
      const s = div('stamp', parent, text); s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.fontSize = size + 'px';
      if (color) s.style.color = color;
      gsap.set(s, { rotation: rot, opacity: 0 });
      return s;
    },
    slam(elm, t, shake = true) {
      tl.fromTo(elm, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: .22, ease: 'power4.in', immediateRender: false }, t);
      if (shake) N.shake(t + .2, 16, .35);
    },
    shake(t, amp = 14, d = .35) {
      const k = [];
      for (let i = 0; i < 7; i++) k.push({ x: (rnd() - .5) * 2 * amp * (1 - i / 7), y: (rnd() - .5) * 2 * amp * (1 - i / 7), duration: d / 8 });
      k.push({ x: 0, y: 0, duration: d / 8 });
      tl.to('.scene', { keyframes: k }, t);
    },
    flash(t, a = .55, d = .35) { F.flash(t, a, d); },

    /* ───── text ───── */
    type(elm, text, t, cps = 26) {
      const pr = { n: 0 }; elm.textContent = '';
      tl.fromTo(pr, { n: 0 }, { n: text.length, duration: text.length / cps, ease: 'none', immediateRender: false, onUpdate: () => { elm.textContent = text.slice(0, Math.round(pr.n)); } }, t);
      tl.set(elm, { textContent: '' }, 0);
    },
    count(elm, from, to, t, d, fmt = v => Math.round(v).toLocaleString('en-US'), ease = 'power2.out') {
      const pr = { v: from }; elm.textContent = fmt(from);
      tl.fromTo(pr, { v: from }, { v: to, duration: d, ease, immediateRender: false, onUpdate: () => { elm.textContent = fmt(pr.v); } }, t);
    },
    /* words pop one by one (kinetic caption). Returns the container. */
    words(parent, html, x, y, size, t, o = {}) {
      const box = div('slam', parent); box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.fontSize = size + 'px';
      if (o.color) box.style.color = o.color; if (o.center) { box.style.transform = 'translateX(-50%)'; box.style.textAlign = 'center'; }
      html.split(' ').forEach((w, i) => { const s = document.createElement('span'); s.innerHTML = w + (i ? '' : ''); s.style.display = 'inline-block'; s.style.marginRight = '.22em'; box.appendChild(s); });
      const spans = Array.from(box.children);
      tl.set(spans, { opacity: 0, y: 30 }, 0);
      tl.to(spans, { opacity: 1, y: 0, duration: .22, ease: 'back.out(2.2)', stagger: o.stagger ?? .09 }, t);
      return box;
    },
    glitch(sel, t, d = .45) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const k = i / n;
        tl.set(sel, { x: (rnd() - .5) * 40, filter: `drop-shadow(${(rnd() * 14) | 0}px 0 0 rgba(224,71,58,.9)) drop-shadow(${-((rnd() * 14) | 0)}px 0 0 rgba(143,227,255,.9))`,
          clipPath: `inset(${(rnd() * 60) | 0}% 0 ${(rnd() * 30) | 0}% 0)` }, t + k * d);
      }
      tl.set(sel, { x: 0, filter: 'none', clipPath: 'inset(0% 0 0% 0)' }, t + d);
    },

    /* ───── neon: a glowing SVG stroke that flickers on ───── */
    neon(svg, d, color, w = 7) {
      const g = el('g', { opacity: 0 }, svg);
      el('path', { d, fill: 'none', stroke: color, 'stroke-width': w * 5, opacity: .18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'blur(10px)' }, g);
      el('path', { d, fill: 'none', stroke: color, 'stroke-width': w * 2, opacity: .45, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'blur(3px)' }, g);
      el('path', { d, fill: 'none', stroke: '#fff8ea', 'stroke-width': w * .55, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      return g;
    },
    flicker(g, t, on = 1) {
      [0, .06, .1, .19, .23, .34].forEach((dt, i) => tl.set(g, { opacity: i % 2 ? .15 : on }, t + dt));
    },

    /* ───── the edge meter (HUD, top right) ───── */
    odds: {
      show(t) { tl.to('#odds', { opacity: 1, duration: .3 }, t); },
      hide(t) { tl.to('#odds', { opacity: 0, duration: .3 }, t); },
      set(t, v, who, d = .6) {
        const bar = $('#odds .bar i'), val = $('#odds .v'), w = $('#odds .who'), pr = { v: N._odds };
        const from = N._odds; N._odds = v;
        tl.fromTo(pr, { v: from }, { v, duration: d, ease: 'power2.out', immediateRender: false, onUpdate: () => {
          const x = pr.v; val.textContent = (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(Math.abs(x) < 10 ? 1 : 0) + '%';
          val.style.color = x >= 0 ? '#e0b04a' : '#e0473a';
          const pct = Math.min(50, Math.abs(x) / 50 * 50); bar.style.width = pct + '%'; bar.style.left = x >= 0 ? '50%' : (50 - pct) + '%'; bar.style.background = x >= 0 ? '#e0b04a' : '#e0473a';
        } }, t);
        if (who) tl.set(w, { textContent: who }, t);
      },
    },
    _odds: 0,

    /* ───── chapter card: a card deals in, flips to the chapter number, title wipes on ───── */
    chapter(id, num, title, suit = '♠') {
      const host = $(`[data-scene="${id}"] .chcard`);
      const holder = div('', host); holder.style.cssText = 'position:relative;width:250px;height:350px';
      const c = N.card(holder, String(num), suit, 0, 0);
      const tx = div('ctext', host, `<div class="num">CHAPTER ${String(num).padStart(2, '0')}</div><div class="title">${title}</div><div class="rule"></div>`);
      const S = F.S(id);
      N.deal(c, S + .15, { fx: -900, fy: 120, rot: -6 });
      tl.set(tx.children, { opacity: 0, x: -30 }, 0);
      tl.to(tx.children, { opacity: 1, x: 0, duration: .45, ease: 'power3.out', stagger: .1 }, S + .5);
      tl.fromTo(tx.querySelector('.rule'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: .6, ease: 'expo.out', immediateRender: false }, S + .75);
      tl.fromTo(host, { scale: 1 }, { scale: 1.05, duration: F.D(id), ease: 'none', immediateRender: false }, S);
      tl.to(c, { x: 900, rotation: 30, duration: .35, ease: 'power2.in' }, F.E(id) - .45);
      tl.to(tx, { opacity: 0, duration: .3 }, F.E(id) - .4);
    },

    /* lower third */
    lower(parent, name, strip, t, d = 3.2) {
      const l = div('lower', parent, `<div class="name">${name}</div><div class="strip">${strip}</div>`);
      tl.set(l.children, { opacity: 0, x: -40 }, 0);
      tl.to(l.children, { opacity: 1, x: 0, duration: .45, ease: 'power3.out', stagger: .12 }, t);
      tl.to(l.children, { opacity: 0, x: -20, duration: .3, stagger: .05 }, t + d);
      return l;
    },
    /* "Dramatised reconstruction" tag for footage */
    recon(t, d) { tl.to('#recon', { opacity: 1, duration: .3 }, t); tl.to('#recon', { opacity: 0, duration: .3 }, t + d); },

    /* push-in / drift on a footage wrapper (a beat, not a drift) */
    push(sel, t, d, s0 = 1.0, s1 = 1.08, o = {}) {
      tl.fromTo(sel, { scale: s0, x: o.x0 || 0, y: o.y0 || 0 }, { scale: s1, x: o.x1 || 0, y: o.y1 || 0, duration: d, ease: o.ease || 'sine.inOut', immediateRender: false }, t);
    },
    /* whip transition: motion-blurred slide + flash between two scenes at time t */
    whip(outSel, inSel, t, dir = 1) {
      tl.to(outSel, { x: -dir * 700, filter: 'blur(18px)', duration: .22, ease: 'power3.in' }, t - .22);
      tl.fromTo(inSel, { x: dir * 700, filter: 'blur(18px)' }, { x: 0, filter: 'blur(0px)', duration: .26, ease: 'power3.out', immediateRender: false }, t);
    },
    /* rising particles (chips, sparks, snow) */
    particles(parent, n, t, d, o = {}) {
      for (let i = 0; i < n; i++) {
        const p = div('', parent); const sz = (o.size || 6) * (.5 + rnd());
        p.style.cssText = `position:absolute;left:${(rnd() * 1920) | 0}px;top:${o.fromTop ? -20 : 1100}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${o.color || '#e0b04a'};opacity:0;filter:blur(${o.blur || 0}px)`;
        p.dataset.drift = '1';
        const dy = o.fromTop ? 1140 : -(600 + rnd() * 600);
        tl.fromTo(p, { y: 0, x: 0, opacity: 0 }, { y: dy, x: (rnd() - .5) * 200, opacity: o.op || .8, duration: d * (.6 + rnd() * .4), ease: 'none', immediateRender: false, data: 'ambient' }, t + rnd() * d * .4);
      }
    },
  };
  return N;
};
