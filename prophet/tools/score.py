"""Original thriller score + sound design for THE PROPHET. All synthesized here (no samples, no licensed material).
Music follows the story chapter by chapter; hits come from the composition's cue list (tools/cues.mjs).
Music ducks -9 dB and effects -5 dB under the narration.

  node tools/cues.mjs && python3 tools/score.py      -> assets/audio/music.wav, sfx.wav"""
import json, os, sys
import numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audiokit import Kit, Bus, SR  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = 96
B = 60 / BPM
# D minor, cinematic: Dm | Bb | Gm | A(sus→A)
PROG = [(38, [62, 65, 69]), (34, [62, 65, 70]), (31, [62, 67, 70]), (33, [61, 64, 69])]
MOTIF = [74, 77, 76, 72, 74]          # the prophet's five-note piano motif (D F E C D)


def fit(x, n):
    return x[:n] if len(x) >= n else np.pad(x, (0, n - len(x)))


class T(Kit):
    def piano(self, f, sec=2.2, g=1.0):
        n = self.n(sec)
        s = self.sine(f, sec) + .45 * self.sine(2 * f, sec) * self.env(n, .6) + .2 * self.sine(3 * f, sec) * self.env(n, .25) + .06 * self.sine(4.02 * f, sec) * self.env(n, .12)
        return g * s * self.env(n, 1.1) * self.adsr(n, .004, .4) + .04 * fit(self.bp(self.noise(.05), 2000, 7000) * self.env(self.n(.05), .006), n)

    def pulse(self, f, sec=.3, cut=900):
        s = self.saw(f, sec, .005)
        return self.lp(s, cut) * self.env(len(s), .12) * self.adsr(len(s), .004, .05)

    def sub(self, f0=60, f1=40, sec=.7, dec=.25):
        return super().sub(f0, f1, sec, dec)

    def tick(self, f=2600, dec=.012):
        return super().tick(f, dec)

    def clock(self, hi=True):
        n = self.n(.07)
        return (self.bp(self.noise(.07), 2500 if hi else 1600, 7000) * self.env(n, .008) + .3 * self.sine(3200 if hi else 2400, .07) * self.env(n, .01))

    def kick(self):
        n = self.n(.45)
        return .9 * self.sweep(120, 42, .45, .3) * self.env(n, .14)

    def drone(self, f, sec, bright=600):
        return self.pad([f, f * 1.5, f * 2.001], sec, 200, bright, .8, 1.0, .003)

    def heart(self):
        out = np.zeros(self.n(.9))
        for t0, g in ((0, 1), (.2, .7)):
            s = self.sub(75, 40, .25, .07) * g; i = self.n(t0); out[i:i + len(s)] += s
        return out

    def revswell(self, sec=1.5):
        x = self.bp(self.noise(sec), 300, 4000) * np.linspace(0, 1, self.n(sec)) ** 3
        return x + .3 * self.pad([midi(50), midi(57)], sec, 300, 2000, sec * .9, .05)

    # ---------- sfx ----------
    def impact(self):
        n = self.n(2.6)
        return np.tanh(2.6 * self.sweep(110, 30, 2.6, .35) * self.env(n, .55)) * .9 + .35 * self.hp(self.noise(2.6), 3000) * self.env(n, .6) + .4 * self.lp(self.noise(2.6), 1200) * self.env(n, .05)

    def hit(self):
        n = self.n(1.4)
        return .8 * self.sub(90, 38, 1.4, .3) + .4 * self.lp(self.noise(1.4), 2500) * self.env(n, .04) + .2 * self.hp(self.noise(1.4), 5000) * self.env(n, .3)

    def buzz(self):
        n = self.n(.45); t = np.arange(n) / SR
        return self.lp(np.sign(np.sin(2 * np.pi * 180 * t)) * (np.sin(2 * np.pi * 30 * t) > 0), 900) * self.adsr(n, .01, .05) * .5

    def notif(self):
        return np.concatenate([self.blip(1318, .1), self.blip(1760, .22)])

    def check(self):
        return np.concatenate([self.blip(1568, .07), self.blip(2093, .16)]) * .8

    def chime(self, notes, dec=.6):
        out = np.zeros(self.n(2.2))
        for k, m in enumerate(notes):
            b = self.bell(midi(m), 2.2, dec) * .4; i = self.n(k * .06); out[i:] += b[:len(out) - i]
        return out

    def ttype(self, sec, cps=26):
        out = np.zeros(self.n(sec + .1)); t = 0.0
        while t < sec:
            s = self.tick(1900 + self.rng.uniform(-300, 300), .006) * self.rng.uniform(.5, 1); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]
            t += 1 / cps * self.rng.uniform(.7, 1.3)
        return out

    def tickrun(self, sec):
        out = np.zeros(self.n(sec + .1)); t = 0.0
        while t < sec:
            s = self.tick(3000, .004) * .4; i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]; t += .06
        return out

    def counter(self, sec):
        out = np.zeros(self.n(sec + .1)); t = 0.0; k = 0
        while t < sec:
            s = self.tick(2600 + k * 8, .008); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]; t += .04 + .03 * t / max(sec, .1); k += 1
        return out

    def glitch(self, sec=.4):
        n = self.n(sec)
        x = np.sign(self.noise(sec)) * ((np.arange(n) // 300) % 3 == 0)
        return self.bp(x.astype(float), 400, 7000) * .5

    def cash(self):
        return self.chime([84, 88, 91], .4) * .8 + fit(self.bp(self.noise(.2), 3000, 9000) * self.env(self.n(.2), .03), self.n(2.2)) * .5

    def coin(self):
        return self.chime([96, 100], .3) * .6

    def paper(self, sec=.4):
        n = self.n(sec)
        return self.bp(self.noise(sec), 900, 5000) * self.adsr(n, .04, .2) * np.linspace(1, .2, n)

    def laugh(self):
        out = np.zeros(self.n(1.2))
        for k in range(5):
            n = self.n(.14); t = np.arange(n) / SR
            s = self.bp(self.saw(180 + k * 6, .14), 500, 2200) * np.sin(np.pi * t / .14) * .5; i = self.n(k * .2); out[i:i + n] += s
        return out

    def crack(self):
        return self.glitch(.5) + .6 * fit(self.hit(), self.n(.5))

    def heartloop(self, sec):
        out = np.zeros(self.n(sec + 1)); t = 0.0
        while t < sec:
            s = self.heart(); i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]; t += .78
        return out

    def bell_close(self):
        return self.chime([79, 83, 86, 91], .9)

    def whoosh(self, sec=.45, f0=300, f1=4500):
        return super().whoosh(sec, f0, f1)

    def rewind(self, sec):
        n = self.n(sec); t = np.arange(n) / SR
        f = 400 + 1600 * (t / sec) ** 1.5
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 * (.6 + .4 * np.sin(2 * np.pi * 18 * t)) + .4 * self.bp(self.noise(sec), 1500, 6000) * .4

    def zoomout(self, sec):
        n = self.n(sec)
        return self.swept(sec, 4000, 200, .4) * np.sin(np.linspace(0, np.pi, n)) ** .8 * .9 + .5 * self.drone(midi(38), sec, 400) * np.linspace(0, 1, n)

    def wipe(self, f=300):
        n = self.n(.7)
        return .5 * self.sweep(f * 2, f, .7, .5) * self.env(n, .25) + .4 * self.bp(self.noise(.7), 600, 3000) * self.env(n, .2)

    def ping(self, f=1000):
        return self.bell(f, 1.2, .35) * .5

    def coins(self, sec):
        out = np.zeros(self.n(sec + .5))
        for k in range(60):
            s = self.coin() * .2; i = self.n(self.rng.uniform(0, sec)); out[i:i + len(s)] += s[:len(out) - i]
        return out

    def crt(self):
        n = self.n(1.0)
        return .2 * self.sweep(2000, 7000, 1.0, .3) * self.env(n, .3) + .6 * fit(self.sub(110, 50, .4, .1), n) + .3 * self.hp(self.noise(1.0), 2500) * self.env(n, .2)

    def scroll(self, sec):
        out = np.zeros(self.n(sec + .1)); t = 0.0
        while t < sec:
            s = self.tick(2200, .005) * .4; i = self.n(t); out[i:i + len(s)] += s[:len(out) - i]; t += .035 + .1 * (t / sec) ** 2
        return out


def main():
    cj = json.load(open(os.path.join(ROOT, "assets", "audio", "cues.json")))
    total, sc, vo, cues = cj["total"], cj["scenes"], cj["vo"], cj["cues"]
    k = T(total + 3, seed=4091)
    N = k.n(total)
    mus, fx = Bus(k.N), Bus(k.N)
    S = lambda i: sc[i]["start"]
    E = lambda i: sc[i]["end"]

    # ---------- chapters → music sections ----------
    sections = [  # (start, end, mood)
        (0, S("title"), "cold"), (S("title"), E("title"), "title"),
        (S("w1"), S("w6w7"), "curious"), (S("w6w7"), S("nine"), "drive"),
        (S("nine"), S("friday"), "tense"), (S("friday"), S("who"), "climb"), (S("who"), S("w10"), "hush"),
        (S("w10"), S("maya"), "drive"), (S("maya"), S("back"), "hush"),
        (S("back"), S("w12"), "machine"), (S("w12"), S("real"), "sad"), (S("real"), S("turn"), "serious"),
        (S("turn"), E("again"), "dark"), (E("again"), total, "outro")]
    mood = lambda t: next((m for a, b, m in sections if a <= t < b), "sad")
    step = B / 4
    kicks = []
    for i in range(int(total / step) + 1):
        t = i * step
        if t >= total - .05: break
        m = mood(t); beat, sub = divmod(i, 4); bar = beat // 4
        root, chord = PROG[bar % 4]
        if m in ("cold", "curious", "drive", "tense", "climb", "machine", "serious"):
            if sub in (0, 2): mus.add(t, k.clock(sub == 0), .12 if m != "tense" else .18, .3)
        if m in ("drive", "climb", "machine", "serious") and sub == 0 and beat % 2 == 0:
            mus.add(t, k.kick(), .55); kicks.append(t)
        if m == "tense" and sub == 0 and beat % 4 == 0:
            mus.add(t, k.heart(), .5)
        # synth pulse ostinato (8ths)
        if m in ("cold", "drive", "climb", "machine", "serious", "tense") and sub % 2 == 0:
            f = midi(root + (12 if m in ("machine", "climb") and sub == 2 else 0))
            mus.add(t, k.pulse(f, .28, 700 if m != "climb" else 700 + 1500 * min(1, (t - S("friday")) / max(1, S("who") - S("friday")))), .2 if m != "cold" else .14, .0)
        if m == "machine" and sub in (1, 3):
            mus.add(t, k.pluck(midi(chord[(i // 2) % 3] + 12), .18, 5000), .07, .5 * np.sin(i))
    # pads per bar
    bar = 4 * B
    for bi in range(int(total / bar) + 1):
        t = bi * bar; m = mood(t + .1)
        if m in ("title",): continue
        root, chord = PROG[bi % 4]
        g = {"cold": .1, "curious": .09, "drive": .08, "tense": .05, "climb": .1, "hush": .12, "machine": .07, "sad": .12, "serious": .09, "dark": .0, "outro": .12}[m]
        if g: mus.add(t, k.pad([midi(c) for c in chord], min(bar + .4, total - t), 400, 1300, .4, .5), g)
    # the motif: piano, at story hinges
    def motif(t, g=.35, oct=0, rit=1.0):
        for j, m in enumerate(MOTIF):
            mus.add(t + j * .42 * rit, k.piano(midi(m + oct)), g * (.8 if j else 1), -.2 + j * .1)
    motif(.6, .3); motif(S("title") + .3, .4, -12, 1.2)
    for c in ("w1", "daniel", "maya", "w12", "lily"): motif(S(c) + .4, .22)
    motif(S("again") + .2, .3, -12, 1.4); motif(E("again") + 1.5, .3, 0, 1.3)
    # sparse piano in hushed / sad parts
    for a, b, m in sections:
        if m in ("hush", "sad", "outro"):
            t = a + 1.0
            while t < b - .5:
                root, chord = PROG[int(t / bar) % 4]
                mus.add(t, k.piano(midi(chord[int(t * 7) % 3] + 12), 2.4, .5), .16, .3 * np.sin(t))
                t += B * 2
    # drones under tension and the dark ending
    for a, b, m in sections:
        if m in ("tense", "dark", "machine"):
            mus.add(a, k.drone(midi(26 if m != "machine" else 38), b - a + 1, 500 if m == "dark" else 800), .32 if m == "dark" else .2)
    # swells into chapter cards and big reveals
    for c in ("w1", "daniel", "w6w7", "nine", "w10", "back", "w12", "turn"):
        mus.add(S(c) - 1.5, k.revswell(1.5), .3)
    mus.add(S("title") - .1, k.impact(), .6)
    # silence before "check your inbox", then the last hit
    ch = [q for q in cues if q[1] == "notif"][-1][0]
    # sidechain
    pump = np.ones(k.N)
    for t in kicks:
        i = k.n(t); L = min(k.n(.22), k.N - i)
        pump[i:i + L] = np.minimum(pump[i:i + L], 1 - .35 * np.exp(-np.arange(L) / (.06 * SR)))
    mus.L *= pump; mus.R *= pump
    a0, a1 = k.n(ch - 1.0), k.n(ch - .05)
    ramp = np.ones(k.N); ramp[a0:a1] = np.linspace(1, 0, a1 - a0); ramp[a1:k.n(E("again"))] = 0
    mus.L *= ramp; mus.R *= ramp

    # ---------- sound effects ----------
    for t, name, g, pan, ex in cues:
        ex = ex or {}; dur = ex.get("dur", .5); f = ex.get("f", 1000)
        s = {
            "buzz": k.buzz, "notif": k.notif, "type": lambda: k.ttype(dur), "up": lambda: k.chime([74, 81], .4) * .6, "down": lambda: k.chime([69, 62], .4) * .6,
            "check": k.check, "tick": lambda: k.tick(f if ex.get("f") else 2400, .01), "hit": k.hit, "impact": k.impact, "soft": lambda: k.piano(midi(86), 1.6, .5),
            "drone_hit": lambda: fit(k.sub(70, 35, 1.5, .5), k.n(2.0)) + .4 * fit(k.drone(midi(26), 2.0, 500), k.n(2.0)), "title": lambda: k.impact() * .8,
            "chapter": lambda: fit(k.whoosh(.6, 200, 3000), k.n(1.6)) * .7 + .5 * fit(k.piano(midi(50), 1.6, .8), k.n(1.6)), "paper": lambda: k.paper(.4),
            "slash": lambda: k.whoosh(.2, 2000, 9000), "glitch_soft": lambda: k.glitch(.12) * .6, "trash": lambda: fit(k.paper(.3), k.n(.5)) + .5 * fit(k.sub(150, 60, .3, .06), k.n(.5)),
            "tick_run": lambda: k.tickrun(dur), "coin": k.coin, "coin_land": lambda: fit(k.tick(3200, .02), k.n(.3)) + .4 * fit(k.coin(), k.n(.3)),
            "star": lambda: k.blip(2093, .12) * .6, "swoosh": lambda: k.whoosh(.3, 900, 6500), "click": lambda: k.tick(1500, .015), "counter": lambda: k.counter(dur),
            "cash": k.cash, "sting": lambda: k.chime([74, 77, 81, 86], 1.0), "rise": lambda: k.riser(.6, 500, 5000) * .8, "laugh": k.laugh, "crack": k.crack,
            "heartbeat_loop": lambda: k.heartloop(dur), "refresh": lambda: k.tick(2200, .02), "bell": k.bell_close, "whisper_hit": lambda: k.revswell(1.0) * .6,
            "sparkle": lambda: k.chime([93, 96, 100, 105], .3) * .6, "wire": lambda: k.tickrun(dur) + .3 * fit(k.riser(dur, 300, 3000), k.n(dur + .1)),
            "cash_out": lambda: k.chime([67, 62, 55], .8), "rewind": lambda: k.rewind(dur), "zoom_out": lambda: k.zoomout(dur), "split": lambda: k.whoosh(.5, 400, 6000),
            "wipe_out": lambda: k.wipe(ex.get("f", 300)), "ping": lambda: k.ping(f), "coins": lambda: k.coins(dur), "branch": lambda: k.blip(f, .1) * .7,
            "tv_on": lambda: fit(k.crt(), k.n(1.0)), "beep": lambda: np.concatenate([k.blip(1760, .12), np.zeros(k.n(.08)), k.blip(1760, .12)]),
            "buzz_wrong": lambda: k.buzz() * 1.2, "bounce": lambda: np.concatenate([k.blip(660, .12), k.blip(440, .25)]), "stamp": lambda: k.hit() * 1.1,
            "whoosh": lambda: k.whoosh(.45), "swell": lambda: k.revswell(max(1, dur)), "glitch": lambda: k.glitch(.5), "rewind_tick": lambda: fit(k.rewind(.25), k.n(.4)) + .6 * fit(k.tick(2000, .02), k.n(.4)),
            "crt_on": k.crt, "scroll": lambda: k.scroll(dur), "reveal_low": lambda: k.impact() * .7 + .6 * fit(k.drone(midi(26), 2.6, 400), k.n(2.6)),
            "outro": lambda: np.zeros(10),
        }[name]()
        base = {"buzz": .5, "notif": .5, "type": .3, "up": .45, "down": .45, "check": .4, "tick": .35, "hit": .75, "impact": .9, "soft": .3, "drone_hit": .7, "title": .9,
                "chapter": .55, "paper": .4, "slash": .4, "glitch_soft": .4, "trash": .5, "tick_run": .2, "coin": .45, "coin_land": .45, "star": .35, "swoosh": .35,
                "click": .5, "counter": .25, "cash": .5, "sting": .5, "rise": .35, "laugh": .35, "crack": .7, "heartbeat_loop": .6, "refresh": .35, "bell": .55,
                "whisper_hit": .5, "sparkle": .35, "wire": .35, "cash_out": .5, "rewind": .45, "zoom_out": .6, "split": .45, "wipe_out": .4, "ping": .35, "coins": .4,
                "branch": .3, "tv_on": .45, "beep": .35, "buzz_wrong": .55, "bounce": .5, "stamp": .85, "whoosh": .4, "swell": .45, "glitch": .55, "rewind_tick": .5,
                "crt_on": .5, "scroll": .25, "reveal_low": .85, "outro": 0}[name]
        fx.add(t, s, g * base, max(-1, min(1, pan)))

    mus.reverb(.22, 2.4, 6000); fx.reverb(.12, 1.4, 7000)
    vo_on = np.zeros(k.N)
    for v in vo.values():
        vo_on[k.n(v["start"]):k.n(v["start"] + v["dur"])] = 1
    sm = uniform_filter1d(vo_on, k.n(.15))
    M = mus.stereo()[:N] * (10 ** (-9 * sm / 20))[:N, None]
    F = fx.stereo()[:N] * (10 ** (-5 * sm / 20))[:N, None]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    M *= 10 ** ((-22 - meter.integrated_loudness(M)) / 20)
    F *= 10 ** ((-21 - meter.integrated_loudness(F)) / 20)
    from master import limit
    for name, x in (("music", M), ("sfx", F)):
        x = limit(x, ceil=.8)
        fl = int(SR * .01); x[-fl:] *= np.linspace(1, 0, fl)[:, None]
        sf.write(os.path.join(ROOT, "assets", "audio", name + ".wav"), x.astype(np.float32), SR, subtype="PCM_16")
        print(name, f"{meter.integrated_loudness(x):.1f} LUFS  peak {20 * np.log10(np.abs(x).max()):.1f} dBFS")


if __name__ == "__main__":
    main()
