"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const LenisContext = createContext<Lenis | null>(null);

/**
 * The site's shared Lenis instance, or null when smooth scroll is disabled
 * (prefers-reduced-motion) or not yet mounted. Scroll-linked effects
 * (parallax, the About page's frame backdrop, anchor links) should read
 * from this instead of window.scrollY / their own requestAnimationFrame
 * loop — Lenis already drives one rAF loop for the whole app; a second one
 * per effect just fights it.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

// Mounted once in the root layout so every page — including /admin — shares
// one Lenis instance and one rAF loop.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const instance = new Lenis({
      lerp: 0.09,
      duration: 1.15,
      wheelMultiplier: 1,
      smoothWheel: true,
      // No `smoothTouch` option in this Lenis version — touch already
      // scrolls natively by default (it's opt-in via `syncTouch`).
    });
    setLenis(instance);

    let frameId: number;
    function raf(time: number) {
      instance.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
