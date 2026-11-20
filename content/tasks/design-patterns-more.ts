import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

// ── State machine ────────────────────────────────────────────────────────────

const MACHINE_TYPES = String.raw`export type StateConfig<S extends string, E extends string> = {
  /** event → next state */
  on?: Partial<Record<E, S>>;
  entry?: () => void;
  exit?: () => void;
};
export type MachineConfig<S extends string, E extends string> = {
  initial: S;
  states: Record<S, StateConfig<S, E>>;
};
export type Listener<S, E> = (state: S, event: E) => void;
`;

const MACHINE_STARTER =
  MACHINE_TYPES +
  String.raw`
export function createMachine<S extends string, E extends string>(config: MachineConfig<S, E>) {
  let state = config.initial;
  return {
    get state() {
      return state;
    },
    /** Whether the event causes a transition from the current state. */
    can(event: E): boolean {
      return true;
    },
    /** Applies the event and returns the (possibly unchanged) state. */
    send(event: E): S {
      // TODO: look up the transition for the current state
      return state;
    },
    subscribe(listener: Listener<S, E>): () => void {
      return () => {};
    },
  };
}
`;

const MACHINE_SOLUTION =
  MACHINE_TYPES +
  String.raw`
export function createMachine<S extends string, E extends string>(config: MachineConfig<S, E>) {
  const names = Object.keys(config.states) as S[];
  if (!names.includes(config.initial)) throw new Error("Unknown initial state: " + config.initial);
  for (const name of names) {
    for (const [event, target] of Object.entries(config.states[name].on ?? {})) {
      if (!names.includes(target as S)) throw new Error("Unknown target " + String(target) + " for " + name + "." + event);
    }
  }

  let state = config.initial;
  const listeners = new Set<Listener<S, E>>();
  config.states[state].entry?.();

  return {
    get state() {
      return state;
    },
    can(event: E): boolean {
      return Boolean(config.states[state].on?.[event]);
    },
    send(event: E): S {
      const target = config.states[state].on?.[event];
      if (!target) return state; // events that aren't valid here are ignored
      config.states[state].exit?.();
      state = target;
      config.states[state].entry?.();
      for (const listener of [...listeners]) listener(state, event);
      return state;
    },
    subscribe(listener: Listener<S, E>): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
`;

const MACHINE_INDEX = String.raw`import "./styles.css";
import { createMachine } from "./src/machine";

const light = createMachine({
  initial: "red",
  states: {
    red: { on: { NEXT: "green" } },
    green: { on: { NEXT: "yellow" } },
    yellow: { on: { NEXT: "red" } },
  },
});
const app = document.getElementById("app")!;
app.innerHTML = '<h1>Traffic light</h1><p>Light: <output id="light"></output></p><button type="button">Next</button>';
const out = app.querySelector("output")!;
out.textContent = light.state;
light.subscribe((state) => (out.textContent = state));
app.querySelector("button")!.addEventListener("click", () => light.send("NEXT"));
`;

const MACHINE_TESTS = String.raw`import { describe, it, expect, screen, user } from "./test-kit";
import { createMachine } from "../src/machine";

const fetchConfig = () => ({
  initial: "idle",
  states: {
    idle: { on: { FETCH: "loading" } },
    loading: { on: { RESOLVE: "success", REJECT: "failure" } },
    success: { on: { RESET: "idle" } },
    failure: { on: { RETRY: "loading", RESET: "idle" } },
  },
});

describe("createMachine", () => {
  it("starts in the initial state and follows transitions", () => {
    const m = createMachine(fetchConfig());
    expect(m.state).toBe("idle");
    expect(m.send("FETCH")).toBe("loading");
    expect(m.send("REJECT")).toBe("failure");
    expect(m.send("RETRY")).toBe("loading");
    expect(m.send("RESOLVE")).toBe("success");
    expect(m.state).toBe("success");
  });
  it("ignores events that aren't valid in the current state", () => {
    const m = createMachine(fetchConfig());
    expect(m.send("RESOLVE")).toBe("idle");
    expect(m.can("RESOLVE")).toBe(false);
    expect(m.can("FETCH")).toBe(true);
  });
  it("notifies subscribers on transitions only, until they unsubscribe", () => {
    const m = createMachine(fetchConfig());
    const seen = [];
    const off = m.subscribe((state, event) => seen.push([state, event]));
    m.send("FETCH");
    m.send("FETCH");
    off();
    m.send("RESOLVE");
    expect(seen).toEqual([["loading", "FETCH"]]);
  });
  it("runs entry on start, then exit before entry on each transition", () => {
    const log = [];
    const m = createMachine({
      initial: "a",
      states: {
        a: { on: { GO: "b" }, entry: () => log.push("enter a"), exit: () => log.push("exit a") },
        b: { entry: () => log.push("enter b") },
      },
    });
    m.send("GO");
    expect(log).toEqual(["enter a", "exit a", "enter b"]);
  });
  it("rejects configs with unknown states", () => {
    expect(() => createMachine({ initial: "nope", states: { a: {} } })).toThrow();
    expect(() => createMachine({ initial: "a", states: { a: { on: { GO: "missing" } } } })).toThrow();
  });
  it("drives the demo traffic light", async () => {
    const light = await screen.findByText("red");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(light.textContent).toBe("green");
  });
});
`;

// ── Composite ────────────────────────────────────────────────────────────────

const TREE_HEAD = String.raw`export interface Node {
  readonly name: string;
  /** Total bytes. */
  size(): number;
  /** Number of files. */
  count(): number;
  /** Paths ("root/src/a.ts") of files matching the predicate. */
  find(predicate: (file: File) => boolean, prefix?: string): string[];
  /** Indented tree, two spaces per level. */
  print(indent?: number): string;
}

export class File implements Node {
  constructor(readonly name: string, readonly bytes: number) {
    if (!Number.isFinite(bytes) || bytes < 0) throw new RangeError("File size must be a non-negative number");
  }
  size() {
    return this.bytes;
  }
  count() {
    return 1;
  }
  find(predicate: (file: File) => boolean, prefix = ""): string[] {
    return predicate(this) ? [prefix + this.name] : [];
  }
  print(indent = 0) {
    return "  ".repeat(indent) + this.name + " (" + this.bytes + " B)";
  }
}
`;

const TREE_STARTER =
  TREE_HEAD +
  String.raw`
export class Folder implements Node {
  private children: Node[] = [];

  constructor(readonly name: string, children: Node[] = []) {
    this.children = children;
  }

  add(child: Node): this {
    this.children.push(child);
    return this;
  }

  // TODO: implement these by delegating to the children
  size() {
    return 0;
  }
  count() {
    return 0;
  }
  find(predicate: (file: File) => boolean, prefix = ""): string[] {
    return [];
  }
  print(indent = 0) {
    return "  ".repeat(indent) + this.name + "/";
  }
}
`;

const TREE_SOLUTION =
  TREE_HEAD +
  String.raw`
export class Folder implements Node {
  private children: Node[] = [];

  constructor(readonly name: string, children: Node[] = []) {
    children.forEach((child) => this.add(child));
  }

  add(child: Node): this {
    if (this.children.some((c) => c.name === child.name)) throw new Error("Duplicate name: " + child.name);
    this.children.push(child);
    return this;
  }

  // A folder answers every question by asking its children, whether they are files or folders.
  size() {
    return this.children.reduce((sum, child) => sum + child.size(), 0);
  }
  count() {
    return this.children.reduce((sum, child) => sum + child.count(), 0);
  }
  find(predicate: (file: File) => boolean, prefix = ""): string[] {
    return this.children.flatMap((child) => child.find(predicate, prefix + this.name + "/"));
  }
  print(indent = 0) {
    const line = "  ".repeat(indent) + this.name + "/ (" + this.size() + " B)";
    return [line, ...this.children.map((child) => child.print(indent + 1))].join("\n");
  }
}
`;

const TREE_INDEX = String.raw`import "./styles.css";
import { File, Folder } from "./src/tree";

const root = new Folder("project", [
  new File("README.md", 1200),
  new Folder("src", [new File("index.ts", 800), new File("utils.ts", 450)]),
  new Folder("assets", [new File("logo.svg", 3100)]),
]);
document.getElementById("app")!.innerHTML = '<h1>Disk usage</h1><pre id="tree"></pre>';
document.getElementById("tree")!.textContent = root.print();
`;

const TREE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { File, Folder } from "../src/tree";

const build = () =>
  new Folder("root", [
    new File("readme.md", 100),
    new Folder("src", [new File("index.ts", 300), new File("util.ts", 200)]),
    new Folder("empty"),
  ]);

describe("file tree", () => {
  it("sums sizes and counts files through any depth", () => {
    const root = build();
    expect(root.size()).toBe(600);
    expect(root.count()).toBe(3);
    expect(new Folder("empty").size()).toBe(0);
  });
  it("treats files and folders through the same interface", () => {
    const nodes = [new File("a", 5), new Folder("b", [new File("c", 7)])];
    expect(nodes.map((n) => n.size())).toEqual([5, 7]);
    expect(nodes.map((n) => n.count())).toEqual([1, 1]);
  });
  it("finds matching files with their paths", () => {
    expect(build().find((f) => f.name.endsWith(".ts"))).toEqual(["root/src/index.ts", "root/src/util.ts"]);
    expect(build().find((f) => f.bytes > 1000)).toEqual([]);
  });
  it("prints an indented tree with folder totals", () => {
    expect(build().print()).toBe(
      ["root/ (600 B)", "  readme.md (100 B)", "  src/ (500 B)", "    index.ts (300 B)", "    util.ts (200 B)", "  empty/ (0 B)"].join("\n"),
    );
  });
  it("supports chaining add() and rejects duplicate names", () => {
    const f = new Folder("docs").add(new File("a.md", 1)).add(new File("b.md", 2));
    expect(f.size()).toBe(3);
    expect(() => f.add(new File("a.md", 5))).toThrow();
    expect(() => new Folder("x", [new File("same", 1), new File("same", 2)])).toThrow();
  });
});
`;

// ── Builder ──────────────────────────────────────────────────────────────────

const BUILDER_STARTER = String.raw`export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type RequestSpec = {
  method: Method;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
};

export class RequestBuilder {
  private spec: { method?: Method; url?: string; headers: Record<string, string>; query: string[]; body?: unknown; timeout: number } = {
    headers: {},
    query: [],
    timeout: 10000,
  };

  static create(): RequestBuilder {
    return new RequestBuilder();
  }

  // TODO: every method mutates this builder, so shared "base" builders leak changes
  get(url: string) {
    this.spec.method = "GET";
    this.spec.url = url;
    return this;
  }
  post(url: string, body?: unknown) {
    this.spec.method = "POST";
    this.spec.url = url;
    this.spec.body = body;
    return this;
  }
  put(url: string, body?: unknown) {
    return this.post(url, body);
  }
  delete(url: string) {
    return this.get(url);
  }
  header(name: string, value: string) {
    this.spec.headers[name] = value;
    return this;
  }
  query(name: string, value: string | number | boolean) {
    this.spec.query.push(name + "=" + value);
    return this;
  }
  timeout(ms: number) {
    this.spec.timeout = ms;
    return this;
  }
  build(): RequestSpec {
    const { method = "GET", url = "", headers, query, body, timeout } = this.spec;
    return { method, url: query.length ? url + "?" + query.join("&") : url, headers, body: body as string, timeout };
  }
}
`;

const BUILDER_SOLUTION = String.raw`export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type RequestSpec = {
  method: Method;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
};

type State = {
  method?: Method;
  url?: string;
  headers: Record<string, string>;
  query: [string, string][];
  body?: unknown;
  timeout: number;
};

export class RequestBuilder {
  private constructor(private readonly state: State) {}

  static create(): RequestBuilder {
    return new RequestBuilder({ headers: {}, query: [], timeout: 10000 });
  }

  /** Every step returns a new builder, so a configured base can be shared safely. */
  private with(patch: Partial<State>): RequestBuilder {
    return new RequestBuilder({ ...this.state, ...patch });
  }

  get(url: string) {
    return this.with({ method: "GET", url, body: undefined });
  }
  post(url: string, body?: unknown) {
    return this.with({ method: "POST", url, body });
  }
  put(url: string, body?: unknown) {
    return this.with({ method: "PUT", url, body });
  }
  delete(url: string) {
    return this.with({ method: "DELETE", url, body: undefined });
  }
  header(name: string, value: string) {
    return this.with({ headers: { ...this.state.headers, [name.toLowerCase()]: value } });
  }
  query(name: string, value: string | number | boolean) {
    return this.with({ query: [...this.state.query, [name, String(value)]] });
  }
  timeout(ms: number) {
    if (!Number.isInteger(ms) || ms <= 0) throw new RangeError("timeout must be a positive integer");
    return this.with({ timeout: ms });
  }

  build(): RequestSpec {
    const { method, url, headers, query, body, timeout } = this.state;
    if (!method || !url) throw new Error("Call get(), post(), put() or delete() before build()");
    const qs = query.map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
    const spec: RequestSpec = {
      method,
      url: qs ? url + (url.includes("?") ? "&" : "?") + qs : url,
      headers: { ...headers },
      timeout,
    };
    if (body !== undefined) {
      spec.body = JSON.stringify(body);
      if (!spec.headers["content-type"]) spec.headers["content-type"] = "application/json";
    }
    return spec;
  }
}
`;

const BUILDER_INDEX = String.raw`import "./styles.css";
import { RequestBuilder } from "./src/request";

const api = RequestBuilder.create().header("Authorization", "Bearer demo").timeout(5000);
const search = api.get("/api/search").query("q", "design patterns & more").query("page", 2).build();
const create = api.post("/api/posts", { title: "Builder" }).build();

document.getElementById("app")!.innerHTML = '<h1>Requests</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify({ search, create }, null, 2);
`;

const BUILDER_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { RequestBuilder } from "../src/request";

describe("RequestBuilder", () => {
  it("builds a GET with an encoded query string and defaults", () => {
    const spec = RequestBuilder.create().get("/search").query("q", "a&b c").query("page", 2).build();
    expect(spec).toEqual({ method: "GET", url: "/search?q=a%26b%20c&page=2", headers: {}, timeout: 10000 });
  });
  it("appends to a URL that already has a query string", () => {
    expect(RequestBuilder.create().get("/x?a=1").query("b", 2).build().url).toBe("/x?a=1&b=2");
  });
  it("serialises a JSON body and sets content-type unless one was given", () => {
    const spec = RequestBuilder.create().post("/users", { name: "Ada" }).build();
    expect(spec.body).toBe('{"name":"Ada"}');
    expect(spec.headers).toEqual({ "content-type": "application/json" });
    const patch = RequestBuilder.create().header("Content-Type", "application/merge-patch+json").put("/users/1", { name: "Bo" }).build();
    expect(patch.headers).toEqual({ "content-type": "application/merge-patch+json" });
    expect(patch.method).toBe("PUT");
  });
  it("treats header names case-insensitively", () => {
    const spec = RequestBuilder.create().get("/").header("X-Id", "1").header("x-id", "2").build();
    expect(spec.headers).toEqual({ "x-id": "2" });
  });
  it("is immutable, so a shared base can be reused", () => {
    const base = RequestBuilder.create().header("Authorization", "Bearer t");
    const a = base.get("/a").query("x", 1);
    const b = base.post("/b", { ok: true });
    expect(a.build()).toEqual({ method: "GET", url: "/a?x=1", headers: { authorization: "Bearer t" }, timeout: 10000 });
    expect(b.build().url).toBe("/b");
    expect(b.build().method).toBe("POST");
    expect(() => base.build()).toThrow();
    const built = a.build();
    built.headers.authorization = "changed";
    expect(a.build().headers.authorization).toBe("Bearer t");
  });
  it("validates before building", () => {
    expect(() => RequestBuilder.create().build()).toThrow();
    expect(() => RequestBuilder.create().timeout(0)).toThrow();
    expect(() => RequestBuilder.create().timeout(1.5)).toThrow();
  });
});
`;

export default defineTasks([
  quiz(
    "pattern-factory",
    ["design-patterns"],
    1,
    45,
    ["Name the pattern: choosing what to create", "Назвіть патерн: що саме створити"],
    ["`createNotifier(channel)` returns an `EmailNotifier`, `SmsNotifier` or `PushNotifier`, and callers only use its `send(message)` method. Which pattern is this?", "`createNotifier(channel)` повертає `EmailNotifier`, `SmsNotifier` або `PushNotifier`, а викликачі користуються лише методом `send(message)`. Який це патерн?"],
    [
      ["Factory", "Factory (фабрика)"],
      ["Observer", "Observer (спостерігач)"],
      ["Decorator", "Decorator (декоратор)"],
      ["Memento", "Memento (знімок)"],
    ],
    "a",
    [
      "A factory hides the decision of which concrete class to instantiate behind one function, so callers depend on the shared interface (`send`) instead of on every implementation. Adding a channel changes the factory, not the callers.",
      "Фабрика ховає рішення, який конкретний клас створити, за однією функцією, тож викликачі залежать від спільного інтерфейсу (`send`), а не від кожної реалізації. Новий канал змінює фабрику, а не викликачів.",
    ],
  ),
  quiz(
    "pattern-builder",
    ["design-patterns"],
    2,
    90,
    ["When a builder pays off", "Коли варто використати Builder"],
    ["`new Request(url, \"GET\", undefined, {}, 5000, true, null, 3)` is hard to read and easy to get wrong. Why does a fluent builder help?", "`new Request(url, \"GET\", undefined, {}, 5000, true, null, 3)` важко читати й легко переплутати. Чим допомагає fluent-будівельник?"],
    [
      ["Each option gets a named step, optional parts can be skipped, and `build()` can validate the combination once", "Кожен параметр має іменований крок, необов'язкові частини можна пропустити, а `build()` один раз перевіряє комбінацію"],
      ["It makes the request faster", "Він пришвидшує запит"],
      ["It guarantees only one request object exists", "Він гарантує, що існує лише один об'єкт запиту"],
      ["It removes the need for TypeScript types", "Він усуває потребу в типах TypeScript"],
    ],
    "a",
    [
      "Builder replaces long positional constructors with named, chainable steps (`.get(url).timeout(5000).retries(3).build()`) and validates once at the end. In JavaScript an options object often does the same job; a builder shines when construction is multi-step, conditional, or reused from a shared base (if each step returns a new builder).",
      "Builder замінює довгі позиційні конструктори іменованими кроками, які можна з'єднувати в ланцюжок (`.get(url).timeout(5000).retries(3).build()`), і перевіряє все один раз наприкінці. У JavaScript часто те саме робить об'єкт параметрів; будівельник корисний, коли створення багатокрокове, умовне чи починається зі спільної основи (якщо кожен крок повертає новий будівельник).",
    ],
  ),
  quiz(
    "pattern-facade",
    ["design-patterns"],
    2,
    60,
    ["Name the pattern: one simple entry point", "Назвіть патерн: одна проста точка входу"],
    ["`uploadAvatar(file)` resizes the image, requests a signed URL, uploads, and invalidates the profile cache, so components call just one function. Which pattern is it?", "`uploadAvatar(file)` змінює розмір зображення, отримує підписаний URL, завантажує файл і скидає кеш профілю, тож компоненти викликають лише одну функцію. Який це патерн?"],
    [
      ["Facade", "Facade (фасад)"],
      ["Adapter", "Adapter (адаптер)"],
      ["Proxy", "Proxy (замісник)"],
      ["Composite", "Composite (компонувальник)"],
    ],
    "a",
    [
      "A facade puts a simple interface in front of a complex subsystem. Callers don't need to know the steps or their order, and the subsystem can change behind it. An adapter, by contrast, converts one existing interface into another expected one.",
      "Фасад ставить простий інтерфейс перед складною підсистемою. Викликачам не треба знати кроки чи їхній порядок, а підсистема може змінюватися за ним. Адаптер натомість перетворює один наявний інтерфейс на інший, очікуваний.",
    ],
  ),
  quiz(
    "pattern-iterator",
    ["design-patterns", w("javascript")],
    2,
    90,
    ["A custom iterable", "Власний ітерований об'єкт"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 2, 3 ] 3 3`", "`[ 1, 2, 3 ] 3 3`"],
      ["`[] -Infinity 0`", "`[] -Infinity 0`"],
      ["A `TypeError`: `r` is not iterable", "`TypeError`: `r` не є ітерованим"],
      ["`[ 1, 2, 3 ] 3 0`, because a generator can only be used once", "`[ 1, 2, 3 ] 3 0`, бо генератор можна використати лише раз"],
    ],
    "a",
    [
      "Implementing `[Symbol.iterator]` (here as a generator method) makes `Range` work with spread, `for…of`, destructuring and `Array.from`: the Iterator pattern built into the language. Each spread calls `[Symbol.iterator]()` again and gets a fresh generator, so the range can be iterated any number of times.",
      "Реалізація `[Symbol.iterator]` (тут як метод-генератор) робить `Range` сумісним зі spread, `for…of`, деструктуризацією й `Array.from`: це патерн Iterator, вбудований у мову. Кожен spread знову викликає `[Symbol.iterator]()` і отримує новий генератор, тож діапазон можна перебирати скільки завгодно разів.",
    ],
    {
      code: "class Range {\n  constructor(from, to) {\n    this.from = from;\n    this.to = to;\n  }\n  *[Symbol.iterator]() {\n    for (let i = this.from; i <= this.to; i++) yield i;\n  }\n}\nconst r = new Range(1, 3);\nconsole.log([...r], Math.max(...r), [...r].length);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "pattern-state",
    ["design-patterns", w("state-management")],
    3,
    120,
    ["Status checks everywhere", "Перевірки статусу всюди"],
    [
      "An order class has `pay()`, `ship()`, `cancel()` and `refund()`, and each starts with a growing `if (this.status === …)` chain. Bugs keep appearing, like refunding an order that was never paid. Which approach fits best?",
      "Клас замовлення має `pay()`, `ship()`, `cancel()` і `refund()`, і кожен починається з ланцюжка `if (this.status === …)`, що постійно росте. З'являються баги, як-от повернення коштів за неоплачене замовлення. Який підхід підходить найкраще?",
    ],
    [
      ["The State pattern / a state machine: define the allowed transitions per state in one place", "Патерн State / скінченний автомат: визначити дозволені переходи для кожного стану в одному місці"],
      ["A Singleton order manager", "Синглтон-менеджер замовлень"],
      ["An Adapter around the order", "Адаптер навколо замовлення"],
      ["More `try/catch` blocks", "Більше блоків `try/catch`"],
    ],
    "a",
    [
      "When behaviour depends on a status, scattered conditionals make illegal transitions easy. Modelling states explicitly (a transition table like `paid: { SHIP: \"shipped\", REFUND: \"refunded\" }`, state objects, or a library such as XState) makes impossible transitions impossible and puts the rules where they can be read and tested in one place.",
      "Коли поведінка залежить від статусу, розкидані умови роблять недопустимі переходи легкими. Явне моделювання станів (таблиця переходів на кшталт `paid: { SHIP: \"shipped\", REFUND: \"refunded\" }`, об'єкти станів або бібліотека як XState) робить неможливі переходи справді неможливими й збирає правила в одному місці, де їх легко читати й тестувати.",
    ],
  ),
  quiz(
    "pattern-composite",
    ["design-patterns", w("recursion")],
    3,
    90,
    ["Name the pattern: trees of parts and wholes", "Назвіть патерн: дерева частин і цілого"],
    ["`File` and `Folder` both implement `size()`. A folder's `size()` adds up its children's sizes, and callers never check which kind they hold. Which pattern is this?", "`File` і `Folder` обидва реалізують `size()`. `size()` папки підсумовує розміри дітей, а викликачі ніколи не перевіряють, з чим саме мають справу. Який це патерн?"],
    [
      ["Composite", "Composite (компонувальник)"],
      ["Facade", "Facade (фасад)"],
      ["Builder", "Builder (будівельник)"],
      ["Singleton", "Singleton (одинак)"],
    ],
    "a",
    [
      "Composite lets single objects (leaves) and groups of objects (composites) share one interface, so tree-shaped data is processed recursively without type checks. The DOM, React component trees, menus and file systems all follow it.",
      "Composite дає одиночним об'єктам (листкам) і групам об'єктів (композитам) спільний інтерфейс, тож деревоподібні дані обробляються рекурсивно без перевірок типу. За ним побудовані DOM, дерева компонентів React, меню й файлові системи.",
    ],
  ),
  quiz(
    "pattern-template-method",
    ["design-patterns", w("oop")],
    3,
    120,
    ["Template Method vs Strategy", "Template Method чи Strategy"],
    [
      "`Exporter.export()` always calls `this.header()`, then `this.rows()`, then `this.footer()`; `CsvExporter` and `PdfExporter` override those three steps. What is this, and what's the composition-based alternative?",
      "`Exporter.export()` завжди викликає `this.header()`, потім `this.rows()`, потім `this.footer()`; `CsvExporter` і `PdfExporter` перевизначають ці три кроки. Що це і яка альтернатива на основі композиції?",
    ],
    [
      ["Template Method (the base class fixes the algorithm's skeleton); the alternative is passing the steps in as a strategy object", "Template Method (базовий клас фіксує скелет алгоритму); альтернатива: передавати кроки як об'єкт-стратегію"],
      ["Observer; the alternative is polling", "Observer; альтернатива: опитування"],
      ["Singleton; the alternative is a module", "Singleton; альтернатива: модуль"],
      ["Facade; the alternative is an Adapter", "Facade; альтернатива: Adapter"],
    ],
    "a",
    [
      "Template Method keeps the fixed order of steps in the base class and lets subclasses fill in the variable parts. It's simple, but ties every format to an inheritance hierarchy. Strategy gets the same flexibility through composition: `exportWith({ header, rows, footer })` takes the steps as an object, so formats can be mixed and tested without subclasses.",
      "Template Method тримає незмінний порядок кроків у базовому класі й дає підкласам заповнити змінні частини. Це просто, але прив'язує кожен формат до ієрархії успадкування. Strategy дає ту саму гнучкість через композицію: `exportWith({ header, rows, footer })` приймає кроки як об'єкт, тож формати можна комбінувати й тестувати без підкласів.",
    ],
  ),
  quiz(
    "pattern-mediator",
    ["design-patterns"],
    3,
    90,
    ["Components that all talk to each other", "Компоненти, що спілкуються всі з усіма"],
    [
      "On a checkout page, changing the country updates shipping options, which update the total, which enables the pay button, and each widget calls the others directly. What pattern reduces this tangle?",
      "На сторінці оформлення зміна країни оновлює способи доставки, ті оновлюють суму, а сума вмикає кнопку оплати, і кожен віджет напряму викликає інші. Який патерн зменшить цю плутанину?",
    ],
    [
      ["Mediator: widgets report changes to one coordinator, which decides who to update", "Mediator: віджети повідомляють про зміни одному координатору, який вирішує, кого оновити"],
      ["Singleton: make every widget a singleton", "Singleton: зробити кожен віджет синглтоном"],
      ["Builder: build the page in steps", "Builder: будувати сторінку покроково"],
      ["Iterator: loop over the widgets", "Iterator: перебирати віджети в циклі"],
    ],
    "a",
    [
      "With N components wired to each other you get up to N² dependencies. A mediator (a parent component, a store, a form controller) centralises the interaction rules: components only know the mediator, so they stay reusable and the flow is readable in one place. \"Lift state up\" in React is the same idea.",
      "Коли N компонентів пов'язані між собою, виникає до N² залежностей. Посередник (батьківський компонент, стор, контролер форми) зосереджує правила взаємодії: компоненти знають лише посередника, тож лишаються повторно використовуваними, а потік видно в одному місці. «Підняття стану» в React є тією самою ідеєю.",
    ],
  ),
  quiz(
    "pattern-decorator-order",
    ["design-patterns", w("closures-scope")],
    4,
    120,
    ["Decorator order", "Порядок декораторів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`in 3`, `out 36`, `in 6`, `out 36`", "`in 3`, `out 36`, `in 6`, `out 36`"],
      ["`in 3`, `out 9`, `in 6`, `out 36`", "`in 3`, `out 9`, `in 6`, `out 36`"],
      ["`in 6`, `out 36`, `in 3`, `out 36`", "`in 6`, `out 36`, `in 3`, `out 36`"],
      ["`in 3`, `out 36`, `in 3`, `out 9`", "`in 3`, `out 36`, `in 3`, `out 9`"],
    ],
    "a",
    [
      "Each decorator wraps the function inside it. In `withLog(withDouble(square))` the logger is outermost, so it sees the original argument `3`; doubling happens inside, giving `36`. In `withDouble(withLog(square))` the doubling runs first, so the logger sees `6`. The result is the same here, but what each wrapper observes depends on the order, which matters for logging, caching and retries.",
      "Кожен декоратор обгортає функцію всередині себе. У `withLog(withDouble(square))` логер найзовнішній, тож бачить початковий аргумент `3`; подвоєння відбувається всередині й дає `36`. У `withDouble(withLog(square))` спершу виконується подвоєння, тож логер бачить `6`. Результат тут однаковий, але те, що бачить кожна обгортка, залежить від порядку, і це важливо для логування, кешування й повторних спроб.",
    ],
    {
      code: 'const withLog = (fn) => (x) => {\n  console.log("in", x);\n  const result = fn(x);\n  console.log("out", result);\n  return result;\n};\nconst withDouble = (fn) => (x) => fn(x * 2);\nconst square = (x) => x * x;\n\nwithLog(withDouble(square))(3);\nwithDouble(withLog(square))(3);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "pattern-memento",
    ["design-patterns", w("state-management")],
    4,
    120,
    ["Snapshots vs commands for undo", "Знімки чи команди для скасування"],
    [
      "A drawing app implements undo by pushing an immutable snapshot of the whole document after every change (the Memento pattern). What's the main trade-off compared with storing commands that know how to undo themselves?",
      "Застосунок для малювання реалізує скасування, зберігаючи незмінний знімок усього документа після кожної зміни (патерн Memento). Який головний компроміс порівняно зі збереженням команд, що вміють себе скасовувати?",
    ],
    [
      ["Snapshots are simple and always correct, but cost memory per step; commands are compact but every action needs a correct `undo`", "Знімки прості й завжди коректні, але коштують пам'яті на кожен крок; команди компактні, але кожна дія потребує правильного `undo`"],
      ["Snapshots can't be restored without a server", "Знімки неможливо відновити без сервера"],
      ["Commands can't support redo", "Команди не підтримують повтор"],
      ["There is no difference", "Різниці немає"],
    ],
    "a",
    [
      "A memento captures state without exposing internals, and restoring it is trivial. With immutable data and structural sharing (as in Redux or Immer) snapshots are cheaper than they sound, which is why Redux DevTools can time-travel. Commands store only the change, but each one must implement a perfect inverse, and a buggy `undo` corrupts the history.",
      "Знімок фіксує стан, не відкриваючи внутрішню будову, а відновлення тривіальне. З незмінними даними й спільним використанням структури (як у Redux чи Immer) знімки дешевші, ніж здається, тому Redux DevTools і вміють «подорожувати в часі». Команди зберігають лише зміну, але кожна мусить мати бездоганну обернену дію, і помилковий `undo` псує історію.",
    ],
  ),
  quiz(
    "pattern-async-singleton",
    ["design-patterns", w("async-javascript")],
    5,
    150,
    ["A lazy async singleton", "Ліниве асинхронне одинацтво"],
    ["`getDb()` should create one connection on first use. What does this print, and what's the fix?", "`getDb()` має створити одне з'єднання при першому використанні. Що виведе цей код і як це виправити?"],
    [
      ["`connections: 2`; cache the promise (`dbPromise ??= connect()`), not the resolved value", "`connections: 2`; кешувати проміс (`dbPromise ??= connect()`), а не отримане значення"],
      ["`connections: 1`; the `if` already prevents a second connection", "`connections: 1`; `if` уже запобігає другому з'єднанню"],
      ["`connections: 2`; wrap `connect()` in `try/catch`", "`connections: 2`; обгорнути `connect()` у `try/catch`"],
      ["`connections: 0`; nothing is awaited", "`connections: 0`; ніщо не очікується"],
    ],
    "a",
    [
      "Both calls check `instance` before either `await connect()` finishes, so both see `undefined` and both connect. Storing the **promise** synchronously on the first call (`dbPromise ??= connect()`; then `return dbPromise`) makes every concurrent caller share one in-flight connection. Clear it on failure if you want later calls to retry.",
      "Обидва виклики перевіряють `instance`, перш ніж хоч один `await connect()` завершиться, тож обидва бачать `undefined` і обидва з'єднуються. Синхронне збереження **промісу** під час першого виклику (`dbPromise ??= connect()`; потім `return dbPromise`) змушує всіх одночасних викликачів ділити одне з'єднання в процесі. Скидайте його при помилці, якщо хочете, щоб пізніші виклики повторювали спробу.",
    ],
    {
      code: 'let connections = 0;\nconst connect = async () => {\n  connections++;\n  await new Promise((r) => setTimeout(r, 10));\n  return { query: () => [] };\n};\n\nlet instance;\nasync function getDb() {\n  if (!instance) instance = await connect();\n  return instance;\n}\n\nawait Promise.all([getDb(), getDb()]);\nconsole.log("connections:", connections);',
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "pattern-state-machine",
    skills: ["design-patterns", w("state-management"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A finite state machine", "Скінченний автомат"],
    prompt: [
      "Implement `createMachine(config)` in `src/machine.ts` (the **State** pattern as a transition table):\n\n- `config.initial` is the starting state; `config.states[name].on` maps events to the next state.\n- `send(event)` moves to the target state and returns it. Events that aren't valid in the current state are **ignored** (the state is returned unchanged). `can(event)` tells whether an event would cause a transition.\n- Each state may have `entry` and `exit` actions: run the initial state's `entry` on creation, and on every transition run the old state's `exit`, then the new state's `entry`.\n- `subscribe(listener)` calls `listener(state, event)` after each transition and returns an unsubscribe function.\n- Throw if `initial` or any transition target isn't a defined state.\n\nThe demo is a traffic light driven by a button.",
      "Реалізуйте `createMachine(config)` у `src/machine.ts` (патерн **State** як таблиця переходів):\n\n- `config.initial` є початковим станом; `config.states[name].on` зіставляє події з наступним станом.\n- `send(event)` переходить до цільового стану й повертає його. Події, недопустимі в поточному стані, **ігноруються** (повертається незмінений стан). `can(event)` каже, чи спричинить подія перехід.\n- Кожен стан може мати дії `entry` і `exit`: виконайте `entry` початкового стану під час створення, а при кожному переході спершу `exit` старого стану, потім `entry` нового.\n- `subscribe(listener)` викликає `listener(state, event)` після кожного переходу й повертає функцію відписки.\n- Кидайте помилку, якщо `initial` чи будь-яка ціль переходу не є визначеним станом.\n\nДемо: світлофор, яким керує кнопка.",
    ],
    files: { "/src/machine.ts": MACHINE_STARTER, "/index.ts": MACHINE_INDEX },
    visibleFiles: ["/src/machine.ts", "/index.ts"],
    activeFile: "/src/machine.ts",
    tests: MACHINE_TESTS,
    solution: { "/src/machine.ts": MACHINE_SOLUTION },
    explanation: [
      "All behaviour lives in data: the current state's `on` table is the only place that decides what an event does, so illegal transitions simply don't exist. Validating targets up front turns typos into immediate errors instead of a machine stuck in an unknown state. Running `exit` before `entry` and notifying subscribers after the state changes mirrors libraries like XState.",
      "Уся поведінка живе в даних: таблиця `on` поточного стану є єдиним місцем, що вирішує, що робить подія, тож недопустимих переходів просто не існує. Перевірка цілей наперед перетворює описки на негайні помилки, а не на автомат, що застряг у невідомому стані. Виконання `exit` перед `entry` і сповіщення підписників після зміни стану відтворює поведінку бібліотек на кшталт XState.",
    ],
  }),
  practice({
    slug: "pattern-composite-tree",
    skills: ["design-patterns", w("recursion"), w("typescript")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["A composite file tree", "Дерево файлів за патерном Composite"],
    prompt: [
      "`File` is done in `src/tree.ts`. Complete `Folder` so files and folders can be used through the same `Node` interface (the **Composite** pattern):\n\n- `size()`: total bytes of everything inside, at any depth (an empty folder is `0`).\n- `count()`: number of files inside, at any depth.\n- `find(predicate)`: paths of matching files, like `\"root/src/index.ts\"`, in tree order.\n- `print()`: one line per node, indented two spaces per level, folders as `\"name/ (<size> B)\"`, files as `\"name (<size> B)\"`.\n- `add(child)` returns the folder for chaining and throws on a duplicate name (also when duplicates are passed to the constructor).\n\nDon't check whether a child is a `File` or a `Folder`: let each child answer for itself.",
      "`File` у `src/tree.ts` уже готовий. Допишіть `Folder`, щоб файли й папки можна було використовувати через однаковий інтерфейс `Node` (патерн **Composite**):\n\n- `size()`: сума байтів усього всередині на будь-якій глибині (порожня папка дає `0`).\n- `count()`: кількість файлів усередині на будь-якій глибині.\n- `find(predicate)`: шляхи відповідних файлів на кшталт `\"root/src/index.ts\"` у порядку дерева.\n- `print()`: по рядку на вузол, з відступом у два пробіли на рівень, папки як `\"name/ (<size> B)\"`, файли як `\"name (<size> B)\"`.\n- `add(child)` повертає папку для ланцюжка викликів і кидає помилку на дублікат назви (зокрема, коли дублікати передано в конструктор).\n\nНе перевіряйте, чи дитина є `File` чи `Folder`: нехай кожна дитина відповідає сама за себе.",
    ],
    files: { "/src/tree.ts": TREE_STARTER, "/index.ts": TREE_INDEX },
    visibleFiles: ["/src/tree.ts", "/index.ts"],
    activeFile: "/src/tree.ts",
    tests: TREE_TESTS,
    solution: { "/src/tree.ts": TREE_SOLUTION },
    explanation: [
      "Every `Folder` method delegates to its children through the shared `Node` interface, and recursion happens naturally because a child may itself be a folder. No `instanceof` checks are needed, so new node types (symlinks, archives) can be added without touching `Folder`. Passing the path prefix down while searching avoids storing parent pointers.",
      "Кожен метод `Folder` делегує дітям через спільний інтерфейс `Node`, а рекурсія виникає природно, бо дитина сама може бути папкою. Перевірки `instanceof` не потрібні, тож нові типи вузлів (символьні посилання, архіви) можна додати, не чіпаючи `Folder`. Передавання префікса шляху вниз під час пошуку позбавляє потреби зберігати посилання на батьків.",
    ],
  }),
  practice({
    slug: "pattern-request-builder",
    skills: ["design-patterns", w("http-rest"), w("typescript")],
    complexity: 3,
    estSeconds: 1020,
    framework: "vanilla-ts",
    title: ["An immutable request builder", "Незмінний будівельник запитів"],
    prompt: [
      "The `RequestBuilder` in `src/request.ts` mutates itself, so a shared, pre-configured base leaks changes between requests. Rewrite it as an **immutable Builder**:\n\n- `RequestBuilder.create()` starts empty with a `10000` ms timeout. Every step (`get`, `post`, `put`, `delete`, `header`, `query`, `timeout`) returns a **new** builder and leaves the original untouched.\n- `query(name, value)` adds URL-encoded parameters (`encodeURIComponent`), appending with `&` if the URL already has a `?`.\n- Header names are stored lower-case, so `X-Id` and `x-id` are the same header (the last one wins).\n- A body (`post`/`put`) is serialised with `JSON.stringify`, and `content-type: application/json` is added unless a content type was set.\n- `build()` throws if no method/URL was chosen; `timeout(ms)` throws for anything but a positive integer. The built object's `headers` must be a copy.\n- Don't include a `body` key when there's no body.",
      "`RequestBuilder` у `src/request.ts` змінює сам себе, тож спільна попередньо налаштована основа переносить зміни між запитами. Перепишіть його як **незмінний Builder**:\n\n- `RequestBuilder.create()` починає з порожнього стану й таймауту `10000` мс. Кожен крок (`get`, `post`, `put`, `delete`, `header`, `query`, `timeout`) повертає **новий** будівельник і не змінює початковий.\n- `query(name, value)` додає параметри, закодовані для URL (`encodeURIComponent`), через `&`, якщо в URL уже є `?`.\n- Назви заголовків зберігаються в нижньому регістрі, тож `X-Id` і `x-id` є тим самим заголовком (перемагає останній).\n- Тіло (`post`/`put`) серіалізується через `JSON.stringify`, і додається `content-type: application/json`, якщо тип вмісту не задано.\n- `build()` кидає помилку, якщо метод/URL не обрано; `timeout(ms)` кидає помилку для будь-чого, крім додатного цілого числа. `headers` у результаті мають бути копією.\n- Не додавайте ключ `body`, коли тіла немає.",
    ],
    files: { "/src/request.ts": BUILDER_STARTER, "/index.ts": BUILDER_INDEX },
    visibleFiles: ["/src/request.ts", "/index.ts"],
    activeFile: "/src/request.ts",
    tests: BUILDER_TESTS,
    solution: { "/src/request.ts": BUILDER_SOLUTION },
    explanation: [
      "Each step copies the state into a new builder (`with(patch)`), so a configured base like `api = create().header(\"Authorization\", …)` can safely branch into many requests. Normalising header names and encoding query values happen in one place, and `build()` is the single point where the whole combination is validated and turned into a plain object. A private constructor plus a static `create()` keeps callers from building half-initialised instances.",
      "Кожен крок копіює стан у новий будівельник (`with(patch)`), тож налаштована основа на кшталт `api = create().header(\"Authorization\", …)` може безпечно розгалужуватися на багато запитів. Нормалізація назв заголовків і кодування параметрів запиту відбуваються в одному місці, а `build()` є єдиною точкою, де вся комбінація перевіряється й перетворюється на звичайний об'єкт. Приватний конструктор зі статичним `create()` не дає викликачам створювати напівініціалізовані екземпляри.",
    ],
  }),
]);
