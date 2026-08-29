import Link from "next/link";
import type { Service } from "@/lib/content";

export default function ServiceCard({ service, href }: { service: Service; href: string }) {
  return (
    <Link className="service-card" href={href}>
      <span className="service-card__num">{service.index}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </Link>
  );
}
