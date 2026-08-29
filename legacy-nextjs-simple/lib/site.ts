export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
] as const;

// href="#" placeholders — swap in the real profile URLs when available.
export const SOCIAL_LINKS = [
  { name: "Instagram", href: "#" },
  { name: "LinkedIn", href: "#" },
  { name: "Facebook", href: "#" },
  { name: "YouTube", href: "#" },
  { name: "TikTok", href: "#" },
] as const;

export const CONTACT = {
  email: "wyzrex@gmail.com",
  phone: "+94 77 206 9661",
  phoneHref: "+94772069661",
  locale: "Colombo, Sri Lanka",
};
