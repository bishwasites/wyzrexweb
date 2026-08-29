"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const Hero3DFlourish = dynamic(() => import("@/components/motion/Hero3DFlourish"), { ssr: false });

const MIN_CORES = 4;

// Gate keeping the only WebGL on the site optional: skip it entirely under
// reduced motion or on low-power devices, so a WebGL failure can never
// break the page — it just silently doesn't render.
export default function Hero3DFlourishGate() {
  const reducedMotion = useReducedMotion();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
    setAllowed(typeof cores !== "number" || cores >= MIN_CORES);
  }, []);

  if (reducedMotion || !allowed) return null;
  return <Hero3DFlourish />;
}
