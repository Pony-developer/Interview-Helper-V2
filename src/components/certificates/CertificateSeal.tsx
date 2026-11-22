/**
 * Gold hallmark: a faceted hexagonal ingot stamped with the score, inside a ring of repeated text,
 * like an assay office's punch mark.
 */
export function CertificateSeal({ percent, ringText, id }: { percent: number; ringText: string; id: string }) {
  const ring = `${ringText} · ${ringText} · ${ringText} · `;
  return (
    <svg viewBox="0 0 200 200" className="h-32 w-32 sm:h-40 sm:w-40" role="img" aria-label={`${ringText}: ${percent}%`}>
      <defs>
        <linearGradient id={`seal-gold-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e7a8" />
          <stop offset="48%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#7a5e0e" />
        </linearGradient>
        <path id={`seal-ring-${id}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#c9a227" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#c9a227" strokeWidth="0.75" strokeDasharray="2 3" />
      <text fill="#7a5e0e" fontSize="10.5" fontWeight="700" letterSpacing="2.2" style={{ textTransform: "uppercase" }}>
        <textPath href={`#seal-ring-${id}`} startOffset="0">
          {ring}
        </textPath>
      </text>
      <polygon points="100,38 154,69 154,131 100,162 46,131 46,69" fill={`url(#seal-gold-${id})`} />
      <polygon points="100,38 154,69 100,100" fill="#fff" opacity="0.22" />
      <polygon points="100,100 154,131 100,162" fill="#000" opacity="0.12" />
      <polygon points="100,50 143,75 143,125 100,150 57,125 57,75" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />
      <text x="100" y="108" textAnchor="middle" fill="#04241c" fontSize="30" fontWeight="800" style={{ fontFamily: "var(--font-display)" }}>
        {percent}%
      </text>
    </svg>
  );
}
