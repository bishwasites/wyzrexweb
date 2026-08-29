"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PlatformIcon } from "@/components/site/Icons";
import type { TopContentItem } from "@/db/schema";

// Each card lazily mounts its own <video>/<iframe> only once it has actually
// intersected the viewport (no bytes fetched before that), and separately
// tracks whether it should be *playing* (hover on pointer devices, >=60%
// visible on touch/scroll devices — whichever fires first). Because
// "should play" is per-card and gated behind real intersection, at most a
// couple of cards are ever live at once — never all six.
export default function TopContentCard({ item }: { item: TopContentItem }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inViewport, setInViewport] = useState(false);
  const [mostlyInView, setMostlyInView] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInViewport(entry.isIntersecting);
        setMostlyInView(entry.intersectionRatio >= 0.6);
      },
      { threshold: [0, 0.6] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shouldPlay = hovered || mostlyInView;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  const hasVideo = !!item.videoUrl;
  const hasEmbed = !hasVideo && !!item.embedUrl;
  const showLiveMedia = inViewport && (hasVideo || hasEmbed);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative aspect-[9/16] w-[78%] flex-shrink-0 snap-center overflow-hidden rounded-[20px] border border-line transition-colors duration-300 hover:border-gold sm:w-auto sm:flex-shrink sm:snap-align-none"
    >
      {showLiveMedia ? (
        hasVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            src={item.videoUrl!}
            poster={item.thumbUrl ?? undefined}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={`${item.embedUrl}${item.embedUrl!.includes("?") ? "&" : "?"}${shouldPlay ? "autoplay=1" : ""}`}
            loading="lazy"
            allow="autoplay; encrypted-media"
            className="absolute inset-0 h-full w-full border-0"
          />
        )
      ) : item.thumbUrl ? (
        <Image
          src={item.thumbUrl}
          alt={item.clientName}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 78vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-2" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <span className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
        <PlatformIcon platform={item.platform} className="h-4 w-4" />
      </span>

      <span className="absolute bottom-3 left-3 z-10 text-sm font-semibold text-white">{item.clientName}</span>
    </div>
  );
}
