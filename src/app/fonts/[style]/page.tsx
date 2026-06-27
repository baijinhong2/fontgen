import { notFound } from "next/navigation";
import {
  LandingPage,
  buildLandingMetadata,
} from "@/components/LandingPage";
import { FONT_LANDING_PAGES, landingPath } from "@/lib/landing-pages";
import { getFontStyle } from "@/lib/fonts";

type Props = {
  params: Promise<{ style: string }>;
};

/**
 * Pre-render every Phase-1 SEO font page at build time so they're served
 * as static HTML with zero TTFB hit. Adding a new page just means
 * appending to `FONT_LANDING_PAGES` + the `pages.fonts` namespace in
 * `messages/en.json`.
 */
export function generateStaticParams() {
  return FONT_LANDING_PAGES.map((p) => ({ style: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { style } = await params;
  const page = FONT_LANDING_PAGES.find((p) => p.slug === style);
  if (!page) return {};
  return buildLandingMetadata(`fonts.${style}`, landingPath("fonts", style));
}

export default async function FontStylePage({ params }: Props) {
  const { style } = await params;
  const page = FONT_LANDING_PAGES.find((p) => p.slug === style);
  if (!page) notFound();
  // featured style is what the registry has — verify it exists in the
  // font registry before passing it down.
  const featuredStyle = getFontStyle(page.styleSlug);
  if (!featuredStyle) notFound();

  return (
    <LandingPage
      namespace={`fonts.${style}`}
      featuredStyleSlug={page.styleSlug}
      sampleText={SAMPLES[style] ?? "Hello"}
    />
  );
}

// Per-style starter text for the input field. Lands a curated, on-theme
// sample so the visitor sees immediately that the tool understands their
// intent before they even type.
const SAMPLES: Record<string, string> = {
  cursive: "Your Name",
  bold: "HEADLINE",
  italic: "Hello",
  gothic: "Blackletter",
  "old-english": "Medieval",
  graffiti: "Street Art",
  tattoo: "Forever",
  small: "subtle",
  tiny: "tiny text",
  cute: "cutie",
  "3d": "Bold",
  meme: "lol",
  bubble: "happy",
  discord: "Server Name",
  instagram: "your bio",
  facebook: "Hello world",
  minecraft: "Craft",
  papyrus: "ancient",
  serif: "Editorial",
  "times-new-roman": "Classic",
  western: "Howdy",
  christmas: "Merry",
  rainbow: "Colorful",
  fire: "Hot",
  "heavy-metal": "Metal",
  "death-metal": "Death",
  fraktur: "Gothic",
  y2k: "2000s",
  chicano: "Old School",
  "cross-stitch": "Crafted",
  big: "HUGE",
  demon: "Demonic",
  fullwidth: "Wide Text",
  heart: "love",
  "sans-italic": "Modern",
  "sans-bold-italic": "Bold Italic",
  cyrillic: "look alike",
  currency: "Money",
  wave: "~~~~",
  macron: "āēī",
};