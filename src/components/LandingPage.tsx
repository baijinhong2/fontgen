import type { Metadata } from "next";
import { FontGenerator } from "@/components/FontGenerator";
import { SeoSections } from "@/components/SeoSections";
import { StructuredData } from "@/components/StructuredData";
import messages from "../../messages/en.json";
import { absoluteUrl, DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, BRAND_NAME, SITE_URL } from "@/lib/seo";
import { getFontStyle } from "@/lib/fonts";

/**
 * Shared landing-page layout used by every `/fonts/*`, `/for/*`, and
 * `/generator/*` route. Each route passes its own `namespace` (which is
 * also the URL slug, minus the leading `pages.` prefix and the parent
 * collection name) and the `collectionName` (used only for breadcrumbs /
 * debugging — not rendered).
 *
 * The page composition follows the project SEO spec:
 *   1. Widget at top
 *   2. H1 + subtitle in the middle (separate from the widget, so the
 *      widget's auto-focused input doesn't compete with the heading)
 *   3. 100-150 word style description (the per-page unique copy that
 *      keeps Google from treating these as duplicates)
 *   4. 3-5 example effects (static previews, no typing required)
 *   5. SEO content sections from the JSON
 *
 * Each landing page reuses the same FontGenerator component, so the actual
 * conversion UX is identical to the home page — only the page chrome and
 * the featured style bias change.
 */
export function LandingPage({
  namespace,
  featuredStyleSlug,
  sampleText,
}: {
  namespace: string;
  featuredStyleSlug: string;
  sampleText?: string;
}) {
  const page = readPage(namespace);
  if (!page) return null;

  // FAQPage JSON-LD — emitted server-side so crawlers see it without
  // executing JS. Only renders when the page actually has FAQ entries.
  const faqItems = extractFaqEntries(page.faq);
  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((it) => ({
            "@type": "Question",
            name: it.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: it.description,
            },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && <StructuredData data={faqJsonLd} />}

      {/* Widget */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <FontGenerator
            featuredStyleSlug={featuredStyleSlug}
            sampleText={sampleText}
          />
        </div>
      </section>

      {/* H1 + subtitle */}
      <section className="border-b border-border bg-surface-alt">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {page.h1Title}
          </h1>
          <p className="mt-5 text-base text-ink-soft sm:text-lg">
            {page.h1Subtitle}
          </p>
        </div>
      </section>

      {/* Style description (100-150 words) — unique per page to avoid
          duplicate-content penalties across the long-tail cluster. */}
      {page.styleDescription && (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <p className="text-base leading-relaxed text-ink-soft">
              {page.styleDescription}
            </p>
          </div>
        </section>
      )}

      {/* 3-5 example effects — let the visitor see the styled output
          without having to type anything. Renders 5 cards with sample
          text in the featured style plus 4 alternates. */}
      <ExampleEffects
        featuredStyleSlug={featuredStyleSlug}
        examples={page.exampleEffects ?? []}
      />

      {/* SEO sections from the JSON */}
      <SeoSections namespace={namespace} />
    </>
  );
}

/**
 * Extract {title, description} pairs from the FAQ section's content
 * array. The JSON shape is `{ content: [{ title_i18n, description_i18n,
 * ... }] }` so we look for both naming conventions.
 */
function extractFaqEntries(
  faqSection: Record<string, unknown> | undefined,
): Array<{ title: string; description: string }> {
  if (!faqSection) return [];
  const content = (faqSection.content ?? faqSection.items) as
    | Array<Record<string, unknown>>
    | undefined;
  if (!Array.isArray(content)) return [];
  const out: Array<{ title: string; description: string }> = [];
  for (const item of content) {
    const title = (item.title_i18n ?? item.title) as string | undefined;
    const description = (item.description_i18n ?? item.description) as
      | string
      | undefined;
    if (title && description) out.push({ title, description });
  }
  return out;
}

function ExampleEffects({
  featuredStyleSlug,
  examples,
}: {
  featuredStyleSlug: string;
  examples: string[];
}) {
  // Render the 5 examples as static preview cards. Each card shows the
  // styled text in its own Unicode block, with the style name above.
  return (
    <section className="border-b border-border bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Preview {featuredStyleSlug.replace(/-/g, " ")} and other styles
          </h2>
          <p className="mt-3 text-base text-ink-soft">
            Type anything in the box above to convert your own text.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examples.slice(0, 6).map((label, i) => (
            <PreviewCard
              key={i}
              label={label}
              isFeatured={i === 0}
              featuredStyleSlug={featuredStyleSlug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewCard({
  label,
  isFeatured,
}: {
  label: string;
  isFeatured: boolean;
  featuredStyleSlug: string;
}) {
  // Each preview card shows a sample phrase (the same one users see when
  // they first land) in a different Unicode style. Implemented as a thin
  // wrapper around the generator's `convertAll` so the preview always
  // matches what users see when they type.
  //
  // To avoid pulling the whole FontGenerator client bundle just for
  // previews, we import the static registry and convert inline.
  const sampleText = "Hello";
  const styleName = label.split(":")[0]?.trim() ?? label;
  const preview = getPreviewForName(styleName, sampleText);

  return (
    <div
      className={`rounded-2xl border bg-surface p-4 ${
        isFeatured
          ? "border-accent-border bg-accent-soft/40"
          : "border-border"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        {label}
        {isFeatured && (
          <span className="ml-2 inline-flex items-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        )}
      </div>
      <div className="fontgen-output mt-2 break-words text-ink">
        {preview}
      </div>
    </div>
  );
}

function getPreviewForName(styleName: string, text: string): string {
  // Map the example-effect label (e.g. "Cursive") to its registry slug.
  const nameToSlug: Record<string, string> = {
    "Bold": "bold",
    "Italic": "italic",
    "Cursive": "cursive",
    "Bold Cursive": "bold-cursive",
    "Fraktur": "fraktur",
    "Bold Fraktur": "bold-fraktur",
    "Double-Struck": "double-struck",
    "Monospace": "monospace",
    "Sans Serif": "sans-serif",
    "Bold Italic": "bold-italic",
    "Small Caps": "small-caps",
    "Strikethrough": "strikethrough",
    "Underline": "underline",
    "Double Underline": "double-underline",
    "Overline": "overline",
    "Subscript": "subscript",
    "Superscript": "superscript",
    "Bubble": "bubble",
    "Squared": "squared",
    "Upside Down": "upside-down",
    "Sans Italic": "sans-italic",
    "Sans Bold Italic": "sans-bold-italic",
    "Fullwidth": "fullwidth",
    "Parenthesized": "parenthesized",
    "Circled": "circled",
    "Heart": "heart",
    "Star": "star",
    "Diamond": "diamond",
    "Slash Frame": "slash-frame",
    "Cyrillic": "cyrillic",
    "Currency": "currency",
    "Wave": "wave",
    "Dot Above": "dot-above",
    "Breve": "breve",
    "Macron": "macron",
    "Ring": "ring",
  };
  const slug = nameToSlug[styleName] ?? "cursive";
  const style = getFontStyle(slug);
  return style ? style.map(text) : text;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type PageRecord = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  h1Title: string;
  h1Subtitle: string;
  heroCta: string;
  styleDescription?: string;
  exampleEffects?: string[];
  head1?: Record<string, unknown>;
  Whatis?: Record<string, unknown>;
  howToUse?: Record<string, unknown>;
  doWith?: Record<string, unknown>;
  Whois?: Record<string, unknown>;
  youNeed?: Record<string, unknown>;
  realVoices?: Record<string, unknown>;
  faq?: Record<string, unknown>;
};

function readPage(namespace: string): PageRecord | null {
  const parts = namespace.split(".");
  let cursor: unknown = (messages as Record<string, unknown>).pages;
  for (const p of parts) {
    if (!cursor || typeof cursor !== "object") return null;
    cursor = (cursor as Record<string, unknown>)[p];
  }
  return (cursor as PageRecord | undefined) ?? null;
}

/**
 * Build the per-page Metadata object for a given namespace + URL path.
 * Centralised here so every landing page route can call it identically.
 */
export function buildLandingMetadata(
  namespace: string,
  path: string,
): Metadata {
  const page = readPage(namespace);
  if (!page) return {};
  const title = page.seoTitle;
  const description = page.seoDescription;
  const keywords = page.seoKeywords;
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}