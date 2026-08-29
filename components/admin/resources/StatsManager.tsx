"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { Stat } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "value", label: "Value", type: "text", required: true, placeholder: "150" },
  { name: "suffix", label: "Suffix", type: "text", placeholder: "+" },
  { name: "label", label: "Label", type: "text", required: true, placeholder: "Projects delivered" },
];

const columns: ColumnConfig<Stat>[] = [
  { header: "Value", render: (r) => `${r.value}${r.suffix ?? ""}` },
  { header: "Label", render: (r) => r.label },
];

export default function StatsManager({ initialRows }: { initialRows: Stat[] }) {
  return (
    <ResourceManager
      resource="stats"
      title="Stats"
      singular="Stat"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
      hasVisibility={false}
    />
  );
}
