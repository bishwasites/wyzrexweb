"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { trustedBrands } from "@/db/schema";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  logoUrl: z.string().trim().min(1),
  websiteUrl: z.string().optional().default(""),
  displayOrder: z.coerce.number().int().default(0),
});

export async function addTrustedBrand(formData: FormData) {
  const data = schema.parse(Object.fromEntries(formData.entries()));
  await db.insert(trustedBrands).values({
    name: data.name,
    logoUrl: data.logoUrl,
    websiteUrl: data.websiteUrl || null,
    displayOrder: data.displayOrder,
  });
  revalidatePath("/admin/trusted-brands");
  revalidatePath("/");
}

export async function deleteTrustedBrand(id: string) {
  await db.delete(trustedBrands).where(eq(trustedBrands.id, id));
  revalidatePath("/admin/trusted-brands");
  revalidatePath("/");
}
