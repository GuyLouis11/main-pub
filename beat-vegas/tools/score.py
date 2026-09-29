"""Original noir-jazz score + sound design for 'He Beat Vegas', placed on the same VO-driven layout as the
visuals (same formulas as the chapter scripts). All sound is synthesized here: no samples, no licensed material.
Writes chN/assets/audio/music.wav and sfx.wav. Music ducks −8 dB and effects −6 dB under the narration.

Usage: python3 tools/score.py [ch0 ch1 ...]"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audiokit import Kit, Bus, SR  # noqa: E402
from retime_chapters import layout  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
note = lambda n, o: midi(12 * (o + 1) + NAMES.index(n))
# C-minor noir progression (root midi, chord tones as semitones): Cm9 | Fm9 | Dm7b5 G7b9 | Cm9 Ab13
PROG = [(36, [0, 3, 7, 10, 14]), (41, [0, 3, 7, 10, 14]), (38, [0, 3, 6, 10]), (43, [0, 4, 7, 10, 13]),
        (36, [0, 3, 7, 10, 14]), (41, [0, 3, 7, 10, 14]), (44, [0, 4, 7, 10, 14]), (43, [0, 4, 7, 10, 13])]


class Jazz(Kit):
    def bass(self, f, sec=.55):
        n = self.n(sec)
        body = self.sine(f, sec) + .45 * self.sine(2 * f, sec) + .15 * self.sine(3 * f, sec)
        thump = self.lp(self.noise(sec), 300) * self.env(n, .012)
        return (np.tanh(1.4 * body) * self.env(n, .32) + .6 * thump) * self.adsr(n, .004, .06)

    def ride(self, g=1.0, sec=1.1):
        n = self.n(sec)
        parts = sum(self.sine(f, sec, self.rng.uniform(0, 6)) * a for f, a in [(3150, .5), (4230, .4), (5370, .35), (6810, .25), (8090, .2)])
        return (.35 * parts * self.env(n, .45) + .5 * self.hp(self.noise(sec), 6000) * self.env(n, .25)) * self.env(n, .6) * g

    def brush(self, sec=.3):
        n = self.n(sec)
        return self.bp(self.noise(sec), 2500, 9000) * np.sin(np.linspace(0, np.pi, n)) ** 2

    def snare_brush(self):
        n = self.n(.2)
        return self.bp(self.noise(.2), 1500, 8000) * self.env(n, .05)

    def kick(self):
        return self.sub(90, 45, .35, .12)

    def piano(self, f, sec=1.6):
        n = self.n(sec)
        s = self.sine(f, sec) + .5 * self.sine(2 * f, sec) * self.env(n, .5) + .25 * self.sine(3 * f, sec) * self.env(n, .25)
        return s * self.env(n, .9) * self.adsr(n, .003, .3) + .05 * self.bp(self.noise(sec), 2000, 6000) * self.env(n, .004)

    def horn(self, freqs, sec=.7, bright=2200):
        n = self.n(sec)
        t = np.arange(n) / SR
        s = sum(np.sign(np.sin(2 * np.pi * f * t * (1 + .004 * np.sin(2 * np.pi * 5.5 * t)))) * .5 + self.saw(f, sec, .003) for f in freqs) / len(freqs)
        return self.bp(s, 350, bright) * self.adsr(n, .02, .25) * self.env(n, .5)

    def vibe(self, f, sec=2.0):
        n = self.n(sec)
        return self.bell(f, sec, .9) * (1 + .35 * np.sin(2 * np.pi * 5.2 * np.arange(n) / SR))

    def crash(self, sec=3.0):
        n = self.n(sec)
        return self.hp(self.noise(sec), 3500) * self.env(n, .9) + .3 * self.ride(1, sec)

    # ---- sound effects ----
    def chip(self):
        a = self.hp(self.noise(.03), 3000) * self.env(self.n(.03), .004) + self.sine(4200, .03) * self.env(self.n(.03), .006)
        return np.concatenate([a, np.zeros(self.n(.035)), .7 * a])

    def card(self):
        n = self.n(.12)
        return self.bp(self.noise(.12), 1800, 9000) * self.env(n, .025) + .4 * self.whoosh(.12, 1500, 6000)

    def stamp(self):
        n = self.n(.5)
        return .9 * self.sub(110, 40, .5, .1) + .6 * self.lp(self.noise(.5), 1600) * self.env(n, .03)

    def ball_roll(self, sec, lap=.7):
        n = self.n(sec)
        t = np.arange(n) / SR
        am = .55 + .45 * np.sin(2 * np.pi * t / lap) ** 2
        grit = self.bp(self.noise(sec), 900, 4200) * am
        return grit * self.adsr(n, .3, .3)

    def ear_tone(self, f):
        n = self.n(.5)
        return (self.sine(f, .5) + .2 * self.sine(2 * f, .5)) * self.env(n, .16) * self.adsr(n, .005, .05)

    def murmur(self, sec):
        n = self.n(sec)
        t = np.arange(n) / SR
        x = self.bp(self.noise(sec), 220, 1100) * (.6 + .25 * np.sin(2 * np.pi * .23 * t) + .15 * np.sin(2 * np.pi * .71 * t + 1))
        return x * self.adsr(n, .8, .8)

    def heartbeat(self):
        return np.concatenate([self.sub(70, 40, .22, .07), np.zeros(self.n(.12)), .7 * self.sub(70, 40, .22, .07)])

    def glitch(self, sec=.4):
        n = self.n(sec)
        x = np.sign(self.noise(sec)) * (np.arange(n) // 480 % 3 == 0)
        return self.bp(x.astype(float), 400, 6000) * .5

    def screech(self, sec=1.2):
        return self.swept(sec, 2400, 1400, .15) * self.adsr(self.n(sec), .05, .3)

    def typewriter(self):
        return self.tick(1800, .006) + .5 * self.lp(self.noise(.06), 2500) * self.env(self.n(.06), .01)


class Ch:
    def __init__(self, ch):
        s = open(os.path.join(ROOT, ch, "index.html"), encoding="utf-8").read()
        self.tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
        self.sc, self.vo, self.total = layout(self.tim)
        self.k = Jazz(self.total, seed=self.tim.get("seed", 1))
        self.mus, self.fx = Bus(self.k.N), Bus(self.k.N)
        self.ch = ch

    S = lambda self, i: self.sc[i][0]
    E = lambda self, i: self.sc[i][0] + self.sc[i][1]
    D = lambda self, i: self.sc[i][1]
    V = lambda self, i: self.vo[i][0]
    VE = lambda self, i: self.vo[i][0] + self.vo[i][1]
    P = lambda self, i, f: self.vo[i][0] + f * self.vo[i][1]

    # ---- beds ----
    def groove(self, t0, t1, bpm=104, g=1.0, bass=True, ride=True, brushes=True, piano=True, bar0=0):
        k, beat = self.k, 60 / bpm
        t, b = t0, bar0 * 4
        while t < t1 - .05:
            bar, bi = (b // 4) % len(PROG), b % 4
            root, tones = PROG[bar]
            nroot = PROG[(bar + 1) % len(PROG)][0]
            if bass:
                m = [root, root + tones[1 + (b // 4) % 2], root + tones[2], nroot + (1 if (b // 4) % 2 else -1)][bi]
                self.mus.add(t, k.bass(midi(m)), .42 * g, -.1)
            if ride:
                self.mus.add(t, k.ride(), .09 * g, .35)
                if bi in (1, 3):
                    self.mus.add(t + beat * 2 / 3, k.ride(.7, .6), .06 * g, .35)
            if brushes:
                self.fx.add(t, k.brush(beat * .9), .045 * g, -.3)
                if bi in (1, 3):
                    self.mus.add(t, k.snare_brush(), .08 * g, -.2)
            if piano and bi in (1, 3) and (b // 4 + bi) % 3 != 0:
                tt = t + (beat * 2 / 3 if bi == 1 else 0)
                for j, iv in enumerate(tones[1:4]):
                    self.mus.add(tt + .012 * j, k.piano(midi(root + 24 + iv), 1.0), .07 * g, .2)
            t += beat
            b += 1

    def drone(self, t0, t1, g=.12, low="C"):
        if t1 - t0 > .4:
            self.mus.add(t0, self.k.pad([note(low, 1), note("G", 1), note(low, 2), note("D#", 3)], t1 - t0, 150, 700, min(1.5, (t1 - t0) / 3), min(1.2, (t1 - t0) / 3)), g)

    def stab(self, t, g=.28, chord=("C", "D#", "G", "A#")):
        self.mus.add(t, self.k.horn([note(c, 4) for c in chord], .8), g)
        self.mus.add(t, self.k.bass(note(chord[0], 2)), .5)

    def hit(self, t, g=1.0):
        self.fx.add(t, self.k.stamp(), .55 * g)
        self.mus.add(t, self.k.crash(2.0), .08 * g, .2)

    def card(self, sid="card"):
        k = self.k
        self.fx.add(self.S(sid) + .15, k.whoosh(.5, 600, 5000), .12, -.5)
        self.fx.add(self.S(sid) + .55, k.card(), .35, -.3)
        self.stab(self.S(sid) + .55, .22, ("G", "B", "D", "F"))
        self.mus.add(self.S(sid) + .55, k.vibe(note("G", 5), 2.2), .05, .3)

    # ---- master ----
    def write(self):
        mus = self.mus.reverb(.28, 2.4, 6000).stereo()
        fx = self.fx.reverb(.14, 1.4, 7000, seed=9).stereo()
        duck = np.ones(self.k.N)
        for vid, (st, du) in self.vo.items():
            p = os.path.join(ROOT, self.ch, "assets", "vo", vid + ".wav")
            if not os.path.exists(p):
                continue
            x, _ = sf.read(p, always_2d=True)
            x = x.mean(1)
            if np.abs(x).max() < 1e-4:
                continue
            from scipy.ndimage import uniform_filter1d
            rms = np.sqrt(uniform_filter1d(x ** 2, 480, mode="constant"))
            act = (rms > 10 ** (-40 / 20)).astype(float)
            seg = np.zeros(self.k.N)
            i0 = int(st * SR)
            seg[i0:i0 + len(act)] = act[: self.k.N - i0]
            from scipy.ndimage import uniform_filter1d
            seg = np.clip(uniform_filter1d(seg, int(.35 * SR), mode="constant") * 1.6, 0, 1)   # 350 ms smoothing (moving average)
            duck = np.minimum(duck, 1 - seg * (1 - 10 ** (-8 / 20)))
        mus = mus * duck[:, None]
        fx = fx * (1 - (1 - duck) * (1 - 10 ** (-6 / 20)) / (1 - 10 ** (-8 / 20)))[:, None]
        for x in (mus, fx):
            n0, n1 = int(.05 * SR), int(.5 * SR)
            x[:n0] *= np.linspace(0, 1, n0)[:, None]
            x[-n1:] *= np.linspace(1, 0, n1)[:, None]
        import pyloudnorm as pyln
        mix = mus + fx
        lufs = pyln.Meter(SR).integrated_loudness(mix)
        g = 10 ** ((-22.0 - lufs) / 20)
        peak = max(np.abs(mix).max() * g, 1e-9)
        if peak > 10 ** (-2 / 20):
            g *= 10 ** (-2 / 20) / peak
        d = os.path.join(ROOT, self.ch, "assets", "audio")
        os.makedirs(d, exist_ok=True)
        sf.write(os.path.join(d, "music.wav"), (mus * g).astype(np.float32), SR, subtype="PCM_24")
        sf.write(os.path.join(d, "sfx.wav"), (fx * g).astype(np.float32), SR, subtype="PCM_24")
        print(f"{self.ch}: {self.total:6.2f}s  bed gain {20 * np.log10(g):+.1f} dB")


# ═════════════════════════ cue sheets (times mirror the chapter scripts) ═════════════════════════
def ch0(c):
    k = c
    K = c.k
    # 1 · wheel: casino room, the ball racing, a low pulse; one soft ear-tone when the landing zone lights
    c.fx.add(c.S("wheel"), K.murmur(c.D("wheel") + .5), .08)
    c.fx.add(c.S("wheel"), K.ball_roll(c.D("wheel") + .3, .64), .16, .2)
    c.drone(c.S("wheel"), c.E("wheel") + 1, .1)
    t = c.S("wheel") + .4
    while t < c.E("wheel"):
        c.mus.add(t, K.heartbeat(), .28)
        t += 1.1
    for i in range(16):
        c.fx.add(c.V("N0_01") + .05 + i * (1 / 24), K.typewriter(), .12, -.6)
    c.mus.add(c.P("N0_01", .55), K.ear_tone(note("G", 5)), .12, .4)
    c.fx.add(c.V("N0_01") + 3.5, K.whoosh(.3, 800, 6000), .1)
    # 2 · computer
    c.hit(c.V("N0_02") + .1, .9)
    c.hit(c.P("N0_02", .09) + .12, .6)
    c.fx.add(c.P("N0_02", .17), K.scribble(.3, 18), .2)
    c.fx.add(c.P("N0_02", .24), K.hum(D := c.E("computer") - c.P("N0_02", .24), 60) * .5, .05)
    for i in range(12):
        c.fx.add(c.P("N0_02", .38) + i * .9 / 12, K.tick(3200, .006), .18, .3)
    c.fx.add(c.P("N0_02", .38), K.whoosh(.45, 500, 4000), .1, .5)
    c.fx.add(c.P("N0_02", .7), K.whoosh(.5, 300, 2000), .12, -.3)
    c.fx.add(c.P("N0_02", .76), K.tick(2600, .01), .5, -.4)
    c.fx.add(c.P("N0_02", .76) + .6, K.tick(2600, .01), .4, -.4)
    c.fx.add(c.P("N0_02", .87), K.whoosh(.45, 300, 2500), .12, .3)
    for i, n in enumerate(["C", "E", "G"]):
        c.mus.add(c.P("N0_02", .92) + i * .16, K.ear_tone(note(n, 5)), .1, .5)
    c.drone(c.S("computer"), c.E("computer"), .07)
    # 3 · 5% vs 44%
    c.hit(c.V("N0_03") + .2, .6)
    c.mus.add(c.P("N0_03", .7) - 1.2, K.riser(1.2, 300, 6000), .08)
    c.hit(c.P("N0_03", .7) + .2, 1.2)
    c.stab(c.P("N0_03", .7) + .2, .32, ("C", "E", "G", "B"))
    c.mus.add(c.P("N0_03", .7) + .2, K.vibe(note("E", 5), 2.5), .06)
    for i in range(34):
        c.fx.add(c.P("N0_03", .72) + K.rng.uniform(0, 1.6), K.chip(), .12, K.rng.uniform(-.8, .8))
    for i in range(4):
        for j in range(5):
            c.fx.add(c.S("edge") + .02 + i * .08 + j * .03 + .25, K.chip(), .09, -.6 + i * .4)
    # 4 · danger
    c.drone(c.S("danger"), c.E("danger"), .13, "C")
    c.hit(c.P("N0_04", .3) + .2, 1.0)
    t = c.V("N0_04") + 2.3
    while t < c.E("danger"):
        c.mus.add(t, K.heartbeat(), .42)
        t += .75
    c.fx.add(c.V("N0_04") + 2.3, K.lp(K.noise(3.4), 220) * K.adsr(K.n(3.4), .3, .5), .25)
    # 5 · bigger table
    c.fx.add(c.V("N0_05") + .05, K.whoosh(.5, 300, 3000), .12)
    c.stab(c.V("N0_05") + .1, .18, ("G", "B", "D", "F"))
    for i in range(int(1.4 / .045)):
        c.fx.add(c.V("N0_05") + .9 + i * .045, K.typewriter(), .09, .4)
    c.fx.add(c.V("N0_05") + 2.3, K.murmur(1.9) * 1.8, .12)
    for i in range(30):
        c.fx.add(c.V("N0_05") + 4.3 + (i / 30) ** 1.6 * 1.2, K.tick(2200, .008), .16)
    c.drone(c.V("N0_05") + 6.0, c.E("bigger"), .12, "C")
    for i in range(17):
        c.fx.add(c.P("N0_05", .84) + (i / 17) ** .6 * 1.1, K.tick(1500, .01), .2)
    c.fx.add(c.E("bigger") - .45, K.glitch(.45), .5)
    # 6 · title: the band comes in
    t0 = c.S("title")
    c.mus.add(t0, K.crash(3.0), .2)
    c.stab(t0, .42, ("C", "D#", "G", "A#"))
    c.mus.add(t0, K.boom(.9), .35)
    c.groove(t0 + .05, c.E("title"), 112, 1.1)
    for i in range(int((c.E("title") - t0 - 1.0) / .18)):
        c.fx.add(t0 + 1.0 + i * .18, K.tick(5200, .004), .05, (-1) ** i * .5)


def ch1(c):
    K = c.k
    c.card()
    # light groove under the whole chapter, thinned while explaining, out for the flaw
    c.groove(c.S("ucla"), c.S("physics"), 100, .8)
    c.fx.add(c.S("ucla"), K.wind(c.D("ucla")) * .5, .05)
    for i in range(26):
        c.fx.add(c.P("N1_01", .76) + i / 30, K.typewriter(), .1, .3)
    c.mus.add(c.V("N1_01") + 4.95, K.vibe(note("D#", 5), 2.4), .06)
    # physics: vibes arpeggio for the orbit, a whoosh for the morph, blips for readouts
    arp = ["C", "D#", "G", "A#", "D", "G"]
    t, i = c.S("physics"), 0
    while t < c.P("N1_02", .4):
        c.mus.add(t, K.vibe(note(arp[i % 6], 5 if i % 6 < 4 else 6), 1.4), .045, np.sin(i) * .5)
        t += .32
        i += 1
    c.fx.add(c.P("N1_02", .4), K.whoosh(.6, 300, 3000), .15)
    c.groove(c.P("N1_02", .4), c.S("shannon"), 100, .6, piano=False, bar0=2)
    c.fx.add(c.P("N1_02", .4), K.ball_roll(c.E("physics") - c.P("N1_02", .4), .75), .1, -.3)
    for i in range(8):
        c.fx.add(c.P("N1_02", .5) + i * .35, K.blip(1600 - i * 90, .08), .06, .5)
    c.fx.add(c.P("N1_02", .74), K.whoosh(.9, 200, 2500), .06, .4)
    c.mus.add(c.P("N1_02", .86), K.ear_tone(note("G", 5)), .12)
    # Shannon: knock, groove, then digital cascade
    for i in range(3):
        c.fx.add(c.S("shannon") + .9 + i * .22, K.wood(180), .3, -.2)
    c.groove(c.S("shannon") + 1.5, c.S("shannon") + 8.0, 100, .7, bar0=4)
    for i in range(60):
        c.fx.add(c.S("shannon") + 8.0 + K.rng.uniform(0, c.E("shannon") - c.S("shannon") - 8.2), K.blip(K.rng.uniform(1800, 3800), .04), .035, K.rng.uniform(-.9, .9))
    for i in range(3):
        c.fx.add(c.P("N1_03", .8) + i * .22, K.blip(900 + 300 * i, .12), .15)
    # basement: lamp hum, strobe pops, projector, stopwatch
    c.fx.add(c.S("basement"), K.hum(c.D("basement"), 60), .04)
    c.fx.add(c.S("basement"), K.ball_roll(c.D("basement"), .69), .12, .3)
    for kk in range(6):
        c.fx.add(c.P("N1_04", .28) + kk * .16, K.tick(900, .02) + .3 * K.hp(K.noise(.06), 4000)[:K.n(.06)], .25)
    for i in range(int(3.0 / .042)):
        c.fx.add(c.P("N1_04", .3) + i * .042, K.tick(700, .004), .06, -.5)
    for i in range(int(1.6 / .1)):
        c.fx.add(c.P("N1_04", .52) + i * .1, K.tick(3000, .004), .09, .6)
    c.fx.add(c.V("N1_04") + 4.35, K.hp(K.noise(2.2), 3000) * K.adsr(K.n(2.2), .2, .3), .03)
    c.drone(c.S("basement"), c.E("basement"), .08, "C")
    # device: the two clicks, the computer, eight tones, 44%
    lap, t0 = 1.45, c.V("N1_05") + .15
    c1 = t0 + lap / 6
    while c1 < c.P("N1_05", .04):
        c1 += lap
    c.fx.add(c.S("device"), K.ball_roll(c.E("device") - c.S("device"), lap), .1, -.2)
    for tt in (c1, c1 + lap):
        c.fx.add(tt, K.tick(2600, .01), .55, -.3)
    for i in range(3):
        c.fx.add(c.P("N1_05", .45) + i * .12, K.blip(1400, .06), .12, .4)
    for i, nn in enumerate(["C", "D", "E", "F", "G", "A", "B", "C"]):
        c.mus.add(c.P("N1_05", .66) + i * .22, K.ear_tone(note(nn, 5 if i < 7 else 6)), .16, -.6 + i * .17)
    c.hit(c.V("N1_06") + .1, .5)
    c.mus.add(c.P("N1_06", .35), K.ear_tone(note("G", 5)), .18)
    c.stab(c.P("N1_06", .66), .3, ("C", "E", "G", "B"))
    c.drone(c.S("device"), c.E("device"), .06)
    # flaw: cash, then everything stops
    for i in range(14):
        c.fx.add(c.V("N1_07") + i * .06, K.paper(.25), .12, K.rng.uniform(-.7, .7))
    c.mus.add(c.V("N1_07") + .3, K.bell(note("C", 6), 1.5, .4), .12)
    c.groove(c.V("N1_07"), c.P("N1_07", .58), 112, .9)
    tf = c.P("N1_07", .58)
    c.fx.add(tf - .25, K.swept(.3, 2500, 200, .4) * K.adsr(K.n(.3), .01, .05), .3)
    c.hit(tf, 1.1)
    c.mus.add(tf, K.boom(1.2), .45)
    c.fx.add(c.P("N1_07", .8), K.glitch(.5), .35)


def ch2(c):
    K = c.k
    c.card()
    # Vegas: neon buzz, traffic, the band in a club mood
    c.fx.add(c.S("vegas"), K.hum(c.P("N2_01", .4) - c.S("vegas"), 120) * .4, .05)
    for dt in (.3, .7, .9, 1.2, 1.4, 1.7):
        for j in range(3):
            c.fx.add(c.V("N2_01") + dt + j * .07, K.tick(6000, .003), .06, K.rng.uniform(-.8, .8))
    for i in range(10):
        c.fx.add(c.S("vegas") + K.rng.uniform(0, 4), K.whoosh(1.2, 200, 1400), .05, K.rng.choice([-.8, .8]))
    c.groove(c.S("vegas"), c.P("N2_01", .72), 108, .8)
    c.fx.add(c.P("N2_01", .4), K.murmur(c.P("N2_01", .72) - c.P("N2_01", .4)), .07)
    c.fx.add(c.P("N2_01", .4), K.ball_roll(c.E("vegas") - c.P("N2_01", .4), .75), .1, -.3)
    for i in range(5):
        c.fx.add(c.P("N2_01", .47) + i * .5, K.scribble(.45, 14), .12, .5)
    for i, ok in enumerate([1, 1, 0, 1]):
        t = c.P("N2_01", .74) + i * .3
        c.fx.add(t, K.tick(2400, .008), .2)
        c.mus.add(t + .05, K.bell(note("E", 6), .8, .25) if ok else K.saw(110, .25) * K.env(K.n(.25), .08), .08 if ok else .05)
    c.stab(c.P("N2_01", .74) + 1.3, .26, ("C", "E", "G", "B"))
    # wire: tension, three snaps
    c.drone(c.S("wire"), c.E("wire"), .12)
    c.mus.add(c.S("wire") + .3, K.ear_tone(note("G", 5)) * (1 + np.sign(np.sin(np.arange(K.n(.5)) / 300))) * .5, .1)
    snapT = c.P("N2_02", .82)
    for dt in (0, .55, 1.1):
        c.fx.add(snapT + dt, K.tick(5000, .004) + .8 * K.hp(K.noise(.06), 5000)[:K.n(.06)] * K.env(K.n(.06), .008), .7)
        c.fx.add(snapT + dt + .02, K.crackle(.25, 200, 20), .15)
    c.fx.add(c.S("wire") + 4.6, K.whoosh(.4, 400, 3000), .1)
    for i, s in enumerate((.15, .3)):
        c.fx.add(c.P("N2_03", s), K.blip(900 if i == 0 else 300, .15), .2)
    c.fx.add(c.P("N2_03", .66), K.chip(), .35)
    c.hit(c.P("N2_03", .72) + .2, .8)
    # fail: power-down, then the math, then the ace
    t = c.V("N2_04")
    c.hit(t + .05, .7)
    c.fx.add(t + .2, K.sweep(900, 60, .9, .7) * K.env(K.n(.9), .35), .2)
    c.fx.add(t + .2, K.glitch(.5), .3)
    for i in range(4):
        c.mus.add(c.P("N2_04", .46) + i * .12, K.vibe(note(["C", "D#", "G", "A#"][i], 5), 1.5), .05)
    c.fx.add(c.P("N2_04", .74), K.whoosh(.4, 500, 4000), .15)
    c.fx.add(c.P("N2_04", .74) + .35, K.card(), .45)
    c.stab(c.P("N2_04", .74) + .35, .34, ("C", "D#", "G", "A#"))
    c.mus.add(c.P("N2_04", .74) + .35, K.crash(2.5), .12)


def ch3(c):
    K = c.k
    c.card()
    # blackjack: the band, the deal, the memory
    c.groove(c.S("blackjack"), c.P("N3_01", .28), 104, .8)
    for i in range(10):
        c.fx.add(c.V("N3_01") + .25 + i * .16, K.card(), .28, -.6 + (i % 5) * .3)
    for i in range(52):
        c.fx.add(c.P("N3_01", .3) + i * .008, K.tick(4200, .003), .03, .4)
    c.hit(c.P("N3_01", .36) + .2, .7)
    for i in range(10):
        c.fx.add(c.P("N3_01", .68) + i * .12, K.whoosh(.15, 1500, 5000), .06, .5)
    c.drone(c.P("N3_01", .28), c.E("blackjack"), .07)
    for i in range(14):
        c.fx.add(c.V("N3_02") + .1 + i * .05, K.tick(1800, .004), .08, -.3)
    c.stab(c.P("N3_02", .55), .26, ("C", "E", "G", "B"))
    c.mus.add(c.P("N3_02", .55), K.vibe(note("B", 5), 2.2), .05)
    # kelly: mainframe, pages, the formula, three bankrolls
    t = c.S("kelly")
    c.fx.add(t, K.hum(4.6, 60) * .6, .05)
    for i in range(40):
        c.fx.add(t + K.rng.uniform(0, 4.5), K.tick(K.rng.uniform(600, 1400), .005), .06, K.rng.uniform(-.6, .6))
    c.fx.add(t, K.lp(K.noise(4.6), 900) * (.5 + .5 * np.sin(np.arange(K.n(4.6)) / SR * 2 * np.pi * 7)), .03)
    c.fx.add(c.V("N3_03") + 4.3, K.paper(.5), .2)
    c.groove(c.S("kelly") + .5, c.V("N3_03") + 7.4, 96, .55, piano=False)
    c.mus.add(c.V("N3_03") + 7.6, K.vibe(note("G", 5), 2.5), .07)
    c.stab(c.V("N3_03") + 7.6, .2, ("G", "B", "D", "F"))
    c.drone(c.V("N3_03") + 7.4, c.E("kelly"), .07)
    c.fx.add(c.V("N3_04") + .1, K.sweep(300, 360, 1.4) * K.env(K.n(1.4), .8), .04)
    tb = c.P("N3_04", .42)
    c.fx.add(tb, K.sweep(400, 900, 1.0, .5) * K.adsr(K.n(1.0), .02, .1), .05)
    c.hit(tb + 1.1, .8)
    c.mus.add(tb + 1.2, K.horn([note("G", 3), note("C#", 4)], 1.2, 1200), .15)
    for i, n in enumerate(["C", "D#", "G", "A#", "D", "G"]):
        c.mus.add(c.P("N3_04", .6) + i * .2, K.vibe(note(n, 5 if i < 4 else 6), 1.2), .06)
    # Reno: snow, neon, the money
    c.fx.add(c.S("reno"), K.wind(c.D("reno")), .12)
    c.groove(c.S("reno") + .2, c.E("reno"), 108, .75)
    c.fx.add(c.P("N3_05", .2), K.paper(.4), .25)
    for dt in (0, .06, .1, .19, .23, .34):
        c.fx.add(c.P("N3_05", .5) + dt, K.tick(6000, .003), .08, .6)
    c.fx.add(c.P("N3_05", .68), K.card(), .15, .6)
    for i in range(24):
        c.fx.add(c.P("N3_05", .78) + (i / 24) ** 1.3 * 1.4, K.tick(2600, .006), .12)
    for i, n in enumerate([6, 9, 12, 15]):
        for j in range(n):
            c.fx.add(c.P("N3_05", .8) + i * .2 + j * .03, K.chip(), .06, -.2 + i * .15)
    c.mus.add(c.P("N3_05", .78) + 1.4, K.bell(note("E", 6), 1.6, .5), .12)
    c.stab(c.P("N3_05", .78) + 1.4, .3, ("C", "E", "G", "B"))
    # book: the release, the craze
    c.fx.add(c.S("book"), K.murmur(3.4) * .7, .08)
    c.fx.add(c.P("N3_06", .22), K.whoosh(.5, 400, 3000), .15)
    c.stab(c.P("N3_06", .45), .26, ("F", "A", "C", "E"))
    c.groove(c.P("N3_06", .45), c.E("book"), 112, .8)
    c.fx.add(c.P("N3_06", .66), K.murmur(c.E("book") - c.P("N3_06", .66)) * 1.6, .1)
    for i in range(20):
        c.fx.add(c.P("N3_06", .72) + K.rng.uniform(0, 1), K.blip(K.rng.uniform(900, 1600), .05), .05, K.rng.uniform(-.8, .8))
    # fight: alarms, strikes, decks, BARRED
    for i in range(4):
        c.mus.add(c.V("N3_07") + i * .5, K.horn([note("C", 4), note("F#", 4)], .4, 2600), .16)
    c.hit(c.V("N3_07") + .25, .9)
    c.fx.add(c.P("N3_07", .25), K.scribble(.25, 20), .25)
    c.fx.add(c.P("N3_07", .3), K.scribble(.25, 20), .25)
    for i in range(6):
        c.fx.add(c.P("N3_07", .44) + i * .07, K.card(), .25, -.4 + i * .15)
    c.hit(c.P("N3_07", .64) + .2, 1.0)
    c.drone(c.V("N3_07"), c.E("fight"), .09)
    # coffee: it gets darker
    c.drone(c.S("coffee"), c.E("coffee"), .15, "C")
    c.mus.add(c.P("N3_08", .3), K.bell(note("E", 7), .9, .2), .08)
    t = c.P("N3_08", .5)
    while t < c.E("coffee"):
        c.mus.add(t, K.heartbeat(), .45)
        t += .9
    c.fx.add(c.P("N3_08", .6), K.sweep(200, 90, 1.4, .6) * K.adsr(K.n(1.4), .3, .3), .08)
    c.fx.add(c.P("N3_08", .8), K.glitch(.8), .12)
    # road: engine, screech, the stop, the linkage
    tr = c.S("road")
    n = K.n(3.9)
    eng = K.lp(K.saw(55, 3.9, .01) * (1 + .3 * np.linspace(0, 1, n)), 400) * np.linspace(.4, 1, n)
    c.fx.add(tr, eng, .25)
    t = tr + .3
    while t < c.V("N3_09") + 3.9:
        c.mus.add(t, K.heartbeat(), .5)
        t += .6
    c.fx.add(c.V("N3_09") + 3.9, K.screech(1.6), .3)
    c.fx.add(c.V("N3_09") + 5.3, K.lp(K.noise(1.2), 600) * K.env(K.n(1.2), .3), .3)
    c.fx.add(c.P("N3_09", .78), K.hum(1.5, 50), .04)
    c.hit(c.P("N3_09", .84) + .3, .7)
    c.drone(c.P("N3_09", .78), c.E("road"), .1)
    # small: quiet, then the city (the band returns for the bigger table)
    for i, nn in enumerate(["C", "G", "D#"]):
        c.mus.add(c.V("N3_10") + .3 + i * 1.2, K.piano(note(nn, 4), 2.4), .08)
    c.fx.add(c.P("N3_10", .66), K.whoosh(1.6, 200, 2000), .15)
    c.groove(c.P("N3_10", .72), c.E("small"), 104, .8)


def ch4(c):
    K = c.k
    c.card()
    # the biggest casino has a ticker
    c.fx.add(c.S("ticker"), K.ball_roll(1.6, .8), .12)
    c.fx.add(c.V("N4_01") + 1.2, K.whoosh(.5, 400, 4000), .18)
    c.fx.add(c.V("N4_01") + 1.55, K.card(), .3)
    for i in range(int(1.6 / .04)):
        c.fx.add(c.V("N4_01") + 2.25 + i * .04, K.typewriter(), .1, .3)
    c.stab(c.V("N4_01") + 2.3, .3, ("C", "E", "G", "B"))
    c.fx.add(c.V("N4_01") + 3.85, K.murmur(2.6) * 2.2, .16)
    # hedge
    c.groove(c.S("hedge"), c.E("hedge"), 100, .7)
    for i, t in enumerate((c.P("N4_02", .08), c.P("N4_02", .14))):
        c.fx.add(t, K.blip(700 + 400 * i, .12), .15, -.5 + i)
    c.fx.add(c.P("N4_02", .3), K.card(), .2)
    c.hit(c.P("N4_02", .47) + .2, .6)
    c.hit(c.P("N4_02", .6) + .2, .6)
    for i in range(6):
        c.fx.add(c.P("N4_02", .7) + i * .06, K.tick(3800, .004), .12)
    for i, n in enumerate(["C", "E", "G", "B", "D", "E"]):
        c.mus.add(c.P("N4_02", .8) + i * .27, K.vibe(note(n, 5 if i < 4 else 6), 1.3), .05)
    c.stab(c.P("N4_02", .86), .26, ("F", "A", "C", "E"))
    # Beat the Market, 1967 → 1973 → 1997
    c.groove(c.S("market"), c.E("market"), 96, .55, ride=False)
    c.fx.add(c.P("N4_03", .3), K.whoosh(.4, 500, 3500), .12)
    c.fx.add(c.S("market") + 5.2, K.whoosh(.8, 200, 2500), .12)
    c.mus.add(c.S("market") + 6.2, K.vibe(note("G", 5), 1.8), .06)
    c.mus.add(c.P("N4_03", .84), K.bell(note("C", 6), 2.2, .7), .1)
    # the fund: 19 rising bars
    c.groove(c.S("fund"), c.P("N4_04", .25), 104, .6, piano=False)
    for i in range(19):
        c.mus.add(c.P("N4_04", .25) + i * .07, K.bass(midi(36 + [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29, 31, 34, 36, 39, 41, 43][i]) , .4), .25)
        c.fx.add(c.P("N4_04", .25) + i * .07, K.tick(2000 + i * 60, .005), .06)
    c.stab(c.P("N4_04", .74) + .2, .38, ("C", "E", "G", "D"))
    c.mus.add(c.P("N4_04", .74) + .2, K.crash(2.6), .14)
    # pivot: three wins, then something else
    for i in range(3):
        c.mus.add(c.V("N4_05") + .35 + i * .45, K.bell(note(["C", "E", "G"][i], 6), 1.4, .5), .09)
    c.drone(c.P("N4_05", .55), c.E("pivot"), .09)
    c.fx.add(c.P("N4_05", .6), K.whoosh(.5, 300, 2000), .12)
    c.mus.add(c.P("N4_05", .7), K.piano(note("D#", 4), 2.2), .08)


def ch5(c):
    K = c.k
    c.card()
    # 1991: a statement, a line too smooth, a trusted man
    c.groove(c.S("client"), c.P("N5_01", .8), 92, .55, piano=False)
    c.fx.add(c.V("N5_01") + .2, K.paper(.5), .25)
    for i in range(5):
        c.fx.add(c.V("N5_01") + .55 + i * .3, K.typewriter(), .15, -.4)
    c.fx.add(c.P("N5_01", .3), K.scribble(.4, 9), .18)
    for i in range(36):
        c.fx.add(c.P("N5_01", .62) + i * .025, K.tick(3000, .003), .05, .4)
    c.mus.add(c.P("N5_01", .8), K.vibe(note("E", 6), 2.5), .07)
    c.drone(c.P("N5_01", .8), c.E("client"), .1)
    c.fx.add(c.V("N5_02") - .2, K.scribble(3.0, 7), .06)
    # 160 trades, half never happened
    c.drone(c.S("audit"), c.E("audit"), .12)
    for i in range(160):
        c.fx.add(c.V("N5_03") + .1 + i * .012, K.tick(3800, .002), .025, .3)
    for i in range(80):
        c.fx.add(c.P("N5_03", .5) + i * .03, K.tick(900, .01), .12, K.rng.uniform(-.6, .6))
    t = c.P("N5_03", .45)
    while t < c.E("audit"):
        c.mus.add(t, K.heartbeat(), .38)
        t += .8
    c.fx.add(c.P("N5_04", .4), K.riser(1.4, 200, 5000), .12)
    c.hit(c.P("N5_04", .4) + 1.4, 1.0)
    # the call
    c.hit(c.V("N5_05") + .22, 1.1)
    c.fx.add(c.V("N5_05") + 1.1, K.bell(note("E", 6), .4, .15) * (np.sin(np.arange(K.n(.4)) / SR * 2 * np.pi * 22) > 0), .08)
    c.fx.add(c.V("N5_05") + 1.5, K.tick(700, .02), .2)
    # the name: near silence, a low swell, one hit on the last letter
    tn = c.P("N5_06", .45)
    c.mus.add(c.V("N5_06"), K.pad([note("C", 1), note("F#", 1), note("C", 2)], c.E("name") - c.V("N5_06") + .6, 120, 500, .8, .5), .2)
    for i, ch in enumerate("BERNIE MADOFF"):
        if ch != " ":
            c.fx.add(tn + i * .09, K.typewriter(), .22, (i - 6) / 8)
    c.mus.add(tn + 12 * .09 + .05, K.boom(1.6), .5)
    c.mus.add(tn + 12 * .09 + .05, K.horn([note("C", 3), note("F#", 3), note("C", 4)], 1.8, 1400), .2)
    # 2008
    for i in range(18):
        c.fx.add(c.V("N5_07") + .1 + (i / 18) ** 1.5 * 1.6, K.tick(1600, .01), .18)
    c.fx.add(c.V("N5_07") + 2.4, K.lp(K.noise(2.6), 700) * K.adsr(K.n(2.6), .2, .3), .1)
    for i in range(10):
        c.fx.add(c.V("N5_07") + 2.5 + i * .25, K.wood(140), .15, (-1) ** i * .3)
    c.fx.add(c.V("N5_07") + 5.0, K.paper(.35), .3)
    c.fx.add(c.V("N5_07") + 5.3, K.paper(.35), .3)
    c.hit(c.V("N5_07") + 5.6, .8)
    for i in range(3):
        c.fx.add(c.P("N5_07", .77) + i * .2, K.blip(500, .1), .12)
    c.drone(c.V("N5_07") + 2.4, c.E("collapse"), .1)
    # the secret: recap, then the line
    c.groove(c.S("secret"), c.P("N5_08", .33), 104, .6)
    c.fx.add(c.V("N5_08") + .4, K.card(), .3)
    c.fx.add(c.P("N5_08", .33), K.whoosh(.6, 200, 2000), .15)
    for i in range(3):
        c.mus.add(c.P("N5_08", .44) + i * .2, K.piano(note(["C", "D#", "G"][i], 4), 1.6), .1)
    c.fx.add(c.P("N5_08", .66), K.whoosh(.8, 300, 3000), .12)
    c.fx.add(c.P("N5_08", .7), K.glitch(.3), .12)
    c.stab(c.P("N5_08", .84), .4, ("C", "E", "G", "B"))
    c.mus.add(c.P("N5_08", .84), K.crash(3), .16)
    # the ball stops: the one full spin of the film, then the band plays out
    run_d = max(4.2, c.VE("N5_09") - c.S("ball") - .2)
    c.fx.add(c.S("ball"), K.ball_roll(run_d * .6, .5), .22)
    drop = c.S("ball") + run_d * .55
    for i in range(7):
        c.fx.add(drop + .15 + i * (.1 + i * .05), K.tick(K.rng.uniform(2500, 4200), .006), .35 * (1 - i / 9), K.rng.uniform(-.3, .3))
    c.mus.add(c.S("ball") + run_d, K.ear_tone(note("G", 5)), .2)
    c.mus.add(c.S("ball") + run_d + .05, K.vibe(note("G", 5), 2.5), .07)
    c.groove(c.S("ball") + run_d + .3, c.E("ball"), 108, .9, bar0=4)
    c.stab(c.E("ball") - 3.2, .35, ("C", "D#", "G", "A#"))
    c.mus.add(c.E("ball") - 3.2, K.crash(3), .12)


CUES = {"ch0": ch0, "ch1": ch1, "ch2": ch2, "ch3": ch3, "ch4": ch4, "ch5": ch5}


def main(argv):
    chs = argv or [c for c in CUES if os.path.exists(os.path.join(ROOT, c, "index.html"))]
    for ch in chs:
        c = Ch(ch)
        CUES[ch](c)
        c.write()


if __name__ == "__main__":
    main(sys.argv[1:])
