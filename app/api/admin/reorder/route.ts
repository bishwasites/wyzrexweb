import { NextResponse } from "next/server";

import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { ADMIN_RESOURCES, bustTag, isAdminResourceKey } from "@/lib/admin-resources";

// Persists a drag-reorder in one request: the client sends the ids in their
// new visual order and each row's sort_order becomes its index. Doing it as a
// single transaction avoids the half-applied ordering you'd get from firing a
// PATCH per row and having one fail.

const bodySchema = z.object({
  resource: z.string().trim().min(1),
  ids: z.array(z.string().uuid()).min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { resource, ids } = parsed.data;
  if (!isAdminResourceKey(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const config = ADMIN_RESOURCES[resource];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = config.table as any;
  if (!("sortOrder" in table)) {
    return NextResponse.json({ error: "Resource is not reorderable" }, { status: 400 });
  }

  // Reject ids that don't belong to this table rather than silently no-op'ing,
  // so a mismatched client payload surfaces instead of scrambling the order.
  const existing = await db.select({ id: table.id }).from(config.table).where(inArray(table.id, ids));
  if (existing.length !== ids.length) {
    return NextResponse.json({ error: "Some ids do not belong to this resource" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await (tx.update(config.table) as any).set({ sortOrder: i }).where(eq(table.id, ids[i]));
    }
  });

  bustTag(config.tag);
  return NextResponse.json({ ok: true, count: ids.length });
}
