import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "gold" | "light" | "outline-light" | "forest" | "outline-forest";

const variants: Record<Variant, string> = {
  gold: "bg-gold-500 text-forest-950 hover:bg-gold-300",
  light: "bg-white text-forest-800 hover:bg-gold-100",
  "outline-light": "border border-white/70 text-white hover:bg-white/10 hover:border-white",
  forest: "bg-forest-700 text-white hover:bg-forest-800",
  "outline-forest": "border border-forest-700 text-forest-800 hover:bg-forest-700 hover:text-white",
};

export function pillClasses(variant: Variant = "gold", extra = "") {
  return `group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${variants[variant]} ${extra}`;
}

export function PillArrow({ dark = false }: { dark?: boolean }) {
  return (
    <ArrowRight
      aria-hidden
      className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${dark ? "" : ""}`}
    />
  );
}

type PillLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

/** Reference-style pill CTA: arrow + uppercase label. */
export function PillLink({ variant = "gold", className = "", children, ...props }: PillLinkProps) {
  return (
    <Link {...props} className={pillClasses(variant, className)}>
      <PillArrow />
      <span>{children}</span>
    </Link>
  );
}
