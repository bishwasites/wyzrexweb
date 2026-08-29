"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Logo from "@/components/site/Logo";
import LogoutButton from "@/components/admin/LogoutButton";

const GROUPS = [
  {
    label: "",
    links: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    label: "Site",
    links: [
      { href: "/admin/site-settings", label: "Site Settings", exact: false },
      { href: "/admin/navigation", label: "Navigation", exact: false },
      { href: "/admin/pages", label: "Pages", exact: false },
      { href: "/admin/footer", label: "Footer", exact: false },
      { href: "/admin/socials", label: "Socials", exact: false },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/services", label: "Services", exact: false },
      { href: "/admin/stats", label: "Stats", exact: false },
      { href: "/admin/clients", label: "Clients", exact: false },
      { href: "/admin/testimonials", label: "Testimonials", exact: false },
      { href: "/admin/team", label: "Team", exact: false },
      { href: "/admin/case-studies", label: "Case Studies", exact: false },
    ],
  },
  {
    label: "Proof",
    links: [
      { href: "/admin/meta-ads", label: "Meta Ads", exact: false },
      { href: "/admin/top-contents", label: "Top Contents", exact: false },
      { href: "/admin/projects", label: "Projects", exact: false },
    ],
  },
  {
    label: "",
    links: [
      { href: "/admin/leads", label: "Leads", exact: false },
      { href: "/admin/messages", label: "Messages", exact: false },
    ],
  },
] as const;

export default function Sidebar({ unreadLeads = 0 }: { unreadLeads?: number }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col overflow-y-auto border-r border-line bg-surface p-5">
      <Link href="/admin" className="mb-8 inline-flex items-center">
        <Logo />
      </Link>
      <nav className="flex flex-1 flex-col gap-5">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-1">
            {group.label && (
              <p className="mb-1 px-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted">
                {group.label}
              </p>
            )}
            {group.links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center justify-between rounded-control px-3.5 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-gold/15 text-gold-dark" : "text-muted hover:bg-surface-2 hover:text-fg"
                  )}
                >
                  {link.label}
                  {link.href === "/admin/leads" && unreadLeads > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-gold px-1.5 text-[0.6875rem] font-semibold text-[#0a0a0a]">
                      {unreadLeads}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <LogoutButton />
    </aside>
  );
}
