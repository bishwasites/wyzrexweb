import { PlatformIcon } from "@/components/site/Icons";
import type { ClientProfile } from "@/db/schema";

function formatFollowers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K followers`;
  return `${n} followers`;
}

export default function ClientProfilesSection({ profiles, clientName }: { profiles: ClientProfile[]; clientName: string }) {
  if (profiles.length === 0) return null;

  return (
    <section>
      <div className="mx-auto max-w-container px-5 md:px-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Follow {clientName}</h2>
        <div className="flex flex-wrap gap-3">
          {profiles.map((p) => (
            <a
              key={p.id}
              href={p.profileUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-pill border border-line bg-surface px-4 py-2.5 transition-colors hover:border-gold"
            >
              <PlatformIcon platform={p.platform} />
              <span className="text-sm font-medium">{p.handle}</span>
              {p.followerCount != null && <span className="text-sm text-muted">{formatFollowers(p.followerCount)}</span>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
