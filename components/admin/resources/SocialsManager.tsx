"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { Social } from "@/db/schema";

const fields: FieldConfig[] = [
  {
    name: "platform",
    label: "Platform",
    type: "select",
    options: [
      { value: "Instagram", label: "Instagram" },
      { value: "Facebook", label: "Facebook" },
      { value: "TikTok", label: "TikTok" },
      { value: "YouTube", label: "YouTube" },
      { value: "LinkedIn", label: "LinkedIn" },
    ],
  },
  { name: "url", label: "URL", type: "text", required: true, placeholder: "https://instagram.com/wyzrex" },
];

const columns: ColumnConfig<Social>[] = [
  { header: "Platform", render: (r) => r.platform },
  { header: "URL", render: (r) => r.url },
];

export default function SocialsManager({ initialRows }: { initialRows: Social[] }) {
  return (
    <ResourceManager
      resource="socials"
      title="Socials"
      singular="Social link"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
    />
  );
}
