"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FONT_STYLES,
  convertAll,
  getFontStyle,
  getStylesByCategory,
  type FontCategory,
  type FontStyle,
} from "@/lib/fonts";

/**
 * Default sample text shown in the input before the user types anything.
 * Keeps the result list visually populated so the page never looks broken
 * on first load — the whole point of a font generator is "see it before
 * you commit", and an empty list fails that promise.
 */
const DEFAULT_SAMPLE = "Hello world";

type Props = {
  /**
   * If set, the widget surfaces this style's preview as the **first** result
   * card, and the input starts pre-filled with the landing page's sample
   * phrase. Otherwise the widget uses the default sample + alphabetical
   * order.
   */
  featuredStyleSlug?: string;
  /**
   * Optional sample phrase for the input. Lands a curated, context-relevant
   * starter on `/fonts/cursive`, `/for/instagram`, etc. instead of the
   * generic "Hello world".
   */
  sampleText?: string;
};

/**
 * The main interactive font generator widget. Renders the input field, the
 * category filter chips, and the grid of converted results. Each card has
 * its own Copy button that swaps to "Copied!" on success.
 *
 * Conversion runs entirely in the browser — there's no API call, no
 * network round-trip, and no fonts to download. The Unicode character
 * table is bundled into the JS payload so the result list updates within
 * the same animation frame as the keystroke.
 */
export function FontGenerator({ featuredStyleSlug, sampleText }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<string>(sampleText ?? DEFAULT_SAMPLE);
  const [debounced, setDebounced] = useState<string>(sampleText ?? DEFAULT_SAMPLE);
  const [category, setCategory] = useState<FontCategory | "all">("all");
  // Most-recently-copied slug; used to swap the card's button label.
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Debounce the input → state so long pastes don't re-render every keystroke.
  // 200ms feels instant and lets the input feel responsive.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 200);
    return () => clearTimeout(t);
  }, [text]);

  // Featured style (if any) bubbles to the top of the result list.
  const orderedStyles = useMemo<FontStyle[]>(() => {
    if (!featuredStyleSlug) return [...FONT_STYLES];
    const featured = getFontStyle(featuredStyleSlug);
    if (!featured) return [...FONT_STYLES];
    return [featured, ...FONT_STYLES.filter((s) => s.slug !== featuredStyleSlug)];
  }, [featuredStyleSlug]);

  // Filter by category without losing the featured-first ordering.
  const visibleStyles = useMemo<FontStyle[]>(() => {
    if (category === "all") return orderedStyles;
    return orderedStyles.filter((s) => s.category === category);
  }, [orderedStyles, category]);

  // Run the conversion once per debounced input. `convertAll` returns null
  // entries for empty input so we can render the placeholder gracefully.
  const results = useMemo(() => convertAll(debounced), [debounced]);

  async function copy(slug: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedSlug(slug);
      // Reset the "Copied!" label after a moment so the user knows it's
      // safe to click again. 1500ms matches GitHub's PR-copy affordance.
      setTimeout(() => {
        setCopiedSlug((current) => (current === slug ? null : current));
      }, 1500);
    } catch {
      // Older browsers / non-secure contexts fall back to a hidden
      // textarea. Rarely hit on modern Chrome/Safari/Firefox, but kept
      // so copy still works on weird embedded WebViews.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopiedSlug(slug);
        setTimeout(() => {
          setCopiedSlug((current) => (current === slug ? null : current));
        }, 1500);
      } catch {
        // Last-resort: leave the button alone so the user can manually
        // select + copy the text.
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  const categoryCounts = useMemo(() => {
    const counts = getStylesByCategory();
    return {
      all: FONT_STYLES.length,
      classic: counts.classic.length,
      decorative: counts.decorative.length,
      accent: counts.accent.length,
      game: counts.game.length,
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Input row — sticky shell handled by parent */}
      <div className="relative">
        <label htmlFor="font-input" className="sr-only">
          Type your text
        </label>
        <input
          ref={inputRef}
          id="font-input"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here"
          // scroll-mt-* offsets the sticky header (h-14 = 56px) plus a
          // little breathing room so the input lands fully visible below
          // it when a CTA like "Try FontGen Free" jumps to #font-input.
          className="w-full scroll-mt-20 rounded-2xl border border-border bg-surface py-4 pl-4 pr-12 text-lg text-ink placeholder:text-ink-faint outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-xl"
          aria-label="Text to convert"
        />
        {text && (
          <button
            type="button"
            onClick={() => {
              setText("");
              inputRef.current?.focus();
            }}
            aria-label="Clear input"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition hover:bg-surface-alt hover:text-ink"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={category === "all"}
          onClick={() => setCategory("all")}
          label="All"
          count={categoryCounts.all}
        />
        <FilterChip
          active={category === "classic"}
          onClick={() => setCategory("classic")}
          label="Classic"
          count={categoryCounts.classic}
        />
        <FilterChip
          active={category === "decorative"}
          onClick={() => setCategory("decorative")}
          label="Decorative"
          count={categoryCounts.decorative}
        />
        <FilterChip
          active={category === "accent"}
          onClick={() => setCategory("accent")}
          label="Accent"
          count={categoryCounts.accent}
        />
        <FilterChip
          active={category === "game"}
          onClick={() => setCategory("game")}
          label="Game"
          count={categoryCounts.game}
        />
      </div>

      {/* Results grid — 2 columns on tablet, 1 on mobile.
          Featured style (if any) gets `featured: true` styling to pop.
          The whole card is clickable to copy, with the explicit Copy
          button preserved for affordance and screen-reader support. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleStyles.map((style, i) => {
          const value = results[FONT_STYLES.findIndex((s) => s.slug === style.slug)];
          const isFeatured = style.slug === featuredStyleSlug;
          const isCopied = copiedSlug === style.slug;
          const clickable = Boolean(value);
          const onCardActivate = () => {
            if (value) copy(style.slug, value);
          };
          return (
            <article
              key={style.slug}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : -1}
              aria-label={
                clickable ? `Copy ${style.name} text` : undefined
              }
              onClick={onCardActivate}
              onKeyDown={(e) => {
                if (!clickable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCardActivate();
                }
              }}
              className={`group relative flex flex-col gap-2 rounded-2xl border bg-surface p-4 transition select-none ${
                clickable ? "cursor-pointer" : ""
              } ${
                isFeatured
                  ? "border-accent-border bg-accent-soft/40 shadow-sm"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    {style.name}
                    {isFeatured && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Featured
                      </span>
                    )}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (value) copy(style.slug, value);
                  }}
                  disabled={!value}
                  aria-label={`Copy ${style.name} text`}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isCopied
                      ? "bg-success text-white"
                      : value
                        ? "bg-accent text-white hover:bg-accent-hover"
                        : "cursor-not-allowed bg-surface-alt text-ink-faint"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div
                className="fontgen-output min-h-[3rem] break-words text-ink"
                aria-live="polite"
              >
                {value ?? (
                  <span className="text-ink-faint">
                    Type something to preview {style.name.toLowerCase()}…
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {visibleStyles.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-ink-soft">
          No styles in this category yet — try another filter.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-accent-border bg-accent-soft text-accent-hover"
          : "border-border bg-surface text-ink-soft hover:border-border-strong hover:text-ink"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
          active ? "bg-accent text-white" : "bg-surface-alt text-ink-faint"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
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
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}