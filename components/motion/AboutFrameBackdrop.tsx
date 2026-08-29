"use client";

import { useEffect, useRef, useState } from "react";
import { frameUrl, type FrameSequenceConfig } from "@/lib/frames";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface AboutFrameBackdropProps {
  config: FrameSequenceConfig;
  sceneDescription: string;
}

type Mode = "full" | "reduced" | "static";

function computeMode(): Mode {
  if (typeof window === "undefined") return "full";
  const w = window.innerWidth;
  if (w < 640) return "static";
  if (w < 1024) return "reduced";
  return "full";
}

// Fixed full-page canvas that plays the philosopher sequence across the
// entire About page scroll (not just a hero region). Frame selection is
// driven by Lenis's own "scroll" event (see SmoothScroll.tsx) rather than a
// native scroll listener + a separate requestAnimationFrame loop — Lenis
// already ticks once per frame and its own lerp already smooths the scroll
// value, so reading lenis.progress here gets that smoothing for free
// instead of layering a second one on top.
export default function AboutFrameBackdrop({ config, sceneDescription }: AboutFrameBackdropProps) {
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const [mode, setMode] = useState<Mode>(computeMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    function onResize() {
      setMode(computeMode());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const staticOnly = reducedMotion || mode === "static";

  useEffect(() => {
    if (staticOnly || !lenis) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const allIndices: number[] = [];
    for (let i = config.startIndex; i <= config.endIndex; i++) allIndices.push(i);
    const indices = mode === "reduced" ? allIndices.filter((_, i) => i % 2 === 0) : allIndices;
    if (indices[indices.length - 1] !== allIndices[allIndices.length - 1]) {
      indices.push(allIndices[allIndices.length - 1] as number);
    }

    const images = indices.map((idx) => {
      const img = new Image();
      img.src = frameUrl(config, idx);
      return img;
    });

    function sizeCanvas() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    }

    function drawFrame(img: HTMLImageElement) {
      if (!ctx || !canvas || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      // object-cover: scale to fully cover the canvas on both axes, center-crop the rest.
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    let lastIndex = -1;
    function draw() {
      const progress = lenis ? lenis.progress : 0;
      const frameIdx = Math.round(progress * (images.length - 1));
      if (frameIdx !== lastIndex) {
        lastIndex = frameIdx;
        const img = images[frameIdx];
        if (img) drawFrame(img);
      }
    }

    const first = images[0];
    if (first) first.onload = () => drawFrame(first);

    draw();
    const unsubscribe = lenis.on("scroll", draw);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", sizeCanvas);
    };
  }, [staticOnly, mode, config, lenis]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {staticOnly ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frameUrl(config, config.startIndex)}
          alt=""
          className="about-frame-backdrop__image h-full w-full object-cover"
        />
      ) : (
        <canvas ref={canvasRef} className="about-frame-backdrop__image h-full w-full" />
      )}
      <div className="about-frame-backdrop__scrim pointer-events-none absolute inset-0" />
      <span className="visually-hidden">{sceneDescription}</span>
    </div>
  );
}
