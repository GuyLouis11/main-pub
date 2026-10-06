import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import usStates from 'us-atlas/states-albers-10m.json';
import tlData from '../../public/tipping/timeline.json';
import {makeT, T} from '../kit/timeline';
import {EZ, kf, prog, rnd, spr} from '../kit/motion';
import {Chroma, CRT, drift, Flash, FlareSweep, FxDefs, Grain, LightLeaks, Particles, shake, Vignette} from '../kit/fx';
import {Captions} from '../kit/Captions';
import {Scene} from '../kit/Scene';
import {Odometer, useStamp} from '../kit/Brand';
import {HAIRC, Person, PersonProps, SKIN} from '../kit/Person';

const t = makeT(tlData as never);
export const TIPPING_FRAMES = t.frames;

const Q = {teal: '#1f6f72', tealD: '#0f3a3c', cream: '#f6efe0', red: '#d23b2a', mustard: '#e8b13a', ink: '#141210', sepia: '#d9b98a', green: '#3fb36a'};
const big: React.CSSProperties = {fontFamily: 'Anton', textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: 1};
const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center'};
const SERVER: PersonProps = {skin: SKIN[2], hair: 'bun', hairColor: HAIRC.brown, outfit: 'apron', cloth: '#2a2f3a', age: 0.25, earrings: true, seed: 71};

/** diner interior: checkered floor in perspective, booth, warm pendant light */
const Diner: React.FC<{sepia?: number}> = ({sepia = 0}) => (
  <AbsoluteFill style={{filter: sepia ? `sepia(${sepia})` : undefined}}>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${Q.tealD} 0%, ${Q.teal} 55%, #0b2224 100%)`}} />
    <div style={{position: 'absolute', left: -600, right: -600, top: 1100, height: 1600, transformOrigin: '50% 0%', transform: 'perspective(900px) rotateX(62deg)', backgroundImage: `conic-gradient(${Q.cream} 25%, #1a1a1a 0 50%, ${Q.cream} 0 75%, #1a1a1a 0)`, backgroundSize: '160px 160px', opacity: 0.55}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 640, height: 30, background: 'linear-gradient(180deg,#c9ced6,#6a717c)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 35% at 50% 18%, rgba(255,220,150,.35), transparent 70%)'}} />
  </AbsoluteFill>
);

/** a thermal receipt printing out (len 0 → 1) */
const Receipt: React.FC<{len: number; tip?: string}> = ({len, tip = '______'}) => {
  const lines = ['DINER #41', '2 COFFEE          6.00', '1 PANCAKES        9.50', '1 EGGS & TOAST    8.25', '----------------------', 'SUBTOTAL         23.75', 'TAX               1.96', '', `TIP           ${tip}`, '', 'TOTAL         ________'];
  const H = 640;
  return (
    <div style={{position: 'relative', width: 360, height: H * len, overflow: 'hidden', background: '#fbfaf6', boxShadow: '0 20px 50px rgba(0,0,0,.45)', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 10px),95% 100%,90% calc(100% - 10px),85% 100%,80% calc(100% - 10px),75% 100%,70% calc(100% - 10px),65% 100%,60% calc(100% - 10px),55% 100%,50% calc(100% - 10px),45% 100%,40% calc(100% - 10px),35% 100%,30% calc(100% - 10px),25% 100%,20% calc(100% - 10px),15% 100%,10% calc(100% - 10px),5% 100%,0 calc(100% - 10px))'}}>
      <div style={{padding: '30px 26px', fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 21, color: '#2a2a2a', lineHeight: 1.75, whiteSpace: 'pre'}}>
        {lines.map((l, i) => <div key={i} style={{color: l.startsWith('TIP') ? Q.red : undefined, fontWeight: l.startsWith('TIP') ? 800 : 600}}>{l || ' '}</div>)}
      </div>
    </div>
  );
};

/** a tablet tip screen; `hi` picks the glowing option */
const TipScreen: React.FC<{opts: string[]; hi: number; w?: number; title?: string}> = ({opts, hi, w = 420, title = 'ADD A TIP?'}) => (
  <div style={{width: w, padding: 24, borderRadius: 30, background: '#111316', boxShadow: '0 30px 70px rgba(0,0,0,.55), inset 0 0 0 10px #2a2d33'}}>
    <div style={{borderRadius: 16, background: 'linear-gradient(180deg,#f4f6f8,#dfe4ea)', padding: '22px 18px'}}>
      <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: w * 0.075, color: '#1b1f24', textAlign: 'center'}}>{title}</div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${opts.length}, 1fr)`, gap: 10, marginTop: 16}}>
        {opts.map((o, i) => (
          <div key={i} style={{borderRadius: 12, padding: '16px 0', textAlign: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: w * 0.07, color: i === hi ? '#fff' : '#1b1f24', background: i === hi ? '#1f7a4d' : '#fff', boxShadow: i === hi ? '0 0 24px rgba(31,122,77,.7)' : 'inset 0 0 0 2px #c9d0d8'}}>{o}</div>
        ))}
      </div>
      <div style={{textAlign: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: w * 0.04, color: '#8a939c', marginTop: 12}}>no tip</div>
    </div>
  </div>
);

/* ---------- S1: your tip isn't a bonus ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fBonus = t.find('L01', 'bonus');
  const fWage = t.find('L01', 'wage');
  const stamp = useStamp(fWage, -10);
  const srv = spr(f, fps, 0, {damping: 16, stiffness: 90});
  return (
    <AbsoluteFill>
      <Diner />
      <div style={{position: 'absolute', left: 60, top: 160, transform: `rotate(-4deg)`}}>
        <Receipt len={prog(f, 0, fBonus + 4, EZ.out)} />
      </div>
      <div style={{position: 'absolute', left: 470, top: 300 + (1 - srv) * 600}}>
        <Person {...SERVER} w={540} rim="#ffd9a0" mood={f >= fWage ? 'neutral' : 'smile'} look={-0.5} />
      </div>
      <div style={{position: 'absolute', left: 330, top: 760, transform: `rotate(6deg) scale(${0.85 + 0.15 * prog(f, 6, 20, EZ.back)})`}}>
        <TipScreen opts={['18%', '20%', '25%']} hi={Math.floor(f / 18) % 3} w={430} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 1040, zIndex: 5, ...stamp}}>
        <div style={{border: `10px solid ${Q.red}`, color: Q.red, background: 'rgba(246,239,224,.92)', fontFamily: 'Archivo Black', fontSize: 92, padding: '0 30px', borderRadius: 14, letterSpacing: 4}}>TIP = WAGE</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S2: $2.13 an hour, frozen since 1991 ---------- */
const FrozenScene: React.FC = () => {
  const f = useCurrentFrame();
  const fTwo = t.find('L02', 'two');
  const fChanged = t.find('L02', 'changed');
  const f91 = t.find('L02', '1991');
  const ice = prog(f, fChanged - 4, f91 + 10, EZ.inOut);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, ${Q.tealD}, #050b0c 80%)`}}>
      <div style={{...center, top: 150, fontFamily: 'Oswald', fontWeight: 700, fontSize: 50, color: Q.cream, letterSpacing: 8, opacity: prog(f, t.ls('L02'), t.ls('L02') + 8)}}>FEDERAL MINIMUM WAGE · SERVERS</div>
      <div style={{...center, top: 330, opacity: prog(f, fTwo - 3, fTwo + 4)}}>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <div style={{...big, fontSize: 330, color: ice > 0.5 ? '#dff4ff' : '#fff', textShadow: `0 0 ${20 + 50 * ice}px rgba(160,220,255,${0.3 + 0.6 * ice})`, transform: `scale(${1 + 0.15 * (1 - prog(f, fTwo, fTwo + 10))})`}}>$2.13</div>
          {/* frost + ice crystals creeping over the number */}
          <div style={{position: 'absolute', inset: -20, background: `linear-gradient(180deg, rgba(200,235,255,${0.45 * ice}), rgba(120,190,240,${0.15 * ice}))`, mixBlendMode: 'screen', borderRadius: 30, clipPath: `inset(0 ${100 - ice * 100}% 0 0)`}} />
          {Array.from({length: 26}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: `${rnd(i) * 100}%`, top: `${rnd(i + 9) * 100}%`, width: 30, height: 30, opacity: ice > rnd(i + 3) ? 0.9 : 0, transform: `rotate(${rnd(i + 5) * 90}deg) scale(${0.5 + rnd(i + 7)})`}}>
              <svg viewBox="-10 -10 20 20" width={30} height={30}><path d="M0-9V9M-9 0H9M-6-6L6 6M-6 6L6-6" stroke="#eaf8ff" strokeWidth="1.6" /></svg>
            </div>
          ))}
        </div>
        <div style={{...big, fontSize: 70, color: '#9fd6ff', letterSpacing: 10}}>PER HOUR</div>
      </div>
      <div style={{position: 'absolute', left: 540 - 220, top: 880, width: 440, height: 300, borderRadius: 20, background: '#f4f1ea', boxShadow: '0 30px 70px rgba(0,0,0,.6)', opacity: prog(f, fChanged - 6, fChanged + 2), overflow: 'hidden'}}>
        <div style={{height: 80, background: Q.red, color: '#fff', ...big, fontSize: 56, textAlign: 'center', paddingTop: 12, letterSpacing: 8}}>SINCE</div>
        <div style={{textAlign: 'center', ...big, fontSize: 170, color: Q.ink, marginTop: 14}}>1991</div>
        <div style={{position: 'absolute', inset: 0, background: `rgba(170,220,255,${0.35 * ice})`}} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S3: tips count toward the rest; owner covers shortfalls ---------- */
const CreditScene: React.FC = () => {
  const f = useCurrentFrame();
  const fCount = t.find('L03', 'count');
  const fShort = t.find('L03', 'short');
  const fOwner = t.find('L03', 'owner');
  const H = 760;
  const base = 2.13 / 7.25;
  const tips = prog(f, fCount - 4, fCount + 14, EZ.inOut) * (1 - base);
  const shortfall = prog(f, fShort - 2, fShort + 10, EZ.inOut) * 0.35;
  const owner = prog(f, fOwner - 2, fOwner + 12, EZ.inOut) * 0.35;
  const seg = (h: number, bottom: number, bg: string, label: string, show: number) => (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: bottom * H, height: h * H, background: bg, borderTop: '3px solid rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...big, fontSize: 48, color: '#fff', opacity: show}}>{h > 0.06 ? label : ''}</div>
  );
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #1d4a4c, #061213 80%)`}}>
      <div style={{position: 'absolute', left: 140, top: 230, width: 380, height: H, borderRadius: 18, background: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,.2)', overflow: 'hidden'}}>
        {seg(base, 0, '#5a6a7a', 'OWNER $2.13', 1)}
        {seg(tips - shortfall, base, Q.green, 'YOUR TIPS', 1)}
        {seg(owner, base + tips - shortfall, Q.mustard, 'OWNER', owner > 0.01 ? 1 : 0)}
      </div>
      <div style={{position: 'absolute', left: 140, top: 160, width: 380, textAlign: 'center', ...big, fontSize: 64, color: Q.cream}}>$7.25 MIN.</div>
      <div style={{position: 'absolute', left: 560, top: 360, width: 440, fontFamily: 'Oswald', fontWeight: 700, fontSize: 44, color: Q.cream, letterSpacing: 2, lineHeight: 1.25}}>
        <div style={{opacity: prog(f, fCount - 4, fCount + 4)}}>Tips can cover up to <span style={{color: Q.green}}>$5.12</span> of every hour</div>
        <div style={{marginTop: 50, opacity: prog(f, fShort - 4, fShort + 4)}}>Slow night? Tips <span style={{color: Q.red}}>fall short</span>…</div>
        <div style={{marginTop: 50, opacity: prog(f, fOwner - 4, fOwner + 4)}}>…the owner must <span style={{color: Q.mustard}}>make up the gap</span></div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S4: so how did it get like this? (VHS rewind into the past) ---------- */
const RewindScene: React.FC = () => {
  const f = useCurrentFrame();
  const a = t.ls('L04');
  const b = t.le('L04') + 4;
  const year = Math.round(kf(f, [[a, 2025], [b, 1867]], EZ.in));
  const sep = prog(f, a, b, EZ.in);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, filter: `sepia(${sep}) blur(${2 * Math.sin(sep * Math.PI)}px)`}}>
        <Diner />
      </div>
      {Array.from({length: 8}).map((_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((f * 37 + i * 260) % 2000) - 40, height: 14 + (i % 3) * 8, background: 'rgba(255,255,255,.25)', mixBlendMode: 'screen'}} />)}
      <div style={{position: 'absolute', left: 70, top: 120, fontFamily: 'VT323', fontSize: 90, color: '#fff', textShadow: '4px 0 #ff4fd8, -4px 0 #5ef2e6'}}>◀◀ REWIND</div>
      <div style={{...center, top: 640, ...big, fontSize: 260, color: '#fff', textShadow: '0 0 40px rgba(255,220,160,.6)'}}>{year}</div>
      <CRT />
    </AbsoluteFill>
  );
};

/* ---------- S5: the Pullman Company's porters ---------- */
const PullmanScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = t.ls('L05');
  const fPull = t.find('L05', 'pullman');
  const fPort = t.find('L05', 'porters');
  const car = prog(f, a - 4, fPull + 14, EZ.out);
  const por = spr(f, fps, fPort - 10, {damping: 16, stiffness: 100});
  return (
    <AbsoluteFill style={{filter: 'sepia(.55) contrast(1.05)'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#3a2a1c 0%,#6a4a2a 45%,#2a1c12 100%)'}} />
      {/* steam */}
      {Array.from({length: 10}).map((_, i) => <div key={i} style={{position: 'absolute', left: 200 + i * 80 - ((f * 2 + i * 30) % 300), top: 130 + (i % 3) * 40, width: 260, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,230,210,.35), transparent 70%)', filter: 'blur(8px)'}} />)}
      {/* the sleeper car */}
      <div style={{position: 'absolute', left: 1100 - car * 1160, top: 300, width: 1500, height: 420}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '40px 40px 10px 10px', background: 'linear-gradient(180deg,#2f4a2c,#1c2e1a)', boxShadow: 'inset 0 0 0 6px #14200f, 0 30px 60px rgba(0,0,0,.6)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 22, textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 70, color: '#d8b45a', letterSpacing: 26}}>PULLMAN</div>
        {Array.from({length: 9}).map((_, i) => <div key={i} style={{position: 'absolute', left: 70 + i * 155, top: 130, width: 110, height: 130, borderRadius: '50px 50px 8px 8px', background: 'radial-gradient(circle at 50% 40%, #ffe2a0, #c98a30)', boxShadow: 'inset 0 0 0 6px #14200f', opacity: 0.9}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, height: 12, background: '#d8b45a', opacity: 0.6}} />
        {[160, 420, 1080, 1340].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 380, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle, #555 30%, #222 32%, #3a3a3a 60%, #111 62%)', transform: `rotate(${f * 12}deg)`}} />)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, height: 18, background: '#1a120a'}} />
      {/* a porter, in uniform */}
      <div style={{position: 'absolute', left: 540 - 260, top: 560 + (1 - por) * 700, opacity: por}}>
        <Person skin={SKIN[4]} hair="buzz" hairColor={HAIRC.black} outfit="porter" cloth="#1d2a4a" hat="porter" age={0.45} mustache mood="stern" look={0.2} rim="#ffd9a0" w={520} seed={72} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 1170, padding: '10px 24px', background: 'rgba(20,14,8,.85)', color: '#e8d6b0', fontFamily: 'Oswald', fontWeight: 700, fontSize: 34, letterSpacing: 4, opacity: por}}>PULLMAN PORTER · EARLY 1900s</div>
    </AbsoluteFill>
  );
};

/* ---------- S6: tips were most of their income (1915 inquiry) ---------- */
const IncomeScene: React.FC = () => {
  const f = useCurrentFrame();
  const fPaid = t.find('L06', 'paid');
  const fTips = t.find('L06', 'tips');
  const fMost = t.find('L06', 'most');
  const wage = prog(f, fPaid - 2, fPaid + 12, EZ.out);
  const tips = prog(f, fTips - 2, fTips + 16, EZ.out);
  const H = 560;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #4a3520, #120c06 80%)', filter: 'sepia(.25)'}}>
      <div style={{position: 'absolute', left: 90, top: 140, width: 900, padding: '20px 30px', background: '#efe2c4', transform: 'rotate(-1.5deg)', boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
        <div style={{fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 46, color: '#2a1c10'}}>PORTER PAY · 1915 FEDERAL INQUIRY</div>
        <div style={{fontFamily: 'Special Elite', fontSize: 30, color: '#5a4228', marginTop: 6}}>U.S. Commission on Industrial Relations · per month</div>
      </div>
      {[
        {l: 'WAGE', v: 27.5, p: wage, c: '#8a7a62', x: 190},
        {l: 'TIPS', v: 58, p: tips, c: Q.mustard, x: 590},
      ].map((b, i) => (
        <div key={i} style={{position: 'absolute', left: b.x, top: 470, width: 300, height: H}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: (b.v / 58) * H * 0.95 * b.p, borderRadius: '14px 14px 0 0', background: b.c, boxShadow: i ? '0 0 40px rgba(232,177,58,.55)' : 'none'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: (b.v / 58) * H * 0.95 * b.p + 14, textAlign: 'center', ...big, fontSize: 80, color: '#fff', opacity: b.p}}>${b.v.toFixed(2).replace('.00', '')}{i ? '*' : ''}</div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: -70, textAlign: 'center', ...big, fontSize: 56, color: Q.cream}}>{b.l}</div>
        </div>
      ))}
      <div style={{position: 'absolute', right: 80, top: 1112, fontFamily: 'Inter', fontWeight: 600, fontSize: 24, color: '#b8a582'}}>*about, on average</div>
      <div style={{...center, top: 1170, ...big, fontSize: 70, color: Q.mustard, opacity: prog(f, fMost, fMost + 6)}}>TIPS = MOST OF THEIR PAY</div>
    </AbsoluteFill>
  );
};

/* ---------- S7: six states made tipping illegal ---------- */
const HEADLINES = [
  ['WASHINGTON OUTLAWS TIPPING', '1909'],
  ['MISSISSIPPI BANS THE TIP', '1912'],
  ['ARKANSAS: TIPPING A CRIME', '1913'],
  ['IOWA PASSES ANTI-TIP LAW', '1915'],
  ['SOUTH CAROLINA BANS TIPS', '1915'],
  ['ANOTHER STATE SAYS NO TIPS', '1915'],
];
const BanScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fSix = t.find('L07', 'six');
  const fIll = t.find('L07', 'illegal');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #3a2a1a, #0c0805 80%)'}}>
      {HEADLINES.map(([h, y], i) => {
        const at = fSix - 6 + i * 4;
        const s = spr(f, fps, at, {damping: 13, stiffness: 220});
        return (
          <div key={i} style={{position: 'absolute', left: 80 + (i % 2) * 60, top: 160 + i * 148, width: 860, padding: '16px 26px', background: '#efe6d0', boxShadow: '0 16px 40px rgba(0,0,0,.6)', transform: `rotate(${(rnd(i + 2) - 0.5) * 8}deg) scale(${f >= at ? 1.6 - 0.6 * s : 0})`, opacity: f >= at ? 1 : 0, filter: 'sepia(.35)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '3px double #3a2a1a', paddingBottom: 6, fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 26, color: '#3a2a1a'}}>
              <span>THE DAILY CHRONICLE</span>
              <span>{y}</span>
            </div>
            <div style={{fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 44, color: '#1a120a', marginTop: 8, lineHeight: 1, whiteSpace: 'nowrap'}}>{h}</div>
          </div>
        );
      })}
      <div style={{...center, top: 1110, opacity: prog(f, fIll - 2, fIll + 4)}}>
        <Chroma amt={f >= fIll ? Math.exp(-(f - fIll) / 5) * 12 : 0} style={{display: 'inline-block'}}>
          <div style={{...big, fontSize: 110, color: Q.red, background: 'rgba(12,8,5,.85)', padding: '0 30px'}}>6 STATES · ILLEGAL</div>
        </Chroma>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S8: bans repealed → tip screens everywhere; 72% ---------- */
const NowScene: React.FC = () => {
  const f = useCurrentFrame();
  const fGone = t.find('L08', 'gone');
  const fNow = t.find('L08', 'now');
  const f72 = t.find('L08', 'seventy-two');
  const now = prog(f, fNow - 4, fNow + 8, EZ.inOut);
  const stamp = useStamp(fGone, -14);
  return (
    <AbsoluteFill style={{background: '#0c0805'}}>
      {/* the old papers, stamped repealed */}
      <AbsoluteFill style={{opacity: 1 - now, filter: 'sepia(.5)'}}>
        {HEADLINES.slice(0, 4).map(([h, y], i) => (
          <div key={i} style={{position: 'absolute', left: 90 + (i % 2) * 70, top: 200 + i * 170, width: 830, padding: '18px 26px', background: '#efe6d0', transform: `rotate(${(rnd(i + 2) - 0.5) * 8}deg)`, opacity: 0.85}}>
            <div style={{fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 40, color: '#1a120a', whiteSpace: 'nowrap'}}>{h} · {y}</div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 190, top: 500, ...stamp}}>
          <div style={{border: `12px solid ${Q.red}`, color: Q.red, fontFamily: 'Archivo Black', fontSize: 120, padding: '0 34px', borderRadius: 14, background: 'rgba(239,230,208,.8)'}}>REPEALED</div>
        </div>
      </AbsoluteFill>
      {/* today: a self-checkout asking for a tip */}
      <AbsoluteFill style={{opacity: now, background: 'radial-gradient(ellipse at 50% 35%, #2a3440, #090c10 80%)'}}>
        <div style={{position: 'absolute', left: 540 - 300, top: 150, width: 600, height: 760, borderRadius: 30, background: 'linear-gradient(180deg,#3a3f48,#1d2026)', boxShadow: '0 40px 90px rgba(0,0,0,.6)'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: '#cfd8e6', letterSpacing: 6}}>SELF-CHECKOUT</div>
          <div style={{position: 'absolute', left: 60, top: 100}}><TipScreen opts={['20%', '25%', '30%']} hi={Math.min(2, Math.floor(Math.max(0, f - fNow) / 10))} w={480} title="Would you like to leave a tip?" /></div>
          <div style={{position: 'absolute', left: 140, top: 520, width: 320, height: 140, borderRadius: 14, background: '#0c0e12', boxShadow: 'inset 0 0 0 4px #3a3f48'}} />
        </div>
        <div style={{...center, top: 950, opacity: prog(f, f72 - 2, f72 + 6)}}>
          <Odometer from={0} to={72} a={f72 - 2} b={f72 + 14} suffix="%" style={{...big, fontSize: 190, color: '#fff', justifyContent: 'center'}} />
          <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: '#9fb4cc', letterSpacing: 4}}>SAY TIPPING IS EXPECTED IN MORE PLACES · PEW, 2023</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- S9: the twist — Massachusetts said no ---------- */
const STATES = feature(usStates as never, (usStates as never as {objects: {states: never}}).objects.states) as never as {features: {id: string}[]};
const MA = STATES.features.find((s) => s.id === '25');
const statePath = geoPath(null);
const TwistScene: React.FC = () => {
  const f = useCurrentFrame();
  const fTwist = t.find('L09', 'twist');
  const fMass = t.find('L09', 'massachusetts');
  const fNo = t.find('L09', 'no');
  const fTwo = t.find('L09', 'two');
  const vote = prog(f, fNo - 4, fTwo + 10, EZ.inOut);
  const check = prog(f, fNo - 2, fNo + 6, EZ.out);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1a2236, #06080d 80%)'}}>
      <div style={{...center, top: 120, ...big, fontSize: 100, color: Q.mustard, opacity: prog(f, fTwist - 4, fTwist + 4)}}>THE TWIST</div>
      {/* New England close-up with Massachusetts lit */}
      <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 230, opacity: prog(f, fMass - 6, fMass + 4)}} viewBox="820 90 160 120">
        {STATES.features.map((st, i) => <path key={i} d={statePath(st as never) || ''} fill={st.id === '25' ? 'rgba(232,177,58,.85)' : 'rgba(120,140,190,.18)'} stroke="rgba(180,200,240,.45)" strokeWidth={0.4} />)}
        {MA && null}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 560, fontFamily: 'Oswald', fontWeight: 700, fontSize: 40, color: '#fff', letterSpacing: 4, opacity: prog(f, fMass, fMass + 8)}}>MASSACHUSETTS · 2024</div>
      {/* ballot */}
      <div style={{position: 'absolute', left: 120, top: 650, width: 840, padding: '26px 34px', background: '#f6f3ec', boxShadow: '0 30px 70px rgba(0,0,0,.6)', transform: 'rotate(-1deg)', opacity: prog(f, fMass + 4, fMass + 14)}}>
        <div style={{fontFamily: 'Oswald', fontWeight: 700, fontSize: 36, color: '#1b1f24', letterSpacing: 2}}>QUESTION 5: phase out the lower tipped wage?</div>
        <div style={{display: 'flex', gap: 60, marginTop: 20}}>
          {['YES', 'NO'].map((o, i) => (
            <div key={o} style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 60, height: 60, border: '5px solid #1b1f24', borderRadius: 8, position: 'relative'}}>
                {i === 1 && <svg viewBox="0 0 60 60" width={60} height={60} style={{position: 'absolute', inset: -4}}><path d="M10 32 L25 46 L52 12" fill="none" stroke={Q.red} strokeWidth="8" strokeDasharray="70" strokeDashoffset={70 - 70 * check} strokeLinecap="round" /></svg>}
              </div>
              <div style={{...big, fontSize: 60, color: '#1b1f24'}}>{o}</div>
            </div>
          ))}
        </div>
      </div>
      {/* results */}
      <div style={{position: 'absolute', left: 120, top: 960, width: 840, opacity: prog(f, fNo, fNo + 6)}}>
        {[
          ['NO', 64.1, Q.red],
          ['YES', 35.9, '#6a7a8a'],
        ].map(([l, v, c], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', marginBottom: 18}}>
            <div style={{width: 120, ...big, fontSize: 56, color: '#fff'}}>{l as string}</div>
            <div style={{height: 64, width: `${(v as number) * vote * 1.1}%`, background: c as string, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16, ...big, fontSize: 40, color: '#fff'}}>{vote > 0.8 ? `${v}%` : ''}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S10: ban it or keep it? (loops to the receipt) ---------- */
const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const fBan = t.find('L10', 'banned');
  const fReal = t.find('L10', 'real');
  return (
    <AbsoluteFill>
      <Diner />
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: `linear-gradient(90deg, rgba(210,59,42,${0.55 * prog(f, fBan - 4, fBan + 4)}), transparent)`}} />
      <div style={{position: 'absolute', right: 0, top: 0, width: 540, height: 1920, background: `linear-gradient(270deg, rgba(63,179,106,${0.55 * prog(f, fReal - 8, fReal)}), transparent)`}} />
      <div style={{position: 'absolute', left: 540 - 270, top: 300}}>
        <Person {...SERVER} w={540} rim="#ffd9a0" mood={f >= fReal - 4 ? 'smirk' : 'worried'} look={f >= fReal - 4 ? 0.8 : -0.8} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 180, ...big, fontSize: 120, color: '#fff', opacity: prog(f, fBan - 4, fBan + 4), textShadow: '0 8px 30px rgba(0,0,0,.6)'}}>BAN IT?</div>
      <div style={{position: 'absolute', right: 60, top: 180, ...big, fontSize: 120, color: '#fff', opacity: prog(f, fReal - 8, fReal), textShadow: '0 8px 30px rgba(0,0,0,.6)'}}>KEEP IT?</div>
      <div style={{position: 'absolute', left: 540 - 300, top: 1030, width: 600, padding: '18px 0', borderRadius: 60, background: 'rgba(12,10,8,.85)', textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, fontSize: 44, color: Q.cream, letterSpacing: 4, opacity: prog(f, fReal, fReal + 8)}}>
        COMMENT: BAN OR KEEP 👇
      </div>
    </AbsoluteFill>
  );
};

export const Tipping: React.FC = () => {
  const f = useCurrentFrame();
  const S = (id: string, off = 0) => t.ls(id, off);
  const hits: [number, number][] = [
    [t.find('L01', 'wage'), 12],
    [t.find('L02', 'two'), 14],
    [t.find('L07', 'illegal'), 14],
    [t.find('L08', 'gone'), 10],
    [t.find('L09', 'no'), 16],
  ];
  return (
    <AbsoluteFill style={{background: Q.ink}}>
      <FxDefs />
      <Audio src={staticFile('tipping/mix.wav')} />
      <AbsoluteFill style={{transform: `${drift(f, 5, 'tp')} ${shake(f, hits, 'tp')}`}}>
        <Scene from={0} to={S('L02', 0.05)} tin="none" tout="zoomIn">
          <Hook />
        </Scene>
        <Scene from={S('L02', -0.1)} to={S('L03', 0.05)} tin="zoomIn" tout="whipL">
          <FrozenScene />
        </Scene>
        <Scene from={S('L03', -0.1)} to={S('L04', 0.05)} tin="whipL" tout="fade" lout={4}>
          <CreditScene />
        </Scene>
        <Scene from={S('L04', -0.05)} to={S('L05', 0.05)} tin="fade" tout="zoomIn" lin={4} push={0.12}>
          <RewindScene />
        </Scene>
        <Scene from={S('L05', -0.1)} to={S('L06', 0.05)} tin="zoomIn" tout="whipU" push={0.05}>
          <PullmanScene />
        </Scene>
        <Scene from={S('L06', -0.1)} to={S('L07', 0.05)} tin="whipU" tout="zoomIn">
          <IncomeScene />
        </Scene>
        <Scene from={S('L07', -0.1)} to={S('L08', 0.05)} tin="zoomIn" tout="none" lout={0}>
          <BanScene />
        </Scene>
        <Scene from={S('L08', 0.0)} to={S('L09', 0.05)} tin="none" tout="punch" lin={0}>
          <NowScene />
        </Scene>
        <Scene from={S('L09', -0.1)} to={S('L10', 0.05)} tin="punch" tout="whipR">
          <TwistScene />
        </Scene>
        <Scene from={S('L10', -0.1)} to={t.frames} tin="whipR" tout="none" push={0.03}>
          <EndScene />
        </Scene>
      </AbsoluteFill>
      <LightLeaks colors={['rgba(255,190,120,.4)', 'rgba(90,200,200,.3)', 'rgba(255,120,90,.25)']} opacity={0.2} seed="tp" />
      <Particles n={36} color="#fff0d8" opacity={0.25} seed={9} />
      <FlareSweep at={t.find('L09', 'twist') - 6} color="#ffe6b0" />
      <Flash at={[t.find('L09', 'no')]} peak={0.25} />
      <Captions t={t as T} accent={Q.mustard} y={1330} />
      <Vignette strength={0.65} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
