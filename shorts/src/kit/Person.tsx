import React from 'react';
import {useCurrentFrame} from 'remotion';

/* Illustrated people (editorial, semi-realistic flat shading) to replace silhouettes. Generic characters, not likenesses
   of real individuals. A bust: head + shoulders + upper torso, in a 400×520 viewBox. Blinks and breathes on its own. */

export type Hair = 'side' | 'receding' | 'buzz' | 'bob' | 'long' | 'curly' | 'bun' | 'bald';
export type Outfit = 'suit' | 'police' | 'sweater' | 'blouse' | 'tee' | 'blazer' | 'vest' | 'porter' | 'apron';
export type Hat = 'none' | 'porter' | 'fedora';
export type Mood = 'neutral' | 'smirk' | 'worried' | 'angry' | 'shout' | 'smile' | 'stern' | 'shock';

export type PersonProps = {
  skin?: string;
  hair?: Hair;
  hairColor?: string;
  eyes?: string;
  outfit?: Outfit;
  cloth?: string; // main garment color
  tie?: string;
  mood?: Mood;
  age?: number; // 0 young … 1 older (wrinkles, grey)
  glasses?: boolean;
  mustache?: boolean;
  stubble?: boolean;
  beard?: boolean;
  earrings?: boolean;
  badge?: boolean;
  lanyard?: boolean;
  headphones?: boolean;
  hat?: Hat;
  loupe?: boolean; // jeweler's loupe over the right eye
  rim?: string; // rim-light color from the scene
  look?: number; // -1 … 1 eye direction
  turn?: number; // head tilt in degrees
  seed?: number; // de-syncs blinks
  w?: number;
  style?: React.CSSProperties;
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

export const SKIN = ['#f3d2b8', '#e8b994', '#d29a6f', '#b07650', '#8a5636', '#5f3a24'];
export const HAIRC = {black: '#1c1714', brown: '#4a3021', auburn: '#7a3b1d', blonde: '#c9a35c', grey: '#9b9a97', white: '#d9d6cf'};

export const Person: React.FC<PersonProps> = ({
  skin = SKIN[1],
  hair = 'side',
  hairColor = HAIRC.brown,
  eyes = '#4a3524',
  outfit = 'suit',
  cloth = '#2b2f38',
  tie = '#b8231a',
  mood = 'neutral',
  age = 0.3,
  glasses = false,
  mustache = false,
  stubble = false,
  beard = false,
  earrings = false,
  badge = false,
  lanyard = false,
  headphones = false,
  hat = 'none',
  loupe = false,
  rim = '#ffcf8a',
  look = 0,
  turn = 0,
  seed = 1,
  w = 420,
  style,
}) => {
  const f = useCurrentFrame();
  const id = React.useId().replace(/:/g, '');
  // blink: ~every 3.2 s, 4 frames, de-synced per person
  const ph = (f + seed * 37) % 96;
  const blink = ph < 2 ? 1 - ph / 2 : ph < 4 ? (ph - 2) / 2 : 1;
  const eyeOpen = 0.12 + 0.88 * blink;
  const breathe = Math.sin((f + seed * 11) / 24) * 2.2;
  const lx = look * 4;
  const skinD = shade(skin, -0.22);
  const skinDD = shade(skin, -0.38);
  const skinL = shade(skin, 0.18);
  const hc = hairColor;
  const hcD = shade(hc, -0.35);
  const hcL = shade(hc, 0.2);
  const clothD = shade(cloth, -0.35);
  const clothL = shade(cloth, 0.18);

  // brows by mood (inner end y offset, outer end y offset)
  const brow: Record<Mood, [number, number]> = {
    neutral: [0, 0], smirk: [2, -3], worried: [-7, 3], angry: [7, -4], shout: [6, -5], smile: [-1, -2], stern: [4, 0], shock: [-8, -6],
  };
  const [bi, bo] = brow[mood];

  const mouth = () => {
    switch (mood) {
      case 'smirk':
        return (
          <g>
            <path d="M178 253 Q196 255 214 251 Q222 247 227 243" fill="none" stroke={shade(skin, -0.5)} strokeWidth="3" strokeLinecap="round" />
            <path d="M182 256 Q200 262 216 254" fill="none" stroke={shade(skin, -0.1)} strokeWidth="5" strokeLinecap="round" opacity=".5" />
          </g>
        );
      case 'worried':
        return <path d="M180 258 Q200 249 220 258" fill="none" stroke={shade(skin, -0.5)} strokeWidth="3.4" strokeLinecap="round" />;
      case 'angry':
      case 'stern':
        return <path d="M180 255 Q200 251 220 255" fill="none" stroke={shade(skin, -0.55)} strokeWidth="3.6" strokeLinecap="round" />;
      case 'shout':
        return (
          <g>
            <path d="M176 246 Q200 236 224 246 Q222 282 200 286 Q178 282 176 246 Z" fill="#3a1414" />
            <path d="M181 247 Q200 241 219 247 L218 253 Q200 249 182 253 Z" fill="#f4efe6" />
            <path d="M186 276 Q200 268 214 276 Q200 284 186 276 Z" fill="#c44a4a" />
          </g>
        );
      case 'shock':
        return <ellipse cx="200" cy="258" rx="11" ry="15" fill="#3a1414" />;
      case 'smile':
        return (
          <g>
            <path d="M176 248 Q200 272 224 248 Q200 258 176 248 Z" fill="#7a2a2a" />
            <path d="M180 249 Q200 258 220 249 L219 253 Q200 260 181 253 Z" fill="#f4efe6" />
          </g>
        );
      default:
        return (
          <g>
            <path d="M178 252 Q189 247 200 250 Q211 247 222 252 Q200 256 178 252 Z" fill={shade(skin, -0.3)} />
            <path d="M180 253 Q200 264 220 253 Q200 258 180 253 Z" fill={shade(skin, -0.15)} />
          </g>
        );
    }
  };

  const eye = (cx: number, side: number) => (
    <g>
      <g transform={`translate(${cx} 186) scale(1 ${eyeOpen}) translate(${-cx} -186)`}>
        <path d={`M${cx - 19} 186 C${cx - 10} 175 ${cx + 10} 175 ${cx + 19} 186 C${cx + 10} 194 ${cx - 10} 194 ${cx - 19} 186 Z`} fill="#f6f1ea" />
        <circle cx={cx + lx} cy={186} r="8.5" fill={eyes} />
        <circle cx={cx + lx} cy={186} r="4.2" fill="#0d0b0a" />
        <circle cx={cx + lx + 3} cy={183} r="2.1" fill="#fff" opacity=".9" />
        <path d={`M${cx - 19} 186 C${cx - 10} 175 ${cx + 10} 175 ${cx + 19} 186`} fill="none" stroke="#2a1d16" strokeWidth="3.2" strokeLinecap="round" />
      </g>
      {/* lower lid + age line */}
      <path d={`M${cx - 15} 192 Q${cx} 197 ${cx + 15} 192`} fill="none" stroke={skinD} strokeWidth="1.6" opacity={0.5 + 0.4 * age} />
      {age > 0.45 && <path d={`M${cx + side * 22} 182 l${side * 7} -3 M${cx + side * 22} 188 l${side * 7} 1`} stroke={skinD} strokeWidth="1.4" opacity={age} />}
      {/* brow */}
      <path
        d={`M${cx - side * 18} ${164 + (side > 0 ? bi : bo)} Q${cx} ${157 + (bi + bo) / 2} ${cx + side * 20} ${165 + (side > 0 ? bo : bi)}`}
        fill="none"
        stroke={age > 0.7 ? shade(HAIRC.grey, -0.3) : hcD}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </g>
  );

  const backHair = () => {
    if (hair === 'long')
      return <path d="M112 200 C100 110 145 66 200 66 C255 66 300 110 288 200 C300 280 312 350 300 400 L100 400 C88 350 100 280 112 200 Z" fill={hcD} />;
    if (hair === 'bob' || hair === 'curly')
      return <path d="M108 230 C96 120 142 68 200 68 C258 68 304 120 292 230 C290 262 280 280 266 290 L134 290 C120 280 110 262 108 230 Z" fill={hcD} />;
    if (hair === 'bun') return <circle cx="200" cy="72" r="34" fill={hc} />;
    return null;
  };

  const frontHair = () => {
    switch (hair) {
      case 'side':
        return (
          <g>
            <path d="M120 178 C112 108 150 70 206 70 C262 70 292 110 282 172 C276 142 260 122 238 112 C212 124 168 120 140 138 C130 148 124 162 120 178 Z" fill={hc} />
            <path d="M150 104 C175 90 220 88 252 104" fill="none" stroke={hcL} strokeWidth="4" opacity=".5" />
            <path d="M238 112 C230 100 222 92 214 86" fill="none" stroke={hcD} strokeWidth="3" />
          </g>
        );
      case 'receding':
        return (
          <g>
            <path d="M120 186 C116 150 122 128 136 118 C140 140 140 158 132 188 Z" fill={hc} />
            <path d="M280 186 C284 150 278 128 264 118 C260 140 260 158 268 188 Z" fill={hc} />
            <path d="M150 104 C180 92 222 92 250 104 C230 100 172 100 150 104 Z" fill={hc} opacity=".55" />
          </g>
        );
      case 'buzz':
        return <path d="M122 168 C118 112 154 76 200 76 C246 76 282 112 278 168 C270 128 240 106 200 106 C160 106 130 128 122 168 Z" fill={hc} opacity=".85" />;
      case 'bob':
      case 'long':
        return <path d="M118 210 C110 120 150 72 204 72 C258 72 296 120 284 210 C280 160 262 120 226 108 C196 122 160 128 132 156 C124 170 120 190 118 210 Z" fill={hc} />;
      case 'curly':
        return (
          <g fill={hc}>
            {Array.from({length: 13}).map((_, i) => {
              const a = Math.PI * (0.95 + (i / 12) * 1.1);
              return <circle key={i} cx={200 + Math.cos(a) * 92} cy={170 + Math.sin(a) * 92} r="24" />;
            })}
          </g>
        );
      case 'bun':
        return <path d="M120 180 C114 112 152 76 200 76 C248 76 286 112 280 180 C272 136 244 108 200 106 C156 108 128 136 120 180 Z" fill={hc} />;
      default:
        return null;
    }
  };

  const torso = () => {
    const base = 'M48 520 C52 418 104 360 166 340 L234 340 C296 360 348 418 352 520 Z';
    const fills: Record<Outfit, React.ReactNode> = {
      suit: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M166 340 L200 432 L234 340 Z" fill="#eeeae2" />
          <path d="M191 350 L209 350 L214 452 L200 472 L186 452 Z" fill={tie} />
          <path d="M191 350 L209 350 L205 366 L195 366 Z" fill={shade(tie, -0.3)} />
          <path d="M166 340 L132 384 L176 404 L200 470 Z" fill={clothL} opacity=".5" />
          <path d="M234 340 L268 384 L224 404 L200 470 Z" fill={clothD} opacity=".6" />
          <circle cx="200" cy="496" r="4" fill={clothD} />
          <path d="M258 430 l26 -6 l2 10 l-26 6 Z" fill="#eeeae2" opacity=".85" />
        </g>
      ),
      blazer: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M166 340 Q200 400 234 340 Z" fill="#efe9df" />
          <path d="M166 340 L136 392 L182 410 L200 480 Z" fill={clothL} opacity=".45" />
          <path d="M234 340 L264 392 L218 410 L200 480 Z" fill={clothD} opacity=".55" />
        </g>
      ),
      police: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M166 340 L190 372 L200 352 L210 372 L234 340 Z" fill={clothD} />
          <path d="M200 352 L200 520" stroke={clothD} strokeWidth="3" />
          {[400, 450, 500].map((y) => <circle key={y} cx="206" cy={y} r="4" fill="#c9b37a" />)}
          <path d="M78 410 L140 392 L146 406 L84 426 Z" fill={clothD} />
          <path d="M322 410 L260 392 L254 406 L316 426 Z" fill={clothD} />
        </g>
      ),
      sweater: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M166 340 Q200 372 234 340 Q200 360 166 340 Z" fill="#efe9df" />
          <path d="M160 344 Q200 386 240 344" fill="none" stroke={clothD} strokeWidth="9" />
          {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${90 + i * 28} 430 l0 90`} stroke={clothD} strokeWidth="2" opacity=".35" />)}
        </g>
      ),
      blouse: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M170 340 L200 380 L230 340 L222 336 L200 362 L178 336 Z" fill={clothL} />
          <path d="M178 360 Q200 392 222 360" fill="none" stroke="#e8c76a" strokeWidth="2.4" />
          <circle cx="200" cy="384" r="4" fill="#e8c76a" />
        </g>
      ),
      tee: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M168 340 Q200 368 232 340" fill="none" stroke={clothD} strokeWidth="7" />
        </g>
      ),
      porter: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M166 340 L200 384 L234 340 Z" fill="#f2efe8" />
          <path d="M193 352 L207 352 L205 372 L195 372 Z" fill="#1b1b1b" />
          <path d="M166 340 L140 372 L196 520 L200 520 L200 390 Z" fill={clothL} opacity=".35" />
          {[410, 450, 490].map((y) => <g key={y}><circle cx="178" cy={y} r="5.5" fill="#d8b45a" /><circle cx="222" cy={y} r="5.5" fill="#d8b45a" /></g>)}
          <path d="M84 430 L120 424" stroke="#d8b45a" strokeWidth="4" />
        </g>
      ),
      apron: (
        <g>
          <path d={base} fill={cloth} />
          <path d="M150 380 L250 380 L262 520 L138 520 Z" fill="#f4f1ea" />
          <path d="M150 380 L166 340 M250 380 L234 340" stroke="#f4f1ea" strokeWidth="8" />
          <rect x="176" y="430" width="48" height="34" rx="4" fill="#e6e1d6" />
          <path d="M186 420 l0 -46" stroke="#1d3a6b" strokeWidth="5" />
        </g>
      ),
      vest: (
        <g>
          <path d={base} fill="#ece6da" />
          <path d="M150 350 L200 470 L250 350 C300 370 336 420 340 520 L60 520 C64 420 100 370 150 350 Z" fill={cloth} />
          <path d="M191 350 L209 350 L212 440 L200 456 L188 440 Z" fill={tie} />
        </g>
      ),
    };
    return fills[outfit];
  };

  return (
    <svg viewBox="0 0 400 520" width={w} height={w * 1.3} style={{overflow: 'visible', ...style}}>
      <defs>
        <radialGradient id={`sk${id}`} cx="42%" cy="40%" r="70%">
          <stop offset="0" stopColor={skinL} />
          <stop offset=".6" stopColor={skin} />
          <stop offset="1" stopColor={skinD} />
        </radialGradient>
        <linearGradient id={`key${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".38" />
        </linearGradient>
        <linearGradient id={`rim${id}`} x1="0" x2="1">
          <stop offset=".8" stopColor={rim} stopOpacity="0" />
          <stop offset="1" stopColor={rim} stopOpacity=".95" />
        </linearGradient>
        <filter id={`soft${id}`}><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <g transform={`translate(0 ${breathe * 0.4})`}>
        {/* torso + clothes */}
        <g transform={`translate(0 ${breathe})`}>
          {torso()}
          <path d="M48 520 C52 418 104 360 166 340 L234 340 C296 360 348 418 352 520 Z" fill={`url(#key${id})`} />
          <path d="M234 340 C296 360 348 418 352 520" fill="none" stroke={rim} strokeWidth="5" opacity=".75" filter={`url(#soft${id})`} />
          {lanyard && (
            <g>
              <path d="M174 342 L196 450 M226 342 L204 450" stroke="#1d5bd8" strokeWidth="7" />
              <rect x="178" y="446" width="44" height="58" rx="5" fill="#f3f1ea" />
              <rect x="178" y="446" width="44" height="14" rx="4" fill="#c8231a" />
              <rect x="186" y="466" width="14" height="18" fill="#9aa3b1" />
            </g>
          )}
          {badge && <path d="M268 418 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 z" fill="#e3c35a" stroke="#8a6a12" strokeWidth="1.5" />}
        </g>
        {hat === 'none' && backHair()}
        <g transform={`rotate(${turn} 200 300)`}>
          {/* neck */}
          <path d="M168 262 L166 346 Q200 362 234 346 L232 262 Z" fill={skinD} />
          <path d="M168 300 Q200 318 232 300 L232 270 L168 270 Z" fill={skinDD} opacity=".55" />
          {/* ears */}
          <path d="M122 168 C104 164 102 206 120 218 C126 220 128 196 122 168 Z" fill={skinD} />
          <path d="M278 168 C296 164 298 206 280 218 C274 220 272 196 278 168 Z" fill={skinD} />
          {earrings && <circle cx="116" cy="222" r="5" fill="#e8c76a" />}
          {/* face */}
          <path d="M200 92 C252 92 280 126 281 176 C282 218 270 248 248 270 C232 286 216 294 200 294 C184 294 168 286 152 270 C130 248 118 218 119 176 C120 126 148 92 200 92 Z" fill={`url(#sk${id})`} />
          <path d="M200 92 C252 92 280 126 281 176 C282 218 270 248 248 270 C232 286 216 294 200 294 C184 294 168 286 152 270 C130 248 118 218 119 176 C120 126 148 92 200 92 Z" fill={`url(#key${id})`} />
          <path d="M281 176 C282 218 270 248 248 270 C232 286 216 294 200 294" fill="none" stroke={`url(#rim${id})`} strokeWidth="6" />
          <path d="M260 130 C276 156 281 190 276 220" fill="none" stroke={rim} strokeWidth="4" opacity=".55" filter={`url(#soft${id})`} />
          {/* cheeks + age */}
          <ellipse cx="160" cy="226" rx="17" ry="9" fill="#e07a6a" opacity=".16" />
          <ellipse cx="240" cy="226" rx="17" ry="9" fill="#e07a6a" opacity=".12" />
          {age > 0.35 && <path d="M182 230 Q170 248 176 268 M218 230 Q230 248 224 268" fill="none" stroke={skinD} strokeWidth="2" opacity={age * 0.8} />}
          {age > 0.55 && <path d="M160 124 Q200 116 240 124 M166 136 Q200 129 234 136" fill="none" stroke={skinD} strokeWidth="1.8" opacity={age * 0.7} />}
          {stubble && <path d="M148 236 C160 282 184 292 200 292 C216 292 240 282 252 236 C240 262 220 270 200 270 C180 270 160 262 148 236 Z" fill={hcD} opacity=".22" />}
          {beard && <path d="M140 220 C146 290 178 306 200 306 C222 306 254 290 260 220 C250 258 230 276 200 276 C170 276 150 258 140 220 Z" fill={hc} />}
          {/* eyes, nose, mouth */}
          {eye(166, -1)}
          {eye(234, 1)}
          <path d="M202 192 C204 210 208 222 212 228" fill="none" stroke={skinD} strokeWidth="2.6" opacity=".7" />
          <path d="M186 232 Q193 238 200 236 Q207 238 214 232" fill="none" stroke={skinDD} strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx="203" cy="222" rx="5" ry="3" fill={skinL} opacity=".6" />
          {mustache && <path d="M176 246 C186 236 196 240 200 243 C204 240 214 236 224 246 C214 248 206 246 200 247 C194 246 186 248 176 246 Z" fill={hc} />}
          {mouth()}
          {glasses && (
            <g fill="none" stroke="#1d1a17" strokeWidth="4">
              <rect x="140" y="170" width="52" height="34" rx="10" fill="rgba(200,220,255,.08)" />
              <rect x="208" y="170" width="52" height="34" rx="10" fill="rgba(200,220,255,.08)" />
              <path d="M192 184 Q200 178 208 184 M140 182 L122 178 M260 182 L278 178" />
              <path d="M148 176 L160 172" stroke="#fff" strokeWidth="2.5" opacity=".5" />
            </g>
          )}
          {hat === 'none' ? frontHair() : hair === 'long' || hair === 'bob' ? null : <path d="M120 186 C116 158 122 142 134 136 L136 188 Z M280 186 C284 158 278 142 266 136 L264 188 Z" fill={hc} />}
          {loupe && (
            <g>
              <ellipse cx="234" cy="186" rx="30" ry="30" fill="#1d1a17" />
              <ellipse cx="234" cy="186" rx="22" ry="22" fill="rgba(170,210,255,.35)" stroke="#8a93a6" strokeWidth="3" />
              <path d="M222 176 L232 172" stroke="#fff" strokeWidth="3" opacity=".7" />
            </g>
          )}
          {hat === 'porter' && (
            <g>
              <path d="M126 128 C130 82 168 64 200 64 C232 64 270 82 274 128 Z" fill="#1d2a4a" />
              <rect x="122" y="118" width="156" height="22" rx="6" fill="#152038" />
              <path d="M128 140 Q200 168 272 140 L268 150 Q200 180 132 150 Z" fill="#0d1424" />
              <rect x="176" y="90" width="48" height="16" rx="3" fill="#d8b45a" />
            </g>
          )}
          {hat === 'fedora' && (
            <g>
              <path d="M90 140 Q200 108 310 140 Q300 156 200 150 Q100 156 90 140 Z" fill="#3a3128" />
              <path d="M132 136 C128 80 164 58 200 66 C236 58 272 80 268 136 Q200 122 132 136 Z" fill="#4a3f34" />
              <path d="M134 124 Q200 110 266 124 L266 136 Q200 122 134 136 Z" fill="#1d1712" />
            </g>
          )}
          {headphones && (
            <g>
              <path d="M112 186 Q112 60 200 60 Q288 60 288 186" fill="none" stroke="#2a2e36" strokeWidth="13" />
              <rect x="96" y="168" width="34" height="58" rx="14" fill="#2a2e36" stroke="#8a93a6" strokeWidth="3" />
              <rect x="270" y="168" width="34" height="58" rx="14" fill="#2a2e36" stroke="#8a93a6" strokeWidth="3" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

/** a few ready-made characters */
export const CAST: Record<string, PersonProps> = {
  jerry: {skin: SKIN[0], hair: 'receding', hairColor: HAIRC.grey, eyes: '#3a5a7a', outfit: 'suit', cloth: '#2c3140', tie: '#8a1f18', age: 0.75, glasses: true, mustache: true, lanyard: true, mood: 'neutral', seed: 3},
  auditor: {skin: SKIN[2], hair: 'bun', hairColor: HAIRC.black, outfit: 'blazer', cloth: '#3b4a63', age: 0.35, glasses: true, mood: 'stern', earrings: true, seed: 5},
  agent: {skin: SKIN[3], hair: 'buzz', hairColor: HAIRC.black, outfit: 'suit', cloth: '#1d2230', tie: '#1f3a7a', age: 0.4, mood: 'stern', seed: 7},
  psych: {skin: SKIN[1], hair: 'receding', hairColor: HAIRC.white, outfit: 'vest', cloth: '#5b4a3a', tie: '#2f4a3a', age: 0.85, glasses: true, beard: true, headphones: true, mood: 'worried', seed: 9},
};
