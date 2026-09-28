# Handoff for Codex: opening assets (milestone 1)

**Access facts (checked 2026-09-28):**
- This cloud session has **no Google Flow/OmniFlash session**. It has a fresh headless Chromium with no Google sign-in, and no cookies were sought.
- It has **no ElevenLabs access**. There's no credential in the environment, and `api.elevenlabs.io` is blocked by the network policy (403 on a read-only voice lookup).

Codex produces both locally and returns the files. Claude assembles and re-times them.

The full-film plan (all later Flow shots and VO) is in `FILM_MANIFEST.md`. This file covers only the opening.

---

## 1. Narration: 8 lines, one file each (ElevenLabs, voice `apOzcbHULxCnvWfHPd41`)

**Record at natural speed. Do not rush or speed up takes to fit.** The edit re-times itself around the real takes: `python3 tools/retime.py` opens breathing room after each line where it's needed.

| File | Text | Delivery |
|---|---|---|
| `VO_01.wav` | Two cups of water. One hot, one cold. Same freezer. | matter-of-fact, three clean beats |
| `VO_02.wav` | Sometimes… the hot one freezes first. | small pause after "Sometimes"; quiet certainty |
| `VO_03.wav` | But to freeze, it has to cool past the cold one's starting point. | clear logic, no hurry |
| `VO_04.wav` | So how can it ever win? | a genuine question, a light lift on "win" |
| `VO_05.wav` | In 1963, a schoolboy named Erasto Mpemba saw it happen. | warm, storytelling ("nineteen sixty-three") |
| `VO_06.wav` | His teacher had an answer. | slightly dry; sets up the silent quote |
| `VO_07.wav` | He wasn't the first. Aristotle described it too. | brisk, a little wry |
| `VO_08.wav` | The water is still debated. What physicists found instead is stranger. | a hook; lean in on "stranger", don't oversell |

- **Settings to start from:** stability ≈ 0.45, similarity ≈ 0.75, style ≈ 0.15, speaker boost on, speed 1.0. Aim for normal pace, tiny natural pauses and human emphasis, not whispery or announcer-y.
- **Pronunciation:** *Erasto Mpemba* ≈ "eh-RAHS-toh m-PEM-bah". If it's fumbled, try `Erasto M'pemba`.
- **Convert** (trims leading silence; 48 kHz mono WAV):
  ```bash
  for n in 01 02 03 04 05 06 07 08; do
    ffmpeg -y -i ~/Downloads/VO_$n.mp3 -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse" \
      -ar 48000 -ac 1 assets/audio/vo/VO_$n.wav
  done
  ```
- **Then run:**
  ```bash
  python3 tools/retime.py && python3 tools/make_audio.py && npx hyperframes render -f 30 -q high -o renders/opening_v2_hq.mp4
  ```
  `retime.py` prints each line's final start time and any line it couldn't fit.

Current timings use **estimated** lengths (about 2.6–2.9 words/s): the opening is about **33.4 s**. Real takes will move this by a second or so either way.

## 2. Google Flow: 2 clips for the opening (Omni 1.1 Flash, 8 s, 16:9)

**Reference assets (already generated in Flow project `72815c2e-…`):** `REF_erasto.png`, `REF_kitchen.png`. Attach **both** to both clips.

**Continuity rules (bible summary; full version in `FILM_MANIFEST.md`):**
- **Erasto (13):** slim; short-cropped hair; white short-sleeved school shirt, khaki shorts, bare forearms, no watch.
- **Cup:** a **white enamel cup with a thin dark-blue rim**. Every student cup is identical; his is marked with a small **pencilled "E"** on masking tape.
- **Kitchen:** whitewashed walls; one wooden worktable, centre; charcoal stove, left; small white refrigerator with a tiny top freezer, back-right; louvred window, right wall, afternoon sun from the right.
- **Light:** warm daylight plus ember-orange on steam and heat; pale frost-cyan only from the freezer.
- **Style anchor (every prompt):** "stylized cinematic 2D animation, painterly textures, soft film grain, warm tungsten and daylight, muted palette with ember-orange warmth and pale frost-cyan cold light."
- **Audio:** SFX only. No music, no voices/speech, no captions/text/logos.

### `assets/flow/FLOW_01_kitchen_hot_mix.mp4`
- **Placed at:** 13.70–16.80 s in the opening, using clip time 0.6–3.7 s. It plays under VO_05 ("In 1963, a schoolboy named Erasto Mpemba…").
- **Key action window:** the cup goes into the freezer between 1.5 and 3.5 s of the clip.
```
Stylized cinematic 2D animation, painterly textures, soft film grain, warm tungsten and daylight,
muted palette with ember-orange warmth and pale frost-cyan cold light. 1963 East African school
cookery room (kitchen reference). The boy (character reference) carries a steaming white enamel
cup with a thin dark-blue rim in both hands, hurries past the wooden worktable to the small white
refrigerator, opens the tiny freezer compartment already crowded with other students' identical
cups, and pushes his steaming cup into the last gap. Steam curls orange in the sunlight; cold cyan
mist spills from the freezer. Camera: waist-height tracking push-in following him, ending on the
cup going in. Sound effects only: footsteps on concrete, enamel clink, freezer door creak, fridge
hum. No music. No dialogue or voices. No on-screen text, captions, subtitles or logos.
```

### `assets/flow/FLOW_02_freezer_reveal.mp4`
- **Placed at:** 16.80–19.60 s, using clip time 0.8–3.6 s, under the end of VO_05 and "…and it froze first" in the notebook.
- **Key action window:** the two cups must read clearly (ice vs liquid) between 1.0 and 3.0 s.
```
Same style, same boy, same kitchen. Camera inside the small freezer compartment looking out: the
door swings open, cold mist rolls over frosted metal. The boy's hand reaches in and pulls two
identical white enamel cups forward side by side: his cup (small tape label "E") is frozen, white
with feathery ice crystals; the other cup is still liquid and sloshes. Rack focus to his face lit
by pale cyan freezer light: eyes widen in surprise, then a small disbelieving smile. Sound effects
only: freezer door, ice crackle, cup scraping on metal. No music. No dialogue or voices. No
on-screen text, captions, subtitles or logos.
```

If a clip's best action falls elsewhere, just tell Claude the in-point. It's one number (`data-media-start`).

## 3. Return
Send the 8 VO WAVs (or MP3s), the 2 MP4s and the 2 reference PNGs (added to `assets/flow/refs/`), plus any alternate takes. Nothing else is needed for the opening.
