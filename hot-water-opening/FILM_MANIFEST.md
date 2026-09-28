# Production manifest: full film (v1)

Companion to `FILM_SCRIPT.md`. Target runtime **about 9½–10 min**. The opening (0:00–0:33) is milestone 1 and is specified in `HANDOFF_CODEX.md`.

## A. Division of labour
| Who | Does |
|---|---|
| **Claude** (creative lead, this repo) | script, all motion design (HyperFrames + GSAP), score and SFX, edit, retiming around real VO, QA |
| **Codex** (Guy's local browser) | Google Flow reference stills and clips (Omni 1.1 Flash), ElevenLabs VO, returning files |

- **Budget.** No extra spending is assumed. Flow quoted **12 credits per 8 s clip** for the opening. This plan has **9 A-tier clips (≈108 credits)** and **2 optional B-tier clips (≈24)**, one generation each and no retries assumed. Guy decides whether to spend any of it. Every B-tier clip has a motion-design fallback that is built anyway.
- **Ratio.** Motion design ≈ 65% and Flow ≈ 35% of screen time. Flow is used only where people, places or physical texture matter; explanations are always motion design.

---

## B. Continuity bible

**Canon priority:**
1. `REF_erasto.png`
2. `REF_kitchen.png`
3. What F01/F02 actually show
4. This text

If a generated clip contradicts this text but matches the refs, **the refs win** and this bible gets updated.

### B1. Global style
- **Style anchor (paste into every prompt):** *stylized cinematic 2D animation, painterly textures, soft film grain, warm tungsten and daylight, muted palette with ember-orange warmth and pale frost-cyan cold light.*
- **Colour law (shared with motion design):** ember `#FF6A2B` = heat, frost `#8FE3FF` = cold, cream paper `#EFE7D5` = memory/1960s. Cyan light in Flow comes **only** from freezers, ice or lab lasers.
- **Camera language:** eye or waist height, slow push-ins, gentle lateral dollies, one rack focus per shot at most. **No whip pans, no handheld shake, no crash zooms in Flow.** Fast moves belong to motion design.
- **Audio:** SFX and room tone only. **No music. No intelligible speech.** Crowd reactions are indistinct murmurs or laughter without words. No captions, text or logos. Paper and screens show no legible writing.
- **Aspect/length:** 16:9, 8 s unless stated (hard maximum 10 s). The edit uses about 3–5 s of each, so put the key action **in the middle of the clip**.

### B2. Characters
| ID | Who | Look (fixed) | Reference | Notes |
|---|---|---|---|---|
| ERASTO_13 | Erasto, 1963 | slim 13-year-old Tanzanian boy, short-cropped hair, **white short-sleeved school shirt, khaki shorts**, no watch, bright curious eyes | `REF_erasto.png` | Illustrated recreation, never a likeness taken from photos |
| ERASTO_17 | Erasto, about 1968, Mkwawa | same face 4 years older, taller; **white long-sleeved shirt, dark grey trousers** | `REF_erasto_17.png` (new, made from REF_erasto) | |
| ERASTO_ADULT | Erasto, wildlife officer, about 1990s | same face, 40s; **khaki field uniform shirt, bush hat in hand**, binoculars | `REF_erasto_adult.png` (new, made from REF_erasto) | Dramatization |
| TEACHER | cookery teacher, 1963 | Tanzanian man, 30s, white shirt, dark trousers; shown from behind or soft focus | none (describe in prompt) | Never mocking or caricatured, just dismissive |
| LECTURER | visiting physicist, about 1968 | British man, mid-30s, **1960s grey suit, dark-rimmed glasses**; three-quarter back or soft focus | none (in `REF_hall.png` at the lectern) | Real person: generic figure, no likeness |
| TECHNICIAN | university lab technician, about 1968 | Tanzanian man, white lab coat, rolled sleeves | none | |
| HANDS | modern lab | gloved hands only, no faces | none | |

### B3. Locations
| ID | Place | Geography (fixed) | Light | Reference |
|---|---|---|---|---|
| L_KITCHEN | Magamba cookery room, 1963 | whitewashed walls; wooden worktable, centre; charcoal stove, left; **small white refrigerator with a tiny top freezer, back-right**; louvred window, right wall | afternoon sun from the right; F04 is later and warmer, F13 is dusk | `REF_kitchen.png` |
| L_HALL | Mkwawa High School hall, Iringa, about 1968 | rows of wooden benches, students in white shirts; lectern stage-left; tall windows, left | cool daylight through the windows | `REF_hall.png` (new) |
| L_LAB68 | University College Dar es Salaam lab, about 1968 | long bench, glass beakers, mercury thermometers, **white chest freezer with a glass lid**, blackboard behind | fluorescent plus window daylight | `REF_lab1968.png` (new) |
| L_LABNOW | modern optics lab | dark room, black optical table, mirrors, **green laser beam path**, microscope objective; a vacuum chamber with a viewport | dark; lasers are the key light | `REF_lab_modern.png` (new) |
| L_SAVANNA | Tanzanian park, golden hour | open grassland, acacia, distant elephants, old green Land Rover | low backlight, ember sky | none (describe in prompt) |

### B4. Props
- **Enamel cups:** white enamel with a thin dark rim, all identical. Erasto's has a small tape label "E" (drop the label if F01/F02 don't show one).
- **Exercise book:** blue ruled lines, red margin, cream paper. It is the **same page design as the motion-design notebook**, so Flow can match-cut into it.
- **Beakers (1968):** clear glass, same size, one steaming.

### B5. Transition grammar (how Flow and graphics become one film)
Every Flow shot enters and exits through a designed shape, colour or object, never a plain cut to an unrelated insert:
- **Taped photo.** Flow plays inside a photo taped to the notebook (1963 material), then the camera pushes through the photo to full frame.
- **Page match.** A Flow shot ends top-down on the exercise book, and the motion-design notebook takes over on the same page.
- **Frost wipe.** Frost growing on a Flow freezer lid or glass becomes motion-design ice crystals, which wipe to the next graphic.
- **Steam and laser lines.** A steam curl or laser beam becomes a graph line, so the shot's element turns into data.
- **Lens.** Pushing into a microscope objective or chamber viewport becomes the motion-design microscope circle.
- **Dot.** A glowing point (ion or laser spot) becomes the marble or particle in the motion-design landscape.

---

## C. Scene-by-scene plan
MD = motion design (Claude). F = Flow clip (Codex). VO lines are in `FILM_SCRIPT.md`.

| Scene | Time (est.) | VO | Picture | Transition out |
|---|---|---|---|---|
| 0 Opening | 0:00–0:33 | VO_01–08 | MD with F01, F02 in taped photos | title card |
| 1.1 | 0:33–0:45 | C1_01 | **MD** map card: Tanganyika, Usambara hills, Magamba pin; handwritten recipe card (boil, sugar, *cool*, freeze) | the recipe card becomes a taped photo |
| 1.2 | 0:45–1:00 | C1_02–03 | **F01** (reused, a new in-point: earlier action) full frame after a push through the photo; the MD recipe step "cool" gets struck through in red as he skips it | freezer door closing → hard cut |
| 1.3 | 1:00–1:12 | C1_04 | **MD** "90 MIN LATER" dial (reused from the opening's dial), then **F02** (reused, a new in-point: the rack focus to his face) | frost wipe |
| 1.4 | 1:12–1:30 | C1_05–06 | **F03 teacher's answer**, then an MD red-pen callback: the circle around "confused" redraws | taped photo |
| 1.5 | 1:30–2:10 | C1_07–08 | **F04 kitchen retest**, ending on the notebook, then page match into an MD trial table (Trial 1, 2, 3… hot first ✓ ✓ ✗ ✓, results vary, honest) | page flip |
| 2.1 | 2:10–2:25 | C2_01 | **MD** route map: Magamba → Iringa (Mkwawa HS) ← Dar es Salaam (University College); the lecturer's route draws in | the map pin becomes the hall window light |
| 2.2 | 2:25–2:42 | C2_02–03 | **F05 the question**: Erasto stands; heads turn, laughter | hold on his face |
| 2.3 | 2:42–2:52 | C2_04 | **F06 the lecturer listens** | rack focus → white |
| 2.4 | 2:52–3:08 | C2_05 | **F07 lab test 1968** | frost on the freezer lid → MD frost wipe |
| 2.5 | 3:08–3:22 | C2_06 | **MD** stylized journal page, 1969; title "Cool?"; two bylines. A recreation, not a facsimile of the real cover | the page's "?" becomes the graph origin |
| 3.1 | 3:22–3:45 | C3_01 | **MD** molecules jiggling, energy draining; ember → cyan | the particles condense into two cups |
| 3.2 | 3:45–4:15 | C3_02–03 | **MD** the opening's race graph reprised, with the "must pass" logic spelled out | a modifier slot opens on the graph |
| 3.3 | 4:15–4:30 | C3_04 | **F08 steam macro** as a plate behind an MD mass readout (evaporation) | a steam curl becomes a graph line |
| 3.4 | 4:30–5:05 | C3_05–08 | **MD** suspect cards 2–5 as "race modifiers" (bubbles, convection loops, frost pad, supercooling dice), each nudging the hot curve | cards stack |
| 3.5 | 5:05–5:19 | C3_09 | **MD** a scoreboard where no suspect wins every time, stamped "RESULTS VARY" | the scoreboard tilts into envelopes |
| 4.1 | 5:19–5:40 | C4_01–02 | **MD** envelope counter to 22,000; typographic card "London · January 2013 · Erasto Mpemba attends" (no photo) | the counter digits become lab readouts |
| 4.2 | 5:40–6:10 | C4_03–04 | **MD** precision plot with error bands; a thermometer icon moved 1 cm changes the curve. **F09** (B-tier) macro plate if generated | the curves collapse together |
| 4.3 | 6:10–6:28 | C4_05–06 | **MD** the red-pen quote returns and the circle almost closes, then stops | the pen line becomes a landscape contour |
| 5.1 | 6:28–6:55 | C5_01 | **MD** two particle boxes at the same temperature, arranged differently | the boxes fold into a landscape |
| 5.2 | 6:55–7:40 | C5_02–04 | **MD hero graphic**: an energy landscape, a cold marble stuck in the wrong valley, a hot marble taking the shortcut slope (ember → cyan as it settles) | lens iris |
| 5.3 | 7:40–7:55 | C5_05 | **F10 optics lab**, pushing into the objective | lens → MD microscope circle |
| 5.4 | 7:55–8:20 | C5_06–07 | **MD** a bead in a sculpted double well; cooling curves on a log axis ("exponentially faster", labelled illustrative) | the bead becomes a glowing point |
| 5.5 | 8:20–8:35 | C5_08 | **F11 trapped ion** (B-tier; MD fallback: minimal ion-trap schematic) plus an MD mirror graphic for the inverse effect | the point becomes a marble |
| 5.6 | 8:35–8:46 | C5_09 | **MD** principle card: *starting further away can be the fastest way to arrive* | card → dusk sky |
| 6.1 | 8:46–9:00 | C6_01–02 | **F12 game warden** | the sun flare becomes the dial |
| 6.2 | 9:00–9:15 | C6_03 | **MD** 1950 → 2023 life dial; his name spreading across fields (classical, granular, magnetic, quantum) | fields fold back into the notebook |
| 6.3 | 9:15–9:40 | C6_04–05 | the MD red-pen quote, then **F13 kitchen return**, then an MD race replay where the hot cup takes the shortcut; end card where frost melts and "HOT" glows ember again | end |

---

## D. Flow shot list (for Codex)
Standard suffix (append to every prompt):
```
Sound effects only. No music. No intelligible speech or dialogue. No on-screen text, captions,
subtitles, logos, or legible writing on any paper or screen.
```

### New reference stills (generate once, then reuse)
| File | Prompt (plus the style anchor) | Source refs |
|---|---|---|
| `REF_erasto_17.png` | the same boy as the reference, four years older (about 17), taller, white long-sleeved school shirt, dark grey trousers, three-quarter view, neutral warm background | REF_erasto |
| `REF_erasto_adult.png` | the same person in his 40s, khaki field uniform shirt, bush hat in hand, binoculars on a strap, calm and weathered, three-quarter view | REF_erasto |
| `REF_hall.png` | 1960s East African secondary-school assembly hall: wooden benches with students in white shirts seen from behind, lectern stage-left with a lecturer in a grey suit and dark-rimmed glasses seen from behind, tall windows left with cool daylight | none |
| `REF_lab1968.png` | 1968 university physics lab: long wooden bench, glass beakers, mercury thermometers, white chest freezer with a glass lid, blackboard behind, fluorescent and window light, no people | none |
| `REF_lab_modern.png` | a dark modern optics lab: black optical table, mirrors, a green laser beam path into a microscope objective, a small vacuum chamber with a round viewport, lasers as the only light, no people | none |

### Clips
| # | File | Tier | Dur | Refs | Placement (VO) | Action | Camera | SFX |
|---|---|---|---|---|---|---|---|---|
| F01 | `FLOW_01_kitchen_hot_mix.mp4` | done/pending | 8 | erasto, kitchen | opening + 1.2 (C1_02) | see HANDOFF | tracking push | footsteps, clink, freezer, hum |
| F02 | `FLOW_02_freezer_reveal.mp4` | done/pending | 8 | erasto, kitchen | opening + 1.3 (C1_04) | see HANDOFF | inside-freezer POV, rack focus | door, ice crackle, scrape |
| F03 | `FLOW_03_teacher_answer.mp4` | A | 8 | erasto, kitchen | 1.4 (C1_05–06) | Next day in the same room. Erasto, holding his cup, looks up hopefully at the teacher (back to camera, soft focus). The teacher gives a small shake of the head and turns away to the worktable. Classmates in the background glance and laugh silently. Erasto lowers the cup but keeps looking at it. | over the teacher's shoulder onto Erasto, slow push-in | room murmur, indistinct laughter (no words), enamel tap |
| F04 | `FLOW_04_kitchen_retest.mp4` | A | 8 | erasto, kitchen | 1.5 (C1_07–08) | Late afternoon, the room empty and the sun lower and warmer. Erasto alone sets two identical cups (one steaming) into the tiny freezer, closes it, then sits at the worktable and writes in a blue-ruled exercise book with a pencil. | static wide, then a slow push and tilt down, ending top-down on the exercise book page (no legible writing) | freezer door, pencil scratch, distant birds |
| F05 | `FLOW_05_mkwawa_question.mp4` | A | 8 | erasto_17, hall | 2.2 (C2_02–03) | Assembly hall. Among seated students, Erasto (17) stands up and raises his hand. Heads turn toward him; a ripple of silent laughter moves along the benches; he stays standing, composed. | from the stage looking out over the audience, slow push toward him | hall murmur rising into indistinct laughter, bench creak |
| F06 | `FLOW_06_lecturer_listens.mp4` | A | 6 | hall | 2.3 (C2_04) | The visiting lecturer at the lectern (three-quarter back, grey suit, glasses) pauses, tilts his head, looks toward the standing student, and gives a small thoughtful nod. | behind his shoulder, rack focus from the lecturer to the distant standing student | the murmur dies to silence; one cough |
| F07 | `FLOW_07_lab_test_1968.mp4` | A | 8 | lab1968 | 2.4 (C2_05) | The technician pours steaming water into one beaker and cool water into an identical one, places both in the chest freezer and closes the glass lid; frost blooms across the lid glass as the light shifts (time passing). | slow lateral dolly along the bench, ending on the frosting lid | glass clink, pour, lid thunk, compressor hum, faint ice crackle |
| F08 | `FLOW_08_steam_macro.mp4` | A | 6 | kitchen | 3.3 (C3_04) | Extreme close-up of an enamel cup rim; steam rises and curls, backlit ember-orange by the sun against a dark background; slow motion. | locked macro, very slow push | soft air hiss, a faint simmer |
| F09 | `FLOW_09_thermocouple_macro.mp4` | B | 6 | lab_modern | 4.2 (C4_04) | A thin thermocouple wire in a glass vial of water sits in a cold bath; a gloved hand lowers it about one centimetre; a display glows nearby, blurred and unreadable. | locked macro, shallow focus | lab hum, a faint click |
| F10 | `FLOW_10_optics_lab.mp4` | A | 8 | lab_modern | 5.3 (C5_05) | A green laser beam travels between mirrors in a dark lab into a microscope objective; gloved hands make a tiny adjustment on a knob. | slow push along the beam path, ending pushing into the objective lens (frame fills with soft light) | low electronic hum, a fan, a soft knob click |
| F11 | `FLOW_11_trapped_ion.mp4` | B | 6 | lab_modern | 5.5 (C5_08) | A vacuum chamber viewport; inside, violet-blue laser light converges on a single tiny glowing point. | slow push into the viewport, the point centred | deep hum, a faint vacuum pump |
| F12 | `FLOW_12_game_warden.mp4` | A | 8 | erasto_adult | 6.1 (C6_02) | Golden-hour savanna. Adult Erasto stands by an old green Land Rover, lowers his binoculars and watches elephants crossing far away; wind moves the grass. | slow lateral dolly, backlit, lens flare | wind, distant birds, engine ticking as it cools |
| F13 | `FLOW_13_kitchen_return.mp4` | A | 8 | kitchen | 6.3 (C6_04–05) | The same cookery room at dusk, empty. The tiny freezer door is ajar, spilling cyan light. On the worktable sits a single enamel cup (label "E"); its steam slows, hangs, and turns into glittering frost that settles on the rim. | slow push to the cup | freezer hum, a single ice crackle, silence |

**Full prompt template** (fill in from the table):
```
[STYLE ANCHOR]. [LOCATION from the bible, using its reference]. [CHARACTER from the bible, using
its reference, with fixed wardrobe]. [ACTION from the table, key action between 2 s and 5 s].
Camera: [CAMERA]. Lighting: [location light rule]. [STANDARD SUFFIX]. SFX: [SFX].
```

**Naming and delivery:** save to `assets/flow/` with the exact filenames; put references in `assets/flow/refs/`. Send any alternate take as `FLOW_07_lab_test_1968_alt1.mp4`.

---

## E. VO production
- 43 files `C1_01`…`C6_05` (text in `FILM_SCRIPT.md`) plus the opening's `VO_01`–`VO_08`.
- **Before recording:** resolve the four `[verify]` items in the script (Mpemba & Osborne 1969; Burridge & Linden 2016). Claude will adjust the wording if a source differs.
- **Voice:** `apOzcbHULxCnvWfHPd41`, natural speed, one paragraph per file, no speed-up. Use the same settings as the opening so the voice stays consistent across sessions.

## F. Sources used
- Mpemba & Osborne, "Cool?", *Physics Education* 4 (1969): https://iopscience.iop.org/article/10.1088/0031-9120/4/3/312
- Burridge & Linden, *Sci. Rep.* 6, 37665 (2016): https://www.nature.com/articles/srep37665
- Lu & Raz, *PNAS* 114, 5083 (2017): https://www.pnas.org/doi/10.1073/pnas.1701264114
- Kumar & Bechhoefer, *Nature* 584, 64 (2020); summary: https://phys.org/news/2020-08-mpemba-effect.html
- Inverse Mpemba effect on a trapped-ion qubit, *PRL* 133, 010403 (2024): https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.133.010403
- RSC 2012 competition (22,000 entries): https://edu.rsc.org/resources/the-mpemba-effect/1018.article
- Mkwawa High School and Osborne's talk: https://www.theafricaiknow.org/articles/The-Mpemba-effect
- Mpemba biography (1950–2023, Principal Game Officer): https://en.wikipedia.org/wiki/Erasto_B._Mpemba (via search; cross-check before VO)
- **Open item:** Magamba Secondary School's location (Lushoto, Usambara Mountains) `[verify]` before scene 1.1's map.
