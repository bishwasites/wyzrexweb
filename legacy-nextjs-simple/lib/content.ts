export interface Service {
  index: string;
  title: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    index: "01",
    title: "Social Media Management",
    description:
      "Consistent, on-brand content and community management across every platform that matters to your audience.",
  },
  {
    index: "02",
    title: "Content & Video Production",
    description:
      "Scroll-stopping video, motion, and photography built for how people actually watch today.",
  },
  {
    index: "03",
    title: "Graphic Design & Branding",
    description:
      "Identity systems, visual language, and design assets that make a brand instantly recognizable.",
  },
  {
    index: "04",
    title: "Web Design & Development",
    description: "Fast, considered websites that turn visitors into leads — no template feel.",
  },
  {
    index: "05",
    title: "Paid Advertising & Growth",
    description: "Performance campaigns built around measurable growth, not vanity metrics.",
  },
];

export interface WorkItem {
  client: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
}

// DUMMY DATA — replace with real case studies
export const WORK_ITEMS: WorkItem[] = [
  {
    client: "Aurum & Co.",
    category: "Branding",
    year: "2025",
    description: "A refined identity system built for a boutique jewelry house entering new markets.",
    tags: ["Branding", "Strategy", "Design"],
  },
  {
    client: "Northline Logistics",
    category: "Web Design",
    year: "2025",
    description: "A logistics platform redesigned for clarity — real-time tracking made simple.",
    tags: ["Web Design", "UX", "Development"],
  },
  {
    client: "Solstice Apparel",
    category: "Social Media",
    year: "2024",
    description: "A full social overhaul that turned a quiet feed into a daily habit for its audience.",
    tags: ["Social Strategy", "Content", "Community"],
  },
  {
    client: "Meridian Health",
    category: "Content Strategy",
    year: "2024",
    description: "Educational video content that built trust for a growing healthcare brand.",
    tags: ["Video Production", "Strategy"],
  },
  {
    client: "Terra Coffee Co.",
    category: "Paid Growth",
    year: "2025",
    description: "Performance campaigns that turned a local café into a delivery-first brand.",
    tags: ["Paid Ads", "Growth", "Analytics"],
  },
  {
    client: "Cobalt Studio",
    category: "Brand Identity",
    year: "2023",
    description: "A bold, minimal identity system designed to scale across every surface.",
    tags: ["Brand Identity", "Art Direction"],
  },
  {
    client: "Vantage Finance",
    category: "Product Design",
    year: "2024",
    description: "A fintech dashboard rebuilt around clarity and everyday usability.",
    tags: ["Product Design", "UX", "Development"],
  },
  {
    client: "Everly Skincare",
    category: "Video Production",
    year: "2025",
    description: "Launch films and short-form content for a skincare brand's global debut.",
    tags: ["Video", "Content", "Direction"],
  },
];
