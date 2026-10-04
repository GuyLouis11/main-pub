/* v2 assets: the same signatures as kit/ckit, redrawn with light, shading and depth (rim-lit silhouettes, glossy cars,
   lit windows, marble banks, minted coins). Loaded after ckit.js so every scene picks them up. */
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return `rgb(${f(r)},${f(g)},${f(b)})`; };
const isHex = c => /^#[0-9a-f]{6}$/i.test(c);

Object.assign(A, {
  person: (w = 60, c = 'currentColor') => {
    const u = ++UID;
    return `<svg class="prs" viewBox="0 0 60 100" style="width:${w}px;height:${w * 1.66}px;overflow:visible"><defs>
      <linearGradient id="pb${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset=".7" stop-color="${c}" stop-opacity=".88"/><stop offset="1" stop-color="${c}" stop-opacity=".7"/></linearGradient>
      <radialGradient id="ph${u}" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="30" cy="99" rx="26" ry="3.5" fill="rgba(0,0,0,.35)"/>
      <circle cx="30" cy="19" r="15" fill="url(#pb${u})"/><circle cx="30" cy="19" r="15" fill="url(#ph${u})"/>
      <path d="M26,32 L34,32 L35,40 L25,40 Z" fill="url(#pb${u})"/>
      <path d="M3,100 L5,60 Q7,44 22,40 Q30,45 38,40 Q53,44 55,60 L57,100 Z" fill="url(#pb${u})"/>
      <path class="hl" d="M22,40 Q30,45 38,40 Q50,43 53,54" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
      <path class="hl" d="M41,8 A15,15 0 0 1 44,27" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>
      <path class="hl" d="M53,58 L56,98" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/></svg>`;
  },
  house: (w = 200, c = '#ffb347', lit = '#ffe9a8') => {
    const u = ++UID, cc = isHex(c) ? c : '#ffb347', dark = shade(cc, -.35), light = shade(cc, .25);
    return `<svg viewBox="0 0 220 198" style="width:${w}px;height:${w * .9}px;overflow:visible"><defs>
      <linearGradient id="hw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${cc}"/></linearGradient>
      <linearGradient id="hr${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8423a"/><stop offset="1" stop-color="#6a2622"/></linearGradient>
      <radialGradient id="hl${u}"><stop offset="0" stop-color="${lit}"/><stop offset="1" stop-color="${lit}" stop-opacity=".55"/></radialGradient>
      <radialGradient id="hg${u}"><stop offset="0" stop-color="${lit}" stop-opacity=".55"/><stop offset="1" stop-color="${lit}" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="112" cy="192" rx="108" ry="9" fill="rgba(0,0,0,.35)"/>
      <path d="M150,96 L196,74 L196,176 L150,190 Z" fill="${dark}"/>
      <path d="M100,26 L150,96 L196,74 L150,14 Z" fill="#4e1c18"/>
      <rect x="30" y="94" width="120" height="96" fill="url(#hw${u})"/>
      <path d="M14,100 L90,22 L166,100 Z" fill="url(#hr${u})"/><path d="M14,100 L90,22 L96,28 L26,100 Z" fill="#fff" opacity=".12"/>
      <rect x="120" y="34" width="16" height="36" fill="#5a2424"/><rect x="117" y="30" width="22" height="8" fill="#3a1414"/>
      <circle cx="70" cy="130" r="40" fill="url(#hg${u})"/><circle cx="125" cy="130" r="30" fill="url(#hg${u})"/>
      <rect x="44" y="112" width="34" height="32" rx="3" fill="url(#hl${u})" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><path d="M61,112 V144 M44,128 H78" stroke="#fff" stroke-opacity=".6" stroke-width="2.5"/>
      <path d="M162,118 L184,108 L184,132 L162,142 Z" fill="url(#hl${u})" opacity=".75"/>
      <rect x="96" y="132" width="32" height="58" rx="3" fill="#4a2a12"/><circle cx="121" cy="162" r="3" fill="#ffd27a"/>
      <ellipse cx="34" cy="186" rx="20" ry="11" fill="#2f7d3a"/><ellipse cx="146" cy="188" rx="16" ry="9" fill="#2a6e34"/></svg>`;
  },
  car: (w = 260, c = '#4fc3ff') => {
    const u = ++UID, cc = isHex(c) ? c : '#4fc3ff';
    return `<svg viewBox="0 0 300 140" style="width:${w}px;height:${w * .47}px;overflow:visible"><defs>
      <linearGradient id="cb${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(cc, .35)}"/><stop offset=".55" stop-color="${cc}"/><stop offset="1" stop-color="${shade(cc, -.4)}"/></linearGradient>
      <linearGradient id="cw${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset="1" stop-color="#6a8aa8"/></linearGradient>
      <radialGradient id="cl${u}"><stop offset="0" stop-color="#fff8c8"/><stop offset="1" stop-color="#fff8c8" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="150" cy="134" rx="146" ry="8" fill="rgba(0,0,0,.4)"/>
      <path d="M14,92 Q20,56 74,50 L116,22 Q124,17 136,17 L198,17 Q212,17 222,26 L250,52 Q288,58 290,90 L290,110 Q290,116 284,116 L18,116 Q12,116 12,110 Z" fill="url(#cb${u})"/>
      <path d="M120,26 L196,26 Q206,26 212,32 L234,52 L96,52 Z" fill="url(#cw${u})"/><path d="M160,26 L166,52" stroke="${shade(cc, -.45)}" stroke-width="6"/>
      <path d="M126,30 L150,30 L136,48 L112,48 Z" fill="#fff" opacity=".35"/>
      <path d="M24,74 Q120,64 286,74" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/>
      <circle cx="282" cy="86" r="22" fill="url(#cl${u})"/><rect x="274" y="80" width="12" height="10" rx="3" fill="#fff8c8"/><rect x="14" y="80" width="10" height="10" rx="3" fill="#ff4a3d"/>
      ${[80, 228].map(x => `<circle cx="${x}" cy="112" r="25" fill="#0d0a18"/><circle cx="${x}" cy="112" r="13" fill="#9aa3b8"/><circle cx="${x}" cy="112" r="5" fill="#3a3f52"/><path d="M${x - 10},104 A13,13 0 0 1 ${x + 6},100" stroke="#fff" stroke-opacity=".7" stroke-width="2.5" fill="none"/>`).join('')}</svg>`;
  },
  building: (w = 160, c = '#8fa3d9', floors = 6) => {
    const u = ++UID, cc = isHex(c) ? c : '#8fa3d9', H = 40 + floors * 34; let win = '';
    for (let f = 0; f < floors; f++) for (let k = 0; k < 3; k++) { const on = (f * 7 + k * 3 + u) % 4 !== 0; win += `<rect x="${18 + k * 38}" y="${26 + f * 34}" width="26" height="20" rx="2" fill="${on ? '#ffe9a8' : '#27304f'}"${on ? ` filter="url(#bf${u})"` : ''}/>`; }
    return `<svg viewBox="0 0 160 ${H}" style="width:${w}px;height:${w * H / 160}px;overflow:visible"><defs>
      <linearGradient id="bg${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(cc, .15)}"/><stop offset=".8" stop-color="${cc}"/><stop offset="1" stop-color="${shade(cc, -.45)}"/></linearGradient>
      <filter id="bf${u}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect x="4" y="8" width="152" height="${H - 8}" fill="url(#bg${u})"/><rect x="4" y="8" width="152" height="6" fill="#fff" opacity=".35"/>
      <rect x="66" y="0" width="4" height="10" fill="${shade(cc, -.3)}"/><circle cx="68" cy="0" r="3" fill="#ff4a3d"/>${win}</svg>`;
  },
  bank: (w = 200, c = '#e8e2cf') => {
    const u = ++UID;
    return `<svg viewBox="0 0 200 170" style="width:${w}px;height:${w * .85}px;overflow:visible"><defs>
      <linearGradient id="kc${u}" x1="0" x2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="#a89f86"/></linearGradient>
      <linearGradient id="kp${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#c9c0a8"/></linearGradient></defs>
      <ellipse cx="100" cy="166" rx="98" ry="6" fill="rgba(0,0,0,.35)"/>
      <path d="M8,58 L100,6 L192,58 Z" fill="url(#kp${u})"/><path d="M30,52 L100,16 L170,52 Z" fill="#d9cfb2"/>
      <text x="100" y="47" text-anchor="middle" font-family="Anton" font-size="22" fill="#6b5a2a" letter-spacing="3">BANK</text>
      <rect x="14" y="58" width="172" height="12" fill="url(#kp${u})"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${28 + i * 40}" y="72" width="22" height="72" fill="url(#kc${u})"/><rect x="${25 + i * 40}" y="70" width="28" height="6" fill="#fffaf0"/>`).join('')}
      <rect x="10" y="144" width="180" height="10" fill="url(#kp${u})"/><rect x="4" y="154" width="192" height="10" fill="#bdb49a"/></svg>`;
  },
  coin: (w = 80, sym = '$', c = '#ffc640') => {
    const u = ++UID, cc = isHex(c) ? c : '#ffc640';
    return `<svg viewBox="0 0 120 120" style="width:${w}px;height:${w}px;overflow:visible"><defs><radialGradient id="co${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${shade(cc, .55)}"/><stop offset=".55" stop-color="${cc}"/><stop offset="1" stop-color="${shade(cc, -.4)}"/></radialGradient></defs>
      <circle cx="60" cy="63" r="50" fill="${shade(cc, -.55)}"/><circle cx="60" cy="58" r="50" fill="url(#co${u})"/><circle cx="60" cy="58" r="39" fill="none" stroke="${shade(cc, -.35)}" stroke-width="5"/>
      <text x="60" y="76" text-anchor="middle" font-family="Unbounded" font-weight="900" font-size="46" fill="${shade(cc, -.45)}">${sym}</text>
      <path d="M28,40 A38,38 0 0 1 60,20" stroke="#fff" stroke-opacity=".75" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  },
  env: (w = 140, c = '#f5f1e6', s = '#c9b98f') => {
    const u = ++UID;
    return `<svg viewBox="0 0 140 92" style="width:${w}px;height:${w * .66}px;overflow:visible"><defs><linearGradient id="ev${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
      <rect x="4" y="6" width="136" height="88" rx="6" fill="rgba(0,0,0,.25)"/><rect x="2" y="2" width="136" height="88" rx="6" fill="url(#ev${u})"/><path d="M2,88 L60,44 M138,88 L80,44" stroke="${s}" stroke-width="2" opacity=".6"/><path d="M2,6 L70,54 L138,6" fill="none" stroke="${s}" stroke-width="5"/></svg>`;
  },
  lock: (w = 120, c = '#ffc640') => {
    const u = ++UID, cc = isHex(c) ? c : '#ffc640';
    return `<svg viewBox="0 0 120 140" style="width:${w}px;height:${w * 1.16}px;overflow:visible"><defs><linearGradient id="lk${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(cc, .4)}"/><stop offset="1" stop-color="${shade(cc, -.35)}"/></linearGradient></defs>
      <path d="M30,64 L30,42 Q30,10 60,10 Q90,10 90,42 L90,64" fill="none" stroke="#c9ccd8" stroke-width="14"/><path d="M34,60 L34,42 Q34,16 60,14" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4"/>
      <rect x="14" y="60" width="92" height="74" rx="14" fill="url(#lk${u})"/><rect x="20" y="64" width="80" height="10" rx="5" fill="#fff" opacity=".3"/><circle cx="60" cy="94" r="10" fill="#1a1204"/><rect x="56" y="98" width="8" height="22" rx="3" fill="#1a1204"/></svg>`;
  },
  shield: (w = 200, c = '#3dff9a') => {
    const u = ++UID, cc = isHex(c) ? c : '#3dff9a';
    return `<svg viewBox="0 0 200 230" style="width:${w}px;height:${w * 1.15}px;overflow:visible"><defs><linearGradient id="sh${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(cc, .45)}"/><stop offset="1" stop-color="${shade(cc, -.35)}"/></linearGradient></defs>
      <path d="M100,8 L186,40 L186,110 Q186,190 100,224 Q14,190 14,110 L14,40 Z" fill="url(#sh${u})"/><path d="M100,22 L172,48 L172,108 Q172,176 100,206 Z" fill="#fff" opacity=".14"/>
      <path d="M60,116 L90,146 L146,84" fill="none" stroke="#062a16" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  },
  brief: (w = 160, c = '#a0642c') => {
    const u = ++UID;
    return `<svg viewBox="0 0 160 130" style="width:${w}px;height:${w * .81}px;overflow:visible"><defs><linearGradient id="br${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c88a4a"/><stop offset="1" stop-color="#6a3c14"/></linearGradient></defs>
      <rect x="56" y="8" width="48" height="26" rx="8" fill="none" stroke="#5a3410" stroke-width="10"/><rect x="6" y="30" width="148" height="94" rx="14" fill="url(#br${u})"/><rect x="10" y="34" width="140" height="8" rx="4" fill="#fff" opacity=".25"/>
      <rect x="6" y="64" width="148" height="8" fill="rgba(0,0,0,.25)"/><rect x="68" y="56" width="24" height="24" rx="5" fill="#ffd27a"/></svg>`;
  },
});
