# Video Studio — production guide

This repo is a YouTube channel's production studio. Every video here was made end to end in code:
- script;
- narration (ElevenLabs);
- motion graphics (HyperFrames: HTML + GSAP rendered to MP4);
- an original synthesized score and sound design;
- QA;
- mastering;
- captions;
- thumbnails;
- the upload package.

**The Prophet (`prophet/`) is the reference build.** Start every new video from it.

The goal of every video is **views, retention and monetization**:
- a hook that makes scrolling away feel impossible;
- a script people finish;
- visuals that never sit still;
- packaging (title, thumbnail) that earns the click.

---

## 0. Standing rules (from the channel owner)

- **Uploads stay Private.** The owner publishes manually. Never publish.
- **Never mention AI** in titles, descriptions or tags.
- **Voice:** "Tim Hook (Storytelling)", voice ID `apOzcbHULxCnvWfHPd41`, a Professional Voice Clone used with the voice
  owner's permission. Use it and don't debate it. Only raise it if a real problem comes up.
- **ElevenLabs key:** read it from the environment (`XI_KEY`) or from a **gitignored** `.env` at the repo root (see
  `.env.example`). The voice scripts do this automatically.
  - Never paste the key into a file that gets committed.
  - Never echo it in logs or commit messages.
- **Big decisions go to the owner first:** choosing a topic, switching voices, anything published. Otherwise, act.
- **Report honestly:**
  - if a check fails, say so;
  - if credits ran out, say so and offer a fallback;
  - never claim a render is clean without running the QA gates in section 7.

## 1. Repo map

| Path | What | Status |
|---|---|---|
| `prophet/` | **The Prophet**: 10:17 fictional scam thriller with two twists. Eleven v4 theatrical narration. | Done, delivered |
| `beat-vegas/` | **He Beat Vegas With a Computer in His Shoe** (long-form, noir jazz score) | Done |
| `monty-short/` | **Should You Switch Doors?** Monty Hall Short, 1080×1920 | Done |
| `nines-short/` | **0.999… = 1** Short, 1080×1920 | Done |
| `film/`, `hot-water-opening/` | **The Boy Who Froze Hot Water**: earlier film with generated video shots ("Flow" slots) | Done |
| `shorts/` | **Remotion Shorts studio**: "The Bathroom Stall" (McDonald's Monopoly) and "The Sip" (New Coke). React motion kit with AE-style motion blur, transitions and captions, real logos from `simple-icons`, and a three.js 3D can. See `shorts/README.md`. | Done |
| `voice-tests/` | Eleven v4 test reel for the Tim voice (v3 vs v4, tags, accents, characters, SFX) | Reference |
| `deliveries/` | Final MP4s (force-added; GitHub's hard limit is 100 MB per file) | — |

Each project has its own `README.md`. Upload projects also have an `UPLOAD.md` with title, description, chapters, tags,
pinned comment, end screen and thumbnails.

## 2. Local setup

```bash
# from the repo root
pip install -r requirements.txt   # numpy scipy soundfile pyloudnorm librosa
cp .env.example .env              # then put the ElevenLabs key after XI_KEY=
# ffmpeg 6+ must be on PATH
cd prophet && npm i               # each project has a package.json (hyperframes, gsap, playwright)
npx playwright install chromium   # or set CHROME_PATH in .env to an existing Chrome/Chromium
```

`npm run build`, `npm run score`, `npm run render`, `npm run lint` and `npm run audit` wrap the main steps. A
HyperFrames 0.8.8x render takes about 2.4 s per second of video with 3 workers on the cloud box, and is faster on a
strong local machine. The `.env` file is gitignored; the voice scripts read `XI_KEY` from it, and the Playwright tools
read `CHROME_PATH`.

## 3. The pipeline (prophet/ as the template)

```
tools/script.py      script → timing block in index.html (scenes, lines, pacing overrides) + SCRIPT.md
tools/direction.py   theatrical performance script: each line with inline [audio tags] for Eleven v4
tools/vo.py          ElevenLabs /with-timestamps → assets/vo/<ID>.wav + <ID>.words.json (word timings)
tools/scaffold.py    rebuilds index.html scene containers + script tags, then runs bake.py
tools/bake.py        measures real take lengths → scene data-start/duration, <audio> VO tags, total
scenes/c0–c6.js      the motion design: SC[id] per scene, SCX[id] extras layered on top
shared/rt.js         runtime: layout (mirror of bake.py), GSAP timeline, cue list, helpers
shared/kit.js        component kit: world canvas (bokeh/rain/drops), phone, mail, charts, HUD, silhouettes,
                     dots engine, chapter cards, type-on, word reveals, slam, glitch
tools/cues.mjs       exports the SFX cue list from the page → assets/audio/cues.json
tools/score.py       synthesized score + SFX (audiokit.py), ducked under narration → music.wav, sfx.wav
(render)             npx hyperframes render …
tools/master.py      mix VO + music + SFX, limiter, −14 LUFS / −1.5 dBTP, encode (VKBPS=… two-pass budget)
tools/srt.py         captions from word timings → renders/*.srt (copy to captions/)
tools/thumbs.mjs     thumbnails from thumbs.html → thumbnails/thumb_A|B|C.png (1280×720)
```

Full rebuild order after changing words or takes:
```bash
python3 tools/script.py && python3 tools/vo.py --force <IDs> && python3 tools/scaffold.py
node tools/cues.mjs && python3 tools/score.py
npx hyperframes render . -f 30 -q standard -w 3 -o renders/raw.mp4
VKBPS=1060 python3 tools/master.py renders/raw.mp4 ../deliveries/<Name>_1080p.mp4
python3 tools/srt.py && cp renders/*.srt captions/
```

**How sync works.** Every animation beat is placed on a spoken word:
- `WT(R, 'P26', 3)` is the time word 3 of line P26 starts (from the ElevenLabs alignment).
- If a take changes, everything re-times itself on the next scaffold.
- **Never hard-code seconds for a beat that matches narration.**
- Scenes are laid out by `bake.py`/`rt.js`: `start = previous end − xin; VO lines start at lead, gap between lines,
  tail after`.
- Per-scene pauses live in `PACE` in `script.py`. Use them for dramatic beats.

## 4. Voice: Eleven v4, theatrical

- **Model:** `eleven_v4` is the default in `vo.py`; `XI_MODEL=eleven_v3` switches back. The with-timestamps endpoint
  works with v4. It costs the same per character as v3; `eleven_v4_turbo` costs half (use it for tests).
- **Direction:** put every line in `tools/direction.py` with inline tags, for example
  `"[low, steady] Week four said up. It went up. [quietly impressed] Four for four."`.
  - Strip the tags and the line must equal the script text exactly. `vo.py` asserts this and maps the alignment back
    to the words.
  - Use character voices for quoted lines: `[as Maya, worried but firm]`, `[shaken, whispering, as Daniel]`.
  - Use non-verbals: `[chuckles]`, `[exhales]`, `[whispers]`.
  - A line whispered all the way through is mixed 2.5 dB lower on purpose.
- **Keep sound effects out of the narration.** The score and SFX bus handle them, so they can be ducked and timed.
- **Pitch anchoring (important):** this voice's library profile is "an ecstatic, happy young man". Tags like
  *excited, proud, glowing, impressed, thrilled* push v4 **7–11 semitones high**, and it stops sounding like the
  same narrator.
  - Anchor energetic lines with *"low, steady…", "low, warm, quietly proud", "low, stunned, a grin in the voice"*.
  - After every pass, run the pitch QA: median F0 per line against the narrator median (about 131 Hz on v4). Flag
    anything more than 3 semitones off, except character lines.
  - Re-take flagged lines 2–3 times and keep the one closest to the range. Re-direct if every take is off.
- **Stage before swapping:** `VO_DIR=assets/vo_v4 python3 tools/vo.py`, run QA, then copy over. A failed or partial
  pass never breaks the shipped version.
- **Credits:** about 1 credit per character, tags included. A 10-minute script is about 10k characters, roughly 13k
  credits with retakes.
  - The key has its **own** credit cap, separate from the account balance. A `quota_exceeded` error naming the key
    means the owner must raise that key's limit (ElevenLabs → Developers → API Keys).
  - Fallback when out of credits: `tools/typed.py` (typed on-screen confession for `*.PLACEHOLDER` lines).
- **Ideas for next time:**
  - For a Professional Voice Clone, ask the voice owner to enable or fine-tune it for v4. That should remove the
    pitch drift.
  - Try **Text to Dialogue** to give story characters their own voices while Tim narrates.

## 5. The script formula (what makes these work)

1. **0–5 s: the impossible claim.** Lead with the most shocking true-sounding fact, as a statement rather than a
   question. *"Every Monday at exactly 6 a.m., Daniel got an email from someone he'd never met… The sender was never
   wrong. Not once. Ten weeks in a row."*
2. **5–30 s: stakes, plus an open loop.**
   - Make it personal: *"a wife, a mortgage, a daughter about to start college."*
   - Promise the payoff: *"by the end of this, you'll know exactly how it worked."*
   - Plant the twist so it looks innocent: *"Nobody knows who sent those emails."*
3. **Humanize early.** Give each character small, specific, true-feeling details: *"He always reads things twice." "A
   tab called Lily."* Viewers stay for people, not facts.
4. **Escalate in steps.** Each chapter raises the stakes ($500 → $2k → $10k), and every step has a visible counter
   (the streak HUD, the odds). Close every chapter with a re-hook line.
5. **The near-miss.** Around 60% in, the pattern almost breaks (Week 9). This is the emotional peak before the
   reveal.
6. **Twist 1, the mechanism (about 60–75%).** Rewind and reframe everything (10,240 people, halved weekly). Show the
   math visually; this is the "aha" people share.
7. **Real-world anchor.** Name the real sources (Ellenberg, Derren Brown, FTC $5.7B). Credibility turns a story into
   a documentary.
8. **Twist 2, the identity (last 60 s).** Recontextualize the narrator. Pay off the planted clues by name ("How do you
   think I know he reads everything twice?").
9. **The callback button.** End on a 3–4 word line aimed at the viewer (*"Check your inbox."*), then the end screen.
10. **Craft rules:**
    - Short sentences, written for the ear.
    - One idea per line.
    - Numbers are spoken as words in the script, so the voice reads them right.
    - A re-hook every 60–90 s.
    - No filler intros. No "in this video".
    - Disclose fiction at the end: *"Daniel is fictional. The math, and the scam, are real."*

Long-form: 8–11 min (past 8 min unlocks mid-roll ads), with 8–10 chapters. Shorts: 35–55 s, hook in the first second,
and a loop-back ending.

## 6. Visual standards ("Inbox Noir" and the polish bar)

- **Palette tokens** (`show.css :root`):
  - night `#04060c`, navy `#0a1120`;
  - amber `#ffb347`, green `#3dff9a`, red `#ff3b4f`, violet `#9b7bff` (the sender);
  - cold text `#e8eefc`, mute `#8390b5`.
- **Fonts:** Anton for kinetic headlines, Instrument Serif italic for intimate lines, Space Grotesk for the UI, and
  JetBrains Mono for numbers.
- **Illustrate the narration.** Whatever is being said should be happening on screen. *"He scheduled trucks"* means
  a dispatch board with trucks moving.
- **People** are rim-lit SVG silhouettes with a breathing tween, so the story stays character-driven.
- **Never let the frame sit still.** A visible beat at least every 1 s:
  - `tools/beat_audit.mjs` lists gaps longer than 1 s;
  - the scaffold adds one steady camera push per quiet gap.
- **Things that caused flicker or "flutter" before (don't reintroduce them):**
  - alternating scale pumps or transform-origin swaps every second;
  - colors that snap instead of blending;
  - "micro-glitch" effects;
  - particles that teleport when they loop (fade them instead);
  - two tweens overlapping on the same property (cap the return tween);
  - counters with no explicit `tl.set` at scene start;
  - labels hidden behind a later layer.
- **Physical objects land physically.** The coin lands face-up with a bounce and a contact shadow, never edge-on.
- **Chapter cards** sit at each chapter start, with a 2.0 s lead (`script.py` sets this).

## 7. QA gates (all of them, every render)

1. `npx hyperframes lint`: zero errors. The roughly 57 "nested_structure" warnings are expected.
2. `node tools/beat_audit.mjs`: no gaps over 1 s except deliberate holds.
3. `node tools/snap.mjs <out> t1 t2 …`: screenshot every scene and look at them (overlaps, clipped text, wrapping
   labels).
4. **Flicker scan on the render:** downscale to gray. Flag frames that differ from both neighbours while the
   neighbours match each other. A designed white flash is fine; confirm by checking for a brightness ramp and decay.
5. **Stillness scan:** flag runs over 1.5 s with a per-frame difference below 0.15. Confirm that slow pushes are
   actually moving.
6. **Voice QA** (section 4): pitch, pace (words per second), cut-offs (`clean/N` in the `vo.py` output), alignment
   order.
7. **Master:** −14.0 LUFS integrated, peak −1 dBTP on the WAV.

## 8. Delivery and packaging

- **Encode:** `master.py` uses CRF 18 by default (best quality, large file). For GitHub, use
  `VKBPS = (95 MB × 8 / seconds) − 170` with a two-pass encode; for 10:17 that's 1060. Locally, upload the CRF 18
  master to YouTube directly for the best quality, and keep the compressed copy in git.
- **Captions:** `captions/<Name>.en.srt` (word-synced). Upload them as English subtitles.
- **Thumbnails:** three variants for YouTube "Test & compare".
  - Use two or three words at most, one huge number, one face or silhouette, high contrast, and no clutter.
  - Each variant sells a different angle: the streak, the money, the reveal.
- **UPLOAD.md** holds:
  - a main title plus two alternates (curiosity gap + specific number + stakes, under 70 characters);
  - the description, with the hook paragraph, chapters, sources, the fiction disclaimer and 5–6 hashtags;
  - 15 tags;
  - a pinned comment asking a question;
  - the end screen (two video slots and Subscribe over the built-in "WATCH NEXT" boxes).
- **Handoff to the owner or ChatGPT:** one copyable block with file paths, title, description, chapters, tags,
  thumbnail descriptions, pinned comment, end screen and settings (Private, not made for kids, Education).

## 9. Make the next one better

- **Hook harder in the first 2 seconds:** start on motion and a number on screen, before the first word lands.
- **Pattern interrupts every 5–8 s:** camera move, scale change, color shift or sound hit. The beat audit catches
  silence; also check for sameness.
- **Character voices with Text to Dialogue (v4)** for quoted lines; Tim stays the narrator.
- **Sound design per scene:**
  - room tone (rain, office hum, car interior);
  - a heartbeat under the tension peaks;
  - silence before the twist.
- **Retention checkpoints:** at 30 s, 50%, and just before the twist, put a line that makes leaving feel like
  missing out.
- **Topic selection:** true or true-adjacent stories with a mechanism twist (scams, heists, gambling edges,
  probability paradoxes). They match what already worked (Vegas shoe computer, Monty Hall, 0.999…).
- **Shorts from every long-form:** cut a 45 s vertical teaser from the strongest 10%: the hook plus Twist 1.
