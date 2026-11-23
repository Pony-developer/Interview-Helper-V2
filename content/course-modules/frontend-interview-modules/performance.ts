import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 61–67 of the list: web performance. */
export const performanceQuiz: SlideDef = {
  kind: "quiz",
  slug: "performance-quiz",
  title: { en: "Web performance", uk: "Web Performance" },
  questions: [
    question(
      "core-web-vitals",
      ["Which three metrics are the current Core Web Vitals?", "Які три метрики зараз входять до Core Web Vitals?"],
      [
        ["FCP, TTI, FID", "FCP, TTI, FID"],
        ["TTFB, FPS, DOM size", "TTFB, FPS, розмір DOM"],
        [
          "LCP (loading), INP (responsiveness), CLS (visual stability)",
          "LCP (завантаження), INP (чуйність), CLS (візуальна стабільність)",
        ],
        ["LCP, FID, TBT", "LCP, FID, TBT"],
      ],
      "c",
    ),
    question(
      "lab-vs-field",
      ["How do lab and field performance measurements differ?", "Чим відрізняються лабораторні та польові заміри перформансу?"],
      [
        [
          "Lab data (Lighthouse, DevTools) comes from a controlled, repeatable run, good for debugging; field data (CrUX, RUM) is collected from real users on real devices and networks",
          "Лабораторні дані (Lighthouse, DevTools) отримують у контрольованому відтворюваному запуску, зручному для налагодження; польові (CrUX, RUM) збирають від реальних користувачів на реальних пристроях і мережах",
        ],
        ["It is the other way around", "Навпаки"],
        ["They always give the same numbers", "Вони завжди дають однакові цифри"],
        ["Field data exists only for desktop", "Польові дані бувають лише для десктопа"],
      ],
      "a",
    ),
    question(
      "image-formats",
      ["Which format is usually the best choice for a photo on a modern site?", "Який формат зазвичай найкращий для фотографії на сучасному сайті?"],
      [
        ["PNG", "PNG"],
        ["BMP", "BMP"],
        ["GIF", "GIF"],
        ["AVIF or WebP, with a fallback where needed", "AVIF або WebP, із fallback там, де потрібно"],
      ],
      "d",
    ),
    question(
      "slow-mobile",
      ["Your site loads slowly on mobile. What is a sensible first step?", "Сайт повільно завантажується на мобільному. Який розумний перший крок?"],
      [
        ["Rewrite the whole frontend in another framework", "Переписати весь фронтенд на іншому фреймворку"],
        [
          "Measure: Lighthouse or PageSpeed Insights with mobile throttling, the DevTools Network and Performance panels, and CrUX field data, to find which metric and which resources are slow",
          "Виміряти: Lighthouse чи PageSpeed Insights з мобільним обмеженням швидкості, панелі Network і Performance у DevTools та польові дані CrUX, щоб знайти, яка метрика і які ресурси повільні",
        ],
        ["Buy a more powerful server right away", "Одразу купити потужніший сервер"],
        ["Remove all the images", "Прибрати всі зображення"],
      ],
      "b",
    ),
    question(
      "perf-tools",
      ["Which tools help analyze and improve page load speed?", "Які інструменти допомагають аналізувати й покращувати швидкість завантаження сторінки?"],
      [
        ["Lighthouse and PageSpeed Insights", "Lighthouse і PageSpeed Insights"],
        ["Chrome DevTools: Network, Performance and Coverage", "Chrome DevTools: Network, Performance і Coverage"],
        ["WebPageTest", "WebPageTest"],
        ["The W3C HTML validator, which measures speed", "W3C-валідатор HTML, який вимірює швидкість"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "image-optimization",
      ["Which techniques optimize images on a page?", "Які прийоми оптимізують зображення на сторінці?"],
      [
        ["`loading=\"lazy\"` for images below the fold", "`loading=\"lazy\"` для зображень нижче першого екрана"],
        ["`srcset`/`sizes` and `<picture>` to serve the right size and format", "`srcset`/`sizes` і `<picture>`, щоб віддавати потрібний розмір і формат"],
        ["Setting `width` and `height` to avoid layout shifts", "Задавати `width` і `height`, щоб уникнути зсувів макета"],
        ["Lazy-loading the hero image that is the LCP element", "Ліниво завантажувати головне зображення першого екрана, яке є елементом LCP"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "page-optimization",
      ["Which of these are valid page optimization techniques?", "Які з цих методів оптимізації сторінки правильні?"],
      [
        ["Embedding every image into the HTML as base64", "Вбудувати всі зображення в HTML як base64"],
        ["Minifying and compressing assets (gzip, Brotli), long-lived cache headers and a CDN", "Мініфікація та стиснення ресурсів (gzip, Brotli), довготривалі заголовки кешування та CDN"],
        ["`defer` or `async` scripts, code splitting and critical CSS", "Скрипти з `defer` чи `async`, розбиття коду та критичний CSS"],
        ["`preload` and `preconnect` for critical resources", "`preload` і `preconnect` для критичних ресурсів"],
      ],
      ["b", "c", "d"],
    ),
  ],
};
