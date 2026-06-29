import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/seo";
import { Wordmark } from "@/components/Wordmark";
import {
  FONT_LANDING_PAGES,
  PLATFORM_LANDING_PAGES,
  THEME_LANDING_PAGES,
  landingPath,
} from "@/lib/landing-pages";
import { CollapsibleFooterColumn } from "@/components/CollapsibleFooterColumn";

/**
 * Site-wide footer. Rendered by `layout.tsx`, so it appears on every page
 * (existing and future) without further wiring.
 *
 * Three content columns cross-link every sibling landing page in the
 * topical cluster (Styles / For Platforms / Themes) — this is the SEO
 * spec's standard footer convention for boosting internal-link authority
 * across the long-tail pages. A fourth Support column exposes the
 * "about / contact / feedback / FAQ" entry points.
 *
 * The Styles column ships all 40 pages to the DOM (so search crawlers
 * see every internal link) but uses a collapsible client component to
 * keep the default footer view tidy.
 *
 * FontGen.art is fully free with no signup or accounts, so every contact
 * route resolves to a single support inbox.
 */
const SUPPORT_EMAIL = "support@fontgen.art";

export function Footer() {
  const year = new Date().getFullYear();

  // Sort by descending volume so the top-of-list links are the highest-
  // traffic pages, not the most-recently added ones. The Styles column
  // gets ALL 40 entries (not sliced) — the collapsible component decides
  // how many to show by default.
  const styles = [...FONT_LANDING_PAGES].sort((a, b) => b.vol - a.vol);
  const platforms = [...PLATFORM_LANDING_PAGES].sort((a, b) => b.vol - a.vol);
  const themes = [...THEME_LANDING_PAGES].sort((a, b) => b.vol - a.vol);

  return (
    <footer className="mt-auto border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16">
          {/* Left: brand + tagline */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold text-ink"
            >
              <Image
                src="/logo.png"
                alt={`${BRAND_NAME} logo`}
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg"
              />
              <Wordmark className="text-base" suffixClassName="text-[0.65em] font-medium" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Free font generator. Type any text, get 100+ fancy
              fonts in seconds — copy and paste anywhere.
            </p>
          </div>

          {/* Right: four link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <CollapsibleFooterColumn
              title="Styles"
              items={styles.map((p) => ({
                href: landingPath("fonts", p.slug),
                label: humanize(p.keyword),
              }))}
              initialCount={12}
            />

            <FooterColumn title="For Platforms">
              {platforms.map((p) => (
                <FooterLink key={p.slug} href={landingPath("for", p.slug)}>
                  For {capitalize(p.slug)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="Themes">
              {themes.map((p) => (
                <FooterLink key={p.slug} href={landingPath("generator", p.slug)}>
                  {capitalize(p.slug)} Fonts
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title="Support">
              <FooterLink href="/about">About FontGen.art</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href={`mailto:${SUPPORT_EMAIL}?subject=FontGen.art%20Feedback`}>
                Feedback
              </FooterLink>
              <FooterLink href="/#faq">FAQ</FooterLink>
            </FooterColumn>
          </div>
        </div>

        {/* Bottom row: copyright + Buildlist badge + legal links */}
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-border pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p>
              © {year} {BRAND_NAME}.art — A free font generator.
            </p>
            <a
              href="https://buildlist.io"
              target="_blank"
              rel="noopener"
              aria-label="Featured on Buildlist"
            >
              {/* External SVG badge — using <img> instead of next/image to avoid
                  needing `images.remotePatterns` config for a 3rd-party asset. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://buildlist.io/badge.svg"
                alt="Featured on Buildlist"
                style={{ height: "40px", width: "auto" }}
              />
            </a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/privacy"
              prefetch={false}
              className="transition hover:text-accent"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              prefetch={false}
              className="transition hover:text-accent"
            >
              Terms of Service
            </Link>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="transition hover:text-accent"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-ink-soft">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        prefetch={false}
        className="transition hover:text-accent"
      >
        {children}
      </Link>
    </li>
  );
}

/** "instagram bio font generator" → "Instagram Bio Font Generator". */
function humanize(keyword: string): string {
  return keyword
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}