# Handoff for Codex: assets this cloud session cannot make

This session **cannot reach** Guy's signed-in Google Flow or ElevenLabs, and no credentials were requested or used. Everything below is ready to run in Guy's local browser. Please drop the results into this project using the **exact filenames**, and don't change timings in `index.html`. The slots are already cut to these lengths.

Current state: the Flow slots hold **labelled placeholder clips**, and the VO slots hold **silent WAVs** of the right length. Replacing the files is all that's needed. No code changes are required.

---

## 1. ElevenLabs voiceover (7 short lines)

- **Voice ID:** `apOzcbHULxCnvWfHPd41` (Guy's preferred voice)
- **Model:** whichever multilingual/v2-class model Guy normally uses with this voice.
- **Starting settings:** stability ≈ 0.45, similarity ≈ 0.75, style ≈ 0.15, speaker boost on, speed 1.0. Aim for normal pace, tiny natural phrase pauses and light human emphasis. Not whispery, not flirty, not announcer-y.
- **Render each line as its own file.** Pick the best of 2–3 takes. Emphasis words are in **bold** below; don't type the asterisks into ElevenLabs.
- **Pronunciation:** *Erasto Mpemba* ≈ "eh-RAHS-toh m-PEM-bah" (the M is a soft hum into P). If the voice fumbles it, try the text `Erasto M'pemba` or `Erasto Mmpemba`.

| File | Starts at | Must be ≤ | Text to paste | Delivery note |
|---|---|---|---|---|
| `VO_01.wav` | 0.35 s | 3.4 s | Two cups of water. One hot, one cold. Same freezer. | matter-of-fact setup, three clean beats |
| `VO_02.wav` | 4.35 s | 1.6 s | The **hot** one freezes first. | quiet certainty, lands in silence |
| `VO_03.wav` | 6.40 s | 4.6 s | It has to pass the cold one's starting point. It's **behind**… and **wins**. | logical, then a small turn on "wins" |
| `VO_04.wav` | 12.20 s | 4.7 s | In 1963, thirteen-year-old Erasto Mpemba saw it — making **ice cream**. | warm, storytelling ("nineteen sixty-three") |
| `VO_05.wav` | 17.05 s | 1.3 s | His teacher had an answer. | slightly dry; sets up the quote |
| `VO_06.wav` | 21.35 s | 2.4 s | He wasn't the first. **Aristotle** saw it too. | brisk, a little wry |
| `VO_07.wav` | 24.05 s | 2.35 s | The real answer? **Stranger** than anyone guessed. | hook: lean in, don't oversell |

**Export and convert** (from the project root). Trim leading silence, 48 kHz mono WAV:

```bash
for n in 01 02 03 04 05 06 07; do
  ffmpeg -y -i ~/Downloads/VO_$n.mp3 -af "silenceremove=start_periods=1:start_threshold=-50dB,apad=pad_dur=0.05" \
    -ar 48000 -ac 1 assets/audio/vo/VO_$n.wav
done
for f in assets/audio/vo/*.wav; do echo "$f $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
```

If any file is longer than its limit, **re-take it** rather than speeding it up past 1.08× (or tell Claude and it'll re-time the slot). Then rebuild the score so the music ducks under the real VO (up to −7 dB), and render:

```bash
python3 tools/make_audio.py
npx hyperframes render -f 30 -q high -o renders/opening_v2_withVO.mp4
```

---

## 2. Google Flow shots (2 for the opening)

**Tool:** Google Flow in Guy's browser, with the OmniFlash model or a 16:9 layered hybrid if preferred. **Duration:** 8 s each (≤ 10 s), 16:9, 1080p if available (720p is fine; it's shown inside a photo frame about 960×540). **Audio:** keep relevant SFX if Flow generates them, but **no music, no captions/text, no voices, no speech.**

### Consistency kit (do this first, reuse for both clips)
Generate two reference stills and use them as ingredients/frames for both clips so the boy and the room match:

- `REF_erasto.png`: *Stylized cinematic 2D animation still, painterly textures, soft film grain. A 13-year-old Tanzanian boy in 1963: slim, short-cropped hair, white short-sleeved school shirt, khaki shorts, bright curious eyes. Three-quarter view, neutral warm background. No text.*
- `REF_kitchen.png`: *Same style. A 1963 East African secondary-school cookery room: whitewashed walls, wooden worktable, enamel cups and a metal pot on a charcoal stove, a small white vintage refrigerator with a tiny top freezer compartment, afternoon sun through wooden louvres, dust in the light. No people, no text.*

Style anchor for every prompt: **"stylized cinematic 2D animation, painterly textures, soft film grain, warm tungsten and daylight, muted palette with ember-orange warmth and pale frost-cyan cold light."** It matches the opening's hot/cold colour language.

> Dramatization note: this is an illustrated recreation of a real person, not a likeness. Don't use or imitate real photos of Mr Mpemba.

### `assets/flow/FLOW_01_kitchen_hot_mix.mp4` (the edit uses 0.6 s → 3.7 s of the clip)
```
Stylized cinematic 2D animation, painterly textures, soft film grain, warm tungsten and daylight,
muted palette with ember-orange warmth and pale frost-cyan cold light. 1963 East African school
cookery room (use kitchen reference). The boy (use character reference) carries a steaming white
enamel cup of just-boiled milk mixture with both hands, hurries past the wooden worktable to the
small white refrigerator, opens the tiny freezer compartment already crowded with other students'
cups, and pushes his steaming cup into the last gap. Steam curls orange in the sunlight; cold
cyan mist spills from the freezer. Camera: waist-height tracking push-in following him, ending on
the cup going in. Sound effects only: footsteps on concrete, enamel clink, freezer door creak,
fridge hum. No music. No dialogue or voices. No on-screen text, captions, subtitles or logos.
```
The key action (the cup entering the freezer) should happen between **1.5 s and 3.5 s** of the clip.

### `assets/flow/FLOW_02_freezer_reveal.mp4` (the edit uses 0.8 s → 3.6 s of the clip)
```
Same style, same boy, same kitchen. Camera inside the small freezer compartment looking out: the
door swings open, cold mist rolls out over frosted metal. The boy's hand reaches in and pulls two
enamel cups forward side by side: his cup is frozen solid, white with feathery ice crystals; the
other cup is still liquid and sloshes. Rack focus to his face lit by pale cyan freezer light: eyes
widen in surprise, then a small disbelieving smile. Sound effects only: freezer door, ice
crackle, cup scraping on metal. No music. No dialogue or voices. No on-screen text, captions,
subtitles or logos.
```
The two cups should be readable (frozen vs. liquid) between **1.0 s and 3.0 s**.

**Delivery:** H.264 MP4, same filenames, overwrite the placeholders in `assets/flow/`. If you trimmed differently, tell Claude the new in-points (`data-media-start` in `index.html`). To hear Flow's SFX, remove `muted` on `#flow1`/`#flow2` and add `data-volume="0.5"`. Claude can do this on request.

---

## 3. What to send back to this session
1. The 7 VO WAVs, 2 Flow MP4s and 2 reference stills (commit them to this branch or attach them).
2. Any take you were unsure about. Send alternates and Claude will choose.
3. Guy's notes on the opening review cut.

## Later (full film, not needed yet)
Planned Flow moments: Osborne's visit and Mpemba's question from the audience; the 1969 lab test at the university; a present-day physicist's bench (laser trap). Everything explanatory stays motion design (graphs, race modifiers, energy-landscape "shortcut").
