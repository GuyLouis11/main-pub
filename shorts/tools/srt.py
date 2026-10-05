"""English .srt captions from the word timeline: python3 tools/srt.py monopoly → captions/monopoly.en.srt"""
import json
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def ts(x):
    h, r = divmod(max(0, x), 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"


def main(short):
    tl = json.load(open(os.path.join(ROOT, "public", short, "timeline.json")))
    cues, cur = [], []
    for ln in tl["lines"]:
        for i, w in enumerate(ln["words"]):
            cur.append(w)
            text = " ".join(x["w"] for x in cur)
            end = w["w"][-1] in ".?!" or i == len(ln["words"]) - 1
            if end or len(text) > 34:
                cues.append((cur[0]["s"], cur[-1]["e"] + 0.15, text))
                cur = []
    os.makedirs(os.path.join(ROOT, "captions"), exist_ok=True)
    out = os.path.join(ROOT, "captions", f"{short}.en.srt")
    with open(out, "w") as f:
        for n, (a, b, text) in enumerate(cues, 1):
            nxt = cues[n][0] if n < len(cues) else b
            f.write(f"{n}\n{ts(a)} --> {ts(min(b, nxt - 0.01))}\n{text}\n\n")
    print(len(cues), "cues ->", out)


if __name__ == "__main__":
    main(sys.argv[1])
