import { asc } from "drizzle-orm";
import PagesManager from "@/components/admin/resources/PagesManager";
import { db } from "@/lib/db";
import { pageSections } from "@/db/schema";

export default async function PagesAdminPage() {
  const rows = await db.select().from(pageSections).orderBy(asc(pageSections.sortOrder));
  return <PagesManager initialSections={rows} />;
}
