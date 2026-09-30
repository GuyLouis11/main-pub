# 0.999… = 1 — YouTube Short

Vertical 1080×1920 YouTube Short, 59.5 s, "Infinite" motion design (HyperFrames + GSAP). It has no footage: a warp field
of stars and drifting nines, glass cards, digit-level proof animations, chromatic impact hits, and an
infinite-zoom number line with real geometry (each ×10 step is self-similar). Narration uses eleven_v3 (voice
apOzcbHULxCnvWfHPd41) with word timestamps for the captions. The score is dark synthwave/trap, synthesized in `tools/score.py`.

## Beats
| Time | Line | Picture |
|---|---|---|
| 0.0 | 0.999, repeating forever, is exactly 1. | Loop cursor → digits type, nines recede to infinity, "= 1" slams with a shockwave |
| 4.6 | Not close to 1. Not almost 1. Exactly 1. | Three glass cards: ≈1 struck, 0.99≈1 struck, "= 1 ✓" |
| 8.6 | Sounds wrong?… fighting about this for decades. | Giant ?, "your gut says" meter, a flood of comment bubbles, 1995 → 2025 |
| 13.2 | Proof one. 1/3 is 0.333… (×3) → 1 = 0.999… | Pie in thirds, ×3 on both sides, the 3s roll into 9s |
| 23.8 | Proof two. x = 0.999…, 10x = 9.999…, subtract, ÷9 | Digits shift over the decimal point, the endless nines shatter, 9x = 9 → x = 1 |
| 33.2 | Here's the killer… always another one. | Crosshair lock, a < ? < b, midpoints keep appearing |
| 38.3 | Between 1 and 2 there's 1.5. Between 0.999… and 1… nothing. | Number line, magnifier search, the two points merge; music drops out for "there's…" |
| 45.7 | Every extra nine shrinks the gap ten times… it's zero. | Infinite zoom ×10ⁿ, gap 0.1 → 0.0000001 → "GAP = 0" |
| 51.4 | Mathematicians settled this long ago. The internet never will. | SETTLED stamp vs. the internet in chaos |
| 55.0 | Think they're different? Name one number between them in the comments. | A typed attempt gets ✗, comment prompt; everything collapses back to the cursor (loop) |

## Accuracy notes
- 0.999… = 1 is a standard result about real numbers. Both proofs are the classic informal ones, and the "nothing between them"
  argument is the rigorous core: two different reals always have their average between them.
- The comment bubbles are paraphrased typical objections, with no names or like counts. They are illustrative, not quotes.
- "Fighting about this for decades" refers to the long-running debate in classrooms and online forums since at least the
  1990s. The on-screen 1995 → 2025 is illustrative.

## Build
```
XI_KEY=... python3 tools/vo.py && python3 tools/bake.py
node tools/cues.mjs && python3 tools/score.py
npx hyperframes lint . && npx hyperframes check . --samples 9 && node tools/beat_audit.mjs --nocaps
npx hyperframes render . -f 30 -q standard -w 3 -o renders/raw.mp4
python3 tools/master.py renders/raw.mp4 renders/Zero_Point_Nine_Repeating.mp4
```
