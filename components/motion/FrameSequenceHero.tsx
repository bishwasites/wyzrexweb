"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { frameUrl, type FrameSequenceConfig } from "@/lib/frames";
import { clamp } from "@/lib/math";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface FrameSequenceHeroProps {
  config: FrameSequenceConfig;
  pinHeight?: string;
  sceneDescription: string;
  children?: ReactNode;
  /** Rendered behind the canvas, e.g. the ambient 3D flourish — never shown under reduced motion. */
  background?: ReactNode;
}

export default function FrameSequenceHero({
  config,
  pinHeight = "300vh",
  sceneDescription,
  children,
  background,
}: FrameSequenceHeroProps) {
  const reducedMotion = useReducedMotion();
  const frameCount = config.endIndex - config.startIndex + 1;

  if (reducedMotion) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-[#05050a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="frame-backdrop__static" src={frameUrl(config, config.endIndex)} alt="" aria-hidden="true" />
        <span className="visually-hidden">{sceneDescription}</span>
        <div className="relative z-[1] flex h-full items-end">{children}</div>
      </div>
    );
  }

  return (
    <FrameSequenceHeroCanvas
      config={config}
      pinHeight={pinHeight}
      sceneDescription={sceneDescription}
      frameCount={frameCount}
      background={background}
    >
      {children}
    </FrameSequenceHeroCanvas>
  );
}

function FrameSequenceHeroCanvas({
  config,
  pinHeight,
  sceneDescription,
  background,
  frameCount,
  children,
}: FrameSequenceHeroProps & { frameCount: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedPct, setLoadedPct] = useState(0);
  const [ready, setReady] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !sticky || !canvas || !lenis) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    const images: HTMLImageElement[] = new Array(frameCount);
    let loadedCount = 0;
    let currentFrame = -1;

    function sizeCanvas() {
      if (!canvas || !sticky) return;
      const rect = sticky.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    function drawFrame(index: number) {
      const img = images[index];
      if (!ctx || !canvas || !img || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function currentProgress() {
      if (!wrapper) return 0;
      const wrapRect = wrapper.getBoundingClientRect();
      const wrapTop = wrapRect.top + window.scrollY;
      const wrapHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = wrapHeight - viewportHeight;
      if (scrollable <= 0) return 0;
      return clamp((window.scrollY - wrapTop) / scrollable, 0, 1);
    }

    // Driven by Lenis's own "scroll" event rather than a native scroll
    // listener + a separate rAF throttle — Lenis already ticks once per
    // frame for the whole app (see SmoothScroll.tsx), so a second loop here
    // would just be redundant.
    function onScroll() {
      const progress = currentProgress();
      const idx = Math.min(frameCount - 1, Math.max(0, Math.round(progress * (frameCount - 1))));
      if (idx !== currentFrame) {
        currentFrame = idx;
        drawFrame(idx);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      sizeCanvas();
      if (currentFrame >= 0) drawFrame(currentFrame);
    });
    resizeObserver.observe(sticky);
    sizeCanvas();

    images[0] = new Image();
    images[0].onload = () => {
      if (cancelled) return;
      loadedCount++;
      setLoadedPct(Math.round((loadedCount / frameCount) * 100));
      currentFrame = 0;
      drawFrame(0);
      setReady(true);
    };
    images[0].src = frameUrl(config, config.startIndex);

    for (let i = 1; i < frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        loadedCount++;
        setLoadedPct(Math.round((loadedCount / frameCount) * 100));
      };
      img.src = frameUrl(config, config.startIndex + i);
      images[i] = img;
    }

    onScroll();
    const unsubscribe = lenis.on("scroll", onScroll);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, frameCount, lenis]);

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ height: pinHeight }}>
      <div ref={stickyRef} className="sticky top-0 flex h-screen w-full items-end overflow-hidden bg-[#05050a]">
        {background}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
        <div className="frame-backdrop__gradient pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/60" />
        {loadedPct < 100 && (
          <div className="frame-loader">
            <div className="frame-loader__bar" style={{ width: `${loadedPct}%` }} />
          </div>
        )}
        <span className="visually-hidden">{sceneDescription}</span>
        <div className={`relative z-[1] w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
