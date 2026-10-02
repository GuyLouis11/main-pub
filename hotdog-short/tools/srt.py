"""Write captions/<Name>.en.srt (YouTube CC) from the narration word timings: cues of <= 42 chars x 2 lines.
  python3 tools/srt.py <Name>"""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
name = sys.argv[1] if len(sys.argv) > 1 else "captions"
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
vo = {m.group(1).upper(): float(m.group(2)) for m in re.finditer(r'<audio id="vo_(\w+)" src="[^"]+" data-start="([\d.]+)"', s)}
fmt = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
cues = []
for vid, v in tim["vo"].items():
    t0, cur = vo[vid], []
    for w in v["words"]:
        cur.append(w)
        txt = " ".join(x[0] for x in cur)
        if len(txt) > 70 or re.search(r"[.?!…]$", w[0]) and len(txt) > 30:
            cues.append((t0 + cur[0][1], t0 + cur[-1][2], txt)); cur = []
    if cur: cues.append((t0 + cur[0][1], t0 + cur[-1][2], " ".join(x[0] for x in cur)))
def wrap(t):
    if len(t) <= 42: return t
    ws = t.split(); best = None
    for i in range(1, len(ws)):
        a, b = " ".join(ws[:i]), " ".join(ws[i:])
        if best is None or max(len(a), len(b)) < best[0]: best = (max(len(a), len(b)), a + "\n" + b)
    return best[1]
out = []
for i, (a, b, t) in enumerate(cues, 1):
    nxt = cues[i][0] if i < len(cues) else b + 2
    out.append(f"{i}\n{fmt(a)} --> {fmt(min(b + .35, nxt - .02))}\n{wrap(t)}\n")
os.makedirs(os.path.join(ROOT, "captions"), exist_ok=True)
p = os.path.join(ROOT, "captions", f"{name}.en.srt")
open(p, "w", encoding="utf-8").write("\n".join(out))
print(len(out), "cues ->", p)
