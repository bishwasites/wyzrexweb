"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function GoldWireframe({ paused }: { paused: boolean }) {
  const ref = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (paused || !ref.current) return;
    ref.current.rotation.x += delta * 0.04;
    ref.current.rotation.y += delta * 0.07;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.7, 0]} />
      <meshBasicMaterial color="#ffc629" wireframe transparent opacity={0.55} />
    </mesh>
  );
}

// The one contained WebGL flourish on the site — a slow-drifting low-poly
// gold wireframe, ambient behind the Home hero's frame-sequence canvas.
// Paused (not unmounted) while scrolled out of view to save GPU cycles.
export default function Hero3DFlourish() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <GoldWireframe paused={!visible} />
      </Canvas>
    </div>
  );
}
