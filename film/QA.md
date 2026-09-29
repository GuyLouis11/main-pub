# QA: chapters 1–6 (v1, 2026-09-28)

## Final vs placeholder
| Element | Status |
|---|---|
| Motion design, typography, transitions (6 chapters, 34 scenes) | **Final candidate** |
| Flow F01, F02, F04, F07, F10, F13 | **Real clips**, reviewed (see `FLOW_REVIEW_BATCH2.md`, `../hot-water-opening/FLOW_REVIEW.md`). Built around their actual action |
| B-tier slots F08 (steam), F11 (ion), F12 (savanna) | **Not generated, by design.** Motion-design versions are the final plan (steam curls, ion-trap schematic, drawn savanna) |
| Chapter score + SFX | **Final candidate.** Original synthesis, −24 LUFS bed (ch4 and ch5 −26, peak-limited) |
| **Narration (43 chapter lines + 8 opening)** | **SILENT PLACEHOLDERS.** Timings use estimates (about 2.6 words/s). **The film is not finished until these are recorded.** |
| SCRATCH VO subtitles in the review cut | Review aid only (`scratchVO` variable); never in the final |

## Checks actually performed
- `hyperframes lint` on all 6 chapters: **0 errors**. Warnings are the known structural ones (single-file compositions, Studio ids).
- `hyperframes check --samples 7` (runtime, layout, motion, contrast) on all 6 chapters: **passed**, after fixing:
  - a recipe-line overlap
  - two contrast failures on the map
  - a readout label overlap
- Runtime JS errors found and fixed along the way:
  - the bundler inlined the shared runtime before its data, so it now initialises lazily
  - a malformed SVG band path
  - a stray parenthesis
- Visual review: about 100 snapshot frames across all chapters, with fix passes. Real issues caught:
  - **"µm" rendered as "MM"** by uppercase styling, so the bead label read "about 1.5 mm", a 1,000× error; fixed
  - inverted potential wells
  - blank taped photos between clips
  - round-cap dots before strokes drew
  - the clock hand spinning around the wrong origin
  - transform-override bugs on SVG groups
  - the balance tipping the wrong way
  - Flow frame borders showing
  - metaphor-tag contrast
- **Nested-video timing** was verified against the real renderer: the burned-in timecodes in the v1 opening render read 1.667 / 3.167 / 1.792 / 2.792 s, exactly the expected source frames. Full-frame clips were also moved to root level to satisfy the linter's rule.
- Flow clips were reviewed frame by frame plus spectrograms. Defects are documented with timestamps; unusable ranges are never referenced (enforced by `data-usable-in/out` in the retime tool).
- Scores: EBU R128 measured per chapter after normalisation.
- Assembled review render: see the section at the end (filled in after the render finishes).

## Density pass (2026-09-29): "no long pauses"
Guy flagged a long pause at about 54 s. Every quiet stretch is now filled with purposeful motion, and three checks, which work differently, all enforce it:
- **Timeline beat audit** (`node tools/beat_audit.mjs`): lists every stretch where no non-ambient tween or video is active. Result: **0 gaps over 1.5 s in all six chapters.** Before: ch3 had 2, ch4 had 9 (31.8 s in total), ch5 had 2, ch6 had 2.
- **HyperFrames motion assertion** (`index.motion.json`: keepsMoving, maxStaticSec 1.5) inside `hyperframes check`: all six chapters and the opening **pass**.
  - This is a DOM check, so it can't see video pixels. Windows where only real Flow footage moves were flagged at first. They now carry a slow push-in, with the hold stills scale-matched so the handover doesn't jump.
- **Pixel stillness audit** (`python3 tools/stillness.py renders/parts/*.mp4`): runs on the rendered frames, so it catches what people actually perceive. Results are at the end.

Fixes found along the way:
- The notebook page had only 50–60 px of bleed, so camera pans revealed its edge. It now has 200 px on every side.
- "mistaken?" overlapped "wrong" on the balance, so it was moved.
- The 1963 stamp was hidden under the photo; it now clears first.
- A map note sat at 4.46:1 contrast; it's now darkened to pass.
- The faded envelope pile read as a grey smudge; it now fades out.

## Not verified / not possible here
- **Listening.** I can't hear the mix. Levels, sync and ducking were measured; musical taste needs Guy's ears.
- **Real VO timing and pronunciation.** Placeholders are estimates. After the takes arrive, `retime_chapters.py` re-lays everything out, and a fresh render plus QA is required.
- Full-resolution review of every frame of every Flow clip beyond the sampled frames and crops.
- Primary-source confirmation of the two qualified quotes (network policy blocks the journal sites). The wording in the script is already qualified to match.
