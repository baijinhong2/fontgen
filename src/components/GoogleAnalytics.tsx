/**
 * Google Analytics 4 loader. Renders nothing if NEXT_PUBLIC_GA_ID is
 * unset, so dev / preview / local builds without analytics configured
 * ship zero tracking code.
 *
 * Two pieces of behavior:
 *
 * 1. Initial load — emits the standard gtag.js loader + a one-time
 *    config call. The config call auto-emits a `page_view` for the
 *    first page the user lands on, which is what GA4 needs to start a
 *    session.
 *
 * 2. SPA route changes — Next.js App Router does NOT trigger a real
 *    navigation, so GA4's automatic page_view won't fire. We hook
 *    `usePathname` and re-emit config with `page_path` on every path
 *    change, which produces a page_view for each route. Without this
 *    hook every visit would be a single bounce on /.
 *
 * Why a Client Component and not raw <Script> in the layout? Because
 * `usePathname` requires being inside the App Router context, and the
 * effect that listens for it has to run in the browser. The two
 * <Script> tags themselves are SSR-safe (next/script handles
 * injection), so the gtag global is available before hydration.
 *
 * Why `afterInteractive` and not `beforeInteractive` / `lazyOnload`?
 * GA4 docs say `afterInteractive` is the default recommendation — it
 * doesn't block first paint but still loads quickly enough that no
 * navigation event is missed.
 */

"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();

  // Re-fire config on every route change so GA4 emits a page_view.
  // The initial config call below already covers the first page.
  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;
    window.gtag("config", GA_ID, { page_path: pathname });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}