"""The set: one desk by a window, and everything on it. Desk top is z = 0, the camera looks toward +y, the window
is on the left (-x). All units are metres at real scale."""
import math
import os
import random
import bpy
import bmesh
from mathutils import Vector, Matrix, Quaternion
from . import lib, lens
from .lib import box, lathe, ring_profile, principled, emission, new_obj, empty, key, key_socket, srgb

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')

PAGE_C = Vector((-0.50, -0.12, 0.0))     # sketchbook centre on the desk
PAGE_Z = 0.0124                          # top of the page
LAPTOP = Vector((0.27, 0.15, 0.0))       # laptop base centre
LID_TILT = math.radians(-14)             # screen leans back
SCREEN_W, SCREEN_H = 0.292, 0.1825       # 16:10 panel
PLATE_C = Vector((0.27, -0.215, 0.0052))  # where the city lands
PLATE_W = 0.30


def plane_uv(name, w, h, mat=None, axis='XY'):
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new('UVMap')
    co = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    vs = [bm.verts.new((x, y, 0) if axis == 'XY' else (x, 0, y)) for x, y in co]
    f = bm.faces.new(vs)
    for l, t in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        l[uv].uv = t
    if axis == 'XZ':
        bmesh.ops.reverse_faces(bm, faces=[f])  # face -y, toward the camera
    return new_obj(name, bm, mat)


def img_node(nt, path, seq=None):
    n = nt.nodes.new('ShaderNodeTexImage')
    if os.path.exists(path if not seq else path % 1):
        im = bpy.data.images.load(path if not seq else path % 1)
        if seq:
            im.source = 'SEQUENCE'
            n.image_user.frame_duration = seq[1]
            n.image_user.frame_start = seq[0]
            n.image_user.frame_offset = 0
            n.image_user.use_auto_refresh = True
        n.image = im
    n.extension = 'EXTEND'
    return n


# ---------- materials ----------
def wood(name='walnut'):
    m, nt, out = lib.mat(name)
    p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (0.7, 9.0, 9.0)
    n1 = nt.nodes.new('ShaderNodeTexNoise')
    n1.inputs['Scale'].default_value = 6.0
    n1.inputs['Detail'].default_value = 10.0
    n1.inputs['Roughness'].default_value = 0.62
    n1.inputs['Distortion'].default_value = 1.6
    wv = nt.nodes.new('ShaderNodeTexWave')
    wv.wave_type = 'RINGS'
    wv.inputs['Scale'].default_value = 1.4
    wv.inputs['Distortion'].default_value = 6.0
    wv.inputs['Detail'].default_value = 4.0
    wv.inputs['Detail Scale'].default_value = 2.0
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'FLOAT'
    mix.inputs[0].default_value = 0.55
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.28, (*srgb('#2a170d'), 1)
    e[1].position, e[1].color = 0.78, (*srgb('#7a4a28'), 1)
    mid = ramp.color_ramp.elements.new(0.52)
    mid.color = (*srgb('#4a2a16'), 1)
    L = nt.links.new
    L(tc.outputs['Object'], mp.inputs['Vector'])
    L(mp.outputs[0], n1.inputs['Vector'])
    L(mp.outputs[0], wv.inputs['Vector'])
    L(n1.outputs['Fac'], mix.inputs[2])
    L(wv.outputs['Fac'], mix.inputs[3])
    L(mix.outputs[0], ramp.inputs[0])
    L(ramp.outputs[0], p.inputs['Base Color'])
    rr = nt.nodes.new('ShaderNodeMapRange')
    rr.inputs[3].default_value, rr.inputs[4].default_value = 0.22, 0.42
    L(n1.outputs['Fac'], rr.inputs[0])
    L(rr.outputs[0], p.inputs['Roughness'])
    b = nt.nodes.new('ShaderNodeBump')
    b.inputs['Strength'].default_value = 0.06
    b.inputs['Distance'].default_value = 0.0004
    L(mix.outputs[0], b.inputs['Height'])
    L(b.outputs[0], p.inputs['Normal'])
    p.inputs['Coat Weight'].default_value = 0.25
    p.inputs['Coat Roughness'].default_value = 0.2
    L(p.outputs[0], out.inputs[0])
    return m


def sketch_paper(progress_holder):
    """Paper with a pencil drawing that draws itself: the texture's red channel is stroke coverage, green is the time
    each stroke appears. `progress_holder` receives the Value node to keyframe."""
    m, nt, out = lib.mat('sketch_page')
    p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    p.inputs['Roughness'].default_value = 0.85
    p.inputs['Specular IOR Level'].default_value = 0.2
    im = img_node(nt, os.path.join(ASSETS, 'sketch.png'))
    if im.image:
        im.image.colorspace_settings.name = 'Non-Color'
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    val = nt.nodes.new('ShaderNodeValue')
    val.outputs[0].default_value = 0.0
    lt = nt.nodes.new('ShaderNodeMath')
    lt.operation = 'LESS_THAN'
    mul = nt.nodes.new('ShaderNodeMath')
    mul.operation = 'MULTIPLY'
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.inputs[6].default_value = (*srgb('#efeadb'), 1)
    mix.inputs[7].default_value = (*srgb('#2b2f36'), 1)
    L = nt.links.new
    L(im.outputs['Color'], sep.inputs[0])
    L(sep.outputs[1], lt.inputs[0])
    L(val.outputs[0], lt.inputs[1])
    dk = nt.nodes.new('ShaderNodeMath')      # pencil pressure
    dk.operation = 'MULTIPLY'
    dk.use_clamp = True
    dk.inputs[1].default_value = 1.9
    L(sep.outputs[0], dk.inputs[0])
    L(dk.outputs[0], mul.inputs[0])
    L(lt.outputs[0], mul.inputs[1])
    L(mul.outputs[0], mix.inputs[0])
    L(mix.outputs[2], p.inputs['Base Color'])
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = 900
    b = nt.nodes.new('ShaderNodeBump')
    b.inputs['Strength'].default_value = 0.05
    b.inputs['Distance'].default_value = 0.0002
    L(tc.outputs['Object'], nz.inputs['Vector'])
    L(nz.outputs['Fac'], b.inputs['Height'])
    L(b.outputs[0], p.inputs['Normal'])
    L(p.outputs[0], out.inputs[0])
    progress_holder['sketch'] = val
    return m


def screen_mat(holder, ui_start, ui_frames):
    m, nt, out = lib.mat('screen')
    im = img_node(nt, os.path.join(ASSETS, 'ui', 'seq', 's_%04d.jpg'), seq=(0, lib.TOTAL))
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Strength'].default_value = 1.6
    if im.image:
        nt.links.new(im.outputs['Color'], e.inputs['Color'])
    else:
        e.inputs['Color'].default_value = (*lib.CREAM, 1)
    gl = nt.nodes.new('ShaderNodeBsdfGlossy')
    gl.inputs['Roughness'].default_value = 0.08
    gl.inputs['Color'].default_value = (0.04, 0.04, 0.04, 1)
    add = nt.nodes.new('ShaderNodeAddShader')
    nt.links.new(e.outputs[0], add.inputs[0])
    nt.links.new(gl.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs[0])
    holder['screen'] = e.inputs['Strength']
    return m


def building_mat(name, base, holder_list, window=(1.0, 0.72, 0.38), scale=(165, 165, 115), lit=1.0, power=6.0):
    """Architectural-model material; windows on the walls light up one building at a time as `night` rises."""
    m, nt, out = lib.mat(name)
    p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    p.inputs['Base Color'].default_value = (*base, 1)
    p.inputs['Roughness'].default_value = 0.55
    p.inputs['Coat Weight'].default_value = 0.15
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = scale
    br = nt.nodes.new('ShaderNodeTexBrick')
    br.offset = 0.0
    br.inputs['Color1'].default_value = (1, 1, 1, 1)
    br.inputs['Color2'].default_value = (0.015, 0.015, 0.015, 1)
    br.inputs['Mortar'].default_value = (0, 0, 0, 1)
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Mortar Size'].default_value = 0.17
    br.inputs['Brick Width'].default_value = 0.5
    br.inputs['Row Height'].default_value = 0.5
    br.inputs['Bias'].default_value = 0.15
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    wall = nt.nodes.new('ShaderNodeMath')
    wall.operation = 'LESS_THAN'
    wall.inputs[1].default_value = 0.5
    absz = nt.nodes.new('ShaderNodeMath')
    absz.operation = 'ABSOLUTE'
    oi = nt.nodes.new('ShaderNodeObjectInfo')
    night = nt.nodes.new('ShaderNodeValue')
    night.outputs[0].default_value = 0.0
    on = nt.nodes.new('ShaderNodeMath')
    on.operation = 'LESS_THAN'
    m1 = nt.nodes.new('ShaderNodeMath')
    m1.operation = 'MULTIPLY'
    m2 = nt.nodes.new('ShaderNodeMath')
    m2.operation = 'MULTIPLY'
    m2.inputs[1].default_value = power
    L = nt.links.new
    L(tc.outputs['Object'], mp.inputs['Vector'])
    L(mp.outputs[0], br.inputs['Vector'])
    L(geo.outputs['Normal'], sep.inputs[0])
    L(sep.outputs['Z'], absz.inputs[0])
    L(absz.outputs[0], wall.inputs[0])
    L(oi.outputs['Random'], on.inputs[0])
    frac = nt.nodes.new('ShaderNodeMath')
    frac.operation = 'MULTIPLY'
    frac.inputs[1].default_value = lit
    L(night.outputs[0], frac.inputs[0])
    L(frac.outputs[0], on.inputs[1])
    bw = nt.nodes.new('ShaderNodeRGBToBW')
    L(br.outputs['Color'], bw.inputs[0])
    L(bw.outputs[0], m1.inputs[0])
    L(wall.outputs[0], m1.inputs[1])
    m3 = nt.nodes.new('ShaderNodeMath')
    m3.operation = 'MULTIPLY'
    L(m1.outputs[0], m3.inputs[0])
    L(on.outputs[0], m3.inputs[1])
    L(m3.outputs[0], m2.inputs[0])
    p.inputs['Emission Color'].default_value = (*window, 1)
    L(m2.outputs[0], p.inputs['Emission Strength'])
    L(p.outputs[0], out.inputs[0])
    holder_list.append(night)
    return m


# ---------- set pieces ----------
def room(H):
    desk = box('desk', (2.2, 0.92, 0.045), (0.05, 0.0, -0.0225), wood(), bev=0.004)
    plaster = lib.add_bump(principled('plaster', srgb('#e6dfd0'), rough=0.9, spec=0.2), 55, 0.25, 8, 0.002)
    box('wall_back', (6, 0.1, 3.4), (0, 0.52, 0.6), plaster)
    box('floor', (6, 5, 0.1), (0, -1.5, -0.80), principled('floor', srgb('#2a2622'), rough=0.6))
    # left wall with a window: four slabs around the opening, then the mullions
    wx = -1.75
    y0, y1, z0, z1 = -1.15, 0.30, 0.18, 1.55
    box('wl_low', (0.1, 5, z0 + 0.8), (wx, -1.5, (z0 - 0.8) / 2), plaster)
    box('wl_top', (0.1, 5, 1.0), (wx, -1.5, z1 + 0.5), plaster)
    box('wl_back', (0.1, 0.52 - y1, z1 - z0), (wx, (0.52 + y1) / 2, (z0 + z1) / 2), plaster)
    box('wl_front', (0.1, 3.0, z1 - z0), (wx, y0 - 1.5, (z0 + z1) / 2), plaster)
    frame = principled('window_frame', srgb('#f2efe8'), rough=0.5)
    for i in range(1, 4):
        box(f'mull_v{i}', (0.06, 0.045 if i == 2 else 0.03, z1 - z0), (wx, y0 + (y1 - y0) * i / 4, (z0 + z1) / 2), frame)
    for i in range(1, 3):
        box(f'mull_h{i}', (0.06, y1 - y0, 0.03), (wx, (y0 + y1) / 2, z0 + (z1 - z0) * i / 3), frame)
    return desk


def sketchbook(H):
    rot = math.radians(7)
    root = empty('sketchbook')
    root.location = PAGE_C
    root.rotation_euler.z = rot
    box('pages', (0.212, 0.298, 0.011), (0, 0, 0.0056), principled('paper_edge', srgb('#e3dccb'), rough=0.9), bev=0.0006, parent=root)
    box('cover', (0.220, 0.306, 0.0016), (0, 0, 0.0002), principled('cover', lib.GREEN, rough=0.6), bev=0.0005, parent=root)
    page = plane_uv('page', 0.210, 0.296, sketch_paper(H))
    page.parent = root
    page.location.z = PAGE_Z - PAGE_C.z
    # pencil
    pr = empty('pencil', root)
    pr.location = (0.070, 0.085, PAGE_Z + 0.0036)
    pr.rotation_euler = (0, math.radians(90), math.radians(63))
    lathe('pencil_body', [(0, -0.08), (0.0037, -0.08), (0.0037, 0.062), (0.0034, 0.063)], segs=6, mat=principled('pencil_paint', (0.02, 0.2, 0.16), rough=0.3, coat=0.5), smooth=False, parent=pr, closed=False)
    lathe('pencil_wood', [(0.0034, 0.063), (0.0011, 0.078)], segs=24, mat=principled('pencil_wood', srgb('#d9b98a'), rough=0.7), parent=pr, closed=False)
    lathe('pencil_lead', [(0.0011, 0.078), (0.0002, 0.0835), (0, 0.0837)], segs=16, mat=principled('graphite', (0.03, 0.03, 0.035), rough=0.35, metal=0.6), parent=pr, closed=False)
    lathe('pencil_cap', ring_profile(0.0, 0.0039, -0.090, -0.080, 0.0005), segs=24, mat=principled('brass2', (0.83, 0.56, 0.2), rough=0.25, metal=1), parent=pr)
    return root


def laptop(H, ui_start, ui_frames):
    alu = lib.add_bump(principled('laptop_alu', (0.09, 0.095, 0.10), rough=0.38, metal=1.0), 2400, 0.03, 2, 0.00003)
    keym = principled('laptop_key', (0.012, 0.012, 0.013), rough=0.55)
    root = empty('laptop')
    root.location = LAPTOP
    W, D, T = 0.312, 0.218, 0.0125
    box('lt_base', (W, D, T), (0, 0, T / 2), alu, bev=0.004, parent=root, segs=5)
    box('lt_well', (0.286, 0.108, 0.0006), (0, 0.035, T + 0.0001), principled('lt_well', (0.02, 0.02, 0.022), rough=0.6), parent=root)
    bm = bmesh.new()
    rows, cols = 5, 14
    for r in range(rows):
        for c in range(cols):
            x = -0.286 / 2 + 0.0102 + c * 0.0204
            y = 0.035 + 0.108 / 2 - 0.0108 - r * 0.0216
            g = bmesh.ops.create_cube(bm, size=1)
            for v in g['verts']:
                v.co = Vector((x + v.co.x * 0.0176, y + v.co.y * 0.0186, T + 0.0011 + v.co.z * 0.0016))
    lib.bevel(new_obj('lt_keys', bm, keym, parent=root), 0.0006, 2)
    box('lt_pad', (0.118, 0.066, 0.0004), (0, -0.064, T + 0.0002), principled('lt_pad', (0.075, 0.08, 0.085), rough=0.3, metal=1.0), parent=root)
    lid = empty('lt_lid', root)
    lid.location = (0, D / 2 - 0.004, T + 0.002)
    lid.rotation_euler.x = LID_TILT
    LH = 0.212
    box('lt_lid_shell', (W, 0.0058, LH), (0, 0.0029, LH / 2), alu, bev=0.0026, parent=lid, segs=5)
    box('lt_bezel', (W - 0.006, 0.0006, LH - 0.006), (0, -0.0001, LH / 2), principled('lt_bezel', (0.004, 0.004, 0.005), rough=0.12, coat=1.0), parent=lid)
    scr = plane_uv('lt_screen', SCREEN_W, SCREEN_H, screen_mat(H, ui_start, ui_frames), axis='XZ')
    scr.parent = lid
    scr.location = (0, -0.0006, LH / 2 + 0.004)
    H['screen_obj'] = scr
    return root


def screen_frame():
    """World matrix of the screen panel: origin at its centre, x right, y up along the screen, z toward the viewer."""
    T, D, LH = 0.0125, 0.218, 0.212
    hinge = LAPTOP + Vector((0, D / 2 - 0.004, T + 0.002))
    R = Matrix.Rotation(LID_TILT, 4, 'X')
    local = Matrix.Translation((0, -0.0006, LH / 2 + 0.004))
    basis = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))  # panel (x, y, z) -> lid (x, z, -y)
    return Matrix.Translation(hinge) @ R @ local @ basis


def lamp(H):
    root = empty('lamp')
    root.location = (-0.80, 0.28, 0)
    brass = principled('lamp_brass', (0.83, 0.56, 0.2), rough=0.22, metal=1.0)
    enamel = principled('lamp_enamel', srgb('#ece7dc'), rough=0.35, coat=0.6)
    lathe('lamp_base', [(0, 0), (0.070, 0), (0.070, 0.006), (0.060, 0.012), (0.008, 0.016), (0.006, 0.30), (0, 0.30)], mat=brass, parent=root, closed=False, split=30)
    prof = [(0.11 * math.sin(a), 0.30 + 0.085 * math.cos(a)) for a in [math.radians(d) for d in range(0, 95, 5)]]
    lathe('lamp_shade', prof + [(r - 0.0025, z) for r, z in reversed(prof[1:])], mat=enamel, parent=root, closed=False, split=60)
    bulb_m, nt, out = lib.mat('lamp_bulb')
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = (1.0, 0.62, 0.30, 1)
    e.inputs['Strength'].default_value = 0.0
    nt.links.new(e.outputs[0], out.inputs[0])
    b = lathe('lamp_bulb', [(0.03 * math.sin(math.radians(d)), 0.325 - 0.03 * math.cos(math.radians(d))) for d in range(0, 181, 15)], segs=32, mat=bulb_m, parent=root, closed=False)
    ld = bpy.data.lights.new('lamp_light', 'POINT')
    ld.color = (1.0, 0.60, 0.28)
    ld.energy = 0.0
    ld.shadow_soft_size = 0.03
    lo = bpy.data.objects.new('lamp_light', ld)
    bpy.context.scene.collection.objects.link(lo)
    lo.parent = root
    lo.location = (0, 0, 0.30)
    H['lamp_bulb'] = e.inputs['Strength']
    H['lamp_light'] = ld
    return root


def props(H):
    cer = principled('mug', lib.GREEN, rough=0.18, coat=0.6)
    mug = lathe('mug', [(0, 0), (0.036, 0), (0.040, 0.004), (0.041, 0.088), (0.0385, 0.088), (0.037, 0.008), (0, 0.006)], mat=cer, split=50)
    mug.location = (0.80, 0.16, 0)
    cof = lathe('coffee', [(0, 0.074), (0.0372, 0.074)], mat=principled('coffee', (0.03, 0.015, 0.008), rough=0.05), closed=False, parent=mug)
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, segments=8, radius=0.005)
    # handle: a torus arc
    bm.free()
    hb = bmesh.new()
    R, r = 0.026, 0.0055
    rings = []
    for i in range(25):
        a = -math.pi / 2 + math.pi * i / 24
        c = Vector((0.041 + R * math.cos(a) * 0.9, 0, 0.046 + R * math.sin(a)))
        ring = []
        for j in range(12):
            t = 2 * math.pi * j / 12
            n = Vector((math.cos(a), 0, math.sin(a)))
            ring.append(hb.verts.new(c + n * r * math.cos(t) + Vector((0, 1, 0)) * r * math.sin(t)))
        rings.append(ring)
    for i in range(24):
        for j in range(12):
            hb.faces.new([rings[i][j], rings[i][(j + 1) % 12], rings[i + 1][(j + 1) % 12], rings[i + 1][j]])
    bmesh.ops.recalc_face_normals(hb, faces=hb.faces)
    h = new_obj('mug_handle', hb, cer, smooth=True, parent=mug)
    h.rotation_euler.z = math.radians(-40)
    # books
    cols = ['#b5482f', '#e9e2d0', '#1d3b4a']
    z = 0
    for i, (c, s) in enumerate(zip(cols, [(0.24, 0.17, 0.028), (0.22, 0.16, 0.022), (0.20, 0.145, 0.03)])):
        b = box(f'book_{i}', s, (-0.43 + 0.006 * i, 0.30, z + s[2] / 2), principled(f'book_{i}', srgb(c), rough=0.55), bev=0.0015)
        b.rotation_euler.z = math.radians([4, -3, 6][i])
        box(f'book_pg_{i}', (s[0] - 0.006, s[1] - 0.004, s[2] - 0.006), (0.004, -0.004, 0), principled(f'pg_{i}', srgb('#efe9da'), rough=0.9), parent=b)
        z += s[2]
    # a framed print on the wall
    fr = box('frame', (0.36, 0.02, 0.46), (-0.18, 0.462, 0.56), principled('oak', srgb('#b98e5a'), rough=0.5), bev=0.002)
    art = plane_uv('art', 0.32, 0.42, None, axis='XZ')
    am, nt, out = lib.mat('art')
    p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    im = img_node(nt, os.path.join(ASSETS, 'art.png'))
    if im.image:
        nt.links.new(im.outputs['Color'], p.inputs['Base Color'])
    else:
        p.inputs['Base Color'].default_value = (*lib.CREAM, 1)
    p.inputs['Roughness'].default_value = 0.8
    nt.links.new(p.outputs[0], out.inputs[0])
    art.data.materials.append(am)
    art.location = (-0.18, 0.4515, 0.56)


def city(H):
    """The card that leaves the screen and becomes a city: seven chart bars that stand up as towers, then a block of
    low buildings. Returns the plate empty (animated from the screen pose to the desk), bars and buildings."""
    random.seed(11)
    plate = empty('plate')
    plate.rotation_mode = 'QUATERNION'
    nights = []
    cardm, nt, out = lib.mat('card')
    p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    p.inputs['Roughness'].default_value = 0.6
    im = img_node(nt, os.path.join(ASSETS, 'ui', 'card.png'))
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Strength'].default_value = 1.6
    mx = nt.nodes.new('ShaderNodeMixShader')
    mx.inputs[0].default_value = 1.0
    if im.image:
        nt.links.new(im.outputs['Color'], p.inputs['Base Color'])
        nt.links.new(im.outputs['Color'], e.inputs['Color'])
    else:
        p.inputs['Base Color'].default_value = (*lib.CREAM, 1)
        e.inputs['Color'].default_value = (*lib.CREAM, 1)
    nt.links.new(p.outputs[0], mx.inputs[1])
    nt.links.new(e.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    H['card_emit'] = mx.inputs[0]
    lay = H['layout']
    cw, ch = lay['card_w'], lay['card_h']          # card size in plate units (plate width = 1)
    face = plane_uv('card_face', cw, ch, cardm)
    face.parent = plate
    face.location.z = 0.0021
    slab = box('card_slab', (cw, ch, 0.004), (0, 0, 0), principled('card_slab', srgb('#f4f4ef'), rough=0.6), bev=0.0012, parent=plate)
    # chart bars -> towers
    barm = building_mat('tower', srgb('#26483e'), nights)
    barm_hi = building_mat('tower_hi', srgb('#178378'), nights)
    bars = []
    for i, (bx, by, bw, bh) in enumerate(lay['bars']):
        piv = empty(f'bar_piv_{i}', plate)
        piv.location = (bx, by, 0.0022)
        b = box(f'bar_{i}', (bw, bh, bw), (0, 0, 0), barm_hi if i == lay['hi'] else barm, parent=piv)
        for v in b.data.vertices:          # origin at the bar's baseline, on the card
            v.co.y += bh / 2
            v.co.z += bw / 2
        lib.bevel(b, bw * 0.03, 2)
        b.scale.z = 0.05
        bars.append((piv, b, bw, bh))
    # a wider model base slides out from under the card, and low buildings rise on it around the towers
    white = building_mat('maquette', srgb('#e9e6de'), nights, lit=0.75, power=3.2)
    sand = building_mat('maquette2', srgb('#cfc7b6'), nights, lit=0.75, power=3.2)
    base = box('city_base', (cw * 1.62, ch * 1.72, 0.003), (0, -ch * 0.10, -0.0036), principled('city_base', srgb('#dedace'), rough=0.7), bev=0.0008, parent=plate)
    base.scale = (0.55, 0.55, 1)
    H['city_base'] = base
    blds = []
    cell = cw / 9.0
    by0 = lay['bars'][0][1]
    nx, ny = 14, 12
    for ix in range(nx):
        for iy in range(ny):
            x = (ix - (nx - 1) / 2) * cell
            y = -ch * 0.10 + (iy - (ny - 1) / 2) * cell
            if abs(x) > cw * 0.77 or abs(y + ch * 0.10) > ch * 0.82:
                continue
            if ix % 4 == 1 or iy % 4 == 2:
                continue  # streets
            if by0 - cell * 1.5 < y < by0 + cell * 0.9 and abs(x) < cw * 0.47:
                continue  # the tower row
            if abs(x) < cw * 0.5 and abs(y) < ch * 0.5 and y > by0 and random.random() < 0.55:
                continue  # keep some of the chart print visible behind the towers
            if random.random() < 0.10:
                continue
            front = y < by0
            hgt = cw * (random.choice([0.03, 0.04, 0.05, 0.065]) if front else random.choice([0.045, 0.06, 0.08, 0.11, 0.16]))
            w, d = cell * random.uniform(0.6, 0.86), cell * random.uniform(0.6, 0.86)
            piv = empty(f'bld_piv_{ix}_{iy}', plate)
            piv.location = (x, y, 0.0021 if (abs(x) < cw / 2 and abs(y) < ch / 2) else -0.0021)
            b = box(f'bld_{ix}_{iy}', (w, d, hgt), (0, 0, hgt / 2), random.choice([white, white, sand]), parent=piv)
            lib.bevel(b, cw * 0.003, 2)
            piv.scale = (0, 0, 0)
            blds.append((piv, x, y))
    H['night_nodes'] = nights
    return plate, bars, blds


def lights(H):
    sc = bpy.context.scene
    sd = bpy.data.lights.new('sun', 'SUN')
    sd.angle = math.radians(1.2)
    sun = bpy.data.objects.new('sun', sd)
    sc.collection.objects.link(sun)
    sun.rotation_mode = 'QUATERNION'
    w = bpy.data.worlds.new('world')
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    fd = bpy.data.lights.new('fill', 'AREA')
    fd.size = 2.2
    fill = bpy.data.objects.new('fill', fd)
    sc.collection.objects.link(fill)
    fill.location = (0.6, -2.2, 1.5)
    fill.rotation_mode = 'QUATERNION'
    fill.rotation_quaternion = lib.look_quat(fill.location, (0, 0, 0.1))
    wd = bpy.data.lights.new('window_glow', 'AREA')
    wd.shape = 'RECTANGLE'
    wd.size, wd.size_y = 1.4, 1.3
    wg = bpy.data.objects.new('window_glow', wd)
    sc.collection.objects.link(wg)
    wg.location = (-1.68, -0.42, 0.86)
    wg.rotation_mode = 'QUATERNION'
    wg.rotation_quaternion = lib.look_quat(wg.location, (0, -0.2, 0.3))
    H.update(sun=sun, sun_data=sd, bg=bg, fill=fd, window=wd)


def sun_quat(elev_deg, azim_deg):
    """Quaternion for a sun whose light travels toward +x (into the room), swung by azim toward +y."""
    el, az = math.radians(elev_deg), math.radians(azim_deg)
    d = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), -math.sin(el)))
    return d.to_track_quat('-Z', 'Y')
