import Link from "next/link";
import type { Service } from "@/db/schema";

export default function ServiceRows({ services }: { services: Service[] }) {
  return (
    <div>
      {services.map((service, i) => (
        <Link
          key={service.id}
          href="/contact"
          className="group flex flex-wrap items-center gap-6 border-t border-line py-8 transition-colors last:border-b hover:bg-surface md:py-10"
        >
          <span className="w-12 flex-shrink-0 text-2xl font-semibold text-gold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-[220px] flex-1">
            <h3 className="text-xl font-semibold md:text-2xl">{service.title}</h3>
            <p className="mt-1.5 max-w-2xl text-muted">{service.description}</p>
          </div>
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-line text-lg transition-all group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-[#0a0a0a]">
            ↗
          </span>
        </Link>
      ))}
    </div>
  );
}
