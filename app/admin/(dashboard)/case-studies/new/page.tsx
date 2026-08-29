import CaseStudyForm from "@/components/admin/CaseStudyForm";
import { createCaseStudy } from "@/lib/actions/case-studies";

export default function NewCaseStudyPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">New Case Study</h1>
      <CaseStudyForm action={createCaseStudy} submitLabel="Create case study" />
    </div>
  );
}
