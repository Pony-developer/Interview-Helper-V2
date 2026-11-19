import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "html-dialog-modal",
    ["html", { slug: "web-accessibility", weight: 0.5 }],
    3,
    75,
    ["Native modal dialogs", "Нативні модальні діалоги"],
    ["What does `dialog.showModal()` give you that `dialog.show()` does not? Select all that apply.", "Що дає `dialog.showModal()`, чого не дає `dialog.show()`? Оберіть усі правильні."],
    [
      ["The rest of the page becomes inert (not clickable or focusable)", "Решта сторінки стає інертною (на неї не можна клікнути чи сфокусуватися)"],
      ["The dialog is placed in the top layer, above any `z-index`", "Діалог розміщується у верхньому шарі, над будь-яким `z-index`"],
      ["Pressing Escape closes the dialog", "Натискання Escape закриває діалог"],
      ["The dialog's form is submitted automatically when it closes", "Форма діалогу автоматично надсилається під час закриття"],
    ],
    "abc",
    [
      "`showModal()` opens the dialog in the top layer with a `::backdrop`, makes everything else inert and closes it on Escape (firing `cancel`). `show()` opens a non-modal dialog in normal flow, without any of that. Forms with `method=\"dialog\"` close the dialog on submit; nothing is submitted automatically.",
      "`showModal()` відкриває діалог у верхньому шарі з `::backdrop`, робить решту сторінки інертною й закриває його за Escape (з подією `cancel`). `show()` відкриває немодальний діалог у звичайному потоці без усього цього. Форми з `method=\"dialog\"` закривають діалог під час надсилання; нічого не надсилається автоматично.",
    ],
  ),
  quiz(
    "html-preload-lcp",
    ["html", { slug: "web-performance", weight: 0.5 }],
    4,
    90,
    ["A late hero image", "Пізнє головне зображення"],
    ["The hero image is your Largest Contentful Paint element. It is set as a CSS `background-image`, so the browser discovers it only after the CSS is downloaded and parsed. What is the best fix?", "Головне зображення — ваш елемент Largest Contentful Paint. Воно задане як CSS `background-image`, тож браузер дізнається про нього лише після завантаження й розбору CSS. Яке найкраще виправлення?"],
    [
      ["Use an `<img>` with `fetchpriority=\"high\"` (or `<link rel=\"preload\" as=\"image\">` in the head)", "Використати `<img>` з `fetchpriority=\"high\"` (або `<link rel=\"preload\" as=\"image\">` у head)"],
      ["Add `loading=\"lazy\"` to the hero", "Додати `loading=\"lazy\"` до головного зображення"],
      ["Use `<link rel=\"prefetch\">` for the image", "Використати `<link rel=\"prefetch\">` для зображення"],
      ["Move the stylesheet to the end of `<body>`", "Перенести таблицю стилів у кінець `<body>`"],
    ],
    "a",
    [
      "An `<img>` in the HTML is found by the preload scanner immediately, and `fetchpriority=\"high\"` moves it ahead of other images. If it must stay a background, `rel=\"preload\"` makes it discoverable early. Lazy-loading the LCP image delays it further, `prefetch` is a low-priority hint for future navigations, and moving the CSS causes unstyled flashes.",
      "`<img>` у HTML одразу знаходить сканер попереднього завантаження, а `fetchpriority=\"high\"` ставить його попереду інших зображень. Якщо зображення мусить лишатися фоном, `rel=\"preload\"` робить його видимим браузеру рано. Ліниве завантаження LCP-зображення ще більше його затримає, `prefetch` — низькопріоритетна підказка для майбутніх переходів, а перенесення CSS спричинить спалахи нестилізованого вмісту.",
    ],
  ),
  quiz(
    "html-srcset-sizes",
    ["html", { slug: "web-performance", weight: 0.5 }],
    5,
    120,
    ["Responsive image selection", "Вибір адаптивного зображення"],
    ["The viewport is 1000 CSS pixels wide and the device pixel ratio is 2. Which file will a typical browser download?", "Ширина вікна — 1000 CSS-пікселів, щільність пікселів пристрою — 2. Який файл завантажить типовий браузер?"],
    [
      ["`hero-480.jpg`", "`hero-480.jpg`"],
      ["`hero-960.jpg`", "`hero-960.jpg`"],
      ["`hero-1440.jpg`", "`hero-1440.jpg`"],
      ["All three, then it picks one", "Усі три, а потім вибере один"],
    ],
    "c",
    [
      "`sizes` says the image is 50vw wide on this viewport, so the slot is 500 CSS px. At DPR 2 the browser needs about 1000 device pixels and picks the smallest candidate that covers it: `hero-960.jpg` is too small, so it takes `hero-1440.jpg`. Without `sizes`, the browser would assume 100vw and need 2000 pixels. Only one file is downloaded.",
      "`sizes` каже, що на цьому вікні зображення має ширину 50vw, тобто слот — 500 CSS-пікселів. За DPR 2 браузеру потрібно близько 1000 фізичних пікселів, і він бере найменшого кандидата, що їх покриває: `hero-960.jpg` замалий, тож буде `hero-1440.jpg`. Без `sizes` браузер вважав би ширину 100vw і потребував би 2000 пікселів. Завантажується лише один файл.",
    ],
    {
      code: '<img\n  src="hero-960.jpg"\n  srcset="hero-480.jpg 480w, hero-960.jpg 960w, hero-1440.jpg 1440w"\n  sizes="(min-width: 800px) 50vw, 100vw"\n  alt="Team at work"\n/>',
      codeLanguage: "html",
    },
  ),
]);
