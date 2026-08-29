import Image from "next/image";
import { Globe } from "lucide-react";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/site/Icons";
import type { Project } from "@/db/schema";

const SOCIAL_LINKS = [
  { key: "instagramUrl", Icon: InstagramIcon } as const,
  { key: "facebookUrl", Icon: FacebookIcon } as const,
  { key: "tiktokUrl", Icon: TikTokIcon } as const,
  { key: "youtubeUrl", Icon: YouTubeIcon } as const,
  { key: "websiteUrl", Icon: Globe } as const,
];

export default function ProjectCard({ project }: { project: Project }) {
  const socials = SOCIAL_LINKS.filter((s) => project[s.key]);

  return (
    <div className="project-card rounded-[24px] border border-line bg-surface p-4">
      <div className="relative aspect-[5/3] w-full overflow-hidden rounded-[24px]">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.clientName}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="project-card__cover-img object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-2" />
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {project.logoUrl && (
          <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-control dark:bg-white dark:p-1.5">
            <Image
              src={project.logoUrl}
              alt={`${project.clientName} logo`}
              width={56}
              height={40}
              className="h-full w-auto object-contain"
            />
          </div>
        )}
        <p className="text-base font-bold">{project.clientName}</p>
      </div>

      {project.brief && <p className="mt-2 line-clamp-2 text-sm text-muted">{project.brief}</p>}

      {socials.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {socials.map(({ key, Icon }) => (
            <a
              key={key}
              href={project[key]!}
              target="_blank"
              rel="noopener"
              aria-label={key.replace("Url", "")}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line text-fg transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold hover:text-[#0a0a0a]"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
