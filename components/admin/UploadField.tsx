"use client";

import { useState, type ChangeEvent } from "react";
import { upload } from "@vercel/blob/client";
import { UploadIcon } from "@/components/site/Icons";
import { ALLOWED_UPLOAD_TYPES } from "@/lib/blob";

interface UploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  accept?: string;
  /** Fires true when a file starts uploading, false once it settles (success or error) — lets the parent form hold Save disabled until every field has a real value. */
  onUploadingChange?: (uploading: boolean) => void;
}

export default function UploadField({ name, label, defaultValue, accept = "image/*", onUploadingChange }: UploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setProgress(0);
    onUploadingChange?.(true);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: ALLOWED_UPLOAD_TYPES.includes(file.type) ? file.type : undefined,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      setUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      onUploadingChange?.(false);
      e.target.value = "";
    }
  }

  const isVideo = url && /\.(mp4|mov|webm)$/i.test(url);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={url} readOnly />
      <div className="flex items-center gap-4">
        {url &&
          (isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={url} className="h-16 w-16 rounded-control border border-line object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-16 w-16 rounded-control border border-line object-cover" />
          ))}
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-control border border-line px-4 py-2.5 text-sm font-medium hover:border-gold ${
            progress !== null ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <UploadIcon />
          {progress !== null ? `Uploading… ${progress}%` : url ? "Replace file" : "Upload file"}
          <input type="file" accept={accept} className="hidden" onChange={handleFileChange} disabled={progress !== null} />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
