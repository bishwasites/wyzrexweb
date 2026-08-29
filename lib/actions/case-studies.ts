"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { caseStudies, adResults, topContent, clientProfiles } from "@/db/schema";

const caseStudySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  clientName: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(120),
  year: z.string().trim().min(4).max(4),
  description: z.string().trim().min(1),
  tags: z.string().optional().default(""),
  clientLogoUrl: z.string().optional().default(""),
  heroMediaUrl: z.string().optional().default(""),
  heroMediaType: z.enum(["image", "video"]),
  status: z.enum(["draft", "published"]),
  displayOrder: z.coerce.number().int().default(0),
});

function parseCaseStudyForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = caseStudySchema.parse(raw);
  const tags = parsed.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    slug: parsed.slug,
    clientName: parsed.clientName,
    category: parsed.category,
    year: parsed.year,
    description: parsed.description,
    tags,
    clientLogoUrl: parsed.clientLogoUrl || null,
    heroMediaUrl: parsed.heroMediaUrl || null,
    heroMediaType: parsed.heroMediaType,
    status: parsed.status,
    displayOrder: parsed.displayOrder,
  };
}

export async function createCaseStudy(formData: FormData) {
  const data = parseCaseStudyForm(formData);
  const [row] = await db.insert(caseStudies).values(data).returning();
  revalidatePath("/admin/case-studies");
  revalidatePath("/work");
  revalidatePath("/");
  redirect(`/admin/case-studies/${row!.id}/edit`);
}

export async function updateCaseStudy(id: string, formData: FormData) {
  const data = parseCaseStudyForm(formData);
  await db
    .update(caseStudies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(caseStudies.id, id));
  revalidatePath("/admin/case-studies");
  revalidatePath(`/admin/case-studies/${id}/edit`);
  revalidatePath("/work");
  revalidatePath(`/work/${data.slug}`);
  revalidatePath("/");
}

export async function deleteCaseStudy(id: string) {
  await db.delete(caseStudies).where(eq(caseStudies.id, id));
  revalidatePath("/admin/case-studies");
  revalidatePath("/work");
  revalidatePath("/");
  redirect("/admin/case-studies");
}

// ---------------------------------------------------------------------------
// Ad results
// ---------------------------------------------------------------------------

const adResultSchema = z.object({
  caseStudyId: z.string().uuid(),
  platform: z.enum(["meta", "tiktok", "other"]),
  screenshotUrl: z.string().optional().default(""),
  headlineMetric: z.string().trim().min(1).max(60),
  metricLabel: z.string().trim().min(1).max(120),
  caption: z.string().optional().default(""),
});

export async function addAdResult(formData: FormData) {
  const data = adResultSchema.parse(Object.fromEntries(formData.entries()));
  await db.insert(adResults).values({
    caseStudyId: data.caseStudyId,
    platform: data.platform,
    screenshotUrl: data.screenshotUrl || null,
    headlineMetric: data.headlineMetric,
    metricLabel: data.metricLabel,
    caption: data.caption || null,
  });
  revalidatePath(`/admin/case-studies/${data.caseStudyId}/edit`);
  revalidatePath("/work");
}

export async function deleteAdResult(id: string, caseStudyId: string) {
  await db.delete(adResults).where(eq(adResults.id, id));
  revalidatePath(`/admin/case-studies/${caseStudyId}/edit`);
  revalidatePath("/work");
}

// ---------------------------------------------------------------------------
// Top content
// ---------------------------------------------------------------------------

const topContentSchema = z.object({
  caseStudyId: z.string().uuid(),
  platform: z.enum(["instagram", "tiktok", "facebook", "youtube"]),
  contentType: z.enum(["video", "reel", "post"]),
  mediaUrl: z.string().optional().default(""),
  embedUrl: z.string().optional().default(""),
  thumbnailUrl: z.string().optional().default(""),
  statLabel: z.string().trim().min(1).max(120),
  caption: z.string().optional().default(""),
});

export async function addTopContent(formData: FormData) {
  const data = topContentSchema.parse(Object.fromEntries(formData.entries()));
  await db.insert(topContent).values({
    caseStudyId: data.caseStudyId,
    platform: data.platform,
    contentType: data.contentType,
    mediaUrl: data.mediaUrl || null,
    embedUrl: data.embedUrl || null,
    thumbnailUrl: data.thumbnailUrl || null,
    statLabel: data.statLabel,
    caption: data.caption || null,
  });
  revalidatePath(`/admin/case-studies/${data.caseStudyId}/edit`);
  revalidatePath("/work");
}

export async function deleteTopContent(id: string, caseStudyId: string) {
  await db.delete(topContent).where(eq(topContent.id, id));
  revalidatePath(`/admin/case-studies/${caseStudyId}/edit`);
  revalidatePath("/work");
}

// ---------------------------------------------------------------------------
// Client profiles
// ---------------------------------------------------------------------------

const clientProfileSchema = z.object({
  caseStudyId: z.string().uuid(),
  platform: z.enum(["instagram", "tiktok", "facebook"]),
  handle: z.string().trim().min(1).max(120),
  profileUrl: z.string().trim().min(1),
  followerCount: z.string().optional().default(""),
});

export async function addClientProfile(formData: FormData) {
  const data = clientProfileSchema.parse(Object.fromEntries(formData.entries()));
  const followerCount = data.followerCount.trim() ? Number.parseInt(data.followerCount, 10) : null;
  await db.insert(clientProfiles).values({
    caseStudyId: data.caseStudyId,
    platform: data.platform,
    handle: data.handle,
    profileUrl: data.profileUrl,
    followerCount: Number.isFinite(followerCount) ? followerCount : null,
  });
  revalidatePath(`/admin/case-studies/${data.caseStudyId}/edit`);
  revalidatePath("/work");
}

export async function deleteClientProfile(id: string, caseStudyId: string) {
  await db.delete(clientProfiles).where(eq(clientProfiles.id, id));
  revalidatePath(`/admin/case-studies/${caseStudyId}/edit`);
  revalidatePath("/work");
}
