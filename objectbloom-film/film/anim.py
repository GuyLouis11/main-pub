"""The film: builds the whole scene and keyframes 40 seconds of it. Five shots, cuts at CUTS.

A 0-144    dawn: the sketch draws itself, the lens rises out of the page
B 144-336  morning: the lens floats, comes apart, goes back together
C 336-432  midday: through the lens toward the laptop;  432-528 the dashboard
D 528-744  dusk: the chart card leaves the screen, its bars stand up as towers, a city rises, night falls
E 744-960  night: the iris opens like a flower
"""
import json
import math
import os
import bpy
from mathutils import Vector, Matrix, Quaternion
from . import lib, lens, scene
from .lib import key, key_socket, key_cam, set_interp, fcurves_of

CUTS = [432, 744]
UI_START, UI_FRAMES = 420, 330
DEFAULT_LAYOUT = {'card_w': 0.150, 'card_h': 0.090, 'card_cx': 0.050, 'card_cy': -0.020, 'hi': 5,
                  'bars': [[-0.054 + i * 0.018, -0.030, 0.010, h] for i, h in enumerate([0.018, 0.026, 0.022, 0.034, 0.030, 0.048, 0.040])]}


def hold_cuts(ad):
    """Make the key just before each cut hold its value, so nothing interpolates (or motion-blurs) across a cut."""
    for fc in fcurves_of(ad):
        for kp in fc.keyframe_points:
            f = int(round(kp.co.x))
            if f + 1 in CUTS:
                kp.interpolation = 'CONSTANT'
            if f + 1 in CUTS or f in CUTS:      # straight handles: the curve must not bend toward the other side of the cut
                kp.handle_left_type = kp.handle_right_type = 'VECTOR'
        fc.update()


def key_pose(ob, keys):
    """keys: [(frame, location, quaternion)]"""
    ob.rotation_mode = 'QUATERNION'
    prev = None
    for f, loc, q in keys:
        q = Quaternion(q)
        if prev is not None and q.dot(prev) < 0:
            q = -q
        prev = q
        ob.location, ob.rotation_quaternion = loc, q
        ob.keyframe_insert('location', frame=f)
        ob.keyframe_insert('rotation_quaternion', frame=f)
    set_interp(ob.animation_data)
    hold_cuts(ob.animation_data)


def clip_below(mat, z):
    """Make a material invisible below world height z (the lens rising through the page)."""
    nt = mat.node_tree
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    src = out.inputs[0].links[0].from_socket
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    gt = nt.nodes.new('ShaderNodeMath')
    gt.operation = 'GREATER_THAN'
    gt.inputs[1].default_value = z
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    mx = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(geo.outputs['Position'], sep.inputs[0])
    nt.links.new(sep.outputs['Z'], gt.inputs[0])
    nt.links.new(gt.outputs[0], mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(src, mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 0, lib.TOTAL - 1
    sc.render.fps = lib.FPS
    H = {}
    lp = os.path.join(scene.ASSETS, 'ui', 'layout.json')
    H['layout'] = json.load(open(lp)) if os.path.exists(lp) else DEFAULT_LAYOUT
    lay = H['layout']

    scene.room(H)
    scene.sketchbook(H)
    scene.laptop(H, UI_START, UI_FRAMES)
    scene.lamp(H)
    scene.props(H)
    scene.lights(H)
    plate, bars, blds = scene.city(H)
    L = lens.build()
    for m in L['M'].values():
        clip_below(m, scene.PAGE_Z + 0.0002)
    H['lens'] = L
    S = scene.screen_frame()                        # screen panel frame in the world
    screen_c = S.translation.copy()
    screen_n = (S.to_3x3() @ Vector((0, 0, 1))).normalized()

    # ---------------- light through the day ----------------
    sun, sd, bg = H['sun'], H['sun_data'], H['bg']
    day = [  # frame, elevation, azimuth, sun strength, sun colour, sky colour, sky strength, fill W, window W
        (0,   8.0, 24, 5.0, (1.0, 0.70, 0.45), (0.80, 0.62, 0.52), 0.16, 8, 22),
        (150, 17.0, 30, 5.5, (1.0, 0.86, 0.70), (0.72, 0.78, 0.90), 0.26, 14, 40),
        (336, 25.0, 27, 5.5, (1.0, 0.95, 0.88), (0.70, 0.80, 0.95), 0.34, 18, 55),
        (528, 15.0, 32, 5.0, (1.0, 0.72, 0.44), (0.85, 0.66, 0.55), 0.24, 12, 40),
        (640, 6.0, 38, 3.8, (1.0, 0.42, 0.18), (0.55, 0.34, 0.45), 0.14, 7, 24),
        (715, 1.5, 40, 0.0, (1.0, 0.30, 0.12), (0.06, 0.09, 0.20), 0.07, 3, 12),
        (760, 1.5, 40, 0.0, (1.0, 0.30, 0.12), (0.03, 0.05, 0.13), 0.05, 2, 9),
        (959, 1.5, 40, 0.0, (1.0, 0.30, 0.12), (0.03, 0.05, 0.13), 0.05, 2, 9),
    ]
    prev = None
    for f, el, az, e, col, sky, ss, fw, ww in day:
        q = scene.sun_quat(el, az)
        if prev is not None and q.dot(prev) < 0:
            q = -q
        prev = q
        sun.rotation_quaternion = q
        sun.keyframe_insert('rotation_quaternion', frame=f)
        sd.energy, sd.color = e, col
        sd.keyframe_insert('energy', frame=f)
        sd.keyframe_insert('color', frame=f)
        bg.inputs[0].default_value = (*sky, 1)
        bg.inputs[0].keyframe_insert('default_value', frame=f)
        bg.inputs[1].default_value = ss
        bg.inputs[1].keyframe_insert('default_value', frame=f)
        H['fill'].energy = fw
        H['fill'].keyframe_insert('energy', frame=f)
        H['fill'].color = sky
        H['fill'].keyframe_insert('color', frame=f)
        H['window'].energy = ww
        H['window'].keyframe_insert('energy', frame=f)
        H['window'].color = sky
        H['window'].keyframe_insert('color', frame=f)
    for ad in (sun.animation_data, sd.animation_data, sc.world.node_tree.animation_data, H['fill'].animation_data, H['window'].animation_data):
        set_interp(ad)
    key(H['lamp_light'], 'energy', [(0, 0), (648, 0), (700, 5.5), (959, 5.5)])
    key_socket(H['lamp_bulb'], [(0, 0), (648, 0), (700, 30), (959, 30)])
    key_socket(H['screen'], [(0, 1.5), (640, 1.5), (743, 0.8), (959, 0.5)])
    for n in H['night_nodes']:
        key_socket(n.outputs[0], [(0, 0), (668, 0), (738, 1.02), (959, 1.02)])

    # ---------------- A: the sketch, and the lens rising out of it ----------------
    key_socket(H['sketch'].outputs[0], [(0, 0.10), (60, 1.02), (959, 1.02)], interp='LINEAR')
    root = L['root']
    up = Quaternion()                                           # axis vertical, front element up
    side = Quaternion((0, 1, 0), math.radians(90))              # axis along +x
    pc = scene.PAGE_C
    hover_b = Vector((-0.30, -0.10, 0.235))
    to_screen = (screen_c - Vector((0.02, -0.26, 0.165))).normalized().to_track_quat('Z', 'Y')
    lens_c = Vector((0.02, -0.26, 0.165))
    lens_e = Vector((-0.16, -0.46, 0.150))
    axis_e = (scene.PLATE_C + Vector((0, 0.02, 0.07)) - lens_e).normalized()   # camera, lens and city in one line
    cam_e0 = lens_e - axis_e * 0.58 + Vector((0, 0, 0.012))
    face_cam = (cam_e0 - lens_e).normalized().to_track_quat('Z', 'Y')
    e_right = axis_e.cross(Vector((0, 0, 1))).normalized()   # screen-right in shot E; the lens sits right of centre
    spin = lambda q, deg: q @ Quaternion((0, 0, 1), math.radians(deg))
    key_pose(root, [
        (0, (pc.x, pc.y, -0.075), spin(up, -40)),
        (40, (pc.x, pc.y, -0.075), spin(up, -40)),
        (136, (pc.x, pc.y, 0.115), spin(up, 50)),
        (156, (pc.x, pc.y, 0.125), spin(up, 62)),
        (214, hover_b, side),
        (330, hover_b + Vector((0, 0, 0.004)), side),
        (392, lens_c, to_screen),
        (743, lens_c, to_screen),
        (744, lens_e, face_cam),
        (959, lens_e + Vector((0, 0, 0.006)), face_cam),
    ])

    # ---------------- B: exploded view ----------------
    order = lens.ORDER
    for i, k in enumerate(order):
        g = L['groups'][k]
        d = abs(i - (len(order) - 1) / 2)
        t0 = 216 + (5 - d) * 2.2
        key(g, 'location', [(0, (0, 0, 0)), (t0, (0, 0, 0)), (t0 + 34, (0, 0, L['explode'][k])), (312 + d * 1.5, (0, 0, L['explode'][k])), (350 + d, (0, 0, 0)), (959, (0, 0, 0))])
    for b in L['blades']:
        o, c = lens.iris_angle(1.0), lens.iris_angle(0.22)
        e0 = lens.iris_angle(0.06)
        e1 = lens.iris_angle(0.46)
        key(b, 'rotation_euler', [(0, o), (268, o), (286, c), (304, o), (743, o), (744, e0), (784, e0), (866, e1), (959, lens.iris_angle(0.5))], index=2)
        hold_cuts(b.animation_data)

    # ---------------- D: the card leaves the screen and becomes a city ----------------
    cx, cy = lay['card_cx'], lay['card_cy']
    Sq = S.to_quaternion()
    on_screen = lambda z: S @ Vector((cx, cy, z))
    desk_q = Quaternion()                                       # plate x right, y away from camera, z up
    s_desk = scene.PLATE_W / lay['card_w']
    plate.rotation_mode = 'QUATERNION'
    pk = [
        (0, on_screen(-0.0036), Sq, 1.0), (527, on_screen(-0.0036), Sq, 1.0), (528, on_screen(0.0030), Sq, 1.0),
        (548, on_screen(0.060), Sq, 1.12),
        (584, scene.PLATE_C + Vector((0, 0, 0.045)), desk_q, s_desk * 0.96),
        (598, scene.PLATE_C, desk_q, s_desk), (959, scene.PLATE_C, desk_q, s_desk),
    ]
    prev = None
    for f, loc, q, s in pk:
        q = Quaternion(q)
        if prev is not None and q.dot(prev) < 0:
            q = -q
        prev = q
        plate.location, plate.rotation_quaternion, plate.scale = loc, q, (s, s, s)
        for p in ('location', 'rotation_quaternion', 'scale'):
            plate.keyframe_insert(p, frame=f)
    set_interp(plate.animation_data)
    key_socket(H['card_emit'], [(0, 1.0), (528, 1.0), (572, 0.0), (959, 0.0)])
    for i, (piv, b, bw, bh) in enumerate(bars):
        t0 = 590 + i * 3
        key(piv, 'rotation_euler', [(0, 0.0), (t0, 0.0), (t0 + 22, math.radians(90)), (959, math.radians(90))], index=0)
        key(b, 'scale', [(0, 0.05), (t0 + 14, 0.05), (t0 + 36, 1.0), (959, 1.0)], index=2)
    key(H['city_base'], 'scale', [(0, (0.55, 0.55, 1)), (606, (0.55, 0.55, 1)), (640, (1, 1, 1)), (959, (1, 1, 1))])
    for piv, x, y in blds:
        d = math.hypot(x, y) / (lay['card_w'] * 0.8)
        t0 = 622 + d * 34
        key(piv, 'scale', [(0, (0, 0, 0)), (t0, (0, 0, 0)), (t0 + 4, (1, 1, 0.03)), (t0 + 24, (1, 1, 1)), (959, (1, 1, 1))])

    # ---------------- cameras ----------------
    cd = bpy.data.cameras.new('cam')
    cam = bpy.data.objects.new('cam', cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    cd.sensor_width = 36
    cd.clip_start, cd.clip_end = 0.01, 50
    cd.dof.use_dof = True
    cd.dof.aperture_blades = 9          # bokeh takes the shape of the iris
    cd.dof.aperture_rotation = 0.3
    focus = lib.empty('focus')
    cd.dof.focus_object = focus
    page_top = Vector((pc.x, pc.y, scene.PAGE_Z))
    plate_c = scene.PLATE_C
    key_cam(cam, [
        # A
        (0, (-0.475, -0.33, 0.095), page_top + Vector((0.0, 0.0, 0.0)), 58),
        (56, (-0.46, -0.39, 0.125), page_top + Vector((0, 0, 0.02)), 58),
        (146, (-0.41, -0.52, 0.18), Vector((pc.x, pc.y, 0.132)), 58),
        # B
        (222, (-0.37, -0.90, 0.33), hover_b + Vector((0.0, 0, 0.012)), 50),
        (330, (-0.22, -0.92, 0.31), hover_b + Vector((0.0, 0, 0.012)), 50),
        # C: move behind the lens and look through it at the screen
        (392, lens_c - (screen_c - lens_c).normalized() * 0.40 + Vector((0, 0, 0.02)), lens_c, 62),
        (431, lens_c - (screen_c - lens_c).normalized() * 0.105, screen_c, 62),
        # C2: the dashboard
        (432, screen_c + screen_n * 0.36 + Vector((0.012, 0, 0.004)), screen_c, 50),
        (527, screen_c + screen_n * 0.235 + Vector((0.030, 0, -0.004)), screen_c + S.to_3x3() @ Vector((cx * 0.6, cy * 0.5, 0)), 50),
        # D: pull back as the card leaves and the city rises
        (590, (0.42, -0.72, 0.30), plate_c + Vector((0, 0.05, 0.05)), 45),
        (690, (0.56, -0.74, 0.20), plate_c + Vector((0, 0.02, 0.045)), 48),
        (743, (0.60, -0.72, 0.17), plate_c + Vector((0, 0.02, 0.045)), 50),
        # E
        (744, cam_e0, lens_e - e_right * 0.062, 85),
        (959, cam_e0 + (lens_e - cam_e0) * 0.20, lens_e - e_right * 0.036, 85),
    ])
    hold_cuts(cam.animation_data)
    hold_cuts(cd.animation_data)
    fk = [
        (0, page_top), (50, page_top + Vector((0, 0, 0.01))), (146, Vector((pc.x, pc.y, 0.14))),
        (222, hover_b), (330, hover_b), (392, lens_c - (screen_c - lens_c).normalized() * 0.05), (416, lens_c - (screen_c - lens_c).normalized() * 0.05), (431, screen_c),
        (432, screen_c + screen_n * 0.25), (452, screen_c), (527, screen_c),
        (590, plate_c + Vector((0, 0, 0.04))), (743, plate_c + Vector((0, -0.02, 0.05))),
        (744, lens_e + (cam_e0 - lens_e).normalized() * 0.05), (959, lens_e + (cam_e0 - lens_e).normalized() * 0.03),
    ]
    for f, p in fk:
        focus.location = p
        focus.keyframe_insert('location', frame=f)
    set_interp(focus.animation_data)
    hold_cuts(focus.animation_data)
    key(cd.dof, 'aperture_fstop', [(0, 2.8), (150, 4.0), (222, 5.6), (330, 5.6), (392, 8.0), (420, 5.6), (431, 2.8), (432, 2.8), (527, 4.0), (590, 4.0), (743, 3.2), (744, 2.8), (959, 2.8)])
    hold_cuts(cd.animation_data)

    # a warm light behind the lens that blooms through the iris in E
    bd = bpy.data.lights.new('bloom', 'AREA')
    bd.shape = 'DISK'
    bd.size = 0.11
    bd.color = (1.0, 0.55, 0.22)
    bo = bpy.data.objects.new('bloom', bd)
    sc.collection.objects.link(bo)
    bo.location = lens_e - (cam_e0 - lens_e).normalized() * 0.11
    bo.rotation_mode = 'QUATERNION'
    bo.rotation_quaternion = lib.look_quat(bo.location, cam_e0)
    key(bd, 'energy', [(0, 0), (776, 0), (800, 0.10), (866, 0.34), (959, 0.30)])
    only_lens = bpy.data.collections.new('lens_only')       # the night shot's lights fall on the lens alone
    def walk(o):
        if o.type in ('MESH', 'FONT'):
            only_lens.objects.link(o)
        for c in o.children:
            walk(c)
    walk(L['root'])
    bo.light_linking.receiver_collection = only_lens
    for nm, loc, col, e, size in [('e_key', (-0.75, -0.62, 0.52), (1.0, 0.82, 0.66), 4.0, 0.35), ('e_rim', (0.16, -0.20, 0.40), (0.55, 0.72, 1.0), 5.0, 0.25)]:
        d = bpy.data.lights.new(nm, 'AREA')
        d.size, d.color = size, col
        d.spread = math.radians(50)
        o = bpy.data.objects.new(nm, d)
        sc.collection.objects.link(o)
        o.location = loc
        o.rotation_mode = 'QUATERNION'
        o.rotation_quaternion = lib.look_quat(loc, lens_e)
        o.light_linking.receiver_collection = only_lens
        key(d, 'energy', [(0, 0), (743, 0), (744, e), (959, e)])
        hold_cuts(d.animation_data)

    H.update(cam=cam, focus=focus, plate=plate, bars=bars, blds=blds, S=S, screen_c=screen_c)
    return H


def setup_render(res=(1920, 1080), samples=96, device='CPU', motion_blur=True):
    sc = bpy.context.scene
    r = sc.render
    r.engine = 'CYCLES'
    r.resolution_x, r.resolution_y, r.resolution_percentage = res[0], res[1], 100
    c = sc.cycles
    c.samples = samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.015
    c.use_denoising = True
    c.max_bounces, c.diffuse_bounces, c.glossy_bounces, c.transmission_bounces, c.transparent_max_bounces = 26, 3, 8, 26, 32
    c.caustics_reflective = c.caustics_refractive = False
    c.sample_clamp_indirect = 8.0
    c.blur_glossy = 0.6
    r.use_motion_blur = motion_blur
    r.motion_blur_shutter = 0.5
    try:
        r.motion_blur_position = 'START'
    except Exception:
        c.motion_position = 'START'
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = 'AgX - Medium High Contrast'
    except Exception:
        pass
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGB'
    r.image_settings.color_depth = '8'
    r.image_settings.compression = 30
    r.use_persistent_data = True
    if device == 'GPU':
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for t in ('OPTIX', 'CUDA'):
            try:
                prefs.compute_device_type = t
                prefs.get_devices()
                devs = [d for d in prefs.devices if d.type == t]
                if devs:
                    for d in prefs.devices:
                        d.use = d.type == t
                    break
            except Exception:
                continue
        c.device = 'GPU'
        try:
            c.denoiser = 'OPTIX' if prefs.compute_device_type == 'OPTIX' else 'OPENIMAGEDENOISE'
        except Exception:
            pass
