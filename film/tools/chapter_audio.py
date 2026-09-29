"""Original score + sound design for chapters 1-6, placed on the same VO-driven layout as the visuals.
Writes chN/assets/audio/music.wav and sfx.wav (48 kHz, 24-bit). Music ducks under real VO takes (−8 dB);
silent placeholders leave it untouched. Re-run after tools/retime_chapters.py.

Usage: python3 tools/chapter_audio.py [ch1 ch3 ...]"""
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
F = {n: 440 * 2 ** ((i - 9) / 12) for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def note(name, octv):
    return F[name] * 2 ** (octv - 4)


class Ch:
    def __init__(self, ch):
        s = open(os.path.join(ROOT, ch, "index.html"), encoding="utf-8").read()
        self.tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', s, re.S).group(1))
        self.sc, self.vo, self.total = layout(self.tim)
        self.k = Kit(self.total, seed=self.tim.get("seed", 1))
        self.mus, self.fx = Bus(self.k.N), Bus(self.k.N)
        self.ch = ch

    S = lambda self, i: self.sc[i][0]
    E = lambda self, i: self.sc[i][0] + self.sc[i][1]
    D = lambda self, i: self.sc[i][1]
    V = lambda self, i: self.vo[i][0]
    VE = lambda self, i: self.vo[i][0] + self.vo[i][1]
    P = lambda self, i, f: self.vo[i][0] + f * self.vo[i][1]

    # ---- reusable beds ----
    def card(self, sid="card"):
        k = self.k
        self.fx.add(self.S(sid) + .3, k.whoosh(.9, 250, 3000), .18)
        self.mus.add(self.S(sid) + .35, k.bell(note("D", 5), 2.6, .8), .05, -.2)
        self.mus.add(self.S(sid) + .35, k.sub(80, 45, .6, .2), .35)

    def tines(self, t0, t1, motif, bpm=92, g=.14, octv=0):
        k, t, i, step = self.k, t0, 0, 60 / bpm / 2
        while t < t1 - .1:
            self.mus.add(t, k.tine(motif[i % len(motif)] * 2 ** octv, 1.4), g, .35 * np.sin(i * 1.3))
            t += step
            i += 1

    def shaker(self, t0, t1, bpm=92, g=.03):
        k, t, i, step = self.k, t0, 0, 60 / bpm / 4
        while t < t1 - .05:
            self.fx.add(t, k.bp(k.noise(.05), 5000, 12000) * k.env(k.n(.05), .012), g * (1.6 if i % 2 else 1), .5)
            t += step
            i += 1

    def pulse(self, t0, t1, bpm=96, g=.4, tick=True):
        k, t, i, beat = self.k, t0, 0, 60 / bpm
        while t < t1 - .05:
            self.mus.add(t, k.sub(), g)
            if tick:
                self.mus.add(t + beat / 2, k.tick(2300, .01), .08, .3)
            t += beat
            i += 1

    def pad(self, t0, t1, freqs, g=.12, c0=300, c1=1400):
        if t1 - t0 > .3:
            self.mus.add(t0, self.k.pad(freqs, t1 - t0, c0, c1, min(1.2, (t1 - t0) / 3), min(1.0, (t1 - t0) / 3)), g)

    # ---- master ----
    def write(self):
        mus = self.mus.reverb(.3, 2.3, 6000).stereo()
        fx = self.fx.reverb(.16, 1.5, 7000, seed=9).stereo()
        # duck music under real VO takes
        duck = np.ones(self.k.N)
        for vid, (st, du) in self.vo.items():
            p = os.path.join(ROOT, self.ch, "assets", "vo", vid + ".wav")
            if not os.path.exists(p):
                continue
            x, sr = sf.read(p, always_2d=True)
            x = x.mean(1)
            if np.abs(x).max() < 1e-4:
                continue
            rms = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, "same"))
            act = (rms > 10 ** (-40 / 20)).astype(float)
            seg = np.zeros(self.k.N)
            i0 = int(st * SR)
            seg[i0:i0 + len(act)] = act[: self.k.N - i0]
            kk = np.ones(int(.35 * SR)) / int(.35 * SR)
            seg = np.clip(np.convolve(seg, kk, "same") * 1.6, 0, 1)
            duck = np.minimum(duck, 1 - seg * (1 - 10 ** (-8 / 20)))
        mus = mus * duck[:, None]
        # effects dip too (up to -6 dB) while the narrator speaks, so no hit buries the end of a word
        fx = fx * (1 - (1 - duck) * (1 - 10 ** (-6 / 20)) / (1 - 10 ** (-8 / 20)))[:, None]
        for x in (mus, fx):   # edge fades so chapters butt-join cleanly
            n0, n1 = int(.4 * SR), int(.8 * SR)
            x[:n0] *= np.linspace(0, 1, n0)[:, None]
            x[-n1:] *= np.linspace(1, 0, n1)[:, None]
        # consistent bed across chapters: -24 LUFS integrated (music+sfx, before VO), sample peak ≤ -3 dBFS
        import pyloudnorm as pyln
        mix = mus + fx
        lufs = pyln.Meter(SR).integrated_loudness(mix)
        g = 10 ** ((-24.0 - lufs) / 20)
        peak = max(np.abs(mix).max() * g, 1e-9)
        if peak > 10 ** (-3 / 20):
            g *= 10 ** (-3 / 20) / peak
        out = os.path.join(ROOT, self.ch, "assets", "audio")
        os.makedirs(out, exist_ok=True)
        sf.write(os.path.join(out, "music.wav"), (mus * g).astype(np.float32), SR, subtype="PCM_24")
        sf.write(os.path.join(out, "sfx.wav"), (fx * g).astype(np.float32), SR, subtype="PCM_24")
        print(f"{self.ch}: {self.total:.2f}s  peak-normalised gain {20 * np.log10(g):+.1f} dB")


# ═════════ per-chapter cue sheets (mirror the animation beats in chN/index.html) ═════════
def ch1(c):
    k = c.k
    c.card()
    Fm = [note("F", 4), note("A", 4), note("C", 5), note("A", 4), note("D", 5), note("C", 5), note("A", 4), note("G", 4)]
    c.pad(c.S("place"), c.E("place"), [note("F", 2), note("C", 3), note("A", 3)], .07, 500, 1100)
    c.tines(c.S("place") + .4, c.V("C1_03") - .3, Fm, g=.12, octv=-1)
    c.shaker(c.V("C1_02"), c.V("C1_03") - .3)
    for i in range(4):
        c.fx.add(c.P("C1_01", .56 + i * .1), k.scribble(.7, 10), .07, -.3)
    c.fx.add(c.P("C1_01", .12), k.wood(520), .12)
    c.fx.add(c.V("C1_02") - .2, k.paper(), .12)
    c.fx.add(c.V("C1_03") + .15, k.scribble(.35, 6), .16)        # red strike
    c.mus.add(c.V("C1_03") + .15, k.sub(90, 50, .4, .1), .3)
    # later: ticking clock, then the reveal chime
    t = c.S("later") + .3
    while t < c.S("later") + 2.5:
        c.fx.add(t, k.tick(1800, .01), .1, -.3)
        t += .125
    c.pad(c.S("later"), c.E("later"), [note("D", 3), note("A", 3), note("F", 4)], .08, 400, 1200)
    c.mus.add(c.P("C1_04", .45), k.bell(note("A", 5), 2.4, .6), .05, .3)
    c.fx.add(c.P("C1_04", .45), k.crackle(.8, 200, 30), .12, .2)
    # teacher: near silence, pen, the X
    c.fx.add(c.S("teacher"), k.lp(k.noise(c.D("teacher")), 300) * k.adsr(k.n(c.D("teacher")), .3, .3), .018)
    c.fx.add(c.P("C1_05", .55), k.scribble(.5, 6), .15)
    c.fx.add(c.P("C1_06", .45), k.scribble(.3, 7), .2)
    c.fx.add(c.P("C1_06", .45) + .3, k.scribble(.3, 7), .2)
    c.mus.add(c.P("C1_06", .45) + .3, k.sub(70, 40, .5, .12), .3)
    # question: F04 carries its own foley (pencil, birds); a gentle rise to the lens
    c.pad(c.S("question"), c.E("question"), [note("F", 2), note("C", 3), note("G", 3), note("A", 3)], .09, 400, 1800)
    c.tines(c.V("C1_08"), c.E("question") - 1.2, [note("C", 5), note("A", 4), note("F", 4), note("G", 4)], g=.09, octv=-1)
    c.mus.add(c.E("question") - 1.15, k.bell(note("F", 5), 2.0, .5), .06)
    c.fx.add(c.E("question") - 1.1, k.whoosh(1.0, 3000, 200), .14)


def ch2(c):
    k = c.k
    c.card()
    travel = [note("D", 4), note("F", 4), note("A", 4), note("C", 5), note("A", 4), note("F", 4)]
    c.pad(c.S("route"), c.E("route"), [note("D", 2), note("A", 2), note("F", 3)], .08, 400, 1200)
    c.tines(c.S("route") + .5, c.E("route") - .4, travel, bpm=100, g=.1, octv=-1)
    c.shaker(c.S("route") + .5, c.E("route") - .4, bpm=100, g=.022)
    for f in (.05, .25, .55):
        c.fx.add(c.P("C2_01", f), k.wood(700), .12)
    # ask: tension plucks, beakers slide, ice lands
    t, i = c.P("C2_02", .3), 0
    while t < c.P("C2_02", .9):
        c.mus.add(t, k.pluck([note("D", 3), note("A", 3), note("F", 3), note("A", 3)][i % 4], .35, 1600), .08, .2 * np.sin(i))
        t += .3125
        i += 1
    c.fx.add(c.P("C2_02", .66), k.whoosh(.8, 300, 2000), .12)
    c.fx.add(c.P("C2_02", .82), k.crackle(.9, 220, 20), .16)
    c.mus.add(c.P("C2_02", .92), k.bell(note("D", 5), 2.2, .6), .05)
    # scale: chalk
    c.pad(c.S("scale"), c.E("scale"), [note("D", 2), note("A", 2)], .08, 250, 700)
    c.fx.add(c.S("scale") + .2, k.scribble(1.0, 5), .08)
    c.fx.add(c.P("C2_03", .35), k.wood(260), .2)
    c.fx.add(c.P("C2_04", .25), k.wood(300), .12)
    # lab: FLOW_07 carries pour / lid / frost foley; add a cold drone + crystal shimmer at the hand-off
    c.pad(c.S("lab"), c.E("lab"), [note("D", 2), note("A", 2), note("E", 3)], .06, 300, 900)
    for j, f in enumerate([note("D", 6), note("A", 5), note("E", 6)]):
        c.mus.add(c.E("lab") - 1.6 + j * .08, k.bell(f, 2.5, .6), .03, [-.4, .4, 0][j])
    c.fx.add(c.E("lab") - 1.6, k.crackle(1.5, 60, 240), .14)
    # paper: warm resolve, then pulled into the "?"
    c.pad(c.S("paper"), c.E("paper"), [note("F", 2), note("C", 3), note("A", 3)], .1, 500, 1400)
    c.fx.add(c.S("paper") + .1, k.paper(.4), .14)
    c.fx.add(c.E("paper") - 1.1, k.riser(1.05, 300, 6000), .12)
    c.mus.add(c.E("paper") - .05, k.sub(95, 40, .5, .15), .45)


def ch3(c):
    k = c.k
    c.card()
    # molecules: clock ticks that slow as the temperature drains
    t0, t1 = c.S("molecules") + .5, c.E("molecules") - .5
    cool = c.P("C3_01", .52)
    t = t0
    while t < t1:
        u = 0 if t < cool else min(1, (t - cool) / max(1, t1 - cool))
        c.mus.add(t, k.tick(2600 - 900 * u, .012), .12 * (1 - .6 * u), .2 * np.sin(t * 3))
        t += .16 + .5 * (1 - (1 - u) ** 3)
    c.pad(c.S("molecules"), c.E("molecules"), [note("D", 2), note("A", 2), note("F", 3)], .09, 1400, 300)
    c.fx.add(cool - .3, k.whoosh(1.2, 4000, 400), .08)
    # race graph: ostinato plucks, a hit at the cursor, silence then the ≠
    pat, t, i = [note("D", 3), note("A", 3), note("F", 3), note("A", 3), note("D", 4), note("A", 3), note("F", 3), note("A", 3)], c.S("race") + .4, 0
    while t < c.V("C3_03") - .3:
        c.mus.add(t, k.pluck(pat[i % 8], .4, 1200 + 10 * i), .08, .3 * np.sin(i))
        t += .156
        i += 1
    c.pulse(c.S("race") + .4, c.V("C3_03") - .3, 96, .3, tick=False)
    pm = c.P("C3_02", .58)
    c.mus.add(pm, k.bell(note("A", 5), 1.8, .4), .05)
    c.fx.add(pm, k.sub(120, 70, .3, .06), .3)
    c.pad(c.V("C3_03") - .2, c.E("race"), [note("D", 2), note("G#", 2), note("D", 3)], .08, 300, 900)
    c.fx.add(c.P("C3_03", .48), k.boom(.3), .35)
    # lineup: steady pulse; each suspect has its own sound
    c.pulse(c.S("lineup") + .6, c.V("C3_09"), 96, .28)
    c.pad(c.S("lineup"), c.E("lineup"), [note("D", 2), note("A", 2), note("C", 3), note("F", 3)], .07, 400, 1400)
    for i, vid in enumerate(["C3_04", "C3_05", "C3_06", "C3_07", "C3_08"]):
        c.fx.add(c.V(vid), k.wood(900 + 80 * i), .12, -.4 + .2 * i)
        c.mus.add(c.P(vid, .5), k.pluck(note("A", 4) * 2 ** (i / 12), .6, 3000), .06, .4)
    c.fx.add(c.V("C3_04"), k.lp(k.noise(c.VE("C3_04") - c.V("C3_04")), 2500) * k.adsr(k.n(c.VE("C3_04") - c.V("C3_04")), .5, .5), .05)   # steam hiss
    t = c.V("C3_05")
    while t < c.VE("C3_05"):
        c.fx.add(t, k.blip(k.rng.uniform(500, 1400), .08), .05, k.rng.uniform(-.5, .5))  # bubbles
        t += k.rng.uniform(.08, .25)
    c.fx.add(c.V("C3_06"), k.whoosh(c.VE("C3_06") - c.V("C3_06"), 300, 900), .1)       # churn
    c.fx.add(c.P("C3_07", .3), k.crackle(1.6, 120, 30), .14)                             # frost
    for r in range(10):
        c.fx.add(c.P("C3_08", .4) + r * .16, k.wood(1400 + 200 * (r % 3)), .06, .3)      # dice
    # results vary: wobbling detuned pad + stamp
    for j in range(8 * 5):
        c.fx.add(c.V("C3_09") + .3 + (j % 8) * .09 + (j // 8) * .05, k.tick(3000, .006), .05, -.6 + .3 * (j // 8))
    c.pad(c.P("C3_09", .45), c.E("lineup"), [note("D", 3), note("D#", 3), note("A", 3)], .06, 800, 400)
    c.fx.add(c.P("C3_09", .55), k.sub(160, 90, .25, .05) + .3 * k.lp(k.noise(.25), 2000) * k.env(k.n(.25), .02), .35)


def ch4(c):
    k = c.k
    c.card()
    # contest: envelopes flutter, counter ticks accelerate
    t0, t1 = c.P("C4_01", .15), c.P("C4_01", .95)
    t = t0
    while t < t1:
        u = (t - t0) / (t1 - t0)
        c.fx.add(t, k.paper(.12), .03, k.rng.uniform(-.6, .6))
        c.fx.add(t, k.tick(3200, .005), .04, .4)
        t += .14 - .1 * u
    c.pad(c.S("contest"), c.V("C4_02"), [note("E", 2), note("B", 2), note("G", 3)], .08, 300, 1200)
    c.fx.add(c.V("C4_02"), k.lp(k.noise(.6), 1500) * k.env(k.n(.6), .2), .1)
    c.mus.add(c.P("C4_02", .15), k.bell(note("E", 5), 3.0, 1.0), .07)
    c.pad(c.V("C4_02"), c.E("contest"), [note("C", 3), note("E", 3), note("G", 3), note("B", 3)], .09, 600, 1200)
    # measure: clinical blips, a false swell, resolved
    t = c.S("measure") + .5
    while t < c.E("measure") - .5:
        c.mus.add(t, k.blip(1760, .1), .04, .5)
        t += .9
    c.pad(c.S("measure"), c.E("measure"), [note("A", 2), note("E", 3)], .07, 300, 800)
    c.fx.add(c.S("measure") + .6, k.whoosh(1.0, 400, 1800), .05)                 # probe lowers into the vial
    T0 = c.P("C4_03", .45) + 1.3
    TD = max(2.4, c.V("C4_04") + .3 - T0)
    c.mus.add(T0 + .28 * TD, k.bell(note("E", 6), 1.2, .4), .04, -.3)          # cold reaches 0 °C
    c.mus.add(T0 + .59 * TD, k.bell(note("B", 5), 1.2, .4), .04, .3)           # then hot
    m1 = c.P("C4_04", .55)
    for j in range(6):
        c.fx.add(m1 + 1.6 + .12 * j, k.tick(2400, .01), .05, .5)               # "apparent effect" glitch
    c.fx.add(m1, k.whoosh(.6, 600, 1500), .08)
    c.mus.add(m1 + .2, k.pad([note("A", 3), note("A#", 3), note("E", 4)], 2.2, 400, 1600, .8, .8), .08)
    c.mus.add(max(m1 + 2.4, c.VE("C4_04") - .2) + .1, k.bell(note("A", 5), 2.0, .5), .05)
    # doubt: near silence, the circle almost closes, a cold ? chime
    c.fx.add(c.S("doubt"), k.lp(k.noise(c.D("doubt")), 300) * k.adsr(k.n(c.D("doubt")), .3, .3), .02)
    c.fx.add(c.S("doubt") + .4, k.scribble(1.3, 11), .08)                        # the quote is written out
    c.fx.add(c.S("doubt") + 1.8, k.scribble(1.4, 12), .08)
    c.fx.add(c.P("C4_05", .5), k.scribble(1.1, 5), .12)
    c.mus.add(c.P("C4_06", .45), k.bell(note("D", 6), 2.6, .8), .05)
    for j, f in enumerate([note("A", 6), note("E", 6), note("D", 7), note("F#", 6), note("B", 6)]):
        c.mus.add(c.P("C4_06", .45) + .5 + .3 * j, k.bell(f, .9, .3), .025, (j - 2) * .3)   # frost grows from the "?"
    c.pad(c.V("C4_06"), c.E("doubt"), [note("D", 3), note("A", 3), note("E", 4)], .05, 800, 1800)


def ch5(c):
    k = c.k
    c.card()
    c.pad(c.S("sametemp"), c.E("shortcut"), [note("D", 2), note("A", 2), note("F", 3), note("C", 4)], .08, 300, 1600)
    c.fx.add(c.P("C5_01", .78), k.sub(110, 60, .3, .06), .25)
    c.fx.add(c.P("C5_02", .42), k.whoosh(1.0, 300, 2500), .08)
    # landscape HERO: rising arpeggio, marbles roll, the lowest valley rings
    arp, t, i = [note("D", 3), note("F", 3), note("A", 3), note("C", 4), note("E", 4), note("A", 4)], c.S("landscape") + .3, 0
    while t < c.E("landscape") - .6:
        u = (t - c.S("landscape")) / c.D("landscape")
        c.mus.add(t, k.pluck(arp[i % 6], .5, 900 + 3000 * u), .05 + .06 * u, .35 * np.sin(i * .9))
        t += .195
        i += 1
    c.pad(c.S("landscape"), c.E("landscape"), [note("D", 2), note("A", 2), note("E", 3), note("F#", 3)], .12, 300, 2600)
    roll = lambda t, sec: c.fx.add(t, k.lp(k.noise(sec), 500) * np.linspace(.3, 1, k.n(sec)) * k.adsr(k.n(sec), .05, .2), .12)
    roll(c.P("C5_03", .6), 1.4)
    c.fx.add(c.P("C5_03", .6) + 1.4, k.wood(300), .12)
    hr = c.P("C5_04", .45)
    roll(hr, 1.6)
    for j, f in enumerate([note("A", 4), note("E", 5), note("A", 5), note("C#", 6)]):
        c.mus.add(hr + 1.65 + .03 * j, k.bell(f, 3.0, .9), .05, (j - 1.5) * .3)
    c.fx.add(hr + 1.65, k.crackle(1.0, 200, 40), .12)
    # lab: hum; Flow bloom = white swell
    c.fx.add(c.S("lab"), k.hum(c.D("lab"), 60), .03)
    c.fx.add(c.S("lab") + .3, k.whoosh(1.4, 800, 5000), .08)
    b = c.V("C5_05") + 2.4 + (6.3 - 2.95)
    c.mus.add(b - .6, k.riser(1.0, 800, 9000), .07)
    c.mus.add(b + .4, k.bell(note("E", 6), 2.5, .8), .05)
    # bead: soft pulses as the well is sculpted; curves wipe in
    t = c.S("bead") + .2
    while t < c.E("bead") - .3:
        c.mus.add(t, k.blip(880, .18), .05, -.2)
        t += .625
    c.pad(c.S("bead"), c.E("bead"), [note("E", 2), note("B", 2), note("G#", 3)], .08, 400, 1500)
    for j in range(3):
        c.fx.add(c.V("C5_07") + .3 + j * .35, k.whoosh(1.0, 1200 + 400 * j, 5000), .05)
    # quantum: FM shimmer
    tq = np.arange(k.n(c.D("quantum"))) / SR
    shimmer = np.sin(2 * np.pi * 660 * tq + 3 * np.sin(2 * np.pi * 3.3 * tq)) * .3 * (0.5 + .5 * np.sin(2 * np.pi * .25 * tq)) * k.adsr(len(tq), 1.0, 1.0)
    c.mus.add(c.S("quantum"), k.lp(shimmer, 3000), .06)
    c.fx.add(c.P("C5_08", .62), k.whoosh(.9, 2000, 400), .07)
    # principle: resolve and warm swell to dusk
    c.pad(c.S("principle"), c.E("principle"), [note("D", 3), note("F#", 3), note("A", 3), note("E", 4)], .12, 400, 2200)
    pr = c.P("C5_09", .35)
    c.mus.add(pr + 2.6, k.bell(note("D", 5), 3.0, 1.0), .07)
    c.mus.add(pr + 2.6, k.sub(80, 45, .6, .2), .35)


def ch6(c):
    k = c.k
    c.card()
    c.pad(c.S("water"), c.E("water"), [note("D", 2), note("A", 2), note("E", 3)], .08, 400, 1000)
    # life: savanna — wind, synthesized birds, warm tines
    c.fx.add(c.S("life"), k.wind(c.D("life")), .05)
    t = c.S("life") + .5
    while t < c.E("life") - .5:
        c.fx.add(t, k.chirp(), .03, k.rng.uniform(-.7, .7))
        t += k.rng.uniform(.6, 1.6)
    c.tines(c.S("life") + .5, c.E("life") - .5, [note("D", 4), note("F#", 4), note("A", 4), note("B", 4), note("A", 4), note("F#", 4)], bpm=84, g=.1, octv=-1)
    c.pad(c.S("life"), c.E("life"), [note("D", 2), note("A", 2), note("F#", 3)], .09, 500, 1300)
    # legacy: bright arpeggio lighting each field
    for i in range(4):
        c.mus.add(c.P("C6_03", .1 + i * .12) + .3, k.pluck([note("D", 4), note("F#", 4), note("A", 4), note("D", 5)][i], .8, 3600), .08, -.45 + .3 * i)
    c.pad(c.S("legacy"), c.E("legacy"), [note("D", 3), note("A", 3), note("F#", 4)], .08, 600, 1800)
    # quote: room tone only
    c.fx.add(c.S("quote"), k.lp(k.noise(c.D("quote")), 300) * k.adsr(k.n(c.D("quote")), .3, .3), .02)
    c.fx.add(c.S("quote") + .3, k.scribble(1.4, 12), .07)                        # the quote is written out
    c.fx.add(c.P("C6_04", .6), k.scribble(.7, 3), .1)                            # red circle round "confused"
    # return: FLOW_13 carries birds + frost crackle; cold drone under it; the replay pulse + hit
    c.pad(c.S("return"), c.E("return"), [note("D", 2), note("A", 2), note("E", 3)], .07, 300, 900)
    rp = max(c.S("return") + .2 + 7.6, c.E("return") - 3.8)
    c.pulse(rp + .3, rp + 2.6, 96, .3)
    c.mus.add(rp + 2.6, k.bell(note("D", 5), 2.6, .8), .06)
    # end card: glass chord, frost melts (reverse crackle), warm resolve
    ts = c.S("end")
    c.fx.add(ts, k.boom(.8), .45)
    for j, f in enumerate([note("D", 3), note("A", 3), note("D", 4), note("F#", 4), note("A", 4), note("D", 5)]):
        c.mus.add(ts + .01 * j, k.bell(f, 3.6, 1.3), .05, (j - 2.5) * .18)
    c.fx.add(ts + 1.6, k.crackle(1.6, 240, 40)[::-1], .12, .25)
    c.pad(ts + 1.4, c.E("end"), [note("D", 2), note("A", 2), note("F#", 3), note("D", 4)], .12, 400, 1600)


CUES = {"ch1": ch1, "ch2": ch2, "ch3": ch3, "ch4": ch4, "ch5": ch5, "ch6": ch6}

if __name__ == "__main__":
    for ch in sys.argv[1:] or sorted(CUES):
        c = Ch(ch)
        CUES[ch](c)
        c.write()
