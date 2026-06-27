import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pure-static deployment: SSG everything, no server runtime needed.
  // Pages that need client interactivity are still SSG'd, with the
  // interactive widget hydrated on top of the static HTML shell.
  output: undefined,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;