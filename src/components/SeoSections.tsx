/**
 * SEO content section reader.
 *
 * Each long-tail landing page reads its 8 SEO blocks (head1, Whatis,
 * howToUse, doWith, Whois, youNeed, realVoices, faq) from a flat object
 * keyed by namespace, e.g. `pages.fonts.cursive`.
 *
 * Pages pass their `namespace` in via `SeoSections namespace="..."`, and
 * the component looks up the content tree accordingly. If a key is missing
 * (e.g. a half-migrated page) the corresponding section simply doesn't
 * render.
 */

import messages from "../../messages/en.json";

type AnyRecord = Record<string, unknown>;

type SeoBlockBase = {
  title_i18n?: string;
  description_i18n?: string;
  buttonText_i18n?: string;
  buttonRoute?: string;
  photo?: string;
  photoThumbnail?: string;
  ext1?: string;
  ext2_i18n?: string;
  ext3_i18n?: string;
};

type ContentItem = {
  // i18n-suffixed keys — preferred.
  title_i18n?: string;
  description_i18n?: string;
  buttonText_i18n?: string;
  buttonRoute?: string;
  photo?: string;
  photoThumbnail?: string;
  ext1?: string;
  ext2_i18n?: string;
  ext3_i18n?: string;
  // Plain key fallbacks — pickStr() reads these when the i18n version
  // is missing, so a content JSON can use either naming convention
  // without breaking render.
  title?: string;
  description?: string;
  buttonText?: string;
  ext2?: string;
  ext3?: string;
};

type SectionShape = SeoBlockBase & {
  content?: ContentItem[];
};

type SeoData = {
  head1: SectionShape | null;
  whatis: SectionShape | null;
  howToUse: SectionShape | null;
  doWith: SectionShape | null;
  whois: SectionShape | null;
  youNeed: SectionShape | null;
  realVoices: SectionShape | null;
  faq: SectionShape | null;
};

/**
 * Read the SEO blocks for a given namespace like `pages.fonts.cursive` or
 * `pages.home`. Returns `null` for any missing block so callers can render
 * only what's available.
 */
function readSeoData(namespace: string): SeoData {
  const root = (messages as AnyRecord).pages as AnyRecord | undefined;
  const parts = namespace.split(".");
  let cursor: AnyRecord | undefined = root;
  for (const p of parts) {
    if (!cursor) return allNull();
    cursor = cursor[p] as AnyRecord | undefined;
  }
  if (!cursor) return allNull();

  return {
    head1: (cursor.head1 as SectionShape | undefined) ?? null,
    whatis: (cursor.Whatis as SectionShape | undefined) ?? null,
    howToUse: (cursor.howToUse as SectionShape | undefined) ?? null,
    doWith: (cursor.doWith as SectionShape | undefined) ?? null,
    whois: (cursor.Whois as SectionShape | undefined) ?? null,
    youNeed: (cursor.youNeed as SectionShape | undefined) ?? null,
    realVoices: (cursor.realVoices as SectionShape | undefined) ?? null,
    faq: (cursor.faq as SectionShape | undefined) ?? null,
  };
}

function allNull(): SeoData {
  return {
    head1: null,
    whatis: null,
    howToUse: null,
    doWith: null,
    whois: null,
    youNeed: null,
    realVoices: null,
    faq: null,
  };
}

function pickStr(item: ContentItem | undefined, key: keyof ContentItem): string | undefined {
  if (!item) return undefined;
  const v = item[key];
  if (typeof v === "string") return v;
  // Fallbacks: accept both i18n-suffixed and plain key names so the
  // content JSON can use either convention without breaking render.
  if (key === "title_i18n" && typeof item.title === "string") return item.title;
  if (key === "description_i18n" && typeof item.description === "string") {
    return item.description;
  }
  if (key === "buttonText_i18n" && typeof item.buttonText === "string") {
    return item.buttonText;
  }
  if (key === "ext2_i18n" && typeof item.ext2 === "string") return item.ext2;
  if (key === "ext3_i18n" && typeof item.ext3 === "string") return item.ext3;
  return undefined;
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{description}</p>
      )}
    </div>
  );
}

function PrimaryCta({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-hover"
    >
      {children}
    </a>
  );
}

function Head1Section({ data }: { data: SectionShape }) {
  // Head1 is rendered as the H1 region on each landing page — the SeoSections
  // component normally skips it because the page already has its own H1.
  // Kept here for completeness; pages opt in via `showHead1`.
  const title = data.title_i18n ?? "";
  const description = data.description_i18n;
  const buttonText = data.buttonText_i18n;
  const buttonRoute = data.buttonRoute ?? "#font-input";
  return (
    <section className="border-b border-border bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 text-base text-ink-soft sm:text-lg">{description}</p>
        )}
        {buttonText && (
          <div className="mt-7">
            <PrimaryCta href={buttonRoute}>{buttonText}</PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

function WhatisSection({ data }: { data: SectionShape }) {
  const item = data.content?.[0];
  const description = pickStr(item, "description_i18n");
  const buttonText = pickStr(item, "buttonText_i18n") ?? "Try It Now";
  const buttonRoute = pickStr(item, "buttonRoute") ?? "#font-input";
  return (
    <section className="border-b border-border bg-surface-alt px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={data.title_i18n ?? ""} />
        {description && (
          <p className="text-base leading-relaxed text-ink-soft">{description}</p>
        )}
        <div className="mt-7 text-center">
          <PrimaryCta href={buttonRoute}>{buttonText}</PrimaryCta>
        </div>
      </div>
    </section>
  );
}

function HowToUseSection({ data }: { data: SectionShape }) {
  const steps = data.content ?? [];
  return (
    <section className="border-b border-border bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={data.title_i18n ?? ""} />
        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => {
            const stepTitle = pickStr(step, "title_i18n");
            const stepDesc = pickStr(step, "description_i18n");
            return (
              <li
                key={i}
                className="rounded-2xl border border-border bg-surface-alt p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {i + 1}
                </div>
                {stepTitle && (
                  <h3 className="text-base font-bold text-ink">{stepTitle}</h3>
                )}
                {stepDesc && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {stepDesc}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        {data.buttonText_i18n && (
          <div className="mt-8 text-center">
            <PrimaryCta href={data.buttonRoute ?? "#font-input"}>
              {data.buttonText_i18n}
            </PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

function DoWithSection({ data }: { data: SectionShape }) {
  const items = data.content ?? [];
  return (
    <section className="border-b border-border bg-surface-alt px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={data.title_i18n ?? ""}
          description={data.description_i18n}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const itemTitle = pickStr(item, "title_i18n");
            const itemDesc = pickStr(item, "description_i18n");
            const itemBtn = pickStr(item, "buttonText_i18n");
            const itemBtnRoute = pickStr(item, "buttonRoute");
            return (
              <article
                key={i}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                {itemTitle && (
                  <h3 className="text-base font-bold text-ink">{itemTitle}</h3>
                )}
                {itemDesc && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {itemDesc}
                  </p>
                )}
                {itemBtn && (
                  <div className="mt-4">
                    <a
                      href={itemBtnRoute ?? "#font-input"}
                      className="text-sm font-bold text-accent hover:text-accent-hover"
                    >
                      {itemBtn} →
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {data.buttonText_i18n && (
          <div className="mt-8 text-center">
            <PrimaryCta href={data.buttonRoute ?? "#font-input"}>
              {data.buttonText_i18n}
            </PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

function WhoisSection({ data }: { data: SectionShape }) {
  const items = data.content ?? [];
  return (
    <section className="border-b border-border bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={data.title_i18n ?? ""} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, i) => {
            const itemTitle = pickStr(item, "title_i18n");
            const itemDesc = pickStr(item, "description_i18n");
            return (
              <article
                key={i}
                className="rounded-2xl border border-border bg-surface-alt p-6"
              >
                {itemTitle && (
                  <h3 className="text-lg font-bold text-ink">{itemTitle}</h3>
                )}
                {itemDesc && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {itemDesc}
                  </p>
                )}
              </article>
            );
          })}
        </div>
        {data.buttonText_i18n && (
          <div className="mt-8 text-center">
            <PrimaryCta href={data.buttonRoute ?? "#font-input"}>
              {data.buttonText_i18n}
            </PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

function YouNeedSection({ data }: { data: SectionShape }) {
  const items = data.content ?? [];
  return (
    <section className="border-b border-border bg-surface-alt px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={data.title_i18n ?? ""} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, i) => {
            const itemTitle = pickStr(item, "title_i18n");
            const itemDesc = pickStr(item, "description_i18n");
            return (
              <article
                key={i}
                className="rounded-2xl border border-border bg-accent-soft/40 p-6"
              >
                {itemTitle && (
                  <h3 className="text-lg font-bold text-ink">{itemTitle}</h3>
                )}
                {itemDesc && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {itemDesc}
                  </p>
                )}
              </article>
            );
          })}
        </div>
        {data.buttonText_i18n && (
          <div className="mt-8 text-center">
            <PrimaryCta href={data.buttonRoute ?? "#font-input"}>
              {data.buttonText_i18n}
            </PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

function RealVoicesSection({ data }: { data: SectionShape }) {
  const items = data.content ?? [];
  // `ext2_i18n` top-level (e.g. "From 1127 Reviews") — single source for the
  // overall review count, per the SEO spec's hard rule that the count
  // appears nowhere else.
  const overallRating = data.ext1 ?? "4.9";
  const overallCount = data.ext2_i18n ?? "From 1000+ Reviews";
  return (
    <section className="border-b border-border bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={data.title_i18n ?? ""}
          description={`${overallRating} · ${overallCount}`}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const itemTitle = pickStr(item, "title_i18n");
            const itemDesc = pickStr(item, "description_i18n");
            const itemName = pickStr(item, "ext2_i18n") ?? pickStr(item, "ext2") ?? "A";
            const itemRole = pickStr(item, "ext3_i18n") ?? pickStr(item, "ext3") ?? "";
            const itemRating = pickStr(item, "ext1") ?? "5";
            return (
              <article
                key={i}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface-alt p-6"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {itemName.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {itemName && itemName !== "A" && (
                      <div className="truncate text-sm font-bold text-ink">
                        {itemName}
                      </div>
                    )}
                    {itemRole && (
                      <div className="truncate text-xs text-ink-faint">
                        {itemRole}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-amber-500">
                    ★ {itemRating}
                  </span>
                </div>
                {itemTitle && (
                  <h3 className="mt-1 text-base font-bold text-ink">{itemTitle}</h3>
                )}
                {itemDesc && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {itemDesc}
                  </p>
                )}
              </article>
            );
          })}
        </div>
        {data.buttonText_i18n && (
          <div className="mt-8 text-center">
            <PrimaryCta href={data.buttonRoute ?? "#font-input"}>
              {data.buttonText_i18n}
            </PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

function FaqSection({ data }: { data: SectionShape }) {
  const items = data.content ?? [];
  return (
    <section className="border-b border-border bg-surface-alt px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <SectionHeading title={data.title_i18n ?? ""} />
        <div className="space-y-3">
          {items.map((item, i) => {
            const itemTitle = pickStr(item, "title_i18n");
            const itemDesc = pickStr(item, "description_i18n");
            return (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-surface p-5 transition"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  <span>{itemTitle}</span>
                  <span className="text-accent transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                {itemDesc && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {itemDesc}
                  </p>
                )}
              </details>
            );
          })}
        </div>
        {data.buttonText_i18n && (
          <div className="mt-8 text-center">
            <PrimaryCta href={data.buttonRoute ?? "#font-input"}>
              {data.buttonText_i18n}
            </PrimaryCta>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Render the SEO content sections for a page.
 *
 * Layout convention (per project SEO spec):
 *   1. Functional widget on TOP (handled by the page itself, not here)
 *   2. H1 + subtitle in MIDDLE (handled by the page itself, not here)
 *   3. SEO sections (head1 → faq) at BOTTOM (this component)
 *
 * `showHead1` defaults to false because pages typically render their own
 * hero block. Pass true to render the head1 block from the JSON too — only
 * useful for pages without a custom hero.
 */
export function SeoSections({
  namespace,
  showHead1 = false,
}: {
  namespace: string;
  showHead1?: boolean;
}) {
  const data = readSeoData(namespace);

  return (
    <>
      {showHead1 && data.head1 && <Head1Section data={data.head1} />}
      {data.whatis && <WhatisSection data={data.whatis} />}
      {data.howToUse && <HowToUseSection data={data.howToUse} />}
      {data.doWith && <DoWithSection data={data.doWith} />}
      {data.whois && <WhoisSection data={data.whois} />}
      {data.youNeed && <YouNeedSection data={data.youNeed} />}
      {data.realVoices && <RealVoicesSection data={data.realVoices} />}
      {data.faq && <FaqSection data={data.faq} />}
    </>
  );
}