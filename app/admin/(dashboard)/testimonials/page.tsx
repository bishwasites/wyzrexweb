import { asc } from "drizzle-orm";
import TestimonialsManager from "@/components/admin/resources/TestimonialsManager";
import { db } from "@/lib/db";
import { testimonials } from "@/db/schema";

export default async function TestimonialsPage() {
  const rows = await db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
  return <TestimonialsManager initialRows={rows} />;
}
