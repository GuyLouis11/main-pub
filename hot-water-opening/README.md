# Guy Wonders Why: "The Boy Who Froze Hot Water" (opening, v1)

A 30-second, 1920×1080 cold open built as an editable **HyperFrames (HTML + GSAP)** project.

**Watch first:** `renders/opening_v1_review_small.mp4` (with yellow-tagged SCRATCH VO subtitles standing in for the voiceover).
Clean picture without subtitles: `renders/opening_v1_clean_small.mp4`.

| Read | Why |
|---|---|
| `CREATIVE_DIRECTION.md` | premise, full-film payoff, look, sound |
| `STORYBOARD.md` | timecoded shot / type / VO / sound sheet |
| `HANDOFF_CODEX.md` | exact ElevenLabs lines and Google Flow prompts, filenames, timings |
| `QA.md` | what's final vs placeholder, which checks actually ran |

## Project layout
```
index.html                 the composition (5 scenes + track/shard layers, one GSAP timeline "main")
assets/fonts/              OFL fonts, local (Big Shoulders Display, JetBrains Mono, Instrument Serif, Caveat)
assets/img/                procedurally generated grain + paper textures
assets/audio/score_*.wav   original synthesized score + SFX stems (tools/make_audio.py)
assets/audio/vo/VO_0N.wav  SILENT placeholders → replace with ElevenLabs takes
assets/flow/FLOW_0N_*.mp4  PLACEHOLDER cards → replace with Google Flow shots
assets/vendor/gsap.min.js  GSAP 3.15 (vendored for deterministic renders)
tools/make_audio.py        score/SFX synthesis + automatic ducking under real VO
tools/make_small.sh        small shareable encodes of *_hq renders
renders/                   review MP4s
```

## Commands
```bash
npm install                      # hyperframes CLI + gsap
npx hyperframes browser ensure   # once: headless Chrome for rendering (needs ffmpeg on PATH)
npm run audio                    # rebuild score (after VO is dropped in, this ducks the music)
npm run lint && npm run check    # static + browser audits
npm run preview                  # live Studio preview
npm run render:review            # with SCRATCH VO subtitles
npm run render:clean             # final picture (no subtitles)
npm run small                    # small copies of the *_hq renders
```
The scratch subtitles are driven by the composition variable `scratchVO` (default `false`). They are a review aid only and never appear in the final.
