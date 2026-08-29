import { asc } from "drizzle-orm";
import MetaAdsManager from "@/components/admin/resources/MetaAdsManager";
import { db } from "@/lib/db";
import { metaAds } from "@/db/schema";

export default async function MetaAdsPage() {
  const rows = await db.select().from(metaAds).orderBy(asc(metaAds.sortOrder));
  return <MetaAdsManager initialRows={rows} />;
}
