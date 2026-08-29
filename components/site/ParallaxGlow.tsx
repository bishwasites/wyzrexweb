"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface ParallaxGlowProps {
  className?: string;
  style?: CSSProperties;
}

const MAX_OFFSET = 40; // px, total range is -40..40

// A decorative background glow that drifts vertically (translateY only) as
// its section scrolls through the viewport — never touches layout, never
// applied to text. Position is written straight to the DOM node via a ref
// (not React state) so scrolling doesn't trigger re-renders. Driven by
// Lenis's own scroll event rather than a native scroll listener + its own
// rAF throttle — Lenis already ticks once per frame, so there's no need for
// a second loop here.
export default function ParallaxGlow({ className, style }: ParallaxGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();

  useEffect(() => {
    if (reducedMotion || !lenis) return;
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;

    function update() {
      if (!el || !section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const progress = Math.min(1, Math.max(0, total > 0 ? traveled / total : 0));
      const offset = (progress - 0.5) * MAX_OFFSET * 2;
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    }

    update();
    const unsubscribe = lenis.on("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", update);
    };
  }, [reducedMotion, lenis]);

  return <div ref={ref} aria-hidden="true" className={className} style={style} />;
}
