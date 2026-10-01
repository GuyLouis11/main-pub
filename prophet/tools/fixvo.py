"""Repair narration without new TTS calls (the ElevenLabs key hit its quota):
  * P65/P66: word splices so the halving count uses one convention ("Week N: people left after week N"),
    words taken from other takes of the same voice (P10 "one.", P65 "two.", P66 "three:"/"four:").
  * Takes whose last word is cut by the TTS: a 90 ms raised-cosine fade + 140 ms of silence.
Originals are kept as assets/vo/orig/<ID>.wav (+ .words.json). Idempotent: always starts from the originals."""
import json, os, shutil
import numpy as np, soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
VO = os.path.join(ROOT, "assets", "vo")
ORIG = os.path.join(VO, "orig")
SR = 48000
CUT = ["P17", "P32", "P53", "P72", "P80", "P83", "P07", "P19", "P75"]


def load(i, orig=True):
    base = os.path.join(ORIG if orig else VO, i)
    x, _ = sf.read(base + ".wav")
    return x.astype(np.float64), json.load(open(base + ".words.json"))


def keep_orig(i):
    os.makedirs(ORIG, exist_ok=True)
    for ext in (".wav", ".words.json"):
        if not os.path.exists(os.path.join(ORIG, i + ext)):
            shutil.copy(os.path.join(VO, i + ext), os.path.join(ORIG, i + ext))


def bounds(x, ws, k):
    a = (ws[k - 1][2] + ws[k][1]) / 2 if k > 0 else max(0, ws[k][1] - .03)
    b = (ws[k][2] + ws[k + 1][1]) / 2 if k + 1 < len(ws) else len(x) / SR
    return int(a * SR), int(b * SR)


def splice(x, ws, k, dx, dws, dk, label):
    """replace word k of (x, ws) with word dk of (dx, dws); returns new audio + word list"""
    a, b = bounds(x, ws, k)
    da, db = bounds(dx, dws, dk)
    seg = dx[da:db].copy()
    f = int(SR * .012)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    left, right = x[:a].copy(), x[b:].copy()
    left[-f:] *= np.linspace(1, 0, f); right[:f] *= np.linspace(0, 1, f)
    y = np.concatenate([left, seg, right])
    shift = (len(seg) - (b - a)) / SR
    off = a / SR - da / SR
    nws = []
    for i, w in enumerate(ws):
        if i < k: nws.append(w)
        elif i == k: nws.append([label, round(dws[dk][1] + off, 3), round(dws[dk][2] + off, 3), w[3]])
        else: nws.append([w[0], round(w[1] + shift, 3), round(w[2] + shift, 3), w[3]])
    return y, nws


def write(i, y, ws):
    import pyloudnorm as pyln
    y = pyln.normalize.loudness(y, pyln.Meter(SR).integrated_loudness(y), -17.0)
    if np.abs(y).max() > .89: y *= .89 / np.abs(y).max()
    sf.write(os.path.join(VO, i + ".wav"), y, SR, subtype="PCM_16")
    json.dump(ws, open(os.path.join(VO, i + ".words.json"), "w"), ensure_ascii=False)


def main():
    for i in set(CUT + ["P65", "P66"]): keep_orig(i)
    p10x, p10w = load("P10", orig=False); p65x, p65w = load("P65"); p66x, p66w = load("P66")
    k_one = next(j for j, w in enumerate(p10w) if w[0].lower().startswith("one"))
    # P65: "Week two." -> "Week one."
    y, ws = splice(p65x, p65w, 1, p10x, p10w, k_one, "one.")
    write("P65", y, ws)
    # P66: Week three -> two, Week four -> three, Week five -> four (right to left keeps indices valid)
    y, ws = p66x, p66w
    y, ws = splice(y, ws, 15, p66x, p66w, 9, "four:")
    y, ws = splice(y, ws, 9, p66x, p66w, 1, "three:")
    y, ws = splice(y, ws, 1, p65x, p65w, 1, "two:")
    write("P66", y, ws)
    for i in CUT:
        x, w = load(i)
        n = int(SR * .09)
        x[-n:] *= .5 * (1 + np.cos(np.linspace(0, np.pi, n)))
        write(i, np.concatenate([x, np.zeros(int(SR * .14))]), w)
    print("P65:", " ".join(w[0] for w in json.load(open(os.path.join(VO, "P65.words.json")))))
    print("P66:", " ".join(w[0] for w in json.load(open(os.path.join(VO, "P66.words.json")))))


if __name__ == "__main__":
    main()
