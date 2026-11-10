"""Render frames of the film.  blender -b -P render.py -- --frames 0-959 --res 1920x1080 --samples 96 --device GPU --out frames
Also works without Blender's UI build:  python3.13 render.py -- ...   (the bpy module)
--anchors FILE  writes the screen position of every label anchor for every frame (used by post/overlays.py), no render."""
import argparse, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
from film import anim, lens

ap = argparse.ArgumentParser()
ap.add_argument('--frames', default='0')
ap.add_argument('--res', default='1920x1080')
ap.add_argument('--samples', type=int, default=96)
ap.add_argument('--device', default='CPU')
ap.add_argument('--out', default='out/frames')
ap.add_argument('--anchors')
ap.add_argument('--no-blur', action='store_true')
ap.add_argument('--skip-existing', action='store_true')
a = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])

frames = []
for part in a.frames.split(','):
    if '-' in part:
        lo, rest = part.split('-')
        hi, step = (rest.split(':') + ['1'])[:2]
        frames += list(range(int(lo), int(hi) + 1, int(step)))
    else:
        frames.append(int(part))

H = anim.build()
W, Hh = map(int, a.res.split('x'))
anim.setup_render((W, Hh), a.samples, a.device, not a.no_blur)
sc = bpy.context.scene

if a.anchors:
    out = {}
    L = H['lens']
    for f in range(sc.frame_start, sc.frame_end + 1):
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get()
        row = {}
        for k in lens.LABELS:
            g = L['groups'][k].evaluated_get(dg)
            z0, z1 = L['ext'][k]
            p = g.matrix_world @ Vector((0, 0, (z0 + z1) / 2))
            v = world_to_camera_view(sc, H['cam'].evaluated_get(dg), p)
            t = world_to_camera_view(sc, H['cam'].evaluated_get(dg), p + Vector((0, 0, lens.RADII[k])))
            row[k] = [round(v.x, 5), round(1 - v.y, 5), round(v.z, 4), round(t.x, 5), round(1 - t.y, 5)]
        out[f] = row
    json.dump(out, open(a.anchors, 'w'))
    print('anchors', a.anchors)
    sys.exit(0)

os.makedirs(a.out, exist_ok=True)
for f in frames:
    path = os.path.join(os.path.abspath(a.out), f'f_{f:04d}.png')
    if a.skip_existing and os.path.exists(path):
        continue
    t = time.time()
    sc.frame_set(f)
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f'FRAME {f} {time.time() - t:.1f}s', flush=True)
