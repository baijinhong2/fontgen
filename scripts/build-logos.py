"""
Generate logo variants for FontGen.art — preview only, not yet applied.
Run: python3 scripts/build-logos.py

Each variant uses an actual Unicode font character from the same set
that the FontGen.art tool generates, so the logo visually echoes the
product ("fancy Unicode text"). Glyphs are rendered with STIXTwoMath
(the only macOS-shipped font that covers Mathematical Alphanumeric
Symbols U+1D400-1D7FF) and decorative symbols use Apple Symbols.

Variants (8 total):
  A. Bold Script 𝓕 — violet→pink gradient, sparkle corner
  B. Fraktur 𝔉 — deep midnight→violet, diamond accents
  C. Italic 𝑭 — peach→orange, sparkle trail
  D. Monogram 𝓕𝓰 — cyan→violet, centered dot accent
  E. Modern 𝐅 — white card, thick violet ring, ultra-clean
  F. Bold Script on black — high-contrast dramatic
  G. Bold Script rainbow — full color spectrum overlay
  H. Italic 𝑭 with flourish — pink→violet, layered underline curve
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

OUT_DIR = "/tmp/logo-preview"
os.makedirs(OUT_DIR, exist_ok=True)

# Output sizes
HERO = 1024
TILE = 96
FAVI = 64

# Fonts
FONT_GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
FONT_GEORGIA_BOLDITAL = "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf"
FONT_GEORGIA_REG = "/System/Library/Fonts/Supplemental/Georgia.ttf"
FONT_MATH = "/System/Library/Fonts/Supplemental/STIXTwoMath.otf"
FONT_SYMBOLS = "/System/Library/Fonts/Apple Symbols.ttf"

WHITE = (255, 255, 255)
INK = (24, 24, 27)
INK_SOFT = (82, 82, 91)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def linear_gradient(size, c1, c2, angle_deg=135):
    w, h = size
    img = Image.new("RGB", size, c1)
    px = img.load()
    rad = math.radians(angle_deg)
    dx, dy = math.cos(rad), math.sin(rad)
    denom = w * abs(dx) + h * abs(dy)
    for y in range(h):
        for x in range(w):
            t = ((x * dx + y * dy) / denom) if denom > 0 else 0
            t = max(0, min(1, t))
            px[x, y] = (
                int(c1[0] * (1 - t) + c2[0] * t),
                int(c1[1] * (1 - t) + c2[1] * t),
                int(c1[2] * (1 - t) + c2[2] * t),
            )
    return img


def radial_glow(size, c_inner_rgba, cx=0.5, cy=0.5):
    """Soft radial overlay for highlight glow."""
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    cx_p, cy_p = int(cx * w), int(cy * h)
    max_r = math.hypot(max(cx_p, w - cx_p), max(cy_p, h - cy_p))
    inner = c_inner_rgba
    for y in range(h):
        for x in range(w):
            r = math.hypot(x - cx_p, y - cy_p) / max_r
            r = max(0, min(1, r))
            px[x, y] = (inner[0], inner[1], inner[2], int(inner[3] * (1 - r)))
    return img


def rounded_mask(size, radius):
    w, h = size
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    return mask


def draw_glyph_with_shadow(base_img, glyph, size, fill, font_path=FONT_MATH,
                            font_ratio=0.62, shadow_offset=(4, 6), shadow_alpha=80,
                            shadow_blur=8):
    """Draw a math glyph centered on the image with a soft drop shadow."""
    draw = ImageDraw.Draw(base_img)
    font = ImageFont.truetype(font_path, int(size * font_ratio))
    bbox = draw.textbbox((0, 0), glyph, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx, cy = (size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]

    # Shadow
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text((cx + shadow_offset[0], cy + shadow_offset[1]),
            glyph, font=font, fill=(0, 0, 0, shadow_alpha))
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_blur))
    base_img.alpha_composite(shadow)
    # Glyph
    draw = ImageDraw.Draw(base_img)
    draw.text((cx, cy), glyph, font=font, fill=fill)


def draw_accent_glyph(layer, glyph, x_pct, y_pct, size, color_rgba,
                      font_path=FONT_SYMBOLS, font_ratio=0.10):
    """Place a decorative symbol at a percent position."""
    draw = ImageDraw.Draw(layer)
    font = ImageFont.truetype(font_path, int(size * font_ratio))
    bbox = draw.textbbox((0, 0), glyph, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = int(size * x_pct) - bbox[0]
    y = int(size * y_pct) - bbox[1]
    draw.text((x, y), glyph, font=font, fill=color_rgba)


def apply_rounded_mask(img, radius):
    mask = rounded_mask(img.size, radius)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0))
    out.putalpha(mask)
    return out


# ----- Variant A: Bold Script on violet→pink with sparkle -----
def variant_a(size=HERO):
    bg = linear_gradient((size, size), hex_to_rgb("#a78bfa"), hex_to_rgb("#ec4899"), 135)
    out = Image.alpha_composite(bg.convert("RGBA"),
                                 radial_glow((size, size), (255, 255, 255, 80), 0.3, 0.2)).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))
    draw_glyph_with_shadow(out, "𝓕", size, WHITE)
    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_accent_glyph(accent, "★", 0.78, 0.18, size, (255, 255, 255, 230))
    draw_accent_glyph(accent, "☆", 0.86, 0.30, size, (255, 255, 255, 150), font_ratio=0.06)
    return Image.alpha_composite(out, accent)


# ----- Variant B: Fraktur on midnight gradient -----
def variant_b(size=HERO):
    bg = linear_gradient((size, size), hex_to_rgb("#0f0a2e"), hex_to_rgb("#5b21b6"), 160)
    out = Image.alpha_composite(bg.convert("RGBA"),
                                 radial_glow((size, size), (167, 139, 250, 120), 0.7, 0.3)).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))
    draw_glyph_with_shadow(out, "𝔉", size, (245, 230, 255),
                           font_ratio=0.58, shadow_alpha=100, shadow_blur=10)
    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_accent_glyph(accent, "◆", 0.78, 0.20, size, (167, 139, 250, 220), font_ratio=0.07)
    draw_accent_glyph(accent, "◆", 0.22, 0.78, size, (167, 139, 250, 180), font_ratio=0.06)
    draw_accent_glyph(accent, "★", 0.86, 0.32, size, (255, 255, 255, 200), font_ratio=0.05)
    return Image.alpha_composite(out, accent)


# ----- Variant C: Italic on warm peach→orange -----
def variant_c(size=HERO):
    bg = linear_gradient((size, size), hex_to_rgb("#fda4af"), hex_to_rgb("#fb923c"), 135)
    out = Image.alpha_composite(bg.convert("RGBA"),
                                 radial_glow((size, size), (255, 255, 255, 110), 0.4, 0.3)).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))
    draw_glyph_with_shadow(out, "𝑭", size, (255, 247, 237),
                           font_ratio=0.56, shadow_offset=(3, 5), shadow_alpha=70)
    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # Sparkle trail
    draw_accent_glyph(accent, "★", 0.78, 0.22, size, (255, 255, 255, 230), font_ratio=0.09)
    draw_accent_glyph(accent, "☆", 0.86, 0.30, size, (255, 255, 255, 180), font_ratio=0.06)
    draw_accent_glyph(accent, "★", 0.20, 0.78, size, (255, 255, 255, 200), font_ratio=0.07)
    return Image.alpha_composite(out, accent)


# ----- Variant D: Monogram "𝓕𝓰" on cyan→violet -----
def variant_d(size=HERO):
    bg = linear_gradient((size, size), hex_to_rgb("#06b6d4"), hex_to_rgb("#7c3aed"), 135)
    out = Image.alpha_composite(bg.convert("RGBA"),
                                 radial_glow((size, size), (255, 255, 255, 80), 0.5, 0.5)).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))
    draw_glyph_with_shadow(out, "𝓕𝓰", size, WHITE, font_ratio=0.55)
    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # Centered dot above
    d = ImageDraw.Draw(accent)
    dot_r = int(size * 0.018)
    d.ellipse((size // 2 - dot_r, int(size * 0.18) - dot_r,
               size // 2 + dot_r, int(size * 0.18) + dot_r),
              fill=(255, 255, 255, 220))
    return Image.alpha_composite(out, accent)


# ----- Variant E: Modern clean — bold sans on white with thick ring -----
def variant_e(size=HERO):
    bg = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse((size * 0.04, size * 0.04, size * 0.96, size * 0.96),
               outline=hex_to_rgb("#7c3aed") + (255,), width=int(size * 0.07))
    out = Image.alpha_composite(bg, ring)
    out = apply_rounded_mask(out, int(size * 0.22))
    draw_glyph_with_shadow(out, "𝐅", size, hex_to_rgb("#7c3aed"),
                           font_ratio=0.52, shadow_alpha=0)
    return out


# ----- Variant F: Bold Script on black — high-contrast dramatic -----
def variant_f(size=HERO):
    bg = Image.new("RGB", (size, size), hex_to_rgb("#0a0a0f"))
    # Add subtle violet glow
    glow = radial_glow((size, size), (124, 58, 237, 110), 0.5, 0.6)
    out = Image.alpha_composite(bg.convert("RGBA"), glow).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))
    # Glow behind glyph
    halo = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_glyph_with_shadow(halo, "𝓕", size, hex_to_rgb("#a78bfa"),
                           font_ratio=0.60, shadow_offset=(0, 0), shadow_alpha=180,
                           shadow_blur=40)
    out = Image.alpha_composite(out, halo)
    draw_glyph_with_shadow(out, "𝓕", size, (255, 255, 255),
                           font_ratio=0.60, shadow_alpha=0)
    # Sparkles
    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_accent_glyph(accent, "★", 0.18, 0.20, size, (167, 139, 250, 240), font_ratio=0.08)
    draw_accent_glyph(accent, "★", 0.84, 0.74, size, (244, 114, 182, 220), font_ratio=0.06)
    draw_accent_glyph(accent, "★", 0.82, 0.22, size, (255, 255, 255, 200), font_ratio=0.05)
    return Image.alpha_composite(out, accent)


# ----- Variant G: Bold Script with rainbow overlay -----
def variant_g(size=HERO):
    bg = linear_gradient((size, size), hex_to_rgb("#1e1b4b"), hex_to_rgb("#0f172a"), 135)
    out = Image.alpha_composite(bg.convert("RGBA"),
                                 radial_glow((size, size), (255, 255, 255, 60), 0.5, 0.5)).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))

    # Render glyph with vertical rainbow stripes overlay (top to bottom)
    # Approach: render glyph as solid white, then mask with rainbow gradient
    glyph_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_glyph_with_shadow(glyph_layer, "𝓕", size, WHITE,
                           font_ratio=0.60, shadow_alpha=0)

    # Rainbow gradient (top to bottom)
    rainbow = linear_gradient((size, size), hex_to_rgb("#f43f5e"),
                              hex_to_rgb("#a855f7"), 90)
    rainbow = Image.alpha_composite(rainbow.convert("RGBA"),
                                     Image.new("RGBA", (size, size), (255, 255, 255, 255))).convert("RGB")
    rainbow_rgba = rainbow.convert("RGBA")

    # Mask rainbow with glyph alpha
    glyph_alpha = glyph_layer.split()[3]
    rainbow_masked = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rainbow_masked.paste(rainbow_rgba, (0, 0), glyph_alpha)
    out = Image.alpha_composite(out, rainbow_masked)

    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_accent_glyph(accent, "★", 0.78, 0.20, size, (255, 255, 255, 230), font_ratio=0.08)
    return Image.alpha_composite(out, accent)


# ----- Variant H: Italic with layered flourish -----
def variant_h(size=HERO):
    bg = linear_gradient((size, size), hex_to_rgb("#fb7185"), hex_to_rgb("#7c3aed"), 135)
    out = Image.alpha_composite(bg.convert("RGBA"),
                                 radial_glow((size, size), (255, 255, 255, 90), 0.5, 0.3)).convert("RGB")
    out = apply_rounded_mask(out, int(size * 0.22))
    # Italic F
    draw_glyph_with_shadow(out, "𝑭", size, (255, 255, 255),
                           font_ratio=0.55, shadow_alpha=70)
    # Flourish: a script "g" overlaid small bottom-right
    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_glyph_with_shadow(accent, "𝓰", size, (255, 255, 255, 180),
                           font_ratio=0.32, shadow_alpha=0, font_path=FONT_MATH)
    # Sparkle dots
    draw_accent_glyph(accent, "★", 0.78, 0.22, size, (255, 255, 255, 230), font_ratio=0.08)
    draw_accent_glyph(accent, "☆", 0.86, 0.30, size, (255, 255, 255, 170), font_ratio=0.05)
    return Image.alpha_composite(out, accent)


def make_comparison(variants):
    pad = 40
    label_h = 60
    tile = 280
    sheet_w = pad * 2 + tile * len(variants) + (len(variants) - 1) * pad
    sheet_h = pad * 2 + tile + label_h
    sheet = Image.new("RGB", (sheet_w, sheet_h), (250, 250, 252))
    draw = ImageDraw.Draw(sheet)
    label_font = ImageFont.truetype(FONT_GEORGIA_REG, 18)

    for i, (label, logo) in enumerate(variants):
        x = pad + i * (tile + pad)
        y = pad
        tile_img = logo.resize((tile, tile), Image.LANCZOS)
        sheet.paste(tile_img, (x, y), tile_img)
        bbox = draw.textbbox((0, 0), label, font=label_font)
        tw = bbox[2] - bbox[0]
        draw.text((x + (tile - tw) // 2, y + tile + 12), label,
                  font=label_font, fill=INK_SOFT)
    return sheet


def main():
    variants_data = [
        ("A. Bold Script",          variant_a),
        ("B. Fraktur",              variant_b),
        ("C. Italic",               variant_c),
        ("D. Monogram Fg",          variant_d),
        ("E. Modern Clean",         variant_e),
        ("F. Black Drama",          variant_f),
        ("G. Rainbow",              variant_g),
        ("H. Italic Flourish",      variant_h),
    ]
    print(f"Generating {len(variants_data)} logo variants...")
    for name, fn in variants_data:
        slug = name.split(".")[0].strip()
        slug = slug.lower().replace(" ", "-")
        hero_path = os.path.join(OUT_DIR, f"logo-{slug}-1024.png")
        fn(HERO).save(hero_path, "PNG")
        fn(FAVI).save(os.path.join(OUT_DIR, f"logo-{slug}-64.png"), "PNG")
        # Header-size with wordmark
        mark = fn(96)
        canvas = Image.new("RGBA", (520, 96), (255, 255, 255, 0))
        canvas.paste(mark, (0, 0), mark)
        wd = ImageDraw.Draw(canvas)
        wm_font = ImageFont.truetype(FONT_GEORGIA_BOLD, 36)
        wd.text((112, 18), "FontGen", font=wm_font, fill=hex_to_rgb("#18181b"))
        dot_font = ImageFont.truetype(FONT_GEORGIA_REG, 18)
        wd.text((232, 32), ".art", font=dot_font, fill=hex_to_rgb("#71717a"))
        canvas.save(os.path.join(OUT_DIR, f"header-{slug}.png"), "PNG")
        print(f"  ✓ {hero_path}")

    sheet = make_comparison([(name, fn()) for name, fn in variants_data])
    sheet_path = os.path.join(OUT_DIR, "all-variants-compare.png")
    sheet.save(sheet_path, "PNG")
    print(f"\nComparison: {sheet_path} ({sheet.size[0]}x{sheet.size[1]})")


if __name__ == "__main__":
    main()