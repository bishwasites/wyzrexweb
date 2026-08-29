"use client";

import { useEffect, useRef, useState } from "react";
import { frameUrl, type FrameSequenceConfig } from "@/lib/frames";
import { clamp, lerp } from "@/lib/math";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface FrameSequenceProps {
  config: FrameSequenceConfig;
  sceneDescription: string;
  /** 0-1 opacity applied to the drawn frame so foreground text stays legible. */
  opacity?: number;
}

const SMOOTHING = 0.09;

export default function FrameSequence({
  config,
  sceneDescription,
  opacity = 0.75,
}: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [loadedPct, setLoadedPct] = useState(0);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();

  const frameCount = config.endIndex - config.startIndex + 1;

  // Static fallback for prefers-reduced-motion: just the final frame, fixed.
  if (reducedMotion) {
    return (
      <div className="frame-backdrop" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="frame-backdrop__static"
          src={frameUrl(config, config.endIndex)}
          alt=""
          style={{ opacity }}
        />
        <span className="visually-hidden">{sceneDescription}</span>
      </div>
    );
  }

  return (
    <FrameSequenceCanvas
      config={config}
      sceneDescription={sceneDescription}
      opacity={opacity}
      frameCount={frameCount}
      canvasRef={canvasRef}
      backdropRef={backdropRef}
      loadedPct={loadedPct}
      setLoadedPct={setLoadedPct}
      ready={ready}
      setReady={setReady}
    />
  );
}

interface CanvasProps {
  config: FrameSequenceConfig;
  sceneDescription: string;
  opacity: number;
  frameCount: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  backdropRef: React.RefObject<HTMLDivElement | null>;
  loadedPct: number;
  setLoadedPct: (n: number) => void;
  ready: boolean;
  setReady: (b: boolean) => void;
}

function FrameSequenceCanvas({
  config,
  sceneDescription,
  opacity,
  frameCount,
  canvasRef,
  backdropRef,
  loadedPct,
  setLoadedPct,
  ready,
  setReady,
}: CanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const backdrop = backdropRef.current;
    if (!canvas || !backdrop) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    const images: HTMLImageElement[] = new Array(frameCount);
    let loadedCount = 0;
    let lastDrawnFrame = -1;
    let displayedProgress = 0;

    function sizeCanvas() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
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

    function targetProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      return clamp(window.scrollY / maxScroll, 0, 1);
    }

    let frameId: number;
    function tick() {
      displayedProgress = lerp(displayedProgress, targetProgress(), SMOOTHING);
      const idx = Math.round(displayedProgress * (frameCount - 1));
      if (idx !== lastDrawnFrame) {
        lastDrawnFrame = idx;
        drawFrame(idx);
      }
      frameId = requestAnimationFrame(tick);
    }

    sizeCanvas();
    frameId = requestAnimationFrame(tick);

    const onResize = () => {
      sizeCanvas();
      if (lastDrawnFrame >= 0) drawFrame(lastDrawnFrame);
    };
    window.addEventListener("resize", onResize);

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        loadedCount++;
        setLoadedPct(Math.round((loadedCount / frameCount) * 100));
        if (i === 0) {
          lastDrawnFrame = 0;
          drawFrame(0);
          setReady(true);
        }
      };
      img.src = frameUrl(config, config.startIndex + i);
      images[i] = img;
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, frameCount]);

  return (
    <div ref={backdropRef} className={`frame-backdrop${ready ? " is-ready" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} style={{ opacity }} />
      {loadedPct < 100 && (
        <div className="frame-loader">
          <div className="frame-loader__bar" style={{ width: `${loadedPct}%` }} />
        </div>
      )}
      <span className="visually-hidden">{sceneDescription}</span>
    </div>
  );
}
