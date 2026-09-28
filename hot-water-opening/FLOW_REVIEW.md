# Flow footage review: FLOW_01 / FLOW_02 (received 2026-09-28)

Both are 1280×720, 24 fps, 8.00 s, H.264 with AAC stereo audio. They were checked frame by frame (4 fps contact sheets plus full-resolution stills), with numerical cut and letterbox detection, and with spectrograms and loudness for the audio.

## FLOW_01_kitchen_hot_mix.mp4: usable, no retake needed
| Time | What happens |
|---|---|
| 0.00–1.00 | Erasto walks toward the fridge holding a white enamel cup. Continuous push-in, no cuts |
| 1.25–2.00 | He opens the fridge's upper door; cyan interior light spills out |
| 2.00–3.25 | The door is open, **steam is visible from his cup**, 2–3 cups already inside |
| 3.25–4.50 | He reaches in and places his cup; **cup-on-shelf clink at about 4.3 s** (audio) |
| 4.50–5.75 | His hand withdraws; steam still rising inside |
| 6.25–7.75 | He closes the door; **door slam at about 7.4 s peaks at 0.1 dBFS** (not used) |

- **Opening use: in 2.20, out 5.30** (3.1 s), covering the steam, reach, placement and clink. Reviewed usable window: 1.6–6.3 s.
- **Continuity:** plaster walls, louvred window behind, fridge **to the left of the window**, upper-compartment freezer. That's now canon (the bible said back-right; the references win).
- **Audio:** foley only (footsteps, clinks, door). No voice, no music. Used at −5 dB under the score.
- **Minor, no action needed:** the fridge badge at 7.2–7.8 s is illegible script and outside the used range.

## FLOW_02_freezer_reveal.mp4: usable with trimming; optional retake
| Time | What happens |
|---|---|
| **0.00–1.46** | **DEFECT: letterboxed frame with burned-in text "FLOW_02_freezer_reveal" top and bottom** (Flow rendered the filename as a caption) |
| 1.38–1.54 | Letterbox drops away plus a camera jump (masked transition) |
| 1.50–2.75 | POV from inside the freezer: he reaches both hands to two white enamel cups with **dark-blue rims** |
| 3.00–3.75 | He lifts both cups toward the camera |
| **4.25–5.00** | **Best moment: left cup frozen solid (white, level); right cup tilts and liquid pours and drips over the rim.** Reads clearly at thumbnail size |
| 5.58–6.12 | Rapid push-in to his face (continuous, but fast enough to feel like a jump) |
| 6.00–7.75 | Face close-up: surprise, then a smile |
| **6.20–6.50, 7.20–7.60** | **DEFECT (audio): unintended vocalisations** (a gasp, then a voiced laugh-like sound; harmonic formants visible in the spectrogram) |

- **Opening use: in 2.50, out 5.30** (2.8 s), covering the reach, lift and pour/drip contrast. Reviewed usable window: 1.6–5.5 s. Clip audio is on at −6 dB; that range contains only the cup scrape and small transients.
- **Chapter 1 reuse:** the face reaction at 6.10–7.10 works as a picture-only insert (**audio muted**).
- **Continuity notes:**
  - FLOW_02 is **flatter and more cel-shaded** than FLOW_01, with rounder face and larger eyes. Separated by the notebook frame this is acceptable, but it's visible side by side.
  - The background shows a **tiled splashback and a chrome mixer tap/sink** that FLOW_01's room doesn't have, and a modern tap is a mild anachronism for a 1963 school kitchen.
- **Retake needed for the opening?** **No.** The trimmed range avoids both defects.
- **Optional retake**, only if the style drift bothers Guy on the big screen: regenerate FLOW_02 with both references plus a still frame from FLOW_01 (at about 3.0 s) as a third style reference. Add to the prompt: *"no letterboxing, no text of any kind, no tiled wall or modern tap; plaster walls as in the kitchen reference; no vocal sounds"*.

## Prompt lessons for the remaining clips (added to the manifest)
1. Never put the filename in the prompt text. Flow can render it as a caption.
2. State "no letterbox bars, full-frame 16:9".
3. State "no vocal sounds, gasps or laughter" whenever a face reacts.
4. Attach a still from an approved clip as a style reference to hold the painterly look.
