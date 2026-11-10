"""Type and callouts, drawn per frame as transparent PNGs that the final assembly lays over the render.
python3.13 post/overlays.py --res 3840x2160 --anchors out/anchors.json --out out/ov
Captions name what each scene shows; the exploded view gets leader-line labels that follow the parts."""
import argparse, json, math, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('--res', default='1920x1080')
ap.add_argument('--anchors', default='out/anchors.json')
ap.add_argument('--out', default='out/ov')
ap.add_argument('--frames', default='')
a = ap.parse_args()
W, H = map(int, a.res.split('x'))
K = W / 1920
HERE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(HERE, '..', 'film', 'assets', 'fonts')
font = lambda w, s: ImageFont.truetype(os.path.join(FD, f'Manrope-{w}.ttf'), int(s * K))
mono = lambda s: ImageFont.truetype(os.path.join(FD, 'JetBrainsMono-Medium.ttf'), int(s * K))
INK, CREAM, TEAL, DARK = (35, 52, 50), (244, 244, 239), (23, 131, 120), (23, 28, 32)
ANCH = json.load(open(a.anchors))
ease = lambda t: 0 if t <= 0 else 1 if t >= 1 else 1 - (1 - t) ** 3
eio = lambda t: 0 if t <= 0 else 1 if t >= 1 else (4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2)
pr = lambda f, x, y: (f - x) / (y - x)
env = lambda f, x, y, fin=10, fout=10: min(ease(pr(f, x, x + fin)), 1 - ease(pr(f, y - fout, y)))

CAPTIONS = [(18, 132, '01', 'Product visualisation'), (236, 322, '02', 'Exploded views'), (448, 524, '03', 'Interface motion'), (636, 738, '04', 'Architecture & spaces')]
LABELS = [('mount', '11', 'Mount', 1), ('rear_glass', '08', 'Rear group', 0), ('iris', '07', 'Iris · 9 blades', 1), ('helicoid', '06', 'Brass helicoid', 0),
          ('barrel', '04', 'Barrel', 1), ('focus_ring', '03', 'Focus ring', 0), ('front_glass', '02', 'Front group', 1), ('front_ring', '01', 'Name ring', 0)]


def alpha_paste(base, layer, opacity):
    if opacity <= 0:
        return
    if opacity < 1:
        layer.putalpha(layer.getchannel('A').point(lambda v: int(v * opacity)))
    base.alpha_composite(layer)


def caption(im, f):
    for (f0, f1, num, text) in CAPTIONS:
        e = env(f, f0, f1, 12, 10)
        if e <= 0:
            continue
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(L)
        fn, ft = mono(17), font(600, 22)
        pad, h = 20 * K, 50 * K
        wn, wt = d.textlength(num, font=fn), d.textlength(text, font=ft)
        x = 84 * K - (1 - ease(pr(f, f0, f0 + 14))) * 24 * K
        y = H - 84 * K - h
        w = pad + wn + 14 * K + 2 * K + 14 * K + wt + pad
        d.rounded_rectangle([x, y, x + w, y + h], radius=h / 2, fill=(*DARK, 205))
        d.text((x + pad, y + h / 2), num, font=fn, fill=(*TEAL[:2], 160, 255), anchor='lm')
        lx = x + pad + wn + 14 * K
        d.line([(lx, y + h * .28), (lx, y + h * .72)], fill=(255, 255, 255, 70), width=max(1, int(2 * K)))
        d.text((lx + 14 * K, y + h / 2 - 1 * K), text, font=ft, fill=(*CREAM, 255), anchor='lm')
        alpha_paste(im, L, e)


def labels(im, f):
    if not (240 <= f <= 322) or str(f) not in ANCH:
        return
    A = ANCH[str(f)]
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    fc, fn = mono(15), font(600, 21)
    for i, (key, code, name, row) in enumerate(LABELS):
        t0 = 244 + i * 3
        p = ease(pr(f, t0, t0 + 14)) * (1 - ease(pr(f, 308 + i, 318 + i)))
        if p <= 0:
            continue
        x, y = A[key][3] * W, A[key][4] * H - 8 * K
        ytxt = H * (0.205 if row else 0.270)
        yl = y + (ytxt + 30 * K - y) * eio(pr(f, t0, t0 + 12))
        al = int(255 * min(1, p * 1.4))
        d.line([(x, y), (x, yl)], fill=(*INK, int(al * .75)), width=max(1, int(1.6 * K)))
        r = 4.2 * K * min(1, p * 1.5)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(*TEAL, al))
        tp = ease(pr(f, t0 + 6, t0 + 18)) * (1 - ease(pr(f, 308 + i, 318 + i)))
        if tp > 0:
            ta = int(255 * tp)
            dy = (1 - tp) * 8 * K
            d.text((x, ytxt + dy), name, font=fn, fill=(*INK, ta), anchor='mb')
            d.text((x, ytxt - 30 * K + dy), code, font=fc, fill=(*TEAL, ta), anchor='mb')
    im.alpha_composite(L)


def petal_mark(d, cx, cy, R, prog, col, width):
    for k in range(8):
        p = ease((prog * 8 - k * 0.55) / 3.6)
        if p <= 0:
            continue
        an = 2 * math.pi * k / 8 - math.pi / 2
        pts = []
        n = 48
        for i in range(int(2 * n * p) + 1):
            s = i / n if i <= n else 2 - i / n
            sign = 1 if i <= n else -1
            u = sign * math.sin(math.pi * s) * 0.18
            pts.append((cx + R * (s * math.cos(an) - u * math.sin(an)), cy + R * (s * math.sin(an) + u * math.cos(an))))
        if len(pts) > 1:
            d.line(pts, fill=col, width=width, joint='curve')


def wordmark(im, f):
    if f < 868:
        return
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    x0, cy = 150 * K, H * 0.5
    R = 46 * K
    petal_mark(d, x0 + R, cy - 4 * K, R, pr(f, 868, 904), (*CREAM, 255), max(2, int(3.2 * K)))
    cr = 5.5 * K * ease(pr(f, 896, 908))
    d.ellipse([x0 + R - cr, cy - 4 * K - cr, x0 + R + cr, cy - 4 * K + cr], fill=(*CREAM, 255))
    fw = font(700, 76)
    tp = ease(pr(f, 886, 912))
    tx = x0 + 2 * R + 34 * K
    if tp > 0:
        T = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        dt = ImageDraw.Draw(T)
        dt.text((tx + (1 - tp) * 26 * K, cy - 6 * K), 'object bloom.', font=fw, fill=(*CREAM, 255), anchor='lm')
        alpha_paste(L, T, tp)
    up = ease(pr(f, 906, 930))
    if up > 0:
        T = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        dt = ImageDraw.Draw(T)
        dt.text((tx + 4 * K, cy + 64 * K + (1 - up) * 10 * K), 'objectbloom.com', font=font(500, 25), fill=(*CREAM, 215), anchor='lm')
        alpha_paste(L, T, up)
    # soft shadow so the type holds over bright bokeh
    sh = L.getchannel('A').filter(ImageFilter.GaussianBlur(14 * K)).point(lambda v: int(v * 0.55))
    S = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    S.putalpha(sh)
    im.alpha_composite(S)
    im.alpha_composite(L)


os.makedirs(a.out, exist_ok=True)
blank = os.path.join(a.out, 'blank.png')
Image.new('RGBA', (W, H), (0, 0, 0, 0)).save(blank)
frames = range(960) if not a.frames else [int(x) for x in a.frames.split(',')]
for f in frames:
    dst = os.path.join(a.out, f'o_{f:04d}.png')
    if os.path.lexists(dst):
        os.remove(dst)
    active = any(f0 <= f <= f1 for f0, f1, *_ in CAPTIONS) or 240 <= f <= 322 or f >= 868
    if not active:
        os.symlink('blank.png', dst)
        continue
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    caption(im, f)
    labels(im, f)
    wordmark(im, f)
    im.save(dst, compress_level=1)
print('overlays', len(frames))
