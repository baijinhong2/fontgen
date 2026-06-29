import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { BRAND_NAME, DEFAULT_OG_IMAGE, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SITE_URL } from "@/lib/seo";

// Mobile browser top-bar color (Safari iOS, Chrome Android, Edge).
// Moved out of `metadata` because Next.js 15+ puts viewport-related
// fields in a dedicated `viewport` export.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0a1f" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${BRAND_NAME}.art`,
    default: `${BRAND_NAME}.art - Free Font Generator`,
  },
  description:
    "Free font generator. Type any text and instantly see it in 100+ fancy fonts - cursive, bold, gothic, bubble, and more. Copy and paste to Instagram, TikTok, Discord, Facebook, or anywhere else.",
  applicationName: `${BRAND_NAME}.art`,
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: `${BRAND_NAME}.art`,
    locale: "en_US",
    title: `${BRAND_NAME}.art - Free Font Generator`,
    description:
      "Free font generator. Type any text and instantly see it in 100+ fancy fonts - cursive, bold, gothic, bubble, and more. Copy and paste anywhere.",
    url: SITE_URL,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: `${BRAND_NAME} - Free Font Generator`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME}.art - Free Font Generator`,
    description:
      "Free font generator. Type any text and instantly see it in 100+ fancy fonts - copy and paste anywhere.",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    // Declared biggest-first so browsers / Googlebot pick the largest
    // available. Google requires favicon >= 48px to render in SERPs —
    // declaring 48x48 and 64x64 explicitly covers that requirement even
    // on browsers that don't open the multi-size .ico.
    icon: [
      { url: "/favicon-64x64.png", type: "image/png", sizes: "64x64" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? {
          "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION,
        }
      : undefined,
  },
};

// WebSite JSON-LD — emitted on every page via the root layout. Defines
// the site as a single entity for Google Knowledge Graph and powers the
// Sitelinks Searchbox in some SERPs.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${BRAND_NAME}.art`,
  alternateName: "FontGen",
  url: SITE_URL,
  description:
    "Free font generator with 100+ fancy font styles. Type any text and copy fancy fonts to Instagram, TikTok, Discord, Facebook, and more.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: `${BRAND_NAME}.art`,
    url: SITE_URL,
    // Logo must be a square (or near-square) image — Google rejects
    // text-heavy OG banners as Organization logos. /logo.png is the
    // 256x256 square brand mark used in the header next to the wordmark.
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 256,
      height: 256,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <StructuredData data={websiteJsonLd} />
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-ink antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}