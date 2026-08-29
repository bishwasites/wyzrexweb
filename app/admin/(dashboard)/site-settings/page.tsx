import { eq } from "drizzle-orm";
import SiteSettingsForm from "@/components/admin/resources/SiteSettingsForm";
import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";

export default async function SiteSettingsPage() {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Site Settings</h1>
      <SiteSettingsForm initial={row ?? null} />
    </div>
  );
}
