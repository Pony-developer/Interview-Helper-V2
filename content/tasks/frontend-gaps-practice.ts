import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const VDOM_STARTER = code`export type VNode = { type: string; props: Record<string, string>; children: Array<VNode | string> };
export type Patch =
  | { type: "REPLACE"; path: number[]; node: VNode | string }
  | { type: "PROPS"; path: number[]; props: Record<string, string | null> }
  | { type: "APPEND"; path: number[]; node: VNode | string }
  | { type: "REMOVE"; path: number[]; index: number };

/** Compares two trees and returns the minimal list of patches that turns oldNode into newNode. */
export function diff(oldNode: VNode | string, newNode: VNode | string, path: number[] = []): Patch[] {
  // TODO
  return [];
}
`;

const VDOM_SOLUTION = code`export type VNode = { type: string; props: Record<string, string>; children: Array<VNode | string> };
export type Patch =
  | { type: "REPLACE"; path: number[]; node: VNode | string }
  | { type: "PROPS"; path: number[]; props: Record<string, string | null> }
  | { type: "APPEND"; path: number[]; node: VNode | string }
  | { type: "REMOVE"; path: number[]; index: number };

const has = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

export function diff(oldNode: VNode | string, newNode: VNode | string, path: number[] = []): Patch[] {
  // Text and elements, or elements with different tags, can't be patched in place: replace them.
  if (typeof oldNode === "string" || typeof newNode === "string") {
    return oldNode === newNode ? [] : [{ type: "REPLACE", path, node: newNode }];
  }
  if (oldNode.type !== newNode.type) return [{ type: "REPLACE", path, node: newNode }];

  const patches: Patch[] = [];

  // Attributes: changed or added values are set; attributes that disappeared are marked null.
  const props: Record<string, string | null> = {};
  for (const key of Object.keys(newNode.props)) {
    if (!has(oldNode.props, key) || oldNode.props[key] !== newNode.props[key]) props[key] = newNode.props[key];
  }
  for (const key of Object.keys(oldNode.props)) {
    if (!has(newNode.props, key)) props[key] = null;
  }
  if (Object.keys(props).length > 0) patches.push({ type: "PROPS", path, props });

  // Children are matched by position. Extra new children are appended; extra old ones are removed from the end.
  const shared = Math.min(oldNode.children.length, newNode.children.length);
  for (let i = 0; i < shared; i++) {
    patches.push(...diff(oldNode.children[i], newNode.children[i], [...path, i]));
  }
  for (let i = oldNode.children.length; i < newNode.children.length; i++) {
    patches.push({ type: "APPEND", path, node: newNode.children[i] });
  }
  // Remove from the highest index down, so each index still refers to the node that was there.
  for (let i = oldNode.children.length - 1; i >= newNode.children.length; i--) {
    patches.push({ type: "REMOVE", path, index: i });
  }
  return patches;
}
`;

const VDOM_INDEX = code`import "./styles.css";
import { diff } from "./src/vdom";

const before = { type: "p", props: { class: "note" }, children: ["Saved"] };
const after = { type: "p", props: { class: "note done" }, children: ["Saved!"] };
document.getElementById("app")!.innerHTML = '<h1>Virtual DOM diff</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify(diff(before, after), null, 2);
`;

const VDOM_TESTS = code`import { describe, it, expect } from "./test-kit";
import { diff } from "../src/vdom";

const el = (type, props, ...children) => ({ type, props, children });

describe("diff", () => {
  it("returns no patches for identical trees", () => {
    const tree = el("div", { id: "app" }, "hi", el("span", {}, "there"));
    expect(diff(tree, el("div", { id: "app" }, "hi", el("span", {}, "there")))).toEqual([]);
  });
  it("replaces a text node whose content changed", () => {
    expect(diff(el("p", {}, "a"), el("p", {}, "b"))).toEqual([{ type: "REPLACE", path: [0], node: "b" }]);
  });
  it("replaces a node whose tag changed", () => {
    expect(diff(el("div", {}), el("span", {}))).toEqual([{ type: "REPLACE", path: [], node: el("span", {}) }]);
  });
  it("sets changed or added attributes and marks removed ones as null", () => {
    const patches = diff(el("a", { href: "/x", class: "nav" }), el("a", { href: "/y", id: "home" }));
    expect(patches).toEqual([{ type: "PROPS", path: [], props: { href: "/y", id: "home", class: null } }]);
  });
  it("emits nothing for unchanged attributes", () => {
    expect(diff(el("a", { href: "/x" }), el("a", { href: "/x" }))).toEqual([]);
  });
  it("finds a change deep in the tree by its path", () => {
    const before = el("ul", {}, el("li", {}, "a"), el("li", {}, "b"));
    const after = el("ul", {}, el("li", {}, "a"), el("li", {}, "B"));
    expect(diff(before, after)).toEqual([{ type: "REPLACE", path: [1, 0], node: "B" }]);
  });
  it("appends extra new children in order", () => {
    expect(diff(el("ul", {}, "a"), el("ul", {}, "a", "b", "c"))).toEqual([
      { type: "APPEND", path: [], node: "b" },
      { type: "APPEND", path: [], node: "c" },
    ]);
  });
  it("removes extra old children from the highest index down", () => {
    expect(diff(el("ul", {}, "a", "b", "c"), el("ul", {}, "a"))).toEqual([
      { type: "REMOVE", path: [], index: 2 },
      { type: "REMOVE", path: [], index: 1 },
    ]);
  });
  it("orders a parent's attribute patch before its children's patches", () => {
    const patches = diff(el("div", { class: "a" }, "x"), el("div", { class: "b" }, "y"));
    expect(patches).toEqual([
      { type: "PROPS", path: [], props: { class: "b" } },
      { type: "REPLACE", path: [0], node: "y" },
    ]);
  });
});
`;

export default defineTasks([
  quiz(
    "sass-use-vs-import",
    ["sass", w("css", 0.3)],
    2,
    75,
    ["Sass modules: @use versus @import", "Модулі Sass: @use проти @import"],
    ["Why do modern Sass projects prefer @use and @forward over @import?", "Чому сучасні проєкти Sass віддають перевагу @use і @forward, а не @import?"],
    [
      ["@use loads each file once into a namespace, so variables and mixins don't leak into a shared global scope; @import merges everything into one global scope", "@use завантажує кожен файл один раз у простір імен, тож змінні й міксини не потрапляють у спільну глобальну область; @import зливає все в одну глобальну область"],
      ["@use compiles to plain CSS faster, but @import is required for variables", "@use компілюється в простий CSS швидше, але для змінних потрібен @import"],
      ["@import is deprecated only in browsers, not in Sass", "@import застарів лише в браузерах, а не в Sass"],
      ["@forward is the same as @import, only with a different name", "@forward — те саме, що й @import, лише з іншою назвою"],
    ],
    "a",
    [
      "With `@use`, a file is evaluated once and its members are reached through a namespace such as `colors.$primary`, so two partials can define the same name without clashing. `@import` puts every member in one global scope and evaluates the file again each time it is imported. `@forward` lets an index file re-export a module's members to its own users.",
      "З `@use` файл обчислюється один раз, а його члени доступні через простір імен, наприклад `colors.$primary`, тож два частини можуть визначити однакову назву без конфлікту. `@import` поміщає всі члени в одну глобальну область і обчислює файл знову при кожному імпорті. `@forward` дозволяє файлу-індексу передавати члени модуля далі для його користувачів.",
    ],
  ),
  quiz(
    "css-bem-naming",
    ["css", w("web-accessibility", 0.3)],
    2,
    75,
    ["Reading a BEM class name", "Читання назви класу BEM"],
    ["In BEM naming, what does the class card__title--highlighted express?", "Що в іменуванні BEM означає клас card__title--highlighted?"],
    [
      ["The block card, its element title, and the highlighted modifier of that element", "Блок card, його елемент title і модифікатор highlighted цього елемента"],
      ["A card that is inside a title, highlighted by JavaScript", "Картка всередині заголовка, підсвічена JavaScript"],
      ["A global utility class for highlighting text", "Глобальний утилітарний клас для підсвічування тексту"],
      ["The third nested card in a list", "Третя вкладена картка в списку"],
    ],
    "a",
    [
      "BEM names describe structure in the class itself: a block is a standalone component, `__` introduces an element inside it, and `--` a modifier that changes its look or state. Because every class name carries its place in the hierarchy, styles stay flat and don't depend on how the markup happens to be nested.",
      "Назви BEM описують структуру в самому класі: блок — це самостійний компонент, `__` позначає елемент всередині нього, а `--` — модифікатор, що змінює вигляд або стан. Оскільки кожна назва класу несе своє місце в ієрархії, стилі лишаються плоскими і не залежать від того, як випадково вкладено розмітку.",
    ],
  ),
  quiz(
    "react-virtual-dom-purpose",
    ["react", w("web-performance", 0.3)],
    3,
    90,
    ["Why a virtual DOM", "Навіщо віртуальний DOM"],
    ["Why do UI libraries such as React build a virtual DOM and compare it with the previous one?", "Навіщо бібліотеки інтерфейсу, як-от React, будують віртуальний DOM і порівнюють його з попереднім?"],
    [
      ["To work out the smallest set of real DOM changes for an update and apply them together, instead of rebuilding the page each time", "Щоб визначити найменший набір змін реального DOM для оновлення і застосувати їх разом, а не перебудовувати сторінку щоразу"],
      ["To run JavaScript without a browser", "Щоб запускати JavaScript без браузера"],
      ["Because the browser can't render elements that change", "Бо браузер не може відображати елементи, які змінюються"],
      ["To store data on the server instead of the client", "Щоб зберігати дані на сервері, а не на клієнті"],
    ],
    "a",
    [
      "Touching the real DOM is comparatively expensive, and rebuilding it wholesale is wasteful. A virtual DOM is a cheap description of the UI as plain objects; diffing two descriptions yields a short list of changes that the renderer applies, typically in one batch. The diff is an optimisation, not a promise of speed: keys and memoisation still decide how much work each update does.",
      "Робота з реальним DOM відносно дорога, а повна перебудова — марнотратна. Віртуальний DOM — це недорогий опис інтерфейсу у вигляді звичайних об'єктів; порівняння двох описів дає короткий список змін, які рендерер застосовує, як правило, одним пакетом. Порівняння — це оптимізація, а не гарантія швидкості: ключі й мемоїзація все ще визначають, скільки роботи виконує кожне оновлення.",
    ],
  ),
  quiz(
    "crdt-offline-merge",
    ["system-design", w("data-structures", 0.3)],
    4,
    120,
    ["Why CRDTs suit offline editing", "Чому CRDT підходять для редагування офлайн"],
    ["Two users edit the same document offline and then reconnect. What property lets a CRDT merge their changes without a central conflict resolver?", "Два користувачі редагують один документ офлайн, а потім знову під'єднуються. Яка властивість дозволяє CRDT об'єднати їхні зміни без центрального вирішувача конфліктів?"],
    [
      ["The merge operation is commutative, associative and idempotent, so replicas that receive the same updates in any order converge to the same state", "Операція злиття комутативна, асоціативна та ідемпотентна, тож репліки, що отримали ті самі оновлення в будь-якому порядку, сходяться до одного стану"],
      ["Each user's changes are locked until the other finishes", "Зміни кожного користувача блокуються, доки інший не завершить роботу"],
      ["The server always keeps the last write and discards the rest", "Сервер завжди зберігає останній запис, а решту відкидає"],
      ["Clocks are synchronised to the millisecond on every device", "Годинники синхронізовані з точністю до мілісекунди на кожному пристрої"],
    ],
    "a",
    [
      "A CRDT (conflict-free replicated data type) is designed so that merging is mathematically well-behaved: order and repetition of updates don't change the result. That lets every replica accept local edits immediately and merge later without coordination. Locking, or a last-write-wins server, gives up either availability or the user's edits, which is why real collaborative editors use CRDT-like or operational-transform techniques.",
      "CRDT (conflict-free replicated data type, безконфліктний реплікований тип даних) спроєктовано так, що злиття математично коректне: порядок і повтор оновлень не змінюють результат. Це дозволяє кожній репліці одразу приймати локальні правки і зливати їх пізніше без координації. Блокування або сервер «останній запис перемагає» жертвують або доступністю, або правками користувачів, тому справжні редактори спільної роботи використовують техніки, близькі до CRDT, або операційні перетворення.",
    ],
  ),
  practice({
    slug: "react-vdom-diff",
    skills: ["react", w("data-structures"), w("typescript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["Diff two virtual DOM trees", "Порівняйте два дерева віртуального DOM"],
    prompt: [
      "A UI library never rewrites the whole page: it compares the previous virtual tree with the next one and emits the smallest list of changes. Implement `diff(oldNode, newNode)` in `src/vdom.ts` for trees of `{ type, props, children }` objects, where text nodes are plain strings:\n\n- Text that changed, or an element whose tag changed, is a `REPLACE` at that node's path. Paths are child indexes from the root, so the root is `[]`.\n- Changed or added attributes go in one `PROPS` patch for the element; an attribute that disappeared is set to `null`. Emit no patch when nothing changed.\n- Children are matched by position and diffed recursively. Extra new children are `APPEND` patches; extra old ones are `REMOVE` patches with their index, from the highest index down.\n- Order: an element's `PROPS` patch comes first, then its children's patches in order, then its appends, then its removals.",
      "Бібліотека інтерфейсу ніколи не перебудовує всю сторінку: вона порівнює попереднє віртуальне дерево з наступним і видає найменший список змін. Реалізуйте `diff(oldNode, newNode)` у `src/vdom.ts` для дерев з об'єктів `{ type, props, children }`, де текстові вузли — це звичайні рядки:\n\n- Змінений текст або елемент зі зміненим тегом — це `REPLACE` за шляхом цього вузла. Шляхи — це індекси дочірніх вузлів від кореня, тож корінь має шлях `[]`.\n- Змінені або додані атрибути йдуть в один патч `PROPS` для елемента; атрибут, що зник, позначається як `null`. Якщо нічого не змінилося, патчів немає.\n- Дочірні вузли зіставляються за позицією і порівнюються рекурсивно. Зайві нові дочірні вузли — це патчі `APPEND`, зайві старі — патчі `REMOVE` з їхнім індексом, від найбільшого індексу до найменшого.\n- Порядок: спершу патч `PROPS` елемента, потім патчі його дочірніх вузлів по порядку, потім додавання, потім видалення.",
    ],
    files: {
      "/src/vdom.ts": VDOM_STARTER,
      "/index.ts": VDOM_INDEX,
    },
    visibleFiles: ["/src/vdom.ts"],
    activeFile: "/src/vdom.ts",
    tests: VDOM_TESTS,
    solution: { "/src/vdom.ts": VDOM_SOLUTION },
    explanation: [
      "The diff is a recursive walk that stops as soon as two nodes can't be reconciled in place. Different tags or text against an element force a replace, because there is nothing to patch. Matching children by position is simple and fast, but it's the reason React asks for `key`s on lists: without keys, inserting an item at the start looks like changing every item. Removals go from the highest index down so each recorded index still refers to the node that was there when the patch was made. The attribute patch uses `null` to mean \"remove\", which keeps the patch format a single object per element.",
      "Порівняння — це рекурсивний обхід, що зупиняється, щойно два вузли неможливо узгодити на місці. Різні теги або текст проти елемента вимагають заміни, бо патчити нічого. Зіставлення дочірніх вузлів за позицією просте й швидке, але саме через це React просить `key` у списків: без ключів вставка елемента на початок виглядає як зміна кожного елемента. Видалення йдуть від найбільшого індексу до найменшого, щоб кожен записаний індекс досі вказував на вузол, який був там під час створення патча. Патч атрибутів використовує `null` як «видалити», тож формат патча — це один об'єкт на елемент.",
    ],
  }),
]);
