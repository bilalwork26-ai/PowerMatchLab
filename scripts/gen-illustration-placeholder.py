#!/usr/bin/env python3
"""
Generates one "illustrative placeholder" PNG per product entry in a JSON
manifest, written to public/illustrations/<id>.png.

This is NOT a photograph and NOT an attempt at any manufacturer's real
industrial design — it is a neutral, on-brand card (PowerMatchLab's own
navy/cyan palette) with a generic, abstract power-station glyph, the
product's own brand/model text, and an explicit "ILLUSTRATIVE PLACEHOLDER"
label baked directly into the image. Every product gets its own distinct
file (the brand/model text differs per product), so no two different
products can ever end up pointing at the same specific illustration.

Usage:
    python3 scripts/gen-illustration-placeholder.py manifest.json public/illustrations

manifest.json: a JSON array of {"id": ..., "brand": ..., "model": ...,
"size_class": "compact" | "mid-size" | "large" | "whole-home backup"}.
"""
import sys
import json
from PIL import Image, ImageDraw, ImageFont

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

NAVY_900 = (11, 31, 58, 255)
NAVY_700 = (34, 55, 92, 255)
NAVY_400 = (114, 144, 188, 255)
CYAN_300 = (103, 232, 249, 255)
CYAN_400 = (34, 211, 238, 255)
WHITE = (255, 255, 255, 255)
BAND_BG = (6, 20, 40, 235)

W, H = 1024, 1024


def generate(out_path: str, brand: str, model: str, size_class: str):
    img = Image.new("RGBA", (W, H), NAVY_900)

    # Faint decorative glow — no specific product shape.
    for r, alpha in [(420, 10), (300, 14), (180, 18)]:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([W / 2 - r, H * 0.32 - r, W / 2 + r, H * 0.32 + r], fill=(34, 211, 238, alpha))
        img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Generic abstract "device" glyph: rounded box + carry-handle arc +
    # screen rectangle + three outlet dots. Deliberately generic — not a
    # rendering of any specific manufacturer's industrial design.
    body_w, body_h = 420, 300
    body_x0 = (W - body_w) / 2
    body_y0 = H * 0.30
    body_x1 = body_x0 + body_w
    body_y1 = body_y0 + body_h

    handle_r = 70
    draw.arc(
        [W / 2 - handle_r, body_y0 - handle_r * 1.3, W / 2 + handle_r, body_y0 + handle_r * 0.5],
        start=200, end=340, fill=NAVY_400, width=14,
    )
    draw.rounded_rectangle([body_x0, body_y0, body_x1, body_y1], radius=36,
                            fill=NAVY_700, outline=CYAN_400, width=4)

    screen_w, screen_h = 150, 90
    screen_x0 = W / 2 - screen_w / 2
    screen_y0 = body_y0 + 46
    draw.rounded_rectangle([screen_x0, screen_y0, screen_x0 + screen_w, screen_y0 + screen_h],
                            radius=10, fill=NAVY_900, outline=CYAN_300, width=3)

    bolt_cx, bolt_cy = W / 2, screen_y0 + screen_h / 2
    bolt = [
        (bolt_cx - 8, bolt_cy - 30), (bolt_cx + 14, bolt_cy - 30), (bolt_cx - 2, bolt_cy - 2),
        (bolt_cx + 16, bolt_cy - 2), (bolt_cx - 16, bolt_cy + 32), (bolt_cx - 2, bolt_cy + 2),
        (bolt_cx - 20, bolt_cy + 2),
    ]
    draw.polygon(bolt, fill=CYAN_300)

    dot_y = body_y1 - 46
    for dx in (-90, 0, 90):
        draw.ellipse([W / 2 + dx - 16, dot_y - 16, W / 2 + dx + 16, dot_y + 16],
                     fill=NAVY_900, outline=NAVY_400, width=3)

    brand_font = ImageFont.truetype(FONT_BOLD, 52)
    model_font = ImageFont.truetype(FONT_REG, 40)
    class_font = ImageFont.truetype(FONT_REG, 26)

    def center_text(text, font, y, fill):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((W / 2 - tw / 2, y), text, font=font, fill=fill)

    center_text(brand.upper(), brand_font, body_y1 + 44, WHITE)
    center_text(model, model_font, body_y1 + 110, CYAN_300)
    center_text(f"{size_class} class — illustrative size grouping", class_font, body_y1 + 168, NAVY_400)

    band_h = 84
    draw.rectangle([0, H - band_h, W, H], fill=BAND_BG)
    label_font = ImageFont.truetype(FONT_BOLD, 30)
    sub_font = ImageFont.truetype(FONT_REG, 20)
    center_text("ILLUSTRATIVE PLACEHOLDER", label_font, H - band_h + 12, WHITE)
    center_text("Not a photograph of this or any specific product", sub_font, H - band_h + 50, NAVY_400)

    img.convert("RGBA").save(out_path, "PNG")
    print(f"wrote {out_path} {img.size}")


if __name__ == "__main__":
    manifest_path = sys.argv[1]
    out_dir = sys.argv[2]
    with open(manifest_path) as f:
        items = json.load(f)
    for it in items:
        generate(f"{out_dir}/{it['id']}.png", it["brand"], it["model"], it["size_class"])
