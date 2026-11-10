"""The film's score and sound design, composed and synthesized in code.   python3.13 audio/score.py
Writes audio/music.wav, audio/sfx.wav and audio/mix.wav (48 kHz stereo, the mix at -14 LUFS).

60 BPM, D major, one chord every two beats, so every cut in the picture lands on a chord change:
  0 s  dawn    felt piano alone                     D   D/F#  G
  6 s  morning muted plucks join, strings underneath Bm7 G    D/A  Asus-A
 14 s  midday  the arpeggio doubles, bass enters      Bm  G    D    A      (18 s: the dashboard)
 22 s  dusk    the swell: full strings, bells, pulse  G   D/F# Em7  A  Asus
 31 s  night   resolution, the piano motif returns    D   G/D  D
Music and effects are separate stems so the music can be replaced without touching the effects."""
import os
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import signal

SR = 48000
DUR = 40.0
N = int(SR * (DUR + 6.0))                      # room for reverb tails; trimmed at the end
rng = np.random.default_rng(7)
HERE = os.path.dirname(os.path.abspath(__file__))
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
m = lambda s: NOTE[s[:-1]] + 12 * (int(s[-1]) + 1)


class Bus:
    def __init__(self):
        self.L, self.R = np.zeros(N), np.zeros(N)

    def add(self, t, x, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= N or i < 0:
            return
        x = x[:N - i]
        a = (pan + 1) * np.pi / 4
        self.L[i:i + len(x)] += x * gain * np.cos(a)
        self.R[i:i + len(x)] += x * gain * np.sin(a)

    def st(self):
        return np.stack([self.L, self.R], 1)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, min(f, SR * 0.45), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return signal.sosfilt(signal.butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def fade(x, a=0.005, r=0.05):
    n = len(x)
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    e[-nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    return x * e


def piano(midi, dur=5.0, vel=0.6):
    """Felt piano: inharmonic partials on two slightly detuned strings, a soft hammer thump, dark and close."""
    f = hz(midi)
    t = np.arange(int(dur * SR)) / SR
    B = 0.00035 * (1 + max(0, midi - 60) / 30)
    x = np.zeros_like(t)
    tau0 = 5.5 * (0.5 ** ((midi - 48) / 26))
    for det in (-0.35, 0.4):
        fd = f * 2 ** (det / 1200)
        for k in range(1, 15):
            fk = k * fd * np.sqrt(1 + B * k * k)
            if fk > 7000:
                break
            amp = (1.0 / k ** (2.25 - 0.7 * vel)) * (0.55 if k == 2 else 1.0)
            x += amp * np.exp(-t / (tau0 / (1 + 0.42 * (k - 1)))) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28))
    x *= 1 - np.exp(-t / 0.006)                                  # felt: no hard attack
    thump = lp(rng.standard_normal(int(0.05 * SR)), 520) * np.exp(-np.arange(int(0.05 * SR)) / (0.012 * SR))
    x[:len(thump)] += thump * 0.5
    x = lp(x, 2600 + 2200 * vel)
    return fade(x, 0.002, 0.6) * vel * 0.16


def strings(midis, dur, attack=1.4, release=2.2, bright=1.0, voices=5):
    """A string section: detuned saws with slow, uncorrelated vibrato, opened by a filter that follows the swell."""
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    L, R = np.zeros(n), np.zeros(n)
    for mi in midis:
        for v in range(voices):
            det = rng.uniform(-9, 9)
            vib = 2.8 * np.sin(2 * np.pi * rng.uniform(4.6, 5.8) * t + rng.uniform(0, 6.28)) * np.minimum(1, t / 1.5)
            f = hz(mi) * 2 ** ((det + vib) / 1200)
            ph = 2 * np.pi * np.cumsum(f) / SR + rng.uniform(0, 6.28)
            s = np.zeros(n)
            for k in range(1, 13):                               # band-limited saw
                if hz(mi) * k > 9000:
                    break
                s += np.sin(k * ph) / k
            p = rng.uniform(-0.8, 0.8)
            L += s * np.cos((p + 1) * np.pi / 4)
            R += s * np.sin((p + 1) * np.pi / 4)
    env = np.minimum(1, t / attack) ** 1.6 * np.minimum(1, np.maximum(0, (dur + release - t) / release)) ** 1.5
    out = []
    for ch in (L, R):
        y = lp(ch, 900 * bright) * 0.6 + lp(ch, 2600 * bright) * 0.4 * env
        out.append(y * env / (len(midis) * voices) ** 0.5)
    return np.stack(out, 1) * 0.5


def pluck(midi, dur=0.9, bright=1800, vel=1.0):
    f = hz(midi)
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (5 + 3.2 * k)) / k ** 1.3 for k in range(1, 7))
    return fade(lp(x, bright), 0.003, 0.08) * 0.12 * vel


def bell(midi, dur=5.0, vel=1.0):
    f = hz(midi)
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for r, a, d in [(1.0, 1.0, 1.6), (2.0, 0.45, 1.1), (2.76, 0.28, 0.8), (5.4, 0.12, 0.45), (0.5, 0.25, 2.0)]:
        x += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d)
    return fade(x * (1 - np.exp(-t / 0.004)), 0.001, 0.3) * 0.05 * vel


def sub(midi, dur, attack=0.25, release=0.9):
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, (dur + release - t) / release))
    f = hz(midi)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * env * 0.22


def air(dur, f0, f1, peak=0.5, gain=1.0):
    """A breath of filtered noise that rises or falls: risers, whooshes, the room."""
    n = int(dur * SR)
    x = rng.standard_normal(n)
    t = np.arange(n) / n
    fc = f0 * (f1 / f0) ** t
    out = np.zeros(n)
    hop = 512
    zi = np.zeros((2, 2))
    for i in range(0, n, hop):                                   # a slowly moving band-pass
        c = fc[i]
        sos = signal.butter(2, [c * 0.6, min(c * 1.6, SR * 0.45)], 'band', fs=SR, output='sos')
        out[i:i + hop], zi = signal.sosfilt(sos, x[i:i + hop], zi=zi)
    env = np.where(t < peak, (t / peak) ** 2.2, ((1 - t) / (1 - peak)) ** 1.6)
    return out * env * 0.2 * gain


def heartbeat(vel=1.0):
    t = np.arange(int(0.5 * SR)) / SR
    f = 46 + 44 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13) * 0.42 * vel


def tick(f=3200, dec=0.008, body=900):
    t = np.arange(int(0.12 * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / dec) + 0.6 * np.sin(2 * np.pi * body * t) * np.exp(-t / (dec * 3))
    return x * 0.1


def hall(st, rt=3.4, pre=0.028, damp=5200, seed=3):
    """Convolution reverb with a synthetic hall: decaying noise whose highs die faster, different in each ear."""
    r = np.random.default_rng(seed)
    n = int(rt * 1.5 * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(st)
    for ch in range(2):
        nz = r.standard_normal(n)
        ir = lp(nz, damp) * np.exp(-6.9 * t / rt) + hp(lp(nz, 12000), damp) * np.exp(-6.9 * t / (rt * 0.42)) * 0.6
        ir[:int(0.004 * SR)] = 0
        for k in range(7):                                       # a few early reflections
            ir[int(r.uniform(0.006, 0.06) * SR)] += r.uniform(0.3, 0.8) * (1 if r.random() < .5 else -1)
        ir = np.concatenate([np.zeros(int(pre * SR)), ir])
        ir /= np.sqrt(np.sum(ir ** 2))
        out[:, ch] = signal.fftconvolve(st[:, ch], ir)[:len(st)]
    return out


# ------------------------------------------------------------------ the music
CH = {  # bass, pad voicing, arpeggio tones
    'D': ('D2', ['D3', 'A3', 'D4', 'F#4', 'A4'], ['D4', 'A4', 'F#5', 'E5', 'D5', 'A4']),
    'D/F#': ('F#2', ['F#3', 'A3', 'D4', 'A4'], ['F#4', 'A4', 'D5', 'E5', 'D5', 'A4']),
    'G': ('G2', ['G3', 'B3', 'D4', 'G4', 'A4'], ['G4', 'B4', 'D5', 'A5', 'G5', 'D5']),
    'Bm7': ('B1', ['B2', 'F#3', 'A3', 'D4', 'F#4'], ['B3', 'F#4', 'A4', 'D5', 'A4', 'F#4']),
    'Bm': ('B1', ['B2', 'F#3', 'B3', 'D4', 'F#4'], ['B3', 'F#4', 'B4', 'D5', 'F#5', 'D5']),
    'D/A': ('A2', ['A3', 'D4', 'F#4', 'A4'], ['A3', 'D4', 'F#4', 'A4', 'D5', 'F#5']),
    'Asus': ('A2', ['A3', 'D4', 'E4', 'A4'], ['A3', 'E4', 'A4', 'D5', 'E5', 'A4']),
    'A': ('A2', ['A3', 'C#4', 'E4', 'A4'], ['A3', 'E4', 'A4', 'C#5', 'E5', 'A4']),
    'Em7': ('E2', ['E3', 'G3', 'B3', 'D4', 'G4'], ['E4', 'G4', 'B4', 'D5', 'G5', 'B4']),
    'G/D': ('D2', ['D3', 'G3', 'B3', 'D4', 'G4'], ['G4', 'B4', 'D5', 'G5', 'D5', 'B4']),
}
PROG = [(0, 2, 'D'), (2, 2, 'D/F#'), (4, 2, 'G'),
        (6, 2, 'Bm7'), (8, 2, 'G'), (10, 2, 'D/A'), (12, 1, 'Asus'), (13, 1, 'A'),
        (14, 2, 'Bm'), (16, 2, 'G'), (18, 2, 'D'), (20, 2, 'A'),
        (22, 2, 'G'), (24, 2, 'D/F#'), (26, 2, 'Em7'), (28, 2, 'A'), (30, 1, 'Asus'),
        (31, 3, 'D'), (34, 2, 'G/D'), (36, 4, 'D')]

dry, wet = Bus(), Bus()     # wet goes to the hall


def both(t, x, gain, pan=0.0, send=0.5):
    dry.add(t, x, gain, pan)
    wet.add(t, x, gain * send, pan)


def st_add(bus, t, s, gain):
    i = int(t * SR)
    s = s[:N - i]
    bus.L[i:i + len(s)] += s[:, 0] * gain
    bus.R[i:i + len(s)] += s[:, 1] * gain


# piano: the motif, a falling third and a step home
P = [(0.0, 'D3', .5), (0.0, 'F#5', .62), (0.5, 'A3', .4), (0.5, 'E5', .5), (1.0, 'D4', .42), (1.0, 'D5', .55), (1.5, 'A3', .3),
     (2.0, 'F#3', .5), (2.0, 'A4', .55), (2.5, 'A3', .38), (2.5, 'D5', .5), (3.0, 'D4', .42), (3.0, 'E5', .58), (3.5, 'A3', .3),
     (4.0, 'G3', .52), (4.0, 'B4', .58), (4.5, 'D4', .4), (4.5, 'A4', .48), (5.0, 'G4', .5), (5.5, 'A4', .52), (5.5, 'D4', .35),
     (6.0, 'B2', .55), (6.0, 'F#5', .64), (6.5, 'D5', .5), (7.0, 'B4', .52), (7.5, 'A4', .46),
     (8.0, 'G2', .55), (8.0, 'B4', .56), (8.5, 'D5', .5), (9.0, 'G5', .62), (9.5, 'D5', .46),
     (10.0, 'A2', .55), (10.0, 'F#5', .64), (10.5, 'E5', .5), (11.0, 'D5', .54), (11.5, 'A4', .46),
     (12.0, 'A2', .5), (12.0, 'E5', .58), (12.5, 'D5', .5), (13.0, 'C#5', .56), (13.5, 'E5', .6),
     (14.0, 'B2', .6), (14.0, 'F#5', .66), (15.0, 'D5', .5), (16.0, 'G2', .58), (16.0, 'B5', .6), (17.0, 'G5', .5),
     (18.0, 'D3', .62), (18.0, 'A5', .66), (18.5, 'F#5', .5), (19.0, 'D5', .5), (20.0, 'A2', .6), (20.0, 'E5', .6), (21.0, 'C#5', .54), (21.5, 'E5', .6),
     (22.0, 'G2', .8), (22.0, 'G3', .7), (22.0, 'B5', .76), (23.0, 'D6', .6), (24.0, 'F#2', .72), (24.0, 'A5', .7), (25.0, 'F#5', .56),
     (26.0, 'E2', .72), (26.0, 'G5', .7), (27.0, 'B5', .6), (28.0, 'A2', .74), (28.0, 'A5', .72), (29.0, 'E5', .56), (30.0, 'D5', .5), (30.5, 'E5', .46),
     (31.0, 'D2', .7), (31.0, 'D3', .62), (31.0, 'F#5', .7), (31.0, 'A4', .5), (32.0, 'F#5', .5), (32.5, 'E5', .44), (33.0, 'D5', .5),
     (34.0, 'D3', .5), (34.0, 'B4', .52), (34.5, 'A4', .42), (35.0, 'G4', .46),
     (36.0, 'D2', .55), (36.0, 'A4', .5), (36.5, 'D5', .46), (37.0, 'F#5', .52), (38.5, 'D6', .3)]
for t, n, v in P:
    mi = m(n)
    hum = rng.uniform(-0.012, 0.012)                               # a human hand is never on the grid
    both(t + hum + 0.004 * (mi < 55), piano(mi, 6.0, v), 1.0, pan=(mi - 62) / 60, send=0.55)

# strings, bass, plucks, per chord
for b, ln, name in PROG:
    bass, padv, arp = CH[name]
    sec = 'A' if b < 6 else 'B' if b < 14 else 'C' if b < 22 else 'D' if b < 31 else 'E'
    level = {'A': 0.16, 'B': 0.34, 'C': 0.5, 'D': 0.95, 'E': 0.7}[sec]
    br = {'A': 0.7, 'B': 0.9, 'C': 1.15, 'D': 1.7, 'E': 1.2}[sec]
    voic = [m(x) for x in padv]
    if sec in 'DE':
        voic = voic + [voic[-1] + 12, voic[2] + 12]                 # the section opens up an octave
    s = strings(voic, ln + 0.3, attack=1.6 if sec in 'AB' else 0.9 if sec == 'C' else 0.5, release=2.6, bright=br)
    if not (sec == 'A' and b < 2):
        st_add(dry, b - 0.25, s, level * 0.55)
        st_add(wet, b - 0.25, s, level * 0.75)
    if sec in 'CDE':
        g = {'C': 0.6, 'D': 1.0, 'E': 0.8}[sec]
        both(b, sub(m(bass), ln, attack=0.08 if sec == 'D' else 0.3), g, send=0.05)
        cello = strings([m(bass) + 12], ln + 0.2, attack=0.5, release=1.6, bright=0.5, voices=3)
        st_add(dry, b, cello, 0.55 * g)
        st_add(wet, b, cello, 0.3 * g)
    step = {'A': None, 'B': 0.5, 'C': 0.25, 'D': 0.25, 'E': None}[sec]
    if step:
        k = 0
        tt = float(b)
        while tt < b + ln - 1e-6:
            note = m(arp[k % len(arp)]) + (12 if sec == 'D' and k % 4 == 3 else 0)
            acc = 1.0 if k % (2 if sec == 'B' else 4) == 0 else 0.62
            v = {'B': 0.55, 'C': 0.7 + 0.25 * (b - 14) / 8, 'D': 1.0}[sec] * acc
            pan = 0.55 * np.sin(k * 1.9)
            x = pluck(note, 0.9, bright=1500 if sec == 'B' else 2400 + 200 * (b - 14), vel=v)
            both(tt, x, 1.0, pan, send=0.5)
            both(tt + 0.375, x, 0.32, -pan, send=0.8)                # dotted echo
            tt += step
            k += 1

# the swell: pulse, bells, risers
for t in np.arange(22.0, 30.6, 1.0):
    dry.add(t, heartbeat(1.0 if t % 2 == 0 else 0.7), 1.0)
    dry.add(t + 0.5, heartbeat(0.32), 1.0)
for t in np.arange(18.0, 30.5, 0.25):                                # a soft shaker carries the middle
    v = (0.35 + 0.65 * (t - 18) / 12) * (1.0 if (t * 4) % 2 == 0 else 0.5)
    x = hp(rng.standard_normal(int(0.07 * SR)), 6500) * np.exp(-np.arange(int(0.07 * SR)) / (0.014 * SR)) * 0.035 * v
    both(t, x, 1.0, 0.3 * np.sin(t * 5), send=0.3)
for t, n, v in [(22.0, 'D6', 1.0), (22.0, 'G6', .8), (23.0, 'B6', .6), (24.0, 'A6', .9), (25.0, 'F#6', .6), (26.0, 'G6', .9), (27.0, 'B6', .6), (28.0, 'A6', .9), (29.0, 'E6', .7),
                (31.0, 'D6', 1.0), (31.0, 'A6', .8), (31.5, 'F#6', .5), (32.0, 'D7', .5), (33.0, 'A6', .45), (34.0, 'G6', .6), (35.0, 'B6', .4), (36.0, 'A6', .6), (36.5, 'D7', .4), (37.5, 'F#6', .35)]:
    both(t, bell(m(n), 5.0, v), 1.0, rng.uniform(-0.7, 0.7), send=0.9)
both(19.2, air(2.8, 500, 6500, peak=0.93, gain=0.9), 1.0, send=0.6)   # into the swell
both(28.6, air(2.4, 700, 8000, peak=0.92, gain=0.8), 1.0, send=0.6)   # into the resolution
both(22.0, lp(rng.standard_normal(SR * 2), 110) * np.exp(-np.arange(SR * 2) / (0.5 * SR)) * 0.5, 1.0, send=0.2)
both(31.0, lp(rng.standard_normal(SR * 3), 90) * np.exp(-np.arange(SR * 3) / (0.8 * SR)) * 0.42, 1.0, send=0.3)

music = dry.st() + hall(wet.st(), rt=3.6) * 0.75

# ------------------------------------------------------------------ sound design, on the picture's frames
F = lambda frame: frame / 24.0
sd, sw = Bus(), Bus()


def fx(t, x, gain=1.0, pan=0.0, send=0.35):
    sd.add(t, x, gain, pan)
    sw.add(t, x, gain * send, pan)


# the room: a low, slow air that thins out as night falls
room = lp(rng.standard_normal(N), 260) * 0.012 + bp(rng.standard_normal(N), 900, 2400) * 0.0012
room *= np.interp(np.arange(N) / SR, [0, 1.5, 28, 34, 46], [0, 1, 1, 0.45, 0.4])
sd.L += room
sd.R += np.roll(room, 911)
# A: graphite on paper while the sketch draws
for k in range(22):
    t0 = F(2) + k * (F(58) - F(2)) / 22 + rng.uniform(-0.03, 0.03)
    n = int(rng.uniform(0.09, 0.2) * SR)
    x = bp(rng.standard_normal(n), 1800, 5200) * np.sin(np.linspace(0, np.pi, n)) ** 0.7 * rng.uniform(0.012, 0.024)
    fx(t0, x, 1.0, -0.25 + rng.uniform(-0.1, 0.1), send=0.15)
fx(F(42), air(3.6, 180, 1400, peak=0.7, gain=0.5), 1.0, -0.2)         # the lens rises
# B: parts slide apart, each with a small machined click; the iris snaps shut and open
for i in range(11):
    d = abs(i - 5)
    fx(F(216 + (5 - d) * 2.2), tick(2600 + 220 * i, 0.006, 700 + 60 * i), 0.8, (i - 5) / 7, send=0.3)
    fx(F(350 + d), tick(1900 + 150 * i, 0.005, 520), 0.7, (i - 5) / 7, send=0.25)
fx(F(214), air(1.5, 400, 2600, peak=0.4, gain=0.45), 1.0)
for fr, f0 in [(268, 5200), (286, 4300)]:
    n = int(0.16 * SR)
    fx(F(fr), bp(rng.standard_normal(n), f0 * 0.6, f0) * np.exp(-np.arange(n) / (0.03 * SR)) * 0.07, 1.0, -0.2)
fx(F(338), air(1.2, 2600, 500, peak=0.3, gain=0.4), 1.0)
# C: the move through the glass, then the interface arriving
fx(F(384), air(2.0, 300, 5200, peak=0.95, gain=0.85), 1.0, send=0.5)
for i, fr in enumerate([434, 437, 440, 443, 446, 450, 456, 460]):
    fx(F(fr), pluck(m('A5') + [0, 2, 4, 7, 9, 12, 7, 4][i], 0.3, 3200, 0.5), 0.5, -0.5 + i * 0.14, send=0.5)
for i in range(7):                                                    # the bars count up
    fx(F(450 + i * 4 + 20), tick(1500 + 160 * i, 0.01, 400 + 40 * i), 0.5, -0.1 + i * 0.07)
# D: the card lifts off, flies, lands; bars stand; the city rises; windows light
fx(F(522), air(1.9, 500, 3000, peak=0.35, gain=0.7), 1.0, 0.2, send=0.5)
fx(F(596), lp(rng.standard_normal(int(0.5 * SR)), 180) * np.exp(-np.arange(int(0.5 * SR)) / (0.07 * SR)) * 0.5, 1.0, 0.2, send=0.2)
for i in range(7):
    fx(F(590 + i * 3 + 20), lp(rng.standard_normal(int(0.2 * SR)), 900) * np.exp(-np.arange(int(0.2 * SR)) / (0.02 * SR)) * 0.16, 0.9, -0.2 + i * 0.09, send=0.3)
    fx(F(590 + i * 3 + 20), tick(1200 + 90 * i, 0.012, 300) * 0.8, 0.9, -0.2 + i * 0.09, send=0.3)
for k in range(46):
    fx(F(624) + rng.uniform(0, 2.6), tick(rng.uniform(900, 1800), 0.01, rng.uniform(240, 420)) * rng.uniform(0.25, 0.6), 0.8, rng.uniform(-0.5, 0.7), send=0.4)
for k in range(60):                                                    # windows: tiny glass notes
    fx(F(670) + rng.uniform(0, 2.8) ** 1.0, bell(m(['D7', 'F#7', 'A7', 'E7', 'B6'][k % 5]), 1.6, rng.uniform(0.12, 0.3)), 1.0, rng.uniform(-0.8, 0.8), send=0.9)
# E: the iris opens
fx(F(784), air(3.6, 240, 2200, peak=0.75, gain=0.6), 1.0, 0.25, send=0.7)
for k in range(9):
    fx(F(790 + k * 8), tick(2200 + 130 * k, 0.007, 620) * 0.6, 0.8, 0.2 + rng.uniform(-0.1, 0.1), send=0.4)

sfx = sd.st() + hall(sw.st(), rt=2.2, seed=9) * 0.6


# ------------------------------------------------------------------ master
def master(x, target=-14.0, peak_db=-1.5):
    x = x[:int(DUR * SR)].copy()
    n = len(x)
    e = np.ones(n)
    fo = int(1.3 * SR)
    e[-fo:] = np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    fi = int(0.02 * SR)
    e[:fi] = np.linspace(0, 1, fi)
    x *= e[:, None]
    x = np.stack([hp(x[:, c], 28) for c in range(2)], 1)
    x = np.tanh(x * 0.9) / 0.9                                       # a touch of tape-like saturation
    meter = pyln.Meter(SR)
    pk = 10 ** (peak_db / 20)
    for _ in range(2):
        x *= 10 ** ((target - meter.integrated_loudness(x)) / 20)
        # transparent peak limiter: follow the loudest of the two channels over 5 ms, turn down only what exceeds the ceiling
        a = np.max(np.abs(x), axis=1)
        w = int(0.005 * SR)
        envl = np.maximum.reduce([np.roll(a, k) for k in range(-w, w + 1, 16)])
        envl = signal.sosfiltfilt(signal.butter(1, 60, 'low', fs=SR, output='sos'), envl)
        g = np.minimum(1.0, pk / np.maximum(envl, 1e-9))
        x = np.clip(x * g[:, None], -pk, pk)
    return x, meter.integrated_loudness(x)


mx, l1 = master(music + sfx * 0.9)
sf.write(os.path.join(HERE, 'mix.wav'), mx, SR, subtype='PCM_24')
mu, l2 = master(music)
sf.write(os.path.join(HERE, 'music.wav'), mu, SR, subtype='PCM_24')
sf.write(os.path.join(HERE, 'sfx.wav'), sfx[:int(DUR * SR)] * 0.9, SR, subtype='PCM_24')
print(f'mix {l1:.1f} LUFS  peak {20 * np.log10(np.max(np.abs(mx))):.1f} dBFS   music {l2:.1f} LUFS')
