import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. Avoid `${` inside (it would be interpolated). */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const lines = (...l: string[]) => l.join("\n");

// ── Practice 1: virtual window math (vanilla-ts) ─────────────────────────────

const VIRTUAL_STARTER = String.raw`export interface VirtualOptions {
  itemCount: number;
  rowHeight: number;
  viewportHeight: number;
  scrollTop: number;
  /** Extra rows rendered above and below the viewport. Defaults to 3. */
  overscan?: number;
}

export interface VirtualWindow {
  /** First row to render (inclusive). */
  start: number;
  /** Row to stop before (exclusive). */
  end: number;
  /** Pixel offset of the first rendered row inside the scroll container. */
  offsetTop: number;
  /** Height of the spacer that gives the scrollbar its real length. */
  totalHeight: number;
}

// TODO: return the rows that must be in the DOM for this scroll position.
export function getVirtualWindow(options: VirtualOptions): VirtualWindow {
  return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 };
}
`;

const VIRTUAL_SOLUTION = String.raw`export interface VirtualOptions {
  itemCount: number;
  rowHeight: number;
  viewportHeight: number;
  scrollTop: number;
  /** Extra rows rendered above and below the viewport. Defaults to 3. */
  overscan?: number;
}

export interface VirtualWindow {
  /** First row to render (inclusive). */
  start: number;
  /** Row to stop before (exclusive). */
  end: number;
  /** Pixel offset of the first rendered row inside the scroll container. */
  offsetTop: number;
  /** Height of the spacer that gives the scrollbar its real length. */
  totalHeight: number;
}

export function getVirtualWindow({ itemCount, rowHeight, viewportHeight, scrollTop, overscan = 3 }: VirtualOptions): VirtualWindow {
  if (itemCount <= 0 || rowHeight <= 0) return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 };

  const totalHeight = itemCount * rowHeight;
  const maxScroll = Math.max(0, totalHeight - viewportHeight);
  const top = Math.min(Math.max(0, scrollTop), maxScroll);

  const firstVisible = Math.floor(top / rowHeight);
  const lastVisible = Math.ceil((top + viewportHeight) / rowHeight); // exclusive

  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(itemCount, lastVisible + overscan);

  return { start, end, offsetTop: start * rowHeight, totalHeight };
}
`;

const VIRTUAL_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { getVirtualWindow } from "../src/virtual-list";

describe("getVirtualWindow", () => {
  it("renders the first rows plus overscan at the top", () => {
    const w = getVirtualWindow({ itemCount: 10000, rowHeight: 35, viewportHeight: 350, scrollTop: 0 });
    expect(w.start).toBe(0);
    expect(w.end).toBe(13);
    expect(w.offsetTop).toBe(0);
    expect(w.totalHeight).toBe(350000);
  });
  it("keeps the rows around the scroll position", () => {
    const w = getVirtualWindow({ itemCount: 10000, rowHeight: 35, viewportHeight: 350, scrollTop: 1000 });
    expect(w).toEqual({ start: 25, end: 42, offsetTop: 875, totalHeight: 350000 });
  });
  it("clamps scrollTop to the maximum scroll position", () => {
    const w = getVirtualWindow({ itemCount: 100, rowHeight: 10, viewportHeight: 50, scrollTop: 5000 });
    expect(w).toEqual({ start: 92, end: 100, offsetTop: 920, totalHeight: 1000 });
  });
  it("treats a negative scrollTop as the top", () => {
    const w = getVirtualWindow({ itemCount: 100, rowHeight: 10, viewportHeight: 50, scrollTop: -200, overscan: 0 });
    expect(w).toEqual({ start: 0, end: 5, offsetTop: 0, totalHeight: 1000 });
  });
  it("respects a custom overscan", () => {
    const w = getVirtualWindow({ itemCount: 50, rowHeight: 35, viewportHeight: 105, scrollTop: 0, overscan: 0 });
    expect(w).toEqual({ start: 0, end: 3, offsetTop: 0, totalHeight: 1750 });
  });
  it("returns an empty window for an empty list", () => {
    const w = getVirtualWindow({ itemCount: 0, rowHeight: 35, viewportHeight: 350, scrollTop: 0 });
    expect(w).toEqual({ start: 0, end: 0, offsetTop: 0, totalHeight: 0 });
  });
});
`;

// ── Practice 2: undo / redo history (vanilla-ts) ─────────────────────────────

const HISTORY_STARTER = String.raw`export interface History<T> {
  readonly present: T;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  push(next: T): void;
  undo(): T;
  redo(): T;
}

// TODO: keep a present value plus a past stack and a future stack.
export function createHistory<T>(initial: T, limit = Infinity): History<T> {
  return {
    present: initial,
    canUndo: false,
    canRedo: false,
    push() {},
    undo() {
      return initial;
    },
    redo() {
      return initial;
    },
  };
}
`;

const HISTORY_SOLUTION = String.raw`export interface History<T> {
  readonly present: T;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  push(next: T): void;
  undo(): T;
  redo(): T;
}

export function createHistory<T>(initial: T, limit = Infinity): History<T> {
  if (limit < 1) throw new RangeError("limit must be at least 1");

  let present = initial;
  let past: T[] = [];
  let future: T[] = [];

  const remember = (value: T) => {
    past.push(value);
    if (past.length > limit) past.shift();
  };

  return {
    get present() {
      return present;
    },
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
    push(next) {
      if (Object.is(next, present)) return;
      remember(present);
      present = next;
      future = [];
    },
    undo() {
      if (past.length > 0) {
        future.push(present);
        present = past.pop() as T;
      }
      return present;
    },
    redo() {
      if (future.length > 0) {
        remember(present);
        present = future.pop() as T;
      }
      return present;
    },
  };
}
`;

const HISTORY_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createHistory } from "../src/history";

describe("createHistory", () => {
  it("starts with the initial value and nothing to undo or redo", () => {
    const h = createHistory(0);
    expect(h.present).toBe(0);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
    expect(h.undo()).toBe(0);
  });
  it("undoes pushes one by one and then stops at the start", () => {
    const h = createHistory(0);
    h.push(1);
    h.push(2);
    expect(h.undo()).toBe(1);
    expect(h.undo()).toBe(0);
    expect(h.canUndo).toBe(false);
    expect(h.undo()).toBe(0);
  });
  it("redoes undone steps and then stops at the end", () => {
    const h = createHistory("a");
    h.push("b");
    h.push("c");
    h.undo();
    h.undo();
    expect(h.redo()).toBe("b");
    expect(h.redo()).toBe("c");
    expect(h.canRedo).toBe(false);
    expect(h.redo()).toBe("c");
  });
  it("a new push clears the redo stack", () => {
    const h = createHistory(0);
    h.push(1);
    h.push(2);
    h.undo();
    h.push(5);
    expect(h.canRedo).toBe(false);
    expect(h.present).toBe(5);
    expect(h.undo()).toBe(1);
  });
  it("ignores a push of the same value", () => {
    const h = createHistory(3);
    h.push(3);
    expect(h.canUndo).toBe(false);
  });
  it("keeps at most limit undo steps", () => {
    const h = createHistory(0, 2);
    h.push(1);
    h.push(2);
    h.push(3);
    expect(h.undo()).toBe(2);
    expect(h.undo()).toBe(1);
    expect(h.canUndo).toBe(false);
  });
  it("rejects a limit below 1", () => {
    expect(() => createHistory(0, 0)).toThrow();
  });
});
`;

// ── Practice 3: nested table with a computed colSpan (react-ts) ──────────────

const REGION_STARTER = code`export interface District {
  id: number;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  districts: District[];
}

export const REGIONS: Region[] = [
  { id: "n", name: "North", districts: [{ id: 1, name: "Alpha" }, { id: 2, name: "Beta" }, { id: 3, name: "Gamma" }] },
  { id: "s", name: "South", districts: [{ id: 4, name: "Delta" }] },
  { id: "e", name: "East", districts: [] },
];

// TODO: one <tbody data-testid={"region-" + id}> per region, containing
// - a <tr> with a <th> holding the region name, spanning every district column
// - a <tr> with one <td> per district, or a single "No districts" cell when there are none
// The column count is the largest districts.length across all regions (compute it with reduce).
function RegionTable({ regions }: { regions: Region[] }) {
  return null;
}

export default function App() {
  return <RegionTable regions={REGIONS} />;
}
`;

const REGION_SOLUTION = code`export interface District {
  id: number;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  districts: District[];
}

export const REGIONS: Region[] = [
  { id: "n", name: "North", districts: [{ id: 1, name: "Alpha" }, { id: 2, name: "Beta" }, { id: 3, name: "Gamma" }] },
  { id: "s", name: "South", districts: [{ id: 4, name: "Delta" }] },
  { id: "e", name: "East", districts: [] },
];

function RegionTable({ regions }: { regions: Region[] }) {
  const columns = regions.reduce((max, region) => Math.max(max, region.districts.length), 0);
  const span = Math.max(columns, 1);

  return (
    <table>
      {regions.map((region) => (
        <tbody key={region.id} data-testid={"region-" + region.id}>
          <tr>
            <th colSpan={span}>{region.name}</th>
          </tr>
          <tr>
            {region.districts.length > 0 ? (
              region.districts.map((district) => <td key={district.id}>{district.name}</td>)
            ) : (
              <td colSpan={span}>No districts</td>
            )}
          </tr>
        </tbody>
      ))}
    </table>
  );
}

export default function App() {
  return <RegionTable regions={REGIONS} />;
}
`;

const REGION_TESTS = code`import { describe, it, expect, screen } from "./test-kit";

describe("region table", () => {
  it("puts the region name in a header spanning every district column", async () => {
    const body = await screen.findByTestId("region-n");
    const th = body.querySelector("th");
    expect(th.textContent).toBe("North");
    expect(th.getAttribute("colspan")).toBe("3");
  });
  it("renders one cell per district, in order", async () => {
    const body = await screen.findByTestId("region-n");
    const names = Array.from(body.querySelectorAll("td"), (td) => td.textContent);
    expect(names).toEqual(["Alpha", "Beta", "Gamma"]);
  });
  it("keeps the full-width header for a region with fewer districts", async () => {
    const body = await screen.findByTestId("region-s");
    const cells = body.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent).toBe("Delta");
    expect(body.querySelector("th").getAttribute("colspan")).toBe("3");
  });
  it("shows a single 'No districts' cell when a region is empty", async () => {
    const body = await screen.findByTestId("region-e");
    const cells = body.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent).toBe("No districts");
    expect(cells[0].getAttribute("colspan")).toBe("3");
  });
});
`;

export default defineTasks([
  practice({
    slug: "virtual-window-math",
    skills: ["web-performance", w("arrays-strings", 0.3)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Virtualized list: which rows to render", "Віртуалізований список: які рядки рендерити"],
    prompt: [
      lines(
        "A list has thousands of fixed-height rows. Rendering all of them is slow, so only the rows near the viewport should exist in the DOM. Implement the math behind this in `src/virtual-list.ts`:",
        "",
        "- `scrollTop` is clamped to `[0, maxScroll]`, where `maxScroll = max(0, totalHeight - viewportHeight)`.",
        "- Rows that overlap the visible range `[top, top + viewportHeight]` are visible. Add `overscan` rows (default 3) on each side.",
        "- `start` and `end` stay inside `[0, itemCount]`. `end` is exclusive.",
        "- `offsetTop` is the pixel position of row `start`. `totalHeight` is the spacer height for the whole list.",
        "- An empty list (or a non-positive row height) gives an empty window.",
      ),
      lines(
        "Список має рядки фіксованої висоти. Рендерити всі одразу повільно, тому в DOM мають бути лише рядки поблизу viewport. Реалізуйте математику в `src/virtual-list.ts`:",
        "",
        "- `scrollTop` обмежується діапазоном `[0, maxScroll]`, де `maxScroll = max(0, totalHeight - viewportHeight)`.",
        "- Видимі рядки перетинають діапазон `[top, top + viewportHeight]`. Додайте `overscan` рядків (типово 3) з кожного боку.",
        "- `start` і `end` лишаються в межах `[0, itemCount]`. `end` не включається.",
        "- `offsetTop` це піксельна позиція рядка `start`. `totalHeight` це висота розтяжки для всього списку.",
        "- Порожній список (або недодатна висота рядка) дає порожнє вікно.",
      ),
    ],
    files: { "/src/virtual-list.ts": VIRTUAL_STARTER },
    activeFile: "/src/virtual-list.ts",
    tests: VIRTUAL_TESTS,
    solution: { "/src/virtual-list.ts": VIRTUAL_SOLUTION },
    explanation: [
      "A virtual list needs only arithmetic: the scroll position tells you which row is first on screen (`floor(top / rowHeight)`), the viewport height tells you how many rows fit, and a few extra rows on each side hide the gaps while scrolling. The spacer (`totalHeight`) keeps the scrollbar the length of the full list, and `offsetTop` moves the rendered slice into place. Clamping `scrollTop` matters because a stale or overshooting value would otherwise produce an empty or misaligned window.",
      "Віртуалізація списку це арифметика: позиція прокрутки показує, який рядок першим на екрані (`floor(top / rowHeight)`), висота viewport показує, скільки рядків вміщується, а кілька додаткових рядків з кожного боку приховують порожнечі під час прокрутки. Розтяжка (`totalHeight`) робить смугу прокрутки такою, як весь список, а `offsetTop` ставить відрендерений фрагмент на місце. Обмеження `scrollTop` важливе, бо застаріле або завелике значення дало б порожнє чи зміщене вікно.",
    ],
  }),

  practice({
    slug: "undo-redo-history",
    skills: ["state-management", w("immutability-copying", 0.4), w("data-structures", 0.3)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["Undo and redo for an editor", "Скасування та повтор для редактора"],
    prompt: [
      lines(
        "An editor needs undo and redo. Implement `createHistory` in `src/history.ts`:",
        "",
        "- `present` is the current value. `push(next)` makes `next` the present value and clears any redo steps. Pushing the same value (`Object.is`) does nothing.",
        "- `undo()` moves back one step and returns the present value. With nothing to undo it returns the present value unchanged.",
        "- `redo()` moves forward one step, with the same no-op rule.",
        "- `canUndo` and `canRedo` report whether those steps exist.",
        "- `limit` caps the number of undo steps. The oldest steps are dropped first. A `limit` below 1 throws a `RangeError`.",
      ),
      lines(
        "Редактору потрібні скасування й повтор. Реалізуйте `createHistory` у `src/history.ts`:",
        "",
        "- `present` це поточне значення. `push(next)` робить `next` поточним значенням і очищає кроки повтору. Додавання того самого значення (`Object.is`) нічого не робить.",
        "- `undo()` повертається на крок назад і повертає поточне значення. Якщо скасовувати нічого, повертає поточне значення без змін.",
        "- `redo()` рухається на крок уперед з тим самим правилом «нічого не робити».",
        "- `canUndo` і `canRedo` показують, чи є відповідні кроки.",
        "- `limit` обмежує кількість кроків скасування. Найстаріші кроки відкидаються першими. `limit` менше 1 викидає `RangeError`.",
      ),
    ],
    files: { "/src/history.ts": HISTORY_STARTER },
    activeFile: "/src/history.ts",
    tests: HISTORY_TESTS,
    solution: { "/src/history.ts": HISTORY_SOLUTION },
    explanation: [
      "Keep three things: the present value, a stack of past values and a stack of future values. Undo moves the present onto the future stack and pops the last past value back into place; redo does the reverse. A new edit invalidates the future, which is why `push` clears it. Storing immutable snapshots (or never mutating the values you push) keeps these stacks trustworthy.",
      "Тримайте три речі: поточне значення, стек минулих значень і стек майбутніх. Скасування переносить поточне значення у стек майбутніх, а останнє минуле значення повертає на місце; повтор робить навпаки. Нова зміна робить майбутнє недійсним, тому `push` його очищає. Зберігання незмінних знімків (або ніколи не мутування переданих значень) тримає стеки надійними.",
    ],
  }),

  practice({
    slug: "react-nested-region-table",
    skills: ["react", "typescript", w("web-performance", 0.2)],
    complexity: 3,
    estSeconds: 900,
    framework: "react-ts",
    title: ["Nested table with a computed colSpan", "Вкладена таблиця з обчисленим colSpan"],
    prompt: [
      lines(
        "Render regions and their districts as a table. The data is typed in `App.tsx`:",
        "",
        "1. `RegionTable` renders one `<tbody data-testid=\"region-<id>\">` per region.",
        "2. Each `tbody` has a header row with a `<th>` holding the region name. Its `colSpan` equals the largest number of districts in any region (compute it with `reduce`).",
        "3. The next row has one `<td>` per district, in order. A region with no districts gets one `<td>` reading `No districts`, spanning all columns.",
      ),
      lines(
        "Виведіть регіони та їхні райони в таблиці. Дані типізовано в `App.tsx`:",
        "",
        "1. `RegionTable` рендерить один `<tbody data-testid=\"region-<id>\">` на кожен регіон.",
        "2. Кожен `tbody` має рядок заголовка з `<th>`, де назва регіону. Його `colSpan` дорівнює найбільшій кількості районів серед усіх регіонів (обчисліть через `reduce`).",
        "3. Наступний рядок має по одному `<td>` на кожен район, у порядку. Регіон без районів отримує один `<td>` з текстом `No districts` на всю ширину.",
      ),
    ],
    files: { "/App.tsx": REGION_STARTER },
    activeFile: "/App.tsx",
    tests: REGION_TESTS,
    solution: { "/App.tsx": REGION_SOLUTION },
    explanation: [
      "A table's columns are a shared resource: every row has to line up, so a row with fewer cells must span the rest with `colSpan`. Deriving the column count from the data with `reduce` keeps the markup correct when the data changes, and the `Math.max(…, 1)` guard avoids a zero span when there are no districts at all. Give each `tbody` a stable key (the region id) rather than the array index.",
      "Колонки таблиці спільні: кожен рядок мусить збігатися, тож рядок з меншою кількістю клітинок має розтягнутися через `colSpan`. Обчислення кількості колонок з даних через `reduce` тримає розмітку правильною, коли дані змінюються, а `Math.max(…, 1)` не дає нульового розтягу, коли районів немає взагалі. Кожному `tbody` дайте стабільний ключ (id регіону), а не індекс масиву.",
    ],
  }),

  quiz(
    "streaming-latency-hls-vs-webrtc",
    ["http-rest", w("web-performance", 0.5)],
    2,
    90,
    ["Why live video over HTTP lags behind WebRTC", "Чому live-відео через HTTP відстає від WebRTC"],
    ["Why is segmented HTTP streaming (such as HLS) usually slower than WebRTC for live camera feeds?", "Чому сегментований HTTP-стрімінг (наприклад HLS) зазвичай повільніший за WebRTC для live-відео з камер?"],
    [
      ["The HTTP protocol cannot carry video frames at all", "HTTP взагалі не може передавати кадри відео"],
      ["The player buffers several seconds of media segments before it starts playing", "Плеєр буферизує кілька секунд медіасегментів перед відтворенням"],
      ["WebRTC always sends uncompressed frames", "WebRTC завжди надсилає нестиснуті кадри"],
      ["HTTP streams always use a slower video codec", "HTTP-потоки завжди використовують повільніший кодек"],
    ],
    "b",
    [
      "Segmented streaming splits video into chunks (typically a few seconds each) and the player keeps a buffer of several chunks so playback survives network jitter. That buffer is latency. WebRTC is built for real-time media: it sends small packets over a transport that favours timeliness and keeps its playout buffer short.",
      "Сегментоване стримінгове відео ділиться на шматки (зазвичай по кілька секунд), а плеєр тримає буфер з кількох шматків, щоб відтворення витримувало мережеві коливання. Цей буфер і є затримкою. WebRTC створено для реального часу: він надсилає дрібні пакети транспортом, який надає перевагу своєчасності, і тримає короткий буфер відтворення.",
    ],
  ),

  quiz(
    "hover-hit-testing-canvas-svg",
    ["canvas-webgl", w("dom-events", 0.5)],
    2,
    90,
    ["Hover on hundreds of shapes: canvas or SVG", "Наведення на сотні фігур: canvas чи SVG"],
    ["A drawing contains 500 shapes and the shape under the cursor must highlight on hover. Which statement is correct?", "На кресленні 500 фігур, і фігура під курсором має підсвічуватися при наведенні. Яке твердження правильне?"],
    [
      ["Canvas gives you a separate DOM node per shape, so hover needs no extra work", "Canvas створює окремий DOM-вузол для кожної фігури, тому наведення не потребує додаткової роботи"],
      ["Each SVG shape is a DOM element that receives its own pointer events", "Кожна SVG-фігура є DOM-елементом, який отримує власні події вказівника"],
      ["SVG cannot respond to mouse events", "SVG не може реагувати на події миші"],
      ["Canvas can ask the browser which shape is under a point", "Canvas може запитати в браузера, яка фігура під точкою"],
    ],
    "b",
    [
      "A canvas is a single bitmap: the browser knows nothing about the shapes you drew, so you must hit-test coordinates yourself (for example with a spatial index or by redrawing an offscreen picking buffer). SVG shapes are elements in the DOM, so `pointerenter` or `mouseover` on a shape tells you exactly which one was hit.",
      "Canvas це один растровий образ: браузер не знає про намальовані фігури, тож перевірку попадання доводиться робити самому (наприклад, просторовим індексом або перемальовуванням буфера вибору). Фігури SVG є елементами DOM, тому `pointerenter` або `mouseover` на фігурі точно повідомляють, яку з них зачепили.",
    ],
  ),

  quiz(
    "annotation-coordinate-space",
    ["canvas-webgl"],
    2,
    90,
    ["Storing annotations so zoom does not break them", "Зберігання розмітки, щоб зум її не ламав"],
    ["Users draw boxes and polygons over a photo and can zoom and pan. In which coordinate space should you store the annotation vertices?", "Користувачі малюють рамки та полігони поверх фото і можуть масштабувати та панорамувати. У якій системі координат зберігати вершини розмітки?"],
    [
      ["Screen pixels from the last zoom level", "Піксельні координати екрана з останнього рівня зуму"],
      ["The image's own pixel coordinates", "Власні піксельні координати зображення"],
      ["The window's CSS coordinates at page load", "CSS-координати вікна на момент завантаження"],
      ["Percentages of the browser window width", "Відсотки від ширини вікна браузера"],
    ],
    "b",
    [
      "Image coordinates do not change when the user zooms or pans, so the stored data stays valid and you only apply a view transform (scale and offset) when drawing. Screen-space coordinates would need rewriting on every zoom or resize, and they break if the image is shown at a different size on another device.",
      "Координати зображення не змінюються під час зуму чи панорамування, тож збережені дані лишаються правильними, а при малюванні застосовується лише трансформація вигляду (масштаб і зсув). Координати екрана треба переписувати при кожному зумі чи зміні розміру, і вони ламаються, коли зображення показують іншого розміру на іншому пристрої.",
    ],
  ),

  quiz(
    "device-pixel-ratio-canvas",
    ["browser-apis"],
    2,
    90,
    ["What devicePixelRatio means for crisp canvas", "Що означає devicePixelRatio для чіткого canvas"],
    ["A canvas looks blurry on a high-density phone. Which code gives a sharp result for a canvas with CSS size `cssWidth` × `cssHeight`?", "Canvas виглядає розмитим на телефоні з високою щільністю пікселів. Який код дає чітку картинку для canvas із CSS-розміром `cssWidth` × `cssHeight`?"],
    [
      ["canvas.width = cssWidth; canvas.height = cssHeight;", "canvas.width = cssWidth; canvas.height = cssHeight;"],
      ["canvas.width = cssWidth * window.devicePixelRatio; canvas.height = cssHeight * window.devicePixelRatio; then scale the context by the ratio", "canvas.width = cssWidth * window.devicePixelRatio; canvas.height = cssHeight * window.devicePixelRatio; далі масштабуйте контекст на це значення"],
      ["canvas.width = window.innerWidth; canvas.height = window.innerHeight;", "canvas.width = window.innerWidth; canvas.height = window.innerHeight;"],
      ["canvas.style.imageRendering = 'pixelated';", "canvas.style.imageRendering = 'pixelated';"],
    ],
    "b",
    [
      "`window.devicePixelRatio` is the number of physical device pixels per CSS pixel. A canvas's drawing buffer is measured in device pixels, so the buffer must be multiplied by that ratio, while the CSS size stays the same. Then scale the context so your drawing code can keep using CSS units.",
      "`window.devicePixelRatio` це кількість фізичних пікселів пристрою на один CSS-піксель. Буфер малювання canvas вимірюється у пікселях пристрою, тож його треба помножити на це співвідношення, а CSS-розмір лишається тим самим. Потім масштабуйте контекст, щоб код малювання міг далі працювати в CSS-одиницях.",
    ],
  ),

  quiz(
    "undo-redo-stack-design",
    ["state-management", w("immutability-copying", 0.4)],
    2,
    90,
    ["Undo in an editor: which stack operations are right", "Скасування в редакторі: які операції зі стеками правильні"],
    ["An editor keeps a `present` state, a `past` stack and a `future` stack. Which handling of Undo is correct?", "Редактор зберігає стан `present`, стек `past` і стек `future`. Яка обробка Undo правильна?"],
    [
      ["Push the present onto `future`, then pop the last entry of `past` into `present`", "Покласти поточне значення у `future`, потім узяти останній елемент `past` у `present`"],
      ["Push the present onto `past`, then pop the last entry of `future` into `present`", "Покласти поточне значення у `past`, потім узяти останній елемент `future` у `present`"],
      ["Clear `past` and keep `future` unchanged", "Очистити `past` і не змінювати `future`"],
      ["Replace the document with its initial state every time", "Щоразу замінювати документ початковим станом"],
    ],
    "a",
    [
      "Undo has to remember where it came from so that Redo can get back. Moving the present onto `future` keeps the step reversible, and taking the last `past` entry restores the earlier state. The opposite assignment in option B is exactly what Redo does, which is why mixing the two stacks breaks history.",
      "Скасування має пам'ятати, звідки прийшло, щоб повтор міг повернути назад. Перенесення поточного значення у `future` робить крок оборотним, а взяття останнього елемента `past` відновлює попередній стан. Протилежне призначення у варіанті B саме те, що робить повтор, тому змішування двох стеків ламає історію.",
    ],
  ),

  quiz(
    "service-worker-offline-cache",
    ["pwa"],
    2,
    90,
    ["Serving assets offline", "Видача ресурсів без інтернету"],
    ["Which browser mechanism lets a web app answer its own network requests from a cache so it keeps working offline?", "Який механізм браузера дозволяє веб-застосунку відповідати на власні мережеві запити з кешу, щоб він працював офлайн?"],
    [
      ["localStorage", "localStorage"],
      ["A Service Worker that intercepts fetch requests and uses Cache Storage or IndexedDB", "Service Worker, який перехоплює fetch-запити і використовує Cache Storage або IndexedDB"],
      ["Web Workers running background computation", "Web Workers, що виконують фонові обчислення"],
      ["Long-lived cookies", "Довгоживучі cookies"],
    ],
    "b",
    [
      "A Service Worker sits between the page and the network. It can respond to `fetch` events from the cache, and it runs even when the page is closed. Web Workers run code in parallel but do not intercept network requests, and `localStorage` is synchronous and small (roughly 5 MB), so it is a poor place for large binary assets like video or images.",
      "Service Worker стоїть між сторінкою та мережею. Він може відповідати на події `fetch` з кешу і працює навіть тоді, коли сторінку закрито. Web Workers виконують код паралельно, але не перехоплюють мережеві запити, а `localStorage` синхронний і малий (близько 5 МБ), тому він не підходить для великих бінарних ресурсів на кшталт відео чи зображень.",
    ],
  ),

  quiz(
    "useref-no-rerender",
    ["react"],
    1,
    60,
    ["What useRef is for", "Для чого useRef"],
    ["Which statement about `useRef` is true?", "Яке твердження про `useRef` правильне?"],
    [
      ["Changing `ref.current` schedules a re-render of the component", "Зміна `ref.current` планує повторний рендер компонента"],
      ["Changing `ref.current` does not re-render, so it suits values that are not displayed", "Зміна `ref.current` не викликає повторний рендер, тож підходить для значень, які не відображаються"],
      ["The ref value resets to its initial value on every render", "Значення ref скидається до початкового при кожному рендері"],
      ["A ref can only hold DOM nodes", "Ref може зберігати лише DOM-вузли"],
    ],
    "b",
    [
      "A ref is a mutable box that persists across renders. Writing to it is invisible to React, so it does not trigger a render. Use state for anything that should appear in the UI, and a ref for values you need to read or update without re-rendering, such as timers, previous values or DOM handles.",
      "Ref це змінна «коробка», яка зберігається між рендерами. React не бачить запису в неї, тож він не викликає рендер. Для всього, що має з'явитися в UI, використовуйте стан, а ref для значень, які треба читати чи змінювати без повторного рендеру, наприклад таймери, попередні значення або посилання на DOM.",
    ],
  ),

  quiz(
    "server-component-data-list",
    ["react", w("nextjs", 0.5)],
    2,
    90,
    ["Where to render a read-only list", "Де рендерити список лише для читання"],
    ["A list only shows data fetched from the backend and has no interactivity. Where should it run?", "Список лише показує дані з бекенду і не має інтерактивності. Де він має виконуватися?"],
    [
      ["In a client component that fetches inside useEffect", "У клієнтському компоненті, який запитує дані в useEffect"],
      ["In a Server Component that awaits the data before the HTML is sent", "У Server Component, який чекає на дані до відправлення HTML"],
      ["In a Web Worker", "У Web Worker"],
      ["In an iframe", "В iframe"],
    ],
    "b",
    [
      "Server Components render on the server, so they can read data directly and send only the resulting markup. Hooks such as `useState` and `useEffect` need the client, so mark a component `\"use client\"` only when it needs interactivity or browser APIs. Keeping read-only lists on the server also cuts the JavaScript sent to the browser.",
      "Server Components рендеряться на сервері, тож можуть читати дані напряму і надсилати лише готову розмітку. Хуки на кшталт `useState` і `useEffect` потребують клієнта, тому позначайте компонент `\"use client\"` лише тоді, коли йому потрібна інтерактивність або браузерні API. Списки лише для читання на сервері також зменшують JavaScript, який відправляється в браузер.",
    ],
  ),

  quiz(
    "typescript-runtime-validation",
    ["typescript", w("http-rest", 0.5)],
    2,
    90,
    ["Types do not check backend data", "Типи не перевіряють дані з бекенду"],
    ["Your API response is typed as `User` with `id: string`. What is the main risk of relying only on that type?", "Відповідь API типізована як `User` з `id: string`. Який головний ризик покладатися лише на цей тип?"],
    [
      ["TypeScript checks the real response at runtime, so there is no risk", "TypeScript перевіряє реальну відповідь під час виконання, тож ризику немає"],
      ["Types are erased at runtime, so a server sending `id: 42` passes unnoticed; validate at the boundary with a runtime schema", "Типи стираються під час виконання, тож сервер, що надсилає `id: 42`, пройде непоміченим; валідуйте на межі схемою часу виконання"],
      ["The compiler rejects any response that differs from the type", "Компілятор відхиляє будь-яку відповідь, яка відрізняється від типу"],
      ["JSON cannot contain numbers", "JSON не може містити числа"],
    ],
    "b",
    [
      "TypeScript types only exist at compile time. Data from `fetch` or `response.json()` is `any` at runtime, whatever you annotated. A runtime schema (for example Zod, or a hand-written guard) checks the shape where data enters your app and gives you a typed value, or a clear error.",
      "Типи TypeScript існують лише під час компіляції. Дані з `fetch` або `response.json()` під час виконання мають тип `any`, незалежно від анотацій. Схема часу виконання (наприклад Zod або власна функція-перевірка) перевіряє форму даних на вході в застосунок і дає типізоване значення або зрозумілу помилку.",
    ],
  ),

  quiz(
    "sequential-ids-enumeration",
    ["web-security", w("rest-api-design", 0.5)],
    2,
    90,
    ["Auto-increment IDs in URLs", "Автоінкрементні ID в URL"],
    ["Routes such as `/orders/1042` use auto-increment integer IDs. What is the main concern?", "Маршрути на кшталт `/orders/1042` використовують цілочислові ID з автоінкрементом. Яка головна проблема?"],
    [
      ["Integer IDs cannot be unique across tables", "Цілочислові ID не можуть бути унікальними між таблицями"],
      ["Sequential IDs are easy to guess and enumerate, so every endpoint must check authorization; non-guessable IDs such as UUIDs reduce, but do not replace, that check", "Послідовні ID легко вгадати й перебрати, тож кожен endpoint має перевіряти авторизацію; непередбачувані ID на кшталт UUID зменшують ризик, але не замінюють цю перевірку"],
      ["Databases are slow to look up integers", "Бази даних повільно шукають цілі числа"],
      ["Browsers cannot send integers in URLs", "Браузери не можуть надсилати цілі числа в URL"],
    ],
    "b",
    [
      "Predictable IDs let an attacker walk through neighbours (`1041`, `1043`) to find records they should not see, which is an insecure direct object reference. The real defence is an authorization check on every request. Random IDs make enumeration harder, but they are defence in depth, not a substitute.",
      "Передбачувані ID дозволяють зловмиснику переходити від сусідніх значень (`1041`, `1043`) і знаходити записи, які він не повинен бачити, тобто небезпечне пряме посилання на об'єкт. Справжній захист це перевірка авторизації на кожному запиті. Випадкові ID ускладнюють перебір, але це додатковий рівень захисту, а не заміна.",
    ],
  ),

  quiz(
    "virtualized-table-spacer",
    ["web-performance", w("react", 0.5)],
    2,
    90,
    ["Rendering a 10,000-row table quickly", "Швидкий рендер таблиці на 10 000 рядків"],
    ["A table with 10,000 rows is laggy. Which approach renders the fewest DOM rows while keeping a correct scrollbar?", "Таблиця на 10 000 рядків гальмує. Який підхід рендерить найменше рядків DOM, зберігаючи коректну смугу прокрутки?"],
    [
      ["Render all rows and hide the off-screen ones with `display: none`", "Рендерити всі рядки й ховати невидимі через `display: none`"],
      ["Give a container the height of all rows, and render only the visible window of rows positioned inside it", "Дати контейнеру висоту всіх рядків і рендерити лише видиме вікно рядків, позиціоновані всередині"],
      ["Reload the page for each page of results", "Перезавантажувати сторінку для кожної сторінки результатів"],
      ["Remove `overflow` so the table cannot scroll", "Прибрати `overflow`, щоб таблиця не могла прокручуватися"],
    ],
    "b",
    [
      "Virtualization keeps the DOM small. A spacer with the full height gives the scrollbar its true length, and only the rows in the viewport (plus a small overscan) are rendered and absolutely positioned. Hiding rows with `display: none` still leaves all 10,000 nodes in the DOM, which is the main cost.",
      "Віртуалізація тримає DOM малим. Розтяжка з повною висотою дає смузі прокрутки справжню довжину, а відрендерюються й абсолютно позиціонуються лише рядки у viewport (плюс невеликий overscan). Приховування рядків через `display: none` лишає всі 10 000 вузлів у DOM, і саме це головна ціна.",
    ],
  ),

  quiz(
    "react-memo-stable-props",
    ["react", w("web-performance", 0.4)],
    2,
    90,
    ["Why React.memo does nothing", "Чому React.memo нічого не робить"],
    ["You wrap a table row in `React.memo`, but it still re-renders on every parent update. What is the most likely cause?", "Ви загорнули рядок таблиці в `React.memo`, але він і далі перерендерюється при кожному оновленні батька. Яка найімовірніша причина?"],
    [
      ["`React.memo` works only on class components", "`React.memo` працює лише з класовими компонентами"],
      ["The parent passes a new inline function or object on each render, so the props are never equal", "Батько передає нову інлайн-функцію або об'єкт при кожному рендері, тому пропси ніколи не рівні"],
      ["`memo` disables hooks inside the component", "`memo` вимикає хуки всередині компонента"],
      ["The component has no `key` prop", "У компонента немає пропа `key`"],
    ],
    "b",
    [
      "`React.memo` compares props shallowly. A callback or object literal created inline is a new reference every render, so the comparison fails. Stabilize them with `useCallback` or `useMemo`, but only where the memoized child is actually expensive; memoizing everything has its own cost.",
      "`React.memo` порівнює пропси поверхнево. Колбек або об'єкт, створений інлайн, є новим посиланням при кожному рендері, тож порівняння не проходить. Стабілізуйте їх через `useCallback` або `useMemo`, але лише там, де дочірній мемоізований компонент справді дорогий; мемоізація всього має власну ціну.",
    ],
  ),
]);
