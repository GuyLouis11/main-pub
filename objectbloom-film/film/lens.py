"""The hero object: a 50 mm prime lens built from code. Axis = local Z, front element at +Z.

Eleven assemblies that slide apart along the axis (the exploded view), six glass elements, and a nine-blade iris
whose blades swing on their pivots (the "bloom")."""
import math
import bmesh
from mathutils import Vector
from . import lib
from .lib import lathe, ring_profile, lens_profile, knurled, new_obj, empty, principled, glass

N_BLADES = 9
BLADE_OPEN, BLADE_CLOSED = 0.0, math.radians(31)

# (name, label, z-extent) front to back; the exploded layout is computed from these
ORDER = ['front_ring', 'front_glass', 'focus_ring', 'barrel', 'mid_glass', 'helicoid', 'iris', 'rear_glass', 'rear_ring', 'back_glass', 'mount']
LABELS = {
    'front_ring': ('01', 'Name ring'),
    'front_glass': ('02', 'Front group'),
    'focus_ring': ('03', 'Focus ring'),
    'barrel': ('04', 'Barrel'),
    'helicoid': ('06', 'Brass helicoid'),
    'iris': ('07', 'Iris, 9 blades'),
    'rear_glass': ('08', 'Rear group'),
    'mount': ('11', 'Mount'),
}


RADII = {'front_ring': 0.0404, 'front_glass': 0.0346, 'focus_ring': 0.0436, 'barrel': 0.0401, 'helicoid': 0.0373, 'iris': 0.0343, 'rear_glass': 0.0340, 'mount': 0.0375}


def materials():
    M = {}
    M['anod'] = lib.add_bump(principled('lens_anodized', (0.012, 0.012, 0.014), rough=0.34, metal=1.0), 2600, 0.035, 2, 0.00003)
    M['satin'] = principled('lens_satin_black', (0.02, 0.02, 0.022), rough=0.5, metal=0.85)
    M['rubber'] = lib.add_bump(principled('lens_rubber', (0.012, 0.012, 0.012), rough=0.78, spec=0.3), 1800, 0.12, 3, 0.00004)
    M['brass'] = lib.add_bump(principled('lens_brass', (0.83, 0.56, 0.2), rough=0.24, metal=1.0), 900, 0.05, 2, 0.00003)
    M['chrome'] = principled('lens_chrome', (0.86, 0.87, 0.88), rough=0.12, metal=1.0)
    M['blade'] = principled('lens_blade', (0.05, 0.055, 0.07), rough=0.36, metal=1.0)
    M['white'] = principled('lens_paint_white', (0.85, 0.85, 0.8), rough=0.5)
    M['teal'] = principled('lens_paint_teal', (0.02, 0.5, 0.42), rough=0.35, emission=(0.02, 0.5, 0.42), estr=0.15)
    M['glass'] = glass('lens_glass', coat=(0.5, 0.3, 0.95))
    M['glass2'] = glass('lens_glass_green', coat=(0.25, 0.85, 0.55), ior=1.7)
    M['inner'] = principled('lens_inner_black', (0.004, 0.004, 0.004), rough=0.9, spec=0.1)
    return M


def threaded(r0, r1, z0, z1, pitch=0.0011, depth=0.0005):
    """Ring section whose outer wall is cut with fine grooves (helicoid / filter thread look)."""
    pts = [(r0, z0), (r1 - depth, z0)]
    z = z0 + pitch / 2
    while z < z1 - pitch / 2:
        pts += [(r1, z), (r1 - depth, z + pitch / 2)]
        z += pitch
    pts += [(r1 - depth, z1), (r0, z1)]
    return pts


def blade_mesh(name, mat, r_in=0.0195, r_out=0.0305, r_piv=0.027, span=math.radians(118), thick=0.00009, n=26):
    """An iris blade in its open position, in coordinates relative to its pivot at (r_piv, 0)."""
    bm = bmesh.new()
    top, bot = [], []
    pts = []
    for i in range(n + 1):
        a = -math.radians(10) + (span + math.radians(10)) * i / n
        taper = 1.0 - 0.55 * (i / n) ** 2.2  # the tip narrows
        ro = r_in + (r_out - r_in) * taper
        pts.append((ro * math.cos(a) - r_piv, ro * math.sin(a)))
    for i in range(n, -1, -1):
        a = -math.radians(10) + (span + math.radians(10)) * i / n
        pts.append((r_in * math.cos(a) - r_piv, r_in * math.sin(a)))
    for x, y in pts:
        top.append(bm.verts.new((x, y, thick / 2)))
        bot.append(bm.verts.new((x, y, -thick / 2)))
    bm.faces.new(top)
    bm.faces.new(list(reversed(bot)))
    m = len(pts)
    for i in range(m):
        j = (i + 1) % m
        bm.faces.new([top[i], bot[i], bot[j], top[j]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return new_obj(name, bm, mat)


def build(M=None):
    M = M or materials()
    root = empty('lens')
    G = {k: empty('lens_' + k, root) for k in ORDER}
    ext = {}

    def add(group, ob, z0, z1):
        ob.parent = G[group]
        a, b = ext.get(group, (1e9, -1e9))
        ext[group] = (min(a, z0), max(b, z1))
        return ob

    def element(group, name, sd, r1, r2, t, zc, mat):
        ob = lathe(name, lens_profile(sd, r1, r2, t), segs=128, mat=mat, split=75)
        ob.location.z = zc
        return add(group, ob, zc - t, zc + t)

    # --- front ring (filter thread inside, name ring face) ---
    add('front_ring', lathe('front_ring', [(0.0349, 0.0462), (0.0400, 0.0462), (0.0404, 0.0466), (0.0404, 0.0576), (0.0400, 0.0580), (0.0362, 0.0580)] +
                            [(0.0362 - (0.0004 if i % 2 else 0), 0.0575 - i * 0.0006) for i in range(12)] + [(0.0349, 0.0500)], mat=M['anod']), 0.0462, 0.058)
    add('front_ring', lathe('name_ring', ring_profile(0.0312, 0.0350, 0.0462, 0.0492, 0.0003), mat=M['satin']), 0.0462, 0.0492)

    # engraved lettering around the name ring
    import bpy, os
    fp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'fonts', 'JetBrainsMono-Medium.ttf')
    font = bpy.data.fonts.load(fp) if os.path.exists(fp) else None
    txt = 'OBJECT BLOOM   1:1.4/50   No 000001   '
    step = 2 * math.pi / len(txt)
    for i, ch in enumerate(txt):
        if ch == ' ':
            continue
        cu = bpy.data.curves.new(f'eng_{i}', 'FONT')
        cu.body, cu.size, cu.align_x, cu.align_y, cu.extrude = ch, 0.0026, 'CENTER', 'CENTER', 0.00002
        if font:
            cu.font = font
        ob = bpy.data.objects.new(f'eng_{i}', cu)
        bpy.context.scene.collection.objects.link(ob)
        ob.data.materials.append(M['white'])
        a = math.pi / 2 - i * step
        ob.location = (0.0331 * math.cos(a), 0.0331 * math.sin(a), 0.04925)
        ob.rotation_euler.z = a - math.pi / 2
        ob.parent = G['front_ring']

    # --- front glass group ---
    element('front_glass', 'E1', 0.0308, 0.062, 0.26, 0.0105, 0.0395, M['glass'])
    element('front_glass', 'E2', 0.0285, 0.044, -0.085, 0.0070, 0.0265, M['glass2'])
    add('front_glass', lathe('front_cell', [(0.0309, 0.0200), (0.0346, 0.0200), (0.0346, 0.0460), (0.0309, 0.0460), (0.0309, 0.0440), (0.0296, 0.0425), (0.0296, 0.0330), (0.0309, 0.0318)], mat=M['inner']), 0.020, 0.046)

    # --- focus ring (rubber) ---
    add('focus_ring', knurled('focus_ring', 0.0402, 0.0436, 0.0110, 0.0400, teeth=84, depth=0.0010, mat=M['rubber']), 0.011, 0.040)

    # --- main barrel with scale ticks and the accent ring ---
    add('barrel', lathe('barrel', ring_profile(0.0374, 0.0401, -0.0300, 0.0460, 0.0005), mat=M['anod']), -0.030, 0.046)
    add('barrel', lathe('accent', ring_profile(0.0400, 0.04035, -0.0262, -0.0248, 0.0001), mat=M['teal']), -0.0262, -0.0248)
    bm = bmesh.new()
    for i in range(48):
        a = 2 * math.pi * i / 48
        h = 0.0050 if i % 4 == 0 else 0.0028
        mtx = bmesh.ops.create_cube(bm, size=1)
        for v in mtx['verts']:
            x, y, z = v.co.x * 0.0003, v.co.y * 0.00045, v.co.z * h
            r = 0.0401 + x
            v.co = Vector((r * math.cos(a) - y * math.sin(a), r * math.sin(a) + y * math.cos(a), 0.0045 - h / 2 + z))
    add('barrel', new_obj('ticks', bm, M['white']), 0.0, 0.01)

    # --- middle negative element in its own cell ---
    element('mid_glass', 'E3', 0.0205, -0.060, -0.040, 0.0030, 0.0100, M['glass'])
    add('mid_glass', lathe('mid_cell', ring_profile(0.0206, 0.0340, 0.0070, 0.0135, 0.0004), mat=M['inner']), 0.007, 0.0135)

    # --- brass helicoid ---
    add('helicoid', lathe('helicoid', threaded(0.0346, 0.0373, -0.0220, 0.0190), mat=M['brass'], split=20), -0.022, 0.019)

    # --- iris ---
    add('iris', lathe('iris_ring', ring_profile(0.0306, 0.0343, -0.0040, 0.0040, 0.0004), mat=M['satin']), -0.004, 0.004)
    blades = []
    for k in range(N_BLADES):
        a = 2 * math.pi * k / N_BLADES
        piv = empty(f'blade_pivot_{k}', G['iris'])
        piv.location = (0.027 * math.cos(a), 0.027 * math.sin(a), (k - N_BLADES / 2) * 0.00016)
        piv.rotation_euler.z = a
        b = blade_mesh(f'blade_{k}', M['blade'])
        b.parent = piv
        b.rotation_euler = (math.radians(1.2), 0, BLADE_OPEN)
        blades.append(b)
        pin = lathe(f'blade_pin_{k}', ring_profile(0.0, 0.0007, -0.0006, 0.0006, 0.0001), segs=12, mat=M['brass'])
        pin.parent = piv

    # --- rear group ---
    element('rear_glass', 'E4', 0.0190, -0.045, -0.070, 0.0028, -0.0110, M['glass2'])
    element('rear_glass', 'E5', 0.0205, 0.120, 0.048, 0.0080, -0.0235, M['glass'])
    add('rear_glass', lathe('rear_cell', [(0.0206, -0.0330), (0.0340, -0.0330), (0.0340, -0.0072), (0.0191, -0.0072), (0.0191, -0.0150), (0.0206, -0.0165)], mat=M['inner']), -0.033, -0.0072)

    # --- rear (aperture) ring: knurled metal ---
    add('rear_ring', knurled('rear_ring', 0.0344, 0.0412, -0.0460, -0.0310, teeth=48, depth=0.0008, mat=M['anod']), -0.046, -0.031)

    # --- last element ---
    element('back_glass', 'E6', 0.0180, 0.070, 0.090, 0.0060, -0.0420, M['glass'])
    add('back_glass', lathe('back_cell', ring_profile(0.0181, 0.0300, -0.0460, -0.0385, 0.0004), mat=M['inner']), -0.046, -0.0385)

    # --- chrome mount with three bayonet lugs ---
    add('mount', lathe('mount', [(0.0287, -0.0580), (0.0320, -0.0580), (0.0320, -0.0500), (0.0375, -0.0500), (0.0375, -0.0465), (0.0287, -0.0465)], mat=M['chrome'], split=30), -0.058, -0.0465)
    add('mount', lathe('baffle', [(0.0288, -0.0465), (0.0288, -0.0560)] + [(0.0288 - 0.0013 * (i // 2 + 1) + (0.0009 if i % 2 else 0), -0.0560 + 0.0006 * (i % 2)) for i in range(14)] + [(0.0190, -0.0540), (0.0190, -0.0465)], mat=M['inner'], split=20), -0.056, -0.0465)
    for k in range(8):   # gold contact pins
        a = math.radians(205 + k * 6.5)
        pin = lathe(f'contact_{k}', ring_profile(0.0, 0.0008, -0.0566, -0.0556, 0.0001), segs=10, mat=M['brass'])
        pin.location = (0.0262 * math.cos(a), 0.0262 * math.sin(a), 0)
        add('mount', pin, -0.0566, -0.0556)
    bm = bmesh.new()
    for k in range(3):
        a0 = 2 * math.pi * k / 3
        vs = []
        for zz in (-0.0595, -0.0580):
            for rr in (0.0318, 0.0352):
                for da in (0.0, 0.55):
                    vs.append(bm.verts.new((rr * math.cos(a0 + da), rr * math.sin(a0 + da), zz)))
        bmesh.ops.convex_hull(bm, input=vs)
    add('mount', lib.bevel(new_obj('lugs', bm, M['chrome']), 0.0002, 2), -0.0595, -0.058)

    # exploded layout: lay the assemblies out front to back with a constant air gap
    gap = 0.021
    lengths = [ext[k][1] - ext[k][0] for k in ORDER]
    total = sum(lengths) + gap * (len(ORDER) - 1)
    z = total / 2
    explode = {}
    for k, L in zip(ORDER, lengths):
        centre = z - L / 2
        explode[k] = centre - (ext[k][0] + ext[k][1]) / 2
        z -= L + gap
    return {'root': root, 'groups': G, 'blades': blades, 'explode': explode, 'ext': ext, 'M': M, 'exploded_length': total}


def iris_angle(open01):
    """Blade rotation for an aperture opening of 0 (closed down) .. 1 (wide open)."""
    return BLADE_CLOSED + (BLADE_OPEN - BLADE_CLOSED) * open01
