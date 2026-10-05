import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import tlData from '../../public/newcoke/timeline.json';
import {makeT, T} from '../kit/timeline';
import {EZ, kf, prog, rnd, spr} from '../kit/motion';
import {Chroma, drift, Flash, FlareSweep, FxDefs, Grain, LightLeaks, Particles, shake, Vignette} from '../kit/fx';
import {Captions} from '../kit/Captions';
import {Scene} from '../kit/Scene';
import {LogoReveal, Odometer, Typewriter, useStamp} from '../kit/Brand';
import {Can3D} from './Can3D';
import {Chyron, Crowd, Cup, Gauge, K, Ledger, Letter, PeopleField, SalesChart, SCRIPT, Switchboard, TV} from './art';

const t = makeT(tlData as never);
export const NEWCOKE_FRAMES = t.frames;

const big: React.CSSProperties = {fontFamily: 'Anton', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: 1};
const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center'};
const redRoom = 'radial-gradient(ellipse 85% 60% at 50% 38%, #6a0710 0%, #2a0307 50%, #0b0204 100%)';

/* ---------- S1: 200,000 people loved it ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fTest = t.find('L01', 'tested');
  const fTwo = t.find('L01', 'two');
  const fPeople = t.we('L01', t.lines[0].words.findIndex((w) => w.w.startsWith('people')));
  const fLoved = t.find('L01', 'loved');
  const can = 0.6 + 0.4 * spr(f, fps, 0, {damping: 18, stiffness: 70});
  const reveal = prog(f, fTest - 4, fPeople + 4, EZ.inOut);
  const wave = prog(f, fLoved - 6, fLoved + 22, EZ.out) * 1.15;
  return (
    <AbsoluteFill style={{background: redRoom}}>
      <div style={{position: 'absolute', left: 40, top: 640, transform: 'scale(1)', opacity: prog(f, fTest - 6, fTest + 6)}}>
        <PeopleField reveal={reveal} wave={wave} tint={K.gold} />
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 70, transform: `scale(${can})`, transformOrigin: '50% 30%'}}>
        <Can3D kind="new" size={600} rotY={kf(f, [[0, -0.9], [170, 0.5]], EZ.soft)} />
      </div>
      <div style={{...center, top: 690, opacity: prog(f, fTwo - 3, fTwo + 4)}}>
        <Odometer from={0} to={200000} a={fTwo} b={fPeople} style={{...big, fontSize: 190, color: '#fff', justifyContent: 'center', textShadow: '0 0 50px rgba(255,207,107,.55), 0 10px 0 #5a050b'}} />
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 48, color: K.cream, letterSpacing: 10}}>TASTE TESTS</div>
      </div>
      {/* hearts rising with the wave */}
      {Array.from({length: 22}).map((_, i) => {
        const at = fLoved + rnd(i) * 18;
        const tt = f - at;
        if (tt < 0 || tt > 60) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 80 + rnd(i + 4) * 900, top: 1180 - tt * (8 + rnd(i + 2) * 6), fontSize: 50 + rnd(i + 8) * 40, color: K.gold, opacity: 1 - tt / 60, transform: `rotate(${(rnd(i + 1) - 0.5) * 40}deg)`}}>
            ♥
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- S2: 79 days later, gone ---------- */
const GoneScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = t.ls('L02');
  const fDays = t.find('L02', 'days');
  const fGone = t.find('L02', 'gone');
  const day = Math.max(1, Math.round(kf(f, [[a, 1], [fDays + 14, 79]], EZ.inOut)));
  const flip = (f % 3) / 3;
  const dis = prog(f, fGone - 2, fGone + 16, EZ.in);
  const stamp = useStamp(fGone + 2, -10);
  return (
    <AbsoluteFill style={{background: '#0b0204'}}>
      <div style={{position: 'absolute', left: 540 - 280, top: 160, width: 560, height: 520, perspective: 1600}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: '#f6efe3', boxShadow: '0 40px 100px rgba(0,0,0,.7)', overflow: 'hidden'}}>
          <div style={{height: 120, background: K.red, color: '#fff', fontFamily: 'Bebas Neue', fontSize: 92, textAlign: 'center', letterSpacing: 6, paddingTop: 10}}>DAY</div>
          <div style={{textAlign: 'center', fontFamily: 'Anton', fontSize: 300, color: '#1b1213', lineHeight: 1.25}}>{day}</div>
        </div>
        {day < 79 && (
          <div style={{position: 'absolute', left: 0, top: 120, width: 560, height: 400, background: '#ece3d3', transformOrigin: '50% 0%', transform: `rotateX(${flip * 120}deg)`, opacity: 1 - flip, borderRadius: '0 0 26px 26px'}} />
        )}
      </div>
      <div style={{position: 'absolute', left: 540 - 220, top: 700, opacity: 1 - dis, transform: `scale(${1 - dis * 0.5}) translateY(${dis * 120}px)`, filter: `blur(${dis * 16}px)`}}>
        <Can3D kind="new" size={440} rotY={0.4 + (f - a) * 0.02} />
      </div>
      {/* dissolve sparks */}
      {Array.from({length: 40}).map((_, i) => {
        const tt = f - fGone;
        if (tt < 0 || tt > 40) return null;
        const ang = rnd(i) * Math.PI * 2;
        const r = tt * (6 + rnd(i + 3) * 14);
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * r, top: 980 + Math.sin(ang) * r * 0.8, width: 10, height: 10, borderRadius: '50%', background: rnd(i + 9) > 0.5 ? K.red : '#fff', opacity: 1 - tt / 40}} />;
      })}
      <div style={{position: 'absolute', left: 540 - 250, top: 900, zIndex: 3, ...stamp}}>
        <div style={{border: `12px solid ${K.red}`, color: K.red, fontFamily: 'Archivo Black', fontSize: 130, padding: '0 34px', borderRadius: 16, letterSpacing: 6, background: 'rgba(11,2,4,.6)'}}>GONE</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S3: 1985, the Pepsi Challenge on TV ---------- */
const TVScene: React.FC = () => {
  const f = useCurrentFrame();
  const fYear = t.ls('L03');
  const fPepsi = t.find('L03', 'pepsi');
  const fBeat = t.find('L03', 'beating');
  const fBlind = t.find('L03', 'blind');
  const reveal = prog(f, fBeat, fBeat + 10);
  const bars = prog(f, fBlind, fBlind + 18, EZ.out);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a1b12, #070404 75%)'}}>
      <div style={{position: 'absolute', left: 60, top: 220}}>
        <TV w={960}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg,#1b2a6b,#0b1230)'}}>
            <div style={{position: 'absolute', left: 110, top: 64, fontFamily: 'VT323', fontSize: 52, color: K.vhs, textShadow: `3px 0 ${K.mag}`}}>PLAY ▶</div>
            <div style={{position: 'absolute', right: 110, top: 64, fontFamily: 'VT323', fontSize: 52, color: K.vhs, textShadow: `3px 0 ${K.mag}`}}>1985</div>
            <div style={{position: 'absolute', left: 90, top: 150}}><Cup label="A" fill={0.8} /></div>
            <div style={{position: 'absolute', left: 360, top: 150}}><Cup label="B" fill={0.8} glow={prog(f, fPepsi, fPepsi + 8)} /></div>
            <div style={{position: 'absolute', left: 60, top: 470, width: 260, textAlign: 'center', fontFamily: 'Bebas Neue', fontSize: 64, color: '#ff6b6b', opacity: reveal}}>COKE</div>
            <div style={{position: 'absolute', left: 330, top: 470, width: 260, textAlign: 'center', fontFamily: 'Bebas Neue', fontSize: 64, color: '#8fb4ff', opacity: reveal}}>PEPSI ✓</div>
          </AbsoluteFill>
        </TV>
      </div>
      {/* scoreboard */}
      <div style={{position: 'absolute', left: 120, top: 1030, width: 840}}>
        {[
          ['PEPSI', 0.9, K.pepsi],
          ['COKE', 0.62, K.red],
        ].map(([n, v, c], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', marginBottom: 18}}>
            <div style={{width: 170, fontFamily: 'Bebas Neue', fontSize: 64, color: '#fff'}}>{n as string}</div>
            <div style={{height: 52, width: `${(v as number) * 80 * bars}%`, background: c as string, borderRadius: 8, boxShadow: `0 0 24px ${c}`}} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 60, top: 90}}>
        <Chyron text="THE PEPSI CHALLENGE" sub="BLIND TASTE TEST" p={prog(f, fYear + 4, fYear + 16)} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S4: a 99-year-old recipe → sweeter, smoother ---------- */
const RecipeScene: React.FC = () => {
  const f = useCurrentFrame();
  const fCh = t.find('L04', 'changes');
  const fNN = t.find('L04', 'ninety');
  const fRec = t.find('L04', 'recipe');
  const fSw = t.find('L04', 'sweeter');
  const fSm = t.find('L04', 'smoother');
  const stamp = prog(f, fRec, fRec + 6, EZ.back);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2410, #0b0603 78%)'}}>
      <div style={{position: 'absolute', left: 190, top: 120, transform: `translateY(${(1 - prog(f, fCh - 8, fCh + 6)) * 300}px)`, opacity: prog(f, fCh - 8, fCh)}}>
        <Ledger stamp={stamp} w={680} />
      </div>
      <div style={{position: 'absolute', left: 80, top: 120, ...big, fontSize: 150, color: K.gold, opacity: prog(f, fNN, fNN + 6) * (1 - prog(f, fSw - 4, fSw + 2)), transform: `scale(${1 + 0.4 * (1 - prog(f, fNN, fNN + 8))})`, textShadow: '0 12px 30px rgba(0,0,0,.7)'}}>
        99 YEARS
      </div>
      {/* sugar crystals */}
      {Array.from({length: 30}).map((_, i) => {
        const tt = f - fSw - rnd(i) * 10;
        if (tt < 0) return null;
        return <div key={i} style={{position: 'absolute', left: 60 + rnd(i + 3) * 960, top: 1180 - tt * (4 + rnd(i) * 4), width: 18, height: 18, background: '#fff', transform: `rotate(${45 + tt * 4}deg)`, opacity: Math.max(0, 1 - tt / 50), boxShadow: '0 0 14px #fff'}} />;
      })}
      <div style={{position: 'absolute', left: 90, top: 890, ...big, fontSize: 120, color: '#fff', opacity: prog(f, fSw - 2, fSw + 5), textShadow: `0 0 40px ${K.gold}`}}>SWEETER.</div>
      <svg width={1080} height={300} style={{position: 'absolute', left: 0, top: 1010, opacity: prog(f, fSm - 4, fSm + 6)}}>
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M 0 ${150 + k * 26} ${Array.from({length: 13}, (_, i) => `Q ${i * 90 + 45} ${150 + k * 26 + 40 * Math.sin(f / 8 + i + k)} ${i * 90 + 90} ${150 + k * 26}`).join(' ')}`} fill="none" stroke={k === 1 ? K.gold : 'rgba(255,230,190,.5)'} strokeWidth={6 - k} />
        ))}
      </svg>
      <div style={{position: 'absolute', right: 90, top: 1060, ...big, fontSize: 120, color: K.gold, opacity: prog(f, fSm - 2, fSm + 5)}}>SMOOTHER.</div>
    </AbsoluteFill>
  );
};

/* ---------- S5: it beats old Coke — and Pepsi ---------- */
const BeatsScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fB = t.find('L05', 'beats');
  const fP = t.find('L05', 'pepsi');
  const rows: [string, string, number, number, string][] = [
    ['NEW COKE', 'OLD COKE', fB - 6, fB + 4, K.red],
    ['NEW COKE', 'PEPSI', fP - 8, fP + 2, K.pepsi],
  ];
  return (
    <AbsoluteFill style={{background: redRoom}}>
      <div style={{...center, top: 150, fontFamily: 'Oswald', fontWeight: 700, fontSize: 54, color: K.cream, letterSpacing: 10}}>BLIND TEST RESULTS</div>
      {rows.map(([a, b, s0, win, c], i) => {
        const p = prog(f, s0, s0 + 20, EZ.out);
        const chk = spr(f, fps, win + 10, {damping: 10, stiffness: 260});
        return (
          <div key={i} style={{position: 'absolute', left: 90, top: 300 + i * 400, width: 900}}>
            <div style={{fontFamily: 'Bebas Neue', fontSize: 72, color: '#fff', letterSpacing: 3}}>{a} <span style={{color: '#b58a8e'}}>vs</span> {b}</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, height: 220, marginTop: 10}}>
              <div style={{width: 300, height: 220 * p, background: `linear-gradient(180deg,#ff4a55,${K.red})`, borderRadius: '12px 12px 0 0', boxShadow: '0 0 30px rgba(232,16,30,.6)'}} />
              <div style={{width: 300, height: 150 * p, background: c === K.pepsi ? 'linear-gradient(180deg,#4f8cff,#1a5fd6)' : 'linear-gradient(180deg,#8a2a30,#5a0a10)', borderRadius: '12px 12px 0 0'}} />
              <div style={{fontSize: 160, color: '#7dffa1', transform: `scale(${f >= win + 10 ? chk : 0})`, textShadow: '0 0 30px rgba(125,255,161,.8)'}}>✓</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- S6: launch day → America loses it ---------- */
const LaunchScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fNew = t.ls('L06');
  const fAm = t.find('L06', 'america');
  const fLoses = t.find('L06', 'loses');
  const rise = prog(f, fAm - 4, fLoses + 10, EZ.linear);
  const flashes = [0, 4, 9, 13, 18, 24].map((k) => fNew + k);
  const can = spr(f, fps, fNew - 4, {damping: 15, stiffness: 120});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #3d0a10, #0b0204 70%)'}}>
      {/* spotlights */}
      {[-1, 1].map((s) => (
        <div key={s} style={{position: 'absolute', left: 540 + s * 260 - 300, top: -200, width: 600, height: 1400, background: 'linear-gradient(180deg, rgba(255,240,220,.35), transparent 75%)', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)', transform: `rotate(${s * -12 + Math.sin(f / 30 + s) * 4}deg)`, transformOrigin: '50% 0%', mixBlendMode: 'screen'}} />
      ))}
      <div style={{position: 'absolute', left: 540 - 260, top: 150 + (1 - can) * 600, transform: `scale(${1 - rise * 0.25})`, transformOrigin: '50% 0%'}}>
        <Can3D kind="new" size={520} rotY={-0.3 + (f - fNew) * 0.015} light={1 + 0.6 * Math.max(...flashes.map((a) => (f >= a ? Math.exp(-(f - a) / 3) : 0)))} />
      </div>
      {/* podium */}
      <div style={{position: 'absolute', left: 290, top: 820, width: 500, height: 260, background: 'linear-gradient(180deg,#2a2a30,#121216)', borderRadius: '14px 14px 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,.6)', opacity: 1 - rise}}>
        <div style={{textAlign: 'center', marginTop: 60, fontFamily: 'Bebas Neue', fontSize: 86, color: '#fff', letterSpacing: 6}}>NEW COKE</div>
        <div style={{textAlign: 'center', fontFamily: 'VT323', fontSize: 44, color: K.cream}}>APRIL 23, 1985</div>
      </div>
      {/* camera flashes */}
      {flashes.map((a, i) => {
        const o = f >= a ? Math.exp(-(f - a) / 3) : 0;
        return <div key={i} style={{position: 'absolute', left: 80 + rnd(i) * 900 - 120, top: 900 + rnd(i + 5) * 300 - 120, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, #fff, rgba(255,255,255,0) 65%)', opacity: o * (1 - rise), mixBlendMode: 'screen'}} />;
      })}
      <Crowd rise={rise} signs={['BRING BACK OLD COKE', 'OLD COLA DRINKERS OF AMERICA', 'WE WANT THE REAL THING', 'NO NEW COKE!']} />
    </AbsoluteFill>
  );
};

/* ---------- S7: 1,500 calls a day; "Chief Dodo" ---------- */
const CallsScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = t.ls('L07');
  const fDay = t.find('L07', 'day');
  const fOne = t.find('L07', 'one');
  const fChief = t.find('L07', 'chief');
  const fDodo = t.we('L07', -1);
  const lit = prog(f, a, fDay + 10, EZ.inOut);
  const swap = prog(f, fOne - 6, fOne + 6, EZ.inOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2b1d10, #090604 78%)'}}>
      <div style={{position: 'absolute', left: 60, top: 160, opacity: 1 - swap * 0.75, transform: `scale(${1 - swap * 0.15}) translateY(${-swap * 80}px)`, transformOrigin: '50% 0%'}}>
        <Switchboard lit={lit} />
      </div>
      <div style={{...center, top: 900, opacity: prog(f, a, a + 8) * (1 - swap)}}>
        <Odometer from={0} to={1500} a={a} b={fDay + 4} style={{...big, fontSize: 200, color: '#ffb02e', justifyContent: 'center', textShadow: '0 0 50px rgba(255,176,46,.6)'}} />
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 50, color: K.cream, letterSpacing: 10}}>ANGRY CALLS · EVERY DAY</div>
      </div>
      <div style={{position: 'absolute', left: 130, top: 600 + (1 - swap) * 1500}}>
        <Letter write={prog(f, fChief - 4, fDodo + 2, EZ.linear) * 0.34 + prog(f, fDodo, fDodo + 30, EZ.linear) * 0.66} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S8: the psychiatrist on the line ---------- */
const PsychScene: React.FC = () => {
  const f = useCurrentFrame();
  const fPsy = t.find('L08', 'psychiatrist');
  const fCall = t.find('L08', 'callers');
  const fGr = t.find('L08', 'grieving');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #142033, #05070b 78%)'}}>
      {/* headphones */}
      <svg viewBox="0 0 200 160" width={460} height={368} style={{position: 'absolute', left: 310, top: 330, opacity: prog(f, fPsy - 6, fPsy + 4)}}>
        <path d="M30 110 Q30 20 100 20 Q170 20 170 110" fill="none" stroke="#c9ced6" strokeWidth="12" strokeLinecap="round" />
        <rect x="14" y="96" width="40" height="60" rx="14" fill="#2a2e36" stroke="#c9ced6" strokeWidth="4" />
        <rect x="146" y="96" width="40" height="60" rx="14" fill="#2a2e36" stroke="#c9ced6" strokeWidth="4" />
      </svg>
      {/* caller waveform */}
      <div style={{position: 'absolute', left: 90, top: 720, width: 900, height: 220, display: 'flex', alignItems: 'center', gap: 6}}>
        {Array.from({length: 60}).map((_, i) => {
          const live = f > fPsy;
          const h = live ? 20 + 180 * Math.abs(Math.sin(f / 3 + i * 0.7) * Math.sin(f / 11 + i * 0.23)) * (0.4 + rnd(i) * 0.6) : 6;
          return <div key={i} style={{width: 9, height: h, borderRadius: 5, background: f > fCall ? '#9fc3ff' : '#4b6aa8', boxShadow: '0 0 10px rgba(130,170,255,.5)'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 150, top: 990, width: 780, padding: '24px 36px', background: '#f2ecdc', transform: 'rotate(-2deg)', boxShadow: '0 20px 60px rgba(0,0,0,.6)', opacity: prog(f, fCall - 6, fCall + 2)}}>
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 30, color: '#7a2a2a', letterSpacing: 4}}>CALL NOTES · 1985</div>
        <div style={{fontFamily: 'Special Elite', fontSize: 44, color: '#1b1915', marginTop: 10}}>
          <Typewriter text="Sounds like a death in the family." at={fCall} cps={30} />
        </div>
      </div>
      <div style={{...center, top: 140, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 130, color: K.cream, opacity: prog(f, fGr, fGr + 10), textShadow: '0 10px 40px rgba(0,0,0,.8)'}}>grieving.</div>
    </AbsoluteFill>
  );
};

/* ---------- S9: so how did 200,000 tests get it so wrong? ---------- */
const WrongScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = t.ls('L09');
  const fW = t.find('L09', 'wrong');
  const imp = f >= fW ? Math.exp(-(f - fW) / 5) : 0;
  return (
    <AbsoluteFill style={{background: redRoom}}>
      <div style={{position: 'absolute', left: 40, top: 240}}>
        <PeopleField reveal={1} wave={1.2} tint={K.gold} wrong={prog(f, fW - 10, fW + 6) * 0.9} />
      </div>
      <div style={{...center, top: 300, opacity: prog(f, fW - 2, fW + 3)}}>
        <Chroma amt={imp * 20}>
          <div style={{...big, fontSize: 700, color: '#fff', textShadow: '0 0 80px rgba(255,51,68,.9)'}}>?</div>
        </Chroma>
      </div>
      <div style={{...center, top: 160, fontFamily: 'Oswald', fontWeight: 700, fontSize: 54, color: K.cream, letterSpacing: 10, opacity: prog(f, a, a + 8)}}>200,000 TESTS</div>
    </AbsoluteFill>
  );
};

/* ---------- S10: they were sips ---------- */
const SipScene: React.FC = () => {
  const f = useCurrentFrame();
  const fSips = t.find('L10', 'sips');
  const fSw = t.find('L10', 'sweeter');
  const needle = kf(f, [[fSw - 10, 0], [fSw + 6, 0.85]], EZ.back);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a0a10, #070203 78%)'}}>
      <div style={{position: 'absolute', left: 540 - 110, top: 300, transform: `scale(${0.6 + 0.4 * prog(f, fSips - 6, fSips + 6, EZ.back)})`}}>
        <Cup label="1 SIP" fill={0.18} w={220} />
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 760, opacity: prog(f, fSw - 14, fSw - 4)}}>
        <Gauge v={needle} label="IN ONE SIP" w={600} />
      </div>
      <div style={{...center, top: 1150, ...big, fontSize: 96, color: K.red, opacity: prog(f, fSw + 4, fSw + 10), textShadow: '0 0 30px rgba(232,16,30,.6)'}}>SWEETER WINS</div>
    </AbsoluteFill>
  );
};

/* ---------- S11: you drink the whole can ---------- */
const CanScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = t.ls('L11');
  const fWhole = t.find('L11', 'whole');
  const drain = prog(f, fWhole - 6, t.le('L11') + 10, EZ.inOut);
  const needle = kf(f, [[a, 0.85], [fWhole - 2, 0.85], [fWhole + 12, -0.55]], [EZ.linear, EZ.back]);
  return (
    <AbsoluteFill style={{background: redRoom}}>
      <div style={{position: 'absolute', left: 60, top: 110}}>
        <Can3D kind="new" size={560} rotY={0.2 + (f - a) * 0.012} />
      </div>
      {/* fill meter */}
      <div style={{position: 'absolute', left: 640, top: 240, width: 90, height: 560, borderRadius: 45, background: 'rgba(255,255,255,.08)', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,.3)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${(1 - drain) * 100}%`, background: 'linear-gradient(180deg,#5a1a0a,#2a0a04)'}} />
      </div>
      <div style={{position: 'absolute', left: 760, top: 470, fontFamily: 'Oswald', fontWeight: 700, fontSize: 48, color: K.cream, letterSpacing: 4, lineHeight: 1.1}}>12 OZ<br /><span style={{color: '#b58a8e', fontSize: 34}}>ALL OF IT</span></div>
      <div style={{position: 'absolute', left: 540 - 300, top: 900}}>
        <Gauge v={needle} label="WHOLE CAN" w={600} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S12: Coca-Cola Classic returns ---------- */
const ClassicScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fCC = t.find('L12', 'coca');
  const fCl = t.find('L12', 'classic');
  const fSoon = t.find('L12', 'soon');
  const ban = spr(f, fps, fCl, {damping: 12, stiffness: 220});
  const chart = prog(f, fSoon - 6, t.le('L12') + 6, EZ.inOut);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${K.red}, #9a0710)`}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,.25), transparent 60%)'}} />
      <div style={{...center, top: 120, display: 'flex', justifyContent: 'center'}}>
        <LogoReveal path={SCRIPT} at={fCC - 8} size={820} color="#ffffff" draw={26} glow="rgba(255,255,255,.5)" />
      </div>
      <div style={{...center, top: 640, transform: `scale(${f >= fCl ? 1.8 - 0.8 * ban : 0})`}}>
        <div style={{display: 'inline-block', background: '#fff', color: K.red, fontFamily: 'Bebas Neue', fontSize: 120, letterSpacing: 18, padding: '6px 40px 0', borderRadius: 6, boxShadow: '0 20px 50px rgba(0,0,0,.35)'}}>CLASSIC</div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 820, width: 980, height: 470, borderRadius: 26, background: 'rgba(20,0,4,.55)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.15)', opacity: prog(f, fSoon - 8, fSoon)}} />
      <div style={{position: 'absolute', left: 90, top: 860, opacity: prog(f, fSoon - 8, fSoon)}}>
        <SalesChart p={chart} w={900} h={380} coke="#ffffff" />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S13: "we're not that dumb… and we're not that smart." → loops to the can ---------- */
const QuoteScene: React.FC = () => {
  const f = useCurrentFrame();
  const fPlan = t.find('L13', 'plan');
  const fPres = t.find('L13', 'president');
  const fDumb = t.find('L13', 'dumb');
  const fAnd = t.find('L13', 'and');
  const fSmart = t.find('L13', 'smart');
  const loop = prog(f, t.frames - 22, t.frames, EZ.inOut);
  return (
    <AbsoluteFill style={{background: '#0b0204'}}>
      <div style={{...center, top: 220, fontFamily: 'Playfair Display', fontWeight: 900, fontStyle: 'italic', fontSize: 150, color: '#fff', opacity: prog(f, fPlan - 6, fPlan + 4) * (1 - prog(f, fPres - 4, fPres + 4)), transform: `scale(${1 + 0.1 * prog(f, fPlan, fPres)})`}}>
        A plan?
      </div>
      <div style={{position: 'absolute', left: 90, top: 200, width: 900, opacity: prog(f, fPres - 4, fPres + 6)}}>
        <div style={{fontFamily: 'Playfair Display', fontSize: 300, color: K.red, lineHeight: 0.6, height: 120}}>“</div>
        <div style={{fontFamily: 'Playfair Display', fontWeight: 700, fontStyle: 'italic', fontSize: 84, color: '#fff', lineHeight: 1.15}}>
          <span style={{opacity: prog(f, fDumb - 18, fDumb - 6)}}>We're not that dumb…</span>
          <br />
          <span style={{opacity: prog(f, fAnd - 4, fAnd + 6), color: K.gold}}>and we're not that smart.</span>
        </div>
        <div style={{marginTop: 40, fontFamily: 'Oswald', fontWeight: 700, fontSize: 40, color: '#b58a8e', letterSpacing: 4, opacity: prog(f, fSmart, fSmart + 10)}}>— DONALD KEOUGH, COCA-COLA PRESIDENT</div>
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 70, opacity: loop, transform: `scale(${0.6 + 0.4 * loop})`}}>
        <Can3D kind="new" size={600} rotY={-0.9} />
      </div>
    </AbsoluteFill>
  );
};

export const NewCoke: React.FC = () => {
  const f = useCurrentFrame();
  const S = (id: string, off = 0) => t.ls(id, off);
  const hits: [number, number][] = [
    [t.find('L02', 'gone'), 18],
    [t.find('L06', 'loses'), 18],
    [t.find('L09', 'wrong'), 20],
    [t.find('L12', 'classic'), 12],
  ];
  return (
    <AbsoluteFill style={{background: K.bg}}>
      <FxDefs />
      <Audio src={staticFile('newcoke/mix.wav')} />
      <AbsoluteFill style={{transform: `${drift(f, 5, 'nc')} ${shake(f, hits, 'nc')}`}}>
        <Scene from={0} to={S('L02', 0.05)} tin="none" tout="zoomIn">
          <Hook />
        </Scene>
        <Scene from={S('L02', -0.1)} to={S('L03', 0.05)} tin="zoomIn" tout="whipU">
          <GoneScene />
        </Scene>
        <Scene from={S('L03', -0.1)} to={S('L04', 0.05)} tin="whipU" tout="zoomIn" push={0.08}>
          <TVScene />
        </Scene>
        <Scene from={S('L04', -0.1)} to={S('L05', 0.05)} tin="zoomIn" tout="whipL">
          <RecipeScene />
        </Scene>
        <Scene from={S('L05', -0.1)} to={S('L06', 0.05)} tin="whipL" tout="zoomIn">
          <BeatsScene />
        </Scene>
        <Scene from={S('L06', -0.1)} to={S('L07', 0.05)} tin="zoomIn" tout="whipR">
          <LaunchScene />
        </Scene>
        <Scene from={S('L07', -0.1)} to={S('L08', 0.05)} tin="whipR" tout="zoomIn">
          <CallsScene />
        </Scene>
        <Scene from={S('L08', -0.1)} to={S('L09', 0.05)} tin="zoomIn" tout="punch">
          <PsychScene />
        </Scene>
        <Scene from={S('L09', -0.1)} to={S('L10', 0.05)} tin="punch" tout="zoomIn">
          <WrongScene />
        </Scene>
        <Scene from={S('L10', -0.1)} to={S('L11', 0.05)} tin="zoomIn" tout="whipU">
          <SipScene />
        </Scene>
        <Scene from={S('L11', -0.1)} to={S('L12', 0.05)} tin="whipU" tout="zoomOut">
          <CanScene />
        </Scene>
        <Scene from={S('L12', -0.1)} to={S('L13', 0.05)} tin="zoomOut" tout="fade">
          <ClassicScene />
        </Scene>
        <Scene from={S('L13', -0.1)} to={t.frames} tin="fade" tout="none" push={0.03}>
          <QuoteScene />
        </Scene>
      </AbsoluteFill>
      <LightLeaks colors={['rgba(255,60,60,.5)', 'rgba(255,190,120,.35)', 'rgba(255,90,200,.25)']} opacity={0.25} seed="nc" />
      <Particles n={40} color="#ffd0c0" opacity={0.3} seed={4} />
      <FlareSweep at={t.find('L06', 'new') - 4} />
      <FlareSweep at={t.find('L12', 'coca') - 6} color="#fff" />
      <Flash at={[t.find('L09', 'wrong')]} peak={0.3} color="#ff8890" />
      <Captions t={t as T} accent={K.gold} y={1330} />
      <Vignette strength={0.7} />
      <Grain opacity={0.09} />
    </AbsoluteFill>
  );
};
