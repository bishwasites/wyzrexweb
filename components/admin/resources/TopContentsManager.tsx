"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { TopContentItem } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "clientName", label: "Client name", type: "text", required: true },
  {
    name: "platform",
    label: "Platform",
    type: "select",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "tiktok", label: "TikTok" },
      { value: "facebook", label: "Facebook" },
      { value: "youtube", label: "YouTube" },
    ],
  },
  { name: "caption", label: "Caption", type: "textarea" },
  { name: "embedUrl", label: "Embed URL (opens the live post)", type: "text", placeholder: "https://instagram.com/p/..." },
  { name: "thumbUrl", label: "Thumbnail", type: "upload", accept: "image/*" },
  { name: "videoUrl", label: "Video file (optional — plays inline)", type: "upload", accept: "video/mp4" },
];

const columns: ColumnConfig<TopContentItem>[] = [
  { header: "Client", render: (r) => r.clientName },
  { header: "Platform", render: (r) => r.platform },
  { header: "Caption", render: (r) => r.caption ?? "—" },
];

export default function TopContentsManager({ initialRows }: { initialRows: TopContentItem[] }) {
  return (
    <ResourceManager
      resource="top-contents"
      title="Top Contents"
      singular="Content"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
      hasVisibility={false}
    />
  );
}
