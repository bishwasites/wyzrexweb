"use client";

import { useState } from "react";
import { addTopContent, deleteTopContent } from "@/lib/actions/case-studies";
import UploadField from "@/components/admin/UploadField";
import { TrashIcon } from "@/components/site/Icons";
import type { TopContent } from "@/db/schema";

export default function TopContentManager({ caseStudyId, items }: { caseStudyId: string; items: TopContent[] }) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;
  const onUploadingChange = (uploading: boolean) =>
    setUploadingCount((count) => Math.max(0, count + (uploading ? 1 : -1)));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 rounded-control border border-line p-4">
          <div>
            <p className="font-semibold">
              {item.statLabel} <span className="font-normal text-muted">— {item.platform} {item.contentType}</span>
            </p>
            {item.caption && <p className="text-sm text-muted">{item.caption}</p>}
          </div>
          <form action={deleteTopContent.bind(null, item.id, caseStudyId)}>
            <button type="submit" aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-red-600 hover:border-red-400">
              <TrashIcon />
            </button>
          </form>
        </div>
      ))}

      <form action={addTopContent} className="grid grid-cols-1 gap-4 rounded-control border border-dashed border-line p-4 sm:grid-cols-2">
        <input type="hidden" name="caseStudyId" value={caseStudyId} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Platform</label>
          <select name="platform" defaultValue="instagram" className="rounded-control border border-line bg-surface px-3 py-2 text-sm">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Content type</label>
          <select name="contentType" defaultValue="reel" className="rounded-control border border-line bg-surface px-3 py-2 text-sm">
            <option value="video">Video</option>
            <option value="reel">Reel</option>
            <option value="post">Post</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Stat label</label>
          <input name="statLabel" required placeholder="1.4M views" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Caption (optional)</label>
          <input name="caption" className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Embed URL (optional — opens live post)</label>
          <input name="embedUrl" placeholder="https://instagram.com/p/..." className="rounded-control border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <UploadField name="thumbnailUrl" label="Thumbnail" onUploadingChange={onUploadingChange} />
        <div className="sm:col-span-2">
          <UploadField
            name="mediaUrl"
            label="Video/media file (optional — plays inline instead of opening embed URL)"
            accept="image/*,video/*"
            onUploadingChange={onUploadingChange}
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="w-fit rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg disabled:opacity-60 sm:col-span-2"
        >
          {isUploading ? "Waiting for upload…" : "Add content"}
        </button>
      </form>
    </div>
  );
}
