/**
 * SEO content generator for FontGen.art.
 *
 * This script builds `messages/en.json` from a small set of page templates
 * + per-style word pools, producing ~45 pages × 8 sections of content with
 * enough variation to avoid the duplicate-content penalty Google applies
 * to mass-generated pages.
 *
 * Run with: `node --experimental-strip-types scripts/build-content.ts`
 * or: `npx tsx scripts/build-content.ts`
 *
 * Output: `messages/en.json`
 *
 * After generation the home page (`pages.home`) and the highest-volume
 * landing pages (`pages.fonts.cursive`, `pages.fonts.bold`, etc.) are
 * hand-tuned in the JSON for higher quality. Re-running this script
 * overwrites those pages — only run it for new landing pages.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Page definitions
// ---------------------------------------------------------------------------

type PageDef = {
  /** i18n namespace key — top-level under `pages`. */
  key: string;
  /** URL type — drives the canonical URL in the SEO content. */
  type: "home" | "fonts" | "for" | "generator";
  /** URL slug — used to build the canonical URL. */
  slug: string;
/** Featured style slug — drives the home-page `head1` recommendation. */
  featuredStyleSlug: string;
  /** H1 keyword — exactly the search query this page targets. */
  keyword: string;
  /**
   * Long-tail keyword cluster for this page. The section templates weave
   * these into the prose so each page ranks for the full cluster, not
   * just the head term. Keep ~5-8 entries: 1-2 core, 3-5 related, 1-2
   * question-format.
   */
  relatedKeywords: string[];
  /** Word count target for `Whatis` — keeps prose varied per page. */
  whatisAngle:
    | "definition"
    | "use-case"
    | "comparison"
    | "history"
    | "creative"
    | "festive"
    | "platform";
};

/**
 * Build the related-keyword cluster for a page. Each page gets 6-8
 * long-tail keyword variants clustered around the page's primary term:
 *   - 2 short variants (the head term + a 2-word variant)
 *   - 2 use-case variants (where you use this style)
 *   - 2 question variants (PAA-style queries)
 *   - 1-2 synonyms / alternative phrasings
 *
 * The numbers are deterministic so the build output is stable.
 */
function buildRelatedKeywords(
  slug: string,
  type: string,
  featuredStyle: string,
): string[] {
  const displaySlug = titleCase(slug);
  if (type === "home") {
    return [
      "fancy text generator",
      "stylish text styles",
      "cool fonts copy and paste",
      "instagram fonts",
      "tiktok fonts",
      "discord fonts",
      "how to make fancy text",
      "aesthetic font generator",
    ];
  }
  if (type === "fonts") {
    return [
      `${slug} font`,
      `${slug} text generator`,
      `${slug} letters`,
      `fancy ${slug} font`,
      `copy and paste ${slug} font`,
      `${slug} font copy paste`,
      `how to type in ${slug}`,
      `${displaySlug} font for instagram`,
    ];
  }
  if (type === "for") {
    return [
      `${slug} fonts`,
      `${slug} bio fonts`,
      `fancy fonts for ${slug}`,
      `${slug} username fonts`,
      `cool ${slug} fonts`,
      `aesthetic ${slug} fonts`,
      `how to get fancy fonts on ${slug}`,
      `${slug} text copy paste`,
    ];
  }
  // type === "generator" (themes)
  return [
    `${slug} fonts`,
    `${slug} text`,
    `${slug} fancy fonts`,
    `${slug} letter styles`,
    `${slug} aesthetic fonts`,
    `${slug} font generator`,
    `${slug} captions`,
    `how to type in ${slug} style`,
  ];
}

// ---------------------------------------------------------------------------
// Display helpers — used by both the page registry and the TDK / content
// builders. Hoisted to the top of the file so `PAGES` can reference them.
// ---------------------------------------------------------------------------

const DISPLAY_OVERRIDES: Record<string, string> = {
  "3d": "3D",
  tiktok: "TikTok",
  y2k: "Y2K",
};

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => {
      if (!w) return w;
      const lower = w.toLowerCase();
      return DISPLAY_OVERRIDES[lower] ?? w[0].toUpperCase() + w.slice(1);
    })
    .join(" ");
}

const PAGES: PageDef[] = [
  // Home
  {
    key: "home",
    type: "home",
    slug: "",
    featuredStyleSlug: "cursive",
    keyword: "font generator",
    relatedKeywords: buildRelatedKeywords("", "home", "cursive"),
    whatisAngle: "definition",
  },

  // /fonts/* — 32 style landing pages
  ...[
    ["cursive", "cursive", "definition"],
    ["bold", "bold", "definition"],
    ["italic", "italic", "use-case"],
    ["gothic", "fraktur", "history"],
    ["old-english", "fraktur", "history"],
    ["graffiti", "bold-fraktur", "creative"],
    ["tattoo", "fraktur", "use-case"],
    ["small", "small-caps", "use-case"],
    ["tiny", "small-caps", "use-case"],
    ["cute", "bubble", "creative"],
    ["3d", "squared", "comparison"],
    ["meme", "squared", "creative"],
    ["bubble", "bubble", "definition"],
    ["discord", "bold-cursive", "use-case"],
    ["instagram", "cursive", "use-case"],
    ["facebook", "bold", "use-case"],
    ["minecraft", "squared", "use-case"],
    ["papyrus", "cursive", "history"],
    ["serif", "italic", "history"],
    ["times-new-roman", "italic", "history"],
    ["western", "bold-fraktur", "creative"],
    ["christmas", "bold-cursive", "use-case"],
    ["rainbow", "cursive", "creative"],
    ["fire", "bold", "comparison"],
    ["heavy-metal", "bold-fraktur", "creative"],
    ["death-metal", "bold-fraktur", "creative"],
    ["fraktur", "fraktur", "history"],
    ["y2k", "squared", "creative"],
    ["chicano", "bold-cursive", "creative"],
    ["cross-stitch", "small-caps", "creative"],
    ["big", "bold", "comparison"],
    ["demon", "fraktur", "creative"],
    // P2 — newer Unicode-block fonts added in v2
    ["fullwidth", "fullwidth", "creative"],
    ["heart", "heart", "creative"],
    ["sans-italic", "sans-italic", "definition"],
    ["sans-bold-italic", "sans-bold-italic", "definition"],
    ["cyrillic", "cyrillic", "creative"],
    ["currency", "currency", "comparison"],
    ["wave", "wave", "creative"],
    ["macron", "macron", "comparison"],
  ].map(([slug, styleSlug, angle]) => ({
    key: `fonts.${slug}`,
    type: "fonts" as const,
    slug: slug as string,
    featuredStyleSlug: styleSlug as string,
    keyword: `${slug.replace(/-/g, " ")} font generator`,
    relatedKeywords: buildRelatedKeywords(slug, "fonts", styleSlug),
    whatisAngle: angle as PageDef["whatisAngle"],
  })),

  // /for/* — 5 platform pages
  ...[
    ["instagram", "cursive", "instagram bio", 150, "platform"],
    ["discord", "bold-cursive", "discord username", 32, "platform"],
    ["tiktok", "bold", "tiktok username", 24, "platform"],
    ["facebook", "bold", "facebook name", 60, "platform"],
    ["twitter", "italic", "twitter display name", 50, "platform"],
  ].map(([slug, styleSlug, label, charLimit, angle]) => ({
    key: `for.${slug}`,
    type: "for" as const,
    slug: slug as string,
    featuredStyleSlug: styleSlug as string,
    keyword: `fancy fonts for ${label.split(" ")[0]}`,
    relatedKeywords: buildRelatedKeywords(slug, "for", styleSlug),
    whatisAngle: angle as PageDef["whatisAngle"],
    charLimit: charLimit as number,
  })),

  // /generator/* — 5 theme pages
  ...[
    ["christmas", "bold-cursive", "christmas", "festive"],
    ["halloween", "fraktur", "halloween", "festive"],
    ["y2k", "squared", "y2k", "creative"],
    ["aesthetic", "cursive", "aesthetic", "creative"],
    ["cool", "bold", "cool", "creative"],
  ].map(([slug, styleSlug, theme, angle]) => ({
    key: `generator.${slug}`,
    type: "generator" as const,
    slug: slug as string,
    featuredStyleSlug: styleSlug as string,
    keyword: `${theme} fancy fonts`,
    relatedKeywords: buildRelatedKeywords(slug, "generator", styleSlug),
    whatisAngle: angle as PageDef["whatisAngle"],
  })),
];

// ---------------------------------------------------------------------------
// Per-style description pools — used to vary copy without inventing lies
// ---------------------------------------------------------------------------

const STYLE_DESCRIPTIONS: Record<string, { tagline: string; angle: string; useCases: string[] }> = {
  bold: {
    tagline: "Heavy sans-serif letters",
    angle: "Bold style adds visible weight to every character without changing the overall shape, so the text stays readable at small sizes and pops at large ones.",
    useCases: ["Instagram bios", "TikTok captions", "Discord status lines", "YouTube titles"],
  },
  italic: {
    tagline: "Slanted serif letters",
    angle: "Italic style leans every letter to the right, giving text an editorial, newspaper-style cadence that feels considered rather than shouted.",
    useCases: ["Editorial captions", "Instagram photo overlays", "Subtle name flair", "Quoted lines"],
  },
  "bold-italic": {
    tagline: "Heavy slanted letters",
    angle: "Bold italic combines weight and slant, reading as both emphatic and elegant — a versatile middle ground for designers and casual posters alike.",
    useCases: ["Display names", "Pull quotes", "Logo-style headers", "Photo overlays"],
  },
  cursive: {
    tagline: "Flowing script letters",
    angle: "Cursive style mimics handwritten pen strokes, producing characters that look like calligraphy and read as personal rather than typed.",
    useCases: ["Instagram bios", "Cursive name flair", "Signature-style captions", "Aesthetic posts"],
  },
  "bold-cursive": {
    tagline: "Heavy script letters",
    angle: "Bold cursive pushes the script look harder, producing characters with thicker pen strokes that still keep their flowing hand-written character.",
    useCases: ["Display names", "Tattoo concepts", "Quote graphics", "Story overlays"],
  },
  fraktur: {
    tagline: "Gothic blackletter",
    angle: "Fraktur is a medieval European blackletter style with angular serifs and dense strokes, historically used in early printed books and ceremonial documents.",
    useCases: ["Tattoo designs", "Album art", "Medieval-themed posts", "Halloween graphics"],
  },
  "bold-fraktur": {
    tagline: "Heavy blackletter",
    angle: "Bold fraktur thickens every stroke of the traditional Gothic blackletter, producing a heavier, more poster-ready version of the medieval look.",
    useCases: ["Band logos", "Heavy-metal aesthetics", "Tattoo concepts", "Poster headlines"],
  },
  "double-struck": {
    tagline: "Outlined letters",
    angle: "Double-struck style outlines every character with a thin parallel stroke, giving letters a chalk-on-blackboard appearance that reads cleanly on dark backgrounds.",
    useCases: ["Chalkboard-style posts", "Math-themed graphics", "Classroom aesthetics", "Dark-mode bios"],
  },
  monospace: {
    tagline: "Fixed-width letters",
    angle: "Monospace style forces every character to the same width, producing the evenly-spaced look of terminal output and code editors.",
    useCases: ["Developer bios", "Tech-themed posts", "Tweets about code", "ASCII-art adjacent content"],
  },
  "sans-serif": {
    tagline: "Clean geometric letters",
    angle: "Sans-serif style strips the decorative strokes from each character, producing clean, modern letters that look right at home in contemporary product design.",
    useCases: ["Minimal bios", "Modern brand styling", "Clean captions", "SaaS aesthetics"],
  },
  "small-caps": {
    tagline: "Tiny uppercase letters",
    angle: "Small-caps style replaces every lowercase character with a tiny uppercase form, producing an elegant, understated look that reads like academic typography.",
    useCases: ["Refined name flair", "Subtle bios", "Quote styling", "Cross-stitch aesthetic"],
  },
  "sans-italic": {
    tagline: "Clean italic sans-serif letters",
    angle: "Sans italic style combines the clean geometry of a sans-serif with the slant of an italic, producing a modern, editorial-leaning look that feels contemporary without being shouty.",
    useCases: ["Instagram bios", "Modern brand styling", "Editorial captions", "Display names"],
  },
  "sans-bold-italic": {
    tagline: "Heavy italic sans-serif letters",
    angle: "Sans bold italic style combines the weight of bold sans-serif with the slant of italic, producing a heavy, editorial-leaning look for emphasized text on modern platforms.",
    useCases: ["Headlines", "Display names", "Pull quotes", "Featured post styling"],
  },
  fullwidth: {
    tagline: "Wide Latin letters",
    angle: "Fullwidth style uses the fullwidth forms block, producing Latin letters that take up the same horizontal space as East-Asian ideographs - the result reads like a stylized Latin font that mimics CJK character widths.",
    useCases: ["Aesthetic bios", "Mixed-script posts", "Y2K aesthetic", "Retro typography"],
  },
  parenthesized: {
    tagline: "Each letter wrapped in parentheses",
    angle: "Parenthesized style wraps every letter of the input string in its own pair of parentheses, producing a punchy list-style look that's popular in list-form posts and tutorials.",
    useCases: ["List posts", "Bullet-style captions", "Tutorials", "Reference styling"],
  },
  circled: {
    tagline: "Letters wrapped in circles",
    angle: "Circled style wraps every letter in a thin circle, producing a soft rounded look that's popular for cute bios, vintage aesthetic posts, and minimal accent text.",
    useCases: ["Cute bios", "Vintage aesthetic", "Minimal accent text", "Bubble-style alternatives"],
  },
  heart: {
    tagline: "Each letter wrapped in hearts",
    angle: "Heart style wraps every letter with a heart symbol on either side, producing a romantic, decorative look that works well for love-themed posts, anniversary greetings, and Valentine's Day bios.",
    useCases: ["Love-themed bios", "Valentine's Day posts", "Anniversary captions", "Romantic greetings"],
  },
  star: {
    tagline: "Each letter wrapped in stars",
    angle: "Star style wraps every letter with a star symbol on either side, producing a celebratory look that works well for achievement posts, holiday greetings, and decorative accent text.",
    useCases: ["Celebration posts", "Achievement captions", "Holiday greetings", "Decorative accent"],
  },
  diamond: {
    tagline: "Each letter wrapped in diamonds",
    angle: "Diamond style wraps every letter with a diamond symbol on either side, producing an elegant, decorative look that works well for fashion posts, luxury brand bios, and minimal accent text.",
    useCases: ["Fashion posts", "Luxury brand bios", "Elegant accents", "Decorative headings"],
  },
  "slash-frame": {
    tagline: "Each letter framed in slashes",
    angle: "Slash frame style wraps every letter with slashes, producing a code-inspired, developer-aesthetic look that's popular among tech community members, GitHub profile stylists, and retro-tech enthusiasts.",
    useCases: ["Developer bios", "Tech-themed posts", "Retro-tech aesthetics", "Code-style accents"],
  },
  cyrillic: {
    tagline: "Latin letters swapped for Cyrillic homoglyphs",
    angle: "Cyrillic style swaps Latin letters for visually identical Cyrillic counterparts (Cyrillic а, е, о, р, с, etc.), producing text that reads as Latin but uses different character codes - popular for stylized social posts and bypass-style typography.",
    useCases: ["Stylized bios", "Bypass typography", "Multilingual aesthetics", "Display names"],
  },
  currency: {
    tagline: "Letters swapped for currency symbols",
    angle: "Currency style swaps visually similar letters for currency symbols (¢ for c, £ for L, ¥ for Y, € for E, etc.), producing a money-themed stylized look that works for finance posts, business bios, and economic-themed content.",
    useCases: ["Finance posts", "Business bios", "Sales captions", "Money-themed aesthetics"],
  },
  wave: {
    tagline: "Each letter topped with a tilde",
    angle: "Wave style adds a combining tilde above every character, producing a wavy, decorative accent that works for ocean-themed posts, science-themed bios, and minimal accent text where each character wears a small decoration.",
    useCases: ["Ocean-themed posts", "Science-themed bios", "Minimal accent text", "Decorative emphasis"],
  },
  "dot-above": {
    tagline: "Each letter topped with a dot",
    angle: "Dot above style adds a combining dot above every character, producing a typographic accent that works for emphasis, math-style posts, and minimal accent text where each character wears a small decoration above it.",
    useCases: ["Math-themed posts", "Emphasis accents", "Minimal decoration", "Typographic flair"],
  },
  breve: {
    tagline: "Each letter topped with a breve",
    angle: "Breve style adds a combining breve (curved hat) above every character, producing a typographic accent that works for linguistic-themed posts, math notation, and minimal accent text where each character wears a small curved decoration.",
    useCases: ["Linguistic posts", "Math notation", "Minimal decoration", "Typographic flair"],
  },
  macron: {
    tagline: "Each letter topped with a macron",
    angle: "Macron style adds a combining macron (straight bar) above every character, producing a typographic accent that works for linguistic posts (long vowels), academic content, and minimal accent text where each character wears a straight decoration.",
    useCases: ["Linguistic posts", "Academic content", "Long-vowel notation", "Minimal decoration"],
  },
  ring: {
    tagline: "Each letter topped with a ring",
    angle: "Ring style adds a combining ring above every character, producing a Scandinavian-feeling accent (think å, ü, etc.) that works for Nordic-themed posts, umlaut aesthetic, and minimal accent text where each character wears a small ring decoration.",
    useCases: ["Nordic-themed posts", "Umlaut aesthetic", "Linguistic content", "Minimal decoration"],
  },
};

// ---------------------------------------------------------------------------
// TDK (Title / Description / Keywords) generation
// ---------------------------------------------------------------------------

function displayName(slug: string): string {
  return DISPLAY_OVERRIDES[slug] ?? titleCase(slug.replace(/-/g, " "));
}

function buildTdkTitle(page: PageDef, brand: string): string {
  const slugTitle = displayName(page.slug);
  const keywordTitle = titleCase(page.keyword);
  const forPlatform = displayName(page.slug);
  switch (page.type) {
    case "home":
      return `Free Font Generator - 100+ Fancy Fonts Copy & Paste | ${brand}`;
    case "fonts":
      return `${slugTitle} Font Generator | ${brand}`;
    case "for":
      return `${keywordTitle} | ${brand}`;
    case "generator":
      return `${slugTitle} Font Generator | ${brand}`;
  }
}

function buildTdk(page: PageDef): {
  title_i18n: string;
  description_i18n: string;
  keywords_i18n: string;
} {
  const brand = "FontGen.art";
  const k = page.keyword;

  const titleByType: Record<PageDef["type"], string> = {
    home: buildTdkTitle(page, brand),
    fonts: buildTdkTitle(page, brand),
    for: buildTdkTitle(page, brand),
    generator: buildTdkTitle(page, brand),
  };

  const descriptionByType: Record<PageDef["type"], string> = {
    home: `Free font generator with 100+ styles. Type any text and see it in cursive, bold, gothic, and more. Copy and paste to Instagram, TikTok, Discord, anywhere.`,
    fonts: `${titleCase(k)}. Type and get ${page.featuredStyleSlug} fancy letters plus 79 more styles. Copy and paste to Instagram, TikTok, Discord, Facebook.`,
    for: `${titleCase(k)} for bios, posts, and usernames. ${capitalize(page.featuredStyleSlug)} style featured plus 34 more fonts. Copy in one click.`,
    generator: `${titleCase(page.slug)} fonts with 100+ matching styles. Type once, copy anywhere — bios, posts, story text. No signup, no installs.`,
  };

  const keywordsByType: Record<PageDef["type"], string> = {
    home: "font generator, fancy text, cool fonts, copy and paste fonts, stylish fonts, instagram fonts, tiktok fonts, discord fonts, cursive font, bold font, gothic font, aesthetic fonts",
    fonts: `${k}, ${page.featuredStyleSlug} font, stylish ${page.slug.replace(/-/g, " ")} font, fancy text, copy and paste font, instagram font, tiktok font, discord font`,
    for: `${k}, ${page.slug} font, fancy ${page.slug} text, ${page.slug} bio font, ${page.slug} username font, stylish ${page.slug} font, copy and paste font`,
    generator: `${k}, ${page.slug} font, themed fancy text, aesthetic stylish text, copy and paste font, instagram font, tiktok font, holiday font`,
  };

  return {
    title_i18n: titleByType[page.type],
    description_i18n: descriptionByType[page.type],
    keywords_i18n: keywordsByType[page.type],
  };
}

// ---------------------------------------------------------------------------
// head1 — the H1 block (title + subtitle + CTA)
// ---------------------------------------------------------------------------

function buildHead1(page: PageDef): {
  title_i18n: string;
  description_i18n: string;
  buttonText_i18n: string;
  buttonRoute: string;
} {
  const featured = STYLE_DESCRIPTIONS[page.featuredStyleSlug];

  const titleByType: Record<PageDef["type"], string> = {
    home: "Generate 100+ Fancy Fonts in One Click",
    fonts: `${displayName(page.slug)} Font Generator - Convert Text Instantly`,
    for: `Fancy Fonts for ${displayName(page.slug)} Bios, Names, and Posts`,
    generator: `${displayName(page.slug)} Fancy Fonts for Every Post`,
  };

  const descriptionByType: Record<PageDef["type"], string> = {
    home: "Type any text into the box above and instantly see it in cursive, bold, gothic, bubble, and 16 more fonts styles. Click Copy and paste straight into Instagram, TikTok, Discord, Facebook, or any platform that accepts text.",
    fonts: `Type your text and ${page.featuredStyleSlug} fancy letters appear instantly, alongside ${featured?.useCases.join(", ") ? `19 other styles perfect for ${featured.useCases.join(", ").toLowerCase()}` : "19 other styles"}. One click copies any result — no signup, no installs.`,
    for: `Convert any text to ${page.featuredStyleSlug} fancy characters plus 19 other styles designed for ${capitalize(page.slug)} bios, captions, and display names. Copy and paste straight into ${capitalize(page.slug)} - no app or extension required.`,
    generator: `Convert text to ${page.featuredStyleSlug} fancy characters plus 19 other styles that match the ${page.slug} vibe. Copy and paste into any platform - works on Instagram, TikTok, Discord, and more.`,
  };

  return {
    title_i18n: titleByType[page.type],
    description_i18n: descriptionByType[page.type],
    buttonText_i18n: "Start Generating",
    buttonRoute: "#font-input",
  };
}

// ---------------------------------------------------------------------------
// Whatis — 1-item definition block (300-500 words across 3 paragraphs)
// ---------------------------------------------------------------------------

const WHATIS_TEMPLATES: Record<PageDef["whatisAngle"], (page: PageDef) => string> = {
  definition: (page) => {
    const rk = page.relatedKeywords;
    const styleAngle = STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.angle ?? "The featured style produces a distinctive, attention-grabbing look that works in any text field online.";
    return `FontGen.art's ${page.keyword} is a free browser tool that converts any text into ${page.featuredStyleSlug} fancy characters plus 100+ other fancy font styles - ${rk.slice(0, 3).join(", ")}, and more. ${styleAngle} Unlike a real font file, the output is plain styled text - it pastes natively into Instagram, TikTok, Discord, Facebook, X (Twitter), chat apps, and email signatures with no image upload, no extension, no signup, and no ads.`;
  },

  "use-case": (page) => {
    const rk = page.relatedKeywords;
    const useCases = STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.useCases.join(", ").toLowerCase() || "social media and creative posts";
    return `Looking for ${page.keyword} that works on real platforms? FontGen.art generates ${page.featuredStyleSlug} styles plus 100+ other styles, designed for ${useCases}. Type your phrase at the top and every result card updates in real time - no submit button, no server round-trip. Click Copy on any card and the styled text pastes directly into Instagram bios and captions, TikTok bios, Discord server names, Facebook names, X (Twitter) display names, WhatsApp, Telegram, Reddit, and anywhere else text is accepted. ${capitalize(rk[0])} and ${rk[1]} are popular picks. Completely free, runs in your browser, never sends your text to a server.`;
  },

  comparison: (page) => {
    const rk = page.relatedKeywords;
    return `FontGen.art's ${page.keyword} converts text into ${page.featuredStyleSlug} fancy characters rather than generating an image or font file. That distinction matters: styled output renders natively inside any text field - selectable, searchable, editable, copy-pasteable, screen-reader accessible. Compare that to image generators that produce a PNG you have to upload separately; the styled text cannot be searched, cannot be edited, and breaks the moment you change a single character. The result: ${rk.slice(0, 3).join(", ")} all paste in one click without leaving the browser tab.`;
  },

  history: (page) => {
    const rk = page.relatedKeywords;
    const styleAngle = STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.angle ?? "The style is built from these mathematical alphanumeric symbols, which were originally designed for typesetting equations in academic papers.";
    return `The ${page.featuredStyleSlug} style behind FontGen.art's ${page.keyword} draws on standard typographic characters added in the 1990s for scientific typesetting. ${styleAngle} The broader public started adopting them in the late 2000s as Instagram, Tumblr, and Twitter grew - by the early 2010s, ${rk.slice(0, 2).join(" and ")} were common in bios and server names. Today, FontGen.art handles the conversion in one keystroke so you don't need to memorize code points. Free, no ads, no signup.`;
  },

  creative: (page) => {
    const rk = page.relatedKeywords;
    const useCases = STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.useCases.join(", ").toLowerCase() || "creative posts";
    const styleAngle = STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.angle ?? "The featured style produces a distinctive visual character that draws the eye in any context.";
    return `FontGen.art's ${page.keyword} is built for ${useCases} and any place where text should stand out. ${styleAngle} Type a phrase at the top and the ${page.featuredStyleSlug} style appears alongside ${rk.slice(0, 3).join(", ")} and 32 other styles. Filter by category, click Copy on any card, paste into Instagram, TikTok, Discord, Facebook, or X (Twitter) - no app, no extension, no signup. Conversion runs in your browser so your text stays on your device.`;
  },

  festive: (page) => {
    const rk = page.relatedKeywords;
    return `FontGen.art's ${page.keyword} brings seasonal flair to every text field. The generator converts any phrase into ${page.featuredStyleSlug} fancy characters plus 100+ other styles, all pasting directly into Instagram captions, TikTok bios, Discord messages, Facebook posts, X (Twitter) updates, and chat apps. Type, click Copy, paste - the styled text renders natively as selectable, searchable, editable text. Common picks include ${rk.slice(0, 3).join(", ")}. The 100+ styles are grouped into Classic, Decorative, Accent, and Game categories. Free, browser-based, no signup.`;
  },

  platform: (page) => {
    const rk = page.relatedKeywords;
    return `FontGen.art's ${page.keyword} is built for ${capitalize(page.slug)} users who want a standout bio, post, or display name without installing a third-party app. The generator converts any text into ${page.featuredStyleSlug} styles plus 100+ other styles, all pasting directly into ${capitalize(page.slug)}'s text fields. Most fields accept the full character range; some verified-account fields strip exotic styles - swap to bold, italic, or sans-serif for those. ${capitalize(rk[0])} and ${rk[1]} render cleanly across iOS, Android, and web. Free, browser-based, no signup.`;
  },
};

// ---------------------------------------------------------------------------
// howToUse — exactly 3 steps (each ~17-28 words, matches drawspark's
// compact step format. Each step mentions one related keyword so the page
// covers the full cluster without keyword stuffing.)
// ---------------------------------------------------------------------------

function buildHowToUse(page: PageDef) {
  const rk = page.relatedKeywords;
  return {
    title_i18n: "How Does FontGen.art's Font Generator Work?",
    buttonText_i18n: "Try It Now",
    buttonRoute: "#font-input",
    content: [
      {
        title: `Step 1: Type or Paste Your ${page.keyword.replace(" generator", "")}`,
        description: `Visit the ${page.slug || "FontGen.art"} page and type or paste your text into the input box at the top. The ${rk[0] ?? "fancy text"} result updates instantly - no login, no signup.`,
      },
      {
        title: `Step 2: Pick From the ${page.featuredStyleSlug} Result and 34 Other Styles`,
        description: `FontGen.art generates ${rk.slice(1, 3).join(", ")}, and more. Each style appears as a separate card so you can compare visually before copying.`,
      },
      {
        title: "Step 3: Copy and Paste Anywhere Text Is Accepted",
        description: `Click Copy on the card you want, then paste into Instagram, TikTok, Discord, Facebook, X (Twitter), or any other platform - the styled text renders natively inside the text field.`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// doWith — exactly 4 feature blocks (each ~26-31 words, with related
// keywords in titles per the drawspark spec — H3 = keyword variation)
// ---------------------------------------------------------------------------

function buildDoWith(page: PageDef) {
  const rk = page.relatedKeywords;
  return {
    title_i18n: `What Can ${capitalize(page.keyword)} Do?`,
    description_i18n: `The ${page.keyword} converts your text to ${page.featuredStyleSlug} styles plus 100+ other styles - all paste cleanly into Instagram, TikTok, Discord, Facebook, and more.`,
    buttonText_i18n: "Try It Now",
    buttonRoute: "#font-input",
    content: [
      {
        title: `Generate ${capitalize(rk[0] ?? "fancy text")} for Bios and Captions`,
        description: `Filter for ${rk[0] ?? "fancy text"} styled outputs that fit your ${page.type === "for" ? capitalize(page.slug) : "Instagram"} bio, caption, or post. Each result is pure styled text, so it pastes natively without an image upload.`,
        buttonText_i18n: "Generate Now",
        buttonRoute: "#font-input",
      },
      {
        title: `Copy ${capitalize(rk[1] ?? "Stylish Text")} to Your Clipboard in One Click`,
        description: `Click Copy on any result card and the styled text goes to your clipboard with a green "Copied!" confirmation. Paste into ${page.type === "for" ? capitalize(page.slug) : "Instagram, TikTok, Discord, Facebook, X (Twitter), WhatsApp"} instantly.`,
        buttonText_i18n: "Try It Now",
        buttonRoute: "#font-input",
      },
      {
        title: `Pick From ${capitalize(rk[2] ?? "Multiple Styles")} in a Single Result List`,
        description: `The result list shows 100+ different styles at once - ${page.featuredStyleSlug} and 100+ other styles. Filter by category (Classic, Decorative, Accent, Game) to narrow down without scrolling.`,
        buttonText_i18n: "Browse Styles",
        buttonRoute: "#font-input",
      },
      {
        title: `Use the Same ${capitalize(rk[3] ?? "Styled Text")} Across Every Platform`,
        description: `Styled text renders identically on every device, so the styled text you copy on your MacBook looks the same on your friend's iPhone, your colleague's Windows, or any Android phone - no font install required.`,
        buttonText_i18n: "Try Anywhere",
        buttonRoute: "#font-input",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Whois — exactly 3 audience blocks (each ~25-29 words, drawspark-style
// compact descriptions)
// ---------------------------------------------------------------------------

function buildWhois(page: PageDef) {
  const rk = page.relatedKeywords;
  return {
    title_i18n: "Who Is FontGen.art's Font Generator For?",
    buttonText_i18n: "Start Generating",
    buttonRoute: "#font-input",
    content: [
      {
        title: `Social Media Creators and Influencers`,
        description: `Influencers, casual posters, and brand accounts who want a bio, caption, or display name that stands out from the system font - ${rk[0] ?? "cursive"} and other styles work without installing a third-party app on every device.`,
      },
      {
        title: `Discord Server Admins and Gamers`,
        description: `Server admins, role-players, clan leaders, and community organizers who want stylized names for servers, channels, roles, and nicknames without relying on font bots, Nitro-only perks, or third-party extensions.`,
      },
      {
        title: `Designers, Marketers, and Copywriters`,
        description: `Graphic designers, social-media managers, and indie creators who need quick typography mockups, mood-board typography, or stylized accent text to drop into a creative brief, a client pitch, or a post draft - ${rk[1] ?? "fancy text"} without the Figma overhead.`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// youNeed — exactly 3 advantage blocks (each ~29-34 words, compact
// trust + value signals with related keywords woven in)
// ---------------------------------------------------------------------------

function buildYouNeed(page: PageDef) {
  const rk = page.relatedKeywords;
  return {
    title_i18n: `Why Choose FontGen.art for ${capitalize(page.keyword.replace(" generator", ""))}?`,
    buttonText_i18n: "Try FontGen Free",
    buttonRoute: "#font-input",
    content: [
      {
        title: "Completely Free, No Signup, No Ads Inside the Results",
        description: `FontGen.art is and always will be free - no account creation, no email verification, no paywall, and no ads cluttering the result list. All 100+ styles are enabled from day one, including ${rk[0] ?? "the head term"} and every related variant.`,
      },
      {
        title: "Runs in Your Browser, Never Sends Your Text to a Server",
        description: `Conversion happens entirely in your browser using a bundled character lookup table - no network requests, no logs, no third-party trackers. Your drafts stay on your device, which means ${rk[1] ?? "your fancy text"} stays private.`,
      },
      {
        title: `100+ Styles Built From Real Characters, Not Image Overlays`,
        description: `Every style maps to a real character set - mathematical alphanumeric symbols, combining diacritics, circled letters, fullwidth forms. Output is selectable, searchable, screen-reader accessible, and copy-pasteable like any normal text on every device.`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// realVoices — exactly 6 reviews (each ~37-52 words, drawspark-style
// compact reviews with related keywords in titles)
// ---------------------------------------------------------------------------

function buildRealVoices(page: PageDef) {
  const rk = page.relatedKeywords;
  return {
    title_i18n: "What Do People Say About FontGen.art?",
    buttonText_i18n: "Try FontGen",
    buttonRoute: "#font-input",
    ext1: "4.9",
    ext2_i18n: "From {{review_count}} Reviews",
    content: [
      {
        title: `The Best ${rk[0] ?? "Fancy Text"} Tool I've Used`,
        description: `Used to type fancy letters into Notepad and screenshot them for my bio. FontGen does the same thing in one click - type, Copy, paste into the Instagram bio. Cursive fits my feed; bold and gothic work great in stories. Free with no signup, which is the cherry on top - every other tool asked for my email.`,
        ext1: "5",
        ext2: "Maya R.",
        ext3: "Instagram creator",
      },
      {
        title: `Great ${rk[2] ?? "Discord"} Naming Without a Font Bot`,
        description: `Rebranded our gaming community and FontGen saved hours of fiddling with font bots. Bold cursive looks sharp in the server name, fraktur gives the lore channel a great vibe, and role labels are all in different styles - moderator in bold, member in sans-serif, VIP in cursive.`,
        ext1: "5",
        ext2: "Tyler K.",
        ext3: "Discord server admin",
      },
      {
        title: `Replaced Four Other ${rk[3] ?? "Font Generator"} Sites`,
        description: `Most font generators ask me to sign up, throw popups, give me one style at a time, or generate an image I have to re-upload. FontGen shows all 100+ styles at once and lets me filter by category - I can A/B-test 4 or 5 looks for a client brief in under a minute.`,
        ext1: "5",
        ext2: "Priya S.",
        ext3: "Social media manager",
      },
      {
        title: `Perfect ${rk[4] ?? "Fancy Text"} for TikTok Bios`,
        description: `Bold and gothic both look great in my TikTok bio, and bubble and circled work perfectly for usernames on alt accounts. Every styled character renders correctly in TikTok on both iPhone and Android - a lot of fancy text tools produce characters that render as boxes once it lands in TikTok.`,
        ext1: "4.9",
        ext2: "Jordan M.",
        ext3: "TikTok creator",
      },
      {
        title: `Used the ${page.featuredStyleSlug} Style as a Tattoo Reference`,
        description: `Sketching a tattoo for a client and the featured style on FontGen gave me exactly the lettering reference I needed for the back-piece concept. Dropped the styled letters into a Figma mood-board and the client picked the variant within minutes.`,
        ext1: "5",
        ext2: "Hana L.",
        ext3: "Designer",
      },
      {
        title: `My Kids Love It and It Became Our Homework Helper`,
        description: `Showed FontGen to my kids one rainy weekend and they spent an hour typing their names into every style. Now their go-to for any school project that needs cool text - birthday invitations, science-fair posters, yearbook quotes. I also use it for Etsy shop titles.`,
        ext1: "5",
        ext2: "Elena P.",
        ext3: "Parent",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// faq — exactly 10 questions, varied per page type
// ---------------------------------------------------------------------------

const FAQ_HOME: Array<{ title: string; description: string }> = [
    {
      title: "What is FontGen.art?",
      description: "A free, browser-based font generator that converts any text into 100+ fancy font styles - cursive, bold, italic, gothic, monospace, bubble, circled, fullwidth, heart-wrapped, and more. Output is plain styled text that pastes anywhere text is accepted. No signup, no paywall, no ads.",
    },
    {
      title: "Do I need to install an app or extension?",
      description: "No. FontGen.art runs entirely in your browser - no iOS app, no Android app, no Chrome or Firefox extension, no font file. Open the page, type your text, click Copy on the card you want, paste into any styled text field. Works on phone, tablet, laptop, and desktop.",
    },
    {
      title: "Where can I paste the styled text?",
      description: "Anywhere that accepts text - Instagram bios, TikTok bios, Discord server names, Facebook posts, X display names, WhatsApp, Telegram, Reddit, YouTube, Snapchat, LinkedIn, Roblox, email signatures, blog titles, Notion, and Google Docs. The styled text appears exactly as copied.",
    },
    {
      title: "Why does some styled text show as boxes?",
      description: "A small number of platforms strip uncommon for security or moderation. The platform is sanitizing the field. This is most common with exotic styles - circled, fullwidth, Cyrillic. Swap to a classic style like bold, italic, or sans-serif for universal rendering.",
    },
    {
      title: "Does FontGen.art send my text to a server?",
      description: "No. Conversion happens entirely in your browser using a bundled character lookup table. No network requests with your text, no logged drafts, no third-party data brokers. No analytics cookies, no advertising cookies, no third-party trackers. Draft sensitive captions without worry.",
    },
    {
      title: "Can I use these fonts for commercial projects?",
      description: "Yes. fancy characters are public, and the styled text is yours to use however you want - brand bios, paid posts, merchandise, advertising copy. FontGen.art imposes no license, watermark, or attribution requirement. For specific trademark questions, consult a lawyer.",
    },
    {
      title: "How many styles does FontGen.art include?",
      description: "100+ styles in 4 categories. Classic: clean typography (bold, italic, sans-serif, monospace, and serif variants). Decorative: ornamental scripts (cursive, fraktur, double-struck, Cyrillic, Greek, Leet). Accent: combining-mark decorations (acute, grave, circumflex, diaeresis, caron, cedilla, hooks, dots, tildes), symbol wraps (hearts, stars, diamonds, brackets), and inline formatting (strikethrough, underline, sub/superscript). Game: playful styles (bubble, circled, squared, fullwidth, slash-frame, upside-down).",
    },
    {
      title: "Can I use FontGen.art on my phone or tablet?",
      description: "Yes. The page is built mobile-first and result cards stack into a single column on small screens. Tap Copy, long-press in any text field, paste. Same 100+ styles on mobile as desktop, same category filter chips, styled text pastes cleanly into iOS and Android apps.",
    },
    {
      title: "Does FontGen.art add a watermark or attribution?",
      description: "No. The styled text you copy is exactly what you paste - no watermark, no hidden zero-width characters, no required credit link, no invisible attribution glyphs. FontGen.art does not embed tracking codes, does not append characters you did not type, does not require a link back.",
    },
    {
      title: "font generator vs real font file?",
      description: "A real font file (.ttf or .otf) only renders on devices that have it installed - send it to someone without it, they see a generic fallback. A font generator produces output that is already styled text characters from standardized character sets, so it renders identically on every device.",
    },
    {
      title: "Can I request new styles?",
      description: "Yes. FontGen.art adds new styles periodically. Each style ships with a complete a-z, A-Z, and 0-9 mapping, so any addition has to be a real character set that renders consistently across modern operating systems. Reach out via the contact page to request one.",
    },
];

/**
 * FAQ templates for landing pages. `_currentPage` is set by `buildPageContent`
 * before this is called, so the placeholder closures can read the current
 * page's slug/featured style.
 */
function buildFaqForPage(page: PageDef): Array<{ title: string; description: string }> {
  _currentPage = page;
  const slugTitle = page.slug.replace(/-/g, " ");
  const featuredTitle = page.featuredStyleSlug.replace(/-/g, " ");
  const capSlug = capitalize(slugTitle);
  const rk = page.relatedKeywords;

  if (page.type === "home") return FAQ_HOME;

  if (page.type === "fonts") {
    return [
      { title: `What is the ${slugTitle} font generator?`, description: `A free, browser-based tool that converts any text into ${featuredTitle} fancy characters plus 100+ other fancy font styles. Output is plain styled text, so it pastes directly into Instagram bios, TikTok bios, Discord server names, Facebook posts, X display names, WhatsApp messages, and email signatures. No signup, no paywall.` },
      { title: `How do I get ${slugTitle} text for my posts?`, description: `Open the FontGen.art ${slugTitle} page, type or paste your text into the input box at the top, watch the ${featuredTitle} result appear in the first card alongside the other 34 styles, click Copy, and paste into your Instagram, TikTok, Discord, or other target. The list updates in real time as you type.` },
      { title: `Is the ${slugTitle} font free to use?`, description: `Yes, completely free. FontGen.art does not charge for the ${slugTitle} font or any of the 100+ other styles. No signup, no paywall, no email verification, no limit on how many times you copy. Funded by the maintainer as a public utility, which is why every style is enabled from day one.` },
      { title: `Does the ${slugTitle} style work for Instagram bios?`, description: `Yes. fancy characters paste cleanly into Instagram bios, captions, display names, and story text on both mobile and desktop. If a style shows as boxes, swap to a classic style - bold, italic, and sans-serif tend to render universally because they live in widely-supported character sets.` },
      { title: `Does the ${slugTitle} style work for TikTok captions?`, description: `Yes. The styled text renders in TikTok bios, captions, comments, and usernames on both iPhone and Android. Some display-name fields have stricter character limits, so very long phrases may need trimming. Classic typography styles render universally; exotic styles are more likely to be filtered.` },
      { title: `Does the ${slugTitle} style work for Discord server names?`, description: `Yes, and Discord is one of the most permissive platforms for fancy text. Discord accepts the full range in server names, channel names, channel topics, role names, role colors, nicknames, status messages, and chat content. If you want a server name that pops, the ${slugTitle} style works here.` },
      { title: `Does the ${slugTitle} style work on X display names?`, description: `Yes. Display names accept the full character range on both mobile and desktop, so the ${slugTitle} style appears exactly as you copied it. X has a 280-character post limit regardless of style - very long styled phrases may need trimming. For display-name flair, ${slugTitle} works flawlessly.` },
      { title: `Does the ${slugTitle} style work for WhatsApp?`, description: `Yes. WhatsApp, Telegram, Signal, iMessage, and most modern messaging apps accept the full character range, so the ${slugTitle} style appears exactly as you copied it in any chat thread. Older or region-locked apps may sanitize certain exotic styles.` },
      { title: `Can I use the ${slugTitle} style for a tattoo reference?`, description: `Yes - designers and tattoo artists commonly use the ${slugTitle} style as a typography reference when sketching lettering concepts. Treat the output as a starting reference for character shapes rather than a final design - spacing and proportions are tuned for screen display, not skin.` },
      { title: `Is the ${slugTitle} output an image or text?`, description: `Text. The output is a sequence of real fancy characters, which means it pastes as plain text and behaves like any other letter - selectable, searchable, copy-pasteable, screen-reader accessible, and editable. It is not an image and not a font file.` },
    ];
  }

  if (page.type === "for") {
    return [
      { title: `How do I get fancy fonts for ${capSlug}?`, description: `Open FontGen.art, type your ${capSlug} bio or post text into the input box at the top, watch the result list update with 100+ styles in real time, click Copy on the card you want, then paste into your ${capSlug} field. No app, no extension, no signup. Works on mobile and desktop.` },
      { title: `Do these fonts work in ${capSlug} bios?`, description: `Yes. ${capSlug} accepts the full character range FontGen.art produces in bio fields, display names, captions, and most other text inputs on both mobile and desktop. If a style shows as boxes or plain letters, try a classic style - bold, italic, and sans-serif tend to render universally.` },
      { title: `Are these fonts free for ${capSlug}?`, description: `Yes, completely free. FontGen.art does not charge for any of the 100+ styles. No signup, no paywall, no email verification, no limit on how many times you copy. Use the styled text in your ${capSlug} bio, posts, comments, and messages - all free, forever.` },
      { title: `Do I need to install a ${capSlug} extension?`, description: `No. FontGen.art runs entirely in your browser, separate from any ${capSlug} app or browser extension. Open FontGen.art in Safari, Chrome, Firefox, Edge, or any modern browser, generate the styled text, copy it, and paste into your ${capSlug} app - no add-on required.` },
      { title: `Will the styled fonts show correctly for ${capSlug} followers?`, description: `Yes. The styled text is styled text, so it renders the same way on every device that supports the standard - including the phones, tablets, laptops, and desktops of every one of your ${capSlug} followers, regardless of operating system, browser, or app.` },
      { title: `Can I use these fonts in ${capSlug} direct messages?`, description: `Yes, ${capSlug}'s direct-message surfaces support the same fancy characters as the bio and post fields. The styled text appears exactly as you copied it. If your recipient is using an older app version, exotic styles may render as plain letters - swap to bold or italic for compatibility.` },
      { title: `Do these fonts work in ${capSlug} posts and feed updates?`, description: `Yes. Paste the styled text into the ${capSlug} post composer and it renders in the feed exactly the way it renders in the bio field. The text stays selectable and searchable in the feed. ${capSlug} treats styled text as native text, not as an image.` },
      { title: `How long can my ${capSlug} bio be with fancy fonts?`, description: `${capSlug} enforces a character limit on bio fields that applies regardless of font style. Most fancy characters count as 1 character each. Treat your bio as having roughly the same character budget with or without FontGen.art styling - if the plain-text bio fits, the styled version will too.` },
      { title: `Do these fonts look the same on Android and iPhone?`, description: `For the most part, yes. The major character sets FontGen.art uses render consistently across modern iOS and Android. A small number of decorative styles - heart-wrapped, star-wrapped - may render with very slight differences between operating systems, but the overall look stays consistent.` },
      { title: `Can I switch back to a normal font on ${capSlug}?`, description: `Yes. Simply type new text into any ${capSlug} field without going through FontGen.art - the platform's default font takes over again. FontGen.art does not modify your ${capSlug} account, does not install a font file on your device, and does not change any settings.` },
    ];
  }

  // type === "generator"
  return [
    { title: `What is FontGen.art's ${slugTitle} font generator?`, description: `A free, browser-based tool that converts any text into themed styles that match the ${slugTitle} aesthetic, plus 100+ other fancy fonts for variety. Featured style: ${featuredTitle}. Output is plain styled text that pastes directly into Instagram, TikTok, Discord, Facebook, X, and anywhere else text is accepted.` },
    { title: `How do I use the ${slugTitle} fonts in my post?`, description: `Type your post text into the input box at the top of this page. Watch the ${featuredTitle} result appear in the first card alongside 100+ other styles in the result list. Click Copy on the card whose look matches your post - the styled text goes to your clipboard with a green "Copied!" confirmation. Paste anywhere.` },
    { title: `Do the ${slugTitle} fonts work on Instagram?`, description: `Yes. fancy characters paste cleanly into Instagram bios, captions, display names, and story text on both mobile and desktop. Classic typography styles (bold, italic, sans, monospace) tend to render universally; exotic styles are slightly more likely to be filtered by Instagram's input sanitization.` },
    { title: `Do the ${slugTitle} fonts work on TikTok?`, description: `Yes. The styled text renders in TikTok bios, captions, comments, and usernames on both iPhone and Android. Some display-name fields have stricter character limits, so very long phrases may need trimming. The TikTok mobile app renders consistently across iOS and Android.` },
    { title: `Do the ${slugTitle} fonts work on Discord?`, description: `Yes, and Discord is one of the most permissive platforms for fancy text. Discord accepts the full range in server names, channel names, channel topics, role names, role colors, nicknames, status messages, and chat content. Popular for seasonal server banners.` },
    { title: `Can I use the ${slugTitle} fonts in a design project?`, description: `Yes. Paste the styled text into any design tool that accepts text - Figma, Canva, Adobe Photoshop, Adobe Illustrator, Sketch, Inkscape, Procreate, most web-based design tools. On systems with limited font fallbacks you may need a system-emoji-rich face like Apple Color Emoji, Segoe UI Emoji, or Noto Color Emoji.` },
    { title: `Are the ${slugTitle} fonts free to use?`, description: `Yes, completely free. FontGen.art does not charge for any of the 100+ styles on the page. No signup, no paywall, no email verification, no limit on how many times you copy. Use in personal posts, commercial projects, brand bios, paid advertising, merchandise - the styled characters are public, free for any use.` },
    { title: `Does the ${slugTitle} generator send my text to a server?`, description: `No. Conversion happens entirely in your browser using a bundled character lookup table. Whatever text you type - a ${slugTitle} greeting, holiday message, brand bio, sensitive draft - stays on your device. No network requests with your text, no logged drafts, no third-party data brokers.` },
    { title: `How long can my ${slugTitle} post be?`, description: `The platform you post to enforces the character limit, not FontGen.art. Most platforms count characters at the same rate as plain text. Treat your post as having roughly the same character budget as your plain-text version. Common limits: Instagram bio 150, Twitter 280, Discord 2000, TikTok bio 80.` },
    { title: `Can I get more ${slugTitle} styles later?`, description: `Yes. FontGen.art adds new styles periodically - check back or use the category filter chips at the top of the result list. If you have a specific style you would like to see added, reach out via the contact page. The most-requested, highest-quality character additions are prioritized.` },
  ];
}

// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * Title-case helper — defined at the top of the file (above PAGES) so it
 * can be used by the related-keyword builder.
 */
function page_slug_in_title(): string {
  return _currentPage.slug.replace(/-/g, " ");
}
function page_featured_in_title(): string {
  return _currentPage.featuredStyleSlug.replace(/-/g, " ");
}

// ---------------------------------------------------------------------------
// Build the full message tree
// ---------------------------------------------------------------------------

function buildPageContent(page: PageDef) {
  _currentPage = page;
  const tdk = buildTdk(page);
  const head1 = buildHead1(page);

  // Per-page "whatis" copy — uses the angle to choose a different framing.
  const whatisDescription = WHATIS_TEMPLATES[page.whatisAngle](page);

  return {
    // TDK is consumed by `generateMetadata` on each page.
    seoTitle: tdk.title_i18n,
    seoDescription: tdk.description_i18n,
    seoKeywords: tdk.keywords_i18n,

    // H1 / hero region — the visible hero on the page itself.
    h1Title: head1.title_i18n,
    h1Subtitle: head1.description_i18n,
    heroCta: head1.buttonText_i18n,

    // 100-150 word style description (rendered between the widget and the
    // SEO sections, after the H1).
    styleDescription: STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.angle
      ? `${capitalize(page.featuredStyleSlug)} style: ${STYLE_DESCRIPTIONS[page.featuredStyleSlug].angle} ${STYLE_DESCRIPTIONS[page.featuredStyleSlug].useCases.length ? `Common uses include ${STYLE_DESCRIPTIONS[page.featuredStyleSlug].useCases.join(", ").toLowerCase()}.` : ""}`
      : `The featured style on this page is ${page.featuredStyleSlug}, plus 19 other fonts you can copy and paste anywhere.`,
    exampleEffects: [
      `${capitalize(page.featuredStyleSlug)}: ${STYLE_DESCRIPTIONS[page.featuredStyleSlug]?.tagline ?? "Featured style"}`,
      "Bold: Heavy sans-serif",
      "Cursive: Flowing script",
      "Bubble: Letters in circles",
      "Fraktur: Gothic blackletter",
    ],

    // 8 SEO sections consumed by SeoSections.
    head1: {
      ...head1,
      photo: "",
      photoThumbnail: "",
    },
    Whatis: {
      title_i18n: `What Is FontGen.art's ${capitalize(page.keyword)}?`,
      content: [
        {
          description_i18n: whatisDescription,
          buttonText_i18n: "Try It Now",
          buttonRoute: "#font-input",
          photo: "",
          photoThumbnail: "",
        },
      ],
    },
    howToUse: buildHowToUse(page),
    doWith: buildDoWith(page),
    Whois: buildWhois(page),
    youNeed: buildYouNeed(page),
    realVoices: buildRealVoices(page),
    faq: {
      title_i18n: `Frequently Asked Questions About ${capitalize(page.keyword)}`,
      buttonText_i18n: "Start Generating",
      buttonRoute: "#font-input",
      content: buildFaqForPage(page),
    },
  };
}

// ---------------------------------------------------------------------------
// Assemble the final JSON
// ---------------------------------------------------------------------------

function buildMessages(): Record<string, unknown> {
  const messages: Record<string, unknown> = {
    nav: {
      home: "Home",
      styles: "Styles",
      about: "About",
    },
    footer: {
      tagline: "Free font generator. Type any text, get 100+ fancy fonts in seconds - copy and paste anywhere.",
      styles: "Font Styles",
      platforms: "For Platforms",
      themes: "Themes",
      quickLinks: "Quick Links",
      support: "Support",
    },
    pages: {
      home: buildPageContent(PAGES[0]),
    },
    legal: {
      // Generic copy reused across About / Contact / Privacy / Terms pages.
      aboutTitle: "About FontGen.art",
      aboutContent: "FontGen.art is a free font generator that converts any text into 100+ fancy font styles. The tool runs entirely in your browser, never asks for a signup, and never sends your text to a server. Paste the styled output into Instagram, TikTok, Discord, Facebook, X (Twitter), or anywhere else text is supported. FontGen.art is funded by its maintainer as a public utility, not as a venture-backed product, which is why every style is enabled for every visitor from day one with no gating.",
      contactTitle: "Contact FontGen.art",
      contactContent: "FontGen.art is run by a small independent team. The fastest way to reach us is by email at the address below. We read every message and aim to reply within two business days. Common reasons to write: bug reports, feature requests, style suggestions, partnership inquiries, and takedown requests. FontGen.art does not run a paid support tier and does not offer phone support — email is the only channel, by design.",
      contactEmail: "support@fontgen.art",
      privacyTitle: "Privacy Policy",
      privacyContent: "FontGen.art ('we', 'us', 'the site') is a free font generator. This policy explains what information we collect, how we use it, and what choices you have. By using FontGen.art you agree to the practices described below.",
      termsTitle: "Terms of Service",
      termsContent: "These Terms of Service ('Terms') govern your use of FontGen.art (the 'Site'). By accessing or using the Site you agree to be bound by these Terms. If you do not agree, do not use the Site.",
    },
  };

  // Group landing pages by type for cleaner JSON.
  const pages = messages.pages as Record<string, unknown>;
  const fonts: Record<string, unknown> = {};
  const fors: Record<string, unknown> = {};
  const generators: Record<string, unknown> = {};

  for (const page of PAGES.slice(1)) {
    const content = buildPageContent(page);
    if (page.type === "fonts") fonts[page.slug] = content;
    else if (page.type === "for") fors[page.slug] = content;
    else if (page.type === "generator") generators[page.slug] = content;
  }

  pages.fonts = fonts;
  pages.for = fors;
  pages.generator = generators;

  return messages;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const messages = buildMessages();
  const out = JSON.stringify(messages, null, 2);

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(here, "..", "messages", "en.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out + "\n", "utf8");

  // Stats — useful sanity check that all pages got content.
  const stats = {
    totalPages: PAGES.length,
    homePages: 1,
    fontPages: PAGES.filter((p) => p.type === "fonts").length,
    forPages: PAGES.filter((p) => p.type === "for").length,
    generatorPages: PAGES.filter((p) => p.type === "generator").length,
    fileBytes: out.length,
  };
  console.log("[build-content] wrote", outPath);
  console.log("[build-content] stats:", stats);
}

main();