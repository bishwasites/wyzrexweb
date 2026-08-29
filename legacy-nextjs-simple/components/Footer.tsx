import Link from "next/link";
import Logo from "@/components/Logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/Icons";
import { CONTACT, SOCIAL_LINKS } from "@/lib/site";

const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  TikTok: TikTokIcon,
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-cta">
        <h2>Have a project in mind? Let&apos;s build it.</h2>
        <Link className="btn btn--gold" href="/contact">
          Start a project <span className="btn__badge">↗</span>
        </Link>
      </div>
      <div className="container footer-main">
        <div className="footer-brand">
          <span className="logo">
            <Logo alwaysWhite />
          </span>
          <p>A digital marketing and creative production agency, built on execution and strategy in equal measure.</p>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><a href={`tel:${CONTACT.phoneHref}`}>{CONTACT.phone}</a></li>
            <li><span>{CONTACT.locale}</span></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Social</h4>
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
      </div>
      <div className="container footer-legal">
        <span>© {year} WYZREX. All rights reserved.</span>
        <div className="legal-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}
