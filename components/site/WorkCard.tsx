import Link from "next/link";
import Image from "next/image";
import TiltCard from "@/components/motion/TiltCard";
import type { CaseStudy } from "@/db/schema";

export default function WorkCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <TiltCard className="h-full">
      <Link
        href={`/work/${caseStudy.slug}`}
        className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-card bg-ink p-7 text-ink-fg transition-transform"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(255,198,41,0.18),transparent_60%)]" />
        {caseStudy.clientLogoUrl && (
          <Image
            src={caseStudy.clientLogoUrl}
            alt={`${caseStudy.clientName} logo`}
            width={120}
            height={40}
            unoptimized
            className="absolute right-6 top-6 h-8 w-auto object-contain opacity-80"
          />
        )}
        <div className="relative z-[1] mb-3 flex gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-gold-light">
          <span>{caseStudy.category}</span>
          <span>{caseStudy.year}</span>
        </div>
        <h3 className="relative z-[1] text-xl font-semibold">{caseStudy.clientName}</h3>
        <p className="relative z-[1] mb-4 mt-2 text-sm text-white/65">{caseStudy.description}</p>
        <div className="relative z-[1] flex flex-wrap gap-2">
          {caseStudy.tags.map((tag) => (
            <span key={tag} className="rounded-pill border border-white/18 px-2.5 py-1 text-xs text-white/75">
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </TiltCard>
  );
}
