"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "@/components/site/ImageLightbox";
import Reveal from "@/components/site/Reveal";
import type { MetaAd } from "@/db/schema";

export default function MetaAdsGrid({ ads }: { ads: MetaAd[] }) {
  const [openAd, setOpenAd] = useState<MetaAd | null>(null);

  return (
    <>
      <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <button
            key={ad.id}
            type="button"
            onClick={() => setOpenAd(ad)}
            className="group flex w-full flex-col text-left"
          >
            <div className="meta-ad-card relative w-full" style={{ aspectRatio: "1200 / 1420" }}>
              <Image
                src={ad.imageUrl}
                alt={ad.campaignName}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="meta-ad-card__image object-cover"
              />
              <span className="absolute left-3 top-3 z-10 rounded-pill bg-gold px-3 py-1 text-xs font-semibold text-[#0a0a0a]">
                {ad.clientName}
              </span>
            </div>
            <p className="mt-4 text-base font-bold">{ad.campaignName}</p>
            <p className="mt-1 text-sm text-muted">
              {ad.resultHeadline}
              {ad.resultSub ? ` — ${ad.resultSub}` : ""}
            </p>
          </button>
        ))}
      </Reveal>

      {openAd && (
        <ImageLightbox
          src={openAd.imageUrl}
          alt={`${openAd.clientName} — ${openAd.campaignName}`}
          onClose={() => setOpenAd(null)}
        />
      )}
    </>
  );
}
