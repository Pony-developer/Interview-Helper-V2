import { AssayMark } from "@/components/brand/Logo";
import { CertificateSeal } from "./CertificateSeal";

/** Banknote-style guilloché: interleaved sine ribbons, drawn once per render (pure, deterministic). */
function Guilloche() {
  const lines = Array.from({ length: 18 }, (_, i) => {
    const amp = 18 + (i % 6) * 5;
    const phase = i * 0.55;
    const base = 40 + i * 36;
    let d = "";
    for (let x = 0; x <= 1000; x += 10) {
      const y = base + Math.sin(x / 42 + phase) * amp + Math.sin(x / 113 - phase) * amp * 0.6;
      d += `${x === 0 ? "M" : "L"}${x},${y.toFixed(1)} `;
    }
    return d;
  });
  return (
    <svg aria-hidden viewBox="0 0 1000 700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={i % 3 === 0 ? "#c9a227" : "#11704f"} strokeOpacity={i % 3 === 0 ? 0.16 : 0.07} strokeWidth="0.9" />
      ))}
    </svg>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={`absolute h-8 w-8 text-gold-600 sm:h-10 sm:w-10 ${className}`}>
      <path d="M2 38 V2 H38" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 38 V8 H38" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <rect x="0" y="0" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

export type CertificateLabels = {
  eyebrow: string;
  certifies: string;
  completed: string;
  withScore: string;
  issuer: string;
  id: string;
  verify: string;
  seal: string;
};

/** The certificate itself: A4-landscape proportions on wide screens, printable edge to edge. */
export function CertificateDocument({
  id,
  holderName,
  courseTitle,
  issuedOn,
  percent,
  verifyUrl,
  labels,
}: {
  id: string;
  holderName: string;
  courseTitle: string;
  issuedOn: string;
  percent: number;
  verifyUrl: string;
  labels: CertificateLabels;
}) {
  return (
    <article className="certificate-print relative mx-auto w-full max-w-5xl animate-rise bg-[#fbf9f2] p-2.5 shadow-lift [print-color-adjust:exact] sm:p-4 md:aspect-[297/210] print:max-w-none print:shadow-none">
      <div className="relative h-full border-2 border-forest-800 p-1.5">
        <div className="relative flex h-full flex-col overflow-hidden border border-gold-500 px-6 py-8 sm:px-14 sm:py-10">
          <Guilloche />
          <Corner className="left-2 top-2" />
          <Corner className="right-2 top-2 rotate-90" />
          <Corner className="bottom-2 right-2 rotate-180" />
          <Corner className="bottom-2 left-2 -rotate-90" />

          <header className="relative flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2">
              <AssayMark className="h-9 w-9" />
              <span className="font-display text-2xl font-extrabold tracking-tight text-forest-800">assay</span>
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">№ {id.slice(0, 8).toUpperCase()}</span>
          </header>

          <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center sm:py-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold-700 sm:text-sm">{labels.eyebrow}</p>
            <p className="mt-6 text-base text-ink-muted sm:text-lg">{labels.certifies}</p>
            <h1 className="mt-3 max-w-full break-words font-display text-4xl font-extrabold leading-tight text-forest-800 [text-wrap:balance] sm:text-6xl">
              {holderName}
            </h1>
            <div aria-hidden className="mt-5 h-px w-56 bg-gradient-to-r from-transparent via-gold-500 to-transparent sm:w-80" />
            <p className="mt-5 text-base text-ink-muted sm:text-lg">{labels.completed}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-forest-700 sm:text-4xl">{courseTitle}</p>
            <p className="mt-3 text-base font-semibold text-gold-800 sm:text-lg">{labels.withScore}</p>
          </div>

          <footer className="relative grid items-end gap-6 text-center sm:grid-cols-[1fr_auto_1fr] sm:text-left">
            <div>
              <p className="font-display text-lg font-bold text-forest-800">{issuedOn}</p>
              <div aria-hidden className="mt-1 h-px w-40 bg-forest-800/40 max-sm:mx-auto" />
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-soft">{labels.issuer}</p>
            </div>
            <div className="flex justify-center">
              <CertificateSeal percent={percent} ringText={labels.seal} id={id} />
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">{labels.id}</p>
              <p className="mt-1 break-all font-mono text-[0.7rem] text-ink">{id}</p>
              <p className="mt-2 text-xs text-ink-soft">{labels.verify}</p>
              <p className="break-all font-mono text-[0.7rem] text-forest-700">{verifyUrl}</p>
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
}
