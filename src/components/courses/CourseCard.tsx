import type { Course } from "@/lib/data/courses";

/**
 * A course as a lab certificate: the dark card is the ingot, the light card the stamped paper.
 * Pure markup; the entrance is a CSS rise on the wrapper so hover transforms on the card stay free.
 */
export function CourseCard({
  course,
  index,
  dark,
  topicsLabel,
  topicCount,
}: {
  course: Course;
  index: number;
  dark: boolean;
  topicsLabel: string;
  topicCount: string;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className={index === 0 ? "animate-rise" : "animate-rise [animation-delay:140ms]"}>
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-1 sm:p-10 ${
          dark ? "bg-forest-900 text-white shadow-lift" : "bg-paper-2 text-ink ring-1 ring-paper-3"
        }`}
        style={
          dark
            ? {
                backgroundImage:
                  "radial-gradient(28rem 16rem at 100% 0%, rgb(201 162 39 / 0.22), transparent 60%), radial-gradient(22rem 22rem at 0% 110%, rgb(17 112 79 / 0.55), transparent 60%)",
              }
            : undefined
        }
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute right-6 top-4 font-display text-8xl font-extrabold leading-none ${
            dark ? "text-white/[0.07]" : "text-forest-700/[0.08]"
          }`}
        >
          {number}
        </span>

        <div className="relative">
          <div className="gold-rule w-20 transition-[width] duration-300 group-hover:w-full" />
          <h2 className={`mt-6 font-display text-4xl font-extrabold leading-tight sm:text-5xl ${dark ? "text-white" : "text-forest-700"}`}>
            {course.title}
          </h2>
          <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-forest-100" : "text-ink-muted"}`}>{course.summary}</p>

          <h3
            className={`mt-10 text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-gold-300" : "text-gold-700"}`}
          >
            {topicsLabel}
          </h3>
          <ol className="mt-4 list-none">
            {course.topics.map((topic, i) => (
              <li
                key={topic}
                className={`flex items-baseline gap-4 border-t py-3 ${dark ? "border-white/10" : "border-paper-3"}`}
              >
                <span className={`font-mono text-sm tabular-nums ${dark ? "text-gold-300" : "text-forest-700"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug">{topic}</span>
              </li>
            ))}
          </ol>
          <p className={`mt-6 border-t pt-5 text-sm font-semibold ${dark ? "border-white/10 text-forest-200" : "border-paper-3 text-ink-soft"}`}>
            {topicCount}
          </p>
        </div>
      </article>
    </div>
  );
}
