import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — allow every crawler everywhere on the site. No rate
 * limit, no crawl-delay, no disallow rules. FontGen.art is content-static
 * so search engines can crawl the whole thing without restrictions.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}