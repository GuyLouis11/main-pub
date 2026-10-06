import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import tlData from '../../public/diamonds/timeline.json';
import {makeT, T} from '../kit/timeline';
import {EZ, kf, prog, rnd, spr} from '../kit/motion';
import {Chroma, drift, Flash, FlareSweep, FxDefs, Grain, LightLeaks, Particles, shake, Vignette} from '../kit/fx';
import {Captions} from '../kit/Captions';
import {Scene} from '../kit/Scene';
import {Odometer, Typewriter, useStamp} from '../kit/Brand';
import {Gem, Glints} from '../kit/Gem';
import {HAIRC, Person, SKIN} from '../kit/Person';

const t = makeT(tlData as never);
export const DIAMONDS_FRAMES = t.frames;

const D = {velvet: '#08070c', ice: '#cfe6ff', gold: '#e8c76a', cream: '#f3e9d2', red: '#d8433a', plum: '#2a1530'};
const big: React.CSSProperties = {fontFamily: 'Anton', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: 1};
const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center'};
const velvet = 'radial-gradient(ellipse 80% 55% at 50% 42%, #1d1830 0%, #0c0a14 55%, #040306 100%)';

/** a gold engagement band with prongs, drawn under a gem */
const Band: React.FC<{w: number}> = ({w}) => (
  <svg viewBox="0 0 200 140" width={w} height={w * 0.7} style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="bandg" x1="0" x2="1">
        <stop offset="0" stopColor="#8a6a22" />
        <stop offset=".3" stopColor="#f6dc8e" />
        <stop offset=".55" stopColor="#b98d2f" />
        <stop offset=".8" stopColor="#f2d27a" />
        <stop offset="1" stopColor="#7a5a1a" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="80" rx="88" ry="52" fill="none" stroke="url(#bandg)" strokeWidth="16" />
    <ellipse cx="100" cy="80" rx="88" ry="52" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="40 260" />
    <path d="M78 34 L86 6 M122 34 L114 6 M100 30 L100 2" stroke="url(#bandg)" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

/** small ring icon: lit (with a diamond) or plain */
const RingIcon: React.FC<{lit: number; w?: number}> = ({lit, w = 74}) => (
  <svg viewBox="0 0 40 44" width={w} height={w * 1.1}>
    <ellipse cx="20" cy="30" rx="15" ry="10" fill="none" stroke={lit > 0.5 ? D.gold : '#4a4458'} strokeWidth="3.5" />
    {lit > 0.02 && (
      <g opacity={lit} transform={`translate(20 14) scale(${0.6 + 0.4 * lit})`}>
        <path d="M-9 -2 L-5 -8 L5 -8 L9 -2 L0 10 Z" fill={D.ice} />
        <path d="M-9 -2 L9 -2 M-5 -8 L-2 -2 L0 10 M5 -8 L2 -2" stroke="#7fa6d8" strokeWidth="1" fill="none" />
      </g>
    )}
  </svg>
);

/* ---------- S1: before 1939, one in ten ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fYear = t.find('L01', '1939');
  const fOne = t.find('L01', 'one');
  const inn = 0.55 + 0.45 * spr(f, fps, 0, {damping: 16, stiffness: 80});
  return (
    <AbsoluteFill style={{background: velvet}}>
      <div style={{position: 'absolute', left: 540 - 300, top: 170, transform: `scale(${inn})`, transformOrigin: '50% 60%'}}>
        <div style={{position: 'absolute', left: 50, top: 300}}><Band w={500} /></div>
        <Gem size={600} rotY={f * 0.022} tilt={0.42} />
        <Glints f={f} size={600} spots={[[0.36, 0.4, 4], [0.64, 0.44, 40], [0.5, 0.33, 70]]} />
      </div>
      <div style={{...center, top: 780, ...big, fontSize: 150, color: D.cream, opacity: prog(f, fYear - 4, fYear + 4), letterSpacing: 8}}>1939</div>
      <div style={{position: 'absolute', left: 90, top: 960, display: 'flex', gap: 14, opacity: prog(f, fOne - 6, fOne)}}>
        {Array.from({length: 10}).map((_, i) => <RingIcon key={i} lit={i === 0 ? prog(f, fOne, fOne + 8, EZ.back) : 0} />)}
      </div>
      <div style={{...center, top: 1060, fontFamily: 'Oswald', fontWeight: 700, fontSize: 52, color: D.gold, letterSpacing: 8, opacity: prog(f, fOne + 4, fOne + 12)}}>1 IN 10 HAD A DIAMOND</div>
    </AbsoluteFill>
  );
};

/* ---------- S2-3: one company, most of the trade → London; 1938 ad agency ---------- */
const COUNTRIES = feature(world as never, (world as never as {objects: {countries: never}}).objects.countries) as never as {features: unknown[]};
const PROJ = geoNaturalEarth1().scale(255).translate([540, 700]).rotate([-25, 0]);
const worldPath = geoPath(PROJ);
const MINES: [number, number][] = [[24.7, -24.6], [24.8, -28.7], [15.5, -27.0], [23.6, -6.1], [113.9, 62.5], [-110.6, 64.7], [128.4, -16.7], [17.0, -12.0]];
const LONDON: [number, number] = [-0.13, 51.5];
const TradeScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fComp = t.find('L02', 'company');
  const fMost = t.find('L03', 'most');
  const f38 = t.find('L03', '1938');
  const fAd = t.find('L03', 'ad');
  const L = PROJ(LONDON)!;
  const men = spr(f, fps, f38, {damping: 16, stiffness: 120});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #141a2c, #05060a 80%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - 0.9 * prog(f, f38 - 4, f38 + 8)}}>
        {COUNTRIES.features.map((c, i) => <path key={i} d={worldPath(c as never) || ''} fill="rgba(120,140,190,.16)" stroke="rgba(170,190,240,.3)" strokeWidth={0.8} />)}
        {MINES.map((m, i) => {
          const a = PROJ(m)!;
          const at = fComp - 10 + i * 3;
          const p = prog(f, at, at + 26, EZ.inOut);
          const mx = (a[0] + L[0]) / 2;
          const my = Math.min(a[1], L[1]) - 120;
          const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${L[0]} ${L[1]}`;
          const ev = evolvePath(Math.max(0.001, p), d);
          return (
            <g key={i}>
              <circle cx={a[0]} cy={a[1]} r={9} fill={D.ice} opacity={prog(f, at - 6, at)} />
              <path d={d} fill="none" stroke={D.ice} strokeWidth={3.5} strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{filter: 'drop-shadow(0 0 6px rgba(207,230,255,.9))'}} />
            </g>
          );
        })}
        <circle cx={L[0]} cy={L[1]} r={14 + 6 * prog(f, fMost - 4, fMost + 10)} fill={D.gold} style={{filter: 'drop-shadow(0 0 16px rgba(232,199,106,.9))'}} />
        <text x={L[0]} y={L[1] - 34} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={34} fill="#fff" letterSpacing={3} opacity={prog(f, fComp, fComp + 8)}>ONE SELLER · LONDON</text>
      </svg>
      <div style={{...center, top: 230, ...big, fontSize: 110, color: '#fff', opacity: prog(f, fMost - 4, fMost + 4) * (1 - prog(f, f38 - 4, f38 + 4))}}>
        DE BEERS <span style={{color: D.gold}}>CONTROLLED</span>
        <div style={{fontFamily: 'Oswald', fontSize: 50, color: D.ice, letterSpacing: 8, marginTop: 10}}>MOST OF THE WORLD'S DIAMOND TRADE</div>
      </div>
      {/* 1938: the ad men */}
      <div style={{...center, top: 170, ...big, fontSize: 170, color: D.cream, opacity: prog(f, f38 - 2, f38 + 6), letterSpacing: 10}}>1938</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380 + (1 - men) * 900, opacity: men}}>
        {[
          {x: 20, p: {skin: SKIN[0], hair: 'side' as const, hairColor: HAIRC.brown, outfit: 'suit' as const, cloth: '#3a3428', tie: '#7a2a1a', age: 0.5, hat: 'fedora' as const, mood: 'smirk' as const, seed: 31}},
          {x: 360, p: {skin: SKIN[1], hair: 'side' as const, hairColor: HAIRC.black, outfit: 'suit' as const, cloth: '#2c2c34', tie: '#c9a227', age: 0.4, hat: 'fedora' as const, mood: 'smile' as const, mustache: true, seed: 32}},
          {x: 700, p: {skin: SKIN[0], hair: 'receding' as const, hairColor: HAIRC.grey, outfit: 'vest' as const, cloth: '#4a3a2a', tie: '#2a3a6a', age: 0.7, glasses: true, mood: 'neutral' as const, seed: 33}},
        ].map((m, i) => (
          <div key={i} style={{position: 'absolute', left: m.x, top: i === 1 ? -40 : 0, filter: 'sepia(.35) saturate(.9)'}}>
            <Person {...m.p} w={360} rim="#ffd9a0" look={i === 0 ? 0.6 : i === 2 ? -0.6 : 0} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 140, top: 1020, padding: '16px 34px', background: D.cream, color: '#2a2016', fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 56, transform: `rotate(-2deg) scale(${prog(f, fAd - 4, fAd + 6, EZ.back)})`, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
        N.W. AYER &amp; SON · ADVERTISING
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S4: 1947 — "A Diamond Is Forever" ---------- */
const SloganScene: React.FC = () => {
  const f = useCurrentFrame();
  const f47 = t.find('L04', '1947');
  const fCopy = t.find('L04', 'copywriter');
  const fFour = t.find('L04', 'four');
  const fA = t.find('L04', 'a', 10);
  const ad = prog(f, fA - 2, fA + 16, EZ.inOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2c1c, #0c0805 78%)'}}>
      <div style={{position: 'absolute', left: 60, top: 140, ...big, fontSize: 130, color: D.cream, opacity: prog(f, f47 - 4, f47 + 4) * (1 - ad), letterSpacing: 8}}>1947</div>
      {/* the copywriter at her typewriter */}
      <div style={{position: 'absolute', left: 560, top: 150 + ad * -40, opacity: prog(f, fCopy - 6, fCopy + 4) * (1 - ad * 0.6), filter: 'sepia(.3)'}}>
        <Person skin={SKIN[0]} hair="bob" hairColor={HAIRC.auburn} outfit="blouse" cloth="#3f5a7a" age={0.4} earrings mood={f >= fFour ? 'smile' : 'neutral'} look={-0.6} rim="#ffd9a0" w={400} seed={34} />
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 30, color: D.gold, letterSpacing: 4, textAlign: 'center', marginTop: -20}}>COPYWRITER · N.W. AYER</div>
      </div>
      {/* the typed page becomes the magazine ad */}
      <div style={{position: 'absolute', left: 90 - ad * 0, top: 640 - ad * 420, width: 900, height: 520 + ad * 420, background: 'linear-gradient(170deg,#f6efdd,#e4d6b6)', boxShadow: '0 40px 100px rgba(0,0,0,.6)', transform: `rotate(${-2 + ad * 2}deg)`, overflow: 'hidden'}}>
        {/* the draft page: header + crossed-out attempts before the four words */}
        <div style={{position: 'absolute', left: 50, top: 40, right: 50, fontFamily: 'Special Elite', fontSize: 30, color: '#5a4a34', opacity: Math.max(0, 1 - ad * 2.5), lineHeight: 1.6}}>
          <div style={{letterSpacing: 3}}>N.W. AYER · DE BEERS ACCOUNT · DRAFT SLOGANS</div>
          {['Diamonds: the gift of a lifetime', 'Love, made permanent', 'The stone that says yes'].map((l, i) => (
            <div key={i} style={{position: 'relative', display: 'inline-block', marginRight: 20, color: '#7a6a50'}}>
              {l}
              <div style={{position: 'absolute', left: 0, top: '55%', height: 3, width: `${100 * prog(f, fCopy + i * 6, fCopy + i * 6 + 8)}%`, background: '#b8322a'}} />
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 50, top: 60 + (1 - ad) * 200 + ad * 380, fontFamily: ad > 0.5 ? 'Playfair Display' : 'Special Elite', fontStyle: ad > 0.5 ? 'italic' : 'normal', fontWeight: ad > 0.5 ? 900 : 400, fontSize: 78 + ad * 30, color: '#2a2016', lineHeight: 1.1}}>
          <Typewriter text="A Diamond Is Forever." at={fA} cps={20} cursor={ad < 0.5} />
        </div>
        <div style={{position: 'absolute', left: 290, top: 60, opacity: ad}}>
          <Gem size={320} rotY={f * 0.02} tilt={0.4} glow={0.2} />
        </div>
        <div style={{position: 'absolute', left: 50, right: 50, bottom: 40, fontFamily: 'Playfair Display', fontSize: 30, color: '#5a4a34', opacity: ad, textAlign: 'center', fontStyle: 'italic'}}>
          — a magazine advertisement, 1940s style —
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S5: 8 in 10 brides ---------- */
const BridesScene: React.FC = () => {
  const f = useCurrentFrame();
  const fFew = t.find('L05', 'few');
  const fEight = t.find('L05', 'eight');
  return (
    <AbsoluteFill style={{background: velvet}}>
      <div style={{...center, top: 160, fontFamily: 'Oswald', fontWeight: 700, fontSize: 56, color: D.ice, letterSpacing: 8, opacity: prog(f, fFew - 6, fFew + 2)}}>WITHIN A FEW DECADES</div>
      <div style={{position: 'absolute', left: 60, top: 280, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '30px 20px', width: 960}}>
        {Array.from({length: 10}).map((_, i) => {
          const lit = i < 8 ? prog(f, fEight - 8 + i * 2, fEight + i * 2, EZ.back) : 0;
          return (
            <div key={i} style={{position: 'relative', height: 300, display: 'flex', justifyContent: 'center'}}>
              <div style={{position: 'absolute', top: 0}}>
                <Person skin={SKIN[(i * 2) % 6]} hair={i % 3 === 0 ? 'bun' : i % 3 === 1 ? 'long' : 'bob'} hairColor={[HAIRC.brown, HAIRC.blonde, HAIRC.black, HAIRC.auburn][i % 4]} outfit="blouse" cloth="#f4f1ea" age={0.15} mood={lit > 0.5 ? 'smile' : 'neutral'} rim="#cfe6ff" w={170} seed={40 + i} />
              </div>
              <div style={{position: 'absolute', top: 210}}><RingIcon lit={lit} w={60} /></div>
            </div>
          );
        })}
      </div>
      <div style={{...center, top: 980, ...big, fontSize: 160, color: '#fff', opacity: prog(f, fEight, fEight + 6), textShadow: '0 0 40px rgba(207,230,255,.6)'}}>
        <span style={{color: '#7a7090'}}>1 IN 10</span> → <span style={{color: D.gold}}>8 IN 10</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S6: one month's salary → two ---------- */
const SalaryScene: React.FC = () => {
  const f = useCurrentFrame();
  const fSpend = t.find('L06', 'spend');
  const fOne = t.find('L06', 'one');
  const fTwo = t.find('L06', 'two');
  const stack = (n: number, x: number, at: number) =>
    Array.from({length: n}).map((_, i) => {
      const p = prog(f, at + i * 3, at + i * 3 + 10, EZ.back);
      return (
        <div key={i} style={{position: 'absolute', left: x, top: 820 - i * 60 - (1 - p) * 300, width: 380, height: 220, borderRadius: 14, background: 'linear-gradient(160deg,#efe7d2,#d9caa6)', boxShadow: '0 16px 40px rgba(0,0,0,.5)', opacity: p, transform: `rotate(${(rnd(i + x) - 0.5) * 8}deg)`}}>
          <div style={{position: 'absolute', left: 24, top: 20, fontFamily: 'Oswald', fontWeight: 700, fontSize: 28, color: '#5a4a2a', letterSpacing: 4}}>PAYCHECK</div>
          <div style={{position: 'absolute', right: 24, top: 70, fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 70, color: '#2f5a2c'}}>$$$</div>
          <div style={{position: 'absolute', left: 24, bottom: 24, width: 200, height: 4, background: '#8a7a5a'}} />
        </div>
      );
    });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a2a18, #090905 78%)'}}>
      <div style={{position: 'absolute', left: 80, top: 150, width: 920, padding: '30px 40px', background: D.cream, transform: 'rotate(-1.5deg)', boxShadow: '0 30px 70px rgba(0,0,0,.6)', opacity: prog(f, fSpend - 10, fSpend)}}>
        <div style={{fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: '#2a2016', lineHeight: 1.25}}>
          "Isn't two months' salary a small price to pay for something that lasts forever?"
        </div>
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 28, color: '#8a6a2a', letterSpacing: 4, marginTop: 14}}>— DIAMOND ADVERTISING, 1980s</div>
      </div>
      {stack(1, 140, fOne - 4)}
      {stack(2, 580, fTwo - 4)}
      <div style={{position: 'absolute', left: 140, top: 1080, width: 380, textAlign: 'center', ...big, fontSize: 70, color: D.cream, opacity: prog(f, fOne, fOne + 6)}}>1 MONTH</div>
      <div style={{position: 'absolute', left: 580, top: 1080, width: 380, textAlign: 'center', ...big, fontSize: 70, color: D.gold, opacity: prog(f, fTwo, fTwo + 6)}}>2 MONTHS</div>
    </AbsoluteFill>
  );
};

/* ---------- S7: not rare — 100M+ carats a year; supply controlled ---------- */
const MineScene: React.FC = () => {
  const f = useCurrentFrame();
  const fRare = t.find('L07', 'rare');
  const fMines = t.find('L07', 'mines');
  const fYear = t.find('L07', 'year');
  const fCtrl = t.find('L07', 'controlled');
  const gate = prog(f, fCtrl - 6, fCtrl + 6, EZ.inOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1c1810, #050403 80%)'}}>
      <div style={{...center, top: 140, ...big, fontSize: 96, color: '#fff', opacity: prog(f, fRare - 6, fRare + 2) * (1 - prog(f, fMines - 4, fMines + 2))}}>
        NOT ESPECIALLY <span style={{color: D.red}}>RARE</span>
      </div>
      {/* conveyor of rough stones pouring into a vault */}
      {Array.from({length: 60}).map((_, i) => {
        const at = fMines + rnd(i) * (fCtrl - fMines);
        const tt = f - at;
        if (tt < 0 || tt > 70) return null;
        const blocked = f > fCtrl;
        const y = 260 + tt * 11;
        const stop = blocked ? Math.min(y, 760) : y;
        return <div key={i} style={{position: 'absolute', left: 300 + rnd(i + 4) * 480, top: stop, width: 26 + rnd(i + 2) * 18, height: 22 + rnd(i + 3) * 16, background: 'linear-gradient(135deg,#e8f2ff,#9fb2c8)', clipPath: 'polygon(20% 0, 80% 0, 100% 50%, 70% 100%, 20% 100%, 0 45%)', opacity: 0.9}} />;
      })}
      <div style={{...center, top: 200, opacity: prog(f, fMines - 2, fMines + 6)}}>
        <Odometer from={0} to={100000000} a={fMines} b={fYear + 4} style={{...big, fontSize: 150, color: D.ice, justifyContent: 'center', textShadow: '0 0 40px rgba(207,230,255,.5)'}} />
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 46, color: D.cream, letterSpacing: 8}}>CARATS MINED · EVERY YEAR</div>
      </div>
      {/* the vault and its gate */}
      <div style={{position: 'absolute', left: 190, top: 800, width: 700, height: 360, borderRadius: 20, background: 'linear-gradient(180deg,#3a3f48,#1a1d22)', boxShadow: 'inset 0 0 0 8px #555c68, 0 30px 80px rgba(0,0,0,.6)', overflow: 'hidden'}}>
        {Array.from({length: 5}).map((_, k) => <div key={k} style={{position: 'absolute', left: 30, right: 30, top: 40 + k * 64, height: 10, background: '#2a2e35'}} />)}
        {Array.from({length: 36}).map((_, i) => <div key={i} style={{position: 'absolute', left: 50 + (i % 12) * 50, top: 26 + Math.floor(i / 12) * 64, width: 30, height: 24, background: 'linear-gradient(135deg,#e8f2ff,#8aa0b8)', clipPath: 'polygon(20% 0, 80% 0, 100% 50%, 70% 100%, 20% 100%, 0 45%)', opacity: 0.85}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: `${gate * 100}%`, background: 'repeating-linear-gradient(90deg,#6a717c 0 18px,#3a3f48 18px 40px)', boxShadow: '0 10px 30px rgba(0,0,0,.6)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', ...big, fontSize: 90, color: D.red, opacity: gate, textShadow: '0 4px 20px rgba(0,0,0,.8)'}}>SUPPLY CONTROLLED</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S8: try to sell it back ---------- */
const ResaleScene: React.FC = () => {
  const f = useCurrentFrame();
  const fSell = t.find('L08', 'sell');
  const fFrac = t.find('L08', 'fraction');
  const fHalf = t.find('L08', 'half');
  const offer = kf(f, [[fFrac - 6, 1], [fFrac + 10, 0.42], [fHalf, 0.42], [fHalf + 10, 0.32]], [EZ.inOut, EZ.linear, EZ.inOut]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #2a2018, #080605 78%)'}}>
      {/* jeweler behind the counter with a loupe */}
      <div style={{position: 'absolute', left: 540 - 230, top: 120, opacity: prog(f, fSell - 8, fSell + 2)}}>
        <Person skin={SKIN[1]} hair="receding" hairColor={HAIRC.grey} outfit="vest" cloth="#3a2e24" tie="#6a2a2a" age={0.75} glasses={false} loupe mood={f >= fFrac ? 'stern' : 'neutral'} look={0.2} rim="#ffd9a0" w={460} seed={51} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, height: 40, background: 'linear-gradient(180deg,#5a4030,#2a1c12)', boxShadow: '0 -10px 30px rgba(0,0,0,.5)'}} />
      <div style={{position: 'absolute', left: 390, top: 600}}><Gem size={300} rotY={f * 0.02} tilt={0.5} glow={0.4} /></div>
      {/* paid vs offered */}
      <div style={{position: 'absolute', left: 120, top: 820, width: 840}}>
        {[
          ['YOU PAID', 1, D.gold],
          ['THEY OFFER', offer, D.red],
        ].map(([l, v, c], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', marginBottom: 26, opacity: prog(f, fSell + i * 8, fSell + i * 8 + 8)}}>
            <div style={{width: 260, fontFamily: 'Oswald', fontWeight: 700, fontSize: 44, color: '#fff', letterSpacing: 3}}>{l as string}</div>
            <div style={{height: 70, width: `${(v as number) * 70}%`, background: c as string, borderRadius: 10, boxShadow: `0 0 24px ${c}`}} />
          </div>
        ))}
      </div>
      <div style={{...center, top: 1080, ...big, fontSize: 100, color: D.red, opacity: prog(f, fHalf, fHalf + 6)}}>LESS THAN HALF</div>
    </AbsoluteFill>
  );
};

/* ---------- S9: lab-grown, chemically identical; 61% ---------- */
const LabScene: React.FC = () => {
  const f = useCurrentFrame();
  const fLabs = t.find('L09', 'labs');
  const fId = t.find('L09', 'identical');
  const f61 = t.find('L09', 'sixty-one');
  const plasma = 0.6 + 0.4 * Math.sin(f / 5);
  const pie = prog(f, f61 - 4, f61 + 16, EZ.inOut) * 0.61;
  const R = 150;
  const a = pie * Math.PI * 2;
  const pieD = `M 0 0 L 0 ${-R} A ${R} ${R} 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * R} ${-Math.cos(a) * R} Z`;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #1c1236, #05030a 80%)'}}>
      {/* growth reactor */}
      <div style={{position: 'absolute', left: 140, top: 140, width: 420, height: 560, opacity: prog(f, fLabs - 8, fLabs + 2) * (1 - prog(f, f61 - 6, f61 + 2))}}>
        <div style={{position: 'absolute', left: 60, top: 0, width: 300, height: 500, borderRadius: 150, background: 'linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.22),rgba(255,255,255,.06))', boxShadow: 'inset 0 0 0 6px rgba(200,210,255,.35)'}} />
        <div style={{position: 'absolute', left: 110, top: 160, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(220,150,255,${plasma}), rgba(120,60,255,.25) 50%, transparent 70%)`, filter: 'blur(4px)'}} />
        <div style={{position: 'absolute', left: 135, top: 220}}><Gem size={150} rotY={f * 0.03} tilt={0.5} glow={0.8} /></div>
        <div style={{position: 'absolute', left: 30, top: 500, width: 360, height: 60, borderRadius: 10, background: 'linear-gradient(180deg,#4a4f5a,#22252c)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, color: '#c9b8ff', letterSpacing: 4}}>GROWN IN A LAB · WEEKS</div>
      </div>
      <div style={{position: 'absolute', left: 600, top: 180, opacity: prog(f, fId - 6, fId + 2) * (1 - prog(f, f61 - 6, f61 + 2))}}>
        {['MINED', 'LAB'].map((l, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30}}>
            <Gem size={150} rotY={f * 0.02 + i} tilt={0.45} glow={0.4} />
            <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 40, color: '#fff', letterSpacing: 3, lineHeight: 1.1}}>{l}<br /><span style={{fontSize: 26, color: '#9fe0a0'}}>CARBON ✓ HARDNESS 10 ✓</span></div>
          </div>
        ))}
        <div style={{...big, fontSize: 70, color: '#9fe0a0', marginTop: 10}}>IDENTICAL</div>
      </div>
      {/* 61% */}
      <div style={{position: 'absolute', left: 540 - R, top: 300 - R + 120, opacity: prog(f, f61 - 6, f61 + 2)}}>
        <svg width={R * 2} height={R * 2} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} style={{overflow: 'visible'}}>
          <circle r={R} fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.25)" strokeWidth={3} />
          <path d={pieD} fill="#b69cff" style={{filter: 'drop-shadow(0 0 16px rgba(182,156,255,.8))'}} />
        </svg>
      </div>
      <div style={{...center, top: 800, opacity: prog(f, f61, f61 + 6)}}>
        <div style={{...big, fontSize: 190, color: '#fff'}}>{Math.round(pie * 100)}%</div>
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 40, color: '#c9b8ff', letterSpacing: 5}}>OF COUPLES CHOSE LAB-GROWN · THE KNOT, 2025</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S10: De Beers shut its lab brand; prices −90% ---------- */
const ClosedScene: React.FC = () => {
  const f = useCurrentFrame();
  const fShut = t.find('L10', 'shut');
  const fFell = t.find('L10', 'fell');
  const fNinety = t.find('L10', 'ninety');
  const flip = prog(f, fShut - 2, fShut + 10, EZ.inOut);
  const crash = prog(f, fFell - 6, fNinety + 10, EZ.inOut);
  const pts = Array.from({length: 30}, (_, i) => {
    const x = i / 29;
    const y = x < 0.25 ? 0.1 + x * 0.1 : 0.125 + (x - 0.25) * 1.15 + 0.03 * Math.sin(i * 1.3);
    return `${80 + x * 920 * Math.min(1, crash * 1.05)},${700 + Math.min(0.95, y) * 420}`;
  }).join(' ');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1a1424, #050308 80%)'}}>
      {/* shop window + sign */}
      <div style={{position: 'absolute', left: 120, top: 130, width: 840, height: 460, borderRadius: 16, background: 'linear-gradient(180deg,#22202c,#121018)', boxShadow: 'inset 0 0 0 8px #3a3646'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 64, color: '#e8e2ff', letterSpacing: 4}}>LAB DIAMOND BOUTIQUE</div>
        <div style={{position: 'absolute', left: 300, top: 140, width: 240, height: 150, perspective: 800}}>
          <div style={{position: 'absolute', inset: 0, background: flip < 0.5 ? '#2fbf5a' : D.red, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', ...big, fontSize: 70, color: '#fff', transform: `rotateY(${flip * 180}deg)`}}>
            <span style={{transform: flip >= 0.5 ? 'scaleX(-1)' : 'none'}}>{flip < 0.5 ? 'OPEN' : 'CLOSED'}</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, color: '#b0a8c8', letterSpacing: 4, opacity: prog(f, fShut + 6, fShut + 14)}}>DE BEERS' OWN LAB BRAND · CLOSED 2025</div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: prog(f, fFell - 8, fFell)}}>
        <line x1={80} x2={1000} y1={700} y2={700} stroke="rgba(255,255,255,.12)" strokeWidth={2} />
        <polyline points={pts} fill="none" stroke={D.red} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 14px rgba(216,67,58,.8))'}} />
        <text x={90} y={680} fontFamily="Oswald" fontWeight={700} fontSize={32} fill="#b0a8c8" letterSpacing={3}>LAB-GROWN WHOLESALE PRICE</text>
      </svg>
      <div style={{position: 'absolute', right: 80, top: 960, ...big, fontSize: 170, color: D.red, opacity: prog(f, fNinety, fNinety + 6), textShadow: '0 0 40px rgba(216,67,58,.6)'}}>−90%</div>
    </AbsoluteFill>
  );
};

/* ---------- S11: love… or an ad? (loops to the gem) ---------- */
const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const fLove = t.find('L11', 'love');
  const fAd = t.find('L11', 'ad');
  const loop = prog(f, t.frames - 20, t.frames, EZ.inOut);
  return (
    <AbsoluteFill style={{background: velvet}}>
      <div style={{position: 'absolute', left: 30, top: 380, opacity: 1 - loop}}>
        <Person skin={SKIN[2]} hair="side" hairColor={HAIRC.black} outfit="suit" cloth="#2a2f3a" tie="#8a2a3a" age={0.25} mood="smile" look={0.8} rim="#ffd9e0" w={420} seed={61} />
      </div>
      <div style={{position: 'absolute', left: 630, top: 380, opacity: 1 - loop}}>
        <Person skin={SKIN[0]} hair="long" hairColor={HAIRC.auburn} outfit="blouse" cloth="#f4f1ea" age={0.2} earrings mood="smile" look={-0.8} rim="#ffd9e0" w={420} seed={62} />
      </div>
      <div style={{position: 'absolute', left: 540 - 170, top: 170 + loop * 0, transform: `scale(${1 + loop * 0.75})`, transformOrigin: '50% 60%'}}>
        <Gem size={340} rotY={f * 0.022} tilt={0.42} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 1000, ...big, fontSize: 110, color: '#ff9ab0', opacity: prog(f, fLove - 4, fLove + 4) * (1 - loop)}}>LOVE?</div>
      <div style={{position: 'absolute', right: 60, top: 1000, ...big, fontSize: 110, color: D.gold, opacity: prog(f, fAd - 4, fAd + 4) * (1 - loop)}}>OR AN AD?</div>
    </AbsoluteFill>
  );
};

export const Diamonds: React.FC = () => {
  const f = useCurrentFrame();
  const S = (id: string, off = 0) => t.ls(id, off);
  const hits: [number, number][] = [
    [t.find('L01', 'one'), 10],
    [t.find('L03', '1938'), 12],
    [t.find('L07', 'controlled'), 16],
    [t.find('L08', 'half'), 12],
    [t.find('L10', 'ninety'), 16],
  ];
  return (
    <AbsoluteFill style={{background: D.velvet}}>
      <FxDefs />
      <Audio src={staticFile('diamonds/mix.wav')} />
      <AbsoluteFill style={{transform: `${drift(f, 5, 'dm')} ${shake(f, hits, 'dm')}`}}>
        <Scene from={0} to={S('L02', 0.05)} tin="none" tout="zoomIn">
          <Hook />
        </Scene>
        <Scene from={S('L02', -0.1)} to={S('L04', 0.05)} tin="zoomIn" tout="whipL" push={0.05}>
          <TradeScene />
        </Scene>
        <Scene from={S('L04', -0.1)} to={S('L05', 0.05)} tin="whipL" tout="zoomIn">
          <SloganScene />
        </Scene>
        <Scene from={S('L05', -0.1)} to={S('L06', 0.05)} tin="zoomIn" tout="whipU">
          <BridesScene />
        </Scene>
        <Scene from={S('L06', -0.1)} to={S('L07', 0.05)} tin="whipU" tout="zoomIn">
          <SalaryScene />
        </Scene>
        <Scene from={S('L07', -0.1)} to={S('L08', 0.05)} tin="zoomIn" tout="whipR">
          <MineScene />
        </Scene>
        <Scene from={S('L08', -0.1)} to={S('L09', 0.05)} tin="whipR" tout="zoomIn">
          <ResaleScene />
        </Scene>
        <Scene from={S('L09', -0.1)} to={S('L10', 0.05)} tin="zoomIn" tout="punch">
          <LabScene />
        </Scene>
        <Scene from={S('L10', -0.1)} to={S('L11', 0.05)} tin="punch" tout="zoomOut">
          <ClosedScene />
        </Scene>
        <Scene from={S('L11', -0.1)} to={t.frames} tin="zoomOut" tout="none" push={0.03}>
          <EndScene />
        </Scene>
      </AbsoluteFill>
      <LightLeaks colors={['rgba(150,180,255,.45)', 'rgba(255,220,160,.3)', 'rgba(200,140,255,.3)']} opacity={0.22} seed="dm" />
      <Particles n={44} color="#e8f2ff" opacity={0.3} seed={7} />
      <FlareSweep at={t.find('L04', 'a', 10) - 4} color="#fff3d8" />
      <FlareSweep at={t.find('L09', 'sixty-one') - 4} color="#e8dcff" />
      <Flash at={[t.find('L07', 'controlled')]} peak={0.25} />
      <Captions t={t as T} accent={D.gold} y={1330} />
      <Vignette strength={0.7} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
