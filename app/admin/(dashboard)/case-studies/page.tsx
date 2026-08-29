import Link from "next/link";
import DataTable from "@/components/admin/DataTable";
import { PlusIcon } from "@/components/site/Icons";
import { getAllCaseStudiesAdmin } from "@/lib/queries";

export default async function CaseStudiesListPage() {
  const caseStudies = await getAllCaseStudiesAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Case Studies</h1>
        <Link href="/admin/case-studies/new" className="inline-flex items-center gap-2 rounded-pill bg-gold px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]">
          <PlusIcon />
          New case study
        </Link>
      </div>

      <DataTable
        rows={caseStudies}
        emptyMessage="No case studies yet — create your first one."
        columns={[
          {
            header: "Client",
            render: (c) => (
              <Link href={`/admin/case-studies/${c.id}/edit`} className="font-medium hover:text-gold-dark">
                {c.clientName}
              </Link>
            ),
          },
          { header: "Category", render: (c) => c.category },
          { header: "Year", render: (c) => c.year },
          {
            header: "Status",
            render: (c) => (
              <span className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${c.status === "published" ? "bg-gold/15 text-gold-dark" : "bg-surface-2 text-muted"}`}>
                {c.status}
              </span>
            ),
          },
          { header: "Order", render: (c) => c.displayOrder },
        ]}
      />
    </div>
  );
}
