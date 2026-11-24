import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–25 of the CSS list. */
export const cssTopicsQuiz: SlideDef = {
  kind: "quiz",
  slug: "css-topics-quiz",
  title: { en: "CSS questions", uk: "Питання з CSS" },
  questions: [
    question(
      "css-versions",
      ["Which statement about CSS versions is true?", "Яке твердження про версії CSS правильне?"],
      [
        ["CSS4 is the latest version, released as one big specification", "CSS4 — остання версія, випущена однією великою специфікацією"],
        ["CSS3 was the last release, and CSS hasn't changed since", "CSS3 був останнім релізом, і відтоді CSS не змінювався"],
        [
          "After CSS 2.1, CSS was split into separate modules (Selectors, Color, Grid and so on) that each advance in their own levels, so there is no single \"CSS4\"",
          "Після CSS 2.1 CSS розділили на окремі модулі (Selectors, Color, Grid тощо), кожен із яких розвивається своїми рівнями, тож єдиного «CSS4» немає",
        ],
        ["Each browser has its own CSS version", "Кожен браузер має власну версію CSS"],
      ],
      "c",
    ),
    question(
      "css-syntax",
      ["Which of these is valid CSS?", "Що з цього — валідний CSS?"],
      [
        ["`p { color: red; font-size: 16px; } /* a comment */`", "`p { color: red; font-size: 16px; } /* коментар */`"],
        ["`p ( color = red ) // a comment`", "`p ( color = red ) // коментар`"],
        ["`p: { color: red, font-size: 16px }`", "`p: { color: red, font-size: 16px }`"],
        ["`<p> color: red; </p>`", "`<p> color: red; </p>`"],
      ],
      "a",
    ),
    question(
      "style-priority",
      [
        "A `<style>` block in `<head>` and an external stylesheet set different colors for `p` with the same selector. Which one wins?",
        "Блок `<style>` у `<head>` і зовнішня таблиця стилів задають різні кольори для `p` тим самим селектором. Що переможе?",
      ],
      [
        ["Always the `<style>` block, because internal styles beat external ones", "Завжди блок `<style>`, бо внутрішні стилі сильніші за зовнішні"],
        ["Always the external stylesheet", "Завжди зовнішня таблиця стилів"],
        ["Neither: the text becomes black", "Жоден: текст стане чорним"],
        [
          "Whichever comes later in the document: both are author styles with the same specificity, so source order decides; only an inline `style` attribute beats them (unless `!important` is involved)",
          "Той, що йде пізніше в документі: обидва — авторські стилі з однаковою специфічністю, тож вирішує порядок у коді; сильніший за них лише inline-атрибут `style` (якщо не втручається `!important`)",
        ],
      ],
      "d",
    ),
    question(
      "skip-link",
      ["How should a \"Skip to content\" link be hidden until it gets focus?", "Як приховати посилання «Перейти до вмісту», доки воно не отримає фокус?"],
      [
        ["With `display: none`, shown on hover", "Через `display: none`, з показом на hover"],
        [
          "With a visually-hidden class (a 1px clipped box, `clip-path: inset(50%)`) that keeps it in the tab order and the accessibility tree, and undo it on `:focus`",
          "Класом visually-hidden (обрізаний блок 1px, `clip-path: inset(50%)`), що лишає його в порядку табуляції та в дереві доступності, і скасовувати це на `:focus`",
        ],
        ["With `visibility: hidden`", "Через `visibility: hidden`"],
        ["With `aria-hidden=\"true\"`", "Через `aria-hidden=\"true\"`"],
      ],
      "b",
    ),
    question(
      "reset-normalize",
      ["How does a CSS reset differ from Normalize.css?", "Чим CSS reset відрізняється від Normalize.css?"],
      [
        [
          "A reset removes most browser defaults (margins, list styles, heading sizes) so you style everything yourself; a normalizer keeps useful defaults and only fixes differences between browsers",
          "Reset прибирає більшість стилів браузера за замовчуванням (відступи, стилі списків, розміри заголовків), тож усе стилізуєте самі; нормалізатор зберігає корисні стилі й лише виправляє відмінності між браузерами",
        ],
        ["They are the same thing", "Це одне й те саме"],
        ["A normalizer removes all styles, a reset keeps them", "Нормалізатор прибирає всі стилі, а reset їх зберігає"],
        ["A reset is JavaScript, a normalizer is CSS", "Reset — це JavaScript, а нормалізатор — CSS"],
      ],
      "a",
    ),
    question(
      "backgrounds",
      ["Which statement about background properties is true?", "Яке твердження про властивості фону правильне?"],
      [
        ["`background-color` accepts gradients", "`background-color` приймає градієнти"],
        ["`background-image` can only show one image", "`background-image` може показати лише одне зображення"],
        [
          "`background-size: cover` fills the box and may crop the image, `contain` fits the whole image; `background-repeat`, `background-position` and `background-attachment: fixed` control tiling, placement and scrolling",
          "`background-size: cover` заповнює блок і може обрізати зображення, `contain` вміщує його цілком; `background-repeat`, `background-position` і `background-attachment: fixed` керують повторенням, розміщенням і прокруткою",
        ],
        ["A background image is repeated only if you set `background-repeat: repeat`", "Фонове зображення повторюється, лише якщо задати `background-repeat: repeat`"],
      ],
      "c",
    ),
    question(
      "border-style",
      ["Why does `div { border: 2px red; }` show no border?", "Чому `div { border: 2px red; }` не показує рамки?"],
      [
        ["Because `red` is not a valid border color", "Бо `red` — неприпустимий колір рамки"],
        ["Because borders need `display: block`", "Бо рамкам потрібен `display: block`"],
        ["Because `2px` is too thin", "Бо `2px` — це надто тонко"],
        ["Because `border-style` is missing: it defaults to `none`, so add `solid`, `dashed` or another style", "Бо бракує `border-style`: за замовчуванням він `none`, тож треба додати `solid`, `dashed` чи інший стиль"],
      ],
      "d",
    ),
    question(
      "margin-shorthand",
      ["What does `margin: 40px 100px 120px 80px` set?", "Що задає `margin: 40px 100px 120px 80px`?"],
      [
        ["Left 40px, top 100px, right 120px, bottom 80px", "Ліворуч 40px, згори 100px, праворуч 120px, знизу 80px"],
        ["Top 40px, right 100px, bottom 120px, left 80px (clockwise from the top)", "Згори 40px, праворуч 100px, знизу 120px, ліворуч 80px (за годинниковою стрілкою від верху)"],
        ["Top 40px, bottom 100px, left 120px, right 80px", "Згори 40px, знизу 100px, ліворуч 120px, праворуч 80px"],
        ["It is invalid: `margin` takes at most two values", "Це невалідно: `margin` приймає щонайбільше два значення"],
      ],
      "b",
    ),
    question(
      "border-outline",
      ["How does `outline` differ from `border`?", "Чим `outline` відрізняється від `border`?"],
      [
        [
          "An outline takes no space in the layout and can't differ per side; it's drawn outside the border (and can be moved with `outline-offset`), which is why it's used for focus indicators",
          "Outline не займає місця в макеті й не може відрізнятися з різних боків; він малюється поза рамкою (і зсувається через `outline-offset`), тому його використовують для індикаторів фокуса",
        ],
        ["An outline adds to the element's size", "Outline додається до розміру елемента"],
        ["An outline is drawn inside the padding", "Outline малюється всередині padding"],
        ["They are identical", "Вони однакові"],
      ],
      "a",
    ),
    question(
      "text-transform",
      ["What does `text-transform: uppercase` do?", "Що робить `text-transform: uppercase`?"],
      [
        ["Changes the text in the HTML to capitals", "Змінює текст у HTML на великі літери"],
        ["Makes the text bold", "Робить текст жирним"],
        [
          "Shows the text in capitals without changing the source text, so the content in the HTML stays as it was written",
          "Показує текст великими літерами, не змінюючи вихідного тексту, тож вміст у HTML лишається таким, як його написано",
        ],
        ["Increases the font size", "Збільшує розмір шрифту"],
      ],
      "c",
    ),
    question(
      "link-states",
      ["In which order should link state rules be written so that they all work?", "У якому порядку писати правила для станів посилання, щоб усі вони працювали?"],
      [
        ["`:hover`, `:active`, `:link`, `:visited`", "`:hover`, `:active`, `:link`, `:visited`"],
        ["`:active`, `:hover`, `:visited`, `:link`", "`:active`, `:hover`, `:visited`, `:link`"],
        ["Order doesn't matter", "Порядок не має значення"],
        [
          "`:link`, `:visited`, `:hover`, `:active` (\"LoVe HAte\"): they have the same specificity, so later rules win",
          "`:link`, `:visited`, `:hover`, `:active` («LoVe HAte»): у них однакова специфічність, тож перемагають пізніші правила",
        ],
      ],
      "d",
    ),
    question(
      "list-marker-image",
      ["How can you use an image or a custom style for list markers?", "Як використати зображення чи власний стиль для маркерів списку?"],
      [
        ["`list-style-image: url(star.svg)`", "`list-style-image: url(star.svg)`"],
        ["The `::marker` pseudo-element, for example to change the marker's color", "Псевдоелемент `::marker`, наприклад щоб змінити колір маркера"],
        ["`list-style: none` plus an `li::before` with a background image", "`list-style: none` разом з `li::before` із фоновим зображенням"],
        ["`<li marker=\"star.png\">`", "`<li marker=\"star.png\">`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "overflow",
      ["Which statement about `overflow` is true?", "Яке твердження про `overflow` правильне?"],
      [
        [
          "`auto` shows scrollbars only when the content doesn't fit, `scroll` always shows them, `hidden` clips without scrollbars, and `visible` (the default) lets content spill out",
          "`auto` показує смуги прокрутки лише тоді, коли вміст не вміщується, `scroll` показує їх завжди, `hidden` обрізає без смуг, а `visible` (за замовчуванням) дає вмісту вилазити назовні",
        ],
        ["`overflow` works only on images", "`overflow` працює лише із зображеннями"],
        ["`hidden` deletes the overflowing content from the DOM", "`hidden` видаляє вміст, що не вмістився, з DOM"],
        ["`scroll` shows scrollbars only when needed", "`scroll` показує смуги прокрутки лише за потреби"],
      ],
      "a",
    ),
    question(
      "combinators",
      ["What do `h2 + p` and `h2 ~ p` select?", "Що вибирають `h2 + p` і `h2 ~ p`?"],
      [
        ["Both select every `p` inside an `h2`", "Обидва вибирають кожен `p` усередині `h2`"],
        [
          "`h2 + p` selects only the `p` immediately after an `h2`; `h2 ~ p` selects every `p` sibling that follows the `h2`",
          "`h2 + p` вибирає лише `p`, що йде одразу після `h2`; `h2 ~ p` вибирає кожен сусідній `p`, що йде після `h2`",
        ],
        ["`h2 + p` selects both `h2` and `p`", "`h2 + p` вибирає і `h2`, і `p`"],
        ["They select the `p` before the `h2`", "Вони вибирають `p` перед `h2`"],
      ],
      "b",
    ),
    question(
      "gradients",
      ["Which statement about CSS gradients is true?", "Яке твердження про CSS-градієнти правильне?"],
      [
        ["Gradients are set with `background-color`", "Градієнти задаються через `background-color`"],
        ["CSS supports only linear gradients", "CSS підтримує лише лінійні градієнти"],
        [
          "Gradients are images, so they go in `background-image` (or `background`): `linear-gradient(to right, red, blue)`, `radial-gradient(...)`, `conic-gradient(...)` and their `repeating-` versions",
          "Градієнти — це зображення, тож їх задають у `background-image` (чи `background`): `linear-gradient(to right, red, blue)`, `radial-gradient(...)`, `conic-gradient(...)` та їхні версії `repeating-`",
        ],
        ["Gradients need an SVG file", "Для градієнтів потрібен SVG-файл"],
      ],
      "c",
    ),
    question(
      "transforms",
      ["Which statements about CSS transforms are true?", "Які твердження про CSS-трансформації правильні?"],
      [
        ["The order matters: `translate(100px) rotate(45deg)` and `rotate(45deg) translate(100px)` give different results", "Порядок важливий: `translate(100px) rotate(45deg)` і `rotate(45deg) translate(100px)` дають різні результати"],
        ["Transforms don't affect the layout: the element keeps its original space", "Трансформації не впливають на макет: елемент зберігає своє початкове місце"],
        ["`rotateX` and `rotateY` look flat without `perspective` on the element or its parent", "`rotateX` і `rotateY` виглядають пласко без `perspective` на елементі чи його батькові"],
        ["`transform: scale(2)` doubles the element's `width` in the layout", "`transform: scale(2)` подвоює `width` елемента в макеті"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "case-sensitivity",
      ["Which parts of CSS are case-sensitive?", "Які частини CSS чутливі до регістру?"],
      [
        ["Property names, such as `COLOR` vs `color`", "Назви властивостей, як-от `COLOR` і `color`"],
        ["Keywords, such as `RED` vs `red`", "Ключові слова, як-от `RED` і `red`"],
        ["Nothing in CSS is case-sensitive", "У CSS ніщо не чутливе до регістру"],
        [
          "Things that come from outside CSS: class and id names (`.Card` doesn't match `class=\"card\"`), attribute values and URLs",
          "Те, що приходить ззовні CSS: назви класів та id (`.Card` не збігається з `class=\"card\"`), значення атрибутів і URL",
        ],
      ],
      "d",
    ),
    question(
      "counters",
      ["How do CSS counters number headings automatically?", "Як CSS-лічильники автоматично нумерують заголовки?"],
      [
        [
          "`counter-reset: section` on a parent, `counter-increment: section` on each heading, and `content: counter(section) \". \"` in its `::before`",
          "`counter-reset: section` на батьківському елементі, `counter-increment: section` на кожному заголовку й `content: counter(section) \". \"` у його `::before`",
        ],
        ["With JavaScript only", "Лише за допомогою JavaScript"],
        ["By putting every heading inside an `<ol>`", "Розмістивши кожен заголовок усередині `<ol>`"],
        ["With the `number` property", "Через властивість `number`"],
      ],
      "a",
    ),
    question(
      "pagination",
      ["How do you build accessible pagination?", "Як зробити доступну пагінацію?"],
      [
        ["A row of `<div>`s with click handlers", "Ряд `<div>` з обробниками кліку"],
        ["Numbers in a single `<p>`", "Числа в одному `<p>`"],
        [
          "A `<nav aria-label=\"Pagination\">` with a list of links, `aria-current=\"page\"` on the current page, and Flexbox for the layout",
          "`<nav aria-label=\"Pagination\">` зі списком посилань, `aria-current=\"page\"` на поточній сторінці та Flexbox для розташування",
        ],
        ["A `<select>` with every page number", "`<select>` з усіма номерами сторінок"],
      ],
      "c",
    ),
    question(
      "box-reflect",
      ["What is true about `-webkit-box-reflect`?", "Що правильно про `-webkit-box-reflect`?"],
      [
        ["It is standard CSS supported in every browser", "Це стандартний CSS, що підтримується в усіх браузерах"],
        [
          "It reflects an element (below, above, left or right) but is non-standard: it works in Chromium and Safari, not Firefox, so a portable alternative is a flipped copy with `transform: scaleY(-1)` and a fading `mask-image`",
          "Він віддзеркалює елемент (знизу, згори, ліворуч чи праворуч), але нестандартний: працює в Chromium і Safari, але не у Firefox, тож переносима альтернатива — перевернута копія з `transform: scaleY(-1)` і `mask-image`, що згасає",
        ],
        ["It only works on text", "Він працює лише з текстом"],
        ["It creates a reflection with JavaScript", "Він створює віддзеркалення за допомогою JavaScript"],
      ],
      "b",
    ),
    question(
      "multi-column",
      ["Which properties create a newspaper-style multi-column layout?", "Які властивості створюють багатоколонкову верстку, як у газеті?"],
      [
        ["`column-count` or `column-width`, with `column-gap` and `column-rule`", "`column-count` чи `column-width`, разом із `column-gap` і `column-rule`"],
        ["`column-span: all` for a heading that stretches across every column", "`column-span: all` для заголовка, що тягнеться через усі колонки"],
        ["`break-inside: avoid` to keep a block from being split between columns", "`break-inside: avoid`, щоб блок не розривався між колонками"],
        ["`grid-columns: 3` on a paragraph", "`grid-columns: 3` на абзаці"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "text-shadow",
      ["Which statement about `text-shadow` is true?", "Яке твердження про `text-shadow` правильне?"],
      [
        ["It takes a spread value and `inset`, like `box-shadow`", "Він приймає значення spread і `inset`, як `box-shadow`"],
        ["It only works with black", "Він працює лише з чорним кольором"],
        ["It needs JavaScript", "Йому потрібен JavaScript"],
        [
          "It takes `offset-x offset-y blur color`, for example `2px 2px 4px rgb(0 0 0 / 40%)`, and several shadows can be comma-separated; unlike `box-shadow`, it has no spread or `inset`",
          "Він приймає `offset-x offset-y blur color`, наприклад `2px 2px 4px rgb(0 0 0 / 40%)`, і кілька тіней можна перелічити через кому; на відміну від `box-shadow`, у нього немає spread та `inset`",
        ],
      ],
      "d",
    ),
    question(
      "attribute-selectors",
      ["Which selector matches links that point to PDF files?", "Який селектор знаходить посилання на PDF-файли?"],
      [
        ["`a[href^=\".pdf\"]`", "`a[href^=\".pdf\"]`"],
        ["`a[href$=\".pdf\"]`: `$=` means \"ends with\" (`^=` starts with, `*=` contains, `~=` a whole word in a list)", "`a[href$=\".pdf\"]`: `$=` означає «закінчується на» (`^=` — починається з, `*=` — містить, `~=` — ціле слово в списку)"],
        ["`a.pdf`", "`a.pdf`"],
        ["`a:pdf`", "`a:pdf`"],
      ],
      "b",
    ),
    question(
      "layout-ownership",
      ["How should layout responsibilities be split between React components?", "Як розподілити відповідальність за розташування між React-компонентами?"],
      [
        ["Every component sets its own outer `margin` and `position`, so it looks right on the first page that uses it", "Кожен компонент задає власні зовнішні `margin` і `position`, щоб добре виглядати на першій сторінці, де його використали"],
        ["All layout goes into one global stylesheet", "Усе розташування — в одній глобальній таблиці стилів"],
        [
          "Container components own the layout (Grid for the page shell, Flexbox inside a component, spacing with `gap`), while reusable components style only their own box and avoid outer margins, so they can be placed anywhere",
          "Компоненти-контейнери відповідають за розташування (Grid для каркаса сторінки, Flexbox усередині компонента, відступи через `gap`), а повторно використовувані компоненти стилізують лише свій блок і уникають зовнішніх відступів, тож їх можна розмістити будь-де",
        ],
        ["Layout should be computed in JavaScript and set with inline styles", "Розташування слід обчислювати в JavaScript і задавати inline-стилями"],
      ],
      "c",
    ),
    question(
      "theming",
      ["Which practices give theming with CSS custom properties and no flash of the wrong theme?", "Які практики дають теми на CSS custom properties без мерехтіння неправильної теми?"],
      [
        ["Semantic tokens on `:root` (`--color-bg`, `--color-text`) overridden under `[data-theme=\"dark\"]`, with `prefers-color-scheme` as the default", "Семантичні токени на `:root` (`--color-bg`, `--color-text`), перевизначені під `[data-theme=\"dark\"]`, з `prefers-color-scheme` як значенням за замовчуванням"],
        [
          "Apply the saved choice before the first paint, with a tiny inline script in `<head>` or by rendering the attribute on the server from a cookie, rather than in a `useEffect` after React loads",
          "Застосовувати збережений вибір до першого відмальовування, крихітним inline-скриптом у `<head>` або рендерячи атрибут на сервері з cookie, а не в `useEffect` після завантаження React",
        ],
        ["Set `color-scheme: light dark` so native controls and scrollbars match the theme", "Задати `color-scheme: light dark`, щоб нативні елементи керування й смуги прокрутки відповідали темі"],
        ["Make dark mode with `filter: invert(1)` on the `<html>` element", "Робити темну тему через `filter: invert(1)` на елементі `<html>`"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** CSS questions: the unique part of a CSS-focused list. */
export const cssTopicsModule: ModuleDef = {
  slug: "css-interview-questions",
  title: { en: "CSS questions", uk: "Питання з CSS" },
  slides: [{ kind: "lecture", slug: "css-questions", title: { en: "Questions", uk: "Питання" } }, cssTopicsQuiz],
};
