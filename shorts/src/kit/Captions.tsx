import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, Word} from './timeline';
import {EZ, prog, spr} from './motion';

type Chunk = {words: Word[]; start: number; end: number};

/** group words into 1–3 word punchy chunks (break on punctuation, long words, pauses) */
const chunk = (t: T): Chunk[] => {
  const all = t.lines.flatMap((l) => l.words.map((w, i) => ({...w, last: i === l.words.length - 1})));
  const out: Chunk[] = [];
  let cur: (Word & {last: boolean})[] = [];
  all.forEach((w, i) => {
    cur.push(w);
    const next = all[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length;
    const punct = /[.?!,:…]$/.test(w.w) || w.w.endsWith('...');
    const pause = next ? next.s - w.e > 0.32 : true;
    if (!next || punct || pause || w.last || cur.length >= 3 || chars > 13 || (next && chars + next.w.length > 16)) {
      out.push({words: cur, start: cur[0].s, end: w.e});
      cur = [];
    }
  });
  return out;
};

const clean = (w: string) => w.replace(/\.\.\.$/, '…').toUpperCase();

export const Captions: React.FC<{t: T; accent: string; y?: number; font?: string; size?: number; hide?: [number, number][]}> = ({
  t,
  accent,
  y = 1240,
  font = 'Anton',
  size = 118,
  hide = [],
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chunks = React.useMemo(() => chunk(t), [t]);
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  const sec = f / fps;
  const idx = chunks.findIndex((c, i) => sec >= c.start - 0.05 && sec < (chunks[i + 1] ? chunks[i + 1].start - 0.05 : c.end + 0.6));
  if (idx < 0) return null;
  const c = chunks[idx];
  const c0 = Math.round((c.start - 0.05) * fps);
  const pop = spr(f, fps, c0, {damping: 13, stiffness: 260, mass: 0.6});
  const tilt = (idx % 2 ? 1 : -1) * 1.2;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: y,
          left: 70,
          right: 70,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0 26px',
          transform: `translateY(${(1 - pop) * 40}px) scale(${0.82 + 0.18 * pop}) rotate(${tilt * (1 - pop)}deg)`,
        }}
      >
        {c.words.map((w, i) => {
          const wf = Math.round(w.s * fps);
          const on = f >= wf - 1;
          const p = spr(f, fps, wf - 1, {damping: 11, stiffness: 300, mass: 0.5});
          const active = sec >= w.s - 0.03 && sec < w.e + 0.08;
          const glow = active ? prog(f, wf - 1, wf + 4, EZ.out) : 0;
          const col = w.hi ? accent : '#ffffff';
          return (
            <span
              key={i}
              style={{
                fontFamily: font,
                fontSize: size * (w.hi ? 1.08 : 1),
                lineHeight: 1.04,
                color: col,
                textTransform: 'uppercase',
                letterSpacing: 1,
                WebkitTextStroke: '14px #050608',
                paintOrder: 'stroke fill',
                opacity: on ? 1 : 0.0,
                display: 'inline-block',
                transform: on ? `translateY(${(1 - p) * 26}px) scale(${0.7 + 0.3 * p + (active && w.hi ? 0.05 : 0)})` : 'scale(.7)',
                textShadow: `0 10px 28px rgba(0,0,0,.75)${glow ? `, 0 0 ${30 * glow}px ${w.hi ? accent : 'rgba(255,255,255,.55)'}` : ''}`,
              }}
            >
              {clean(w.w)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
