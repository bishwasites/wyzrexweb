"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CloseIcon } from "@/components/site/Icons";

interface LightboxImage {
  src: string;
  alt: string;
}

export default function Lightbox({ images }: { images: LightboxImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex]);

  const active = openIndex !== null ? images[openIndex] : undefined;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {images.map((img, i) => (
          <button key={img.src + i} type="button" onClick={() => setOpenIndex(i)} className="browser-chrome text-left">
            <div className="browser-chrome__bar">
              <span className="browser-chrome__dot" />
              <span className="browser-chrome__dot" />
              <span className="browser-chrome__dot" />
            </div>
            <Image src={img.src} alt={img.alt} width={800} height={500} unoptimized className="w-full object-cover" />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[900] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white"
          >
            <CloseIcon />
          </button>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <Image
            src={active.src}
            alt={active.alt}
            width={1400}
            height={900}
            unoptimized
            className="max-h-[85vh] w-auto max-w-full rounded-card-sm object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
