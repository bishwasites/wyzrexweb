"use client";

import { useLenis } from "@/components/motion/SmoothScroll";

export default function SkipToContent() {
  const lenis = useLenis();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!lenis) return; // reduced motion / not mounted yet — let the native anchor jump handle it
    e.preventDefault();
    lenis.scrollTo("#main", { offset: -80 });
  }

  return (
    <a
      href="#main"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-control focus:bg-gold focus:px-5 focus:py-3 focus:font-semibold focus:text-[#0a0a0a]"
    >
      Skip to content
    </a>
  );
}
