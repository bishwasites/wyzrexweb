import type { Metadata } from "next";
import Link from "next/link";
import ServiceRow from "@/components/ServiceRow";
import { SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Social media management, content and video production, branding, web design and development, and paid advertising and growth — everything WYZREX does best.",
};

export default function ServicesPage() {
  return (
    <>
      <section style={{ paddingTop: "clamp(7rem, 14vw, 10rem)" }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Services</p>
            <h1>What we do best.</h1>
          </div>

          <div className="services-list">
            {SERVICES.map((service) => (
              <ServiceRow key={service.index} service={service} href="/contact" />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band-section">
        <div className="container cta-band">
          <h2>Have a project in mind? Let&apos;s build it.</h2>
          <Link className="btn btn--gold" href="/contact">
            Start a project <span className="btn__badge">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
