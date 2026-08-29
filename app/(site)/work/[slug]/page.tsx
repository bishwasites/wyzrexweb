import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import RevealOnScroll from "@/components/site/RevealOnScroll";
import AdResultsSection from "@/components/site/AdResultsSection";
import TopContentSection from "@/components/site/TopContentSection";
import ClientProfilesSection from "@/components/site/ClientProfilesSection";
import CtaBand from "@/components/site/CtaBand";
import { getCaseStudyBySlug } from "@/lib/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);
  if (!caseStudy) return {};
  return {
    title: `${caseStudy.clientName} — ${caseStudy.category}`,
    description: caseStudy.description,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);
  if (!caseStudy) notFound();

  return (
    <>
      <section className="pt-28 md:pt-40">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-gold">
            <span>{caseStudy.category}</span>
            <span>·</span>
            <span>{caseStudy.year}</span>
          </div>
          <h1 className="mb-5 text-[clamp(2.5rem,5vw+1rem,4.5rem)] font-semibold tracking-tight">
            {caseStudy.clientName}
          </h1>
          <p className="max-w-2xl text-lg text-muted">{caseStudy.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {caseStudy.tags.map((tag) => (
              <span key={tag} className="rounded-pill border border-line px-3 py-1.5 text-sm text-muted">
                {tag}
              </span>
            ))}
          </div>

          {caseStudy.heroMediaUrl && (
            <RevealOnScroll className="mt-10 overflow-hidden rounded-card border border-line">
              {caseStudy.heroMediaType === "video" ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={caseStudy.heroMediaUrl} controls className="aspect-video w-full bg-ink object-cover" />
              ) : (
                <Image
                  src={caseStudy.heroMediaUrl}
                  alt={caseStudy.clientName}
                  width={1600}
                  height={900}
                  unoptimized
                  className="aspect-video w-full bg-ink object-cover"
                />
              )}
            </RevealOnScroll>
          )}
        </div>
      </section>

      <div className="mt-16">
        <AdResultsSection results={caseStudy.adResults} />
        <TopContentSection items={caseStudy.topContent} />
        <ClientProfilesSection profiles={caseStudy.clientProfiles} clientName={caseStudy.clientName} />
      </div>

      <CtaBand />
    </>
  );
}
