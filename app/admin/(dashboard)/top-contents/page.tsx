import { asc } from "drizzle-orm";
import TopContentsManager from "@/components/admin/resources/TopContentsManager";
import { db } from "@/lib/db";
import { topContents } from "@/db/schema";

export default async function TopContentsPage() {
  const rows = await db.select().from(topContents).orderBy(asc(topContents.sortOrder));
  return <TopContentsManager initialRows={rows} />;
}
