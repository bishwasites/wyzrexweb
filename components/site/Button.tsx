import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import MagneticButton from "@/components/motion/MagneticButton";

type Variant = "dark" | "gold" | "outline";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
  target?: string;
  rel?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  dark: "bg-ink text-ink-fg",
  gold: "bg-gold text-[#0a0a0a]",
  outline: "border border-line bg-transparent text-fg",
};

const BADGE_CLASSES: Record<Variant, string> = {
  dark: "bg-ink-fg text-ink",
  gold: "bg-[#0a0a0a] text-gold",
  outline: "bg-fg text-bg",
};

export default function Button({ href, children, variant = "dark", withArrow = true, className, target, rel }: ButtonProps) {
  const content = (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={clsx(
        "inline-flex items-center gap-3 rounded-pill py-2 pl-6 pr-2 text-[0.9375rem] font-medium whitespace-nowrap transition-shadow hover:shadow-lg",
        VARIANT_CLASSES[variant],
        !withArrow && "py-3 px-6",
        className
      )}
    >
      {children}
      {withArrow && (
        <span className={clsx("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-base", BADGE_CLASSES[variant])}>
          ↗
        </span>
      )}
    </Link>
  );

  if (variant === "gold") {
    return <MagneticButton>{content}</MagneticButton>;
  }
  return content;
}
