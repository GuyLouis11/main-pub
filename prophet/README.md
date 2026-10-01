# THE PROPHET — long-form (1920×1080, about 8:22)

A fictional thriller built on a real scam (the "Baltimore stockbroker"): a stranger predicts the stock market ten Mondays
in a row, then asks for $50,000. Twist 1 (4:41) is the 10,240-person halving. Twist 2 (7:24) is the narrator sending the emails.
Clues for twist 2 are planted at P08, P12, P48 and P75.

Everything is code: the "Inbox Noir" kit (`shared/kit.js`), 50 scenes in 8 chapters (`scenes/c0–c5.js`), and an original
synthesized thriller score with sound design (`tools/score.py`). Narration is eleven_v3 with word timestamps (`tools/vo.py`).

## Build
```
python3 tools/script.py            # script → timing block (keeps measured takes)
XI_KEY=... python3 tools/vo.py     # narration (missing lines only; --force IDs to redo)
python3 tools/fixvo.py             # splices P65/P66 + soft fades on takes whose last word was cut
python3 tools/scaffold.py          # rebuild index.html (scene clips, scripts) + bake timings
node tools/cues.mjs && python3 tools/score.py
node tools/beat_audit.mjs --nocaps && npx hyperframes lint . && npx hyperframes check . --samples 6
npx hyperframes render . -f 30 -q standard -w 3 -o renders/raw.mp4
python3 tools/master.py renders/raw.mp4 renders/The_Prophet.mp4      # -14 LUFS, -1.5 dBFS
python3 tools/srt.py               # renders/The_Prophet.en.srt (copy to captions/)
node tools/thumbs.mjs              # thumbnails/thumb_A|B|C.png
```

## Status
Fully narrated with **Eleven v4** in a theatrical read. `tools/direction.py` holds every line with inline audio tags
(emotion, character voices for quoted lines, whispers), and `vo.py` maps the alignment back to the script words.
Excited directions pushed this voice 7–11 semitones high, so those lines are anchored with "low, steady". After
retakes, every line sits within about ±3 semitones of the narrator's median. Per-scene pauses live in `PACE` in
`tools/script.py`.
To regenerate one line: `XI_KEY=... python3 tools/vo.py --force P26`, or stage takes first with `VO_DIR=...`.
Fallback if narration is ever unavailable: `tools/typed.py` (typed on-screen confession for `*.PLACEHOLDER` lines).
