import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D, noise3D} from '@remotion/noise';
import {EZ, prog, rnd} from './motion';

/** film grain: 512px tile jittered at 12 fps (stable, never flashes) */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2.5);
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <div
        style={{
          position: 'absolute',
          inset: -256,
          backgroundImage: `url(${staticFile('img/grain.png')})`,
          backgroundSize: '512px 512px',
          transform: `translate(${Math.round(rnd(k) * 256)}px, ${Math.round(rnd(k + 99) * 256)}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill
    style={{pointerEvents: 'none', background: `radial-gradient(ellipse 85% 70% at 50% 45%, transparent 45%, rgba(0,0,0,${strength}) 100%)`}}
  />
);

/** drifting light leaks (screen blend), driven by smooth noise */
export const LightLeaks: React.FC<{colors: string[]; opacity?: number; seed?: string}> = ({colors, opacity = 0.35, seed = 'leak'}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', opacity}}>
      {colors.map((c, i) => {
        const x = 50 + 45 * noise2D(seed + i, t * 0.06, 0);
        const y = 40 + 45 * noise2D(seed + i + 'y', 0, t * 0.05);
        const s = 900 + 400 * noise2D(seed + i + 's', t * 0.04, t * 0.04);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              marginLeft: -s / 2,
              marginTop: -s / 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${c} 0%, transparent 65%)`,
              filter: 'blur(40px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** a hot anamorphic flare sweep for transitions: frame `at`, lasts `dur` */
export const FlareSweep: React.FC<{at: number; dur?: number; color?: string; angle?: number}> = ({at, dur = 16, color = '#fff2d0', angle = -18}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const p = prog(f, at, at + dur, EZ.inOut);
  const a = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: -600 + p * 2300,
          top: -400,
          width: 420,
          height: 2800,
          transform: `rotate(${angle}deg)`,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: a * 0.85,
          filter: 'blur(30px)',
        }}
      />
      <AbsoluteFill style={{background: color, opacity: a * 0.12}} />
    </AbsoluteFill>
  );
};

/** dust / bokeh particles in three depth layers */
export const Particles: React.FC<{n?: number; color?: string; seed?: number; speed?: number; opacity?: number}> = ({
  n = 60,
  color = '#ffe8b0',
  seed = 1,
  speed = 1,
  opacity = 0.6,
}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: n}).map((_, i) => {
        const depth = rnd(seed * 100 + i);
        const size = 2 + depth * depth * 22;
        const vy = (0.4 + depth * 1.6) * speed;
        const x0 = rnd(seed * 200 + i) * width;
        const y0 = rnd(seed * 300 + i) * (height + 200);
        const y = ((y0 - f * vy) % (height + 200) + height + 200) % (height + 200) - 100;
        const x = x0 + 40 * noise2D('p' + seed + i, f / 140, 0);
        const fadeEdge = Math.min(1, (y + 100) / 200, (height + 100 - y) / 200);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity: opacity * (0.25 + 0.75 * (1 - depth)) * Math.max(0, fadeEdge),
              filter: `blur(${depth > 0.7 ? (depth - 0.6) * 18 : 0.6}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** white (or colored) flash with exponential decay at given frames */
export const Flash: React.FC<{at: number[]; color?: string; peak?: number; decay?: number}> = ({at, color = '#fff', peak = 0.55, decay = 7}) => {
  const f = useCurrentFrame();
  let o = 0;
  at.forEach((a) => {
    if (f >= a) o = Math.max(o, peak * Math.exp(-(f - a) / decay));
    else if (f >= a - 2) o = Math.max(o, peak * 0.4 * ((f - (a - 2)) / 2));
  });
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none', mixBlendMode: 'screen'}} />;
};

/** camera shake from impact frames: [[frame, amplitude px]] → transform string (smooth noise, exponential decay) */
export const shake = (f: number, hits: [number, number][], seed = 's') => {
  let x = 0;
  let y = 0;
  let r = 0;
  hits.forEach(([at, amp], i) => {
    if (f < at) return;
    const d = Math.exp(-(f - at) / 6);
    x += amp * d * noise3D(seed, i, f / 2.2, 0);
    y += amp * d * noise3D(seed, i, 0, f / 2.2);
    r += amp * 0.03 * d * noise3D(seed + 'r', i, f / 3, 0);
  });
  return `translate(${x}px, ${y}px) rotate(${r}deg)`;
};

/** subtle handheld drift for the whole frame */
export const drift = (f: number, amt = 6, seed = 'h') =>
  `translate(${amt * noise2D(seed, f / 90, 0)}px, ${amt * noise2D(seed + 'y', 0, f / 90)}px) rotate(${0.25 * noise2D(seed + 'r', f / 120, 1)}deg)`;

/** RGB-split text/element for impact frames: renders children 3× with channel offsets */
export const Chroma: React.FC<{amt: number; children: React.ReactNode; style?: React.CSSProperties}> = ({amt, children, style}) => {
  if (amt < 0.3) return <div style={style}>{children}</div>;
  return (
    <div style={{position: 'relative', ...style}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-amt}px)`, mixBlendMode: 'screen', filter: 'url(#onlyR)'}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${amt}px)`, mixBlendMode: 'screen', filter: 'url(#onlyB)'}}>{children}</div>
      <div style={{position: 'relative', mixBlendMode: 'screen', filter: 'url(#onlyG)'}}>{children}</div>
    </div>
  );
};

/** shared SVG filter defs (channel isolation + directional blur presets); mount once per composition */
export const FxDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="onlyR"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
      <filter id="onlyG"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
      <filter id="onlyB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
      {[4, 8, 14, 22, 34, 50].map((s) => (
        <React.Fragment key={s}>
          <filter id={`mbx${s}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={`${s} 0`} /></filter>
          <filter id={`mby${s}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={`0 ${s}`} /></filter>
        </React.Fragment>
      ))}
    </defs>
  </svg>
);

/** pick the nearest directional motion-blur filter for a velocity in px/frame */
export const motionBlur = (vx: number, vy: number) => {
  const steps = [4, 8, 14, 22, 34, 50];
  const pick = (v: number) => steps.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
  const ax = Math.abs(vx) * 0.5;
  const ay = Math.abs(vy) * 0.5;
  if (Math.max(ax, ay) < 3) return 'none';
  return ax >= ay ? `url(#mbx${pick(ax)})` : `url(#mby${pick(ay)})`;
};

/** CRT / broadcast look: scanlines, slow rolling bar, slight edge chroma */
export const CRT: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const f = useCurrentFrame();
  const bar = ((f * 6) % 2400) - 300;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: bar, height: 260, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.05), transparent)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,0.75)'}} />
    </AbsoluteFill>
  );
};
