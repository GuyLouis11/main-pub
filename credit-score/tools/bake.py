"""Bake narration into index.html: real take lengths + word timestamps into the timing block, scene
data-start/data-duration, VO <audio> tags and the root/music/sfx durations. Layout rule = shared/rt.js:

  scene.start = cursor - xin ; voStart = start + lead + sum(dur) + gap*i ; dur = max(min, lead+sum+gaps+tail)

Usage: python3 tools/bake.py"""
import json
import os
import re

import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def layout(tim):
    d = tim["defaults"]
    scenes, vo, cursor = {}, {}, 0.0
    for sc in tim["scenes"]:
        lead, gap, tail = sc.get("lead", d["lead"]), sc.get("gap", d["gap"]), sc.get("tail", d["tail"])
        start = max(0.0, cursor - sc.get("xin", 0))
        t = start + lead
        for i, vid in enumerate(sc.get("vo", [])):
            if i:
                t += gap
            du = float(tim["vo"][vid].get("dur") or tim["vo"][vid]["estimate"])
            vo[vid] = (t, du)
            t += du
        content = (t - start) + tail if sc.get("vo") else 0.0
        dur = max(sc.get("min", 0), content)
        scenes[sc["id"]] = (start, dur)
        cursor = start + dur
    return scenes, vo, cursor


def main():
    p = os.path.join(ROOT, "index.html")
    s = open(p, encoding="utf-8").read()
    m = re.search(r'(<script id="timing" type="application/json">\n)(.*?)(\n</script>)', s, re.S)
    tim = json.loads(m.group(2))
    for vid, v in tim["vo"].items():
        wav = os.path.join(ROOT, "assets", "vo", vid + ".wav")
        if os.path.exists(wav):
            v["dur"] = round(sf.info(wav).duration, 3)
            v["words"] = json.load(open(wav[:-4] + ".words.json", encoding="utf-8"))
    scenes, vo, total = layout(tim)
    tim["total"] = round(total, 3)

    def bake(mt):
        tag = mt.group(0)
        st, du = scenes[re.search(r'data-scene="([^"]+)"', tag).group(1)]
        tag = re.sub(r'data-start="[\d.]*"', f'data-start="{st:.3f}"', tag, 1)
        return re.sub(r'data-duration="[\d.]*"', f'data-duration="{du:.3f}"', tag, 1)
    s = re.sub(r'<(div|section)\b[^>]*data-scene="[^"]*"[^>]*>', bake, s, flags=re.S)
    s = re.sub(r'(<div id="root"[^>]*data-duration=")[\d.]*(")', rf'\g<1>{total:.3f}\2', s)
    s = re.sub(r'(<audio id="(?:music|sfx)"[^>]*data-duration=")[\d.]*(")', rf'\g<1>{total:.3f}\2', s)
    tags = "\n".join(f'  <audio id="vo_{vid.lower()}" src="assets/vo/{vid}.wav" data-start="{vo[vid][0]:.3f}" '
                     f'data-duration="{vo[vid][1]:.3f}" data-volume="1" data-track-index="22"></audio>' for vid in vo)
    s = re.sub(r'(  <!-- VO:BEGIN[^\n]*-->\n).*?(  <!-- VO:END -->)', lambda mm: mm.group(1) + tags + "\n" + mm.group(2), s, flags=re.S)
    m = re.search(r'(<script id="timing" type="application/json">\n)(.*?)(\n</script>)', s, re.S)
    s = s[:m.start(2)] + json.dumps(tim, indent=1, ensure_ascii=False) + s[m.end(2):]
    open(p, "w", encoding="utf-8").write(s)
    for sc in tim["scenes"]:
        st, du = scenes[sc["id"]]
        print(f"{sc['id']:8} {st:6.2f}–{st + du:6.2f}  " + " ".join(f"{v}@{vo[v][0]:.2f}+{vo[v][1]:.2f}" for v in sc["vo"]))
    print(f"total {total:.2f}s")


if __name__ == "__main__":
    main()
