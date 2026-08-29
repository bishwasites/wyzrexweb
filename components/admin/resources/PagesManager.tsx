"use client";

import { useState } from "react";
import clsx from "clsx";
import ResourceManager, { type ColumnConfig, type FieldConfig } from "@/components/admin/ResourceManager";
import type { PageSection } from "@/db/schema";

const PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "services", label: "Services" },
  { slug: "work", label: "Work" },
  { slug: "contact", label: "Contact" },
] as const;

const fields: FieldConfig[] = [
  { name: "sectionKey", label: "Section key", type: "text", required: true, help: "Identifies this block in code, e.g. \"hero\". Only change this for a genuinely new section." },
  { name: "eyebrow", label: "Eyebrow", type: "text" },
  { name: "heading", label: "Heading", type: "text" },
  { name: "subheading", label: "Subheading", type: "textarea" },
  { name: "body", label: "Body", type: "textarea", help: "Supports **bold**, *italic*, and paragraphs separated by a blank line." },
  { name: "ctaLabel", label: "CTA label", type: "text" },
  { name: "ctaHref", label: "CTA link", type: "text" },
  { name: "imageUrl", label: "Image", type: "upload", accept: "image/*" },
];

const columns: ColumnConfig<PageSection>[] = [
  { header: "Section", render: (r) => r.sectionKey },
  { header: "Heading", render: (r) => r.heading || r.eyebrow || "—" },
];

export default function PagesManager({ initialSections }: { initialSections: PageSection[] }) {
  const [activeSlug, setActiveSlug] = useState<(typeof PAGES)[number]["slug"]>("home");
  const rows = initialSections.filter((s) => s.pageSlug === activeSlug);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setActiveSlug(p.slug)}
            className={clsx(
              "rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
              activeSlug === p.slug ? "border-gold bg-gold/10 text-gold-dark" : "border-line text-muted hover:border-gold"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <ResourceManager
        key={activeSlug}
        resource="page-sections"
        title={`${PAGES.find((p) => p.slug === activeSlug)?.label} sections`}
        singular="Section"
        initialRows={rows}
        fields={fields}
        columns={columns}
        fixedValues={{ pageSlug: activeSlug }}
      />
    </div>
  );
}
