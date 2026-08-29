import Link from "next/link";
import type { WorkItem } from "@/lib/content";

export default function WorkCard({ item, href }: { item: WorkItem; href: string }) {
  return (
    <Link className="work-card" href={href}>
      <div className="work-card__meta">
        <span>{item.category}</span>
        <span>{item.year}</span>
      </div>
      <h3>{item.client}</h3>
      <p>{item.description}</p>
      <div className="work-card__tags">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}
