"""Draws the two paper textures from code: the pencil sketch that draws itself (film/assets/sketch.png) and the
framed print on the wall (film/assets/art.png).   python3 tools/make_art.py

sketch.png channels: R = pencil coverage, G = the moment each stroke appears (0..1). The page material shows a stroke
once the film's progress value passes its G."""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, '..', 'film', 'assets')
random.seed(4)
PX = 20            # pixels per mm
SS = 2             # supersampling
W, H = 210 * PX * SS, 296 * PX * SS
cov = Image.new('L', (W, H), 0)
tim = Image.new('L', (W, H), 0)
dc, dt = ImageDraw.Draw(cov), ImageDraw.Draw(tim)


def P(x, y):       # mm from the page centre, y up -> pixels
    return (W / 2 + x * PX * SS, H / 2 - y * PX * SS)


def stroke(pts, t0, t1, w=0.32, dark=0.8, wobble=0.12):
    """A pencil line through pts (mm), appearing from time t0 to t1 along its length."""
    n = len(pts)
    for i in range(n - 1):
        a, b = pts[i], pts[i + 1]
        j = lambda: random.gauss(0, wobble)
        pa, pb = P(a[0] + j(), a[1] + j()), P(b[0] + j(), b[1] + j())
        t = t0 + (t1 - t0) * i / max(1, n - 2)
        d = dark * random.uniform(0.82, 1.0)
        dc.line([pa, pb], fill=int(255 * min(1, d * 1.15)), width=max(1, int(w * 1.55 * PX * SS)))
        dt.line([pa, pb], fill=max(3, int(255 * t)), width=int((w * 1.55 + 0.9) * PX * SS))


def circle(r, t0, t1, a0=0.0, turns=1.04, **kw):
    n = int(40 + r * 4)
    stroke([(r * math.cos(a0 + 2 * math.pi * turns * i / n), r * math.sin(a0 + 2 * math.pi * turns * i / n)) for i in range(n + 1)], t0, t1, **kw)


def line(a, b, t0, t1, seg=3.0, **kw):
    L = math.dist(a, b)
    n = max(2, int(L / seg))
    stroke([(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(n + 1)], t0, t1, **kw)


def text(s, x, y, size_mm, t0, t1, font='/usr/share/fonts/opentype/inter/Inter-LightItalic.otf', dark=0.72):
    f = ImageFont.truetype(font, int(size_mm * PX * SS))
    px, py = P(x, y)
    w = dc.textlength(s, font=f)
    dc.text((px, py), s, fill=int(255 * dark), font=f)
    steps = 24
    for i in range(steps):   # the text "writes" left to right
        t = t0 + (t1 - t0) * i / (steps - 1)
        dt.rectangle([px + w * i / steps - 2, py - 4, px + w * (i + 1) / steps + 2, py + size_mm * PX * SS * 1.4], fill=max(3, int(255 * t)))


# 1. construction: centre lines
line((-62, 0), (62, 0), 0.02, 0.07, w=0.2, dark=0.45)
line((0, -62), (0, 62), 0.05, 0.10, w=0.2, dark=0.45)
# 2. the lens seen from the front, at true size (the real lens rises through these circles)
for r, t0, t1, w, d in [(43.6, 0.10, 0.20, 0.42, 0.9), (40.4, 0.18, 0.26, 0.3, 0.75), (34.9, 0.24, 0.31, 0.26, 0.6), (30.8, 0.29, 0.36, 0.34, 0.8), (19.5, 0.34, 0.40, 0.26, 0.6)]:
    circle(r, t0, t1, a0=random.uniform(0, 6), w=w, dark=d)
# knurling ticks on the focus ring
for i in range(84):
    a = 2 * math.pi * i / 84
    line((41.0 * math.cos(a), 41.0 * math.sin(a)), (43.4 * math.cos(a), 43.4 * math.sin(a)), 0.40 + 0.06 * i / 84, 0.40 + 0.06 * i / 84 + 0.002, seg=1.2, w=0.2, dark=0.55, wobble=0.05)
# 3. the iris: nine blades closing to a nonagon
ri = 11.5
for k in range(9):
    a0, a1 = 2 * math.pi * k / 9, 2 * math.pi * (k + 1) / 9
    p0 = (ri * math.cos(a0), ri * math.sin(a0))
    p1 = (ri * math.cos(a1), ri * math.sin(a1))
    t = 0.46 + 0.012 * k
    line(p0, p1, t, t + 0.012, seg=1.5, w=0.3, dark=0.85)
    q = (27.0 * math.cos(a1 + 0.9), 27.0 * math.sin(a1 + 0.9))
    stroke([(p1[0] + (q[0] - p1[0]) * s + 2.2 * math.sin(math.pi * s) * math.cos(a1 + 2.2), p1[1] + (q[1] - p1[1]) * s + 2.2 * math.sin(math.pi * s) * math.sin(a1 + 2.2)) for s in [i / 10 for i in range(11)]], t + 0.01, t + 0.022, w=0.2, dark=0.5)
# 4. dimension line and notes
line((-43.6, -54), (43.6, -54), 0.60, 0.64, w=0.2, dark=0.6)
for sx in (-1, 1):
    line((sx * 43.6, -50), (sx * 43.6, -58), 0.60, 0.61, w=0.2, dark=0.6)
    line((sx * 43.6, -54), (sx * 40.6, -52.8), 0.635, 0.64, seg=1, w=0.2, dark=0.6)
    line((sx * 43.6, -54), (sx * 40.6, -55.2), 0.635, 0.64, seg=1, w=0.2, dark=0.6)
text('ø 87', -7, -57.5, 4.6, 0.64, 0.68)
# 5. cross-section, top of the page
ox, oy = 0, 92
line((-52, oy), (52, oy), 0.69, 0.72, w=0.18, dark=0.4)
for (zc, sd, r1, r2, t) in [(39.5, 30.8, 62, 260, 10.5), (26.5, 28.5, 44, -85, 7.0), (10.0, 20.5, -60, -40, 3.0), (-11.0, 19.0, -45, -70, 2.8), (-23.5, 20.5, 120, 48, 8.0), (-42.0, 18.0, 70, 90, 6.0)]:
    def sag(r, R):
        s = abs(R) - math.sqrt(max(1e-9, R * R - r * r))
        return s if R > 0 else -s
    k = 0.72  # drawing scale
    front = [((zc + t / 2 - sag(sd * i / 12, r1)) * k, sd * i / 12 * k) for i in range(-12, 13)]
    back = [((zc - t / 2 + sag(sd * i / 12, r2)) * k, sd * i / 12 * k) for i in range(12, -13, -1)]
    t0 = 0.72 + 0.03 * (39.5 - zc) / 82
    stroke([(ox - x, oy + y) for x, y in front + back + front[:1]], t0, t0 + 0.035, w=0.26, dark=0.8, wobble=0.06)
for sy in (-1, 1):   # the barrel outline
    stroke([(ox - 42, oy + sy * 30), (ox - 33, oy + sy * 30), (ox - 33, oy + sy * 32.5), (ox + 22, oy + sy * 32.5), (ox + 22, oy + sy * 29), (ox + 34, oy + sy * 29), (ox + 34, oy + sy * 24), (ox + 42, oy + sy * 24)], 0.80, 0.86, w=0.3, dark=0.7, wobble=0.06)
text("50 mm  f/1.4", -52, 139, 5.2, 0.86, 0.91)
text('6 elements · 9 blades', -52, 131.5, 3.6, 0.90, 0.95)
text('study 01', 30, -128, 3.8, 0.94, 0.985)
text('object bloom.', 30, -134, 3.8, 0.955, 1.0)

cov = cov.resize((W // SS, H // SS), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.9))
tim = tim.filter(ImageFilter.MaxFilter(9)).resize((W // SS, H // SS), Image.NEAREST)
Image.merge('RGB', (cov, tim, Image.new('L', cov.size, 0))).save(os.path.join(A, 'sketch.png'))

# ---- the framed print: the bloom mark ----
S = 3
w, h = 320 * 4 * S, 420 * 4 * S
im = Image.new('RGB', (w, h), (240, 236, 224))
d = ImageDraw.Draw(im)
cx, cy, R = w / 2, h * 0.44, w * 0.30
green, teal = (38, 72, 62), (23, 131, 120)
for k in range(8):
    a = 2 * math.pi * k / 8
    pts = []
    for i in range(61):   # a petal: a lens-shaped leaf from the centre outward
        s = i / 60
        u = math.sin(math.pi * s) * 0.36
        pts.append((cx + R * (s * math.cos(a) - u * math.sin(a) * 0.5), cy + R * (s * math.sin(a) + u * math.cos(a) * 0.5)))
    for i in range(60, -1, -1):
        s = i / 60
        u = -math.sin(math.pi * s) * 0.36
        pts.append((cx + R * (s * math.cos(a) - u * math.sin(a) * 0.5), cy + R * (s * math.sin(a) + u * math.cos(a) * 0.5)))
    d.polygon(pts, outline=green, width=5 * S)
d.ellipse([cx - R * 0.09, cy - R * 0.09, cx + R * 0.09, cy + R * 0.09], fill=teal)
f = ImageFont.truetype(os.path.join(A, 'fonts', 'Manrope-600.ttf'), 34 * S)
t = 'object bloom.'
d.text((cx - d.textlength(t, font=f) / 2, h * 0.84), t, fill=green, font=f)
im.resize((w // S, h // S), Image.LANCZOS).save(os.path.join(A, 'art.png'))
print('ok')
