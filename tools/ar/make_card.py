"""Draws the table-card tracking target (public/ar/cartao-alvo.png, printed 10 x 10 cm).

Run: python tools/ar/make_card.py  then  node tools/ar/compile-target.mjs  (writes public/ar/cartao.mind).
The photo gives the tracker dense, non-repeating detail; the frame and wordmark keep it on brand.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
S = 1000
GLAZE, CLAY, RAMINA, INK = (248, 247, 244), (180, 83, 47), (94, 107, 46), (42, 36, 32)

card = Image.new('RGB', (S, S), GLAZE)
d = ImageDraw.Draw(card)
d.rectangle([14, 14, S - 15, S - 15], outline=CLAY, width=14)
d.rectangle([44, 44, S - 45, S - 45], outline=CLAY, width=3)

photo = Image.open(ROOT / 'public/images/dishes/pizza-margherita.webp').convert('RGB')
photo = ImageOps.fit(photo, (760, 560), centering=(0.42, 0.5))
card.paste(photo, (120, 170))
d.rectangle([118, 168, 881, 731], outline=INK, width=3)

# Corner majolica marks, each rotated differently so the target has no symmetry.
def flower(cx, cy, r, rot):
    for k in range(4):
        import math
        a = rot + k * math.pi / 2
        x, y = cx + math.cos(a) * r, cy + math.sin(a) * r
        d.ellipse([x - r * .45, y - r * .45, x + r * .45, y + r * .45], fill=RAMINA if k % 2 else CLAY)
    d.ellipse([cx - r * .35, cy - r * .35, cx + r * .35, cy + r * .35], fill=CLAY)
flower(96, 96, 22, 0.0); flower(S - 96, 96, 18, 0.4); flower(96, S - 96, 26, 0.8); flower(S - 96, S - 96, 15, 1.2)

serif = ImageFont.truetype(str(HERE / 'BodoniModa.ttf'), 92)
sans = ImageFont.truetype(str(HERE / 'Schibsted.ttf'), 40)
d.text((S / 2, 112), 'Casa Nostra', font=serif, fill=INK, anchor='mm')
d.text((S / 2, 800), 'Aponte a câmera para este cartão', font=sans, fill=INK, anchor='mm')
d.text((S / 2, 862), 'o prato aparece aqui, no tamanho real', font=sans, fill=CLAY, anchor='mm')

out = ROOT / 'public/ar/cartao-alvo.png'
card.save(out, optimize=True)
print('wrote', out)
