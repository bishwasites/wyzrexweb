import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { caseStudies, adResults, topContent, clientProfiles } from "@/db/schema";
import CaseStudyForm from "@/components/admin/CaseStudyForm";
import AdResultsManager from "@/components/admin/AdResultsManager";
import TopContentManager from "@/components/admin/TopContentManager";
import ClientProfilesManager from "@/components/admin/ClientProfilesManager";
import { updateCaseStudy, deleteCaseStudy } from "@/lib/actions/case-studies";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCaseStudyPage({ params }: PageProps) {
  const { id } = await params;

  const caseStudy = await db.query.caseStudies.findFirst({ where: eq(caseStudies.id, id) });
  if (!caseStudy) notFound();

  const [ads, content, profiles] = await Promise.all([
    db.query.adResults.findMany({ where: eq(adResults.caseStudyId, id) }),
    db.query.topContent.findMany({ where: eq(topContent.caseStudyId, id) }),
    db.query.clientProfiles.findMany({ where: eq(clientProfiles.caseStudyId, id) }),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit — {caseStudy.clientName}</h1>
        <form action={deleteCaseStudy.bind(null, id)}>
          <button type="submit" className="rounded-pill border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete case study
          </button>
        </form>
      </div>

      <CaseStudyForm action={updateCaseStudy.bind(null, id)} initial={caseStudy} submitLabel="Save changes" />

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Meta Ads Performance</h2>
        <AdResultsManager caseStudyId={id} results={ads} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Top Performing Content</h2>
        <TopContentManager caseStudyId={id} items={content} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Client Profiles</h2>
        <ClientProfilesManager caseStudyId={id} profiles={profiles} />
      </section>
    </div>
  );
}
