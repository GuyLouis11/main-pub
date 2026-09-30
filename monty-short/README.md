# Should You Switch Doors? — Monty Hall Short

Vertical 1080×1920 YouTube Short, ~56 s, "Neon Game Show" motion design (HyperFrames + GSAP). There is no stock
footage or generated video: every frame is code. Narration uses eleven_v3 (voice apOzcbHULxCnvWfHPd41), and the score
and SFX are synthesized in `tools/score.py`.

## Beats
| Time | Line | Picture |
|---|---|---|
| 0.0 | Three doors. One car. Two goats. You pick door number one. | Doors slam in; prize cards; prizes dive behind the doors; tap on door 1 |
| 4.3 | The host, who knows where the car is, opens door three. Goat. | Host eye + x-ray scan, drum roll, door 3 swings open, BAAA! |
| 8.2 | Now: do you switch? Almost everyone says it doesn't matter. 50/50. | SWITCH? sign, arrow, crowd, 50% / 50% badges |
| 12.5 | They're wrong. You should always switch. | WRONG stamp and glitch; badges re-form to 33% / 67% (the music drops here) |
| 14.9 | In 1990, Marilyn vos Savant… said exactly that. | Year rolls back, illustrated portrait, Guinness seal, IQ meter, her column: "Yes; you should switch." |
| 20.8 | About ten thousand people wrote in… nearly a thousand had PhDs. | Counter to 10,000; mail flood; two real reader quotes; Ph.D. stamps |
| 25.9 | Even Paul Erdős… until he watched a computer simulation. | Illustrated portrait, 1,500+ papers, NOT CONVINCED, CRT running games, CONVINCED ✓ |
| 32.0 | Imagine a hundred doors… opens ninety-eight goats. Keep your one-in-a-hundred guess? | 100-door grid, YOU, 98 doors flip to goats, 1% vs 99% |
| 40.9 | Three doors work the same way… two-thirds land on the last door. | 1/3 badge, 2/3 bracket collapses onto door 2 → car, fanfare, confetti |
| 46.7 | Run it a thousand times… | Seeded 1,000-game simulation (canvas): STAY 33.3% · SWITCH 66.7% |
| 51.8 | Still think it's 50/50? Tell me why in the comments. | CTA + comment bubble; doors fall away, so the loop restarts on the slam |

## Accuracy notes
- The host **knows** where the car is and always opens a goat door. The script states this, since the 2/3 answer depends on it.
- vos Savant's "Ask Marilyn" column in Parade, September 1990; "Yes; you should switch." is her answer's opening.
  Guinness listed her under "Highest IQ" in the late 1980s. The script says "once listed".
- "About 10,000 letters, nearly 1,000 from PhDs" is her own widely reported estimate. The script hedges it.
- Reader quotes "You blew it, and you blew it big!" and "You are the goat!" come from letters she published. They are shown without names.
- Erdős stayed unconvinced until shown a computer simulation, per Andrew Vázsonyi, in Paul Hoffman's *The Man Who Loved Only Numbers*.
  "1,500+ papers" matches his roughly 1,500 publications.
- The simulation is real: 1,000 seeded games, played in the page. The portraits are line illustrations, not likenesses.

## Build
```
XI_KEY=... python3 tools/vo.py        # narration + word timestamps (key only via env, never stored)
python3 tools/bake.py                 # timings → index.html
node tools/cues.mjs && python3 tools/score.py
npx hyperframes lint . && npx hyperframes check . --samples 9 && node tools/beat_audit.mjs --nocaps
npx hyperframes render . -f 30 -q standard -w 3 -o renders/raw.mp4
python3 tools/master.py renders/raw.mp4 renders/Should_You_Switch_Doors.mp4   # -14 LUFS, -1 dBFS
node tools/snap.mjs /tmp/f 1 5 9       # quick frame checks
```
