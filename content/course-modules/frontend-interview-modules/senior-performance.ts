import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 36–40 of the Senior list: performance. */
export const seniorPerformanceQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-performance-quiz",
  title: { en: "Performance", uk: "Performance" },
  questions: [
    question(
      "font-optimization",
      ["Which techniques optimize a heavy decorative web font?", "Які прийоми оптимізують важкий декоративний вебшрифт?"],
      [
        ["Subset it to the characters actually used and serve it as WOFF2", "Залишити в ньому лише використовувані символи (subsetting) і віддавати у WOFF2"],
        ["`font-display: swap` (or `optional`) and `<link rel=\"preload\">` for the critical file", "`font-display: swap` (чи `optional`) і `<link rel=\"preload\">` для критичного файлу"],
        ["Load every weight and style just in case", "Завантажувати всі накреслення й стилі про всяк випадок"],
        [
          "Use a variable font or fewer weights, and tune the fallback font metrics (`size-adjust`) to avoid layout shifts",
          "Використати змінний шрифт або менше накреслень і підлаштувати метрики запасного шрифту (`size-adjust`), щоб уникнути зсувів макета",
        ],
      ],
      ["a", "b", "d"],
    ),
    question(
      "legacy-16h",
      [
        "You have 16 hours to speed up the frontend of an inherited PHP project. What is the best plan?",
        "У вас є 16 годин, щоб пришвидшити фронтенд успадкованого PHP-проєкту. Який план найкращий?",
      ],
      [
        ["Rewrite the frontend in React", "Переписати фронтенд на React"],
        [
          "Measure first (Lighthouse, WebPageTest, field data), then pick the cheapest high-impact fixes: compression and cache headers, image optimization and lazy loading, deferring scripts, removing unused third-party code",
          "Спершу виміряти (Lighthouse, WebPageTest, польові дані), а потім узяти найдешевші виправлення з найбільшим ефектом: стиснення й заголовки кешування, оптимізація та ліниве завантаження зображень, відкладені скрипти, прибирання непотрібного стороннього коду",
        ],
        ["Upgrade the PHP framework to the latest version", "Оновити PHP-фреймворк до останньої версії"],
        ["Spend all 16 hours on one micro-optimization in the CSS", "Витратити всі 16 годин на одну мікрооптимізацію в CSS"],
      ],
      "b",
    ),
    question(
      "http1-vs-http2",
      ["How does HTTP/2 change the way you prepare frontend assets compared with HTTP/1.1?", "Як HTTP/2 змінює підготовку фронтенд-асетів порівняно з HTTP/1.1?"],
      [
        ["HTTP/2 needs everything in one single file", "HTTP/2 потребує, щоб усе було в одному файлі"],
        ["Nothing changes", "Нічого не змінюється"],
        [
          "With HTTP/1.1 you bundled aggressively and used sprites and domain sharding to save connections; HTTP/2 multiplexes many requests over one connection, so smaller cacheable chunks are fine and sharding becomes harmful",
          "За HTTP/1.1 агресивно об'єднували файли, використовували спрайти й шардинг доменів, щоб заощадити з'єднання; HTTP/2 мультиплексує багато запитів в одному з'єднанні, тож дрібніші чанки, що добре кешуються, — це нормально, а шардинг стає шкідливим",
        ],
        ["HTTP/2 forbids compressing files", "HTTP/2 забороняє стискати файли"],
      ],
      "c",
    ),
    question(
      "perf-budget",
      ["What is a performance budget?", "Що таке бюджет продуктивності (performance budget)?"],
      [
        ["The money spent on servers", "Гроші, витрачені на сервери"],
        ["The maximum number of hours for optimization", "Максимальна кількість годин на оптимізацію"],
        ["A list of performance tools", "Перелік інструментів для продуктивності"],
        [
          "Agreed limits on metrics (for example LCP under 2.5 s, JavaScript under a set size) checked automatically in CI, so regressions are caught before release",
          "Узгоджені межі для метрик (наприклад, LCP менше 2,5 с, JavaScript не більше заданого обсягу), які автоматично перевіряються в CI, щоб ловити регресії до релізу",
        ],
      ],
      "d",
    ),
    question(
      "reflow-repaint",
      ["Which statement about reflow (layout), repaint and composite is correct?", "Яке твердження про reflow (layout), repaint і composite правильне?"],
      [
        [
          "Changing `width` triggers layout, then paint and composite; changing `color` skips layout but repaints; changing `transform` or `opacity` can be handled in composite alone, which is the cheapest",
          "Зміна `width` запускає layout, потім paint і composite; зміна `color` пропускає layout, але перемальовує; зміну `transform` чи `opacity` можна обробити лише на етапі composite, і це найдешевше",
        ],
        ["`transform` triggers a full reflow of the page", "`transform` запускає повний reflow сторінки"],
        ["All changes cost the same", "Усі зміни коштують однаково"],
        ["Changing `color` triggers layout", "Зміна `color` запускає layout"],
      ],
      "a",
    ),
  ],
};
