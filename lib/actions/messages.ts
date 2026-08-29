"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/db/schema";

export async function markMessageRead(id: string, read: boolean) {
  await db.update(contactSubmissions).set({ read }).where(eq(contactSubmissions.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  revalidatePath("/admin/messages");
}
