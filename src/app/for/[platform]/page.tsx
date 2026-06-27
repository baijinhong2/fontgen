import { notFound } from "next/navigation";
import {
  LandingPage,
  buildLandingMetadata,
} from "@/components/LandingPage";
import { PLATFORM_LANDING_PAGES, landingPath } from "@/lib/landing-pages";
import { getFontStyle } from "@/lib/fonts";

type Props = {
  params: Promise<{ platform: string }>;
};

/**
 * `/for/[platform]` — landing pages for users searching "fancy fonts for
 * {Instagram/Discord/...}". Pre-rendered at build time.
 */
export function generateStaticParams() {
  return PLATFORM_LANDING_PAGES.map((p) => ({ platform: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { platform } = await params;
  const page = PLATFORM_LANDING_PAGES.find((p) => p.slug === platform);
  if (!page) return {};
  return buildLandingMetadata(
    `for.${platform}`,
    landingPath("for", platform),
  );
}

export default async function PlatformPage({ params }: Props) {
  const { platform } = await params;
  const page = PLATFORM_LANDING_PAGES.find((p) => p.slug === platform);
  if (!page) notFound();
  const featuredStyle = getFontStyle(page.styleSlug);
  if (!featuredStyle) notFound();

  return (
    <LandingPage
      namespace={`for.${platform}`}
      featuredStyleSlug={page.styleSlug}
      sampleText={PLATFORM_SAMPLES[platform] ?? "Hello"}
    />
  );
}

const PLATFORM_SAMPLES: Record<string, string> = {
  instagram: "your bio here",
  discord: "Server Name",
  tiktok: "@username",
  facebook: "Hello world",
  twitter: "Display name",
};