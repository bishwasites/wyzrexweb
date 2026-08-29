import type { Metadata } from "next";
import Eyebrow from "@/components/site/Eyebrow";
import ServiceRows from "@/components/site/ServiceRows";
import CtaBand from "@/components/site/CtaBand";
import { getPageSections, getServices } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Social media management, content and video production, branding, web design and development, and paid advertising and growth — everything WYZREX does best.",
};

export default async function ServicesPage() {
  const [services, sections] = await Promise.all([getServices(), getPageSections("services")]);
  const hero = sections.get("hero");

  return (
    <>
      <section className="pt-28 md:pt-40">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <Eyebrow>{hero?.eyebrow || "Services"}</Eyebrow>
          <h1 className="text-[clamp(2.5rem,6vw+1rem,5rem)] font-semibold tracking-tight">
            {hero?.heading || "What we do best."}
          </h1>
          <ServiceRows services={services} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
