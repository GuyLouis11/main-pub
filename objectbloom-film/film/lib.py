"""Shared toolkit: geometry from code (bmesh), materials, keyframes. Blender 5.x, Cycles.

Everything in the film is generated here and in the other film/ modules: no downloaded models or image textures
except the screen UI frames and the sketch drawing, which are also rendered from code (ui/ and film/sketch.py)."""
import math
import bpy
import bmesh
from mathutils import Vector, Matrix, Quaternion

FPS = 24
TOTAL = 960  # 40 s

# Object Bloom brand tokens (assets/source/DESIGN.md on the sizzle branch)
STUDIO = (0.008, 0.012, 0.015)
CREAM = (0.905, 0.905, 0.855)
GREEN = (0.019, 0.065, 0.048)
TEAL = (0.009, 0.227, 0.188)


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


# ---------- objects ----------
def new_obj(name, bm, mat=None, smooth=False, parent=None, coll=None):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    (coll or bpy.context.scene.collection).objects.link(ob)
    if mat:
        me.materials.append(mat)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    if parent:
        ob.parent = parent
    return ob


def empty(name, parent=None):
    ob = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def bevel(ob, width=0.001, segs=3, angle=30):
    m = ob.modifiers.new('bevel', 'BEVEL')
    m.width, m.segments, m.limit_method, m.angle_limit = width, segs, 'ANGLE', math.radians(angle)
    m.harden_normals = False
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def subsurf(ob, lv=2):
    m = ob.modifiers.new('sub', 'SUBSURF')
    m.levels = m.render_levels = lv
    return ob


def box(name, size, loc=(0, 0, 0), mat=None, bev=0.0, parent=None, segs=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    ob = new_obj(name, bm, mat, parent=parent)
    ob.location = loc
    if bev:
        bevel(ob, bev, segs)
    return ob


def lathe(name, profile, segs=96, mat=None, smooth=True, parent=None, closed=True, split=40):
    """Revolve a 2D (r, z) profile around Z. closed=True joins the last point to the first."""
    bm = bmesh.new()
    n = len(profile)
    rings = []
    for (r, z) in profile:
        ring = []
        if r < 1e-7:
            v = bm.verts.new((0, 0, z))
            ring = [v] * segs
        else:
            for i in range(segs):
                a = 2 * math.pi * i / segs
                ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
        rings.append(ring)
    m = n if closed else n - 1
    for k in range(m):
        A, B = rings[k], rings[(k + 1) % n]
        for i in range(segs):
            j = (i + 1) % segs
            vs = [A[i], A[j], B[j], B[i]]
            uniq = []
            for v in vs:
                if v not in uniq:
                    uniq.append(v)
            if len(uniq) >= 3:
                try:
                    bm.faces.new(uniq)
                except ValueError:
                    pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = new_obj(name, bm, mat, smooth=smooth, parent=parent)
    if smooth and split:
        m2 = ob.modifiers.new('wn', 'WEIGHTED_NORMAL')
        m2.keep_sharp = True
        for e in ob.data.edges:
            pass
        ob.data.set_sharp_from_angle(angle=math.radians(split))
    return ob


def ring_profile(r0, r1, z0, z1, ch=0.0004):
    """Rectangular ring section with small chamfers so edges catch light."""
    return [(r0 + ch, z0), (r1 - ch, z0), (r1, z0 + ch), (r1, z1 - ch), (r1 - ch, z1), (r0 + ch, z1), (r0, z1 - ch), (r0, z0 + ch)]


def knurled(name, r0, r1, z0, z1, teeth=90, depth=0.0009, mat=None, parent=None):
    """A grip ring: flat-topped ridges around the outside."""
    bm = bmesh.new()
    segs = teeth * 4
    outer = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        r = r1 if (i % 4) in (0, 1) else r1 - depth
        outer.append((r * math.cos(a), r * math.sin(a)))
    inner = [(r0 * math.cos(2 * math.pi * i / segs), r0 * math.sin(2 * math.pi * i / segs)) for i in range(segs)]
    vo0 = [bm.verts.new((x, y, z0)) for x, y in outer]
    vo1 = [bm.verts.new((x, y, z1)) for x, y in outer]
    vi0 = [bm.verts.new((x, y, z0)) for x, y in inner]
    vi1 = [bm.verts.new((x, y, z1)) for x, y in inner]
    for i in range(segs):
        j = (i + 1) % segs
        bm.faces.new([vo0[i], vo0[j], vo1[j], vo1[i]])
        bm.faces.new([vi0[j], vi0[i], vi1[i], vi1[j]])
        bm.faces.new([vo1[i], vo1[j], vi1[j], vi1[i]])
        bm.faces.new([vo0[j], vo0[i], vi0[i], vi0[j]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = new_obj(name, bm, mat, parent=parent)
    bevel(ob, 0.00015, 2, 25)
    return ob


def lens_profile(sd, r1, r2, t, edge_min=0.0012, n=28):
    """(r, z) profile of a glass element centred on z=0. r1/r2: curvature radii of front (+z) and back (-z) surfaces;
    positive r1 = front bulges toward +z, positive r2 = back bulges toward -z; negative = concave."""
    def sag(r, R):
        if abs(R) > 1e5:
            return 0.0
        s = abs(R) - math.sqrt(max(1e-12, R * R - r * r))
        return s if R > 0 else -s
    zf = lambda r: t / 2 - sag(r, r1)
    zb = lambda r: -t / 2 + sag(r, r2)
    if zf(sd) - zb(sd) < edge_min:  # keep a real edge thickness
        add = edge_min - (zf(sd) - zb(sd))
        t += add
    pts = [(sd * i / n, zf(sd * i / n)) for i in range(n + 1)]
    pts += [(sd * i / n, zb(sd * i / n)) for i in range(n, -1, -1)]
    return pts[:-1] if abs(pts[-1][0]) < 1e-9 and abs(pts[0][0]) < 1e-9 and False else pts


# ---------- materials ----------
def mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return m, nt, out


def principled(name, color=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, coat=0.0, emission=None, estr=0.0, spec=0.5, ior=1.5, trans=0.0, sheen=0.0):
    m, nt, out = mat(name)
    p = nt.nodes.new('ShaderNodeBsdfPrincipled')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['IOR'].default_value = ior
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Coat Roughness'].default_value = 0.08
    p.inputs['Transmission Weight'].default_value = trans
    p.inputs['Specular IOR Level'].default_value = spec
    p.inputs['Sheen Weight'].default_value = sheen
    if emission:
        p.inputs['Emission Color'].default_value = (*emission, 1)
        p.inputs['Emission Strength'].default_value = estr
    nt.links.new(p.outputs[0], out.inputs[0])
    return m


def node(nt, kind, **kw):
    n = nt.nodes.new(kind)
    for k, v in kw.items():
        if k in n.inputs.keys() if hasattr(n.inputs, 'keys') else False:
            n.inputs[k].default_value = v
        else:
            setattr(n, k, v)
    return n


def add_bump(m, scale=400.0, strength=0.08, detail=6.0, dist=0.0005, coord='Object'):
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = detail
    b = nt.nodes.new('ShaderNodeBump')
    b.inputs['Strength'].default_value = strength
    b.inputs['Distance'].default_value = dist
    nt.links.new(tc.outputs[coord], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], b.inputs['Height'])
    nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
    return m


def glass(name, tint=(1, 1, 1), ior=1.62, coat=(0.55, 0.35, 0.9)):
    """Optical glass with a coloured anti-reflection coating: reflections pick up the coating colour, the glass
    itself stays clear. Shadow rays pass through tinted, since caustics are off."""
    m, nt, out = mat(name)
    g = nt.nodes.new('ShaderNodeBsdfGlass')
    g.inputs['Color'].default_value = (*tint, 1)
    g.inputs['Roughness'].default_value = 0.0
    g.inputs['IOR'].default_value = ior
    gl = nt.nodes.new('ShaderNodeBsdfGlossy')
    gl.inputs['Color'].default_value = (*coat, 1)
    gl.inputs['Roughness'].default_value = 0.02
    fr = nt.nodes.new('ShaderNodeFresnel')
    fr.inputs['IOR'].default_value = 1.9
    mx = nt.nodes.new('ShaderNodeMixShader')
    sc = nt.nodes.new('ShaderNodeMath')
    sc.operation = 'MULTIPLY'
    sc.inputs[1].default_value = 0.55
    nt.links.new(fr.outputs[0], sc.inputs[0])
    nt.links.new(sc.outputs[0], mx.inputs[0])
    nt.links.new(g.outputs[0], mx.inputs[1])
    nt.links.new(gl.outputs[0], mx.inputs[2])
    lp = nt.nodes.new('ShaderNodeLightPath')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    tr.inputs['Color'].default_value = (0.86, 0.9, 0.88, 1)
    mx2 = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(lp.outputs['Is Shadow Ray'], mx2.inputs[0])
    nt.links.new(mx.outputs[0], mx2.inputs[1])
    nt.links.new(tr.outputs[0], mx2.inputs[2])
    nt.links.new(mx2.outputs[0], out.inputs[0])
    return m


def emission(name, color=(1, 1, 1), strength=1.0):
    m, nt, out = mat(name)
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = (*color, 1)
    e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], out.inputs[0])
    return m


# ---------- animation ----------
def key(target, path, frames_values, interp='BEZIER', index=-1):
    """Keyframe target.path at [(frame, value), ...]. Bezier keys ease in and out (auto-clamped handles)."""
    for f, v in frames_values:
        if index >= 0:
            getattr(target, path)[index] = v
        else:
            setattr_path(target, path, v)
        target.keyframe_insert(path, frame=f, index=index)
    ad = getattr(target, 'animation_data', None) or getattr(getattr(target, 'id_data', None), 'animation_data', None)
    set_interp(ad, interp)


def setattr_path(target, path, v):
    if path.startswith('["'):
        target[path[2:-2]] = v
    else:
        setattr(target, path, v)


def fcurves_of(ad):
    if not ad or not ad.action:
        return []
    act = ad.action
    out = []
    try:
        for layer in act.layers:
            for strip in layer.strips:
                for cb in strip.channelbags:
                    out += list(cb.fcurves)
    except Exception:
        out = list(getattr(act, 'fcurves', []))
    return out


def set_interp(ad, interp='BEZIER'):
    for fc in fcurves_of(ad):
        for kp in fc.keyframe_points:
            kp.interpolation = interp
            if interp == 'BEZIER':
                kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
        fc.update()


def key_socket(sock, frames_values, interp='BEZIER'):
    for f, v in frames_values:
        sock.default_value = v
        sock.keyframe_insert('default_value', frame=f)
    set_interp(sock.id_data.animation_data, interp)


def look_quat(src, dst, roll=0.0, track='-Z', up='Y'):
    d = (Vector(dst) - Vector(src)).normalized()
    q = d.to_track_quat(track, up)
    if roll:
        q = q @ Quaternion((0, 0, 1), roll)
    return q


def key_cam(cam, keys):
    """keys: [(frame, position, look_at_target, focal_mm, roll)] -> smooth path; quaternions kept continuous."""
    cam.rotation_mode = 'QUATERNION'
    prev = None
    for f, pos, tgt, lens, *rest in keys:
        roll = rest[0] if rest else 0.0
        cam.location = pos
        q = look_quat(pos, tgt, roll)
        if prev is not None and q.dot(prev) < 0:
            q = -q
        prev = q
        cam.rotation_quaternion = q
        cam.data.lens = lens
        cam.keyframe_insert('location', frame=f)
        cam.keyframe_insert('rotation_quaternion', frame=f)
        cam.data.keyframe_insert('lens', frame=f)
    set_interp(cam.animation_data)
    set_interp(cam.data.animation_data)
