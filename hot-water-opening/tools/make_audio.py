"""Original score + sound design for the opening, synthesized from scratch (no samples,
no licensed material). Writes three 48 kHz stereo stems into assets/audio/:

  score_music.wav   the music bed (leaves room for VO)
  score_sfx.wav     foley / hits / transitions
  score_mix_ref.wav music+sfx reference mix (what the review render uses)

Cue times are locked to STORYBOARD.md and index.html. Re-run after changing cues:
  python3 tools/make_audio.py
"""
import os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

import json
import re

SR = 48000
_HTML = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "index.html"), encoding="utf-8").read()
TIM = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', _HTML, re.S).group(1))
_SHIFTS = [(at, TIM["gaps"].get(k, 0)) for k, at in TIM["inserts"].items()] + [tuple(c) for c in TIM["cuts"]]
_SHIFTS = [(a, g) for a, g in _SHIFTS if g]


def M(t):
    """Base time -> final time (same map as the GSAP timeline and tools/retime.py)."""
    return t + sum(g for a, g in _SHIFTS if t >= a)


DUR = round(M(TIM["baseDuration"]), 3)
N = int(round(SR * DUR))
rng = np.random.default_rng(1963)
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
os.makedirs(OUT, exist_ok=True)

BPM = 96
BEAT = 60 / BPM
# ---- cue sheet (seconds) -------------------------------------------------
C = dict(
    door=0.05, race_start=1.0, sixteenths=2.8, freeze=4.15,
    graph_in=6.0, must_pass=7.6, real_line=8.8, finish=10.5,
    crack=11.25, shatter=11.45, paper_in=12.0, write_head=12.3,
    lower_third=12.6, name=13.6, flow_cut=15.0, notes2=15.3,
    duck=17.0, tapestop=17.9, pen1=18.2, pen2=19.2, circle=20.2,
    rip=21.2, slam1=22.0, slam2=22.9, fwd=23.55, slot=24.0,
    title_hit=26.45, frost=26.9, end=30.0, note1=13.4,
)
C = {k: M(v) for k, v in C.items()}
C["end"] = DUR
SLOT_STEP = 0.36 + TIM["gaps"].get("slot", 0) / 5


def t2i(t):
    return int(round(t * SR))


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = t2i(t)
        if i >= N:
            return
        sig = sig[: N - i] * gain
        gl = np.cos((pan + 1) * np.pi / 4)
        gr = np.sin((pan + 1) * np.pi / 4)
        self.L[i : i + len(sig)] += sig * gl * 1.414
        self.R[i : i + len(sig)] += sig * gr * 1.414

    def stereo(self):
        return np.stack([self.L, self.R], 1)


def noise(sec):
    return rng.standard_normal(int(round(sec * SR)))


def sine(f, sec, phase=0.0):
    t = np.arange(int(round(sec * SR))) / SR
    return np.sin(2 * np.pi * f * t + phase)


def sweep(f0, f1, sec, curve=1.0):
    n = int(round(sec * SR))
    k = np.linspace(0, 1, n) ** curve
    f = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def adsr(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = min(n, int(round(a * SR))), min(n, int(round(r * SR)))
    e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(f, sec, detune=0.0):
    t = np.arange(int(round(sec * SR))) / SR
    out = np.zeros_like(t)
    for d in (-detune, 0, detune):
        ph = (t * f * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / 3


def ir(sec=2.2, tone=5000, seed=7):
    r = np.random.default_rng(seed)
    n = int(round(sec * SR))
    e = np.exp(-np.arange(n) / (sec / 6.5 * SR))
    L = lp(r.standard_normal(n), tone) * e
    R = lp(r.standard_normal(n), tone) * e
    L[:200] = 0
    R[:200] = 0
    return L / np.abs(L).sum() * 40, R / np.abs(R).sum() * 40


def reverb(bus, wet=0.25, sec=2.2, tone=5000):
    iL, iR = ir(sec, tone)
    L = fftconvolve(bus.L, iL)[:N]
    R = fftconvolve(bus.R, iR)[:N]
    out = Bus()
    out.L = bus.L + wet * L
    out.R = bus.R + wet * R
    return out


# ---- instruments ---------------------------------------------------------
def tick(f=2600, dec=0.012):
    n = int(round(0.06 * SR))
    s = sine(f, 0.06) * env_exp(n, dec) + 0.3 * hp(noise(0.06), 3000) * env_exp(n, 0.004)
    return s


def woodblock(f=880):
    n = int(round(0.15 * SR))
    return (sine(f, 0.15) + 0.5 * sine(f * 1.71, 0.15)) * env_exp(n, 0.03)


def sub(f0=72, f1=42, sec=0.45, dec=0.16):
    n = int(round(sec * SR))
    return sweep(f0, f1, sec, 0.5) * env_exp(n, dec) * adsr(n, 0.002, 0.05)


def pluck(f, sec=0.5, bright=2600):
    s = saw(f, sec, 0.004)
    n = len(s)
    s = lp(s, bright) * env_exp(n, 0.11) * adsr(n, 0.003, 0.05)
    return s


def tine(f, sec=1.6):
    """Lamellophone-style tine: fundamental + inharmonic overtone + soft click."""
    n = int(round(sec * SR))
    s = sine(f, sec) * env_exp(n, 0.55)
    s += 0.25 * sine(f * 5.9, sec) * env_exp(n, 0.06)
    s += 0.08 * sine(f * 2.01, sec) * env_exp(n, 0.3)
    s += 0.15 * bp(noise(sec), 1500, 5000) * env_exp(n, 0.003)
    return s * adsr(n, 0.002, 0.2)


def bell(f, sec=3.5, dec=1.1):
    n = int(round(sec * SR))
    parts = [(1, 1, 1), (2.32, 0.5, 0.7), (4.25, 0.3, 0.45), (6.63, 0.18, 0.3), (0.5, 0.25, 1.4)]
    s = sum(a * sine(f * m, sec, rng.uniform(0, 6)) * env_exp(n, dec * d) for m, a, d in parts)
    return s * adsr(n, 0.004, 0.3)


def pad(freqs, sec, cutoff0=400, cutoff1=1800, attack=1.0, release=0.8, detune=0.006):
    s = sum(saw(f, sec, detune) for f in freqs) / len(freqs)
    n = len(s)
    # time-varying LP by blocks
    out = np.zeros(n)
    blk = 2048
    zi = None
    for i in range(0, n, blk):
        k = i / max(1, n - 1)
        fc = cutoff0 + (cutoff1 - cutoff0) * k
        sos = butter(2, fc, "low", fs=SR, output="sos")
        from scipy.signal import sosfilt_zi
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        y, zi = sosfilt(sos, s[i : i + blk], zi=zi)
        out[i : i + blk] = y
    return out * adsr(n, attack, release)


def filtered_sweep_noise(sec, f0, f1, q=0.5):
    n = int(round(sec * SR))
    x = noise(sec)
    out = np.zeros(n)
    blk = 1024
    from scipy.signal import sosfilt_zi
    zi = None
    for i in range(0, n, blk):
        k = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        lo, hi = fc * (1 - q), min(fc * (1 + q), SR / 2 - 100)
        sos = butter(2, [lo, hi], "band", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        y, zi = sosfilt(sos, x[i : i + blk], zi=zi)
        out[i : i + blk] = y
    return out


def crackle(sec, rate0, rate1, gain=1.0):
    n = int(round(sec * SR))
    out = np.zeros(n)
    t = 0.0
    while t < sec:
        rate = rate0 + (rate1 - rate0) * (t / sec)
        t += rng.exponential(1 / rate)
        i = int(round(t * SR))
        if i >= n - 2000:
            break
        f = rng.uniform(2500, 9000)
        L = int(rng.uniform(0.004, 0.03) * SR)
        g = rng.uniform(0.2, 1.0)
        out[i : i + L] += g * sine(f, L / SR, rng.uniform(0, 6)) * env_exp(L, 0.004)
        out[i : i + 60] += g * rng.standard_normal(60) * 0.6
    return hp(out, 1800) * gain


def whoosh(sec, f0=300, f1=4000):
    s = filtered_sweep_noise(sec, f0, f1, 0.6)
    n = len(s)
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return s * e


def boom(dec=0.9):
    sec = 3.0
    n = int(round(sec * SR))
    s = sweep(90, 34, sec, 0.35) * env_exp(n, dec)
    s = np.tanh(2.2 * s) * 0.8
    s += 0.5 * lp(noise(sec), 900) * env_exp(n, 0.08)
    return s


# ---- build music ---------------------------------------------------------
mus = Bus()
D2, F2, A2, C3, D3, F3, A3, C4, D4, E4, F4, G4, A4, C5, D5 = (
    73.42, 87.31, 110.0, 130.81, 146.83, 174.61, 220.0, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 523.25, 587.33)

# S1 race: clock pulse + sub + tension pad
t = C["race_start"] - BEAT / 2
i = 0
while t < C["freeze"] - 0.02:
    acc = i % 2 == 0
    mus.add(t, tick(2600 if acc else 2150), 0.22 if acc else 0.14, pan=-0.25 if acc else 0.25)
    t += BEAT / 2
    i += 1
t = C["sixteenths"]
while t < C["freeze"] - 0.05:
    mus.add(t + BEAT / 4, tick(3400, 0.006), 0.07, pan=0.4)
    t += BEAT / 2
t = C["race_start"]
while t < C["freeze"] - 0.05:
    mus.add(t, sub(), 0.55)
    t += BEAT
p = pad([D2, A2, F3, D3], C["freeze"] - 0.4, 250, 1500, attack=2.2, release=0.02)
mus.add(0.4, p, 0.20)
# riser into the freeze
mus.add(C["freeze"] - 1.4, filtered_sweep_noise(1.4, 400, 7000) * np.linspace(0, 1, int(round(1.4 * SR))) ** 2, 0.10)

# freeze: shimmer cluster (glass) rings into the silence
for k, f in enumerate([D5 * 2, A4 * 2, F4 * 2, E4 * 4]):
    mus.add(C["freeze"] + 0.01 * k, bell(f, 3.0, 0.8), 0.045, pan=[-0.5, 0.5, -0.2, 0.3][k])

# S2 graph: pluck ostinato + pulse, builds to finish hit
pattern = [D3, A3, F3, A3, D4, A3, F3, A3]
t = C["graph_in"] + 0.2
step = BEAT / 4
i = 0
while t < C["finish"] - 0.02:
    k = (t - C["graph_in"]) / (C["finish"] - C["graph_in"])
    mus.add(t, pluck(pattern[i % 8], 0.4, 900 + 2600 * k), 0.10 + 0.06 * k, pan=0.3 * np.sin(i))
    t += step
    i += 1
t = C["graph_in"] + 0.2
while t < C["finish"] - 0.05:
    mus.add(t, sub(64, 40, 0.4, 0.12), 0.45)
    t += BEAT
mus.add(C["graph_in"], pad([D2, A2, D3, F3], C["finish"] - C["graph_in"], 300, 2400, 1.2, 0.05), 0.14)
# "starts behind" tension: low saw swell under the real line
mus.add(C["real_line"], pad([D2 * 0.5 * 2, C3], C["finish"] - C["real_line"], 200, 3000, 1.4, 0.03, 0.01), 0.14)
# finish: hit chord rings out
for k, f in enumerate([D3, A3, D4, F4, A4]):
    mus.add(C["finish"], pluck(f, 1.6, 3500) * np.linspace(1, 1, int(round(1.6 * SR))), 0.12, pan=(k - 2) * 0.25)
mus.add(C["finish"], bell(D5, 2.2, 0.6), 0.05)

# S3 1963: warm tine motif (F major / D minor colour) + shaker
motif = [F4, A4, C5, A4, D5, C5, A4, G4, F4, A4, C5, D5, C5, A4, G4, A4]
t = C["paper_in"] + 0.15
i = 0
while t < C["tapestop"] - 0.05:
    duck = 0.35 if t >= C["duck"] else 1.0
    mus.add(t, tine(motif[i % len(motif)] / 2, 1.4), 0.16 * duck, pan=0.35 * np.sin(i * 1.3))
    if i % 4 == 0:
        mus.add(t, tine(F2 if (i // 8) % 2 == 0 else D2 * 1.0, 1.8) * 0.8, 0.16 * duck)
    t += BEAT / 2
    i += 1
t = C["paper_in"] + 0.15
i = 0
while t < C["tapestop"] - 0.05:
    duck = 0.35 if t >= C["duck"] else 1.0
    sh = bp(noise(0.05), 5000, 12000) * env_exp(int(round(0.05 * SR)), 0.012)
    mus.add(t, sh, (0.05 if i % 2 else 0.028) * duck, pan=0.5)
    t += BEAT / 4
    i += 1
mus.add(C["paper_in"], pad([F2, C3, A3, F3], C["tapestop"] - C["paper_in"], 500, 1100, 1.0, 0.05, 0.004), 0.08)

# S4: pulse returns under the slot machine, riser to title
t = C["slot"]
while t < C["title_hit"] - 0.2:
    mus.add(t, sub(70, 44, 0.3, 0.08), 0.40)
    t += BEAT / 2
mus.add(C["rip"] + 0.2, pad([D2, A2, D3], C["title_hit"] - C["rip"] - 0.4, 200, 900, 1.0, 0.1), 0.12)
rs = C["title_hit"] - C["slot"] - 0.15
mus.add(C["slot"], filtered_sweep_noise(rs, 300, 9000) * np.linspace(0, 1, int(round(rs * SR))) ** 2.2, 0.12)
mus.add(C["slot"], (sweep(110, 440, rs, 1.8) + 0.5 * sweep(165, 660, rs, 1.8)) * np.linspace(0, 1, int(round(rs * SR))) ** 2 * adsr(int(round(rs * SR)), 0.2, 0.02), 0.035)

# S5 title: glass chord + drone to the end
for k, f in enumerate([D3, A3, D4, E4, F4, A4, D5]):
    mus.add(C["title_hit"] + 0.008 * k, bell(f, 3.6, 1.3), 0.06, pan=(k - 3) * 0.18)
mus.add(C["title_hit"], pad([D2, A2, D3], C["end"] - C["title_hit"], 900, 300, 0.02, 1.6), 0.16)

mus = reverb(mus, wet=0.35, sec=2.4, tone=6000)

# tape stop: pitch-drop the music bus into the teacher's quote
a, b = t2i(C["tapestop"]), t2i(C["tapestop"] + 0.45)
for ch in (mus.L, mus.R):
    seg_len = b - a
    rate = np.linspace(1.0, 0.0, seg_len) ** 1.2
    pos = a + np.cumsum(rate)
    ch[a:b] = np.interp(pos, np.arange(N), ch) * np.linspace(1, 0, seg_len)
    q0 = t2i(C["rip"])
    ch[b:q0] = 0.0  # silence under the quote (room tone lives in the sfx bus)
    # hard stop at the freeze (music only rings via its reverb tail)

# ---- build sfx -----------------------------------------------------------
fx = Bus()
# freezer door: seal suck + thunk + light buzz
fx.add(C["door"], lp(noise(0.35), 700) * env_exp(int(round(0.35 * SR)), 0.08), 0.35)
fx.add(C["door"] + 0.04, sub(120, 60, 0.3, 0.06), 0.8)
fx.add(C["door"] + 0.04, woodblock(310) * 0.8, 0.3)
# compressor hum through S1 & S2
hum_len = C["crack"] - 0.2
th = np.arange(int(round(hum_len * SR))) / SR
hum = (np.sin(2 * np.pi * 50 * th) + 0.5 * np.sin(2 * np.pi * 100 * th) + 0.25 * np.sin(2 * np.pi * 150 * th))
hum = hum * (1 + 0.1 * np.sin(2 * np.pi * 0.7 * th)) + 0.25 * lp(noise(hum_len), 400)
fx.add(0.2, hum * adsr(len(hum), 0.4, 0.5), 0.035)
# freeze: crackle burst + stamp
fx.add(C["freeze"] - 0.05, crackle(1.4, 220, 30), 0.30, pan=-0.35)
fx.add(C["freeze"], bp(noise(0.25), 3000, 12000) * env_exp(int(round(0.25 * SR)), 0.05), 0.25)
fx.add(C["freeze"] + 0.55, sub(160, 90, 0.2, 0.04) + 0.3 * lp(noise(0.2), 2000) * env_exp(int(round(0.2 * SR)), 0.02), 0.35)
# graph: axis swing whoosh, marker ping, line draw
fx.add(C["graph_in"] - 0.25, whoosh(0.7, 200, 2500), 0.22)
fx.add(C["must_pass"], bell(1760, 1.0, 0.25), 0.05, pan=0.3)
fx.add(C["real_line"], filtered_sweep_noise(1.65, 800, 5000, 0.3) * adsr(int(round(1.65 * SR)), 0.1, 0.1), 0.09, pan=0.2)
fx.add(C["finish"], boom(0.35) * 0.9, 0.55)
fx.add(C["finish"], crackle(0.6, 160, 20), 0.2, pan=0.3)
# crack + shatter
fx.add(C["crack"], crackle(0.25, 400, 400), 0.35)
sh_len = 1.2
sh = np.zeros(int(round(sh_len * SR)))
for _ in range(90):
    j = int(rng.uniform(0, 0.7) ** 1.8 * SR)
    L = int(rng.uniform(0.02, 0.25) * SR)
    f = rng.uniform(2200, 9500)
    seg = sine(f, L / SR, rng.uniform(0, 6)) * env_exp(L, rng.uniform(0.01, 0.06)) * rng.uniform(0.2, 1)
    sh[j : j + L] += seg[: len(sh) - j]
sh += 1.4 * bp(noise(sh_len), 1500, 9000) * env_exp(int(round(sh_len * SR)), 0.08)
fx.add(C["shatter"], sh, 0.22)
fx.add(C["shatter"], sub(95, 45, 0.5, 0.1), 0.5)
# paper
for tt, g in ((C["paper_in"] + 0.05, 0.18), (C["flow_cut"] - 0.05, 0.06), (C["rip"], 0.0)):
    if g:
        fx.add(tt, bp(noise(0.35), 900, 5000) * adsr(int(round(0.35 * SR)), 0.04, 0.2) * np.linspace(1, 0.2, int(round(0.35 * SR))), g)
# pencil writes (header + notes)
def scribble(sec, rate=11, gain=1.0):
    n = int(round(sec * SR))
    tt = np.arange(n) / SR
    am = np.clip(np.sin(2 * np.pi * rate * tt + rng.uniform(0, 6)) + 0.4 * np.sin(2 * np.pi * rate * 1.7 * tt), 0, None)
    return bp(noise(sec), 2500, 7000) * am * adsr(n, 0.02, 0.05) * gain

fx.add(C["write_head"], scribble(0.9, 9), 0.10, pan=-0.3)
fx.add(C["note1"], scribble(0.8, 10), 0.07, pan=-0.4)
fx.add(C["notes2"], scribble(0.7, 12), 0.07, pan=-0.4)
fx.add(C["lower_third"], bp(noise(0.12), 2000, 6000) * env_exp(int(round(0.12 * SR)), 0.03), 0.1)
# room tone under the quote (so the silence is not digital black)
rt_len = C["rip"] - C["tapestop"]
fx.add(C["tapestop"], lp(noise(rt_len), 300) * adsr(int(round(rt_len * SR)), 0.3, 0.2), 0.02)
# red pen: two lines + circle
fx.add(C["pen1"], scribble(0.95, 13), 0.16, pan=-0.15)
fx.add(C["pen2"], scribble(0.9, 13), 0.16, pan=0.1)
fx.add(C["circle"], scribble(0.35, 6), 0.2, pan=0.15)
fx.add(C["circle"] + 0.4, sub(110, 70, 0.3, 0.05), 0.25)
# rip + rewind
fx.add(C["rip"] - 0.05, bp(noise(0.4), 700, 6000) * adsr(int(round(0.4 * SR)), 0.01, 0.25), 0.35)
rw = sweep(1400, 180, 0.8, 0.6) * (1 + 0.5 * sine(18, 0.8))
fx.add(C["rip"] + 0.05, lp(rw, 3000) * adsr(int(round(0.8 * SR)), 0.05, 0.1), 0.06)
fx.add(C["rip"] + 0.05, whoosh(0.8, 3000, 300), 0.25)
t = C["rip"] + 0.1
while t < C["slam2"] - 0.05:
    fx.add(t, tick(1800, 0.008), 0.08, pan=0.5)
    t += 0.07 if t < C["slam1"] else 0.05
for s in (C["slam1"], C["slam2"]):
    fx.add(s, boom(0.25), 0.45)
    fx.add(s, woodblock(180) + 0.5 * lp(noise(0.15), 3000) * env_exp(int(round(0.15 * SR)), 0.02), 0.3)
fx.add(C["fwd"], whoosh(0.5, 400, 7000), 0.28)
# slot machine: one tick per word change
for k in range(6):
    tt = C["slot"] + 0.12 + k * SLOT_STEP
    fx.add(tt, tick(1500, 0.01), 0.14, pan=-0.2 + 0.08 * k)
    fx.add(tt, woodblock(1200), 0.084, pan=-0.2 + 0.08 * k)
fx.add(C["title_hit"] - 0.55, filtered_sweep_noise(0.55, 6000, 400, 0.5) * np.linspace(0, 1, int(round(0.55 * SR))) ** 3, 0.0)
# title hit
fx.add(C["title_hit"], boom(0.8), 0.75)
fx.add(C["title_hit"], bp(noise(0.5), 2500, 14000) * env_exp(int(round(0.5 * SR)), 0.06), 0.2)
fx.add(C["frost"], crackle(1.8, 60, 260), 0.20, pan=0.25)
fx.add(C["frost"] + 1.6, crackle(0.8, 200, 10), 0.12, pan=0.35)

fx = reverb(fx, wet=0.18, sec=1.6, tone=7000)

# ---- master ---------------------------------------------------------------
def fade_tail(x, sec=0.6):
    n = int(round(sec * SR))
    x[-n:] *= np.linspace(1, 0, n)[:, None]
    return x

music = fade_tail(mus.stereo())

# ---- duck the music under real VO (no-op while VO files are silent placeholders)
VO = {v["id"]: M(v["start"]) for v in TIM["vo"]}
duck_env = np.ones(N)
vo_dir = os.path.join(OUT, "vo")
for name, start in VO.items():
    fp = os.path.join(vo_dir, name + ".wav")
    if not os.path.exists(fp):
        continue
    v, vsr = sf.read(fp, always_2d=True)
    v = v.mean(1)
    if vsr != SR:
        v = np.interp(np.arange(int(len(v) * SR / vsr)) * vsr / SR, np.arange(len(v)), v)
    if np.abs(v).max() < 1e-4:
        continue  # silent placeholder
    blk = 480  # 10 ms
    rms = np.sqrt(np.convolve(v ** 2, np.ones(blk) / blk, "same"))
    active = (rms > 10 ** (-40 / 20)).astype(float)
    i0 = t2i(start)
    seg = np.zeros(N)
    seg[i0 : i0 + len(active)] = active[: N - i0]
    # 80 ms attack / 350 ms release smoothing
    k = np.ones(int(0.35 * SR)) / int(0.35 * SR)
    seg = np.clip(np.convolve(seg, k, "same") * 1.6, 0, 1)
    duck_env = np.minimum(duck_env, 1 - seg * (1 - 10 ** (-7 / 20)))  # up to -7 dB
music = music * duck_env[:, None]
sfx = fade_tail(fx.stereo())
mix = music * 0.9 + sfx
peak = np.abs(mix).max()
target = 10 ** (-1.5 / 20)  # -1.5 dBFS sample peak ceiling (true-peak checked with ffmpeg)
g = target / peak
for name, x in (("score_music.wav", music * 0.9 * g), ("score_sfx.wav", sfx * g), ("score_mix_ref.wav", mix * g)):
    sf.write(os.path.join(OUT, name), x.astype(np.float32), SR, subtype="PCM_24")
print("peak before norm %.3f, gain %.2f dB" % (peak, 20 * np.log10(g)))
