# Next Flow batch: 4 shots (for Guy's credit quote)

The four shots with the highest value after F01/F02. Each one carries a beat that motion design can't: the human pause, a real lab process, the physical light of the payoff experiment, and the closing image. **Characters only where they're the point.** Two shots have no person at all, and two are hands or a single figure.

**No opening retakes.** FLOW_01/02 stay as delivered (see `FLOW_REVIEW.md`).

## Global rules (every shot)
- **Model:** Omni 1.1 Flash · **16:9 full frame, no letterbox bars** · **8 s** (≤ 10 s).
- **Style anchor (paste first):** *stylized cinematic 2D animation, painterly textures, soft film grain, warm tungsten and daylight, muted palette with ember-orange warmth and pale frost-cyan cold light.*
- **Style ingredient:** attach `refs/STYLE_F01_kitchen_3.0s.png` to **every** shot. It holds FLOW_01's painterly look (FLOW_02 drifted flatter).
- **Suffix (paste last):** *Sound effects only. No music. No speech, dialogue, vocal sounds, gasps or laughter. No on-screen text, captions, subtitles, logos, or legible writing on any paper or screen.*
- **Never type the filename into the prompt.** FLOW_02 rendered it as a burned-in caption.
- The edit uses about 3–5 s of each clip. Put the key action where the tables say, and **hold the last 1.5 s steady**; that's the transition handle.

## Room geometry, revised to the real F01/F02 (canon for all 1963 shots)
- **Room:** warm plaster walls; a **large wooden louvred window, centre-back**; a **rounded white vintage fridge with a large upper freezer door, to the LEFT of the window**; wooden tables with checked cloths and stools; kettle and pots right of the window; pans hanging right; jar shelves upper right. **No tiles, no chrome tap, no sink.** Reference: `refs/GEO_F01_room_0.5s.png`.
- **Cups:** white enamel with a **thin dark-blue rim**. Reference: `refs/PROP_F02_cups_4.6s.png`.
- **Erasto (13):** slim, short-cropped hair, **white short-sleeved shirt with a chest pocket, khaki shorts**.
- **Light:** afternoon sun through the louvres making diagonal stripes. Cyan light only from the open freezer or ice.

---

## Shot 1: `FLOW_04_kitchen_question.mp4` (Chapter 1 · human beat)
- **Narration anchor:** C1_07 "Most thirteen-year-olds would let that go. Erasto doesn't. The question stays with him." It continues into C1_08 "…It's a reason to look closer." (about 7 s of use).
- **Ingredients:** `REF_erasto.png`, `REF_kitchen.png`, `refs/STYLE_F01_kitchen_3.0s.png`, `refs/GEO_F01_room_0.5s.png`.
- **Timing:**
  - 0–2 s: he looks back at the closed fridge.
  - 2–5 s: he sits and sketches.
  - **5.5–8 s: locked top-down on the page (the handle).**
- **Prompt:**
```
[STYLE ANCHOR] Late afternoon in the same 1963 school cookery room (kitchen and room references;
fridge to the left of the louvred window), now empty; sun lower and warmer, long diagonal stripes
of light. The boy from the character reference (white short-sleeved shirt with chest pocket, khaki
shorts) glances back at the closed fridge, then sits at the wooden table, opens a blue-ruled
exercise book with a red margin line, and with a pencil sketches two simple cups side by side and
a large question mark. The camera starts at a medium-wide shot at table height, pushes in slowly and
tilts down, ending locked top-down on the open exercise-book page for the last two seconds; the
sketch is simple line drawing only, no words or numbers. [SUFFIX] SFX: chair scrape, pencil on paper,
distant birds, faint fridge hum.
```
- **Transition out (MD):** at the locked top-down, the Flow page crossfades into the MD notebook (same ruled paper and red margin). The pencil "?" is redrawn in MD and becomes the magnifying-glass iris that ends Chapter 1.
- **Overlays:** none over the action. Lower-third-free.

## Shot 2: `FLOW_07_lab_test_1968.mp4` (Chapter 2 · process, hands only)
- **Narration anchor:** C2_05 "Back in Dar es Salaam, he has it tested. The hot water freezes first." (about 5 s of use).
- **Ingredients:** `refs/STYLE_F01_kitchen_3.0s.png`. No character reference; the hands are generic.
- **Timing:**
  - 0–3 s: pour and place.
  - 3–5 s: the lid closes.
  - **5–8 s: frost blooms across the lid glass (the handle).**
- **Prompt:**
```
[STYLE ANCHOR] A 1968 university physics laboratory: long wooden bench, clear glass beakers, a
mercury thermometer, a white chest freezer with a glass lid, fluorescent light mixed with window
daylight. Only a technician's hands and white lab-coat cuffs are visible. The hands pour steaming
water into one beaker and cool water into an identical beaker, place both side by side inside the
chest freezer, and close the glass lid. Then, as the light subtly shifts to suggest time passing,
feathery frost blooms across the inside of the glass lid and one beaker below clouds white with
ice. Camera: slow lateral dolly along the bench at bench height, settling on the frosting lid for the
last three seconds. [SUFFIX] SFX: water pouring, glass clink, freezer lid thunk, compressor hum,
faint ice crackle.
```
- **Transition out (MD):** the Flow frost on the lid hands over to MD frost crystals (the opening's crystal system) that wipe to the 1969 journal-page recreation ("Cool?").
- **Overlays:** a small mono tag, bottom-left: "UNIVERSITY COLLEGE, DAR ES SALAAM · RECREATION".

## Shot 3: `FLOW_10_optics_lab.mp4` (Chapter 5 · the payoff experiment, no people)
- **Narration anchor:** C5_05 "In 2020, at Simon Fraser University, Avinash Kumar and John Bechhoefer built that landscape with light: a single glass bead, far thinner than a hair, held in water by a laser." (about 6–8 s of use).
- **Ingredients:** `refs/STYLE_F01_kitchen_3.0s.png` (for texture only; the location is new).
- **Timing:**
  - 0–5 s: follow the beam.
  - **5.5–8 s: push into the objective until soft light fills the frame (the handle).**
- **Prompt:**
```
[STYLE ANCHOR] A dark modern optics laboratory at night. A thin green laser beam travels across a
black optical table, reflecting off small round mirrors, into the objective lens of a microscope
pointing down at a tiny water-filled sample cell. A gloved hand makes one tiny adjustment to a
brass micrometer knob, then withdraws. Lasers are the only strong light; soft green scatter in the
air. Camera: slow push following the beam path from mirror to mirror, ending by pushing straight
into the microscope objective until the frame fills with soft green-white light for the last two
seconds. No people other than the gloved hand; no screens; no readable labels. [SUFFIX] SFX: low
electronic hum, a small cooling fan, one soft click of the knob.
```
- **Transition out (MD):** the white-green bloom irises down into the MD microscope circle: one glowing bead in a laser-sculpted double well (the landscape from scene 5.2, now "real").
- **Overlays:** small tag: "SIMON FRASER UNIVERSITY · 2020 · ILLUSTRATIVE RECREATION".

## Shot 4: `FLOW_13_kitchen_return.mp4` (Chapter 6 · closing image, no people)
- **Narration anchor:** under C6_04–C6_05 "His teacher's answer, as he remembered it, was that he was confused. / Physics took sixty years to give its answer. He was asking the right question." (about 7 s of use).
- **Ingredients:** `REF_kitchen.png`, `refs/GEO_F01_room_0.5s.png`, `refs/PROP_F02_cups_4.6s.png`, `refs/STYLE_F01_kitchen_3.0s.png`.
- **Timing:**
  - 0–4 s: slow push to the cup.
  - 4–6 s: steam slows, hangs, and turns to frost.
  - **6–8 s: hold on the frosted rim (the handle).**
- **Prompt:**
```
[STYLE ANCHOR] The same 1963 school cookery room at dusk, empty, exactly the room layout of the
kitchen and room references: rounded white fridge to the left of the large louvred window, wooden
tables and stools. The fridge's upper freezer door is slightly ajar, spilling pale cyan light
across the floor. On the wooden table in the foreground sits a single white enamel cup with a
thin dark-blue rim. Thin steam rises from it; then the steam slows, hangs in the air and turns
into glittering frost that settles on the rim. Camera: very slow push-in toward the cup from
table height, holding on the frosted rim for the last two seconds. [SUFFIX] SFX: faint fridge hum,
one single soft ice crackle, then near silence.
```
- **Transition out (MD):** the frosted rim match-cuts to the opening's race track. There the hot cup's dot takes the shortcut path from Chapter 5 and wins, then the end card plays, with frost melting off "HOT".
- **Overlays:** none. This one breathes.

---

## Candidates for a later batch (not requested yet)
- `FLOW_05_mkwawa_question.mp4`: the hall seen from the back rows; one tall student, seen from behind, stands (C2_02). Human, but motion design can carry it.
- `FLOW_08_steam_macro.mp4`: backlit steam macro (C3_04). An MD steam fallback is already built.
- `FLOW_12_rangers_evening.mp4`: savanna, Land Rover, binoculars on the bonnet, no people (C6_02).

## What happens when these arrive
Claude inspects each clip frame by frame and chooses in/out points from the real action. Transitions and overlays are built **around the actual footage**, the chapter is retimed to the real VO, and the chapter is then mixed and QA'd. Any defect (text, letterbox, voices, geometry drift) comes back with timestamps.
