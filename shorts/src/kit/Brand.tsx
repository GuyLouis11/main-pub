import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {EZ, prog, spr} from './motion';

/** a real brand mark (simple-icons path, 24×24) drawn on: stroke trace → fill → specular sweep */
export const LogoReveal: React.FC<{
  path: string;
  at: number;
  size: number;
  color: string;
  stroke?: string;
  draw?: number; // frames to trace
  shine?: boolean;
  glow?: string;
  style?: React.CSSProperties;
}> = ({path, at, size, color, stroke, draw = 22, shine = true, glow, style}) => {
  const f = useCurrentFrame();
  const id = React.useId().replace(/:/g, '');
  const p = prog(f, at, at + draw, EZ.inOut);
  const fill = prog(f, at + draw * 0.6, at + draw + 8, EZ.soft);
  const sweep = prog(f, at + draw + 4, at + draw + 26, EZ.inOut);
  const ev = evolvePath(Math.max(0.0001, p), path);
  return (
    <svg viewBox="-1 -1 26 26" width={size} height={size} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${size / 14}px ${glow})` : undefined, ...style}}>
      <defs>
        <linearGradient id={`sh${id}`} x1="0" y1="0" x2="1" y2="0" gradientTransform={`translate(${-1.2 + sweep * 2.4} 0) rotate(20)`}>
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`cp${id}`}><path d={path} /></clipPath>
      </defs>
      <path d={path} fill={color} opacity={fill} />
      <path
        d={path}
        fill="none"
        stroke={stroke || color}
        strokeWidth={0.28}
        strokeLinejoin="round"
        strokeDasharray={ev.strokeDasharray}
        strokeDashoffset={ev.strokeDashoffset}
        opacity={1 - fill * 0.7}
      />
      {shine && sweep > 0 && sweep < 1 && <rect x="-2" y="-2" width="28" height="28" fill={`url(#sh${id})`} clipPath={`url(#cp${id})`} />}
    </svg>
  );
};

/** rolling odometer: value tweened between frames, each digit column slides with motion blur feel */
export const Odometer: React.FC<{
  from: number;
  to: number;
  a: number;
  b: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  commas?: boolean;
}> = ({from, to, a, b, prefix = '', suffix = '', style, digitStyle, commas = true}) => {
  const f = useCurrentFrame();
  const v = from + (to - from) * prog(f, a, b, EZ.inOut);
  const width = Math.max(from, to).toString().length;
  const lead = Math.round(v).toString().length;
  const chars: {c: string; frac: number}[] = [];
  for (let i = 0; i < width; i++) {
    const place = width - 1 - i;
    if (place >= lead) continue;
    const q = v / Math.pow(10, place);
    const base = Math.floor(q) % 10;
    // a column rolls to the next digit only while the column below it wraps 9 → 0 (true odometer behaviour)
    const below = place === 0 ? 0 : (v / Math.pow(10, place - 1)) % 10;
    const frac = place === 0 ? q % 1 : below > 9 ? below - 9 : 0;
    chars.push({c: String(base), frac});
    if (commas && place > 0 && place % 3 === 0) chars.push({c: ',', frac: -1});
  }
  return (
    <div style={{display: 'flex', alignItems: 'baseline', fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix && <span>{prefix}</span>}
      {chars.map((d, i) =>
        d.c === ' ' ? null : d.frac < 0 ? (
          <span key={i} style={digitStyle}>,</span>
        ) : (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', height: '1.05em', lineHeight: '1.05em', verticalAlign: 'bottom', ...digitStyle}}>
            <span style={{display: 'block', transform: `translateY(${-d.frac * 1.05}em)`}}>
              <span style={{display: 'block'}}>{d.c}</span>
              <span style={{display: 'block'}}>{(Number(d.c) + 1) % 10}</span>
            </span>
          </span>
        ),
      )}
      {suffix && <span>{suffix}</span>}
    </div>
  );
};

/** typewriter reveal with a blinking block cursor */
export const Typewriter: React.FC<{text: string; at: number; cps?: number; style?: React.CSSProperties; cursor?: boolean}> = ({
  text,
  at,
  cps = 28,
  style,
  cursor = true,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - at) / fps) * cps)));
  const done = n >= text.length;
  const blink = done ? Math.floor((f - at) / 15) % 2 === 0 : true;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {cursor && f >= at && <span style={{opacity: blink ? 1 : 0}}>▍</span>}
    </span>
  );
};

/** a springy "stamp" (scale-down slam with slight rotation) */
export const useStamp = (at: number, rot = -8) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spr(f, fps, at, {damping: 12, stiffness: 320, mass: 0.7});
  return {
    opacity: f >= at ? 1 : 0,
    transform: `scale(${2.4 - 1.4 * s}) rotate(${rot * s}deg)`,
  };
};
