"use client";

import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { Project } from "@/db/schema";

const fields: FieldConfig[] = [
  { name: "clientName", label: "Client name", type: "text", required: true },
  { name: "brief", label: "Brief", type: "textarea" },
  { name: "logoUrl", label: "Logo", type: "upload", accept: "image/*" },
  { name: "coverUrl", label: "Cover image", type: "upload", accept: "image/*" },
  { name: "websiteUrl", label: "Website URL", type: "text", placeholder: "https://client.com" },
  { name: "instagramUrl", label: "Instagram URL", type: "text", placeholder: "https://instagram.com/client" },
  { name: "facebookUrl", label: "Facebook URL", type: "text", placeholder: "https://facebook.com/client" },
  { name: "tiktokUrl", label: "TikTok URL", type: "text", placeholder: "https://tiktok.com/@client" },
  { name: "youtubeUrl", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/@client" },
];

const columns: ColumnConfig<Project>[] = [
  { header: "Client", render: (r) => r.clientName },
  { header: "Brief", render: (r) => (r.brief ? r.brief.slice(0, 60) : "—") },
];

export default function ProjectsManager({ initialRows }: { initialRows: Project[] }) {
  return (
    <ResourceManager
      resource="projects"
      title="Projects"
      singular="Project"
      initialRows={initialRows}
      fields={fields}
      columns={columns}
      hasVisibility={false}
    />
  );
}
