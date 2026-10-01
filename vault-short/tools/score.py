"""Original "heist noir" score + sound design for The Richest Room on Earth. Everything is synthesized here (no samples,
no licensed material). Hits come from the composition's cue list (tools/cues.mjs -> assets/audio/cues.json).

Music: 96 BPM, C minor. Ticking-clock hats, a low pizzicato ostinato, sub pulse and a brass-like pad that swells on
the reveals. It drops to nothing before the twist (only a heartbeat), then comes back bigger for the payoff.
Room tone per scene: night street (hook/outro), subway rumble on the way down, vault air-handling hum inside.
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
BPM = 96
B = 60 / BPM
# C minor: Cm | Ab | Fm | G   (bass root midi, chord tones)
PROG = [(36, [60, 63, 67]), (32, [60, 63, 68]), (29, [60, 65, 68]), (31, [59, 62, 67])]


def fit(x, n):
    return x[:n] if len(x) >= n else np.pad(x, (0, n - len(x)))


class Synth(Kit):
    # ---------- drums ----------
    def kick(self, dec=.32):
        n = self.n(.7)
        return np.tanh(2.0 * self.sweep(140, 44, .7, .3) * self.env(n, dec)) * .9 + .25 * self.hp(self.noise(.7), 3000) * self.env(n, .003)

    def hat(self, dec=.012):
        return self.hp(self.noise(.08), 7500) * self.env(self.n(.08), dec)

    def clock(self):                       # the ticking-clock hat: a woody high tick
        return fit(self.wood(2400), self.n(.15)) * .6 + .4 * fit(self.hat(.006), self.n(.15))

    def rim(self):
        n = self.n(.12)
        return (self.bp(self.noise(.12), 1500, 5000) * self.env(n, .012) + .5 * self.sine(820, .12) * self.env(n, .02))

    def timp(self, f=55):
        n = self.n(1.6)
        return np.tanh(1.6 * (self.sweep(f * 1.5, f, 1.6, .2) * self.env(n, .45) + .3 * self.lp(self.noise(1.6), 300) * self.env(n, .05)))

    # ---------- tonal ----------
    def pizz(self, f):
        n = self.n(.35)
        s = self.sine(f, .35) + .4 * self.sine(2 * f, .35) * self.env(n, .05) + .2 * self.sine(3 * f, .35) * self.env(n, .03)
        return s * self.env(n, .09) * self.adsr(n, .002, .03)

    def subp(self, f, sec):
        n = self.n(sec)
        return np.tanh(1.5 * (self.sine(f, sec) + .25 * self.sine(2 * f, sec))) * self.adsr(n, .01, .08) * (.5 + .5 * self.env(n, .35))

    def brass(self, freqs, sec, c0=500, c1=1800):
        return self.pad(freqs, sec, c0, c1, attack=min(.6, sec * .4), release=min(.5, sec * .3), det=.004)

    # ---------- sfx ----------
    def impact(self):
        n = self.n(2.4)
        sub = np.tanh(2.5 * self.sweep(110, 30, 2.4, .35) * self.env(n, .5)) * .9
        return sub + self.hp(self.noise(2.4), 3500) * self.env(n, .6) * .3 + .5 * self.lp(self.noise(2.4), 1500) * self.env(n, .05)

    def metal(self, f0, sec, dec, parts=((1, 1), (2.76, .6), (5.4, .4), (8.93, .25), (1.51, .5))):
        n = self.n(sec)
        return sum(a * self.sine(f0 * m, sec, self.rng.uniform(0, 6)) * self.env(n, dec / (1 + .3 * k)) for k, (m, a) in enumerate(parts)) / 2.2

    def clang(self):                       # 90-ton door slamming home: sub thump + low metal ring + debris
        n = self.n(3.0)
        return (.9 * fit(self.impact(), n) + .55 * self.metal(72, 3.0, .9) + .25 * self.metal(310, 3.0, .35)
                + .2 * self.hp(self.noise(3.0), 2000) * self.env(n, .08))

    def clank(self):                       # a 27-lb bar on metal / bars knocking
        n = self.n(.8)
        return .7 * self.metal(620, .8, .12) + .5 * self.sub(160, 60, .8, .06) + .3 * self.bp(self.noise(.8), 1500, 6000) * self.env(n, .01)

    def coins(self):
        out = np.zeros(self.n(1.6))
        for k in range(22):
            s = self.metal(self.rng.uniform(2500, 5200), .3, .05, ((1, 1), (2.4, .5), (3.9, .3))) * self.rng.uniform(.3, 1)
            i = self.n(self.rng.uniform(0, 1.1) ** 1.5); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def rumble(self, sec):
        n = self.n(sec)
        x = self.lp(self.noise(sec), 140) * 3 + .3 * self.bp(self.noise(sec), 200, 700)
        return x * self.adsr(n, min(.3, sec / 3), min(.5, sec / 3))

    def train(self):
        n = self.n(1.4)
        t = np.arange(n) / SR
        clack = np.zeros(n)
        for k in range(8):
            s = self.wood(300) * .5; i = self.n(.1 + k * .14); clack[i:i + len(s)] += s[:n - i]
        body = self.bp(self.noise(1.4), 120, 1800) * 1.4
        return (body + clack) * np.sin(np.pi * t / t[-1]) ** 1.2

    def shimmer(self):
        out = np.zeros(self.n(2.2))
        for k, m in enumerate((79, 84, 86, 91, 96)):
            b = self.bell(midi(m), 2.2, .5) * .25; i = self.n(k * .06); out[i:] += b[:len(out) - i]
        return out + .3 * fit(self.riser(.5, 2000, 9000)[::-1], self.n(2.2))

    def stack(self, sec):
        out = np.zeros(self.n(sec + .5))
        k = 0; t = 0.0
        while t < sec:
            s = self.clank() * (.35 + .25 * (k % 2)); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            k += 1; t += .11 + .05 * np.sin(k)
        return out

    def creak(self):
        n = self.n(.9)
        t = np.arange(n) / SR
        f = 140 + 60 * np.sin(2 * np.pi * 1.3 * t)
        s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (1 + .5 * np.sin(2 * np.pi * 31 * t))
        return self.bp(s, 300, 2500) * self.adsr(n, .1, .2) * .25

    def grind(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        return (self.bp(self.noise(sec), 80, 600) * (1 + .4 * np.sin(2 * np.pi * 9 * t)) * 1.2 + .3 * self.sub(60, 40, sec, sec)) * self.adsr(n, .1, .05)

    def fall(self):
        return self.sweep(1800, 700, .3, 1.2) * self.adsr(self.n(.3), .05, .05) * .3

    def spot(self):                        # spotlight snapping on
        n = self.n(1.2)
        return .8 * fit(self.thud(), n) + .3 * self.hum(1.2, 120) * self.env(n, .3)

    def thud(self):
        return self.sub(130, 45, .5, .1) + .4 * fit(self.lp(self.noise(.1), 900), self.n(.5)) * self.env(self.n(.5), .02)

    def cart(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        roll = self.bp(self.noise(sec), 100, 900) * (1 + .5 * np.sin(2 * np.pi * 7 * t)) * .9
        squeak = .1 * self.sine(2200 + 200 * np.sin(t * 9).mean(), sec) * (np.sin(2 * np.pi * 3.5 * t) > .97)
        return (roll + squeak) * self.adsr(n, .08, .15)

    def flip(self):
        out = np.zeros(self.n(.4))
        for k in range(5):
            s = self.tick(3000 - k * 200, .006) * .6; i = self.n(k * .03); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def printer(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        buzz = self.bp(np.sign(np.sin(2 * np.pi * 180 * t)), 400, 3000) * .25
        gate = (np.sin(2 * np.pi * 14 * t) > -.2).astype(float)
        return (buzz * gate + .3 * self.bp(self.noise(sec), 2000, 6000) * gate) * self.adsr(n, .02, .05)

    def stamp(self):
        n = self.n(.5)
        return .9 * self.sub(120, 40, .5, .1) + .6 * self.lp(self.noise(.5), 1800) * self.env(n, .03)

    def heartbeat(self):
        out = np.zeros(self.n(1.1))
        for t0, g in ((0, 1), (.2, .7)):
            s = self.sub(75, 40, .25, .07) * g; i = self.n(t0); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def zoom(self, sec, f):
        n = self.n(sec)
        return self.sweep(f, f * 3.2, sec, 1.6) * self.adsr(n, .02, .06) * .25 + self.whoosh(sec, 400, 6000) * .6

    def ticks(self, sec, dt=.04, f=2300, g0=1.0, g1=.4):
        out = np.zeros(self.n(sec + .1)); t = 0.0
        while t < sec:
            s = self.tick(f, .008) * (g0 + (g1 - g0) * t / sec); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]; t += dt
        return out

    def chime(self):
        out = np.zeros(self.n(2.0))
        for k, m in enumerate((72, 75, 79, 84)):
            b = self.bell(midi(m + 12), 2.0, .6) * .4; i = self.n(k * .05); out[i:] += b[:len(out) - i]
        return out

    def lock(self):
        out = np.zeros(self.n(.6))
        for t0 in (0, .05):
            s = self.metal(1900, .2, .03, ((1, 1), (2.3, .5))) * .7 + .4 * fit(self.tick(1200, .01), self.n(.2)); i = self.n(t0); out[i:i + len(s)] += s
        return out

    def slash(self):
        return self.whoosh(.22, 2000, 9000) + self.sweep(3200, 5200, .22, 1) * self.env(self.n(.22), .08) * .25

    def bloop(self, f):
        return self.sweep(f * 1.8, f * .7, .14, .5) * self.env(self.n(.14), .05)

    def pop_(self):
        return self.sweep(900, 300, .08, .6) * self.env(self.n(.08), .03)

    # ---------- room tone ----------
    def street(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        traffic = self.lp(self.noise(sec), 500) * (1.6 + .6 * np.sin(2 * np.pi * .21 * t)) + .4 * self.bp(self.noise(sec), 600, 2500) * (.5 + .5 * np.sin(2 * np.pi * .07 * t + 1))
        return traffic * .5 + .5 * self.wind(sec)

    def hvac(self, sec):
        return .5 * self.hum(sec, 60) * .25 + .6 * self.lp(self.noise(sec), 900) * self.adsr(self.n(sec), .5, .5)


def main():
    cj = json.load(open(os.path.join(ROOT, "assets", "audio", "cues.json")))
    total, sc, vo, cues = cj["total"], cj["scenes"], cj["vo"], cj["cues"]
    k = Synth(total + 3.0, seed=1973)
    N = k.n(total)
    mus, fx, amb = Bus(k.N), Bus(k.N), Bus(k.N)
    S = lambda i: sc[i]["start"]
    E = lambda i: sc[i]["end"]
    at = lambda name: [c[0] for c in cues if c[1] == name]
    t_arrive = [c[0] for c in cues if c[1] == "shimmer"][0]
    t_hb = at("heartbeat")[0]
    t_clang = at("clang")[0]

    def section(t):
        if t < t_arrive - .02: return "pre"            # the descent: only a pulse under the rumble
        if t < S("door"): return "full"
        if t < t_clang + .1: return "tense"
        if t < S("stack"): return "half"
        if t < S("twist") - .05: return "full"
        if t < S("pay") + .1: return "none"             # silence before the twist; heartbeat only
        if t < S("rent"): return "big"
        if t < S("outro"): return "half"
        return "out"

    step, kick_t = B / 4, []
    for i in range(int(total / step) + 1):
        t = i * step
        if t >= total - .05: break
        sec = section(t)
        beat, sub = divmod(i, 4)
        bar = beat // 4
        root, chord = PROG[bar % 4]
        if sec == "none": continue
        pan = .3 * (1 if sub % 2 else -1)
        if sec in ("full", "big"):
            if sub == 0 and beat % 2 == 0 or (sub == 2 and beat % 4 == 3): mus.add(t, k.kick(), .8); kick_t.append(t)
            if sub == 0 and beat % 2 == 1: mus.add(t, k.rim(), .45)
            if sub in (1, 3): mus.add(t, k.clock(), .16, pan)
            if sec == "big" and sub == 2: mus.add(t, k.hat(), .12, -pan)
        elif sec in ("half", "tense"):
            if sub == 0 and beat % 4 == 0: mus.add(t, k.kick(.45), .7); kick_t.append(t)
            if sub in (0, 2): mus.add(t, k.clock(), .13, pan)
        elif sec in ("pre", "out") and sub == 0:
            mus.add(t, k.clock(), .1, pan)
        # sub pulse (8ths) + pizzicato ostinato
        if sec in ("full", "big", "half", "tense", "pre") and sub in (0, 2):
            mus.add(t, k.subp(midi(root), step * 1.8), .32 if sec != "pre" else .22)
        if sec in ("full", "big", "half") and sub % 2 == 0:
            pat = [0, 2, 1, 2, 0, 2, 1, 3] if sec == "big" else [0, 2, 1, 2]
            tones = chord + [chord[0] + 12]
            m = tones[pat[(i // 2) % len(pat)] % len(tones)]
            mus.add(t, k.pizz(midi(m)), .2 if sec == "big" else .16, .4 * np.sin(i * .7))
        if sec == "tense" and sub == 0 and beat % 2 == 0:
            mus.add(t, k.pizz(midi(chord[0] + 1)), .14)                       # the semitone rub under the cylinder
    # brass pads per bar
    bar_len = 4 * B
    for bi in range(int(total / bar_len) + 1):
        t = bi * bar_len
        root, chord = PROG[bi % 4]
        sec = section(t + .1)
        if sec in ("none", "pre"): continue
        g = {"full": .12, "big": .16, "half": .1, "tense": .12, "out": .1}[sec]
        mus.add(t, k.brass([midi(c - 12) for c in chord] + [midi(root)], min(bar_len + .3, total - t), 400, 1500 if sec != "big" else 2200), g)
    # swells on the reveals + timpani on the big hits
    for t in at("impact") + at("stamp"):
        mus.add(t, k.timp(49 if t > S("pay") else 55), .45)
    mus.add(t_arrive - 1.0, k.riser(1.0, 300, 6000), .2)
    mus.add(S("pay") - .9, k.riser(.9, 400, 8000), .25)
    mus.add(t_hb - .2, k.pad([midi(36), midi(43)], S("pay") - t_hb + .5, 150, 500, .2, .3), .22)
    # sidechain
    pump = np.ones(k.N)
    for t in kick_t:
        i = k.n(t); L = min(k.n(.22), k.N - i)
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - .4 * np.exp(-np.arange(L) / (.07 * SR)))
    mus.L *= pump; mus.R *= pump

    # ---------- room tone per scene ----------
    hook_end, outro_s = E("hook"), S("outro")
    amb.add(0, k.street(1.4) * np.linspace(1, 0, k.n(1.4)), .5)                            # street at frame 0 (matches the loop end)
    amb.add(outro_s + 1.6, k.street(total - outro_s - 1.6 + .2) * k.adsr(k.n(total - outro_s - 1.4), 1.0, .01), .5)
    vault_on = [(t_arrive - .3, S("twist")), (S("pay"), outro_s + 1.2)]
    for a, b in vault_on:
        amb.add(a, k.hvac(b - a), .35)

    # ---------- sound effects ----------
    for t, name, g, pan, ex in cues:
        ex = ex or {}
        dur = ex.get("dur", .5)
        f = ex.get("f", 1000)
        s = {
            "rumble": lambda: k.rumble(max(.3, dur)), "train": k.train, "shimmer": k.shimmer, "thud": k.thud,
            "swoosh": lambda: k.whoosh(.26, 900, 7000), "whoosh": lambda: k.whoosh(.4, 300, 4500),
            "riser": lambda: k.riser(max(.2, dur), 400, 7000), "impact": k.impact, "stack": lambda: k.stack(dur),
            "zoom": lambda: k.zoom(max(.1, dur), f), "counter": lambda: k.ticks(dur, .035, 2600), "clank": k.clank,
            "coins": k.coins, "pop": k.pop_, "blip": lambda: k.blip(f, .1), "stamp": k.stamp, "creak": k.creak,
            "slash": k.slash, "grind": lambda: k.grind(max(.2, dur)), "clang": k.clang, "tick": lambda: k.tick(f, .01),
            "lock": k.lock, "bloop": lambda: k.bloop(f), "chime": k.chime, "fall": k.fall, "spot": k.spot,
            "heartbeat": k.heartbeat, "slide": lambda: k.whoosh(.35, 600, 3000), "cart": lambda: k.cart(max(.2, dur)),
            "flip": k.flip, "print": lambda: k.printer(max(.2, dur)), "boom": lambda: k.boom(.9),
        }[name]()
        base = {"rumble": .6, "train": .45, "shimmer": .4, "thud": .7, "swoosh": .4, "whoosh": .45, "riser": .35, "impact": .9,
                "stack": .4, "zoom": .4, "counter": .25, "clank": .55, "coins": .4, "pop": .5, "blip": .35, "stamp": .8, "creak": .5,
                "slash": .5, "grind": .55, "clang": 1.0, "tick": .35, "lock": .5, "bloop": .4, "chime": .45, "fall": .5, "spot": .7,
                "heartbeat": .95, "slide": .45, "cart": .55, "flip": .5, "print": .4, "boom": .7}[name]
        fx.add(t, s, g * base, max(-1, min(1, pan)))

    mus.reverb(.18, 2.2, 6000); fx.reverb(.16, 2.6, 6500)       # a big stone room
    vo_on = np.zeros(k.N)
    for v in vo.values():
        vo_on[k.n(v["start"]):k.n(v["start"] + v["dur"])] = 1
    sm = uniform_filter1d(vo_on, k.n(.12))
    M = mus.stereo()[:N] * (10 ** (-8 * sm / 20))[:N, None]
    F = (fx.stereo()[:N] + amb.stereo()[:N]) * (10 ** (-5 * sm / 20))[:N, None]
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
