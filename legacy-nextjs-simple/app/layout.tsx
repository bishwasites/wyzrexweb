import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import ThemeScript from "@/components/ThemeScript";
import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${anton.variable} ${inter.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <SiteHeader />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
