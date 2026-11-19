"use client";

import "@/lib/react-aria-dev-shim";

import { ClipboardPaste, Link2, ListChecks, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { FieldError, Input, Label, Radio, RadioGroup, Text, TextArea, TextField } from "react-aria-components";
import { PillArrow, pillClasses } from "@/components/ui/PillLink";
import { useRouter } from "@/i18n/navigation";
import type { Skill } from "@/lib/content/schema";
import { DEFAULT_MODEL, type LlmModelKey } from "@/lib/llm/models";
import { useAnalysisRequest, type LengthKey, type LevelChoice, type Method } from "@/lib/pipeline/request-store";
import { DevicePanel } from "./DevicePanel";
import { SkillMultiSelect } from "./SkillMultiSelect";

const METHODS: { id: Method; icon: LucideIcon }[] = [
  { id: "manual", icon: ListChecks },
  { id: "url", icon: Link2 },
  { id: "llm_url", icon: Sparkles },
  { id: "llm_text", icon: ClipboardPaste },
];
const MIN_TEXT = 200;

type Props = {
  catalog: Skill[];
  withContent: string[];
  initialSkills: string[];
  initialMethod: Method;
  analyzingPath?: string;
};

function isHttpUrl(value: string) {
  try {
    const u = new URL(value.trim());
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

const segment =
  "cursor-pointer rounded-full border border-paper-3 bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none transition data-[hovered]:border-forest-600 data-[selected]:border-forest-700 data-[selected]:bg-forest-700 data-[selected]:text-white data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

export function PracticeForm({ catalog, withContent, initialSkills, initialMethod, analyzingPath = "/practice/analyzing" }: Props) {
  const t = useTranslations("practice");
  const router = useRouter();
  const setRequest = useAnalysisRequest((s) => s.setRequest);
  const contentSet = useMemo(() => new Set(withContent), [withContent]);

  const [method, setMethod] = useState<Method>(initialMethod);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [level, setLevel] = useState<LevelChoice>(initialMethod === "manual" ? "middle" : "auto");
  const [length, setLength] = useState<LengthKey>("standard");
  const [model, setModel] = useState<LlmModelKey>(DEFAULT_MODEL);
  const [fallback, setFallback] = useState(false);
  const [gpu, setGpu] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const onSupportChange = useCallback((s: boolean | null) => {
    setGpu(s);
    if (s === false) setFallback(true);
  }, []);

  const usesAi = method === "llm_url" || method === "llm_text";
  const errors = {
    skills: method === "manual" && skills.length === 0 ? t("errors.noSkills") : undefined,
    url: (method === "url" || method === "llm_url") && !isHttpUrl(url) ? t("url.invalid") : undefined,
    text: method === "llm_text" && text.trim().length < MIN_TEXT ? t("text.tooShort", { count: text.trim().length }) : undefined,
    gpu: method === "llm_url" && gpu === false ? t("errors.unsupported") : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function changeMethod(next: Method) {
    setMethod(next);
    if (next === "manual" && level === "auto") setLevel("middle");
    if (next !== "manual" && level !== "auto" && !submitted) setLevel("auto");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) {
      const first = document.querySelector<HTMLElement>("[data-invalid] input, [data-invalid] textarea, #skills-error");
      first?.focus();
      return;
    }
    setPending(true);
    setRequest({
      method,
      skills,
      url: url.trim(),
      text: text.trim(),
      level,
      length,
      model,
      keywordFallback: method === "llm_text" && (fallback || gpu === false),
    });
    router.push(analyzingPath);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-12">
      {/* Method */}
      <RadioGroup value={method} onChange={(v) => changeMethod(v as Method)} className="space-y-4">
        <Label className="font-display text-xl font-bold text-forest-700">{t("methodLegend")}</Label>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METHODS.map(({ id, icon: Icon }) => (
            <Radio
              key={id}
              value={id}
              className="group relative flex cursor-pointer flex-col rounded-3xl border border-paper-3 bg-white p-6 shadow-card outline-none transition data-[hovered]:-translate-y-0.5 data-[hovered]:shadow-lift data-[selected]:border-forest-700 data-[selected]:ring-2 data-[selected]:ring-forest-700 data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500"
            >
              <span className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-50 text-forest-700 transition group-data-[selected]:bg-forest-700 group-data-[selected]:text-gold-300">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <span
                  aria-hidden
                  className="grid h-6 w-6 place-items-center rounded-full border-2 border-paper-3 transition group-data-[selected]:border-forest-700"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-forest-700 opacity-0 transition group-data-[selected]:opacity-100" />
                </span>
              </span>
              <span className="mt-5 font-display text-lg font-bold leading-snug text-ink">{t(`methods.${id}.title`)}</span>
              <span className="mt-2 text-sm leading-relaxed text-ink-muted">{t(`methods.${id}.body`)}</span>
              <span className="mt-4 inline-flex w-fit rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-800">
                {t(`methods.${id}.badge`)}
              </span>
            </Radio>
          ))}
        </div>
      </RadioGroup>

      {/* Method-specific input */}
      <div className="rounded-3xl border border-paper-3 bg-white p-6 shadow-card sm:p-8">
        {method === "manual" ? (
          <SkillMultiSelect
            catalog={catalog}
            withContent={contentSet}
            selected={skills}
            onChange={setSkills}
            error={submitted ? errors.skills : undefined}
          />
        ) : null}

        {method === "url" || method === "llm_url" ? (
          <TextField
            value={url}
            onChange={setUrl}
            type="url"
            isRequired
            isInvalid={submitted && !!errors.url}
            validationBehavior="aria"
            className="space-y-2"
          >
            <Label className="block font-semibold text-ink">{t("url.label")}</Label>
            <Input
              placeholder={t("url.placeholder")}
              inputMode="url"
              autoComplete="url"
              className="w-full rounded-2xl border border-paper-3 bg-white px-4 py-4 text-base text-ink outline-none transition placeholder:text-ink-soft focus:border-forest-600 data-[invalid]:border-danger"
            />
            <Text slot="description" className="block text-sm text-ink-muted">
              {t("url.help")}
            </Text>
            <FieldError className="block text-sm font-medium text-danger">{errors.url}</FieldError>
          </TextField>
        ) : null}

        {method === "llm_text" ? (
          <TextField
            value={text}
            onChange={setText}
            isRequired
            isInvalid={submitted && !!errors.text}
            validationBehavior="aria"
            className="space-y-2"
          >
            <Label className="block font-semibold text-ink">{t("text.label")}</Label>
            <TextArea
              rows={10}
              placeholder={t("text.placeholder")}
              className="w-full resize-y rounded-2xl border border-paper-3 bg-white px-4 py-4 text-base leading-relaxed text-ink outline-none transition placeholder:text-ink-soft focus:border-forest-600 data-[invalid]:border-danger"
            />
            <div className="flex flex-wrap justify-between gap-2">
              <Text slot="description" className="block text-sm text-ink-muted">
                {t("text.help")}
              </Text>
              <span className="text-sm tabular-nums text-ink-soft">{t("text.count", { count: text.trim().length })}</span>
            </div>
            <FieldError className="block text-sm font-medium text-danger">{errors.text}</FieldError>
          </TextField>
        ) : null}

        {usesAi ? (
          <div className="mt-6">
            <DevicePanel
              model={model}
              onModelChange={setModel}
              allowFallback={method === "llm_text"}
              fallback={fallback}
              onFallbackChange={setFallback}
              onSupportChange={onSupportChange}
            />
            {submitted && errors.gpu ? (
              <p role="alert" className="mt-3 text-sm font-medium text-danger">
                {errors.gpu}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Level + length */}
      <div className="grid gap-10 lg:grid-cols-2">
        <RadioGroup value={level} onChange={(v) => setLevel(v as LevelChoice)} orientation="horizontal" className="space-y-3">
          <Label className="font-display text-xl font-bold text-forest-700">{t("level.legend")}</Label>
          <Text slot="description" className="block text-sm text-ink-muted">
            {t("level.help")}
          </Text>
          <div className="flex flex-wrap gap-2">
            {(["auto", "junior", "middle", "senior"] as const).map((l) => (
              <Radio key={l} value={l} isDisabled={l === "auto" && method === "manual"} className={segment}>
                {t(`level.${l}`)}
              </Radio>
            ))}
          </div>
        </RadioGroup>
        <RadioGroup value={length} onChange={(v) => setLength(v as LengthKey)} orientation="horizontal" className="space-y-3">
          <Label className="font-display text-xl font-bold text-forest-700">{t("length.legend")}</Label>
          <div className="flex flex-wrap gap-2">
            {(["short", "standard", "long"] as const).map((l) => (
              <Radio key={l} value={l} className={segment}>
                {t(`length.${l}`)}
              </Radio>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end border-t border-paper-3 pt-8">
        <button type="submit" disabled={pending} className={pillClasses("forest", "px-7 py-4 text-base disabled:opacity-70")}>
          <PillArrow />
          <span>{t("start")}</span>
        </button>
      </div>
    </form>
  );
}
