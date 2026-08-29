"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SplineViewer } from "@/components/ui/SplineViewer";

interface HeroSplineStageProps {
  scene: string;
  poster: string;
  posterBlurDataURL: string;
  className?: string;
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

// Mobile, prefers-reduced-motion, and save-data/2g connections never get the
// 3D scene at all — the poster is the whole experience for them, not a
// loading state. Read once on mount (not via a media-query listener): a
// user's connection or motion preference flipping mid-session shouldn't
// suddenly mount or unmount a WebGPU scene under them.
function shouldSkipScene(): boolean {
  if (typeof window === "undefined") return true;
  if (window.innerWidth < 768) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return true;
  if (connection?.effectiveType?.includes("2g")) return true;
  return false;
}

// Poster shown instantly (it's the hero's real LCP element); the live scene
// is only mounted once the stage has real size, is actually in view, and the
// browser has either gone idle or fully finished loading — whichever comes
// first, so a page that never goes idle (e.g. under continuous animation)
// doesn't wait forever for the scene it would show right away anyway. Once
// mounted, the two layers cross-fade on the scene's own "load" event; until
// then the poster is 100% opaque and the scene layer is invisible, so a slow
// scene load never leaves a blank gap.
export function HeroSplineStage({ scene, poster, posterBlurDataURL, className }: HeroSplineStageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [skip, setSkip] = useState(false);
  const [mountScene, setMountScene] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  useEffect(() => {
    setSkip(shouldSkipScene());
  }, []);

  useEffect(() => {
    if (skip) return;
    const el = wrapperRef.current;
    if (!el) return;

    let hasSize = false;
    let inViewport = false;
    let idleOrLoaded = false;
    let settled = false;

    function evaluate() {
      if (settled || !(hasSize && inViewport && idleOrLoaded)) return;
      settled = true;
      setMountScene(true);
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        hasSize = true;
        evaluate();
      }
    });
    resizeObserver.observe(el);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          inViewport = true;
          evaluate();
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(el);

    function markIdleOrLoaded() {
      idleOrLoaded = true;
      evaluate();
    }

    let idleHandle: number | null = null;
    if (document.readyState === "complete") {
      markIdleOrLoaded();
    } else {
      window.addEventListener("load", markIdleOrLoaded, { once: true });
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(markIdleOrLoaded);
      }
    }

    return () => {
      settled = true;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("load", markIdleOrLoaded);
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [skip]);

  return (
    <div ref={wrapperRef} className={`spline-stage ${className ?? ""}`}>
      <Image
        src={poster}
        alt=""
        aria-hidden="true"
        fill
        priority
        placeholder="blur"
        blurDataURL={posterBlurDataURL}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="spline-stage-media"
        style={{ opacity: sceneLoaded ? 0 : 1, transition: "opacity 500ms ease" }}
      />
      {mountScene && !skip && (
        <div className="absolute inset-0" style={{ opacity: sceneLoaded ? 1 : 0, transition: "opacity 500ms ease" }}>
          <SplineViewer scene={scene} onLoad={() => setSceneLoaded(true)} />
        </div>
      )}
    </div>
  );
}
