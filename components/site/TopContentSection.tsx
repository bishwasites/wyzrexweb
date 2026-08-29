"use client";

import { useState } from "react";
import Image from "next/image";
import Eyebrow from "@/components/site/Eyebrow";
import TiltCard from "@/components/motion/TiltCard";
import { ExternalLinkIcon, PlatformIcon, PlayIcon } from "@/components/site/Icons";
import type { TopContent } from "@/db/schema";

export default function TopContentSection({ items }: { items: TopContent[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="section-wash" aria-hidden="true" />
      <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
        <Eyebrow>Top Performing Content</Eyebrow>
        <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">What the audience loved</h2>

        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {items.map((item) => {
            const isPlaying = playingId === item.id && Boolean(item.mediaUrl);
            return (
              <TiltCard key={item.id} className="w-64 flex-shrink-0 md:w-auto" tiltAmount={5}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-card-sm bg-ink">
                  {isPlaying && item.mediaUrl ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={item.mediaUrl} controls autoPlay className="h-full w-full object-cover" />
                  ) : (
                    <>
                      {item.thumbnailUrl && (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.caption ?? item.statLabel}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (item.mediaUrl) setPlayingId(item.id);
                          else if (item.embedUrl) window.open(item.embedUrl, "_blank", "noopener");
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                        aria-label={item.mediaUrl ? "Play video" : "Open post"}
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink">
                          {item.mediaUrl ? <PlayIcon /> : <ExternalLinkIcon />}
                        </span>
                      </button>
                      <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                        <PlatformIcon platform={item.platform} />
                      </span>
                      <span className="absolute bottom-3 left-3 rounded-pill bg-black/60 px-3 py-1 text-xs font-semibold text-gold-light">
                        {item.statLabel}
                      </span>
                    </>
                  )}
                </div>
                {item.caption && <p className="mt-3 text-sm text-muted">{item.caption}</p>}
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
