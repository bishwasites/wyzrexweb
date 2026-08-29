import { addAdResult, deleteAdResult } from "@/lib/actions/case-studies";
import UploadField from "@/components/admin/UploadField";
import { TrashIcon } from "@/components/site/Icons";
import type { AdResult } from "@/db/schema";

export default function AdResultsManager({ caseStudyId, results }: { caseStudyId: string; results: AdResult[] }) {
  return (
    <div className="flex flex-col gap-4">
      {results.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4 rounded-control border border-line p-4">
          <div>
            <p className="font-semibold">
              {r.headlineMetric} <span className="font-normal text-muted">— {r.metricLabel}</span>
            </p>
            <p className="text-sm text-muted">
              {r.platform}
              {r.caption ? ` · ${r.caption}` : ""}
            </p>
          </div>
          <form action={deleteAdResult.bind(null, r.id, caseStudyId)}>
            <button type="submit" aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400">
              <TrashIcon />
            </button>
          </form>
        </div>
      ))}

      <form action={addAdResult} className="grid grid-cols-1 gap-4 rounded-control border border-dashed border-line p-4 sm:grid-cols-2">
        <input type="hidden" name="caseStudyId" value={caseStudyId} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Platform</label>
          <select name="platform" defaultValue="meta" className="rounded-control border border-line bg-surface px-3 py-2 text-sm">
            <option value="meta">Meta</option>
            <option value="tiktok">TikTok</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Headline metric</label>
          <input name="headlineMetric" required placeholder="4.2x ROAS" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Metric label</label>
          <input name="metricLabel" required placeholder="Return on Ad Spend" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Caption (optional)</label>
          <input name="caption" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <UploadField name="screenshotUrl" label="Screenshot" />
        </div>
        <button type="submit" className="w-fit rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg sm:col-span-2">
          Add ad result
        </button>
      </form>
    </div>
  );
}
