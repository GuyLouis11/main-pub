/* credit-score components: drawn props, bureau / lender marks (editorial), the 3D score gauge, file folders, filing walls,
   data streams, people grids and the phone mockup. All motion is placed on spoken words by the scene files. */
const NAVY = '#0a1120', AMBER = '#ffb347', VIOLET = '#9b7bff', MUTE = '#8390b5';
let UID = 0;

Object.assign(A, {
  equifax: (w = 360) => `<div style="display:inline-block;padding:${w * .05}px ${w * .09}px;border-radius:${w * .04}px;background:#fff"><div style="font:700 ${w * .16}px/1 'Space Grotesk';letter-spacing:${w * .012}px;color:#9e1b32">EQUIFAX</div></div>`,
  experian: (w = 360) => `<div style="display:inline-flex;align-items:center;gap:${w * .03}px;padding:${w * .05}px ${w * .07}px;border-radius:${w * .04}px;background:#fff"><svg viewBox="0 0 60 60" style="width:${w * .17}px;height:${w * .17}px"><circle cx="20" cy="18" r="12" fill="#af1685"/><circle cx="42" cy="22" r="9" fill="#6d2077"/><circle cx="24" cy="42" r="10" fill="#426da9"/><circle cx="45" cy="45" r="6" fill="#26478d"/></svg><div style="font:700 ${w * .15}px/1 'Space Grotesk';color:#1d4f91">experian</div></div>`,
  transunion: (w = 360) => `<div style="display:inline-block;padding:${w * .05}px ${w * .07}px;border-radius:${w * .04}px;background:#fff"><div style="font:700 ${w * .14}px/1 'Space Grotesk';color:#00a6ca">Trans<span style="color:#1a3c5e">Union</span></div></div>`,
  fico: (w = 260) => `<div style="display:inline-block;padding:${w * .06}px ${w * .12}px;border-radius:${w * .05}px;background:#fff"><div style="font:900 ${w * .26}px/1 'Unbounded';letter-spacing:${w * .01}px;color:#c8102e">FICO</div></div>`,
  karma: (w = 340) => `<div style="display:inline-block;padding:${w * .05}px ${w * .08}px;border-radius:${w * .05}px;background:#fff"><div style="font:700 ${w * .13}px/1 'Space Grotesk';color:#008600">credit karma</div></div>`,
  intuit: (w = 260) => `<div style="display:inline-block;padding:${w * .05}px ${w * .1}px;border-radius:${w * .05}px;background:#fff"><div style="font:900 ${w * .17}px/1 'Space Grotesk';letter-spacing:${w * .02}px;color:#236cff">INTUIT</div></div>`,
  fannie: (w = 300) => `<div style="display:inline-block;padding:${w * .05}px ${w * .08}px;border-radius:${w * .05}px;background:#fff"><div style="font:700 ${w * .14}px/1 'Space Grotesk';color:#0b3c7a">Fannie Mae</div></div>`,
  freddie: (w = 300) => `<div style="display:inline-block;padding:${w * .05}px ${w * .08}px;border-radius:${w * .05}px;background:#fff"><div style="font:700 ${w * .14}px/1 'Space Grotesk';color:#00703c">Freddie Mac</div></div>`,
  house: (w = 200, c = '#ffb347', lit = '#ffe9a8') => `<svg viewBox="0 0 200 180" style="width:${w}px;height:${w * .9}px;overflow:visible"><ellipse cx="100" cy="176" rx="96" ry="8" fill="rgba(0,0,0,.3)"/><path d="M20,86 L100,18 L180,86 Z" fill="#7a2e2e"/><rect x="34" y="84" width="132" height="90" fill="${c}"/><rect x="50" y="102" width="34" height="30" fill="${lit}"/><rect x="116" y="102" width="34" height="30" fill="${lit}"/><rect x="86" y="128" width="28" height="46" fill="#5a3418"/><rect x="140" y="30" width="16" height="36" fill="#5a2424"/></svg>`,
  car: (w = 260, c = '#4fc3ff') => `<svg viewBox="0 0 300 140" style="width:${w}px;height:${w * .47}px;overflow:visible"><ellipse cx="150" cy="136" rx="140" ry="6" fill="rgba(0,0,0,.3)"/><path d="M20,90 Q30,50 80,46 L120,20 L200,20 L240,50 Q284,56 286,90 L286,110 L20,110 Z" fill="${c}"/><rect x="128" y="30" width="60" height="22" rx="4" fill="#cfe9ff"/><rect x="88" y="34" width="34" height="18" rx="4" fill="#cfe9ff"/><circle cx="80" cy="112" r="24" fill="#120c24"/><circle cx="80" cy="112" r="9" fill="#9aa"/><circle cx="230" cy="112" r="24" fill="#120c24"/><circle cx="230" cy="112" r="9" fill="#9aa"/></svg>`,
  building: (w = 160, c = '#8fa3d9', floors = 6) => { let win = ''; for (let f = 0; f < floors; f++) for (let k = 0; k < 3; k++) win += `<rect x="${22 + k * 40}" y="${24 + f * 34}" width="24" height="20" fill="${(f + k) % 3 ? '#ffe9a8' : '#3a4670'}"/>`; return `<svg viewBox="0 0 160 ${40 + floors * 34}" style="width:${w}px;height:${w * (40 + floors * 34) / 160}px"><rect x="6" y="6" width="148" height="${34 + floors * 34}" fill="${c}"/>${win}</svg>`; },
  bank: (w = 200, c = '#e8e2cf') => `<svg viewBox="0 0 200 170" style="width:${w}px;height:${w * .85}px"><path d="M10,56 L100,8 L190,56 Z" fill="${c}"/><rect x="16" y="56" width="168" height="12" fill="${c}"/>${[0, 1, 2, 3].map(i => `<rect x="${30 + i * 40}" y="72" width="20" height="70" fill="${c}"/>`).join('')}<rect x="10" y="146" width="180" height="18" fill="${c}"/><text x="100" y="48" text-anchor="middle" font-family="Anton" font-size="28" fill="#7a6a3a">BANK</text></svg>`,
  brief: (w = 160, c = '#a0642c') => `<svg viewBox="0 0 160 130" style="width:${w}px;height:${w * .81}px"><rect x="56" y="8" width="48" height="26" rx="8" fill="none" stroke="${c}" stroke-width="10"/><rect x="6" y="30" width="148" height="94" rx="12" fill="${c}"/><rect x="6" y="64" width="148" height="8" fill="rgba(0,0,0,.25)"/><rect x="70" y="58" width="20" height="20" rx="4" fill="#ffd27a"/></svg>`,
  env: (w = 140, c = '#f5f1e6', s = '#c9b98f') => `<svg viewBox="0 0 140 92" style="width:${w}px;height:${w * .66}px"><rect x="2" y="2" width="136" height="88" rx="6" fill="${c}"/><path d="M2,6 L70,54 L138,6" fill="none" stroke="${s}" stroke-width="5"/></svg>`,
  hat: (w = 120, c = '#1a120a', body = true) => `<svg viewBox="0 0 120 200" style="width:${w}px;height:${w * 1.66}px;overflow:visible"><ellipse cx="60" cy="40" rx="50" ry="9" fill="${c}"/><path d="M30,40 Q30,6 60,6 Q90,6 90,40 Z" fill="${c}"/><rect x="30" y="30" width="60" height="7" fill="#7a5634"/><circle cx="60" cy="58" r="22" fill="${c}"/>${body ? `<path d="M14,200 L20,104 Q60,80 100,104 L106,200 Z" fill="${c}"/><path d="M60,96 L48,140 L60,200 L72,140 Z" fill="rgba(255,255,255,.08)"/>` : ''}</svg>`,
  phoneOld: (w = 180, c = '#1a1a1a') => `<svg viewBox="0 0 180 130" style="width:${w}px;height:${w * .72}px"><path d="M10,40 Q90,-10 170,40 L160,58 L120,46 L60,46 L20,58 Z" fill="${c}"/><path d="M40,60 L140,60 L160,124 L20,124 Z" fill="${c}"/><circle cx="90" cy="92" r="24" fill="#d8cfb8"/><circle cx="90" cy="92" r="8" fill="${c}"/></svg>`,
  gavel: (w = 220) => `<svg viewBox="0 0 220 160" style="width:${w}px;height:${w * .72}px;overflow:visible"><rect x="20" y="20" width="110" height="48" rx="10" fill="#8a5a2b" transform="rotate(-30 75 44)"/><rect x="88" y="40" width="120" height="16" rx="8" fill="#6b4320" transform="rotate(-30 75 44)"/><rect x="10" y="132" width="140" height="22" rx="6" fill="#6b4320"/></svg>`,
  dome: (w = 420, c = '#f1ead6') => `<svg viewBox="0 0 420 300" style="width:${w}px;height:${w * .71}px"><rect x="200" y="0" width="20" height="40" fill="${c}"/><path d="M120,150 Q120,40 210,40 Q300,40 300,150 Z" fill="${c}"/><rect x="104" y="150" width="212" height="16" fill="${c}"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${118 + i * 28}" y="170" width="12" height="70" fill="${c}"/>`).join('')}<rect x="0" y="240" width="420" height="20" fill="${c}"/><rect x="20" y="200" width="80" height="40" fill="${c}"/><rect x="320" y="200" width="80" height="40" fill="${c}"/><rect x="0" y="262" width="420" height="30" fill="${c}" opacity=".8"/></svg>`,
  piggy: (w = 200, c = '#ff8fb1') => `<svg viewBox="0 0 200 150" style="width:${w}px;height:${w * .75}px"><ellipse cx="96" cy="80" rx="76" ry="56" fill="${c}"/><circle cx="168" cy="72" r="22" fill="${c}"/><circle cx="174" cy="70" r="4" fill="#7a2a44"/><path d="M60,30 L74,10 L84,32 Z" fill="${c}"/><rect x="50" y="118" width="18" height="28" rx="6" fill="${c}"/><rect x="120" y="118" width="18" height="28" rx="6" fill="${c}"/><rect x="80" y="30" width="40" height="8" rx="4" fill="#7a2a44"/><circle cx="140" cy="64" r="5" fill="#2a1020"/></svg>`,
  paycheck: (w = 280) => `<div style="width:${w}px;padding:${w * .06}px;border-radius:${w * .04}px;background:#e9f5e1;border:3px dashed #5a8a4a;color:#244a1a;font:700 ${w * .07}px/1.3 'JetBrains Mono'"><div style="font:900 ${w * .09}px/1 'Space Grotesk'">PAYCHECK</div><div style="margin-top:${w * .04}px">PAY TO: YOU</div><div style="font-size:${w * .1}px;margin-top:${w * .02}px">$ ••,•••.••</div></div>`,
  lock: (w = 120, c = '#ffc640') => `<svg viewBox="0 0 120 140" style="width:${w}px;height:${w * 1.16}px"><path d="M30,64 L30,42 Q30,10 60,10 Q90,10 90,42 L90,64" fill="none" stroke="${c}" stroke-width="14"/><rect x="14" y="60" width="92" height="74" rx="12" fill="${c}"/><circle cx="60" cy="92" r="10" fill="#1a1204"/><rect x="56" y="96" width="8" height="22" fill="#1a1204"/></svg>`,
  snow: (w = 120, c = '#bfe8ff') => `<svg viewBox="0 0 120 120" style="width:${w}px;height:${w}px"><g stroke="${c}" stroke-width="9" stroke-linecap="round">${[0, 60, 120].map(r => `<g transform="rotate(${r} 60 60)"><path d="M60,8 L60,112"/><path d="M60,26 L46,14 M60,26 L74,14 M60,94 L46,106 M60,94 L74,106"/></g>`).join('')}</g></svg>`,
  shield: (w = 200, c = '#3dff9a') => `<svg viewBox="0 0 200 230" style="width:${w}px;height:${w * 1.15}px"><path d="M100,8 L186,40 L186,110 Q186,190 100,224 Q14,190 14,110 L14,40 Z" fill="${c}" opacity=".9"/><path d="M60,116 L90,146 L146,84" fill="none" stroke="#062a16" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  cross: (w = 120) => `<svg viewBox="0 0 120 120" style="width:${w}px;height:${w}px"><rect x="4" y="4" width="112" height="112" rx="20" fill="#fff"/><path d="M46,20 L74,20 L74,46 L100,46 L100,74 L74,74 L74,100 L46,100 L46,74 L20,74 L20,46 L46,46 Z" fill="#e8322b"/></svg>`,
  ftc: (w = 220) => `<svg viewBox="0 0 220 220" style="width:${w}px;height:${w}px"><circle cx="110" cy="110" r="104" fill="#13315c"/><circle cx="110" cy="110" r="88" fill="none" stroke="#e8d9a8" stroke-width="4"/><text x="110" y="100" text-anchor="middle" font-family="Anton" font-size="48" fill="#e8d9a8" letter-spacing="4">FTC</text><text x="110" y="134" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="15" fill="#e8d9a8" letter-spacing="2">FEDERAL TRADE</text><text x="110" y="154" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="15" fill="#e8d9a8" letter-spacing="2">COMMISSION</text></svg>`,
  mailbox: (w = 220, c = '#3a6fd8') => `<svg viewBox="0 0 220 260" style="width:${w}px;height:${w * 1.18}px;overflow:visible"><rect x="96" y="120" width="28" height="140" fill="#5a4a3a"/><path d="M20,130 L20,70 Q20,20 80,20 L160,20 Q200,20 200,70 L200,130 Z" fill="${c}"/><path d="M20,130 L20,70 Q20,20 70,20 Q110,20 110,70 L110,130 Z" fill="rgba(0,0,0,.2)"/><rect x="176" y="30" width="10" height="60" fill="#e8322b"/><rect x="176" y="30" width="34" height="20" fill="#e8322b"/></svg>`,
  server: (w = 160) => `<div style="width:${w}px;padding:${w * .06}px;border-radius:${w * .05}px;background:#1c2438;border:3px solid #3a4670">${[0, 1, 2, 3, 4].map(i => `<div style="height:${w * .14}px;margin:${w * .03}px 0;border-radius:6px;background:#2a3452;display:flex;align-items:center;gap:${w * .04}px;padding:0 ${w * .06}px"><i style="display:block;width:${w * .05}px;height:${w * .05}px;border-radius:50%;background:${i % 2 ? '#3dff9a' : '#4fc3ff'}"></i><i style="display:block;flex:1;height:4px;background:#3a4670"></i></div>`).join('')}</div>`,
});

/* a credit card with custom face */
const ccard = (w, label, a, b, num = '•••• •••• •••• 1989') => A.card(w, label, a, b).replace('•••• •••• •••• 2025', num);

/* ---------- the score gauge: arc 300→850, a riding marker, a big counting number ---------- */
const scoreColor = s => { const k = Math.max(0, Math.min(1, (s - 300) / 550)); const c = k < .5 ? [255, 59 + (179 - 59) * k * 2, 79 - 8 * k * 2] : [255 - (255 - 61) * (k - .5) * 2, 179 + (255 - 179) * (k - .5) * 2, 71 + (154 - 71) * (k - .5) * 2]; return `rgb(${c.map(Math.round).join(',')})`; };
const gauge = (host, x, y, w = 640, { score = 300, label = 'CREDIT SCORE', hide = true } = {}) => {
  const u = ++UID;
  const g = div('abs', host, '', `left:${x}px;top:${y}px;width:${w}px;height:${w * .66}px`);
  let ticks = ''; for (let i = 0; i <= 11; i++) { const a = Math.PI * (1 - i / 11); const c = Math.cos(a), s = Math.sin(a); ticks += `<line x1="${300 + c * 280}" y1="${310 - s * 280}" x2="${300 + c * 296}" y2="${310 - s * 296}" stroke="rgba(255,255,255,.55)" stroke-width="5"/>`; }
  g.innerHTML = `<svg viewBox="0 0 600 400" style="width:100%;height:100%;overflow:visible"><defs><linearGradient id="gg${u}" x1="0" x2="1"><stop offset="0" stop-color="#ff3b4f"/><stop offset=".5" stop-color="#ffb347"/><stop offset="1" stop-color="#3dff9a"/></linearGradient>
    <filter id="gl${u}"><feGaussianBlur stdDeviation="9"/></filter></defs>
    <path d="M60,310 A240,240 0 0 1 540,310" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="56" stroke-linecap="round"/>
    <path d="M60,310 A240,240 0 0 1 540,310" fill="none" stroke="url(#gg${u})" stroke-width="44" stroke-linecap="round" opacity=".5" filter="url(#gl${u})"/>
    <path class="arc" d="M60,310 A240,240 0 0 1 540,310" fill="none" stroke="url(#gg${u})" stroke-width="40" stroke-linecap="round" stroke-dasharray="754" stroke-dashoffset="0"/>
    ${ticks}
    <g class="mk"><circle cx="300" cy="70" r="30" fill="#fff" stroke="#0a1120" stroke-width="8"/><path d="M300,104 L288,122 L312,122 Z" fill="#fff"/></g>
    <text x="60" y="378" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="34" fill="rgba(255,255,255,.75)">300</text>
    <text x="540" y="378" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="34" fill="rgba(255,255,255,.75)">850</text></svg>
    <div class="num big" style="position:absolute;left:0;top:${w * .25}px;width:100%;text-align:center;font-size:${w * .19}px;color:${scoreColor(score)};text-shadow:0 0 30px rgba(0,0,0,.6),0 8px 0 rgba(0,0,0,.5)">${score}</div>
    <div class="lbl kick" style="position:absolute;left:0;top:${w * .47}px;width:100%;text-align:center;font-size:${w * .042}px">${label}</div>`;
  const mk = g.querySelector('.mk'), num = g.querySelector('.num'), arc = g.querySelector('.arc');
  const ang = s => -90 + (Math.max(300, Math.min(850, s)) - 300) / 550 * 180;
  tl.set(mk, { svgOrigin: '300 310', rotation: ang(score) }, 0);
  if (hide) tl.set(g, { opacity: 0 }, 0);
  const o = { g, mk, num, arc, cur: score, lbl: g.querySelector('.lbl') };
  o.show = (t, d = .5) => { tl.set(g, { opacity: 1 }, t); tl.fromTo(arc, { attr: { 'stroke-dashoffset': 754 } }, { attr: { 'stroke-dashoffset': 0 }, duration: d + .3, ease: 'power2.out', immediateRender: false }, t); tl.fromTo(g, { scale: .7, rotationX: 50, transformPerspective: 1600 }, { scale: 1, rotationX: 0, duration: d, ease: 'back.out(1.5)', immediateRender: false }, t); cue(t, 'whoosh', .4); };
  o.to = (t, s, d = .8, ease = 'power2.inOut') => {
    const a = o.cur; o.cur = s;
    tl.to(mk, { rotation: ang(s), duration: d, ease }, t);
    const p = { v: a }; tl.to(p, { v: s, duration: d, ease, onUpdate: () => { num.textContent = Math.round(p.v); num.style.color = scoreColor(p.v); } }, t);
    tl.set(num, { textContent: a }, Math.max(0, t - .001));
    cue(t, 'counter', .3, 0, { dur: d });
  };
  return o;
};

/* ---------- a manila file folder that opens (cover hinges on its left edge) ---------- */
const folder = (host, x, y, w, h, tab, inner, z = 0) => {
  const f = div('box3d', host, '', `left:${x}px;top:${y}px;width:${w}px;height:${h}px`);
  const back = div('abs', f, `<div style="position:absolute;left:24px;top:-38px;padding:10px 26px;border-radius:12px 12px 0 0;background:#d9b779;font:700 26px/1 'JetBrains Mono';color:#4a3214">${tab}</div>`, `inset:0;border-radius:10px 16px 16px 16px;background:#d9b779;box-shadow:0 40px 80px rgba(0,0,0,.5)`);
  const page = div('paper', f, inner, `left:22px;top:22px;width:${w - 44}px;height:${h - 40}px;padding:34px 40px;overflow:hidden`);
  const cover = div('abs', f, `<div style="position:absolute;left:40px;top:40px;font:400 54px/1 'Anton';color:#7a5a24;letter-spacing:3px">${tab}</div><div style="position:absolute;right:40px;bottom:40px;padding:8px 18px;border:5px solid #b3262e;border-radius:10px;font:900 34px/1 'Unbounded';color:#b3262e;transform:rotate(-8deg)">CONFIDENTIAL</div>`, `inset:0;border-radius:10px 16px 16px 16px;background:linear-gradient(135deg,#ecc98a,#d4ad66);transform-origin:0 50%;backface-visibility:hidden;box-shadow:inset 0 2px 0 rgba(255,255,255,.4)`);
  tl.set(f, { transformPerspective: 2000 }, 0);
  return { f, page, cover, open: (t, d = .7) => { tl.to(cover, { rotationY: -158, duration: d, ease: 'power3.inOut' }, t); cue(t, 'paper', .6); }, close: (t, d = .4) => { tl.to(cover, { rotationY: 0, duration: d, ease: 'power3.in' }, t); cue(t + d - .05, 'thud', .6); } };
};

/* a line of typed dossier text that appears on a spoken word */
const dline = (host, html, t, css = '') => { const e = div('', host, html, `font:700 34px/1.25 'JetBrains Mono';color:#2a2418;margin:0 0 18px;white-space:nowrap;${css}`); tl.set(e, { opacity: 0, x: -20 }, 0); tl.to(e, { opacity: 1, x: 0, duration: .2 }, t); cue(t, 'type', .35, .2, { dur: .3 }); return e; };

/* a hand-drawn ring around something (stroke draw) */
const ring = (host, x, y, w, h, t, c = '#ff3b4f') => { const e = put(host, svg(`<svg viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px;overflow:visible"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 6}" ry="${h / 2 - 6}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-8 ${w / 2} ${h / 2})"/></svg>`, `left:${x}px;top:${y}px`)); const p = e.querySelector('ellipse'); tl.to(p, { attr: { 'stroke-dashoffset': 0 }, duration: .45, ease: 'power2.inOut' }, t); cue(t, 'snip', .35); return e; };

/* stamp that slams on (class .stamp red|gold|green) */
const stampOn = (host, html, kind, x, y, t, rot = -8, size = 84) => { const s = put(host, svg(`<div class="stamp ${kind}" style="position:relative;font-size:${size}px">${html}</div>`, `left:${x}px;top:${y}px`)); tl.set(s, { opacity: 0, scale: 2.4, rotation: rot - 6 }, 0); tl.to(s, { opacity: 1, scale: 1, rotation: rot, duration: .22, ease: 'power4.in' }, t); cue(t + .2, 'stamp', .9); R.shake(t + .2, 12, .3); return s; };

/* label pill */
const pill = (host, html, bg, fg, x, y, size = 34) => put(host, svg(`<div class="pill" style="position:relative;background:${bg};color:${fg};font-size:${size}px">${html}</div>`, `left:${x}px;top:${y}px`));

/* dots that stream from a to b (each dot flies once and fades; no teleporting loops) */
const stream = (host, ax, ay, bx, by, t0, t1, c = '#4fc3ff', every = .09, size = 12, arc = 0) => {
  let k = 0;
  for (let t = t0; t < t1; t += every, k++) {
    const d = div('abs', host, '', `left:${ax}px;top:${ay}px;width:${size}px;height:${size}px;border-radius:50%;background:${c};box-shadow:0 0 14px ${c}`);
    const j = (k * 37 % 11 - 5) * 4;
    tl.set(d, { opacity: 0 }, 0);
    tl.to(d, { opacity: 1, duration: .08 }, t);
    tl.to(d, { x: bx - ax, duration: .9, ease: 'none' }, t);
    tl.to(d, { y: by - ay + j, duration: .9, ease: arc ? 'sine.out' : 'none' }, t);
    tl.to(d, { opacity: 0, duration: .15 }, t + .78);
  }
};

/* a field of person icons; returns the nodes in reading order */
const people = (host, x, y, cols, rows, size, gap, c = 'rgba(255,255,255,.85)') => {
  const out = [];
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) out.push(div('abs', host, A.person(size, c), `left:${x + q * (size + gap)}px;top:${y + r * (size * 1.66 + gap)}px;color:${c}`));
  return out;
};

/* phone mockup (generic app) */
const phone = (host, x, y, w, inner, bar = '#0b7a3e') => put(host, svg(`<div style="position:relative;width:${w}px;height:${w * 2}px;border-radius:${w * .14}px;background:#0b0f1a;border:${w * .035}px solid #2a3150;box-shadow:0 40px 90px rgba(0,0,0,.6);overflow:hidden">
  <div style="height:${w * .26}px;background:${bar}"></div><div style="position:absolute;left:0;top:${w * .06}px;width:100%;text-align:center"><i style="display:inline-block;width:${w * .3}px;height:${w * .05}px;border-radius:9px;background:#0b0f1a"></i></div>
  <div class="scr" style="position:absolute;left:0;top:${w * .14}px;width:100%;bottom:0">${inner}</div></div>`, `left:${x}px;top:${y}px`));

/* big number line: kicker + counting number */
const bigCount = (host, x, y, kick, size, acc, t, d, a, b, fmt, align = 'left') => {
  const e = put(host, svg(`<div class="kick" style="position:relative;text-align:${align}">${kick}</div><div class="big glow cnt" style="position:relative;font-size:${size}px;margin-top:12px;--acc:${acc};text-align:${align}">${fmt(a)}</div>`, `left:${x}px;top:${y}px`));
  up(e, t - .15, 30);
  countTo(e.querySelector('.cnt'), t, d, a, b, fmt); cue(t, 'counter', .35, 0, { dur: d });
  return e;
};

/* split-flap text swap (each letter flips) */
const flap = (host, x, y, from, to, t, size = 90, bg = '#1a1208', fg = '#ffe9a8') => {
  const n = Math.max(from.length, to.length), cells = [];
  const row = put(host, svg('', `left:${x}px;top:${y}px;display:flex;gap:6px`));
  for (let i = 0; i < n; i++) {
    const c = div('', row, `<span>${from[i] || '&nbsp;'}</span>`, `width:${size * .72}px;height:${size * 1.15}px;border-radius:8px;background:${bg};color:${fg};font:400 ${size}px/${size * 1.15}px 'Anton';text-align:center;box-shadow:inset 0 -${size * .575}px 0 rgba(255,255,255,.04);transform-style:preserve-3d`);
    cells.push(c);
    const tt = t + i * .06;
    tl.to(c, { rotationX: -90, duration: .09, ease: 'power1.in' }, tt);
    tl.set(c.firstChild, { textContent: to[i] || ' ' }, tt + .09);
    tl.to(c, { rotationX: 0, duration: .09, ease: 'power1.out' }, tt + .09);
    cue(tt, 'tick', .18, (i / n - .5), { f: 2200 });
  }
  return row;
};
