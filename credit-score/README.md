# credit-score: Your Credit Score Was Never About You

Long-form (1920×1080, 8:30) money explainer. It covers how a 1899 Atlanta gossip business became Equifax, how Fair Isaac
turned people into math, what goes into the FICO formula, who earns billions from it, errors and the 2017 breach, what a
lower score costs, the free fixes, and the twist: it's a profit score. It ends on a debate question and an 8 s end screen.

Built from the prophet/ pipeline with the widescreen kit from the earlier long-form:
- `tools/script.py` is the script source: it writes the timing block, `tools/direction.py` and `SCRIPT.md`.
- Voice: Eleven v4, "Tim Hook", steady storyteller (`[steady storyteller, clear, full voice, conversational]`); lifted
  tags only on the hook, the turn and the twist. No whispers.
- `scenes/kit.js` holds the helpers, worlds, chapter rail and chapter cards. `scenes/ckit.js` holds the 3D gauge, folders,
  donut, streams, the phone and the brand marks.
- `scenes/s1.js` covers the hook, ch1 and ch2. `scenes/s2.js` covers ch3 and ch4. `scenes/s3.js` covers ch5, ch6, the
  fixes, the twist, the debate and the end screen.
- v2 polish layers:
  - `scenes/assets2.js`: shaded, rim-lit redraws of every asset, with the same signatures.
  - `scenes/env.js`: an illustrated backdrop per chapter world, a 3D floor, light leaks and the HUD; the FX engine
    (impact bursts, card light sweeps, floating layers, breathing silhouettes); and the tension and bloom emotion layers.
  - `scenes/extras.js`: the infographic set-pieces (orbiting hook chips, rumour network, tower money streams, the breach
    people strip) and the emotion map.
- `tools/voqa.py` takes `VO_REF=152`, which is this read's own median (the long-form sits ~3 st above the 131 Hz v4 ref
  but is consistent).

Rebuild:
```bash
python3 tools/script.py && python3 tools/vo.py && python3 tools/bake.py
node tools/cues.mjs && python3 tools/score.py
npx hyperframes render . -f 30 -q standard -w 4 -o renders/raw.mp4
python3 tools/master.py renders/raw.mp4 ../deliveries/Your_Credit_Score_Was_Never_About_You_1080p.mp4
python3 tools/srt.py Your_Credit_Score_Was_Never_About_You && node tools/thumbs.mjs
```
