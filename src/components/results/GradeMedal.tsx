/** Karat medallion. `grade` is one of 24K/22K/18K/14K/10K/ORE. */
export function GradeMedal({ grade, label }: { grade: string; label: string }) {
  const ore = grade === "ORE";
  const purity = { "24K": 1, "22K": 0.92, "18K": 0.75, "14K": 0.58, "10K": 0.42, ORE: 0.2 }[grade] ?? 0.2;
  return (
    <div className="relative grid h-48 w-48 place-items-center sm:h-56 sm:w-56" role="img" aria-label={label}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="medal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ore ? "#9fb3aa" : "#f6e7a8"} />
            <stop offset="50%" stopColor={ore ? "#65736d" : "#c9a227"} />
            <stop offset="100%" stopColor={ore ? "#46564f" : "#7a5e0e"} />
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 88}
              y1={100 + Math.sin(a) * 88}
              x2={100 + Math.cos(a) * 97}
              y2={100 + Math.sin(a) * 97}
              stroke={i / 24 < purity ? "#c9a227" : "rgb(255 255 255 / 0.18)"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        <polygon points="100,18 171,59 171,141 100,182 29,141 29,59" fill="url(#medal)" />
        <polygon points="100,18 171,59 100,100" fill="#fff" opacity="0.18" />
        <polygon points="100,100 171,141 100,182" fill="#000" opacity="0.12" />
        <polygon points="100,34 157,67 157,133 100,166 43,133 43,67" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      </svg>
      <span
        aria-hidden
        className={`relative font-display font-extrabold tracking-tight ${ore ? "text-2xl text-white" : "text-5xl text-forest-950 sm:text-6xl"}`}
      >
        {ore ? "ORE" : grade}
      </span>
    </div>
  );
}
