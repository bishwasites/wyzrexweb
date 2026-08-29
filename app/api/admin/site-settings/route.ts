import { NextResponse } from "next/server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";
import { CACHE_TAGS, bustTag } from "@/lib/admin-resources";

// site_settings is a singleton (id = 1) rather than a list, so it gets its own
// route instead of going through the generic [resource] handler.

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const settingsSchema = z.object({
  logoLightUrl: optionalText,
  logoDarkUrl: optionalText,
  faviconUrl: optionalText,
  siteTitle: optionalText,
  metaDescription: optionalText,
  ogImageUrl: optionalText,
  primaryColor: optionalText,
  phone: optionalText,
  email: optionalText,
  address: optionalText,
  whatsapp: optionalText,
  googleMapsEmbed: optionalText,
});

export async function GET() {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  return NextResponse.json({ row: row ?? null });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Upsert: the row is created by the seed, but a database that skipped it
  // shouldn't 404 the admin form.
  const [row] = await db
    .insert(siteSettings)
    .values({ id: 1, ...parsed.data })
    .onConflictDoUpdate({ target: siteSettings.id, set: parsed.data })
    .returning();

  bustTag(CACHE_TAGS.settings);
  return NextResponse.json({ row });
}
