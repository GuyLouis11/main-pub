# object bloom. — 458 sizzle reel

A 62-second, beat-synced sizzle reel for objectbloom.com. It is built from the supplied 458 model and the Parts Explorer's **930-detail assembly**: 882 modeled source surfaces plus 48 illustrative V8 pieces. Every detail is choreographed individually.

- **Engine:** Three.js, with WebAudio for the soundtrack.
- **Music and sound design:** generated in code at 128 BPM in D minor. Impacts, whooshes, risers, metal clanks, scan sweeps, glitches and a V8 rev are all placed on the same bar and beat grid as the picture, so sound and image can't drift apart.
- **Output:** a live player (`index.html`) and a frame-exact MP4 export.

## Run the reel live

```bash
npm install          # also copies three.js into ./vendor
npm run dev          # http://localhost:5173
```

Click **Play with sound**. Keys:

| Key | Action |
| --- | --- |
| Space | Play / pause |
| ← → | Jump back / forward one bar |
| R | Restart |
| F | Fullscreen |

Add `?t=30` to the URL to start at a given second.

## Export the video

```bash
npm run render                                     # 1080p30 -> out/objectbloom-sizzle.mp4
node scripts/render.mjs --workers 2 --web          # plus a lighter web encode and a poster frame
node scripts/render.mjs --fps 60                   # 60 fps master
node scripts/render.mjs --from 30 --to 45          # just the drop
npm run stills                                     # PNG review frames -> out/stills/
```

Rendering is frame-exact. Each frame is posed from its timestamp, and the soundtrack is rendered offline from the same timeline. The audio is normalized to -14 LUFS with a -1 dBTP ceiling. The export uses headless Chromium and a bundled ffmpeg (`ffmpeg-static`). On a machine with a GPU it runs much faster than on the software renderer.

## The cut (bars at 128 BPM)

| Bars | Section | What happens |
| --- | --- | --- |
| 0–4 | **Ignition** | Letterboxed macro shots in the dark (headlamp, wheel, flank, tail lamp) with a light sweep. The LEDs flicker on. Type: ONE / CAR., a 930 count-up, "A closer look at every layer", then the wordmark glitches in. |
| 4–8 | **Reveal** | The car drives: wheels roll, the floor grid scrolls, light streaks fly past. "458 Italia." in the explorer's typography, a 3D outline "458", "IN MOTION" and "EVERY ANGLE." type. On bar 7 the paint changes on every beat, cycling through the explorer's finishes. |
| 8–12 | **X-ray** | A scan plane wipes the car into x-ray. A thermal pass follows, and the V8's coils fire in order. Nine leader-line callouts name real details from the explorer's labels. |
| 12–16 | **Deconstruct** | One assembly detaches per beat along the explorer's separation offsets, with a clank for each. An assembly list and a detached counter track progress. Then a 3-2-1 countdown and a beat of silence. |
| 16–24 | **Bloom (the drop)** | All 930 details move in unison through four formations: the explorer's parts tray (knolled on the floor, rippling and turning on every beat), orbit rings with stadium waves, a double helix the camera flies through, and an 8-petal flower of parts. Kinetic type throughout: a BLOOM slam that shatters, lyric-style words on the beat, echo stacks, part-name bands, x-ray strobes and radial type. |
| 24–28 | **Blueprint** | Contour-hologram exploded view in drafting style, with a title block, dimension lines and assembly counts. |
| 28–30 | **Rebuild** | Assemblies slam back into place on each beat with an assembly percentage. |
| 30–33 | **Outro** | Hero shot, a petal "bloom" mark, the object bloom. wordmark, the typed objectbloom.com URL and the source attribution. |

## Layout

```
index.html            player shell (import map -> ./vendor/three)
src/timeline.js       128 BPM clock, sections, easing, deterministic noise
src/music.js          procedural soundtrack + SFX (OfflineAudioContext) and WAV encoder
src/parts.js          loads ferrari.glb and rebuilds the explorer's 930-detail assembly (BatchedMesh)
src/choreo.js         per-detail choreography, formations and looks (solid / x-ray / hologram)
src/camera.js         shot list with cuts on bars and half-bars, and impact shake
src/stage.js          renderer, studio, floor, dust, streaks, scan sheet, post FX (bloom, glitch, chroma, grain)
src/type3d.js         typography inside the scene (per-letter 3D words, text rings)
src/hud.js            2D kinetic typography and HUD, composited in the final pass
src/show.js           the director: time -> fully posed frame
scripts/render.mjs    headless frame-exact exporter (stills, parallel workers, MP4, web encode, poster)
assets/source/        the supplied 458 Parts Explorer package (read-only)
assets/fonts/         Manrope and JetBrains Mono (SIL OFL)
```

## Credits

Independent visualization study. Source model by [vicent091036](https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6). Not affiliated with Ferrari. The V8 is an illustrative visualization, and the assembly offsets are not an engineering or service reference. Fonts: Manrope and JetBrains Mono, both SIL Open Font License. Three.js is MIT-licensed.
