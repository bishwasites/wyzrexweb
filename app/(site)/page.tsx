import Eyebrow from "@/components/site/Eyebrow";
import Button from "@/components/site/Button";
import { HeroSplineStage } from "@/components/ui/HeroSplineStage";
import Reveal from "@/components/site/Reveal";
import ParallaxGlow from "@/components/site/ParallaxGlow";
import TrustedMarquee from "@/components/site/TrustedMarquee";
import ServicesBento from "@/components/site/ServicesBento";
import MetaAdsSection from "@/components/site/MetaAdsSection";
import TopContentsSection from "@/components/site/TopContentsSection";
import ProjectsSection from "@/components/site/ProjectsSection";
import BentoStats from "@/components/site/BentoStats";
import CtaBand from "@/components/site/CtaBand";
import { getClients, getPageSections, getServices, getStats } from "@/lib/cms";
import { HERO_POSTER_BLUR_DATA_URL, HERO_POSTER_SRC } from "@/lib/hero-poster";

export default async function HomePage() {
  const [stats, services, clients, sections] = await Promise.all([
    getStats(),
    getServices(),
    getClients(),
    getPageSections("home"),
  ]);
  const hero = sections.get("hero");
  const heroSecondary = sections.get("hero_cta_secondary");
  const trustedLabel = sections.get("trusted");
  const servicesSection = sections.get("services");

  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-28 md:pt-36">
        <ParallaxGlow
          className="absolute -left-40 -top-44 h-[600px] w-[600px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(var(--gold-rgb), 0.07), transparent 70%)" }}
        />
        <ParallaxGlow
          className="absolute -right-36 -bottom-40 h-[600px] w-[600px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(var(--gold-rgb), 0.08), transparent 70%)" }}
        />

        <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <Reveal>
              <Eyebrow>{hero?.eyebrow || "Digital Marketing & Creative Production"}</Eyebrow>
              <h1 className="mb-4 max-w-[18ch] text-[clamp(2.25rem,4vw+1rem,3.5rem)] font-bold leading-[1.15] tracking-tight">
                {hero?.heading || "Strategy sharp enough to cut through. Execution built to last."}
              </h1>
              <p className="mb-8 max-w-[480px] text-[1.05rem] text-muted">
                {hero?.subheading || "WYZREX is a Colombo-based agency for brands that want both — the thinking and the shipping."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button href={hero?.ctaHref || "/work"} variant="outline">
                  {hero?.ctaLabel || "See Our Work"}
                </Button>
                <Button href={heroSecondary?.ctaHref || "/contact"} variant="gold">
                  {heroSecondary?.ctaLabel || "Start a Project"}
                </Button>
              </div>
            </Reveal>

            {/* The stage carries its own width + aspect-ratio, so there's no
                `h-full` chain here that could resolve against an auto height. */}
            <div className="relative mx-auto w-full max-w-[560px]">
              <HeroSplineStage
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                poster={HERO_POSTER_SRC}
                posterBlurDataURL={HERO_POSTER_BLUR_DATA_URL}
              />
            </div>
          </div>

          <div className="mt-14">
            <Reveal>
              <BentoStats stats={stats} />
            </Reveal>
          </div>
        </div>
      </section>

      {clients.length > 0 && (
        <section className="relative overflow-hidden py-12">
          <ParallaxGlow
            className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(var(--gold-rgb), 0.06), transparent 70%)" }}
          />
          <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
            <Reveal>
              <p className="mb-8 text-center text-[0.9375rem] font-medium uppercase tracking-[0.14em] text-muted">
                {trustedLabel?.heading || "Trusted by"}
              </p>
              <TrustedMarquee clients={clients} />
            </Reveal>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden">
        <div className="relative z-[1] mx-auto max-w-container px-5 md:px-8">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{servicesSection?.eyebrow || "The Services"}</Eyebrow>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{servicesSection?.heading || "What we do"}</h2>
            </div>
            <Button href="/services" variant="outline">
              All Services
            </Button>
          </Reveal>
          <ServicesBento services={services} href={() => "/services"} />
        </div>
      </section>

      <MetaAdsSection />

      <TopContentsSection />

      <ProjectsSection />

      <CtaBand />
    </>
  );
}
