import { asc } from "drizzle-orm";
import ServicesManager from "@/components/admin/resources/ServicesManager";
import { db } from "@/lib/db";
import { services } from "@/db/schema";

export default async function ServicesPage() {
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
  return <ServicesManager initialRows={rows} />;
}
