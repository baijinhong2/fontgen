"""
Generate FontGen.art favicon, OG, and logo assets — all using the
canonical "Variant A" brand mark:

   Variant A — Bold Script 𝓕 on a violet→pink gradient with a sparkle
   accent. Chosen as the brand mark because it visually echoes the
   product (the tool outputs Unicode characters; the logo IS one) and
   it scales cleanly from 16×16 favicon to 1200×630 OG card. Warm,
   friendly, on-message for a "fancy text" utility.

Produces:
  public/logo.png                  — 256×256 mark for header/footer use
  public/favicon.ico              — multi-size ICO (16, 32, 48, 64)
  public/favicon-16x16.png        — 16×16 PNG
  public/favicon-32x32.png        — 32×32 PNG
  public/favicon-48x48.png        — 48×48 PNG
  public/favicon-64x64.png        — 64×64 PNG
  public/apple-touch-icon.png     — 180×180 PNG
  public/og.png                   — 1200×630 OG card

At small sizes (<= 64px) we strip the decorative accents — they collapse
into noise. At large sizes (180+, OG) the full mark with sparkle accents
renders.
"""

import math
import os
import struct
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont, ImageFilter

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Fonts
FONT_GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
FONT_GEORGIA_REG = "/System/Library/Fonts/Supplemental/Georgia.ttf"
# STIXTwoMath is the only macOS font covering Mathematical Alphanumeric
# Symbols (U+1D400-1D7FF) — where the Fraktur / Script / Sans-serif
# fancy letters live.
FONT_MATH = "/System/Library/Fonts/Supplemental/STIXTwoMath.otf"
# Apple Symbols renders the diamond/star accents.
FONT_SYMBOLS = "/System/Library/Fonts/Apple Symbols.ttf"

# Brand palette — Variant A: violet → pink gradient
SOFT_VIOLET = (167, 139, 250)          # #a78bfa
HOT_PINK = (236, 72, 153)               # #ec4899
ACCENT_VIOLET = (124, 58, 237)          # #7c3aed
ACCENT_PINK = (244, 114, 182)           # #f472b4
WHITE = (255, 255, 255)
INK = (15, 23, 42)
INK_SOFT = (71, 85, 105)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def linear_gradient(size, c1, c2, angle_deg=160):
    """Generate a linear gradient as RGBA so alpha_composite works."""
    w, h = size
    img = Image.new("RGBA", size, c1 + (255,) if len(c1) == 3 else c1)
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
                255,
            )
    return img


def radial_glow(size, c_inner_rgba, cx=0.5, cy=0.5):
    """Soft radial overlay for highlight glow."""
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    cx_p, cy_p = int(cx * w), int(cy * h)
    max_r = math.hypot(max(cx_p, w - cx_p), max(cy_p, h - cy_p))
    for y in range(h):
        for x in range(w):
            r = math.hypot(x - cx_p, y - cy_p) / max_r
            r = max(0, min(1, r))
            px[x, y] = (c_inner_rgba[0], c_inner_rgba[1], c_inner_rgba[2],
                        int(c_inner_rgba[3] * (1 - r)))
    return img


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1),
                                            radius=radius, fill=255)
    return mask


def variant_a_mark(size, with_accents=True):
    """
    The canonical FontGen.art brand mark — Bold Script 𝓕 on a violet→pink
    gradient with a sparkle accent. `with_accents` toggles the sparkle;
    off for favicon sizes (clutter at small sizes).
    """
    # Background: violet → pink gradient
    bg = linear_gradient((size, size), SOFT_VIOLET, HOT_PINK, 135)
    # Soft white glow on the upper-left
    if size >= 96:
        bg = Image.alpha_composite(
            bg, radial_glow((size, size), (255, 255, 255, 80), 0.3, 0.2)
        )
    out = bg.convert("RGB")

    # Rounded-square mask (radius ~22% of size — same proportion as
    # every modern iOS / macOS app icon)
    out = Image.composite(out, Image.new("RGB", (size, size), (0, 0, 0)),
                          rounded_mask(size, int(size * 0.22)))
    out = out.convert("RGBA")

    # Bold Script glyph 𝓕 — the brand mark itself. White fill so it
    # pops against the saturated gradient.
    draw = ImageDraw.Draw(out)
    font_size = int(size * (0.62 if with_accents else 0.66))
    font = ImageFont.truetype(FONT_MATH, font_size)
    glyph = "𝓕"
    bbox = draw.textbbox((0, 0), glyph, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx = (size - tw) / 2 - bbox[0]
    cy = (size - th) / 2 - bbox[1]

    # Drop shadow for depth
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text((cx + 4, cy + 6), glyph, font=font, fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(2, size // 100)))
    out = Image.alpha_composite(shadow, out)

    # Glyph itself
    draw = ImageDraw.Draw(out)
    draw.text((cx, cy), glyph, font=font, fill=WHITE)

    # Sparkle accent (★) — only at large sizes where it reads clearly.
    if with_accents and size >= 96:
        accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        ad = ImageDraw.Draw(accent)
        sp_font = ImageFont.truetype(FONT_SYMBOLS, int(size * 0.10))
        sp = "✦"
        sp_bbox = ad.textbbox((0, 0), sp, font=sp_font)
        ad.text((int(size * 0.78) - sp_bbox[0], int(size * 0.18) - sp_bbox[1]),
                sp, font=sp_font, fill=(255, 255, 255, 230))
        # Tiny secondary sparkle
        sp2_font = ImageFont.truetype(FONT_SYMBOLS, int(size * 0.06))
        sp2 = "✧"
        sp2_bbox = ad.textbbox((0, 0), sp2, font=sp2_font)
        ad.text((int(size * 0.86) - sp2_bbox[0], int(size * 0.30) - sp2_bbox[1]),
                sp2, font=sp2_font, fill=(255, 255, 255, 150))
        out = Image.alpha_composite(out, accent)

    return out


# ---------------------------------------------------------------------------
# ICO writer — hand-stitched multi-size file (Pillow 12.x ships only one
# entry per .ico via append_images, so we build the directory manually)
# ---------------------------------------------------------------------------

def _write_multi_size_ico(path, entries):
    """
    entries: list of (png_bytes, w, h)
    """
    n = len(entries)
    header_size = 6 + 16 * n
    out = bytearray()
    out += struct.pack("<HHH", 0, 1, n)
    cur_offset = header_size
    entry_records = []
    for png_bytes, w, h in entries:
        size_field = 0 if w >= 256 else w
        height_field = 0 if h >= 256 else h
        entry_records.append(
            struct.pack(
                "<BBBBHHII",
                size_field,
                height_field,
                0,
                0,
                1,
                32,
                len(png_bytes),
                cur_offset,
            )
        )
        cur_offset += len(png_bytes)
    for rec in entry_records:
        out += rec
    for png_bytes, _, _ in entries:
        out += png_bytes
    with open(path, "wb") as f:
        f.write(bytes(out))


# ---------------------------------------------------------------------------
# Favicon + apple-touch-icon assets
# ---------------------------------------------------------------------------

def make_favicon_assets():
    """Render Variant A at every size and write PNGs + multi-size ICO."""
    sizes = [16, 32, 48, 64]
    pngs = []
    for s in sizes:
        # No decorative accents at favicon sizes — they'd be invisible noise
        tile = variant_a_mark(s, with_accents=False)
        png_path = os.path.join(PUBLIC_DIR, f"favicon-{s}x{s}.png")
        tile.save(png_path, format="PNG")
        pngs.append(tile)
        print(f"  ✓ favicon-{s}x{s}.png")

    # Multi-size ICO
    ico_entries = []
    for img in pngs:
        buf = BytesIO()
        img.save(buf, format="PNG")
        ico_entries.append((buf.getvalue(), img.width, img.height))
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    _write_multi_size_ico(ico_path, ico_entries)
    print(f"  ✓ favicon.ico ({len(ico_entries)} sizes)")

    # Apple touch icon — 180×180 with full accents
    apple = variant_a_mark(180, with_accents=True)
    apple_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple.save(apple_path, format="PNG")
    print(f"  ✓ apple-touch-icon.png")

    # Header/footer logo — 256×256 with full accents
    logo = variant_a_mark(256, with_accents=True)
    logo_path = os.path.join(PUBLIC_DIR, "logo.png")
    logo.save(logo_path, format="PNG")
    print(f"  ✓ logo.png (256×256)")


# ---------------------------------------------------------------------------
# OG card — uses the same Variant B mark embedded as the logo badge
# ---------------------------------------------------------------------------

def make_og_card():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), (250, 250, 252, 255))
    draw = ImageDraw.Draw(img)

    # Decorative gradient blob on the right (uses Variant A's palette)
    blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(blob)
    cx, cy, r = int(W * 0.85), int(H * 0.4), 280
    for i in range(r, 0, -1):
        t = i / r
        alpha = int(60 * (1 - t))
        col = (
            int(SOFT_VIOLET[0] * t + HOT_PINK[0] * (1 - t)),
            int(SOFT_VIOLET[1] * t + HOT_PINK[1] * (1 - t)),
            int(SOFT_VIOLET[2] * t + HOT_PINK[2] * (1 - t)),
            alpha,
        )
        bdraw.ellipse((cx - i, cy - i, cx + i, cy + i), fill=col)
    img = Image.alpha_composite(img, blob)

    # Brand mark (left) — Variant A at 160px
    badge_size = 160
    badge_x, badge_y = 100, 130
    badge = variant_a_mark(badge_size, with_accents=True)
    img.paste(badge, (badge_x, badge_y), badge)

    draw = ImageDraw.Draw(img)

    # Wordmark "FontGen" + ".art"
    word_font = _safe_font(96, bold=True)
    if word_font:
        draw.text((badge_x + badge_size + 30, badge_y + 18),
                  "FontGen", font=word_font, fill=INK)
        sub_font = _safe_font(48, bold=False)
        if sub_font:
            draw.text((badge_x + badge_size + 30, badge_y + 110),
                      ".art", font=sub_font, fill=INK_SOFT)

    # Headline + tagline
    title_font = _safe_font(72, bold=True)
    if title_font:
        draw.text((100, 340), "Free Font Generator",
                  font=title_font, fill=INK)
    tag_font = _safe_font(34, bold=False)
    if tag_font:
        draw.text((100, 440),
                  "Type once. Get 100+ fancy fonts. Copy and paste anywhere.",
                  font=tag_font, fill=INK_SOFT)

    # Sample preview band — render with STIXTwoMath so the fancy Unicode
    # actually renders (Arial can't render Mathematical Alphanumeric
    # Symbols, so the samples used to come out as tofu boxes).
    sample_y = 520
    samples = [
        ("Bold", "𝐇𝐞𝐥𝐥𝐨"),
        ("Cursive", "𝒽𝑒𝓁𝓁𝑜"),
        ("Gothic", "ℌ𝑒𝓁𝓁𝑜"),
        ("Bubble", "Ⓗⓔⓛⓛⓞ"),
    ]
    cur_x = 100
    sample_font = ImageFont.truetype(FONT_MATH, 48)
    label_font = _safe_font(20, bold=False)
    for label, text in samples:
        draw.text((cur_x, sample_y), text, font=sample_font, fill=INK)
        if label_font:
            draw.text((cur_x, sample_y + 60), label, font=label_font, fill=INK_SOFT)
        cur_x += int(len(text) * 28) + 80

    out_path = os.path.join(PUBLIC_DIR, "og.png")
    img.convert("RGB").save(out_path, format="PNG", optimize=True)
    print(f"  ✓ og.png (1200×630)")


def _safe_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
            else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/SFNSDisplay.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


if __name__ == "__main__":
    print("[assets] generating brand assets (Variant A — Bold Script)...")
    make_favicon_assets()
    make_og_card()
    print("[assets] done →", PUBLIC_DIR)