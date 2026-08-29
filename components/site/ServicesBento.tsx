import Link from "next/link";
import { ServiceIcon } from "@/components/site/Icons";
import TiltCard from "@/components/motion/TiltCard";
import Reveal from "@/components/site/Reveal";
import type { Service } from "@/db/schema";

export default function ServicesBento({ services, href }: { services: Service[]; href: (s: Service) => string }) {
  return (
    <Reveal className="grid grid-cols-1 auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, i) => (
        <TiltCard key={service.id} tiltAmount={4} className="h-full">
          <Link href={href(service)} className="service-card group">
            <span className="service-card__number">{String(i + 1).padStart(2, "0")}</span>
            <span className="service-card__icon">
              <ServiceIcon name={service.iconName} />
            </span>
            <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
            <p className="mb-4 text-sm text-muted">{service.description}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark">
              Explore <span aria-hidden="true">→</span>
            </span>
          </Link>
        </TiltCard>
      ))}
    </Reveal>
  );
}
