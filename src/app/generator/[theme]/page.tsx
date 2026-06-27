import { notFound } from "next/navigation";
import {
  LandingPage,
  buildLandingMetadata,
} from "@/components/LandingPage";
import { THEME_LANDING_PAGES, landingPath } from "@/lib/landing-pages";
import { getFontStyle } from "@/lib/fonts";

type Props = {
  params: Promise<{ theme: string }>;
};

/**
 * `/generator/[theme]` — themed landing pages (Christmas, Halloween, Y2K,
 * etc.). Pre-rendered at build time.
 */
export function generateStaticParams() {
  return THEME_LANDING_PAGES.map((p) => ({ theme: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { theme } = await params;
  const page = THEME_LANDING_PAGES.find((p) => p.slug === theme);
  if (!page) return {};
  return buildLandingMetadata(
    `generator.${theme}`,
    landingPath("generator", theme),
  );
}

export default async function ThemePage({ params }: Props) {
  const { theme } = await params;
  const page = THEME_LANDING_PAGES.find((p) => p.slug === theme);
  if (!page) notFound();
  const featuredStyle = getFontStyle(page.styleSlug);
  if (!featuredStyle) notFound();

  return (
    <LandingPage
      namespace={`generator.${theme}`}
      featuredStyleSlug={page.styleSlug}
      sampleText={THEME_SAMPLES[theme] ?? "Hello"}
    />
  );
}

const THEME_SAMPLES: Record<string, string> = {
  christmas: "Merry Christmas",
  halloween: "Trick or treat",
  y2k: "Y2K vibes",
  aesthetic: "main character",
  cool: "too cool",
};