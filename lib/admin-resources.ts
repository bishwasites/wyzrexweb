import "server-only";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { asc, desc } from "drizzle-orm";
import {
  metaAds,
  topContents,
  projects,
  navItems,
  socials,
  footerColumns,
  footerLinks,
  pageSections,
  services,
  stats,
  clients,
  testimonials,
  team,
  leads,
} from "@/db/schema";

// Cache tags used by the public read layer (lib/cms.ts) and busted by the
// admin write endpoints, so an edit in /admin goes live on the next request
// without a redeploy.
export const CACHE_TAGS = {
  settings: "cms:settings",
  nav: "cms:nav",
  socials: "cms:socials",
  footer: "cms:footer",
  sections: "cms:sections",
  services: "cms:services",
  stats: "cms:stats",
  clients: "cms:clients",
  testimonials: "cms:testimonials",
  team: "cms:team",
  metaAds: "cms:meta-ads",
  topContents: "cms:top-contents",
  projects: "cms:projects",
  leads: "cms:leads",
} as const;

/**
 * Marks a cache tag stale right now.
 *
 * Next 16's `revalidateTag` takes a cacheLife profile as a second argument,
 * and its "expire immediately" counterpart (`updateTag`) is callable only from
 * Server Actions — not from route handlers. `{ expire: 0 }` is how a write
 * endpoint asks for the tag to be treated as stale on the very next read.
 */
export function bustTag(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

/** Trimmed text that treats "" as absent, so clearing a field stores NULL. */
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

/**
 * Checkboxes and JSON payloads disagree about booleans — a form sends the
 * string "false", and `z.coerce.boolean("false")` is `true`. Normalise both
 * shapes explicitly rather than coercing.
 */
const boolish = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true");

const sortOrder = z.coerce.number().int().optional();

// --- per-resource field schemas ---------------------------------------------

const metaAdFields = z.object({
  clientName: z.string().trim().min(1).max(200),
  campaignName: z.string().trim().min(1).max(200),
  resultHeadline: z.string().trim().min(1).max(120),
  resultSub: optionalText,
  imageUrl: z.string().trim().min(1),
  sortOrder,
});

const topContentFields = z.object({
  clientName: z.string().trim().min(1).max(200),
  platform: z.enum(["instagram", "tiktok", "facebook", "youtube"]).default("instagram"),
  caption: optionalText,
  videoUrl: optionalText,
  thumbUrl: optionalText,
  embedUrl: optionalText,
  sortOrder,
});

const projectFields = z.object({
  clientName: z.string().trim().min(1).max(200),
  brief: optionalText,
  logoUrl: optionalText,
  coverUrl: optionalText,
  instagramUrl: optionalText,
  facebookUrl: optionalText,
  tiktokUrl: optionalText,
  youtubeUrl: optionalText,
  websiteUrl: optionalText,
  sortOrder,
});

const navItemFields = z.object({
  label: z.string().trim().min(1).max(120),
  href: z.string().trim().min(1).max(300),
  isExternal: boolish.optional(),
  isVisible: boolish.optional(),
  sortOrder,
});

const socialFields = z.object({
  platform: z.string().trim().min(1).max(60),
  url: z.string().trim().min(1),
  isVisible: boolish.optional(),
  sortOrder,
});

const footerColumnFields = z.object({
  title: z.string().trim().min(1).max(120),
  sortOrder,
});

const footerLinkFields = z.object({
  columnId: z.string().uuid(),
  label: z.string().trim().min(1).max(120),
  href: z.string().trim().min(1).max(300),
  sortOrder,
});

const pageSectionFields = z.object({
  pageSlug: z.string().trim().min(1).max(60),
  sectionKey: z.string().trim().min(1).max(80),
  eyebrow: optionalText,
  heading: optionalText,
  subheading: optionalText,
  body: optionalText,
  ctaLabel: optionalText,
  ctaHref: optionalText,
  imageUrl: optionalText,
  isVisible: boolish.optional(),
  sortOrder,
});

const serviceFields = z.object({
  title: z.string().trim().min(1).max(200),
  slug: optionalText,
  description: z.string().trim().min(1),
  iconName: z.string().trim().min(1).max(60),
  isVisible: boolish.optional(),
  sortOrder,
});

const statFields = z.object({
  value: z.string().trim().min(1).max(40),
  suffix: optionalText,
  label: z.string().trim().min(1).max(160),
  sortOrder,
});

const clientFields = z.object({
  name: z.string().trim().min(1).max(200),
  logoUrl: optionalText,
  isVisible: boolish.optional(),
  sortOrder,
});

const testimonialFields = z.object({
  name: z.string().trim().min(1).max(160),
  role: optionalText,
  company: optionalText,
  quote: z.string().trim().min(1),
  avatarUrl: optionalText,
  isVisible: boolish.optional(),
  sortOrder,
});

const teamFields = z.object({
  name: z.string().trim().min(1).max(160),
  role: optionalText,
  bio: optionalText,
  photoUrl: optionalText,
  isVisible: boolish.optional(),
  sortOrder,
});

// Leads are created by the public contact form, so the admin side only ever
// flips `isRead` — there's no create form for them.
const leadFields = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  phone: optionalText,
  service: optionalText,
  message: optionalText,
  sourcePage: optionalText,
  isRead: boolish.optional(),
});

export const ADMIN_RESOURCES = {
  "meta-ads": {
    table: metaAds,
    insertSchema: metaAdFields,
    updateSchema: metaAdFields.partial(),
    orderBy: asc(metaAds.sortOrder),
    tag: CACHE_TAGS.metaAds,
  },
  "top-contents": {
    table: topContents,
    insertSchema: topContentFields,
    updateSchema: topContentFields.partial(),
    orderBy: asc(topContents.sortOrder),
    tag: CACHE_TAGS.topContents,
  },
  projects: {
    table: projects,
    insertSchema: projectFields,
    updateSchema: projectFields.partial(),
    orderBy: asc(projects.sortOrder),
    tag: CACHE_TAGS.projects,
  },
  "nav-items": {
    table: navItems,
    insertSchema: navItemFields,
    updateSchema: navItemFields.partial(),
    orderBy: asc(navItems.sortOrder),
    tag: CACHE_TAGS.nav,
  },
  socials: {
    table: socials,
    insertSchema: socialFields,
    updateSchema: socialFields.partial(),
    orderBy: asc(socials.sortOrder),
    tag: CACHE_TAGS.socials,
  },
  "footer-columns": {
    table: footerColumns,
    insertSchema: footerColumnFields,
    updateSchema: footerColumnFields.partial(),
    orderBy: asc(footerColumns.sortOrder),
    tag: CACHE_TAGS.footer,
  },
  "footer-links": {
    table: footerLinks,
    insertSchema: footerLinkFields,
    updateSchema: footerLinkFields.partial(),
    orderBy: asc(footerLinks.sortOrder),
    tag: CACHE_TAGS.footer,
  },
  "page-sections": {
    table: pageSections,
    insertSchema: pageSectionFields,
    updateSchema: pageSectionFields.partial(),
    orderBy: asc(pageSections.sortOrder),
    tag: CACHE_TAGS.sections,
  },
  services: {
    table: services,
    insertSchema: serviceFields,
    updateSchema: serviceFields.partial(),
    orderBy: asc(services.sortOrder),
    tag: CACHE_TAGS.services,
  },
  stats: {
    table: stats,
    insertSchema: statFields,
    updateSchema: statFields.partial(),
    orderBy: asc(stats.sortOrder),
    tag: CACHE_TAGS.stats,
  },
  clients: {
    table: clients,
    insertSchema: clientFields,
    updateSchema: clientFields.partial(),
    orderBy: asc(clients.sortOrder),
    tag: CACHE_TAGS.clients,
  },
  testimonials: {
    table: testimonials,
    insertSchema: testimonialFields,
    updateSchema: testimonialFields.partial(),
    orderBy: asc(testimonials.sortOrder),
    tag: CACHE_TAGS.testimonials,
  },
  team: {
    table: team,
    insertSchema: teamFields,
    updateSchema: teamFields.partial(),
    orderBy: asc(team.sortOrder),
    tag: CACHE_TAGS.team,
  },
  leads: {
    table: leads,
    insertSchema: leadFields,
    updateSchema: leadFields.partial(),
    orderBy: desc(leads.createdAt),
    tag: CACHE_TAGS.leads,
  },
} as const;

export type AdminResourceKey = keyof typeof ADMIN_RESOURCES;

export function isAdminResourceKey(value: string): value is AdminResourceKey {
  return value in ADMIN_RESOURCES;
}
