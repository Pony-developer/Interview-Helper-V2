import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ACCOUNT_STARTER = String.raw`export type Entry = { type: "deposit" | "withdraw" | "interest"; amount: number };

export class Account {
  // TODO: encapsulate. Anyone can currently write balance and history directly.
  balance = 0;
  history: Entry[] = [];

  constructor(readonly owner: string) {}

  deposit(amount: number): void {
    this.balance += amount;
    this.history.push({ type: "deposit", amount });
  }

  withdraw(amount: number): void {
    this.balance -= amount;
    this.history.push({ type: "withdraw", amount });
  }
}

export class SavingsAccount extends Account {
  constructor(owner: string, readonly rate: number) {
    super(owner);
  }

  addInterest(): void {
    // TODO
  }
}

export class CheckingAccount extends Account {
  constructor(owner: string, readonly overdraft: number) {
    super(owner);
  }
}
`;

const ACCOUNT_SOLUTION = String.raw`export type Entry = { type: "deposit" | "withdraw" | "interest"; amount: number };

const toCents = (n: number) => Math.round(n * 100) / 100;

export class Account {
  #balance = 0;
  #history: Entry[] = [];

  constructor(readonly owner: string) {}

  get balance(): number {
    return this.#balance;
  }

  /** A copy, so callers can't rewrite the ledger. */
  get history(): Entry[] {
    return this.#history.map((e) => ({ ...e }));
  }

  deposit(amount: number): void {
    assertAmount(amount);
    this.apply("deposit", amount);
  }

  withdraw(amount: number): void {
    assertAmount(amount);
    if (!this.canWithdraw(amount)) throw new Error("Insufficient funds");
    this.apply("withdraw", amount);
  }

  /** Subclasses override this to change the withdrawal rule. */
  protected canWithdraw(amount: number): boolean {
    return amount <= this.#balance;
  }

  /** The only place the balance changes, so history and balance never disagree. */
  protected apply(type: Entry["type"], amount: number): void {
    this.#balance = toCents(this.#balance + (type === "withdraw" ? -amount : amount));
    this.#history.push({ type, amount });
  }
}

function assertAmount(amount: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Amount must be a positive number");
  }
}

export class SavingsAccount extends Account {
  constructor(owner: string, readonly rate: number) {
    super(owner);
  }

  addInterest(): void {
    const interest = toCents(this.balance * this.rate);
    if (interest > 0) this.apply("interest", interest);
  }
}

export class CheckingAccount extends Account {
  constructor(owner: string, readonly overdraft: number) {
    super(owner);
  }

  protected canWithdraw(amount: number): boolean {
    return this.balance - amount >= -this.overdraft;
  }
}
`;

const ACCOUNT_INDEX = String.raw`import "./styles.css";
import { CheckingAccount, SavingsAccount } from "./src/account";

const savings = new SavingsAccount("Ada", 0.1);
savings.deposit(200);
savings.addInterest();
const checking = new CheckingAccount("Bob", 50);
checking.deposit(20);
try {
  checking.withdraw(60);
} catch (e) {
  console.warn(e);
}
document.getElementById("app")!.innerHTML =
  '<h1>Accounts</h1><p>Savings: <output id="savings">' + savings.balance + '</output></p><p>Checking: <output id="checking">' + checking.balance + "</output></p>";
`;

const ACCOUNT_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { Account, CheckingAccount, SavingsAccount } from "../src/account";

describe("Account", () => {
  it("deposits and withdraws", () => {
    const acc = new Account("Ada");
    acc.deposit(100);
    acc.withdraw(30);
    expect(acc.balance).toBe(70);
    expect(acc.history).toEqual([
      { type: "deposit", amount: 100 },
      { type: "withdraw", amount: 30 },
    ]);
  });
  it("rejects non-positive or invalid amounts", () => {
    const acc = new Account("Ada");
    expect(() => acc.deposit(0)).toThrow();
    expect(() => acc.deposit(-5)).toThrow();
    expect(() => acc.deposit(Number.NaN)).toThrow();
    expect(() => acc.withdraw(Infinity)).toThrow();
    expect(acc.balance).toBe(0);
  });
  it("refuses to overdraw and leaves the balance unchanged", () => {
    const acc = new Account("Ada");
    acc.deposit(10);
    expect(() => acc.withdraw(11)).toThrow();
    expect(acc.balance).toBe(10);
    expect(acc.history).toHaveLength(1);
  });
  it("keeps the balance private and read-only", () => {
    const acc = new Account("Ada");
    acc.deposit(5);
    expect(Reflect.set(acc, "balance", 1000000)).toBe(false);
    expect(acc.balance).toBe(5);
    expect(Object.getOwnPropertyNames(acc)).not.toContain("balance");
  });
  it("returns a copy of the history", () => {
    const acc = new Account("Ada");
    acc.deposit(5);
    acc.history.push({ type: "deposit", amount: 999 });
    acc.history[0].amount = 999;
    expect(acc.history).toEqual([{ type: "deposit", amount: 5 }]);
  });
});

describe("subclasses", () => {
  it("adds interest to savings, rounded to cents", () => {
    const s = new SavingsAccount("Ada", 0.035);
    s.deposit(100.1);
    s.addInterest();
    expect(s.balance).toBe(103.6);
    expect(s.history[1]).toEqual({ type: "interest", amount: 3.5 });
    expect(s instanceof Account).toBe(true);
  });
  it("lets checking accounts use the overdraft, but no further", () => {
    const c = new CheckingAccount("Bob", 50);
    c.deposit(20);
    c.withdraw(60);
    expect(c.balance).toBe(-40);
    expect(() => c.withdraw(11)).toThrow();
    c.withdraw(10);
    expect(c.balance).toBe(-50);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("220")).id).toBe("savings");
    expect((await screen.findByText("-40")).id).toBe("checking");
  });
});
`;

const SHAPES_STARTER = String.raw`export abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  describe(): string {
    // TODO: "<ClassName> area=<2 decimals> perimeter=<2 decimals>"
    return "";
  }
}

export class Circle extends Shape {
  constructor(readonly radius: number) {
    super();
  }
  area() {
    return 0;
  }
  perimeter() {
    return 0;
  }
}

export class Rectangle extends Shape {
  constructor(readonly width: number, readonly height: number) {
    super();
  }
  area() {
    return 0;
  }
  perimeter() {
    return 0;
  }
}

export class Square extends Rectangle {
  constructor(side: number) {
    super(side, side);
  }
}

/** The shape with the biggest area, or undefined for an empty list. */
export function largest(shapes: Shape[]): Shape | undefined {
  return shapes[0];
}
`;

const SHAPES_SOLUTION = String.raw`function assertPositive(...values: number[]) {
  for (const v of values) {
    if (!Number.isFinite(v) || v <= 0) throw new RangeError("Dimensions must be positive numbers");
  }
}

export abstract class Shape {
  constructor() {
    // "abstract" is compile-time only; this guard also stops casts and plain JS callers.
    if (new.target === Shape) throw new TypeError("Shape is abstract");
  }

  abstract area(): number;
  abstract perimeter(): number;

  /** Written once: this.area() dispatches to the subclass (polymorphism). */
  describe(): string {
    return this.constructor.name + " area=" + this.area().toFixed(2) + " perimeter=" + this.perimeter().toFixed(2);
  }
}

export class Circle extends Shape {
  constructor(readonly radius: number) {
    super();
    assertPositive(radius);
  }
  area() {
    return Math.PI * this.radius ** 2;
  }
  perimeter() {
    return 2 * Math.PI * this.radius;
  }
}

export class Rectangle extends Shape {
  constructor(readonly width: number, readonly height: number) {
    super();
    assertPositive(width, height);
  }
  area() {
    return this.width * this.height;
  }
  perimeter() {
    return 2 * (this.width + this.height);
  }
}

export class Square extends Rectangle {
  constructor(side: number) {
    super(side, side);
  }
  get side() {
    return this.width;
  }
}

export function largest(shapes: Shape[]): Shape | undefined {
  let best: Shape | undefined;
  for (const s of shapes) if (!best || s.area() > best.area()) best = s;
  return best;
}
`;

const SHAPES_INDEX = String.raw`import "./styles.css";
import { Circle, Rectangle, Square, largest } from "./src/shapes";

const shapes = [new Square(2), new Circle(1), new Rectangle(3, 4)];
document.getElementById("app")!.innerHTML =
  "<h1>Shapes</h1><ul>" +
  shapes.map((s) => "<li>" + s.describe() + "</li>").join("") +
  '</ul><p>Largest: <output id="largest">' + (largest(shapes)?.describe() ?? "none") + "</output></p>";
`;

const SHAPES_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { Circle, Rectangle, Shape, Square, largest } from "../src/shapes";

describe("shapes", () => {
  it("computes area and perimeter", () => {
    expect(new Rectangle(2, 3).area()).toBe(6);
    expect(new Rectangle(2, 3).perimeter()).toBe(10);
    expect(new Square(4).area()).toBe(16);
    expect(new Circle(1).area()).toBeCloseTo(Math.PI);
    expect(new Circle(2).perimeter()).toBeCloseTo(4 * Math.PI);
  });
  it("describes every shape with one shared method", () => {
    expect(new Square(2).describe()).toBe("Square area=4.00 perimeter=8.00");
    expect(new Circle(1).describe()).toBe("Circle area=3.14 perimeter=6.28");
    expect(Object.prototype.hasOwnProperty.call(Circle.prototype, "describe")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(Square.prototype, "describe")).toBe(false);
  });
  it("models a square as a rectangle", () => {
    const sq = new Square(3);
    expect(sq instanceof Rectangle).toBe(true);
    expect(sq instanceof Shape).toBe(true);
    expect(sq.width).toBe(3);
    expect(sq.height).toBe(3);
  });
  it("rejects invalid dimensions", () => {
    expect(() => new Circle(0)).toThrow();
    expect(() => new Rectangle(2, -1)).toThrow();
    expect(() => new Square(Number.NaN)).toThrow();
  });
  it("refuses to instantiate the abstract Shape at runtime", () => {
    const AnyShape = Shape as any;
    expect(() => new AnyShape()).toThrow();
  });
  it("finds the largest shape", () => {
    const shapes = [new Square(2), new Circle(2), new Rectangle(3, 4)];
    expect(largest(shapes)).toBe(shapes[1]);
    expect(largest([])).toBe(undefined);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("Rectangle area=12.00 perimeter=14.00", { selector: "output" })).id).toBe("largest");
  });
});
`;

export default defineTasks([
  quiz(
    "oop-four-pillars",
    ["oop"],
    1,
    45,
    ["The four pillars", "Чотири принципи"],
    ["Which of these is **not** one of the four pillars of OOP?", "Що з цього **не** є одним із чотирьох принципів ООП?"],
    [
      ["Encapsulation", "Інкапсуляція"],
      ["Polymorphism", "Поліморфізм"],
      ["Memoisation", "Мемоізація"],
      ["Inheritance", "Успадкування"],
    ],
    "c",
    [
      "The four pillars are encapsulation, abstraction, inheritance and polymorphism. Memoisation is a caching technique for function results and has nothing to do with OOP specifically.",
      "Чотири принципи: інкапсуляція, абстракція, успадкування й поліморфізм. Мемоізація є технікою кешування результатів функцій і з ООП безпосередньо не пов'язана.",
    ],
  ),
  quiz(
    "oop-private-fields",
    ["oop", w("typescript")],
    2,
    90,
    ["`#private` vs `private`", "`#private` чи `private`"],
    ["What is the difference between these two fields at **runtime**?", "Яка різниця між цими двома полями **під час виконання**?"],
    [
      ["`#pin` can't be read outside the class; `private token` is erased by TypeScript and is readable via `(card as any).token`", "`#pin` не можна прочитати поза класом; `private token` TypeScript стирає, і його можна прочитати через `(card as any).token`"],
      ["Both are inaccessible outside the class", "Обидва недоступні поза класом"],
      ["Both are ordinary public properties at runtime", "Обидва під час виконання є звичайними публічними властивостями"],
      ["`private` is enforced at runtime; `#` is only a naming convention", "`private` забезпечується під час виконання; `#` лише домовленість щодо назв"],
    ],
    "a",
    [
      "TypeScript's `private` and `protected` are checked only by the compiler and disappear in the emitted JavaScript. `#fields` are a JavaScript feature: the engine rejects access from outside the class body (it's a syntax error), and they don't show up in `Object.keys` or `JSON.stringify`.",
      "`private` і `protected` у TypeScript перевіряє лише компілятор, і в отриманому JavaScript їх немає. Поля `#` є можливістю самого JavaScript: рушій забороняє доступ поза тілом класу (це синтаксична помилка), і вони не потрапляють в `Object.keys` чи `JSON.stringify`.",
    ],
    { code: "class Card {\n  #pin = \"1234\";\n  private token = \"abc\";\n}\nconst card = new Card();", codeLanguage: "ts" },
  ),
  quiz(
    "oop-super-before-this",
    ["oop", w("javascript")],
    2,
    60,
    ["`this` before `super()`", "`this` до `super()`"],
    ["What happens when `new Admin(\"Ada\")` runs?", "Що станеться під час виконання `new Admin(\"Ada\")`?"],
    [
      ["`ReferenceError`: `this` can't be used before `super()` in a derived class", "`ReferenceError`: у похідному класі не можна використовувати `this` до `super()`"],
      ["It works; `role` is set and then `name`", "Працює: спершу встановлюється `role`, потім `name`"],
      ["`name` is `undefined` but no error is thrown", "`name` дорівнює `undefined`, але помилки немає"],
      ["`TypeError`: classes can't have constructors with parameters", "`TypeError`: класи не можуть мати конструктори з параметрами"],
    ],
    "a",
    [
      "In a derived class the parent constructor creates the object, so `this` is uninitialised until `super(...)` returns. Accessing it earlier throws a `ReferenceError`. Call `super(name)` first, then set subclass fields.",
      "У похідному класі об'єкт створює батьківський конструктор, тож `this` не ініціалізований, доки `super(...)` не повернеться. Звернення раніше кидає `ReferenceError`. Спершу викличте `super(name)`, а потім встановлюйте поля підкласу.",
    ],
    { code: "class User {\n  constructor(name) { this.name = name; }\n}\nclass Admin extends User {\n  constructor(name) {\n    this.role = \"admin\";\n    super(name);\n  }\n}", codeLanguage: "js" },
  ),
  quiz(
    "oop-detached-method",
    ["oop", w("closures-scope")],
    3,
    90,
    ["A detached method", "Відірваний метод"],
    ["Clicking the button throws `TypeError: Cannot read properties of undefined (reading 'count')`. Why?", "Натискання кнопки кидає `TypeError: Cannot read properties of undefined (reading 'count')`. Чому?"],
    [
      ["`counter.increment` is passed without its object, so `this` is not `counter` when it runs; bind it or use an arrow wrapper", "`counter.increment` передано без об'єкта, тож під час виклику `this` не є `counter`; прив'яжіть його або використайте стрілочну обгортку"],
      ["Class fields can't be numbers", "Поля класу не можуть бути числами"],
      ["`addEventListener` only accepts arrow functions", "`addEventListener` приймає лише стрілочні функції"],
      ["`count` must be declared `static`", "`count` треба оголосити як `static`"],
    ],
    "a",
    [
      "`this` is decided by how a function is called. Passing `counter.increment` passes only the function; the DOM calls it with `this` set to the element, and in other detached calls (strict class code) it's `undefined`. Use `counter.increment.bind(counter)`, `() => counter.increment()`, or define `increment = () => { ... }` as a class field.",
      "`this` визначається способом виклику функції. Передаючи `counter.increment`, ви передаєте лише функцію; DOM викликає її з `this`, що вказує на елемент, а в інших відірваних викликах (строгий код класу) це `undefined`. Використайте `counter.increment.bind(counter)`, `() => counter.increment()` або визначте `increment = () => { ... }` як поле класу.",
    ],
    { code: "class Counter {\n  count = 0;\n  increment() {\n    this.count++;\n    console.log(this.count);\n  }\n}\nconst counter = new Counter();\nbutton.addEventListener(\"click\", counter.increment);", codeLanguage: "ts" },
  ),
  quiz(
    "oop-polymorphic-dispatch",
    ["oop"],
    3,
    90,
    ["Overrides and `super`", "Перевизначення і `super`"],
    ["What does this log?", "Що виведе цей код?"],
    [
      ["`[\"...!\", \"meow!\", \"MEOW!\"]`", "`[\"...!\", \"meow!\", \"MEOW!\"]`"],
      ["`[\"...!\", \"...!\", \"...!\"]`", "`[\"...!\", \"...!\", \"...!\"]`"],
      ["`[\"...!\", \"meow!\", \"meow!\"]`", "`[\"...!\", \"meow!\", \"meow!\"]`"],
      ["`[\"...!\", \"meow!\", \"...!\"]`", "`[\"...!\", \"meow!\", \"...!\"]`"],
    ],
    "a",
    [
      "`speak` in `Animal` calls `this.sound()`, and `this` is the actual object, so `Cat`'s override is used. `Kitten` inherits `sound` from `Cat` and overrides `speak`, calling the parent version through `super.speak()` (which still uses `this.sound()` → `\"meow\"`) and upper-casing the result.",
      "`speak` в `Animal` викликає `this.sound()`, а `this` є конкретним об'єктом, тож використовується перевизначення з `Cat`. `Kitten` успадковує `sound` від `Cat` і перевизначає `speak`, викликаючи батьківську версію через `super.speak()` (яка й далі використовує `this.sound()` → `\"meow\"`) і переводячи результат у верхній регістр.",
    ],
    {
      code: 'class Animal {\n  speak() { return this.sound() + "!"; }\n  sound() { return "..."; }\n}\nclass Cat extends Animal {\n  sound() { return "meow"; }\n}\nclass Kitten extends Cat {\n  speak() { return super.speak().toUpperCase(); }\n}\nconsole.log([new Animal(), new Cat(), new Kitten()].map((a) => a.speak()));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "oop-composition",
    ["oop", w("design-patterns")],
    3,
    120,
    ["Penguins can't fly", "Пінгвіни не літають"],
    [
      "`Bird` has a `fly()` method. `Penguin extends Bird` overrides `fly()` to throw. Code that loops over `Bird[]` and calls `fly()` now crashes. What is the best fix?",
      "`Bird` має метод `fly()`. `Penguin extends Bird` перевизначає `fly()` так, що він кидає помилку. Код, що перебирає `Bird[]` і викликає `fly()`, тепер падає. Яке виправлення найкраще?",
    ],
    [
      ["Model abilities separately (e.g. a `Flyer` interface or a composed movement object) so only flying birds promise `fly()`", "Моделювати здібності окремо (наприклад, інтерфейс `Flyer` або вкладений об'єкт руху), щоб лише птахи, які літають, обіцяли `fly()`"],
      ["Wrap every `fly()` call in `try/catch`", "Обгорнути кожен виклик `fly()` у `try/catch`"],
      ["Add `if (bird instanceof Penguin)` checks wherever `fly()` is called", "Додати перевірки `if (bird instanceof Penguin)` всюди, де викликається `fly()`"],
      ["Make `Penguin.fly()` silently do nothing", "Зробити так, щоб `Penguin.fly()` мовчки нічого не робив"],
    ],
    "a",
    [
      "`Penguin` breaks the Liskov substitution principle: it can't stand in for a `Bird` as callers expect. Type checks and empty overrides hide the broken contract instead of fixing it. Splitting the capability out (composition or a narrower interface) means only objects that really fly are passed to code that calls `fly()`.",
      "`Penguin` порушує принцип підстановки Лісков: він не може заступити `Bird` так, як очікують викликачі. Перевірки типу й порожні перевизначення ховають порушений контракт, а не виправляють його. Винесення здібності окремо (композиція або вужчий інтерфейс) означає, що в код, який викликає `fly()`, потрапляють лише об'єкти, що справді літають.",
    ],
  ),
  quiz(
    "oop-own-keys",
    ["oop", w("javascript")],
    4,
    120,
    ["Where methods and fields live", "Де живуть методи й поля"],
    ["What does `Object.keys(new Dog(\"Rex\"))` return?", "Що повертає `Object.keys(new Dog(\"Rex\"))`?"],
    [
      ["`[\"wag\", \"name\"]`", "`[\"wag\", \"name\"]`"],
      ["`[\"name\", \"bark\", \"wag\"]`", "`[\"name\", \"bark\", \"wag\"]`"],
      ["`[\"name\"]`", "`[\"name\"]`"],
      ["`[\"name\", \"wag\"]`", "`[\"name\", \"wag\"]`"],
    ],
    "a",
    [
      "Methods such as `bark` are defined on `Dog.prototype` and shared, so they're not own keys. Class fields, including the arrow-function field `wag`, are created on each instance, and in a base class they're initialised right before the constructor body runs, which is why `wag` comes before `name`.",
      "Методи на кшталт `bark` визначені в `Dog.prototype` і спільні, тож не є власними ключами. Поля класу, зокрема поле-стрілочна функція `wag`, створюються в кожному екземплярі, а в базовому класі ініціалізуються безпосередньо перед тілом конструктора, тому `wag` іде перед `name`.",
    ],
    { code: "class Dog {\n  wag = () => \"wag\";\n  constructor(name) {\n    this.name = name;\n  }\n  bark() {\n    return \"woof\";\n  }\n}", codeLanguage: "js" },
  ),
  quiz(
    "oop-fragile-base",
    ["oop"],
    5,
    150,
    ["The fragile base class", "Крихкий базовий клас"],
    ["What is `list.count` after this runs?", "Чому дорівнює `list.count` після виконання?"],
    [
      ["`6`", "`6`"],
      ["`3`", "`3`"],
      ["`0`", "`0`"],
      ["`4`", "`4`"],
    ],
    "a",
    [
      "`CountingList.addAll` adds 3, then calls `super.addAll`, which calls `this.add` for each item, and `this.add` is the overridden, counting version: 3 more. The subclass silently depends on how the parent implements `addAll`. That's the fragile base class problem; wrapping a list (composition) and delegating avoids it.",
      "`CountingList.addAll` додає 3, потім викликає `super.addAll`, який для кожного елемента викликає `this.add`, а `this.add` є перевизначеною версією з підрахунком: ще 3. Підклас непомітно залежить від того, як батько реалізує `addAll`. Це проблема крихкого базового класу; обгортання списку (композиція) з делегуванням її уникає.",
    ],
    {
      code: "class List {\n  items = [];\n  add(x) { this.items.push(x); }\n  addAll(xs) { xs.forEach((x) => this.add(x)); }\n}\nclass CountingList extends List {\n  count = 0;\n  add(x) { this.count++; super.add(x); }\n  addAll(xs) { this.count += xs.length; super.addAll(xs); }\n}\nconst list = new CountingList();\nlist.addAll([1, 2, 3]);",
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "oop-bank-account",
    skills: ["oop", w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Encapsulated bank accounts", "Інкапсульовані банківські рахунки"],
    prompt: [
      "Refactor `src/account.ts` so accounts protect their own invariants:\n\n**`Account`**\n- Keep the balance and history in `#private` fields. `balance` is a **read-only** getter; `history` returns a **copy** of the entries.\n- `deposit` / `withdraw` throw a `RangeError` unless the amount is a positive, finite number.\n- `withdraw` throws (and changes nothing) when there isn't enough money.\n- Give subclasses two `protected` hooks: `canWithdraw(amount)` and a single method that changes the balance and records the entry.\n\n**`SavingsAccount(owner, rate)`**: `addInterest()` adds `balance × rate`, rounded to cents, as an `\"interest\"` entry.\n\n**`CheckingAccount(owner, overdraft)`**: may go negative, down to `-overdraft`, by overriding `canWithdraw`.\n\nRound balances to cents to avoid floating-point noise.",
      "Переробіть `src/account.ts`, щоб рахунки самі захищали свої інваріанти:\n\n**`Account`**\n- Зберігайте баланс та історію в полях `#private`. `balance` є гетером **лише для читання**; `history` повертає **копію** записів.\n- `deposit` / `withdraw` кидають `RangeError`, якщо сума не є додатним скінченним числом.\n- `withdraw` кидає помилку (і нічого не змінює), коли грошей недостатньо.\n- Дайте підкласам два `protected` хуки: `canWithdraw(amount)` і єдиний метод, що змінює баланс і записує операцію.\n\n**`SavingsAccount(owner, rate)`**: `addInterest()` додає `balance × rate`, округлене до копійок, як запис `\"interest\"`.\n\n**`CheckingAccount(owner, overdraft)`**: може йти в мінус до `-overdraft`, перевизначаючи `canWithdraw`.\n\nОкруглюйте баланс до копійок, щоб уникнути похибок чисел з рухомою комою.",
    ],
    files: { "/src/account.ts": ACCOUNT_STARTER, "/index.ts": ACCOUNT_INDEX },
    visibleFiles: ["/src/account.ts", "/index.ts"],
    activeFile: "/src/account.ts",
    tests: ACCOUNT_TESTS,
    solution: { "/src/account.ts": ACCOUNT_SOLUTION },
    explanation: [
      "`#balance` and `#history` can only change through the class's own methods, so validation can't be bypassed. A getter without a setter makes `balance` read-only, and returning copies stops callers from editing the ledger. Subclasses don't touch private state: they override the `canWithdraw` rule and use the protected `apply` method, which keeps balance and history consistent in one place.",
      "`#balance` і `#history` можуть змінюватися лише через методи самого класу, тож обійти валідацію неможливо. Гетер без сетера робить `balance` доступним лише для читання, а повернення копій не дає викликачам редагувати журнал. Підкласи не чіпають приватний стан: вони перевизначають правило `canWithdraw` і користуються захищеним методом `apply`, що тримає баланс та історію узгодженими в одному місці.",
    ],
  }),
  practice({
    slug: "oop-shapes",
    skills: ["oop", w("typescript")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Polymorphic shapes", "Поліморфні фігури"],
    prompt: [
      "Complete the shape hierarchy in `src/shapes.ts`:\n\n- `Circle`, `Rectangle` and `Square` compute `area()` and `perimeter()`. `Square(side)` **is a** `Rectangle`.\n- Constructors throw a `RangeError` for dimensions that aren't positive finite numbers.\n- `describe()` is implemented **once**, in `Shape`, and returns `\"<ClassName> area=<area> perimeter=<perimeter>\"` with 2 decimals, e.g. `\"Square area=4.00 perimeter=8.00\"`.\n- `Shape` is abstract: `new Shape()` must throw even when TypeScript is bypassed with a cast.\n- `largest(shapes)` returns the shape with the biggest area, or `undefined` for an empty list.",
      "Допишіть ієрархію фігур у `src/shapes.ts`:\n\n- `Circle`, `Rectangle` і `Square` обчислюють `area()` і `perimeter()`. `Square(side)` **є** `Rectangle`.\n- Конструктори кидають `RangeError` для розмірів, що не є додатними скінченними числами.\n- `describe()` реалізовано **один раз**, у `Shape`, і він повертає `\"<ClassName> area=<area> perimeter=<perimeter>\"` з 2 знаками після коми, наприклад `\"Square area=4.00 perimeter=8.00\"`.\n- `Shape` абстрактний: `new Shape()` має кидати помилку, навіть якщо TypeScript обійдено приведенням типу.\n- `largest(shapes)` повертає фігуру з найбільшою площею або `undefined` для порожнього списку.",
    ],
    files: { "/src/shapes.ts": SHAPES_STARTER, "/index.ts": SHAPES_INDEX },
    visibleFiles: ["/src/shapes.ts", "/index.ts"],
    activeFile: "/src/shapes.ts",
    tests: SHAPES_TESTS,
    solution: { "/src/shapes.ts": SHAPES_SOLUTION },
    explanation: [
      "`describe` lives only on `Shape.prototype` and calls `this.area()` and `this.perimeter()`, which resolve to each subclass's override at runtime. `abstract` disappears after compilation, so a `new.target === Shape` check enforces it at runtime. `Square` reuses `Rectangle` by passing the side twice to `super`.",
      "`describe` живе лише в `Shape.prototype` і викликає `this.area()` і `this.perimeter()`, які під час виконання ведуть до перевизначень кожного підкласу. `abstract` зникає після компіляції, тож перевірка `new.target === Shape` забезпечує його під час виконання. `Square` повторно використовує `Rectangle`, передаючи сторону двічі в `super`.",
    ],
  }),
]);
