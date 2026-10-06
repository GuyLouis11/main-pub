"""Original score + sound design for each Short. Everything is synthesized here (prophet/tools/audiokit.py instruments
plus drum-machine voices below): no samples, no licensed music. Cues sit on spoken words from public/<short>/timeline.json.
Music ducks ~7 dB under the narration.

  python3 tools/score.py monopoly      -> public/monopoly/music.wav, sfx.wav, mix.wav (−14 LUFS, −1.5 dBFS peak)"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
sys.path.insert(0, os.path.join(ROOT, "..", "prophet", "tools"))
from audiokit import Kit, Bus, SR  # noqa: E402
from master import limit  # noqa: E402

midi = lambda m: 440 * 2 ** ((m - 69) / 12)


class Drums(Kit):
    def kick(self, dec=0.22, punch=1.0):
        n = self.n(0.5)
        body = self.sweep(140, 42, 0.5, 0.35) * self.env(n, dec)
        click = self.hp(self.noise(0.5), 2000) * self.env(n, 0.003) * 0.35
        return np.tanh(1.6 * punch * body) + click

    def snare(self, dec=0.14):
        n = self.n(0.4)
        tone = self.sine(190, 0.4) * self.env(n, 0.05) * 0.5
        return tone + self.bp(self.noise(0.4), 1200, 9000) * self.env(n, dec)

    def clap(self):
        n = self.n(0.3)
        x = np.zeros(n)
        for k, d in enumerate((0, 0.011, 0.022, 0.034)):
            i = self.n(d)
            L = n - i
            x[i:] += self.bp(self.noise(0.3)[:L], 900, 5000) * self.env(L, 0.012 if k < 3 else 0.11)
        return x

    def hat(self, dec=0.03, open_=False):
        n = self.n(0.3 if open_ else 0.12)
        return self.hp(self.noise(n / SR), 7000) * self.env(n, 0.12 if open_ else dec)

    def bass808(self, f, sec=0.6):
        n = self.n(sec)
        return np.tanh(1.4 * self.sweep(f * 1.6, f, sec, 0.15) * self.env(n, 0.35)) * self.adsr(n, 0.002, 0.06)

    def stab(self, freqs, sec=0.5, bright=3200):
        s = sum(self.saw(f, sec, 0.008) for f in freqs) / len(freqs)
        return self.lp(s, bright) * self.env(len(s), 0.18) * self.adsr(len(s), 0.004, 0.08)

    def arp(self, f, sec=0.2):
        s = self.saw(f, sec, 0.003) * 0.6 + self.sine(f * 2, sec) * 0.2
        return self.lp(s, 2800) * self.env(len(s), 0.07) * self.adsr(len(s), 0.002, 0.02)

    def heartbeat(self):
        a = self.sub(70, 40, 0.3, 0.07)
        return np.concatenate([a, np.zeros(self.n(0.18)), a * 0.7])

    def tapestop(self, sec=0.7):
        n = self.n(sec)
        f = 220 * np.linspace(1, 0.08, n) ** 1.5
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * self.lp(self.noise(sec), 800)
        return self.lp(s, 1500) * np.linspace(1, 0, n)

    def scratch(self):
        out = []
        for d, up in ((0.09, 1), (0.07, -1), (0.12, 1)):
            n = self.n(d)
            f0, f1 = (400, 2600) if up > 0 else (2600, 500)
            out.append(self.bp(self.noise(d), 300, 4000) * 0.6 + 0.6 * self.sweep(f0, f1, d) * self.adsr(n, 0.004, 0.01))
        return np.concatenate(out)

    def ring(self, sec=1.4):
        n = self.n(sec)
        t = np.arange(n) / SR
        car = np.sin(2 * np.pi * 1020 * t) + np.sin(2 * np.pi * 1180 * t)
        am = (np.sin(2 * np.pi * 20 * t) > 0) * 1.0
        gate = ((t % 0.5) < 0.4) * 1.0
        return 0.35 * car * am * gate * self.adsr(n, 0.01, 0.05)

    def shutter(self):
        a = self.hp(self.noise(0.05), 1500) * self.env(self.n(0.05), 0.006)
        return np.concatenate([a, np.zeros(self.n(0.04)), a * 0.7])

    def typing(self, sec, cps=22):
        out = np.zeros(self.n(sec))
        k = 0
        while True:
            i = self.n(k / cps + self.rng.uniform(0, 0.012))
            if i >= len(out) - 3000:
                break
            c = self.tick(self.rng.uniform(1800, 3200), 0.006) * self.rng.uniform(0.5, 1)
            out[i:i + len(c)] += c[: len(out) - i]
            k += 1
        return out

    def stamp(self):
        return 0.8 * self.kick(0.08, 1.3) + 0.4 * self.lp(self.noise(0.5), 1200) * self.env(self.n(0.5), 0.04)

    def murmur(self, sec, angry=0.6):
        x = self.bp(self.noise(sec), 250, 1800)
        t = np.arange(len(x)) / SR
        am = 0.6 + 0.4 * np.sin(2 * np.pi * (1.3 + angry) * t + 1) * np.sin(2 * np.pi * 0.37 * t)
        return x * am * self.adsr(len(x), 0.4, 0.6)

    def flutter(self, sec=1.2):
        return self.crackle(sec, 40, 18) * 0.6 + self.paper(sec) * 0.5


def load(short):
    tl = json.load(open(os.path.join(ROOT, "public", short, "timeline.json")))
    L = {l["id"]: l for l in tl["lines"]}

    def w(lid, pre, off=0.0):
        for x in L[lid]["words"]:
            if x["w"].lower().replace("'", "").startswith(pre):
                return x["s"] + off
        raise KeyError(f"{pre} not in {lid}")
    return tl, L, w


def duck_env(tl, N):
    """1 outside speech, 0.45 inside, smoothed"""
    g = np.ones(N)
    for ln in tl["lines"]:
        a, b = int((ln["start"] - 0.05) * SR), int((ln["end"] + 0.1) * SR)
        g[max(0, a):min(N, b)] = 0.45
    return uniform_filter1d(g, int(0.12 * SR))


def grid(bus, t0, t1, bpm, step, fn, swing=0.0):
    b = 60 / bpm * step
    k = 0
    t = t0
    while t < t1:
        fn(bus, t, k)
        k += 1
        t = t0 + k * b + (swing * b if k % 2 else 0)


def monopoly():
    tl, L, w = load("monopoly")
    T = tl["total"]
    N = int(T * SR)
    k = Drums(T, seed=11)
    M = Bus(N)
    F = Bus(N)
    bpm = 100
    beat = 60 / bpm
    s = lambda lid: L[lid]["start"]
    C, Eb, F_, G, Ab, Bb = 48, 51, 53, 55, 56, 58
    chords = [[C, Eb, G], [Ab - 12, C, Eb], [F_ - 12, Ab - 12, C], [G - 12, Bb - 12, 50]]
    # A: hook — boom, low drone, ticking clock, motif
    M.add(0.0, k.boom(1.1), 0.9)
    M.add(0.0, k.pad([midi(36), midi(43)], s("L03") + 0.5, 200, 700, 0.3, 0.6), 0.35)
    grid(M, 0.3, s("L03"), bpm, 0.5, lambda b, t, i: b.add(t, k.tick(3000 if i % 2 == 0 else 2400, 0.008), 0.18, 0.4 if i % 2 else -0.4))
    for i, m in enumerate([C + 24, Eb + 24, G + 24, Ab + 24, G + 24]):
        M.add(w("L01", "million") - 0.05 + i * beat / 2, k.pluck(midi(m), 0.5, 3000), 0.28)
    # B: heist groove L03 → L09
    t0, t1 = s("L03") - 0.1, s("L09")
    bars = int((t1 - t0) / (4 * beat)) + 1
    for bi in range(bars):
        tb = t0 + bi * 4 * beat
        ch = chords[bi % 4]
        M.add(tb, k.pad([midi(m) for m in ch], 4 * beat + 0.3, 500, 1100, 0.15, 0.3), 0.22)
        for q in range(8):
            tq = tb + q * beat / 2
            if tq >= t1:
                break
            M.add(tq, k.pluck(midi(ch[0] - 12 + (7 if q % 4 == 3 else 0)), 0.3, 1400), 0.32)
            M.add(tq, k.hat(0.025), 0.12 if q % 2 else 0.2, 0.3)
        for q in (0, 2):
            M.add(tb + q * beat, k.kick(0.2), 0.55)
        for q in (1, 3):
            M.add(tb + q * beat, k.clap(), 0.22, -0.1)
    M.add(s("L07") - 1.6, k.riser(1.6, 500, 6000), 0.18)
    # C: money — stabs on the count
    t0, t1 = s("L09"), s("L10")
    grid(M, t0, t1, bpm, 1, lambda b, t, i: (b.add(t, k.kick(0.24, 1.2), 0.6), b.add(t + beat / 2, k.hat(0.03), 0.18)))
    M.add(t0, k.pad([midi(m) for m in (C, Eb, G, Bb)], t1 - t0 + 0.4, 600, 2200, 0.2, 0.4), 0.26)
    for i, tt in enumerate((w("L09", "over"), w("L09", "twenty"), w("L09", "million"), w("L09", "dollars"))):
        M.add(tt, k.stab([midi(m) for m in (C + 12, Eb + 12, G + 12)], 0.4), 0.35)
    # D: FBI — drone + heartbeat, then impact
    t0, t1 = s("L10"), s("L11")
    M.add(t0, k.pad([midi(31), midi(38)], t1 - t0 + 0.3, 180, 500, 0.2, 0.3), 0.4)
    grid(M, t0, t1, 72, 1, lambda b, t, i: b.add(t, k.heartbeat(), 0.5))
    M.add(w("L10", "fbi") - 0.02, k.boom(0.8), 0.8)
    # E: twist — near silence, a bell, then the hit
    M.add(s("L11"), k.bell(midi(72), 3.0, 0.9), 0.22)
    M.add(w("L11", "hospital"), k.bell(midi(67), 2.5, 0.8), 0.16)
    M.add(w("L11", "jerry") - 0.03, k.boom(1.2), 0.9)
    M.add(w("L11", "jerry") - 0.03, k.stab([midi(m) for m in (C + 12, Eb + 12, G + 12, 59)], 0.9, 2400), 0.35)
    # F: end — motif returns, tail loops to the top
    M.add(s("L12"), k.pad([midi(m) for m in (C, Eb, G)], T - s("L12"), 300, 900, 0.5, 1.0), 0.3)
    for i, m in enumerate([C + 24, Eb + 24, G + 24, Ab + 24, G + 24, Eb + 24]):
        M.add(w("L12", "ask") + i * beat / 2, k.pluck(midi(m), 0.6, 2600), 0.24)
    M.reverb(0.22, 2.4, 6000)

    # ---- SFX on words ----
    for ln in tl["lines"][1:]:                                    # a whoosh into every scene
        F.add(ln["start"] - 0.25, k.whoosh(0.4, 300, 5000), 0.35, np.sin(len(ln["id"])) * 0.4)
    F.add(w("L01", "mcdonalds") - 0.1, k.bell(midi(84), 1.6, 0.5), 0.12)
    F.add(w("L01", "million"), k.sub(), 0.5)
    F.add(w("L01", "stall"), k.wood(520), 0.4)                    # the lock clicks to OCCUPIED
    F.add(w("L02", "protect"), k.tine(midi(88), 1.2), 0.18)
    F.add(w("L03", "jerry"), k.typing(1.0, 18), 0.25)
    F.add(w("L03", "ex-cop"), k.stamp(), 0.5)
    F.add(w("L05", "supplier"), k.stamp(), 0.55)                  # box lands
    F.add(w("L05", "slipped"), k.stamp(), 0.45)
    F.add(w("L05", "mailed"), k.paper(0.4), 0.4)
    F.add(w("L05", "tamper-proof"), k.flutter(0.8), 0.3)
    F.add(w("L06", "reseal") - 0.2, k.paper(0.5), 0.45)
    F.add(w("L06", "envelopes") + 0.6, k.wood(700), 0.3)
    F.add(w("L07", "airport") - 0.2, k.whoosh(0.9, 120, 1600), 0.3)   # plane pass
    F.add(w("L07", "swap") - 0.05, k.whoosh(0.35, 800, 8000), 0.5)
    F.add(w("L08", "family"), k.wood(900), 0.3)
    F.add(w("L08", "friends"), k.wood(1000), 0.3)
    F.add(w("L08", "strangers"), k.wood(1100), 0.3)
    F.add(w("L08", "cash"), k.flutter(1.6), 0.45)
    grid(F, w("L09", "over"), w("L09", "dollars") + 0.2, 600, 1, lambda b, t, i: b.add(t, k.tick(4200, 0.004), 0.08))
    F.add(w("L10", "anonymous"), k.typing(1.4, 26), 0.25)
    F.add(w("L10", "thirty") - 0.24, k.boom(0.5), 0.5)          # bars slam
    F.add(w("L10", "thirty") - 0.2, k.stamp(), 0.6)
    F.add(w("L11", "million"), k.paper(0.5), 0.35)
    F.add(w("L11", "jerry"), k.scribble(0.5), 0.3)
    F.add(w("L12", "peel"), k.paper(0.4), 0.45)
    return finish("monopoly", tl, M, F, N)


def newcoke():
    tl, L, w = load("newcoke")
    T = tl["total"]
    N = int(T * SR)
    k = Drums(T, seed=23)
    M = Bus(N)
    F = Bus(N)
    bpm = 112
    beat = 60 / bpm
    s = lambda lid: L[lid]["start"]
    Em = [52, 55, 59]
    Cmaj = [48, 52, 55]
    G_ = [55, 59, 62]
    D_ = [50, 54, 57]
    prog_min = [Em, Cmaj, G_, D_]
    E_ = [52, 56, 59]
    A_ = [45, 49, 52]
    B_ = [47, 51, 54]
    prog_maj = [E_, B_, A_, E_]

    def groove(t0, t1, prog, drums=True, arp=True, gain=1.0, bright=1600):
        bars = int(np.ceil((t1 - t0) / (4 * beat)))
        for bi in range(bars):
            tb = t0 + bi * 4 * beat
            ch = prog[bi % 4]
            M.add(tb, k.pad([midi(m) for m in ch], min(4 * beat + 0.2, t1 - tb + 0.2), 700, bright, 0.08, 0.2), 0.2 * gain)
            for q in range(16 if arp else 0):
                tq = tb + q * beat / 4
                if tq >= t1:
                    break
                m = ch[q % 3] + (12 if q % 8 >= 4 else 0)
                M.add(tq, k.arp(midi(m + 12), 0.16), 0.13 * gain, -0.3 if q % 2 else 0.3)
            for q in range(4):
                tq = tb + q * beat
                if tq >= t1 or not drums:
                    continue
                M.add(tq, k.bass808(midi(ch[0] - 24), 0.45), 0.4 * gain)
                if q % 2 == 0:
                    M.add(tq, k.kick(0.2), 0.55 * gain)
                else:
                    M.add(tq, k.snare(0.16), 0.32 * gain)
                M.add(tq + beat / 2, k.hat(0.03), 0.14 * gain)

    # hook → "gone": groove that tape-stops on "gone"
    gone = w("L02", "gone")
    M.add(0, k.boom(1.0), 0.7)
    groove(0.0, w("L01", "loved") - 0.05, prog_min, drums=False, gain=0.9)
    groove(w("L01", "loved") - 0.05, gone, prog_min)
    M.add(gone - 0.05, k.tapestop(0.8), 0.6)
    # 1985 → launch: 80s groove
    groove(s("L03"), w("L06", "america"), prog_min, gain=1.0, bright=2200)
    # America loses it: scratch, drop to a low pad + crowd
    M.add(w("L06", "america") - 0.1, k.scratch(), 0.5)
    M.add(w("L06", "america"), k.pad([midi(40), midi(47)], s("L09") - w("L06", "america"), 200, 600, 0.3, 0.5), 0.35)
    grid(M, w("L06", "loses"), s("L09"), bpm, 1, lambda b, t, i: b.add(t, k.kick(0.16, 0.8), 0.32 if i % 2 == 0 else 0.0))
    # the question: silence + riser into "wrong?"
    M.add(s("L09"), k.riser(w("L09", "wrong") - s("L09"), 300, 5000), 0.25)
    M.add(w("L09", "wrong") - 0.02, k.boom(0.7), 0.8)
    # the reveal: sparse plucks
    for i in range(int((s("L12") - s("L10")) / (beat / 2))):
        t = s("L10") + i * beat / 2
        M.add(t, k.pluck(midi([64, 67, 71, 74][i % 4]), 0.4, 2000), 0.16)
    M.add(s("L10"), k.pad([midi(m) for m in (40, 47, 52)], s("L12") - s("L10"), 300, 1200, 0.4, 0.4), 0.28)
    # Classic: triumphant major groove, then the wry ending
    M.add(w("L12", "coca-cola") - 0.05, k.boom(0.9), 0.6)
    groove(w("L12", "coca-cola") - 0.05, s("L13"), prog_maj, gain=1.1, bright=2800)
    groove(s("L13"), T - 0.8, prog_maj, drums=False, gain=0.7, bright=1500)
    M.add(w("L13", "smart") + 0.35, k.stab([midi(m) for m in (64, 68, 71)], 0.8, 3000), 0.4)
    M.reverb(0.24, 2.0, 7000)

    # ---- SFX ----
    for ln in tl["lines"][1:]:
        F.add(ln["start"] - 0.25, k.whoosh(0.4, 300, 5000), 0.32, np.cos(len(ln["text"])) * 0.4)
    grid(F, w("L01", "two"), w("L01", "people") + 0.2, 500, 1, lambda b, t, i: b.add(t, k.tick(4200, 0.004), 0.07))
    F.add(w("L01", "loved"), k.chirp(), 0.15)
    grid(F, s("L02"), w("L02", "days") + 0.5, 300, 1, lambda b, t, i: b.add(t, k.paper(0.06), 0.18))   # calendar flips
    F.add(gone + 0.05, k.stamp(), 0.6)
    F.add(s("L03") + 0.05, k.hum(1.2, 60), 0.08)                # CRT on
    F.add(w("L04", "recipe"), k.stamp(), 0.55)
    F.add(w("L04", "sweeter"), k.tine(midi(91), 1.0), 0.16)
    F.add(w("L05", "beats") + 0.3, k.chirp(), 0.14)
    F.add(w("L05", "pepsi") + 0.3, k.chirp(), 0.14)
    for i in range(6):
        F.add(s("L06") + i * 0.15 + (0.05 if i % 2 else 0), k.shutter(), 0.3, (i % 3 - 1) * 0.6)
    F.add(w("L06", "america"), k.murmur(s("L07") - w("L06", "america") + 0.4, 0.9), 0.35)
    for i in range(4):
        F.add(s("L07") + i * 0.55, k.ring(0.5), 0.1, (i % 2) * 0.8 - 0.4)
    F.add(w("L07", "chief"), k.scribble(1.0, 9), 0.3)
    F.add(w("L08", "callers"), k.typing(1.3, 28), 0.22)
    F.add(w("L10", "sips"), k.wood(1300), 0.3)
    F.add(w("L11", "whole"), k.whoosh(0.6, 200, 2000), 0.3)
    F.add(w("L12", "classic"), k.stamp(), 0.45)
    return finish("newcoke", tl, M, F, N)


def diamonds():
    tl, L, w = load("diamonds")
    T = tl["total"]
    N = int(T * SR)
    k = Drums(T, seed=31)
    M = Bus(N)
    F = Bus(N)
    bpm = 84
    beat = 60 / bpm
    s = lambda lid: L[lid]["start"]
    Am, F_, C_, E_ = [57, 60, 64], [53, 57, 60], [55, 60, 64], [56, 59, 64]
    prog = [Am, F_, C_, E_]
    M.add(0, k.boom(1.2), 0.6)
    # elegant pulse: pad + piano tines + soft kick, intensifying through the story
    bars = int(np.ceil(T / (4 * beat)))
    for bi in range(bars):
        tb = bi * 4 * beat
        if tb >= T - 1:
            break
        ch = prog[bi % 4]
        M.add(tb, k.pad([midi(m - 12) for m in ch], 4 * beat + 0.3, 400, 1400, 0.3, 0.4), 0.22)
        for q in range(8):
            tq = tb + q * beat / 2
            m = ch[[0, 2, 1, 2, 0, 2, 1, 2][q]] + 12
            M.add(tq, k.tine(midi(m), 1.0), 0.11 if q % 2 else 0.15, -0.3 if q % 2 else 0.3)
        if tb >= s("L03") - 0.1:
            for q in (0, 2):
                M.add(tb + q * beat, k.kick(0.2, 0.9), 0.4)
            M.add(tb + beat, k.snare(0.12), 0.12)
            M.add(tb + 3 * beat, k.snare(0.12), 0.12)
    M.add(w("L04", "a", 0.0) if False else L["L04"]["words"][10]["s"] - 0.05, k.bell(midi(76), 2.5, 0.9), 0.3)  # "A diamond is forever"
    M.add(w("L07", "controlled") - 0.02, k.boom(0.7), 0.6)
    M.add(w("L10", "ninety") - 0.4, k.tapestop(0.7), 0.4)
    M.add(s("L11"), k.bell(midi(69), 3.0, 1.0), 0.25)
    M.reverb(0.28, 2.6, 7000)
    for ln in tl["lines"][1:]:
        F.add(ln["start"] - 0.25, k.whoosh(0.4, 300, 5000), 0.3, np.sin(len(ln["text"])) * 0.4)
    F.add(w("L01", "one"), k.chirp(), 0.12)
    F.add(w("L03", "1938"), k.stamp(), 0.4)
    F.add(L["L04"]["words"][10]["s"], k.typing(1.1, 18), 0.3)
    grid(F, w("L05", "eight") - 0.25, w("L05", "eight") + 0.35, 900, 1, lambda b, t, i: b.add(t, k.tine(midi(88 + i * 2), 0.5), 0.06))
    F.add(w("L06", "one"), k.paper(0.3), 0.4)
    F.add(w("L06", "two"), k.paper(0.3), 0.45)
    grid(F, w("L07", "mines"), w("L07", "year") + 0.2, 500, 1, lambda b, t, i: b.add(t, k.tick(4200, 0.004), 0.07))
    F.add(w("L07", "controlled"), k.stamp(), 0.55)
    F.add(w("L08", "half"), k.stamp(), 0.4)
    F.add(w("L09", "labs"), k.hum(2.0, 60), 0.1)
    F.add(w("L10", "shut"), k.wood(600), 0.4)
    return finish("diamonds", tl, M, F, N)


def tipping():
    tl, L, w = load("tipping")
    T = tl["total"]
    N = int(T * SR)
    k = Drums(T, seed=41)
    M = Bus(N)
    F = Bus(N)
    bpm = 108
    beat = 60 / bpm
    s = lambda lid: L[lid]["start"]
    # diner groove: Rhodes-ish stabs, walking bass, brushed swing
    chords = [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [45, 48, 52, 55]]  # Dm7 G7 Cmaj7 Am7
    walk = [[38, 41, 43, 45], [43, 47, 45, 41], [36, 40, 43, 47], [45, 43, 41, 40]]

    def groove(t0, t1, gain=1.0, oldtime=False):
        bars = int(np.ceil((t1 - t0) / (4 * beat)))
        for bi in range(bars):
            tb = t0 + bi * 4 * beat
            ch = chords[bi % 4]
            for q in range(4):
                tq = tb + q * beat
                if tq >= t1:
                    break
                M.add(tq, k.pluck(midi(walk[bi % 4][q]), 0.4, 900), 0.38 * gain)
                if oldtime:
                    M.add(tq + (0 if q % 2 == 0 else beat * 0.5), k.pluck(midi(ch[q % 4] + 12), 0.3, 3200), 0.12 * gain)
                else:
                    if q in (1, 3):
                        M.add(tq + beat * 0.66, k.stab([midi(m) for m in ch], 0.35, 2000), 0.16 * gain)
                M.add(tq, k.hat(0.02), 0.08 * gain, 0.2)
                M.add(tq + beat * 0.66, k.hat(0.02), 0.06 * gain, 0.2)
                if q % 2 == 1:
                    M.add(tq, k.snare(0.1) * 0.6, 0.12 * gain)
                else:
                    M.add(tq, k.kick(0.16, 0.8), 0.3 * gain)

    groove(0, s("L04"))
    M.add(s("L04"), k.tapestop(0.6), 0.4)                              # "So how did it get like this?" → rewind
    M.add(s("L04") + 0.1, k.riser(1.0, 3000, 300), 0.15)
    groove(s("L05") - 0.1, s("L08") + 1.2, gain=0.85, oldtime=True)    # sepia era
    groove(w("L08", "now") - 0.05, s("L09"), gain=1.0)
    M.add(s("L09"), k.pad([midi(m) for m in (50, 57, 62)], s("L10") - s("L09"), 300, 1000, 0.3, 0.4), 0.3)
    grid(M, s("L09"), s("L10"), 72, 1, lambda b, t, i: b.add(t, k.heartbeat(), 0.35))
    M.add(w("L09", "no") - 0.02, k.boom(0.7), 0.6)
    groove(s("L10") - 0.05, T - 0.5, gain=0.8)
    M.reverb(0.2, 1.8, 6000)
    for ln in tl["lines"][1:]:
        F.add(ln["start"] - 0.25, k.whoosh(0.4, 300, 5000), 0.3, np.cos(len(ln["text"])) * 0.4)
    F.add(0.35, k.typing(1.6, 30), 0.22)                                # receipt printer
    F.add(w("L01", "wage"), k.stamp(), 0.45)
    F.add(w("L02", "1991"), k.chirp(), 0.12)
    F.add(w("L03", "difference"), k.wood(800), 0.3)
    F.add(w("L05", "pullman"), k.whoosh(1.2, 120, 900), 0.3)            # train passing
    F.add(w("L06", "most"), k.tine(midi(84), 0.8), 0.15)
    for i in range(6):
        F.add(w("L07", "six") + i * 0.14, k.paper(0.2), 0.3)
    F.add(w("L08", "gone"), k.stamp(), 0.45)
    F.add(w("L08", "now"), k.blip(1400), 0.25)
    F.add(w("L09", "no"), k.stamp(), 0.55)
    return finish("tipping", tl, M, F, N)


def finish(short, tl, M, F, N):
    out = os.path.join(ROOT, "public", short)
    music, sfx = M.stereo(), F.stereo()
    music *= duck_env(tl, N)[:, None]
    for name, x in (("music", music), ("sfx", sfx)):
        x = limit(x / max(1e-9, np.abs(x).max()) * 0.9, ceil=0.8)
        sf.write(os.path.join(out, name + ".wav"), x.astype(np.float32), SR, subtype="PCM_16")
    import pyloudnorm as pyln
    vo, _ = sf.read(os.path.join(out, "narration.wav"))
    vo = np.stack([vo, vo], 1)[:N]
    if len(vo) < N:
        vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
    m, _ = sf.read(os.path.join(out, "music.wav"))
    e, _ = sf.read(os.path.join(out, "sfx.wav"))
    mg = {'monopoly': 0.42, 'newcoke': 0.52, 'diamonds': 0.5, 'tipping': 0.5}[short]
    mix = vo + mg * m[:N] + 0.6 * e[:N]
    meter = pyln.Meter(SR)
    for _ in range(3):
        mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
        mix = limit(mix)
    sf.write(os.path.join(out, "mix.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
    print(f"{short}: mix {meter.integrated_loudness(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS, {N / SR:.2f}s")


if __name__ == "__main__":
    {"monopoly": monopoly, "newcoke": newcoke, "diamonds": diamonds, "tipping": tipping}[sys.argv[1]]()
