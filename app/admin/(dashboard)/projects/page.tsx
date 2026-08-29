import { asc } from "drizzle-orm";
import ProjectsManager from "@/components/admin/resources/ProjectsManager";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";

export default async function ProjectsPage() {
  const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  return <ProjectsManager initialRows={rows} />;
}
