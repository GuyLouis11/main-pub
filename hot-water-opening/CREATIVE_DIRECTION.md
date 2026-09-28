# Guy Wonders Why — "The Boy Who Froze Hot Water"

*Creative proposal by Claude (creative lead). This is a proposal, not a brief handed down to me.*

## The premise in one breath
In 1963 a 13-year-old in Tanganyika (now Tanzania) put hot ice-cream mix in a freezer and it froze **before** the cold mix. His teacher told him he was confused. He kept asking. Sixty years later that "confused" observation carries his name, the **Mpemba effect**, and it became a real branch of physics, just not in the way anyone expected.

## Why this story and not another
- **An impossible action you understand instantly.** Two cups, one hot and one cold, and the hot one wins. No setup, no jargon, and a four-year-old gets the stakes.
- **A human spine.** A kid, a dismissive authority, someone who persists, and a visiting physicist (Denis Osborne) who took him seriously. The underdog here is literal: the hot cup starts *behind*.
- **Escalating questions with real payoffs.** Each answer opens a stranger question, and the ending is a genuine scientific resolution, not a shrug.
- **It's ideal for motion design.** Temperature curves, races, energy landscapes and crystal growth are native motion-graphics material. Flow shots handle the human moments.

**Assumption I'm challenging:** "Does hot water freeze faster?" is the usual clickbait framing. The more honest and more surprising story is that **for plain water, it's contested and may be a measurement artifact. Physicists then proved that hot systems really *can* cool faster, and the reason isn't any of the ones people argued about for 60 years.** The film earns its payoff by *not* overselling the kitchen trick.

## The full-story payoff (known before building the opening)
1. **Cold open (this build, 0:00–0:30).** The race. Hot beats cold. The kid. The teacher's verdict. It wasn't only him: Aristotle and Descartes noticed it too. "The real answer? Stranger than anyone guessed." Then the title.
2. **The kid (Act 1).** Magamba, cookery class, the crowded freezer. He keeps testing with water in secondary school. Physicist Denis Osborne visits and Mpemba asks the question in public. Osborne has it tested, and it reproduces. They publish together in *Physics Education* (1969).
3. **Why it "can't" happen (Act 2).** The graph from the opening becomes the film's instrument: *to freeze, the hot cup has to pass through the cold cup's starting point.* So any win means the hot water is **not the same water** by then. Each classic explanation becomes a "race modifier" we test on the graph: evaporation (less mass), dissolved gas, convection, frost insulating the cold cup, and supercooling roulette.
4. **The low point (Act 3).** Careful experiments (e.g., Burridge & Linden, 2016) find no robust effect in pure water. A thermometer moved by a centimetre can manufacture one. Maybe the teacher was right?
5. **The twist (Act 4).** Temperature isn't the whole description of a hot system. Out of equilibrium, *how* the energy is arranged matters, and a hotter start can sit on a **shortcut** to the cold state. Lu & Raz (2017) predicted it. Kumar & Bechhoefer (*Nature*, 2020) cooled a tiny glass bead in a laser-shaped landscape and saw hotter starts cool **exponentially faster**. Trapped-ion experiments in 2024 showed quantum versions.
6. **Payoff.** Physics now names a whole family of effects after him, and the opening's race is replayed with the shortcut drawn in. Final beat: *his teacher's answer was that he was confused; physics' answer is that he had asked the right question.*

> Facts to re-verify before the script locks, with sources for the full film: Osborne's visit year (1968/69), the 1969 paper title, the 2012 RSC competition entry count, Mpemba's later career and whether/when he died. I used none of these in the opening. See `QA.md`.

## Visual approach: "thermal noir"
- **Two temperatures, two colours, never mixed casually.** Ember `#FF6A2B` means hot and frost `#8FE3FF` means cold on near-black ink `#06080C`. When hot freezes, the colour itself turns cold. That's the title treatment, the cup, the graph and the finish label.
- **Two worlds, one grammar.** *Now* is a dark instrument panel (HUD, readouts, graphs). *1963* is an exercise book: cream paper, ruled lines and handwriting, with the teacher's red pen playing the ember role. Flow footage lives inside the notebook as taped photographs, so a generated shot is always *framed* and never a style clash.
- **Motion carries the logic, not decoration.** The race track physically swings up to become the graph's temperature axis, so the viewer never loses track of what the numbers mean. The finish point cracks, and the dark "now" shatters into 1963.
- **Type:** Big Shoulders Display (condensed, industrial, used for punches and the title), JetBrains Mono (instrument readouts), Instrument Serif italic (human names, people), Caveat (handwriting). All are OFL and local in `assets/fonts/`.
- **Mix:** about 70% motion design and 30% Flow in the opening. The full film targets roughly 65/35, with Flow reserved for moments with people in them.

## Sound approach
- **An original synthesized score.** No licensing, and every hit is placed on a story beat, not a beat grid. The race is a clock pulse with sub hits and a rising pad. **The freeze cuts the music dead** so "The hot one freezes first" lands in silence with only ice crackle. The graph is a building plucked ostinato that lands a hit on "wins". 1963 is a warm lamellophone-like tine motif. **A tape-stop** takes the music out under the teacher's quote, leaving only room tone and the red pen scratching. The rewind is tape warble with ticking backwards, and the title is a boom and glass-bell chord while frost crackles over "HOT".
- **VO style.** ElevenLabs voice `apOzcbHULxCnvWfHPd41` at normal speed with short, punchy lines. On-screen type never repeats the VO; it only adds data, labels and the quote.
