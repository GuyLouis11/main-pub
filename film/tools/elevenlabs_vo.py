"""Generate all narration with ElevenLabs (voice apOzcbHULxCnvWfHPd41) and drop it into the projects.

The API key is read from the environment variable XI_KEY; it is never written to disk or printed.
Needs network access to api.elevenlabs.io.

  XI_KEY=... python3 tools/elevenlabs_vo.py            # all 51 lines (opening + chapters), skips existing takes
  XI_KEY=... python3 tools/elevenlabs_vo.py --force    # regenerate everything
  XI_KEY=... python3 tools/elevenlabs_vo.py C3_02 VO_05   # only these

v3 method (after v2 glitches): stable settings, NO <break> tags, one TTS call per sentence (previous text passed
for continuity), sentences joined with measured pauses; every sentence is scored for clipped endings, sudden
spectral bursts, hiss and pace, and regenerated (best of up to 4 kept) when it misses the bar set by the calm v1 takes.

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
MODEL = os.environ.get("XI_MODEL", "eleven_v3")   # chosen by Guy from the A/B test (sample D)
# v3: calm and stable (v2's stability .38 / style .35 plus break tags produced ~50% more glitches than v1)
SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True, "speed": 1.04}
FMT = "mp3_44100_192"
PAUSE = {".": .20, "?": .28, "!": .24, "…": .32}     # silence added after a sentence (plus ~0.15 s natural tail)
TUNE = {"VO_01": {"pause": .08, "speed": 1.1}}     # per-line overrides (VO_01 must land before the freeze hit)
BAR = {"spikes": 2.0}      # sudden broadband bursts per second (calm v1 takes: median 1.2, 75th pct 1.4)
RATE = (2.4, 4.8)           # words/s of one sentence on its own (short sentences run quicker)
LUFS = -17.0
SR = 48000
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

# pronunciation aids applied only to the text sent to TTS (on-screen/script text is unchanged)
SAY = [("1963", "nineteen sixty-three"), ("1969", "nineteen sixty-nine"), ("2012", "twenty twelve"),
       ("2013", "twenty thirteen"), ("2016", "twenty sixteen"), ("2017", "twenty seventeen"), ("2020", "twenty twenty"), ("2023", "twenty twenty-three"), ("2024", "twenty twenty-four")]


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


def sentences(text):
    """Split a line into sentences at . ? ! … (keeping closing quotes with their sentence)."""
    out, last = [], 0
    for m in re.finditer(r'[.!?…]["”]?\s+(?=["“A-Z0-9])', text):
        out.append(text[last:m.end()].strip()); last = m.end()
    out.append(text[last:].strip())
    return [x for x in out if x]


def speak(text):
    for a, b in SAY:
        text = text.replace(a, b)
    return text


def tts(text, key, prev=None, speed=None):
    # one trailing break per call lets the model finish the last word (without it endings were clipped);
    # it is trimmed off. A single tag per generation keeps the voice stable (v2 used 4-5 per line).
    body = {"text": speak(text) + ' <break time="0.5s" />', "model_id": MODEL, "voice_settings": dict(SETTINGS, **({"speed": speed} if speed else {}))}
    if prev:
        body["previous_text"] = speak(prev)
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format={FMT}",
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


def decode(mp3):
    """mp3 bytes -> 48 kHz mono float, lead/tail silence trimmed (30 ms lead and 120 ms tail kept)."""
    p = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "pipe:0", "-af",
                        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse",
                        "-ar", str(SR), "-ac", "1", "-f", "f32le", "pipe:1"], input=mp3, capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode())
    return np.frombuffer(p.stdout, np.float32).astype(np.float64)


def assess(x, words):
    """Glitch/pace metrics for one sentence (levelled first so the thresholds are comparable)."""
    from scipy.signal import stft
    import pyloudnorm as pyln
    d = len(x) / SR
    if d < .4:
        return {"bad": 99}
    try:
        y = pyln.normalize.loudness(x, pyln.Meter(SR).integrated_loudness(x), LUFS)
    except Exception:
        y = x
    jumps = (np.abs(np.diff(y)) > .25).sum() / d
    f, _, Z = stft(y, SR, nperseg=1024, noverlap=768)
    M = np.abs(Z) + 1e-9
    fl = np.maximum(0, np.diff(np.log(M), axis=1)).mean(0)
    spikes = (fl > np.median(fl) + 6 * np.std(fl)).sum() / d
    hiss = ((M[f > 7000].sum(0) / M.sum(0)) > .35).sum() / d
    hop = int(SR * .02)
    db = 20 * np.log10(np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y) - hop + 1, hop)]) + 1e-9)
    loud = np.nonzero(db > -35)[0]
    clipped = not (len(loud) and (len(db) - 1 - loud[-1]) >= 4)       # the tail should decay over >= 80 ms
    rate = words / d
    # hiss and sample jumps are reported but not scored: sibilants ("steams") trip them without any glitch
    bad = 10 * clipped + max(0, spikes - BAR["spikes"]) * 3 + max(0, RATE[0] - rate, rate - RATE[1]) * .5
    return {"bad": round(float(bad), 3), "spikes": round(float(spikes), 2), "hiss": round(float(hiss), 1),
            "jumps": round(float(jumps), 1), "rate": round(float(rate), 2), "clipped": clipped}


def build_line(text, key, prev_line, tune=None):
    tune = tune or {}
    parts, ctx, report = [], prev_line, []
    sents = sentences(text)
    for k, sent in enumerate(sents):
        words = len(re.findall(r"[A-Za-z0-9']+", speak(sent)))
        best = None
        for attempt in range(3):
            x = decode(tts(sent, key, ctx, tune.get("speed")))
            a = assess(x, words)
            if best is None or a["bad"] < best[1]["bad"]:
                best = (x, a)
            if a["bad"] == 0:
                break
        x, a = best
        report.append(f"{a['bad']:.2f}/{attempt + 1}")
        fade = int(SR * .01)
        x = x.copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
        if a.get("clipped"):   # soften a hard stop: 50 ms fade from the last loud frame
            hop = int(SR * .02)
            db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)]) + 1e-9)
            k0 = (np.nonzero(db > -35)[0][-1] + 1) * hop
            n = min(int(SR * .05), len(x) - k0 + hop)
            x[max(0, k0 - hop):max(0, k0 - hop) + n] *= np.linspace(1, 0, n)[:len(x[max(0, k0 - hop):max(0, k0 - hop) + n])]
        parts.append(x)
        if k < len(sents) - 1:
            end = sent.rstrip('"”')[-1]
            parts.append(np.zeros(int(SR * tune.get("pause", PAUSE.get(end, .2)))))
        ctx = ((ctx + " ") if ctx else "") + sent
    return np.concatenate(parts), report


def write(y, path):
    import pyloudnorm as pyln
    y = pyln.normalize.loudness(y, pyln.Meter(SR).integrated_loudness(y), LUFS)
    if np.abs(y).max() > 0.89:
        y *= 0.89 / np.abs(y).max()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sf.write(path, y, SR, subtype="PCM_16")


V3_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75}


def v3_line(text, key):
    """Sample-D method: the whole line in one eleven_v3 call, no tags, no context. Up to 3 tries for a clean ending."""
    words = len(re.findall(r"[A-Za-z0-9']+", speak(text)))
    best = None
    for attempt in range(int(os.environ.get("XI_TRIES", 3))):
        body = {"text": speak(text), "model_id": MODEL, "voice_settings": V3_SETTINGS}
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format={FMT}",
                                     data=json.dumps(body).encode(), method="POST",
                                     headers={"xi-api-key": key, "Content-Type": "application/json"})
        for k in range(4):
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    mp3 = r.read()
                break
            except urllib.error.HTTPError as e:
                if e.code in (429, 500, 502, 503) and k < 3:
                    time.sleep(2 ** (k + 1)); continue
                raise SystemExit(f"ElevenLabs HTTP {e.code}: {e.read()[:300].decode(errors='replace')}")
        x = decode(mp3)
        a = assess(x, words)
        # v3 ends words crisply (the approved sample D tails decay over 60-220 ms), so only a stop within
        # 40 ms of full-level speech counts as clipped
        hop = int(SR * .02)
        db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)]) + 1e-9)
        loud = np.nonzero(db > -35)[0]
        a["clipped"] = not (len(loud) and (len(db) - 1 - loud[-1]) >= 3)
        a["bad"] = 10 * a["clipped"]
        if best is None or a["bad"] < best[1]["bad"]:
            best = (x, a)
        if not a["clipped"]:
            break
    x, a = best
    fade = int(SR * .01)
    x = x.copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    return x, [f"{'clean' if not a['clipped'] else 'CLIPPED'}/{attempt + 1}"]


def env_key():
    """XI_KEY from the environment, else from a gitignored .env (KEY=value lines) in the project or repo root."""
    if os.environ.get("XI_KEY"):
        return os.environ["XI_KEY"]
    here = os.path.dirname(os.path.abspath(__file__))
    for d in (os.path.join(here, ".."), os.path.join(here, "..", "..")):
        f = os.path.join(d, ".env")
        if os.path.exists(f):
            for line in open(f, encoding="utf-8"):
                k, _, v = line.strip().partition("=")
                if k.strip() == "XI_KEY" and v.strip():
                    return v.strip().strip('"\'')
    return None


def main(argv):
    key = env_key()
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
        if MODEL == "eleven_v3":
            y, rep = v3_line(text, key)
        else:
            y, rep = build_line(text, key, L[i - 1][1] if i else None, TUNE.get(vid))
        write(y, path)
        print(f"{vid:6} {len(y) / SR:5.2f}s  sentences(badness/tries): {' '.join(rep)}")


if __name__ == "__main__":
    main(sys.argv[1:])
