/* extras: infographic set-pieces layered on top of the base scenes, and the emotion map (tension heartbeats on the
   threats, warm blooms on the wins, a build into the twist). */

// HOOK: what the number decides — chips orbiting the gauge in 3D
{
  const host = sc('hook1'), words = ['MORTGAGES', 'AUTO LOANS', 'RENT', 'INSURANCE', 'JOBS', 'CREDIT CARDS', 'PHONE PLANS'];
  const chips = words.map(w => at(host, `<div class="tag" style="font-size:30px;padding:12px 22px">${w}</div>`, 0, 0));
  const pr = { a: 0 }, cx = 960, cy = 470, rx = 760, ry = 300, tA = W('H1', 'decides');
  const place = () => chips.forEach((c, i) => { const a = pr.a + i / chips.length * Math.PI * 2, sn = Math.sin(a); gsap.set(c, { x: cx + Math.cos(a) * rx - 90, y: cy + sn * ry, scale: .75 + .3 * (sn + 1) / 2, opacity: .45 + .55 * (sn + 1) / 2 }); });
  tl.set(chips, { opacity: 0 }, 0);
  tl.fromTo(pr, { a: -.6 }, { a: 1.4, duration: tA - .3, ease: 'sine.inOut', onUpdate: place, immediateRender: false }, .3);
  chips.forEach((c, i) => { tl.to(c, { x: 410, y: 380, scale: .15, opacity: 0, duration: .45, ease: 'power3.in' }, tA - .1 + i * .04); });
  cue(tA + .2, 'riser', .25, 0, { dur: .3 });
  cue(.4, 'swoosh', .35);
}

// BIG THREE: money streaming into each tower while the total counts
{
  const host = sc('b1'), t = W('B3', '18') - .3;
  [[410, 520], [950, 470], [1490, 560]].forEach(([x, y], i) => stream(host, x - 260 + i * 130, 900, x, y, t + i * .08, VE('B3b') - .2, GOLD, .11, 12, 1));
}

// BREACH: how big 147 million is — nearly half of all Americans
{
  const host = sc('e2'), t = W('E4', 'people') - .1;
  const ppl = people(host, 120, 790, 50, 1, 22, 10, 'rgba(255,255,255,.8)');
  ppl.forEach((p, i) => { p.querySelectorAll('circle,path:not(.hl)').forEach(e => e.setAttribute('fill', 'currentColor')); tl.set(p, { opacity: 0, color: 'rgba(255,255,255,.8)' }, 0); tl.to(p, { opacity: 1, duration: .1 }, t + i * .012); if (i < 23) tl.to(p, { color: RED, duration: .15 }, t + .7 + i * .025); });
  const lb = at(host, `<div class="pill" style="position:relative;background:${RED};color:#fff;font-size:28px">≈ 45% OF ALL AMERICANS</div>`, 1760, 780); tl.set(lb, { xPercent: -100 }, 0); pop(lb, t + 1.2);
  tl.to([...ppl, lb], { opacity: 0, duration: .3 }, V('E4b') - .2);
}

// BEFORE THE SCORE: gossip spreading through a rumour network
{
  const host = sc('f1'), t = W('F1', 'personal') - .3, N = [[760, 240], [1010, 150], [960, 420], [700, 520], [1150, 560]];
  const lines = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4]];
  const net = at(host, `<svg viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:visible">${lines.map(([a, b], i) => `<line class="ln${i}" x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}" stroke="#ffd27a" stroke-width="4" stroke-dasharray="10 10" pathLength="100"/>`).join('')}</svg>`, 0, 0);
  const nodes = N.map(([x, y], i) => at(host, `<div style="width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3a5a9a,#0b1a33);border:3px solid #ffd27a;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;box-shadow:0 0 24px rgba(255,210,122,.4)">${A.person(52, '#bfe0ff')}</div>`, x - 42, y - 42));
  tl.set(net, { opacity: 0 }, 0); tl.to(net, { opacity: 1, duration: .3 }, t);
  lines.forEach((_, i) => tl.fromTo(net.querySelector('.ln' + i), { attr: { 'stroke-dashoffset': 100 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'none', repeat: 3, immediateRender: false }, t + i * .1));
  nodes.forEach((n, i) => { pop(n, t + i * .12, .3); cue(t + i * .12, 'pop', .2, -.2 + i * .1); });
  tl.to([net, ...nodes], { opacity: 0, duration: .3 }, V('F1b') - .2);
}

/* ---------- the emotion map ---------- */
tensionPulse(W('H2', "can't") + .1, .3, 1);
tensionPulse(W('P5', 'no') - .05, .35, 1);
tensionPulse(W('J7', 'trap'), .4, 1);
tensionPulse(V('E1'), .6, 2);
tensionPulse(W('E2', 'five'), .45, 1);
tensionPulse(W('E3b', 'stays'), .5, 1);
tensionPulse(W('E4', 'hacked'), .8, 2);
tensionPulse(W('E5', 'back'), .45, 1);
tensionPulse(W('C3', '100000'), .35, 1);
tensionPulse(W('X3', 'truth') - .2, .4, 2);
bloomAt(W('F2c', 'empire'), .7);
bloomAt(W('F5', 'home'), .6);
bloomAt(V('X1'), .8, 2.2);
bloomAt(W('X4', 'profitable'), 1, 2);
bloomAt(W('X6', 'check'), .7, 2);
['p0', 'f0', 'j0', 'b0', 'e0', 'c0'].forEach(id => bloomAt(S(id) + .1, .45, 1.2));
