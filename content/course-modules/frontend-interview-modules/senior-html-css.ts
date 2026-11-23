import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 15–35 of the Senior list: HTML/CSS. */
export const seniorHtmlCssQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-html-css-quiz",
  title: { en: "HTML/CSS", uk: "HTML/CSS" },
  questions: [
    question(
      "naming-systems",
      ["Which of these are CSS class naming systems or methodologies?", "Що з цього — системи іменування класів чи CSS-методології?"],
      [
        ["BEM", "БЕМ (BEM)"],
        ["SOLID", "SOLID"],
        ["SMACSS", "SMACSS"],
        ["OOCSS", "OOCSS"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "css-build",
      ["What does a typical CSS build pipeline do?", "Що робить типовий конвеєр збирання CSS?"],
      [
        ["Uploads the source CSS to the server unchanged", "Завантажує вихідний CSS на сервер без змін"],
        [
          "Bundles imports, compiles Sass or modern syntax through PostCSS, adds prefixes based on Browserslist, removes unused CSS, minifies, and outputs hashed files with source maps",
          "Об'єднує імпорти, компілює Sass чи сучасний синтаксис через PostCSS, додає префікси за Browserslist, прибирає невикористаний CSS, мініфікує й видає файли з хешами та source maps",
        ],
        ["Converts the CSS into images", "Перетворює CSS на зображення"],
        ["It runs only in the user's browser", "Він працює лише в браузері користувача"],
      ],
      "b",
    ),
    question(
      "shadow-dom",
      ["What is the Shadow DOM?", "Що таке Shadow DOM?"],
      [
        ["React's virtual DOM", "Віртуальний DOM у React"],
        ["A hidden copy of the page for search engines", "Прихована копія сторінки для пошукових систем"],
        [
          "An encapsulated DOM subtree attached to an element: styles inside don't leak out and page styles don't leak in, except inherited properties, custom properties and `::part()`",
          "Інкапсульоване піддерево DOM, прикріплене до елемента: стилі всередині не виходять назовні, а стилі сторінки не проникають усередину, крім успадковуваних властивостей, custom properties і `::part()`",
        ],
        ["The DOM used in dark mode", "DOM, що використовується в темній темі"],
      ],
      "c",
    ),
    question(
      "img-pseudo",
      ["Why doesn't `img::before` work?", "Чому не працює `img::before`?"],
      [
        ["It is a browser bug", "Це баг браузерів"],
        ["`<img>` needs `display: block` first", "Спершу `<img>` треба задати `display: block`"],
        ["It works only in Firefox", "Це працює лише у Firefox"],
        [
          "`::before` and `::after` are inserted inside the element's content, but `<img>` is a replaced element with no content of its own to insert into; the same goes for `<input>` and other void elements",
          "`::before` і `::after` вставляються всередину вмісту елемента, а `<img>` — замінюваний елемент без власного вмісту, куди можна вставити; те саме стосується `<input>` та інших порожніх елементів",
        ],
      ],
      "d",
    ),
    question(
      "float",
      ["Where does `float` still make sense today?", "Де `float` досі доречний сьогодні?"],
      [
        ["Wrapping text around an image or a pull quote, possibly with `shape-outside`", "Обтікання текстом зображення чи цитати, можливо з `shape-outside`"],
        ["For page layout instead of Grid", "Для каркаса сторінки замість Grid"],
        ["Nowhere: it was removed from CSS", "Ніде: його прибрали з CSS"],
        ["For centering elements", "Для центрування елементів"],
      ],
      "a",
    ),
    question(
      "fluid-typography",
      ["Which technique gives fluid typography that still respects the user's zoom?", "Який прийом дає гнучку типографіку, що враховує масштабування користувача?"],
      [
        ["`font-size: 2vw` and nothing else", "`font-size: 2vw` і більше нічого"],
        [
          "`font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem)`: the size grows with the viewport between a minimum and a maximum, and the `rem` part keeps it responsive to zoom",
          "`font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem)`: розмір росте разом із вікном між мінімумом і максимумом, а частина в `rem` зберігає реакцію на масштабування",
        ],
        ["A fixed `px` size for every breakpoint", "Фіксований розмір у `px` для кожного breakpoint"],
        ["Recalculating the size in JS on every `resize`", "Перераховувати розмір у JS на кожен `resize`"],
      ],
      "b",
    ),
    question(
      "media-query-alternatives",
      ["Which are alternatives or complements to media queries in modern responsive design?", "Що є альтернативою чи доповненням до медіазапитів у сучасному адаптивному дизайні?"],
      [
        ["Container queries, so that a component adapts to its container", "Container queries, щоб компонент підлаштовувався під свій контейнер"],
        ["Intrinsic layouts: `flex-wrap`, Grid with `auto-fit` and `minmax()`", "Внутрішньо гнучкі макети: `flex-wrap`, Grid з `auto-fit` і `minmax()`"],
        ["Fluid values with `clamp()`", "Гнучкі значення через `clamp()`"],
        ["Detecting each device by its user agent on the server", "Визначати кожен пристрій за user agent на сервері"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "node-vs-dart-sass",
      ["How does Node Sass differ from Dart Sass?", "Чим Node Sass відрізняється від Dart Sass?"],
      [
        ["Node Sass is the newer one", "Node Sass новіший"],
        ["There is no difference", "Різниці немає"],
        [
          "Node Sass (built on LibSass in C++) is deprecated and lacks newer features like `@use`; Dart Sass is the main implementation. Migrating means switching to the `sass` package and replacing `@import` and old features, for example `/` division with `math.div`",
          "Node Sass (на основі LibSass, C++) застарів і не підтримує новіших можливостей, як-от `@use`; Dart Sass — основна реалізація. Міграція — це перехід на пакет `sass` і заміна `@import` та старих можливостей, наприклад ділення через `/` на `math.div`",
        ],
        ["Dart Sass requires the Dart runtime in the browser", "Dart Sass потребує середовища Dart у браузері"],
      ],
      "c",
    ),
    question(
      "use-forward",
      ["How do `@use` and `@forward` differ from `@import` in Sass?", "Чим `@use` і `@forward` відрізняються від `@import` у Sass?"],
      [
        [
          "`@import` puts everything into the global scope, can load a file many times and is deprecated; `@use` loads a module once under a namespace (`colors.$primary`); `@forward` re-exports a module's members to files that `@use` this one",
          "`@import` кладе все в глобальну область видимості, може завантажувати файл багато разів і застарів; `@use` завантажує модуль один раз у просторі імен (`colors.$primary`); `@forward` реекспортує члени модуля файлам, що підключають цей через `@use`",
        ],
        ["They are three names for the same thing", "Це три назви однієї й тієї ж речі"],
        ["`@use` is native CSS that browsers understand", "`@use` — нативний CSS, який розуміють браузери"],
        ["`@forward` loads CSS from a CDN", "`@forward` завантажує CSS із CDN"],
      ],
      "a",
    ),
    question(
      "styleguide",
      ["Which tool is commonly used to build a living style guide of components?", "Який інструмент часто використовують для живого стайлгайду компонентів?"],
      [
        ["webpack", "webpack"],
        ["ESLint", "ESLint"],
        ["Lighthouse", "Lighthouse"],
        ["Storybook", "Storybook"],
      ],
      "d",
    ),
    question(
      "overflow-alternatives",
      [
        "Which modern alternative to `overflow: hidden` clips content without creating a scroll container (so `position: sticky` inside keeps working)?",
        "Яка сучасна альтернатива `overflow: hidden` обрізає вміст, не створюючи контейнер прокрутки (тож `position: sticky` усередині продовжує працювати)?",
      ],
      [
        ["`overflow: none`", "`overflow: none`"],
        ["`overflow: clip`", "`overflow: clip`"],
        ["`display: hidden`", "`display: hidden`"],
        ["`visibility: clip`", "`visibility: clip`"],
      ],
      "b",
    ),
    question(
      "custom-form-styles",
      ["A designer insists on fully custom styles for every element of a complex form. What do you do?", "Дизайнер наполягає на повністю кастомних стилях для кожного елемента складної форми. Що ви робите?"],
      [
        ["Replace every input with styled `<div>`s", "Замінити кожне поле стилізованими `<div>`"],
        ["Refuse without discussion", "Відмовити без обговорення"],
        [
          "Discuss the cost and risks (accessibility, native behavior on mobile, time), style native elements as far as possible (`accent-color`, `appearance: none`), and build custom controls only where needed, with full keyboard and ARIA support",
          "Обговорити ціну й ризики (доступність, нативна поведінка на мобільних, час), стилізувати нативні елементи наскільки можливо (`accent-color`, `appearance: none`) і робити власні контроли лише там, де потрібно, з повною підтримкою клавіатури та ARIA",
        ],
        ["Use images of form fields", "Використати зображення полів форми"],
      ],
      "c",
    ),
    question(
      "media-types",
      ["Which media queries are useful beyond screen width?", "Які медіазапити корисні, крім ширини екрана?"],
      [
        ["`@media browser(chrome)`", "`@media browser(chrome)`"],
        ["`print`", "`print`"],
        ["`prefers-color-scheme` and `prefers-reduced-motion`", "`prefers-color-scheme` і `prefers-reduced-motion`"],
        ["`hover` and `pointer`, to tell touch screens from a mouse", "`hover` і `pointer`, щоб відрізнити сенсорні екрани від миші"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "css-architecture",
      ["Which CSS architecture holds up best in a large codebase?", "Яка CSS-архітектура найкраще тримається у великій кодовій базі?"],
      [
        [
          "Layers by responsibility (`@layer reset, tokens, base, components, utilities`), design tokens as custom properties, component-scoped styles and lint rules, so the cascade order is explicit",
          "Шари за відповідальністю (`@layer reset, tokens, base, components, utilities`), дизайн-токени як custom properties, стилі на рівні компонентів і правила лінтера, щоб порядок каскаду був явним",
        ],
        ["One file that everyone edits", "Один файл, який редагують усі"],
        ["`!important` on every rule", "`!important` на кожному правилі"],
        ["Styling everything through `id` selectors", "Стилізувати все через селектори `id`"],
      ],
      "a",
    ),
    question(
      "ttfb-render",
      ["Which techniques cut the time to first byte and to first render?", "Які прийоми скорочують час до першого байта та до першого відображення?"],
      [
        ["A CDN and server-side caching for a faster TTFB", "CDN і кешування на сервері для швидшого TTFB"],
        ["Inlining critical CSS and deferring the rest", "Вбудовування критичного CSS і відкладене завантаження решти"],
        ["Loading all JavaScript synchronously in `<head>`", "Синхронне завантаження всього JavaScript у `<head>`"],
        ["Preloading the LCP image and key fonts", "Попереднє завантаження LCP-зображення та ключових шрифтів"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "automation-tools",
      ["Which combination is typical for automating CSS work in a large project?", "Яка комбінація типова для автоматизації роботи з CSS у великому проєкті?"],
      [
        ["Copying files by hand", "Копіювати файли вручну"],
        [
          "Sass or PostCSS for authoring, Stylelint for rules, Autoprefixer driven by Browserslist, and a bundler (Vite, webpack) to build and optimize",
          "Sass чи PostCSS для написання, Stylelint для правил, Autoprefixer за Browserslist і бандлер (Vite, webpack) для збирання та оптимізації",
        ],
        ["Uploading styles over FTP after every change", "Завантажувати стилі через FTP після кожної зміни"],
        ["Only Photoshop", "Лише Photoshop"],
      ],
      "b",
    ),
    question(
      "cross-browser-qa",
      ["How do you avoid misunderstandings with QA about cross-browser support?", "Як уникнути непорозумінь із QA щодо кросбраузерної підтримки?"],
      [
        ["Agree on a written support matrix of browsers and versions, kept in Browserslist and the docs", "Узгодити письмову матрицю підтримки браузерів і версій, зафіксовану в Browserslist і документації"],
        ["Run tests in the same browsers in CI (Playwright projects, BrowserStack)", "Запускати тести в тих самих браузерах у CI (проєкти Playwright, BrowserStack)"],
        ["Decide which browser bugs matter only after QA reports them", "Вирішувати, які браузерні баги важливі, лише після звітів QA"],
        ["Define graceful degradation: which features may look simpler in older browsers", "Визначити graceful degradation: які можливості можуть виглядати простіше в старих браузерах"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "css-in-js-ssr",
      ["What is the main challenge of runtime CSS-in-JS with SSR or SSG?", "У чому головна складність runtime CSS-in-JS з SSR чи SSG?"],
      [
        ["There are no challenges", "Жодних складнощів немає"],
        ["CSS-in-JS cannot use media queries", "CSS-in-JS не підтримує медіазапити"],
        ["SSG forbids any CSS", "SSG забороняє будь-який CSS"],
        [
          "Styles must be collected on the server and injected into the HTML in the same order as on the client, or the page flashes unstyled or mismatches during hydration; runtime libraries also cost JS and fit poorly with React Server Components, so zero-runtime options (CSS Modules, vanilla-extract, Tailwind) are often preferred",
          "Стилі треба зібрати на сервері й вставити в HTML у тому самому порядку, що й на клієнті, інакше сторінка блимає без стилів або не збігається під час гідратації; runtime-бібліотеки ще й коштують JS і погано поєднуються з React Server Components, тож часто обирають варіанти без runtime (CSS Modules, vanilla-extract, Tailwind)",
        ],
      ],
      "d",
    ),
    question(
      "upcoming-css",
      ["Which of these are new CSS features that browsers have been rolling out recently?", "Що з цього — нові можливості CSS, які браузери нещодавно почали впроваджувати?"],
      [
        ["Anchor positioning", "Anchor positioning (прив'язка до якоря)"],
        ["The `<center>` tag", "Тег `<center>`"],
        ["Scroll-driven animations", "Анімації, керовані прокруткою (scroll-driven animations)"],
        ["View transitions", "View transitions"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "multilingual-css",
      [
        "You are planning the CSS for a large multilingual site that includes Arabic and Japanese, with two juniors on the team. What should be in place?",
        "Ви плануєте CSS для великого мультимовного сайту з арабською та японською, а в команді двоє джуніорів. Що має бути передбачено?",
      ],
      [
        [
          "Logical properties (`margin-inline-start`, `inset-inline`) and `dir=\"rtl\"` for Arabic instead of left and right",
          "Логічні властивості (`margin-inline-start`, `inset-inline`) і `dir=\"rtl\"` для арабської замість left і right",
        ],
        [
          "Layouts that tolerate longer or shorter text, and fonts covering Arabic and CJK scripts with correct `lang` attributes",
          "Макети, що витримують довший чи коротший текст, і шрифти з підтримкою арабського письма та CJK з правильними атрибутами `lang`",
        ],
        ["A documented architecture and conventions, linting and code review, so the juniors can follow them", "Задокументована архітектура й домовленості, лінтинг і code review, щоб джуніори могли їх дотримуватися"],
        ["Separate hard-coded stylesheets per language, with the rules copied between them", "Окремі жорстко прописані таблиці стилів для кожної мови зі скопійованими правилами"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "scroll-gallery",
      ["How can you build a horizontally scrolling gallery that snaps smoothly, without JS?", "Як зробити галерею з горизонтальною прокруткою, що плавно зупиняється на картинках, без JS?"],
      [
        ["It is impossible without JavaScript", "Без JavaScript це неможливо"],
        ["`float: left` on the images and nothing else", "`float: left` на зображеннях і більше нічого"],
        [
          "`overflow-x: auto` and `scroll-snap-type: x mandatory` on the container, `scroll-snap-align: start` on the items, plus `scroll-behavior: smooth`",
          "`overflow-x: auto` і `scroll-snap-type: x mandatory` на контейнері, `scroll-snap-align: start` на елементах, а також `scroll-behavior: smooth`",
        ],
        ["The `<marquee>` tag", "Тег `<marquee>`"],
      ],
      "c",
    ),
  ],
};
