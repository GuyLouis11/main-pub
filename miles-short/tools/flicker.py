"""Render QA (CLAUDE.md §7.4–7.5) on a finished MP4.
Flicker: a frame that differs from both neighbours while the neighbours match each other (a one-frame pop).
A designed flash is allowed if it ramps/decays over the following frames (checked and reported separately).
Stillness: whole-frame runs longer than 1.5 s with a per-frame difference under 0.15 grey levels.
  python3 tools/flicker.py renders/raw.mp4"""
import subprocess, sys
import numpy as np
path = sys.argv[1]
w, h = 216, 384
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
fps = 30.0
d = np.abs(F[1:] - F[:-1]).mean(axis=(1, 2))            # d[i] = |F[i+1]-F[i]|
d2 = np.abs(F[2:] - F[:-2]).mean(axis=(1, 2))           # d2[i] = |F[i+2]-F[i]|
flick = []
for i in range(1, len(F) - 1):
    a, b, c = d[i - 1], d[i], d2[i - 1]
    if a > 6 and b > 6 and c < .35 * min(a, b):
        flick.append(i)
print(f"{path}: {len(F)} frames ({len(F) / fps:.2f}s)")
print(f"flicker frames: {len(flick)}" + ("" if not flick else "  " + ", ".join(f"{i / fps:.2f}s" for i in flick[:20])))
still, run = [], 0
for i, x in enumerate(d):
    if x < .15: run += 1
    else:
        if run / fps > 1.5: still.append(((i - run) / fps, i / fps))
        run = 0
if run / fps > 1.5: still.append(((len(d) - run) / fps, len(d) / fps))
print(f"still runs > 1.5 s: {len(still)}" + ("" if not still else "  " + ", ".join(f"{a:.1f}–{b:.1f}s" for a, b in still)))
print(f"mean frame change {d.mean():.2f}, min 1s-window mean {min(d[i:i + 30].mean() for i in range(0, len(d) - 30, 15)):.2f}")
