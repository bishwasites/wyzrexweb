export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
] as const;

export interface SocialLink {
  name: "Instagram" | "LinkedIn" | "Facebook" | "YouTube" | "TikTok";
  href: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  socials: SocialLink[];
}

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "wyzrex@gmail.com",
  phone: "+94 77 206 9661",
  location: "Colombo, Sri Lanka",
  socials: [
    { name: "Instagram", href: "#" },
    { name: "LinkedIn", href: "#" },
    { name: "Facebook", href: "#" },
    { name: "YouTube", href: "#" },
    { name: "TikTok", href: "#" },
  ],
};

export interface HomeStats {
  projectsDelivered: string;
  clientRetention: string;
  yearsOfCraft: string;
  teamNetwork: string;
}

export const DEFAULT_HOME_STATS: HomeStats = {
  projectsDelivered: "150+",
  clientRetention: "98%",
  yearsOfCraft: "6",
  teamNetwork: "20+",
};

export const DEFAULT_ABOUT_COPY = `WYZREX is a digital marketing and creative production agency based in Colombo, Sri Lanka, built on two instincts: the discipline to execute and the patience to think first.

We work the way a warrior and a philosopher would, side by side — one's precision in what we ship, the other's care in the thinking behind it. Every project starts with a real question, not a template: what does this brand actually need to say, and who needs to hear it?

From there, we build. Social content that feels considered instead of automated. Video that holds attention past the first three seconds. Identity systems and websites that don't need an explanation to make sense. Paid growth measured by what it earns back, not just what it spends.

We stay small by design — every project gets senior attention, not a rotating handoff. Clients come to us because they want a partner who moves fast without ever mistaking speed for carelessness.`;
