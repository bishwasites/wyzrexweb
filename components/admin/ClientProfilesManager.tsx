import { addClientProfile, deleteClientProfile } from "@/lib/actions/case-studies";
import { TrashIcon } from "@/components/site/Icons";
import type { ClientProfile } from "@/db/schema";

export default function ClientProfilesManager({ caseStudyId, profiles }: { caseStudyId: string; profiles: ClientProfile[] }) {
  return (
    <div className="flex flex-col gap-4">
      {profiles.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-4 rounded-control border border-line p-4">
          <div>
            <p className="font-semibold">
              {p.handle} <span className="font-normal text-muted">— {p.platform}</span>
            </p>
            {p.followerCount != null && <p className="text-sm text-muted">{p.followerCount.toLocaleString()} followers</p>}
          </div>
          <form action={deleteClientProfile.bind(null, p.id, caseStudyId)}>
            <button type="submit" aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400">
              <TrashIcon />
            </button>
          </form>
        </div>
      ))}

      <form action={addClientProfile} className="grid grid-cols-1 gap-4 rounded-control border border-dashed border-line p-4 sm:grid-cols-2">
        <input type="hidden" name="caseStudyId" value={caseStudyId} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Platform</label>
          <select name="platform" defaultValue="instagram" className="rounded-control border border-line bg-surface px-3 py-2 text-sm">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Handle</label>
          <input name="handle" required placeholder="@brandname" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Profile URL</label>
          <input name="profileUrl" required placeholder="https://instagram.com/brandname" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Follower count (optional)</label>
          <input name="followerCount" type="number" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-fit rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg sm:col-span-2">
          Add profile
        </button>
      </form>
    </div>
  );
}
