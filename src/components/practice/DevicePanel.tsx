"use client";

import "@/lib/react-aria-dev-shim";

import { Check, Cpu, Loader2, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Checkbox, Label, Radio, RadioGroup } from "react-aria-components";
import { checkWebGPU, isModelCached, type GpuSupport } from "@/lib/llm/engine";
import { LLM_MODELS, type LlmModelKey } from "@/lib/llm/models";

type Props = {
  model: LlmModelKey;
  onModelChange: (m: LlmModelKey) => void;
  allowFallback: boolean;
  fallback: boolean;
  onFallbackChange: (v: boolean) => void;
  onSupportChange: (supported: boolean | null) => void;
};

export function DevicePanel({ model, onModelChange, allowFallback, fallback, onFallbackChange, onSupportChange }: Props) {
  const t = useTranslations("practice.device");
  const [support, setSupport] = useState<GpuSupport | null>(null);
  const [cached, setCached] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    checkWebGPU().then((s) => {
      if (!alive) return;
      setSupport(s);
      onSupportChange(s.supported);
    });
    Promise.all(LLM_MODELS.map(async (m) => [m.key, await isModelCached(m.key)] as const)).then((entries) => {
      if (alive) setCached(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, [onSupportChange]);

  return (
    <section aria-labelledby="device-title" className="rounded-2xl border border-forest-200 bg-forest-50 p-5">
      <h3 id="device-title" className="flex items-center gap-2 font-semibold text-forest-800">
        <Cpu aria-hidden className="h-5 w-5" />
        {t("title")}
      </h3>
      <p className="mt-2 flex items-start gap-2 text-sm text-ink-muted" role="status">
        {support === null ? (
          <>
            <Loader2 aria-hidden className="mt-0.5 h-4 w-4 animate-spin" />
            {t("checking")}
          </>
        ) : support.supported ? (
          <>
            <Check aria-hidden className="mt-0.5 h-4 w-4 text-success" />
            {t("supported")}
          </>
        ) : (
          <>
            <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 text-warning" />
            {t("unsupported")}
          </>
        )}
      </p>

      {support?.supported && !fallback ? (
        <RadioGroup value={model} onChange={(v) => onModelChange(v as LlmModelKey)} className="mt-4">
          <Label className="text-sm font-semibold text-ink">{t("model")}</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {LLM_MODELS.map((m) => (
              <Radio
                key={m.key}
                value={m.key}
                className="cursor-pointer rounded-xl border border-paper-3 bg-white p-3 text-sm outline-none transition data-[selected]:border-forest-600 data-[selected]:ring-2 data-[selected]:ring-forest-600/20 data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500"
              >
                <span className="block font-semibold text-ink">{t(`models.${m.key}`)}</span>
                <span className="mt-0.5 block text-ink-muted">
                  {m.label} · {cached[m.key] ? t("cached") : t("download", { size: m.downloadMb })}
                </span>
              </Radio>
            ))}
          </div>
        </RadioGroup>
      ) : null}

      {allowFallback ? (
        <Checkbox
          isSelected={fallback}
          onChange={onFallbackChange}
          className="group mt-4 flex cursor-pointer items-start gap-3 text-sm outline-none"
        >
          <span
            aria-hidden
            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-forest-600 bg-white group-data-[selected]:bg-forest-700 group-data-[focus-visible]:ring-[3px] group-data-[focus-visible]:ring-gold-500"
          >
            <Check className="h-3.5 w-3.5 text-white opacity-0 group-data-[selected]:opacity-100" />
          </span>
          <span>
            <span className="block font-semibold text-ink">{t("fallback")}</span>
            <span className="block text-ink-muted">{t("fallbackHelp")}</span>
          </span>
        </Checkbox>
      ) : null}
    </section>
  );
}
