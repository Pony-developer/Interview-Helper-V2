"use client";

import { useState } from "react";
import { CodingGround } from "@/components/playground/CodingGround";
import { SAMPLE_PRACTICE } from "@/lib/playground/samples";

export function PlaygroundSpike() {
  const [fw, setFw] = useState("vanilla-ts");
  return (
    <main id="main" className="mx-auto w-full max-w-7xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Playground spike</h1>
      <div className="mb-4 flex gap-2">
        {Object.keys(SAMPLE_PRACTICE).map((k) => (
          <button key={k} onClick={() => setFw(k)} className={`rounded-full border px-3 py-1 ${fw === k ? "bg-forest-700 text-white" : ""}`}>
            {k}
          </button>
        ))}
      </div>
      <CodingGround key={fw} practice={SAMPLE_PRACTICE[fw]} />
    </main>
  );
}
