# Opening storyboard: about 33 s (fits the real VO), 1920×1080, 30 fps

**v2 timing model.** Times below are **base** times (the 30 s skeleton). `index.html`'s `<script id="timing">` block lists each VO line's base start, its deadline and the breathing point after it. `tools/retime.py` measures the real takes and opens holds only where speech needs room, and the picture, clips and score follow the same map. With estimated takes the cut is **33.35 s**, with holds of +0.85 s (after the freeze), +0.95 s ("must pass here"), +0.5 s (teacher), +0.95 s (Aristotle) and a +1.4 s slower slot machine. It also has two fixed trims: quote hold −0.3 s and title −1.0 s.

**v2 accuracy changes.**
- The VO says "**Sometimes**… the hot one freezes first" and asks "So how can it ever win?" instead of asserting it.
- The race HUD reads "ILLUSTRATION · RESULTS VARY".
- The finish line is "0°C · ICE FORMS", not "FROZEN", and the pills read "ICE FIRST" / "NO ICE YET".
- The graph is tagged "ILLUSTRATIVE CURVES · NOT MEASURED DATA", and the invented "COLD · STILL 5°C" figure is removed.
- The last line no longer implies the water question is settled.

On-screen text is deliberately **not** the VO text: no duplicate captions. *The VO column below shows v1 wording; the current lines are in `HANDOFF_CODEX.md` and the timing block.*

| Time | Picture | On-screen type | VO (ElevenLabs) | Sound |
|---|---|---|---|---|
| 0.00–0.70 | Freezer door light slits open onto two glasses on a wire shelf | FREEZER −18°C · TIME-LAPSE 00:00 | — | door thunk, seal suck, compressor hum |
| 0.35–3.75 | Steam on HOT; readouts 90.0° / 20.0°; race track: temperature scale 90→0, finish line = 0°C FROZEN. From 1.0 the time-lapse runs and both dots race. COLD starts far ahead. | HOT / COLD readouts, track ticks | **VO_01** "Two cups of water. One hot, one cold. Same freezer." | clock pulse at 96 BPM, sub hits, tension pad, riser |
| ~3.9 | HOT overtakes COLD on the track | — | — | 16th ticks |
| **4.15** | **HOT hits 0°C: ice crystals branch through the glass, flash, jolt.** COLD still liquid at 3.2°. | FROZEN SOLID / STILL LIQUID pills | **VO_02** (4.35) "The hot one freezes first." | **music cuts dead**, ice crackle, glass shimmer, stamp |
| 5.55–6.70 | The dots rewind to their start temps; cups blur away; **the track swings 90° and becomes the graph's temperature axis** | — | — | whoosh |
| 6.40–8.30 | Graph: COLD line (cyan) and the EXPECTED hot path (dashed ember) draw together. Band at 20°C. | 90°C / 20°C / 0°C, COLD STARTED HERE, EXPECTED | **VO_03** (6.40) "It has to pass the cold one's starting point. It's behind… and wins." | plucked ostinato builds |
| 7.60–9.30 | Marker pulses where the hot path crosses 20°C | IT MUST PASS HERE | ↑ | ping |
| 8.80–10.50 | The **real** hot line (glowing ember) dives, crosses the cold line and hits 0°C first | — | ↑ | draw swell, low saw tension |
| 10.50 | Finish burst, time cursor | HOT · FROZEN ▸ / COLD · STILL 5°C | ↑ ("…and wins") | hit, pluck chord |
| 11.25–12.10 | Cracks radiate from the finish point; the dark frame **shatters** into wedges that fall away to reveal paper | — | — | crack, glass shatter, sub |
| 11.85–17.0 | 1963 exercise book. Taped photo = **FLOW_01** (11.9–15.0) then **FLOW_02** (15.0–17.8). Handwritten notes. Name + lower third. | "Cookery class: ice cream", "hot mix → straight in", "(no room to let it cool)", "…and it froze first", *Erasto Mpemba, 13*, MAGAMBA SECONDARY SCHOOL · TANGANYIKA · 1963 | **VO_04** (12.20) "In 1963, thirteen-year-old Erasto Mpemba saw it — making ice cream." | warm tine motif, shaker, pencil scribbles, paper |
| 17.0–18.2 | The lamp dims; the photo, notes and lower third clear off the desk | — | **VO_05** (17.05) "His teacher had an answer." | music ducks, then **tape-stop** at 17.9 |
| 18.2–21.1 | Red pen writes the teacher's words, circles "confused" | "The answer I can give is that you were confused." — his teacher, 1963 | *(silence: let the quote land)* | room tone, pen scratch, circle scribble |
| 21.08–21.40 | Page rips away upward | — | — | paper rip, tape rewind |
| 21.35–23.50 | Dial spins back: 1963 → **1637 Descartes** (slam 22.0) → **350 BC Aristotle** (slam 22.9) | "Meteorology" / "Meteorologica" | **VO_06** (21.35) "He wasn't the first. Aristotle saw it too." | reverse ticks, slam booms |
| 23.55–26.30 | Fast-forward; slot machine of explanations: EVAPORATION? CONVECTION? DISSOLVED GAS? SUPERCOOLING? FROST? → **?** | PROPOSED EXPLANATIONS, STILL DEBATED | **VO_07** (24.05) "The real answer? Stranger than anyone guessed." | whoosh, slot ticks, pulse, riser |
| **26.45–30.0** | Title slam; frost grows across **HOT**, turning it from ember to ice; drifting ice motes; fade to black 29.55 | GUY WONDERS WHY · THE BOY WHO / FROZE HOT WATER | — | boom, glass-bell chord, frost crackle, drone tail |

## Timing logic
- The impossible event lands at **4.15 s**. The race itself is on screen and moving from **1.0 s**.
- No hold is longer than about 1 s without motion. The one deliberate stillness is the teacher's quote (about 1 s of hold after it's written), which is the emotional turn.
- VO pace is about 2.7–3 words/s with natural pauses. No line crosses a scene cut.
