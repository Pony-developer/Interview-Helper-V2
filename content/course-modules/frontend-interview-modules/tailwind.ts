import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–14 of the Tailwind list: basics. */
export const tailwindBasicsQuiz: SlideDef = {
  kind: "quiz",
  slug: "tailwind-basics-quiz",
  title: { en: "Basics", uk: "Основи" },
  questions: [
    question(
      "utility-first",
      ["What does utility-first mean in Tailwind CSS?", "Що означає utility-first у Tailwind CSS?"],
      [
        ["Tailwind ships ready-made components such as cards and navbars", "Tailwind постачає готові компоненти, як-от картки й навбари"],
        [
          "You style elements with small single-purpose classes right in the markup (`flex`, `p-4`, `text-lg`) instead of writing your own CSS for each component; the framework itself is free and open source (MIT), while Tailwind Plus is a paid set of examples",
          "Елементи стилізують дрібними однофункціональними класами прямо в розмітці (`flex`, `p-4`, `text-lg`), а не пишуть власний CSS для кожного компонента; сам фреймворк безкоштовний і відкритий (MIT), а Tailwind Plus — платний набір прикладів",
        ],
        ["You write all CSS in JavaScript", "Увесь CSS пишуть у JavaScript"],
        ["It is a paid framework", "Це платний фреймворк"],
      ],
      "b",
    ),
    question(
      "setup",
      ["How do you add Tailwind CSS v4 to a project built with Vite?", "Як додати Tailwind CSS v4 до проєкту на Vite?"],
      [
        ["Copy `tailwind.min.css` from a CDN into production", "Скопіювати `tailwind.min.css` з CDN у продакшн"],
        ["Write `@tailwind base; @tailwind components; @tailwind utilities;` and nothing else", "Написати `@tailwind base; @tailwind components; @tailwind utilities;` і більше нічого"],
        [
          "Install `tailwindcss` with `@tailwindcss/vite` (or `@tailwindcss/postcss` / `@tailwindcss/cli`), add the plugin, and put `@import \"tailwindcss\";` in your CSS; the Play CDN is only for prototypes",
          "Встановити `tailwindcss` разом із `@tailwindcss/vite` (або `@tailwindcss/postcss` / `@tailwindcss/cli`), додати плагін і написати `@import \"tailwindcss\";` у своєму CSS; Play CDN — лише для прототипів",
        ],
        ["It can only be used with React", "Його можна використовувати лише з React"],
      ],
      "c",
    ),
    question(
      "vs-bootstrap",
      ["How does Tailwind CSS differ from Bootstrap?", "Чим Tailwind CSS відрізняється від Bootstrap?"],
      [
        [
          "Bootstrap is component-first (`.btn`, `.card`, `.navbar` with a default look); Tailwind gives low-level utilities and no pre-designed components, so you build your own design and ship only the CSS you use",
          "Bootstrap орієнтований на компоненти (`.btn`, `.card`, `.navbar` зі стандартним виглядом); Tailwind дає низькорівневі утиліти без готових компонентів, тож ви будуєте власний дизайн і постачаєте лише використаний CSS",
        ],
        ["Bootstrap has no grid", "У Bootstrap немає сітки"],
        ["Tailwind is a JavaScript UI library", "Tailwind — JavaScript-бібліотека UI"],
        ["They are the same", "Вони однакові"],
      ],
      "a",
    ),
    question(
      "pros-cons",
      ["Which of these are real pros and cons of Tailwind CSS?", "Які з цього — справжні переваги та недоліки Tailwind CSS?"],
      [
        ["Pro: fast styling without switching files and inventing class names, with a consistent spacing and color scale", "Перевага: швидка стилізація без перемикання файлів і вигадування назв класів, з єдиною шкалою відступів і кольорів"],
        ["Pro: the production CSS contains only the utilities you used", "Перевага: CSS для продакшну містить лише використані утиліти"],
        ["Con: long class lists in markup, and a learning curve for the class names", "Недолік: довгі списки класів у розмітці й час на вивчення назв класів"],
        ["Con: it cannot do responsive design", "Недолік: він не вміє в адаптивний дизайн"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "container",
      ["What does the `container` class do in Tailwind v4?", "Що робить клас `container` у Tailwind v4?"],
      [
        ["It centers the content and adds padding automatically", "Він автоматично центрує вміст і додає padding"],
        ["It creates a flex container", "Він створює flex-контейнер"],
        ["It limits the height to the screen", "Він обмежує висоту екраном"],
        [
          "It sets `width: 100%` and a `max-width` that matches each breakpoint; it doesn't center itself, so you add `mx-auto` (and padding such as `px-4`)",
          "Він задає `width: 100%` і `max-width` відповідно до кожного breakpoint; сам себе не центрує, тож додають `mx-auto` (і відступи на кшталт `px-4`)",
        ],
      ],
      "d",
    ),
    question(
      "centering",
      ["Which classes are right for these layouts?", "Які класи підходять для цих макетів?"],
      [
        ["Center a child both ways: `flex items-center justify-center` on the parent", "Відцентрувати дочірній елемент в обох напрямках: `flex items-center justify-center` на батьківському"],
        ["Center a child both ways: `grid place-items-center` on the parent", "Відцентрувати дочірній елемент в обох напрямках: `grid place-items-center` на батьківському"],
        ["Two elements on the left and right: `flex justify-between` on the parent", "Два елементи ліворуч і праворуч: `flex justify-between` на батьківському"],
        ["Center anything: `text-center` on the child", "Відцентрувати будь-що: `text-center` на дочірньому"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "space-vs-gap",
      ["How does `space-x-4` differ from `gap-4`?", "Чим `space-x-4` відрізняється від `gap-4`?"],
      [
        ["They are identical", "Вони однакові"],
        [
          "`space-x-4` adds margins to the children, which breaks when items wrap or are hidden; `gap-4` is a property of a flex or grid container and handles wrapping correctly, so it's usually preferred",
          "`space-x-4` додає margin дочірнім елементам, що ламається, коли елементи переносяться чи ховаються; `gap-4` — властивість flex- чи grid-контейнера, що правильно працює з перенесенням, тож зазвичай кращий",
        ],
        ["`gap-4` only works on tables", "`gap-4` працює лише з таблицями"],
        ["`space-x-4` adds padding to the parent", "`space-x-4` додає padding батьківському елементу"],
      ],
      "b",
    ),
    question(
      "grid",
      ["Which markup gives a 3-column grid where the first item spans two columns?", "Яка розмітка дає сітку з 3 колонок, де перший елемент займає дві колонки?"],
      [
        ["`<div class=\"flex cols-3\"><div class=\"span-2\">`", "`<div class=\"flex cols-3\"><div class=\"span-2\">`"],
        ["`<div class=\"grid-3\"><div class=\"double\">`", "`<div class=\"grid-3\"><div class=\"double\">`"],
        ["`<table class=\"grid\"><td colspan=\"2\">`", "`<table class=\"grid\"><td colspan=\"2\">`"],
        ["`<div class=\"grid grid-cols-3 gap-4\"><div class=\"col-span-2\">`", "`<div class=\"grid grid-cols-3 gap-4\"><div class=\"col-span-2\">`"],
      ],
      "d",
    ),
    question(
      "flex",
      ["Why does `<div class=\"flex-col items-center\">` not stack and center its children?", "Чому `<div class=\"flex-col items-center\">` не складає дочірні елементи в стовпчик і не центрує їх?"],
      [
        [
          "`flex-col` and `items-center` only take effect on a flex container, so `flex` is missing; other flex utilities include `order-first`, `grow`, `basis-1/2` and `flex-wrap`",
          "`flex-col` і `items-center` діють лише на flex-контейнері, тож бракує `flex`; інші flex-утиліти — `order-first`, `grow`, `basis-1/2` і `flex-wrap`",
        ],
        ["Because `flex-col` is not a Tailwind class", "Бо `flex-col` — не клас Tailwind"],
        ["Because `items-center` needs `!important`", "Бо `items-center` потребує `!important`"],
        ["Because Tailwind doesn't support Flexbox", "Бо Tailwind не підтримує Flexbox"],
      ],
      "a",
    ),
    question(
      "typography",
      ["Which classes match these text styles?", "Які класи відповідають цим стилям тексту?"],
      [
        ["Bold text: `bold`; wide letter spacing: `letter-wide`", "Жирний текст: `bold`; широкий міжлітерний інтервал: `letter-wide`"],
        ["Bold text: `text-bold`; monospace: `font-code`", "Жирний текст: `text-bold`; моноширинний: `font-code`"],
        [
          "Bold text: `font-bold`; font family: `font-sans`, `font-serif` or `font-mono`; letter spacing: `tracking-wide`; line height: `leading-relaxed`",
          "Жирний текст: `font-bold`; родина шрифтів: `font-sans`, `font-serif` чи `font-mono`; міжлітерний інтервал: `tracking-wide`; висота рядка: `leading-relaxed`",
        ],
        ["Tailwind has no text utilities", "У Tailwind немає утиліт для тексту"],
      ],
      "c",
    ),
    question(
      "shadows",
      ["How does `shadow-lg` differ from `drop-shadow-lg`?", "Чим `shadow-lg` відрізняється від `drop-shadow-lg`?"],
      [
        ["They are the same", "Вони однакові"],
        ["`drop-shadow-lg` only works on text", "`drop-shadow-lg` працює лише з текстом"],
        ["`shadow-lg` uses JavaScript", "`shadow-lg` використовує JavaScript"],
        [
          "`shadow-lg` is a `box-shadow` around the element's rectangle; `drop-shadow-lg` is a `filter` that follows the actual shape, such as a transparent PNG or an SVG icon",
          "`shadow-lg` — це `box-shadow` навколо прямокутника елемента; `drop-shadow-lg` — це `filter`, що повторює справжню форму, як-от прозорого PNG чи SVG-іконки",
        ],
      ],
      "d",
    ),
    question(
      "opacity",
      ["How does `opacity-50` differ from `bg-black/50`?", "Чим `opacity-50` відрізняється від `bg-black/50`?"],
      [
        [
          "`opacity-50` makes the whole element, text and children included, half transparent; `bg-black/50` makes only the background color half transparent and leaves the text solid (the v3 `bg-opacity-*` classes were removed in v4)",
          "`opacity-50` робить напівпрозорим увесь елемент разом із текстом і дочірніми; `bg-black/50` робить напівпрозорим лише колір фону, а текст лишається непрозорим (класи `bg-opacity-*` з v3 прибрали у v4)",
        ],
        ["They are the same", "Вони однакові"],
        ["`bg-black/50` divides the width by 50", "`bg-black/50` ділить ширину на 50"],
        ["`opacity-50` affects only the border", "`opacity-50` впливає лише на рамку"],
      ],
      "a",
    ),
    question(
      "transforms",
      ["Which classes rotate an element 45° counterclockwise and move it up by 0.25rem?", "Які класи обертають елемент на 45° проти годинникової стрілки й зсувають його вгору на 0.25rem?"],
      [
        ["`rotate-45 translate-y-1`", "`rotate-45 translate-y-1`"],
        ["`-rotate-45 -translate-y-1`", "`-rotate-45 -translate-y-1`"],
        ["`rotate-[-45] up-1`", "`rotate-[-45] up-1`"],
        ["`turn-left-45 move-up-1`", "`turn-left-45 move-up-1`"],
      ],
      "b",
    ),
    question(
      "misc-utilities",
      ["Which pairings of class and effect are correct?", "Які поєднання класу та ефекту правильні?"],
      [
        ["`border-collapse` merges table cell borders into one", "`border-collapse` зливає рамки клітинок таблиці в одну"],
        ["`cursor-pointer` shows a hand cursor, `cursor-not-allowed` a blocked one", "`cursor-pointer` показує курсор-руку, `cursor-not-allowed` — заборонний"],
        ["`resize-y` lets the user resize a `<textarea>` only vertically", "`resize-y` дозволяє користувачу змінювати розмір `<textarea>` лише по вертикалі"],
        ["`h-full` always fills the screen height, even when the parent has no height", "`h-full` завжди заповнює висоту екрана, навіть коли в батька немає висоти"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 15–28 of the Tailwind list: customization and advanced topics. */
export const tailwindAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "tailwind-advanced-quiz",
  title: { en: "Customization and advanced topics", uk: "Налаштування та просунуті теми" },
  questions: [
    question(
      "theme",
      ["How do you add a brand color and a font while keeping Tailwind's defaults in v4?", "Як у v4 додати фірмовий колір і шрифт, зберігши стандартні значення Tailwind?"],
      [
        ["Edit the files inside `node_modules/tailwindcss`", "Відредагувати файли в `node_modules/tailwindcss`"],
        ["Replace the whole `theme` object in the config", "Замінити весь об'єкт `theme` у конфігурації"],
        [
          "Define them in CSS with `@theme { --color-brand: #1d4ed8; --font-display: \"Inter\", sans-serif; }`, which creates `bg-brand`, `text-brand` and `font-display`; in v3 the same went into `theme.extend` in `tailwind.config.js`",
          "Оголосити їх у CSS через `@theme { --color-brand: #1d4ed8; --font-display: \"Inter\", sans-serif; }`, що створює `bg-brand`, `text-brand` і `font-display`; у v3 те саме писали в `theme.extend` у `tailwind.config.js`",
        ],
        ["Custom colors are not supported", "Власні кольори не підтримуються"],
      ],
      "c",
    ),
    question(
      "class-conflicts",
      ["`<p class=\"text-blue-500 text-red-500\">` — which color wins?", "`<p class=\"text-blue-500 text-red-500\">` — який колір переможе?"],
      [
        ["Red, because it comes last in the `class` attribute", "Червоний, бо він останній в атрибуті `class`"],
        ["Blue, because it comes first", "Синій, бо він перший"],
        ["The browser mixes them into purple", "Браузер змішає їх у фіолетовий"],
        [
          "Whichever rule comes later in the generated stylesheet: the order of classes in the attribute doesn't matter, so don't apply conflicting utilities (tools like `tailwind-merge` resolve them in components)",
          "Той, чиє правило стоїть пізніше в згенерованому CSS: порядок класів в атрибуті не важить, тож не ставте конфліктних утиліт (інструменти на кшталт `tailwind-merge` розв'язують це в компонентах)",
        ],
      ],
      "d",
    ),
    question(
      "responsive",
      ["What does `class=\"text-sm md:text-lg\"` do?", "Що робить `class=\"text-sm md:text-lg\"`?"],
      [
        [
          "Small text by default, and large text from the `md` breakpoint (768px) up: breakpoints are mobile-first `min-width` queries, so `md:` doesn't mean \"medium screens only\"",
          "Дрібний текст за замовчуванням і великий — від breakpoint `md` (768px) і ширше: breakpoints — це mobile-first запити `min-width`, тож `md:` не означає «лише середні екрани»",
        ],
        ["Large text only on medium screens and small text everywhere else", "Великий текст лише на середніх екранах, а дрібний — на всіх інших"],
        ["Large text on small screens", "Великий текст на малих екранах"],
        ["It is invalid: you can't combine two sizes", "Це невалідно: не можна поєднувати два розміри"],
      ],
      "a",
    ),
    question(
      "state-variants",
      ["Which statements about state variants are true?", "Які твердження про варіанти станів правильні?"],
      [
        ["`hover:bg-blue-700` applies only while the pointer is over the element", "`hover:bg-blue-700` застосовується лише тоді, коли вказівник над елементом"],
        ["`focus-visible:ring-2` shows a ring only for keyboard focus", "`focus-visible:ring-2` показує обведення лише для фокуса з клавіатури"],
        ["`group-hover:` styles a child when its parent marked with `group` is hovered", "`group-hover:` стилізує дочірній елемент, коли наведено на батька з класом `group`"],
        ["Variants only work with colors", "Варіанти працюють лише з кольорами"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "dark-mode",
      ["How does dark mode work in Tailwind?", "Як працює темна тема в Tailwind?"],
      [
        ["You need a separate stylesheet for dark mode", "Для темної теми потрібна окрема таблиця стилів"],
        [
          "`dark:` variants (`bg-white dark:bg-gray-900`) follow `prefers-color-scheme` by default; for a manual toggle you switch to a class strategy (in v4 with `@custom-variant dark`, in v3 with `darkMode: 'class'`) and add `dark` to `<html>`",
          "Варіанти `dark:` (`bg-white dark:bg-gray-900`) за замовчуванням слідують за `prefers-color-scheme`; для ручного перемикача переходять на стратегію з класом (у v4 через `@custom-variant dark`, у v3 через `darkMode: 'class'`) і додають `dark` до `<html>`",
        ],
        ["Dark mode isn't supported", "Темна тема не підтримується"],
        ["It inverts all colors with a filter", "Вона інвертує всі кольори фільтром"],
      ],
      "b",
    ),
    question(
      "missing-classes",
      ["Why might `` class={`bg-${color}-500`} `` produce no styles in production?", "Чому `` class={`bg-${color}-500`} `` може не дати стилів у продакшні?"],
      [
        ["Template literals aren't allowed in `class`", "Шаблонні рядки заборонені в `class`"],
        ["Production builds disable colors", "Продакшн-збірки вимикають кольори"],
        [
          "Tailwind generates only the classes it finds as complete strings in your source files, so a name assembled at runtime is never generated; map values to full class names (`{ red: 'bg-red-500' }`) or list them explicitly (`safelist` in v3, `@source inline()` in v4)",
          "Tailwind генерує лише ті класи, які знаходить у вихідних файлах як повні рядки, тож назва, зібрана під час виконання, ніколи не генерується; зіставте значення з повними назвами класів (`{ red: 'bg-red-500' }`) або перелічіть їх явно (`safelist` у v3, `@source inline()` у v4)",
        ],
        ["Because `500` isn't a valid shade", "Бо `500` — неприпустимий відтінок"],
      ],
      "c",
    ),
    question(
      "apply",
      ["What is the recommended way to reuse a long set of utilities, such as for a button or a card?", "Як рекомендовано повторно використовувати довгий набір утиліт, наприклад для кнопки чи картки?"],
      [
        ["Copy the classes everywhere", "Копіювати класи всюди"],
        ["Always move everything into `@apply` rules", "Завжди переносити все в правила `@apply`"],
        ["Use inline styles", "Використовувати inline-стилі"],
        [
          "Extract a component (a React, Vue or template partial) that holds the classes; `@apply` can bundle utilities into a CSS class, but using it everywhere brings back the problems of hand-written CSS",
          "Виділити компонент (React, Vue чи частину шаблону), що містить ці класи; `@apply` може зібрати утиліти в CSS-клас, але використання його всюди повертає проблеми звичайного CSS",
        ],
      ],
      "d",
    ),
    question(
      "arbitrary-values",
      ["How do you set an exact value, such as a 250px width, a brand hex color or a custom grid?", "Як задати точне значення, як-от ширину 250px, фірмовий hex-колір чи власну сітку?"],
      [
        [
          "With arbitrary values in square brackets: `w-[250px]`, `bg-[#1da1f2]`, `grid-cols-[200px_1fr]` (an underscore stands for a space); values you reuse belong in the theme instead",
          "Довільними значеннями в квадратних дужках: `w-[250px]`, `bg-[#1da1f2]`, `grid-cols-[200px_1fr]` (підкреслення означає пробіл); значення, які повторюються, краще винести в тему",
        ],
        ["With `w-250px`", "Через `w-250px`"],
        ["It's impossible without writing a separate CSS file", "Це неможливо без окремого CSS-файлу"],
        ["With `style=\"tw: 250px\"`", "Через `style=\"tw: 250px\"`"],
      ],
      "a",
    ),
    question(
      "plugins",
      ["What do the official `@tailwindcss/forms` and `@tailwindcss/typography` plugins do?", "Що роблять офіційні плагіни `@tailwindcss/forms` і `@tailwindcss/typography`?"],
      [
        ["They add React form components", "Вони додають React-компоненти форм"],
        [
          "`forms` resets form controls so utilities style them consistently; `typography` adds `prose` classes that style rendered HTML such as Markdown or CMS content (in v4 you load them with `@plugin \"@tailwindcss/typography\";`)",
          "`forms` скидає стилі елементів форм, щоб утиліти стилізували їх однаково; `typography` додає класи `prose`, що стилізують відрендерений HTML, як-от Markdown чи вміст із CMS (у v4 їх підключають через `@plugin \"@tailwindcss/typography\";`)",
        ],
        ["They validate forms", "Вони валідують форми"],
        ["They are built into Tailwind and can't be removed", "Вони вбудовані в Tailwind, і їх не можна прибрати"],
      ],
      "b",
    ),
    question(
      "transitions-animations",
      ["Which statements about transitions and animations in Tailwind are true?", "Які твердження про переходи й анімації в Tailwind правильні?"],
      [
        ["`transition duration-300 ease-in-out hover:scale-105` animates the hover change", "`transition duration-300 ease-in-out hover:scale-105` анімує зміну під час наведення"],
        ["Built-in animations include `animate-spin`, `animate-ping`, `animate-pulse` and `animate-bounce`", "Вбудовані анімації — `animate-spin`, `animate-ping`, `animate-pulse` і `animate-bounce`"],
        ["`motion-reduce:` lets you turn animations off for users who prefer reduced motion", "`motion-reduce:` дає змогу вимкнути анімації для користувачів, що надають перевагу зменшеному руху"],
        ["Tailwind animations need JavaScript", "Анімації Tailwind потребують JavaScript"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "gradients",
      ["How do you make a left-to-right gradient from green to blue in Tailwind v4?", "Як зробити градієнт зліва направо від зеленого до синього в Tailwind v4?"],
      [
        ["`gradient-green-blue`", "`gradient-green-blue`"],
        ["`bg-green-500 bg-blue-500`", "`bg-green-500 bg-blue-500`"],
        ["`text-gradient-to-r`", "`text-gradient-to-r`"],
        [
          "`bg-linear-to-r from-green-500 to-blue-500`, with `via-*` for a middle color (v3 called it `bg-gradient-to-r`)",
          "`bg-linear-to-r from-green-500 to-blue-500`, з `via-*` для кольору посередині (у v3 це називалося `bg-gradient-to-r`)",
        ],
      ],
      "d",
    ),
    question(
      "sticky-header",
      ["Why might `<header class=\"sticky top-0\">` not stick?", "Чому `<header class=\"sticky top-0\">` може не «прилипати»?"],
      [
        [
          "An ancestor with `overflow: hidden` or `auto` becomes the scroll container, or the header's parent is no taller than the header; `fixed top-0 inset-x-0` always pins it to the viewport but takes it out of the flow, so the content needs top padding",
          "Предок з `overflow: hidden` чи `auto` стає контейнером прокрутки або батько шапки не вищий за саму шапку; `fixed top-0 inset-x-0` завжди закріплює її у вікні, але виймає з потоку, тож вмісту потрібен відступ згори",
        ],
        ["`sticky` only works with `z-50`", "`sticky` працює лише з `z-50`"],
        ["`sticky` isn't supported in Tailwind", "`sticky` не підтримується в Tailwind"],
        ["`top-0` must be replaced with `mt-0`", "`top-0` треба замінити на `mt-0`"],
      ],
      "a",
    ),
    question(
      "overscroll",
      ["When is `overscroll-contain` useful?", "Коли корисний `overscroll-contain`?"],
      [
        ["To hide the scrollbar", "Щоб сховати смугу прокрутки"],
        ["To make scrolling smooth", "Щоб зробити прокрутку плавною"],
        [
          "On a scrollable modal or side panel: when its content reaches the end, the page behind doesn't start scrolling (no scroll chaining); `overscroll-none` also disables effects like bounce",
          "На модальному вікні чи бічній панелі з прокруткою: коли вміст доходить до кінця, сторінка позаду не починає прокручуватися (немає scroll chaining); `overscroll-none` ще й вимикає ефекти на кшталт пружини",
        ],
        ["To disable scrolling completely", "Щоб повністю вимкнути прокрутку"],
      ],
      "c",
    ),
    question(
      "with-bootstrap",
      ["Can Tailwind CSS and Bootstrap be used together?", "Чи можна використовувати Tailwind CSS разом із Bootstrap?"],
      [
        ["No, the build will fail", "Ні, збирання не вдасться"],
        ["Yes, with no issues at all", "Так, без жодних проблем"],
        ["Only if Bootstrap is loaded from a CDN", "Лише якщо Bootstrap завантажено з CDN"],
        [
          "Technically yes, but class names such as `container` and spacing utilities clash and the CSS grows; if you must, give Tailwind a prefix (`@import \"tailwindcss\" prefix(tw);` in v4, `prefix: 'tw-'` in v3), typically during a migration",
          "Технічно так, але назви класів на кшталт `container` і утиліти відступів конфліктують, а обсяг CSS зростає; якщо інакше ніяк, дайте Tailwind префікс (`@import \"tailwindcss\" prefix(tw);` у v4, `prefix: 'tw-'` у v3), зазвичай на час міграції",
        ],
      ],
      "d",
    ),
  ],
};

/** Tailwind CSS questions, with answers for Tailwind v4 and notes on v3. */
export const tailwindModule: ModuleDef = {
  slug: "tailwind-interview-questions",
  title: { en: "Tailwind CSS questions", uk: "Питання з Tailwind CSS" },
  slides: [
    { kind: "lecture", slug: "tailwind-questions", title: { en: "Questions", uk: "Питання" } },
    tailwindBasicsQuiz,
    tailwindAdvancedQuiz,
  ],
};
