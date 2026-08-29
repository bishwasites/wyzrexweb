import Link from "next/link";
import Logo from "@/components/site/Logo";
import { getSocialIcon } from "@/components/site/socialIcons";
import type { FooterColumn, FooterLink, Social } from "@/db/schema";

interface SiteFooterProps {
  footerColumns: (FooterColumn & { links: FooterLink[] })[];
  socials: Pick<Social, "platform" | "url">[];
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
}

export default function SiteFooter({ footerColumns, socials, email, phone, address, logoLightUrl, logoDarkUrl }: SiteFooterProps) {
  const year = new Date().getFullYear();
  // "Legal" holds the bottom-bar links (Privacy/Terms); everything else
  // renders as its own column alongside Contact/Social.
  const legal = footerColumns.find((c) => c.title.toLowerCase() === "legal");
  const mainColumns = footerColumns.filter((c) => c !== legal);

  return (
    <footer className="relative z-[1] bg-ink-deep text-ink-fg">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-10 border-b border-white/12 px-5 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 md:py-16">
        <div>
          <span className="mb-3 inline-block">
            <Logo alwaysWhite lightSrc={logoLightUrl} darkSrc={logoDarkUrl} />
          </span>
          <p className="max-w-[30ch] text-sm text-white/65">
            A digital marketing and creative production agency, built on execution and strategy in equal measure.
          </p>
        </div>

        {mainColumns.map((col) => (
          <div key={col.id}>
            <h4 className="mb-4 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-gold-light">{col.title}</h4>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.id}>
                  <Link className="text-sm text-white/70 hover:text-gold-light" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {(email || phone || address) && (
          <div>
            <h4 className="mb-4 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-gold-light">Contact</h4>
            <ul className="flex flex-col gap-2.5">
              {email && (
                <li>
                  <a className="text-sm text-white/70 hover:text-gold-light" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a className="text-sm text-white/70 hover:text-gold-light" href={`tel:${phone.replace(/\s+/g, "")}`}>
                    {phone}
                  </a>
                </li>
              )}
              {address && <li><span className="text-sm text-white/70">{address}</span></li>}
            </ul>
          </div>
        )}

        {socials.length > 0 && (
          <div>
            <h4 className="mb-4 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-gold-light">Social</h4>
            <div className="flex flex-wrap gap-2.5">
              {socials.map((social) => {
                const Icon = getSocialIcon(social.platform);
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={social.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 text-white/80 transition-colors hover:border-gold hover:text-gold-light"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-4 border-t border-white/12 px-5 py-6 text-[0.8125rem] text-white/50 md:px-8">
        <span>© {year} WYZREX. All rights reserved.</span>
        {legal && legal.links.length > 0 && (
          <div className="flex gap-5">
            {legal.links.map((link) => (
              <Link key={link.id} className="hover:text-white/85" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
