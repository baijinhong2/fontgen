import type { Metadata } from "next";
import {
  absoluteUrl,
  BRAND_NAME,
  DEFAULT_OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "@/lib/seo";
import messages from "../../messages/en.json";

type LegalKind = "about" | "contact" | "privacy" | "terms";

type Props = {
  kind: LegalKind;
};

const PAGE_META: Record<LegalKind, { path: string; title: string; description: string }> = {
  about: {
    path: "/about",
    title: `About FontGen.art - Free Font Generator`,
    description: `About FontGen.art - a free, browser-based font generator with 100+ styles. Type any text and copy fancy fonts anywhere. No signup, no installs.`,
  },
  contact: {
    path: "/contact",
    title: `Contact FontGen.art - Support & Feedback`,
    description: `Contact the FontGen.art team. Send feedback, feature requests, or bug reports to support@fontgen.art. We read every message.`,
  },
  privacy: {
    path: "/privacy",
    title: `Privacy Policy - FontGen.art Free Font Generator`,
    description: `FontGen.art's privacy policy. We do not collect, store, or transmit the text you type. Conversion happens entirely in your browser.`,
  },
  terms: {
    path: "/terms",
    title: `Terms of Service - FontGen.art Free Font Generator`,
    description: `FontGen.art's terms of service. The generated fancy text is free to use for any personal or commercial purpose. No account required.`,
  },
};

const SUPPORT_EMAIL = "support@fontgen.art";
// Manual keep-alive date so the policy stays current without a CMS.
const POLICY_EFFECTIVE = "January 1, 2026";

/**
 * Returns the page-specific Metadata for a legal route. Must be re-exported
 * from each `app/{route}/page.tsx` as `generateMetadata` so Next.js picks
 * it up — exporting it from a shared component file does NOT work
 * because Next.js scans `page.tsx` for `generateMetadata`, not its
 * imports.
 */
export function getLegalMetadata(kind: LegalKind): Metadata {
  const meta = PAGE_META[kind];
  const url = absoluteUrl(meta.path);
  const imageUrl = absoluteUrl(DEFAULT_OG_IMAGE);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: `${BRAND_NAME} - Free Font Generator`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [imageUrl],
    },
  };
}

export function LegalPage({ kind }: Props) {
  const meta = PAGE_META[kind];
  const legal = (messages as unknown as { legal: Record<string, string> }).legal;
  let body: React.ReactNode;
  switch (kind) {
    case "about":
      body = (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {legal.aboutTitle}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            {legal.aboutContent}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat title="100+" subtitle="Fancy font styles" />
            <Stat title="0" subtitle="Server requests per conversion" />
            <Stat title="Free" subtitle="No signup, no paywall, no ads inside the result list" />
          </div>
        </>
      );
      break;
    case "contact":
      body = (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {legal.contactTitle}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            {legal.contactContent}
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-surface-alt p-6">
            <p className="text-sm font-semibold text-ink-soft">Support email</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-1 block text-lg font-bold text-accent hover:text-accent-hover"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-3 text-sm text-ink-faint">
              Typical reply time: within two business days.
            </p>
          </div>
        </>
      );
      break;
    case "privacy":
      body = (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {legal.privacyTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-faint">
            Effective: {POLICY_EFFECTIVE}
          </p>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            {legal.privacyContent}
          </p>

          <H2>1. Information we collect</H2>
          <P>
            FontGen.art is designed to collect as little as possible. The
            text you type in the input box is processed entirely inside
            your browser using a bundled character lookup table
            and is never transmitted to our servers. We do not require an
            account, an email address, or any other identifier to use
            the tool.
          </P>
          <P>
            The only information our infrastructure sees is the standard
            HTTP request metadata required to deliver the page itself:
            your IP address (as seen by the CDN), the user-agent string
            your browser sends, and the URL of the page you requested.
            This metadata is logged by our hosting provider for
            operational purposes (capacity planning, abuse mitigation,
            debugging) and is not joined with any other data source.
          </P>

          <H2>2. Cookies, local storage, and tracking</H2>
          <P>
            FontGen.art does not set any cookies. The site does not use
            localStorage, sessionStorage, IndexedDB, or any other browser
            storage mechanism to record what you type. The site does not
            load third-party analytics scripts, advertising scripts,
            pixel tags, or session-replay tools. There are no tracking
            cookies, no fingerprinting, and no cross-site identifiers
            placed by FontGen.art.
          </P>

          <H2>3. How we use information</H2>
          <P>
            We use the request metadata described in Section 1 only to
            deliver the Site, monitor aggregate traffic patterns, and
            respond to abuse. We do not sell, rent, lease, or otherwise
            share this information with third parties for marketing or
            advertising purposes.
          </P>

          <H2>4. Third-party services</H2>
          <P>
            The Site is hosted on a content delivery network. The CDN
            provider receives the request metadata described in Section 1
            as part of serving the page. The CDN provider is contractually
            bound to use this metadata only for the purpose of operating
            the service. The Site may link to third-party platforms
            (Instagram, TikTok, Discord, X, Facebook, and similar) but
            FontGen.art does not embed content from those platforms,
            does not place cookies on their behalf, and does not receive
            any data from them when you simply visit a FontGen.art page.
          </P>
          <P>
            If you voluntarily contact us by email, we will receive your
            email address and the contents of your message. We use that
            information solely to respond to your inquiry and to improve
            the Site. We do not add you to a mailing list and we do not
            share your email with third parties.
          </P>

          <H2>5. Data retention</H2>
          <P>
            Request metadata logs are retained by our hosting provider
            for the minimum period required to operate the service (no
            more than 30 days) and are then deleted or anonymized.
            Email correspondence is retained only as long as necessary
            to address your inquiry and is then deleted from active
            systems; archived copies may persist in standard backup
            rotation for up to 12 months.
          </P>

          <H2>6. Your rights</H2>
          <P>
            Because we do not collect personal data through the Site, most
            data-subject rights (access, deletion, portability) do not
            apply in the typical sense. If you have contacted us by
            email and would like a copy of the correspondence, or would
            like that correspondence deleted, write to{" "}
            <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>{" "}
            and we will action your request within 30 days.
          </P>

          <H2>7. Children's privacy</H2>
          <P>
            FontGen.art is not directed at children under 13 and we do
            not knowingly collect personal information from children. If
            you believe a child has provided personal information to us
            via email, contact{" "}
            <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>{" "}
            and we will delete it.
          </P>

          <H2>8. International transfers</H2>
          <P>
            FontGen.art is operated from servers that may be located
            outside your country of residence. By using the Site you
            understand that your request metadata may be processed in
            the country where the relevant CDN edge is located.
          </P>

          <H2>9. Changes to this policy</H2>
          <P>
            We may update this policy from time to time. The effective
            date at the top of the page will reflect the most recent
            change. Material changes will be noted on this page; your
            continued use of the Site after a change indicates acceptance
            of the updated policy.
          </P>

          <H2>10. Contact</H2>
          <P>
            Questions about this policy can be sent to{" "}
            <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
          </P>
        </>
      );
      break;
    case "terms":
      body = (
        <>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {legal.termsTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-faint">
            Effective: {POLICY_EFFECTIVE}
          </p>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            {legal.termsContent}
          </p>

          <H2>1. Use of the Site</H2>
          <P>
            FontGen.art is provided free of charge for any lawful
            purpose. You may use the tool to generate styled fancy text
            for personal, educational, or commercial projects without
            attribution. No account registration is required, and no
            payment is accepted.
          </P>

          <H2>2. Ownership of generated output</H2>
          <P>
            The styled text produced by FontGen.art consists of
            standardized characters drawn from the public character set
            used across the web and modern devices. These characters
            themselves are not owned by anyone and carry no usage
            restrictions. The
            selection, arrangement, and presentation of those characters
            on FontGen.art is provided to you under a worldwide,
            royalty-free, non-exclusive license to use for any purpose,
            including commercial use.
          </P>
          <P>
            FontGen.art, the Site name, the logo, and the underlying
            source code are owned by the Site operator and are protected
            by applicable copyright and trademark law. Nothing in these
            Terms grants you any right to use the FontGen.art name,
            logo, or branding without prior written permission.
          </P>

          <H2>3. Acceptable use</H2>
          <P>
            You agree not to use FontGen.art, or any output generated by
            it, to:
          </P>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-ink-soft">
            <li>
              produce content that is unlawful, defamatory, harassing,
              hateful, or deceptive in your jurisdiction;
            </li>
            <li>
              impersonate any person, brand, or entity in a way that is
              likely to deceive a reasonable reader;
            </li>
            <li>
              attempt to reverse-engineer, scrape, or otherwise extract
              the underlying character lookup tables or source code at a
              rate that materially degrades the Site for other users;
            </li>
            <li>
              bypass any rate limits, abuse filters, or technical
              safeguards we put in place to protect the Site.
            </li>
          </ul>

          <H2>4. Third-party platforms</H2>
          <P>
            The output of FontGen.art is intended for use on third-party
            platforms such as Instagram, TikTok, Discord, Facebook, X
            (Twitter), WhatsApp, and similar services. Each of those
            platforms has its own terms of service and content policies.
            FontGen.art does not control how third-party platforms
            render, store, or display the styled text, and we do not
            guarantee that the output will appear identically across all
            platforms or devices. Some platforms strip certain uncommon
            characters in specific input fields; that behavior is a
            property of the platform, not of FontGen.art.
          </P>
          <P>
            FontGen.art is not affiliated with, endorsed by, or
            sponsored by Instagram, TikTok, Discord, Meta, X Corp., or
            any other third-party platform. All trademarks referenced on
            the Site belong to their respective owners.
          </P>

          <H2>5. Disclaimer of warranties</H2>
          <P>
            The Site is provided &quot;as is&quot; and &quot;as available&quot;, without
            warranty of any kind, express or implied, including but not
            limited to the implied warranties of merchantability,
            fitness for a particular purpose, and non-infringement. We
            do not warrant that the Site will be uninterrupted,
            error-free, secure, or free of harmful components, or that
            defects will be corrected.
          </P>

          <H2>6. Limitation of liability</H2>
          <P>
            To the maximum extent permitted by applicable law, in no
            event will the Site operator, its contributors, or its
            affiliates be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or
            relating to your use of (or inability to use) the Site,
            including but not limited to platform bans, account
            restrictions, display issues, lost data, or lost profits,
            even if the operator has been advised of the possibility of
            such damages.
          </P>

          <H2>7. Indemnification</H2>
          <P>
            You agree to indemnify and hold harmless the Site operator
            from any claim arising out of your use of the Site or your
            violation of these Terms, including any claim that the
            styled text you generated infringes the rights of a third
            party.
          </P>

          <H2>8. Modifications to the service</H2>
          <P>
            We may add, remove, or change features, styles, or pages at
            any time without notice. We may also suspend or discontinue
            the Site in full or in part; if we do, the styled text you
            have already copied continues to work because the characters
            are part of a public standard.
          </P>

          <H2>9. Changes to these Terms</H2>
          <P>
            We may update these Terms from time to time. The effective
            date at the top of the page will reflect the most recent
            change. Material changes will be noted on this page. Your
            continued use of the Site after a change indicates
            acceptance of the updated Terms.
          </P>

          <H2>10. Governing law</H2>
          <P>
            These Terms are governed by the laws of the jurisdiction in
            which the Site operator is established, without regard to
            its conflict-of-laws principles. If any provision of these
            Terms is held unenforceable, the remaining provisions will
            remain in full force and effect.
          </P>

          <H2>11. Contact</H2>
          <P>
            Questions about these Terms can be sent to{" "}
            <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
          </P>
        </>
      );
      break;
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {body}
    </article>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-2xl font-bold tracking-tight text-ink">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-base leading-relaxed text-ink-soft">
      {children}
    </p>
  );
}

function A({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="font-medium text-accent transition hover:text-accent-hover"
    >
      {children}
    </a>
  );
}

function Stat({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt p-5">
      <div className="text-3xl font-extrabold text-accent">{title}</div>
      <div className="mt-1 text-sm text-ink-soft">{subtitle}</div>
    </div>
  );
}