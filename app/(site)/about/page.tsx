import type { Metadata } from "next";
import Eyebrow from "@/components/site/Eyebrow";
import AboutFrameBackdrop from "@/components/motion/AboutFrameBackdrop";
import RevealOnScroll from "@/components/site/RevealOnScroll";
import CtaBand from "@/components/site/CtaBand";
import TiltCard from "@/components/motion/TiltCard";
import { PHILOSOPHER_FRAMES } from "@/lib/frames";
import { getPageSections } from "@/lib/cms";
import { DEFAULT_ABOUT_COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "WYZREX is built on two instincts: the discipline to execute and the patience to think first. Meet the studio behind the work.",
};

const DEFAULT_PILLARS = {
  pillar_1: { num: "01", title: "Think First", copy: "No template answers. Every engagement starts with the question a brand actually needs answered." },
  pillar_2: { num: "02", title: "Ship Fast", copy: "Momentum matters. We move from strategy to shipped work without losing precision along the way." },
  pillar_3: { num: "03", title: "Measure Everything", copy: "Growth is judged by what it earns back — not impressions, not vanity metrics." },
  pillar_4: { num: "04", title: "Stay Senior", copy: "We stay small by design, so every project gets senior attention, not a rotating handoff." },
} as const;

export default async function AboutPage() {
  const sections = await getPageSections("about");
  const hero = sections.get("hero");
  const intro = sections.get("intro");
  const approach = sections.get("approach");
  const paragraphs = (intro?.body || DEFAULT_ABOUT_COPY).split(/\n{2,}/).filter(Boolean);
  const pillars = (["pillar_1", "pillar_2", "pillar_3", "pillar_4"] as const).map((key) => {
    const row = sections.get(key);
    const fallback = DEFAULT_PILLARS[key];
    return {
      num: row?.eyebrow || fallback.num,
      title: row?.heading || fallback.title,
      copy: row?.body || fallback.copy,
    };
  });

  return (
    <>
      <AboutFrameBackdrop
        config={PHILOSOPHER_FRAMES}
        sceneDescription="Illustrated Greek philosopher in quiet contemplation, drifting through the page as you scroll."
      />

      <div className="about-text-shadow relative z-10">
        <section className="pb-14 pt-40 md:pt-52">
          <div className="relative mx-auto max-w-container px-5 md:px-8">
            <div className="relative z-[1] py-6 md:py-10">
              <Eyebrow>{hero?.eyebrow || "The Studio"}</Eyebrow>
              <h1 className="max-w-[22ch] text-[clamp(2.5rem,6vw+1rem,6rem)] font-semibold leading-[1.02] tracking-tight text-fg">
                {hero?.heading || "Built on strategy. Proven by execution."}
              </h1>
            </div>
          </div>
        </section>

        <section>
          <div className="relative mx-auto max-w-container px-5 md:px-8">
            <div className="relative z-[1] flex flex-col gap-5 py-6">
              {paragraphs.map((p, i) => (
                <RevealOnScroll key={i} delay={i * 0.05}>
                  <p className={i === 0 ? "text-xl text-fg md:text-2xl" : "text-lg text-fg"}>{p}</p>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-container px-5 md:px-8">
            <Eyebrow>{approach?.eyebrow || "Our Approach"}</Eyebrow>
            <h2 className="mb-10 text-3xl font-semibold tracking-tight md:text-4xl">
              {approach?.heading || "Strategy and execution, in equal measure"}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar) => (
                <TiltCard key={pillar.num} tiltAmount={5}>
                  <div className="h-full rounded-card-sm border border-line bg-bg p-7">
                    <div className="mb-3 text-lg font-semibold text-gold">{pillar.num}</div>
                    <h3 className="text-lg font-semibold">{pillar.title}</h3>
                    <p className="mt-2 text-sm text-muted">{pillar.copy}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <CtaBand />
      </div>
    </>
  );
}
