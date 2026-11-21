import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "rd-container-queries",
    ["responsive-design", w("css", 0.3)],
    3,
    90,
    ["What container queries respond to", "На що реагують container queries"],
    ["A product card should switch to a horizontal layout when the card is narrow, wherever it's placed on the page. Which feature fits?", "Картка товару має перемикатися на горизонтальний макет, коли картка вузька, де б вона не стояла на сторінці. Яка можливість підходить?"],
    [
      ["Media queries, because they respond to the viewport width", "Медіазапити, бо вони реагують на ширину вікна браузера"],
      ["Container queries, because they respond to the width of the nearest container ancestor", "Container queries, бо вони реагують на ширину найближчого контейнера-предка"],
      ["JavaScript `resize` listeners on the window", "Обробники `resize` на window у JavaScript"],
      ["`@supports`, because it checks the browser version", "`@supports`, бо він перевіряє версію браузера"],
    ],
    "b",
    [
      "A media query knows only the viewport, so the same card would stay horizontal in a narrow sidebar on a wide screen. A container query (`@container` on the parent, `@container (min-width: …)` in the card) measures the component's own space, which makes components reusable in any layout.",
      "Медіазапит знає лише вікно браузера, тож та сама картка залишалася б горизонтальною у вузькому сайдбарі на широкому екрані. Container query (`@container` на батьківському елементі, `@container (min-width: …)` у картці) вимірює власний простір компонента, тож компоненти можна використовувати в будь-якому макеті.",
    ],
  ),
  quiz(
    "rd-fluid-type",
    ["responsive-design", w("web-performance", 0.3)],
    3,
    90,
    ["Fluid sizing without breakpoints", "Гнучкі розміри без брейкпоінтів"],
    ["Which CSS gives a heading a size that grows smoothly between a phone and a desktop, with no breakpoints?", "Який CSS дає заголовку розмір, що плавно зростає між телефоном і настільним комп'ютером, без брейкпоінтів?"],
    [
      ["`font-size: clamp(1.5rem, 4vw, 3rem);`", "`font-size: clamp(1.5rem, 4vw, 3rem);`"],
      ["`font-size: 24px;` with a media query at 768px", "`font-size: 24px;` з медіазапитом на 768px"],
      ["`font-size: 2em;` on every screen", "`font-size: 2em;` на кожному екрані"],
      ["`zoom: 150%;` on the body", "`zoom: 150%;` на body"],
    ],
    "a",
    [
      "`clamp(min, preferred, max)` sets a value that follows the preferred size (here, 4% of the viewport width) but never drops below the minimum or rises above the maximum. A single declaration does the work of several breakpoints, and it scales with the user's browser settings where `rem` is used.",
      "`clamp(min, preferred, max)` задає значення, яке слідує за бажаним розміром (тут 4% ширини вікна), але ніколи не опускається нижче мінімуму чи не піднімається вище максимуму. Одна декларація робить роботу кількох брейкпоінтів, а використання `rem` масштабується разом з налаштуваннями браузера користувача.",
    ],
  ),
]);
