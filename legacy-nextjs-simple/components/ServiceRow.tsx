import Link from "next/link";
import type { Service } from "@/lib/content";

export default function ServiceRow({ service, href }: { service: Service; href: string }) {
  return (
    <Link className="service-row" href={href}>
      <span className="service-row__index">{service.index}</span>
      <div className="service-row__body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </div>
      <span className="service-row__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}
