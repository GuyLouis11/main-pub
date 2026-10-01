# Eleven v4 voice test: Tim Hook (Storytelling)

`v4_test_reel.mp3` plays all 16 clips in order, with a short tone before each.

| # | Model | Test | Prompt |
|---|---|---|---|
| 01 | v3 | Baseline hook (what the videos use now) | Every Monday morning, at exactly six a.m.… |
| 02 | **v4** | Same hook | (same) |
| 03 | v3 | Confession | [quietly, slowly] Because I wrote them… |
| 04 | **v4** | Same confession | (same) |
| 05 | v4 | Whisper → normal | [whispers] Don't look at the screen yet. [normal voice] Okay. Now look. |
| 06 | v4 | Laugh, sigh | [laughs] He actually believed it. [sighs] Honestly? So would you. |
| 07 | v4 | Build to a shout | …[getting louder, panicked] … [shouting] RAN! |
| 08 | v4 | Menacing | [low, menacing, slow] You think you found me… |
| 09 | v4 | Accent: Southern farmer | [thick Southern accent, an old farmer] Son, ain't nobody… |
| 10 | v4 | Accent: British anchor | [posh British accent, a news anchor] Authorities have confirmed… |
| 11 | v4 | Character: elderly woman | [frail elderly woman, worried] Danny, sweetheart… |
| 12 | v4 | Character: kid | [excited little kid] Dad! Dad! The stock thing was right again! |
| 13 | v4 | Sound effects: rain, phone | [light rain] [phone buzzing] It was six a.m.… |
| 14 | v4 | Sound effect: door | He heard footsteps. [door slams] Then nothing. |
| 15 | v4 | One voice playing 3 characters | [calm narrator] … [nervous, fast, Daniel] … [skeptical woman, Lily] … |
| 16 | v4 Turbo | Hook (half price, faster) | (same as 01) |

## Measurements (against the Prophet narration)
- **Identity:** v4 renders the voice about 4 semitones higher on plain narration (146 Hz median pitch against 117 Hz).
  Its timbre match is 0.957, against 0.982 for v3. The voice is a Professional Voice Clone fine-tuned only for the v2
  models, so v4 is approximating it. If the voice owner trains it for v4, the match should improve; ElevenLabs says
  v4 supports Professional Voice Clones again.
- **Expressiveness:**
  - Whispering is 13% voiced.
  - The shout peaks 2.5 dB louder at 235 Hz.
  - Menacing drops to 60 Hz.
  - The kid (284 Hz) and the elderly woman (237 Hz) transform the voice clearly.
- **Pipeline:** the with-timestamps endpoint works on v4, so the word-synced animation pipeline needs no changes.
  v4 costs the same per character as v3; Turbo costs half.
