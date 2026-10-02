/* The $1.50 Hot Dog — motion design. Every beat sits on a spoken word (W(id, k)). Frame 0 == last frame (loops). */
const R = RT_INIT();
const { tl, S, E, V, VE, W, rnd, $, div, cue, TOTAL } = R;
const NS = 'http://www.w3.org/2000/svg';
const svg = (html, css) => { const d = document.createElement('div'); d.className = 'abs'; d.innerHTML = html; if (css) d.style.cssText += css; return d; };
const put = (host, el) => { (typeof host === 'string' ? $(host) : host).appendChild(el); return el; };
const sc = id => $(`[data-scene="${id}"]`);
const center = sel => tl.set(sel, { xPercent: -50 }, 0);
const commas = v => Math.round(v).toLocaleString('en-US');
const MUST = '#ffcf3a', KET = '#e8322b', BUN = '#e9b872';
const through = (id, { first = false, last = false, sfx = 'whoosh' } = {}) => {
  const s = `[data-scene="${id}"]`;
  if (!first) { tl.set(s, { opacity: 0, scale: .94 }, 0); tl.to(s, { opacity: 1, scale: 1, duration: .3, ease: 'power3.out' }, S(id)); if (sfx) cue(S(id), sfx, .5); }
  if (!last) tl.to(s, { opacity: 0, scale: 1.06, duration: .24, ease: 'power2.in' }, E(id) - .24);
};
const pop = (el, t, from = .4, d = .32) => { tl.set(el, { opacity: 0, scale: from }, 0); tl.to(el, { opacity: 1, scale: 1, duration: d, ease: 'back.out(2)' }, t); };
const up = (el, t, y = 40, d = .32) => { tl.set(el, { opacity: 0, y }, 0); tl.to(el, { opacity: 1, y: 0, duration: d, ease: 'power3.out' }, t); };

// a hot dog + soda combo, drawn once and reused
const COMBO = (w = 520) => `<svg viewBox="0 0 520 400" style="width:${w}px;height:${w * 400 / 520}px;overflow:visible">
  <ellipse cx="220" cy="372" rx="200" ry="18" fill="rgba(0,0,0,.45)"/>
  <rect x="380" y="90" width="110" height="280" rx="14" fill="${KET}"/><rect x="380" y="150" width="110" height="60" fill="#fff" opacity=".9"/>
  <rect x="372" y="70" width="126" height="30" rx="10" fill="#f2efe6"/><rect x="430" y="10" width="12" height="70" rx="6" fill="#f2efe6"/>
  <path d="M30,250 Q30,190 90,190 L330,190 Q380,190 380,250 Q380,330 300,330 L110,330 Q30,330 30,250 Z" fill="${BUN}"/>
  <path d="M20,230 Q20,200 50,200 L350,200 Q385,200 385,232 Q385,262 350,262 L50,262 Q20,262 20,230 Z" fill="#b5462c"/>
  <path d="M50,226 Q90,204 130,226 T210,226 T290,226 T360,224" stroke="${MUST}" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M40,262 Q40,300 90,300 L330,300 Q372,300 372,262 Z" fill="#d9a35a"/></svg>`;

/* ================= world ================= */
(() => {
  const cv = $('#fx'), cx = cv.getContext('2d');
  const P = []; for (let i = 0; i < 90; i++) P.push({ x: rnd() * 1080, y: rnd() * 1920, s: 1 + rnd() * 3, sp: 10 + rnd() * 30, ph: rnd() * 6.3, c: rnd() < .5 ? '255,207,58' : '232,50,43' });
  const draw = t => { cx.clearRect(0, 0, 1080, 1920); for (const p of P) { let y = (p.y - t * p.sp) % 1920; if (y < 0) y += 1920; const f = Math.min(1, y / 200, (1920 - y) / 200); cx.fillStyle = `rgba(${p.c},${(.25 * f).toFixed(3)})`; cx.beginPath(); cx.arc(p.x + Math.sin(t * .5 + p.ph) * 14, y, p.s, 0, 6.28); cx.fill(); } };
  const pr = { t: 0 }; tl.fromTo(pr, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: 'none', data: 'drift', onUpdate: () => draw(pr.t) }, 0);
  tl.fromTo('#grid', { y: 0 }, { y: 90, duration: TOTAL, ease: 'none', data: 'drift' }, 0);
})();
// chapter chips
{
  const lab = { hook: 'THE DEAL', tripled: 'INFLATION', quote: 'THE THREAT', cost: 'THE FOOD COURT', how: 'THE QUESTION', fees: 'THE MONEY', renew: 'THE SECRET', bait: 'THE BAIT', outro: 'YOUR TURN' };
  Object.keys(lab).forEach((id, i, a) => {
    const c = div('chip', $('#chips'), `<b>${String(i + 1).padStart(2, '0')}</b>${lab[id]}`);
    tl.set(c, { opacity: 0, y: -24, xPercent: -50 }, 0);
    tl.to(c, { opacity: 1, y: 0, duration: .25, ease: 'back.out(2)' }, i ? S(id) + .1 : .35);
    tl.to(c, { opacity: 0, y: -24, duration: .15 }, i < a.length - 1 ? E(id) - .15 : TOTAL - 1.4);
  });
}

/* ================= frame 0: the combo + the $1.50 tag (also the last frame) ================= */
const f0 = put('#stage', svg(`<div style="position:absolute;left:280px;top:420px">${COMBO(520)}</div>
  <div id="tag0" class="abs" style="left:540px;top:830px;padding:18px 44px 14px;border-radius:24px;background:${MUST};color:#1a1204;font:900 130px/1 'Unbounded';box-shadow:0 0 70px rgba(255,207,58,.6)">$1.50</div>`, 'inset:0'));
center('#tag0');

/* ---------- 1 · HOOK: $1.50 since 1984 ---------- */
{
  const tCo = W('C01', 0), tP = W('C01', 10), tSince = W('C01', 11), tY = W('C01', 12);
  tl.to('#tag0', { rotation: -4, duration: .5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .02); cue(.05, 'pop', .4);
  tl.to(f0, { y: -150, scale: .78, duration: .5, ease: 'power3.inOut', transformOrigin: '50% 40%' }, tSince - .3);
  const yr = put(sc('hook'), svg(`<div class="kick" style="position:relative;width:1080px;color:#fff4d6">since</div><div id="yrN" class="mono greentx" style="font-size:150px;margin-top:10px">1984</div>`, 'left:0;top:880px;width:1080px;text-align:center'));
  up(yr, tSince - .1);
  R.count('#yrN', tY, 1.1, 1984, 2026, v => String(Math.round(v)), 'power2.inOut'); cue(tY, 'counter', .5, 0, { dur: 1.1 });
  const lock = put(sc('hook'), svg(`<div class="pill" style="position:relative;background:#111;border:3px solid ${MUST};color:${MUST};font-size:34px">PRICE: FROZEN</div>`, 'left:540px;top:1100px'));
  center(lock); pop(lock, tY + 1.0); cue(tY + 1.0, 'lock', .7);
  tl.to(f0, { opacity: 0, duration: .25 }, E('hook') - .25);
  through('hook', { first: true });
}

/* ---------- 2 · TRIPLED: everything else went up; the hot dog didn't ---------- */
{
  through('tripled');
  const tP = W('C02', 0), tTr = W('C02', 4), tHD = W('C02', 7), tNev = W('C02', 10);
  const host = sc('tripled');
  const ch = put(host, svg(`<svg viewBox="0 0 900 700" style="width:900px;height:700px;overflow:visible">
    <path d="M60,640 L880,640 M60,640 L60,40" stroke="rgba(255,244,214,.4)" stroke-width="4"/>
    <text x="60" y="690" fill="#fff4d6" font-family="JetBrains Mono" font-size="28">1984</text><text x="790" y="690" fill="#fff4d6" font-family="JetBrains Mono" font-size="28">2026</text>
    <path id="cpi" d="M60,600 C200,560 300,500 420,430 S640,260 880,110" stroke="${KET}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path id="flat" d="M60,600 L880,600" stroke="${MUST}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <text id="cpiL" x="440" y="110" fill="${KET}" font-family="Anton" font-size="46">EVERYTHING ELSE ×3</text>
    <text id="flatL" x="520" y="570" fill="${MUST}" font-family="Anton" font-size="46">HOT DOG $1.50</text></svg>`, 'left:90px;top:260px'));
  R.draw('#cpi', tP, tTr - tP + .4); cue(tP, 'riser', .4, 0, { dur: tTr - tP + .4 });
  pop('#cpiL', tTr, .5); cue(tTr, 'impact', .5);
  ['MOVIE TICKET ↑', 'GAS ↑', 'RENT ↑', 'GROCERIES ↑'].forEach((t, i) => {
    const g = put(host, svg(`<div class="tag" style="position:relative;font-size:30px;border-color:${KET};color:#ffd6d1">${t}</div>`, `left:${110 + (i % 2) * 300}px;top:${330 + i * 70}px`));
    up(g, tP + .3 + i * .22, 30, .25); cue(tP + .3 + i * .22, 'blip', .3, -.4 + i * .25, { f: 800 + i * 150 });
    tl.to(g, { y: -30, opacity: 0, duration: .3 }, tHD - .1);
  });
  R.draw('#flat', tHD - .2, .6); pop('#flatL', tNev - .1, .5); cue(tNev, 'stamp', .8); R.shake(tNev + .1, 10, .25);
  tl.to('#flat', { attr: { 'stroke-width': 20 }, duration: .2, yoyo: true, repeat: 1 }, tNev + .1);
}

/* ---------- 3 · QUOTE: the CEO asks; the founder answers ---------- */
{
  through('quote');
  const host = sc('quote');
  const t13 = W('C03', 1), tCEO = W('C03', 3), tFou = W('C03', 6), tRaise = W('C03', 11), tAns = W('C04', 1), tIf = W('C04', 2), tKill = W('C04', 11);
  const cal = put(host, svg(`<div class="paper" style="position:relative;width:280px;height:200px;overflow:hidden"><div style="height:56px;background:${KET};color:#fff;font:800 30px/56px 'Space Grotesk';text-align:center">YEAR</div><div class="big" style="text-align:center;font-size:70px;margin-top:24px;color:#101418">2013</div></div>`, 'left:420px;top:170px'));
  pop(cal, t13 - .1); cue(t13 - .1, 'paper', .5);
  const person = (x, label, hue) => put(host, svg(`<svg viewBox="0 0 200 300" style="width:200px;height:300px"><circle cx="100" cy="60" r="46" fill="${hue}"/><path d="M20,300 L34,150 Q100,118 166,150 L180,300 Z" fill="${hue}"/></svg><div class="tag" style="position:absolute;left:50%;top:310px;transform:translateX(-50%);font-size:28px">${label}</div>`, `left:${x}px;top:470px`));
  const ceo = person(130, 'CEO', '#c9b8a0'), fou = person(750, 'FOUNDER', '#e9d4b0');
  up(ceo, S('quote') + .15); up(fou, S('quote') + .3); tl.to(ceo, { y: -14, duration: .25, yoyo: true, repeat: 1 }, tCEO); tl.to(fou, { y: -14, duration: .25, yoyo: true, repeat: 1 }, tFou); cue(tCEO, 'pop', .4, -.5); cue(tFou, 'pop', .4, .5);
  const ask = put(host, svg(`<div class="paper" style="position:relative;padding:20px 28px;font:800 54px/1 'Unbounded';color:#101418">$1.75?</div>`, 'left:300px;top:400px'));
  pop(ask, tRaise - .1, .3); cue(tRaise - .1, 'bloop', .5, -.4, { f: 600 });
  tl.to([ceo, ask], { opacity: .35, duration: .3 }, tAns);
  // the founder's answer, word by word
  const q = put(host, svg(`<div class="paper" style="position:relative;padding:34px 40px;border:6px solid ${KET}"><div id="qT" class="serif" style="font-size:64px;line-height:1.12;color:#101418;text-align:left"></div><div style="margin-top:16px;font:700 26px/1 'JetBrains Mono';color:#6b6457;text-align:right">— the founder, 2013</div></div>`, 'left:90px;top:860px;width:900px'));
  up(q, tIf - .25, 40, .3);
  const words = 'If you raise the effing hot dog, I will kill you.'.split(' ');
  words.forEach((w, i) => { const sp = document.createElement('span'); sp.textContent = w + ' '; sp.style.cssText = 'display:inline-block;white-space:pre'; if (/kill|you\./.test(w)) sp.style.color = KET; $('#qT').appendChild(sp);
    tl.set(sp, { opacity: 0, y: 12 }, 0); tl.to(sp, { opacity: 1, y: 0, duration: .14 }, W('C04', i + 2) - .03); });
  cue(tKill, 'impact', .7); R.shake(tKill + .05, 14, .3);
  tl.to(fou, { scale: 1.08, duration: .2, yoyo: true, repeat: 1, transformOrigin: '50% 100%' }, tKill);
  const no = put(host, svg(`<div class="stamp red" style="position:relative;font-size:70px">PRICE STAYS</div>`, 'left:540px;top:1080px'));
  center(no); tl.set(no, { opacity: 0, scale: 2, rotation: -8 }, 0); tl.to(no, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, VE('C04') + .05);
}

/* ---------- 4 · COST: little or nothing on the food court ---------- */
{
  through('cost');
  const host = sc('cost'), tLit = W('C05', 4), tNo = W('C05', 6), tFood = W('C05', 9);
  const sign = put(host, svg(`<div style="position:relative;padding:22px 50px;border-radius:20px;background:${KET};color:#fff;font:400 90px/1 'Anton';letter-spacing:6px;box-shadow:0 0 60px rgba(232,50,43,.5)">FOOD COURT</div>`, 'left:540px;top:220px'));
  center(sign); pop(sign, S('cost') + .05, .6); cue(S('cost') + .1, 'ding', .5);
  put(host, svg(`<div style="position:absolute;left:330px;top:450px">${COMBO(400)}</div>`, 'left:0;top:0'));
  const meter = put(host, svg(`<svg viewBox="0 0 800 420" style="width:800px;height:420px;overflow:visible"><path d="M80,380 A320,320 0 0 1 720,380" stroke="rgba(255,244,214,.18)" stroke-width="56" fill="none"/>
    <path d="M80,380 A320,320 0 0 1 400,60" stroke="${KET}" stroke-width="56" fill="none" opacity=".5"/><path d="M400,60 A320,320 0 0 1 720,380" stroke="${MUST}" stroke-width="56" fill="none" opacity=".5"/>
    <text x="70" y="430" fill="#fff4d6" font-family="JetBrains Mono" font-size="30">$0</text><text x="640" y="430" fill="#fff4d6" font-family="JetBrains Mono" font-size="30">PROFIT</text>
    <g id="ndl"><path d="M400,380 L400,110" stroke="#fff" stroke-width="16" stroke-linecap="round"/><circle cx="400" cy="380" r="30" fill="#fff"/></g></svg>`, 'left:140px;top:760px'));
  up(meter, W('C05', 1), 40);
  tl.set('#ndl', { rotation: 40, svgOrigin: '400 380' }, 0);
  tl.to('#ndl', { rotation: -82, duration: .7, ease: 'back.out(1.4)', svgOrigin: '400 380' }, tLit - .2); cue(tLit - .2, 'swoosh', .5);
  tl.to('#ndl', { rotation: -78, duration: .1, yoyo: true, repeat: 5, svgOrigin: '400 380' }, tNo + .3); cue(tNo + .2, 'buzz', .4);
}

/* ---------- 5 · HOW: then how does it make billions? ---------- */
{
  through('how');
  const host = sc('how'), tStore = W('C06', 4), tBil = W('C06', 11);
  const store = put(host, svg(`<svg viewBox="0 0 700 420" style="width:700px;height:420px"><rect x="40" y="120" width="620" height="280" fill="#2a2a32"/><path d="M20,130 L350,20 L680,130 Z" fill="${KET}"/><rect x="290" y="250" width="120" height="150" fill="#14141a"/><g fill="${MUST}" opacity=".85"><rect x="90" y="190" width="140" height="80"/><rect x="470" y="190" width="140" height="80"/></g><text x="350" y="105" text-anchor="middle" font-family="Anton" font-size="44" fill="#fff">WAREHOUSE</text></svg>`, 'left:190px;top:240px'));
  up(store, S('how') + .05, 60); cue(S('how') + .05, 'thud', .5);
  const big = put(host, svg(`<div class="big greentx" style="font-size:150px">BILLIONS?</div>`, 'left:540px;top:760px'));
  center(big); tl.set(big, { opacity: 0, scale: 2.2 }, 0); tl.to(big, { opacity: 1, scale: 1, duration: .22, ease: 'power4.in' }, tBil - .12); cue(tBil + .1, 'impact', .8); R.shake(tBil + .1, 16, .3);
  for (let i = 0; i < 18; i++) { const c = div('', host, null, `left:540px;top:640px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6d0,${MUST} 50%,#a8700a)`);
    const a = rnd() * 6.28, d = 220 + rnd() * 320; tl.set(c, { opacity: 0 }, 0); tl.set(c, { opacity: 1 }, tBil + .1); tl.to(c, { x: Math.cos(a) * d, y: Math.sin(a) * d * .7, opacity: 0, rotation: 360, duration: .9, ease: 'power2.out' }, tBil + .1); }
}

/* ---------- 6 · FEES: $10.4B operating profit; $5.3B from one thing ---------- */
{
  through('fees');
  const host = sc('fees'), t104 = W('C07', 4), tOp = W('C07', 7), t53 = W('C07', 9), tOne = W('C07', 15);
  const kick = put(host, svg(`<div class="kick" style="position:relative;width:1080px;color:#fff4d6">operating profit · fiscal 2025</div>`, 'left:0;top:200px')); up(kick, S('fees') + .05, 20);
  const n = put(host, svg(`<div id="opN" class="big greentx" style="font-size:150px">$0</div>`, 'left:540px;top:260px')); center(n);
  tl.set(n, { opacity: 0 }, 0); tl.to(n, { opacity: 1, duration: .15 }, S('fees') + .05); tl.set('#opN', { textContent: '$?' }, S('fees') + .04);
  R.count('#opN', t104 - .1, .8, 0, 10.4, v => '$' + v.toFixed(1) + 'B', 'power3.out'); cue(t104 - .1, 'counter', .5, 0, { dur: .8 });
  const bar = put(host, svg(`<div style="position:relative;width:900px;height:200px;border-radius:24px;overflow:hidden;background:rgba(255,244,214,.08);border:3px solid rgba(255,244,214,.3)">
    <div id="barAll" style="position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(90deg,#8a6a1a,${MUST});transform-origin:0 50%"></div>
    <div id="barFee" style="position:absolute;left:0;top:0;width:51%;height:100%;background:repeating-linear-gradient(45deg,${KET} 0 24px,#c22a24 24px 48px);transform-origin:0 50%"></div>
    <div id="feeL" class="mono" style="position:absolute;left:30px;top:66px;font-size:64px;color:#fff">$5.3B</div></div>`, 'left:90px;top:520px'));
  tl.set('#barAll', { scaleX: 0 }, 0); tl.to('#barAll', { scaleX: 1, duration: .6, ease: 'power3.out' }, tOp - .1); cue(tOp - .1, 'slide', .5);
  tl.set('#barFee, #feeL', { scaleX: 0, opacity: 0 }, 0); tl.to('#barFee', { scaleX: 1, opacity: 1, duration: .5, ease: 'power3.out' }, t53 - .1); tl.to('#feeL', { opacity: 1, scaleX: 1, duration: .2 }, t53 + .2); cue(t53 - .1, 'impact', .6);
  const half = put(host, svg(`<div class="pill" style="position:relative;background:${KET};color:#fff;font-size:40px">≈ HALF OF ALL PROFIT</div>`, 'left:540px;top:770px')); center(half); pop(half, t53 + .5);
  const q = put(host, svg(`<div class="big" style="font-size:120px;color:#fff4d6">ONE THING:</div><div class="big greentx" style="font-size:200px;margin-top:10px">?</div>`, 'left:0;top:880px;width:1080px;text-align:center'));
  up(q, tOne - .3, 40); tl.to(q, { scale: 1.06, duration: .25, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, tOne + .2); cue(tOne, 'heartbeat', .7);
}

/* ---------- 7 · RENEW: membership fees; nine in ten renew ---------- */
{
  through('renew', { sfx: null });
  const host = sc('renew'), tMem = W('C08', 0), tNine = W('C08', 4), tRen = W('C08', 8), tEvery = W('C08', 9);
  cue(S('renew'), 'impact', .9); R.flash(S('renew') + .05, .35, .4, '#fff1c4');
  const card = put(host, svg(`<div style="position:relative;width:760px;height:460px;border-radius:36px;background:linear-gradient(135deg,#1d1d24,#3a3a46);border:4px solid ${MUST};box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 80px rgba(255,207,58,.35);overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:100%;height:110px;background:${KET}"></div>
    <div class="anton" style="position:absolute;left:44px;top:24px;font-size:64px;color:#fff;letter-spacing:4px">MEMBERSHIP</div>
    <div style="position:absolute;left:44px;top:150px;width:120px;height:90px;border-radius:14px;background:linear-gradient(135deg,#e9d38a,#b8912a)"></div>
    <div class="mono" style="position:absolute;left:44px;top:290px;font-size:44px;color:#fff4d6">MEMBER SINCE ••••</div>
    <div class="mono" style="position:absolute;left:44px;top:370px;font-size:34px;color:${MUST}">ANNUAL FEE PAID ✓</div></div>`, 'left:160px;top:200px'));
  tl.set(card, { opacity: 0, rotationY: -80, transformPerspective: 1400 }, 0); tl.to(card, { opacity: 1, rotationY: 0, duration: .5, ease: 'back.out(1.4)' }, tMem - .1);
  const ppl = put(host, svg('', 'left:110px;top:740px;width:860px;height:200px'));
  for (let i = 0; i < 10; i++) {
    const p = div('', ppl, `<svg viewBox="0 0 60 100" style="width:72px;height:120px"><circle cx="30" cy="20" r="16" fill="currentColor"/><path d="M4,100 L8,52 Q30,38 52,52 L56,100 Z" fill="currentColor"/></svg>`, `position:absolute;left:${i * 86}px;top:0;color:rgba(255,244,214,.25)`);
    pop(p, tNine - .3 + i * .03, .5, .2);
    if (i < 9) { tl.to(p, { color: MUST, duration: .12 }, tNine + .05 + i * .06); if (i % 3 === 0) cue(tNine + .05 + i * .06, 'tick', .35, -.5 + i * .1, { f: 1600 + i * 80 }); }
  }
  const lab = put(host, svg(`<div class="anton" style="font-size:96px;color:#fff4d6">9 IN 10 <span style="color:${MUST}">RENEW</span></div><div class="mono" style="font-size:30px;color:#c9b8a0;margin-top:10px">every single year</div>`, 'left:0;top:960px;width:1080px;text-align:center'));
  up(lab, tRen - .15, 30); cue(tRen, 'ding', .6);
  tl.to(card, { y: -12, duration: .5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tMem + .5);
}

/* ---------- 8 · BAIT: the hot dog is the reason you come back ---------- */
{
  through('bait');
  const host = sc('bait'), tProd = W('C09', 5), tReason = W('C09', 8), tBack = W('C09', 11);
  const dog = put(host, svg(`<div>${COMBO(440)}</div>`, 'left:320px;top:330px'));
  pop(dog, S('bait') + .05, .7);
  const x = put(host, svg(`<div class="stamp red" style="position:relative;font-size:64px">NOT THE PRODUCT</div>`, 'left:540px;top:230px')); center(x);
  tl.set(x, { opacity: 0, scale: 2, rotation: -6 }, 0); tl.to(x, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, tProd - .05); cue(tProd + .15, 'stamp', .8);
  // the loop: home → store → hot dog → renew → home
  const loop = put(host, svg(`<svg viewBox="0 0 900 360" style="width:900px;height:360px;overflow:visible"><path id="lp" d="M450,40 C800,40 800,320 450,320 C100,320 100,40 450,40" stroke="${MUST}" stroke-width="10" fill="none" stroke-dasharray="20 16"/>
    <g font-family="Anton" font-size="58" fill="#fff4d6" text-anchor="middle"><text x="450" y="24">VISIT</text><text x="830" y="190">HOT DOG</text><text x="450" y="370">RENEW</text><text x="70" y="190">REPEAT</text></g></svg>`, 'left:90px;top:800px'));
  R.draw('#lp', tReason - .2, .7); cue(tReason - .2, 'riser', .4, 0, { dur: .7 });
  tl.to('#lp', { attr: { 'stroke-dashoffset': -144 }, duration: E('bait') - tReason, ease: 'none' }, tReason + .5);
  tl.to(dog, { scale: 1.08, duration: .3, yoyo: true, repeat: 1, transformOrigin: '50% 60%' }, tBack);
}

/* ---------- 9 · OUTRO: it's already paid for → the question → back to frame 0 ---------- */
{
  through('outro', { last: true });
  const host = sc('outro'), tEnj = W('C10', 1), tPaid = W('C10', 7), tEnd = VE('C10');
  const dog = put(host, svg(`<div>${COMBO(480)}</div>`, 'left:300px;top:260px')); pop(dog, S('outro') + .05, .7);
  const paid = put(host, svg(`<div class="stamp green" style="position:relative;font-size:90px">PAID ✓</div>`, 'left:540px;top:560px')); center(paid);
  tl.set(paid, { opacity: 0, scale: 2.2, rotation: -8 }, 0); tl.to(paid, { opacity: 1, scale: 1, duration: .2, ease: 'power4.in' }, tPaid - .05); cue(tPaid + .15, 'stamp', 1); R.shake(tPaid + .15, 12, .25);
  const q = put(host, svg(`<div class="qcard" style="position:relative;left:0"><div class="anton" style="font-size:72px;color:#fff">IS THE MEMBERSHIP</div><div class="anton greentx" style="font-size:96px;margin-top:6px">WORTH IT?</div><div class="mono" style="font-size:34px;color:#fff4d6;margin-top:18px">YES or NO in the comments 👇</div></div>`, 'left:90px;top:860px;width:900px'));
  up(q, tEnd - .1, 60, .35); cue(tEnd - .1, 'whoosh', .5);
  tl.to(q, { scale: 1.04, duration: .3, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, tEnd + .4);
  // hand back to frame 0 for the loop
  tl.to(host, { opacity: 0, duration: .3 }, TOTAL - .45);
  tl.set(f0, { y: 0, scale: 1 }, TOTAL - .5); tl.to(f0, { opacity: 1, duration: .3 }, TOTAL - .45);
}

/* ================= polish pass: punch-ins, riders, extra detail ================= */
const punch = (t, a = 1.05) => { tl.to('#stage', { scale: a, duration: .12, ease: 'power2.out', transformOrigin: '50% 40%' }, t).to('#stage', { scale: 1, duration: .38, ease: 'power2.inOut' }, t + .12); };
const rider = (pathSel, host, t0, dur, n, html, gap) => {
  const p = $(pathSel), L = p.getTotalLength(), box = p.ownerSVGElement;
  for (let i = 0; i < n; i++) {
    const d = div('', host, html, 'left:0;top:0'), pr = { u: 0 };
    const mv = () => { const pt = p.getPointAtLength(pr.u * L), m = box.getScreenCTM(), hm = host.getScreenCTM ? null : host.getBoundingClientRect();
      const r = box.getBoundingClientRect(), hr = host.getBoundingClientRect(), vb = box.viewBox.baseVal, sx = r.width / vb.width, sy = r.height / vb.height;
      d.style.transform = `translate(${r.left - hr.left + pt.x * sx - 22}px, ${r.top - hr.top + pt.y * sy - 22}px)`; };
    const t = t0 + i * gap;
    tl.set(d, { opacity: 0 }, 0); tl.to(d, { opacity: 1, duration: .1 }, t);
    tl.fromTo(pr, { u: 0 }, { u: 1, duration: dur, ease: 'none', onUpdate: mv, onStart: mv, immediateRender: false }, t);
    tl.to(d, { opacity: 0, duration: .15 }, t + dur - .15);
  }
};
const src = (host, txt, t) => { const e = div('mono', host, txt, 'left:0;top:1176px;width:1080px;text-align:center;font-size:22px;color:rgba(255,244,214,.6);letter-spacing:2px'); tl.set(e, { opacity: 0 }, 0); tl.to(e, { opacity: 1, duration: .3 }, t); };

[[ 'C01', 10 ], [ 'C02', 4 ], [ 'C04', 11 ], [ 'C06', 11 ], [ 'C07', 9 ], [ 'C08', 0 ], [ 'C10', 7 ]].forEach(([id, k]) => punch(W(id, k)));
// inflation: a marker rides the "everything else" curve while a multiplier climbs to ×3
{
  const host = sc('tripled'), tP = W('C02', 0), tTr = W('C02', 4);
  rider('#cpi', host, tP + .05, tTr - tP + .35, 1, `<div style="width:44px;height:44px;border-radius:50%;background:${KET};box-shadow:0 0 24px ${KET};border:5px solid #fff"></div>`, 0);
  const mult = put(host, svg(`<div class="big" id="multN" style="font-size:110px;color:${KET};text-shadow:0 0 30px rgba(232,50,43,.6)">×1.0</div>`, 'left:600px;top:960px'));
  tl.set(mult, { opacity: 0 }, 0); tl.to(mult, { opacity: 1, duration: .2 }, tP);
  R.count('#multN', tP, tTr - tP + .35, 1, 3, v => '×' + v.toFixed(1), 'power1.in'); cue(tP, 'counter', .35, .3, { dur: tTr - tP + .35 });
  const hd = put(host, svg(`<div class="big" style="font-size:110px;color:${MUST};text-shadow:0 0 30px rgba(255,207,58,.6)">×1.0</div>`, 'left:140px;top:960px'));
  up(hd, W('C02', 7), 30);
  tl.to(hd, { x: 8, duration: .06, yoyo: true, repeat: 5 }, W('C02', 10)); 
}
// how: the food-court profit chip
{ const host = sc('how'); const c = put(host, svg(`<div class="tag" style="position:relative;font-size:34px;border-color:${KET};color:#ffd6d1">FOOD COURT PROFIT ≈ $0</div>`, 'left:540px;top:690px')); center(c); up(c, W('C06', 6) - .1, 20); cue(W('C06', 6), 'blip', .35, 0, { f: 700 }); }
// fees: source chip; the bar outline appears with the scene
src(sc('fees'), 'source: Costco Form 10-K, fiscal year ended Aug 31, 2025', W('C07', 4));
src(sc('renew'), 'membership fee revenue $5.3B · FY2025', W('C08', 1));
// bait: shoppers travel the loop forever
rider('#lp', sc('bait'), W('C09', 8) - .1, 2.2, 5, `<svg viewBox="0 0 60 100" style="width:44px;height:74px"><circle cx="30" cy="20" r="16" fill="${MUST}"/><path d="M4,100 L8,52 Q30,38 52,52 L56,100 Z" fill="${MUST}"/></svg>`, .35);

/* ================= assets pass: brand wordmarks + a drifting prop layer ================= */
const propLayer = (icons, n, alpha) => {
  const L = document.createElement('div'); L.className = 'abs'; L.style.cssText = 'inset:0;pointer-events:none'; L.dataset.drift = '1';
  $('#stage').parentNode.insertBefore(L, $('#stage'));
  for (let i = 0; i < n; i++) {
    const d = div('', L, icons[i % icons.length], `left:${(i * 197) % 1000 + rnd() * 60 - 20}px;top:${(i * 311) % 1700 + 120}px;opacity:${alpha * (.6 + rnd() * .6)};width:120px;height:120px`);
    d.dataset.drift = '1';
    const s = .6 + rnd() * .9; tl.set(d, { scale: s, rotation: (rnd() - .5) * 40 }, 0);
    // drift out and back over the whole Short, so the last frame matches frame 0 (loop)
    tl.to(d, { y: -(60 + rnd() * 120), x: (rnd() - .5) * 80, rotation: '+=' + ((rnd() - .5) * 60), duration: TOTAL / 2, ease: 'sine.inOut', yoyo: true, repeat: 1, data: 'drift' }, 0);
  }
};
const logoIn = (host, html, css, t, t2) => { const e = put(host, svg(html, css)); tl.set(e, { opacity: 0, scale: .6 }, 0); tl.to(e, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, t); if (t2) tl.to(e, { opacity: 0, duration: .2 }, t2); return e; };

const COSTCO = (w = 420) => `<svg viewBox="0 0 420 150" style="width:${w}px;height:${w * 150 / 420}px"><text x="210" y="92" text-anchor="middle" font-family="Anton" font-size="104" fill="#e31837" transform="skewX(-10) translate(16 0)" letter-spacing="2">COSTCO</text>
  <rect x="40" y="102" width="340" height="36" fill="#005daa"/><text x="210" y="130" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="28" fill="#fff" letter-spacing="10">WHOLESALE</text></svg>`;
const ICON = {
  cart: `<svg viewBox="0 0 120 120"><path d="M10,24 L28,24 L42,78 L96,78 L108,38 L34,38" stroke="#ffcf3a" stroke-width="8" fill="none" stroke-linejoin="round"/><circle cx="48" cy="96" r="9" fill="#ffcf3a"/><circle cx="90" cy="96" r="9" fill="#ffcf3a"/></svg>`,
  receipt: `<svg viewBox="0 0 120 120"><path d="M30,10 L90,10 L90,110 L80,102 L70,110 L60,102 L50,110 L40,102 L30,110 Z" fill="#f2efe6"/><g stroke="#b9b2a2" stroke-width="5"><path d="M42,32 L78,32 M42,50 L78,50 M42,68 L66,68"/></g></svg>`,
  tag: `<svg viewBox="0 0 120 120"><path d="M14,58 L58,14 L106,14 L106,62 L62,106 Z" fill="#e8322b"/><circle cx="86" cy="34" r="8" fill="#1c0807"/><text x="60" y="78" text-anchor="middle" font-family="Anton" font-size="34" fill="#fff" transform="rotate(-45 60 66)">$</text></svg>`,
  coin: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="#ffcf3a"/><circle cx="60" cy="60" r="34" fill="none" stroke="#a8700a" stroke-width="5"/><text x="60" y="76" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="40" fill="#a8700a">$</text></svg>`,
  dog: `<svg viewBox="0 0 120 120"><path d="M10,64 Q10,44 30,44 L90,44 Q110,44 110,64 Q110,84 90,84 L30,84 Q10,84 10,64 Z" fill="#e9b872"/><path d="M8,60 Q8,52 18,52 L102,52 Q112,52 112,60 Q112,68 102,68 L18,68 Q8,68 8,60 Z" fill="#b5462c"/><path d="M20,60 Q34,52 48,60 T76,60 T104,60" stroke="#ffcf3a" stroke-width="5" fill="none"/></svg>`,
  soda: `<svg viewBox="0 0 120 120"><rect x="38" y="24" width="44" height="86" rx="6" fill="#e8322b"/><rect x="34" y="16" width="52" height="12" rx="4" fill="#f2efe6"/><rect x="58" y="0" width="6" height="22" fill="#f2efe6"/></svg>`,
};
propLayer(Object.values(ICON), 22, .16);
// brand marks where the story names Costco
logoIn(sc('hook'), `<div style="padding:18px 26px;border-radius:22px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)">${COSTCO(360)}</div>`, 'left:338px;top:200px', W('C01', 0) - .05);
logoIn(sc('cost'), `<div style="padding:10px 16px;border-radius:16px;background:#fff">${COSTCO(220)}</div>`, 'left:812px;top:236px', S('cost') + .2);
logoIn(sc('how'), `<div style="padding:10px 18px;border-radius:16px;background:#fff">${COSTCO(250)}</div>`, 'left:415px;top:330px', S('how') + .15);
logoIn(sc('fees'), `<div style="padding:8px 14px;border-radius:14px;background:#fff">${COSTCO(200)}</div>`, 'left:440px;top:422px', S('fees') + .2);
logoIn(sc('renew'), `<div style="padding:6px 12px;border-radius:12px;background:#fff">${COSTCO(190)}</div>`, 'left:700px;top:250px', W('C08', 0));
logoIn(sc('outro'), `<div style="padding:10px 16px;border-radius:16px;background:#fff">${COSTCO(220)}</div>`, 'left:430px;top:150px', S('outro') + .1, TOTAL - .5);
// food-court menu board beside the meter (real combo contents)
{ const m = put(sc('cost'), svg(`<div style="width:300px;padding:22px;border-radius:18px;background:#111;border:3px solid #ffcf3a;font:700 30px/1.5 'JetBrains Mono';color:#fff4d6"><div style="color:#ffcf3a;font:400 40px/1 'Anton';margin-bottom:10px">COMBO</div>¼-lb beef hot dog<br>20 oz soda<br><span style="color:#ffcf3a;font-size:44px">$1.50</span></div>`, 'left:760px;top:430px'));
  up(m, W('C05', 2), 30); }

// a slow camera drift on every scene so no beat ever sits still
R.tim.scenes.forEach(x => { const h = sc(x.id); tl.fromTo(h, { y: 0 }, { y: -18, duration: E(x.id) - S(x.id), ease: 'sine.inOut', immediateRender: false }, S(x.id)); });

R.captions($('#caps'));
R.finish('hotdog');
