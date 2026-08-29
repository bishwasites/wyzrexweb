import Eyebrow from "@/components/site/Eyebrow";
import MetricCard from "@/components/site/MetricCard";
import Lightbox from "@/components/site/Lightbox";
import type { AdResult } from "@/db/schema";

export default function AdResultsSection({ results }: { results: AdResult[] }) {
  if (results.length === 0) return null;

  const screenshots = results
    .filter((r): r is AdResult & { screenshotUrl: string } => Boolean(r.screenshotUrl))
    .map((r) => ({ src: r.screenshotUrl, alt: r.metricLabel }));
  const captions = results.filter((r) => r.caption);

  return (
    <section>
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Eyebrow>Meta Ads Performance</Eyebrow>
        <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">
          Results that speak for themselves
        </h2>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {results.map((r) => (
            <MetricCard key={r.id} value={r.headlineMetric} label={r.metricLabel} />
          ))}
        </div>

        {screenshots.length > 0 && <Lightbox images={screenshots} />}

        {captions.length > 0 && (
          <div className="mt-6 space-y-1 text-sm text-muted">
            {captions.map((r) => (
              <p key={r.id}>{r.caption}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
