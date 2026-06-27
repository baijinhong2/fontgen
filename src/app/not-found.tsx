import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-base text-ink-soft">
        That URL doesn't match any FontGen.art page. Try the home page or
        pick a popular style below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover"
        >
          Font Generator
        </Link>
        <Link
          href="/fonts/cursive"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-ink transition hover:border-border-strong"
        >
          Cursive Font
        </Link>
        <Link
          href="/fonts/bold"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-ink transition hover:border-border-strong"
        >
          Bold Font
        </Link>
        <Link
          href="/fonts/gothic"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-ink transition hover:border-border-strong"
        >
          Gothic Font
        </Link>
      </div>
    </div>
  );
}