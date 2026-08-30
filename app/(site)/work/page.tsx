import type { Metadata } from "next";
import Eyebrow from "@/components/site/Eyebrow";
import FrameSequenceHero from "@/components/motion/FrameSequenceHero";
import RevealOnScroll from "@/components/site/RevealOnScroll";
import WorkCard from "@/components/site/WorkCard";
import CtaBand from "@/components/site/CtaBand";
import MetaAdsSection from "@/components/site/MetaAdsSection";
import TopContentsSection from "@/components/site/TopContentsSection";
import { PHILOSOPHER_FRAMES } from "@/lib/frames";
import { getPublishedCaseStudies } from "@/lib/queries";
import { getPageSections } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work from WYZREX — branding, web design, social strategy, video production, and paid growth for brands across industries.",
};

export default async function WorkPage() {
  const [caseStudies, sections] = await Promise.all([getPublishedCaseStudies(), getPageSections("work")]);
  const hero = sections.get("hero");

  return (
    <>
      <FrameSequenceHero
        config={PHILOSOPHER_FRAMES}
        pinHeight="200vh"
        sceneDescription="Illustrated Greek philosopher in quiet contemplation, camera slowly pushing in."
      >
        <div className="mx-auto flex min-h-[40vh] max-w-container items-center px-5 md:px-8">
          <div>
            <Eyebrow onDark>{hero?.eyebrow || "Selected Work"}</Eyebrow>
            <h1 className="text-[clamp(2.5rem,6vw+1rem,6rem)] font-semibold leading-[1.02] tracking-tight text-white">
              {hero?.heading || "Proof, not promises."}
            </h1>
          </div>
        </div>
      </FrameSequenceHero>

      <section>
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((c) => (
              <RevealOnScroll key={c.id}>
                <WorkCard caseStudy={c} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <MetaAdsSection />

      <TopContentsSection />

      <CtaBand />
    </>
  );
}
