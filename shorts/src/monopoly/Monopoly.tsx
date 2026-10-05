import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import tlData from '../../public/monopoly/timeline.json';
import {makeT, T} from '../kit/timeline';
import {EZ, kf, prog, rnd, spr} from '../kit/motion';
import {Chroma, drift, Flash, FlareSweep, FxDefs, Grain, LightLeaks, motionBlur, Particles, shake, Vignette} from '../kit/fx';
import {Captions} from '../kit/Captions';
import {Scene} from '../kit/Scene';
import {LogoReveal, Odometer, Typewriter, useStamp} from '../kit/Brand';
import {CAST, HAIRC, Person, SKIN} from '../kit/Person';
import {geoAlbersUsa, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import usStates from 'us-atlas/states-albers-10m.json';
import {ARCHES, Bars, BoxIso, C, CashRain, Envelope, FriesBox, GamePiece, GateSign, Stall, Tiles} from './art';

const t = makeT(tlData as never);
export const MONOPOLY_FRAMES = t.frames;

const big: React.CSSProperties = {fontFamily: 'Anton', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: 1};
const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center'};

/* ---------- S1a: the hook — a million-dollar piece, the real arches ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fM = t.find('L01', 'mcdonald');
  const fMil = t.find('L01', 'million');
  const fMono = t.find('L01', 'monopoly');
  const pin = 0.35 + 0.65 * spr(f, fps, 0, {damping: 16, stiffness: 90});
  const ry = kf(f, [[0, -32], [140, 14]], EZ.soft);
  const slam = spr(f, fps, fMil, {damping: 11, stiffness: 260});
  const imp = f >= fMil ? Math.exp(-(f - fMil) / 5) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 48%, #3a0d0a 0%, #120708 55%, #050405 100%)'}} />
      <div style={{...center, top: 200, display: 'flex', justifyContent: 'center'}}>
        <LogoReveal path={ARCHES} at={fM - 4} size={250} color={C.gold} glow="rgba(255,199,44,.7)" />
      </div>
      <div
        style={{
          ...center,
          top: 470,
          fontFamily: 'Oswald',
          fontWeight: 700,
          fontSize: 54,
          color: C.cream,
          letterSpacing: kf(f, [[fMono - 4, 40], [fMono + 20, 14]], EZ.out),
          opacity: prog(f, fMono - 4, fMono + 6),
        }}
      >
        McDONALD'S MONOPOLY
      </div>
      <div style={{...center, top: 560, transform: `scale(${f >= fMil ? 2.2 - 1.2 * slam : 0})`, opacity: f >= fMil ? 1 : 0}}>
        <Chroma amt={imp * 16}>
          <div style={{...big, fontSize: 210, color: C.gold, textShadow: '0 0 60px rgba(255,199,44,.55), 0 14px 0 #7a1a10'}}>$1,000,000</div>
        </Chroma>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: 830,
          transform: `perspective(1400px) rotateY(${ry}deg) rotateX(12deg) scale(${0.55 + 0.45 * pin}) translateY(${(1 - pin) * 200}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <GamePiece name="BOARDWALK" strip={C.blue} w={600} foil={prog(f, 8, 46, EZ.inOut) < 1 ? prog(f, 8, 46, EZ.inOut) : prog(f, 90, 128, EZ.inOut)} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S1b/S2: an airport stall; the man hired to protect them ---------- */
const StallScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fStall = t.find('L01', 'stall');
  const fMan = t.find('L02', 'man');
  const fProt = t.find('L02', 'protect');
  const fThem = t.we('L02', -1);
  const rise = spr(f, fps, fMan - 6, {damping: 18, stiffness: 80});
  const strike = prog(f, fThem - 6, fThem + 6, EZ.inOut);
  const glint = f >= fProt ? Math.exp(-(f - fProt) / 8) : 0;
  return (
    <AbsoluteFill>
      <Tiles />
      <GateSign />
      <Stall occupied={f >= fStall ? 1 : 0} top={300} h={930} />
      {/* the gap under the door: light spill, dress shoes, a briefcase */}
      <div style={{position: 'absolute', left: 190, top: 1230, width: 700, height: 70, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,240,200,.45), rgba(0,0,0,.6) 75%)'}} />
      {[0, 1].map((k) => (
        <div key={k} style={{position: 'absolute', left: 430 + k * 120, top: 1252, width: 96, height: 34, borderRadius: '40px 50px 8px 8px', background: 'linear-gradient(180deg,#3a2a1f,#120c08)', boxShadow: '0 6px 10px rgba(0,0,0,.7)', transform: `translateX(${k ? 0 : Math.sin(f / 9) * 2}px)`}}>
          <div style={{position: 'absolute', left: 14, top: 6, width: 40, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.25)'}} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 300, top: 1238, width: 110, height: 52, borderRadius: 8, background: 'linear-gradient(160deg,#7a5530,#3e2814)', boxShadow: 'inset 0 0 0 3px #2a1a0c'}} />
      <div style={{position: 'absolute', left: 540 - 300, top: 560 + (1 - rise) * 900, opacity: rise}}>
        <Person {...CAST.jerry} w={600} rim="#ffd27a" mood={f >= fProt ? 'smirk' : 'neutral'} look={0.3} />
        <div style={{position: 'absolute', left: 250, top: 560, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,230,140,${glint}), transparent 65%)`, mixBlendMode: 'screen'}} />
      </div>
      <div style={{...center, top: 470, opacity: prog(f, fMan, fMan + 8), transform: `translateY(${(1 - prog(f, fMan, fMan + 12)) * 30}px)`}}>
        <div style={{display: 'inline-block', position: 'relative', fontFamily: 'Oswald', fontWeight: 700, fontSize: 70, color: '#fff', letterSpacing: 6, padding: '10px 26px', background: 'rgba(5,5,8,.72)', borderRadius: 8}}>
          HIRED TO <span style={{color: C.gold}}>PROTECT</span>
          <div style={{position: 'absolute', left: '44%', top: '50%', height: 9, width: `${54 * strike}%`, background: C.red, boxShadow: `0 0 18px ${C.red}`, transform: 'rotate(-4deg)', borderRadius: 4}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S3: the personnel file ---------- */
const FileScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = t.ls('L03');
  const fCop = t.find('L03', 'ex-cop');
  const fSec = t.find('L03', 'security');
  const fGame = t.find('L03', 'company');
  const card = spr(f, fps, a - 2, {damping: 15, stiffness: 120});
  const stamp = useStamp(fCop, -12);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2b2219, #0c0a08 75%)'}}>
      {/* manila folder */}
      <div style={{position: 'absolute', left: 80, top: 230, width: 920, height: 1000, borderRadius: 18, background: 'linear-gradient(170deg,#d8b878,#b8955a)', transform: 'rotate(-3deg)', boxShadow: '0 40px 120px rgba(0,0,0,.7)'}}>
        <div style={{position: 'absolute', left: 40, top: -46, width: 300, height: 60, borderRadius: '14px 14px 0 0', background: '#d2b272'}} />
        <div style={{position: 'absolute', right: 50, top: 40, fontFamily: 'Special Elite', fontSize: 36, color: '#5a4320'}}>CASE FILE · SIMON MARKETING</div>
        <div style={{position: 'absolute', right: 90, bottom: 60, width: 200, height: 200, borderRadius: '50%', border: '14px solid rgba(110,70,30,.25)', filter: 'blur(1px)'}} />
        <div style={{position: 'absolute', left: 70, top: 690, fontFamily: 'Special Elite', fontSize: 30, color: '#4a3818', lineHeight: 1.5, whiteSpace: 'pre'}}>
          {'ROLE: escorts winning game pieces\nACCESS: printer, packaging plants\nNOTES: former police officer'}
        </div>
      </div>
      <svg width="90" height="200" style={{position: 'absolute', left: 190, top: 330, transform: 'rotate(-8deg)', zIndex: 2}}>
        <path d="M30 10 L30 160 Q30 185 50 185 Q70 185 70 160 L70 40 Q70 25 58 25 Q46 25 46 40 L46 150" fill="none" stroke="#c9ced6" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 380,
          width: 780,
          height: 470,
          borderRadius: 24,
          background: 'linear-gradient(160deg,#f7f3ea,#e3dccd)',
          boxShadow: '0 30px 80px rgba(0,0,0,.55)',
          transform: `perspective(1600px) rotateY(${(1 - card) * -70}deg) rotateZ(${2 - 2 * card}deg) translateX(${(1 - card) * 500}px)`,
          overflow: 'hidden',
        }}
      >
        <div style={{height: 92, background: C.red, color: '#fff', fontFamily: 'Oswald', fontWeight: 700, fontSize: 40, letterSpacing: 6, display: 'flex', alignItems: 'center', paddingLeft: 36}}>SECURITY · ALL ACCESS</div>
        <div style={{position: 'absolute', left: 36, top: 126, width: 230, height: 290, borderRadius: 12, background: 'linear-gradient(180deg,#9aa3b1,#59606c)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -25, top: -38}}><Person {...CAST.jerry} w={280} rim="#cfe0ff" lanyard={false} /></div>
        </div>
        <div style={{position: 'absolute', left: 300, top: 140, fontFamily: 'Special Elite', fontSize: 46, color: '#1c1a17', lineHeight: 1.2}}>
          <Typewriter text="JEROME P." at={t.find('L03', 'jerry')} cps={26} cursor={false} />
          <br />
          <Typewriter text="JACOBSON" at={t.find('L03', 'jacobson')} cps={24} cursor={false} />
        </div>
        <div style={{position: 'absolute', left: 300, top: 290, fontFamily: 'Oswald', fontWeight: 700, fontSize: 40, color: C.red, letterSpacing: 3, opacity: prog(f, fSec - 3, fSec + 6)}}>
          DIRECTOR OF SECURITY
        </div>
        <div style={{position: 'absolute', left: 300, top: 350, fontFamily: 'Inter', fontWeight: 600, fontSize: 28, color: '#555', opacity: prog(f, fGame - 3, fGame + 8)}}>
          Runs the game for McDonald's
        </div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 880, ...stamp}}>
        <div style={{border: `10px solid ${C.red}`, color: C.red, fontFamily: 'Archivo Black', fontSize: 92, padding: '6px 26px', borderRadius: 14, letterSpacing: 4, opacity: 0.9, mixBlendMode: 'multiply'}}>EX-COP</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S4: escort route across a real US map, with the auditor watching ---------- */
const PROJ = geoAlbersUsa().scale(1300).translate([487.5, 305]); // the projection us-atlas "albers" files are baked in
const STATES = feature(usStates as never, (usStates as never as {objects: {states: never}}).objects.states) as never as {features: {id: string}[]};
const statePath = geoPath(null);
const MAP_S = 1.04;
const MAP_X = 30;
const MAP_Y = 250;
const P = (lon: number, lat: number) => {
  const q = PROJ([lon, lat])!;
  return {x: MAP_X + q[0] * MAP_S, y: MAP_Y + q[1] * MAP_S};
};
const ORIGIN = P(-84.39, 33.75); // Georgia, where Jerry was based
const PLANTS = [P(-87.65, 41.85), P(-96.8, 32.78), P(-118.24, 34.05), P(-75.16, 39.95)];
const arc = (a: {x: number; y: number}, b: {x: number; y: number}) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.35;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
};
const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = t.find('L04', 'escort') - 4;
  const fAud = t.find('L04', 'auditor');
  const fWatch = t.find('L04', 'watching');
  const end = t.le('L04') + 4;
  const seg = (end - a) / PLANTS.length;
  const cur = Math.min(PLANTS.length - 1, Math.max(0, Math.floor((f - a) / seg)));
  const cp = prog(f, a + cur * seg, a + (cur + 1) * seg, EZ.inOut);
  const route = arc(ORIGIN, PLANTS[cur]);
  const L = getLength(route);
  const pt = getPointAtLength(route, Math.max(0.001, cp) * L) ?? ORIGIN;
  const ptA = getPointAtLength(route, Math.max(0.001, cp - 0.16) * L) ?? ORIGIN;
  const audIn = spr(f, fps, fAud - 4, {damping: 14, stiffness: 160});
  const jerIn = spr(f, fps, a, {damping: 14, stiffness: 160});
  const scan = f >= fWatch ? (Math.sin((f - fWatch) / 6) + 1) / 2 : 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #102038, #04070d 80%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${MAP_X} ${MAP_Y}) scale(${MAP_S})`}>
          {STATES.features.map((st, i) => (
            <path key={i} d={statePath(st as never) || ''} fill={st.id === '13' ? 'rgba(255,199,44,.22)' : 'rgba(90,130,200,.12)'} stroke="rgba(150,185,255,.38)" strokeWidth={0.9} />
          ))}
        </g>
        {PLANTS.map((pl, i) => {
          const d = arc(ORIGIN, pl);
          const done = i < cur ? 1 : i === cur ? cp : 0;
          const ev = evolvePath(Math.max(0.001, done), d);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(255,199,44,.18)" strokeWidth={4} strokeDasharray="3 12" />
              <path d={d} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{filter: 'drop-shadow(0 0 8px rgba(255,199,44,.8))'}} />
              <circle cx={pl.x} cy={pl.y} r={done >= 1 ? 13 : 9} fill={done >= 1 ? C.gold : '#3a4a6e'} />
              <text x={pl.x} y={pl.y - 22} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={26} fill={done >= 1 ? '#fff' : '#7d8db0'} letterSpacing={2}>PLANT</text>
            </g>
          );
        })}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={16} fill={C.red} style={{filter: 'drop-shadow(0 0 12px rgba(218,41,28,.9))'}} />
        <text x={ORIGIN.x + 10} y={ORIGIN.y + 52} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={28} fill="#ffd7cf" letterSpacing={2}>WINNING PIECES</text>
        {/* auditor trailing the briefcase */}
        <g opacity={prog(f, fAud - 4, fAud + 4)} transform={`translate(${ptA.x} ${ptA.y})`}>
          <circle r={26} fill="none" stroke="#59c8ff" strokeWidth={3} opacity={0.5 + 0.5 * scan} />
          <circle r={11} fill="#59c8ff" />
        </g>
      </svg>
      {/* briefcase traveling the arc */}
      <div style={{position: 'absolute', left: pt.x - 46, top: pt.y - 70, width: 92, height: 64}}>
        <div style={{position: 'absolute', left: 28, top: -12, width: 34, height: 16, border: '6px solid #3a2a18', borderBottom: 'none', borderRadius: '10px 10px 0 0'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(160deg,#8a6236,#4a301a)', boxShadow: '0 10px 24px rgba(0,0,0,.6), inset 0 0 0 3px #2e1d0f'}} />
        <div style={{position: 'absolute', left: 36, top: 22, width: 20, height: 16, borderRadius: 3, background: C.gold}} />
      </div>
      {/* portrait cards: Jerry escorts, the auditor watches */}
      {[
        {p: CAST.jerry, label: 'JERRY · ESCORT', x: 60, inn: jerIn, look: 0.6, rim: '#ffd27a', col: C.gold},
        {p: CAST.auditor, label: 'AUDITOR · WATCHING', x: 560, inn: audIn, look: -1, rim: '#9fe0ff', col: '#9fe0ff'},
      ].map((c, i) => (
        <div key={i} style={{position: 'absolute', left: c.x, top: 900 + (1 - c.inn) * 500, width: 460, height: 360, borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(180deg,#1a2438,#0b111c)', boxShadow: `0 20px 60px rgba(0,0,0,.6), inset 0 0 0 2px ${i && scan ? `rgba(159,224,255,${0.3 + 0.6 * scan})` : 'rgba(255,255,255,.12)'}`}}>
          <div style={{position: 'absolute', left: 60, top: -10}}><Person {...c.p} w={340} rim={c.rim} look={c.look} /></div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px', background: 'rgba(4,7,13,.85)', fontFamily: 'Oswald', fontWeight: 700, fontSize: 32, color: c.col, letterSpacing: 4}}>{c.label}</div>
          {i === 1 && <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 80}%`, height: 3, background: 'rgba(159,224,255,.7)', boxShadow: '0 0 14px #9fe0ff', opacity: scan > 0 ? 1 : 0}} />}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* ---------- S5: the supplier's mistake ---------- */
const BoxScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = t.ls('L05');
  const fSlip = t.find('L05', 'slipped');
  const fMail = t.find('L05', 'mailed');
  const fSeal = t.find('L05', 'tamper');
  const drop = spr(f, fps, a, {damping: 10, stiffness: 140});
  const open = prog(f, fMail + 6, fMail + 22, EZ.out);
  const stamp = useStamp(fSlip, 9);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, #2a1a12, #0a0706 75%)'}}>
      <div style={{position: 'absolute', left: 540 - 260, top: 470 - (1 - drop) * 1200, transform: `rotate(${kf(f, [[a, -4], [a + 140, 2]], EZ.soft)}deg)`}}>
        <BoxIso open={open} w={520} />
      </div>
      {/* seals fanning out of the box */}
      {Array.from({length: 7}).map((_, i) => {
        const s = spr(f, fps, fSeal + i * 2, {damping: 14, stiffness: 120});
        const ang = -75 + i * 25;
        const r = 400 * s;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 - 130 + Math.sin((ang * Math.PI) / 180) * r,
              top: 640 - Math.cos((ang * Math.PI) / 180) * r,
              width: 260,
              height: 74,
              borderRadius: 8,
              background: 'repeating-linear-gradient(-45deg,#c81d12 0 14px,#e8463b 14px 28px)',
              color: '#fff',
              fontFamily: 'Oswald',
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${ang * 0.6}deg) scale(${s})`,
              opacity: s,
              boxShadow: '0 10px 24px rgba(0,0,0,.5)',
            }}
          >
            VOID IF OPENED
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 90, top: 1000, zIndex: 5, ...stamp}}>
        <div style={{background: 'rgba(10,7,6,.55)', border: '9px solid #ff4b3a', color: '#ff4b3a', fontFamily: 'Archivo Black', fontSize: 84, padding: '4px 24px', borderRadius: 12, letterSpacing: 4}}>MISTAKE</div>
      </div>

    </AbsoluteFill>
  );
};

/* ---------- S6: open, reseal, nobody knows ---------- */
const EnvelopeScene: React.FC = () => {
  const f = useCurrentFrame();
  const fRe = t.find('L06', 'reseal');
  const fEnv = t.find('L06', 'envelopes');
  const fNo = t.find('L06', 'nobody');
  const open = kf(f, [[fRe - 6, 0], [fRe + 6, 1], [fEnv + 10, 1], [fEnv + 20, 0]], [EZ.out, EZ.linear, EZ.in]);
  const oldSeal = 1 - prog(f, fRe - 10, fRe - 2);
  const newSeal = prog(f, fEnv + 20, fEnv + 26, EZ.back);
  const pieceUp = kf(f, [[fRe + 4, 0], [fRe + 14, 1], [fEnv + 8, 1], [fEnv + 18, 0]], [EZ.out, EZ.linear, EZ.in]);
  const eye = prog(f, fNo, fNo + 14, EZ.inOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a2116, #090806 75%)'}}>
      <div style={{position: 'absolute', left: 540 - 220, top: 520 - pieceUp * 260, opacity: pieceUp > 0.02 ? 1 : 0}}>
        <GamePiece name="BOARDWALK" strip={C.blue} w={440} foil={prog(f, fRe + 10, fRe + 34)} />
      </div>
      <div style={{position: 'absolute', left: 540 - 330, top: 560}}>
        <Envelope open={open} seal={f < fEnv ? oldSeal : newSeal} w={660} label={'OFFICIAL GAME PIECES\nHANDLE UNDER SEAL'} />
      </div>
      {/* the eye closing */}
      <svg viewBox="0 0 200 100" width={420} height={210} style={{position: 'absolute', left: 330, top: 260, opacity: prog(f, fNo - 6, fNo + 4)}}>
        <path d="M10 50 Q100 -10 190 50 Q100 110 10 50Z" fill="#f2efe8" />
        <circle cx="100" cy="50" r="26" fill="#2a6fdb" />
        <circle cx="100" cy="50" r="12" fill="#06070a" />
        <path d={`M10 50 Q100 ${-10 + eye * 60} 190 50 Q100 ${110 - eye * 0} 10 50Z`} fill="#0a0908" opacity={eye > 0 ? 1 : 0} clipPath="none" />
        <path d={`M10 50 Q100 ${-10 + eye * 60} 190 50`} fill="none" stroke="#c9c2b3" strokeWidth={5} />
      </svg>
      <div style={{...center, top: 1060, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 104, color: C.cream, opacity: prog(f, fNo, fNo + 10)}}>
        nobody would know.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S7: the swap in the stall ---------- */
const SwapScene: React.FC = () => {
  const f = useCurrentFrame();
  const fAir = t.find('L07', 'airport');
  const fSwap = t.find('L07', 'swap');
  const p = prog(f, fSwap - 2, fSwap + 10, EZ.inOut);
  const v = (prog(f + 1, fSwap - 2, fSwap + 10, EZ.inOut) - prog(f - 1, fSwap - 2, fSwap + 10, EZ.inOut)) / 2;
  const plane = prog(f, fAir - 6, fAir + 22, EZ.inOut);
  const pos = (side: number) => {
    const x = 540 + side * 255 * Math.cos(Math.PI * p);
    const y = 700 - side * 0 - Math.sin(Math.PI * p) * 220 * side;
    return {x, y};
  };
  const W = pos(-1);
  const D = pos(1);
  const blur = motionBlur(v * 480, 0);
  return (
    <AbsoluteFill>
      <Tiles tint="#bcd0cb" />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 45% at 50% 40%, rgba(255,255,255,.08), rgba(0,0,0,.65) 80%)'}} />
      {/* plane overhead */}
      <svg viewBox="0 0 24 24" width={260} height={260} style={{position: 'absolute', left: -300 + plane * 1700, top: 120, transform: 'rotate(90deg)', opacity: plane > 0 && plane < 1 ? 0.9 : 0, filter: motionBlur(60, 0)}}>
        <path fill="#e8eef8" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
      </svg>
      <div style={{position: 'absolute', left: W.x - 235, top: W.y - 145, filter: blur}}>
        <GamePiece name="BOARDWALK" strip={C.blue} w={470} foil={prog(f, fSwap + 10, fSwap + 30)} />
        <div style={{...center, top: 310, fontFamily: 'Oswald', fontWeight: 700, fontSize: 46, color: C.gold, letterSpacing: 4}}>WINNER</div>
      </div>
      <div style={{position: 'absolute', left: D.x - 235, top: D.y - 145, filter: blur}}>
        <GamePiece name="MEDITERRANEAN" strip="#6b3b22" w={470} dud />
        <div style={{...center, top: 310, fontFamily: 'Oswald', fontWeight: 700, fontSize: 46, color: '#b9b2a2', letterSpacing: 4}}>DUD</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1080, height: 40, background: `radial-gradient(ellipse at 50% 50%, rgba(218,41,28,.55), transparent 70%)`}} />
    </AbsoluteFill>
  );
};

/* ---------- S8: the network ---------- */
const BOARD = [
  {x: 540, y: 560, l: 'UNCLE JERRY', r: -2, who: {...CAST.jerry, mood: 'smirk' as const, lanyard: false}},
  {x: 230, y: 330, l: 'FAMILY', r: -6, w: 'family', who: {skin: SKIN[0], hair: 'long' as const, hairColor: HAIRC.blonde, outfit: 'blouse' as const, cloth: '#3f6ea8', mood: 'smile' as const, age: 0.25, seed: 4}},
  {x: 850, y: 330, l: 'FRIENDS', r: 5, w: 'friends', who: {skin: SKIN[2], hair: 'side' as const, hairColor: HAIRC.brown, outfit: 'sweater' as const, cloth: '#7a5b3a', mood: 'smirk' as const, age: 0.35, stubble: true, seed: 6}},
  {x: 240, y: 880, l: 'STRANGERS', r: 4, w: 'strangers', who: {skin: SKIN[4], hair: 'curly' as const, hairColor: HAIRC.black, outfit: 'tee' as const, cloth: '#6a3b8a', mood: 'neutral' as const, age: 0.2, seed: 2}},
  {x: 840, y: 880, l: 'CASH BUYERS', r: -5, w: 'cash', who: {skin: SKIN[1], hair: 'bald' as const, hairColor: HAIRC.grey, outfit: 'suit' as const, cloth: '#3a3a3a', tie: '#c9a227', mood: 'stern' as const, age: 0.6, beard: true, seed: 10}},
];
const NetworkScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fSold = t.find('L08', 'sold');
  const fCash = t.find('L08', 'cash');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #6e4a2c, #2a1a0e 80%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundSize: '256px', mixBlendMode: 'multiply', opacity: 0.55}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {BOARD.slice(1).map((n, i) => {
          const at = t.find('L08', n.w!) - 2;
          const p = prog(f, at, at + 10, EZ.out);
          const sag = 60;
          const d = `M ${BOARD[0].x} ${BOARD[0].y} Q ${(BOARD[0].x + n.x) / 2} ${(BOARD[0].y + n.y) / 2 + sag} ${n.x} ${n.y}`;
          const ev = evolvePath(Math.max(0.001, p), d);
          return <path key={i} d={d} stroke="#d01e1e" strokeWidth={6} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.5))'}} />;
        })}
      </svg>
      {BOARD.map((n, i) => {
        const at = i === 0 ? fSold - 6 : t.find('L08', n.w!) - 4;
        const s = spr(f, fps, at, {damping: 12, stiffness: 200});
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: n.x - 130,
              top: n.y - 150,
              width: 260,
              height: 300,
              background: '#f4f1ea',
              padding: 16,
              boxShadow: '0 18px 40px rgba(0,0,0,.55)',
              transform: `rotate(${n.r}deg) scale(${s})`,
              opacity: s,
            }}
          >
            <div style={{position: 'relative', width: 228, height: 200, background: i === 0 ? 'linear-gradient(180deg,#6b5640,#2a2018)' : 'linear-gradient(180deg,#8a8781,#3a3834)', overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 16 - 6, top: 16 - 26}}><Person {...n.who} w={240} rim="#ffd9a0" /></div>
            </div>
            <div style={{fontFamily: 'Permanent Marker', fontSize: 30, color: i === 0 ? C.red : '#222', textAlign: 'center', marginTop: 12}}>{n.l}</div>
            <div style={{position: 'absolute', left: 116, top: -10, width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #8a0f0f)'}} />
          </div>
        );
      })}
      <CashRain a={fCash - 4} b={fCash + 40} />
    </AbsoluteFill>
  );
};

/* ---------- S9: almost every top prize — over $20 million ---------- */
const MoneyScene: React.FC = () => {
  const f = useCurrentFrame();
  const fYears = t.find('L09', 'years');
  const fNet = t.find('L09', 'network');
  const fOver = t.find('L09', 'over');
  const fDol = t.find('L09', 'dollars');
  const N = 24;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #2b2208, #070604 75%)'}}>
      {/* year ticker */}
      <div style={{...center, top: 220, fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 64, color: '#7a6a3a', letterSpacing: 8, opacity: prog(f, fYears - 4, fYears + 6)}}>
        {['1995', '96', '97', '98', '99', '2000'].map((y, i) => (
          <span key={y} style={{color: f > fYears + i * 6 ? C.gold : '#4a4030', marginRight: 18}}>{y}</span>
        ))}
      </div>
      {/* prize pieces flying into "his network" */}
      {Array.from({length: N}).map((_, i) => {
        const at = fYears + 4 + i * 2.2;
        const p = prog(f, at, at + 16, EZ.inOut);
        const sx = rnd(i) * 1080 - 100;
        const sy = 1700 + rnd(i + 50) * 200;
        const ex = 210 + (i % 6) * 26 + rnd(i + 3) * 50;
        const ey = 700 - Math.floor(i / 6) * 46;
        const x = sx + (ex - sx) * p;
        const y = sy + (ey - sy) * p - Math.sin(p * Math.PI) * 260;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${(1 - p) * (rnd(i + 9) * 720 - 360)}deg)`, opacity: p > 0 ? 1 : 0}}>
            <GamePiece name="BOARDWALK" strip={C.blue} w={230} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 250, top: 880, fontFamily: 'Oswald', fontWeight: 700, fontSize: 50, color: C.gold, letterSpacing: 4, opacity: prog(f, fNet - 4, fNet + 6)}}>HIS NETWORK</div>
      <div style={{position: 'absolute', left: 760, top: 760, width: 200, textAlign: 'center', opacity: prog(f, fNet, fNet + 8)}}>
        <GamePiece name="BOARDWALK" strip={C.blue} w={110} style={{margin: '0 auto', opacity: 0.35}} />
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 30, color: '#8d8370', letterSpacing: 3, marginTop: 12}}>EVERYONE ELSE</div>
      </div>
      <div style={{...center, top: 990, opacity: prog(f, fOver - 3, fOver + 4)}}>
        <div style={{...big, fontSize: 64, color: '#d8cfb6', letterSpacing: 10}}>OVER</div>
        <Chroma amt={f >= fDol ? Math.exp(-(f - fDol) / 5) * 14 : 0} style={{display: 'flex', justifyContent: 'center'}}>
          <Odometer from={0} to={20000000} a={fOver} b={fDol + 6} prefix="$" style={{...big, fontSize: 170, color: C.gold, textShadow: '0 0 50px rgba(255,199,44,.5)', justifyContent: 'center'}} />
        </Chroma>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S10: the tip, the FBI, 37 months ---------- */
const FBIScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAnon = t.find('L10', 'anonymous');
  const fFBI = t.find('L10', 'fbi');
  const fJerry = t.find('L10', 'jerry');
  const fBars = t.find('L10', 'thirty');
  const s = spr(f, fps, fFBI, {damping: 10, stiffness: 240});
  const sweep = (f - fFBI) / 22;
  return (
    <AbsoluteFill style={{background: '#04060c'}}>
      {/* police light sweeps (smooth rotation, no strobe) */}
      <AbsoluteFill style={{opacity: 0.35 + 0.65 * prog(f, fFBI - 6, fFBI + 4), mixBlendMode: 'screen'}}>
        <div style={{position: 'absolute', left: -400, top: -200, width: 1900, height: 1900, background: `conic-gradient(from ${sweep * 60}deg at 30% 40%, rgba(47,123,255,.55), transparent 18%, transparent 50%, rgba(255,40,60,.45), transparent 68%)`, filter: 'blur(60px)'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 260, width: 840, padding: '36px 40px', background: '#f3efe4', transform: 'rotate(-2deg)', boxShadow: '0 30px 70px rgba(0,0,0,.6)', opacity: prog(f, fAnon - 8, fAnon)}}>
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, color: C.red, letterSpacing: 6}}>TIP LINE · CALLER UNKNOWN</div>
        <div style={{fontFamily: 'Special Elite', fontSize: 50, color: '#1b1915', marginTop: 16, lineHeight: 1.25}}>
          <Typewriter text={'"The game is rigged.\nAsk about Uncle Jerry."'} at={fAnon} cps={30} style={{whiteSpace: 'pre-wrap'}} />
        </div>
      </div>
      {/* the incoming tip call, until the FBI lands */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, height: 300, opacity: prog(f, fAnon - 6, fAnon + 4) * (1 - prog(f, fFBI - 4, fFBI + 2))}}>
        <svg viewBox="0 0 24 24" width={150} height={150} style={{position: 'absolute', left: 140, top: 60, transform: `rotate(${Math.sin(f * 1.6) * 8}deg)`}}>
          <path fill="#e8eef8" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
        </svg>
        {[0, 1, 2].map((k) => {
          const r = ((f - fAnon) * 3 + k * 40) % 120;
          return <div key={k} style={{position: 'absolute', left: 215 - r, top: 135 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: '4px solid rgba(232,238,248,.6)', opacity: 1 - r / 120}} />;
        })}
        <div style={{position: 'absolute', left: 380, top: 80, display: 'flex', alignItems: 'center', gap: 7, height: 140}}>
          {Array.from({length: 38}).map((_, i) => (
            <div key={i} style={{width: 9, borderRadius: 5, background: '#9fc0ff', height: 14 + 110 * Math.abs(Math.sin(f / 3 + i * 0.6) * Math.sin(f / 9 + i * 0.21))}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 380, top: 236, fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, color: '#cfe0ff', letterSpacing: 6}}>INCOMING · ANONYMOUS · 2000</div>
      </div>
      <div style={{...center, top: 640, transform: `scale(${f >= fFBI ? 2.4 - 1.4 * s : 0})`}}>
        <Chroma amt={f >= fFBI ? Math.exp(-(f - fFBI) / 5) * 18 : 0}>
          <div style={{...big, fontSize: 300, color: '#fff', textShadow: '0 0 70px rgba(47,123,255,.9)', letterSpacing: 20}}>FBI</div>
        </Chroma>
      </div>
      <div style={{position: 'absolute', left: 40, top: 880 + (1 - spr(f, fps, fFBI + 6, {damping: 15, stiffness: 140})) * 600, opacity: f >= fFBI ? 1 : 0}}>
        <Person {...CAST.agent} w={360} rim="#7fb0ff" look={0.8} />
        <div style={{position: 'absolute', left: 70, top: 300, padding: '4px 14px', background: '#0d1b3d', color: '#cfe0ff', fontFamily: 'Oswald', fontWeight: 700, fontSize: 28, letterSpacing: 4, border: '2px solid #2f7bff'}}>FBI · JACKSONVILLE</div>
      </div>
      <div style={{position: 'absolute', left: 520, top: 860 + (1 - prog(f, fJerry - 4, fJerry + 10)) * 400, opacity: prog(f, fJerry - 4, fJerry + 4)}}>
        <Person {...CAST.jerry} w={460} rim="#9fc0ff" mood="worried" look={-0.6} lanyard={false} />
      </div>
      {f >= fBars - 7 && <Bars at={fBars - 7} />}
      <div style={{...center, top: 1060, opacity: prog(f, fBars + 2, fBars + 8)}}>
        <div style={{display: 'inline-block', ...big, fontSize: 120, color: '#fff', background: C.red, padding: '6px 34px', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,.6)'}}>37 MONTHS</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S11: the hospital twist ---------- */
const CIRCLE = 'M 470 1010 C 560 984, 760 986, 790 1028 C 818 1072, 650 1098, 520 1088 C 420 1080, 410 1030, 500 1004';
const TwistScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fMil = t.find('L11', 'million');
  const fHosp = t.find('L11', 'hospital');
  const fCame = t.find('L11', 'came');
  const fJerry = t.find('L11', 'jerry');
  const slide = prog(f, fMil - 2, fMil + 14, EZ.inOut);
  const env = spr(f, fps, t.ls('L11') - 4, {damping: 16, stiffness: 110});
  const circ = prog(f, fJerry - 2, fJerry + 14, EZ.inOut);
  const ev = evolvePath(Math.max(0.001, circ), CIRCLE);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2c1e12, #080604 78%)'}}>
      {/* hospital */}
      <div style={{position: 'absolute', left: 340, top: 170, opacity: prog(f, fHosp - 6, fHosp + 6), transform: `translateY(${(1 - prog(f, fHosp - 6, fHosp + 12)) * 40}px)`}}>
        <svg viewBox="0 0 200 140" width={400} height={280}>
          <rect x="20" y="40" width="160" height="100" rx="6" fill="#e9e3d6" />
          <rect x="70" y="10" width="60" height="50" rx="4" fill="#e9e3d6" />
          <path d="M92 20h16v12h12v16h-12v12H92V48H80V32h12z" fill={C.red} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={34 + i * 38} y="70" width="22" height="22" rx="3" fill="#9fb7d6" />)}
          <rect x="88" y="104" width="24" height="36" fill="#7a6a55" />
        </svg>
        <div style={{textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, color: C.cream, letterSpacing: 4}}>CHILDREN'S HOSPITAL</div>
      </div>
      <div style={{position: 'absolute', left: 540 - 220 + (1 - slide) * 0, top: 470 + slide * 180, opacity: slide < 1 ? 1 : 0, zIndex: 1}}>
        <GamePiece name="BOARDWALK" strip={C.blue} w={440} foil={prog(f, fMil, fMil + 24)} />
      </div>
      <div style={{position: 'absolute', left: 540 - 380, top: 640 + (1 - env) * 900}}>
        <Envelope open={slide < 1 ? 1 : 0} seal={0} w={760} />
      </div>
      <div style={{position: 'absolute', left: 200, top: 905, fontFamily: 'Special Elite', fontSize: 40, color: '#3b3226', opacity: env}}>TO: CHILDREN'S HOSPITAL</div>
      <div style={{position: 'absolute', left: 200, top: 1010, fontFamily: 'Special Elite', fontSize: 64, color: '#3b3226', opacity: prog(f, fCame - 4, fCame + 4)}}>FROM:</div>
      <div style={{position: 'absolute', left: 470, top: 1010, width: 300, textAlign: 'center', fontFamily: 'Permanent Marker', fontSize: 66, color: f >= fJerry ? C.red : '#3b3226', opacity: prog(f, fCame - 4, fCame + 4), transform: `scale(${f >= fJerry ? 1 + 0.25 * Math.exp(-(f - fJerry) / 4) : 1})`}}>
        {f >= fJerry ? 'JERRY' : '?????'}
      </div>
      <div style={{position: 'absolute', left: 720, top: 150 + (1 - spr(f, fps, fJerry, {damping: 12, stiffness: 180})) * -700, width: 280, height: 330, background: '#f4f1ea', padding: 14, boxShadow: '0 20px 50px rgba(0,0,0,.6)', transform: 'rotate(7deg)', opacity: f >= fJerry ? 1 : 0, zIndex: 3}}>
        <div style={{position: 'relative', width: 252, height: 240, overflow: 'hidden', background: 'linear-gradient(180deg,#6b5640,#2a2018)'}}>
          <div style={{position: 'absolute', left: 0, top: -30}}><Person {...CAST.jerry} w={260} rim="#ffd9a0" mood="smirk" lanyard={false} /></div>
        </div>
        <div style={{fontFamily: 'Permanent Marker', fontSize: 34, color: C.red, textAlign: 'center', marginTop: 12}}>JERRY</div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={CIRCLE} fill="none" stroke={C.red} strokeWidth={10} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{filter: 'drop-shadow(0 0 10px rgba(218,41,28,.8))'}} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- S12: peel one... (loops to the opening) ---------- */
const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const fPeel = t.find('L12', 'peel');
  const fAsk = t.find('L12', 'ask');
  const peel = prog(f, fPeel - 2, fPeel + 14, EZ.inOut);
  const push = prog(f, fAsk, t.frames, EZ.inOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 48%, #3a0d0a 0%, #120708 55%, #050405 100%)'}}>
      <div style={{position: 'absolute', left: 540 - 250, top: 600, transform: `scale(${1 + push * 0.45}) translateY(${-push * 40}px)`, transformOrigin: '50% 85%'}}>
        <FriesBox w={500} peel={peel} />
      </div>
      <div style={{position: 'absolute', left: 540 - 150, top: 1110, opacity: peel > 0.3 ? 1 : 0, transform: `scale(${0.4 + 0.6 * peel})`, transformOrigin: '0% 50%'}}>
        <GamePiece name="BOARDWALK" strip={C.blue} w={300} foil={prog(f, fPeel + 8, fPeel + 30)} />
      </div>
      <div style={{...center, top: 120, zIndex: 3, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 100, color: C.cream, opacity: prog(f, fAsk, fAsk + 10), textShadow: '0 10px 40px rgba(0,0,0,.8)'}}>
        who touched it <span style={{color: C.gold}}>first?</span>
      </div>
    </AbsoluteFill>
  );
};

export const Monopoly: React.FC = () => {
  const f = useCurrentFrame();
  const S = (id: string, off = 0) => t.ls(id, off);
  const air = t.find('L01', 'airport') - 3;
  const hits: [number, number][] = [
    [t.find('L01', 'million'), 18],
    [t.find('L05', 'supplier'), 14],
    [t.find('L07', 'swap'), 10],
    [t.find('L09', 'dollars'), 16],
    [t.find('L10', 'fbi'), 20],
    [t.find('L10', 'thirty'), 22],
    [t.find('L11', 'jerry'), 12],
  ];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <FxDefs />
      <Audio src={staticFile('monopoly/mix.wav')} />
      <AbsoluteFill style={{transform: `${drift(f, 5)} ${shake(f, hits)}`}}>
        <Scene from={0} to={air + 6} tin="none" tout="whipL" lout={8}>
          <Hook />
        </Scene>
        <Scene from={air} to={S('L03', -0.05)} tin="whipL" tout="zoomIn" lin={8}>
          <StallScene />
        </Scene>
        <Scene from={S('L03', -0.25)} to={S('L04', 0.05)} tin="zoomIn" tout="whipU">
          <FileScene />
        </Scene>
        <Scene from={S('L04', -0.1)} to={S('L05', 0.05)} tin="whipU" tout="zoomIn" push={0.1}>
          <RouteScene />
        </Scene>
        <Scene from={S('L05', -0.1)} to={S('L06', 0.05)} tin="zoomIn" tout="whipL">
          <BoxScene />
        </Scene>
        <Scene from={S('L06', -0.1)} to={S('L07', 0.05)} tin="whipL" tout="zoomIn">
          <EnvelopeScene />
        </Scene>
        <Scene from={S('L07', -0.1)} to={S('L08', 0.05)} tin="zoomIn" tout="whipR">
          <SwapScene />
        </Scene>
        <Scene from={S('L08', -0.1)} to={S('L09', 0.05)} tin="whipR" tout="zoomOut" push={0.08}>
          <NetworkScene />
        </Scene>
        <Scene from={S('L09', -0.1)} to={S('L10', 0.05)} tin="zoomOut" tout="punch">
          <MoneyScene />
        </Scene>
        <Scene from={S('L10', -0.1)} to={S('L11', 0.05)} tin="punch" tout="zoomIn">
          <FBIScene />
        </Scene>
        <Scene from={S('L11', -0.1)} to={S('L12', 0.05)} tin="zoomIn" tout="whipD">
          <TwistScene />
        </Scene>
        <Scene from={S('L12', -0.1)} to={t.frames} tin="whipD" tout="none" push={0.02}>
          <EndScene />
        </Scene>
      </AbsoluteFill>
      <LightLeaks colors={['rgba(255,90,40,.55)', 'rgba(255,199,44,.4)', 'rgba(255,60,60,.35)']} opacity={0.28} />
      <Particles n={46} color="#ffd9a0" opacity={0.35} />
      <FlareSweep at={air - 4} />
      <FlareSweep at={t.find('L09', 'over') - 6} color="#ffe39a" />
      <FlareSweep at={t.find('L11', 'jerry') - 4} color="#ffd0b0" />
      <Flash at={[t.find('L10', 'fbi'), t.find('L10', 'thirty')]} peak={0.35} />
      <Captions t={t as T} accent={C.gold} y={1330} />
      <Vignette strength={0.7} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
