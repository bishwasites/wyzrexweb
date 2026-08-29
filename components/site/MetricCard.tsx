import clsx from "clsx";

export default function MetricCard({
  value,
  label,
  className,
  onDark = false,
}: {
  value: string;
  label: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-card-sm border p-6",
        onDark ? "border-white/10 bg-white/5" : "border-line bg-surface",
        className
      )}
    >
      <div className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-none text-gold">{value}</div>
      <div className={clsx("mt-2 text-sm uppercase tracking-wide", onDark ? "text-white/65" : "text-muted")}>
        {label}
      </div>
    </div>
  );
}
