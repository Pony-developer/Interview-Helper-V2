import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export function PageTitle({ title, back, children }: { title: string; back?: { href: string; label: string }; children?: ReactNode }) {
  return (
    <div className="mb-8">
      {back ? (
        <Link href={back.href} className="text-sm font-semibold text-forest-700 hover:underline">
          ← {back.label}
        </Link>
      ) : null}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-forest-800 sm:text-3xl">{title}</h1>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
