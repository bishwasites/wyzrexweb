import { asc } from "drizzle-orm";
import StatsManager from "@/components/admin/resources/StatsManager";
import { db } from "@/lib/db";
import { stats } from "@/db/schema";

export default async function StatsPage() {
  const rows = await db.select().from(stats).orderBy(asc(stats.sortOrder));
  return <StatsManager initialRows={rows} />;
}
