import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const caseStudyStatus = pgEnum("case_study_status", ["draft", "published"]);
export const heroMediaType = pgEnum("hero_media_type", ["image", "video"]);
export const adPlatform = pgEnum("ad_platform", ["meta", "tiktok", "other"]);
export const contentPlatform = pgEnum("content_platform", ["instagram", "tiktok", "facebook", "youtube"]);
export const contentType = pgEnum("content_type", ["video", "reel", "post"]);
export const profilePlatform = pgEnum("profile_platform", ["instagram", "tiktok", "facebook"]);

export const caseStudies = pgTable("case_studies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  year: varchar("year", { length: 4 }).notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default([]),
  clientLogoUrl: text("client_logo_url"),
  heroMediaUrl: text("hero_media_url"),
  heroMediaType: heroMediaType("hero_media_type").notNull().default("image"),
  isPlaceholder: boolean("is_placeholder").notNull().default(false),
  status: caseStudyStatus("status").notNull().default("draft"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adResults = pgTable("ad_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseStudyId: uuid("case_study_id")
    .notNull()
    .references(() => caseStudies.id, { onDelete: "cascade" }),
  platform: adPlatform("platform").notNull().default("meta"),
  screenshotUrl: text("screenshot_url"),
  headlineMetric: varchar("headline_metric", { length: 60 }).notNull(),
  metricLabel: varchar("metric_label", { length: 120 }).notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const topContent = pgTable("top_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseStudyId: uuid("case_study_id")
    .notNull()
    .references(() => caseStudies.id, { onDelete: "cascade" }),
  platform: contentPlatform("platform").notNull().default("instagram"),
  contentType: contentType("content_type").notNull().default("post"),
  mediaUrl: text("media_url"),
  embedUrl: text("embed_url"),
  thumbnailUrl: text("thumbnail_url"),
  statLabel: varchar("stat_label", { length: 120 }).notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseStudyId: uuid("case_study_id")
    .notNull()
    .references(() => caseStudies.id, { onDelete: "cascade" }),
  platform: profilePlatform("platform").notNull().default("instagram"),
  handle: varchar("handle", { length: 120 }).notNull(),
  profileUrl: text("profile_url").notNull(),
  followerCount: integer("follower_count"),
});

export const trustedBrands = pgTable("trusted_brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  displayOrder: integer("display_order").notNull().default(0),
});

// `slug` is nullable and `sort_order`/`is_visible` were added by the CMS
// migration, which also backfills sort_order from the old display_order.
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  description: text("description").notNull(),
  iconName: varchar("icon_name", { length: 60 }).notNull().default("sparkles"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

// Legacy key/value settings store. Superseded by the columnar `siteSettings`
// singleton in the CMS block below; the migration renames the physical table
// to `site_settings_kv` so the seed can still read the contact info, stats and
// about copy that were stored here before the switch. Nothing reads it at
// runtime any more — kept so the cutover stays reversible.
export const siteSettingsKv = pgTable("site_settings_kv", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export const metaAds = pgTable("meta_ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  campaignName: varchar("campaign_name", { length: 200 }).notNull(),
  resultHeadline: varchar("result_headline", { length: 120 }).notNull(),
  resultSub: varchar("result_sub", { length: 200 }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const topContents = pgTable("top_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  platform: contentPlatform("platform").notNull().default("instagram"),
  caption: text("caption"),
  videoUrl: text("video_url"),
  thumbUrl: text("thumb_url"),
  embedUrl: text("embed_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  brief: text("brief"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  websiteUrl: text("website_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
});

// ---------------------------------------------------------------------------
// Site-wide CMS. Everything the public site renders is driven from these
// tables; scripts/migrate.ts holds the DDL and db/seed-cms.ts loads the copy
// that used to be hardcoded in components, so the switch is visually a no-op.
// ---------------------------------------------------------------------------

// Singleton — always exactly one row, id = 1.
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  logoLightUrl: text("logo_light_url"),
  logoDarkUrl: text("logo_dark_url"),
  faviconUrl: text("favicon_url"),
  siteTitle: varchar("site_title", { length: 200 }),
  metaDescription: text("meta_description"),
  ogImageUrl: text("og_image_url"),
  primaryColor: varchar("primary_color", { length: 20 }),
  phone: varchar("phone", { length: 60 }),
  email: varchar("email", { length: 200 }),
  address: text("address"),
  whatsapp: varchar("whatsapp", { length: 60 }),
  googleMapsEmbed: text("google_maps_embed"),
});

export const navItems = pgTable("nav_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 120 }).notNull(),
  href: varchar("href", { length: 300 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isExternal: boolean("is_external").notNull().default(false),
  isVisible: boolean("is_visible").notNull().default(true),
});

// `platform` is a plain varchar rather than an enum so a new network can be
// added from the admin UI without a migration; the icon map falls back to a
// generic glyph for anything it doesn't recognise.
export const socials = pgTable("socials", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: varchar("platform", { length: 60 }).notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

export const footerColumns = pgTable("footer_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 120 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const footerLinks = pgTable("footer_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  columnId: uuid("column_id")
    .notNull()
    .references(() => footerColumns.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 120 }).notNull(),
  href: varchar("href", { length: 300 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// One row per editable block on a page, addressed by (page_slug, section_key).
export const pageSections = pgTable("page_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageSlug: varchar("page_slug", { length: 60 }).notNull(),
  sectionKey: varchar("section_key", { length: 80 }).notNull(),
  eyebrow: varchar("eyebrow", { length: 160 }),
  heading: text("heading"),
  subheading: text("subheading"),
  body: text("body"),
  ctaLabel: varchar("cta_label", { length: 120 }),
  ctaHref: varchar("cta_href", { length: 300 }),
  imageUrl: text("image_url"),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const stats = pgTable("stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: varchar("value", { length: 40 }).notNull(),
  suffix: varchar("suffix", { length: 20 }),
  label: varchar("label", { length: 160 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// The "Trusted by" marquee. Supersedes `trusted_brands`, which the seed
// copies across.
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  logoUrl: text("logo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 160 }),
  company: varchar("company", { length: 160 }),
  quote: text("quote").notNull(),
  avatarUrl: text("avatar_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

export const team = pgTable("team", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 160 }),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

// Supersedes `contact_submissions`; the seed copies existing rows across.
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  service: varchar("service", { length: 160 }),
  message: text("message"),
  sourcePage: varchar("source_page", { length: 120 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const footerColumnsRelations = relations(footerColumns, ({ many }) => ({
  links: many(footerLinks),
}));

export const footerLinksRelations = relations(footerLinks, ({ one }) => ({
  column: one(footerColumns, { fields: [footerLinks.columnId], references: [footerColumns.id] }),
}));

export const caseStudiesRelations = relations(caseStudies, ({ many }) => ({
  adResults: many(adResults),
  topContent: many(topContent),
  clientProfiles: many(clientProfiles),
}));

export const adResultsRelations = relations(adResults, ({ one }) => ({
  caseStudy: one(caseStudies, { fields: [adResults.caseStudyId], references: [caseStudies.id] }),
}));

export const topContentRelations = relations(topContent, ({ one }) => ({
  caseStudy: one(caseStudies, { fields: [topContent.caseStudyId], references: [caseStudies.id] }),
}));

export const clientProfilesRelations = relations(clientProfiles, ({ one }) => ({
  caseStudy: one(caseStudies, { fields: [clientProfiles.caseStudyId], references: [caseStudies.id] }),
}));

export type CaseStudy = typeof caseStudies.$inferSelect;
export type NewCaseStudy = typeof caseStudies.$inferInsert;
export type AdResult = typeof adResults.$inferSelect;
export type NewAdResult = typeof adResults.$inferInsert;
export type TopContent = typeof topContent.$inferSelect;
export type NewTopContent = typeof topContent.$inferInsert;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;
export type TrustedBrand = typeof trustedBrands.$inferSelect;
export type NewTrustedBrand = typeof trustedBrands.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type MetaAd = typeof metaAds.$inferSelect;
export type NewMetaAd = typeof metaAds.$inferInsert;
export type TopContentItem = typeof topContents.$inferSelect;
export type NewTopContentItem = typeof topContents.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
export type NavItem = typeof navItems.$inferSelect;
export type NewNavItem = typeof navItems.$inferInsert;
export type Social = typeof socials.$inferSelect;
export type NewSocial = typeof socials.$inferInsert;
export type FooterColumn = typeof footerColumns.$inferSelect;
export type NewFooterColumn = typeof footerColumns.$inferInsert;
export type FooterLink = typeof footerLinks.$inferSelect;
export type NewFooterLink = typeof footerLinks.$inferInsert;
export type PageSection = typeof pageSections.$inferSelect;
export type NewPageSection = typeof pageSections.$inferInsert;
export type Stat = typeof stats.$inferSelect;
export type NewStat = typeof stats.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type TeamMember = typeof team.$inferSelect;
export type NewTeamMember = typeof team.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
