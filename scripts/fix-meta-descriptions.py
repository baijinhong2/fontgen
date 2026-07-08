#!/usr/bin/env python3
"""
Apply meta-description fixes to /fonts/* (47 pages) and /for/discord (1 page).

Strategy:
  - Replace internal styleSlug leak ("sans-bold-italic fancy letters",
    "bold-fraktur fancy letters", etc.) with a human-readable adjective
    that matches what the user actually sees when they paste.
  - Use a consistent template across all /fonts/* pages so future additions
    follow the same shape.
  - Char count must stay ≤ 160 (Google meta-description display limit).
"""

import json
import sys
from pathlib import Path

MESSAGES_PATH = Path(__file__).resolve().parent.parent / "messages" / "en.json"

# ---------------------------------------------------------------------------
# styleSlug → human adjective. Keep the natural-language reads whenever the
# mapper name itself reads well (cursive, bold, italic, bubble, cyrillic…),
# and rewrite the names that read like internal jargon.
# ---------------------------------------------------------------------------
ADJECTIVE = {
    "cursive":         "cursive",
    "bold":            "bold",
    "italic":          "italic",
    "fraktur":         "gothic",            # fraktur is German for "gothic"
    "bold-fraktur":    "bold gothic",
    "bold-cursive":    "bold cursive",
    "bubble":          "bubble",
    "squared":         "block-style",       # squared is mapper-jargon
    "small-caps":      "small-cap",         # typography jargon
    "sans-italic":     "clean italic",      # sans-italic is Unicode block name
    "sans-bold-italic": "bold italic",      # Unicode block name
    "sans-serif":      "sans-serif",        # known typography term, keep
    "heart":           "heart-decorated",   # "heart letters" reads oddly alone
    "cyrillic":        "cyrillic",
    "currency":        "currency-symbol",   # "currency letters" is vague
    "wave":            "wavy",              # noun → adjective reads better
    "macron":          "macron",
    "fullwidth":       "full-width",        # fullwidth is programmer term
    "freaky":          "freaky",
}

# Page slug → (display keyword used at the start of the description, styleSlug)
# Display keyword mirrors the seoTitle minus the " | FontGen.art" suffix.
PAGE_META = [
    ("cursive",          "Cursive Font Generator",            "cursive"),
    ("bold",             "Bold Font Generator",               "bold"),
    ("gothic",           "Gothic Font Generator",             "fraktur"),
    ("italic",           "Italic Font Generator",             "italic"),
    ("bubble",           "Bubble Font Generator",             "bubble"),
    ("tattoo",           "Tattoo Font Generator",             "fraktur"),
    ("discord",          "Discord Font Generator",            "bold-cursive"),
    ("instagram",        "Instagram Font Generator",          "cursive"),
    ("cute",             "Cute Font Generator",               "bubble"),
    ("minecraft",        "Minecraft Font Generator",          "squared"),
    ("facebook",         "Facebook Font Generator",           "bold"),
    ("meme",             "Meme Font Generator",               "squared"),
    ("old-english",      "Old English Font Generator",        "fraktur"),
    ("3d",               "3D Font Generator",                 "squared"),
    ("graffiti",         "Graffiti Font Generator",           "bold-fraktur"),
    ("small",            "Small Font Generator",              "small-caps"),
    ("tiny",             "Tiny Font Generator",               "small-caps"),
    ("fraktur",          "Fraktur Font Generator",            "fraktur"),
    ("papyrus",          "Papyrus Font Generator",            "cursive"),
    ("western",          "Western Font Generator",            "bold-fraktur"),
    ("y2k",              "Y2K Font Generator",                "squared"),
    ("christmas",        "Christmas Font Generator",          "bold-cursive"),
    ("rainbow",          "Rainbow Font Generator",            "cursive"),
    ("heavy-metal",      "Heavy Metal Font Generator",        "bold-fraktur"),
    ("death-metal",      "Death Metal Font Generator",        "bold-fraktur"),
    ("chicano",          "Chicano Font Generator",            "bold-cursive"),
    ("fire",             "Fire Font Generator",               "bold"),
    ("demon",            "Demon Font Generator",              "fraktur"),
    ("serif",            "Serif Font Generator",              "italic"),
    ("times-new-roman",  "Times New Roman Font Generator",    "italic"),
    ("cross-stitch",     "Cross Stitch Font Generator",       "small-caps"),
    ("big",              "Big Font Generator",                "bold"),
    ("fullwidth",        "Fullwidth Font Generator",          "fullwidth"),
    ("heart",            "Heart Font Generator",              "heart"),
    ("sans-italic",      "Sans Italic Font Generator",        "sans-italic"),
    ("sans-bold-italic", "Sans Bold Italic Font Generator",   "sans-bold-italic"),
    ("cyrillic",         "Cyrillic Font Generator",           "cyrillic"),
    ("currency",         "Currency Font Generator",           "currency"),
    ("wave",             "Wave Font Generator",               "wave"),
    ("macron",           "Macron Font Generator",             "macron"),
    ("calligraphy",      "Calligraphy Font Generator",        "bold-cursive"),
    ("freaky",           "Freaky Font Generator",             "freaky"),
    ("metal",            "Metal Font Generator",              "bold-fraktur"),
    ("comic-sans",       "Comic Sans Font Generator",         "sans-serif"),
    ("impact",           "Impact Font Generator",             "bold"),
    ("font-meme",        "Font Meme Generator",               "squared"),
    ("fancy-fraktur",    "Fancy Fraktur Font Generator",      "bold-fraktur"),
]

SUFFIX = " and 79 more font styles. Copy and paste to Instagram, TikTok, Discord, Facebook."
# "instantly" was removed — the title already carries "Generator" which implies
# fast action, and dropping it shaves 10 chars so longer keyword phrases
# (Sans Bold Italic, Fancy Fraktur) stay within the 160-char SERP limit.
TEMPLATE = "{kw} — convert any text to {adj} letters" + SUFFIX


def main() -> int:
    with MESSAGES_PATH.open("r", encoding="utf-8") as f:
        messages = json.load(f)

    changed = 0
    over_limit = []
    fonts = messages["pages"]["fonts"]

    for slug, keyword, style_slug in PAGE_META:
        if slug not in fonts:
            print(f"  ! skip: pages.fonts.{slug} missing in en.json")
            continue
        adj = ADJECTIVE[style_slug]
        new_desc = TEMPLATE.format(kw=keyword, adj=adj)
        if len(new_desc) > 160:
            over_limit.append((slug, len(new_desc), new_desc))
        page = fonts[slug]
        old_desc = page["seoDescription"]
        if old_desc == new_desc:
            print(f"  = noop: pages.fonts.{slug} already matches")
            continue
        page["seoDescription"] = new_desc
        changed += 1

    # /for/discord — two surgical fixes:
    #   "Bold-cursive" → "Bold cursive"  (kill the mapper-name hyphen)
    #   "34 more fonts" → "79 more styles"  (consistency with /fonts/* pages)
    for_page = messages["pages"]["for"]["discord"]
    old_for_desc = for_page["seoDescription"]
    new_for_desc = (
        "Fancy Fonts For Discord for bios, posts, and usernames. "
        "Bold cursive style featured plus 79 more styles. Copy in one click."
    )
    if old_for_desc != new_for_desc:
        for_page["seoDescription"] = new_for_desc
        changed += 1
    else:
        print("  = noop: pages.for.discord already matches")

    # Report
    print()
    print(f"Total changed: {changed}")
    if over_limit:
        print(f"OVER 160 chars ({len(over_limit)}):")
        for slug, length, desc in over_limit:
            print(f"  {slug}: {length} chars")
            print(f"    {desc}")
        return 1
    print("All descriptions within 160-char limit.")

    with MESSAGES_PATH.open("w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Saved: {MESSAGES_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())