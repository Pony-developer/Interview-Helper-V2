"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PillArrow, pillClasses } from "@/components/ui/PillLink";
import { Link } from "@/i18n/navigation";
import { CodeGroundVisual, JobScanVisual, OreVeinVisual } from "./HeroVisuals";

const SLIDES = [
  { key: "one", href: "/practice", visual: <OreVeinVisual /> },
  { key: "two", href: "/practice?method=url", visual: <JobScanVisual /> },
  { key: "three", href: "/#how-it-works", visual: <CodeGroundVisual /> },
] as const satisfies readonly { key: string; href: string; visual: ReactNode }[];

const INTERVAL_MS = 8000;

export function HeroCarousel() {
  const t = useTranslations("landing.hero");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announce, setAnnounce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const rotating = playing && !hovered && !focused && !reducedMotion;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [rotating]);

  const go = useCallback((next: number) => {
    setAnnounce(true);
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("label")}
      className="grain relative isolate overflow-hidden bg-forest-950 text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      {/* Atmosphere: deep forest gradient with a gold glow that follows the active slide */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 transition-[background-position] duration-[1600ms] ease-out"
        style={{
          backgroundImage:
            "radial-gradient(60rem 40rem at var(--gx) 30%, rgb(201 162 39 / 0.22), transparent 60%), radial-gradient(50rem 50rem at 10% 110%, rgb(17 112 79 / 0.55), transparent 60%), linear-gradient(160deg, #073829 0%, #04241c 60%, #031a14 100%)",
          ["--gx" as string]: `${70 + index * 8}%`,
        }}
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-forest-950 to-transparent" />

      <h1 className="sr-only">{t("h1")}</h1>
      <div className="relative z-[2] mx-auto grid min-h-[min(88vh,52rem)] max-w-7xl px-5 pb-28 pt-14 sm:px-8 lg:pt-20">
        {SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={t("slide", { current: i + 1, total: SLIDES.length })}
              aria-hidden={!active}
              inert={!active}
              className={`col-start-1 row-start-1 grid items-center gap-12 transition-opacity duration-700 lg:grid-cols-[1.08fr_1fr] ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="max-w-2xl">
                <p
                  className={`mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 ${active ? "animate-rise" : ""}`}
                >
                  <span aria-hidden className="h-px w-10 bg-gold-500" />
                  {t(`slides.${slide.key}.eyebrow`)}
                </p>
                <h2
                  className={`font-display text-[2.35rem] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.35rem] ${active ? "animate-rise [animation-delay:90ms]" : ""}`}
                >
                  {t(`slides.${slide.key}.title`)}
                </h2>
                <p
                  className={`mt-7 max-w-xl text-lg leading-relaxed text-forest-100 sm:text-xl ${active ? "animate-rise [animation-delay:180ms]" : ""}`}
                >
                  {t(`slides.${slide.key}.body`)}
                </p>
                <div className={`mt-10 flex flex-wrap gap-3 ${active ? "animate-rise [animation-delay:270ms]" : ""}`}>
                  <Link href={slide.href} className={pillClasses("gold")}>
                    <PillArrow />
                    <span>{t(`slides.${slide.key}.cta`)}</span>
                  </Link>
                </div>
              </div>
              <div className={`relative hidden h-[30rem] items-center lg:flex ${active ? "animate-fade" : ""}`}>
                {active ? slide.visual : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls: pause/play, previous/next, slide picker (reference: dots at the bottom) */}
      <div className="absolute inset-x-0 bottom-8 z-[3] mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t("pause") : t("play")}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-white transition-colors hover:border-gold-300 hover:text-gold-300"
          >
            {playing ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t("prev")}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-white transition-colors hover:border-gold-300 hover:text-gold-300"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t("next")}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/30 text-white transition-colors hover:border-gold-300 hover:text-gold-300"
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <ul className="flex items-center gap-1">
          {SLIDES.map((slide, i) => (
            <li key={slide.key}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={t("goTo", { index: i + 1 })}
                aria-current={i === index ? "true" : undefined}
                className="group grid h-10 w-10 place-items-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-gold-500" : "w-2 bg-white/50 group-hover:bg-white"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p aria-live={announce && !rotating ? "polite" : "off"} className="sr-only">
        {t("slide", { current: index + 1, total: SLIDES.length })}: {t(`slides.${SLIDES[index].key}.title`)}
      </p>
    </section>
  );
}
