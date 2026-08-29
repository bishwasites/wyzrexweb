import { asc } from "drizzle-orm";
import FooterManager from "@/components/admin/resources/FooterManager";
import { db } from "@/lib/db";
import { footerColumns, footerLinks } from "@/db/schema";

export default async function FooterPage() {
  const [columns, links] = await Promise.all([
    db.select().from(footerColumns).orderBy(asc(footerColumns.sortOrder)),
    db.select().from(footerLinks).orderBy(asc(footerLinks.sortOrder)),
  ]);
  return <FooterManager initialColumns={columns} initialLinks={links} />;
}
