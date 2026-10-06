import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {T, Word} from './timeline';
import {EZ, prog, spr} from './motion';

type Chunk = {words: Word[]; start: number; end: number};

/** group words into 1–3 word punchy chunks (break on punctuation, long words, pauses) */
const chunk = (t: T, maxW = 3, maxC = 13, maxN = 16): Chunk[] => {
  const all = t.lines.flatMap((l) => l.words.map((w, i) => ({...w, last: i === l.words.length - 1})));
  const out: Chunk[] = [];
  let cur: (Word & {last: boolean})[] = [];
  all.forEach((w, i) => {
    cur.push(w);
    const next = all[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length;
    const punct = /[.?!,:…]$/.test(w.w) || w.w.endsWith('...');
    const pause = next ? next.s - w.e > 0.32 : true;
    if (!next || punct || pause || w.last || cur.length >= maxW || chars > maxC || (next && chars + next.w.length > maxN)) {
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

/** Center-screen captions (the big-channel Shorts style): short 1–3 word bursts in the middle of the frame, words
    popping in as they're spoken, keywords on a highlight box that wipes in, varied entrances per burst. `bands`
    moves the caption line per scene ([frame, y] keyframes, glides over 8 frames) so it never covers the key visual. */
export const CenterCaptions: React.FC<{t: T; accent: string; ink?: string; y?: number; bands?: [number, number][]; size?: number; hide?: [number, number][]}> = ({
  t,
  accent,
  ink = '#0b0a0c',
  y = 975,
  bands = [],
  size = 124,
  hide = [],
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chunks = React.useMemo(() => chunk(t, 3, 11, 14), [t]);
  if (hide.some(([a, b]) => f >= a && f < b)) return null;
  const sec = f / fps;
  const idx = chunks.findIndex((c, i) => sec >= c.start - 0.05 && sec < (chunks[i + 1] ? chunks[i + 1].start - 0.05 : c.end + 0.6));
  if (idx < 0) return null;
  const c = chunks[idx];
  const c0 = Math.round((c.start - 0.05) * fps);
  // caption line position: hold the band of the scene we're in, glide between bands
  let cy = y;
  bands.forEach(([bf, by], i) => {
    const prev = i ? bands[i - 1][1] : y;
    if (f >= bf) cy = prev + (by - prev) * prog(f, bf, bf + 8, EZ.inOut);
  });
  const style = idx % 3; // 0 pop, 1 rise, 2 drop
  const pop = spr(f, fps, c0, {damping: style === 0 ? 10 : 14, stiffness: 280, mass: 0.55});
  const tilt = ((idx * 7) % 5) - 2; // −2…2°, settles to a third of it
  const enter =
    style === 0
      ? `scale(${0.55 + 0.45 * pop})`
      : style === 1
        ? `translateY(${(1 - pop) * 70}px) scale(${0.85 + 0.15 * pop})`
        : `translateY(${(pop - 1) * 70}px) scale(${0.85 + 0.15 * pop})`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: cy,
          left: 50,
          right: 50,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px 22px',
          transform: `translateY(-50%) ${enter} rotate(${tilt * (0.33 + 0.67 * (1 - pop))}deg)`,
        }}
      >
        {c.words.map((w, i) => {
          const wf = Math.round(w.s * fps);
          const on = f >= wf - 1;
          const p = spr(f, fps, wf - 1, {damping: 10, stiffness: 320, mass: 0.45});
          const we = Math.round(w.e * fps);
          const box = w.hi ? prog(f, wf - 1, wf + 5, EZ.out) : 0;
          const lift = prog(f, wf - 1, wf + 3, EZ.out) * (1 - prog(f, we + 1, we + 6, EZ.inOut)); // swells while spoken, eases back
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                display: 'inline-block',
                fontFamily: 'Anton',
                fontSize: size * (w.hi ? 1.12 : 1),
                lineHeight: 1.06,
                padding: w.hi ? '0 16px' : 0,
                textTransform: 'uppercase',
                letterSpacing: 1,
                opacity: on ? 1 : 0,
                transform: on ? `translateY(${(1 - p) * 30}px) scale(${0.6 + 0.4 * p + 0.06 * lift}) rotate(${w.hi ? -2 : 0}deg)` : 'scale(.6)',
              }}
            >
              {w.hi && (
                <span
                  style={{
                    position: 'absolute',
                    inset: '6% 0 2% 0',
                    borderRadius: 16,
                    background: accent,
                    boxShadow: `0 10px 30px rgba(0,0,0,.55), 0 0 ${26 * box}px ${accent}`,
                    clipPath: `inset(0 ${100 - box * 100}% 0 0 round 16px)`,
                  }}
                />
              )}
              <span style={{position: 'relative', color: '#ffffff', WebkitTextStroke: '14px #050608', paintOrder: 'stroke fill', opacity: 1 - box, textShadow: `0 10px 28px rgba(0,0,0,.8)${lift ? `, 0 0 ${24 * lift}px rgba(255,255,255,.45)` : ''}`}}>{clean(w.w)}</span>
              {w.hi && <span style={{position: 'absolute', left: 16, top: 0, color: ink, opacity: box}}>{clean(w.w)}</span>}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
