import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "css-margin-collapse",
    ["css"],
    3,
    60,
    ["Collapsing margins", "Схлопування відступів"],
    ["How much vertical space is between the two paragraphs?", "Скільки вертикального простору між двома абзацами?"],
    [
      ["50px", "50px"],
      ["30px", "30px"],
      ["20px", "20px"],
      ["0", "0"],
    ],
    "b",
    [
      "Adjacent vertical margins of block boxes in normal flow collapse into one margin equal to the larger of them, so the gap is 30px, not 50px. Margins don't collapse inside flex or grid containers, which is one reason many layouts use `gap` instead.",
      "Сусідні вертикальні відступи блокових елементів у звичайному потоці схлопуються в один, що дорівнює більшому з них, тож проміжок — 30px, а не 50px. Усередині flex- і grid-контейнерів відступи не схлопуються — одна з причин, чому багато макетів використовують `gap`.",
    ],
    { code: "p.first { margin-bottom: 20px; }\np.second { margin-top: 30px; }", codeLanguage: "css" },
  ),
  quiz(
    "css-where-specificity",
    ["css"],
    4,
    90,
    [":is() vs :where()", ":is() проти :where()"],
    ["Which colour do links inside `#nav` get?", "Якого кольору будуть посилання всередині `#nav`?"],
    [
      ["Red, because `#nav` is an ID selector", "Червоного, бо `#nav` — селектор ID"],
      ["Blue, because `:where()` has zero specificity and the later rule wins", "Синього, бо `:where()` має нульову специфічність і перемагає пізніше правило"],
      ["Red, because `:where()` rules come from a library", "Червоного, бо правила `:where()` належать бібліотеці"],
      ["It depends on the order of the HTML", "Залежить від порядку HTML"],
    ],
    "b",
    [
      "`:where()` always contributes zero specificity, so `:where(#nav) a` is (0,0,1), the same as `a`. With equal specificity the later rule wins: blue. `:is(#nav) a` would take the specificity of its most specific argument, (1,0,1), and win. Libraries use `:where()` so their defaults are easy to override.",
      "`:where()` завжди додає нульову специфічність, тож `:where(#nav) a` має (0,0,1), як і `a`. За рівної специфічності перемагає пізніше правило: синій. `:is(#nav) a` отримав би специфічність найспецифічнішого аргументу, (1,0,1), і переміг би. Бібліотеки використовують `:where()`, щоб їхні типові стилі легко перевизначались.",
    ],
    { code: ":where(#nav) a { color: red; }\na { color: blue; }", codeLanguage: "css" },
  ),
  quiz(
    "css-fixed-containing-block",
    ["css"],
    5,
    120,
    ["A fixed element that scrolls", "Фіксований елемент, що прокручується"],
    ["A `position: fixed` modal should cover the viewport, but it is clipped to a card and scrolls with it. The card has the styles below. What causes this?", "Модальне вікно з `position: fixed` має покривати вікно браузера, але обрізається карткою й прокручується разом із нею. Картка має стилі нижче. Що це спричиняє?"],
    [
      ["`border-radius` creates a new formatting context", "`border-radius` створює новий контекст форматування"],
      ["`transform` makes the card the containing block for fixed descendants", "`transform` робить картку контейнувальним блоком для фіксованих нащадків"],
      ["The modal needs a higher `z-index`", "Модальному вікну потрібен вищий `z-index`"],
      ["`position: fixed` doesn't work inside flex items", "`position: fixed` не працює всередині flex-елементів"],
    ],
    "b",
    [
      "An ancestor with `transform`, `filter`, `perspective`, `contain: paint` or `will-change: transform` becomes the containing block for `position: fixed` descendants, so they are positioned and clipped relative to it instead of the viewport. Render modals in a portal at the end of `<body>`, or use `<dialog>`, which goes into the top layer.",
      "Предок із `transform`, `filter`, `perspective`, `contain: paint` або `will-change: transform` стає контейнувальним блоком для нащадків із `position: fixed`, тож вони позиціонуються й обрізаються відносно нього, а не вікна. Рендерте модальні вікна через портал у кінці `<body>` або використовуйте `<dialog>`, що потрапляє у верхній шар.",
    ],
    { code: ".card {\n  border-radius: 12px;\n  transform: translateY(-2px);\n  overflow: hidden;\n}", codeLanguage: "css" },
  ),
]);
