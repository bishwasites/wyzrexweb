import TopContentCard from "@/components/site/TopContentCard";
import RevealOnScroll from "@/components/site/RevealOnScroll";
import { getTopContentsHome } from "@/lib/queries";

export default async function TopContentsResults() {
  const items = (await getTopContentsHome()).slice(0, 6);

  if (items.length === 0) {
    return (
      <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">
        Top content is on its way — check back soon.
      </p>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
      {items.map((item, i) => (
        <RevealOnScroll
          key={item.id}
          delay={i * 0.08}
          className="aspect-[9/16] w-[78%] flex-shrink-0 snap-center sm:w-auto sm:flex-shrink sm:snap-align-none"
        >
          <TopContentCard item={item} />
        </RevealOnScroll>
      ))}
    </div>
  );
}
