import "server-only";
import { asc, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  caseStudies,
  adResults,
  topContent,
  clientProfiles,
  trustedBrands,
  services,
  siteSettingsKv,
  metaAds,
  topContents,
  projects,
  type CaseStudy,
} from "@/db/schema";
import {
  DEFAULT_ABOUT_COPY,
  DEFAULT_CONTACT_INFO,
  DEFAULT_HOME_STATS,
  type ContactInfo,
  type HomeStats,
} from "@/lib/site";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.query.siteSettingsKv.findFirst({ where: eq(siteSettingsKv.key, key) });
  if (!row) return fallback;
  return row.value as T;
}

export function getContactInfo(): Promise<ContactInfo> {
  return getSetting("contact_info", DEFAULT_CONTACT_INFO);
}

export function getHomeStats(): Promise<HomeStats> {
  return getSetting("home_stats", DEFAULT_HOME_STATS);
}

export function getAboutCopy(): Promise<string> {
  return getSetting("about_copy", DEFAULT_ABOUT_COPY);
}

export function getServices() {
  return db.query.services.findMany({ orderBy: asc(services.sortOrder) });
}

export function getTrustedBrands() {
  return db.query.trustedBrands.findMany({ orderBy: asc(trustedBrands.displayOrder) });
}

// The three functions below back the not-yet-built public sections for the
// meta-ads / top-contents / projects admin resources. Each public page
// should call these from a Server Component with `export const revalidate =
// 60`, the same way the rest of app/(site) is meant to work — note that
// app/(site)/layout.tsx currently sets `export const dynamic =
// "force-dynamic"` for the whole route group, which overrides any
// page-level `revalidate`; that'll need addressing when those pages are
// actually built.
export function getMetaAds() {
  return db.query.metaAds.findMany({ orderBy: asc(metaAds.sortOrder) });
}

export function getTopContentsHome() {
  return db.query.topContents.findMany({ orderBy: asc(topContents.sortOrder) });
}

export function getProjects() {
  return db.query.projects.findMany({ orderBy: asc(projects.sortOrder) });
}

export function getPublishedCaseStudies(limit?: number) {
  return db.query.caseStudies.findMany({
    where: eq(caseStudies.status, "published"),
    orderBy: asc(caseStudies.displayOrder),
    limit,
  });
}

export function getAllCaseStudiesAdmin() {
  return db.query.caseStudies.findMany({ orderBy: [asc(caseStudies.displayOrder), desc(caseStudies.createdAt)] });
}

export interface CaseStudyDetail extends CaseStudy {
  adResults: (typeof adResults.$inferSelect)[];
  topContent: (typeof topContent.$inferSelect)[];
  clientProfiles: (typeof clientProfiles.$inferSelect)[];
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyDetail | undefined> {
  const caseStudy = await db.query.caseStudies.findFirst({ where: eq(caseStudies.slug, slug) });
  if (!caseStudy) return undefined;

  const [ads, content, profiles] = await Promise.all([
    db.query.adResults.findMany({
      where: eq(adResults.caseStudyId, caseStudy.id),
      orderBy: asc(adResults.displayOrder),
    }),
    db.query.topContent.findMany({
      where: eq(topContent.caseStudyId, caseStudy.id),
      orderBy: asc(topContent.displayOrder),
    }),
    db.query.clientProfiles.findMany({ where: eq(clientProfiles.caseStudyId, caseStudy.id) }),
  ]);

  return { ...caseStudy, adResults: ads, topContent: content, clientProfiles: profiles };
}
