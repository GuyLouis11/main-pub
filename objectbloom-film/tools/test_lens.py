import sys, math, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import bpy
from mathutils import Vector
from film import lib, lens
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
L = lens.build()
mode = sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'asm'
ex = 1.0 if mode == 'exp' else 0.0
for k, g in L['groups'].items(): g.location.z = L['explode'][k]*ex
io = 0.35 if mode == 'iris' else 1.0
for b in L['blades']: b.rotation_euler.z = lens.iris_angle(io)
L['root'].rotation_euler = (math.radians(90), 0, math.radians(-90 if mode!='iris' else 0))
floor = lib.box('floor', (4,4,0.02), (0,0,-0.08), lib.principled('f',(0.03,0.03,0.035),rough=0.35))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(0.02,0.025,0.03,1)
def area(loc, size, e, col=(1,1,1)):
    d = bpy.data.lights.new('a','AREA'); d.size=size; d.energy=e; d.color=col
    o = bpy.data.objects.new('a', d); sc.collection.objects.link(o); o.location=loc
    o.rotation_mode='QUATERNION'; o.rotation_quaternion = lib.look_quat(loc,(0,0,0)); return o
area((-0.5,-0.4,0.6),0.6,60,(1,0.9,0.8)); area((0.6,0.3,0.3),0.4,40,(0.7,0.85,1)); area((0,0.6,0.1),0.8,30)
cd = bpy.data.cameras.new('c'); cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera=cam
pos = {'asm':(-0.16,-0.24,0.10),'exp':(-0.25,-0.55,0.22),'iris':(0.0,-0.3,0.02)}[mode]
cam.location=pos; cam.rotation_mode='QUATERNION'; cam.rotation_quaternion=lib.look_quat(pos,(0,0,0)); cd.lens={'asm':70,'exp':45,'iris':90}[mode]
cd.dof.use_dof=True; cd.dof.focus_distance=(Vector(pos)).length-0.03; cd.dof.aperture_fstop=5.6
sc.render.engine='CYCLES'; sc.cycles.samples=48; sc.cycles.use_denoising=True; sc.cycles.caustics_reflective=False; sc.cycles.caustics_refractive=False
sc.cycles.max_bounces=24; sc.cycles.transmission_bounces=24; sc.cycles.glossy_bounces=8
sc.render.resolution_x=960; sc.render.resolution_y=540; sc.render.filepath=os.path.abspath(f'out/test_lens_{mode}.png')
sc.view_settings.view_transform='AgX'
bpy.ops.render.render(write_still=True)
print('ext', L['exploded_length'])
