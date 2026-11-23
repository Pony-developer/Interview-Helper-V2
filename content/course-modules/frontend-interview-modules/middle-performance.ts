import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 36–46 of the Middle list: performance. */
export const middlePerformanceQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-performance-quiz",
  title: { en: "Performance", uk: "Performance" },
  questions: [
    question(
      "perf-metrics",
      ["Which of these are standard metrics of site performance?", "Які з цього — стандартні метрики продуктивності сайту?"],
      [
        ["LCP, INP and CLS (Core Web Vitals)", "LCP, INP і CLS (Core Web Vitals)"],
        ["The number of lines in the CSS files", "Кількість рядків у CSS-файлах"],
        ["TTFB and FCP", "TTFB і FCP"],
        ["Total Blocking Time (TBT) in lab tests", "Total Blocking Time (TBT) у лабораторних тестах"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "cls",
      ["How do you improve Cumulative Layout Shift?", "Як покращити Cumulative Layout Shift?"],
      [
        ["Set `width` and `height` or `aspect-ratio` on images and video", "Задавати `width` і `height` чи `aspect-ratio` для зображень і відео"],
        ["Reserve space for ads, embeds and banners", "Резервувати місце під рекламу, вбудовані віджети й банери"],
        ["Insert new content above existing content after the page loads", "Вставляти новий вміст над наявним після завантаження сторінки"],
        ["Use `font-display` and matched fallback font metrics so web fonts don't shift the text", "Використовувати `font-display` і підібрані метрики запасного шрифту, щоб вебшрифти не зсували текст"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "critical-css",
      ["What is critical CSS?", "Що таке критичний CSS?"],
      [
        ["CSS where every rule has `!important`", "CSS, де кожне правило має `!important`"],
        ["CSS that contains errors", "CSS, що містить помилки"],
        [
          "The minimum CSS needed to render the first screen, inlined into `<head>` so the first paint doesn't wait for the full stylesheets",
          "Мінімальний CSS, потрібний для рендерингу першого екрана, вбудований у `<head>`, щоб перше відмальовування не чекало на повні таблиці стилів",
        ],
        ["The styles of the error pages", "Стилі сторінок помилок"],
      ],
      "c",
    ),
    question(
      "animation-perf",
      ["Which practices keep animations smooth?", "Які практики зберігають анімації плавними?"],
      [
        ["Animate `transform` and `opacity`", "Анімувати `transform` і `opacity`"],
        ["Use `requestAnimationFrame` for JS animations", "Використовувати `requestAnimationFrame` для JS-анімацій"],
        ["Read and write layout properties in turn inside a loop", "Почергово читати й записувати властивості layout у циклі"],
        ["Use `will-change` sparingly, for elements that are about to animate", "Обережно застосовувати `will-change` до елементів, які зараз анімуватимуться"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "image-formats-opt",
      ["Which of these are good practices for images on the web?", "Які з цього — добрі практики для зображень у вебі?"],
      [
        ["One 4000px JPEG for every screen", "Один JPEG на 4000px для всіх екранів"],
        ["AVIF or WebP for photos, SVG for icons and logos", "AVIF чи WebP для фото, SVG для іконок і логотипів"],
        ["Responsive sizes through `srcset` and `sizes`", "Адаптивні розміри через `srcset` і `sizes`"],
        ["Compression and an image CDN that resizes images on the fly", "Стиснення та CDN для зображень, що змінює розмір на льоту"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "third-party",
      ["How do you limit the performance cost of third-party scripts?", "Як зменшити вплив сторонніх скриптів на продуктивність?"],
      [
        ["Load them with `async` or `defer`, or only after user interaction (facades)", "Завантажувати їх з `async` чи `defer` або лише після дії користувача (фасади)"],
        ["Audit their size and remove the ones you don't use", "Перевіряти їхній розмір і прибирати ті, якими не користуєтеся"],
        ["Import a whole library when you need one function from it", "Імпортувати всю бібліотеку, коли з неї потрібна одна функція"],
        ["Host them yourself or `preconnect` to their origin", "Хостити їх самостійно або робити `preconnect` до їхнього origin"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "lazy-loading",
      ["How do you lazy-load images and other resources?", "Як реалізувати ліниве завантаження зображень та інших ресурсів?"],
      [
        ["Load everything at once when the page opens", "Завантажувати все одразу під час відкриття сторінки"],
        [
          "`loading=\"lazy\"` on images and iframes, `IntersectionObserver` for custom cases, and dynamic `import()` for code",
          "`loading=\"lazy\"` для зображень та iframe, `IntersectionObserver` для особливих випадків і динамічний `import()` для коду",
        ],
        ["Wrap every resource in a five-second `setTimeout`", "Обгорнути кожен ресурс у `setTimeout` на п'ять секунд"],
        ["Hide the resources with `display: none`", "Сховати ресурси через `display: none`"],
      ],
      "b",
    ),
    question(
      "prefetch-preload",
      ["What is the difference between `preload` and `prefetch`?", "Яка різниця між `preload` і `prefetch`?"],
      [
        ["It is the other way around: `prefetch` is for the current page", "Навпаки: `prefetch` для поточної сторінки"],
        ["They are the same", "Вони однакові"],
        ["`prefetch` works only for fonts", "`prefetch` працює лише для шрифтів"],
        [
          "`preload` fetches a resource the current page needs, with high priority; `prefetch` fetches one likely needed for the next navigation, with low priority",
          "`preload` завантажує ресурс, потрібний поточній сторінці, з високим пріоритетом; `prefetch` — ресурс, імовірно потрібний для наступного переходу, з низьким пріоритетом",
        ],
      ],
      "d",
    ),
    question(
      "youtube-gallery",
      ["A gallery page must show many YouTube videos. How do you keep it fast?", "Сторінка галереї має показати багато відео з YouTube. Як зберегти її швидкою?"],
      [
        [
          "Show a lightweight facade (a thumbnail with a play button) and insert the iframe only on click; lazy-load the thumbnails",
          "Показувати легкий фасад (прев'ю з кнопкою відтворення) і вставляти iframe лише після кліку; прев'ю завантажувати ліниво",
        ],
        ["Embed all the iframes at once", "Вбудувати всі iframe одразу"],
        ["Turn on autoplay for every video", "Увімкнути автовідтворення для кожного відео"],
        ["Download all the videos to your own server first", "Спершу завантажити всі відео на власний сервер"],
      ],
      "a",
    ),
    question(
      "big-table",
      ["How do you render a table with thousands of rows so that it stays fast?", "Як відрендерити таблицю на тисячі рядків, щоб вона лишалася швидкою?"],
      [
        ["Virtualize the rows, so that only the visible ones are in the DOM", "Віртуалізувати рядки, щоб у DOM були лише видимі"],
        ["Paginate, or load the data from the server in parts", "Пагінувати або завантажувати дані із сервера частинами"],
        ["Re-render the whole table on every keystroke in the filter", "Перерендерювати всю таблицю на кожне натискання клавіші у фільтрі"],
        ["Sort and filter in a Web Worker or on the server", "Сортувати й фільтрувати у Web Worker чи на сервері"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "css-loading",
      [
        "How do you load a lot of CSS so that the page becomes usable quickly, without layout shifts?",
        "Як завантажити багато CSS, щоб сторінка швидко стала придатною до взаємодії і без зсувів макета?",
      ],
      [
        ["Load all the CSS through JS after the page loads", "Завантажувати весь CSS через JS після завантаження сторінки"],
        ["Chain the files with `@import`", "Підключати файли ланцюжком `@import`"],
        [
          "Inline the critical CSS, load the rest with `<link rel=\"preload\" as=\"style\">` or split it per route, and reserve sizes so late styles don't move the content",
          "Вбудувати критичний CSS, решту завантажувати через `<link rel=\"preload\" as=\"style\">` або розбити за маршрутами, і резервувати розміри, щоб пізні стилі не зсували вміст",
        ],
        ["Put all the CSS at the end of `<body>`", "Розмістити весь CSS у кінці `<body>`"],
      ],
      "c",
    ),
  ],
};
