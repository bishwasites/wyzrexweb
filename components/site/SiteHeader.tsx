"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Logo from "@/components/site/Logo";
import { CloseIcon, MoonIcon, SunIcon } from "@/components/site/Icons";
import { getSocialIcon } from "@/components/site/socialIcons";
import type { NavItem, Social } from "@/db/schema";

const THEME_KEY = "wyzrex-theme";

interface SiteHeaderProps {
  navItems: Pick<NavItem, "href" | "label" | "isExternal">[];
  socials: Pick<Social, "platform" | "url">[];
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
}

export default function SiteHeader({ navItems, socials, logoLightUrl, logoDarkUrl }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={theme === "dark"}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-gold"
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[500] flex items-center justify-between border-b border-line bg-bg/70 px-5 py-4 backdrop-blur-xl md:px-8">
        <Link href="/" className="inline-flex items-center">
          <Logo lightSrc={logoLightUrl} darkSrc={logoDarkUrl} />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {navItems.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener" : undefined}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative py-1 text-[0.9375rem] font-medium transition-colors",
                  active ? "text-fg after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-pill after:bg-gold" : "text-muted hover:text-fg"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {themeToggle}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="nav-overlay"
            className="inline-flex items-center gap-2 rounded-pill border border-line px-4.5 py-2.5 text-sm font-medium hover:border-gold"
          >
            Menu
          </button>
        </div>
      </header>

      <div
        id="nav-overlay"
        className={clsx(
          "fixed inset-0 z-[600] flex flex-col bg-bg px-5 pb-10 pt-4 transition-all duration-300 md:px-8",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" onClick={() => setMenuOpen(false)}>
            <Logo lightSrc={logoLightUrl} darkSrc={logoDarkUrl} />
          </Link>
          <div className="flex items-center gap-3">
            {themeToggle}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-gold"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-5" aria-label="Mobile primary">
          {navItems.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${i * 50}ms` : "0ms" }}
                className={clsx(
                  "text-[clamp(2.5rem,10vw,4rem)] font-semibold uppercase tracking-tight transition-all duration-400",
                  active ? "text-gold" : "text-fg",
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex gap-5 border-t border-line pt-6">
          {socials.map((social) => {
            const Icon = getSocialIcon(social.platform);
            return (
              <a key={social.platform} href={social.url} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
                <Icon />
                {social.platform}
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
