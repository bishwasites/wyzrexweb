import clsx from "clsx";

export default function Eyebrow({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return (
    <p
      className={clsx(
        "mb-4 inline-flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-[0.14em] before:h-1.5 before:w-1.5 before:flex-shrink-0 before:rounded-full before:bg-gold",
        onDark ? "text-gold-light" : "text-muted"
      )}
    >
      {children}
    </p>
  );
}
