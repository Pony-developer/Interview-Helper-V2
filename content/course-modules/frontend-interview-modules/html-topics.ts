import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–10 of the HTML list: beginner level. */
export const htmlBeginnerQuiz: SlideDef = {
  kind: "quiz",
  slug: "html-beginner-quiz",
  title: { en: "Beginner", uk: "Початковий рівень" },
  questions: [
    question(
      "html5",
      ["Which statement about HTML5 is true?", "Яке твердження про HTML5 правильне?"],
      [
        ["HTML5 requires Flash for video", "HTML5 потребує Flash для відео"],
        [
          "It added semantic elements, native `<audio>`/`<video>`, `<canvas>`, new input types and APIs like Web Storage; today HTML is a \"living standard\" maintained by WHATWG rather than numbered versions",
          "Він додав семантичні елементи, нативні `<audio>`/`<video>`, `<canvas>`, нові типи полів і API на кшталт Web Storage; сьогодні HTML — це «живий стандарт» WHATWG, а не пронумеровані версії",
        ],
        ["HTML5 is a separate language that replaced HTML", "HTML5 — окрема мова, що замінила HTML"],
        ["HTML5 removed forms", "HTML5 прибрав форми"],
      ],
      "b",
    ),
    question(
      "tag-vs-element",
      ["What is the difference between a tag and an element?", "Яка різниця між тегом і елементом?"],
      [
        ["They are the same", "Це одне й те саме"],
        ["An element is the closing tag only", "Елемент — це лише закривальний тег"],
        [
          "A tag is the markup in angle brackets, like `<p>` or `</p>`; an element is the whole thing in the DOM: the start tag, its content and the end tag (void elements like `<img>` have only a start tag)",
          "Тег — це розмітка в кутових дужках, як-от `<p>` чи `</p>`; елемент — це вся конструкція в DOM: відкривальний тег, вміст і закривальний тег (порожні елементи на кшталт `<img>` мають лише відкривальний)",
        ],
        ["A tag is CSS, an element is HTML", "Тег — це CSS, а елемент — HTML"],
      ],
      "c",
    ),
    question(
      "section-article-div",
      ["Which pairing of `<article>`, `<section>` and `<div>` is correct?", "Яке поєднання для `<article>`, `<section>` і `<div>` правильне?"],
      [
        [
          "`<article>` is self-contained content that makes sense on its own (a post, a comment); `<section>` groups thematically related content, usually with a heading; `<div>` has no meaning and is for styling or layout",
          "`<article>` — самодостатній вміст, що має сенс окремо (допис, коментар); `<section>` групує тематично пов'язаний вміст, зазвичай із заголовком; `<div>` не має змісту й потрібен для стилізації чи розташування",
        ],
        ["All three are just containers with no difference", "Усі три — просто контейнери без різниці"],
        ["`<div>` is semantic, `<section>` is not", "`<div>` семантичний, а `<section>` ні"],
        ["`<article>` can only contain text", "`<article>` може містити лише текст"],
      ],
      "a",
    ),
    question(
      "relative-urls",
      [
        "On the page `https://site.com/blog/post.html`, where do `href=\"img/a.png\"` and `href=\"/img/a.png\"` point?",
        "На сторінці `https://site.com/blog/post.html` куди ведуть `href=\"img/a.png\"` і `href=\"/img/a.png\"`?",
      ],
      [
        ["Both to `https://site.com/img/a.png`", "Обидва на `https://site.com/img/a.png`"],
        ["Both to `https://site.com/blog/img/a.png`", "Обидва на `https://site.com/blog/img/a.png`"],
        ["Neither works without a full `https://` address", "Жодне не працює без повної адреси з `https://`"],
        [
          "`https://site.com/blog/img/a.png` (relative to the current folder) and `https://site.com/img/a.png` (relative to the site root)",
          "`https://site.com/blog/img/a.png` (відносно поточної теки) і `https://site.com/img/a.png` (відносно кореня сайту)",
        ],
      ],
      "d",
    ),
    question(
      "form-action",
      ["Where is a form sent if it has no `action` attribute?", "Куди надсилається форма без атрибута `action`?"],
      [
        ["Nowhere: it can't be submitted", "Нікуди: її неможливо надіслати"],
        ["To the URL of the current page", "На URL поточної сторінки"],
        ["To the site's home page", "На головну сторінку сайту"],
        ["To the browser's search engine", "До пошукової системи браузера"],
      ],
      "b",
    ),
    question(
      "mailto-tel",
      ["Which links open an email draft or start a phone call?", "Які посилання відкривають чернетку листа чи починають дзвінок?"],
      [
        ["`<a href=\"mailto:hello@example.com?subject=Hi\">`", "`<a href=\"mailto:hello@example.com?subject=Hi\">`"],
        ["`<a href=\"tel:+380441234567\">`", "`<a href=\"tel:+380441234567\">`"],
        ["`<a email=\"hello@example.com\">`", "`<a email=\"hello@example.com\">`"],
        ["`<mail to=\"hello@example.com\">`", "`<mail to=\"hello@example.com\">`"],
      ],
      ["a", "b"],
    ),
    question(
      "checkbox-group",
      ["Which statements about a group of checkboxes are true?", "Які твердження про групу чекбоксів правильні?"],
      [
        ["Wrapping them in `<fieldset>` with a `<legend>` gives the group a name that screen readers announce", "Обгортка в `<fieldset>` з `<legend>` дає групі назву, яку оголошують скринрідери"],
        ["Checkboxes with the same `name` send each checked `value`", "Чекбокси з однаковим `name` надсилають кожне позначене `value`"],
        ["An unchecked checkbox sends `false` to the server", "Непозначений чекбокс надсилає на сервер `false`"],
        ["The `checked` attribute pre-selects a box", "Атрибут `checked` позначає чекбокс заздалегідь"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "label-for",
      ["What does `<label for=\"email\">Email</label><input id=\"email\">` give you?", "Що дає `<label for=\"email\">Email</label><input id=\"email\">`?"],
      [
        [
          "Screen readers announce \"Email\" for the field, and clicking the label focuses the input (for a checkbox it toggles it), which makes the target bigger; wrapping the input inside `<label>` works too",
          "Скринрідери оголошують «Email» для поля, а клік на підпис фокусує поле (для чекбокса — перемикає його), що збільшує область натискання; обгорнути поле в `<label>` теж можна",
        ],
        ["Only a bolder label", "Лише жирніший підпис"],
        ["Automatic email validation", "Автоматичну валідацію email"],
        ["Nothing: `for` is a deprecated attribute", "Нічого: `for` — застарілий атрибут"],
      ],
      "a",
    ),
    question(
      "select",
      ["Which statement about `<select>` is true?", "Яке твердження про `<select>` правильне?"],
      [
        ["Options are written as `<item>` elements", "Варіанти записують як елементи `<item>`"],
        ["Users can type any value that is not in the list", "Користувачі можуть ввести будь-яке значення, якого немає в списку"],
        [
          "The form sends the `value` of the chosen `<option>`; `selected` pre-selects one, `<optgroup>` groups options, and `multiple` allows several choices",
          "Форма надсилає `value` обраного `<option>`; `selected` обирає варіант заздалегідь, `<optgroup>` групує варіанти, а `multiple` дозволяє кілька виборів",
        ],
        ["`<select>` doesn't need a `name` to be submitted", "Щоб надіслати `<select>`, `name` не потрібен"],
      ],
      "c",
    ),
    question(
      "blockquote-cite",
      ["Which statement about quotations is true?", "Яке твердження про цитати правильне?"],
      [
        ["The `cite` attribute is shown to the reader as a caption", "Атрибут `cite` показується читачу як підпис"],
        ["`<blockquote>` is only for indenting text", "`<blockquote>` потрібен лише для відступу тексту"],
        ["`<q>` and `<blockquote>` are the same", "`<q>` і `<blockquote>` однакові"],
        [
          "`<blockquote>` is for a longer quotation from another source and `<q>` for a short inline one; the `cite` attribute holds the source URL but isn't displayed, so a visible credit goes in text (for example with `<cite>` for a work's title)",
          "`<blockquote>` — для довшої цитати з іншого джерела, `<q>` — для короткої в рядку; атрибут `cite` містить URL джерела, але не показується, тож видиме посилання на джерело пишуть текстом (наприклад, з `<cite>` для назви твору)",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 11–22 of the HTML list: intermediate level. */
export const htmlIntermediateQuiz: SlideDef = {
  kind: "quiz",
  slug: "html-intermediate-quiz",
  title: { en: "Intermediate", uk: "Середній рівень" },
  questions: [
    question(
      "video-audio",
      ["Which statements about `<video>` and `<audio>` are true?", "Які твердження про `<video>` і `<audio>` правильні?"],
      [
        ["Several `<source>` elements with `type` let the browser pick a format it supports (MP4, WebM, MP3, Ogg)", "Кілька елементів `<source>` з `type` дають браузеру обрати формат, який він підтримує (MP4, WebM, MP3, Ogg)"],
        ["`<track kind=\"captions\">` adds captions", "`<track kind=\"captions\">` додає субтитри"],
        ["Browsers usually allow `autoplay` only when the video is `muted`", "Браузери зазвичай дозволяють `autoplay` лише тоді, коли відео `muted`"],
        ["Videos need the Flash plugin", "Відео потребують плагіна Flash"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "noscript",
      ["What is `<noscript>` for?", "Для чого `<noscript>`?"],
      [
        ["It disables JavaScript on the page", "Він вимикає JavaScript на сторінці"],
        [
          "Its content is shown only when scripts can't run, so users with JavaScript disabled or blocked still get a message or a basic fallback",
          "Його вміст показується лише тоді, коли скрипти не можуть виконатися, тож користувачі з вимкненим чи заблокованим JavaScript усе одно бачать повідомлення чи базову альтернативу",
        ],
        ["It hides scripts from search engines", "Він ховає скрипти від пошукових систем"],
        ["It marks scripts as asynchronous", "Він позначає скрипти як асинхронні"],
      ],
      "b",
    ),
    question(
      "textarea",
      ["How do you set the default text of a `<textarea>`?", "Як задати текст `<textarea>` за замовчуванням?"],
      [
        ["With a `value` attribute", "Атрибутом `value`"],
        ["With a `text` attribute", "Атрибутом `text`"],
        [
          "Between the opening and closing tags, `<textarea>Default text</textarea>`; `rows` and `cols` (or CSS) set the size, and `maxlength` limits the length",
          "Між відкривальним і закривальним тегами: `<textarea>Текст за замовчуванням</textarea>`; `rows` і `cols` (або CSS) задають розмір, а `maxlength` обмежує довжину",
        ],
        ["With a `placeholder`, which is submitted as the value", "Через `placeholder`, який надсилається як значення"],
      ],
      "c",
    ),
    question(
      "base-tag",
      [
        "A page has `<base href=\"https://cdn.example.com/\">`. What happens to the link `<a href=\"#top\">`?",
        "На сторінці є `<base href=\"https://cdn.example.com/\">`. Що станеться з посиланням `<a href=\"#top\">`?",
      ],
      [
        ["It still scrolls to `#top` on the current page", "Воно й далі прокручує до `#top` на поточній сторінці"],
        ["It stops working entirely", "Воно взагалі перестає працювати"],
        ["It opens in a new tab", "Воно відкривається в новій вкладці"],
        [
          "It goes to `https://cdn.example.com/#top`: `<base>` changes how every relative URL resolves, including fragment links, which is its classic pitfall",
          "Воно веде на `https://cdn.example.com/#top`: `<base>` змінює, як розв'язуються всі відносні URL, зокрема посилання-якорі, і це його класична пастка",
        ],
      ],
      "d",
    ),
    question(
      "enctype",
      ["When does a form need `enctype=\"multipart/form-data\"`?", "Коли формі потрібен `enctype=\"multipart/form-data\"`?"],
      [
        [
          "When it uploads files through `<input type=\"file\">`, together with `method=\"post\"`; the default `application/x-www-form-urlencoded` can't carry binary file contents",
          "Коли вона завантажує файли через `<input type=\"file\">`, разом із `method=\"post\"`; стандартний `application/x-www-form-urlencoded` не може передати двійковий вміст файлів",
        ],
        ["For every form with a password", "Для кожної форми з паролем"],
        ["Only with `method=\"get\"`", "Лише з `method=\"get\"`"],
        ["Never: browsers pick the encoding automatically", "Ніколи: браузери обирають кодування автоматично"],
      ],
      "a",
    ),
    question(
      "hidden-input",
      ["Which statement about `<input type=\"hidden\">` is true?", "Яке твердження про `<input type=\"hidden\">` правильне?"],
      [
        ["Users cannot see or change its value, so it is safe for prices and permissions", "Користувачі не можуть побачити чи змінити його значення, тож воно безпечне для цін і прав доступу"],
        ["It is not submitted with the form", "Воно не надсилається з формою"],
        [
          "It is submitted with the form but not shown; anyone can still see and edit it in DevTools, so the server must never trust it for prices or permissions",
          "Воно надсилається з формою, але не показується; утім будь-хто може побачити й змінити його в DevTools, тож сервер ніколи не має довіряти йому ціни чи права доступу",
        ],
        ["It encrypts its value", "Воно шифрує своє значення"],
      ],
      "c",
    ),
    question(
      "address",
      ["What is `<address>` meant for?", "Для чого призначений `<address>`?"],
      [
        ["Any postal address on the page, such as a shipping address in an order", "Будь-якої поштової адреси на сторінці, як-от адреси доставки в замовленні"],
        ["The page's URL", "URL сторінки"],
        ["IP addresses", "IP-адрес"],
        [
          "Contact information for the author or owner of the nearest `<article>` or of the whole page, such as an email, a link or a street address",
          "Контактних даних автора чи власника найближчого `<article>` або всієї сторінки, як-от email, посилання чи поштова адреса",
        ],
      ],
      "d",
    ),
    question(
      "lang",
      ["What does `<html lang=\"uk\">` affect?", "На що впливає `<html lang=\"uk\">`?"],
      [
        [
          "Screen reader pronunciation, hyphenation, translation offers, spell checking and search engines; a part in another language gets its own `lang`, such as `<span lang=\"en\">`",
          "Вимову скринрідерів, перенесення слів, пропозиції перекладу, перевірку орфографії та пошукові системи; частина іншою мовою отримує власний `lang`, як-от `<span lang=\"en\">`",
        ],
        ["Only the font", "Лише шрифт"],
        ["Nothing: it is purely decorative", "Ні на що: це суто декоративний атрибут"],
        ["It translates the page automatically", "Він автоматично перекладає сторінку"],
      ],
      "a",
    ),
    question(
      "contenteditable",
      ["Which statement about `contenteditable` is true?", "Яке твердження про `contenteditable` правильне?"],
      [
        ["Changes are saved to the server automatically", "Зміни автоматично зберігаються на сервері"],
        [
          "It lets the user edit an element's content in place; saving needs JavaScript, and the edited HTML must be sanitized before it is stored or shown to others, because of XSS",
          "Він дає користувачу редагувати вміст елемента на місці; для збереження потрібен JavaScript, а відредагований HTML треба санітизувати, перш ніж зберігати чи показувати іншим, через XSS",
        ],
        ["It works only on `<input>` elements", "Він працює лише з елементами `<input>`"],
        ["It makes the element read-only", "Він робить елемент лише для читання"],
      ],
      "b",
    ),
    question(
      "entities",
      ["Which statement about HTML entities is true?", "Яке твердження про HTML-сутності правильне?"],
      [
        ["Every non-Latin character must be written as an entity", "Кожен нелатинський символ треба писати як сутність"],
        ["Entities work only inside `<script>`", "Сутності працюють лише всередині `<script>`"],
        [
          "`&lt;`, `&amp;` and `&quot;` let you show characters that HTML would otherwise treat as markup; with UTF-8 you can type `©` directly or write `&copy;` / `&#169;`, and `&nbsp;` is a non-breaking space",
          "`&lt;`, `&amp;` і `&quot;` дають показати символи, які HTML інакше сприйняв би як розмітку; з UTF-8 можна писати `©` напряму або `&copy;` / `&#169;`, а `&nbsp;` — нерозривний пробіл",
        ],
        ["Entities are a CSS feature", "Сутності — це можливість CSS"],
      ],
      "c",
    ),
    question(
      "canvas-vs-svg",
      ["How does `<canvas>` differ from SVG?", "Чим `<canvas>` відрізняється від SVG?"],
      [
        ["They are the same", "Вони однакові"],
        ["SVG is drawn only with JavaScript, canvas with markup", "SVG малюється лише через JavaScript, а canvas — розміткою"],
        ["Canvas scales without losing quality, SVG doesn't", "Canvas масштабується без втрати якості, а SVG ні"],
        [
          "Canvas is a pixel bitmap you draw with JavaScript: fast for many objects, games and charts, but with no DOM for each shape; SVG is vector markup where each shape is a DOM element you can style, animate, make accessible and attach events to",
          "Canvas — це піксельне зображення, яке малюють через JavaScript: швидке для багатьох об'єктів, ігор і графіків, але без DOM для кожної фігури; SVG — векторна розмітка, де кожна фігура є DOM-елементом, який можна стилізувати, анімувати, зробити доступним і повісити на нього події",
        ],
      ],
      "d",
    ),
    question(
      "geolocation",
      ["Which statements about the Geolocation API are true?", "Які твердження про Geolocation API правильні?"],
      [
        ["`navigator.geolocation.getCurrentPosition(onSuccess, onError)` returns the position asynchronously", "`navigator.geolocation.getCurrentPosition(onSuccess, onError)` повертає позицію асинхронно"],
        ["It works only on HTTPS and only after the user grants permission", "Він працює лише через HTTPS і лише після дозволу користувача"],
        ["You must handle errors, because the user can refuse or the position can be unavailable", "Помилки треба обробляти, бо користувач може відмовити чи позиція може бути недоступна"],
        ["It returns the exact street address without asking", "Він повертає точну поштову адресу без запиту"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 23–32 of the HTML list: advanced level. */
export const htmlAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "html-advanced-quiz",
  title: { en: "Advanced", uk: "Просунутий рівень" },
  questions: [
    question(
      "template-tag",
      ["What happens to the content of a `<template>`?", "Що відбувається із вмістом `<template>`?"],
      [
        [
          "It is parsed but inert: not rendered, its scripts don't run and its images don't load, until JavaScript clones `template.content` into the page",
          "Він розбирається, але неактивний: не рендериться, його скрипти не виконуються, а зображення не завантажуються, доки JavaScript не склонує `template.content` у сторінку",
        ],
        ["It is shown on the page but hidden from screen readers", "Він показується на сторінці, але прихований від скринрідерів"],
        ["It is ignored by the browser completely", "Браузер повністю його ігнорує"],
        ["It is rendered only on the server", "Він рендериться лише на сервері"],
      ],
      "a",
    ),
    question(
      "link-rel",
      ["Which of these are valid `rel` values for `<link>`?", "Які з цих значень `rel` правильні для `<link>`?"],
      [
        ["`stylesheet` and `icon`", "`stylesheet` і `icon`"],
        ["`preload` and `preconnect`", "`preload` і `preconnect`"],
        ["`canonical` and `alternate`", "`canonical` і `alternate`"],
        ["`javascript`", "`javascript`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "hreflang",
      ["How do you tell search engines about the language versions of a page?", "Як повідомити пошуковим системам про мовні версії сторінки?"],
      [
        ["With a `<meta name=\"languages\">` tag", "Тегом `<meta name=\"languages\">`"],
        ["With a separate domain for each language and nothing else", "Окремим доменом для кожної мови й більше нічого"],
        [
          "`<link rel=\"alternate\" hreflang=\"uk\" href=\"...\">` for each version, including the page itself, plus `hreflang=\"x-default\"` for the fallback",
          "`<link rel=\"alternate\" hreflang=\"uk\" href=\"...\">` для кожної версії, зокрема для самої сторінки, плюс `hreflang=\"x-default\"` для запасної",
        ],
        ["With the `lang` attribute alone", "Лише атрибутом `lang`"],
      ],
      "c",
    ),
    question(
      "output-tag",
      ["What is `<output>` for?", "Для чого `<output>`?"],
      [
        ["Printing the page", "Друк сторінки"],
        ["Logging to the console", "Виведення в консоль"],
        ["Showing a download progress bar", "Показ індикатора завантаження"],
        [
          "Showing the result of a calculation or a user action, such as a form's live total; its `for` attribute lists the ids of the inputs it depends on",
          "Показ результату обчислення чи дії користувача, як-от поточної суми у формі; його атрибут `for` перелічує id полів, від яких він залежить",
        ],
      ],
      "d",
    ),
    question(
      "datalist",
      ["How does `<input list=\"browsers\">` with a `<datalist id=\"browsers\">` differ from a `<select>`?", "Чим `<input list=\"browsers\">` із `<datalist id=\"browsers\">` відрізняється від `<select>`?"],
      [
        ["The user must pick one of the listed values", "Користувач мусить обрати одне зі значень у списку"],
        [
          "The list only suggests values: the user can pick one or type anything else",
          "Список лише пропонує значення: користувач може обрати одне з них або ввести будь-що інше",
        ],
        ["`<datalist>` renders as radio buttons", "`<datalist>` рендериться як радіокнопки"],
        ["It requires JavaScript", "Він потребує JavaScript"],
      ],
      "b",
    ),
    question(
      "defer-async",
      ["What is the difference between `defer` and `async` on a `<script src>`?", "Яка різниця між `defer` і `async` у `<script src>`?"],
      [
        ["`async` waits for the whole page, `defer` runs immediately", "`async` чекає на всю сторінку, а `defer` виконується одразу"],
        ["They are the same", "Вони однакові"],
        [
          "Both download in parallel without blocking parsing; `defer` scripts run after the HTML is parsed, in document order, while `async` scripts run as soon as they arrive, in any order (module scripts are deferred by default)",
          "Обидва завантажуються паралельно, не блокуючи розбір; скрипти з `defer` виконуються після розбору HTML у порядку документа, а з `async` — щойно завантажаться, у будь-якому порядку (скрипти-модулі за замовчуванням відкладені)",
        ],
        ["`defer` works only with inline scripts", "`defer` працює лише з inline-скриптами"],
      ],
      "c",
    ),
    question(
      "image-priority",
      ["How should the main hero image (the LCP element) be loaded?", "Як завантажувати головне зображення першого екрана (елемент LCP)?"],
      [
        [
          "Eagerly, with `fetchpriority=\"high\"` (and a `<link rel=\"preload\">` if it is discovered late); `loading=\"lazy\"` belongs only on images below the fold",
          "Одразу, з `fetchpriority=\"high\"` (і `<link rel=\"preload\">`, якщо браузер знаходить його пізно); `loading=\"lazy\"` ставлять лише на зображення нижче першого екрана",
        ],
        ["With `loading=\"lazy\"`, like every other image", "З `loading=\"lazy\"`, як і всі інші зображення"],
        ["With `fetchpriority=\"low\"`", "З `fetchpriority=\"low\"`"],
        ["As a CSS background loaded by JavaScript", "Як CSS-фон, що завантажується через JavaScript"],
      ],
      "a",
    ),
    question(
      "picture",
      ["Which statement about `<picture>` is true?", "Яке твердження про `<picture>` правильне?"],
      [
        ["It replaces `<img>`, so no `<img>` is needed inside", "Він замінює `<img>`, тож `<img>` усередині не потрібен"],
        ["It only works with SVG", "Він працює лише з SVG"],
        ["The browser downloads every `<source>`", "Браузер завантажує кожен `<source>`"],
        [
          "Its `<source>` elements choose an image by `media` (art direction) or `type` (formats like AVIF or WebP), and the required `<img>` inside is the fallback that carries `alt`; for plain size switching, `srcset` and `sizes` on `<img>` are enough",
          "Його елементи `<source>` обирають зображення за `media` (art direction) чи `type` (формати на кшталт AVIF чи WebP), а обов'язковий `<img>` усередині — запасний варіант з `alt`; для простого вибору розміру достатньо `srcset` і `sizes` на `<img>`",
        ],
      ],
      "d",
    ),
    question(
      "tabindex",
      ["Which pairing of `tabindex` values is correct?", "Яке поєднання значень `tabindex` правильне?"],
      [
        ["`-1` puts the element first in the tab order", "`-1` ставить елемент першим у порядку табуляції"],
        [
          "`0` adds an element to the natural tab order, `-1` makes it focusable only from code (for example a dialog's heading), and positive values reorder focus and should be avoided",
          "`0` додає елемент у природний порядок табуляції, `-1` робить його фокусованим лише з коду (наприклад, заголовок діалогу), а додатні значення змінюють порядок фокуса, і їх варто уникати",
        ],
        ["`tabindex` works only on links", "`tabindex` працює лише з посиланнями"],
        ["`0` removes the element from the tab order", "`0` прибирає елемент із порядку табуляції"],
      ],
      "b",
    ),
    question(
      "global-attributes",
      ["Which of these are global attributes that work on any element?", "Які з цих атрибутів глобальні, тобто працюють на будь-якому елементі?"],
      [
        ["`hidden` and `title`", "`hidden` і `title`"],
        ["`lang`, `dir` and `tabindex`", "`lang`, `dir` і `tabindex`"],
        ["`href` and `src`", "`href` і `src`"],
        ["`data-*`, `contenteditable` and `inert`", "`data-*`, `contenteditable` і `inert`"],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 33–38 of the HTML list: HTML in React apps. */
export const htmlReactQuiz: SlideDef = {
  kind: "quiz",
  slug: "html-react-quiz",
  title: { en: "HTML in React apps", uk: "HTML у React-застосунках" },
  questions: [
    question(
      "jsx-attributes",
      ["Which statement about attributes in JSX is true?", "Яке твердження про атрибути в JSX правильне?"],
      [
        ["`aria-*` attributes must be written in camelCase, like `ariaLabel`", "Атрибути `aria-*` треба писати в camelCase, як-от `ariaLabel`"],
        ["React strips `data-*` attributes from the DOM", "React прибирає атрибути `data-*` з DOM"],
        [
          "Most attributes are camelCase props (`className`, `htmlFor`, `tabIndex`), but `aria-*` and `data-*` keep their hyphenated names and go straight to the DOM node: `<button aria-label=\"Close\" data-testid=\"close\">`",
          "Більшість атрибутів — пропси в camelCase (`className`, `htmlFor`, `tabIndex`), але `aria-*` і `data-*` зберігають назви з дефісом і передаються прямо в DOM-вузол: `<button aria-label=\"Close\" data-testid=\"close\">`",
        ],
        ["`data-*` attributes only work in class components", "Атрибути `data-*` працюють лише в класових компонентах"],
      ],
      "c",
    ),
    question(
      "nested-nav",
      ["Which practices make a multi-level site navigation accessible and maintainable?", "Які практики роблять багаторівневу навігацію сайту доступною й зручною в підтримці?"],
      [
        ["A `<nav aria-label=\"Main\">` with nested `<ul>` lists, rendered recursively from the menu data", "`<nav aria-label=\"Main\">` із вкладеними списками `<ul>`, що рендеряться рекурсивно з даних меню"],
        ["A real `<button aria-expanded>` (with `aria-controls`) toggles each submenu, and Escape closes it and returns focus", "Справжня `<button aria-expanded>` (з `aria-controls`) розгортає кожне підменю, а Escape закриває його й повертає фокус"],
        ["Plain links and lists rather than `role=\"menu\"`, which is meant for application menus and changes keyboard behavior", "Звичайні посилання й списки замість `role=\"menu\"`, який призначений для меню застосунків і змінює поведінку клавіатури"],
        ["Submenus that open only on hover", "Підменю, що відкриваються лише при наведенні"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "critical-rendering-path",
      ["Which statements about HTML parsing and the critical rendering path are true?", "Які твердження про розбір HTML і критичний шлях рендерингу правильні?"],
      [
        ["The browser builds the DOM from HTML and the CSSOM from CSS, then the render tree, layout and paint", "Браузер будує DOM з HTML і CSSOM з CSS, потім дерево рендерингу, layout і paint"],
        ["A synchronous `<script>` stops HTML parsing, and CSS in `<head>` blocks the first render", "Синхронний `<script>` зупиняє розбір HTML, а CSS у `<head>` блокує перший рендеринг"],
        [
          "A very large or deep DOM slows style calculation, layout and memory; keep it lean, and `content-visibility: auto` skips rendering off-screen sections",
          "Дуже великий чи глибокий DOM сповільнює обчислення стилів, layout і споживає пам'ять; тримайте його компактним, а `content-visibility: auto` пропускає рендеринг секцій поза екраном",
        ],
        ["DOM size has no effect on performance", "Розмір DOM ніяк не впливає на продуктивність"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "progressive-enhancement",
      ["What does progressive enhancement mean for a React app?", "Що означає прогресивне покращення для React-застосунку?"],
      [
        ["Shipping the newest JavaScript features first", "Спершу постачати найновіші можливості JavaScript"],
        [
          "The server-rendered HTML works on its own: navigation uses real `<a href>` links and forms submit with `action`/`method`, so the page is usable before hydration or if JavaScript fails, and React then adds richer behavior",
          "HTML, відрендерений на сервері, працює сам: навігація використовує справжні посилання `<a href>`, а форми надсилаються через `action`/`method`, тож сторінкою можна користуватися до гідратації чи коли JavaScript не спрацював, а React потім додає багатшу поведінку",
        ],
        ["Clickable `<div>`s with `onClick` handlers instead of links and forms", "Клікабельні `<div>` з обробниками `onClick` замість посилань і форм"],
        ["Showing a blank page until all JavaScript has loaded", "Показувати порожню сторінку, доки не завантажиться весь JavaScript"],
      ],
      "b",
    ),
    question(
      "hydration-mismatch",
      ["Which of these cause hydration mismatches in a server-rendered React app?", "Що з цього спричиняє розбіжності під час гідратації в React-застосунку з рендерингом на сервері?"],
      [
        ["Reading `window` or `localStorage` during render to decide what to show", "Читання `window` чи `localStorage` під час рендеру, щоб вирішити, що показати"],
        ["Rendering `Date.now()`, `Math.random()` or locale-dependent formatting that differs between server and browser", "Рендеринг `Date.now()`, `Math.random()` чи форматування, залежного від локалі, яке відрізняється на сервері й у браузері"],
        ["Generating element ids with a global counter instead of `useId`", "Генерування id елементів глобальним лічильником замість `useId`"],
        ["Moving browser-only logic into a `useEffect` that runs after hydration", "Перенесення логіки лише для браузера в `useEffect`, що виконується після гідратації"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "spa-metadata",
      ["What is the main pitfall of managing `<title>` and Open Graph `<meta>` tags only on the client in an SPA?", "Яка головна пастка, якщо в SPA керувати `<title>` і Open Graph `<meta>` лише на клієнті?"],
      [
        [
          "Many social and chat crawlers don't run JavaScript, so link previews show the default tags; per-route metadata should be in the server-rendered or prerendered HTML (Next.js metadata API, or React 19 hoisting `<title>` and `<meta>` from components), while client updates keep the tab title right during navigation",
          "Багато краулерів соцмереж і месенджерів не виконують JavaScript, тож попередній перегляд посилань показує стандартні теги; метадані кожного маршруту мають бути в HTML, відрендереному на сервері чи заздалегідь (metadata API у Next.js або React 19, що піднімає `<title>` і `<meta>` з компонентів), а оновлення на клієнті тримають правильним заголовок вкладки під час навігації",
        ],
        ["Browsers ignore `<meta>` tags added by JavaScript", "Браузери ігнорують теги `<meta>`, додані через JavaScript"],
        ["`document.title` can't be changed after the page loads", "`document.title` не можна змінити після завантаження сторінки"],
        ["There is no pitfall", "Пастки немає"],
      ],
      "a",
    ),
  ],
};

/** HTML questions: the unique part of an HTML-focused list, split by level. */
export const htmlTopicsModule: ModuleDef = {
  slug: "html-interview-questions",
  title: { en: "HTML questions", uk: "Питання з HTML" },
  slides: [
    { kind: "lecture", slug: "html-questions", title: { en: "Questions", uk: "Питання" } },
    htmlBeginnerQuiz,
    htmlIntermediateQuiz,
    htmlAdvancedQuiz,
    htmlReactQuiz,
  ],
};
