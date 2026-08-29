import { Suspense } from "react";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal from "@/components/site/Reveal";
import ParallaxGlow from "@/components/site/ParallaxGlow";
import TopContentsResults from "@/components/site/TopContentsResults";
import TopContentsSkeleton from "@/components/site/TopContentsSkeleton";
import { getPageSections } from "@/lib/cms";

export default async function TopContentsSection() {
  const home = await getPageSections("home");
  const section = home.get("top_contents");

  return (
    <section className="relative overflow-hidden py-6">
      <ParallaxGlow
        className="absolute -left-32 top-0 h-[560px] w-[560px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(var(--gold-rgb), 0.08), transparent 70%)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-10">
          <Eyebrow>{section?.eyebrow || "What Went Viral"}</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{section?.heading || "Content that performed"}</h2>
        </Reveal>
        <Suspense fallback={<TopContentsSkeleton />}>
          <TopContentsResults />
        </Suspense>
      </div>
    </section>
  );
}
