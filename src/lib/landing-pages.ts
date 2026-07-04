/**
 * SEO long-tail page registry.
 *
 * Single source of truth for every `/fonts/*`, `/for/*`, and `/generator/*`
 * landing page on the site. Used by:
 *   - the dynamic routes themselves (to resolve content + featured style)
 *   - the footer (to render every sibling link in the topical cluster)
 *   - the sitemap (to emit all entries)
 *   - the home page category sections (to surface trending landing pages)
 *
 * Adding a new page just means appending an entry here and adding the
 * matching i18n namespace in `messages/en.json` — `next build` picks it up
 * automatically.
 *
 * Each page has a featured `styleSlug` from `lib/fonts.ts` that determines
 * which Unicode block the widget on that landing page is biased toward.
 * Other styles still appear in the full results list, but the page's hero
 * copy and SEO content focus on the featured style.
 */

export type FontPageSlug = string & { readonly __brand: "FontPageSlug" };

export type FontLandingPage = {
  /** URL-safe identifier; appears in `/fonts/{slug}`. */
  slug: string;
  /** Slug of the featured `FontStyle` from `lib/fonts.ts`. */
  styleSlug: string;
  /**
   * The literal keyword this page targets. Lowercase, as users search.
   * Drives the H1 phrasing and the page's `head1.title` in SEO content.
   */
  keyword: string;
  /** Intent cluster — used for footer grouping + analytics rollups. */
  intentType: "style" | "scene" | "theme" | "platform";
  /** Approximate monthly search volume (US) for sitemap priority. */
  vol: number;
};

/**
 * All `/fonts/*` landing pages. Ordered by descending search volume so the
 * highest-traffic pages surface first in the footer link column.
 */
export const FONT_LANDING_PAGES: readonly FontLandingPage[] = [
  // P0 — must-have, high-volume core styles
  { slug: "cursive", styleSlug: "cursive", keyword: "cursive font generator", intentType: "style", vol: 49500 },
  { slug: "bold", styleSlug: "bold", keyword: "bold font generator", intentType: "style", vol: 33100 },
  { slug: "gothic", styleSlug: "fraktur", keyword: "gothic font generator", intentType: "style", vol: 33100 },
  { slug: "italic", styleSlug: "italic", keyword: "italic font generator", intentType: "style", vol: 22200 },
  { slug: "bubble", styleSlug: "bubble", keyword: "bubble font generator", intentType: "style", vol: 18100 },
  { slug: "tattoo", styleSlug: "fraktur", keyword: "tattoo font generator", intentType: "style", vol: 14800 },
  { slug: "discord", styleSlug: "bold-cursive", keyword: "discord font generator", intentType: "style", vol: 14800 },
  { slug: "instagram", styleSlug: "cursive", keyword: "instagram font generator", intentType: "style", vol: 14800 },
  { slug: "cute", styleSlug: "bubble", keyword: "cute font generator", intentType: "style", vol: 12100 },
  { slug: "minecraft", styleSlug: "squared", keyword: "minecraft font generator", intentType: "style", vol: 8100 },
  { slug: "facebook", styleSlug: "bold", keyword: "facebook font generator", intentType: "style", vol: 8100 },
  { slug: "meme", styleSlug: "squared", keyword: "meme font generator", intentType: "style", vol: 6600 },
  { slug: "old-english", styleSlug: "fraktur", keyword: "old english font generator", intentType: "style", vol: 5400 },
  { slug: "3d", styleSlug: "squared", keyword: "3d font generator", intentType: "style", vol: 4400 },
  { slug: "graffiti", styleSlug: "bold-fraktur", keyword: "graffiti font generator", intentType: "style", vol: 3600 },
  { slug: "small", styleSlug: "small-caps", keyword: "small font generator", intentType: "style", vol: 2900 },
  { slug: "tiny", styleSlug: "small-caps", keyword: "tiny font generator", intentType: "style", vol: 2400 },

  // P1 — long-tail, copyright-safe variants
  { slug: "fraktur", styleSlug: "fraktur", keyword: "fraktur font generator", intentType: "style", vol: 2400 },
  { slug: "papyrus", styleSlug: "cursive", keyword: "papyrus font generator", intentType: "style", vol: 1900 },
  { slug: "western", styleSlug: "bold-fraktur", keyword: "western font generator", intentType: "style", vol: 1900 },
  { slug: "y2k", styleSlug: "squared", keyword: "y2k font generator", intentType: "style", vol: 4400 },
  { slug: "christmas", styleSlug: "bold-cursive", keyword: "christmas font generator", intentType: "scene", vol: 3600 },
  { slug: "rainbow", styleSlug: "cursive", keyword: "rainbow font generator", intentType: "style", vol: 2900 },
  { slug: "heavy-metal", styleSlug: "bold-fraktur", keyword: "heavy metal font generator", intentType: "style", vol: 2400 },
  { slug: "death-metal", styleSlug: "bold-fraktur", keyword: "death metal font generator", intentType: "style", vol: 1900 },
  { slug: "chicano", styleSlug: "bold-cursive", keyword: "chicano font generator", intentType: "style", vol: 2900 },
  { slug: "fire", styleSlug: "bold", keyword: "fire font generator", intentType: "style", vol: 4400 },
  { slug: "demon", styleSlug: "fraktur", keyword: "demon font generator", intentType: "style", vol: 2400 },
  { slug: "serif", styleSlug: "italic", keyword: "serif font generator", intentType: "style", vol: 6600 },
  { slug: "times-new-roman", styleSlug: "italic", keyword: "times new roman font generator", intentType: "style", vol: 5400 },
  { slug: "cross-stitch", styleSlug: "small-caps", keyword: "cross stitch font generator", intentType: "style", vol: 1900 },
  { slug: "big", styleSlug: "bold", keyword: "big font generator", intentType: "style", vol: 2900 },

  // P2 — newer Unicode styles added in v2 (smaller volume, but real search
  // intent). Each one maps to a real Unicode block we ship in the widget.
  { slug: "fullwidth", styleSlug: "fullwidth", keyword: "fullwidth font generator", intentType: "style", vol: 1900 },
  { slug: "heart", styleSlug: "heart", keyword: "heart font generator", intentType: "style", vol: 2900 },
  { slug: "sans-italic", styleSlug: "sans-italic", keyword: "sans italic font generator", intentType: "style", vol: 1300 },
  { slug: "sans-bold-italic", styleSlug: "sans-bold-italic", keyword: "sans bold italic font generator", intentType: "style", vol: 880 },
  { slug: "cyrillic", styleSlug: "cyrillic", keyword: "cyrillic font generator", intentType: "style", vol: 2400 },
  { slug: "currency", styleSlug: "currency", keyword: "currency font generator", intentType: "style", vol: 1100 },
  { slug: "wave", styleSlug: "wave", keyword: "wave font generator", intentType: "style", vol: 880 },
  { slug: "macron", styleSlug: "macron", keyword: "macron font generator", intentType: "style", vol: 720 },

  // P3 — high-ROI long-tail styles from CSV analysis (vol × (1 - KD/100)).
  // Each maps to an existing Unicode style or a freshly-added mapper
  // (freaky → Zalgo combiner added in v8).
  { slug: "calligraphy", styleSlug: "bold-cursive", keyword: "calligraphy font generator", intentType: "style", vol: 8100 },
  { slug: "freaky", styleSlug: "freaky", keyword: "freaky font generator", intentType: "style", vol: 4400 },
  { slug: "metal", styleSlug: "bold-fraktur", keyword: "metal font generator", intentType: "style", vol: 2400 },
  { slug: "comic-sans", styleSlug: "sans-serif", keyword: "comic sans font generator", intentType: "style", vol: 1600 },
  { slug: "impact", styleSlug: "bold", keyword: "impact font generator", intentType: "style", vol: 1600 },

  // P4 — long-tail family variants and reverse-keyword forms.
  // font-meme and fancy-fraktur mirror existing mappers (squared, bold-fraktur)
  // but target distinct keyword strings / search intents.
  { slug: "font-meme", styleSlug: "squared", keyword: "font meme generator", intentType: "style", vol: 880 },
  { slug: "fancy-fraktur", styleSlug: "bold-fraktur", keyword: "fancy fraktur font generator", intentType: "style", vol: 720 },
];

/**
 * `/for/{slug}` platform landing pages. Each page targets users searching
 * for a font generator for a specific social platform.
 */
export const PLATFORM_LANDING_PAGES: readonly FontLandingPage[] = [
  {
    slug: "instagram",
    styleSlug: "cursive",
    keyword: "fancy fonts for instagram",
    intentType: "platform",
    vol: 40500,
  },
  {
    slug: "discord",
    styleSlug: "bold-cursive",
    keyword: "fancy fonts for discord",
    intentType: "platform",
    vol: 33100,
  },
  {
    slug: "tiktok",
    styleSlug: "bold",
    keyword: "fancy fonts for tiktok",
    intentType: "platform",
    vol: 22200,
  },
  {
    slug: "facebook",
    styleSlug: "bold",
    keyword: "fancy fonts for facebook",
    intentType: "platform",
    vol: 18100,
  },
  {
    slug: "twitter",
    styleSlug: "italic",
    keyword: "fancy fonts for twitter",
    intentType: "platform",
    vol: 14800,
  },
];

/**
 * `/generator/{slug}` theme landing pages. Each page targets a thematic
 * occasion (Christmas, Halloween) or aesthetic (Y2K, Aesthetic).
 */
export const THEME_LANDING_PAGES: readonly FontLandingPage[] = [
  { slug: "christmas", styleSlug: "bold-cursive", keyword: "christmas fancy fonts", intentType: "scene", vol: 8100 },
  { slug: "halloween", styleSlug: "fraktur", keyword: "halloween fancy fonts", intentType: "scene", vol: 6600 },
  { slug: "y2k", styleSlug: "squared", keyword: "y2k aesthetic fonts", intentType: "theme", vol: 5400 },
  { slug: "aesthetic", styleSlug: "cursive", keyword: "aesthetic fancy fonts", intentType: "theme", vol: 14800 },
  { slug: "cool", styleSlug: "bold", keyword: "cool fancy fonts", intentType: "theme", vol: 18100 },
];

/** All landing pages in one flat list, for sitemap generation. */
export const ALL_LANDING_PAGES: readonly FontLandingPage[] = [
  ...FONT_LANDING_PAGES,
  ...PLATFORM_LANDING_PAGES,
  ...THEME_LANDING_PAGES,
];

/** Build the path for a landing page given its type and slug. */
export function landingPath(
  type: "fonts" | "for" | "generator",
  slug: string,
): string {
  return `/${type}/${slug}`;
}

/** Look up a landing page by its full path. */
export function getLandingByPath(path: string): FontLandingPage | null {
  if (path.startsWith("/fonts/")) {
    const slug = path.slice("/fonts/".length);
    return FONT_LANDING_PAGES.find((p) => p.slug === slug) ?? null;
  }
  if (path.startsWith("/for/")) {
    const slug = path.slice("/for/".length);
    return PLATFORM_LANDING_PAGES.find((p) => p.slug === slug) ?? null;
  }
  if (path.startsWith("/generator/")) {
    const slug = path.slice("/generator/".length);
    return THEME_LANDING_PAGES.find((p) => p.slug === slug) ?? null;
  }
  return null;
}