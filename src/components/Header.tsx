"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND_NAME } from "@/lib/seo";
import { Wordmark } from "@/components/Wordmark";
import {
  FONT_LANDING_PAGES,
  PLATFORM_LANDING_PAGES,
  THEME_LANDING_PAGES,
  landingPath,
} from "@/lib/landing-pages";

/**
 * Site-wide header with two distinct navigation modes:
 *
 *   Desktop (md+) — 3 first-level buttons render INLINE on the header bar,
 *   to the right of the logo. Clicking any of them opens a panel beneath
 *   the header showing that section's second-level links. Clicking the
 *   same button again, or pressing Escape, closes the panel.
 *
 *   Mobile (<md) — only a hamburger button is shown, anchored to the LEFT
 *   of the logo. Tapping it opens a full-width panel beneath the header
 *   containing all three sections stacked vertically. The panel scrolls
 *   internally so the page underneath doesn't move while the user
 *   explores the menu.
 *
 * Both panels render into the static HTML so search-engine crawlers see
 * all 50 internal links without executing JavaScript.
 */
type SectionKey = "styles" | "platforms" | "themes";

export function Header() {
  // Desktop: which first-level section is currently expanded (null = closed).
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  // Mobile: whether the hamburger panel is open.
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);

  // Sort each list by descending search volume so the highest-traffic
  // pages surface first (matches the footer's link column ordering).
  const styles = [...FONT_LANDING_PAGES].sort((a, b) => b.vol - a.vol);
  const platforms = [...PLATFORM_LANDING_PAGES].sort((a, b) => b.vol - a.vol);
  const themes = [...THEME_LANDING_PAGES].sort((a, b) => b.vol - a.vol);

  const sectionData: Record<SectionKey, { title: string; items: Array<{ href: string; label: string }> }> = {
    styles: {
      title: "Styles",
      items: styles.map((p) => ({
        href: landingPath("fonts", p.slug),
        label: humanize(p.keyword),
      })),
    },
    platforms: {
      title: "For Platforms",
      items: platforms.map((p) => ({
        href: landingPath("for", p.slug),
        label: `For ${capitalize(p.slug)}`,
      })),
    },
    themes: {
      title: "Themes",
      items: themes.map((p) => ({
        href: landingPath("generator", p.slug),
        label: `${capitalize(p.slug)} Fonts`,
      })),
    },
  };

  // Close on Escape; close on outside-click. Applies to whichever
  // panel is currently open (desktop OR mobile).
  useEffect(() => {
    if (!activeSection && !mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveSection(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setActiveSection(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [activeSection, mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md"
    >
      {/* Header bar — same height on every breakpoint */}
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        {/* Mobile hamburger — anchored to the LEFT of the logo */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu-panel"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-alt hover:text-ink md:hidden"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-ink"
          aria-label={`${BRAND_NAME} home`}
          onClick={() => {
            setActiveSection(null);
            setMobileOpen(false);
          }}
        >
          <Image
            src="/logo.png"
            alt={`${BRAND_NAME} logo`}
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-md"
          />
          <Wordmark className="text-base" suffixClassName="text-[0.65em] font-medium" />
        </Link>

        {/* Desktop first-level nav — sits INLINE on the header bar,
            to the right of the logo. Click a button to open the panel
            beneath. */}
        <nav
          className="ml-auto hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {(Object.keys(sectionData) as SectionKey[]).map((key) => {
            const isOpen = activeSection === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setActiveSection((prev) => (prev === key ? null : key))
                }
                aria-expanded={isOpen}
                aria-controls={`desktop-menu-panel-${key}`}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isOpen
                    ? "bg-surface-alt text-ink"
                    : "text-ink-soft hover:bg-surface-alt hover:text-ink"
                }`}
              >
                {sectionData[key].title}
                <ChevronIcon className={isOpen ? "rotate-180" : ""} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop panel — one per section, only the active one renders */}
      {(Object.keys(sectionData) as SectionKey[]).map((key) => {
        const isOpen = activeSection === key;
        return (
          <div
            key={key}
            id={`desktop-menu-panel-${key}`}
            role="region"
            aria-label={`${sectionData[key].title} menu`}
            aria-hidden={!isOpen}
            className={`absolute left-0 right-0 top-full hidden border-b border-border bg-surface shadow-lg transition-all duration-200 ease-out md:block ${
              isOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">
                {sectionData[key].title}
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
                {sectionData[key].items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setActiveSection(null)}
                      className="block rounded-md px-2 py-1.5 text-ink-soft transition-colors hover:bg-surface-alt hover:text-ink"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}

      {/* Mobile panel — all three sections stacked, scrolls internally */}
      <div
        id="mobile-menu-panel"
        role="region"
        aria-label="Site navigation"
        aria-hidden={!mobileOpen}
        className={`absolute left-0 right-0 top-full border-b border-border bg-surface shadow-lg transition-all duration-200 ease-out md:hidden ${
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {/* max-h + overflow-y-auto lets the menu scroll independently
            of the page underneath, so long lists (12 styles + 5 + 5)
            never push the page or block scrolling. */}
        <div className="mx-auto max-h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6 sm:px-6">
          <div className="grid gap-8">
            {(Object.keys(sectionData) as SectionKey[]).map((key) => (
              <div key={key}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">
                  {sectionData[key].title}
                </h3>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  {sectionData[key].items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-2 py-1.5 text-ink-soft transition-colors hover:bg-surface-alt hover:text-ink"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${className}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
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