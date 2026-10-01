"""Typed ending fallback: for lines whose take is a silent placeholder (ElevenLabs quota), write a silent wav
paced for on-screen reading plus synthetic word timings, so scenes, captions and the confession band stay synced.
Re-run tools/vo.py --force <IDs> later to replace them with real narration.
Usage: python3 tools/typed.py"""
import json
import os
import re

import numpy as np
import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
HOLD = {"P93": 1.6}
SR = 48000


def main():
    s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
    for vid, v in tim["vo"].items():
        base = os.path.join(ROOT, "assets", "vo", vid)
        if not os.path.exists(base + ".PLACEHOLDER"):
            continue
        t, ws = .15, []
        for w in v["text"].split():
            d = .24 + .032 * len(w)
            ws.append([w, round(t, 3), round(t + d, 3), False])
            t += d + (.5 if w[-1] in ".?!" else .25 if w[-1] in ",;:" else .04)
        dur = t + HOLD.get(vid, 1.1)
        sf.write(base + ".wav", np.zeros(int(dur * SR), dtype=np.int16), SR, subtype="PCM_16")
        json.dump(ws, open(base + ".words.json", "w"))
        print(f"{vid} {dur:5.2f}s  {len(ws)} words")


if __name__ == "__main__":
    main()
