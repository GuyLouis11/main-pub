"""Shared synthesis kit for the chapter scores (same instrument family as the opening's make_audio.py).
Everything is generated from code: no samples, no licensed material."""
import numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi, fftconvolve

SR = 48000


class Kit:
    def __init__(self, dur, seed=1):
        self.N = int(round(dur * SR))
        self.rng = np.random.default_rng(seed)

    # ---------- utils ----------
    def n(self, sec):
        return int(round(sec * SR))

    def env(self, n, tau):
        return np.exp(-np.arange(n) / (tau * SR))

    def noise(self, sec):
        return self.rng.standard_normal(self.n(sec))

    def sine(self, f, sec, ph=0.0):
        t = np.arange(self.n(sec)) / SR
        return np.sin(2 * np.pi * f * t + ph)

    def sweep(self, f0, f1, sec, curve=1.0):
        k = np.linspace(0, 1, self.n(sec)) ** curve
        return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * k) / SR)

    def adsr(self, n, a=0.005, r=0.05):
        e = np.ones(n)
        na, nr = min(n, self.n(a)), min(n, self.n(r))
        if na:
            e[:na] = np.linspace(0, 1, na)
        if nr:
            e[-nr:] *= np.linspace(1, 0, nr)
        return e

    def lp(self, x, f):
        return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)

    def hp(self, x, f):
        return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)

    def bp(self, x, lo, hi):
        return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)

    def saw(self, f, sec, det=0.0):
        t = np.arange(self.n(sec)) / SR
        return sum(2 * ((t * f * (1 + d)) % 1.0) - 1 for d in (-det, 0, det)) / 3

    # ---------- instruments ----------
    def tick(self, f=2600, dec=0.012):
        n = self.n(0.06)
        return self.sine(f, 0.06) * self.env(n, dec) + 0.3 * self.hp(self.noise(0.06), 3000) * self.env(n, 0.004)

    def wood(self, f=880):
        n = self.n(0.15)
        return (self.sine(f, 0.15) + 0.5 * self.sine(f * 1.71, 0.15)) * self.env(n, 0.03)

    def sub(self, f0=72, f1=42, sec=0.45, dec=0.16):
        n = self.n(sec)
        return self.sweep(f0, f1, sec, 0.5) * self.env(n, dec) * self.adsr(n, 0.002, 0.05)

    def pluck(self, f, sec=0.5, bright=2600):
        s = self.saw(f, sec, 0.004)
        return self.lp(s, bright) * self.env(len(s), 0.11) * self.adsr(len(s), 0.003, 0.05)

    def tine(self, f, sec=1.6):
        n = self.n(sec)
        s = self.sine(f, sec) * self.env(n, 0.55) + 0.25 * self.sine(f * 5.9, sec) * self.env(n, 0.06)
        s += 0.08 * self.sine(f * 2.01, sec) * self.env(n, 0.3) + 0.15 * self.bp(self.noise(sec), 1500, 5000) * self.env(n, 0.003)
        return s * self.adsr(n, 0.002, 0.2)

    def bell(self, f, sec=3.0, dec=1.0):
        n = self.n(sec)
        parts = [(1, 1, 1), (2.32, .5, .7), (4.25, .3, .45), (6.63, .18, .3), (.5, .25, 1.4)]
        return sum(a * self.sine(f * m, sec, self.rng.uniform(0, 6)) * self.env(n, dec * d) for m, a, d in parts) * self.adsr(n, 0.004, 0.3)

    def pad(self, freqs, sec, c0=400, c1=1600, attack=1.0, release=0.8, det=0.006):
        s = sum(self.saw(f, sec, det) for f in freqs) / len(freqs)
        out, zi, blk = np.zeros(len(s)), None, 2048
        for i in range(0, len(s), blk):
            fc = c0 + (c1 - c0) * i / max(1, len(s) - 1)
            sos = butter(2, fc, "low", fs=SR, output="sos")
            if zi is None:
                zi = sosfilt_zi(sos) * 0
            y, zi = sosfilt(sos, s[i:i + blk], zi=zi)
            out[i:i + blk] = y
        return out * self.adsr(len(s), attack, release)

    def swept(self, sec, f0, f1, q=0.5):
        x, out, zi, blk = self.noise(sec), np.zeros(self.n(sec)), None, 1024
        for i in range(0, len(x), blk):
            fc = f0 * (f1 / f0) ** (i / max(1, len(x) - 1))
            sos = butter(2, [fc * (1 - q), min(fc * (1 + q), SR / 2 - 100)], "band", fs=SR, output="sos")
            if zi is None:
                zi = sosfilt_zi(sos) * 0
            y, zi = sosfilt(sos, x[i:i + blk], zi=zi)
            out[i:i + blk] = y
        return out

    def whoosh(self, sec, f0=300, f1=4000):
        s = self.swept(sec, f0, f1, 0.6)
        return s * np.sin(np.linspace(0, np.pi, len(s))) ** 1.5

    def riser(self, sec, f0=400, f1=7000):
        return self.swept(sec, f0, f1) * np.linspace(0, 1, self.n(sec)) ** 2

    def crackle(self, sec, r0, r1):
        n, out, t = self.n(sec), np.zeros(self.n(sec)), 0.0
        while True:
            t += self.rng.exponential(1 / (r0 + (r1 - r0) * t / sec))
            i = int(t * SR)
            if i >= n - 2000:
                break
            L = int(self.rng.uniform(0.004, 0.03) * SR)
            g = self.rng.uniform(0.2, 1.0)
            out[i:i + L] += g * np.sin(2 * np.pi * self.rng.uniform(2500, 9000) * np.arange(L) / SR) * self.env(L, 0.004)
        return self.hp(out, 1800)

    def boom(self, dec=0.9):
        n = self.n(3.0)
        s = np.tanh(2.2 * self.sweep(90, 34, 3.0, 0.35) * self.env(n, dec)) * 0.8
        return s + 0.5 * self.lp(self.noise(3.0), 900) * self.env(n, 0.08)

    def scribble(self, sec, rate=11):
        n = self.n(sec)
        tt = np.arange(n) / SR
        am = np.clip(np.sin(2 * np.pi * rate * tt + self.rng.uniform(0, 6)) + .4 * np.sin(2 * np.pi * rate * 1.7 * tt), 0, None)
        return self.bp(self.noise(sec), 2500, 7000) * am * self.adsr(n, 0.02, 0.05)

    def paper(self, sec=0.35):
        n = self.n(sec)
        return self.bp(self.noise(sec), 900, 5000) * self.adsr(n, 0.04, 0.2) * np.linspace(1, .2, n)

    def blip(self, f=1200, sec=0.12):
        n = self.n(sec)
        return self.sine(f, sec) * self.env(n, 0.03) * self.adsr(n, 0.002, 0.02)

    def chirp(self):
        s = self.sweep(3200, 4600, 0.07, 1.0) * self.env(self.n(0.07), 0.02)
        return np.concatenate([s, np.zeros(self.n(0.05)), s * .8])

    def hum(self, sec, f=50):
        t = np.arange(self.n(sec)) / SR
        h = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * 2 * f * t) + .25 * np.sin(2 * np.pi * 3 * f * t)
        return (h * (1 + .1 * np.sin(2 * np.pi * .7 * t)) + .25 * self.lp(self.noise(sec), 400)) * self.adsr(len(t), .4, .5)

    def wind(self, sec):
        x = self.lp(self.noise(sec), 700)
        t = np.arange(len(x)) / SR
        return x * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t)) * self.adsr(len(x), 1.0, 1.0)


class Bus:
    def __init__(self, N):
        self.N = N
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= self.N or i < 0 and i + len(sig) <= 0:
            return
        if i < 0:
            sig, i = sig[-i:], 0
        sig = sig[: self.N - i] * gain
        gl, gr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        self.L[i:i + len(sig)] += sig * gl
        self.R[i:i + len(sig)] += sig * gr

    def reverb(self, wet=0.25, sec=2.2, tone=5000, seed=7):
        r = np.random.default_rng(seed)
        n = int(sec * SR)
        e = np.exp(-np.arange(n) / (sec / 6.5 * SR))
        from scipy.signal import butter as _b, sosfilt as _s
        sos = _b(2, tone, "low", fs=SR, output="sos")
        iL, iR = _s(sos, r.standard_normal(n)) * e, _s(sos, r.standard_normal(n)) * e
        iL[:200] = iR[:200] = 0
        iL, iR = iL / np.abs(iL).sum() * 40, iR / np.abs(iR).sum() * 40
        self.L = self.L + wet * fftconvolve(self.L, iL)[: self.N]
        self.R = self.R + wet * fftconvolve(self.R, iR)[: self.N]
        return self

    def stereo(self):
        return np.stack([self.L, self.R], 1)
