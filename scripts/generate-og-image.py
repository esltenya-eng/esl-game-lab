"""
Generates the static Open Graph / Twitter Card share image (public/og-image.png).

Runs entirely offline with Pillow + local system fonts -- no external
image CDN or generation API. Re-run after any brand/copy change:

    python3 scripts/generate-og-image.py
"""

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BG = (15, 23, 42)  # slate-900, matches the app's dark theme
ACCENT = (59, 130, 246)  # blue-500, matches the app's primary accent
INK = (255, 255, 255)
MUTED = (148, 163, 184)  # slate-400

FONT_DIR = "C:/Windows/Fonts"
title_font = ImageFont.truetype(f"{FONT_DIR}/segoeuib.ttf", 84)
tagline_font = ImageFont.truetype(f"{FONT_DIR}/segoeui.ttf", 34)
badge_font = ImageFont.truetype(f"{FONT_DIR}/segoeuib.ttf", 24)

img = Image.new("RGB", (WIDTH, HEIGHT), BG)
draw = ImageDraw.Draw(img)

# Subtle grid dots for texture, echoing a "game board" motif
for gx in range(60, WIDTH, 60):
    for gy in range(60, HEIGHT, 60):
        draw.ellipse([gx - 1, gy - 1, gx + 1, gy + 1], fill=(30, 41, 59))

# Accent bar
draw.rectangle([0, 0, 10, HEIGHT], fill=ACCENT)

# Badge
badge_text = "AI CLASSROOM GAME ENGINE"
draw.text((90, 120), badge_text, font=badge_font, fill=ACCENT)

# Title
draw.text((88, 170), "ESL Game Lab", font=title_font, fill=INK)

# Tagline
draw.text(
    (90, 300),
    "Find the perfect English classroom game",
    font=tagline_font,
    fill=MUTED,
)
draw.text(
    (90, 345),
    "in seconds. Built for elementary ESL teachers.",
    font=tagline_font,
    fill=MUTED,
)

# Simple "game tile" motif bottom-right, no external assets
tile_labels = ["A", "B", "C"]
tile_colors = [(59, 130, 246), (236, 72, 153), (16, 185, 129)]
tile_size = 96
start_x = WIDTH - 90 - (tile_size + 20) * len(tile_labels)
for i, (label, color) in enumerate(zip(tile_labels, tile_colors)):
    x0 = start_x + i * (tile_size + 20)
    y0 = HEIGHT - 170
    draw.rounded_rectangle(
        [x0, y0, x0 + tile_size, y0 + tile_size], radius=16, fill=color
    )
    bbox = draw.textbbox((0, 0), label, font=title_font)
    lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        (x0 + (tile_size - lw) / 2, y0 + (tile_size - lh) / 2 - bbox[1]),
        label,
        font=title_font,
        fill=INK,
    )

img.save("public/og-image.png", "PNG", optimize=True)
print("Wrote public/og-image.png")
