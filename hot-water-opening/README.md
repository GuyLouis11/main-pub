# Guy Wonders Why: "The Boy Who Froze Hot Water" (opening, v1)

A ~33-second, 1920×1080 cold open (milestone 1 of the full film; see FILM_MANIFEST.md) built as an editable **HyperFrames (HTML + GSAP)** project.

**Review cuts:** `renders/opening_v1_*_small.mp4` are the **v1** (30 s) cuts, rendered before the v2 accuracy and timing pass. The v2 picture is shown in `review/opening_v2_contact_sheet.jpg`. No v2 MP4 has been rendered on purpose: it would be placeholder-only. The next render happens when real VO and Flow arrive.

| Read | Why |
|---|---|
| `CREATIVE_DIRECTION.md` | premise, full-film payoff, look, sound |
| `STORYBOARD.md` | timecoded shot / type / VO / sound sheet |
| `HANDOFF_CODEX.md` | exact ElevenLabs lines and Google Flow prompts, filenames, timings |
| `QA.md` | what's final vs placeholder, which checks actually ran |
| `FILM_SCRIPT.md` | full-film narration (about 9½–10 min), chapter by chapter |
| `FILM_MANIFEST.md` | continuity bible, scene-by-scene Flow vs motion-design plan, 11 new Flow clip specs, sources |

## Project layout
```
index.html                 the composition (5 scenes + track/shard layers, one GSAP timeline "main")
assets/fonts/              OFL fonts, local (Big Shoulders Display, JetBrains Mono, Instrument Serif, Caveat)
assets/img/                procedurally generated grain + paper textures
assets/audio/score_*.wav   original synthesized score + SFX stems (tools/make_audio.py)
assets/audio/vo/VO_0N.wav  SILENT placeholders → replace with ElevenLabs takes
assets/flow/FLOW_0N_*.mp4  PLACEHOLDER cards → replace with Google Flow shots
assets/vendor/gsap.min.js  GSAP 3.15 (vendored for deterministic renders)
tools/retime.py            fits the edit around real VO lengths (single timing block in index.html)
tools/make_audio.py        score/SFX synthesis on the same time map + automatic ducking under real VO
tools/make_small.sh        small shareable encodes of *_hq renders
renders/                   review MP4s
```

## Commands
```bash
npm install                      # hyperframes CLI + gsap
npx hyperframes browser ensure   # once: headless Chrome for rendering (needs ffmpeg on PATH)
python3 tools/retime.py          # fit the edit around the VO takes (writes timings into index.html)
npm run audio                    # rebuild score on the same time map (+ ducks music under real VO)
npm run lint && npm run check    # static + browser audits
npm run preview                  # live Studio preview
npm run render:review            # with SCRATCH VO subtitles
npm run render:clean             # final picture (no subtitles)
npm run small                    # small copies of the *_hq renders
```
The scratch subtitles are driven by the composition variable `scratchVO` (default `false`). They are a review aid only and never appear in the final.
