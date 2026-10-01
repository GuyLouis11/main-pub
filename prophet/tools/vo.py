"""Narration for the 0.999… = 1 Short: ElevenLabs eleven_v3 (voice apOzcbHULxCnvWfHPd41, Guy's pick: sample D settings),
generated with the /with-timestamps endpoint so the on-screen captions land on the exact spoken words.

The key is read from XI_KEY and never written anywhere.
  XI_KEY=... python3 tools/vo.py            # missing takes only
  XI_KEY=... python3 tools/vo.py --force M03 M07

Reads the lines from index.html's timing block (text: *word* marks a highlighted caption word, stripped for speech).
Writes assets/vo/<ID>.wav (48 kHz mono, -17 LUFS, silence trimmed) and assets/vo/<ID>.words.json:
  [[display word, start s, end s, highlighted], ...] relative to the trimmed take.
Then run tools/bake.py."""
import base64
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

import numpy as np
import soundfile as sf

VOICE = "apOzcbHULxCnvWfHPd41"
MODEL = "eleven_v3"
SETTINGS = {"stability": 0.5, "similarity_boost": 0.75}
FMT = "mp3_44100_192"
SR = 48000
LUFS = -17.0
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
# spoken form of display tokens (captions keep the display form); trailing .,?!: are carried over
SAY = {}
# eleven_v3 delivery tags (not spoken); lines listed here keep the slowest clean take of `tries`
DIRECT = {"P86": "[slowly]", "P87": "[quietly, slowly]", "P89": "[slowly, knowing]"}


def timing():
    s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    return json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))


def tokens(text):
    """display tokens -> (display, spoken, highlighted)"""
    out = []
    for tok in text.split():
        hi = "*" in tok
        disp = tok.replace("*", "")
        core = disp.rstrip(".,?!:")
        out.append((disp, SAY.get(core, core) + disp[len(core):], hi))
    return out


def call(spoken, key):
    body = {"text": spoken, "model_id": MODEL, "voice_settings": SETTINGS}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format={FMT}",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": key, "Content-Type": "application/json"})
    for k in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and k < 3:
                time.sleep(2 ** (k + 1)); continue
            raise SystemExit(f"ElevenLabs HTTP {e.code}: {e.read()[:300].decode(errors='replace')}")


def decode(mp3):
    p = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "pipe:0", "-ar", str(SR), "-ac", "1", "-f", "f32le", "pipe:1"],
                       input=mp3, capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode())
    return np.frombuffer(p.stdout, np.float32).astype(np.float64)


def frames_db(x, hop):
    n = len(x) // hop
    return 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)


def take(text, key, tries=3, tag=""):
    toks = tokens(text)
    pre = tag + " " if tag else ""
    spoken = pre + " ".join(t[1] for t in toks)
    best = None
    for attempt in range(tries):
        r = call(spoken, key)
        x = decode(base64.b64decode(r["audio_base64"]))
        hop = int(SR * .02)
        db = frames_db(x, hop)
        loud = np.nonzero(db > -35)[0]
        clipped = not (len(loud) and (len(db) - 1 - loud[-1]) >= 3)
        span = (loud[-1] - loud[0]) if len(loud) else 0
        if best is None or (best[2] and not clipped) or (tag and not clipped and span > best[4]):
            best = (x, r["alignment"], clipped, attempt + 1, span)
        if not clipped and not tag:
            break
    x, al, clipped, n, _ = best
    hop = int(SR * .01)
    db = frames_db(x, hop)
    on = np.nonzero(db > -50)[0]
    a = max(0, on[0] * hop - int(SR * .03))
    b = min(len(x), (on[-1] + 1) * hop + int(SR * .12))
    y = x[a:b].copy()
    f = int(SR * .01); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    off = a / SR
    # map characters of the spoken string back to display tokens
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    assert "".join(chars) == spoken, "alignment text mismatch"
    words, pos = [], len(pre)
    for disp, sp, hi in toks:
        i0, i1 = pos, pos + len(sp) - 1
        words.append([disp, round(max(0.0, st[i0] - off), 3), round(min(len(y) / SR, en[i1] - off), 3), hi])
        pos += len(sp) + 1
    return y, words, f"{'clean' if not clipped else 'CLIPPED'}/{n}"


def main(argv):
    key = os.environ.get("XI_KEY")
    if not key:
        raise SystemExit("set XI_KEY")
    import pyloudnorm as pyln
    force = "--force" in argv
    only = {a for a in argv if not a.startswith("--")}
    for vid, v in timing()["vo"].items():
        if only and vid not in only:
            continue
        wav = os.path.join(ROOT, "assets", "vo", vid + ".wav")
        if os.path.exists(wav) and not force:
            print("skip", vid); continue
        y, words, rep = take(v["text"], key, tag=DIRECT.get(vid, ""))
        y = pyln.normalize.loudness(y, pyln.Meter(SR).integrated_loudness(y), LUFS)
        if np.abs(y).max() > .89:
            y *= .89 / np.abs(y).max()
        sf.write(wav, y, SR, subtype="PCM_16")
        json.dump(words, open(wav[:-4] + ".words.json", "w"), ensure_ascii=False)
        print(f"{vid} {len(y) / SR:5.2f}s {rep}  " + " ".join(f"{w[0]}@{w[1]:.2f}" for w in words))


if __name__ == "__main__":
    main(sys.argv[1:])
