"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { Client } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "name", label: "Client name", type: "text", required: true },
  { name: "logoUrl", label: "Logo", type: "upload", accept: "image/*" },
];

const columns: ColumnConfig<Client>[] = [{ header: "Name", render: (r) => r.name }];

export default function ClientsManager({ initialRows }: { initialRows: Client[] }) {
  return (
    <ResourceManager
      resource="clients"
      title="Clients"
      singular="Client"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
    />
  );
}
