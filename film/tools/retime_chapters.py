"""Lay out every chapter around its narration (mirror of shared/film.js).

For each chN/index.html:
  * reads <script id="timing">, measures assets/vo/<ID>.wav (real take) or uses `estimate`
    (and (re)writes a silent placeholder of that length),
  * computes scene/VO times with the same rule as film.js,
  * bakes data-start/data-duration of every [data-scene] element (optionally offset by
    data-at="voId|+sec" / data-len), the VO <audio> tags, and the root duration,
  * keeps Flow clips inside their reviewed usable window (data-usable-in/out),
  * writes TIMELINE.md: the narration-to-scene map for the whole film.

Usage: python3 tools/retime_chapters.py [ch3 ch5 ...]
"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR = 48000
OPENING_SECONDS_FALLBACK = 33.35


def take_len(path):
    if not os.path.exists(path):
        return None
    x, sr = sf.read(path, always_2d=True)
    if np.abs(x).max() < 1e-4:
        return None
    return len(x) / sr


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


def process(ch):
    html_path = os.path.join(ROOT, ch, "index.html")
    s = open(html_path, encoding="utf-8").read()
    m = re.search(r'(<script id="timing" type="application/json">\n)(.*?)(\n</script>)', s, re.S)
    tim = json.loads(m.group(2))
    notes = []
    vo_dir = os.path.join(ROOT, ch, "assets", "vo")
    os.makedirs(vo_dir, exist_ok=True)
    for vid, v in tim["vo"].items():
        path = os.path.join(vo_dir, vid + ".wav")
        real = take_len(path)
        if real is None:
            v.pop("dur", None)
            v["source"] = "estimate"
            sf.write(path, np.zeros(int(round(v["estimate"] * SR)), dtype=np.float32), SR, subtype="PCM_16")
        else:
            v["dur"] = round(real, 3)
            v["source"] = "take"
    scenes, vo, total = layout(tim)

    def bake(mt):
        tag = mt.group(0)
        sid = re.search(r'data-scene="([^"]+)"', tag).group(1)
        st, du = scenes[sid]
        at = re.search(r'data-at="([^"]+)"', tag)
        if at:
            spec = at.group(1)
            if "|" in spec:
                ref, off = spec.split("|")
                base = vo[ref][0] if ref in vo else scenes[ref][0]
                st2 = base + float(off)
            else:
                st2 = st + float(spec)
            ln = re.search(r'data-len="([\d.]+)"', tag)
            du = float(ln.group(1)) if ln else (st + du - st2)
            du = min(du, st + scenes[sid][1] - st2)
            st = st2
        tag = re.sub(r'data-start="[\d.]*"', f'data-start="{st:.3f}"', tag, 1)
        tag = re.sub(r'data-duration="[\d.]*"', f'data-duration="{du:.3f}"', tag, 1)
        return tag
    s = re.sub(r'<(div|video|audio|section)\b[^>]*data-scene="[^"]*"[^>]*>', bake, s, flags=re.S)
    s = re.sub(r'(<div id="root"[^>]*data-duration=")[\d.]*(")', rf'\g<1>{total:.3f}\2', s)
    s = re.sub(r'(<audio id="(?:music|sfx)"[^>]*data-duration=")[\d.]*(")', rf'\g<1>{total:.3f}\2', s)

    vo_tags = "\n".join(
        f'  <audio id="vo_{vid.lower()}" src="assets/vo/{vid}.wav" data-start="{vo[vid][0]:.3f}" '
        f'data-duration="{vo[vid][1]:.3f}" data-volume="1" data-track-index="22"></audio>' for vid in vo)
    s = re.sub(r'(  <!-- VO:BEGIN[^\n]*-->\n).*?(  <!-- VO:END -->)', lambda mm: mm.group(1) + vo_tags + "\n" + mm.group(2), s, flags=re.S)

    def fit_media(mv):
        vid = mv.group(0)
        if "data-media-start" not in vid:
            return vid
        du = float(re.search(r'data-duration="([\d.]+)"', vid).group(1))
        rate = re.search(r'data-playback-rate="([\d.]+)"', vid)
        du *= float(rate.group(1)) if rate else 1.0          # source seconds actually consumed
        ms = float(re.search(r'data-media-start="([\d.]+)"', vid).group(1))
        mi = re.search(r'data-usable-in="([\d.]+)"', vid)
        lo = float(mi.group(1)) if mi else 0.0
        hi = float(re.search(r'data-usable-out="([\d.]+)"', vid).group(1)) if re.search(r'data-usable-out', vid) else 8.0
        name = re.search(r'src="[^"]*/([^"/]+)"', vid).group(1)
        if ms + du > hi + 1e-6:
            new_ms = max(lo, hi - du)
            if new_ms + du > hi + 1e-6:
                notes.append(f"!! {name}: slot {du:.2f}s > usable window {hi - lo:.2f}s ({lo}-{hi}); the slot outlasts good footage")
            vid = re.sub(r'data-media-start="[\d.]+"', f'data-media-start="{new_ms:.2f}"', vid, 1)
        return vid
    s = re.sub(r'<video[^>]*>', fit_media, s, flags=re.S)

    s = s[: m.start(2)] + json.dumps(tim, indent=2, ensure_ascii=False) + s[m.end(2):]
    open(html_path, "w", encoding="utf-8").write(s)
    return tim, scenes, vo, total, notes, s


def fmt(t):
    return f"{int(t // 60)}:{t % 60:05.2f}"


def main(argv):
    chapters = argv or sorted(d for d in os.listdir(ROOT) if re.fullmatch(r"ch\d", d) and os.path.exists(os.path.join(ROOT, d, "index.html")))
    op = OPENING_SECONDS_FALLBACK
    try:
        oh = open(os.path.join(ROOT, "..", "hot-water-opening", "index.html"), encoding="utf-8").read()
        op = float(re.search(r'data-composition-id="main" data-start="0" data-duration="([\d.]+)"', oh).group(1))
    except Exception:
        pass
    lines = ["# Full-film timeline: narration-to-scene map", "",
             "Generated by `tools/retime_chapters.py` from each chapter's timing block. **Real VO lengths drive every time below.** Lines marked *est.* still use estimated lengths.",
             "", f"Opening (milestone 1, `hot-water-opening/`): 0:00.00–{fmt(op)}", ""]
    film_t = op
    all_ch = sorted(d for d in os.listdir(ROOT) if re.fullmatch(r"ch\d", d) and os.path.exists(os.path.join(ROOT, d, "index.html")))
    for ch in all_ch:
        if ch in chapters:
            tim, scenes, vo, total, notes, s = process(ch)
        else:
            s = open(os.path.join(ROOT, ch, "index.html"), encoding="utf-8").read()
            tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
            scenes, vo, total = layout(tim)
            notes = []
        print(f"{ch}: {total:6.2f}s  scenes={len(scenes)}  vo={len(vo)} ({sum(1 for v in tim['vo'].values() if v.get('source') == 'take')} real takes)")
        for n in notes:
            print("   ", n)
        lines += [f"## {ch.upper()} · {tim['title']}  ({fmt(film_t)}–{fmt(film_t + total)} in film, {total:.1f}s)", "",
                  "| Film time | Scene | Narration | Picture | Flow clip (usable in–out) | Refs | Transition out |",
                  "|---|---|---|---|---|---|---|"]
        for sc in tim["scenes"]:
            st, du = scenes[sc["id"]]
            vtxt = "<br>".join(f"**{v}** {'' if tim['vo'][v].get('source') == 'take' else '*est.* '}{fmt(film_t + vo[v][0])} “{tim['vo'][v]['text']}”" for v in sc.get("vo", [])) or "—"
            fl = sc.get("flow")
            ftxt = "—"
            if fl:
                ftxt = f"`{fl['file']}` {fl.get('in', 0):.2f}–{fl.get('out', 8):.2f}s · {fl.get('status', 'PENDING')}"
            lines.append(f"| {fmt(film_t + st)}–{fmt(film_t + st + du)} | {sc['id']} | {vtxt} | {sc.get('md', '')} | {ftxt} | {', '.join(fl.get('refs', [])) if fl else '—'} | {sc.get('out', '')} |")
        lines.append("")
        film_t += total
    lines.insert(4, f"**Estimated film length: {fmt(film_t)}**")
    open(os.path.join(ROOT, "TIMELINE.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print(f"film total ≈ {fmt(film_t)}")


if __name__ == "__main__":
    main(sys.argv[1:])
