"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { MetaAd } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "clientName", label: "Client name", type: "text", required: true },
  { name: "campaignName", label: "Campaign name", type: "text", required: true },
  { name: "resultHeadline", label: "Result headline", type: "text", required: true, placeholder: "3.2x ROAS" },
  { name: "resultSub", label: "Result sub-text", type: "text", placeholder: "over a 6-week campaign" },
  { name: "imageUrl", label: "Ad image", type: "upload", accept: "image/*" },
];

const columns: ColumnConfig<MetaAd>[] = [
  { header: "Client", render: (r) => r.clientName },
  { header: "Campaign", render: (r) => r.campaignName },
  { header: "Result", render: (r) => r.resultHeadline },
];

export default function MetaAdsManager({ initialRows }: { initialRows: MetaAd[] }) {
  return (
    <ResourceManager
      resource="meta-ads"
      title="Meta Ads"
      singular="Meta Ad"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
      hasVisibility={false}
    />
  );
}
