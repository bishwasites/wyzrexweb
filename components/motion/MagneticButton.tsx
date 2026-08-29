"use client";

import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

// Cursor-follow glow + a slight magnetic pull toward the pointer — used to
// wrap the primary gold CTA buttons.
export default function MagneticButton({ children, className, strength = 0.25 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBackground = useMotionTemplate`radial-gradient(140px circle at ${glowX}% ${glowY}%, rgba(255,198,41,0.5), transparent 70%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    x.set((relX - rect.width / 2) * strength);
    y.set((relY - rect.height / 2) * strength);
    glowX.set((relX / rect.width) * 100);
    glowY.set((relY / rect.height) * 100);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      className={`relative inline-block ${className ?? ""}`}
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-pill blur-md"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: glowBackground }}
        />
      )}
      {children}
    </motion.div>
  );
}
