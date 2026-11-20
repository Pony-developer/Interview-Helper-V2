import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const HISTORY_STARTER = String.raw`export interface Command {
  label: string;
  execute(): void;
  undo(): void;
}

/** Undo/redo manager for commands. */
export class History {
  constructor(private readonly limit = 100) {}

  /** Executes the command and remembers it. */
  run(command: Command): void {
    command.execute();
  }

  /** Undoes the most recent command. Returns false when there's nothing to undo. */
  undo(): boolean {
    return false;
  }

  /** Re-executes the most recently undone command. Returns false when there's nothing to redo. */
  redo(): boolean {
    return false;
  }

  get canUndo(): boolean {
    return false;
  }

  get canRedo(): boolean {
    return false;
  }

  /** Labels of the commands that can be undone, oldest first. */
  get labels(): string[] {
    return [];
  }
}

export class TextDoc {
  constructor(public text = "") {}
}

export function insertText(doc: TextDoc, index: number, value: string): Command {
  return {
    label: "insert",
    execute: () => {
      doc.text = doc.text.slice(0, index) + value + doc.text.slice(index);
    },
    undo: () => {
      doc.text = doc.text.slice(0, index) + doc.text.slice(index + value.length);
    },
  };
}

export function deleteText(doc: TextDoc, index: number, length: number): Command {
  // TODO
  return { label: "delete", execute: () => {}, undo: () => {} };
}
`;

const HISTORY_SOLUTION = String.raw`export interface Command {
  label: string;
  execute(): void;
  undo(): void;
}

export class History {
  private done: Command[] = [];
  private undone: Command[] = [];

  constructor(private readonly limit = 100) {}

  run(command: Command): void {
    command.execute();
    this.done.push(command);
    if (this.done.length > this.limit) this.done.shift();
    // A new action makes the old "future" meaningless.
    this.undone = [];
  }

  undo(): boolean {
    const command = this.done.pop();
    if (!command) return false;
    command.undo();
    this.undone.push(command);
    return true;
  }

  redo(): boolean {
    const command = this.undone.pop();
    if (!command) return false;
    command.execute();
    this.done.push(command);
    return true;
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  get labels(): string[] {
    return this.done.map((c) => c.label);
  }
}

export class TextDoc {
  constructor(public text = "") {}
}

export function insertText(doc: TextDoc, index: number, value: string): Command {
  return {
    label: "insert",
    execute: () => {
      doc.text = doc.text.slice(0, index) + value + doc.text.slice(index);
    },
    undo: () => {
      doc.text = doc.text.slice(0, index) + doc.text.slice(index + value.length);
    },
  };
}

export function deleteText(doc: TextDoc, index: number, length: number): Command {
  let removed = "";
  return {
    label: "delete",
    execute: () => {
      // Capture what is removed at execution time, not when the command is created.
      removed = doc.text.slice(index, index + length);
      doc.text = doc.text.slice(0, index) + doc.text.slice(index + length);
    },
    undo: () => {
      doc.text = doc.text.slice(0, index) + removed + doc.text.slice(index);
    },
  };
}
`;

const HISTORY_INDEX = String.raw`import "./styles.css";
import { History, TextDoc, deleteText, insertText } from "./src/history";

const doc = new TextDoc();
const history = new History();
history.run(insertText(doc, 0, "Hello world"));
history.run(deleteText(doc, 5, 6));
history.run(insertText(doc, 5, ", Assay"));
history.undo();
history.undo();
document.getElementById("app")!.innerHTML =
  '<h1>Undo / redo</h1><p>Text: <output id="text">' + doc.text + "</output></p><p>Can redo: " + history.canRedo + "</p>";
`;

const HISTORY_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { History, TextDoc, deleteText, insertText } from "../src/history";

describe("History", () => {
  it("undoes commands in reverse order", () => {
    const doc = new TextDoc();
    const h = new History();
    h.run(insertText(doc, 0, "Hello"));
    h.run(insertText(doc, 5, " world"));
    expect(doc.text).toBe("Hello world");
    expect(h.undo()).toBe(true);
    expect(doc.text).toBe("Hello");
    expect(h.undo()).toBe(true);
    expect(doc.text).toBe("");
    expect(h.undo()).toBe(false);
  });
  it("redoes undone commands", () => {
    const doc = new TextDoc();
    const h = new History();
    h.run(insertText(doc, 0, "Hi"));
    h.undo();
    expect(h.redo()).toBe(true);
    expect(doc.text).toBe("Hi");
    expect(h.redo()).toBe(false);
  });
  it("clears the redo stack when a new command runs", () => {
    const doc = new TextDoc();
    const h = new History();
    h.run(insertText(doc, 0, "a"));
    h.undo();
    h.run(insertText(doc, 0, "b"));
    expect(h.canRedo).toBe(false);
    expect(h.redo()).toBe(false);
    expect(doc.text).toBe("b");
  });
  it("restores deleted text on undo", () => {
    const doc = new TextDoc("Hello world");
    const h = new History();
    h.run(deleteText(doc, 5, 6));
    expect(doc.text).toBe("Hello");
    h.undo();
    expect(doc.text).toBe("Hello world");
    h.redo();
    expect(doc.text).toBe("Hello");
  });
  it("captures deleted text when the command executes", () => {
    const doc = new TextDoc();
    const h = new History();
    const del = deleteText(doc, 0, 3);
    h.run(insertText(doc, 0, "abcdef"));
    h.run(del);
    expect(doc.text).toBe("def");
    h.undo();
    expect(doc.text).toBe("abcdef");
  });
  it("reports canUndo, canRedo and labels", () => {
    const doc = new TextDoc("xyz");
    const h = new History();
    expect(h.canUndo).toBe(false);
    h.run(insertText(doc, 0, "a"));
    h.run(deleteText(doc, 0, 1));
    expect(h.canUndo).toBe(true);
    expect(h.labels).toEqual(["insert", "delete"]);
    h.undo();
    expect(h.canRedo).toBe(true);
    expect(h.labels).toEqual(["insert"]);
  });
  it("forgets the oldest commands beyond the limit", () => {
    const doc = new TextDoc();
    const h = new History(2);
    h.run(insertText(doc, 0, "a"));
    h.run(insertText(doc, 1, "b"));
    h.run(insertText(doc, 2, "c"));
    expect(h.undo()).toBe(true);
    expect(h.undo()).toBe(true);
    expect(h.undo()).toBe(false);
    expect(doc.text).toBe("a");
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("Hello world")).id).toBe("text");
  });
});
`;

const COMPOSE_STARTER = String.raw`export type Next = () => Promise<void>;
export type Middleware<C> = (ctx: C, next: Next) => Promise<void> | void;

/**
 * Koa-style middleware composition: each middleware gets the shared context and a next()
 * that runs the rest of the chain (and finally the optional last handler).
 */
export function compose<C>(middlewares: Middleware<C>[]): (ctx: C, last?: Next) => Promise<void> {
  // TODO: this runs every middleware one after another and ignores next()
  return async (ctx, last) => {
    for (const mw of middlewares) await mw(ctx, async () => {});
    if (last) await last();
  };
}
`;

const COMPOSE_SOLUTION = String.raw`export type Next = () => Promise<void>;
export type Middleware<C> = (ctx: C, next: Next) => Promise<void> | void;

export function compose<C>(middlewares: Middleware<C>[]): (ctx: C, last?: Next) => Promise<void> {
  return (ctx, last) => {
    let current = -1;

    function dispatch(i: number): Promise<void> {
      if (i <= current) return Promise.reject(new Error("next() called multiple times"));
      current = i;
      if (i === middlewares.length) return last ? Promise.resolve().then(last) : Promise.resolve();
      try {
        // Promise.resolve handles sync middlewares; try/catch turns sync throws into rejections.
        return Promise.resolve(middlewares[i](ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
`;

const COMPOSE_INDEX = String.raw`import "./styles.css";
import { compose } from "./src/compose";

type Ctx = { path: string; user: string | null; status: number; log: string[] };

const app = compose<Ctx>([
  async (ctx, next) => {
    ctx.log.push("start " + ctx.path);
    await next();
    ctx.log.push("end " + ctx.status);
  },
  (ctx, next) => {
    if (ctx.path.startsWith("/admin") && !ctx.user) {
      ctx.status = 401;
      return;
    }
    return next();
  },
  (ctx) => {
    ctx.status = 200;
    ctx.log.push("handler");
  },
]);

const ctx: Ctx = { path: "/admin", user: null, status: 0, log: [] };
app(ctx).then(() => {
  document.getElementById("app")!.innerHTML =
    '<h1>Middleware</h1><p>Status: <output id="status">' + ctx.status + "</output></p><pre>" + ctx.log.join("\n") + "</pre>";
});
`;

const COMPOSE_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { compose } from "../src/compose";

describe("compose", () => {
  it("runs middlewares like an onion", async () => {
    const log = [];
    const run = compose([
      async (ctx, next) => { log.push("a1"); await next(); log.push("a2"); },
      async (ctx, next) => { log.push("b1"); await next(); log.push("b2"); },
    ]);
    await run({});
    expect(log).toEqual(["a1", "b1", "b2", "a2"]);
  });
  it("shares the context and calls the last handler", async () => {
    const ctx = { steps: [] };
    await compose([(c, next) => { c.steps.push("auth"); return next(); }])(ctx, async () => { ctx.steps.push("handler"); });
    expect(ctx.steps).toEqual(["auth", "handler"]);
  });
  it("stops when a middleware doesn't call next", async () => {
    const reached = [];
    const last = async () => { reached.push("last"); };
    await compose([() => { reached.push(1); }, (c, next) => { reached.push(2); return next(); }])({}, last);
    expect(reached).toEqual([1]);
  });
  it("waits for async work before continuing", async () => {
    const log = [];
    await compose([
      async (c, next) => { await new Promise((r) => setTimeout(r, 5)); log.push("slow"); await next(); },
      () => { log.push("fast"); },
    ])({});
    expect(log).toEqual(["slow", "fast"]);
  });
  it("lets an outer middleware catch errors thrown further down", async () => {
    const ctx = {};
    await compose([
      async (c, next) => { try { await next(); } catch (e) { c.error = e.message; } },
      () => { throw new Error("boom"); },
    ])(ctx);
    expect(ctx.error).toBe("boom");
  });
  it("rejects when an error isn't handled", async () => {
    await expect(compose([async () => { throw new Error("nope"); }])({})).rejects.toThrow("nope");
  });
  it("rejects when next() is called twice", async () => {
    await expect(compose([async (c, next) => { await next(); await next(); }])({})).rejects.toThrow("multiple");
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("401")).id).toBe("status");
  });
});
`;

export default defineTasks([
  quiz(
    "pattern-observer",
    ["design-patterns"],
    1,
    45,
    ["Name the pattern: subscriptions", "Назвіть патерн: підписки"],
    ["`addEventListener`, RxJS `subscribe` and Redux `store.subscribe` are all examples of which pattern?", "`addEventListener`, `subscribe` у RxJS і `store.subscribe` у Redux є прикладами якого патерну?"],
    [
      ["Observer", "Observer (спостерігач)"],
      ["Singleton", "Singleton (одинак)"],
      ["Builder", "Builder (будівельник)"],
      ["Adapter", "Adapter (адаптер)"],
    ],
    "a",
    [
      "In the Observer pattern a subject keeps a list of subscribers and notifies them when something happens. Each of these APIs also returns or accepts a way to unsubscribe, which you need to call to avoid memory leaks.",
      "У патерні Observer суб'єкт тримає список підписників і сповіщає їх, коли щось стається. Кожен із цих API також повертає або приймає спосіб відписатися, і його треба викликати, щоб уникнути витоків пам'яті.",
    ],
  ),
  quiz(
    "pattern-module-singleton",
    ["design-patterns", w("es-modules")],
    2,
    90,
    ["Module singletons", "Синглтони-модулі"],
    ["`api.ts` ends with `export const api = new ApiClient();`. What's true about this?", "`api.ts` закінчується рядком `export const api = new ApiClient();`. Що з цього правда?"],
    [
      ["Every importer shares one instance because a module is evaluated once; the catch is hidden global state that's hard to replace in tests", "Усі, хто імпортує, ділять один екземпляр, бо модуль виконується один раз; підступ у прихованому глобальному стані, який важко підмінити в тестах"],
      ["Each import creates a new `ApiClient`", "Кожен імпорт створює новий `ApiClient`"],
      ["It isn't a singleton unless the class has a private constructor", "Це не синглтон, якщо в класу немає приватного конструктора"],
      ["Module-level instances are garbage-collected after the first import", "Екземпляри на рівні модуля прибирає збирач сміття після першого імпорту"],
    ],
    "a",
    [
      "ES modules are cached: the module body runs once and every import gets the same bindings, so this is a singleton without any ceremony. The cost is coupling: code that imports `api` directly can't easily get a fake in tests, and state leaks between tests. Passing the client in (dependency injection) avoids both.",
      "Модулі ES кешуються: тіло модуля виконується один раз, і кожен імпорт отримує ті самі прив'язки, тож це синглтон без жодних церемоній. Ціна в зв'язності: код, що імпортує `api` напряму, важко забезпечити фейком у тестах, а стан протікає між тестами. Передача клієнта ззовні (впровадження залежностей) усуває обидві проблеми.",
    ],
  ),
  quiz(
    "pattern-strategy",
    ["design-patterns"],
    2,
    60,
    ["Name the pattern: swappable algorithms", "Назвіть патерн: змінні алгоритми"],
    ["A growing `switch (order.method)` that computes shipping cost is replaced by an object of functions keyed by method. Which pattern is this?", "`switch (order.method)`, що обчислює вартість доставки й постійно росте, замінили об'єктом функцій за ключем методу. Який це патерн?"],
    [
      ["Strategy", "Strategy (стратегія)"],
      ["Facade", "Facade (фасад)"],
      ["Proxy", "Proxy (замісник)"],
      ["Command", "Command (команда)"],
    ],
    "a",
    [
      "Strategy puts interchangeable algorithms behind one interface and picks one at runtime. Adding a shipping method becomes adding an entry, not editing a branchy function (the open/closed principle).",
      "Strategy ховає взаємозамінні алгоритми за одним інтерфейсом і обирає потрібний під час виконання. Новий спосіб доставки означає новий запис, а не редагування розгалуженої функції (принцип відкритості/закритості).",
    ],
    { code: "const shippingCost = {\n  standard: (order) => 5,\n  express: (order) => 15,\n  free: () => 0,\n};\nconst cost = shippingCost[order.method](order);", codeLanguage: "js" },
  ),
  quiz(
    "pattern-decorator",
    ["design-patterns", w("closures-scope")],
    3,
    90,
    ["Wrapping behaviour", "Обгортання поведінки"],
    [
      "You need fetch helpers with any combination of retry, caching and logging. Why is `withLogging(withCache(withRetry(fetchJson)))` usually better than subclasses like `RetryingCachingFetcher`?",
      "Потрібні fetch-помічники з будь-якою комбінацією повторних спроб, кешування й логування. Чому `withLogging(withCache(withRetry(fetchJson)))` зазвичай кращий за підкласи на кшталт `RetryingCachingFetcher`?",
    ],
    [
      ["Decorators compose: N wrappers cover every combination, while subclasses need one class per combination", "Декоратори комбінуються: N обгорток покривають усі комбінації, а підкласам потрібен окремий клас на кожну"],
      ["Wrapped functions run faster", "Обгорнуті функції працюють швидше"],
      ["Subclasses can't call `fetch`", "Підкласи не можуть викликати `fetch`"],
      ["Decorators modify the original function in place", "Декоратори змінюють початкову функцію на місці"],
    ],
    "a",
    [
      "A decorator wraps an object or function with the same interface and adds behaviour before or after delegating. Because every wrapper accepts and returns the same shape, they stack in any order and number. Inheritance fixes one combination per class, so three features would need up to seven subclasses. The original `fetchJson` stays untouched.",
      "Декоратор обгортає об'єкт чи функцію з тим самим інтерфейсом і додає поведінку до або після делегування. Оскільки кожна обгортка приймає й повертає ту саму форму, їх можна складати в будь-якому порядку й кількості. Успадкування фіксує одну комбінацію на клас, тож трьом можливостям знадобилося б до семи підкласів. Початкова `fetchJson` лишається незмінною.",
    ],
  ),
  quiz(
    "pattern-adapter-vs-facade",
    ["design-patterns"],
    3,
    90,
    ["Adapter or Facade?", "Adapter чи Facade?"],
    [
      "The app calls `analytics.track(event, props)`. You switch vendors, and the new SDK expects `sdk.logEvent({ name, attributes })`. You write a small object with a `track` method that calls `logEvent`. Which pattern is it?",
      "Застосунок викликає `analytics.track(event, props)`. Ви змінюєте постачальника, і новий SDK очікує `sdk.logEvent({ name, attributes })`. Ви пишете невеликий об'єкт з методом `track`, що викликає `logEvent`. Який це патерн?",
    ],
    [
      ["Adapter: it converts the SDK's interface into the one your code already expects", "Adapter: перетворює інтерфейс SDK на той, якого ваш код уже очікує"],
      ["Facade: it simplifies a complex subsystem", "Facade: спрощує складну підсистему"],
      ["Observer: it notifies the SDK", "Observer: сповіщає SDK"],
      ["Singleton: there's only one analytics object", "Singleton: об'єкт аналітики лише один"],
    ],
    "a",
    [
      "An adapter translates between two existing interfaces so callers don't change. A facade has a different goal: it offers a simpler entry point to something complicated (many calls behind one), whether or not interfaces mismatch.",
      "Адаптер перекладає між двома наявними інтерфейсами, щоб викликачі не змінювалися. Фасад має іншу мету: дає простішу точку входу до чогось складного (багато викликів за одним), незалежно від того, чи збігаються інтерфейси.",
    ],
  ),
  quiz(
    "pattern-proxy-set-trap",
    ["design-patterns", w("javascript")],
    4,
    120,
    ["A validating Proxy", "Proxy з валідацією"],
    ["This runs inside an ES module. What happens on the last line?", "Цей код виконується всередині модуля ES. Що станеться в останньому рядку?"],
    [
      ["A `TypeError` is thrown, because the `set` trap returned `false` in strict mode", "Кидається `TypeError`, бо пастка `set` повернула `false` у строгому режимі"],
      ["`user.age` becomes `-1`", "`user.age` стає `-1`"],
      ["The assignment is silently ignored and `user.age` stays `30`", "Присвоєння мовчки ігнорується, а `user.age` лишається `30`"],
      ["`target.age` becomes `-1` but `user.age` reads `30`", "`target.age` стає `-1`, а `user.age` читається як `30`"],
    ],
    "a",
    [
      "A `Proxy` intercepts operations on the target. When the `set` trap returns `false`, the assignment fails: in sloppy mode silently, in strict mode (all modules and classes) with a `TypeError`. That's how validation proxies and reactivity systems (Vue 3, MobX) hook into plain property writes.",
      "`Proxy` перехоплює операції над цільовим об'єктом. Коли пастка `set` повертає `false`, присвоєння не вдається: у нестрогому режимі мовчки, у строгому (усі модулі й класи) з `TypeError`. Так проксі з валідацією і системи реактивності (Vue 3, MobX) втручаються у звичайний запис властивостей.",
    ],
    {
      code: "const target = { age: 30 };\nconst user = new Proxy(target, {\n  set(obj, key, value) {\n    if (key === \"age\" && value < 0) return false;\n    obj[key] = value;\n    return true;\n  },\n});\nuser.age = -1;",
      codeLanguage: "js",
    },
  ),
  quiz(
    "pattern-dependency-injection",
    ["design-patterns", w("unit-testing")],
    4,
    120,
    ["Making a service testable", "Як зробити сервіс тестованим"],
    ["`OrderService` is hard to unit-test because it always hits the real API. Which change helps most?", "`OrderService` важко тестувати модульно, бо він завжди звертається до справжнього API. Яка зміна допоможе найбільше?"],
    [
      ["Receive the HTTP client through the constructor (`constructor(private http: HttpClient)`) and pass a fake in tests", "Отримувати HTTP-клієнт через конструктор (`constructor(private http: HttpClient)`) і передавати фейк у тестах"],
      ["Make `OrderService` a singleton", "Зробити `OrderService` синглтоном"],
      ["Move the `new HttpClient()` call into a `static` method", "Перенести виклик `new HttpClient()` у `static` метод"],
      ["Catch all errors inside `OrderService`", "Перехоплювати всі помилки всередині `OrderService`"],
    ],
    "a",
    [
      "When a class creates its own collaborators it's welded to them. Dependency injection inverts that: the caller (or a DI container, as in Angular) provides them, so tests can pass a fake with canned responses, and production can swap implementations without editing the class.",
      "Коли клас сам створює співпрацівників, він намертво з ними зв'язаний. Впровадження залежностей це перевертає: їх надає викликач (або DI-контейнер, як в Angular), тож тести можуть передати фейк із заготовленими відповідями, а продакшен може змінити реалізацію, не редагуючи клас.",
    ],
    { code: "class OrderService {\n  private http = new HttpClient(\"https://api.example.com\");\n\n  async total(id: string) {\n    const order = await this.http.get(`/orders/${id}`);\n    return order.items.reduce((s, i) => s + i.price, 0);\n  }\n}", codeLanguage: "ts" },
  ),
  quiz(
    "pattern-observer-skip",
    ["design-patterns", w("arrays-strings")],
    5,
    150,
    ["Unsubscribing while notifying", "Відписка під час сповіщення"],
    ["What is `log` after both `emit` calls?", "Чому дорівнює `log` після обох викликів `emit`?"],
    [
      ["`[\"a1\", \"c1\", \"b2\", \"c2\"]`", "`[\"a1\", \"c1\", \"b2\", \"c2\"]`"],
      ["`[\"a1\", \"b1\", \"c1\", \"b2\", \"c2\"]`", "`[\"a1\", \"b1\", \"c1\", \"b2\", \"c2\"]`"],
      ["`[\"a1\", \"b1\", \"c1\", \"a2\", \"b2\", \"c2\"]`", "`[\"a1\", \"b1\", \"c1\", \"a2\", \"b2\", \"c2\"]`"],
      ["`[\"a1\", \"c1\", \"c2\"]`", "`[\"a1\", \"c1\", \"c2\"]`"],
    ],
    "a",
    [
      "Listener `a` removes itself with `splice` while `forEach` is at index 0, so `b` shifts into index 0 and `forEach` moves on to index 1, which is now `c`: `b` is skipped for the first event. Emitters should iterate over a copy (`[...this.listeners].forEach(...)`) so subscription changes take effect from the next emit.",
      "Слухач `a` видаляє себе через `splice`, поки `forEach` на індексі 0, тож `b` зсувається на індекс 0, а `forEach` переходить до індексу 1, де тепер `c`: для першої події `b` пропущено. Емітери мають перебирати копію (`[...this.listeners].forEach(...)`), щоб зміни підписок діяли з наступного emit.",
    ],
    {
      code: "class Emitter {\n  listeners = [];\n  on(fn) {\n    this.listeners.push(fn);\n    return () => this.listeners.splice(this.listeners.indexOf(fn), 1);\n  }\n  emit(v) {\n    this.listeners.forEach((fn) => fn(v));\n  }\n}\nconst e = new Emitter();\nconst log = [];\nconst off = e.on((v) => { log.push(\"a\" + v); off(); });\ne.on((v) => log.push(\"b\" + v));\ne.on((v) => log.push(\"c\" + v));\ne.emit(1);\ne.emit(2);",
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "pattern-undo-redo",
    skills: ["design-patterns", w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Undo and redo with commands", "Скасування й повтор через команди"],
    prompt: [
      "Implement the **Command** pattern in `src/history.ts`.\n\n**`History`**\n- `run(command)` executes it and adds it to the undo stack. Running a new command **clears** the redo stack.\n- `undo()` undoes the most recent command and moves it to the redo stack; `redo()` does the reverse. Both return `false` when there's nothing to do.\n- `canUndo`, `canRedo` and `labels` (labels of undoable commands, oldest first).\n- `new History(limit)` keeps at most `limit` commands; the oldest are forgotten.\n\n**`deleteText(doc, index, length)`** returns a command that removes text and puts it back on `undo`. It must remember the text it removed **when it executed**, not when it was created. `insertText` is already done.",
      "Реалізуйте патерн **Command** у `src/history.ts`.\n\n**`History`**\n- `run(command)` виконує команду й додає її до стеку скасування. Нова команда **очищає** стек повтору.\n- `undo()` скасовує останню команду й переносить її до стеку повтору; `redo()` робить навпаки. Обидва повертають `false`, якщо робити нічого.\n- `canUndo`, `canRedo` і `labels` (мітки команд, які можна скасувати, від найстаріших).\n- `new History(limit)` зберігає щонайбільше `limit` команд; найстаріші забуваються.\n\n**`deleteText(doc, index, length)`** повертає команду, що видаляє текст і повертає його в `undo`. Вона має запам'ятати видалений текст **у момент виконання**, а не створення. `insertText` уже готовий.",
    ],
    files: { "/src/history.ts": HISTORY_STARTER, "/index.ts": HISTORY_INDEX },
    visibleFiles: ["/src/history.ts", "/index.ts"],
    activeFile: "/src/history.ts",
    tests: HISTORY_TESTS,
    solution: { "/src/history.ts": HISTORY_SOLUTION },
    explanation: [
      "Each command knows how to apply and reverse itself, so `History` only moves commands between two stacks. A new command invalidates the redo stack because those \"futures\" were built on a state that no longer exists. `deleteText` captures the removed text inside `execute`, so it works even if the document changed between creating and running the command.",
      "Кожна команда знає, як застосувати й скасувати себе, тож `History` лише перекладає команди між двома стеками. Нова команда робить стек повтору недійсним, бо ті «майбутні» зміни будувалися на стані, якого вже немає. `deleteText` запам'ятовує видалений текст усередині `execute`, тож працює, навіть якщо документ змінився між створенням і виконанням команди.",
    ],
  }),
  practice({
    slug: "pattern-middleware-compose",
    skills: ["design-patterns", w("async-javascript"), w("nodejs")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Compose a middleware chain", "Скомпонуйте ланцюжок middleware"],
    prompt: [
      "Implement Koa-style `compose(middlewares)` in `src/compose.ts`, a **chain of responsibility**. It returns `run(ctx, last?)`, which:\n\n- Calls each middleware with the shared `ctx` and a `next()` that runs the rest of the chain and resolves when it's done (so code after `await next()` runs on the way back, in reverse order).\n- Calls `last` (if given) after the final middleware calls `next()`.\n- Stops if a middleware doesn't call `next()`.\n- Supports sync and async middlewares, and returns a promise.\n- Turns errors (sync throws or rejections) into a rejection that outer middlewares can `try/catch` around `await next()`.\n- Rejects with an error mentioning `multiple` if a middleware calls `next()` twice.",
      "Реалізуйте `compose(middlewares)` у стилі Koa в `src/compose.ts`: це **ланцюжок відповідальності**. Функція повертає `run(ctx, last?)`, яка:\n\n- Викликає кожен middleware зі спільним `ctx` і `next()`, що запускає решту ланцюжка й завершується разом із нею (тож код після `await next()` виконується на зворотному шляху у зворотному порядку).\n- Викликає `last` (якщо передано) після того, як останній middleware викличе `next()`.\n- Зупиняється, якщо middleware не викликав `next()`.\n- Підтримує синхронні й асинхронні middleware і повертає проміс.\n- Перетворює помилки (синхронні винятки чи відхилення) на відхилення, яке зовнішні middleware можуть перехопити через `try/catch` навколо `await next()`.\n- Відхиляється з помилкою, що містить `multiple`, якщо middleware викликав `next()` двічі.",
    ],
    files: { "/src/compose.ts": COMPOSE_STARTER, "/index.ts": COMPOSE_INDEX },
    visibleFiles: ["/src/compose.ts", "/index.ts"],
    activeFile: "/src/compose.ts",
    tests: COMPOSE_TESTS,
    solution: { "/src/compose.ts": COMPOSE_SOLUTION },
    explanation: [
      "`dispatch(i)` runs middleware `i` and hands it `() => dispatch(i + 1)` as `next`, so the chain unrolls recursively and each `await next()` waits for everything downstream. Wrapping the call in `Promise.resolve` and `try/catch` normalises sync and async middlewares and their errors. Tracking the highest index already dispatched catches a middleware that calls `next()` twice.",
      "`dispatch(i)` запускає middleware `i` і передає йому `() => dispatch(i + 1)` як `next`, тож ланцюжок розгортається рекурсивно, а кожен `await next()` чекає на все, що далі. Обгортка виклику в `Promise.resolve` і `try/catch` уніфікує синхронні й асинхронні middleware та їхні помилки. Відстеження найбільшого вже запущеного індексу ловить middleware, що викликає `next()` двічі.",
    ],
  }),
]);
