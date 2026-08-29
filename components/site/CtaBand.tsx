import Button from "@/components/site/Button";
import Reveal from "@/components/site/Reveal";
import ParallaxGlow from "@/components/site/ParallaxGlow";
import { getPageSections } from "@/lib/cms";

// One shared banner rendered at the bottom of every page, so its copy lives
// under a single page_sections row (home/cta) rather than being duplicated
// per page — that single row is exactly what was previously hardcoded
// identically in every call site.
export default async function CtaBand() {
  const home = await getPageSections("home");
  const cta = home.get("cta");
  const heading = cta?.heading || "Have a project in mind? Let's build it.";
  const ctaLabel = cta?.ctaLabel || "Start a project";
  const ctaHref = cta?.ctaHref || "/contact";

  return (
    <section className="px-5 py-14 md:px-8">
      <div className="relative isolate mx-auto flex max-w-container flex-col items-center gap-8 overflow-hidden rounded-card bg-ink px-8 py-14 text-center text-ink-fg md:flex-row md:justify-between md:text-left">
        {/* Centred a quarter in from the right edge rather than hung off the
            corner — out there the gradient's bright core sat outside the box,
            so the rounded clip cut it into a smudged arc. Offset with margins,
            not translate utilities: ParallaxGlow drives its drift by writing
            `transform` inline, which would overwrite any transform-based
            centring.

            The soft falloff is done with gradient stops rather than
            `filter: blur()`. A large blur on a mostly-transparent layer inside
            this isolated, clipped container rasterises to its own composited
            box and leaves a faint rectangular seam over the near-black banner
            — the exact edge this is meant to avoid. Stops reach fully
            transparent by 78%, so the outer fifth of the box is empty and no
            box edge can show. */}
        <ParallaxGlow
          className="pointer-events-none absolute right-[25%] top-1/2 -mr-40 -mt-40 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--gold-rgb), 0.12) 0%, rgba(var(--gold-rgb), 0.07) 35%, rgba(var(--gold-rgb), 0.02) 60%, transparent 78%)",
          }}
        />

        <div className="relative z-[1] flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-6 md:text-left">
          <Reveal>
            <span className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gold text-[#0a0a0a] md:mx-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="max-w-[22ch] text-2xl font-semibold tracking-tight text-ink-fg md:text-3xl">{heading}</h2>
          </Reveal>
        </div>

        <Reveal delay={160} className="relative z-[1] flex-shrink-0">
          <Button href={ctaHref} variant="gold">
            {ctaLabel}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
