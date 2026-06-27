"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Footer column with a collapsible "Show more / Show less" affordance.
 *
 * The Styles column lists 40 pages, which is too many for a footer's
 * default view. Render the top N by default (the highest-volume pages
 * are passed first), then offer an inline button to expand the rest.
 *
 * Server-rendered: the full link list is in the static HTML so search
 * crawlers see every internal link — the expand/collapse only affects
 * visibility, not what gets shipped.
 */
export function CollapsibleFooterColumn({
  title,
  items,
  initialCount = 12,
}: {
  title: string;
  items: Array<{ href: string; label: string }>;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;
  // Don't render the toggle at all when there's nothing to hide — keeps
  // the footer clean for short columns (For Platforms, Themes, Support).
  const showToggle = items.length > initialCount;

  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-ink-soft">
        {visible.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              prefetch={false}
              className="transition hover:text-accent"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
        >
          {expanded ? (
            <>
              Show less
              <ChevronIcon className="rotate-180" />
            </>
          ) : (
            <>
              Show all {items.length}
              <ChevronIcon />
            </>
          )}
        </button>
      )}
    </div>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
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