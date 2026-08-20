"""
Generates public/favicon.ico locally with Pillow -- no external favicon
generator service. Re-run after any brand color change:

    python3 scripts/generate-favicon.py
"""

from PIL import Image, ImageDraw, ImageFont

SIZE = 256
BG = (59, 130, 246)  # blue-500, matches the app's primary accent
INK = (255, 255, 255)

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=56, fill=BG)

font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 168)
label = "E"
bbox = draw.textbbox((0, 0), label, font=font)
lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
draw.text(
    ((SIZE - lw) / 2 - bbox[0], (SIZE - lh) / 2 - bbox[1]),
    label,
    font=font,
    fill=INK,
)

img.save(
    "public/favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print("Wrote public/favicon.ico")
