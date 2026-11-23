import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 22–42 of the list: CSS basics. */
export const cssQuiz: SlideDef = {
  kind: "quiz",
  slug: "css-quiz",
  title: { en: "CSS basics", uk: "Основи CSS" },
  questions: [
    question(
      "bem",
      ["In the BEM methodology, what does the class `.card__title--large` mean?", "Що означає клас `.card__title--large` у методології БЕМ?"],
      [
        ["Element `card`, block `title`, state `large`", "Елемент `card`, блок `title`, стан `large`"],
        ["Three unrelated classes", "Три не пов'язані між собою класи"],
        ["Block `card`, element `title`, modifier `large`", "Блок `card`, елемент `title`, модифікатор `large`"],
        ["Sass nesting syntax", "Синтаксис вкладеності Sass"],
      ],
      "c",
    ),
    question(
      "selectors",
      ["Which elements does the selector `nav > a.active` match?", "Які елементи вибирає селектор `nav > a.active`?"],
      [
        ["Any `a` anywhere inside `nav`", "Будь-який `a` будь-де всередині `nav`"],
        ["An `a` with the class `active` that is a direct child of `nav`", "`a` з класом `active`, що є прямим нащадком `nav`"],
        ["A `nav` with the class `active`", "`nav` із класом `active`"],
        ["The `a` that comes right after `nav`", "`a`, що йде одразу після `nav`"],
      ],
      "b",
    ),
    question(
      "inheritance",
      ["Which properties are inherited by default in CSS?", "Які властивості в CSS успадковуються за замовчуванням?"],
      [
        ["All of them", "Усі"],
        ["None, unless you write `inherit`", "Жодна, якщо не написати `inherit`"],
        ["Only `display`", "Лише `display`"],
        [
          "Mostly text properties like `color`, `font-family` and `line-height`; box properties like `margin`, `padding` and `border` are not",
          "Переважно текстові, як-от `color`, `font-family` і `line-height`; властивості коробки, як-от `margin`, `padding` і `border`, ні",
        ],
      ],
      "d",
    ),
    question(
      "box-model",
      [
        "An element has `box-sizing: border-box; width: 200px; padding: 20px; border: 5px solid`. How wide is it on the page?",
        "Елемент має `box-sizing: border-box; width: 200px; padding: 20px; border: 5px solid`. Якої він ширини на сторінці?",
      ],
      [
        ["250px", "250px"],
        ["200px", "200px"],
        ["240px", "240px"],
        ["210px", "210px"],
      ],
      "b",
    ),
    question(
      "margin-padding",
      ["What is the difference between `margin` and `padding`?", "Яка різниця між `margin` і `padding`?"],
      [
        ["`margin` is inside the border, `padding` is outside", "`margin` усередині рамки, `padding` ззовні"],
        ["They are the same", "Це одне й те саме"],
        [
          "`padding` is the space inside the border around the content and shows the element's background; `margin` is the space outside the border, and vertical margins of neighboring blocks can collapse",
          "`padding` — простір усередині рамки довкола вмісту, на ньому видно фон елемента; `margin` — простір ззовні рамки, і вертикальні margin сусідніх блоків можуть схлопуватися",
        ],
        ["Only `padding` can be negative", "Лише `padding` може бути від'ємним"],
      ],
      "c",
    ),
    question(
      "flex-grid",
      ["When is Grid usually a better fit than Flexbox?", "Коли Grid зазвичай доречніший за Flexbox?"],
      [
        [
          "For a two-dimensional layout with rows and columns at once, such as a page layout or a card gallery",
          "Для двовимірної верстки з рядками й колонками одночасно, як-от каркас сторінки чи галерея карток",
        ],
        ["To line up a few items in one row", "Щоб вирівняти кілька елементів в один ряд"],
        ["Never: Flexbox replaced Grid", "Ніколи: Flexbox замінив Grid"],
        ["Only for tables", "Лише для таблиць"],
      ],
      "a",
    ),
    question(
      "media-queries",
      ["What does `@media (min-width: 768px) { … }` do?", "Що робить `@media (min-width: 768px) { … }`?"],
      [
        ["Applies the styles only on screens narrower than 768px", "Застосовує стилі лише на екранах, вужчих за 768px"],
        ["Applies the styles when the viewport is at least 768px wide", "Застосовує стилі, коли ширина вікна щонайменше 768px"],
        ["Sets the minimum width of the page", "Задає мінімальну ширину сторінки"],
        ["Applies the styles only when printing", "Застосовує стилі лише під час друку"],
      ],
      "b",
    ),
    question(
      "hide-element",
      ["Which statements about hiding elements are true?", "Які твердження про приховування елементів правильні?"],
      [
        ["`display: none` removes the element from the layout and from the accessibility tree", "`display: none` прибирає елемент із верстки та з дерева доступності"],
        ["`visibility: hidden` keeps its space but hides it, and it cannot be clicked", "`visibility: hidden` зберігає його місце, але ховає, і на нього не можна клікнути"],
        ["`opacity: 0` keeps its space, and the element can still be clicked and focused", "`opacity: 0` зберігає місце, і на елемент досі можна клікнути та перевести фокус"],
        ["All three behave the same", "Усі три працюють однаково"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "center-logo",
      ["Which CSS puts a logo exactly in the middle of the screen?", "Який CSS ставить лого точно посередині екрана?"],
      [
        ["`.logo { text-align: center; }`", "`.logo { text-align: center; }`"],
        ["`.logo { vertical-align: middle; }`", "`.logo { vertical-align: middle; }`"],
        ["`.logo { margin: auto; }` and nothing else", "`.logo { margin: auto; }` і більше нічого"],
        ["`body { display: grid; place-items: center; min-height: 100vh; }`", "`body { display: grid; place-items: center; min-height: 100vh; }`"],
      ],
      "d",
    ),
    question(
      "close-button",
      ["How do you place a close button in the top-right corner of a card?", "Як розмістити кнопку закриття у правому верхньому куті картки?"],
      [
        ["`.close { float: right; }` and nothing else", "`.close { float: right; }` і більше нічого"],
        [
          "`.card { position: relative; } .close { position: absolute; top: 8px; right: 8px; }`",
          "`.card { position: relative; } .close { position: absolute; top: 8px; right: 8px; }`",
        ],
        ["`.close { position: fixed; top: 0; right: 0; }`", "`.close { position: fixed; top: 0; right: 0; }`"],
        ["`.close { margin-left: 100%; }`", "`.close { margin-left: 100%; }`"],
      ],
      "b",
    ),
    question(
      "last-red",
      ["How do you make the last list item red without JS?", "Як зробити останній елемент списку червоним без JS?"],
      [
        ["`li:last { color: red; }`", "`li:last { color: red; }`"],
        ["`li::after { color: red; }`", "`li::after { color: red; }`"],
        ["`li:last-child { color: red; }`", "`li:last-child { color: red; }`"],
        ["`li:nth-child(-1) { color: red; }`", "`li:nth-child(-1) { color: red; }`"],
      ],
      "c",
    ),
    question(
      "colors",
      ["Which of these are valid ways to set a color in CSS?", "Які з цих способів задати колір у CSS валідні?"],
      [
        ["`#ff0000` or `#f00`", "`#ff0000` або `#f00`"],
        ["`rgb(255 0 0 / 50%)` or `hsl(0 100% 50%)`", "`rgb(255 0 0 / 50%)` або `hsl(0 100% 50%)`"],
        ["`oklch(62% 0.25 29)` or the keyword `red`", "`oklch(62% 0.25 29)` або ключове слово `red`"],
        ["`color(red, 50)`", "`color(red, 50)`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "z-index",
      ["When does `z-index` take effect?", "Коли спрацьовує `z-index`?"],
      [
        ["Always, on every element", "Завжди, на будь-якому елементі"],
        [
          "On positioned elements (`position` other than `static`) and on flex and grid items, within their stacking context",
          "На позиціонованих елементах (`position` не `static`) і на flex- та grid-елементах, у межах їхнього контексту накладання",
        ],
        ["Only with `position: absolute`", "Лише з `position: absolute`"],
        ["Only on images", "Лише на зображеннях"],
      ],
      "b",
    ),
    question(
      "preprocessors",
      ["Which are real advantages of CSS preprocessors such as Sass or Less?", "Які з цього справжні переваги CSS-препроцесорів на кшталт Sass чи Less?"],
      [
        ["Mixins, functions, loops and partial files for organizing code", "Міксини, функції, цикли й часткові файли для організації коду"],
        ["The CSS runs faster in the browser", "CSS швидше виконується в браузері"],
        ["Nesting and variables resolved at build time", "Вкладеність і змінні, що обчислюються під час збирання"],
        ["No build step is needed", "Не потрібен крок збирання"],
      ],
      ["a", "c"],
    ),
    question(
      "centering",
      ["Which CSS centers a block of a set width horizontally?", "Який CSS центрує по горизонталі блок заданої ширини?"],
      [
        ["`float: center`", "`float: center`"],
        ["`text-align: center` on the block itself", "`text-align: center` на самому блоці"],
        ["`align: center`", "`align: center`"],
        ["`margin: 0 auto`", "`margin: 0 auto`"],
      ],
      "d",
    ),
    question(
      "vertical-centering",
      ["Which approaches center a child vertically?", "Які підходи центрують дочірній елемент по вертикалі?"],
      [
        ["A flex parent with `align-items: center`", "Flex-батько з `align-items: center`"],
        ["A grid parent with `place-items: center`", "Grid-батько з `place-items: center`"],
        ["`position: absolute; top: 50%; transform: translateY(-50%)`", "`position: absolute; top: 50%; transform: translateY(-50%)`"],
        ["`vertical-align: middle` on a block inside another block", "`vertical-align: middle` на блоці всередині іншого блоку"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "heading-levels",
      ["Why use `<h1>`–`<h6>` if the size can be set with CSS?", "Навіщо `<h1>`–`<h6>`, якщо розмір можна задати в CSS?"],
      [
        ["Only to get a default font size", "Лише заради розміру шрифту за замовчуванням"],
        [
          "The levels describe the document outline: screen readers navigate by headings and search engines use them to understand the structure",
          "Рівні описують структуру документа: скринрідери навігують заголовками, а пошукові системи за ними розуміють структуру",
        ],
        ["They are a legacy of old HTML and no longer matter", "Це спадок старого HTML, і вони вже нічого не важать"],
        ["Because `<h1>` may be used only once per site", "Бо `<h1>` можна використати лише раз на весь сайт"],
      ],
      "b",
    ),
    question(
      "positioning",
      [
        "Which `position` value keeps the element in the normal flow until it reaches a set offset while scrolling, and then pins it?",
        "Яке значення `position` залишає елемент у звичайному потоці, доки під час прокручування він не дійде до заданого відступу, а тоді закріплює його?",
      ],
      [
        ["`static`", "`static`"],
        ["`relative`", "`relative`"],
        ["`fixed`", "`fixed`"],
        ["`sticky`", "`sticky`"],
      ],
      "d",
    ),
    question(
      "inline-block",
      ["What is special about `display: inline-block`?", "У чому особливість `display: inline-block`?"],
      [
        ["It is the same as `block`", "Це те саме, що `block`"],
        ["It ignores `width` and `height`", "Він ігнорує `width` і `height`"],
        [
          "The element flows in a line like text, but its width, height and vertical padding and margin apply",
          "Елемент стоїть у рядку, як текст, але його ширина, висота й вертикальні padding та margin застосовуються",
        ],
        ["It removes the element from the page", "Він прибирає елемент зі сторінки"],
      ],
      "c",
    ),
    question(
      "relative-absolute",
      ["What is the difference between `position: relative` and `position: absolute`?", "У чому відмінність між `position: relative` і `position: absolute`?"],
      [
        [
          "`relative` shifts the element from its normal place and keeps its space in the flow; `absolute` takes it out of the flow and positions it against the nearest positioned ancestor",
          "`relative` зсуває елемент від його звичайного місця і зберігає його місце в потоці; `absolute` виймає його з потоку й позиціонує відносно найближчого позиціонованого предка",
        ],
        ["It is the other way around", "Навпаки"],
        ["`absolute` is always positioned against the browser window", "`absolute` завжди позиціонується відносно вікна браузера"],
        ["There is no difference", "Різниці немає"],
      ],
      "a",
    ),
    question(
      "units",
      ["Which unit is relative to the font size of the root element?", "Яка одиниця залежить від розміру шрифту кореневого елемента?"],
      [
        ["`em`", "`em`"],
        ["`rem`", "`rem`"],
        ["`vh`", "`vh`"],
        ["`px`", "`px`"],
      ],
      "b",
    ),
  ],
};

/** Questions 43–60 of the list: CSS in depth. */
export const cssAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "css-advanced-quiz",
  title: { en: "CSS in depth", uk: "CSS глибше" },
  questions: [
    question(
      "negative-margins",
      ["What is the main risk of negative margins?", "Який головний ризик від'ємних відступів?"],
      [
        ["They are not valid CSS", "Це невалідний CSS"],
        [
          "Elements can overlap and cover each other, the layout becomes fragile and hard to maintain, and overflow can cause horizontal scrolling",
          "Елементи можуть налазити й перекривати один одного, верстка стає крихкою й важкою в підтримці, а переповнення може дати горизонтальну прокрутку",
        ],
        ["They make the page much slower", "Вони сильно сповільнюють сторінку"],
        ["There are no risks", "Ризиків немає"],
      ],
      "b",
    ),
    question(
      "pseudo",
      ["What is the difference between `:hover` and `::before`?", "Яка різниця між `:hover` і `::before`?"],
      [
        ["`:hover` is a pseudo-element, `::before` is a pseudo-class", "`:hover` — псевдоелемент, `::before` — псевдоклас"],
        ["They are the same thing written differently", "Це одне й те саме, тільки записане по-різному"],
        [
          "`:hover` is a pseudo-class that selects an element in a certain state; `::before` is a pseudo-element that creates a virtual child to style, and it needs `content`",
          "`:hover` — псевдоклас, що вибирає елемент у певному стані; `::before` — псевдоелемент, що створює віртуальний дочірній елемент для стилізації, і йому потрібен `content`",
        ],
        ["`::before` works only on images", "`::before` працює лише на зображеннях"],
      ],
      "c",
    ),
    question(
      "adaptive-design",
      ["Strictly speaking, how does adaptive design differ from responsive design?", "Якщо говорити строго, чим адаптивний дизайн відрізняється від responsive (гумового)?"],
      [
        ["Adaptive design is only for printing", "Адаптивний дизайн лише для друку"],
        ["It is the other way around", "Навпаки"],
        ["They are never told apart in any way", "Їх ніяк не розрізняють"],
        [
          "Adaptive serves a few fixed layouts for set breakpoints or devices; a responsive layout is fluid and stretches smoothly at any width",
          "Адаптивний віддає кілька фіксованих макетів під задані breakpoints чи пристрої; responsive-макет гумовий і плавно тягнеться на будь-якій ширині",
        ],
      ],
      "d",
    ),
    question(
      "img-vs-background",
      ["When should a picture be an `<img>` rather than a CSS `background-image`?", "Коли картинка має бути `<img>`, а не CSS `background-image`?"],
      [
        [
          "When it is content: it needs `alt` for accessibility, gets indexed, and can use `loading=\"lazy\"` and `srcset`",
          "Коли це вміст: їй потрібен `alt` для доступності, вона індексується, може мати `loading=\"lazy\"` і `srcset`",
        ],
        ["When it is purely decorative", "Коли вона суто декоративна"],
        ["Never", "Ніколи"],
        ["When it repeats as a pattern", "Коли вона повторюється як візерунок"],
      ],
      "a",
    ),
    question(
      "cross-browser",
      ["Which practices help with cross-browser compatibility?", "Які практики допомагають із кросбраузерною сумісністю?"],
      [
        ["Checking support on caniuse.com or MDN and using feature queries with `@supports`", "Перевіряти підтримку на caniuse.com чи MDN і використовувати feature queries через `@supports`"],
        ["Autoprefixer with a Browserslist config", "Autoprefixer із конфігурацією Browserslist"],
        ["Writing for one browser and ignoring the rest", "Писати під один браузер, а решту ігнорувати"],
        ["Progressive enhancement with fallbacks, and testing in real browsers", "Прогресивне покращення з fallback-ами та тестування в реальних браузерах"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "accessibility",
      ["Which practices make a site more accessible?", "Які практики роблять сайт доступнішим?"],
      [
        ["Semantic elements, and real `<button>` and `<a>` instead of clickable `<div>`s", "Семантичні елементи та справжні `<button>` і `<a>` замість клікабельних `<div>`"],
        ["`alt` on images and a `<label>` for every input", "`alt` на зображеннях і `<label>` для кожного поля"],
        ["Removing focus outlines with `outline: none` for a cleaner look", "Прибрати обведення фокуса через `outline: none` заради чистішого вигляду"],
        ["Enough color contrast and full keyboard navigation", "Достатній контраст кольорів і повноцінна навігація з клавіатури"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "responsive",
      ["Which CSS tools are used to build a responsive layout?", "Які інструменти CSS використовують для responsive-верстки?"],
      [
        ["Media queries and container queries", "Медіазапити та container queries"],
        ["Relative units, `%`, `fr` and `clamp()`", "Відносні одиниці, `%`, `fr` і `clamp()`"],
        ["Flexbox and Grid with wrapping and `auto-fit`", "Flexbox і Grid із перенесенням та `auto-fit`"],
        ["A fixed `width: 1200px` on `body`", "Фіксована `width: 1200px` на `body`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "css-variables",
      [
        "Given `:root { --brand: blue; } .card { --brand: green; } a { color: var(--brand); }`, what color is a link inside `.card`?",
        "Маємо `:root { --brand: blue; } .card { --brand: green; } a { color: var(--brand); }`. Якого кольору посилання всередині `.card`?",
      ],
      [
        ["Blue", "Синього"],
        ["Green", "Зеленого"],
        ["Black, the default color", "Чорного, кольору за замовчуванням"],
        ["The rule is invalid and is ignored", "Правило невалідне й ігнорується"],
      ],
      "b",
    ),
    question(
      "costly-properties",
      ["Changes to which properties are usually the cheapest to animate?", "Зміни яких властивостей зазвичай найдешевше анімувати?"],
      [
        ["`width`, `height` and `top`", "`width`, `height` і `top`"],
        ["`margin`", "`margin`"],
        ["`transform` and `opacity`: the compositor handles them without layout or paint", "`transform` і `opacity`: їх обробляє композитор без layout і paint"],
        ["A large `box-shadow` blur", "Велике розмиття `box-shadow`"],
      ],
      "c",
    ),
    question(
      "slow-site",
      ["What usually slows a site down the most?", "Що зазвичай найбільше сповільнює сайт?"],
      [
        ["Large unoptimized images and video", "Великі неоптимізовані зображення та відео"],
        ["Too much JavaScript, render-blocking scripts and third-party tags", "Забагато JavaScript, скрипти, що блокують рендеринг, і сторонні теги"],
        ["Using semantic tags", "Використання семантичних тегів"],
        ["A slow server response (TTFB) and no caching or CDN", "Повільна відповідь сервера (TTFB) і відсутність кешування чи CDN"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "two-columns",
      ["Which CSS gives a fixed 250px sidebar and a main column that takes the rest of the width?", "Який CSS дає фіксовану бічну колонку 250px і основну, що займає решту ширини?"],
      [
        ["`.layout { display: grid; grid-template-columns: 1fr 1fr; }`", "`.layout { display: grid; grid-template-columns: 1fr 1fr; }`"],
        ["`.layout { display: grid; grid-template-columns: 250px 1fr; }`", "`.layout { display: grid; grid-template-columns: 250px 1fr; }`"],
        ["`.sidebar { width: 250px; } .main { width: 100%; }` inside a regular block", "`.sidebar { width: 250px; } .main { width: 100%; }` у звичайному блоці"],
        ["`.layout { columns: 2; }`", "`.layout { columns: 2; }`"],
      ],
      "b",
    ),
    question(
      "css-vs-js-animation",
      ["What is true about CSS animations compared with JS animations?", "Що правильно про CSS-анімації порівняно з JS-анімаціями?"],
      [
        [
          "CSS transitions and animations are declarative, and for `transform` and `opacity` they run off the main thread; JS gives fine control: sequences, physics, pausing and reacting to input",
          "CSS-переходи й анімації декларативні, а для `transform` та `opacity` виконуються поза головним потоком; JS дає тонкий контроль: послідовності, фізику, паузи й реакцію на дії користувача",
        ],
        ["JS animations are always smoother", "JS-анімації завжди плавніші"],
        ["CSS cannot animate anything except color", "CSS не вміє анімувати нічого, крім кольору"],
        ["CSS and JS animations cannot be combined", "CSS- і JS-анімації не можна поєднувати"],
      ],
      "a",
    ),
    question(
      "important",
      ["How can you override a rule with `!important`, or avoid needing it?", "Як перебити правило з `!important` або обійтися без нього?"],
      [
        ["Another `!important` with higher specificity, or the same specificity later in the code", "Інший `!important` із вищою специфічністю або з такою самою, але пізніше в коді"],
        ["Put third-party CSS into an `@layer`: your unlayered styles then win without `!important`", "Покласти сторонній CSS в `@layer`: тоді ваші стилі поза шарами перемагають без `!important`"],
        ["Raise specificity with a more precise selector", "Підвищити специфічність точнішим селектором"],
        ["An inline `style` attribute without `!important`", "Inline-атрибут `style` без `!important`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "valid-html",
      [
        "Is this HTML valid?\n\n```html\n<ul>\n<a href=\"/some-url\"><li>Some Link in Menu</a></li>\n<a href=\"/some-url\"><li>Some Link in Menu</li></a>\n<ul>\n```",
        "Чи валідний цей HTML?\n\n```html\n<ul>\n<a href=\"/some-url\"><li>Some Link in Menu</a></li>\n<a href=\"/some-url\"><li>Some Link in Menu</li></a>\n<ul>\n```",
      ],
      [
        ["Yes, it is valid", "Так, валідний"],
        ["No, but only because `href` must be an absolute URL", "Ні, але лише тому, що `href` має бути абсолютною адресою"],
        ["No, but only because `<a>` cannot contain text", "Ні, але лише тому, що `<a>` не може містити текст"],
        [
          "No: a `<ul>` may contain only `<li>`, so each `<a>` goes inside its `<li>`; the first item closes its tags in the wrong order; and the last `<ul>` must be `</ul>`",
          "Ні: `<ul>` може містити лише `<li>`, тож кожен `<a>` має бути всередині свого `<li>`; у першому пункті теги закрито в неправильному порядку; а останній `<ul>` має бути `</ul>`",
        ],
      ],
      "d",
    ),
    question(
      "mobile-first",
      ["What does mobile-first mean in CSS?", "Що означає mobile-first у CSS?"],
      [
        ["Base styles are for desktop, and `max-width` queries adjust them for phones", "Базові стилі для десктопа, а запити `max-width` підлаштовують їх під телефони"],
        [
          "Base styles target small screens, and `min-width` media queries add styles for larger ones",
          "Базові стилі розраховані на малі екрани, а медіазапити `min-width` додають стилі для більших",
        ],
        ["Building a separate site for mobile devices", "Окремий сайт для мобільних пристроїв"],
        ["Using only `px` units", "Використовувати лише одиниці `px`"],
      ],
      "b",
    ),
    question(
      "specificity",
      ["Which selector has the highest specificity?", "Який селектор має найвищу специфічність?"],
      [
        ["`.menu .item a`", "`.menu .item a`"],
        ["`nav ul li a`", "`nav ul li a`"],
        ["`#nav a`", "`#nav a`"],
        ["`a:hover`", "`a:hover`"],
      ],
      "c",
    ),
    question(
      "pre-post-processors",
      ["What does a postprocessor such as PostCSS with Autoprefixer do?", "Що робить постпроцесор, як-от PostCSS з Autoprefixer?"],
      [
        ["Lets you write in Sass syntax", "Дає змогу писати синтаксисом Sass"],
        ["Runs in the browser while the page is open", "Працює в браузері, поки сторінка відкрита"],
        ["Converts CSS into JavaScript", "Перетворює CSS на JavaScript"],
        [
          "Transforms ready CSS: adds vendor prefixes, minifies it, and polyfills newer syntax",
          "Перетворює готовий CSS: додає вендорні префікси, мініфікує й підтримує новіший синтаксис у старих браузерах",
        ],
      ],
      "d",
    ),
    question(
      "input-types",
      ["Which of these are real values of `<input type>`?", "Які з цих значень справді є значеннями `<input type>`?"],
      [
        ["`email`", "`email`"],
        ["`date`", "`date`"],
        ["`range`", "`range`"],
        ["`phone`", "`phone`"],
      ],
      ["a", "b", "c"],
    ),
  ],
};
