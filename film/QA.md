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

## Not verified / not possible here
- **Listening.** I can't hear the mix. Levels, sync and ducking were measured; musical taste needs Guy's ears.
- **Real VO timing and pronunciation.** Placeholders are estimates. After the takes arrive, `retime_chapters.py` re-lays everything out, and a fresh render plus QA is required.
- Full-resolution review of every frame of every Flow clip beyond the sampled frames and crops.
- Primary-source confirmation of the two qualified quotes (network policy blocks the journal sites). The wording in the script is already qualified to match.
