"""Paints the demo dishes' textures (albedo + height + normal) with numpy/PIL.

Run: python tools/models/textures.py   ->  tools/models/build/tex/*.png
Planar top-down UVs: image centre = dish centre, image edge = dish radius.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parent / 'build' / 'tex'
OUT.mkdir(parents=True, exist_ok=True)
N = 1024
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:N, 0:N]
u, v = (xx + .5) / N * 2 - 1, (yy + .5) / N * 2 - 1
r, ang = np.hypot(u, v), np.arctan2(v, u)


def noise(scale, octaves=4, seed=0):
    """Fractal value noise in [0,1]."""
    g = np.random.default_rng(seed)
    acc, amp, tot = np.zeros((N, N)), 1., 0.
    for o in range(octaves):
        s = max(2, int(scale * 2 ** o))
        im = Image.fromarray((g.random((s, s)) * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC)
        acc += amp * np.asarray(im, float) / 255; tot += amp; amp *= .5
    return acc / tot


def blob(cx, cy, rad, wobble=.35, seed=0):
    """Soft irregular blob mask (0..1)."""
    g = np.random.default_rng(seed)
    k = g.random(5) * 2 * np.pi
    a = np.arctan2(v - cy, u - cx)
    edge = rad * (1 + wobble * (np.sin(3 * a + k[0]) * .5 + np.sin(5 * a + k[1]) * .3 + np.sin(7 * a + k[2]) * .2))
    d = np.hypot(u - cx, v - cy)
    return np.clip((edge - d) / (rad * .25), 0, 1)


def mix(a, b, t):
    return a * (1 - t[..., None]) + np.asarray(b, float) * t[..., None]


def save(name, rgb, height=None, strength=6.):
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(OUT / f'{name}.png')
    if height is not None:
        h = np.clip(height, 0, 1)
        Image.fromarray((h * 255).astype(np.uint8)).save(OUT / f'{name}_h.png')
        hs = np.asarray(Image.fromarray((h * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1)), float) / 255
        dx = np.gradient(hs, axis=1) * strength * N / 256
        dy = np.gradient(hs, axis=0) * strength * N / 256
        n = np.dstack([-dx, dy, np.ones_like(hs)])
        n /= np.linalg.norm(n, axis=2, keepdims=True)
        Image.fromarray(((n * .5 + .5) * 255).astype(np.uint8)).save(OUT / f'{name}_n.png')
    print('wrote', name)


def pizza(name, toppings, seed):
    g = np.random.default_rng(seed)
    n1, n2, n3 = noise(6, seed=seed), noise(24, seed=seed + 1), noise(80, 3, seed=seed + 2)
    rim = .80 + .03 * (noise(5, 2, seed + 3) - .5)
    crust = np.clip((r - rim) / .03, 0, 1) * (r < .995)
    # Dough: pale golden, browner toward the rim's top, flour dust, leopard char spots.
    dough = mix(np.full((N, N, 3), (228, 196, 140.)), (176, 112, 52), np.clip((r - rim) / .2, 0, 1) * (.6 + .5 * n2))
    dough = mix(dough, (246, 236, 214), np.clip((n3 - .78) * 6, 0, 1) * .7)
    char = np.zeros((N, N))
    for _ in range(140):
        a, rr = g.random() * 2 * np.pi, rim + g.random() * (.99 - rim)
        char = np.maximum(char, blob(rr * np.cos(a), rr * np.sin(a), .004 + g.random() ** 2 * .02, .5, int(g.integers(1e6))))
    dough = mix(dough, (48, 30, 18), char * .9)
    # Tomato sauce with cooked darker patches and oil.
    sauce = mix(np.full((N, N, 3), (168, 42, 24.)), (112, 26, 14), np.clip(n1 * 1.4 - .4, 0, 1) * .7)
    sauce = mix(sauce, (214, 92, 40), np.clip((n2 - .6) * 3, 0, 1) * .5)
    edge = np.clip((rim - .015 + .03 * (noise(18, 2, seed + 4) - .5) - r) / .02, 0, 1)
    col = mix(dough, sauce, edge * (1 - crust))
    height = .55 + .45 * np.clip((r - rim) / .07, 0, 1) * np.clip((.995 - r) / .05, 0, 1) + .04 * n2
    height = height * (r < .998) + .03 * n3 * crust
    for kind, items in toppings:
        for (cx, cy, rad) in items:
            m = blob(cx, cy, rad, .2 if kind == 'mozz' else .08, int(g.integers(1e6)))
            if kind == 'mozz':
                c = mix(np.full((N, N, 3), (250, 244, 228.)), (222, 170, 92), np.clip((1 - m) * 3 * (m > 0), 0, 1) * .6 + np.clip((n3 - .7) * 4, 0, 1) * .5 * m)
                col = mix(col, c, np.clip(m * 1.1, 0, 1) ** 1.5); height = np.maximum(height, .6 + .12 * m)
            elif kind == 'basil':
                a = g.random() * np.pi
                lu, lv = (u - cx) * np.cos(a) + (v - cy) * np.sin(a), -(u - cx) * np.sin(a) + (v - cy) * np.cos(a)
                w = rad * .48 * np.clip(1 - .35 * lu / rad, .3, 1.4) * np.sqrt(np.clip(1 - (lu / rad) ** 2, 0, 1))
                leaf = np.clip((w - np.abs(lv)) / (rad * .04), 0, 1) * (np.abs(lu) < rad)
                vein = np.exp(-(lv / (rad * .03)) ** 2) * (np.abs(lu) < rad)
                c = mix(np.full((N, N, 3), (42, 96, 30.)), (20, 52, 14), np.clip(noise(30, 2, seed + 9) - .3, 0, 1))
                c = mix(c, (96, 150, 60), vein * .6)
                col = mix(col, c, leaf); height = np.maximum(height, (.66 + .02 * leaf) * (leaf > .5))
            elif kind == 'salami':
                d = np.hypot(u - cx, v - cy) / rad
                m = np.clip((1 - d) * 30, 0, 1)
                fat = np.clip((noise(70, 2, int(g.integers(1e6))) - .66) * 8, 0, 1)
                c = mix(np.full((N, N, 3), (150, 30, 26.)), (238, 206, 190), fat * .9)
                c = mix(c, (92, 18, 14), np.clip((d - .78) * 5, 0, 1))
                c = mix(c, (190, 70, 30), np.clip((.35 - d) * 2, 0, 1) * .2)
                col = mix(col, c, m); height = np.maximum(height, (.64 + .05 * d ** 2) * (m > .5))
    save(name, col, height, 5)


def scatter(n, rmin, rmax, smin, smax, seed):
    g = np.random.default_rng(seed); out = []
    for _ in range(20000):
        if len(out) == n: break
        a, rr = g.random() * 2 * np.pi, rmin + (rmax - rmin) * np.sqrt(g.random())
        x, y, s = rr * np.cos(a), rr * np.sin(a), smin + g.random() * (smax - smin)
        if all(np.hypot(x - p, y - q) > (s + t) * .9 for p, q, t in out): out.append((x, y, s))
    return out


pizza('pizza_margherita', [('mozz', scatter(8, 0, .6, .13, .19, 3)), ('basil', scatter(5, .12, .6, .1, .13, 4))], 11)
pizza('pizza_diavola', [('mozz', scatter(6, 0, .58, .1, .15, 5)), ('salami', scatter(9, 0, .62, .13, .15, 6))], 21)

# Risotto: creamy beige with grain relief, parsley flecks and parmesan.
g = np.random.default_rng(31)
grain = np.zeros((N, N))
for _ in range(2600):
    cx, cy, a = g.random() * 2 - 1, g.random() * 2 - 1, g.random() * np.pi
    i0, j0 = int((cx + 1) / 2 * N), int((cy + 1) / 2 * N)
    sl = (slice(max(0, j0 - 14), min(N, j0 + 14)), slice(max(0, i0 - 14), min(N, i0 + 14)))
    lu = (u[sl] - cx) * np.cos(a) + (v[sl] - cy) * np.sin(a); lv = -(u[sl] - cx) * np.sin(a) + (v[sl] - cy) * np.cos(a)
    grain[sl] = np.maximum(grain[sl], np.clip(1 - (lu / .022) ** 2 - (lv / .011) ** 2, 0, 1) ** .5)
nr = noise(10, seed=32)
col = mix(np.full((N, N, 3), (230, 204, 150.)), (198, 164, 100), np.clip(nr - .35, 0, 1))
col = mix(col, (246, 232, 196), grain * .5)
herbs = np.clip((noise(140, 1, 33) - .86) * 12, 0, 1)
col = mix(col, (52, 98, 34), herbs * .9)
zest = np.clip((noise(120, 1, 34) - .9) * 12, 0, 1)
col = mix(col, (236, 196, 60), zest * .8)
save('risotto', col, .5 * grain + .25 * nr, 4)

# Tiramisu side: alternating savoiardi (soaked sponge) and mascarpone layers, cocoa on top.
t = (yy + .5) / N
layers = [(-1, .12, 'cocoa'), (.12, .40, 'cream'), (.40, .56, 'sponge'), (.56, .82, 'cream'), (.82, 2., 'sponge')]
ns, nc = noise(40, 3, 41), noise(12, 3, 42)
wav = .012 * np.sin(xx / N * 2 * np.pi * 3 + nc * 4)
col = np.zeros((N, N, 3)); height = np.zeros((N, N))
for a, b, kind in layers:
    m = ((t >= a + wav) & (t < b + wav)).astype(float)
    if kind == 'cream': c = mix(np.full((N, N, 3), (246, 236, 212.)), (226, 210, 178), nc * .6); h = .5 + .05 * nc
    elif kind == 'sponge':
        c = mix(np.full((N, N, 3), (150, 92, 46.)), (96, 54, 26), np.clip(ns * 1.3 - .2, 0, 1))
        c = mix(c, (196, 140, 80), np.clip((ns - .7) * 4, 0, 1) * .6); h = .3 + .4 * ns
    else: c = mix(np.full((N, N, 3), (88, 50, 30.)), (58, 32, 20), ns); h = .5 + .3 * ns
    col = col + c * m[..., None]; height = height + h * m
save('tiramisu_side', col, height, 4)
cocoa = noise(90, 3, 43)
save('tiramisu_top', mix(np.full((N, N, 3), (96, 56, 34.)), (54, 30, 18), cocoa), .4 + .6 * cocoa, 3)

# Majolica plate: tin-white glaze, painted terracotta rim band and a ramina hairline, slight brush wobble.
wob = .006 * (noise(14, 2, 61) - .5)
glz = mix(np.full((N, N, 3), (246, 243, 236.)), (236, 230, 218), noise(8, 3, 62) * .5)
band = np.clip((r - (.9 + wob)) / .008, 0, 1) * np.clip(((.975 + wob) - r) / .008, 0, 1)
line = np.clip(1 - np.abs(r - (.855 + wob)) / .0045, 0, 1)
glz = mix(glz, (180, 83, 47), band * (.88 + .12 * noise(40, 2, 63)))
glz = mix(glz, (94, 107, 46), line * .9)
save('plate', glz)

# Espresso crema: hazel with tiger striping and a pale centre.
nn = noise(20, 4, 51)
crema = mix(np.full((N, N, 3), (176, 112, 58.)), (110, 62, 30), np.clip(r * 1.1 + (nn - .5) * .8, 0, 1))
crema = mix(crema, (214, 166, 110), np.clip((.35 - r) * 3 + (nn - .5), 0, 1) * .6)
save('crema', crema, .5 + .3 * nn, 2)
