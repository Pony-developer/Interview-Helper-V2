import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const PRICING_TYPES = String.raw`export type Line = { sku: string; price: number; qty: number; category: string };
export type Order = { lines: Line[]; tier: "regular" | "gold"; coupon?: string };
export type Adjustment = { rule: string; amount: number };
export type Quote = { subtotal: number; adjustments: Adjustment[]; total: number };

/** A pricing rule returns an adjustment (negative = discount, positive = fee, 0 = not applicable). */
export interface PricingRule {
  readonly name: string;
  apply(order: Order, subtotal: number): number;
}
`;

const PRICING_STARTER =
  PRICING_TYPES +
  String.raw`
export function createPricing(rules: PricingRule[]) {
  return {
    quote(order: Order): Quote {
      // TODO: every new discount means editing this function, and "rules" is ignored
      let subtotal = 0;
      for (const line of order.lines) subtotal += line.price * line.qty;
      const adjustments: Adjustment[] = [];
      if (order.tier === "gold") adjustments.push({ rule: "gold-member", amount: -subtotal * 0.1 });
      if (order.coupon === "WELCOME5") adjustments.push({ rule: "coupon", amount: -5 });
      const total = subtotal + adjustments.reduce((sum, a) => sum + a.amount, 0);
      return { subtotal, adjustments, total };
    },
  };
}

export const goldMember: PricingRule = { name: "gold-member", apply: () => 0 };
export const bookBundle: PricingRule = { name: "book-bundle", apply: () => 0 };
export function coupon(code: string, amount: number): PricingRule {
  return { name: "coupon", apply: () => 0 };
}
`;

const PRICING_SOLUTION =
  PRICING_TYPES +
  String.raw`
const cents = (n: number) => Math.round(n * 100) / 100;

/** The engine knows nothing about specific discounts: new rules plug in without editing it. */
export function createPricing(rules: PricingRule[]) {
  return {
    quote(order: Order): Quote {
      const subtotal = cents(order.lines.reduce((sum, l) => sum + l.price * l.qty, 0));
      const adjustments = rules
        .map((rule) => ({ rule: rule.name, amount: cents(rule.apply(order, subtotal)) }))
        .filter((a) => a.amount !== 0);
      const total = Math.max(0, cents(subtotal + adjustments.reduce((sum, a) => sum + a.amount, 0)));
      return { subtotal, adjustments, total };
    },
  };
}

export const goldMember: PricingRule = {
  name: "gold-member",
  apply: (order, subtotal) => (order.tier === "gold" ? -subtotal * 0.1 : 0),
};

export const bookBundle: PricingRule = {
  name: "book-bundle",
  apply: (order) => -5 * order.lines.filter((l) => l.category === "books" && l.qty >= 3).length,
};

export function coupon(code: string, amount: number): PricingRule {
  const normalized = code.toUpperCase();
  return {
    name: "coupon:" + normalized,
    apply: (order) => (order.coupon?.toUpperCase() === normalized ? -amount : 0),
  };
}
`;

const PRICING_INDEX = String.raw`import "./styles.css";
import { bookBundle, coupon, createPricing, goldMember, type PricingRule } from "./src/pricing";

const shipping: PricingRule = { name: "shipping", apply: (_order, subtotal) => (subtotal < 50 ? 4.99 : 0) };
const pricing = createPricing([bookBundle, goldMember, coupon("WELCOME5", 5), shipping]);
const quote = pricing.quote({
  tier: "gold",
  coupon: "welcome5",
  lines: [
    { sku: "book-1", price: 12.5, qty: 3, category: "books" },
    { sku: "pen", price: 1.2, qty: 5, category: "office" },
  ],
});
document.getElementById("app")!.innerHTML =
  "<h1>Quote</h1><ul>" +
  quote.adjustments.map((a) => "<li>" + a.rule + ": " + a.amount.toFixed(2) + "</li>").join("") +
  '</ul><p>Total: <output id="total">' + quote.total.toFixed(2) + "</output></p>";
`;

const PRICING_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { bookBundle, coupon, createPricing, goldMember } from "../src/pricing";

const order = (extra = {}) => ({
  tier: "regular",
  lines: [
    { sku: "book-1", price: 12.5, qty: 3, category: "books" },
    { sku: "pen", price: 1.2, qty: 5, category: "office" },
  ],
  ...extra,
});

describe("pricing engine", () => {
  it("prices an order with no rules", () => {
    expect(createPricing([]).quote(order())).toEqual({ subtotal: 43.5, adjustments: [], total: 43.5 });
  });
  it("applies the gold discount only to gold customers", () => {
    const pricing = createPricing([goldMember]);
    expect(pricing.quote(order({ tier: "gold" }))).toEqual({ subtotal: 43.5, adjustments: [{ rule: "gold-member", amount: -4.35 }], total: 39.15 });
    expect(pricing.quote(order()).adjustments).toEqual([]);
  });
  it("discounts book lines with 3 or more copies", () => {
    expect(createPricing([bookBundle]).quote(order()).adjustments).toEqual([{ rule: "book-bundle", amount: -5 }]);
  });
  it("matches coupon codes case-insensitively", () => {
    const pricing = createPricing([coupon("WELCOME5", 5)]);
    expect(pricing.quote(order({ coupon: "welcome5" })).adjustments).toEqual([{ rule: "coupon:WELCOME5", amount: -5 }]);
    expect(pricing.quote(order({ coupon: "OTHER" })).adjustments).toEqual([]);
  });
  it("combines rules in order, each based on the original subtotal", () => {
    const q = createPricing([bookBundle, goldMember, coupon("WELCOME5", 5)]).quote(order({ tier: "gold", coupon: "WELCOME5" }));
    expect(q.adjustments.map((a) => a.rule)).toEqual(["book-bundle", "gold-member", "coupon:WELCOME5"]);
    expect(q.adjustments[1].amount).toBe(-4.35);
    expect(q.total).toBe(29.15);
  });
  it("accepts new rules without changing the engine", () => {
    const shipping = { name: "shipping", apply: (_o, subtotal) => (subtotal < 50 ? 4.99 : 0) };
    const q = createPricing([shipping]).quote(order());
    expect(q.adjustments).toEqual([{ rule: "shipping", amount: 4.99 }]);
    expect(q.total).toBe(48.49);
  });
  it("never goes below zero and never mutates the order", () => {
    const frozen = order({ coupon: "BIG" });
    Object.freeze(frozen);
    frozen.lines.forEach((l) => Object.freeze(l));
    Object.freeze(frozen.lines);
    expect(createPricing([coupon("BIG", 100)]).quote(frozen).total).toBe(0);
  });
});
`;

export default defineTasks([
  quiz(
    "solid-srp",
    ["solid"],
    1,
    45,
    ["The S in SOLID", "S у SOLID"],
    ["What does the single responsibility principle say?", "Що стверджує принцип єдиного обов'язку?"],
    [
      ["A module should have one reason to change", "Модуль повинен мати одну причину для змін"],
      ["A class should have only one method", "Клас повинен мати лише один метод"],
      ["Each file should export exactly one function", "Кожен файл повинен експортувати рівно одну функцію"],
      ["Only one developer should own each module", "Кожним модулем має володіти лише один розробник"],
    ],
    "a",
    [
      "Responsibility means a reason to change: one concern or one stakeholder. A component that fetches data, applies business rules and renders has at least three. It's not about counting methods or functions; a module can have many methods that all serve the same purpose.",
      "Обов'язок означає причину для змін: одну задачу чи одну зацікавлену сторону. Компонент, що отримує дані, застосовує бізнес-правила й рендерить, має щонайменше три. Ідеться не про кількість методів чи функцій; модуль може мати багато методів, які служать одній меті.",
    ],
  ),
  quiz(
    "solid-srp-component",
    ["solid", w("react")],
    2,
    90,
    ["Splitting a component", "Розділення компонента"],
    ["`OrdersPage` fetches orders, converts currencies, computes tax, tracks analytics and renders a table. Which refactor best follows SRP?", "`OrdersPage` отримує замовлення, конвертує валюти, рахує податок, відстежує аналітику й рендерить таблицю. Який рефакторинг найкраще відповідає SRP?"],
    [
      ["A `useOrders` hook for data, pure functions for currency and tax, and a presentational `OrdersTable`", "Хук `useOrders` для даних, чисті функції для валют і податку та презентаційна `OrdersTable`"],
      ["Split the JSX into five files but keep all logic in `OrdersPage`", "Розбити JSX на п'ять файлів, але лишити всю логіку в `OrdersPage`"],
      ["Move everything into a single `utils.ts`", "Перенести все в один `utils.ts`"],
      ["Wrap the component in `React.memo`", "Обгорнути компонент у `React.memo`"],
    ],
    "a",
    [
      "Each part now changes for one reason: the API (hook), finance rules (pure functions, easy to unit-test), or design (table). Splitting markup alone keeps the responsibilities tangled, a catch-all `utils.ts` just moves the problem, and memoisation is about performance, not design.",
      "Тепер кожна частина змінюється з однієї причини: API (хук), фінансові правила (чисті функції, які легко тестувати) чи дизайн (таблиця). Розбиття лише розмітки лишає обов'язки переплутаними, загальний `utils.ts` просто переносить проблему, а мемоізація стосується продуктивності, а не дизайну.",
    ],
  ),
  quiz(
    "solid-ocp",
    ["solid", w("design-patterns")],
    2,
    90,
    ["Adding a payment method", "Новий спосіб оплати"],
    ["Adding \"Apple Pay\" requires editing `switch (method)` statements in five files. Which principle is violated, and what's the usual fix?", "Додавання «Apple Pay» вимагає правок `switch (method)` у п'яти файлах. Який принцип порушено і як це зазвичай виправляють?"],
    [
      ["Open/closed: register each method as a strategy object behind one interface", "Відкритості/закритості: зареєструвати кожен спосіб як об'єкт-стратегію за одним інтерфейсом"],
      ["Liskov substitution: make `ApplePay` extend `CardPayment`", "Підстановки Лісков: успадкувати `ApplePay` від `CardPayment`"],
      ["Interface segregation: split the switch into smaller switches", "Розділення інтерфейсів: розбити switch на менші"],
      ["None: switches are always fine", "Жоден: switch завжди прийнятний"],
    ],
    "a",
    [
      "Open/closed means new behaviour is added by adding code, not by editing working code in many places. A registry like `paymentMethods: Record<Method, PaymentMethod>` with `charge`, `refund` and `label` keeps the checkout closed for modification: a new method is one new entry.",
      "Відкритість/закритість означає, що нова поведінка додається новим кодом, а не правками робочого коду в багатьох місцях. Реєстр на кшталт `paymentMethods: Record<Method, PaymentMethod>` з `charge`, `refund` і `label` лишає оформлення замовлення закритим для змін: новий спосіб є одним новим записом.",
    ],
  ),
  quiz(
    "solid-lsp-square",
    ["solid", w("oop")],
    3,
    90,
    ["Square and Rectangle", "Квадрат і прямокутник"],
    ["What does this print, and which principle does `Square` break?", "Що виведе цей код і який принцип порушує `Square`?"],
    [
      ["`20 16`; Liskov substitution", "`20 16`; підстановки Лісков"],
      ["`20 20`; nothing is broken", "`20 20`; нічого не порушено"],
      ["`16 16`; single responsibility", "`16 16`; єдиного обов'язку"],
      ["`20 25`; open/closed", "`20 25`; відкритості/закритості"],
    ],
    "a",
    [
      "`resize` relies on the rectangle contract: setting the height doesn't change the width. `Square` keeps its own invariant by changing both, so the final `setHeight(4)` also sets the width to 4. A subtype that can't be substituted for its base without surprising callers violates LSP. Model squares and rectangles as separate (possibly immutable) shapes instead.",
      "`resize` покладається на контракт прямокутника: зміна висоти не змінює ширину. `Square` зберігає власний інваріант, змінюючи обидві, тож останній `setHeight(4)` також встановлює ширину 4. Підтип, який не можна підставити замість бази, не здивувавши викликачів, порушує LSP. Моделюйте квадрати й прямокутники як окремі (можливо, незмінні) фігури.",
    ],
    {
      code: "class Rectangle {\n  constructor(w, h) { this.w = w; this.h = h; }\n  setWidth(w) { this.w = w; }\n  setHeight(h) { this.h = h; }\n  area() { return this.w * this.h; }\n}\nclass Square extends Rectangle {\n  setWidth(w) { this.w = this.h = w; }\n  setHeight(h) { this.w = this.h = h; }\n}\nfunction resize(r) {\n  r.setWidth(5);\n  r.setHeight(4);\n  return r.area();\n}\nconsole.log(resize(new Rectangle(1, 1)), resize(new Square(1, 1)));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "solid-isp",
    ["solid", w("typescript")],
    3,
    90,
    ["A fat interface", "«Товстий» інтерфейс"],
    ["`LocalCache` must implement `Storage` but only supports `get` and `set`, so it throws in the other methods. What's the better design?", "`LocalCache` мусить реалізувати `Storage`, але підтримує лише `get` і `set`, тож в інших методах кидає помилку. Який дизайн кращий?"],
    [
      ["Split `Storage` into small interfaces (e.g. `KeyValue`, `Queryable`, `Exportable`) and depend only on what each consumer uses", "Розбити `Storage` на невеликі інтерфейси (наприклад, `KeyValue`, `Queryable`, `Exportable`) і залежати лише від того, що потрібно кожному споживачу"],
      ["Keep throwing; callers should catch the errors", "Далі кидати помилки; викликачі мають їх перехоплювати"],
      ["Make every method optional with `?`", "Зробити кожен метод необов'язковим через `?`"],
      ["Add an `isSupported(method)` check before each call", "Додати перевірку `isSupported(method)` перед кожним викликом"],
    ],
    "a",
    [
      "Interface segregation: clients shouldn't be forced to depend on methods they don't use. Implementations that throw \"not supported\" also break substitutability. Small role interfaces let `LocalCache` implement only `KeyValue`, while code that needs querying asks for `Queryable` explicitly. Optional methods and runtime checks push the problem onto every caller.",
      "Розділення інтерфейсів: клієнти не повинні залежати від методів, якими не користуються. Реалізації, що кидають «не підтримується», ще й порушують замінність. Невеликі рольові інтерфейси дають `LocalCache` реалізувати лише `KeyValue`, а код, якому потрібні запити, явно просить `Queryable`. Необов'язкові методи й перевірки під час виконання перекладають проблему на кожного викликача.",
    ],
    { code: "interface Storage {\n  get(key: string): string | undefined;\n  set(key: string, value: string): void;\n  query(filter: Filter): Row[];\n  exportCsv(): string;\n  migrate(version: number): Promise<void>;\n}", codeLanguage: "ts" },
  ),
  quiz(
    "solid-dip",
    ["solid", w("design-patterns")],
    3,
    90,
    ["Dependency inversion", "Інверсія залежностей"],
    ["Which statement describes the dependency inversion principle?", "Яке твердження описує принцип інверсії залежностей?"],
    [
      ["High-level policy and low-level details both depend on abstractions; details are plugged in from outside", "Високорівнева логіка й низькорівневі деталі обидві залежать від абстракцій; деталі під'єднуються ззовні"],
      ["Low-level modules should import high-level modules", "Низькорівневі модулі повинні імпортувати високорівневі"],
      ["Every dependency must be loaded lazily", "Кожну залежність треба завантажувати ліниво"],
      ["Dependencies should be listed in reverse alphabetical order", "Залежності треба перелічувати у зворотному алфавітному порядку"],
    ],
    "a",
    [
      "Without inversion, business logic (`ReportService`) imports concrete infrastructure (`PostgresRepo`), so changes and tests ripple upwards. With it, the service declares an interface (`ReportRepo`) it needs, and the composition root wires a concrete implementation. Dependency injection is the usual mechanism.",
      "Без інверсії бізнес-логіка (`ReportService`) імпортує конкретну інфраструктуру (`PostgresRepo`), тож зміни й тести поширюються вгору. З інверсією сервіс оголошує потрібний йому інтерфейс (`ReportRepo`), а корінь композиції під'єднує конкретну реалізацію. Звичайний механізм для цього: впровадження залежностей.",
    ],
  ),
  quiz(
    "solid-lsp-contract",
    ["solid", w("oop")],
    4,
    120,
    ["Which override breaks substitution?", "Яке перевизначення порушує замінність?"],
    ["`HttpClient.get(url)` accepts any URL and returns a `Response`. Which subclass change violates the Liskov substitution principle?", "`HttpClient.get(url)` приймає будь-який URL і повертає `Response`. Яка зміна в підкласі порушує принцип підстановки Лісков?"],
    [
      ["`SecureClient.get` throws for `http:` URLs that the base class accepted", "`SecureClient.get` кидає помилку для URL `http:`, які приймав базовий клас"],
      ["`CachedClient.get` returns a cached `Response` when it has one", "`CachedClient.get` повертає закешований `Response`, якщо він є"],
      ["`LoggingClient` adds a new `history()` method", "`LoggingClient` додає новий метод `history()`"],
      ["`JsonClient.get` returns a `JsonResponse`, a subtype of `Response`", "`JsonClient.get` повертає `JsonResponse`, підтип `Response`"],
    ],
    "a",
    [
      "A subtype may accept more and promise more, but not demand more or deliver less. Rejecting inputs the base accepted (a stronger precondition) breaks callers that were written against the base. Caching keeps the contract, extra methods don't affect existing callers, and a more specific return type still satisfies `Response`.",
      "Підтип може приймати більше й обіцяти більше, але не може вимагати більшого чи давати менше. Відмова від вхідних даних, які приймала база (сильніша передумова), ламає викликачів, написаних під базу. Кешування зберігає контракт, додаткові методи не впливають на наявних викликачів, а конкретніший тип результату все одно задовольняє `Response`.",
    ],
  ),
  quiz(
    "solid-yagni",
    ["solid", w("clean-code")],
    4,
    120,
    ["When not to add an abstraction", "Коли не варто додавати абстракцію"],
    [
      "A teammate adds `INotificationSender`, `NotificationSenderFactory` and a `NotificationStrategyRegistry` for the app's only notification type, an email. What's the best review comment?",
      "Колега додає `INotificationSender`, `NotificationSenderFactory` і `NotificationStrategyRegistry` для єдиного типу сповіщень у застосунку, email. Який коментар у code review найкращий?",
    ],
    [
      ["YAGNI: start with a plain function; introduce the abstraction when a second channel or a test seam actually needs it", "YAGNI: почати зі звичайної функції; вводити абстракцію, коли другий канал чи точка підміни для тестів справді знадобиться"],
      ["Good: SOLID requires an interface for every class", "Добре: SOLID вимагає інтерфейс для кожного класу"],
      ["Add a `NotificationSenderFactoryProvider` too, for consistency", "Додати ще й `NotificationSenderFactoryProvider` для узгодженості"],
      ["Replace it with a global singleton", "Замінити все глобальним синглтоном"],
    ],
    "a",
    [
      "Abstractions have a cost: more files, indirection and names to learn. With one implementation, the factory and registry solve a problem that doesn't exist yet. SOLID helps when change actually happens; until then KISS and YAGNI win. Extracting an interface later, when a second channel arrives, is a small, safe refactor.",
      "Абстракції мають ціну: більше файлів, непрямості й назв, які треба вивчити. З однією реалізацією фабрика й реєстр розв'язують проблему, якої ще немає. SOLID допомагає, коли зміни справді стаються; доти перемагають KISS і YAGNI. Виділити інтерфейс пізніше, коли з'явиться другий канал, є невеликим і безпечним рефакторингом.",
    ],
  ),
  quiz(
    "solid-spot-violations",
    ["solid"],
    5,
    150,
    ["Spot the violations", "Знайдіть порушення"],
    ["Which of these are SOLID violations? (Select all that apply.)", "Що з цього є порушеннями SOLID? (Оберіть усі.)"],
    [
      ["A `UserService` that saves users, sends welcome emails, writes audit logs and calculates tax", "`UserService`, що зберігає користувачів, надсилає вітальні листи, пише журнал аудиту й рахує податок"],
      ["`ReadOnlyList extends List` and throws from `push`", "`ReadOnlyList extends List` і кидає помилку з `push`"],
      ["Passing a `Clock` interface into a scheduler so tests can control time", "Передавання інтерфейсу `Clock` у планувальник, щоб тести керували часом"],
      ["A `switch (shape.type)` copied into every shape function, while new shapes are added every month", "`switch (shape.type)`, скопійований у кожну функцію для фігур, тоді як нові фігури додаються щомісяця"],
      ["Components that receive only the props they render", "Компоненти, що отримують лише ті пропси, які рендерять"],
    ],
    "abd",
    [
      "The service has many reasons to change (SRP). A subclass that throws from an inherited method can't stand in for its base (LSP). Repeated type switches for a frequently growing set of cases force edits everywhere (OCP). Injecting a `Clock` is dependency inversion done right, and narrow props are interface segregation.",
      "Сервіс має багато причин для змін (SRP). Підклас, що кидає помилку з успадкованого методу, не може заступити базу (LSP). Повторювані switch за типом для набору випадків, що часто росте, вимагають правок усюди (OCP). Впровадження `Clock` є правильною інверсією залежностей, а вузькі пропси є розділенням інтерфейсів.",
    ],
  ),
  practice({
    slug: "solid-pricing-rules",
    skills: ["solid", w("design-patterns"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["An open/closed pricing engine", "Ціноутворення за принципом відкритості/закритості"],
    prompt: [
      "`createPricing` in `src/pricing.ts` hard-codes every discount, so each new promotion means editing it. Make the engine **open for extension and closed for modification**:\n\n- `createPricing(rules).quote(order)` returns `{ subtotal, adjustments, total }`. It knows nothing about specific discounts; it just runs each `PricingRule` with the order and the **original** subtotal.\n- `adjustments` lists `{ rule: rule.name, amount }` for every rule whose amount isn't `0`, in rule order. Round money to cents; `total` never goes below `0`. Don't mutate the order.\n- Implement the rules:\n  - `goldMember` (`\"gold-member\"`): 10% off the subtotal for `tier: \"gold\"`.\n  - `bookBundle` (`\"book-bundle\"`): `-5` for each `books` line with `qty >= 3`.\n  - `coupon(code, amount)` (`\"coupon:<CODE>\"`, upper case): `-amount` when the order's coupon matches, case-insensitively.\n\nA new rule (like a shipping fee) must work by passing it in, with no engine changes.",
      "`createPricing` у `src/pricing.ts` жорстко прописує кожну знижку, тож кожна нова акція означає правки. Зробіть рушій **відкритим для розширення й закритим для змін**:\n\n- `createPricing(rules).quote(order)` повертає `{ subtotal, adjustments, total }`. Він нічого не знає про конкретні знижки; він лише запускає кожне `PricingRule` із замовленням і **початковою** сумою.\n- `adjustments` містить `{ rule: rule.name, amount }` для кожного правила, чия сума не `0`, у порядку правил. Округлюйте гроші до копійок; `total` ніколи не буває менше `0`. Не змінюйте замовлення.\n- Реалізуйте правила:\n  - `goldMember` (`\"gold-member\"`): 10% знижки від суми для `tier: \"gold\"`.\n  - `bookBundle` (`\"book-bundle\"`): `-5` за кожен рядок `books` з `qty >= 3`.\n  - `coupon(code, amount)` (`\"coupon:<CODE>\"` великими літерами): `-amount`, коли купон замовлення збігається без урахування регістру.\n\nНове правило (наприклад, плата за доставку) має працювати, якщо просто його передати, без змін у рушії.",
    ],
    files: { "/src/pricing.ts": PRICING_STARTER, "/index.ts": PRICING_INDEX },
    visibleFiles: ["/src/pricing.ts", "/index.ts"],
    activeFile: "/src/pricing.ts",
    tests: PRICING_TESTS,
    solution: { "/src/pricing.ts": PRICING_SOLUTION },
    explanation: [
      "The engine depends only on the `PricingRule` abstraction (dependency inversion), so adding a promotion means writing a new rule object (open/closed) instead of editing a growing function. Each rule has one job (single responsibility) and can be unit-tested alone. Computing every rule from the original subtotal makes results independent of rule order, and rounding in one place avoids floating-point drift.",
      "Рушій залежить лише від абстракції `PricingRule` (інверсія залежностей), тож нова акція означає новий об'єкт-правило (відкритість/закритість), а не правки функції, що постійно росте. Кожне правило має одну задачу (єдиний обов'язок) і тестується окремо. Обчислення кожного правила від початкової суми робить результат незалежним від порядку правил, а округлення в одному місці запобігає накопиченню похибок.",
    ],
  }),
]);
