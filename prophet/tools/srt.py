"""Write renders/The_Prophet.en.srt (YouTube CC) from the narration word timings: cues of <= 42 chars x 2 lines."""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
vo = {m.group(1).upper(): float(m.group(2)) for m in re.finditer(r'<audio id="vo_(\w+)" src="[^"]+" data-start="([\d.]+)"', s)}
fmt = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round(t % 1 * 1000)) % 1000:03d}"
cues = []
for vid, v in tim["vo"].items():
    t0 = vo[vid]
    ws = v.get("words") or []
    if not ws:   # no timings (placeholder): spread the text over the estimate
        toks = v["text"].split(); d = v.get("dur") or v["estimate"]
        ws = [[w, d * i / len(toks), d * (i + 1) / len(toks), False] for i, w in enumerate(toks)]
    cur = []
    for w in ws:
        cur.append(w)
        txt = " ".join(x[0] for x in cur)
        if len(txt) > 70 or re.search(r"[.?!]$", w[0]) and len(txt) > 30:
            cues.append((t0 + cur[0][1], t0 + cur[-1][2], txt)); cur = []
    if cur: cues.append((t0 + cur[0][1], t0 + cur[-1][2], " ".join(x[0] for x in cur)))
def wrap(t):
    if len(t) <= 42: return t
    ws = t.split(); best = None
    for i in range(1, len(ws)):
        a, b = " ".join(ws[:i]), " ".join(ws[i:])
        sc = max(len(a), len(b))
        if best is None or sc < best[0]: best = (sc, a + "\n" + b)
    return best[1]
out = []
for i, (a, b, t) in enumerate(cues, 1):
    nxt = cues[i][0] if i < len(cues) else b + 2
    out.append(f"{i}\n{fmt(a)} --> {fmt(min(b + .35, nxt - .02))}\n{wrap(t)}\n")
p = os.path.join(ROOT, "renders", "The_Prophet.en.srt")
open(p, "w", encoding="utf-8").write("\n".join(out))
print(len(out), "cues ->", p)
