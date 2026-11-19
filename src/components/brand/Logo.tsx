import type { SVGProps } from "react";

/**
 * Assay mark: seven dots arranged as a faceted nugget (hex ring + core),
 * echoing an assayer's sample tray. Six gold dots, one forest core.
 */
export function AssayMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 48 48" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title ? <title>{title}</title> : null}
      <g>
        <circle cx="24" cy="8.5" r="5.2" fill="#E6CF86" />
        <circle cx="37.4" cy="16.2" r="4.4" fill="#C9A227" />
        <circle cx="37.4" cy="31.8" r="5.6" fill="#D9B84E" />
        <circle cx="24" cy="39.5" r="4.2" fill="#C9A227" />
        <circle cx="10.6" cy="31.8" r="5" fill="#E6CF86" />
        <circle cx="10.6" cy="16.2" r="3.8" fill="#A9851A" />
        <circle cx="24" cy="24" r="6.4" fill="#11704F" stroke="#E6CF86" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** "light" = for dark backgrounds (default), "dark" = for light backgrounds */
  tone?: "light" | "dark";
  label?: string;
};

export function Logo({ className, tone = "light", label = "Assay" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <AssayMark className="h-9 w-9 shrink-0" />
      <span
        className={`font-display text-[1.35rem] font-extrabold lowercase leading-none tracking-[-0.03em] ${
          tone === "light" ? "text-white" : "text-forest-800"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
