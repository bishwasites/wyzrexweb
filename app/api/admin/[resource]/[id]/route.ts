import { NextResponse } from "next/server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ADMIN_RESOURCES, bustTag, isAdminResourceKey } from "@/lib/admin-resources";

// Per-record REST addressing (/api/admin/<resource>/<id>). The collection
// route handles the same PATCH/DELETE with the id in the body or query; this
// exists so clients can address a record by URL. Both share one config and
// the same `any` boundary around Drizzle's table union — see the sibling
// route's comment for why.

const idSchema = z.string().uuid();

function resolve(resource: string, id: string) {
  if (!isAdminResourceKey(resource)) return { error: "Unknown resource", status: 404 as const };
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid id", status: 400 as const };
  return { config: ADMIN_RESOURCES[resource], id: parsedId.data };
}

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { resource, id } = await params;
  const r = resolve(resource, id);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });

  const [row] = await db
    .select()
    .from(r.config.table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((r.config.table as any).id, r.id));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ row });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { resource, id } = await params;
  const r = resolve(resource, id);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });

  const body = await request.json().catch(() => null);
  const parsed = r.config.updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [row] = await (
    db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(r.config.table) as any
  )
    .set(parsed.data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((r.config.table as any).id, r.id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  bustTag(r.config.tag);
  return NextResponse.json({ row });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { resource, id } = await params;
  const r = resolve(resource, id);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: r.status });

  const [row] = await db
    .delete(r.config.table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((r.config.table as any).id, r.id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  bustTag(r.config.tag);
  return NextResponse.json({ ok: true });
}
