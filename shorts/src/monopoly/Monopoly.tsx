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
import {ARCHES, Bars, BoxIso, C, CashRain, Envelope, FriesBox, GamePiece, GateSign, Stall, Suit, Tiles} from './art';

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
      <Stall occupied={f >= fStall ? 1 : 0} />
      {/* light spill under the door */}
      <div style={{position: 'absolute', left: 190, top: 1560, width: 700, height: 40, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,240,200,.35), transparent 70%)'}} />
      <div style={{position: 'absolute', left: 540 - 330, top: 520 + (1 - rise) * 900, opacity: rise}}>
        <Suit w={660} rim="#ffd27a" badge breathe={Math.sin(f / 18) * 1.2} />
        <div style={{position: 'absolute', left: 448, top: 470, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,230,140,${glint}), transparent 65%)`, mixBlendMode: 'screen'}} />
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
      </div>
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
          <svg viewBox="0 0 100 120" width={230} height={290}><circle cx="50" cy="44" r="22" fill="#15161a" /><path d="M10 120c4-30 22-44 40-44s36 14 40 44z" fill="#15161a" /></svg>
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

/* ---------- S4: escort route + the auditor ---------- */
const ROUTE = 'M 250 1040 C 380 820, 540 900, 560 700 S 740 420, 840 360';
const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = t.find('L04', 'escort') - 4;
  const fAud = t.find('L04', 'auditor');
  const fWatch = t.find('L04', 'watching');
  const end = t.le('L04');
  const L = getLength(ROUTE);
  const p = prog(f, a, end, EZ.inOut);
  const ev = evolvePath(Math.max(0.001, p), ROUTE);
  const pt = getPointAtLength(ROUTE, Math.max(0.001, p) * L) ?? {x: 180, y: 900};
  const pa = Math.max(0.001, p - 0.14);
  const ptA = getPointAtLength(ROUTE, pa * L) ?? {x: 180, y: 900};
  const aud = prog(f, fAud - 4, fAud + 6);
  const cone = Math.sin((f - fWatch) / 7) * 18;
  const nodes = [
    {x: 250, y: 1040, l: 'SECURE VAULT', dx: 0, dy: 74},
    {x: 560, y: 700, l: 'PRINT PLANT', dx: -150, dy: 14},
    {x: 840, y: 360, l: 'PACKAGING', dx: 0, dy: 84},
  ];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #0f1a2e, #05070c 80%)'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(80,120,200,.12) 2px, transparent 2px), linear-gradient(90deg, rgba(80,120,200,.12) 2px, transparent 2px)', backgroundSize: '90px 90px', transform: 'perspective(1200px) rotateX(28deg) scale(1.3)', transformOrigin: '50% 30%'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={ROUTE} fill="none" stroke="rgba(120,160,255,.18)" strokeWidth={10} strokeDasharray="2 22" strokeLinecap="round" />
        <path d={ROUTE} fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{filter: 'drop-shadow(0 0 12px rgba(255,199,44,.8))'}} />
        {nodes.map((n, i) => {
          const on = p > i / 2 - 0.02;
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={on ? 30 : 18} fill={on ? C.gold : '#2a3550'} style={{filter: on ? 'drop-shadow(0 0 16px rgba(255,199,44,.9))' : 'none'}} />
              <text x={n.x + n.dx} y={n.y + n.dy} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill={on ? '#fff' : '#5c6785'} letterSpacing={3}>{n.l}</text>
            </g>
          );
        })}
        {/* auditor: follows, with a vision cone */}
        <g opacity={aud} transform={`translate(${ptA.x} ${ptA.y})`}>
          <path d={`M 0 0 L ${120} ${-70} A 140 140 0 0 1 ${120} ${70} Z`} fill="rgba(80,200,255,.18)" transform={`rotate(${-30 + cone})`} />
          <circle r={22} fill="#59c8ff" />
          <text y={70} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={34} fill="#9fe0ff" letterSpacing={4}>AUDITOR</text>
        </g>
      </svg>
      {/* briefcase on the route */}
      <div style={{position: 'absolute', left: pt.x - 80, top: pt.y - 120, width: 160, height: 112, transform: 'scale(1.15)'}}>
        <div style={{position: 'absolute', left: 45, top: -16, width: 50, height: 24, border: '7px solid #3a2a18', borderBottom: 'none', borderRadius: '12px 12px 0 0'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 14, background: 'linear-gradient(160deg,#7a5530,#4a301a)', boxShadow: '0 12px 30px rgba(0,0,0,.6), inset 0 0 0 4px #2e1d0f'}} />
        <div style={{position: 'absolute', left: 58, top: 40, width: 24, height: 20, borderRadius: 4, background: C.gold}} />
      </div>
      <div style={{...center, top: 1180, fontFamily: 'Oswald', fontWeight: 700, fontSize: 46, color: '#cfe0ff', letterSpacing: 5, opacity: prog(f, fWatch, fWatch + 8)}}>
        EVERY MOVE · WATCHED
      </div>
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
  {x: 540, y: 560, l: 'UNCLE JERRY', r: -2},
  {x: 230, y: 330, l: 'FAMILY', r: -6, w: 'family'},
  {x: 850, y: 330, l: 'FRIENDS', r: 5, w: 'friends'},
  {x: 240, y: 880, l: 'STRANGERS', r: 4, w: 'strangers'},
  {x: 840, y: 880, l: 'CASH BUYERS', r: -5, w: 'cash'},
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
            <div style={{width: 228, height: 200, background: i === 0 ? 'linear-gradient(180deg,#43362a,#16120e)' : 'linear-gradient(180deg,#5d5a55,#24221f)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden'}}>
              <svg viewBox="0 0 100 100" width={180} height={180}><circle cx="50" cy="40" r="20" fill="#0c0b0a" /><path d="M12 100c4-28 20-40 38-40s34 12 38 40z" fill="#0c0b0a" /></svg>
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
      <div style={{...center, top: 640, transform: `scale(${f >= fFBI ? 2.4 - 1.4 * s : 0})`}}>
        <Chroma amt={f >= fFBI ? Math.exp(-(f - fFBI) / 5) * 18 : 0}>
          <div style={{...big, fontSize: 300, color: '#fff', textShadow: '0 0 70px rgba(47,123,255,.9)', letterSpacing: 20}}>FBI</div>
        </Chroma>
      </div>
      <div style={{position: 'absolute', left: 540 - 250, top: 950 + (1 - prog(f, fJerry - 4, fJerry + 10)) * 400, opacity: prog(f, fJerry - 4, fJerry + 4)}}>
        <Suit w={500} rim="#9fc0ff" />
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
