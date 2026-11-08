"""Builds the Casa Nostra demo dishes as real-scale GLB files (meters, origin on the table).

Run inside Blender 4.5 (live: exec(open(path).read()); headless: blender -b -P build_models.py).
Needs tools/models/build/tex (python tools/models/textures.py) and the Poly Haven scans in PH_DIR.
Writes public/models/<slug>.glb and, for dishes with no stock photo, public/images/dishes/<slug>.jpg renders.
"""
import bpy, bmesh, math, os, sys
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent if '__file__' in dir() and __file__ else Path(os.environ['MENU_AR_TOOLS'])
ROOT = HERE.parents[1]
TEX = HERE / 'build' / 'tex'
PH_DIR = Path(os.environ.get('PH_DIR', HERE / 'build' / 'polyhaven'))
MODELS = ROOT / 'public' / 'models'
PHOTOS = ROOT / 'public' / 'images' / 'dishes'
MODELS.mkdir(parents=True, exist_ok=True); PHOTOS.mkdir(parents=True, exist_ok=True)
SEG = 128


def reset():
    # Data-level wipe: read_homefile would drop the live UI context the glTF exporter needs.
    for coll in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.cameras, bpy.data.lights, bpy.data.worlds):
        for item in list(coll): coll.remove(item)
    bpy.context.scene.unit_settings.system = 'METRIC'


def principled(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def material(name, color=(1, 1, 1), rough=.5, tex=None, normal=None, uv='UVMap'):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    nt, sh = mat.node_tree, principled(mat)
    sh.inputs['Base Color'].default_value = (*color, 1)
    sh.inputs['Roughness'].default_value = rough
    if tex:
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(str(TEX / tex))
        nt.links.new(n.outputs['Color'], sh.inputs['Base Color'])
    if normal:
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(str(TEX / normal))
        n.image.colorspace_settings.name = 'Non-Color'
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = .8
        nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], sh.inputs['Normal'])
    return mat


def obj_from(name, verts, faces, mat, uvs=None, smooth=True):
    mesh = bpy.data.meshes.new(name); mesh.from_pydata(verts, [], faces); mesh.update()
    o = bpy.data.objects.new(name, mesh); bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    if uvs:
        layer = mesh.uv_layers.new(name='UVMap')
        for p in mesh.polygons:
            for li, vi in zip(p.loop_indices, p.vertices): layer.data[li].uv = uvs(verts[vi])
    for p in mesh.polygons: p.use_smooth = smooth
    return o


def lathe(name, profile, mat, seg=SEG):
    """Revolve (radius, z) points around Z; profile runs outer bottom -> rim -> inner."""
    verts = [(r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z) for r, z in profile for i in range(seg)]
    faces = [(j * seg + i, j * seg + (i + 1) % seg, (j + 1) * seg + (i + 1) % seg, (j + 1) * seg + i)
             for j in range(len(profile) - 1) for i in range(seg)]
    o = obj_from(name, verts, faces, mat)
    o.modifiers.new('weld', 'WELD').merge_threshold = 1e-5
    return o


def glaze():
    return material('Ceramica', (.93, .915, .88), .14, tex='plate.png')


def planar_uv(o, radius):
    layer = o.data.uv_layers.new(name='UVMap')
    for p in o.data.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            v = o.data.vertices[vi].co
            layer.data[li].uv = (v.x / radius * .5 + .5, v.y / radius * .5 + .5)
    return o


def plate(radius, depth=.018, well=.62, name='Prato'):
    R = radius
    return planar_uv(lathe(name, [(0, .0), (R * .55, 0), (R * .58, .004), (R * well, .006), (R * .96, depth), (R, depth + .002),
                        (R * .995, depth + .005), (R * .97, depth + .004), (R * well, .011), (R * .58, .009), (0, .009)], glaze()), R)


def bowl(radius, name='Prato fundo'):
    R = radius
    return planar_uv(lathe(name, [(0, 0), (R * .5, 0), (R * .53, .004), (R * .6, .026), (R * .72, .04), (R * .98, .045), (R, .048),
                        (R * .99, .051), (R * .72, .044), (R * .62, .03), (R * .55, .014), (0, .012)], glaze()), R)


def height_sampler(img_name):
    img = bpy.data.images.load(str(TEX / img_name)); w, h = img.size
    px = list(img.pixels[:])
    def at(uu, vv):
        x = min(w - 1, max(0, int(uu * (w - 1)))); y = min(h - 1, max(0, int(vv * (h - 1))))
        return px[(y * w + x) * 4]
    return at


def polar_disc(name, radius, z0, height_fn, mat, rings=96, seg=192):
    """Top surface as a polar grid with planar UVs, closed underneath."""
    verts, faces = [(0, 0, z0 + height_fn(0, 0))], []
    for j in range(1, rings + 1):
        rr = radius * j / rings
        for i in range(seg):
            a = 2 * math.pi * i / seg; x, y = rr * math.cos(a), rr * math.sin(a)
            verts.append((x, y, z0 + height_fn(x / radius, y / radius)))
    for i in range(seg): faces.append((0, 1 + i, 1 + (i + 1) % seg))
    for j in range(rings - 1):
        b0, b1 = 1 + j * seg, 1 + (j + 1) * seg
        for i in range(seg): faces.append((b0 + i, b1 + i, b1 + (i + 1) % seg, b0 + (i + 1) % seg))
    last, bottom = 1 + (rings - 1) * seg, len(verts)
    for i in range(seg):
        a = 2 * math.pi * i / seg; verts.append((radius * math.cos(a), radius * math.sin(a), z0))
    for i in range(seg): faces.append((last + i, bottom + i, bottom + (i + 1) % seg, last + (i + 1) % seg))
    faces.append(tuple(bottom + i for i in reversed(range(seg))))
    return obj_from(name, verts, faces, mat, uvs=lambda p: (p[0] / radius * .5 + .5, p[1] / radius * .5 + .5))


def export(slug, objs=None):
    bpy.ops.object.select_all(action='DESELECT')
    objs = objs or [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in objs: o.select_set(True)
    for img in bpy.data.images:
        if img.size[0] > 1024: img.scale(1024, int(1024 * img.size[1] / img.size[0]))
    bpy.ops.export_scene.gltf(filepath=str(MODELS / f'{slug}.glb'), export_format='GLB', use_selection=True, export_apply=True,
                              export_image_format='JPEG', export_jpeg_quality=82, export_yup=True,
                              export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
    dims = Vector((0, 0, 0)); lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
    for o in objs:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c); lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
    dims = hi - lo
    print(f'MODEL {slug}: {dims.x*100:.1f} x {dims.y*100:.1f} x {dims.z*100:.1f} cm, {(MODELS / (slug + ".glb")).stat().st_size/1e6:.2f} MB')
    return dims


# ---------- dishes ----------

def pizza(slug, tex):
    reset(); plate(.17, .012)
    h = height_sampler(f'{tex}_h.png')
    polar_disc('Pizza', .15, .013, lambda x, y: .004 + .034 * max(0, h(x * .5 + .5, y * .5 + .5) - .5) ** 1.15,
               material('Pizza', rough=.62, tex=f'{tex}.png', normal=f'{tex}_n.png'))
    return export(slug)


def risotto():
    reset(); bowl(.14)
    h = height_sampler('risotto_h.png')
    def fn(x, y):
        rr = math.hypot(x, y)
        return .022 * max(0, 1 - rr ** 2.4) + .004 * h(x * .5 + .5, y * .5 + .5)
    polar_disc('Risotto', .075, .0115, fn, material('Risotto', rough=.38, tex='risotto.png', normal='risotto_n.png'))
    parm = material('Parmigiano', (.95, .88, .66), .55)
    import random; random.seed(4)
    for k in range(7):
        bpy.ops.mesh.primitive_cube_add(size=1)
        s = bpy.context.object; s.name = f'Lasca{k}'
        s.scale = (.018 + random.random() * .01, .009 + random.random() * .005, .0009)
        a, rr = random.random() * 6.28, random.random() * .035
        s.location = (rr * math.cos(a), rr * math.sin(a), .0115 + .022 * (1 - (rr / .075) ** 2.4) + .002)
        s.rotation_euler = (random.uniform(-.4, .4), random.uniform(-.4, .4), random.random() * 6.28)
        s.data.materials.append(parm)
    return export('risotto-al-parmigiano')


def tiramisu():
    reset(); plate(.105, .014, .7)
    side, top = material('Tiramisu', rough=.7, tex='tiramisu_side.png', normal='tiramisu_side_n.png'), \
        material('Cacau', rough=.95, tex='tiramisu_top.png', normal='tiramisu_top_n.png')
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, .0105 + .032))
    t = bpy.context.object; t.name = 'Tiramisu'; t.scale = (.085, .07, .064)
    bpy.ops.object.transform_apply(scale=True)
    t.data.materials.append(side); t.data.materials.append(top)
    bm = bmesh.new(); bm.from_mesh(t.data)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=.003, segments=3)
    bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=6, use_grid_fill=True)
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        f.material_index = 1 if n.z > .5 else 0
        for l in f.loops:
            p = l.vert.co
            if n.z > .5: l[uv].uv = (p.x / .1 + .5, p.y / .1 + .5)
            else:
                along = p.x if abs(n.y) > abs(n.x) else p.y
                l[uv].uv = (along / .1 + .5, 1 - (p.z - .0105) / .064)
    import random; random.seed(2)
    for vtx in bm.verts:  # hand-cut irregularity
        vtx.co += Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-.4, .4))) * .0006
    bm.to_mesh(t.data); bm.free()
    for p in t.data.polygons: p.use_smooth = True
    return export('tiramisu')


def espresso():
    reset(); cer = material('Ceramica', (.95, .94, .91), .08)
    lathe('Pires', [(0, 0), (.045, 0), (.048, .003), (.06, .006), (.068, .011), (.069, .013), (.066, .013),
                    (.058, .009), (.03, .007), (.028, .009), (.022, .009), (0, .009)], cer)
    lathe('Xicara', [(0, .009), (.02, .009), (.022, .011), (.03, .02), (.034, .04), (.035, .06), (.0352, .0625),
                     (.033, .0625), (.0325, .058), (.031, .04), (.027, .022), (.02, .015), (0, .015)], cer)
    polar_disc('Cafe', .0318, .051, lambda x, y: .0015, material('Crema', rough=.25, tex='crema.png', normal='crema_n.png'), 24, 64)
    verts, faces, segs, sides = [], [], 40, 12
    for j in range(segs + 1):
        t = math.pi * (.04 + .92 * j / segs)
        c = Vector((.031 + .017 * math.sin(t), 0, .038 + .014 * math.cos(t)))
        tg = Vector((.016 * math.cos(t), 0, -.013 * math.sin(t))).normalized(); nn = Vector((-tg.z, 0, tg.x))
        for i in range(sides):
            a = 2 * math.pi * i / sides
            verts.append(c + .0032 * (math.cos(a) * nn) + .0045 * Vector((0, math.sin(a), 0)))
    for j in range(segs):
        for i in range(sides): faces.append((j * sides + i, (j + 1) * sides + i, (j + 1) * sides + (i + 1) % sides, j * sides + (i + 1) % sides))
    obj_from('Alca', verts, faces, cer)
    return export('espresso')


def import_scan(asset):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(PH_DIR / asset / f'{asset}_2k.gltf'))
    return [o for o in bpy.data.objects if o not in before and o.type == 'MESH']


def on_plate(slug, asset, plate_r, rot=0):
    reset(); plate(plate_r, .013, .66)
    for o in import_scan(asset):
        o.rotation_euler.z = rot
        bpy.context.view_layer.update()
        zmin = min((o.matrix_world @ Vector(c)).z for c in o.bound_box)
        o.location.z += .0105 - zmin
    return export(slug)


def wine():
    reset()
    keep = [o for o in import_scan('wine_bottles_01') if o.name.endswith('champagne')]
    for o in [o for o in bpy.context.scene.objects if o not in keep]: bpy.data.objects.remove(o)
    keep[0].location = (0, 0, 0)
    # The scan's wine is also transmissive, which reads as empty glass in WebGL/Quick Look: make the rosé opaque.
    for m in keep[0].data.materials:
        if m.name.startswith('wine_bottles_01_wine'):
            sh = principled(m)
            for link in list(sh.inputs['Base Color'].links): m.node_tree.links.remove(link)
            sh.inputs['Base Color'].default_value = (.78, .26, .24, 1)
            sh.inputs['Transmission Weight'].default_value = 0
            sh.inputs['Roughness'].default_value = .08
    return export('prosecco-rose', keep)


# ---------- studio renders (for dishes whose photo is the scan itself) ----------

def render(slug, dims):
    sc = bpy.context.scene
    try: sc.render.engine = 'CYCLES'
    except TypeError: pass
    sc.cycles.samples = 64; sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1600, 1200
    sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 88
    sc.view_settings.view_transform = 'AgX'
    size = max(dims.x, dims.y, dims.z)
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, -.0005))
    ground = bpy.context.object; ground.data.materials.append(material('Mesa', (.86, .84, .80), .55))
    world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (.9, .88, .85, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = .18
    target = Vector((0, 0, dims.z * (.5 if dims.z > max(dims.x, dims.y) else .35)))
    bpy.ops.object.camera_add(location=target + Vector((0, -1, .85 if dims.z < max(dims.x, dims.y) else .3)).normalized() * size * 2.6)
    cam = bpy.context.object; cam.data.lens = 70
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = (target - cam.location).length; cam.data.dof.aperture_fstop = 4
    sc.camera = cam
    for loc, energy, s in [((-1.5, -.5, 1.4), 220, 1.0), ((1.5, -.2, .8), 25, 1.2), ((.3, 1.6, 1.3), 70, .9)]:
        bpy.ops.object.light_add(type='AREA', location=Vector(loc) * size * 3)
        l = bpy.context.object; l.data.energy = energy * (size * 3) ** 2; l.data.size = s * size * 3
        l.rotation_euler = (target - l.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = str(PHOTOS / f'{slug}.jpg')
    bpy.ops.render.render(write_still=True)
    print('RENDER', slug)


def build(only=None, renders=True):
    jobs = {
        'pizza-margherita': lambda: pizza('pizza-margherita', 'pizza_margherita'),
        'pizza-diavola': lambda: pizza('pizza-diavola', 'pizza_diavola'),
        'risotto-al-parmigiano': risotto,
        'tiramisu': tiramisu,
        'espresso': espresso,
        'torta-cioccolato-e-fragole': lambda: on_plate('torta-cioccolato-e-fragole', 'strawberry_chocolate_cake', .16),
        'torta-di-carote': lambda: on_plate('torta-di-carote', 'carrot_cake', .155),
        'cornetto-alla-crema': lambda: on_plate('cornetto-alla-crema', 'croissant', .12, .5),
        'prosecco-rose': wine,
    }
    photo = {'espresso', 'torta-cioccolato-e-fragole', 'torta-di-carote', 'cornetto-alla-crema', 'prosecco-rose'}
    for slug, job in jobs.items():
        if only and slug not in only: continue
        dims = job()
        if renders and slug in photo: render(slug, dims)


if __name__ == '__main__' and '--background' in sys.argv:
    build()
