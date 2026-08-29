"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { Testimonial } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", placeholder: "Marketing Director" },
  { name: "company", label: "Company", type: "text" },
  { name: "quote", label: "Quote", type: "textarea", required: true },
  { name: "avatarUrl", label: "Avatar", type: "upload", accept: "image/*" },
];

const columns: ColumnConfig<Testimonial>[] = [
  { header: "Name", render: (r) => r.name },
  { header: "Company", render: (r) => r.company ?? "—" },
  { header: "Quote", render: (r) => (r.quote.length > 60 ? r.quote.slice(0, 60) + "…" : r.quote) },
];

export default function TestimonialsManager({ initialRows }: { initialRows: Testimonial[] }) {
  return (
    <ResourceManager
      resource="testimonials"
      title="Testimonials"
      singular="Testimonial"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
    />
  );
}
