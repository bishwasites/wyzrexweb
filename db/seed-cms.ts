// Seeds the site-wide CMS tables with the copy that used to live hardcoded in
// components, so switching the public site over to the database is visually a
// no-op.
//
// Idempotent and non-destructive by design:
//   * list tables are only populated when empty, so re-running never clobbers
//     content edited through /admin;
//   * page_sections upserts on (page_slug, section_key) with DO NOTHING;
//   * values already stored in the legacy key/value table (contact info,
//     stats, about copy) win over the hardcoded defaults, so anything edited
//     before the migration survives the cutover.
//
// Run with: pnpm db:seed-cms
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  siteSettings,
  siteSettingsKv,
  navItems,
  socials,
  footerColumns,
  footerLinks,
  pageSections,
  stats,
  clients,
  leads,
  trustedBrands,
  contactSubmissions,
  type NewPageSection,
} from "@/db/schema";
import {
  DEFAULT_ABOUT_COPY,
  DEFAULT_CONTACT_INFO,
  DEFAULT_HOME_STATS,
  NAV_LINKS,
  type ContactInfo,
  type HomeStats,
} from "@/lib/site";

async function readKv<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await db.query.siteSettingsKv.findFirst({ where: eq(siteSettingsKv.key, key) });
    return row ? (row.value as T) : fallback;
  } catch {
    // Legacy table may not exist on a fresh database.
    return fallback;
  }
}

/** Splits a display stat like "150+" or "98%" into its numeric part and suffix. */
function splitStat(raw: string): { value: string; suffix: string } {
  const match = raw.trim().match(/^([\d.,]+)(.*)$/);
  if (!match) return { value: raw, suffix: "" };
  return { value: match[1] ?? raw, suffix: (match[2] ?? "").trim() };
}

async function count(table: string): Promise<number> {
  const res = await db.execute(sql.raw(`SELECT count(*)::int AS n FROM ${table}`));
  const rows = res.rows as { n: number }[];
  return rows[0]?.n ?? 0;
}

async function seed() {
  const contact = await readKv<ContactInfo>("contact_info", DEFAULT_CONTACT_INFO);
  const homeStats = await readKv<HomeStats>("home_stats", DEFAULT_HOME_STATS);
  const aboutCopy = await readKv<string>("about_copy", DEFAULT_ABOUT_COPY);

  // --- site_settings (singleton) -------------------------------------------
  const settingsCount = await count("site_settings");
  if (settingsCount === 0) {
    await db.insert(siteSettings).values({
      id: 1,
      siteTitle: "WYZREX — Digital Marketing & Creative Production, Colombo",
      metaDescription:
        "WYZREX is a Colombo-based digital marketing and creative production agency built on strategy and execution in equal measure.",
      primaryColor: "#ffc629",
      email: contact.email,
      phone: contact.phone,
      address: contact.location,
      logoLightUrl: "/assets/logo/logo.png",
      logoDarkUrl: "/assets/logo/logo-white.png",
    });
    console.log("  site_settings: inserted singleton");
  } else {
    console.log("  site_settings: already present, left alone");
  }

  // --- nav_items -----------------------------------------------------------
  if ((await count("nav_items")) === 0) {
    await db.insert(navItems).values(
      NAV_LINKS.map((link, i) => ({
        label: link.label,
        href: link.href,
        sortOrder: i,
        isExternal: false,
        isVisible: true,
      }))
    );
    console.log(`  nav_items: inserted ${NAV_LINKS.length}`);
  }

  // --- socials -------------------------------------------------------------
  if ((await count("socials")) === 0) {
    await db.insert(socials).values(
      contact.socials.map((s, i) => ({
        platform: s.name,
        url: s.href,
        sortOrder: i,
        isVisible: true,
      }))
    );
    console.log(`  socials: inserted ${contact.socials.length}`);
  }

  // --- footer --------------------------------------------------------------
  if ((await count("footer_columns")) === 0) {
    const [company] = await db.insert(footerColumns).values({ title: "Company", sortOrder: 0 }).returning();
    const [legal] = await db.insert(footerColumns).values({ title: "Legal", sortOrder: 1 }).returning();
    if (company) {
      await db.insert(footerLinks).values([
        { columnId: company.id, label: "About", href: "/about", sortOrder: 0 },
        { columnId: company.id, label: "Services", href: "/services", sortOrder: 1 },
        { columnId: company.id, label: "Work", href: "/work", sortOrder: 2 },
        { columnId: company.id, label: "Contact", href: "/contact", sortOrder: 3 },
      ]);
    }
    if (legal) {
      await db.insert(footerLinks).values([
        { columnId: legal.id, label: "Privacy", href: "#", sortOrder: 0 },
        { columnId: legal.id, label: "Terms", href: "#", sortOrder: 1 },
      ]);
    }
    console.log("  footer_columns/links: inserted");
  }

  // --- stats ---------------------------------------------------------------
  if ((await count("stats")) === 0) {
    const entries: [string, string][] = [
      [homeStats.projectsDelivered, "Projects delivered"],
      [homeStats.clientRetention, "Client retention"],
      [homeStats.yearsOfCraft, "Years of craft"],
      [homeStats.teamNetwork, "Team & partner network"],
    ];
    await db.insert(stats).values(
      entries.map(([raw, label], i) => {
        const { value, suffix } = splitStat(raw);
        return { value, suffix, label, sortOrder: i };
      })
    );
    console.log(`  stats: inserted ${entries.length}`);
  }

  // --- clients (from the superseded trusted_brands) ------------------------
  if ((await count("clients")) === 0) {
    const brands = await db.select().from(trustedBrands);
    if (brands.length > 0) {
      await db.insert(clients).values(
        brands.map((b, i) => ({
          name: b.name,
          logoUrl: b.logoUrl,
          sortOrder: b.displayOrder ?? i,
          isVisible: true,
        }))
      );
      console.log(`  clients: carried ${brands.length} across from trusted_brands`);
    }
  }

  // --- leads (from the superseded contact_submissions) ---------------------
  if ((await count("leads")) === 0) {
    const subs = await db.select().from(contactSubmissions);
    if (subs.length > 0) {
      await db.insert(leads).values(
        subs.map((s) => ({
          name: s.name,
          email: s.email,
          message: s.message,
          sourcePage: "/contact",
          createdAt: s.createdAt,
          isRead: s.read,
        }))
      );
      console.log(`  leads: carried ${subs.length} across from contact_submissions`);
    }
  }

  // --- page_sections -------------------------------------------------------
  // The hero carries two buttons but the schema has a single CTA pair, so the
  // secondary button lives in its own `hero_cta_secondary` row. Per-page SEO
  // reuses heading/subheading as title/description on a `meta` row.
  const sections: NewPageSection[] = [
    // Home
    {
      pageSlug: "home",
      sectionKey: "meta",
      heading: "WYZREX — Digital Marketing & Creative Production, Colombo",
      subheading:
        "WYZREX is a Colombo-based digital marketing and creative production agency built on strategy and execution in equal measure.",
      sortOrder: -1,
    },
    {
      pageSlug: "home",
      sectionKey: "hero",
      eyebrow: "Digital Marketing & Creative Production",
      heading: "Strategy sharp enough to cut through. Execution built to last.",
      subheading: "WYZREX is a Colombo-based agency for brands that want both — the thinking and the shipping.",
      ctaLabel: "See Our Work",
      ctaHref: "/work",
      sortOrder: 0,
    },
    {
      pageSlug: "home",
      sectionKey: "hero_cta_secondary",
      ctaLabel: "Start a Project",
      ctaHref: "/contact",
      sortOrder: 1,
    },
    { pageSlug: "home", sectionKey: "trusted", heading: "Trusted by", sortOrder: 2 },
    {
      pageSlug: "home",
      sectionKey: "services",
      eyebrow: "The Services",
      heading: "What we do",
      ctaLabel: "All Services",
      ctaHref: "/services",
      sortOrder: 3,
    },
    {
      pageSlug: "home",
      sectionKey: "meta_ads",
      eyebrow: "Paid Performance",
      heading: "Ads that actually returned",
      sortOrder: 4,
    },
    {
      pageSlug: "home",
      sectionKey: "top_contents",
      eyebrow: "What Went Viral",
      heading: "Content that performed",
      sortOrder: 5,
    },
    {
      pageSlug: "home",
      sectionKey: "projects",
      eyebrow: "Selected Work",
      heading: "Proof, not promises",
      sortOrder: 6,
    },
    {
      pageSlug: "home",
      sectionKey: "cta",
      heading: "Have a project in mind? Let's build it.",
      ctaLabel: "Start a project",
      ctaHref: "/contact",
      sortOrder: 7,
    },

    // About
    {
      pageSlug: "about",
      sectionKey: "meta",
      heading: "About",
      subheading:
        "WYZREX is built on two instincts: the discipline to execute and the patience to think first. Meet the studio behind the work.",
      sortOrder: -1,
    },
    {
      pageSlug: "about",
      sectionKey: "hero",
      eyebrow: "The Studio",
      heading: "Built on strategy. Proven by execution.",
      sortOrder: 0,
    },
    { pageSlug: "about", sectionKey: "intro", body: aboutCopy, sortOrder: 1 },
    {
      pageSlug: "about",
      sectionKey: "approach",
      eyebrow: "Our Approach",
      heading: "Strategy and execution, in equal measure",
      sortOrder: 2,
    },
    {
      pageSlug: "about",
      sectionKey: "pillar_1",
      eyebrow: "01",
      heading: "Think First",
      body: "No template answers. Every engagement starts with the question a brand actually needs answered.",
      sortOrder: 3,
    },
    {
      pageSlug: "about",
      sectionKey: "pillar_2",
      eyebrow: "02",
      heading: "Ship Fast",
      body: "Momentum matters. We move from strategy to shipped work without losing precision along the way.",
      sortOrder: 4,
    },
    {
      pageSlug: "about",
      sectionKey: "pillar_3",
      eyebrow: "03",
      heading: "Measure Everything",
      body: "Growth is judged by what it earns back — not impressions, not vanity metrics.",
      sortOrder: 5,
    },
    {
      pageSlug: "about",
      sectionKey: "pillar_4",
      eyebrow: "04",
      heading: "Stay Senior",
      body: "We stay small by design, so every project gets senior attention, not a rotating handoff.",
      sortOrder: 6,
    },

    // Services
    {
      pageSlug: "services",
      sectionKey: "meta",
      heading: "Services",
      subheading:
        "Social media management, content and video production, branding, web design and development, and paid advertising and growth — everything WYZREX does best.",
      sortOrder: -1,
    },
    { pageSlug: "services", sectionKey: "hero", eyebrow: "Services", heading: "What we do best.", sortOrder: 0 },

    // Work
    {
      pageSlug: "work",
      sectionKey: "meta",
      heading: "Work",
      subheading:
        "Selected work from WYZREX — branding, web design, social strategy, video production, and paid growth for brands across industries.",
      sortOrder: -1,
    },
    { pageSlug: "work", sectionKey: "hero", eyebrow: "Selected Work", heading: "Proof, not promises.", sortOrder: 0 },

    // Contact
    {
      pageSlug: "contact",
      sectionKey: "meta",
      heading: "Contact",
      subheading:
        "Tell us what you're building. Reach WYZREX by email, phone, or the form below — we're based in Colombo, Sri Lanka.",
      sortOrder: -1,
    },
    { pageSlug: "contact", sectionKey: "hero", eyebrow: "Contact", heading: "Tell us what you're building.", sortOrder: 0 },
  ];

  await db
    .insert(pageSections)
    .values(sections)
    .onConflictDoNothing({ target: [pageSections.pageSlug, pageSections.sectionKey] });
  console.log(`  page_sections: ensured ${sections.length} rows`);
}

seed()
  .then(() => {
    console.log("[seed-cms] done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[seed-cms] failed:", err);
    process.exit(1);
  });
