import { NextResponse } from "next/server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ADMIN_RESOURCES, bustTag, isAdminResourceKey } from "@/lib/admin-resources";

// Generic zod-validated CRUD covering every CMS resource in
// lib/admin-resources.ts. They all share the same shape of concern
// (id, sortOrder, visibility), so one dynamic route handles them instead of a
// dozen near-identical files. Table/schema pairing is enforced at the config
// level; TypeScript can't prove that pairing across a union of tables, so the
// `.values()` / `.set()` calls below use a narrow, well-understood `any`
// boundary rather than fighting Drizzle's generics for no real safety gain —
// runtime correctness comes from zod validation against the matching schema.
//
// Every write busts the resource's cache tag so the public site, which reads
// through unstable_cache in lib/cms.ts, picks the edit up on the next request.

const idSchema = z.string().uuid();

function resolveResource(resource: string) {
  if (!isAdminResourceKey(resource)) return null;
  return ADMIN_RESOURCES[resource];
}

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = resolveResource(resource);
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const rows = await db.select().from(config.table).orderBy(config.orderBy);
  return NextResponse.json({ rows });
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = resolveResource(resource);
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = config.insertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.sortOrder === undefined) {
    const rows = await db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select({ next: sql<number>`coalesce(max(${(config.table as any).sortOrder}), -1) + 1` })
      .from(config.table);
    data.sortOrder = rows[0]?.next ?? 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await (db.insert(config.table) as any).values(data).returning();
  bustTag(config.tag);
  return NextResponse.json({ row }, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = resolveResource(resource);
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const idResult = idSchema.safeParse((body as { id?: unknown })?.id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
  }

  const { id: _id, ...rest } = (body as Record<string, unknown>) ?? {};
  const parsed = config.updateSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [row] = await (
    db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(config.table) as any
  )
    .set(parsed.data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((config.table as any).id, idResult.data))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  bustTag(config.tag);
  return NextResponse.json({ row });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = resolveResource(resource);
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const id = new URL(request.url).searchParams.get("id");
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
  }

  const [row] = await db
    .delete(config.table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((config.table as any).id, idResult.data))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  bustTag(config.tag);
  return NextResponse.json({ ok: true });
}
