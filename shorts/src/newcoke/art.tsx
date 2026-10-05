import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {siCocacola} from 'simple-icons';
import {EZ, prog, rnd} from '../kit/motion';

export const K = {
  bg: '#0b0204',
  red: '#e8101e',
  deep: '#5a050b',
  cream: '#fff2df',
  pepsi: '#1a5fd6',
  vhs: '#5ef2e6',
  mag: '#ff4fd8',
  gold: '#ffcf6b',
};
export const SCRIPT = siCocacola.path;

/** 200,000 tasters as a dot field (each dot = 10 people), drawn to a canvas; `wave` sweeps a "loved it" glow across */
export const PeopleField: React.FC<{reveal: number; wave: number; tint?: string; wrong?: number}> = ({reveal, wave, tint = K.red, wrong = 0}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = 1000;
  const H = 900;
  useLayoutEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, W, H);
    const cols = 90;
    const rows = 80; // 7,200 dots, each ≈ 28 tasters
    const sx = W / cols;
    const sy = H / rows;
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const i = r * cols + q;
        const order = rnd(i * 0.37 + 3) * 0.6 + (r / rows) * 0.4; // fill from the top with scatter
        if (order > reveal) continue;
        const x = q * sx + sx / 2;
        const y = r * sy + sy / 2;
        const d = Math.hypot(x - W / 2, y - H / 2) / Math.hypot(W / 2, H / 2);
        const lit = Math.max(0, 1 - Math.abs(d - wave) * 6);
        const loved = d < wave;
        g.fillStyle = wrong > 0 && rnd(i + 7) < wrong ? '#ff3344' : loved ? tint : '#b99aa0';
        g.globalAlpha = 0.6 + 0.4 * lit;
        const rr = 3.2 + lit * 2.2;
        g.beginPath();
        g.arc(x, y, rr, 0, Math.PI * 2);
        g.fill();
      }
    }
  }, [reveal, wave, tint, wrong]);
  return <canvas ref={ref} width={W} height={H} style={{width: W, height: H}} />;
};

/** wood-cased 1985 CRT television; children render inside the curved screen */
export const TV: React.FC<{w?: number; children: React.ReactNode; on?: number}> = ({w = 900, children, on = 1}) => {
  const h = w * 0.8;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: 'linear-gradient(180deg,#6b4423,#3e2512)', boxShadow: '0 40px 120px rgba(0,0,0,.7), inset 0 0 0 6px #2a180b'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 3px, transparent 3px 11px)'}} />
      <div style={{position: 'absolute', left: w * 0.06, top: h * 0.08, width: w * 0.68, height: h * 0.84, borderRadius: 50, background: '#111', boxShadow: 'inset 0 0 0 14px #1d1d1d'}}>
        <div style={{position: 'absolute', inset: 26, borderRadius: '42% / 34%', overflow: 'hidden', background: '#06080a', boxShadow: 'inset 0 0 80px rgba(0,0,0,.9)'}}>
          <div style={{position: 'absolute', inset: 0, opacity: on, filter: 'saturate(1.25) contrast(1.05)'}}>{children}</div>
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 5px)'}} />
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,.16), transparent 45%)'}} />
        </div>
      </div>
      {[0.26, 0.46].map((y, i) => (
        <div key={i} style={{position: 'absolute', left: w * 0.8, top: h * y, width: w * 0.12, height: w * 0.12, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #d8d2c2, #6e675b)', boxShadow: '0 6px 14px rgba(0,0,0,.5)'}} />
      ))}
      <div style={{position: 'absolute', left: w * 0.79, top: h * 0.68, width: w * 0.14, height: h * 0.2, background: 'repeating-linear-gradient(0deg,#2a180b 0 5px,#5b3a1c 5px 10px)', borderRadius: 8}} />
    </div>
  );
};

/** a blind-test cup (paper or clear plastic) with fill level */
export const Cup: React.FC<{label: string; fill: number; color?: string; w?: number; glow?: number}> = ({label, fill, color = '#3a0d07', w = 220, glow = 0}) => (
  <div style={{position: 'relative', width: w, height: w * 1.25}}>
    <svg viewBox="0 0 100 125" width={w} height={w * 1.25} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id={`cup${label}`}><path d="M10 10 L90 10 L80 120 L20 120 Z" /></clipPath>
      </defs>
      <g clipPath={`url(#cup${label})`}>
        <rect x="0" y={120 - 110 * fill} width="100" height="125" fill={color} />
        <rect x="0" y={120 - 110 * fill} width="100" height="4" fill="#7a2a16" opacity=".9" />
        {Array.from({length: 7}).map((_, i) => <circle key={i} cx={25 + rnd(i) * 50} cy={120 - rnd(i + 3) * 100 * fill} r={1.2 + rnd(i + 5)} fill="#fff" opacity=".35" />)}
      </g>
      <path d="M10 10 L90 10 L80 120 L20 120 Z" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.65)" strokeWidth="2" />
      <path d="M18 14 L26 112" stroke="rgba(255,255,255,.35)" strokeWidth="5" strokeLinecap="round" />
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: -84, textAlign: 'center', fontFamily: 'Archivo Black', fontSize: w * 0.34, color: '#fff', textShadow: glow ? `0 0 ${30 * glow}px ${K.gold}` : 'none'}}>{label}</div>
  </div>
);

/** aged formula ledger page (no claims about the actual recipe) */
export const Ledger: React.FC<{stamp: number; w?: number}> = ({stamp, w = 760}) => (
  <div style={{position: 'relative', width: w, height: w * 1.05, background: 'linear-gradient(170deg,#efe0bd,#d6c08f)', boxShadow: '0 40px 100px rgba(0,0,0,.6)', transform: 'rotate(-3deg)', padding: 56}}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, transparent 40%, rgba(120,80,20,.35) 100%)'}} />
    <div style={{fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 64, color: '#3b2610', letterSpacing: 2}}>FORMULA</div>
    <div style={{fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: '#6b4a24', marginTop: 4}}>Atlanta, Georgia · 1886</div>
    {Array.from({length: 9}).map((_, i) => (
      <div key={i} style={{marginTop: 34, height: 4, width: `${60 + rnd(i + 2) * 35}%`, background: 'rgba(59,38,16,.55)', borderRadius: 2, transform: `rotate(${(rnd(i) - 0.5) * 1.2}deg)`}} />
    ))}
    <div
      style={{
        position: 'absolute',
        right: 40,
        bottom: 90,
        border: `10px solid ${K.red}`,
        color: K.red,
        fontFamily: 'Archivo Black',
        fontSize: 70,
        padding: '6px 24px',
        borderRadius: 14,
        transform: `rotate(-14deg) scale(${2.2 - 1.2 * stamp})`,
        opacity: stamp > 0 ? 0.92 : 0,
        mixBlendMode: 'multiply',
      }}
    >
      CHANGED · 1985
    </div>
  </div>
);

/** telephone switchboard: lights come on as calls arrive */
export const Switchboard: React.FC<{lit: number}> = ({lit}) => {
  const n = 96;
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 18, padding: 40, background: 'linear-gradient(180deg,#2b2a28,#151413)', borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,.6), inset 0 0 0 6px #3a3834'}}>
      {Array.from({length: n}).map((_, i) => {
        const on = rnd(i + 1) < lit;
        return (
          <div key={i} style={{width: 46, height: 46, borderRadius: '50%', background: on ? 'radial-gradient(circle at 40% 35%, #fff2c4, #ffb02e 45%, #a35a00)' : 'radial-gradient(circle at 40% 35%, #5a5752, #22211f)', boxShadow: on ? '0 0 22px rgba(255,176,46,.9)' : 'inset 0 2px 4px rgba(0,0,0,.7)'}} />
        );
      })}
    </div>
  );
};

/** sweetness gauge: needle from -1 (less sweet) to +1 (sweeter wins) */
export const Gauge: React.FC<{v: number; label: string; w?: number}> = ({v, label, w = 560}) => (
  <div style={{position: 'relative', width: w, height: w * 0.62}}>
    <svg viewBox="0 0 200 124" width={w} height={w * 0.62}>
      <defs>
        <linearGradient id="gz" x1="0" x2="1">
          <stop offset="0" stopColor={K.pepsi} />
          <stop offset=".5" stopColor="#e9e2d2" />
          <stop offset="1" stopColor={K.red} />
        </linearGradient>
      </defs>
      <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="url(#gz)" strokeWidth="18" strokeLinecap="round" />
      {Array.from({length: 11}).map((_, i) => {
        const a = Math.PI - (i / 10) * Math.PI;
        return <line key={i} x1={100 + Math.cos(a) * 62} y1={110 - Math.sin(a) * 62} x2={100 + Math.cos(a) * 70} y2={110 - Math.sin(a) * 70} stroke="#fff" strokeWidth={i % 5 ? 1.5 : 3} opacity=".7" />;
      })}
      <g transform={`rotate(${v * 80} 100 110)`}>
        <path d="M97 110 L100 40 L103 110 Z" fill="#fff" />
      </g>
      <circle cx="100" cy="110" r="9" fill="#fff" />
      <text x="24" y="122" fontFamily="Oswald" fontWeight="700" fontSize="11" fill="#9fbfff">LESS SWEET</text>
      <text x="146" y="122" fontFamily="Oswald" fontWeight="700" fontSize="11" fill="#ff9aa2">SWEETER</text>
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: -70, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 44, color: '#fff', letterSpacing: 6}}>{label}</div>
  </div>
);

/** crowd of protest silhouettes with signs */
export const Crowd: React.FC<{rise: number; signs: string[]}> = ({rise, signs}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 760, height: 700}}>
      {signs.map((s, i) => {
        const x = 40 + i * (1000 / signs.length);
        const bob = Math.sin(f / 6 + i * 1.7) * 14;
        const r = (rnd(i + 4) - 0.5) * 14 + Math.sin(f / 9 + i) * 3;
        const p = prog(rise, i * 0.12, i * 0.12 + 0.5, EZ.out);
        return (
          <div key={i} style={{position: 'absolute', left: x, bottom: 0, width: 300, transform: `translateY(${(1 - p) * 500 + bob}px)`, opacity: p}}>
            <div style={{position: 'absolute', left: 30, bottom: 360, width: 240, padding: '18px 14px', background: '#f6f0e2', transform: `rotate(${r}deg)`, fontFamily: 'Permanent Marker', fontSize: 34, color: i % 2 ? K.red : '#1b1b1b', textAlign: 'center', lineHeight: 1.05, boxShadow: '0 10px 24px rgba(0,0,0,.5)'}}>
              {s}
            </div>
            <div style={{position: 'absolute', left: 145, bottom: 220, width: 10, height: 160, background: '#7a5a32', transform: `rotate(${r}deg)`, transformOrigin: '50% 100%'}} />
            <svg viewBox="0 0 100 120" width={240} height={290} style={{position: 'absolute', left: 30, bottom: -60}}>
              <circle cx="50" cy="34" r="20" fill="#0a0506" stroke="#ff8a7a" strokeWidth="2.5" />
              <path d="M8 120c4-40 20-56 42-56s38 16 42 56z" fill="#0a0506" stroke="#ff8a7a" strokeWidth="2.5" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

/** two-line sales chart: Classic rebounds past Pepsi */
export const SalesChart: React.FC<{p: number; w?: number; h?: number; coke?: string}> = ({p, w = 900, h = 520, coke: cokeCol = K.red}) => {
  const N = 40;
  const coke = (i: number) => {
    const x = i / (N - 1);
    return x < 0.45 ? 0.7 - x * 0.7 : x < 0.55 ? 0.385 - (x - 0.45) * 1.2 : 0.265 + (x - 0.55) * 1.3 + 0.03 * Math.sin(i);
  };
  const pepsi = (i: number) => 0.45 + 0.08 * Math.sin(i / 5) + (i / N) * 0.06;
  const pts = (fn: (i: number) => number) =>
    Array.from({length: Math.max(2, Math.ceil(N * p))}, (_, i) => `${(i / (N - 1)) * w},${h - fn(i) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      {[0.25, 0.5, 0.75].map((y) => <line key={y} x1={0} x2={w} y1={h * y} y2={h * y} stroke="rgba(255,255,255,.1)" strokeWidth={2} />)}
      <polyline points={pts(pepsi)} fill="none" stroke={K.pepsi} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={pts(coke)} fill="none" stroke={cokeCol} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 14px rgba(255,255,255,.6))'}} />
      <text x={w - 10} y={h - pepsi(N - 1) * h + 50} textAnchor="end" fontFamily="Oswald" fontWeight={700} fontSize={36} fill="#8fb4ff" opacity={p > 0.9 ? 1 : 0}>PEPSI</text>
      <text x={w - 10} y={h - coke(N - 1) * h - 24} textAnchor="end" fontFamily="Oswald" fontWeight={700} fontSize={40} fill="#fff" opacity={p > 0.9 ? 1 : 0}>COKE CLASSIC</text>
    </svg>
  );
};

/** a scribbled envelope addressed in handwriting */
export const Letter: React.FC<{w?: number; write: number}> = ({w = 820, write}) => {
  const lines = ['Chief Dodo', 'The Coca-Cola Company', 'Atlanta, Georgia'];
  return (
    <div style={{position: 'relative', width: w, height: w * 0.58, background: 'linear-gradient(170deg,#f4ecd9,#e2d4b4)', boxShadow: '0 30px 80px rgba(0,0,0,.6)', transform: 'rotate(2deg)'}}>
      <div style={{position: 'absolute', right: 40, top: 34, width: 110, height: 130, background: 'repeating-linear-gradient(45deg,#c33 0 8px,#e66 8px 16px)', border: '6px dashed #f4ecd9'}} />
      <div style={{position: 'absolute', right: 180, top: 46, width: 150, height: 150, borderRadius: '50%', border: '4px solid rgba(40,40,60,.45)', fontFamily: 'Oswald', fontSize: 22, color: 'rgba(40,40,60,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: 'rotate(-12deg)'}}>
        JUN<br />1985
      </div>
      <div style={{position: 'absolute', left: 120, top: 230, fontFamily: 'Permanent Marker', fontSize: 58, color: '#1d2a6b', lineHeight: 1.3}}>
        {lines.map((l, i) => {
          const p = prog(write, i / 3, (i + 1) / 3, EZ.linear);
          return (
            <div key={i} style={{clipPath: `inset(0 ${100 - p * 100}% 0 0)`, color: i === 0 ? K.red : '#1d2a6b', fontSize: i === 0 ? 72 : 50}}>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** VHS/broadcast chyron */
export const Chyron: React.FC<{text: string; sub?: string; p: number}> = ({text, sub, p}) => (
  <div style={{transform: `translateX(${(1 - p) * -1100}px)`, display: 'inline-flex', flexDirection: 'column'}}>
    <div style={{background: K.red, color: '#fff', fontFamily: 'Bebas Neue', fontSize: 84, letterSpacing: 4, padding: '6px 30px 0'}}>{text}</div>
    {sub && <div style={{background: '#101014', color: K.cream, fontFamily: 'VT323', fontSize: 52, letterSpacing: 2, padding: '4px 30px'}}>{sub}</div>}
  </div>
);

export const Scan: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 5px)', mixBlendMode: 'multiply'}} />
);
