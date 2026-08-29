import { asc } from "drizzle-orm";
import NavItemsManager from "@/components/admin/resources/NavItemsManager";
import { db } from "@/lib/db";
import { navItems } from "@/db/schema";

export default async function NavigationPage() {
  const rows = await db.select().from(navItems).orderBy(asc(navItems.sortOrder));
  return <NavItemsManager initialRows={rows} />;
}
