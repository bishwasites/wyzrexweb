import { asc } from "drizzle-orm";
import TeamManager from "@/components/admin/resources/TeamManager";
import { db } from "@/lib/db";
import { team } from "@/db/schema";

export default async function TeamPage() {
  const rows = await db.select().from(team).orderBy(asc(team.sortOrder));
  return <TeamManager initialRows={rows} />;
}
