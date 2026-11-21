import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const lines = (...l: string[]) => l.join("\n");

// ── Practice: scroll-end detection (vanilla-ts) ─────────────────────────────

const SCROLL_STARTER = String.raw`export interface ScrollMetrics {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
}

// TODO: true when the reader has reached the bottom, within the given tolerance (in pixels).
export function isAtBottom(m: ScrollMetrics, tolerance = 1): boolean {
  return false;
}

// TODO: how far the reader has scrolled, from 0 to 1.
export function scrollProgress(m: ScrollMetrics): number {
  return 0;
}
`;

const SCROLL_SOLUTION = String.raw`export interface ScrollMetrics {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
}

export function isAtBottom(m: ScrollMetrics, tolerance = 1): boolean {
  if (m.scrollHeight <= m.clientHeight) return true;
  return m.scrollTop + m.clientHeight >= m.scrollHeight - tolerance;
}

export function scrollProgress(m: ScrollMetrics): number {
  const overflow = m.scrollHeight - m.clientHeight;
  if (overflow <= 0) return 1;
  const ratio = m.scrollTop / overflow;
  return Math.min(1, Math.max(0, ratio));
}
`;

const SCROLL_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { isAtBottom, scrollProgress } from "../src/scroll";

describe("isAtBottom", () => {
  it("is false at the top of overflowing content", () => {
    expect(isAtBottom({ scrollTop: 0, clientHeight: 600, scrollHeight: 1000 })).toBe(false);
  });
  it("is true exactly at the bottom", () => {
    expect(isAtBottom({ scrollTop: 400, clientHeight: 600, scrollHeight: 1000 })).toBe(true);
  });
  it("allows the default one pixel of rounding error", () => {
    expect(isAtBottom({ scrollTop: 399.5, clientHeight: 600, scrollHeight: 1000 })).toBe(true);
    expect(isAtBottom({ scrollTop: 398, clientHeight: 600, scrollHeight: 1000 })).toBe(false);
  });
  it("uses a custom tolerance", () => {
    expect(isAtBottom({ scrollTop: 399.5, clientHeight: 600, scrollHeight: 1000 }, 0)).toBe(false);
  });
  it("counts content that does not overflow as at the bottom", () => {
    expect(isAtBottom({ scrollTop: 0, clientHeight: 600, scrollHeight: 500 })).toBe(true);
  });
});

describe("scrollProgress", () => {
  it("is 0 at the top and 0.5 halfway", () => {
    expect(scrollProgress({ scrollTop: 0, clientHeight: 600, scrollHeight: 1000 })).toBe(0);
    expect(scrollProgress({ scrollTop: 200, clientHeight: 600, scrollHeight: 1000 })).toBe(0.5);
  });
  it("clamps to 1 past the bottom and to 0 above the top", () => {
    expect(scrollProgress({ scrollTop: 500, clientHeight: 600, scrollHeight: 1000 })).toBe(1);
    expect(scrollProgress({ scrollTop: -50, clientHeight: 600, scrollHeight: 1000 })).toBe(0);
  });
  it("is 1 when there is nothing to scroll", () => {
    expect(scrollProgress({ scrollTop: 0, clientHeight: 600, scrollHeight: 500 })).toBe(1);
  });
});
`;

export default defineTasks([
  practice({
    slug: "scroll-end-detection",
    skills: ["browser-apis", w("javascript", 0.4)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["Detect when a reader reaches the bottom", "Визначити, чи читач дійшов до низу"],
    prompt: [
      lines(
        "A card scrolls its content, and a \"Continue\" button should unlock only when the reader reaches the bottom. Implement two pure helpers in `src/scroll.ts`. They read the element's `scrollTop`, `clientHeight` and `scrollHeight`:",
        "",
        "- `isAtBottom(m, tolerance = 1)` is true when `scrollTop + clientHeight >= scrollHeight - tolerance`. Content that does not overflow counts as at the bottom.",
        "- `scrollProgress(m)` gives how far the reader has scrolled, from 0 to 1. Content that does not overflow gives 1. Otherwise it is `scrollTop / (scrollHeight - clientHeight)`, clamped to the range [0, 1].",
      ),
      lines(
        "Картка прокручує вміст, а кнопка «Продовжити» має розблокуватися, лише коли читач дійде до низу. Реалізуйте дві чисті функції в `src/scroll.ts`. Вони читають `scrollTop`, `clientHeight` і `scrollHeight` елемента:",
        "",
        "- `isAtBottom(m, tolerance = 1)` дає true, коли `scrollTop + clientHeight >= scrollHeight - tolerance`. Вміст, який не переповнює блок, вважається таким, що вже внизу.",
        "- `scrollProgress(m)` показує, як далеко прокручено, від 0 до 1. Вміст, що не переповнює блок, дає 1. Інакше це `scrollTop / (scrollHeight - clientHeight)`, обмежене діапазоном [0, 1].",
      ),
    ],
    files: { "/src/scroll.ts": SCROLL_STARTER },
    activeFile: "/src/scroll.ts",
    tests: SCROLL_TESTS,
    solution: { "/src/scroll.ts": SCROLL_SOLUTION },
    explanation: [
      "The bottom is reached when the visible bottom edge (`scrollTop + clientHeight`) meets the content's total height. Browsers round scroll positions to fractional pixels, so an exact equality check can fail at the bottom; a small tolerance fixes that. Content that fits without scrolling is already \"at the bottom\", which is why the no-overflow case must return true, or the button would stay locked on short content.",
      "Низ досягнуто, коли нижній край видимої області (`scrollTop + clientHeight`) збігається із загальною висотою вмісту. Браузери округлюють позицію прокрутки до дробових пікселів, тому точна рівність може не спрацювати внизу; невеликий допуск вирішує це. Вміст, що вміщується без прокрутки, уже «внизу», тому для випадку без переповнення має повертатися true, інакше кнопка на короткому вмісті лишилася б заблокованою.",
    ],
  }),

  quiz(
    "offsetheight-vs-clientheight",
    ["browser-apis"],
    1,
    60,
    ["Which height includes the border", "Яка висота включає рамку"],
    ["Which element property includes the element's own border in its height?", "Яка властивість елемента включає його власну рамку у висоту?"],
    [
      ["`clientHeight`", "`clientHeight`"],
      ["`offsetHeight`", "`offsetHeight`"],
      ["`scrollHeight`", "`scrollHeight`"],
      ["`window.innerHeight`", "`window.innerHeight`"],
    ],
    "b",
    [
      "`offsetHeight` is the rendered box height, including the border and the horizontal scrollbar. `clientHeight` is the visible area inside the padding, excluding the border and scrollbars. `scrollHeight` is the full content height, including overflow, and `window.innerHeight` is the viewport, not an element.",
      "`offsetHeight` це висота відрендереної коробки, включно з рамкою та горизонтальною смугою прокрутки. `clientHeight` це видима область всередині padding, без рамки та смуг прокрутки. `scrollHeight` це повна висота вмісту з переповненням, а `window.innerHeight` це viewport, а не елемент.",
    ],
  ),

  quiz(
    "scroll-end-condition",
    ["browser-apis", w("javascript", 0.3)],
    2,
    90,
    ["When an element is scrolled to the bottom", "Коли елемент прокручено до низу"],
    ["Which condition is true when an element is scrolled to its bottom?", "Яка умова виконується, коли елемент прокручено до низу?"],
    [
      ["`scrollTop === 0`", "`scrollTop === 0`"],
      ["`scrollTop + clientHeight >= scrollHeight`", "`scrollTop + clientHeight >= scrollHeight`"],
      ["`offsetHeight === scrollHeight`", "`offsetHeight === scrollHeight`"],
      ["`scrollTop > clientHeight`", "`scrollTop > clientHeight`"],
    ],
    "b",
    [
      "The visible bottom edge is `scrollTop + clientHeight`, and the content ends at `scrollHeight`. When they meet, the reader is at the bottom. In practice, fractional scroll positions on high-DPI screens can make the sum fall just short, so a small tolerance is usually added.",
      "Видимий нижній край це `scrollTop + clientHeight`, а вміст закінчується на `scrollHeight`. Коли вони збігаються, читач унизу. На практиці дробові позиції прокрутки на екранах з високою щільністю можуть дати суму, трохи меншу, тому зазвичай додають невеликий допуск.",
    ],
  ),

  quiz(
    "inline-element-size",
    ["css"],
    1,
    60,
    ["Why width and height do nothing on a span", "Чому width і height не діють на span"],
    ["A `<span>` has `width: 100px; height: 100px` but its size does not change. Why?", "`<span>` має `width: 100px; height: 100px`, але його розмір не змінюється. Чому?"],
    [
      ["Spans cannot have borders or sizes at all", "Span взагалі не може мати рамки або розміру"],
      ["`span` is inline by default, and width and height do not apply to inline boxes", "`span` за замовчуванням інлайновий, а width і height до інлайнових боксів не застосовуються"],
      ["Spans are always 100px wide by default", "Span за замовчуванням завжди 100px завширшки"],
      ["Pixel values are ignored on every element", "Значення в пікселях ігноруються для кожного елемента"],
    ],
    "b",
    [
      "Inline boxes size themselves to their content, so width and height are ignored. Switching to `display: inline-block` keeps the element on one line while letting width and height apply, or use `display: block` (or flex) when it should take its own row.",
      "Інлайнові бокси розміщуються за вмістом, тому width і height ігноруються. Перехід на `display: inline-block` тримає елемент в одному рядку й дозволяє width і height працювати, а `display: block` (або flex), коли елемент має займати окремий рядок.",
    ],
  ),

  quiz(
    "flex-child-min-height-scroll",
    ["css"],
    3,
    120,
    ["Making a flex child scroll inside a fixed-height column", "Прокрутка flex-дочірнього елемента у колонці фіксованої висоти"],
    ["A column flex container is `height: 100vh`. Its middle child should scroll, but the whole container overflows instead. What is the fix?", "Колонка flex-контейнера має `height: 100vh`. Середній дочірній елемент має прокручуватися, але переповнюється весь контейнер. Яке виправлення?"],
    [
      ["Set `overflow: hidden` on the container", "Встановити `overflow: hidden` на контейнер"],
      ["Set `min-height: 0` on the middle child (with `overflow: auto`), so it can shrink below its content height", "Встановити `min-height: 0` на середній дочірній елемент (з `overflow: auto`), щоб він міг зменшитися нижче висоти вмісту"],
      ["Set `position: fixed` on the middle child", "Встановити `position: fixed` на середній дочірній елемент"],
      ["Set `display: inline` on the middle child", "Встановити `display: inline` на середній дочірній елемент"],
    ],
    "b",
    [
      "Flex items default to `min-height: auto`, which means they never shrink below their content. Setting `min-height: 0` lets the middle item shrink to the free space, and `overflow: auto` on it then creates the scrollbar. The header and footer keep their size, so buttons pinned in the footer stay visible while the body scrolls.",
      "Flex-елементи за замовчуванням мають `min-height: auto`, тобто ніколи не стискаються нижче свого вмісту. Встановлення `min-height: 0` дозволяє середньому елементу стиснутися до вільного місця, а `overflow: auto` на ньому створює смугу прокрутки. Шапка й футер зберігають розмір, тож кнопки у футері лишаються видимими, поки прокручується тіло.",
    ],
  ),

  quiz(
    "disabled-initial-state",
    ["browser-apis", w("html", 0.3)],
    2,
    90,
    ["Where the first disabled state should come from", "Звідки має братися початковий стан disabled"],
    ["A \"Continue\" button must be disabled from the first paint, before any JavaScript runs. Where should that state be set?", "Кнопка «Продовжити» має бути вимкнена з першого відображення, ще до запуску JavaScript. Де має задаватися цей стан?"],
    [
      ["Only in a scroll handler, which runs after the first scroll", "Лише в обробнику прокрутки, який спрацьовує після першого скролу"],
      ["In the markup, with the `disabled` attribute, and then updated by the script", "У розмітці, атрибутом `disabled`, а потім оновлювати скриптом"],
      ["Inside a `setTimeout(0)` in the script", "У `setTimeout(0)` у скрипті"],
      ["After the `load` event, so images are measured first", "Після події `load`, щоб спершу виміряти зображення"],
    ],
    "b",
    [
      "Markup is the only place that works without JavaScript, and it renders before the script runs, so the button never flashes enabled. The script then only has to update the state when the reader scrolls or the layout changes. Waiting for `load` or using a timer adds a visible delay for no benefit here.",
      "Розмітка єдине місце, що працює без JavaScript, і вона відображається до запуску скрипта, тож кнопка ніколи не блимає як активна. Скрипт потім лише оновлює стан при прокрутці або зміні макета. Очікування `load` або таймер дають помітну затримку без користі.",
    ],
  ),

  quiz(
    "resize-affects-scroll-end",
    ["browser-apis"],
    2,
    90,
    ["Why a resize listener is needed", "Навіщо слухач resize"],
    ["Why should the scroll-end check also run on `resize`?", "Чому перевірку кінця прокрутки також потрібно запускати при `resize`?"],
    [
      ["A resize can change `clientHeight` and `scrollHeight`, so content that was scrollable can stop overflowing and the reader is already at the bottom", "Зміна розміру може змінити `clientHeight` і `scrollHeight`, тож вміст, що прокручувався, може перестати переповнюватися, і читач уже внизу"],
      ["Browsers fire a `scroll` event on every resize, so the listener is redundant", "Браузери надсилають подію `scroll` при кожній зміні розміру, тож слухач зайвий"],
      ["Buttons cannot be disabled while the window is being resized", "Кнопки не можна вимкнути, поки змінюється розмір вікна"],
      ["Resize resets `scrollTop` to zero", "Зміна розміру скидає `scrollTop` до нуля"],
    ],
    "a",
    [
      "Scroll events only fire when the scroll position changes. If the window grows, content may suddenly fit without any scrolling, so the reader is at the bottom with no scroll event at all. Running the same check on `resize` keeps the button in sync with the actual layout.",
      "Події scroll спрацьовують лише коли змінюється позиція прокрутки. Якщо вікно збільшилося, вміст може раптом вміститися без жодної прокрутки, і читач уже внизу, а події scroll не буде. Та сама перевірка на `resize` тримає кнопку синхронізованою з реальним макетом.",
    ],
  ),
]);
