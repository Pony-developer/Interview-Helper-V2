/* Decorative hero illustrations (aria-hidden). All motion is CSS and stops under reduced motion. */

const VEIN_NODES = [
  [70, 400, 7],
  [130, 352, 5],
  [188, 318, 9],
  [246, 262, 6],
  [292, 236, 12],
  [352, 200, 7],
  [404, 150, 10],
  [456, 128, 5],
  [500, 86, 8],
  [228, 370, 5],
  [318, 300, 6],
  [392, 268, 4],
  [168, 214, 4],
  [440, 222, 6],
] as const;

const GLYPHS = [
  ["{ }", 60, 120, 0],
  ["=>", 410, 330, 1.2],
  ["</>", 250, 90, 2.1],
  ["[ ]", 120, 260, 3.4],
  ["async", 340, 420, 0.6],
  ["fn()", 470, 270, 2.7],
  ["λ", 200, 160, 4.1],
  ["?.", 520, 380, 1.8],
  ["T[]", 90, 470, 3.0],
] as const;

export function OreVeinVisual() {
  return (
    <svg viewBox="0 0 580 520" className="h-full w-full" aria-hidden focusable="false">
      <defs>
        <radialGradient id="vein-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vein-stroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9851a" />
          <stop offset="55%" stopColor="#e6cf86" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="250" rx="280" ry="220" fill="url(#vein-glow)" />
      <path
        className="hero-vein"
        d="M40 440 L70 400 L130 352 L188 318 L246 262 L292 236 L352 200 L404 150 L456 128 L500 86 L560 40"
        fill="none"
        stroke="url(#vein-stroke)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M188 318 L228 370 M292 236 L318 300 L392 268 L440 222 M246 262 L168 214 M352 200 L440 222"
        fill="none"
        stroke="#e6cf86"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="3 6"
      />
      {GLYPHS.map(([text, x, y, delay]) => (
        <text
          key={text}
          x={x}
          y={y}
          className="hero-glyph"
          style={{ animationDelay: `${delay}s` }}
          fill="#cfe3d8"
          fontFamily="var(--font-plex-mono), monospace"
          fontSize="18"
        >
          {text}
        </text>
      ))}
      {VEIN_NODES.map(([x, y, r], i) => (
        <g key={i} className="hero-node" style={{ animationDelay: `${(i % 7) * 0.45}s`, transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r={r + 6} fill="#c9a227" opacity="0.18" />
          <circle cx={x} cy={y} r={r} fill={i % 3 === 0 ? "#e6cf86" : "#c9a227"} />
        </g>
      ))}
      <g transform="translate(292 236)">
        <polygon
          className="hero-facet"
          points="0,-58 50,-29 50,29 0,58 -50,29 -50,-29"
          fill="none"
          stroke="#e6cf86"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />
        <polygon points="0,-58 50,-29 0,0" fill="#e6cf86" opacity="0.08" />
        <polygon points="0,0 50,29 0,58" fill="#e6cf86" opacity="0.14" />
      </g>
    </svg>
  );
}

const POST_LINES = [
  [{ w: 64 }, { k: "React", w: 18 }],
  [{ w: 36 }, { k: "TypeScript", w: 26 }, { w: 22 }],
  [{ w: 52 }, { w: 30 }],
  [{ w: 20 }, { k: "RxJS", w: 14 }, { w: 40 }],
  [{ w: 72 }],
  [{ w: 28 }, { k: "Jest", w: 12 }, { w: 34 }],
  [{ w: 58 }, { w: 18 }],
] as const;

export function JobScanVisual() {
  let highlight = 0;
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[30rem]">
      <div className="relative rotate-[-2.5deg] overflow-hidden rounded-3xl bg-paper p-7 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded-full bg-forest-200" />
          <div className="rounded-full bg-forest-100 px-3 py-1 font-mono text-[11px] text-forest-800">jobs.dou.ua</div>
        </div>
        <p className="mt-5 font-display text-xl font-bold text-ink">Senior Frontend Engineer</p>
        <div className="mt-5 space-y-3">
          {POST_LINES.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              {line.map((part, j) =>
                "k" in part ? (
                  <span
                    key={j}
                    className="hero-skill relative rounded-md px-1.5 py-0.5 font-mono text-[12px] font-semibold text-forest-900"
                    style={{ animationDelay: `${0.6 + highlight++ * 0.7}s` }}
                  >
                    {part.k}
                  </span>
                ) : (
                  <span key={j} className="h-2.5 rounded-full bg-paper-3" style={{ width: `${part.w}%` }} />
                ),
              )}
            </div>
          ))}
        </div>
        <div className="hero-scan pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-gold-300/45 to-transparent" />
      </div>
      <div className="relative -mt-6 ml-8 flex flex-wrap gap-2">
        {["React", "TypeScript", "RxJS", "Jest"].map((s, i) => (
          <span
            key={s}
            className="hero-chip rounded-full border border-gold-300/60 bg-forest-900/90 px-3.5 py-1.5 text-sm font-semibold text-gold-300 backdrop-blur"
            style={{ animationDelay: `${1 + i * 0.7}s` }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

const CODE = [
  [["kw", "export function "], ["fn", "debounce"], ["p", "(fn, ms) {"]],
  [["kw", "  let "], ["v", "timer"], ["p", ";"]],
  [["kw", "  return "], ["p", "(...args) => {"]],
  [["fn", "    clearTimeout"], ["p", "(timer);"]],
  [["v", "    timer "], ["p", "= "], ["fn", "setTimeout"], ["p", "(() =>"]],
  [["fn", "      fn"], ["p", "(...args), ms);"]],
  [["p", "  };"]],
  [["p", "}"]],
] as const;

const TOKEN: Record<string, string> = { kw: "text-gold-300", fn: "text-[#8fd3b0]", v: "text-white", p: "text-forest-200" };

export function CodeGroundVisual() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[31rem]">
      <div className="overflow-hidden rounded-3xl border border-forest-600/60 bg-forest-950 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.75)]">
        <div className="flex items-center gap-2 border-b border-forest-800 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff8a7a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#8fd3b0]" />
          <span className="ml-3 font-mono text-xs text-forest-200">debounce.ts</span>
        </div>
        <pre className="px-5 py-4 font-mono text-[13px] leading-6">
          {CODE.map((line, i) => (
            <div key={i} className="hero-type overflow-hidden whitespace-pre" style={{ animationDelay: `${0.2 + i * 0.28}s` }}>
              <span className="mr-4 inline-block w-4 text-right text-forest-600">{i + 1}</span>
              {line.map(([kind, text], j) => (
                <span key={j} className={TOKEN[kind]}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </pre>
        <div className="space-y-2 border-t border-forest-800 bg-forest-900/60 px-5 py-4 text-sm">
          {["delays the call", "keeps the latest arguments", "cancels earlier timers"].map((name, i) => (
            <div key={name} className="flex items-center gap-2.5 text-forest-100">
              <span className="hero-check grid h-4 w-4 place-items-center rounded-full" style={{ animationDelay: `${2.6 + i * 0.5}s` }}>
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                  <path d="M2 6.5 L5 9 L10 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className="hero-medal absolute -right-4 -top-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 font-display text-xl font-extrabold text-forest-950 shadow-lift ring-4 ring-forest-950">
        24K
      </div>
    </div>
  );
}
