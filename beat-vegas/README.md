# Guy Wonders Why: "He Beat Vegas With a Computer in His Shoe"

A HyperFrames + GSAP film in six chapters (`ch0` cold open + title, `ch1`–`ch5`), about 5:22.
It uses Casino Noir motion design, the 19 generated source clips (`assets/flow/`), narration in the channel voice
(ElevenLabs v3), and an original synthesized noir-jazz score.

| Path | What |
|---|---|
| `SCRIPT.md` | Research, script v1, open-loop map, verification notes |
| `FLOW_SHOTLIST.md` | Style bible and the OmniFlash shot list (blocked shots were replaced by motion graphics) |
| `tools/narration.py` | **Source of the narration text** and scene structure |
| `tools/src/chN.html` | **Chapter sources** (markup + GSAP timeline). Edit these, not `chN/index.html` |
| `shared/` | Design system (`film.css`), runtime (`film.js`), Casino Noir kit (`noir.js`), fonts, textures |
| `tools/score.py` | Score and sound design per chapter, ducked under the narration |

## Pipeline
```bash
python3 tools/build_chapters.py      # tools/src → chN/index.html (keeps each chapter's timing block)
python3 tools/sync_shared.py         # shared/ and the referenced clips into each chapter
python3 tools/retime_chapters.py     # lay every scene out on the real narration lengths
python3 tools/score.py               # music + sfx per chapter
node tools/beat_audit.mjs ch0 … ch5  # no stretch > 1.5 s without motion
bash tools/render.sh                 # render every chapter and assemble renders/film_*.mp4
XI_KEY=… python3 tools/elevenlabs_vo.py --force N3_05   # regenerate one narration line, then retime + score
```
