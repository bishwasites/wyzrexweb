import { asc } from "drizzle-orm";
import SocialsManager from "@/components/admin/resources/SocialsManager";
import { db } from "@/lib/db";
import { socials } from "@/db/schema";

export default async function SocialsPage() {
  const rows = await db.select().from(socials).orderBy(asc(socials.sortOrder));
  return <SocialsManager initialRows={rows} />;
}
