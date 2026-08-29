import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import ThemeScript from "@/components/site/ThemeScript";
import SmoothScroll from "@/components/motion/SmoothScroll";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WYZREX — Digital Marketing & Creative Production, Colombo",
    template: "%s — WYZREX",
  },
  description:
    "WYZREX is a Colombo-based digital marketing and creative production agency built on strategy and execution in equal measure.",
  openGraph: {
    title: "WYZREX — Digital Marketing & Creative Production",
    description: "A Colombo-based agency for brands that want both the thinking and the shipping.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={poppins.variable}>
      <head>
        {/* The hero's Spline scene is fetched from these origins, deferred
            until well after hydration (see HeroSplineStage). Warming the
            connection now means that whenever it does start, it skips
            straight to the request instead of paying DNS + TLS handshake
            latency on the critical path of an already-late load. */}
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
        <ThemeScript />
      </head>
      <body className="font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
