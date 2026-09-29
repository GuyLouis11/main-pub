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


CUES = {"ch0": ch0, "ch1": ch1, "ch2": ch2}


def main(argv):
    chs = argv or [c for c in CUES if os.path.exists(os.path.join(ROOT, c, "index.html"))]
    for ch in chs:
        c = Ch(ch)
        CUES[ch](c)
        c.write()


if __name__ == "__main__":
    main(sys.argv[1:])
