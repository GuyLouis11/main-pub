"""Original score + sound design for this Short. Everything is synthesized here (no samples, no
licensed material). Hits come from the composition's cue list (tools/cues.mjs -> assets/audio/cues.json).

Music: 112 BPM, F minor, a clean "ledger" groove: muted plucks, deep sub, tight claps and glassy bells, sidechained
under the kick. It cuts to silence plus a heartbeat on "the strangest part" and comes back after "destroyed".
Room tone: a low server/office hum under the whole piece, a vault air tone on the door shots.
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
BPM = 112
B = 60 / BPM
# F minor: Fm | Db | Ab | Eb
PROG = [(41, [65, 68, 72]), (37, [65, 68, 73]), (44, [63, 68, 72]), (39, [63, 67, 70])]


def fit(x, n):
    return x[:n] if len(x) >= n else np.pad(x, (0, n - len(x)))


class Synth(Kit):
    def kick(self, dec=.3):
        n = self.n(.6)
        return np.tanh(2.2 * self.sweep(150, 46, .6, .28) * self.env(n, dec)) * .9 + .25 * self.hp(self.noise(.6), 3000) * self.env(n, .003)

    def clap(self):
        out = np.zeros(self.n(.3))
        for k, d in enumerate((0, .01, .021)):
            i = self.n(d); b = self.bp(self.noise(.3), 1100, 6500) * self.env(self.n(.3), .012 if k < 2 else .07)
            out[i:] += b[:len(out) - i] * (.7 if k < 2 else 1)
        return out

    def hat(self, dec=.012):
        return self.hp(self.noise(.08), 8000) * self.env(self.n(.08), dec)

    def mute(self, f):                      # muted pluck
        s = self.saw(f, .22, .003)
        return self.lp(s, 1600) * self.env(len(s), .05) * self.adsr(len(s), .002, .03)

    def glass(self, f):
        return self.tine(f, 1.4) * .7

    def subb(self, f, sec):
        n = self.n(sec)
        return np.tanh(1.6 * (self.sine(f, sec) + .3 * self.sine(2 * f, sec))) * self.adsr(n, .008, .06) * (.55 + .45 * self.env(n, .4))

    # ---------- sfx ----------
    def impact(self):
        n = self.n(2.2)
        return (np.tanh(2.5 * self.sweep(120, 32, 2.2, .35) * self.env(n, .45)) * .9 + self.hp(self.noise(2.2), 3500) * self.env(n, .5) * .3
                + .5 * self.lp(self.noise(2.2), 1500) * self.env(n, .05))

    def metal(self, f0, sec, dec, parts=((1, 1), (2.76, .6), (5.4, .4), (8.93, .25), (1.51, .5))):
        n = self.n(sec)
        return sum(a * self.sine(f0 * m, sec, self.rng.uniform(0, 6)) * self.env(n, dec / (1 + .3 * k)) for k, (m, a) in enumerate(parts)) / 2.2

    def clang(self):
        n = self.n(2.6)
        return .9 * fit(self.impact(), n) + .5 * self.metal(80, 2.6, .8) + .2 * self.metal(330, 2.6, .3)

    def clunk(self):
        n = self.n(.7)
        return .8 * self.sub(140, 50, .7, .08) + .5 * self.metal(260, .7, .08) + .3 * self.lp(self.noise(.7), 1200) * self.env(n, .02)

    def spin(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        rate = 6 + 10 * np.sin(np.pi * t / max(t[-1], 1e-3))
        clicks = (np.sin(2 * np.pi * np.cumsum(rate) / SR) > .97).astype(float)
        return self.bp(clicks, 800, 5000) * 1.5 + .2 * self.bp(self.noise(sec), 200, 1200) * self.adsr(n, .1, .2)

    def creak(self):
        n = self.n(1.0)
        t = np.arange(n) / SR
        f = 110 + 50 * np.sin(2 * np.pi * 1.1 * t)
        s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (1 + .5 * np.sin(2 * np.pi * 27 * t))
        return self.bp(s, 250, 2200) * self.adsr(n, .1, .3) * .28

    def thud(self):
        return self.sub(130, 45, .5, .1) + .4 * fit(self.lp(self.noise(.1), 900), self.n(.5)) * self.env(self.n(.5), .02)

    def key(self, f):
        n = self.n(.14)
        return .7 * self.bp(self.noise(.14), 1500, 6000) * self.env(n, .008) + .4 * self.sine(f, .14) * self.env(n, .02) + .5 * fit(self.sub(200, 90, .1, .02), n)

    def ding(self):
        out = np.zeros(self.n(1.6))
        for k, m in enumerate((84, 91)):
            b = self.bell(midi(m), 1.6, .5) * .45; i = self.n(k * .09); out[i:] += b[:len(out) - i]
        return out

    def drop(self):
        return fit(self.sweep(1400, 500, .2, 1.2) * self.adsr(self.n(.2), .02, .05) * .3, self.n(.5)) + .7 * fit(self.thud(), self.n(.5))

    def ticks(self, sec, dt=.04, f=2300, g0=1.0, g1=.4):
        out = np.zeros(self.n(sec + .1)); t = 0.0
        while t < sec:
            s = self.tick(f, .008) * (g0 + (g1 - g0) * t / sec); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]; t += dt
        return out

    def paper(self, sec=.35):
        n = self.n(sec)
        return self.bp(self.noise(sec), 900, 5000) * self.adsr(n, .03, .2) * np.linspace(1, .2, n)

    def stamp(self):
        n = self.n(.5)
        return .9 * self.sub(120, 40, .5, .1) + .6 * self.lp(self.noise(.5), 1800) * self.env(n, .03)

    def crash(self):
        out = np.zeros(self.n(1.6))
        for k in range(7):
            s = .5 * self.thud() + .3 * fit(self.paper(.3), self.n(.5)); i = self.n(.1 + k * .11 + self.rng.uniform(0, .05)); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def typing(self, sec):
        out = np.zeros(self.n(sec + .2)); t = 0.0
        while t < sec:
            s = fit(self.key(self.rng.uniform(700, 1100)), self.n(.14)) * self.rng.uniform(.25, .5); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            t += self.rng.uniform(.07, .15)
        return out

    def snip(self):
        out = np.zeros(self.n(.4))
        for t0 in (0, .09):
            s = self.metal(3200, .12, .02, ((1, 1), (1.7, .6))) + .4 * self.hp(self.noise(.12), 4000) * self.env(self.n(.12), .01); i = self.n(t0); out[i:i + len(s)] += s
        return out

    def boing(self):
        n = self.n(.4)
        t = np.arange(n) / SR
        f = 220 + 260 * np.exp(-t / .1) * (1 + .3 * np.sin(2 * np.pi * 14 * t))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * self.env(n, .14)

    def flip(self):
        return self.whoosh(.3, 600, 5000) * .8 + .3 * fit(self.paper(.2), self.n(.3))

    def stream(self, sec):
        out = np.zeros(self.n(sec + .3)); k = 0
        n = max(6, int(sec / .05))
        for k in range(n):
            b = self.blip(midi(84 + (k * 5) % 12), .08) * .25; i = self.n(k * sec / n); out[i:i + len(b)] += b[:len(out) - i]
        return out

    def heartbeat(self):
        out = np.zeros(self.n(1.0))
        for t0, g in ((0, 1), (.2, .7)):
            s = self.sub(72, 40, .25, .07) * g; i = self.n(t0); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def dissolve(self):
        n = self.n(1.4)
        return self.crackle(1.4, 120, 10) * .8 + .5 * self.riser(1.4, 6000, 300)[::-1][:n] * np.linspace(1, 0, n) + .4 * fit(self.thud(), n)

    def slash(self):
        return self.whoosh(.22, 2000, 9000) + self.sweep(3200, 5200, .22, 1) * self.env(self.n(.22), .08) * .25

    def buzz(self):
        n = self.n(.35)
        tt = np.arange(n) / SR
        s = np.sign(np.sin(2 * np.pi * 110 * tt)) + np.sign(np.sin(2 * np.pi * 116 * tt))
        return self.lp(s, 2000) * self.adsr(n, .01, .06) * .35

    def swipe(self):
        return self.whoosh(.25, 1500, 8000) * .7 + .4 * fit(self.tick(3000, .006), self.n(.25))

    def coins(self):
        out = np.zeros(self.n(1.4))
        for k in range(16):
            f0 = self.rng.uniform(2500, 5200); s = self.sine(f0, .25) * self.env(self.n(.25), .04) + .5 * self.sine(f0 * 2.4, .25) * self.env(self.n(.25), .02)
            i = self.n(self.rng.uniform(0, .9) ** 1.4); out[i:i + len(s)] += s[:len(out) - i] * self.rng.uniform(.3, 1)
        return out * .5

    def jet(self, sec):
        n = self.n(sec); t = np.arange(n) / SR
        return self.bp(self.noise(sec), 250, 3000) * np.sin(np.pi * t / t[-1]) ** 1.5

    def pumpfill(self, sec):
        n = self.n(sec); t = np.arange(n) / SR
        hum = self.bp(self.noise(sec), 150, 900) * .8 + .25 * self.sine(120, sec)
        clicks = (np.sin(2 * np.pi * 9 * t) > .97).astype(float)
        return (hum + .6 * self.bp(clicks, 1500, 6000)) * self.adsr(n, .1, .15)

    def fall(self):
        return self.sweep(1800, 600, .35, 1.2) * self.adsr(self.n(.35), .03, .08) * .35

    def pop_(self):
        return self.sweep(900, 300, .08, .6) * self.env(self.n(.08), .03)


def main():
    cj = json.load(open(os.path.join(ROOT, "assets", "audio", "cues.json")))
    total, sc, vo, cues = cj["total"], cj["scenes"], cj["vo"], cj["cues"]
    k = Synth(total + 3.0, seed=2014)
    N = k.n(total)
    mus, fx, amb = Bus(k.N), Bus(k.N), Bus(k.N)
    S = lambda i: sc[i]["start"]
    at = lambda name: [c[0] for c in cues if c[1] == name]
    KIND = {"hook":"intro","two":"groove","swipe":"groove","bait":"full","split":"full","inside":"full","walk":"full","sign":"half","outro":"outro"}
    TWIST = "bait"
    def section(t):
        if S(TWIST) - .7 <= t < S(TWIST): return "none"          # silence right before the reveal
        if t >= cj["total"] - .6: return "none"
        for k, v in sc.items():
            if v["start"] <= t < v["end"]: return KIND.get(k, "groove")
        return "groove"

    step, kick_t = B / 4, []
    for i in range(int(total / step) + 1):
        t = i * step
        if t >= total - .05: break
        sec = section(t)
        beat, sub = divmod(i, 4)
        root, chord = PROG[(beat // 4) % 4]
        if sec == "none": continue
        pan = .3 * (1 if sub % 2 else -1)
        if sec in ("groove", "full"):
            if sub == 0 or (sec == "full" and sub == 3 and beat % 4 == 3): mus.add(t, k.kick(), .78); kick_t.append(t)
            if sub == 0 and beat % 2 == 1: mus.add(t, k.clap(), .42)
            if sub == 2: mus.add(t, k.hat(), .16, pan)
            if sec == "full" and sub in (1, 3): mus.add(t, k.hat(.006), .08, -pan)
        elif sec == "half":
            if sub == 0 and beat % 2 == 0: mus.add(t, k.kick(.4), .65); kick_t.append(t)
            if sub == 2: mus.add(t, k.hat(), .12, pan)
        elif sec in ("intro", "outro") and sub == 2 and beat % 2 == 0:
            mus.add(t, k.hat(.02), .08, pan)
        if sec in ("groove", "full", "half", "intro") and sub == 0 and beat % 2 == 0:
            mus.add(t, k.subb(midi(root - 12), B * 1.9), .45 if sec != "intro" else .3)
        # muted plucks: 16ths in full, 8ths otherwise
        tones = chord + [c + 12 for c in chord]
        if sec in ("groove", "full", "half") and (sec == "full" or sub % 2 == 0):
            m = tones[(i * 3) % len(tones)]
            mus.add(t, k.mute(midi(m)), .13 if sec == "full" else .11, .45 * np.sin(i * .5))
        # glassy bells on the downbeat of every bar
        if sec in ("intro", "groove", "full", "outro") and sub == 0 and beat % 4 == 0:
            mus.add(t, k.glass(midi(chord[2] + 12)), .14)
    bar_len = 4 * B
    for bi in range(int(total / bar_len) + 1):
        t = bi * bar_len
        root, chord = PROG[bi % 4]
        sec = section(t + .1)
        if sec == "none": continue
        g = {"intro": .14, "groove": .1, "half": .12, "full": .09, "outro": .16}[sec]
        mus.add(t, k.pad([midi(c - 12) for c in chord], min(bar_len + .3, total - t), 350, 1300, .5, .5, .006), g)
    mus.add(S(TWIST) - 1.2, k.riser(1.2, 300, 7000), .25)
    pump = np.ones(k.N)
    for t in kick_t:
        i = k.n(t); L = min(k.n(.22), k.N - i)
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - .45 * np.exp(-np.arange(L) / (.07 * SR)))
    mus.L *= pump; mus.R *= pump

    # room tone: a low office/server hum throughout (identical level at both ends, so the loop is seamless)
    amb.add(0, k.hum(total + .5, 50) * .15 + .5 * k.lp(k.noise(total + .5), 700), .25)

    for t, name, g, pan, ex in cues:
        ex = ex or {}
        dur = ex.get("dur", .5)
        f = ex.get("f", 1000)
        s = {
            "spin": lambda: k.spin(max(.3, dur)), "creak": k.creak, "thud": k.thud, "swoosh": lambda: k.whoosh(.26, 900, 7000),
            "whoosh": lambda: k.whoosh(.4, 300, 4500), "pop": k.pop_, "slash": k.slash, "key": lambda: k.key(f), "ding": k.ding,
            "impact": k.impact, "drop": k.drop, "counter": lambda: k.ticks(dur, .035, 2600), "blip": lambda: k.blip(f, .1),
            "paper": lambda: k.paper(.35), "stamp": k.stamp, "crash": k.crash, "type": lambda: k.typing(max(.2, dur)),
            "clunk": k.clunk, "snip": k.snip, "boing": k.boing, "flip": k.flip, "stream": lambda: k.stream(max(.2, dur)),
            "heartbeat": k.heartbeat, "buzz": k.buzz, "tick": lambda: k.tick(f, .01), "dissolve": k.dissolve, "clang": k.clang, "lock": k.clunk, "riser": lambda: k.riser(max(.2, dur), 400, 7000), "bloop": lambda: k.sweep(f * 1.8, f * .7, .14, .5) * k.env(k.n(.14), .05), "slide": lambda: k.whoosh(.35, 600, 3000), "swipe": k.swipe, "coins": k.coins, "jet": lambda: k.jet(max(.3, dur)), "pumpfill": lambda: k.pumpfill(max(.3, dur)), "fall": k.fall,
        }[name]()
        base = {"spin": .5, "creak": .55, "thud": .7, "swoosh": .4, "whoosh": .45, "pop": .5, "slash": .5, "key": .55, "ding": .45,
                "impact": .9, "drop": .6, "counter": .25, "blip": .35, "paper": .5, "stamp": .8, "crash": .55, "type": .4, "clunk": .8,
                "snip": .6, "boing": .45, "flip": .55, "stream": .3, "heartbeat": .95, "buzz": .5, "tick": .3, "dissolve": .7, "clang": .9, "lock": .6, "riser": .35, "bloop": .4, "slide": .45, "swipe": .6, "coins": .5, "jet": .35, "pumpfill": .5, "fall": .5}[name]
        fx.add(t, s, g * base, max(-1, min(1, pan)))

    mus.reverb(.15, 1.8, 6500); fx.reverb(.12, 1.6, 7000)
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
