"""Fit the edit around the narration instead of forcing the narration into slots.

Reads the <script id="timing"> block in index.html, measures each VO file in
assets/audio/vo/ (real takes) or falls back to the line's `estimate` (while the
file is a silent placeholder), then:

  1. opens a breathing gap at the line's `insert` point when the line would run
     past its `deadline` (+ `pad` seconds of air), and writes `gaps` back,
  2. bakes data-start / data-duration of every timed element from its
     data-base-* attributes through the same time map the GSAP timeline uses,
  3. regenerates the VO <audio> elements (start = mapped base start),
  4. (re)writes silent placeholders at the estimated length when no real take exists.

Then run `python3 tools/make_audio.py` (score follows the same map and ducks under VO)
and render. Usage:  python3 tools/retime.py
"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
HTML = os.path.join(ROOT, "index.html")
VO_DIR = os.path.join(ROOT, "assets", "audio", "vo")
SR = 48000


def load():
    s = open(HTML, encoding="utf-8").read()
    m = re.search(r'(<script id="timing" type="application/json">\n)(.*?)(\n</script>)', s, re.S)
    return s, m, json.loads(m.group(2))


def time_map(tim):
    shifts = [(at, tim["gaps"].get(k, 0)) for k, at in tim["inserts"].items()] + [tuple(c) for c in tim["cuts"]]
    shifts = [(a, g) for a, g in shifts if g]
    return lambda t: t + sum(g for a, g in shifts if t >= a)


def voice_length(path):
    """Length of a real take (None if missing or silent placeholder)."""
    if not os.path.exists(path):
        return None
    x, sr = sf.read(path, always_2d=True)
    x = x.mean(1)
    if np.abs(x).max() < 1e-4:
        return None
    return len(x) / sr


def main():
    s, m, tim = load()
    pad = tim.get("pad", 0.25)
    tim["gaps"] = {}
    rows = []
    for v in tim["vo"]:
        path = os.path.join(VO_DIR, v["id"] + ".wav")
        real = voice_length(path)
        dur = real if real is not None else v["estimate"]
        v["dur"] = round(dur, 3)
        v["source"] = "take" if real is not None else "ESTIMATE (silent placeholder)"
        over = v["start"] + dur + pad - v["deadline"]
        gap = 0.0
        if over > 0:
            if v["insert"]:
                gap = round(over, 3)
                tim["gaps"][v["insert"]] = gap
            else:
                rows.append(f"  !! {v['id']} runs {over:.2f}s past its deadline and has no breathing point: re-take shorter or move its start")
        if real is None:
            os.makedirs(VO_DIR, exist_ok=True)
            sf.write(path, np.zeros(int(round(dur * SR)), dtype=np.float32), SR, subtype="PCM_16")
        v["_gap"] = gap

    M = time_map(tim)
    total = round(M(tim["baseDuration"]), 3)

    # bake timed elements
    def bake(mt):
        tag = mt.group(0)
        bs = float(re.search(r'data-base-start="([\d.]+)"', tag).group(1))
        bd = float(re.search(r'data-base-duration="([\d.]+)"', tag).group(1))
        st, en = M(bs), M(bs + bd)
        if bs + bd >= tim["baseDuration"] - 1e-6:
            en = total
        tag = re.sub(r'data-start="[\d.]+"', f'data-start="{st:.3f}"', tag, 1)
        tag = re.sub(r'data-duration="[\d.]+"', f'data-duration="{en - st:.3f}"', tag, 1)
        return tag
    s = re.sub(r'<(div|video|audio)\b[^>]*data-base-start="[^"]*"[^>]*>', bake, s, flags=re.S)
    s = re.sub(r'(data-composition-id="main" data-start="0" data-duration=")[\d.]+(")', rf'\g<1>{total:.3f}\2', s)

    # VO elements
    vo_tags = "\n".join(
        f'  <audio id="{v["id"].lower()}" src="assets/audio/vo/{v["id"]}.wav" data-start="{M(v["start"]):.3f}" '
        f'data-duration="{v["dur"] + 0.05:.3f}" data-volume="1" data-track-index="22"></audio>'
        for v in tim["vo"])
    s = re.sub(r'(  <!-- VO:BEGIN[^\n]*-->\n).*?(  <!-- VO:END -->)', lambda mm: mm.group(1) + vo_tags + "\n" + mm.group(2), s, flags=re.S)

    # write timing back (without scratch fields)
    for v in tim["vo"]:
        v.pop("_gap", None)
    block = json.dumps(tim, indent=2, ensure_ascii=False)
    s = re.sub(
        r'(<script id="timing" type="application/json">\n).*?(\n</script>)', lambda mm: mm.group(1) + block + mm.group(2), s, flags=re.S)
    open(HTML, "w", encoding="utf-8").write(s)

    # flow clip media sanity (clips are 8 s; in-point + used length must fit)
    for vid in re.findall(r'<video[^>]*>', s):
        ms = float(re.search(r'data-media-start="([\d.]+)"', vid).group(1))
        du = float(re.search(r'data-duration="([\d.]+)"', vid).group(1))
        if ms + du > 8.0:
            vid_id = re.search(r'id="(\w+)"', vid).group(1)
            rows.append(f"  !! {vid_id} needs {ms + du:.2f}s of source (> 8 s clip)")

    print(f"{'line':6} {'base@':>6} {'final@':>7} {'dur':>5}  source")
    for v in tim["vo"]:
        print(f"{v['id']:6} {v['start']:6.2f} {M(v['start']):7.2f} {v['dur']:5.2f}  {v['source']}")
    print("breathing gaps:", tim["gaps"] or "none")
    print(f"total duration: {total:.2f} s")
    for r in rows:
        print(r)
    return 0


if __name__ == "__main__":
    sys.exit(main())
