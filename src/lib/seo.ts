/**
 * Single source of truth for the public-facing base URL and absolute path
 * helpers. Every page that emits a canonical URL, OG image URL, or sitemap
 * entry must go through here so we never end up with `localhost` URLs
 * leaking into production metadata.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_BASE_URL` env (set per-environment on the host)
 *   2. Hardcoded fallback `https://fontgen.art`
 *
 * `NEXT_PUBLIC_BASE_URL` should be the full origin including scheme, with no
 * trailing slash (e.g. `https://fontgen.art`).
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "https://fontgen.art";

export const BRAND_NAME = "FontGen" as const;

/**
 * Default OG image used when a page doesn't ship its own. Lives in
 * `public/og.png`. We use the conventional filename so that crawlers and
 * link-preview tools (Twitter, Slack, LinkedIn, Googlebot) find it even
 * when a page forgets to set an explicit `openGraph.images`.
 */
export const DEFAULT_OG_IMAGE = "/og.png";

/**
 * OG image dimensions — fixed at the 1.91:1 social-card standard so link
 * previews look consistent across platforms.
 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Build an absolute URL from a path. Empty `path` is allowed and yields
 * the site root. Always returns a string with no trailing slash (except
 * for the bare origin itself).
 */
export function absoluteUrl(path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${SITE_URL}${normalized}`;
}