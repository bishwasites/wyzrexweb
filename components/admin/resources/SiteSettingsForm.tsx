"use client";

import { useState, type FormEvent } from "react";
import UploadField from "@/components/admin/UploadField";
import { useToast } from "@/components/admin/Toast";
import type { SiteSettings } from "@/db/schema";

export default function SiteSettingsForm({ initial }: { initial: SiteSettings | null }) {
  const [saving, setSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;
  const toast = useToast();
  const onUploadingChange = (uploading: boolean) =>
    setUploadingCount((count) => Math.max(0, count + (uploading ? 1 : -1)));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploading) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast("success", "Site settings saved");
    } catch {
      toast("error", "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  const field = (name: keyof SiteSettings, label: string, placeholder?: string, type = "text") => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={initial?.[name] ?? ""}
        placeholder={placeholder}
        className="rounded-control border border-line bg-surface px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Branding</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UploadField name="logoLightUrl" label="Logo (light mode)" defaultValue={initial?.logoLightUrl ?? ""} accept="image/*" onUploadingChange={onUploadingChange} />
          <UploadField name="logoDarkUrl" label="Logo (dark mode)" defaultValue={initial?.logoDarkUrl ?? ""} accept="image/*" onUploadingChange={onUploadingChange} />
          <UploadField name="faviconUrl" label="Favicon" defaultValue={initial?.faviconUrl ?? ""} accept="image/*" onUploadingChange={onUploadingChange} />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Primary colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primaryColor"
                defaultValue={initial?.primaryColor || "#ffc629"}
                className="h-10 w-14 flex-shrink-0 cursor-pointer rounded-control border border-line bg-surface"
              />
              <span className="text-sm text-muted">Used for buttons, accents and hover states site-wide.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">SEO defaults</h2>
        <div className="grid grid-cols-1 gap-5">
          {field("siteTitle", "Site title")}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Meta description</label>
            <textarea
              name="metaDescription"
              defaultValue={initial?.metaDescription ?? ""}
              rows={3}
              className="rounded-control border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
          <UploadField name="ogImageUrl" label="Social share image (OG)" defaultValue={initial?.ogImageUrl ?? ""} accept="image/*" onUploadingChange={onUploadingChange} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Contact details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {field("email", "Email", "hello@wyzrex.com", "email")}
          {field("phone", "Phone", "+94 77 206 9661")}
          {field("whatsapp", "WhatsApp", "+94 77 206 9661")}
          {field("address", "Address", "Colombo, Sri Lanka")}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Google Maps embed URL</label>
          <input
            name="googleMapsEmbed"
            defaultValue={initial?.googleMapsEmbed ?? ""}
            placeholder="https://www.google.com/maps/embed?..."
            className="rounded-control border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving || isUploading}
        className="w-fit rounded-pill bg-gold px-6 py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-60"
      >
        {isUploading ? "Waiting for upload…" : saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
