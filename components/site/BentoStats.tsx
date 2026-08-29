import CountUp from "@/components/ui/CountUp";
import type { Stat } from "@/db/schema";

export default function BentoStats({ stats }: { stats: Pick<Stat, "id" | "value" | "suffix" | "label">[] }) {
  return (
    <div className="stats-bar">
      {stats.map((stat) => {
        const num = Number(stat.value);
        const isNumeric = !Number.isNaN(num) && stat.value.trim() !== "";
        return (
          <div key={stat.id} className="stats-bar__item">
            <div className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-none text-gold">
              {isNumeric ? <CountUp value={num} suffix={stat.suffix ?? ""} duration={2000} /> : `${stat.value}${stat.suffix ?? ""}`}
            </div>
            <div className="mt-1.5 text-sm text-muted">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
