# FontGen.art

Free Unicode font generator — type any text, instantly see it in 20+ fancy
fonts, copy and paste anywhere. No signup, no ads, no backend.

**Domain:** fontgen.art
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4

## Quickstart

```bash
npm install
cp .env.example .env   # fill in NEXT_PUBLIC_GSC_VERIFICATION when ready
npm run build
npm start              # production server on http://localhost:3000
# or
npm run dev            # dev mode with HMR
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx            Root layout — header, footer, GSC verification
│   ├── page.tsx              Home page (font generator widget + SEO sections)
│   ├── about/                About page
│   ├── contact/              Contact page
│   ├── privacy/              Privacy policy
│   ├── terms/                Terms of service
│   ├── not-found.tsx         404 fallback
│   ├── sitemap.ts            /sitemap.xml (47 entries)
│   ├── robots.ts             /robots.txt
│   ├── fonts/[style]/        32 style landing pages (cursive, gothic, …)
│   ├── for/[platform]/       5 platform landing pages (instagram, discord, …)
│   └── generator/[theme]/    5 themed landing pages (christmas, y2k, …)
├── components/
│   ├── FontGenerator.tsx     The interactive widget (client component)
│   ├── SeoSections.tsx       Renders the 8 SEO blocks from messages/en.json
│   ├── LandingPage.tsx       Shared layout for fonts / for / generator pages
│   ├── Header.tsx            Sticky site header
│   ├── Footer.tsx            Footer with cluster internal links
│   └── LegalPage.tsx         Shared about / contact / privacy / terms layout
└── lib/
    ├── fonts.ts              20 Unicode font maps + helpers
    ├── landing-pages.ts      Registry of all /fonts, /for, /generator pages
    └── seo.ts                SITE_URL, absoluteUrl, brand constants

messages/
└── en.json                   All SEO content (43 pages × TDK + 8 sections)

public/
├── favicon.ico               Multi-size (16/32/48/64) ICO
├── favicon-16x16.png         16×16 PNG
├── favicon-32x32.png         32×32 PNG
├── favicon-48x48.png         48×48 PNG
├── favicon-64x64.png         64×64 PNG
├── apple-touch-icon.png      180×180 PNG
└── og.png                    1200×630 OG card

scripts/
├── build-content.ts          Regenerates messages/en.json (43 pages)
└── build-assets.py           Regenerates favicon + OG assets
```

## SEO content

All page copy lives in `messages/en.json`. To regenerate (after adding a
new page to `src/lib/landing-pages.ts`):

```bash
npx tsx scripts/build-content.ts
```

The script produces **~43 pages × 8 SEO blocks** of content, each
slightly varied per page to avoid duplicate-content penalties. Strict
counts follow the project SEO spec:

- 3 steps in `howToUse`
- 4 feature blocks in `doWith`
- 3 audience groups in `Whois`
- 3 advantages in `youNeed`
- 6 reviews in `realVoices` (rating 4.9 overall, "From {{review_count}} Reviews")
- 10 FAQs in `faq`

All H2s follow the `{{brand_name}}'s {{core_keywords}}` question format.
All page titles end with `| FontGen.art`.

## Google Search Console verification

Set `NEXT_PUBLIC_GSC_VERIFICATION` in your deploy environment to the
HTML-tag verification token from Google Search Console. Next.js injects
the `<meta name="google-site-verification" content="...">` tag on every
page automatically.

Same pattern for Bing Webmaster via `NEXT_PUBLIC_BING_VERIFICATION`.

## Deployment

This site is fully static — every page is pre-rendered at build time
(SSG). Deploy to any static host:

```bash
npm run build           # produces .next/
npm start               # serves the built output
```

Vercel auto-detects Next.js and runs `npm run build` on push. Set
`NEXT_PUBLIC_BASE_URL=https://fontgen.art` as a project env var.

## Adding a new landing page

1. Append an entry to the relevant array in `src/lib/landing-pages.ts`
   (one of `FONT_LANDING_PAGES`, `PLATFORM_LANDING_PAGES`, or
   `THEME_LANDING_PAGES`).
2. Run `npx tsx scripts/build-content.ts` to generate the matching
   `pages.{type}.{slug}` namespace in `messages/en.json`. Hand-tune the
   generated copy for higher quality on high-traffic pages.
3. (Optional) Add a per-style sample text to the `SAMPLES`,
   `PLATFORM_SAMPLES`, or `THEME_SAMPLES` map in the route file so the
   widget lands a context-relevant example.

The dynamic route picks up the new page automatically via
`generateStaticParams`.