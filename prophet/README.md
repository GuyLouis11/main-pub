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
The ending (P86, P87, P89–P93) has no narration because the ElevenLabs key hit its 100,000-credit limit. Those lines
play as a **typed confession**: the words appear on screen as if the sender is typing them (`confess()` in
`scenes/c6.js`). `tools/typed.py` writes silent takes paced for reading plus matching word timings, so the scenes and
captions stay in sync. P88 ("That isn't quite true.") is voiced.
To voice the ending later: `XI_KEY=... python3 tools/vo.py --force P86 P87 P89 P90 P91 P92 P93`, delete the
matching `assets/vo/*.PLACEHOLDER` files, then run scaffold → cues → score → render → master → srt. The band hides
itself on voiced lines.
