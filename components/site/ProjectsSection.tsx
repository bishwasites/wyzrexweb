import { Suspense } from "react";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal from "@/components/site/Reveal";
import ParallaxGlow from "@/components/site/ParallaxGlow";
import ProjectsResults from "@/components/site/ProjectsResults";
import ProjectsSkeleton from "@/components/site/ProjectsSkeleton";
import { getPageSections } from "@/lib/cms";

export default async function ProjectsSection() {
  const home = await getPageSections("home");
  const section = home.get("projects");

  return (
    <section className="relative overflow-hidden py-6">
      <div className="section-wash" aria-hidden="true" />
      <ParallaxGlow
        className="absolute -right-32 top-1/3 h-[560px] w-[560px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(var(--gold-rgb), 0.07), transparent 70%)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-10">
          <Eyebrow>{section?.eyebrow || "Selected Work"}</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{section?.heading || "Proof, not promises"}</h2>
        </Reveal>
        <Suspense fallback={<ProjectsSkeleton />}>
          <ProjectsResults />
        </Suspense>
      </div>
    </section>
  );
}
