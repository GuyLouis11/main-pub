import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {siMcdonalds} from 'simple-icons';
import {EZ, prog, rnd} from '../kit/motion';

export const C = {
  bg: '#0a090c',
  red: '#DA291C',
  gold: '#FFC72C',
  cream: '#fff4dc',
  blue: '#123f9a',
  ink: '#16141a',
  steel: '#8a93a6',
  cash: '#3f7f52',
  fbi: '#2f7bff',
};
export const ARCHES = siMcdonalds.path;

/** fluorescent-lit bathroom tiles in perspective (steady, no flicker) */
export const Tiles: React.FC<{tint?: string; angle?: number}> = ({tint = '#c9d6d2', angle = 58}) => (
  <AbsoluteFill style={{background: '#0d1213', overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        left: -800,
        right: -800,
        top: 700,
        height: 2400,
        transformOrigin: '50% 0%',
        transform: `perspective(900px) rotateX(${angle}deg)`,
        backgroundColor: tint,
        backgroundImage:
          'linear-gradient(90deg, rgba(20,30,30,.55) 3px, transparent 3px), linear-gradient(0deg, rgba(20,30,30,.55) 3px, transparent 3px)',
        backgroundSize: '120px 120px',
        opacity: 0.22,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: tint,
        backgroundImage:
          'linear-gradient(90deg, rgba(10,16,16,.6) 4px, transparent 4px), linear-gradient(0deg, rgba(10,16,16,.6) 4px, transparent 4px)',
        backgroundSize: '150px 75px',
        opacity: 0.16,
        maskImage: 'linear-gradient(180deg, #000 0%, #000 45%, transparent 75%)',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(220,255,240,.28), transparent 70%)'}} />
  </AbsoluteFill>
);

/** a toilet-stall door with a lock indicator and a hanging airport gate sign */
export const Stall: React.FC<{occupied: number; x?: number}> = ({occupied, x = 0}) => (
  <div style={{position: 'absolute', left: 190 + x, top: 330, width: 700, height: 1250}}>
    {/* partition */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 14,
        background: 'linear-gradient(90deg, #5b6573 0%, #8995a6 18%, #6f7a89 50%, #8592a3 82%, #59626f 100%)',
        boxShadow: 'inset 0 0 0 6px #3d444f, 0 40px 120px rgba(0,0,0,.6)',
      }}
    />
    {/* brushed metal streaks */}
    <div
      style={{
        position: 'absolute',
        inset: 10,
        borderRadius: 10,
        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 2px, transparent 2px 7px)',
        mixBlendMode: 'overlay',
      }}
    />
    {/* hinges */}
    {[160, 1020].map((y) => (
      <div key={y} style={{position: 'absolute', left: -14, top: y, width: 26, height: 90, borderRadius: 6, background: 'linear-gradient(90deg,#3a3f47,#9aa3b1,#3a3f47)'}} />
    ))}
    {/* lock indicator */}
    <div
      style={{
        position: 'absolute',
        right: 60,
        top: 560,
        width: 190,
        height: 70,
        borderRadius: 36,
        background: '#1b1e23',
        boxShadow: 'inset 0 3px 8px rgba(0,0,0,.8), 0 0 0 5px #9aa3b1',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 8,
          borderRadius: 28,
          background: occupied > 0.5 ? C.red : '#2fbf5a',
          boxShadow: `0 0 ${20 + 30 * occupied}px ${occupied > 0.5 ? C.red : '#2fbf5a'}`,
          color: '#fff',
          fontFamily: 'Oswald',
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {occupied > 0.5 ? 'OCCUPIED' : 'VACANT'}
      </div>
    </div>
  </div>
);

export const GateSign: React.FC<{y?: number}> = ({y = 120}) => (
  <div
    style={{
      position: 'absolute',
      left: 140,
      top: y,
      width: 800,
      height: 130,
      borderRadius: 10,
      background: '#121417',
      boxShadow: '0 20px 60px rgba(0,0,0,.6), inset 0 0 0 3px #2c3036',
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      padding: '0 36px',
      color: '#ffd23f',
      fontFamily: 'Oswald',
      fontWeight: 700,
      fontSize: 44,
      whiteSpace: 'nowrap',
      letterSpacing: 2,
    }}
  >
    <svg viewBox="0 0 24 24" width={70} height={70}><path fill="#ffd23f" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg>
    <span>GATES A1–A28</span>
    <span style={{marginLeft: 'auto', color: '#fff', display: 'flex', alignItems: 'center', gap: 14}}>
      <svg viewBox="0 0 24 24" width={56} height={56}><circle cx="12" cy="5" r="2.6" fill="#fff" /><path fill="#fff" d="M9 9h6l-1 7h-1v6h-2v-6h-1z" /></svg>
      RESTROOMS
    </span>
  </div>
);

/** McDonald's Monopoly-style peel tab (original design: property strip, prize line, foil) */
export const GamePiece: React.FC<{
  name: string;
  strip: string;
  prize?: string;
  w?: number;
  foil?: number; // 0..1 sweep progress
  dud?: boolean;
  style?: React.CSSProperties;
}> = ({name, strip, prize = '$1,000,000', w = 520, foil = -1, dud = false, style}) => {
  const h = w * 0.62;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: w * 0.04,
        background: dud ? '#efe8d8' : 'linear-gradient(160deg,#fffaf0,#f3e7c8)',
        boxShadow: `0 ${w * 0.05}px ${w * 0.14}px rgba(0,0,0,.55), inset 0 0 0 ${w * 0.012}px ${C.red}`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h * 0.27, background: strip, boxShadow: 'inset 0 -4px 0 rgba(0,0,0,.25)'}} />
      <div
        style={{
          position: 'absolute',
          top: h * 0.33,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Archivo Black',
          fontSize: Math.min(w * 0.105, (w * 0.86) / (name.length * 0.68)),
          color: '#16141a',
          letterSpacing: w * 0.004,
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: 'absolute',
          top: h * 0.56,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Oswald',
          fontWeight: 700,
          fontSize: w * (dud ? 0.06 : 0.1),
          color: dud ? '#8b8476' : C.red,
          letterSpacing: 1,
        }}
      >
        {dud ? 'SORRY — TRY AGAIN' : prize}
      </div>
      <div style={{position: 'absolute', bottom: h * 0.06, width: '100%', textAlign: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: w * 0.032, color: '#6e6656', letterSpacing: 2}}>
        {dud ? 'COLLECT ALL PIECES' : 'INSTANT WIN · RARE PIECE'}
      </div>
      {/* holographic foil sweep */}
      {foil >= 0 && foil <= 1 && (
        <div
          style={{
            position: 'absolute',
            top: -h,
            left: -w * 0.6 + foil * w * 2.2,
            width: w * 0.35,
            height: h * 3,
            transform: 'rotate(24deg)',
            background: 'linear-gradient(90deg, transparent, rgba(255,240,180,.0), rgba(255,255,255,.75), rgba(160,220,255,.35), transparent)',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
};

/** rim-lit silhouette in a suit (SVG) */
export const Suit: React.FC<{w?: number; rim?: string; badge?: boolean; tie?: string; style?: React.CSSProperties; breathe?: number}> = ({
  w = 520,
  rim = '#ffd27a',
  badge = false,
  tie = C.red,
  style,
  breathe = 0,
}) => (
  <svg viewBox="0 0 200 240" width={w} height={w * 1.2} style={{overflow: 'visible', ...style}}>
    <defs>
      <filter id="rimglow"><feGaussianBlur stdDeviation="2.2" /></filter>
    </defs>
    <g transform={`translate(0 ${breathe})`}>
      <path d="M100 30c-20 0-34 15-34 37 0 16 7 30 17 37v12c-30 6-56 22-62 54l-6 70h170l-6-70c-6-32-32-48-62-54v-12c10-7 17-21 17-37 0-22-14-37-34-37z" fill="#07070a" />
      <path
        d="M100 30c-20 0-34 15-34 37 0 16 7 30 17 37v12c-30 6-56 22-62 54l-6 70h170l-6-70c-6-32-32-48-62-54v-12c10-7 17-21 17-37 0-22-14-37-34-37z"
        fill="none"
        stroke={rim}
        strokeWidth="2.2"
        filter="url(#rimglow)"
        opacity=".9"
      />
      {/* lapels + shirt + tie */}
      <path d="M83 116l17 34 17-34" fill="none" stroke="#2b2a30" strokeWidth="3" />
      <path d="M92 118h16l-8 12z" fill="#e8e4da" opacity=".85" />
      <path d="M98 128h4l4 40-6 8-6-8z" fill={tie} />
      {badge && (
        <g transform="translate(128 150)">
          <path d="M0 -14l4 8 9 1-6 7 2 9-9-4-9 4 2-9-6-7 9-1z" fill={C.gold} stroke="#7a5b00" strokeWidth="1" />
        </g>
      )}
    </g>
  </svg>
);

/** sealed envelope with an animated flap (0 closed → 1 open) and an optional seal sticker */
export const Envelope: React.FC<{open: number; seal: number; w?: number; label?: string; style?: React.CSSProperties}> = ({open, seal, w = 620, label, style}) => {
  const h = w * 0.62;
  return (
    <div style={{position: 'relative', width: w, height: h, perspective: 1200, ...style}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(170deg,#e9dcc0,#cdbb95)', boxShadow: '0 30px 80px rgba(0,0,0,.55)'}} />
      <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)', background: 'linear-gradient(0deg,#d8c7a2,#e6d7b6)'}} />
      {label && (
        <div style={{position: 'absolute', left: 40, bottom: 40, fontFamily: 'Special Elite', fontSize: w * 0.045, color: '#3b3226', lineHeight: 1.3, whiteSpace: 'pre'}}>{label}</div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: w,
          height: h * 0.55,
          transformOrigin: '50% 0%',
          transform: `rotateX(${open * 175}deg)`,
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          background: open > 0.5 ? '#bfae88' : 'linear-gradient(180deg,#efe3c9,#d9c7a1)',
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,.4)',
        }}
      />
      {/* tamper-evident seal */}
      <div
        style={{
          position: 'absolute',
          left: w / 2 - w * 0.17,
          top: h * 0.43,
          width: w * 0.34,
          height: w * 0.1,
          borderRadius: 6,
          background: 'repeating-linear-gradient(-45deg,#c81d12 0 14px,#e8463b 14px 28px)',
          color: '#fff',
          fontFamily: 'Oswald',
          fontWeight: 700,
          fontSize: w * 0.035,
          letterSpacing: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: seal,
          transform: `scale(${0.9 + 0.1 * seal})`,
          boxShadow: '0 4px 12px rgba(0,0,0,.35)',
        }}
      >
        VOID IF OPENED
      </div>
    </div>
  );
};

/** cardboard shipping box (CSS 3D) with opening flaps */
export const Box3D: React.FC<{open: number; size?: number; ry?: number; rx?: number}> = ({open, size = 420, ry = -28, rx = -18}) => {
  const s = size;
  const face: React.CSSProperties = {
    position: 'absolute',
    width: s,
    height: s * 0.7,
    background: 'linear-gradient(160deg,#c8995e,#a87842)',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,.25)',
    backfaceVisibility: 'visible',
  };
  return (
    <div style={{width: s, height: s * 0.7, perspective: 1600}}>
      <div style={{position: 'relative', width: s, height: s * 0.7, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        <div style={{...face, transform: `translateZ(${s / 2}px)`}}>
          <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 60, marginLeft: -30, background: 'rgba(220,200,150,.55)'}} />
          <div style={{position: 'absolute', left: 30, bottom: 26, fontFamily: 'Special Elite', fontSize: 30, color: '#3a2a14', lineHeight: 1.15}}>
            SECURITY SEALS<br />QTY 5,000 · FRAGILE
          </div>
        </div>
        <div style={{...face, transform: `rotateY(180deg) translateZ(${s / 2}px)`}} />
        <div style={{...face, width: s, transform: `rotateY(90deg) translateZ(${s / 2}px)`, background: 'linear-gradient(160deg,#b98a51,#94683a)'}} />
        <div style={{...face, width: s, transform: `rotateY(-90deg) translateZ(${s / 2}px)`}} />
        {/* inner glow when open */}
        <div style={{position: 'absolute', width: s, height: s, transform: `rotateX(90deg) translateZ(${s * 0.7 - s / 2}px) translateY(${-s / 2 + s * 0.35}px)`, background: `radial-gradient(circle, rgba(255,90,70,${0.7 * open}), rgba(40,10,10,.9) 70%)`}} />
        {/* flaps */}
        {[0, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              width: s,
              height: s / 2,
              background: 'linear-gradient(0deg,#c8995e,#b4844d)',
              transformOrigin: k === 0 ? '50% 0%' : '50% 100%',
              transform:
                k === 0
                  ? `rotateX(90deg) translateY(${0}px) translateZ(${s / 2}px) rotateX(${-open * 120}deg)`
                  : `rotateX(90deg) translateY(${-s / 2}px) translateZ(${-0}px) rotateX(${open * 120}deg)`,
              top: 0,
              boxShadow: 'inset 0 0 30px rgba(0,0,0,.25)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** a $100-style banknote (original design) */
export const Bill: React.FC<{w?: number; style?: React.CSSProperties}> = ({w = 300, style}) => (
  <div
    style={{
      width: w,
      height: w * 0.43,
      borderRadius: 6,
      background: 'linear-gradient(135deg,#cfe3c4,#9fc48f 50%,#cfe3c4)',
      boxShadow: 'inset 0 0 0 5px #4e7b49, inset 0 0 0 9px #cfe3c4, inset 0 0 0 11px #4e7b49, 0 10px 30px rgba(0,0,0,.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${w * 0.06}px`,
      fontFamily: 'Playfair Display',
      fontWeight: 900,
      fontSize: w * 0.15,
      color: '#2f5a2c',
      ...style,
    }}
  >
    <span>100</span>
    <span style={{width: w * 0.24, height: w * 0.3, borderRadius: '50%', background: 'radial-gradient(circle,#b9d6ac,#6e9c62)', boxShadow: 'inset 0 0 0 3px #4e7b49'}} />
    <span>100</span>
  </div>
);

/** cash rain (deterministic) between frames a and b */
export const CashRain: React.FC<{a: number; b: number; n?: number}> = ({a, b, n = 26}) => {
  const f = useCurrentFrame();
  if (f < a || f > b + 60) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const start = a + rnd(i + 3) * (b - a);
        const t = f - start;
        if (t < 0) return null;
        const x = rnd(i + 11) * 1080 - 150;
        const y = -250 + t * (14 + rnd(i + 5) * 10);
        const rot = rnd(i + 7) * 360 + t * (rnd(i + 9) - 0.5) * 9;
        const flip = Math.cos(t * 0.15 + i);
        return <Bill key={i} w={260} style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scaleY(${flip})`, opacity: Math.min(1, t / 6)}} />;
      })}
    </AbsoluteFill>
  );
};

/** prison bars that slam down at frame `at` */
export const Bars: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 7, EZ.in);
  const bounce = f > at + 7 ? Math.exp(-(f - at - 7) / 4) * Math.sin((f - at - 7) * 1.4) * 22 : 0;
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - p) * -1900 + bounce}px)`, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, height: 46, background: 'linear-gradient(180deg,#5d636d,#2a2e35)', boxShadow: '0 10px 30px rgba(0,0,0,.6)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 260, height: 46, background: 'linear-gradient(180deg,#5d636d,#2a2e35)'}} />
      {Array.from({length: 7}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 40 + i * 160,
            top: 0,
            bottom: 0,
            width: 44,
            borderRadius: 22,
            background: 'linear-gradient(90deg,#1f2228,#9aa1ac 40%,#4a4f58 60%,#16181c)',
            boxShadow: '12px 0 30px rgba(0,0,0,.55)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** red fries carton with the real arches mark and a peel tab on the side */
export const FriesBox: React.FC<{w?: number; peel?: number; style?: React.CSSProperties}> = ({w = 520, peel = 0, style}) => (
  <div style={{position: 'relative', width: w, height: w * 1.25, ...style}}>
    {/* fries */}
    {Array.from({length: 13}).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: w * (0.16 + (i / 12) * 0.66),
          top: -w * (0.18 + rnd(i + 40) * 0.2),
          width: w * 0.07,
          height: w * 0.62,
          borderRadius: 6,
          background: 'linear-gradient(90deg,#e8a52c,#ffd25e 50%,#d99322)',
          transform: `rotate(${(rnd(i + 2) - 0.5) * 16}deg)`,
          boxShadow: 'inset 0 -6px 10px rgba(150,80,0,.35)',
        }}
      />
    ))}
    <svg viewBox="0 0 100 125" width={w} height={w * 1.25} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="fb" x1="0" x2="1">
          <stop offset="0" stopColor="#a8160d" />
          <stop offset=".35" stopColor="#e2321f" />
          <stop offset=".7" stopColor="#c8200f" />
          <stop offset="1" stopColor="#8f1208" />
        </linearGradient>
      </defs>
      <path d="M6 30 Q50 40 94 30 L84 122 Q50 126 16 122 Z" fill="url(#fb)" />
      <path d="M6 30 Q50 40 94 30 Q50 22 6 30" fill="#f04a35" opacity=".5" />
      <g transform="translate(29 60) scale(1.75)">
        <path d={ARCHES} fill={C.gold} />
      </g>
    </svg>
    {/* peel tab */}
    <div
      style={{
        position: 'absolute',
        left: w * 0.22,
        top: w * 0.98,
        width: w * 0.56,
        height: w * 0.17,
        borderRadius: 8,
        background: 'linear-gradient(90deg,#fff6e0,#f2dfb2)',
        boxShadow: '0 4px 10px rgba(0,0,0,.4)',
        transformOrigin: '0% 50%',
        transform: `perspective(600px) rotateY(${-peel * 150}deg)`,
        backfaceVisibility: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Archivo Black',
        fontSize: w * 0.05,
        color: C.red,
        letterSpacing: 1,
      }}
    >
      PEEL HERE ▸
    </div>
  </div>
);
