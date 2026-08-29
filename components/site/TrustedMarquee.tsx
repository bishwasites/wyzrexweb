import Image from "next/image";
import type { Client } from "@/db/schema";

export default function TrustedMarquee({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const loop = [...clients, ...clients];

  return (
    <div className="marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-5 motion-reduce:animate-none">
        {loop.map((client, i) => (
          <div
            key={`${client.id}-${i}`}
            className="flex h-20 w-36 flex-shrink-0 items-center justify-center rounded-card-sm border border-line bg-surface p-4 opacity-70 grayscale transition-all duration-300 hover:border-gold hover:opacity-100 hover:grayscale-0"
          >
            {client.logoUrl ? (
              <Image
                src={client.logoUrl}
                alt={client.name}
                width={112}
                height={44}
                className="h-auto max-h-10 w-auto object-contain"
                unoptimized
              />
            ) : (
              <span className="text-sm font-semibold text-muted">{client.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
