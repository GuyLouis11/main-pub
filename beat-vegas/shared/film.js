/* Shared chapter runtime: VO-driven scene layout + animation helpers.
   The layout rule is mirrored exactly in tools/retime_chapters.py (keep them in sync):

     scene.start = cursor - scene.xin
     voStart[i]  = scene.start + lead + sum(dur[0..i-1]) + gap*i
     content     = n ? lead + sum(dur) + gap*(n-1) + tail : 0
     scene.dur   = max(scene.min, content)
     cursor      = scene.start + scene.dur

   dur = measured take length (written by the tool as vo[id].dur) or vo[id].estimate. */
window.FILM_INIT = function () {
  const tim = JSON.parse(document.getElementById('timing').textContent);
  const vdur = id => { const v = tim.vo[id]; if (!v) throw new Error('unknown VO ' + id); return +(v.dur || v.estimate); };

  const scenes = {}, vo = {};
  let cursor = 0;
  tim.scenes.forEach(sc => {
    const lead = sc.lead ?? tim.defaults.lead, gap = sc.gap ?? tim.defaults.gap, tail = sc.tail ?? tim.defaults.tail;
    const xin = sc.xin ?? 0;
    const start = Math.max(0, cursor - xin);
    let t = start + lead;
    (sc.vo || []).forEach((id, i) => { if (i) t += gap; vo[id] = { start: t, dur: vdur(id) }; t += vdur(id); });
    const n = (sc.vo || []).length;
    const content = n ? (t - start) + tail : 0;
    const dur = Math.max(sc.min || 0, content);
    scenes[sc.id] = { start, dur, end: start + dur };
    cursor = start + dur;
  });
  const TOTAL = cursor;

  let seed = tim.seed || 1963;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const div = (cls, parent, html) => { const d = document.createElement('div'); if (cls) d.className = cls; if (html != null) d.innerHTML = html; parent && parent.appendChild(d); return d; };

  const tl = gsap.timeline({ paused: true });
  const S = id => scenes[id].start, E = id => scenes[id].end, D = id => scenes[id].dur;
  const V = id => vo[id].start, VE = id => vo[id].start + vo[id].dur;
  const P = (id, f) => vo[id].start + f * vo[id].dur;   // a point f (0..1) through a line: proportional word timing

  const F = {
    tim, tl, scenes, vo, TOTAL, S, E, D, V, VE, P, rnd, $, $$, el, div,
    write(sel, t, d = .8, ease = 'none') {
      tl.fromTo(sel, { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% -6% -20% 0%)', duration: d, ease, immediateRender: false }, t);
      tl.set(sel, { clipPath: 'inset(-20% 100% -20% 0%)' }, 0);
    },
    wipeIn(sel, t, d = .6, from = 'left') {
      const a = { left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)', top: 'inset(0% 0% 100% 0%)', bottom: 'inset(100% 0% 0% 0%)' }[from];
      tl.set(sel, { clipPath: a }, 0);
      tl.to(sel, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: 'power3.out' }, t);
    },
    up(sel, t, d = .5, y = 22, stagger = 0) {
      tl.set(sel, { opacity: 0, y }, 0);
      tl.to(sel, { opacity: 1, y: 0, duration: d, ease: 'power3.out', stagger }, t);
    },
    pop(sel, t, d = .35) {
      tl.set(sel, { opacity: 0, scale: .8 }, 0);
      tl.to(sel, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)', transformOrigin: '50% 50%' }, t);
    },
    fade(sel, t, d = .4, to = 0) { tl.to(sel, { opacity: to, duration: d, ease: 'power1.inOut' }, t); },
    show(sel, t, d = .4) { tl.set(sel, { opacity: 0 }, 0); tl.to(sel, { opacity: 1, duration: d, ease: 'power1.out' }, t); },
    draw(sel, t, d = .8, ease = 'power1.inOut') {
      $$(typeof sel === 'string' ? sel : '').forEach(p => { p.setAttribute('pathLength', 1); p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('stroke-dashoffset', 1); });
      tl.set(sel, { opacity: 0 }, 0); tl.set(sel, { opacity: 1 }, t);   // no round-cap dot before the stroke starts
      tl.to(sel, { attr: { 'stroke-dashoffset': 0 }, duration: d, ease }, t);
    },
    drift(sel, id, from = 1.05, to = 1.0, extra = {}) {
      tl.fromTo(sel, { scale: from, ...(extra.from || {}) }, { scale: to, ...(extra.to || {}), duration: D(id), ease: 'sine.out', immediateRender: false, data: 'drift' }, S(id));
    },
    // ambient life: slow drifting motes (paper: warm dust in lamplight · dark: frost motes). Never counts as a "beat".
    ambient(id, kind = 'dark', n = 34) {
      const host = document.querySelector('[data-scene="' + id + '"]'); if (!host) return;
      const layer = div('abs', host); layer.style.cssText += 'inset:0;pointer-events:none;z-index:2'; layer.dataset.drift = '1';
      for (let i = 0; i < n; i++) {
        const m = div('', layer), sz = 2 + rnd() * (kind === 'paper' ? 3 : 4);
        m.style.cssText = `position:absolute;left:${(rnd() * 1920).toFixed(0)}px;top:${(rnd() * 1080).toFixed(0)}px;width:${sz}px;height:${sz}px;border-radius:50%;` +
          (kind === 'paper' ? `background:rgba(255,236,200,${(.25 + rnd() * .35).toFixed(2)});filter:blur(.6px)` : `background:rgba(200,240,255,${(.18 + rnd() * .35).toFixed(2)})`);
        m.dataset.drift = '1';
        const dx = (rnd() - .5) * 160, dy = kind === 'paper' ? (rnd() - .5) * 120 : -(40 + rnd() * 140);
        tl.fromTo(m, { x: 0, y: 0, opacity: 0 }, { x: dx, y: dy, opacity: 1, duration: D(id), ease: 'none', immediateRender: false, data: 'ambient' }, S(id));
        tl.set(m, { opacity: 0 }, 0);
      }
    },
    // a purposeful camera pan (counts as a beat). Uses x/y only, so it never fights a scene's scale drift.
    pan(sel, t, d, x, y, ease = 'power2.inOut') { tl.to(sel, { x, y, duration: d, ease }, t); },
    flash(t, a = .5, d = .45) { tl.to('#flash', { opacity: a, duration: .04 }, t).to('#flash', { opacity: 0, duration: d, ease: 'power2.out' }, t + .04); },
    sceneFade(id, din = .5, dout = .5) {
      const s = '[data-scene="' + id + '"]';
      tl.set(s, { opacity: 0 }, 0);
      tl.to(s, { opacity: 1, duration: din, ease: 'power1.out' }, S(id));
      if (dout) tl.to(s, { opacity: 0, duration: dout, ease: 'power1.in' }, E(id) - dout);
    },
    card(id) {
      const s = '[data-scene="' + id + '"] ';
      F.up(s + '.num', S(id) + .25, .5, 14);
      tl.set(s + '.title', { opacity: 0, scale: 1.12, filter: 'blur(12px)' }, 0);
      tl.to(s + '.title', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .6, ease: 'power4.out' }, S(id) + .35);
      tl.set(s + '.rule', { scaleX: 0 }, 0);
      tl.to(s + '.rule', { scaleX: 1, duration: .7, ease: 'expo.out' }, S(id) + .55);
      tl.fromTo(s + '.chcard', { scale: 1 }, { scale: 1.04, duration: D(id), ease: 'none', immediateRender: false }, S(id));
    },
    finish(compId) {
      tl.set('#black', { opacity: 1 }, 0).to('#black', { opacity: 0, duration: .5 }, .01);
      tl.to('#black', { opacity: 1, duration: .5 }, TOTAL - .5);
      for (let t = 0; t < TOTAL; t += 1 / 24) tl.set('#grain', { x: Math.round((rnd() - .5) * 120), y: Math.round((rnd() - .5) * 120) }, t);
      const vars = (window.__hyperframes && window.__hyperframes.getVariables) ? window.__hyperframes.getVariables() : {};
      const scratch = vars.scratchVO === true || vars.scratchVO === 'true' || new URLSearchParams(location.search).get('scratch') === '1';
      if (scratch) {
        $('#scratch').style.display = 'flex';
        tl.set('#scratch', { opacity: 0 }, 0);
        Object.keys(vo).forEach(id => {
          tl.set('#scratchTxt', { textContent: id + '  ' + tim.vo[id].text }, V(id));
          tl.set('#scratch', { opacity: 1 }, V(id)); tl.set('#scratch', { opacity: 0 }, VE(id));
        });
      }
      window.__timelines = window.__timelines || {};
      window.__timelines[compId] = tl;
      // beat audit (tools/beat_audit.mjs): intervals where a visible change is happening.
      // Ignored: grain jitter, whole-scene camera drifts (marked data-drift) and scene fades.
      window.__beats = () => {
        const iv = [];
        tl.getChildren(true, true, false).forEach(tw => {
          const tg = (tw.targets && tw.targets()) || [];
          if (!tg.length || tw.duration() === 0 && !tw.vars.textContent && !tw.vars.attr) return;
          if (tw.data === 'drift' || tw.data === 'ambient') return;
          if (tg.some(t => t && t.nodeType && (t.id === 'grain' || t.id === 'black' || t.id === 'scratch' || t.id === 'scratchTxt' || (t.dataset && t.dataset.drift)))) return;
          if (tg.every(t => !t || !t.nodeType)) { if (!tw.vars.onUpdate) return; }   // proxy objects count only if they draw
          const st = tw.startTime(), en = st + Math.max(tw.totalDuration(), .15);
          iv.push([st, en]);
        });
        document.querySelectorAll('video[data-start]').forEach(v => { const st = +v.dataset.start, d = +v.dataset.duration; if (d > 0) iv.push([st, st + d]); });
        iv.sort((a, b) => a[0] - b[0]);
        const gaps = []; let cur = 0;
        iv.forEach(([a, b]) => { if (a > cur + 1e-3) gaps.push([cur, a]); cur = Math.max(cur, b); });
        if (TOTAL > cur) gaps.push([cur, TOTAL]);
        return { total: TOTAL, gaps: gaps.filter(g => g[1] - g[0] > 1.5).map(g => [+g[0].toFixed(2), +g[1].toFixed(2), +(g[1] - g[0]).toFixed(2)]) };
      };
      tl.seek(0);
    },
  };
  window.FILM = F;
  return F;
};
