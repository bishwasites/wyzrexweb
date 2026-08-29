import "server-only";
import { unstable_cache } from "next/cache";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  siteSettings,
  navItems,
  socials,
  footerColumns,
  footerLinks,
  pageSections,
  services,
  stats,
  clients,
  type PageSection,
} from "@/db/schema";
import { CACHE_TAGS } from "@/lib/admin-resources";

// Public read layer for the site-wide CMS. Every getter is wrapped in
// unstable_cache under the same tag the admin write endpoints bust via
// bustTag() (lib/admin-resources.ts) — an edit in /admin is visible on the
// very next request, without a redeploy. The route group this feeds into
// (app/(site)/layout.tsx) also sets `dynamic = "force-dynamic"`, which
// disables the *page*-level cache but not this data-level one: each request
// still re-renders, but the query underneath stays memoized until its tag is
// invalidated, so the caching here isn't wasted effort.
//
// Every getter falls back to a small hardcoded default if its table is empty
// (a database that skipped the seed, or every row deleted from the admin),
// so a section never just goes blank.

export const getSiteSettings = unstable_cache(
  async () => {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    return (
      row ?? {
        id: 1 as const,
        logoLightUrl: "/assets/logo/logo.png",
        logoDarkUrl: "/assets/logo/logo-white.png",
        faviconUrl: null,
        siteTitle: "WYZREX",
        metaDescription: null,
        ogImageUrl: null,
        primaryColor: "#ffc629",
        phone: "+94 77 206 9661",
        email: "wyzrex@gmail.com",
        address: "Colombo, Sri Lanka",
        whatsapp: null,
        googleMapsEmbed: null,
      }
    );
  },
  ["cms-site-settings"],
  { tags: [CACHE_TAGS.settings] }
);

export const getNavItems = unstable_cache(
  async () => {
    const rows = await db.query.navItems.findMany({
      where: eq(navItems.isVisible, true),
      orderBy: asc(navItems.sortOrder),
    });
    if (rows.length > 0) return rows;
    return [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/services", label: "Services" },
      { href: "/work", label: "Work" },
      { href: "/contact", label: "Contact" },
    ].map((l, i) => ({ id: `fallback-${i}`, sortOrder: i, isVisible: true, isExternal: false, ...l }));
  },
  ["cms-nav-items"],
  { tags: [CACHE_TAGS.nav] }
);

const DEFAULT_SOCIALS = [
  { platform: "Instagram", url: "#" },
  { platform: "LinkedIn", url: "#" },
  { platform: "Facebook", url: "#" },
  { platform: "YouTube", url: "#" },
  { platform: "TikTok", url: "#" },
];

export const getSocials = unstable_cache(
  async () => {
    const rows = await db.query.socials.findMany({ where: eq(socials.isVisible, true), orderBy: asc(socials.sortOrder) });
    if (rows.length > 0) return rows;
    return DEFAULT_SOCIALS.map((s, i) => ({ id: `fallback-${i}`, sortOrder: i, isVisible: true, ...s }));
  },
  ["cms-socials"],
  { tags: [CACHE_TAGS.socials] }
);

export const getFooter = unstable_cache(
  async () => {
    const columns = await db.query.footerColumns.findMany({ orderBy: asc(footerColumns.sortOrder) });
    if (columns.length === 0) return [];
    const links = await db.query.footerLinks.findMany({ orderBy: asc(footerLinks.sortOrder) });
    return columns.map((col) => ({ ...col, links: links.filter((l) => l.columnId === col.id) }));
  },
  ["cms-footer"],
  { tags: [CACHE_TAGS.footer] }
);

export const getServices = unstable_cache(
  async () => db.query.services.findMany({ where: eq(services.isVisible, true), orderBy: asc(services.sortOrder) }),
  ["cms-services"],
  { tags: [CACHE_TAGS.services] }
);

const DEFAULT_STATS = [
  { value: "150", suffix: "+", label: "Projects delivered" },
  { value: "98", suffix: "%", label: "Client retention" },
  { value: "6", suffix: "", label: "Years of craft" },
  { value: "20", suffix: "+", label: "Team & partner network" },
];

export const getStats = unstable_cache(
  async () => {
    const rows = await db.query.stats.findMany({ orderBy: asc(stats.sortOrder) });
    if (rows.length > 0) return rows;
    return DEFAULT_STATS.map((s, i) => ({ id: `fallback-${i}`, sortOrder: i, ...s }));
  },
  ["cms-stats"],
  { tags: [CACHE_TAGS.stats] }
);

export const getClients = unstable_cache(
  async () => db.query.clients.findMany({ where: eq(clients.isVisible, true), orderBy: asc(clients.sortOrder) }),
  ["cms-clients"],
  { tags: [CACHE_TAGS.clients] }
);

// unstable_cache serializes whatever it returns (it round-trips through
// Next's cache storage), so a closure like `get` in the object below cannot
// survive a cache hit — only the raw, serializable rows are cached; the
// Map-backed lookup is rebuilt fresh on every call from those (possibly
// cached) rows.
const getPageSectionRows = unstable_cache(
  async (pageSlug: string) =>
    db.query.pageSections.findMany({
      where: and(eq(pageSections.pageSlug, pageSlug), eq(pageSections.isVisible, true)),
      orderBy: asc(pageSections.sortOrder),
    }),
  ["cms-page-sections"],
  { tags: [CACHE_TAGS.sections] }
);

/** All visible sections for one page, keyed by section_key for easy lookup. */
export async function getPageSections(pageSlug: string) {
  const rows = await getPageSectionRows(pageSlug);
  const bySectionKey = new Map(rows.map((r) => [r.sectionKey, r]));
  return { rows, get: (key: string): PageSection | undefined => bySectionKey.get(key) };
}
