/* Banks Don't Lend Your Money — motion design. Every beat is placed on a spoken word (W(id, k) = start of word k).
   Frame 0 and the last frame are the same shot: a closed vault door over an empty balance (the Short loops). */
const R = RT_INIT();
const { tl, S, E, V, VE, W, WE, rnd, $, $$, div, cue, TOTAL } = R;
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const commas = v => Math.round(v).toLocaleString('en-US');
const usd = v => '$' + commas(v);

(() => {
  const st = document.createElement('style');
  st.textContent = `
  .key { position:absolute; top:0; width:128px; height:128px; border-radius:22px; background:linear-gradient(180deg,#e8f2ec,#b9cbc1); color:#0b1712;
    box-shadow:0 12px 0 #5f7268, 0 22px 40px rgba(0,0,0,.6); font:800 76px/128px 'JetBrains Mono',monospace; text-align:center; }
  .saver { position:absolute; width:150px; height:230px; }
  .chainbox { position:absolute; top:0; height:84px; padding:0 18px; border-radius:16px; border:3px solid rgba(61,255,154,.45); background:rgba(5,22,16,.92);
    font:800 38px/78px 'JetBrains Mono',monospace; color:#b8ffd9; white-space:nowrap; }
  .shard { position:absolute; }
  .sqc { position:absolute; width:66px; height:66px; border-radius:10px; background:rgba(61,255,154,.08); border:2px solid rgba(61,255,154,.25); overflow:hidden;
    font:700 20px/66px 'JetBrains Mono',monospace; color:rgba(184,255,217,.0); text-align:center; }
  .sqc.cash { background:linear-gradient(150deg,#f2efe6,#cfc8b4); border-color:#f2efe6; }
  .bit { position:absolute; font:800 46px/1 'JetBrains Mono',monospace; color:#3dff9a; text-shadow:0 0 12px #3dff9a; }
  .pig { position:absolute; top:0; width:220px; height:200px; }
  .sp { position:absolute; width:10px; height:10px; border-radius:50%; background:#b8ffd9; box-shadow:0 0 14px #3dff9a; }
  `;
  document.head.appendChild(st);
})();
const through = (id, { first = false, last = false, sfx = 'whoosh' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) { tl.set(s, { opacity: 0, scale: .94 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .32, ease: 'power3.out' }, S(id)); if (sfx) cue(S(id), sfx, .55); }
  if (!last) tl.to(s, { opacity: 0, scale: 1.06, duration: .24, ease: 'power2.in' }, E(id) - .24);
};
const push = (sel, id, to = 1.05) => { tl.set(sel, { scale: 1 }, 0); tl.to(sel, { scale: to, duration: E(id) - S(id), ease: 'sine.inOut', transformOrigin: '50% 45%' }, S(id)); };

/* ================= world: a faint rain of ledger digits ================= */
(() => {
  const cv = $('#digits'), cx = cv.getContext('2d');
  const C = []; for (let i = 0; i < 26; i++) C.push({ x: 20 + i * 41.5, sp: 40 + rnd() * 90, off: rnd() * 1920, n: 10 + Math.floor(rnd() * 14), seed: Math.floor(rnd() * 1e6) });
  const draw = t => {
    cx.clearRect(0, 0, 1080, 1920); cx.font = '700 26px "JetBrains Mono"';
    for (const c of C) {
      const head = (c.off + t * c.sp) % 2400 - 300;
      for (let k = 0; k < c.n; k++) {
        const y = head - k * 32; if (y < -30 || y > 1950) continue;
        const a = (1 - k / c.n) * .16;
        const d = ((c.seed + k * 7919 + Math.floor((t * 3 + k) / 1)) % 10);
        cx.fillStyle = `rgba(61,255,154,${a.toFixed(3)})`; cx.fillText(String(d), c.x, y);
      }
    }
  };
  const prox = { t: 0 };
  tl.fromTo(prox, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(prox.t) }, 0);
  tl.fromTo('#grid', { y: 0 }, { y: 90, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
})();

/* ================= frame 0: the vault door ================= */
for (let i = 0; i < 18; i++) { const a = i / 18 * 6.2832; svgEl('circle', { cx: 320 + Math.cos(a) * 300, cy: 320 + Math.sin(a) * 300, r: 10 }, $('#dbolts')); }
center('#balPill');
// savers inside the vault (they appear on "anyone's money", then get crossed out)
const saverSVG = c => `<svg viewBox="0 0 150 230" style="width:150px;height:230px"><g fill="${c}"><circle cx="75" cy="40" r="30"/><path d="M30,84 Q75,66 120,84 L126,190 L24,190 Z"/></g>
  <g><ellipse cx="112" cy="196" rx="34" ry="30" fill="#ffc640"/><text x="112" y="208" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="34" fill="#4a3300">$</text></g></svg>
  <div class="strike" style="left:-10px;top:100px;width:170px;transform:rotate(-30deg)"></div>`;
const savers = [0, 1, 2].map(i => div('saver', $('#savers'), saverSVG(['#b8ffd9', '#8fd8b3', '#d6f5e4'][i]), `left:${70 + i * 160}px;top:${200}px`));

/* ---------- 1 · HOOK: the door opens on an empty vault ---------- */
{
  const tWhen = W('B01', 0), tLoan = W('B01', 6), tDoes = W('B01', 8), tAny = W('B01', 11), tMoney = W('B01', 12);
  // the wheel spins from frame 0 (motion before the first word), then the door swings open on its hinge
  tl.set('#wheel', { rotation: 0 }, 0);
  tl.to('#wheel', { rotation: 180, duration: tWhen + .5, ease: 'power2.inOut', svgOrigin: '320 320' }, 0.02); cue(0.02, 'spin', .7, 0, { dur: tWhen + .5 });
  tl.set('#vdoor', { rotationY: 0, transformPerspective: 1600, transformOrigin: '0% 50%' }, 0);
  tl.to('#vdoor', { rotationY: -112, duration: .9, ease: 'power3.inOut' }, tWhen + .45); cue(tWhen + .45, 'creak', .8); cue(tWhen + 1.2, 'thud', .5);
  tl.set('#emptyT', { opacity: 0 }, 0); tl.to('#emptyT', { opacity: 1, duration: .4 }, tWhen + 1.0);
  // the loan card slides in on "loan"
  tl.set('#loanCard', { opacity: 0, x: 300, rotation: 8 }, 0);
  tl.to('#loanCard', { opacity: 1, x: 0, rotation: -3, duration: .4, ease: 'back.out(1.5)' }, tLoan - .2); cue(tLoan - .2, 'swoosh', .6, .5);
  tl.to('#balPill', { y: 20, opacity: .5, duration: .3 }, tLoan - .2);
  // "doesn't lend you anyone's money": savers pop in, get crossed out
  tl.to('#emptyT', { opacity: 0, duration: .2 }, tDoes);
  savers.forEach((s, i) => {
    const t = tDoes + .1 + i * .12;
    tl.set(s, { opacity: 0, y: 60 }, 0); tl.to(s, { opacity: 1, y: 0, duration: .25, ease: 'back.out(1.8)' }, t); cue(t, 'pop', .5, i - 1);
    const x = s.querySelector('.strike'); const tx = tAny + .1 + i * .16;
    tl.set(x, { scaleX: 0 }, 0); tl.to(x, { scaleX: 1, duration: .14, ease: 'power2.out' }, tx); cue(tx, 'slash', .55, i - 1);
    tl.to(s, { opacity: .35, duration: .2 }, tx + .15);
  });
  cue(tMoney + .3, 'thud', .7); R.shake(tMoney + .3, 10, .25);
  tl.to('#f0', { opacity: 0, duration: .3 }, E('hook') - .3);
  through('hook', { first: true });
}

/* ---------- 2 · TYPE: a number is typed; the money exists ---------- */
{
  through('type');
  const tTypes = W('B02', 1), tNum = W('B02', 3), tAcct = W('B02', 6), tAnd = W('B02', 7), tJust = W('B02', 10), tEx = W('B02', 11);
  const keys = '300000'.split('').map((d, i) => div('key', $('#keys'), d, `left:${i * 148}px`));
  const bal = $('#balBig');
  tl.set(bal, { textContent: '$0.00' }, 0);
  const typed = ['$3', '$30', '$300', '$3,000', '$30,000', '$300,000'];
  keys.forEach((k, i) => {
    tl.set(k, { opacity: 0, y: 60 }, 0); tl.to(k, { opacity: 1, y: 0, duration: .22, ease: 'back.out(2)' }, S('type') + .05 + i * .05);
    const t = tTypes + i * ((tAcct - tTypes) / 6);
    tl.to(k, { y: 12, boxShadow: '0 0 0 #5f7268, 0 10px 20px rgba(0,0,0,.6)', background: 'linear-gradient(180deg,#b8ffd9,#3dff9a)', duration: .06 }, t);
    tl.to(k, { y: 0, boxShadow: '0 12px 0 #5f7268, 0 22px 40px rgba(0,0,0,.6)', background: 'linear-gradient(180deg,#e8f2ec,#b9cbc1)', duration: .12 }, t + .08);
    tl.set(bal, { textContent: typed[i] }, t + .02);
    cue(t, 'key', .7, -.5 + i * .2, { f: 700 + i * 80 });
  });
  tl.set(bal, { textContent: '$300,000.00' }, tAcct);
  tl.to(bal, { scale: 1.12, duration: .14, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tAcct); cue(tAcct, 'ding', .8);
  tl.set('#txRow', { opacity: 0, y: 30 }, 0); tl.to('#txRow', { opacity: 1, y: 0, duration: .3, ease: 'power3.out' }, tAcct + .2);
  tl.to('#keys', { opacity: 0, y: 60, duration: .3, ease: 'power2.in' }, tAnd);
  // …just… exists: a breath, then the number blooms
  tl.to('#phone', { scale: 1.05, duration: tEx - tAnd, ease: 'sine.inOut', transformOrigin: '50% 40%' }, tAnd);
  tl.to(bal, { textShadow: '0 0 30px rgba(61,255,154,1), 0 0 90px rgba(61,255,154,.8), 0 6px 0 rgba(0,40,20,.9)', duration: .5 }, tJust);
  for (let i = 0; i < 30; i++) {
    const p = div('sp', $('#spark'), null, `left:540px;top:${430}px`);
    const a = rnd() * 6.283, d = 160 + rnd() * 320;
    tl.set(p, { opacity: 0 }, 0); tl.set(p, { opacity: 1 }, tEx);
    tl.to(p, { x: Math.cos(a) * d, y: Math.sin(a) * d * .7, opacity: 0, duration: .8 + rnd() * .4, ease: 'power2.out' }, tEx);
  }
  center('#newMoney'); R.slam('#newMoney', tEx - .1, 2.2, .2); cue(tEx + .1, 'impact', .8); R.shake(tEx + .1, 14, .3); R.flash(tEx + .1, .3, .4, '#d8ffe9');
}

/* ---------- 3 · MYTH: the textbook cascade … "a misconception" ---------- */
{
  through('myth');
  const tHeard = W('B03', 2), tYou = W('B03', 6), tDep = W('B03', 8), tBank = W('B03', 10), tKeep = W('B03', 12), tLends = W('B03', 14), tRest = W('B03', 17);
  const tBoE = W('B04', 1), tCalls = W('B04', 4), tMis = W('B04', 7);
  R.up('#mythK', tHeard - .1, .35, 20);
  tl.set('#bDep', { opacity: 0, y: -60 }, 0); tl.to('#bDep', { opacity: 1, y: 0, duration: .35, ease: 'back.out(1.6)' }, tYou); cue(tYou, 'drop', .6);
  R.count('#bDep .big', tDep - .1, .6, 0, 10000, usd, 'power3.out'); cue(tDep - .1, 'counter', .4, 0, { dur: .6 });
  R.draw('#aDown', tDep + .5, .3);
  R.pop('#bBank', tBank - .1, .35, .5); cue(tBank - .1, 'pop', .6);
  tl.set('#bKeep', { opacity: 0, x: 200, y: -150, scale: .5 }, 0);
  tl.to('#bKeep', { opacity: 1, x: 0, y: 0, scale: 1, duration: .4, ease: 'power3.out' }, tKeep - .05); cue(tKeep - .05, 'swoosh', .5, -.5);
  tl.set('#bLend', { opacity: 0, x: -200, y: -150, scale: .5 }, 0);
  tl.to('#bLend', { opacity: 1, x: 0, y: 0, scale: 1, duration: .4, ease: 'power3.out' }, tLends - .05); cue(tLends - .05, 'swoosh', .5, .5);
  // the "multiplier" chain runs away on its own: 9,000 → 8,100 → 7,290 → …, total races to $100,000
  const vals = [9000, 8100, 7290, 6561, 5905], chain = $('#chain'); let x = 0;
  vals.forEach((v, i) => {
    const b = div('chainbox', chain, (i ? '→ ' : '') + usd(v), `left:${x}px;font-size:${32 - i * 2}px`); x += 196 - i * 10;
    const t = tRest - .2 + i * .2;
    tl.set(b, { opacity: 0, y: 30 }, 0); tl.to(b, { opacity: 1 - i * .12, y: 0, duration: .2, ease: 'power3.out' }, t); cue(t, 'blip', .4, -.6 + i * .3, { f: 900 + i * 120 });
  });
  const dots = div('chainbox', chain, '…', `left:${x}px;border-color:transparent;background:none`);
  tl.set(dots, { opacity: 0 }, 0); tl.to(dots, { opacity: 1, duration: .2 }, tRest + .8);
  tl.set('#totRow', { opacity: 0 }, 0); tl.to('#totRow', { opacity: 1, duration: .25 }, tRest - .1);
  R.count('#totN', tRest - .1, tBoE - tRest + .3, 10000, 100000, usd, 'power2.inOut'); cue(tRest - .1, 'counter', .45, 0, { dur: tBoE - tRest + .3 });
  // Bank of England card, then the stamp — and the cascade cracks and falls
  tl.set('#boe', { opacity: 0, y: -40, rotation: 4 }, 0);
  tl.to('#boe', { opacity: 1, y: 0, rotation: -2, duration: .35, ease: 'back.out(1.6)' }, tBoE - .1); cue(tBoE - .1, 'paper', .6, .5);
  tl.to('#casc', { opacity: .55, duration: .3 }, tCalls);
  center('#misc'); R.slam('#misc', tMis - .1, 2.6, .22); cue(tMis + .12, 'stamp', 1); R.shake(tMis + .12, 24, .4); R.flash(tMis + .12, .25, .35, '#ffd0c8');
  ['#bDep', '#bBank', '#bKeep', '#bLend', '#chain', '#totRow'].forEach((s, i) => {
    tl.to(s, { y: 900, rotation: (i % 2 ? 1 : -1) * (12 + i * 4), opacity: 0, duration: .8, ease: 'power2.in' }, tMis + .35 + i * .05);
  });
  cue(tMis + .4, 'crash', .7);
}

/* ---------- 4 · QUOTE: a loan creates a matching deposit ---------- */
{
  through('quote');
  const q = 'Whenever a bank makes a loan, it simultaneously creates a matching deposit…'.split(' ');
  // spoken: In(0) their(1) words:(2) whenever(3) a(4) bank(5) makes(6) a(7) loan,(8) it(9) creates(10) a(11) matching(12) deposit.(13)
  const at = [3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13];
  const host = $('#qText');
  q.forEach((w, i) => {
    const s = document.createElement('span'); s.textContent = w + ' '; s.style.display = 'inline-block'; s.style.whiteSpace = 'pre'; host.appendChild(s);
    if (/creates|matching|deposit/.test(w)) { s.style.color = '#0c7a45'; s.style.fontStyle = 'italic'; }
    const t = W('B05', at[i]) - .05 + (i === 8 ? .12 : 0);
    tl.set(s, { opacity: 0, y: 16 }, 0); tl.to(s, { opacity: 1, y: 0, duration: .18, ease: 'power2.out' }, t);
  });
  tl.set('#qCard', { opacity: 0, y: 60, rotation: -1.5 }, 0); tl.to('#qCard', { opacity: 1, y: 0, rotation: 0, duration: .4, ease: 'power3.out' }, S('quote') + .05); cue(S('quote') + .05, 'paper', .6);
  R.up('#qAttr', W('B05', 2), .3, 10);
  cue(W('B05', 3), 'type', .35, 0, { dur: VE('B05') - W('B05', 3) });
  // the balance sheet: both sides appear at the same instant
  const tCr = W('B05', 10), tDep = W('B05', 13);
  tl.set('#tAcc', { opacity: 0 }, 0); tl.to('#tAcc', { opacity: 1, duration: .3 }, tCr - .3);
  tl.set('#tL, #tR', { opacity: 0, scale: .6 }, 0);
  tl.to('#tL, #tR', { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, tDep - .05); cue(tDep - .05, 'impact', .6); cue(tDep - .05, 'ding', .6);
  R.pop('#tEq', tDep + .25, .3, .3);
  tl.to('#tL .mono, #tR .mono', { scale: 1.1, duration: .16, yoyo: true, repeat: 1 }, tDep + .3);
  push('#qCard', 'quote', 1.03);
}

/* ---------- 5 · ZERO: the 10% rule has been 0% since 2020 ---------- */
{
  through('zero');
  const t10 = W('B06', 2), tAm = W('B06', 5), tReq = W('B06', 8), tZero = W('B06', 11), tSince = W('B06', 12), t2020 = W('B06', 13);
  const ticks = $('#dialTicks');
  // scale: 0% at the left end … 10% at the top … 20% at the right end
  const ang = p => Math.PI - (p / 20) * Math.PI;
  for (let p = 0; p <= 20; p += 2) {
    const a = ang(p), r1 = 300, r2 = p % 10 ? 270 : 250;
    svgEl('line', { x1: 400 + Math.cos(a) * r1, y1: 420 - Math.sin(a) * r1, x2: 400 + Math.cos(a) * r2, y2: 420 - Math.sin(a) * r2, stroke: '#b8ffd9', 'stroke-width': p % 10 ? 4 : 8 }, ticks);
    if (p % 10 === 0) { const tx = svgEl('text', { x: 400 + Math.cos(a) * 205, y: 432 - Math.sin(a) * 205, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono', 'font-weight': 800, 'font-size': 40, fill: '#b8ffd9' }, ticks); tx.textContent = p + '%'; }
  }
  const nd = $('#needle');
  tl.set(nd, { rotation: -90, svgOrigin: '400 420' }, 0);
  tl.to(nd, { rotation: 0, duration: .6, ease: 'back.out(1.6)', svgOrigin: '400 420' }, t10 - .25); cue(t10 - .25, 'swoosh', .5);
  R.pop('#pctBig', t10, .3, .5); cue(t10, 'pop', .6);
  tl.to(nd, { rotation: 4, duration: .25, yoyo: true, repeat: 3, ease: 'sine.inOut', svgOrigin: '400 420' }, t10 + .6);
  // calendar flips on "America … since 2020"
  tl.set('#cal', { opacity: 0, rotationX: -90, transformPerspective: 900, transformOrigin: '50% 0%' }, 0);
  tl.to('#cal', { opacity: 1, rotationX: 0, duration: .4, ease: 'back.out(1.6)' }, tAm); cue(tAm, 'paper', .5);
  // zero: the needle drops to 0, the number crashes down
  tl.to(nd, { rotation: -90, duration: .35, ease: 'power3.in', svgOrigin: '400 420' }, tZero - .2);
  cue(tZero + .15, 'clunk', 1); R.shake(tZero + .15, 18, .3);
  tl.to('#pctBig', { y: 30, opacity: 0, duration: .12, ease: 'power2.in' }, tZero - .05);
  tl.set('#pctBig', { textContent: '0%', y: -40 }, tZero + .08);
  tl.to('#pctBig', { y: 0, opacity: 1, duration: .14, ease: 'power3.out' }, tZero + .08);
  tl.to('#pctBig', { color: '#ffe1dc', textShadow: '0 0 14px rgba(255,74,61,.95), 0 0 50px rgba(255,74,61,.6)', duration: .3 }, tZero + .1);
  tl.to('#dialArc', { opacity: .05, duration: .3 }, tZero + .1);
  tl.to('#cal', { scale: 1.12, duration: .18, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t2020); cue(t2020, 'ding', .45);
  R.up('#fedNote', tSince, .3, 10);
  tl.to('#dial', { y: -10, duration: tReq - tAm, ease: 'sine.inOut' }, tAm);
}

/* ---------- 6 · ISNEW: not from savers — your loan IS the new money ---------- */
{
  through('isnew');
  const tSo = W('B07', 0), tLoan = W('B07', 2), tSav = W('B07', 6), tYour = W('B07', 7), tIs = W('B07', 9), tNew = W('B07', 11), tMon = W('B07', 12);
  const pigSVG = '<svg viewBox="0 0 220 200" style="width:220px;height:200px"><ellipse cx="110" cy="110" rx="90" ry="70" fill="#f2b8c6"/><circle cx="190" cy="104" r="26" fill="#f2b8c6"/><ellipse cx="200" cy="106" rx="12" ry="10" fill="#d98aa0"/><circle cx="160" cy="84" r="7" fill="#3a1f27"/><path d="M80,48 L96,24 L110,50 Z" fill="#e7a2b4"/><rect x="66" y="160" width="22" height="34" rx="6" fill="#e7a2b4"/><rect x="132" y="160" width="22" height="34" rx="6" fill="#e7a2b4"/><rect x="92" y="38" width="44" height="10" rx="5" fill="#3a1f27"/></svg>';
  const pigs = [0, 1, 2].map(i => div('pig', $('#pigs'), pigSVG, `left:${100 + i * 330}px`));
  pigs.forEach((p, i) => { tl.set(p, { opacity: 0, y: -60 }, 0); tl.to(p, { opacity: 1, y: 0, duration: .3, ease: 'back.out(2)' }, tSo - .05 + i * .1); cue(tSo - .05 + i * .1, 'boing', .4, i - 1); });
  ['#p1', '#p2', '#p3'].forEach((p, i) => R.draw(p, tLoan - .1 + i * .06, .4));
  tl.to('#p1, #p2, #p3', { attr: { 'stroke-dashoffset': -60 }, duration: 1.2, ease: 'none' }, tLoan + .4);
  tl.set('#docWrap', { opacity: 0, y: 60 }, 0); tl.to('#docWrap', { opacity: 1, y: 0, duration: .35, ease: 'power3.out' }, tLoan - .1); cue(tLoan - .1, 'paper', .5);
  // cut the pipes on "savers"
  tl.to('#p1, #p2, #p3', { stroke: '#ff4a3d', opacity: .25, duration: .2 }, tSav + .05);
  R.slam('#cutX', tSav, 1.8, .18); cue(tSav + .15, 'snip', .9); R.shake(tSav + .15, 10, .2);
  tl.to('#pigs', { opacity: .3, duration: .3 }, tSav + .2);
  tl.to('#cutX', { opacity: 0, y: -40, duration: .25 }, tYour - .1);
  // the loan document flips over: it IS the new money
  tl.set('#doc', { rotationY: 0 }, 0);
  tl.to('#doc', { rotationY: 180, duration: .55, ease: 'power3.inOut' }, tIs - .05); cue(tIs - .05, 'flip', .7);
  tl.to('#docWrap', { scale: 1.1, duration: .3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tNew); cue(tMon, 'impact', .6); R.flash(tMon, .2, .4, '#d8ffe9');
}

/* ---------- 7 · PCT: 97% of Britain's money isn't cash ---------- */
{
  through('pct');
  const t97 = W('B08', 2), tBrit = W('B08', 4), tCash = W('B08', 7), tNums = W('B08', 9), tAcc = W('B08', 12);
  const host = $('#sq'); const cells = [];
  for (let i = 0; i < 100; i++) cells.push(div('sqc' + (i >= 97 ? ' cash' : ''), host, String((i * 37) % 10) + String((i * 91) % 10), `left:${(i % 10) * 75}px;top:${Math.floor(i / 10) * 75}px`));
  cells.forEach((c, i) => { tl.set(c, { opacity: 0, scale: .4 }, 0); tl.to(c, { opacity: 1, scale: 1, duration: .14, ease: 'back.out(2)' }, S('pct') + .05 + (i % 10) * .02 + Math.floor(i / 10) * .02); });
  cue(S('pct') + .05, 'stream', .45, 0, { dur: .4 });
  // 97 cells light up green in a wave as the counter climbs
  R.count('#pctN', t97 - .05, .9, 0, 97, v => Math.round(v) + '%', 'power2.out'); cue(t97 - .05, 'counter', .5, 0, { dur: .9 });
  cells.slice(0, 97).forEach((c, i) => {
    const t = t97 - .05 + .9 * Math.pow(i / 96, 1.4);
    tl.to(c, { background: 'rgba(61,255,154,.45)', borderColor: '#3dff9a', color: 'rgba(3,20,12,.85)', duration: .12 }, t);
  });
  tl.to('#pctN', { scale: 1.1, duration: .15, yoyo: true, repeat: 1 }, t97 + .9);
  R.up('#labDep', tBrit, .3, 20); R.up('#ukNote', tBrit + .2, .3, 10);
  // "isn't cash": the three paper notes pulse
  cells.slice(97).forEach((c, i) => tl.to(c, { scale: 1.3, boxShadow: '0 0 30px #f2efe6', duration: .18, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tCash - .05 + i * .08));
  R.up('#labCash', tCash - .05, .3, 20); cue(tCash - .05, 'paper', .5, .5);
  // "numbers in bank accounts": the digits roll inside every green cell
  cells.slice(0, 97).forEach((c, i) => {
    const t = tNums + (i % 13) * .04;
    tl.set(c, { textContent: String((i * 53 + 7) % 100).padStart(2, '0') }, t);
    tl.set(c, { textContent: String((i * 29 + 3) % 100).padStart(2, '0') }, t + .25);
  });
  cue(tNums, 'stream', .5, 0, { dur: tAcc - tNums + .3 });
  push('#sq', 'pct', 1.04);
}

/* ---------- 8 · DESTROY: paying the loan back destroys the money ---------- */
{
  through('destroy', { sfx: null });
  const tStr = W('B09', 3), tPart = W('B09', 4), tWhen = W('B09', 5), tPay = W('B09', 7), tBack = W('B09', 10), tMon = W('B09', 12), tDes = W('B09', 14);
  tl.to('#dim', { opacity: .5, duration: .3 }, S('destroy')); tl.to('#dim', { opacity: 0, duration: .4 }, tWhen - .2);
  cue(S('destroy') + .1, 'heartbeat', .9); cue(S('destroy') + 1.0, 'heartbeat', .7);
  [S('destroy') + .1, S('destroy') + 1.0].forEach((t, i) => {
    const ring = div('', $('[data-scene="destroy"]'), null, 'position:absolute;left:540px;top:560px;width:220px;height:220px;margin:-110px 0 0 -110px;border-radius:50%;border:8px solid rgba(61,255,154,.7)');
    tl.set(ring, { opacity: 0, scale: .3 }, 0);
    tl.to(ring, { opacity: .9, duration: .02 }, t).to(ring, { scale: 4, opacity: 0, duration: .8, ease: 'power2.out' }, t + .02);
  });
  R.up('#strangeT', S('destroy') + .1, .5, 30);
  tl.to('#strangeT', { scale: 1.06, duration: tWhen - S('destroy'), ease: 'sine.inOut' }, S('destroy') + .5);
  tl.set('#dCard', { opacity: 0, x: -120 }, 0); tl.to('#dCard', { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, tWhen - .1);
  tl.set('#lCard', { opacity: 0, x: 120 }, 0); tl.to('#lCard', { opacity: 1, x: 0, duration: .35, ease: 'power3.out' }, tWhen + .05); cue(tWhen + .05, 'swoosh', .4, .4);
  R.up('#cancelT', tPay + .35, .3, 15);
  center('#payArrow'); R.pop('#payArrow', tPay - .05, .3, .4); cue(tPay - .05, 'swoosh', .5);
  tl.to('#payArrow', { x: 40, duration: .3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tPay + .3);
  R.count('#dBal', tPay + .1, tDes - tPay - .2, 300000, 0, usd, 'power2.in'); R.count('#lBal', tPay + .1, tDes - tPay - .2, 300000, 0, usd, 'power2.in');
  cue(tPay + .1, 'counter', .5, 0, { dur: tDes - tPay - .2 });
  tl.to('#strangeT', { opacity: .35, duration: .3 }, tPay);
  // the digits disintegrate
  for (let i = 0; i < 80; i++) {
    const parts = i % 2 ? $('#lParts') : $('#dParts');
    const b = div('bit', parts, String(Math.floor(rnd() * 10)), `left:${80 + rnd() * 300}px;top:${140 + rnd() * 80}px;font-size:${22 + rnd() * 28}px;${i % 2 ? 'color:#ff8a7d;text-shadow:0 0 12px #ff4a3d' : ''}`);
    const t = tDes - .1 + rnd() * .25;
    tl.set(b, { opacity: 0 }, 0); tl.set(b, { opacity: 1 }, t);
    tl.to(b, { x: (rnd() - .5) * 700, y: -200 - rnd() * 500, rotation: (rnd() - .5) * 540, opacity: 0, duration: .9 + rnd() * .5, ease: 'power2.out' }, t);
  }
  tl.to('#dBal, #lBal', { opacity: 0, scale: 1.3, filter: 'blur(10px)', duration: .3 }, tDes - .1);
  tl.to('#cancelT', { opacity: 0, duration: .2 }, tDes); cue(tDes - .1, 'dissolve', .9);
  center('#destroyed'); R.slam('#destroyed', tDes + .1, 2.4, .2); cue(tDes + .3, 'impact', 1); R.shake(tDes + .3, 22, .4);
  tl.to('#payArrow', { opacity: 0, duration: .2 }, tDes);
}

/* ---------- 9 · LIMITS: not unlimited — rates and regulators ---------- */
{
  through('limits');
  const tNot = W('B10', 1), tUnl = W('B10', 2), tInt = W('B10', 3), tReg = W('B10', 6), tKeep = W('B10', 7), tChk = W('B10', 10);
  const flow = $('#flowIn'); flow.textContent = ('$ 1 0 0 0 0 $ 2 5 0 0 0 $ 9 9 0 0 $ '.repeat(12));
  tl.set(flow, { x: -1600 }, 0);
  tl.to(flow, { x: -400, duration: tKeep - S('limits'), ease: 'none' }, S('limits'));
  tl.to(flow, { x: -300, duration: E('limits') - tKeep, ease: 'power3.out' }, tKeep);       // the flow slows once it's clamped
  tl.set('#infT', { opacity: 0, scale: .6 }, 0); tl.to('#infT', { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, tNot - .2);
  tl.set('#infX', { scaleX: 0 }, 0); tl.to('#infX', { scaleX: 1, duration: .16, ease: 'power2.out' }, tUnl + .1); cue(tUnl + .1, 'slash', .7);
  tl.set('#clampA', { y: -900 }, 0); tl.to('#clampA', { y: 0, duration: .3, ease: 'power3.in' }, tInt - .2); cue(tInt + .1, 'clunk', .8, -.3); R.shake(tInt + .1, 10, .2);
  tl.set('#clampB', { y: -900 }, 0); tl.to('#clampB', { y: 0, duration: .3, ease: 'power3.in' }, tReg - .2); cue(tReg + .1, 'clunk', .8, .3); R.shake(tReg + .1, 10, .2);
  center('#labA'); center('#labB'); R.up('#labA', tInt + .1, .25, 20); R.up('#labB', tReg + .1, .25, 20);
  tl.to('#flow', { scaleY: .45, duration: .4, ease: 'power2.out' }, tKeep);
  center('#pipeL'); R.up('#pipeL', S('limits') + .1, .3, 20);
  center('#inCheck'); R.slam('#inCheck', tChk - .1, 2, .2); cue(tChk + .1, 'stamp', .8);
}

/* ---------- 10 · OWES: someone owes it — and the door swings shut (back to frame 0) ---------- */
{
  through('owes', { last: true });
  const tBut = W('B11', 0), tAcct = W('B11', 5), tSome = W('B11', 6), tOwes = W('B11', 7), tIt = W('B11', 8);
  tl.set('#oCard', { opacity: 0, scale: .9 }, 0); tl.to('#oCard', { opacity: 1, scale: 1, duration: .35, ease: 'back.out(1.6)' }, tBut);
  tl.to('#oCard', { boxShadow: '0 0 60px rgba(61,255,154,.5)', duration: .3 }, tAcct);
  tl.set('#iou1', { opacity: 0, y: 80, rotation: -14 }, 0); tl.to('#iou1', { opacity: 1, y: 0, rotation: -4, duration: .3, ease: 'back.out(1.8)' }, tSome - .1); cue(tSome - .1, 'paper', .6, -.4);
  tl.set('#iou2', { opacity: 0, y: 80, rotation: 14 }, 0); tl.to('#iou2', { opacity: 1, y: 0, rotation: 3, duration: .3, ease: 'back.out(1.8)' }, tOwes - .05); cue(tOwes - .05, 'paper', .6, .4);
  cue(tIt + .1, 'stamp', .7);
  // the door returns and swings shut: the last frame is frame 0
  const tShut = tIt + .65;
  tl.to('[data-scene="owes"]', { opacity: 0, duration: .35 }, tShut - .2);
  tl.set('#savers', { opacity: 0 }, tShut - .5);
  tl.set('#emptyT', { opacity: 0 }, tShut - .5);
  tl.to('#f0', { opacity: 1, duration: .3 }, tShut - .5);
  tl.set('#balPill', { y: 0, opacity: 1 }, tShut - .5);
  tl.to('#vdoor', { rotationY: 0, duration: .55, ease: 'power3.in' }, tShut - .3); cue(tShut + .25, 'clang', 1);
  tl.set('#wheel', { rotation: 180 }, tShut - .5);
  tl.to('#wheel', { rotation: 360, duration: Math.max(.3, TOTAL - tShut - .3), ease: 'power2.out', svgOrigin: '320 320' }, tShut + .25);
  R.shake(tShut + .25, 16, .3);
}

/* ================= polish pass: chapters + extra layers ================= */
{
  const lab = { hook: 'THE LOAN', type: 'THE KEYSTROKE', myth: 'THE MYTH', quote: 'THE SOURCE', zero: 'THE 10% RULE', isnew: 'THE TRUTH',
    pct: 'THE 97%', destroy: 'THE TWIST', limits: 'THE LIMITS', owes: 'THE IOU' };
  const ids = Object.keys(lab);
  ids.forEach((id, i) => {
    const c = div('chip', $('#chips'), `<b>${String(i + 1).padStart(2, '0')}</b>${lab[id]}`);
    const tin = i ? S(id) + .1 : .35, tout = i < ids.length - 1 ? E(id) - .15 : W('B11', 8) + .3;
    tl.set(c, { opacity: 0, y: -24, xPercent: -50 }, 0);
    tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, tin);
    tl.to(c, { opacity: 0, y: -24, duration: .15, ease: 'power2.in' }, tout);
  });
}
/* type: the vault-cash meter never moves while the balance appears */
{
  const tAcct = W('B02', 6), tEx = W('B02', 11);
  tl.set('#cashM', { opacity: 0, y: 40 }, 0); tl.to('#cashM', { opacity: 1, y: 0, duration: .3, ease: 'back.out(1.6)' }, W('B02', 1));
  tl.to('#cashV', { color: '#ffc640', scale: 1.2, duration: .15, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '0% 50%' }, tAcct + .15);
  cue(tAcct + .2, 'buzz', .35, -.3);
  tl.to('#cashM', { opacity: 0, y: 40, duration: .25 }, tEx - .3);
}
/* myth: the textbook title card fills the setup, then hands off to the cascade */
{
  const tYou = W('B03', 6);
  tl.set('#tbook', { opacity: 0, scale: .8, rotation: -3 }, 0);
  tl.to('#tbook', { opacity: 1, scale: 1, rotation: 0, duration: .4, ease: 'back.out(1.6)' }, S('myth') + .05); cue(S('myth') + .05, 'paper', .6);
  tl.to('#tbook', { scale: 1.04, duration: tYou - S('myth') - .5, ease: 'sine.inOut' }, S('myth') + .45);
  tl.to('#tbook', { opacity: 0, y: -260, scale: .4, duration: .3, ease: 'power2.in' }, tYou - .2);
}
/* isnew: coins drip from the piggy banks down the pipes… until the pipes are cut */
{
  const tLoan = W('B07', 2), tSav = W('B07', 6);
  const bz = (p, u) => { const m = 1 - u; return [m * m * m * p[0][0] + 3 * m * m * u * p[1][0] + 3 * m * u * u * p[2][0] + u * u * u * p[3][0], m * m * m * p[0][1] + 3 * m * m * u * p[1][1] + 3 * m * u * u * p[2][1] + u * u * u * p[3][1]]; };
  const P = [[[210, 30], [210, 160], [540, 120], [540, 270]], [[540, 30], [540, 120], [540, 180], [540, 270]], [[870, 30], [870, 160], [540, 120], [540, 270]]];
  let k = 0;
  for (let t = tLoan + .2; t < tSav - .1; t += .16) {
    const path = P[k % 3], c = div('', $('#coinsP'), null, 'left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6d0,#ffc640 50%,#a8700a);box-shadow:0 0 10px #ffc640');
    const pr = { u: 0 }, mv = () => { const [x, y] = bz(path, pr.u); c.style.transform = `translate(${x}px, ${y}px)`; };
    tl.set(c, { opacity: 0 }, 0);
    tl.to(c, { opacity: 1, duration: .08 }, t);
    tl.fromTo(pr, { u: 0 }, { u: 1, duration: .7, ease: 'power1.in', onUpdate: mv, onStart: mv, immediateRender: false }, t);
    tl.to(c, { opacity: 0, duration: .1 }, t + .62);
    if (k % 2 === 0) cue(t + .65, 'tick', .25, (k % 3 - 1) * .6, { f: 2600 });
    k++;
  }
}
/* owes: connect the account to both IOUs */
R.draw('#ol1', W('B11', 6) - .2, .25); R.draw('#ol2', W('B11', 7) - .15, .25);

R.captions($('#caps'));
R.finish('banks');
