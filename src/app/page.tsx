import type { Metadata } from "next";
import { FontGenerator } from "@/components/FontGenerator";
import { SeoSections } from "@/components/SeoSections";
import { StructuredData } from "@/components/StructuredData";
import { absoluteUrl, DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/seo";
import messages from "../../messages/en.json";

/**
 * Per-page metadata. Reads the TDK from the `pages.home` namespace in
 * `messages/en.json`. Each landing page does the same with its own
 * namespace.
 */
export async function generateMetadata(): Promise<Metadata> {
  const home = (messages.pages as Record<string, unknown>).home as Record<string, string>;
  const title = home.seoTitle;
  const description = home.seoDescription;
  const keywords = home.seoKeywords;
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/"),
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

export default function HomePage() {
  const home = (messages.pages as Record<string, unknown>).home as Record<string, string>;
  // FAQPage JSON-LD — pulls from the same FAQ section rendered below so
  // the structured data and the visible Q&A never drift.
  const faqSection = home.faq as
    | { content?: Array<{ title?: string; title_i18n?: string; description?: string; description_i18n?: string }> }
    | undefined;
  const faqItems = (faqSection?.content ?? [])
    .map((it) => ({
      title: it.title_i18n ?? it.title ?? "",
      description: it.description_i18n ?? it.description ?? "",
    }))
    .filter((it) => it.title && it.description);
  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((it) => ({
            "@type": "Question",
            name: it.title,
            acceptedAnswer: { "@type": "Answer", text: it.description },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && <StructuredData data={faqJsonLd} />}

      {/* Top: functional widget — the conversion surface that solves the
          user's problem on first glance. */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <FontGenerator featuredStyleSlug="cursive" sampleText="Hello world" />
        </div>
      </section>

      {/* Middle: H1 + subtitle — clearly answers "what does this site do". */}
      <section className="border-b border-border bg-surface-alt">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {home.h1Title}
          </h1>
          <p className="mt-5 text-base text-ink-soft sm:text-lg">
            {home.h1Subtitle}
          </p>
        </div>
      </section>

      {/* Bottom: SEO content sections — picked up from the JSON. */}
      <SeoSections namespace="home" />
    </>
  );
}