# "He Beat Vegas With a Computer in His Shoe": style bible and OmniFlash shot list
v1 · 2026-09-29 · film target about 10:30 (630 s)

## 1. Style: "Casino Noir, animated"
One look for the whole film. Footage and motion design share one palette, so cuts between them feel seamless.

- **Footage (OmniFlash):** stylized 3D animation in a prestige animated-documentary style. Hand-painted textures, soft volumetric light, 1960s period detail and a subtle film grain. It is **not photoreal**, which keeps real people clearly "illustrated" and makes every clip match.
- **Palette:**
  - felt green `#0f3b2e`
  - casino red `#b3261a`
  - chip gold `#e0b04a`
  - ink black `#0b0d10`
  - blueprint cyan `#8fe3ff`, used only for "the math"
  - warm gold means winning; cyan lines mean the math.
- **Motion design (me):**
  - card-flip scene transitions;
  - chip-stack counters;
  - the device drawn as a glowing blueprint;
  - an odds meter in the corner that rises as Thorp's edge grows;
  - a spinning wheel with ball physics;
  - ticker tape, big kinetic numbers (44%, $11,000, 160 trades);
  - period newspaper and paper textures, and stamp slams for reveals.
- **Pace:** the average shot is about 3 s, and about 2 s in the cold open and twist. Each 8 s clip gets cut into 2–3 moments, with graphics composited on top.
- **Sound:** a tense jazz/noir score (upright bass, brushed drums, muted trumpet stabs), casino room tone, chip clicks, the soft "tone in the ear" motif, and silence for the big reveals.

## 2. Rules for every OmniFlash clip
- **Output:** 16:9, 1080p if available, generation length 8 s (the max is 10 s).
- **Paste the style prefix below at the start of every prompt.** Attach the **style reference stills** (Section 3) to every shot. Don't reuse the Mpemba kitchen stills: they leaked into other scenes last time.
- **Keep clips clean:**
  - No text, no captions, no logos, no readable signs or newspapers. I add all text.
  - No music and no dialogue. Ambient sound is fine; I replace it anyway.
  - **Full-bleed frame, no border, no rounded corners.** Three of the four previous clips had a cream frame.
- **Handles:** hold the final pose for about 1 s at the end of every clip, and start each clip with about 0.5 s of settled movement.
- **Real people:** the stylized characters below *represent* Thorp, Shannon and Kimmel. **Madoff is never shown**: only a back-lit silhouette or an empty office.
- **Naming:** save each clip as `V##_short_name.mp4`, for example `V01_toe_switch.mp4`.

### Style prefix (paste at the start of every prompt)
> Stylized 3D animated film in the style of a prestige animated documentary: hand-painted textures, soft volumetric light, rich 1960s period detail, palette of deep felt green, casino red, brass gold and ink black, subtle film grain, cinematic composition, shallow depth of field. No text, no captions, no logos, no readable signs, no music, no dialogue. Full-bleed 16:9 frame, no border, no rounded corners.

### Characters (reuse this wording every time)
- **ED:** a lean young mathematician, about 29, short dark side-parted hair, dark-rimmed glasses, white shirt, narrow dark tie, charcoal 1961 suit, calm and watchful.
- **CLAUDE:** a tall, lanky man in his mid-forties, receding hair, playful grin, beige cardigan over a shirt, sleeves pushed up.
- **MANNY:** a heavyset older gambler in a camel overcoat and grey fedora, gold ring, cigar.

## 3. First: reference stills (3 images, before any video)
These lock the look and the characters.

| ID | Prompt (after the style prefix) |
|---|---|
| REF_A | Character sheet: ED standing, front and three-quarter views, neutral grey background. |
| REF_B | Character sheet: CLAUDE and MANNY side by side, front view, neutral grey background. |
| REF_C | Establishing frame: a 1961 Las Vegas casino floor at night, crowded roulette table in warm pools of light, smoke haze, chandeliers, green felt, brass rails. |

## 4. Shot list (47 clips)
**★ = core** (the film works with these alone) · **○ = optional** (extra richness)
Timestamps refer to the script (`SCRIPT.md`). "Use" is roughly how many seconds I expect to keep.

### COLD OPEN, 0:00–0:30 (the hook; the most important batch)
| ID | ★ | Use | Prompt (after the style prefix) |
|---|---|---|---|
| V01 | ★ | 3 s | Extreme close-up of a polished black 1961 dress shoe on patterned casino carpet. The big toe presses down inside the shoe and a tiny hidden switch clicks; a hair-thin copper wire runs from the heel up under the trouser cuff. Slow push-in. |
| V02 | ★ | 4 s | Macro shot of a white roulette ball racing around the polished wooden rim of a spinning roulette wheel, motion blur, sparkling reflections, camera tracking alongside the ball. |
| V03 | ★ | 3 s | Extreme close-up of ED's ear and cheek at a casino table; a tiny skin-colored earpiece sits in the ear. His eyes shift slightly as if hearing a soft tone. Warm casino light, shallow focus. |
| V04 | ★ | 4 s | Wide shot of the 1961 casino floor (as REF_C), crowd around a roulette table, smoke haze; the camera pushes slowly through the crowd toward the table. |
| V05 | ★ | 3 s | Low-angle close-up: a croupier's hand spins the roulette wheel and flicks the ball in against the spin. |
| V06 | ★ | 3 s | Close-up: ED's hand calmly places a small stack of gold and red chips onto one area of the green betting layout, then withdraws. |
| V07 | ★ | 4 s | Macro slow motion: the roulette ball loses speed, drops, bounces off a diamond deflector, clatters and settles into a pocket. |
| V08 | ○ | 3 s | Medium shot: a pit boss in a dark suit at the back of the casino notices something, narrows his eyes and picks up a desk phone. |
| V09 | ★ | 3 s | Night: a 1960s sedan's headlights sweep down a steep, winding mountain road with no guardrail, seen from above. Ominous. |
| V10 | ★ | 3 s | 1991 office at night: a desk lamp, a thick binder of trade confirmations, a hand turning pages; beyond the window, Manhattan skyscraper lights. No faces. |

### ACT 1: THE QUESTION, 0:30–2:55
| ID | ★ | Use | Prompt |
|---|---|---|---|
| V11 | ★ | 4 s | 1955 university physics lab: young ED, a student in a sweater, watches a small roulette wheel spin on a lab bench among instruments; chalk equations blur on the board behind him. |
| V12 | ★ | 5 s | Directly overhead, top-down view of a roulette wheel: the ball spirals around, gradually slowing, the camera perfectly still (a plate for diagram overlays). |
| V13 | ○ | 3 s | Exterior: a grand neoclassical university building with a large dome, autumn leaves, students with books, 1960. |
| V14 | ★ | 4 s | ED knocks and opens an office door; inside, CLAUDE looks up from a cluttered desk with juggling balls, a unicycle leaning on the wall, and gadgets, then grins. |
| V15 | ★ | 5 s | A cozy home basement workshop at night: a full-size casino roulette wheel on a heavy table, a strobe light flashing, a film camera on a tripod; ED and CLAUDE lean in, timing the ball. |
| V16 | ★ | 4 s | Macro: hands with a soldering iron assemble a tiny circuit of twelve transistors into a box the size of a cigarette pack; a curl of solder smoke. |
| V17 | ○ | 3 s | Close-up: the finished small box is slipped into an inner jacket pocket; thin wires are fed down inside the trouser leg. |
| V18 | ★ | 4 s | In the basement, ED taps his toe under the table while CLAUDE holds a stopwatch to his ear; the ball drops where they predicted; they look at each other and grin. |

### ACT 2: THE TEST AND THE REVERSAL, 2:55–4:00
| ID | ★ | Use | Prompt |
|---|---|---|---|
| V19 | ★ | 4 s | 1961 Las Vegas strip at dusk: glowing neon shapes (stars, arrows, starbursts, no readable words), classic cars cruising, a warm desert sky. |
| V20 | ○ | 3 s | Two couples in 1961 evening wear (ED with his wife, CLAUDE with his wife) walk through casino doors into warm light. |
| V21 | ★ | 3 s | CLAUDE stands at the roulette wheel jotting numbers in a small notebook like an ordinary system player, glancing casually at the wheel. |
| V22 | ★ | 3 s | A croupier pushes a tall stack of chips across the felt to ED, who keeps a perfect poker face. |
| V23 | ★ | 3 s | Extreme close-up behind ED's ear: a hair-thin wire snaps with a tiny spark; ED winces and touches his ear. |
| V24 | ○ | 4 s | Hotel room, night: ED and CLAUDE pack the small device and a tangle of broken wires into a briefcase, disappointed; neon flickers through the blinds. |

### ACT 3: THE WAR WITH THE CASINOS, 4:00–6:40
| ID | ★ | Use | Prompt |
|---|---|---|---|
| V25 | ★ | 4 s | Overhead: a dealer deals blackjack cards onto green felt at a 1960s table; card faces are illustrated with no readable text. |
| V26 | ★ | 4 s | 1960 computer room: a huge mainframe with spinning tape reels and blinking lights; ED feeds a stack of punched cards into a reader. |
| V27 | ○ | 3 s | In front of a chalkboard, CLAUDE hands ED a few typed pages; ED reads, eyebrows rising. |
| V28 | ★ | 4 s | A Reno casino with snow falling outside the windows: MANNY slides a thick envelope of cash across a table to ED. |
| V29 | ★ | 5 s | ED plays blackjack calmly; a slow push-in as his chip stacks grow taller, the dealer increasingly uneasy. |
| V30 | ★ | 3 s | A bookstore window display: stacks of identical hardcover books with plain red covers and no text; passers-by stop and point. |
| V31 | ○ | 4 s | A crowded 1962 casino: many players at blackjack tables silently counting, one moving his lips, another tapping fingers. |
| V32 | ★ | 3 s | Two casino security men in dark suits approach ED at a table; one puts a hand on his shoulder; they escort him out. |
| V33 | ★ | 4 s | Hotel bathroom mirror: ED applies a fake beard and puts on wraparound sunglasses, checking his disguise. |
| V34 | ★ | 3 s | Close-up at a baccarat table: a cup of coffee with cream swirling; ED lifts it and sips. |
| V35 | ★ | 3 s | Extreme close-up of ED's eye behind his glasses: the pupil slowly dilates and the image goes soft and dreamy. |
| V36 | ★ | 3 s | Night, inside a 1960s car: a foot pumps the brake pedal hard; the speedometer needle climbs toward 80. |
| V37 | ★ | 4 s | Exterior night: the sedan speeds down mountain switchbacks, sparks and smoke from the tires, then slowly grinds to a stop at the roadside. |

### ACT 4: THE BIGGER TABLE, 6:40–8:40
| ID | ★ | Use | Prompt |
|---|---|---|---|
| V38 | ★ | 4 s | A 1960s Wall Street trading floor: chaos, paper slips flying, traders shouting silently, clocks and boards (no readable text). |
| V39 | ★ | 3 s | Macro: a brass stock ticker machine prints ticker tape that curls onto the floor. |
| V40 | ○ | 4 s | 1967 study: ED and a colleague with a slide rule and stacks of papers and certificates, working late under a lamp. |
| V41 | ★ | 4 s | 1970s office with a Pacific Ocean view: ED at a computer terminal with glowing green numbers (unreadable); a quiet, confident smile. |
| V42 | ○ | 3 s | A slow rising camera over a 1970s coastal city at golden hour, calm and prosperous. |

### ACT 5: THE TWIST, 8:40–10:15
| ID | ★ | Use | Prompt |
|---|---|---|---|
| V43 | ★ | 5 s | 1991 office: an older ED (grey hair, same glasses) at a desk with a thick binder of trade confirmations, highlighting lines, frowning more with each page. |
| V44 | ★ | 4 s | A tall Manhattan office at night: a man seen only as a back-lit silhouette standing at the window, city lights below, perfectly still. |
| V45 | ★ | 3 s | ED picks up a desk telephone and speaks calmly and seriously (no audio), then sets it down. |
| V46 | ★ | 3 s | Dawn: federal agents in windbreakers (no letters or logos) walk briskly into a glass office lobby. |
| V47 | ★ | 5 s | Final echo, macro, very slow motion: the roulette ball rolls, slows and stops in a pocket; the wheel keeps turning and the light slowly dims. |

## 5. The math
| | Core ★ | All |
|---|---|---|
| Clips | 38 | 47 |
| Raw footage (8 s each) | 304 s | 376 s |
| Usable footage (about 3.6 s average) | about 140 s | about 170 s |
| Share of the 630 s film that is Flow footage | about 22% | about 27% |
| Motion design and graphics (mine) | about 490 s | about 460 s |
| Cuts overall (average shot about 3 s) | about 210 | about 210 |

Footage is used in short, punchy slices, cut on action and layered under graphics. That's what makes it feel fast and expensive.

**Credits.** Last batch cost about 12 credits per 8 s clip (4 clips = 48). That's an estimate; check the current price in Flow.
- **Core:** 38 × 12 ≈ **456 credits**, plus about 20% for retakes ≈ **550**.
- **All shots:** 47 × 12 ≈ **565 credits**, plus retakes ≈ **680**.
- The 3 reference stills are extra.

## 6. Order of work
1. **You:** generate REF_A, REF_B and REF_C and send them to me. I approve the look.
2. **You:** generate **Batch A = the cold open (V01–V10)** and send it.
3. **Me, in parallel:**
   - narration with the v3 voice;
   - timing laid out from the real narration;
   - the full motion-design system (cards, blueprint, odds meter, typography);
   - the score.
4. **Me:** build and deliver a **0:00–1:00 milestone** (cold open plus the start of Act 1) with sound, so we lock the style before spending the rest.
5. **You:** Batches B–E (acts 1–5). **Me:** assemble, QA (pause audit, contrast, loudness) and deliver the final film.
