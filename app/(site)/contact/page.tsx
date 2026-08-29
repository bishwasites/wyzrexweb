import type { Metadata } from "next";
import Eyebrow from "@/components/site/Eyebrow";
import ContactForm from "@/components/site/ContactForm";
import { getSocialIcon } from "@/components/site/socialIcons";
import { getPageSections, getSiteSettings, getSocials } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you're building. Reach WYZREX by email, phone, or the form below — we're based in Colombo, Sri Lanka.",
};

export default async function ContactPage() {
  const [settings, socials, sections] = await Promise.all([
    getSiteSettings(),
    getSocials(),
    getPageSections("contact"),
  ]);
  const hero = sections.get("hero");

  return (
    <section className="pt-28 md:pt-40">
      <div className="mx-auto max-w-container px-5 pb-24 md:px-8">
        <Eyebrow>{hero?.eyebrow || "Contact"}</Eyebrow>
        <h1 className="mb-12 text-[clamp(2.5rem,6vw+1rem,5rem)] font-semibold tracking-tight">
          {hero?.heading || "Tell us what you're building."}
        </h1>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-6">
            {settings.email && (
              <a
                className="inline-block border-b-2 border-transparent text-[clamp(1.5rem,2.5vw,2rem)] font-medium transition-colors hover:border-gold hover:text-gold-dark"
                href={`mailto:${settings.email}`}
              >
                {settings.email}
              </a>
            )}
            {settings.phone && (
              <a
                className="inline-block border-b-2 border-transparent text-[clamp(1.5rem,2.5vw,2rem)] font-medium transition-colors hover:border-gold hover:text-gold-dark"
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              >
                {settings.phone}
              </a>
            )}
            {settings.address && <p className="text-muted">{settings.address}</p>}
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-gold"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
