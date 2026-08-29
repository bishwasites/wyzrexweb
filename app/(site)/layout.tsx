import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ScrollProgressBar from "@/components/motion/ScrollProgressBar";
import SkipToContent from "@/components/site/SkipToContent";
import { getFooter, getNavItems, getSiteSettings, getSocials } from "@/lib/cms";

// All public pages are backed by Postgres and edited live from /admin, so
// they're rendered per-request rather than frozen at build time.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems, socials, footerColumns] = await Promise.all([
    getSiteSettings(),
    getNavItems(),
    getSocials(),
    getFooter(),
  ]);

  return (
    <>
      <SkipToContent />
      <ScrollProgressBar />
      <SiteHeader
        navItems={navItems}
        socials={socials}
        logoLightUrl={settings.logoLightUrl}
        logoDarkUrl={settings.logoDarkUrl}
      />
      <main id="main" className="relative z-[1]">
        {children}
      </main>
      <SiteFooter
        footerColumns={footerColumns}
        socials={socials}
        email={settings.email}
        phone={settings.phone}
        address={settings.address}
        logoLightUrl={settings.logoLightUrl}
        logoDarkUrl={settings.logoDarkUrl}
      />
    </>
  );
}
