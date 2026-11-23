import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 10–22 of the Middle list: HTML/CSS, part 1. */
export const middleHtmlCssQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-html-css-quiz",
  title: { en: "HTML/CSS, part 1", uk: "HTML/CSS, частина 1" },
  questions: [
    question(
      "microdata",
      ["What is structured data markup (microdata)?", "Що таке мікророзмітка?"],
      [
        [
          "Machine-readable annotations (schema.org vocabulary in JSON-LD, Microdata or RDFa) that tell search engines what the content is, such as a product with a price and rating, enabling rich results",
          "Машинозчитувані анотації (словник schema.org у форматі JSON-LD, Microdata чи RDFa), які кажуть пошуковим системам, що це за вміст, як-от товар із ціною й рейтингом, і дають змогу показувати розширені результати",
        ],
        ["Very small fonts for footnotes", "Дуже дрібні шрифти для приміток"],
        ["Minified HTML", "Мініфікований HTML"],
        ["CSS for mobile devices", "CSS для мобільних пристроїв"],
      ],
      "a",
    ),
    question(
      "seo",
      ["What should a developer take care of for good SEO?", "На що розробнику варто зважати для хорошого SEO?"],
      [
        ["Semantic markup with one clear `<h1>` and a logical heading hierarchy", "Семантична розмітка з одним чітким `<h1>` і логічною ієрархією заголовків"],
        ["A unique `<title>` and meta description, meaningful URLs, `alt` on images", "Унікальні `<title>` і meta description, змістовні URL, `alt` на зображеннях"],
        ["Showing the important content only after a click, through client-side JS", "Показувати важливий вміст лише після кліку, через клієнтський JS"],
        ["Fast loading (Core Web Vitals), a sitemap and correct canonical links", "Швидке завантаження (Core Web Vitals), sitemap і правильні canonical-посилання"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "icons",
      ["Which approach to icons is common today, and why?", "Який підхід до іконок поширений сьогодні і чому?"],
      [
        ["A separate PNG for every size", "Окремий PNG для кожного розміру"],
        ["Animated GIFs", "Анімовані GIF"],
        [
          "An SVG sprite (`<use href=\"sprite.svg#cart\">`) or inline SVG components: sharp at any size, colored with `currentColor`, and easy to make accessible; icon fonts are less reliable and harder to make accessible",
          "SVG-спрайт (`<use href=\"sprite.svg#cart\">`) або inline SVG-компоненти: чіткі за будь-якого розміру, фарбуються через `currentColor` і легко робляться доступними; іконкові шрифти менш надійні й гірші для доступності",
        ],
        ["Icon fonts, because they have no drawbacks", "Іконкові шрифти, бо вони не мають недоліків"],
      ],
      "c",
    ),
    question(
      "css-optimization",
      ["How can you optimize CSS for performance?", "Як оптимізувати CSS для продуктивності?"],
      [
        ["Chain stylesheets with `@import` inside CSS files", "Підключати таблиці стилів ланцюжком `@import` усередині CSS-файлів"],
        ["Remove unused CSS and minify the rest", "Прибрати невикористаний CSS, а решту мініфікувати"],
        ["Inline the critical CSS and load the rest without blocking rendering", "Вбудувати критичний CSS, а решту завантажувати без блокування рендерингу"],
        ["Avoid animating layout properties; prefer `transform` and `opacity`", "Не анімувати властивості, що впливають на layout; натомість `transform` і `opacity`"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "modern-css",
      ["Which of these are modern CSS features?", "Що з цього — можливості сучасного CSS?"],
      [
        ["Container queries (`@container`)", "Container queries (`@container`)"],
        ["The `:has()` selector", "Селектор `:has()`"],
        ["Native nesting and cascade layers (`@layer`)", "Нативна вкладеність і каскадні шари (`@layer`)"],
        ["The `<font>` tag", "Тег `<font>`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "scss-vs-custom-props",
      ["How do SCSS variables differ from CSS custom properties?", "Чим змінні SCSS відрізняються від CSS custom properties?"],
      [
        ["SCSS variables live in the browser, custom properties are gone after the build", "Змінні SCSS живуть у браузері, а custom properties зникають після збирання"],
        ["There is no difference", "Різниці немає"],
        ["Custom properties work only together with Sass", "Custom properties працюють лише разом із Sass"],
        [
          "SCSS variables are replaced at build time and don't exist in the browser; custom properties live at runtime: they cascade and inherit, and can change in media queries or from JS, for example for themes",
          "Змінні SCSS підставляються під час збирання й у браузері не існують; custom properties живуть під час виконання: каскадуються, успадковуються й можуть змінюватися в медіазапитах чи з JS, наприклад для тем",
        ],
      ],
      "d",
    ),
    question(
      "style-conflicts",
      ["How can a team prevent style conflicts between developers?", "Як команді запобігати конфліктам стилів між розробниками?"],
      [
        ["A shared methodology such as BEM, or scoped styles such as CSS Modules", "Спільна методологія, як-от БЕМ, або ізольовані стилі, як-от CSS Modules"],
        ["Stylelint and code review", "Stylelint і code review"],
        ["Each developer adds `!important` to their own rules", "Кожен розробник додає `!important` до своїх правил"],
        ["Design tokens and a shared component library", "Дизайн-токени та спільна бібліотека компонентів"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "transition-animation",
      ["What is the difference between `transition` and `animation`?", "Яка різниця між `transition` і `animation`?"],
      [
        ["`transition` works only with colors", "`transition` працює лише з кольорами"],
        [
          "`transition` animates between two states when a property changes (for example on `:hover`); `animation` runs `@keyframes` with many steps, can repeat and starts on its own",
          "`transition` анімує перехід між двома станами, коли змінюється властивість (наприклад, на `:hover`); `animation` програє `@keyframes` із багатьма кроками, може повторюватися й запускається сама",
        ],
        ["It is the other way around", "Навпаки"],
        ["They are the same", "Вони однакові"],
      ],
      "b",
    ),
    question(
      "scrollbar",
      ["What is the standard way to style a scrollbar?", "Який стандартний спосіб стилізувати скролбар?"],
      [
        [
          "The `scrollbar-color` and `scrollbar-width` properties, plus the `::-webkit-scrollbar` pseudo-elements for older WebKit-based browsers",
          "Властивості `scrollbar-color` і `scrollbar-width`, а також псевдоелементи `::-webkit-scrollbar` для старіших браузерів на WebKit",
        ],
        ["It cannot be styled at all", "Його взагалі не можна стилізувати"],
        ["Only with a JavaScript library", "Лише за допомогою JavaScript-бібліотеки"],
        ["`overflow: styled`", "`overflow: styled`"],
      ],
      "a",
    ),
    question(
      "style-isolation",
      ["Which of these are ways to isolate styles?", "Які з цього — способи ізоляції стилів?"],
      [
        ["CSS Modules with generated class names", "CSS Modules зі згенерованими назвами класів"],
        ["Global type selectors like `div { … }`", "Глобальні селектори типу, як-от `div { … }`"],
        ["Shadow DOM in web components", "Shadow DOM у вебкомпонентах"],
        ["Scoped styles in Vue or Svelte, and CSS-in-JS", "Scoped-стилі у Vue чи Svelte та CSS-in-JS"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "logical-properties",
      ["Why use CSS logical properties such as `margin-inline-start`?", "Навіщо CSS logical properties, як-от `margin-inline-start`?"],
      [
        ["They make the page render faster", "Вони пришвидшують рендеринг сторінки"],
        ["They are required for Grid to work", "Без них не працює Grid"],
        [
          "They follow the writing direction, so the same CSS works for left-to-right and right-to-left languages, and for vertical text",
          "Вони залежать від напрямку письма, тож той самий CSS працює для мов зліва направо й справа наліво, а також для вертикального тексту",
        ],
        ["They work only in print styles", "Вони працюють лише в стилях для друку"],
      ],
      "c",
    ),
    question(
      "grid",
      [
        "What does `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` do?",
        "Що робить `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`?",
      ],
      [
        ["Creates exactly 200 columns", "Створює рівно 200 колонок"],
        ["Creates one column 200px wide", "Створює одну колонку завширшки 200px"],
        ["Nothing: the value is invalid", "Нічого: значення невалідне"],
        [
          "Creates as many columns at least 200px wide as fit in the container, and stretches them to fill the row",
          "Створює стільки колонок завширшки щонайменше 200px, скільки вміщується в контейнер, і розтягує їх на весь ряд",
        ],
      ],
      "d",
    ),
    question(
      "clamp",
      ["What does `font-size: clamp(1rem, 2.5vw, 2rem)` mean?", "Що означає `font-size: clamp(1rem, 2.5vw, 2rem)`?"],
      [
        ["The size follows `2.5vw` but never goes below `1rem` or above `2rem`", "Розмір дорівнює `2.5vw`, але ніколи не менший за `1rem` і не більший за `2rem`"],
        ["The browser picks one of the three values at random", "Браузер випадково обирає одне з трьох значень"],
        ["The size is always `2rem`", "Розмір завжди `2rem`"],
        ["The average of the three values", "Середнє з трьох значень"],
      ],
      "a",
    ),
  ],
};

/** Questions 23–35 of the Middle list: HTML/CSS, part 2. */
export const middleHtmlCss2Quiz: SlideDef = {
  kind: "quiz",
  slug: "middle-html-css-2-quiz",
  title: { en: "HTML/CSS, part 2", uk: "HTML/CSS, частина 2" },
  questions: [
    question(
      "print-styles",
      ["How do you optimize styles for printing?", "Як оптимізувати стилі для друку?"],
      [
        ["Printing requires a separate version of the site", "Для друку потрібна окрема версія сайту"],
        ["`@media print { … }` that hides navigation, ads and buttons", "`@media print { … }`, що ховає навігацію, рекламу й кнопки"],
        ["Black text on white, and units like `pt` or `cm`", "Чорний текст на білому та одиниці на кшталт `pt` чи `cm`"],
        ["`break-inside: avoid` and `@page` for margins", "`break-inside: avoid` і `@page` для полів"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "css-frameworks",
      ["What is a typical trade-off of CSS frameworks like Bootstrap or Tailwind?", "Який типовий компроміс CSS-фреймворків, як-от Bootstrap чи Tailwind?"],
      [
        ["They have no downsides", "Вони не мають недоліків"],
        [
          "A fast start and consistency, at the cost of a generic look or verbose markup, extra size if unused styles aren't removed, and dependence on the framework",
          "Швидкий старт і узгодженість ціною шаблонного вигляду чи громіздкої розмітки, зайвого обсягу, якщо не прибрати невикористані стилі, і залежності від фреймворку",
        ],
        ["They work only together with React", "Вони працюють лише разом із React"],
        ["They are always slower than hand-written CSS", "Вони завжди повільніші за написаний вручну CSS"],
      ],
      "b",
    ),
    question(
      "fluid-layouts",
      ["Which techniques help build fluid and adaptive layouts for different screens?", "Які прийоми допомагають будувати гумові й адаптивні макети під різні екрани?"],
      [
        ["Mobile-first styles with breakpoints chosen by the content, not by specific devices", "Стилі mobile-first із breakpoints, вибраними за вмістом, а не під конкретні пристрої"],
        ["Fluid units, `clamp()`, `minmax()` and container queries", "Гнучкі одиниці, `clamp()`, `minmax()` і container queries"],
        ["Responsive images with `srcset` and `sizes`", "Адаптивні зображення з `srcset` і `sizes`"],
        ["Designing for the width of a single phone model", "Верстати під ширину однієї моделі телефона"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "large-css",
      ["How are styles usually organized in a large project?", "Як зазвичай організовують стилі у великому проєкті?"],
      [
        ["One file of 10,000 lines that everyone edits", "Один файл на 10 000 рядків, який редагують усі"],
        ["Inline styles on every element", "Inline-стилі на кожному елементі"],
        ["`!important` on every rule, so that the order doesn't matter", "`!important` на кожному правилі, щоб порядок не мав значення"],
        [
          "Component-scoped styles (CSS Modules, BEM or utility classes), design tokens in custom properties, a small global layer for resets and typography, and `@layer` to control the order",
          "Стилі на рівні компонентів (CSS Modules, БЕМ чи утилітарні класи), дизайн-токени в custom properties, невеликий глобальний шар для скидань і типографіки та `@layer` для контролю порядку",
        ],
      ],
      "d",
    ),
    question(
      "preprocessor-choice",
      ["Why is a CSS preprocessor less essential today than it used to be?", "Чому CSS-препроцесор сьогодні менш обов'язковий, ніж раніше?"],
      [
        ["Preprocessors are now built into browsers", "Препроцесори тепер вбудовані в браузери"],
        ["They never had any advantages", "Вони ніколи не мали переваг"],
        [
          "Modern CSS has variables, nesting, `@layer` and color functions natively, so many projects use plain CSS with PostCSS; Sass still helps with mixins, loops and large existing codebases",
          "Сучасний CSS нативно має змінні, вкладеність, `@layer` і колірні функції, тож багато проєктів пишуть на чистому CSS із PostCSS; Sass досі корисний для міксинів, циклів і великих наявних кодових баз",
        ],
        ["Because they work only with React", "Бо вони працюють лише з React"],
      ],
      "c",
    ),
    question(
      "component-css",
      ["Which approach makes CSS components reusable and easy to modify?", "Який підхід робить CSS-компоненти повторно використовуваними й легкими для змін?"],
      [
        [
          "Each component owns its styles, exposes variants through modifiers or props, and takes theme values from custom properties instead of hard-coded colors",
          "Кожен компонент має власні стилі, надає варіанти через модифікатори чи пропси й бере значення теми з custom properties, а не з жорстко прописаних кольорів",
        ],
        ["Styling a component by where it sits on the page, like `.sidebar .card`", "Стилізувати компонент за його місцем на сторінці, як-от `.sidebar .card`"],
        ["Copying the styles into every place that needs them", "Копіювати стилі в кожне місце, де вони потрібні"],
        ["Styling components by `id`", "Стилізувати компоненти через `id`"],
      ],
      "a",
    ),
    question(
      "semantics-a11y",
      ["How does semantic markup affect accessibility?", "Як семантична верстка впливає на доступність?"],
      [
        ["It has no effect", "Ніяк не впливає"],
        ["It only changes how the page looks", "Вона змінює лише вигляд сторінки"],
        ["It only matters for SEO", "Вона важлива лише для SEO"],
        [
          "Screen readers rely on it: landmarks (`<nav>`, `<main>`), headings and lists let users jump around the page, and native controls are focusable and announced correctly",
          "На неї спираються скринрідери: орієнтири (`<nav>`, `<main>`), заголовки й списки дають змогу переміщатися сторінкою, а нативні елементи керування отримують фокус і правильно озвучуються",
        ],
      ],
      "d",
    ),
    question(
      "doctype-effect",
      ["What happens if a page has no doctype?", "Що станеться, якщо на сторінці немає doctype?"],
      [
        ["Nothing changes", "Нічого не зміниться"],
        [
          "The browser renders it in quirks mode, emulating old browser bugs: for example, a different box model in some cases and odd table and line-height behavior",
          "Браузер рендерить її в режимі сумісності (quirks mode), відтворюючи давні баги браузерів: наприклад, у деяких випадках іншу модель коробки й дивну поведінку таблиць і висоти рядка",
        ],
        ["The page does not load", "Сторінка не завантажиться"],
        ["The page is parsed as XML", "Сторінка розбирається як XML"],
      ],
      "b",
    ),
    question(
      "preprocessors-list",
      ["Which of these are CSS preprocessors?", "Що з цього — CSS-препроцесори?"],
      [
        ["Less", "Less"],
        ["Babel", "Babel"],
        ["Sass (SCSS)", "Sass (SCSS)"],
        ["Stylus", "Stylus"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "download-link",
      ["How do you make a link that downloads a file?", "Як зробити посилання, що завантажує файл?"],
      [
        ["`<a href=\"/files/report.pdf\" target=\"_download\">`", "`<a href=\"/files/report.pdf\" target=\"_download\">`"],
        [
          "`<a href=\"/files/report.pdf\" download>`; `download=\"name.pdf\"` sets the file name (for same-origin files)",
          "`<a href=\"/files/report.pdf\" download>`; `download=\"name.pdf\"` задає назву файлу (для файлів з того самого origin)",
        ],
        ["`<button download>`", "`<button download>`"],
        ["It is impossible without JavaScript", "Без JavaScript це неможливо"],
      ],
      "b",
    ),
    question(
      "translate-vs-absolute",
      [
        "Why is `transform: translate()` sometimes better than moving an element with `position: absolute` and `top`/`left`?",
        "Чому `transform: translate()` іноді кращий, ніж переміщення елемента через `position: absolute` і `top`/`left`?",
      ],
      [
        ["It removes the element from the DOM", "Він прибирає елемент із DOM"],
        ["There is no difference", "Різниці немає"],
        [
          "It doesn't trigger layout, only compositing, so animations are smoother, and the element keeps its place in the flow",
          "Він не запускає перерахунок layout, лише композитинг, тож анімації плавніші, а елемент зберігає своє місце в потоці",
        ],
        ["It changes the `z-index`", "Він змінює `z-index`"],
      ],
      "c",
    ),
    question(
      "flex-vs-grid",
      ["What is the main difference between Flexbox and Grid?", "Яка головна відмінність між Flexbox і Grid?"],
      [
        [
          "Flexbox lays items out along one axis and sizes them from their content; Grid defines rows and columns on the container and places items in two dimensions",
          "Flexbox розкладає елементи вздовж однієї осі й визначає розміри від вмісту; Grid задає рядки й колонки на контейнері та розміщує елементи у двох вимірах",
        ],
        ["It is the other way around", "Навпаки"],
        ["Grid is deprecated", "Grid застарів"],
        ["Flexbox works only with text", "Flexbox працює лише з текстом"],
      ],
      "a",
    ),
    question(
      "responsive-duplication",
      [
        "What is the main pitfall of duplicating HTML for the mobile and desktop versions and hiding one with CSS?",
        "Який головний підводний камінь дублювання HTML для мобільної й десктопної версій із приховуванням однієї через CSS?",
      ],
      [
        ["There are no pitfalls", "Підводних каменів немає"],
        ["The browser crashes", "Браузер падає"],
        ["CSS cannot hide elements", "CSS не вміє ховати елементи"],
        [
          "Both copies stay in the DOM: more weight, duplicated content for screen readers and search engines if hidden incorrectly, duplicate ids, and two places to keep in sync",
          "Обидві копії лишаються в DOM: більша вага, дубльований вміст для скринрідерів і пошукових систем, якщо приховати неправильно, повторювані id і два місця, які треба синхронізувати",
        ],
      ],
      "d",
    ),
  ],
};
