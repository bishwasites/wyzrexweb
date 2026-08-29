"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface RevealProps {
  children: ReactNode;
  /** Base delay in ms. With multiple direct children, each subsequent one adds +80ms on top of this. */
  delay?: number;
  className?: string;
}

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const DURATION = 700;

function revealStyle(visible: boolean, delayMs: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity ${DURATION}ms ${EASE} ${delayMs}ms, transform ${DURATION}ms ${EASE} ${delayMs}ms`,
    willChange: "opacity, transform",
  };
}

// Fades content in (opacity + translateY(28px) -> 0) once it's 15% into the
// viewport, then stops observing (triggerOnce). Passing several elements as
// children — e.g. a grid of cards — staggers each one 80ms after the last,
// so a whole grid doesn't pop in at once. CSS transitions only, no JS-driven
// interpolation, so there's nothing to animate but opacity/transform.
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const items = Children.toArray(children);

  if (items.length <= 1) {
    return (
      <div ref={ref} className={className} style={reducedMotion ? undefined : revealStyle(visible, delay)}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div key={i} style={reducedMotion ? undefined : revealStyle(visible, delay + i * 80)}>
          {child}
        </div>
      ))}
    </div>
  );
}
