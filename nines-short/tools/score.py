"""Original dark-synthwave/trap score + sound design for the 0.999… = 1 Short. Everything is synthesized here
(no samples, no licensed material). Hits come from the composition's cue list (tools/cues.mjs -> assets/audio/cues.json).
Music ducks -8 dB and effects -5 dB under the narration.

  node tools/cues.mjs && python3 tools/score.py      -> assets/audio/music.wav, sfx.wav (48 kHz stereo)"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audiokit import Kit, Bus, SR  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = 120
B = 60 / BPM
# D minor: Dm | Bb | F | C   (bass root midi, chord tones)
PROG = [(38, [62, 65, 69]), (34, [62, 65, 70]), (41, [60, 65, 69]), (36, [60, 64, 67])]


def fit(x, n):
    return x[:n] if len(x) >= n else np.pad(x, (0, n - len(x)))


class Synth(Kit):
    # ---------- drums ----------
    def k808(self, dec=.45):
        n = self.n(.9)
        body = self.sweep(160, 42, .9, .25) * self.env(n, dec)
        return np.tanh(2.2 * body) * .9 + .3 * self.hp(self.noise(.9), 2500) * self.env(n, .003)

    def clap(self):
        out = np.zeros(self.n(.35))
        for k, d in enumerate((0, .012, .025)):
            i = self.n(d); b = self.bp(self.noise(.35), 1000, 6000) * self.env(self.n(.35), .014 if k < 2 else .09)
            out[i:] += b[:len(out) - i] * (.7 if k < 2 else 1)
        return out

    def hat(self, dec=.014):
        return self.hp(self.noise(.08), 8000) * self.env(self.n(.08), dec)

    def snare(self):
        n = self.n(.25)
        return .6 * self.bp(self.noise(.25), 1400, 7000) * self.env(n, .05) + .4 * self.sine(200, .25) * self.env(n, .04)

    # ---------- tonal ----------
    def bass(self, f, sec):
        n = self.n(sec)
        s = self.sine(f, sec) + .35 * self.sine(2 * f, sec) + .12 * self.saw(f, sec)
        return np.tanh(1.8 * s) * self.adsr(n, .006, .05) * (.55 + .45 * self.env(n, .5))

    def supersaw(self, freqs, sec, cut=1800):
        s = sum(self.saw(f, sec, .011) for f in freqs) / len(freqs)
        return self.lp(s, cut) * self.adsr(len(s), .08, .25)

    def pluck(self, f, sec=.25, bright=4200):
        s = self.saw(f, sec, .004) + .5 * np.sign(self.sine(f * 2, sec))
        return self.lp(s, bright) * self.env(len(s), .07) * self.adsr(len(s), .002, .04)

    # ---------- sfx ----------
    def impact(self):
        n = self.n(2.4)
        sub = np.tanh(2.5 * self.sweep(120, 30, 2.4, .35) * self.env(n, .5)) * .9
        crash = self.hp(self.noise(2.4), 3500) * self.env(n, .7) * .35
        return sub + crash + .5 * self.lp(self.noise(2.4), 1500) * self.env(n, .05)

    def key(self, f):
        return fit(self.tick(2400, .006), self.n(.12)) * .6 + .5 * fit(self.blip(f, .12), self.n(.12))

    def slash(self):
        s = self.whoosh(.22, 2000, 9000)
        z = self.sweep(3200, 5200, .22, 1) * self.env(self.n(.22), .08) * .25
        return s + z

    def chime(self):
        out = np.zeros(self.n(2.0))
        for k, m in enumerate((74, 77, 81, 86)):
            b = self.bell(midi(m + 12), 2.0, .6) * .4
            i = self.n(k * .05); out[i:] += b[:len(out) - i]
        return out

    def boing(self):
        n = self.n(.5)
        t = np.arange(n) / SR
        f = 180 + 260 * np.exp(-t / .12) * (1 + .3 * np.sin(2 * np.pi * 14 * t))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * self.env(n, .18)

    def buzz(self):
        n = self.n(.45)
        t = np.arange(n) / SR
        s = np.sign(np.sin(2 * np.pi * 92 * t)) + np.sign(np.sin(2 * np.pi * 97 * t))
        return self.lp(s, 2400) * self.adsr(n, .01, .06) * .4

    def bloop(self, f):
        return self.sweep(f * 1.8, f * .7, .14, .5) * self.env(self.n(.14), .05)

    def thud(self):
        return self.sub(130, 45, .5, .1) + .4 * fit(self.lp(self.noise(.1), 900), self.n(.5)) * self.env(self.n(.5), .02)

    def zap(self):
        n = self.n(.4)
        return (self.lp(self.sweep(2400, 200, .4, .5), 6000) + .4 * self.hp(self.noise(.4), 3000)) * self.env(n, .12)

    def shatter(self):
        n = self.n(1.4)
        out = self.hp(self.noise(1.4), 4000) * self.env(n, .25) * .5
        for k in range(10):
            f = self.rng.uniform(2500, 7500); s = self.sine(f, .4) * self.env(self.n(.4), .06) * .2
            i = self.n(self.rng.uniform(0, .5)); out[i:i + len(s)] += s[:len(out) - i]
        return out + .5 * fit(self.thud(), n)

    def glitch(self, sec=.35):
        n = self.n(sec)
        x = np.sign(self.noise(sec)) * ((np.arange(n) // 360) % 3 == 0)
        return self.bp(x.astype(float), 500, 7000) * .5 + .3 * np.sign(self.sine(self.rng.uniform(300, 900), sec)) * ((np.arange(n) // 900) % 2)

    def lock(self):
        out = np.zeros(self.n(.8))
        for t0, f in ((0, 1760), (.12, 1760), (.3, 2637)):
            b = self.blip(f, .1); i = self.n(t0); out[i:i + len(b)] += b
        return out + .25 * fit(self.sweep(300, 1400, .5, .7) * self.adsr(self.n(.5), .05, .1), self.n(.8))

    def heartbeat(self):
        out = np.zeros(self.n(1.1))
        for t0, g in ((0, 1), (.2, .7), (.72, .9)):
            s = self.sub(75, 40, .25, .07) * g; i = self.n(t0); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def zoom(self, sec, f):
        n = self.n(sec)
        tone = self.sweep(f, f * 3.2, sec, 1.6) * self.adsr(n, .02, .06) * .25
        return tone + self.whoosh(sec, 400, 6000) * .6

    def ticks(self, sec, dt=.04, f=2300, g0=1.0, g1=.4):
        out = np.zeros(self.n(sec + .1))
        t = 0.0
        while t < sec:
            s = self.tick(f, .008) * (g0 + (g1 - g0) * t / sec)
            i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            t += dt
        return out

    def stamp(self):
        n = self.n(.5)
        return .9 * self.sub(120, 40, .5, .1) + .6 * self.lp(self.noise(.5), 1800) * self.env(n, .03)

    def riot(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        x = sum(self.bp(self.noise(sec), lo, hi) * (.6 + .4 * np.sin(2 * np.pi * r * t + p)) for lo, hi, r, p in
                ((200, 900, 3.3, 0), (500, 2000, 5.1, 1), (1200, 3600, 7.3, 2)))
        return x * self.adsr(n, .1, .5) * .5

    def suck(self):
        r = self.riser(.4, 300, 6000)
        return np.concatenate([r, fit(self.pop_(), self.n(.2))])

    def pop_(self):
        return self.sweep(900, 300, .08, .6) * self.env(self.n(.08), .03)

    def stream(self, sec):
        out = np.zeros(self.n(sec + .3))
        for k in range(12):
            b = self.blip(midi(86 + k), .1) * .3; i = self.n(k * sec / 12); out[i:i + len(b)] += b[:len(out) - i]
        return out


def main():
    cj = json.load(open(os.path.join(ROOT, "assets", "audio", "cues.json")))
    total, sc, vo, cues = cj["total"], cj["scenes"], cj["vo"], cj["cues"]
    k = Synth(total + 2.5, seed=999)
    N = k.n(total)
    mus, fx = Bus(k.N), Bus(k.N)
    at = lambda name: [c[0] for c in cues if c[1] == name]
    S = lambda i: sc[i]["start"]
    imp = at("impact")
    drop1, t_lock, t_hb, t_suck = imp[0], at("lock")[0], at("heartbeat")[0], at("suck")[0]
    t_nothing = [t for t in imp if S("between") < t < S("gap")][0]
    t_zero = [t for t in imp if S("gap") < t < S("settled")][0]
    t_killer = [t for t in imp if S("killer") < t < S("between")][0]
    zooms = at("zoom")

    def section(t):
        if t < drop1 - .02: return "intro"
        if t < S("proof1") + .2: return "full"
        if t < S("killer") + .1: return "think"
        if t < t_killer: return "tense"
        if t < S("between") + .2: return "half"
        if t < t_hb: return "sparse"
        if t < t_nothing: return "none"
        if t < zooms[0]: return "half"
        if t < t_zero: return "build"
        if t < t_suck: return "full"
        return "none"

    t0, step, kick_t = 0.0, B / 4, []
    for i in range(int(total / step) + 1):
        t = t0 + i * step
        if t >= total - .05: break
        sec = section(t)
        beat, sub = divmod(i, 4)
        bar = beat // 4
        root, chord = PROG[bar % 4]
        if sec == "none": continue
        pan = .35 * (1 if sub % 2 else -1)
        # drums
        if sec == "full":
            if sub == 0 and beat % 4 in (0, 2) or (sub == 3 and beat % 4 == 1): mus.add(t, k.k808(), .85); kick_t.append(t)
            if sub == 0 and beat % 2 == 1: mus.add(t, k.clap(), .5)
            if sub % 2 == 1 or (beat % 4 == 3 and sub in (2, 3)): mus.add(t, k.hat(), .2, pan)
            if beat % 8 == 7 and sub in (1, 2, 3):
                for r in range(2): mus.add(t + r * step / 2, k.hat(.008), .14, pan)   # trap roll
        elif sec in ("think", "half"):
            if sub == 0 and beat % 4 == 0: mus.add(t, k.k808(.6), .75); kick_t.append(t)
            if sub == 0 and beat % 4 == 2: mus.add(t, k.clap(), .42)
            if sub == 2: mus.add(t, k.hat(), .16, pan)
        elif sec == "build":
            prog = min(1, (t - zooms[0]) / max(.1, t_zero - zooms[0]))
            if sub == 0: mus.add(t, k.k808(.3), .6); kick_t.append(t)
            if sub in (0, 2) or prog > .45: mus.add(t, k.snare(), .15 + .4 * prog)
            if prog > .75: mus.add(t + step / 2, k.snare(), .2 + .3 * prog)
            mus.add(t, k.hat(), .12, pan)
        elif sec == "intro" and sub == 2:
            mus.add(t, k.hat(), .1, pan)
        elif sec == "tense" and sub == 0:
            mus.add(t, k.hat(.03), .1)
        # 808 bass
        if sec in ("full", "build") and sub == 0 and beat % 2 == 0:
            mus.add(t, k.bass(midi(root - 12), B * 1.9), .5)
        if sec in ("think", "half") and sub == 0 and beat % 4 == 0:
            mus.add(t, k.bass(midi(root - 12), B * 3.8), .45)
        # arp
        notes = chord + [c + 12 for c in chord]
        if sec in ("intro", "think", "full", "build", "half", "sparse") and (sub % 2 == 0 or sec in ("think", "build")):
            m = notes[(i // (1 if sec in ("think", "build") else 2)) % len(notes)] + 12
            g = {"intro": .09, "think": .11, "full": .08, "build": .1, "half": .1, "sparse": .07}[sec]
            mus.add(t, k.pluck(midi(m)), g, .5 * np.sin(i * .6))
    # pads
    bar_len = 4 * B
    for bi in range(int(total / bar_len) + 1):
        t = bi * bar_len
        root, chord = PROG[bi % 4]
        sec = section(t + .1)
        if sec == "none": continue
        g = {"intro": .16, "full": .1, "think": .13, "tense": .16, "half": .13, "sparse": .16, "build": .1}[sec]
        mus.add(t, k.supersaw([midi(c) for c in chord] + [midi(root)], min(bar_len + .3, total - t), 1400 if sec != "tense" else 700), g)
    # drones and swells
    mus.add(t_lock - .2, k.pad([midi(38), midi(45)], t_killer - t_lock + .6, 300, 1500, .3, .3), .25)
    mus.add(t_hb - .3, k.pad([midi(38), midi(50)], t_nothing - t_hb + .6, 200, 600, .2, .3), .22)
    mus.add(drop1 - 1.2, k.riser(1.2, 400, 7000), .25)
    mus.add(t_nothing - .6, k.riser(.6, 600, 8000), .2)
    for t in imp: mus.add(t, k.hp(k.noise(2.0), 4000) * k.env(k.n(2.0), .6), .25)
    # sidechain pump
    pump = np.ones(k.N)
    for t in kick_t:
        i = k.n(t); L = min(k.n(.25), k.N - i)
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - .5 * np.exp(-np.arange(L) / (.07 * SR)))
    mus.L *= pump; mus.R *= pump

    # ---------- sound effects ----------
    for t, name, g, pan, ex in cues:
        ex = ex or {}
        dur = ex.get("dur", .5)
        f = ex.get("f", 1000)
        s = {
            "key": lambda: k.key(f), "riser": lambda: k.riser(max(.2, dur), 400, 7000), "impact": k.impact,
            "whoosh": lambda: k.whoosh(.4, 300, 4500), "swoosh": lambda: k.whoosh(.26, 900, 7000), "slash": k.slash,
            "chime": k.chime, "boing": k.boing, "buzz": k.buzz, "bloop": lambda: k.bloop(f), "counter": lambda: k.ticks(dur, .035, 2600),
            "pop": k.pop_, "blip": lambda: k.blip(f, .1), "thud": k.thud, "tick": lambda: k.tick(ex.get("f", 2200), .01),
            "slide": lambda: k.whoosh(.35, 600, 3000), "zap": k.zap, "shatter": k.shatter, "glitch": lambda: k.glitch(),
            "lock": k.lock, "scan": lambda: k.swept(dur, 800, 2600, .2) * k.adsr(k.n(dur), .1, .2) * .6, "heartbeat": k.heartbeat,
            "zoom": lambda: k.zoom(max(.1, dur), f), "type": lambda: k.ticks(dur, .05, 1800, .7, .9), "stamp": k.stamp,
            "riot": lambda: k.riot(dur), "suck": k.suck, "stream": lambda: k.stream(dur),
        }[name]()
        base = {"key": .45, "riser": .35, "impact": .9, "whoosh": .45, "swoosh": .4, "slash": .55, "chime": .45, "boing": .55,
                "buzz": .55, "bloop": .45, "counter": .28, "pop": .55, "blip": .4, "thud": .7, "tick": .45, "slide": .5, "zap": .45,
                "shatter": .7, "glitch": .45, "lock": .5, "scan": .3, "heartbeat": .9, "zoom": .4, "type": .3, "stamp": .8,
                "riot": .5, "suck": .6, "stream": .35}[name]
        fx.add(t, s, g * base, max(-1, min(1, pan)))

    mus.reverb(.16, 1.8, 6500); fx.reverb(.12, 1.4, 7000)
    vo_on = np.zeros(k.N)
    for v in vo.values():
        vo_on[k.n(v["start"]):k.n(v["start"] + v["dur"])] = 1
    sm = uniform_filter1d(vo_on, k.n(.12))
    M = mus.stereo()[:N] * (10 ** (-8 * sm / 20))[:N, None]
    F = fx.stereo()[:N] * (10 ** (-5 * sm / 20))[:N, None]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    M *= 10 ** ((-21 - meter.integrated_loudness(M)) / 20)
    F *= 10 ** ((-20 - meter.integrated_loudness(F)) / 20)
    for name, x in (("music", M), ("sfx", F)):
        pk = np.abs(x).max()
        if pk > .8: x *= .8 / pk
        fl = int(SR * .01); x[-fl:] *= np.linspace(1, 0, fl)[:, None]
        sf.write(os.path.join(ROOT, "assets", "audio", name + ".wav"), x.astype(np.float32), SR, subtype="PCM_16")
        print(name, f"{meter.integrated_loudness(x):.1f} LUFS  peak {20 * np.log10(np.abs(x).max()):.1f} dBFS")


if __name__ == "__main__":
    main()
