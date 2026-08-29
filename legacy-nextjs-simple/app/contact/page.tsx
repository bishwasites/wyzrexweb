import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, YouTubeIcon } from "@/components/Icons";
import { CONTACT, SOCIAL_LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you're building. Reach WYZREX by email, phone, or the form below — we're based in Colombo, Sri Lanka.",
};

const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  TikTok: TikTokIcon,
};

export default function ContactPage() {
  return (
    <section style={{ paddingTop: "clamp(7rem, 14vw, 10rem)" }}>
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Contact</p>
          <h1>Tell us what you&apos;re building.</h1>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <a className="big-link" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            <a className="big-link" href={`tel:${CONTACT.phoneHref}`}>
              {CONTACT.phone}
            </a>
            <p className="locale">{CONTACT.locale}</p>
            <div className="social-list">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.name as keyof typeof SOCIAL_ICONS];
                return (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener" aria-label={social.name}>
                    {/* add real profile URL */}
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
