# QA: opening v1

## Final vs placeholder

| Element | Status |
|---|---|
| Motion design, typography, transitions (all 5 scenes) | **Final candidate.** Authored in `index.html` |
| Score + SFX (`score_music.wav`, `score_sfx.wav`) | **Final candidate.** Original, synthesized in code (no samples, no licences). Re-run `tools/make_audio.py` after VO to duck it |
| Fonts | **Final.** OFL, local copies |
| Grain / paper textures | **Final.** Procedurally generated |
| `assets/flow/FLOW_01_kitchen_hot_mix.mp4`, `FLOW_02_freezer_reveal.mp4` | **PLACEHOLDER.** Labelled title cards. Replace with Google Flow shots (see `HANDOFF_CODEX.md`) |
| `assets/audio/vo/VO_01…07.wav` | **PLACEHOLDER (silent).** Replace with ElevenLabs takes |
| Yellow "SCRATCH VO" subtitles in `*_review_*` renders | **Review aid only.** Off by default (`scratchVO` variable), never in the final |
| Notebook page, handwriting, red-pen styling | Stylised recreation. The quote wording is sourced, but the page itself is not an archival document |

## Checks actually performed (in this cloud session)
- `hyperframes lint`: 0 errors. 8 structural warnings remain (single-file composition, "nested structure → sub-composition"). They're deliberate for v1 and don't affect the render.
- `hyperframes check --samples 15` (runtime, layout, motion) and a separate run with the contrast audit: **passed, 0 errors**, contrast 0 findings. A readout label/number overlap it flagged was fixed.
- Visual review: HyperFrames snapshots at about 30 timestamps across several passes, **plus frames decoded from the rendered MP4 at 2 fps (60 frames)**. Issues found and fixed along the way:
  - hot water read as tea
  - steam crossing the readout
  - cups entering from the wrong position
  - graph axis hidden behind a scene background
  - notebook header clipped by the photo
  - the finish burst showing early
  - the rewind making a frozen cup's readout climb
  - the "1963" counter drawn over the teacher's quote
  - cream paper showing behind the rip
- Flow placeholder clips confirmed playing inside the photo frame in the **rendered** MP4 (not only in preview).
- Render: H.264 1920×1080 at 30 fps, AAC 48 kHz stereo, 30.0 s.
- Audio sync: the rendered MP4's audio cross-correlated against `score_mix_ref.wav` gives **0-sample offset**, RMS ratio 0.994.
- Audio levels (clean MP4): integrated **−22.0 LUFS** (a music/SFX bed with room for VO), true peak **−2.3 to −2.7 dBTP**, **0 clipped samples**, DC offset negligible. Section RMS ranges from −34.6 dBFS (the deliberate near-silence under the quote) to −17.9 dBFS (title hit).
- VO ducking logic: tested with a synthetic stand-in voice. Music dropped about 5.5 dB under the voice and was unchanged elsewhere.
- Facts used on screen/VO checked via web search: 1963, age 13, Magamba Secondary School, ice cream, the teacher's quote ("The answer I can give is that you were confused."), Aristotle *Meteorologica* (c. 350 BC), Descartes 1637 *Meteorology*, Mpemba & Osborne 1969 *Physics Education*, Kumar & Bechhoefer *Nature* 2020, 2024 trapped-ion quantum Mpemba experiments.

## Not verified / not possible here
- **I could not listen** to the mix. Levels, sync, clipping and ducking were measured, but taste (tone of the synth score, whether a sound feels cheap) needs human ears.
- No real ElevenLabs VO yet, so final VO timing and pronunciation of "Mpemba" are unverified. Line lengths are estimated at about 2.7–3 words/s.
- No real Flow footage yet, so style match with the notebook frame and in/out points are unverified.
- Not tested in Docker/deterministic mode (Docker isn't running here). Local render used software GL and system fonts were bypassed with local webfonts.
- Final loudness target for YouTube (about −14 LUFS integrated for the whole film) should be applied at the full-film master, not this opening.
- Pending fact checks for the full film (not used in the opening): Osborne visit year, 1969 paper title, 2012 RSC competition entry count, Mpemba's later career and date of death.

---
## v2 pass (accuracy + VO-driven timing), 2026-09-28
- **Accuracy fixes:**
  - The race and graph are explicitly labelled illustrative ("ILLUSTRATION · RESULTS VARY", "ILLUSTRATIVE CURVES · NOT MEASURED DATA").
  - "FROZEN" at 0°C becomes "ICE FORMS" / "ICE FIRST" (reaching 0°C ≠ frozen solid).
  - The invented "5°C" is removed.
  - The VO is now conditional ("Sometimes…") and asks the paradox as a question.
  - The closing line no longer implies the water debate is settled.
- **Timing:** `tools/retime.py` fits the edit to real VO lengths. It was verified with estimated lengths: 33.35 s total, all 8 lines placed, no line over its deadline, Flow clips need ≤ 3.7 s of source (the clips are 8 s).
- **Checks run:**
  - `hyperframes lint`: 0 errors.
  - `hyperframes check --samples 15` including contrast: **passed, 0 errors** (warnings are the known single-file structure notes plus minor motion or transition notes).
  - A 19-frame snapshot sweep of the retimed composition (`review/opening_v2_contact_sheet.jpg`).
  - Score rebuilt on the new time map: −20.3 LUFS integrated (bed, no VO), −1.4 dBTP.
- **Deliberately not done:** no v2 MP4 render, because it would be placeholder-only. The next render happens when real VO and Flow arrive. Until then the opening is **not finished**: the 8 VO files are silent placeholders and the 2 Flow slots are placeholder cards.
- **Access blockers (concrete):**
  - No Google Flow session in this container.
  - ElevenLabs host `api.elevenlabs.io` is blocked by the environment network policy, and there's no API credential.
  - GitHub push returns 403 (the Claude GitHub App has no access to `GuyLouis11/main-pub`).
