import { Suspense } from "react";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal from "@/components/site/Reveal";
import ParallaxGlow from "@/components/site/ParallaxGlow";
import MetaAdsResults from "@/components/site/MetaAdsResults";
import MetaAdsSkeleton from "@/components/site/MetaAdsSkeleton";
import { getPageSections } from "@/lib/cms";

export default async function MetaAdsSection() {
  const home = await getPageSections("home");
  const section = home.get("meta_ads");

  return (
    <section className="relative overflow-hidden py-6">
      <div className="section-wash" aria-hidden="true" />
      <ParallaxGlow
        className="absolute -right-40 top-0 h-[560px] w-[560px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(var(--gold-rgb), 0.07), transparent 70%)" }}
      />

      <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-10">
          <Eyebrow>{section?.eyebrow || "Paid Performance"}</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{section?.heading || "Ads that actually returned"}</h2>
        </Reveal>
        <Suspense fallback={<MetaAdsSkeleton />}>
          <MetaAdsResults />
        </Suspense>
      </div>
    </section>
  );
}
