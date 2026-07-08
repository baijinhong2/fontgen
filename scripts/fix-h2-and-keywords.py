#!/usr/bin/env python3
"""
Phase-2 SEO content cleanup — REVISED.

Scope (per user clarification 2026-07-08 after seeing inconsistency risk):
  - TDK title (meta <title>): DO NOT touch
  - H1: DO NOT touch (consistency with TDK title is the page identity)
  - H2 (SEO section title_i18n): fix mapper-name leaks ONLY in pages where
    the mapper name is jargon (not real user search terms)
  - seoKeywords (meta keywords): fix mapper-name leaks

Body content (description_i18n) is INTENTIONALLY NOT touched.
  - On /fonts/sans-bold-italic etc., H1 says "Sans Bold Italic Font
    Generator" and body talks about "sans bold italic font generator".
    If we rewrite body to "bold italic", we break that consistency
    AND we lose keyword density for the page's actual target keyword.
  - The "fix" is to either: (a) leave it, (b) rewrite TDK+H1+body all
    together. Doing only body creates inconsistency. So leave it.

Pages where fraktur appears are NOT touched — "fraktur" is a real user
search term and the page needs keyword density for it.

Touched pages (mapper is jargon, not a real search term):
  - /fonts/sans-bold-italic  (sans-bold-italic → "bold italic")
  - /fonts/sans-italic       (sans-italic → "clean italic")
  - /fonts/fullwidth         (fullwidth → "full-width")
"""

import json
import re
from pathlib import Path

MESSAGES_PATH = Path(__file__).resolve().parent.parent / "messages" / "en.json"

# Per-page substitution rules — applied to title_i18n and seoKeywords only.
# Order matters — more specific patterns first.
PAGE_RULES = {
    "sans-bold-italic": [
        (r"\bSans-bold-italic\b", "Bold italic"),
        (r"\bsans-bold-italic\b", "bold italic"),
        (r"\bSans bold italic\b", "Bold italic"),
        (r"\bsans bold italic\b", "bold italic"),
    ],
    "sans-italic": [
        (r"\bSans-italic\b", "Clean italic"),
        (r"\bsans-italic\b", "clean italic"),
        (r"\bSans italic\b", "Clean italic"),
        (r"\bsans italic\b", "clean italic"),
    ],
    "fullwidth": [
        # Preserve leading case: "Fullwidth" → "Full-width", "fullwidth" → "full-width"
        (r"\b([Ff])ullwidth\b", lambda m: m.group(1) + "ull-width"),
    ],
}

# SEO section keys whose title_i18n is rendered as an H2 by SeoSections.tsx.
# Head1 uses H1 (and isn't rendered unless showHead1=true), so it's excluded.
H2_SECTIONS = ["Whatis", "howToUse", "doWith", "Whois", "youNeed", "realVoices", "faq"]


def rewrite_text(text: str, rules: list) -> str:
    for pattern, replacement in rules:
        text = re.sub(pattern, replacement, text)
    return text


def rewrite_page(page: dict, rules: list) -> tuple[int, int]:
    """Returns (h2_changes, kw_changes)."""
    h2_changes = 0
    kw_changes = 0

    # H2 titles (only rewrite if the page-specific mapper name appears —
    # generic H2s like "How Does FontGen.art's Font Generator Work?"
    # stay untouched by these rules anyway since they don't contain
    # the mapper name).
    for section_key in H2_SECTIONS:
        sec = page.get(section_key, {})
        old_title = sec.get("title_i18n", "")
        if old_title:
            new_title = rewrite_text(old_title, rules)
            if new_title != old_title:
                sec["title_i18n"] = new_title
                h2_changes += 1

    # seoKeywords (whole string, single field)
    old_kw = page.get("seoKeywords", "")
    if old_kw:
        new_kw = rewrite_text(old_kw, rules)
        if new_kw != old_kw:
            page["seoKeywords"] = new_kw
            kw_changes += 1

    return h2_changes, kw_changes


def main() -> int:
    with MESSAGES_PATH.open("r", encoding="utf-8") as f:
        messages = json.load(f)

    fonts = messages["pages"]["fonts"]
    total_h2 = 0
    total_kw = 0

    for slug, rules in PAGE_RULES.items():
        if slug not in fonts:
            print(f"  ! skip: pages.fonts.{slug} not in en.json")
            continue
        h2, kw = rewrite_page(fonts[slug], rules)
        total_h2 += h2
        total_kw += kw
        print(f"  /fonts/{slug}: H2×{h2}, seoKeywords×{kw}")

    print(f"\nTotals: H2={total_h2}, seoKeywords={total_kw}")
    print(f"(body content intentionally untouched — see script header)")

    with MESSAGES_PATH.open("w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Saved: {MESSAGES_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())