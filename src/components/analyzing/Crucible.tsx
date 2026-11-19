/** Decorative crucible that fills with molten gold as progress grows (0..1). */
export function Crucible({ progress, nuggets }: { progress: number; nuggets: number }) {
  const p = Math.max(0, Math.min(1, progress));
  // Inner bowl spans y=70..230; fill rises from the bottom.
  const top = 230 - p * 150;
  const drops = Array.from({ length: Math.min(nuggets, 9) });

  return (
    <svg viewBox="0 0 320 300" className="h-full w-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id="molten" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e7a8" />
          <stop offset="35%" stopColor="#e6cf86" />
          <stop offset="100%" stopColor="#a9851a" />
        </linearGradient>
        <radialGradient id="heat" cx="50%" cy="85%" r="60%">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
        <clipPath id="bowl">
          <path d="M70 70 L250 70 L226 214 Q222 232 204 232 L116 232 Q98 232 94 214 Z" />
        </clipPath>
      </defs>

      <ellipse cx="160" cy="250" rx="150" ry="46" fill="url(#heat)" className="analyzing-heat" />

      {/* falling nuggets */}
      {drops.map((_, i) => (
        <circle
          key={i}
          cx={118 + ((i * 37) % 90)}
          cy={30}
          r={4 + (i % 3)}
          fill="#e6cf86"
          className="analyzing-drop"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* molten fill */}
      <g clipPath="url(#bowl)">
        <rect x="60" y={top} width="200" height="200" fill="url(#molten)" style={{ transition: "y 0.6s ease-out" }} />
        <path
          className="analyzing-wave"
          d={`M40 ${top} q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 v 12 h -280 Z`}
          fill="#f6e7a8"
          opacity="0.75"
          style={{ transition: "d 0.6s ease-out" }}
        />
      </g>

      {/* vessel */}
      <path
        d="M62 62 L258 62 L232 216 Q226 242 202 242 L118 242 Q94 242 88 216 Z"
        fill="none"
        stroke="#e3eee8"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M50 62 L270 62" stroke="#e3eee8" strokeWidth="7" strokeLinecap="round" />
      <path d="M44 62 L34 56" stroke="#e3eee8" strokeWidth="5" strokeLinecap="round" />
      {/* tick marks */}
      {[0.25, 0.5, 0.75].map((m) => (
        <line key={m} x1="236" x2="248" y1={230 - m * 150} y2={230 - m * 150} stroke="#9fc2b2" strokeWidth="2" />
      ))}
    </svg>
  );
}
