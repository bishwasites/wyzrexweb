"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import { ServiceIcon } from "@/components/site/Icons";
import type { Service } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", placeholder: "web-design" },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "iconName", label: "Icon", type: "icon" },
];

const columns: ColumnConfig<Service>[] = [
  {
    header: "",
    render: (r) => (
      <span className="flex h-8 w-8 items-center justify-center rounded-control bg-gold/10 text-gold-dark">
        <ServiceIcon name={r.iconName} />
      </span>
    ),
  },
  { header: "Title", render: (r) => r.title },
  { header: "Description", render: (r) => (r.description.length > 60 ? r.description.slice(0, 60) + "…" : r.description) },
];

export default function ServicesManager({ initialRows }: { initialRows: Service[] }) {
  return (
    <ResourceManager
      resource="services"
      title="Services"
      singular="Service"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
    />
  );
}
