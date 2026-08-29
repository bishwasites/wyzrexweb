import { desc } from "drizzle-orm";
import LeadsManager from "@/components/admin/resources/LeadsManager";
import { db } from "@/lib/db";
import { leads } from "@/db/schema";

export default async function LeadsPage() {
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return <LeadsManager initialRows={rows} />;
}
