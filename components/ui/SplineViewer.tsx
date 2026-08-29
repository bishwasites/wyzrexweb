"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface SplineViewerProps {
  scene: string;
  /** Fires once, on the web component's native "load" event (scene fully loaded). */
  onLoad?: () => void;
}

// The viewer's internal runtime handle. Undocumented, so every call through
// it is optional and guarded — if a future viewer build renames this we lose
// the teardown, not the page.
interface SplineRuntime {
  play?: () => unknown;
  stop?: () => unknown;
  dispose?: () => void;
}
type SplineViewerElement = HTMLElement & { _spline?: SplineRuntime };

// window.devicePixelRatio is read-only and can't be overridden per-element —
// the viewer reads the global. Redefining the property on window is the only
// way to cap what it sees; scoped to this component's lifetime and restored
// on unmount so nothing else on the page is permanently affected. Applied
// once the scene has finished its first (highest-detail) load, matching the
// "cap render cost after load" requirement rather than degrading the initial
// paint.
function clampDevicePixelRatio(max: number): (() => void) | null {
  if (typeof window === "undefined") return null;
  const proto = Object.getPrototypeOf(window) as object;
  const existing =
    Object.getOwnPropertyDescriptor(window, "devicePixelRatio") ?? Object.getOwnPropertyDescriptor(proto, "devicePixelRatio");
  if (!existing?.get) return null;
  const originalGetter = existing.get.bind(window);
  Object.defineProperty(window, "devicePixelRatio", {
    configurable: true,
    get() {
      return Math.min(originalGetter(), max);
    },
  });
  return () => {
    Object.defineProperty(window, "devicePixelRatio", existing);
  };
}

// Uses the pre-built <spline-viewer> web component (same technique the
// Gloma reference site uses) instead of the @splinetool/react-spline npm
// wrapper (`<Spline scene={...} onLoad={...}>`), which is currently
// incompatible with React 19 under Next.js — verified across every
// published version.
//
// Purely a mounting/runtime-lifecycle concern: layout, the poster crossfade,
// and the load-gating that decides *when* this component gets mounted at all
// live in HeroSplineStage, the component's only caller.
export function SplineViewer({ scene, onLoad }: SplineViewerProps) {
  const ref = useRef<HTMLElement>(null);

  // The mounting effect below must run exactly once (mount) and clean up
  // exactly once (unmount) — its cleanup calls the runtime's stop()/dispose(),
  // which is only safe at true teardown. onLoad is near-guaranteed to be a
  // fresh arrow function on every render of the caller (HeroSplineStage
  // re-renders itself the instant the scene loads), so it can't sit in the
  // effect's own dependency array without re-running that cleanup — and thus
  // disposing the very runtime that just finished loading — on every parent
  // re-render. A ref sidesteps that: the effect reads the latest callback
  // without depending on its identity.
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    const maybeEl = ref.current as SplineViewerElement | null;
    if (!maybeEl) return;
    const el: SplineViewerElement = maybeEl;

    // Documented attribute that drops the scene's own baked-in background.
    // Works in both themes because the canvas then simply shows whatever
    // sits behind it — this wrapper carries no background colour of its
    // own, so that's the page's own --bg (white in light mode, black in
    // dark mode).
    el.setAttribute("background", "transparent");

    // Mouse events are intentionally left enabled (no pointer-events:none)
    // so the robot keeps tracking the cursor with its head — only the
    // visual "drag to interact" cursor hint is hidden, and the browser's
    // own cursor icon is pinned to the normal arrow instead of the
    // grab/hand icon Spline shows by default. These all live inside the
    // element's open shadow root (#hints holds the hint SVG, #container is
    // what Spline sets the grab cursor on, #logo is the "Built with Spline"
    // badge), and none are exposed as styleable CSS parts, so they're
    // reached directly rather than via ::part(). Spline re-creates these
    // through the scene's loading lifecycle, hence the persistent observer
    // and the !important — a one-shot hide gets undone.
    let cancelled = false;
    let shadowObserver: MutationObserver | null = null;

    function applyOverrides(root: ShadowRoot) {
      const hints = root.getElementById("hints");
      if (hints) hints.style.setProperty("display", "none", "important");
      const logo = root.getElementById("logo");
      if (logo) logo.style.setProperty("display", "none", "important");
      const container = root.getElementById("container");
      if (container) container.style.setProperty("cursor", "default", "important");
      const canvas = root.getElementById("spline");
      if (canvas) canvas.style.setProperty("cursor", "default", "important");
    }

    function watchShadowRoot(root: ShadowRoot) {
      applyOverrides(root);
      shadowObserver = new MutationObserver(() => applyOverrides(root));
      shadowObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    }

    // requestAnimationFrame is throttled or fully paused on hidden/background
    // tabs, and the viewer script can take several seconds to load and
    // upgrade the element — an rAF-based poll can starve indefinitely before
    // the shadow root ever attaches. setInterval keeps firing regardless of
    // tab visibility, so it's used here instead.
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    if (el.shadowRoot) {
      watchShadowRoot(el.shadowRoot);
    } else {
      pollTimer = setInterval(() => {
        if (cancelled) return;
        if (el.shadowRoot) {
          if (pollTimer) clearInterval(pollTimer);
          watchShadowRoot(el.shadowRoot);
        }
      }, 100);
    }

    // Cap render cost once the scene has finished loading: clamp dpr so a
    // 3x-retina display isn't rasterizing the full-detail scene at 3x pixel
    // density forever, and stop the render loop entirely while the hero is
    // scrolled out of view or the tab is backgrounded — resuming it (via the
    // viewer's own play()) when either condition clears. All of this is
    // strictly cheaper than what the viewer would otherwise be doing on its
    // own, so it's safe to leave permanently wired for the component's life.
    let restoreDpr: (() => void) | null = null;
    let loadFired = false;
    function handleLoad() {
      if (loadFired) return;
      loadFired = true;
      restoreDpr = clampDevicePixelRatio(1.5);
      onLoadRef.current?.();
    }
    // The documented way to know a scene is ready is `addEventListener("load",
    // ...)` on the element — but empirically (tested against this exact
    // build) it never fires. Polling the internal runtime handle instead:
    // once `_spline` exists the Application has been constructed and the
    // canvas already reports its real size, which in testing lines up with
    // the scene being visually ready. One extra rAF after first detecting it
    // is cheap insurance against catching it a frame before the first paint.
    el.addEventListener("load", handleLoad);
    let readyPollTimer: ReturnType<typeof setInterval> | null = setInterval(() => {
      if (cancelled || loadFired) {
        if (readyPollTimer) clearInterval(readyPollTimer);
        return;
      }
      if (el._spline) {
        if (readyPollTimer) clearInterval(readyPollTimer);
        requestAnimationFrame(() => requestAnimationFrame(handleLoad));
      }
    }, 150);

    // Calling play()/stop() before the scene has actually finished
    // constructing throws deep inside the viewer's own (undocumented,
    // internal) runtime — reachable even through optional chaining, since
    // `_spline` can exist as a not-yet-initialized placeholder before its
    // first real frame. Gating on `loadFired` keeps every call safely after
    // that point; the try/catch plus .catch() cover both the synchronous
    // throw and promise-rejection forms the same bug has shown in testing.
    function setRunning(running: boolean) {
      if (!loadFired) return;
      const app = el._spline;
      try {
        const result = running ? app?.play?.() : app?.stop?.();
        if (result && typeof (result as Promise<unknown>).catch === "function") {
          (result as Promise<unknown>).catch(() => {});
        }
      } catch {
        // Undocumented API — swallow whatever the current viewer build throws.
      }
    }

    let isInViewport = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        isInViewport = entry.isIntersecting;
        setRunning(isInViewport && document.visibilityState === "visible");
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(el);

    function handleVisibilityChange() {
      setRunning(document.visibilityState === "visible" && isInViewport);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (readyPollTimer) clearInterval(readyPollTimer);
      shadowObserver?.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      el.removeEventListener("load", handleLoad);
      restoreDpr?.();

      // Halt the render loop and release GPU resources *before* React detaches
      // the element. The viewer runs its own requestAnimationFrame loop and
      // doesn't stop it on disconnect; once the canvas is detached it measures
      // 0x0, so every subsequent frame asks WebGPU for a zero-sized swapchain
      // texture and throws "Could not create a swapchain texture of size 0".
      // Measured on a client-side route change: ~3,000 errors in 3s without
      // this, zero with it.
      try {
        el._spline?.stop?.();
        el._spline?.dispose?.();
      } catch {
        // A viewer whose scene never finished loading has nothing to tear down.
      }
    };
    // Deliberately no `onLoad` here — see onLoadRef above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js"
        strategy="afterInteractive"
      />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <spline-viewer ref={ref} url={scene} hint="none" background="transparent" />
    </>
  );
}
