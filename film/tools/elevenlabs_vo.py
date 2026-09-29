"""Generate all narration with ElevenLabs (voice apOzcbHULxCnvWfHPd41) and drop it into the projects.

The API key is read from the environment variable XI_KEY; it is never written to disk or printed.
Needs network access to api.elevenlabs.io.

  XI_KEY=... python3 tools/elevenlabs_vo.py            # all 51 lines (opening + chapters), skips existing takes
  XI_KEY=... python3 tools/elevenlabs_vo.py --force    # regenerate everything
  XI_KEY=... python3 tools/elevenlabs_vo.py C3_02 VO_05   # only these

Output: 48 kHz mono WAV, leading/trailing silence trimmed, in
  hot-water-opening/assets/audio/vo/VO_0N.wav  and  film/chN/assets/vo/C#_##.wav
Then run: hot-water-opening/tools/retime.py + make_audio.py, film/tools/retime_chapters.py + chapter_audio.py.
"""
import io
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
MODEL = os.environ.get("XI_MODEL", "eleven_multilingual_v2")
SETTINGS = {"stability": 0.45, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True, "speed": 1.0}
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

# pronunciation aids applied only to the text sent to TTS (on-screen/script text is unchanged)
SAY = [("Mpemba", "Mpemba"), ("1963", "nineteen sixty-three"), ("1969", "nineteen sixty-nine"), ("2012", "twenty twelve"),
       ("2013", "twenty thirteen"), ("2016", "twenty sixteen"), ("2017", "twenty seventeen"), ("2020", "twenty twenty"), ("2024", "twenty twenty-four")]


def lines():
    out = []
    oh = open(os.path.join(ROOT, "hot-water-opening", "index.html"), encoding="utf-8").read()
    tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', oh, re.S).group(1))
    for v in tim["vo"]:
        out.append((v["id"], v["text"], os.path.join(ROOT, "hot-water-opening", "assets", "audio", "vo", v["id"] + ".wav")))
    for ch in sorted(d for d in os.listdir(os.path.join(ROOT, "film")) if re.fullmatch(r"ch\d", d)):
        s = open(os.path.join(ROOT, "film", ch, "index.html"), encoding="utf-8").read()
        t = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
        for vid, v in t["vo"].items():
            out.append((vid, v["text"], os.path.join(ROOT, "film", ch, "assets", "vo", vid + ".wav")))
    return out


def is_real(path):
    if not os.path.exists(path):
        return False
    x, _ = sf.read(path, always_2d=True)
    return np.abs(x).max() > 1e-4


def tts(text, key, prev=None, nxt=None):
    for a, b in SAY:
        text = text.replace(a, b)
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    if prev:
        body["previous_text"] = prev
    if nxt:
        body["next_text"] = nxt
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode(errors="replace")
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(2 ** (attempt + 1))
                continue
            raise SystemExit(f"ElevenLabs HTTP {e.code}: {msg}")


def to_wav(mp3, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    p = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "pipe:0", "-af",
                        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.04",
                        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", path], input=mp3, capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode())


def main(argv):
    key = os.environ.get("XI_KEY")
    if not key:
        raise SystemExit("set XI_KEY in the environment")
    force = "--force" in argv
    only = {a for a in argv if not a.startswith("--")}
    L = lines()
    for i, (vid, text, path) in enumerate(L):
        if only and vid not in only:
            continue
        if not force and is_real(path):
            print(f"skip {vid} (take exists)")
            continue
        prev = L[i - 1][1] if i else None
        nxt = L[i + 1][1] if i + 1 < len(L) else None
        to_wav(tts(text, key, prev, nxt), path)
        d = sf.info(path).duration
        print(f"{vid:6} {d:5.2f}s  {text[:70]}")


if __name__ == "__main__":
    main(sys.argv[1:])
