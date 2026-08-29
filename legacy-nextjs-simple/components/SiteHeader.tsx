"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { CloseIcon, MoonIcon, SunIcon } from "@/components/Icons";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/site";

const THEME_KEY = "wyzrex-theme";

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen);
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

  const ThemeToggleButton = (
    <button
      className="icon-btn theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={theme === "dark"}
    >
      <SunIcon className="icon-sun" />
      <MoonIcon className="icon-moon" />
    </button>
  );

  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo">
          <Logo />
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {ThemeToggleButton}
          <button
            className="menu-btn"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="nav-overlay"
          >
            Menu
          </button>
        </div>
      </header>

      <div id="nav-overlay" className={`nav-overlay${menuOpen ? " is-open" : ""}`}>
        <div className="nav-overlay__top">
          <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>
          <div className="header-actions">
            {ThemeToggleButton}
            <button className="icon-btn" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
        </div>

        <nav className="nav-overlay__links" aria-label="Mobile primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-overlay__foot">
          {SOCIAL_LINKS.map((social) => (
            <a key={social.name} href={social.href} target="_blank" rel="noopener">
              {/* add real profile URL */}
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
