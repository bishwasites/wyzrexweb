import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // placehold.co (used throughout db/seed.ts for placeholder imagery) serves
    // SVG by default, which next/image blocks unless explicitly allowed. The
    // CSP neutralizes the usual SVG-script XSS concern for the images it does
    // render.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
