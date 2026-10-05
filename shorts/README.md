# Shorts studio (Remotion)

Two vertical Shorts built in React with Remotion 4, designed to look like After Effects work:
- camera moves with directional motion blur;
- whip, zoom-through and flare transitions;
- kinetic word-by-word captions;
- light leaks, film grain and RGB-split impacts;
- odometer counters and stroke-draw logo reveals using the **real brand marks** from `simple-icons` (McDonald's
  arches, the Coca-Cola script);
- a live **three.js** 3D Coke can with a canvas-drawn label.

| Short | Composition | Length |
|---|---|---|
| The Bathroom Stall (McDonald's Monopoly) | `Monopoly` | ≈47 s |
| The Sip (New Coke) | `NewCoke` | ≈48 s |

## Pipeline
```bash
npm i
python3 tools/vo.py monopoly          # Eleven v4 narration (scripts/monopoly.py) → pitch QA → narration.wav + timeline.json
python3 tools/score.py monopoly       # synthesized score + SFX on spoken words, ducked → mix.wav (−14 LUFS)
node tools/stills.mjs Monopoly out 30 400 900       # review stills + contact sheet
npx remotion studio                   # live preview
npx remotion render src/index.ts Monopoly renders/monopoly.mp4 --browser-executable=$HS --gl=angle
```
`$HS` is a Chromium headless shell (Remotion needs the old-headless binary). On the cloud box it lives at
`/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`; locally, omit the flag and Remotion
downloads its own.

## Structure
- `scripts/<short>.py`: the script, one line per beat, with Eleven v4 direction tags. `*word*` marks a caption
  highlight.
- `src/kit/`: the shared motion kit:
  - `Scene` (transitions + continuous push);
  - `Captions`;
  - `fx` (grain, light leaks, flares, particles, shake, chroma, motion-blur filters, CRT);
  - `Brand` (logo reveal, odometer, typewriter, stamp);
  - `timeline` (word-frame helpers);
  - `motion` (AE easing presets, keyframes, springs).
- `src/monopoly/`, `src/newcoke/`: each Short's art and composition. Every beat is placed on a spoken word via
  `t.find(line, word)`.
- **Voice:** Shorts use the Tim voice's own trained model, `eleven_multilingual_v2`, with a speed setting of 1.08.
  - Plain text only, no tags, no time-stretching.
  - The first version used v4 with "low, hushed" direction plus a 1.15× rubberband stretch. It measured 2–3× breathier
    with a flat pitch, and the owner heard it as robotic, whispery and "sexy". Don't go back to that.
  - Pitch QA runs after every pass; retake anything more than 3 semitones off.
- **People:** `src/kit/Person.tsx` draws illustrated people, not silhouettes:
  - face, eyes that blink, brows, nose, lips, ears;
  - hair styles, glasses, facial hair;
  - outfits (suit, uniform, sweater, blouse, vest);
  - moods (neutral, smirk, worried, angry, shout, smile, stern, shock);
  - rim light and breathing.
  - `CAST` holds the recurring characters. They're generic people, never likenesses of real individuals.
- **Maps:** the route scene draws a real US map from `us-atlas` (Census boundaries) with `d3-geo`.

## Real photos
Logos are real (`simple-icons`). Photo libraries (Wikimedia Commons and others) are blocked by this environment's
network policy. Allow `commons.wikimedia.org` and `upload.wikimedia.org` to drop in public-domain photos.
