"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { NavItem } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "label", label: "Label", type: "text", required: true },
  { name: "href", label: "URL", type: "text", required: true, placeholder: "/services or https://…" },
  { name: "isExternal", label: "Opens in a new tab", type: "checkbox" },
];

const columns: ColumnConfig<NavItem>[] = [
  { header: "Label", render: (r) => r.label },
  { header: "URL", render: (r) => r.href },
  { header: "External", render: (r) => (r.isExternal ? "Yes" : "No") },
];

export default function NavItemsManager({ initialRows }: { initialRows: NavItem[] }) {
  return (
    <ResourceManager
      resource="nav-items"
      title="Navigation"
      singular="Nav item"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
    />
  );
}
