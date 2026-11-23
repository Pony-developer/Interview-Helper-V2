import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PathSummary } from "@/lib/data/paths";

/**
 * A career path as an ore map: the copy on the left, the route on the right as a gold vein
 * running through each course down to the role it leads to.
 */
export function PathCard({
  path,
  labels,
}: {
  path: PathSummary;
  labels: { route: string; destination: string; open: string; stats: string[] };
}) {
  return (
    <article
      className="grain group relative animate-rise overflow-hidden rounded-[2rem] bg-forest-900 text-white shadow-lift"
      style={{
        backgroundImage:
          "radial-gradient(36rem 20rem at 100% 0%, rgb(201 162 39 / 0.22), transparent 60%), radial-gradient(26rem 26rem at 0% 120%, rgb(17 112 79 / 0.6), transparent 60%)",
      }}
    >
      <div className="relative z-[2] grid gap-12 p-8 sm:p-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16 lg:p-14">
        <div className="flex flex-col">
          <div className="gold-rule w-20 transition-[width] duration-500 group-hover:w-40" />
          <h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            <Link href={`/paths/${path.slug}`} className="rounded-lg after:absolute after:inset-0 after:z-[3] after:content-['']">
              {path.title}
            </Link>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-forest-100">{path.summary}</p>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6">
            {labels.stats.map((s) => (
              <li key={s} className="font-mono text-sm uppercase tracking-[0.12em] text-forest-200">
                {s}
              </li>
            ))}
          </ul>

          <span
            aria-hidden
            className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-forest-950 transition-colors group-hover:bg-gold-300"
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            {labels.open}
          </span>
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-forest-950/40 p-7 backdrop-blur-[2px] sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{labels.route}</p>
          <ol className="relative mt-7">
            <span
              aria-hidden
              className="route-vein absolute bottom-6 left-[0.9375rem] top-4 w-0.5 bg-gradient-to-b from-gold-500 via-gold-300/60 to-gold-500"
            />
            {path.courseTitles.map((title, i) => (
              <li key={title} className="relative flex items-center gap-5 pb-9">
                <span className="relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-900 font-mono text-xs font-semibold text-gold-300 ring-2 ring-gold-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-xl font-bold">{title}</span>
              </li>
            ))}
            <li className="relative flex items-center gap-5">
              <span className="relative z-[1] grid h-8 w-8 shrink-0 place-items-center">
                <span className="h-5 w-5 rotate-45 bg-gold-500 shadow-[0_0_0_4px_rgb(201_162_39/0.25),0_0_24px_rgb(201_162_39/0.55)]" />
              </span>
              <span>
                <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-300">
                  {labels.destination}
                </span>
                <span className="font-display text-xl font-bold text-gold-100">{path.title}</span>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </article>
  );
}
