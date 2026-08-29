"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { TeamMember } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", placeholder: "Creative Director" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "photoUrl", label: "Photo", type: "upload", accept: "image/*" },
];

const columns: ColumnConfig<TeamMember>[] = [
  { header: "Name", render: (r) => r.name },
  { header: "Role", render: (r) => r.role ?? "—" },
];

export default function TeamManager({ initialRows }: { initialRows: TeamMember[] }) {
  return (
    <ResourceManager
      resource="team"
      title="Team"
      singular="Team member"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
    />
  );
}
