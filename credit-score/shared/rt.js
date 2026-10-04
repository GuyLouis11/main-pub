/* Vertical Shorts runtime: VO-driven scene layout (mirror of tools/bake.py), word-timed captions,
   an SFX cue list shared with tools/score.py, and a beat audit. 1080×1920. */
window.RT_INIT = function () {
  const tim = JSON.parse(document.getElementById('timing').textContent);
  const vdur = id => +(tim.vo[id].dur || tim.vo[id].estimate);
  const scenes = {}, vo = {};
  let cursor = 0;
  tim.scenes.forEach(sc => {
    const d = tim.defaults, lead = sc.lead ?? d.lead, gap = sc.gap ?? d.gap, tail = sc.tail ?? d.tail;
    const start = Math.max(0, cursor - (sc.xin ?? 0));
    let t = start + lead;
    (sc.vo || []).forEach((id, i) => { if (i) t += gap; vo[id] = { start: t, dur: vdur(id) }; t += vdur(id); });
    const dur = Math.max(sc.min || 0, (sc.vo || []).length ? (t - start) + tail : 0);
    scenes[sc.id] = { start, dur, end: start + dur };
    cursor = start + dur;
  });
  const TOTAL = cursor;

  let seed = tim.seed || 1990;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const div = (cls, parent, html, css) => { const d = document.createElement('div'); if (cls) d.className = cls; if (html != null) d.innerHTML = html; if (css) d.style.cssText += css; parent && parent.appendChild(d); return d; };

  const tl = gsap.timeline({ paused: true });
  const S = id => scenes[id].start, E = id => scenes[id].end, D = id => scenes[id].dur;
  const V = id => vo[id].start, VE = id => vo[id].start + vo[id].dur;
  const words = id => tim.vo[id].words || [];
  // absolute start of word k of line id (k may be a number or the display word, case-insensitive, first match after `from`)
  const W = (id, k, from = 0) => {
    const ws = words(id);
    if (!ws.length) return V(id) + (typeof k === 'number' ? k : 0) * .3;
    let i = k;
    if (typeof k !== 'number') {
      const kk = k.toLowerCase();
      i = ws.findIndex((w, j) => j >= from && w[0].toLowerCase().replace(/[^a-z0-9ő/'-]/g, '') === kk);
      if (i < 0) throw new Error(`word ${k} not in ${id}`);
    }
    return V(id) + ws[i][1];
  };
  const WE = (id, k, from = 0) => { const ws = words(id); const i = typeof k === 'number' ? k : ws.findIndex((w, j) => j >= from && w[0].toLowerCase().replace(/[^a-z0-9ő/'-]/g, '') === k.toLowerCase()); return V(id) + ws[i][2]; };

  const cues = [];
  const cue = (t, name, gain = 1, pan = 0, extra) => { cues.push([+t.toFixed(3), name, gain, pan, extra || null]); };

  const R = {
    tim, tl, scenes, vo, TOTAL, S, E, D, V, VE, W, WE, rnd, $, $$, el, div, cue, cues,
    set: (sel, v, t = 0) => tl.set(sel, v, t),
    hide(sel) { tl.set(sel, { opacity: 0 }, 0); },
    pop(sel, t, d = .4, from = .4, ease = 'back.out(2.2)') {
      tl.set(sel, { opacity: 0, scale: from }, 0);
      tl.to(sel, { opacity: 1, scale: 1, duration: d, ease }, t);
    },
    slam(sel, t, from = 2.2, d = .28) {
      tl.set(sel, { opacity: 0, scale: from }, 0);
      tl.to(sel, { opacity: 1, scale: 1, duration: d, ease: 'power4.in' }, t);
    },
    up(sel, t, d = .45, y = 40, stagger = 0) {
      tl.set(sel, { opacity: 0, y }, 0);
      tl.to(sel, { opacity: 1, y: 0, duration: d, ease: 'power3.out', stagger }, t);
    },
    out(sel, t, d = .3, v = {}) { tl.to(sel, { opacity: 0, duration: d, ease: 'power1.in', ...v }, t); },
    shake(t, a = 18, d = .35, sel = '#stage') {
      const n = Math.round(d / .035);
      for (let i = 0; i < n; i++) { const k = 1 - i / n; tl.to(sel, { x: (rnd() - .5) * 2 * a * k, y: (rnd() - .5) * 2 * a * k, duration: .035, ease: 'none' }, t + i * .035); }
      tl.to(sel, { x: 0, y: 0, duration: .05 }, t + n * .035);
    },
    flash(t, a = .6, d = .4, color) {
      if (color) tl.set('#flash', { background: color }, t);
      tl.to('#flash', { opacity: a, duration: .03 }, t).to('#flash', { opacity: 0, duration: d, ease: 'power2.out' }, t + .03);
    },
    draw(sel, t, d = .6, ease = 'power2.inOut') {
      (typeof sel === 'string' ? $$(sel) : [sel]).forEach(p => { p.setAttribute('pathLength', 1); p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('stroke-dashoffset', 1); });
      tl.set(sel, { opacity: 0 }, 0); tl.set(sel, { opacity: 1 }, t);
      tl.to(sel, { attr: { 'stroke-dashoffset': 0 }, duration: d, ease }, t);
    },
    count(sel, t, d, from, to, fmt = v => Math.round(v).toLocaleString('en-US'), ease = 'power2.out') {
      const o = { v: from }, e = typeof sel === 'string' ? $(sel) : sel;
      tl.set(e, { textContent: fmt(from) }, 0);
      tl.to(o, { v: to, duration: d, ease, onUpdate: () => { e.textContent = fmt(o.v); } }, t);
    },
    flicker(sel, t, n = 5) {
      tl.set(sel, { opacity: 0 }, 0);
      const seq = [1, .1, .9, .2, 1, .4, 1];
      for (let i = 0; i < n + 2; i++) tl.set(sel, { opacity: seq[i % seq.length] }, t + i * .045);
      tl.set(sel, { opacity: 1 }, t + (n + 2) * .045);
    },
    glitch(sel, t, d = .3) {
      const n = Math.round(d / .04);
      for (let i = 0; i < n; i++) tl.set(sel, { x: (rnd() - .5) * 40, skewX: (rnd() - .5) * 20, filter: `hue-rotate(${Math.round(rnd() * 180)}deg)` }, t + i * .04);
      tl.set(sel, { x: 0, skewX: 0, filter: 'none' }, t + n * .04);
    },
    sceneIn(id, d = .25) { const s = `[data-scene="${id}"]`; tl.set(s, { opacity: 0 }, 0); tl.to(s, { opacity: 1, duration: d, ease: 'power1.out' }, S(id)); },
    sceneOut(id, d = .25) { tl.to(`[data-scene="${id}"]`, { opacity: 0, duration: d, ease: 'power1.in' }, E(id) - d); },

    // Shorts captions: chunks of up to 3 words (broken at punctuation), active word pops, *marked* words in accent colour
    captions(host) {
      Object.keys(vo).forEach(id => {
        const ws = words(id); if (!ws.length) return;
        const chunks = []; let cur = [];
        const len = c => c.reduce((n, [w]) => n + w[0].length + 1, 0);
        ws.forEach((w, i) => {
          if (cur.length && len(cur) + w[0].length > (tim.capChars || 17)) { chunks.push(cur); cur = []; }   // one line, always
          cur.push([w, i]);
          if (cur.length === (tim.capWords || 3) || /[.,?!:]$/.test(w[0])) { chunks.push(cur); cur = []; }
        });
        if (cur.length) chunks.push(cur);
        chunks.forEach((ch, ci) => {
          const box = div('cap', host); box.dataset.cap = '1';
          const t0 = V(id) + ch[0][0][1] - .04;
          const t1 = ci < chunks.length - 1 ? V(id) + chunks[ci + 1][0][0][1] - .04 : VE(id) + .22;
          ch.forEach(([w]) => {
            const sp = div('w' + (w[3] ? ' hi' : ''), box, w[0].replace(/[,:]$/, '')); sp.dataset.cap = '1';
            tl.set(sp, { opacity: .0, scale: .6, y: 18 }, 0);
            tl.to(sp, { opacity: 1, scale: 1.14, y: 0, duration: .09, ease: 'power2.out' }, V(id) + w[1] - .03);
            tl.to(sp, { scale: 1, duration: .14, ease: 'power2.inOut' }, V(id) + w[1] + .07);
          });
          tl.set(box, { opacity: 0 }, 0); tl.set(box, { opacity: 1 }, t0); tl.set(box, { opacity: 0 }, t1);
        });
      });
    },

    finish(compId) {
      window.__timelines = window.__timelines || {};
      window.__timelines[compId] = tl;
      window.__cues = () => ({ total: TOTAL, scenes, vo, cues: cues.slice().sort((a, b) => a[0] - b[0]) });
      // beat audit: stretches with no visible change; decoration (data-drift) never counts, captions optionally excluded
      window.__beats = (noCaps = false) => {
        const iv = [];
        tl.getChildren(true, true, false).forEach(tw => {
          const tg = (tw.targets && tw.targets()) || [];
          if (!tg.length || tw.duration() === 0 && !tw.vars.textContent && !tw.vars.attr) return;
          if (tw.data === 'drift') return;
          if (tg.some(t => t && t.nodeType && (t.id === 'black' || (t.dataset && (t.dataset.drift || (noCaps && t.dataset.cap)))))) return;
          if (tg.every(t => !t || !t.nodeType)) { if (!tw.vars.onUpdate) return; }
          const st = tw.startTime(); iv.push([st, st + Math.max(tw.totalDuration(), .15)]);
        });
        iv.sort((a, b) => a[0] - b[0]);
        const gaps = []; let c = 0;
        iv.forEach(([a, b]) => { if (a > c + 1e-3) gaps.push([c, a]); c = Math.max(c, b); });
        if (TOTAL > c) gaps.push([c, TOTAL]);
        return { total: TOTAL, gaps: gaps.filter(g => g[1] - g[0] > 1.0).map(g => g.map(x => +x.toFixed(2))) };
      };
      // seek(0) alone is a no-op on a fresh timeline, so the time-0 sets (initial states) would never render:
      // step off zero and back so frame 0 shows the composed first frame
      tl.seek(0.001); tl.seek(0);
    },
  };
  return R;
};
