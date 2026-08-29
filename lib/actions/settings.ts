"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { siteSettingsKv } from "@/db/schema";
import type { ContactInfo, SocialLink } from "@/lib/site";

async function upsertSetting(key: string, value: unknown) {
  await db
    .insert(siteSettingsKv)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettingsKv.key, set: { value } });
}

export async function updateAboutCopy(formData: FormData) {
  const aboutCopy = z.string().trim().min(1).parse(formData.get("aboutCopy"));
  await upsertSetting("about_copy", aboutCopy);
  revalidatePath("/admin/settings");
  revalidatePath("/about");
}

const homeStatsSchema = z.object({
  projectsDelivered: z.string().trim().min(1).max(20),
  clientRetention: z.string().trim().min(1).max(20),
  yearsOfCraft: z.string().trim().min(1).max(20),
  teamNetwork: z.string().trim().min(1).max(20),
});

export async function updateHomeStats(formData: FormData) {
  const data = homeStatsSchema.parse(Object.fromEntries(formData.entries()));
  await upsertSetting("home_stats", data);
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

const SOCIAL_NAMES: SocialLink["name"][] = ["Instagram", "LinkedIn", "Facebook", "YouTube", "TikTok"];

export async function updateContactInfo(formData: FormData) {
  const email = z.string().trim().email().parse(formData.get("email"));
  const phone = z.string().trim().min(1).parse(formData.get("phone"));
  const location = z.string().trim().min(1).parse(formData.get("location"));

  const socials: SocialLink[] = SOCIAL_NAMES.map((name) => ({
    name,
    href: String(formData.get(`social_${name}`) ?? "#").trim() || "#",
  }));

  const contactInfo: ContactInfo = { email, phone, location, socials };
  await upsertSetting("contact_info", contactInfo);
  revalidatePath("/admin/settings");
  // Header/footer render on every public route, so bust them all.
  for (const path of ["/", "/about", "/services", "/work", "/contact"]) {
    revalidatePath(path);
  }
}
