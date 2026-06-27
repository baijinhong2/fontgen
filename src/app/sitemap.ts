import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import {
  ALL_LANDING_PAGES,
  FONT_LANDING_PAGES,
  PLATFORM_LANDING_PAGES,
  THEME_LANDING_PAGES,
  landingPath,
} from "@/lib/landing-pages";

/**
 * Sitemap policy:
 *   - All static public pages (home, about, contact, privacy, terms)
 *   - All landing pages (fonts / for / generator) with volume-weighted
 *     priorities
 *   - All other cluster pages at a flat 0.6 priority
 *
 * No hreflang: FontGen.art is single-locale (English), so each page has
 * exactly one canonical URL. Search engines don't need a language map.
 *
 * Priority logic:
 *   - Homepage = 1.0 (highest)
 *   - Highest-volume landing pages (>=10000 monthly searches) = 0.9
 *   - Mid-volume (>=3000) = 0.8
 *   - Long-tail = 0.6
 *   - Legal pages = 0.3
 *
 * lastmod = launch date (real, fixed). The site is content-static; we don't
 * ship daily changes that would warrant a different lastmod.
 */
const SITE_LAUNCH_DATE = new Date("2026-06-28T00:00:00Z");

const STATIC_PATHS: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

function volumeScore(vol: number): number {
  if (vol >= 10000) return 0.9;
  if (vol >= 3000) return 0.8;
  return 0.6;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const { path, priority, changeFrequency } of STATIC_PATHS) {
    entries.push({
      url: absoluteUrl(path),
      lastModified: SITE_LAUNCH_DATE,
      changeFrequency,
      priority,
    });
  }

  // Landing pages (fonts / for / generator), grouped for clarity
  for (const page of FONT_LANDING_PAGES) {
    entries.push({
      url: `${SITE_URL}${landingPath("fonts", page.slug)}`,
      lastModified: SITE_LAUNCH_DATE,
      changeFrequency: "monthly",
      priority: volumeScore(page.vol),
    });
  }
  for (const page of PLATFORM_LANDING_PAGES) {
    entries.push({
      url: `${SITE_URL}${landingPath("for", page.slug)}`,
      lastModified: SITE_LAUNCH_DATE,
      changeFrequency: "monthly",
      priority: volumeScore(page.vol),
    });
  }
  for (const page of THEME_LANDING_PAGES) {
    entries.push({
      url: `${SITE_URL}${landingPath("generator", page.slug)}`,
      lastModified: SITE_LAUNCH_DATE,
      changeFrequency: "monthly",
      priority: volumeScore(page.vol),
    });
  }

  return entries;
}