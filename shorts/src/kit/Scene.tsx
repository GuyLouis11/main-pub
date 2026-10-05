import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EZ, prog} from './motion';
import {motionBlur} from './fx';

export type Tr = 'whipL' | 'whipR' | 'whipU' | 'whipD' | 'zoomIn' | 'zoomOut' | 'fade' | 'punch' | 'none';

const DIST = 1300;

/** transform + blur for a transition at progress p (0 = fully off, 1 = settled) */
const pose = (kind: Tr, p: number, entering: boolean, f: number, a: number, b: number) => {
  const q = 1 - p;
  // velocity estimate for motion blur (px/frame) from the easing slope
  const dp = (prog(f + 1, a, b, entering ? EZ.out : EZ.in) - prog(f - 1, a, b, entering ? EZ.out : EZ.in)) / 2;
  const sign = entering ? 1 : -1;
  switch (kind) {
    case 'whipL':
      return {transform: `translateX(${sign * q * DIST}px)`, filter: motionBlur(dp * DIST, 0), opacity: 1};
    case 'whipR':
      return {transform: `translateX(${-sign * q * DIST}px)`, filter: motionBlur(dp * DIST, 0), opacity: 1};
    case 'whipU':
      return {transform: `translateY(${sign * q * 2000}px)`, filter: motionBlur(0, dp * 2000), opacity: 1};
    case 'whipD':
      return {transform: `translateY(${-sign * q * 2000}px)`, filter: motionBlur(0, dp * 2000), opacity: 1};
    case 'zoomIn': // enter from small/far, exit by flying past camera
      return entering
        ? {transform: `scale(${0.55 + 0.45 * p})`, filter: `blur(${q * 18}px)`, opacity: p}
        : {transform: `scale(${1 + q * 2.6})`, filter: `blur(${q * 22}px)`, opacity: p};
    case 'zoomOut':
      return entering
        ? {transform: `scale(${1 + q * 1.8})`, filter: `blur(${q * 20}px)`, opacity: p}
        : {transform: `scale(${1 - q * 0.4})`, filter: `blur(${q * 14}px)`, opacity: p};
    case 'punch':
      return {transform: `scale(${entering ? 1.18 - 0.18 * p : 1})`, filter: 'none', opacity: entering ? Math.min(1, p * 3) : p};
    case 'fade':
      return {transform: 'none', filter: 'none', opacity: p};
    default:
      return {transform: 'none', filter: 'none', opacity: 1};
  }
};

/** a scene that exists between absolute frames [from, to), with enter/exit transitions of `len` frames */
export const Scene: React.FC<{
  from: number;
  to: number;
  tin?: Tr;
  tout?: Tr;
  lin?: number;
  lout?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  push?: number; // continuous camera push across the scene (scale gain), keeps every frame alive
  origin?: string;
}> = ({from, to, tin = 'fade', tout = 'fade', lin = 9, lout = 9, children, style, push = 0.06, origin = '50% 45%'}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  let tf = 'none';
  let filt = 'none';
  let op = 1;
  if (f < from + lin && tin !== 'none') {
    const p = prog(f, from, from + lin, EZ.out);
    const s = pose(tin, p, true, f, from, from + lin);
    tf = s.transform; filt = s.filter; op = s.opacity;
  } else if (f >= to - lout && tout !== 'none') {
    const p = 1 - prog(f, to - lout, to, EZ.in);
    const s = pose(tout, p, false, f, to - lout, to);
    tf = s.transform; filt = s.filter; op = s.opacity;
  }
  return (
    <AbsoluteFill style={{transform: tf, filter: filt, opacity: op, ...style}}>
      <AbsoluteFill style={{transform: `scale(${1 + push * ((f - from) / Math.max(1, to - from))})`, transformOrigin: origin}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
