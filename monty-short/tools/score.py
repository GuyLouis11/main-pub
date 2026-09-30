"""Original game-show score + sound design for the Monty Hall Short. Everything is synthesized here (no samples,
no licensed material). Hits come from the composition's own cue list (tools/cues.mjs -> assets/audio/cues.json),
so picture and sound stay locked. Music ducks -8 dB and effects -5 dB under the narration.

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
B = 60 / BPM                     # one beat
# A minor: Am | F | C | G   (bass root midi, chord tones)
PROG = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]


class Show(Kit):
    # ---------- drums ----------
    def kick(self):
        n = self.n(.4)
        return .95 * self.sweep(150, 44, .4, .35) * self.env(n, .11) + .25 * self.hp(self.noise(.4), 2000) * self.env(n, .003)

    def clap(self):
        out = np.zeros(self.n(.3))
        for k, d in enumerate((0, .011, .023)):
            i = self.n(d); b = self.bp(self.noise(.3), 900, 5000) * self.env(self.n(.3), .012 if k < 2 else .07)
            out[i:] += b[:len(out) - i] * (.7 if k < 2 else 1)
        return out

    def hat(self, open_=False):
        sec = .22 if open_ else .05
        return self.hp(self.noise(sec), 7500) * self.env(self.n(sec), .06 if open_ else .012)

    def snare(self):
        n = self.n(.25)
        return .6 * self.bp(self.noise(.25), 1500, 7000) * self.env(n, .05) + .4 * self.sine(190, .25) * self.env(n, .04)

    # ---------- tonal ----------
    def bass(self, f, sec):
        s = self.saw(f, sec, .003) + .6 * self.sine(f / 2, sec)
        n = len(s)
        return np.tanh(1.6 * self.lp(s, 1100)) * self.env(n, .35) * self.adsr(n, .004, .04)

    def stab(self, freqs, sec=.18, bright=3200):
        s = sum(self.saw(f, sec, .006) for f in freqs) / len(freqs)
        return self.lp(s, bright) * self.env(len(s), .09) * self.adsr(len(s), .003, .03)

    def brass(self, freqs, sec=.5):
        n = self.n(sec)
        t = np.arange(n) / SR
        s = sum(self.saw(f * (1 + .003 * np.sin(2 * np.pi * 5 * t)), sec, .004) for f in freqs) / len(freqs)
        return self.bp(s, 300, 3800) * self.adsr(n, .025, .12)

    # ---------- sfx ----------
    def slam(self):
        n = self.n(.9)
        body = np.tanh(2 * self.sweep(110, 38, .9, .4) * self.env(n, .16))
        clank = sum(self.sine(f, .9, self.rng.uniform(0, 6)) for f in (523, 811, 1267)) * self.env(n, .09) * .18
        return .9 * body + .5 * self.lp(self.noise(.9), 1800) * self.env(n, .03) + clank

    def pop(self):
        return self.sweep(380, 1100, .09, .6) * self.env(self.n(.09), .03)

    def ding(self):
        return .7 * self.bell(1318.5, 1.6, .5) + .45 * self.bell(1975.5, 1.6, .35)

    def bleat(self, sec=.75):
        n = self.n(sec)
        t = np.arange(n) / SR
        f = 390 * (1 + .06 * np.sin(2 * np.pi * 6.5 * t)) * (1 - .12 * t / sec)
        ph = 2 * np.pi * np.cumsum(f) / SR
        src = sum(np.sin(k * ph) / k for k in range(1, 18))
        am = .55 + .45 * np.abs(np.sin(2 * np.pi * 9 * t))          # the "a-a-a" flutter
        vowel = self.bp(src, 650, 1250) + .6 * self.bp(src, 2100, 2900)
        return vowel * am * self.adsr(n, .03, .2) * 1.6

    def thunk(self):
        return self.sub(170, 60, .18, .04) + .5 * np.pad(self.wood(420), (0, self.n(.18) - self.n(.15)))

    def select(self):
        return np.concatenate([self.blip(988, .09), self.blip(1480, .16)])

    def neon(self):
        n = self.n(.4)
        t = np.arange(n) / SR
        buzz = np.sign(np.sin(2 * np.pi * 120 * t)) * .3 + self.hp(self.noise(.4), 3000) * .4
        gate = (self.rng.random(n // 480 + 1) > .45).repeat(480)[:n]
        return self.bp(buzz, 150, 5000) * gate * self.env(n, .25)

    def scan(self, sec=1.1):
        n = self.n(sec)
        t = np.arange(n) / SR
        f = 900 + 700 * np.sin(np.pi * t / sec)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * (.5 + .5 * np.sin(2 * np.pi * 16 * t)) * self.adsr(n, .05, .2) * .5

    def drumroll(self, sec):
        out = np.zeros(self.n(sec + .3))
        t = 0.0
        while t < sec:
            g = .25 + .75 * (t / sec) ** 1.5
            s = self.snare() * g
            i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            t += .034 + self.rng.uniform(-.004, .004)
        return out

    def door(self):
        n = self.n(.7)
        creak = self.bp(self.saw(95, .7) * (1 + .5 * np.sin(2 * np.pi * 31 * np.arange(n) / SR)), 500, 2400) * self.adsr(n, .05, .3) * .5
        return creak + .8 * np.pad(self.whoosh(.5, 250, 2500), (0, n - self.n(.5)))

    def reveal(self):
        out = np.zeros(self.n(2.2))
        for k, m in enumerate((69, 73, 76, 81)):
            s = self.bell(midi(m + 12), 2.2, .7) * .45
            i = self.n(k * .045); out[i:] += s[:len(out) - i]
        return out + .3 * self.hp(self.noise(2.2), 6000) * self.env(self.n(2.2), .4)

    def buzzer(self, sec=.7):
        n = self.n(sec)
        t = np.arange(n) / SR
        s = np.sign(np.sin(2 * np.pi * 98 * t)) + np.sign(np.sin(2 * np.pi * 104 * t))
        return self.lp(s, 2200) * self.adsr(n, .01, .08) * .45

    def stamp(self):
        n = self.n(.5)
        return .9 * self.sub(120, 40, .5, .1) + .6 * self.lp(self.noise(.5), 1800) * self.env(n, .03)

    def ticks(self, sec, dt=.04, f=2300, g0=1.0, g1=.4, rise=0):
        out = np.zeros(self.n(sec + .1))
        t, k = 0.0, 0
        while t < sec:
            s = self.tick(f + rise * t / max(sec, 1e-3), .008) * (g0 + (g1 - g0) * t / sec)
            i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            t += dt; k += 1
        return out

    def hit(self):
        return .8 * self.boom(.35)[:self.n(1.2)] + np.pad(.5 * self.clap(), (0, self.n(1.2) - self.n(.3)))

    def marker(self, sec=.45):
        n = self.n(sec)
        return self.swept(sec, 2500, 5000, .3) * self.adsr(n, .02, .08) * (.7 + .3 * np.sin(2 * np.pi * 23 * np.arange(n) / SR))

    def flutter(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        return self.bp(self.noise(sec), 700, 4000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 13 * t))) * self.adsr(n, .2, .4) * .5

    def crt(self):
        n = self.n(1.0)
        whine = self.sweep(3000, 7800, 1.0, .3) * self.env(n, .35) * .12
        return np.pad(self.thunk(), (0, n - self.n(.18))) + whine + .25 * self.hp(self.noise(1.0), 2500) * self.env(n, .15)

    def compute(self, sec):
        out = np.zeros(self.n(sec + .1))
        t = 0.0
        while t < sec:
            f = self.rng.choice([880, 1175, 1318, 1568, 1760, 2093])
            L = .035
            s = np.sign(self.sine(f, L)) * self.adsr(self.n(L), .002, .01) * .22
            i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            t += .055
        return self.lp(out, 5000)

    def flip(self):
        return self.wood(self.rng.uniform(700, 1300)) * .8 + .3 * np.pad(self.card_snap(), (0, self.n(.15) - self.n(.06)))

    def card_snap(self):
        return self.bp(self.noise(.06), 2000, 8000) * self.env(self.n(.06), .01)

    def sparkle(self, sec):
        out = np.zeros(self.n(sec + 1.2))
        for k in range(14):
            s = self.bell(midi(self.rng.choice([81, 85, 88, 93, 97])), 1.0, .25) * .25
            i = self.n(k * sec / 14); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def fanfare(self):
        out = np.zeros(self.n(2.4))
        A = [midi(m) for m in (57, 61, 64, 69)]
        for t, sec in ((0, .14), (.17, .14), (.34, 1.6)):
            s = self.brass(A, sec) * (1.0 if sec > 1 else .8)
            i = self.n(t); out[i:i + len(s)] += s
        return out + .35 * np.pad(self.crash_(), (0, self.n(2.4) - self.n(2.0)))

    def crash_(self):
        return self.hp(self.noise(2.0), 4000) * self.env(self.n(2.0), .6)

    def confetti(self):
        n = self.n(1.4)
        return .7 * self.lp(self.noise(1.4), 3000) * self.env(n, .03) + self.crackle(1.4, 60, 10) * .6

    def cheer(self, sec=2.2):
        n = self.n(sec)
        t = np.arange(n) / SR
        x = sum(self.bp(self.noise(sec), lo, hi) * (.6 + .4 * np.sin(2 * np.pi * r * t + p)) for lo, hi, r, p in
                ((300, 1200, 3.1, 0), (600, 2400, 4.3, 1), (1500, 4000, 5.7, 2)))
        return x * self.adsr(n, .15, .9) * .45

    def fall(self):
        n = self.n(1.0)
        return self.swept(1.0, 3000, 250, .5) * np.sin(np.linspace(0, np.pi, n)) + .6 * np.pad(self.sub(80, 35, .6, .2), (0, n - self.n(.6)))


def main():
    cj = json.load(open(os.path.join(ROOT, "assets", "audio", "cues.json")))
    total, sc, vo, cues = cj["total"], cj["scenes"], cj["vo"], cj["cues"]
    k = Show(total + 2.5, seed=1990)
    N = k.n(total)
    mus, fx = Bus(k.N), Bus(k.N)
    at = lambda name: [c[0] for c in cues if c[1] == name]
    S = lambda i: sc[i]["start"]
    Eend = lambda i: sc[i]["end"]

    # ---------- music ----------
    t_wrong = at("buzzer")[0]                     # the drop
    t_roll = [c for c in cues if c[1] == "drumroll"][0]
    t_door3 = at("reveal")[0]
    t_car = at("fanfare")[0]
    t_win = at("win")[0]
    t_end = at("fall")[0]
    sim0 = [c for c in cues if c[1] == "simrun"][0][0]
    open98 = at("flip")

    def section(t):
        if t < S("reveal") + .2: return "full"
        if t < t_roll[0]: return "lite"
        if t < t_door3: return "none"
        if t < S("switch"): return "lite"
        if t < t_wrong - .45: return "half"
        if t < t_wrong: return "none"
        if t < S("erdos"): return "full"
        if t < S("hundred"): return "dark"
        if t < open98[0]: return "lite"
        if t < open98[-1] + .2: return "build"
        if t < S("math"): return "half"
        if t < t_car: return "lite"
        if t < sim0: return "full"
        if t < t_win: return "build"
        if t < t_end: return "full"
        return "none"

    t0 = 0.2                                        # the grid starts on the first slam
    kick_t = []
    step = B / 4
    for i in range(int((total - t0) / step) + 1):
        t = t0 + i * step
        if t >= total - .1: break
        sec = section(t)
        beat, sub = divmod(i, 4)
        bar = beat // 4
        root, chord = PROG[bar % 4]
        if sec == "none":
            continue
        # drums
        if sec in ("full", "build", "dark") and sub == 0:
            mus.add(t, k.kick(), .9); kick_t.append(t)
        if sec == "half" and sub == 0 and beat % 4 in (0, 3):
            mus.add(t, k.kick(), .8); kick_t.append(t)
        if sec in ("full", "dark") and sub == 0 and beat % 2 == 1:
            mus.add(t, k.clap(), .55, .05)
        if sec == "half" and sub == 0 and beat % 4 == 2:
            mus.add(t, k.clap(), .55)
        hat_on = {"full": sub in (1, 2, 3), "dark": sub == 2, "lite": sub == 2, "half": sub in (2,), "build": True}[sec]
        if hat_on:
            mus.add(t, k.hat(open_=(sub == 2 and sec == "full" and beat % 2 == 1)), .22 if sub != 2 else .3, .35 * (1 if sub % 2 else -1))
        if sec == "build":
            prog = 0 if t < open98[0] else min(1, (t - open98[0]) / max(.1, open98[-1] - open98[0]))
            if sub in (0, 2) or prog > .5:
                mus.add(t, k.snare(), .15 + .35 * prog, -.1)
        # bass: syncopated 8ths
        if sec != "lite" or sub == 0:
            pat = {0: 1, 2: 0, 3: 1} if sec in ("full", "build") else {0: 1}
            if sub in pat and (sec != "dark" or sub == 0):
                oct_ = 12 if (sub == 3 and beat % 2) else 0
                mus.add(t, k.bass(midi(root - 12 + oct_), step * (2 if sub == 0 else 1) * .95), .42)
        # stabs on the "and" of 2 and 4
        if sec == "full" and sub == 2 and beat % 2 == 1:
            mus.add(t, k.stab([midi(m) for m in chord] + [midi(chord[0] + 12)]), .28, .15)
        # arp
        if sec in ("full", "half", "build", "lite") and sub % 2 == 0 or sec == "build":
            if sec != "lite" or sub == 0:
                notes = chord + [c + 12 for c in chord]
                m = notes[(i // (1 if sec == "build" else 2)) % len(notes)] + 12
                mus.add(t, k.pluck(midi(m), .22, 3800), .1 if sec != "half" else .12, .5 * np.sin(i * .7))
    # pads under the whole thing (chord per bar)
    bar_len = 4 * B
    for bi in range(int((total - t0) / bar_len) + 1):
        t = t0 + bi * bar_len
        root, chord = PROG[bi % 4]
        sec = section(t + .1)
        if sec == "none": continue
        g = {"full": .1, "dark": .16, "half": .16, "lite": .14, "build": .12}[sec]
        mus.add(t, k.pad([midi(c) for c in chord], min(bar_len + .3, total - t), 500, 1400 if sec != "dark" else 700, .2, .3), g)
    # impacts that belong to the music
    mus.add(t_wrong, k.boom(.6), .7); mus.add(t_wrong, k.crash_(), .35)
    mus.add(t_car, k.crash_(), .3); mus.add(t_win, k.crash_(), .3)
    mus.add(t_wrong - .45, k.riser(.45, 500, 6000), .25)
    mus.add(t_end, k.boom(.5), .5)
    # sidechain pump on kicks
    pump = np.ones(k.N)
    for t in kick_t:
        i = k.n(t); L = k.n(.22)
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - .45 * np.exp(-np.arange(min(L, k.N - i)) / (.06 * SR)))
    mus.L *= pump; mus.R *= pump

    # ---------- sound effects ----------
    for t, name, g, pan, ex in cues:
        ex = ex or {}
        dur = ex.get("dur", .5)
        s = {
            "slam": k.slam, "pop": k.pop, "ding": k.ding, "bleat": k.bleat, "thunk": k.thunk, "select": k.select,
            "neon": k.neon, "stamp": k.stamp, "buzzer": k.buzzer, "door": k.door, "reveal": k.reveal, "hit": k.hit,
            "marker": k.marker, "crt": k.crt, "fanfare": k.fanfare, "confetti": k.confetti, "fall": k.fall,
            "whoosh": lambda: k.whoosh(.42, 300, 4200), "swoosh": lambda: k.whoosh(.28, 900, 6500),
            "tap": lambda: k.tick(1700, .012), "blip": lambda: k.blip(ex.get("f", 1200), .1), "scan": k.scan,
            "drumroll": lambda: k.drumroll(dur), "riser": lambda: k.riser(max(.2, dur), 400, 7000),
            "counter": lambda: k.ticks(dur, .035, 2600, 1.0, .5), "type": lambda: k.ticks(dur, .045, 1700, .8, .8),
            "paper": (lambda: k.paper(.18)) if ex.get("short") else (lambda: k.paper(.4)), "flutter": lambda: k.flutter(dur),
            "compute": lambda: k.compute(dur), "cascade": lambda: k.ticks(dur, .018, 1500, .6, 1.0, 2500),
            "flip": k.flip, "sparkle": lambda: k.sparkle(dur),
            "simrun": lambda: k.ticks(dur, .03, 2000, .3, 1.0, 1800) + np.pad(.5 * k.riser(dur, 500, 7000), (0, k.n(dur + .1) - k.n(dur))),
            "win": lambda: np.pad(k.reveal(), (0, k.n(2.4) - k.n(2.2))) + k.cheer(2.4),
        }[name]()
        base = {"slam": .9, "pop": .6, "ding": .5, "bleat": .55, "thunk": .6, "select": .45, "neon": .35, "stamp": .8,
                "buzzer": .6, "door": .7, "reveal": .5, "hit": .8, "marker": .5, "crt": .5, "fanfare": .75, "confetti": .5,
                "fall": .7, "whoosh": .55, "swoosh": .45, "tap": .5, "blip": .4, "scan": .35, "drumroll": .55, "riser": .35,
                "counter": .28, "type": .3, "paper": .45, "flutter": .35, "compute": .35, "cascade": .3, "flip": .35,
                "sparkle": .45, "simrun": .35, "win": .6}[name]
        fx.add(t, s, g * base, max(-1, min(1, pan)))

    mus.reverb(.14, 1.6, 6000); fx.reverb(.12, 1.4, 7000)
    # duck under the narration
    vo_on = np.zeros(k.N)
    for v in vo.values():
        vo_on[k.n(v["start"]):k.n(v["start"] + v["dur"])] = 1
    sm = uniform_filter1d(vo_on, k.n(.12))
    gm, gf = 10 ** (-8 * sm / 20), 10 ** (-5 * sm / 20)
    M = mus.stereo()[:N] * gm[:N, None]
    F = fx.stereo()[:N] * gf[:N, None]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    M *= 10 ** ((-21 - meter.integrated_loudness(M)) / 20)
    F *= 10 ** ((-20 - meter.integrated_loudness(F)) / 20)
    for name, x in (("music", M), ("sfx", F)):
        pk = np.abs(x).max()
        if pk > .8: x *= .8 / pk
        f = int(SR * .01); x[-f:] *= np.linspace(1, 0, f)[:, None]
        sf.write(os.path.join(ROOT, "assets", "audio", name + ".wav"), x.astype(np.float32), SR, subtype="PCM_16")
        print(name, f"{meter.integrated_loudness(x):.1f} LUFS  peak {20 * np.log10(np.abs(x).max()):.1f} dBFS")


if __name__ == "__main__":
    main()
