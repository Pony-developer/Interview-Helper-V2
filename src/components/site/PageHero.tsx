import type { ReactNode } from "react";

/** Compact dark-green page header band used by inner pages. */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden bg-forest-900 text-white">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(40rem 22rem at 85% 0%, rgb(201 162 39 / 0.2), transparent 60%), radial-gradient(30rem 30rem at 0% 120%, rgb(17 112 79 / 0.6), transparent 60%)",
        }}
      />
      <div className="relative z-[2] mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        {eyebrow ? (
          <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            <span aria-hidden className="h-px w-10 bg-gold-500" />
            {eyebrow}
          </div>
        ) : null}
        <h1 className="max-w-4xl animate-rise font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-5 max-w-2xl animate-rise text-lg leading-relaxed text-forest-100 [animation-delay:90ms]">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
