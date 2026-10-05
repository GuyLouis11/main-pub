"""Master the Short's audio: narration + music (0.75) + sfx (0.85), lookahead peak limiter at -1.5 dBFS (≈ -1 dBTP after AAC),
integrated loudness -14 LUFS (Shorts playback level), then mux onto the rendered picture.

  python3 tools/master.py renders/raw.mp4 renders/Should_You_Switch_Doors.mp4"""
import json
import os
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import maximum_filter1d, uniform_filter1d

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR = 48000


def limit(x, ceil=10 ** (-1.8 / 20), look=.004, rel=.08):
    pk = maximum_filter1d(np.abs(x).max(1), int(SR * look) * 2 + 1)
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    g = np.minimum(g, uniform_filter1d(g, int(SR * look) * 2 + 1))          # smooth attack
    out = np.empty_like(g); a = np.exp(-1 / (rel * SR)); cur = 1.0
    for i in range(len(g)):                                                    # release
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
        out[i] = cur
    return x * out[:, None]


def main(src, dst):
    c = json.load(open(os.path.join(ROOT, "assets", "audio", "cues.json")))
    M, _ = sf.read(os.path.join(ROOT, "assets", "audio", "music.wav"))
    F, _ = sf.read(os.path.join(ROOT, "assets", "audio", "sfx.wav"))
    N = len(M)
    mix = .75 * M + .85 * F
    for vid, v in c["vo"].items():
        x, _ = sf.read(os.path.join(ROOT, "assets", "vo", vid + ".wav"))
        i = int(round(v["start"] * SR)); x = x[:N - i]
        mix[i:i + len(x)] += x[:, None]
    m = pyln.Meter(SR)
    for _ in range(3):                                       # loudness and limiter converge in a couple of passes
        mix *= 10 ** ((-14 - m.integrated_loudness(mix)) / 20)
        mix = limit(mix)
    wav = os.path.join(ROOT, "renders", "master.wav")
    sf.write(wav, mix.astype(np.float32), SR, subtype="PCM_24")
    print(f"master {m.integrated_loudness(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "libx264",
                    "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-shortest",
                    "-movflags", "+faststart", dst], check=True)
    print("wrote", dst)


if __name__ == "__main__":
    main(*sys.argv[1:3])
