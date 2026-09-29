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
# v2 delivery: lower stability + more style = more melody and cadence (v1 at 0.45/0.15 read lists flat)
SETTINGS = {"stability": 0.38, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 1.05}
RATE = (2.45, 3.3)   # accepted words per second (pauses included); short lines get a lower floor
LUFS = -17.0   # every take is levelled to this
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


def prosody(text):
    """Timed breaths for the TTS only: a beat after list labels ("Suspect one: ...") and between sentences,
    so lists get rhythm instead of being read in one flat run."""
    text = re.sub(r'(Suspect \w+):\s*', r'\1: <break time="0.35s" /> ', text)
    text = re.sub(r'([.!?…]["”]?)\s+(?=["“A-Z])', r'\1 <break time="0.28s" /> ', text)
    # a trailing pause lets the model finish the last word (without it the final phoneme was clipped); trimmed later
    return text + ' <break time="0.7s" />'


def tts(text, key, prev=None, nxt=None):
    for a, b in SAY:
        text = text.replace(a, b)
    text = prosody(text)
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
                        "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.25,areverse",
                        "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", path], input=mp3, capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode())
    import pyloudnorm as pyln
    x, sr = sf.read(path)
    y = pyln.normalize.loudness(x, pyln.Meter(sr).integrated_loudness(x), LUFS)
    if np.abs(y).max() > 0.89:
        y *= 0.89 / np.abs(y).max()
    sf.write(path, y, sr, subtype="PCM_16")


def ending_ok(path):
    """True when the take ends in a natural tail: at least 160 ms after the last loud (> -35 dB) 20 ms frame.
    A clipped final word ends within ~60 ms of full-level speech."""
    x, sr = sf.read(path)
    hop = int(sr * .02)
    db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)]) + 1e-9)
    loud = np.nonzero(db > -35)[0]
    return len(loud) and (len(db) - 1 - loud[-1]) >= 8


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
        # no next_text: with it, ElevenLabs delivers each ending as if the sentence continues (lines sounded cut off)
        spoken = text
        for a, b in SAY:
            spoken = spoken.replace(a, b)
        words = len(re.findall(r"[A-Za-z0-9']+", spoken))
        lo, hi = (RATE[0] - (.5 if words < 7 else 0)), RATE[1]
        best, tmp = None, path + '.try.wav'
        for attempt in range(5):
            to_wav(tts(text, key, prev, None), tmp)
            rate = words / sf.info(tmp).duration
            score = (not ending_ok(tmp)) * 10 + max(0, lo - rate, rate - hi)
            if best is None or score < best[0]:
                best = (score, rate)
                os.replace(tmp, path)
            if score == 0:
                break
        if os.path.exists(tmp):
            os.remove(tmp)
        d = sf.info(path).duration
        print(f"{vid:6} {d:5.2f}s  {best[1]:.2f} w/s  {'ok' if best[0] == 0 else 'best of 5'}  {text[:55]}")


if __name__ == "__main__":
    main(sys.argv[1:])
