"""Narration for a Short: Eleven v4 takes per line (reusing prophet/tools/vo.py), pitch QA, then one narration track
plus a word-level timeline that drives every animation and the score.

  python3 tools/vo.py monopoly            # generate missing lines, QA, build timeline
  python3 tools/vo.py monopoly --force L03 L07
  python3 tools/vo.py monopoly --timeline # rebuild timeline only

Writes public/<short>/vo/Lxx.wav + .words.json, public/<short>/narration.wav, public/<short>/timeline.json.
XI_KEY comes from the environment or a gitignored .env (prophet vo.env_key)."""
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
sys.path.insert(0, os.path.join(ROOT, "..", "prophet", "tools"))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import vo as P  # noqa: E402  (prophet engine: take(), tokens(), performance(), env_key(), SR, LUFS)

SR = P.SR
LEAD, TAIL = 0.35, 1.6          # silence before the first line / after the last
MAXP = 0.26                     # longest pause kept inside a take (v4 leaves long theatrical gaps; Shorts need pace)
HEAD = 0.10                     # silence kept before a take's first word
TEMPO = {"monopoly": 1.15, "newcoke": 1.16}   # pitch-preserving speed-up (rubberband), applied to the whole track


def tighten(x, ws):
    """shorten pauses between words to MAXP (cut from the middle of the gap, 12 ms crossfades); returns audio, words"""
    cuts = []                                                    # (start_sample, end_sample) to remove
    if ws[0][1] > HEAD:
        cuts.append((0, int((ws[0][1] - HEAD) * SR)))
    for a, b in zip(ws, ws[1:]):
        gap = b[1] - a[2]
        if gap > MAXP:
            mid = (a[2] + b[1]) / 2
            cuts.append((int((mid - (gap - MAXP) / 2) * SR), int((mid + (gap - MAXP) / 2) * SR)))
    f = int(SR * .012)
    out, pos, removed, nws = [], 0, [], [list(w) for w in ws]
    for c0, c1 in cuts:
        seg = x[pos:c0].copy()
        if out and len(seg) > f:
            seg[:f] *= np.linspace(0, 1, f)
        if len(seg) > f:
            seg[-f:] *= np.linspace(1, 0, f)
        out.append(seg); pos = c1; removed.append((c0 / SR, (c1 - c0) / SR))
    seg = x[pos:].copy()
    if out and len(seg) > f:
        seg[:f] *= np.linspace(0, 1, f)
    out.append(seg)
    for w in nws:
        sh = sum(d for t0, d in removed if t0 < w[1])
        w[1] = round(w[1] - sh, 3); w[2] = round(w[2] - sh, 3)
    return np.concatenate(out), nws


def stretch(y, tempo):
    import subprocess
    p = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                        "-af", f"rubberband=tempo={tempo}:transients=smooth:formant=preserved", "-f", "f32le", "pipe:1"],
                       input=y.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).astype(np.float64)


def median_f0(x):
    import librosa
    y = librosa.resample(x, orig_sr=SR, target_sr=16000)
    f, _, _ = librosa.pyin(y, fmin=60, fmax=500, sr=16000, frame_length=1024)
    f = f[~np.isnan(f)]
    return float(np.median(f)) if len(f) else 0.0


def generate(short, lines, force, only):
    import pyloudnorm as pyln
    key = P.env_key()
    out = os.path.join(ROOT, "public", short, "vo")
    os.makedirs(out, exist_ok=True)
    for lid, text, perf, _ in lines:
        wav = os.path.join(out, lid + ".wav")
        if only and lid not in only:
            continue
        if os.path.exists(wav) and not (force or only):
            continue
        if not key:
            raise SystemExit("set XI_KEY (environment or .env)")
        y, words, rep = P.take(text, key, perf=perf)
        y = pyln.normalize.loudness(y, pyln.Meter(SR).integrated_loudness(y), P.LUFS)
        if np.abs(y).max() > .89:
            y *= .89 / np.abs(y).max()
        sf.write(wav, y, SR, subtype="PCM_16")
        json.dump(words, open(wav[:-4] + ".words.json", "w"), ensure_ascii=False)
        print(f"{lid} {len(y) / SR:5.2f}s {rep}  " + " ".join(f"{w[0]}@{w[1]:.2f}" for w in words))


def qa(short, lines):
    out = os.path.join(ROOT, "public", short, "vo")
    f0 = {lid: median_f0(sf.read(os.path.join(out, lid + ".wav"))[0]) for lid, *_ in lines}
    med = float(np.median([v for v in f0.values() if v]))
    print(f"pitch QA (median {med:.0f} Hz):")
    flagged = []
    for lid, text, *_ in lines:
        st = 12 * np.log2(f0[lid] / med) if f0[lid] else 0
        ws = json.load(open(os.path.join(out, lid + ".words.json")))
        wps = len(ws) / max(ws[-1][2] - ws[0][1], .1)
        mark = "  <-- off" if abs(st) > 3 else ""
        if mark:
            flagged.append(lid)
        print(f"  {lid} {f0[lid]:5.0f} Hz {st:+5.1f} st  {wps:4.2f} w/s{mark}")
    return flagged


def timeline(short, lines, title):
    out = os.path.join(ROOT, "public", short)
    t, parts, tl = LEAD, [np.zeros(int(LEAD * SR))], []
    for i, (lid, text, perf, gap) in enumerate(lines):
        if i:
            t += gap
            parts.append(np.zeros(int(round(gap * SR))))
        x, _ = sf.read(os.path.join(out, "vo", lid + ".wav"))
        ws = json.load(open(os.path.join(out, "vo", lid + ".words.json")))
        x, ws = tighten(x, ws)
        tl.append({"id": lid, "start": round(t, 3), "end": round(t + len(x) / SR, 3), "text": text.replace("*", ""),
                   "words": [{"w": w[0], "s": round(t + w[1], 3), "e": round(t + w[2], 3), "hi": bool(w[3])} for w in ws]})
        parts.append(x)
        t += len(x) / SR
    y = np.concatenate(parts)
    k = TEMPO.get(short, 1.0)
    if k != 1.0:
        y = stretch(y, k)
        for ln in tl:
            ln["start"] = round(ln["start"] / k, 3); ln["end"] = round(ln["end"] / k, 3)
            for w in ln["words"]:
                w["s"] = round(w["s"] / k, 3); w["e"] = round(w["e"] / k, 3)
    y = np.concatenate([y, np.zeros(int(TAIL * SR))])
    sf.write(os.path.join(out, "narration.wav"), y, SR, subtype="PCM_16")
    total = len(y) / SR
    json.dump({"title": title, "fps": 30, "total": round(total, 3), "lines": tl}, open(os.path.join(out, "timeline.json"), "w"), indent=1)
    print(f"timeline: {len(tl)} lines, {total:.2f}s")


def main(argv):
    short = argv[0]
    mod = __import__(short)
    force = "--force" in argv
    only = {a for a in argv[1:] if not a.startswith("--")}
    if "--timeline" not in argv:
        generate(short, mod.LINES, force, only)
        qa(short, mod.LINES)
    timeline(short, mod.LINES, mod.TITLE)


if __name__ == "__main__":
    main(sys.argv[1:])
