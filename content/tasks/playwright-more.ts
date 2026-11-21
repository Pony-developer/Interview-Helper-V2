import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "pw-locators-autowait",
    ["playwright", w("unit-testing", 0.3)],
    2,
    75,
    ["Locators versus element handles", "Локатори проти дескрипторів елементів"],
    ["Why does Playwright recommend locators such as `page.getByRole(...)` over element handles from `page.$()`?", "Чому Playwright рекомендує локатори на кшталт `page.getByRole(...)`, а не дескриптори елементів з `page.$()`?"],
    [
      ["A locator re-finds the element and waits until it's visible, enabled and stable before acting, while a handle is a snapshot that can go stale", "Локатор знову знаходить елемент і чекає, доки він стане видимим, активним і стабільним, перш ніж діяти, а дескриптор — це знімок, який може застаріти"],
      ["Handles are slower to type, but locators run in the browser's native process", "Дескриптори повільніше набирати, а локатори працюють у нативному процесі браузера"],
      ["Locators are the only way to take screenshots", "Локатори — єдиний спосіб робити знімки екрана"],
      ["Handles can't click buttons", "Дескриптори не можуть клікати кнопки"],
    ],
    "a",
    [
      "Pages change while a test runs: elements re-render, get replaced, or appear late. A locator is a query that Playwright re-evaluates before each action, and actions wait for the element to be actionable, which removes most manual `waitFor` calls and most flakiness. An element handle points at one DOM node, so after a re-render it can refer to something that is gone.",
      "Сторінки змінюються, поки виконується тест: елементи перемальовуються, замінюються або з'являються пізно. Локатор — це запит, який Playwright повторно виконує перед кожною дією, а дії чекають, доки елемент стане доступним для взаємодії, тож зникає більшість ручних викликів `waitFor` і більшість нестабільності. Дескриптор вказує на один вузол DOM, тож після перемальовування він може посилатися на щось, чого вже немає.",
    ],
  ),
  quiz(
    "pw-resilient-selectors",
    ["playwright", w("web-accessibility", 0.3)],
    3,
    90,
    ["The most resilient selector", "Найстійкіший селектор"],
    ["A form has a button labelled \"Save\". Which selector survives the most markup refactors?", "У формі є кнопка з написом \"Save\". Який селектор переживе найбільше змін розмітки?"],
    [
      ["`page.locator(\"div > div:nth-child(3) > button\")`", "`page.locator(\"div > div:nth-child(3) > button\")`"],
      ["`page.getByRole(\"button\", { name: \"Save\" })`", "`page.getByRole(\"button\", { name: \"Save\" })`"],
      ["`page.locator(\"//button[2]\")`", "`page.locator(\"//button[2]\")`"],
      ["`page.locator(\".btn-primary-x7\")`", "`page.locator(\".btn-primary-x7\")`"],
    ],
    "b",
    [
      "Role and accessible name describe what the user sees and what assistive technology announces, so they change only when the behaviour changes. Positional selectors break when a sibling is added, and generated class names change on every build. Role-based locators also double as an accessibility check: a button without an accessible name won't be found.",
      "Роль і доступна назва описують те, що бачить користувач і що озвучують допоміжні технології, тож вони змінюються, лише коли змінюється поведінка. Позиційні селектори ламаються, коли додають сусідній елемент, а згенеровані назви класів змінюються при кожній збірці. Локатори за роллю водночас є перевіркою доступності: кнопку без доступної назви не знайти.",
    ],
  ),
]);
