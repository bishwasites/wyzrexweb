import MetaAdsGrid from "@/components/site/MetaAdsGrid";
import { getMetaAds } from "@/lib/queries";

export default async function MetaAdsResults() {
  const ads = (await getMetaAds()).slice(0, 6);

  if (ads.length === 0) {
    return (
      <p className="rounded-card-sm border border-dashed border-line p-10 text-center text-muted">
        Results are on their way — check back soon.
      </p>
    );
  }

  return <MetaAdsGrid ads={ads} />;
}
