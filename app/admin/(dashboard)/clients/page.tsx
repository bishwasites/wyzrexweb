import { asc } from "drizzle-orm";
import ClientsManager from "@/components/admin/resources/ClientsManager";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";

export default async function ClientsPage() {
  const rows = await db.select().from(clients).orderBy(asc(clients.sortOrder));
  return <ClientsManager initialRows={rows} />;
}
