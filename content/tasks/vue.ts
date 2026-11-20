import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const REACTIVITY_STARTER = String.raw`/** Wraps an object so reads are tracked and writes re-run the effects that read them. */
export function reactive<T extends object>(target: T): T {
  // TODO: return a Proxy (the same one every time for the same object)
  return target;
}

/** Runs fn now, and again whenever reactive data it read changes. Returns a stop function. */
export function effect(fn: () => void): () => void {
  // TODO
  fn();
  return () => {};
}

/** A lazy, cached derived value; effects that read .value re-run when it changes. */
export function computed<T>(getter: () => T): { readonly value: T } {
  // TODO
  return {
    get value() {
      return getter();
    },
  };
}
`;

const REACTIVITY_SOLUTION = String.raw`type Dep = Set<ReactiveEffect>;
type ReactiveEffect = { run(): void; deps: Set<Dep> };

let activeEffect: ReactiveEffect | null = null;
const ITERATE = Symbol("iterate");
const targetMap = new WeakMap<object, Map<PropertyKey, Dep>>(); // target → key → effects
const proxies = new WeakMap<object, object>();

function track(target: object, key: PropertyKey) {
  if (!activeEffect) return;
  let deps = targetMap.get(target);
  if (!deps) targetMap.set(target, (deps = new Map()));
  let dep = deps.get(key);
  if (!dep) deps.set(key, (dep = new Set()));
  dep.add(activeEffect);
  activeEffect.deps.add(dep); // so the effect can unsubscribe before its next run
}

function trigger(target: object, key: PropertyKey) {
  const dep = targetMap.get(target)?.get(key);
  if (!dep) return;
  for (const e of [...dep]) if (e !== activeEffect) e.run();
}

const isObject = (v: unknown): v is object => v !== null && typeof v === "object";

export function reactive<T extends object>(target: T): T {
  const existing = proxies.get(target);
  if (existing) return existing as T;
  const proxy = new Proxy(target, {
    get(obj, key, receiver) {
      track(obj, key);
      const value = Reflect.get(obj, key, receiver);
      return isObject(value) ? reactive(value) : value; // deep, but lazy
    },
    set(obj, key, value, receiver) {
      const had = Object.prototype.hasOwnProperty.call(obj, key);
      const old = (obj as Record<PropertyKey, unknown>)[key];
      const ok = Reflect.set(obj, key, value, receiver);
      if (!had) {
        trigger(obj, key);
        if (Array.isArray(obj)) trigger(obj, "length"); // push adds an index; length is set afterwards with the same value
        trigger(obj, ITERATE);
      } else if (!Object.is(old, value)) {
        trigger(obj, key);
      }
      return ok;
    },
    deleteProperty(obj, key) {
      const had = Object.prototype.hasOwnProperty.call(obj, key);
      const ok = Reflect.deleteProperty(obj, key);
      if (had) {
        trigger(obj, key);
        trigger(obj, ITERATE);
      }
      return ok;
    },
    ownKeys(obj) {
      track(obj, ITERATE); // Object.keys, for…in, spreading
      return Reflect.ownKeys(obj);
    },
  });
  proxies.set(target, proxy);
  return proxy;
}

function cleanup(e: ReactiveEffect) {
  for (const dep of e.deps) dep.delete(e);
  e.deps.clear();
}

export function effect(fn: () => void): () => void {
  let active = true;
  const e: ReactiveEffect = {
    deps: new Set(),
    run() {
      if (!active) return;
      cleanup(e); // re-collect dependencies on every run (branches may change)
      const previous = activeEffect;
      activeEffect = e;
      try {
        fn();
      } finally {
        activeEffect = previous;
      }
    },
  };
  e.run();
  return () => {
    active = false;
    cleanup(e);
  };
}

export function computed<T>(getter: () => T): { readonly value: T } {
  let value: T;
  let dirty = true;
  const self = {};
  // Instead of recomputing on change, mark dirty and notify whoever reads .value.
  const runner: ReactiveEffect = {
    deps: new Set(),
    run() {
      if (dirty) return;
      dirty = true;
      trigger(self, "value");
    },
  };
  return {
    get value() {
      if (dirty) {
        cleanup(runner);
        const previous = activeEffect;
        activeEffect = runner;
        try {
          value = getter();
        } finally {
          activeEffect = previous;
        }
        dirty = false;
      }
      track(self, "value");
      return value;
    },
  };
}
`;

const REACTIVITY_INDEX = String.raw`import "./styles.css";
import { computed, effect, reactive } from "./src/reactivity";

const state = reactive({ count: 0 });
const doubled = computed(() => state.count * 2);

const app = document.getElementById("app")!;
app.innerHTML = '<h1>Mini Vue</h1><button type="button">Increment</button><p><output id="view"></output></p>';
const view = app.querySelector("output")!;
effect(() => {
  view.textContent = state.count + " × 2 = " + doubled.value;
});
app.querySelector("button")!.addEventListener("click", () => state.count++);
`;

const REACTIVITY_TESTS = String.raw`import { describe, it, expect, screen, user } from "./test-kit";
import { computed, effect, reactive } from "../src/reactivity";

describe("reactive + effect", () => {
  it("runs an effect now and again when a property it read changes", () => {
    const state = reactive({ count: 0 });
    const seen = [];
    effect(() => seen.push(state.count));
    state.count++;
    state.count = 5;
    expect(seen).toEqual([0, 1, 5]);
  });
  it("ignores unrelated properties and writes of the same value", () => {
    const state = reactive({ a: 1, b: 1 });
    let runs = 0;
    effect(() => { runs++; state.a; });
    state.b = 2;
    state.a = 1;
    expect(runs).toBe(1);
  });
  it("returns one proxy per object and doesn't see writes to the raw object", () => {
    const raw = { n: 0 };
    const state = reactive(raw);
    expect(reactive(raw) === state).toBe(true);
    expect(state === raw).toBe(false);
    let runs = 0;
    effect(() => { runs++; state.n; });
    raw.n = 1;
    expect(runs).toBe(1);
    state.n = 2;
    expect(runs).toBe(2);
  });
  it("makes nested objects and arrays reactive", () => {
    const state = reactive({ user: { name: "Ada" }, list: [1] });
    const seen = [];
    effect(() => seen.push(state.user.name + ":" + state.list.length));
    state.user.name = "Bo";
    state.list.push(2);
    expect(seen).toEqual(["Ada:1", "Bo:1", "Bo:2"]);
  });
  it("re-collects dependencies on every run", () => {
    const state = reactive({ ok: true, a: "A", b: "B" });
    const seen = [];
    effect(() => seen.push(state.ok ? state.a : state.b));
    state.ok = false;
    state.a = "A2";
    state.b = "B2";
    expect(seen).toEqual(["A", "B", "B2"]);
  });
  it("reacts to added and deleted keys when iterating", () => {
    const state = reactive({});
    const seen = [];
    effect(() => seen.push(Object.keys(state).join(",")));
    state.x = 1;
    state.y = 2;
    delete state.x;
    expect(seen).toEqual(["", "x", "x,y", "y"]);
  });
  it("can be stopped", () => {
    const state = reactive({ n: 0 });
    let runs = 0;
    const stop = effect(() => { runs++; state.n; });
    stop();
    state.n++;
    expect(runs).toBe(1);
  });
});

describe("computed", () => {
  it("is lazy and cached until a dependency changes", () => {
    const state = reactive({ price: 10, qty: 2 });
    let calls = 0;
    const total = computed(() => { calls++; return state.price * state.qty; });
    expect(calls).toBe(0);
    expect(total.value).toBe(20);
    expect(total.value).toBe(20);
    expect(calls).toBe(1);
    state.qty = 3;
    expect(calls).toBe(1);
    expect(total.value).toBe(30);
    expect(calls).toBe(2);
  });
  it("re-runs effects that read it", () => {
    const state = reactive({ first: "Ada", last: "Lovelace" });
    const full = computed(() => state.first + " " + state.last);
    const seen = [];
    effect(() => seen.push(full.value));
    state.last = "Byron";
    expect(seen).toEqual(["Ada Lovelace", "Ada Byron"]);
  });
  it("updates the demo view on click", async () => {
    const view = await screen.findByText("0 × 2 = 0");
    await user.click(screen.getByRole("button", { name: "Increment" }));
    expect(view.textContent).toBe("1 × 2 = 2");
  });
});
`;

export default defineTasks([
  quiz(
    "vue-if-vs-show",
    ["vue"],
    1,
    60,
    ["`v-if` vs `v-show`", "`v-if` чи `v-show`"],
    ["A filter panel is toggled many times per session. Which directive fits, and why?", "Панель фільтрів перемикають багато разів за сесію. Яка директива підходить і чому?"],
    [
      ["`v-show`: it only toggles CSS `display`, so the element and its state stay mounted", "`v-show`: вона лише перемикає CSS `display`, тож елемент і його стан лишаються змонтованими"],
      ["`v-if`: it's always faster", "`v-if`: вона завжди швидша"],
      ["`v-for`: it renders the panel once per toggle", "`v-for`: вона рендерить панель на кожне перемикання"],
      ["`v-model`: it binds visibility two ways", "`v-model`: вона двосторонньо зв'язує видимість"],
    ],
    "a",
    [
      "`v-if` really adds and removes the element, running component setup and teardown each time: cheap when hidden, more expensive to toggle. `v-show` renders once and toggles `display: none`: a higher initial cost, cheap toggling, and inner state (inputs, scroll) survives. Use `v-if` for content that's rarely shown or shouldn't exist when hidden.",
      "`v-if` справді додає й прибирає елемент, щоразу ініціалізуючи й знищуючи компоненти: дешево, коли приховано, але дорожче перемикати. `v-show` рендерить один раз і перемикає `display: none`: вища початкова вартість, дешеве перемикання, і внутрішній стан (поля, прокрутка) зберігається. Використовуйте `v-if` для вмісту, який показують рідко або який не повинен існувати, коли прихований.",
    ],
  ),
  quiz(
    "vue-ref-value",
    ["vue"],
    2,
    60,
    ["`ref` in script vs template", "`ref` у скрипті й шаблоні"],
    ["`const count = ref(0)` in `<script setup>`. Which line correctly increments it in a function?", "`const count = ref(0)` у `<script setup>`. Який рядок правильно збільшує його у функції?"],
    [
      ["`count.value++`", "`count.value++`"],
      ["`count++`", "`count++`"],
      ["`count = count + 1`", "`count = count + 1`"],
      ["`this.count++`", "`this.count++`"],
    ],
    "a",
    [
      "A `ref` is an object whose `.value` is reactive; in script code you always go through `.value`. Templates unwrap top-level refs automatically, which is why `{{ count }}` and `@click=\"count++\"` work there. `count++` tries to reassign a `const`, and `this` isn't used in `<script setup>`.",
      "`ref` є об'єктом, чия властивість `.value` реактивна; у коді скрипта завжди звертайтеся через `.value`. Шаблони розгортають ref верхнього рівня автоматично, тому там працюють `{{ count }}` і `@click=\"count++\"`. `count++` намагається перепризначити `const`, а `this` у `<script setup>` не використовується.",
    ],
  ),
  quiz(
    "vue-v-for-key",
    ["vue", w("react")],
    2,
    90,
    ["Keys in `v-for`", "Ключі у `v-for`"],
    ["Each row has a text input. After deleting the first row, the text typed in it appears in the next row. What's the fix?", "Кожен рядок має текстове поле. Після видалення першого рядка введений у нього текст з'являється в наступному рядку. Як виправити?"],
    [
      ["Use a stable id as the key (`:key=\"todo.id\"`) instead of the index", "Використати стабільний id як ключ (`:key=\"todo.id\"`) замість індексу"],
      ["Remove the key entirely", "Прибрати ключ зовсім"],
      ["Use `Math.random()` as the key", "Використати `Math.random()` як ключ"],
      ["Replace `v-for` with `v-show`", "Замінити `v-for` на `v-show`"],
    ],
    "a",
    [
      "Vue reuses DOM nodes and component instances by key. With the index as key, after removing item 0 the old row 1 now has key 0, so Vue keeps the first DOM row (with its typed text) and drops the last. A stable id moves state with the item. Random keys recreate every row on each render, losing focus and state.",
      "Vue повторно використовує DOM-вузли й екземпляри компонентів за ключем. Коли ключем є індекс, після видалення елемента 0 колишній рядок 1 отримує ключ 0, тож Vue лишає перший DOM-рядок (з введеним текстом) і прибирає останній. Стабільний id переносить стан разом з елементом. Випадкові ключі пересоздають кожен рядок на кожному рендері, втрачаючи фокус і стан.",
    ],
  ),
  quiz(
    "vue-destructure-reactive",
    ["vue", w("javascript")],
    3,
    90,
    ["Destructuring reactive state", "Деструктуризація реактивного стану"],
    ["The template shows `{{ count }}` from the code below. Clicking the button changes `state.count`, but the number on screen never changes. Why?", "Шаблон показує `{{ count }}` з коду нижче. Клік на кнопку змінює `state.count`, але число на екрані не змінюється. Чому?"],
    [
      ["Destructuring copies the current value out of the proxy; use `toRefs(state)` or read `state.count`", "Деструктуризація копіює поточне значення з проксі; використайте `toRefs(state)` або читайте `state.count`"],
      ["`reactive` only works with arrays", "`reactive` працює лише з масивами"],
      ["`count` must be declared with `let`", "`count` треба оголосити через `let`"],
      ["The template needs `count.value`", "Шаблону потрібен `count.value`"],
    ],
    "a",
    [
      "`reactive` tracks property access on the proxy. `const { count } = state` reads `state.count` once and stores the number `0` in a plain variable, which nothing can update. `toRefs(state)` turns each property into a ref linked to the original, so destructuring keeps reactivity (as do `computed(() => state.count)` and `storeToRefs` for Pinia).",
      "`reactive` відстежує звернення до властивостей проксі. `const { count } = state` один раз читає `state.count` і зберігає число `0` у звичайній змінній, яку ніщо не оновить. `toRefs(state)` перетворює кожну властивість на ref, пов'язаний з оригіналом, тож деструктуризація зберігає реактивність (так само як `computed(() => state.count)` і `storeToRefs` для Pinia).",
    ],
    { code: "<script setup>\nimport { reactive } from \"vue\";\nconst state = reactive({ count: 0 });\nconst { count } = state;\nconst inc = () => state.count++;\n</script>\n\n<template>\n  <button @click=\"inc\">{{ count }}</button>\n</template>", codeLanguage: "vue" },
  ),
  quiz(
    "vue-computed-vs-method",
    ["vue", w("web-performance")],
    3,
    90,
    ["computed vs a method", "computed проти методу"],
    ["The template uses `{{ visibleTodos.length }}` three times. What's the difference between defining `visibleTodos` as a `computed` and calling a method `visibleTodos()` there?", "Шаблон тричі використовує `{{ visibleTodos.length }}`. Яка різниця між `visibleTodos` як `computed` і викликом методу `visibleTodos()`?"],
    [
      ["The computed is cached and only re-evaluated when `todos` or the filter changes; the method runs on every call in every render", "computed кешується й переобчислюється лише тоді, коли змінюються `todos` чи фільтр; метод виконується при кожному виклику на кожному рендері"],
      ["Methods are cached, computeds aren't", "Методи кешуються, а computed ні"],
      ["There's no difference", "Різниці немає"],
      ["A computed re-runs on every render, a method only once", "computed виконується на кожному рендері, а метод лише раз"],
    ],
    "a",
    [
      "A computed remembers its result and its reactive dependencies, and recomputes lazily only after one of them changes. A method call in the template runs every time the component renders, three times here. Use computeds for derived data, and keep them free of side effects.",
      "computed пам'ятає результат і свої реактивні залежності й ліниво переобчислюється лише після зміни однієї з них. Виклик методу в шаблоні виконується щоразу, коли компонент рендериться, тут тричі. Використовуйте computed для похідних даних і не робіть у них побічних ефектів.",
    ],
  ),
  quiz(
    "vue-nexttick",
    ["vue", w("event-loop")],
    3,
    120,
    ["When the DOM updates", "Коли оновлюється DOM"],
    ["The list starts empty. What do the two `console.log` calls print after `add(\"milk\")`?", "Список спершу порожній. Що виведуть два виклики `console.log` після `add(\"milk\")`?"],
    [
      ["`0`, then `1`", "`0`, потім `1`"],
      ["`1`, then `1`", "`1`, потім `1`"],
      ["`0`, then `0`", "`0`, потім `0`"],
      ["`1`, then `2`", "`1`, потім `2`"],
    ],
    "a",
    [
      "Vue doesn't patch the DOM synchronously on every change; it queues the component update and flushes it in a microtask, batching all changes from the same tick. Right after the push, the `<li>` doesn't exist yet. `await nextTick()` resolves after the flush, when the DOM reflects the new state (useful for focusing or measuring new elements).",
      "Vue не оновлює DOM синхронно при кожній зміні; він ставить оновлення компонента в чергу й виконує його в мікрозадачі, групуючи всі зміни одного «тіку». Одразу після push елемента `<li>` ще немає. `await nextTick()` завершується після оновлення, коли DOM уже відображає новий стан (корисно, щоб встановити фокус чи виміряти нові елементи).",
    ],
    {
      code: '<script setup>\nimport { nextTick, ref } from "vue";\nconst items = ref([]);\nconst list = ref(null);\n\nasync function add(item) {\n  items.value.push(item);\n  console.log(list.value.children.length);\n  await nextTick();\n  console.log(list.value.children.length);\n}\n</script>\n\n<template>\n  <ul ref="list"><li v-for="i in items" :key="i">{{ i }}</li></ul>\n</template>',
      codeLanguage: "vue",
    },
  ),
  quiz(
    "vue-prop-mutation",
    ["vue"],
    4,
    120,
    ["Changing a prop", "Зміна пропса"],
    ["A child `<SearchBox v-model=\"query\" />` writes `props.modelValue = text` on input. What happens, and what's the right approach?", "Дочірній `<SearchBox v-model=\"query\" />` записує `props.modelValue = text` під час введення. Що станеться і як правильно?"],
    [
      ["Props are read-only (Vue warns); emit `update:modelValue` or use `defineModel()` so the parent owns the change", "Пропси лише для читання (Vue попереджає); надішліть `update:modelValue` або використайте `defineModel()`, щоб зміну робив батько"],
      ["It works and updates the parent's `query`", "Це працює й оновлює `query` у батька"],
      ["It throws and unmounts the component", "Це кидає помилку й демонтує компонент"],
      ["Wrap the prop in `reactive()` first", "Спершу загорнути проп у `reactive()`"],
    ],
    "a",
    [
      "Data flows one way: the parent owns `query` and passes it down; the child asks for changes with events. `v-model` on a component is shorthand for `:modelValue` plus `@update:modelValue`, and `defineModel()` (Vue 3.4+) returns a ref that emits that event when written. If the child needs local, editable state, copy the prop into its own `ref`.",
      "Дані течуть в один бік: батько володіє `query` і передає його вниз; дочірній компонент просить змін подіями. `v-model` на компоненті є скороченням для `:modelValue` плюс `@update:modelValue`, а `defineModel()` (Vue 3.4+) повертає ref, що надсилає цю подію під час запису. Якщо дочірньому компоненту потрібен локальний змінний стан, скопіюйте проп у власний `ref`.",
    ],
  ),
  quiz(
    "vue-watch-immediate",
    ["vue"],
    4,
    120,
    ["A watcher that doesn't run at first", "Спостерігач, що не запускається одразу"],
    ["`watch(() => props.userId, loadUser)` loads the user when the id changes, but nothing loads when the page first opens. Which fixes work? Pick the best description.", "`watch(() => props.userId, loadUser)` завантажує користувача, коли змінюється id, але при першому відкритті сторінки нічого не завантажується. Що спрацює? Оберіть найкращий опис."],
    [
      ["`watch` is lazy: pass `{ immediate: true }`, or use `watchEffect(() => loadUser(props.userId))`, which runs at once and tracks what it reads", "`watch` лінивий: передайте `{ immediate: true }` або використайте `watchEffect(() => loadUser(props.userId))`, що виконується одразу й відстежує прочитане"],
      ["Use `computed(() => loadUser(props.userId))`", "Використати `computed(() => loadUser(props.userId))`"],
      ["Call `loadUser` inside the template", "Викликати `loadUser` у шаблоні"],
      ["Add `{ deep: true }`", "Додати `{ deep: true }`"],
    ],
    "a",
    [
      "`watch` only fires on changes after it's created, unless `immediate: true`. `watchEffect` runs immediately and re-runs whenever any reactive value it read changes, which suits \"keep this in sync\" effects. Computeds are for pure derived values, not side effects like fetching, and `deep` is about nested object changes.",
      "`watch` спрацьовує лише на зміни після створення, якщо не вказано `immediate: true`. `watchEffect` виконується одразу й перезапускається, коли змінюється будь-яке прочитане реактивне значення, тож підходить для ефектів «тримай це синхронним». computed призначені для чистих похідних значень, а не побічних ефектів на кшталт завантаження, а `deep` стосується змін у вкладених об'єктах.",
    ],
  ),
  quiz(
    "vue-raw-vs-proxy",
    ["vue", w("design-patterns")],
    5,
    150,
    ["Raw object vs reactive proxy", "Сирий об'єкт проти реактивного проксі"],
    ["`{{ state.count }}` is shown in a template. Which line triggers a re-render, and what is logged?", "У шаблоні показано `{{ state.count }}`. Який рядок спричиняє перерендер і що буде виведено?"],
    [
      ["Only line (2); it logs `true 2`", "Лише рядок (2); виводиться `true 2`"],
      ["Both lines; it logs `true 2`", "Обидва рядки; виводиться `true 2`"],
      ["Only line (1); it logs `false 1`", "Лише рядок (1); виводиться `false 1`"],
      ["Neither; it logs `false 2`", "Жоден; виводиться `false 2`"],
    ],
    "a",
    [
      "`reactive` returns a Proxy; only operations that go **through the proxy** are tracked and trigger effects. Writing to `raw` changes the same underlying object (so the count still ends at 2) but bypasses the proxy, so nothing re-renders until something else does. Vue caches one proxy per object, so `reactive(raw)` returns the same proxy every time.",
      "`reactive` повертає Proxy; відстежуються й запускають ефекти лише операції, що йдуть **крізь проксі**. Запис у `raw` змінює той самий об'єкт (тож лічильник усе одно стає 2), але оминає проксі, тож нічого не перерендерюється, доки не станеться щось інше. Vue кешує один проксі на об'єкт, тож `reactive(raw)` щоразу повертає той самий проксі.",
    ],
    { code: 'import { reactive } from "vue";\n\nconst raw = { count: 0 };\nconst state = reactive(raw);\n\nraw.count++;   // (1)\nstate.count++; // (2)\nconsole.log(state === reactive(raw), raw.count);', codeLanguage: "ts" },
  ),
  practice({
    slug: "vue-mini-reactivity",
    skills: ["vue", w("design-patterns"), w("typescript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["Build Vue's reactivity core", "Створіть ядро реактивності Vue"],
    prompt: [
      "Implement the heart of Vue 3's reactivity in `src/reactivity.ts`, using a `Proxy` and dependency tracking:\n\n- **`reactive(obj)`** returns a proxy (the **same** proxy for the same object). Reading a property inside a running effect records it as a dependency; writing a **different** value re-runs the effects that read it. Nested objects and arrays are reactive too (`state.list.push(x)` updates effects that read `length`). Adding or deleting keys re-runs effects that iterated with `Object.keys`.\n- **`effect(fn)`** runs `fn` immediately and again whenever its dependencies change, re-collecting them on every run (so a branch that's no longer taken stops tracking). It returns a `stop` function.\n- **`computed(getter)`** returns `{ value }`: lazy (doesn't run until read), cached until a dependency changes, and effects that read `.value` re-run when it changes.\n\nWrites to the raw object (not through the proxy) are not tracked. The demo renders a counter with an effect.",
      "Реалізуйте серце реактивності Vue 3 у `src/reactivity.ts` за допомогою `Proxy` і відстеження залежностей:\n\n- **`reactive(obj)`** повертає проксі (**той самий** для того самого об'єкта). Читання властивості всередині ефекту, що виконується, записує її як залежність; запис **іншого** значення перезапускає ефекти, що її читали. Вкладені об'єкти й масиви теж реактивні (`state.list.push(x)` оновлює ефекти, що читали `length`). Додавання чи видалення ключів перезапускає ефекти, що перебирали їх через `Object.keys`.\n- **`effect(fn)`** виконує `fn` одразу й знову щоразу, коли змінюються його залежності, збираючи їх заново на кожному запуску (тож гілка, що вже не виконується, перестає відстежуватися). Повертає функцію `stop`.\n- **`computed(getter)`** повертає `{ value }`: лінивий (не виконується до читання), кешований до зміни залежності, а ефекти, що читають `.value`, перезапускаються, коли воно змінюється.\n\nЗаписи в сирий об'єкт (не крізь проксі) не відстежуються. Демо рендерить лічильник через ефект.",
    ],
    files: { "/src/reactivity.ts": REACTIVITY_STARTER, "/index.ts": REACTIVITY_INDEX },
    visibleFiles: ["/src/reactivity.ts", "/index.ts"],
    activeFile: "/src/reactivity.ts",
    tests: REACTIVITY_TESTS,
    solution: { "/src/reactivity.ts": REACTIVITY_SOLUTION },
    explanation: [
      "A global `activeEffect` plus a `WeakMap<target, Map<key, Set<effect>>>` is the whole trick: the proxy's `get` records (effect, target, key) and `set` re-runs the effects stored for that key. Each effect clears its old dependencies before re-running, so branches switch cleanly. `ownKeys` and a special ITERATE key cover `Object.keys`. A computed is an effect whose scheduler only marks it dirty and notifies its own readers, which makes it lazy and cached. That's the same design as `@vue/reactivity`.",
      "Увесь секрет у глобальному `activeEffect` і `WeakMap<target, Map<key, Set<effect>>>`: `get` проксі записує (ефект, об'єкт, ключ), а `set` перезапускає ефекти, збережені для цього ключа. Кожен ефект очищає старі залежності перед повторним запуском, тож гілки перемикаються чисто. `ownKeys` і спеціальний ключ ITERATE покривають `Object.keys`. computed є ефектом, чий планувальник лише позначає його «брудним» і сповіщає власних читачів, що робить його лінивим і кешованим. Саме так влаштований `@vue/reactivity`.",
    ],
  }),
]);
