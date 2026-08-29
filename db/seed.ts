// Env vars are loaded via `tsx --env-file=.env.local` (see package.json) so
// they're populated before any module — including lib/db.ts — evaluates.
import { db } from "@/lib/db";
import {
  caseStudies,
  adResults,
  topContent,
  clientProfiles,
  trustedBrands,
  services,
  siteSettingsKv,
  type NewCaseStudy,
} from "@/db/schema";
import { DEFAULT_ABOUT_COPY, DEFAULT_CONTACT_INFO, DEFAULT_HOME_STATS } from "@/lib/site";

function placehold(size: string, label: string, bg = "0a0a0a", fg = "d4af37") {
  return `https://placehold.co/${size}/${bg}/${fg}?text=${encodeURIComponent(label)}`;
}

const CASE_STUDIES: (Omit<NewCaseStudy, "id"> & { slug: string })[] = [
  {
    slug: "aurum-and-co",
    clientName: "Aurum & Co.",
    category: "Branding",
    year: "2025",
    description:
      "A refined identity system built for a boutique jewelry house entering new markets.",
    tags: ["Branding", "Strategy", "Design"],
    clientLogoUrl: placehold("240x80", "Aurum & Co."),
    heroMediaUrl: placehold("1600x900", "Aurum & Co."),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 0,
  },
  {
    slug: "northline-logistics",
    clientName: "Northline Logistics",
    category: "Web Design",
    year: "2025",
    description: "A logistics platform redesigned for clarity — real-time tracking made simple.",
    tags: ["Web Design", "UX", "Development"],
    clientLogoUrl: placehold("240x80", "Northline"),
    heroMediaUrl: placehold("1600x900", "Northline Logistics"),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 1,
  },
  {
    slug: "solstice-apparel",
    clientName: "Solstice Apparel",
    category: "Social Media",
    year: "2024",
    description:
      "A full social overhaul that turned a quiet feed into a daily habit for its audience.",
    tags: ["Social Strategy", "Content", "Community"],
    clientLogoUrl: placehold("240x80", "Solstice"),
    heroMediaUrl: placehold("1600x900", "Solstice Apparel"),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 2,
  },
  {
    slug: "meridian-health",
    clientName: "Meridian Health",
    category: "Content Strategy",
    year: "2024",
    description: "Educational video content that built trust for a growing healthcare brand.",
    tags: ["Video Production", "Strategy"],
    clientLogoUrl: placehold("240x80", "Meridian"),
    heroMediaUrl: placehold("1600x900", "Meridian Health"),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 3,
  },
  {
    slug: "terra-coffee-co",
    clientName: "Terra Coffee Co.",
    category: "Paid Growth",
    year: "2025",
    description: "Performance campaigns that turned a local café into a delivery-first brand.",
    tags: ["Paid Ads", "Growth", "Analytics"],
    clientLogoUrl: placehold("240x80", "Terra Coffee"),
    heroMediaUrl: placehold("1600x900", "Terra Coffee Co."),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 4,
  },
  {
    slug: "cobalt-studio",
    clientName: "Cobalt Studio",
    category: "Brand Identity",
    year: "2023",
    description: "A bold, minimal identity system designed to scale across every surface.",
    tags: ["Brand Identity", "Art Direction"],
    clientLogoUrl: placehold("240x80", "Cobalt"),
    heroMediaUrl: placehold("1600x900", "Cobalt Studio"),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 5,
  },
  {
    slug: "vantage-finance",
    clientName: "Vantage Finance",
    category: "Product Design",
    year: "2024",
    description: "A fintech dashboard rebuilt around clarity and everyday usability.",
    tags: ["Product Design", "UX", "Development"],
    clientLogoUrl: placehold("240x80", "Vantage"),
    heroMediaUrl: placehold("1600x900", "Vantage Finance"),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 6,
  },
  {
    slug: "everly-skincare",
    clientName: "Everly Skincare",
    category: "Video Production",
    year: "2025",
    description: "Launch films and short-form content for a skincare brand's global debut.",
    tags: ["Video", "Content", "Direction"],
    clientLogoUrl: placehold("240x80", "Everly"),
    heroMediaUrl: placehold("1600x900", "Everly Skincare"),
    heroMediaType: "image",
    isPlaceholder: true,
    status: "published",
    displayOrder: 7,
  },
];

const SERVICES = [
  {
    title: "Social Media Management",
    slug: "social-media-management",
    description:
      "Consistent, on-brand content and community management across every platform that matters to your audience.",
    iconName: "share2",
    displayOrder: 0,
  },
  {
    title: "Content & Video Production",
    slug: "content-video-production",
    description: "Scroll-stopping video, motion, and photography built for how people actually watch today.",
    iconName: "video",
    displayOrder: 1,
  },
  {
    title: "Graphic Design & Branding",
    slug: "graphic-design-branding",
    description: "Identity systems, visual language, and design assets that make a brand instantly recognizable.",
    iconName: "palette",
    displayOrder: 2,
  },
  {
    title: "Web Design & Development",
    slug: "web-design-development",
    description: "Fast, considered websites that turn visitors into leads — no template feel.",
    iconName: "code",
    displayOrder: 3,
  },
  {
    title: "Paid Advertising & Growth",
    slug: "paid-advertising-growth",
    description: "Performance campaigns built around measurable growth, not vanity metrics.",
    iconName: "trending-up",
    displayOrder: 4,
  },
];

async function main() {
  console.log("Seeding WYZREX demo data...");

  console.log("  case studies");
  const insertedCaseStudies = await db.insert(caseStudies).values(CASE_STUDIES).returning();
  const bySlug = Object.fromEntries(insertedCaseStudies.map((c) => [c.slug, c]));

  console.log("  ad results / top content / client profiles");
  const solstice = bySlug["solstice-apparel"];
  const terra = bySlug["terra-coffee-co"];

  if (solstice) {
    await db.insert(adResults).values([
      {
        caseStudyId: solstice.id,
        platform: "meta",
        screenshotUrl: placehold("800x500", "Meta Ads Report"),
        headlineMetric: "3.6x ROAS",
        metricLabel: "Return on Ad Spend",
        caption: "30-day Meta Ads campaign for the summer capsule launch.",
        displayOrder: 0,
      },
      {
        caseStudyId: solstice.id,
        platform: "meta",
        screenshotUrl: placehold("800x500", "Reach Report"),
        headlineMetric: "212K",
        metricLabel: "Total Reach",
        displayOrder: 1,
      },
    ]);

    await db.insert(topContent).values([
      {
        caseStudyId: solstice.id,
        platform: "instagram",
        contentType: "reel",
        thumbnailUrl: placehold("400x500", "IG Reel"),
        statLabel: "1.4M views",
        caption: "Summer capsule launch reel",
        displayOrder: 0,
      },
      {
        caseStudyId: solstice.id,
        platform: "tiktok",
        contentType: "video",
        thumbnailUrl: placehold("400x500", "TikTok Video"),
        statLabel: "890K views",
        caption: "Behind-the-scenes styling video",
        displayOrder: 1,
      },
      {
        caseStudyId: solstice.id,
        platform: "facebook",
        contentType: "post",
        thumbnailUrl: placehold("400x500", "FB Post"),
        statLabel: "12K shares",
        caption: "Customer UGC repost",
        displayOrder: 2,
      },
    ]);

    await db.insert(clientProfiles).values([
      {
        caseStudyId: solstice.id,
        platform: "instagram",
        handle: "@solstice.apparel",
        profileUrl: "#",
        followerCount: 84000,
      },
      {
        caseStudyId: solstice.id,
        platform: "tiktok",
        handle: "@solsticeapparel",
        profileUrl: "#",
        followerCount: 51000,
      },
    ]);
  }

  if (terra) {
    await db.insert(adResults).values([
      {
        caseStudyId: terra.id,
        platform: "meta",
        screenshotUrl: placehold("800x500", "Meta Ads Report"),
        headlineMetric: "4.1x ROAS",
        metricLabel: "Return on Ad Spend",
        displayOrder: 0,
      },
      {
        caseStudyId: terra.id,
        platform: "meta",
        screenshotUrl: placehold("800x500", "Delivery Orders"),
        headlineMetric: "38%",
        metricLabel: "Increase in Delivery Orders",
        displayOrder: 1,
      },
    ]);

    await db.insert(topContent).values([
      {
        caseStudyId: terra.id,
        platform: "instagram",
        contentType: "reel",
        thumbnailUrl: placehold("400x500", "IG Reel"),
        statLabel: "670K views",
        caption: "New seasonal drink launch reel",
        displayOrder: 0,
      },
      {
        caseStudyId: terra.id,
        platform: "tiktok",
        contentType: "video",
        thumbnailUrl: placehold("400x500", "TikTok Video"),
        statLabel: "1.1M views",
        caption: "Café ambience TikTok trend piece",
        displayOrder: 1,
      },
    ]);

    await db.insert(clientProfiles).values([
      {
        caseStudyId: terra.id,
        platform: "instagram",
        handle: "@terracoffeeco",
        profileUrl: "#",
        followerCount: 29000,
      },
    ]);
  }

  console.log("  trusted brands");
  await db.insert(trustedBrands).values(
    insertedCaseStudies.map((c, i) => ({
      name: c.clientName,
      logoUrl: c.clientLogoUrl ?? placehold("240x80", c.clientName),
      websiteUrl: null,
      displayOrder: i,
    }))
  );

  console.log("  services");
  await db.insert(services).values(SERVICES);

  console.log("  site settings");
  await db
    .insert(siteSettingsKv)
    .values([
      { key: "about_copy", value: DEFAULT_ABOUT_COPY },
      { key: "home_stats", value: DEFAULT_HOME_STATS },
      { key: "contact_info", value: DEFAULT_CONTACT_INFO },
    ])
    .onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
