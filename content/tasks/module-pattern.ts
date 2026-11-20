import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const SESSIONS_STARTER = String.raw`export type Session = Readonly<{ id: string; userId: string; createdAt: number; expiresAt: number }>;

export type SessionOptions = { ttlMs?: number; now?: () => number; generateId?: () => string };

/**
 * A session store with private state. Only the returned methods can touch the sessions,
 * and nothing returned to callers can be used to change them.
 */
export function createSessionManager({ ttlMs = 30 * 60_000, now = () => Date.now(), generateId = () => crypto.randomUUID() }: SessionOptions = {}) {
  // TODO: the map is public, sessions are returned by reference, and nothing expires
  const sessions = new Map<string, any>();
  return {
    sessions,
    create(userId: string) {
      const session = { id: generateId(), userId, createdAt: now(), expiresAt: now() + ttlMs };
      sessions.set(session.id, session);
      return session;
    },
    get: (id: string) => sessions.get(id),
    touch: (id: string) => sessions.has(id),
    revoke: (id: string) => sessions.delete(id),
    revokeAll: (userId: string) => 0,
    activeCount: () => sessions.size,
    sessionsFor: (userId: string) => [...sessions.values()].filter((s) => s.userId === userId),
  };
}
`;

const SESSIONS_SOLUTION = String.raw`export type Session = Readonly<{ id: string; userId: string; createdAt: number; expiresAt: number }>;

export type SessionOptions = { ttlMs?: number; now?: () => number; generateId?: () => string };

type Stored = { id: string; userId: string; createdAt: number; expiresAt: number };

export function createSessionManager({ ttlMs = 30 * 60_000, now = () => Date.now(), generateId = () => crypto.randomUUID() }: SessionOptions = {}) {
  // Private: only the closures below can reach it.
  const sessions = new Map<string, Stored>();

  // Callers get frozen copies, never the stored objects.
  const snapshot = (s: Stored): Session => Object.freeze({ ...s });
  const alive = (s: Stored) => s.expiresAt > now();
  const purge = () => {
    for (const [id, s] of sessions) if (!alive(s)) sessions.delete(id);
  };

  return Object.freeze({
    create(userId: string): Session {
      if (typeof userId !== "string" || userId === "") throw new TypeError("userId is required");
      const t = now();
      const session: Stored = { id: generateId(), userId, createdAt: t, expiresAt: t + ttlMs };
      sessions.set(session.id, session);
      return snapshot(session);
    },
    get(id: string): Session | undefined {
      const s = sessions.get(id);
      if (!s) return undefined;
      if (!alive(s)) {
        sessions.delete(id);
        return undefined;
      }
      return snapshot(s);
    },
    touch(id: string): boolean {
      const s = sessions.get(id);
      if (!s || !alive(s)) {
        sessions.delete(id);
        return false;
      }
      s.expiresAt = now() + ttlMs;
      return true;
    },
    revoke(id: string): boolean {
      return sessions.delete(id);
    },
    revokeAll(userId: string): number {
      let count = 0;
      for (const [id, s] of sessions) {
        if (s.userId === userId) {
          sessions.delete(id);
          count++;
        }
      }
      return count;
    },
    activeCount(): number {
      purge();
      return sessions.size;
    },
    sessionsFor(userId: string): Session[] {
      purge();
      return [...sessions.values()].filter((s) => s.userId === userId).map(snapshot);
    },
  });
}
`;

const SESSIONS_INDEX = String.raw`import "./styles.css";
import { createSessionManager } from "./src/sessions";

let t = 0;
let n = 0;
const manager = createSessionManager({ ttlMs: 1000, now: () => t, generateId: () => "s" + ++n });
const lines: string[] = [];
try {
  const a = manager.create("ada");
  manager.create("ada");
  manager.create("bob");
  lines.push("public keys: " + Object.keys(manager).join(", "));
  try {
    (a as any).userId = "mallory";
  } catch {
    lines.push("can't modify a returned session");
  }
  lines.push("stored user: " + manager.get(a.id)?.userId);
  t = 1500;
  lines.push("active after expiry: " + manager.activeCount());
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Sessions</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const SESSIONS_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createSessionManager } from "../src/sessions";

function setup(ttlMs = 1000) {
  const clock = { t: 0 };
  let n = 0;
  const manager = createSessionManager({ ttlMs, now: () => clock.t, generateId: () => "s" + ++n });
  return { manager, clock };
}

describe("createSessionManager", () => {
  it("creates sessions with injected ids and times", () => {
    const { manager, clock } = setup();
    clock.t = 100;
    expect(manager.create("ada")).toEqual({ id: "s1", userId: "ada", createdAt: 100, expiresAt: 1100 });
    expect(() => manager.create("")).toThrow(TypeError);
  });
  it("exposes only methods, and nothing else", () => {
    const { manager } = setup();
    manager.create("ada");
    expect(Object.keys(manager).sort()).toEqual(["activeCount", "create", "get", "revoke", "revokeAll", "sessionsFor", "touch"]);
    expect(JSON.stringify(manager)).toBe("{}");
    expect(Object.isFrozen(manager)).toBe(true);
  });
  it("never hands out its internal objects", () => {
    const { manager } = setup();
    const session = manager.create("ada");
    expect(Object.isFrozen(session)).toBe(true);
    expect(() => { session.userId = "mallory"; }).toThrow(TypeError);
    const fetched = manager.get("s1");
    expect(fetched).not.toBe(manager.get("s1"));
    const list = manager.sessionsFor("ada");
    list.length = 0;
    expect(manager.sessionsFor("ada").length).toBe(1);
  });
  it("expires sessions, and touch extends them", () => {
    const { manager, clock } = setup(1000);
    manager.create("ada");
    manager.create("bob");
    clock.t = 800;
    expect(manager.touch("s1")).toBe(true);
    clock.t = 1200;
    expect(manager.get("s1").expiresAt).toBe(1800);
    expect(manager.get("s2")).toBeUndefined();
    expect(manager.touch("s2")).toBe(false);
    expect(manager.activeCount()).toBe(1);
  });
  it("revokes one or all of a user's sessions", () => {
    const { manager } = setup();
    manager.create("ada");
    manager.create("ada");
    manager.create("bob");
    expect(manager.revoke("s3")).toBe(true);
    expect(manager.revoke("s3")).toBe(false);
    expect(manager.revokeAll("ada")).toBe(2);
    expect(manager.activeCount()).toBe(0);
  });
  it("keeps instances independent", () => {
    const a = setup().manager;
    const b = setup().manager;
    a.create("ada");
    expect(b.activeCount()).toBe(0);
  });
});
`;

const ACCOUNT_STARTER = String.raw`export interface Account {
  deposit(amount: number): number;
  withdraw(amount: number): number;
  getBalance(): number;
  /** Moves money to another account of the same implementation. */
  transfer(to: Account, amount: number): void;
}

// TODO: the balance is a public property in all three, nothing is validated,
// and transfer accepts anything with a deposit method.

export function createClosureAccount(initial = 0): Account & { balance: number } {
  const account = {
    balance: initial,
    deposit(amount: number) { return (account.balance += amount); },
    withdraw(amount: number) { return (account.balance -= amount); },
    getBalance() { return account.balance; },
    transfer(to: Account, amount: number) { account.withdraw(amount); to.deposit(amount); },
  };
  return account;
}

export class PrivateFieldAccount implements Account {
  balance: number;
  constructor(initial = 0) { this.balance = initial; }
  deposit(amount: number) { return (this.balance += amount); }
  withdraw(amount: number) { return (this.balance -= amount); }
  getBalance() { return this.balance; }
  transfer(to: Account, amount: number) { this.withdraw(amount); to.deposit(amount); }
}

export class WeakMapAccount implements Account {
  balance: number;
  constructor(initial = 0) { this.balance = initial; }
  deposit(amount: number) { return (this.balance += amount); }
  withdraw(amount: number) { return (this.balance -= amount); }
  getBalance() { return this.balance; }
  transfer(to: Account, amount: number) { this.withdraw(amount); to.deposit(amount); }
}
`;

const ACCOUNT_SOLUTION = String.raw`export interface Account {
  deposit(amount: number): number;
  withdraw(amount: number): number;
  getBalance(): number;
  transfer(to: Account, amount: number): void;
}

function checkAmount(amount: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) throw new RangeError("Amount must be a positive number");
}
function checkInitial(initial: number) {
  if (typeof initial !== "number" || !Number.isFinite(initial) || initial < 0) throw new RangeError("Initial balance can't be negative");
}

// 1. Closures: the balance lives in the factory's scope. A module-level WeakSet brands real accounts.
const closureAccounts = new WeakSet<object>();

export function createClosureAccount(initial = 0): Account {
  checkInitial(initial);
  let balance = initial;
  const account: Account = Object.freeze({
    deposit(amount: number) {
      checkAmount(amount);
      return (balance += amount);
    },
    withdraw(amount: number) {
      checkAmount(amount);
      if (amount > balance) throw new RangeError("Insufficient funds");
      return (balance -= amount);
    },
    getBalance: () => balance,
    transfer(to: Account, amount: number) {
      if (!closureAccounts.has(to)) throw new TypeError("Can only transfer to another closure account");
      account.withdraw(amount); // throws before anything changes
      to.deposit(amount);
    },
  });
  closureAccounts.add(account);
  return account;
}

// 2. #private fields: class code can read #balance on any instance of the same class.
export class PrivateFieldAccount implements Account {
  #balance: number;
  constructor(initial = 0) {
    checkInitial(initial);
    this.#balance = initial;
  }
  deposit(amount: number) {
    checkAmount(amount);
    return (this.#balance += amount);
  }
  withdraw(amount: number) {
    checkAmount(amount);
    if (amount > this.#balance) throw new RangeError("Insufficient funds");
    return (this.#balance -= amount);
  }
  getBalance() {
    return this.#balance;
  }
  transfer(to: Account, amount: number) {
    if (!(to instanceof PrivateFieldAccount) || !PrivateFieldAccount.#isReal(to)) {
      throw new TypeError("Can only transfer to another PrivateFieldAccount");
    }
    this.withdraw(amount);
    to.#balance += amount;
  }
  static #isReal(value: object) {
    try {
      (value as PrivateFieldAccount).#balance; // brand check: throws if the field isn't there
      return true;
    } catch {
      return false;
    }
  }
}

// 3. A WeakMap keyed by instance, visible only inside this module.
const balances = new WeakMap<object, number>();

export class WeakMapAccount implements Account {
  constructor(initial = 0) {
    checkInitial(initial);
    balances.set(this, initial);
  }
  deposit(amount: number) {
    checkAmount(amount);
    const next = balances.get(this)! + amount;
    balances.set(this, next);
    return next;
  }
  withdraw(amount: number) {
    checkAmount(amount);
    const current = balances.get(this)!;
    if (amount > current) throw new RangeError("Insufficient funds");
    balances.set(this, current - amount);
    return current - amount;
  }
  getBalance() {
    return balances.get(this)!;
  }
  transfer(to: Account, amount: number) {
    if (!balances.has(to)) throw new TypeError("Can only transfer to another WeakMapAccount");
    this.withdraw(amount);
    balances.set(to, balances.get(to)! + amount);
  }
}
`;

const ACCOUNT_INDEX = String.raw`import "./styles.css";
import { PrivateFieldAccount, WeakMapAccount, createClosureAccount } from "./src/accounts";

const lines: string[] = [];
const make = { closure: () => createClosureAccount(4321), "#private": () => new PrivateFieldAccount(4321), WeakMap: () => new WeakMapAccount(4321) };
for (const [name, create] of Object.entries(make)) {
  try {
    const acc: any = create();
    lines.push(name.padEnd(9) + " keys: " + JSON.stringify(Object.keys(acc)) + "  json: " + JSON.stringify(acc) + "  balance: " + acc.getBalance());
  } catch (e) {
    lines.push(name + " error: " + (e as Error).message);
  }
}
document.getElementById("app")!.innerHTML = '<h1>Private state</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const ACCOUNT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { PrivateFieldAccount, WeakMapAccount, createClosureAccount } from "../src/accounts";

const implementations = [
  ["closure", (b) => createClosureAccount(b)],
  ["#private", (b) => new PrivateFieldAccount(b)],
  ["WeakMap", (b) => new WeakMapAccount(b)],
];

for (const [name, make] of implementations) {
  describe(name + " account", () => {
    it("deposits and withdraws", () => {
      const acc = make(100);
      expect(acc.deposit(50)).toBe(150);
      expect(acc.withdraw(30)).toBe(120);
      expect(acc.getBalance()).toBe(120);
    });
    it("validates amounts and the initial balance", () => {
      const acc = make(10);
      expect(() => acc.deposit(-5)).toThrow(RangeError);
      expect(() => acc.deposit(NaN)).toThrow(RangeError);
      expect(() => acc.withdraw(0)).toThrow(RangeError);
      expect(() => acc.withdraw(11)).toThrow("Insufficient funds");
      expect(acc.getBalance()).toBe(10);
      expect(() => make(-1)).toThrow(RangeError);
    });
    it("hides the balance from every kind of inspection", () => {
      const acc = make(4321);
      expect(JSON.stringify(acc)).not.toContain("4321");
      expect(Reflect.ownKeys(acc).some((key) => acc[key] === 4321)).toBe(false);
      expect(Object.getOwnPropertySymbols(acc).length).toBe(0);
      try {
        acc.balance = 1e9;
      } catch {
        /* frozen objects throw in strict mode */
      }
      expect(acc.getBalance()).toBe(4321);
    });
    it("transfers between accounts of the same kind, atomically", () => {
      const a = make(100);
      const b = make(5);
      a.transfer(b, 40);
      expect([a.getBalance(), b.getBalance()]).toEqual([60, 45]);
      expect(() => a.transfer(b, 1000)).toThrow("Insufficient funds");
      expect([a.getBalance(), b.getBalance()]).toEqual([60, 45]);
    });
    it("refuses look-alike or foreign accounts", () => {
      const a = make(100);
      const fake = { deposit: () => 0, withdraw: () => 0, getBalance: () => 0, transfer() {} };
      expect(() => a.transfer(fake, 10)).toThrow(TypeError);
      const other = implementations.find(([n]) => n !== name)[1](0);
      expect(() => a.transfer(other, 10)).toThrow(TypeError);
      expect(a.getBalance()).toBe(100);
    });
  });
}
`;

export default defineTasks([
  quiz(
    "mod-iife-private",
    ["module-pattern", w("closures-scope")],
    1,
    60,
    ["State inside an IIFE", "Стан усередині IIFE"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 undefined`", "`2 undefined`"],
      ["`1 number`", "`1 number`"],
      ["`2 number`", "`2 number`"],
      ["A `ReferenceError`: count is not defined", "`ReferenceError`: count is not defined"],
    ],
    "a",
    [
      "The IIFE runs once and returns an object whose method closes over `count`. The variable lives on in that closure (so the second call returns 2), but it's not reachable from outside: `typeof count` sees no such name in this scope (and `typeof` doesn't throw for undeclared names). That's the whole module pattern: private state, public methods.",
      "IIFE виконується один раз і повертає об'єкт, чий метод замикає `count`. Змінна продовжує жити в цьому замиканні (тож другий виклик повертає 2), але ззовні до неї не дістатися: `typeof count` не бачить такого імені в цій області (а `typeof` не кидає помилку для неоголошених імен). У цьому й полягає весь шаблон модуля: приватний стан, публічні методи.",
    ],
    { code: "const counter = (function () {\n  let count = 0;\n  return {\n    inc() {\n      return ++count;\n    },\n  };\n})();\ncounter.inc();\nconsole.log(counter.inc(), typeof count);", codeLanguage: "js" },
  ),
  quiz(
    "mod-iife-forms",
    ["module-pattern"],
    2,
    75,
    ["Valid IIFE syntax", "Коректний синтаксис IIFE"],
    ["Which of these are valid immediately invoked function expressions?", "Що з цього є коректними функціональними виразами, що викликаються одразу?"],
    [
      ["`(function () { … })();`", "`(function () { … })();`"],
      ["`(function () { … }());`", "`(function () { … }());`"],
      ["`!function () { … }();`", "`!function () { … }();`"],
      ["`function () { … }();`", "`function () { … }();`"],
    ],
    "abc",
    [
      "At the start of a statement, `function` begins a function **declaration**, which needs a name and can't be called in place, so the last form is a `SyntaxError`. Anything that puts the parser in expression position works: wrapping parentheses (either placement) or a unary operator like `!` or `void`. Arrow functions need the parentheses: `(() => { … })()`.",
      "На початку інструкції `function` починає **оголошення** функції, що потребує імені й не може бути викликане на місці, тож остання форма є `SyntaxError`. Працює все, що переводить розбирач у позицію виразу: дужки навколо (будь-яке розташування) чи унарний оператор на кшталт `!` або `void`. Стрілочні функції потребують дужок: `(() => { … })()`.",
    ],
  ),
  quiz(
    "mod-singleton-vs-factory",
    ["module-pattern"],
    2,
    75,
    ["A singleton and a factory", "Синглтон і фабрика"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`3 2 1`", "`3 2 1`"],
      ["`3 3 3`", "`3 3 3`"],
      ["`1 1 1`", "`1 1 1`"],
      ["`3 2 2`", "`3 2 2`"],
    ],
    "a",
    [
      "The IIFE runs once, so `shared` is a single instance with one `n` (a singleton). `create` is the same pattern without the immediate call: every call creates a new scope with its own `n`, so `a` and `b` count independently. Choose a factory whenever you might need more than one instance, for example per user, per request, or per test.",
      "IIFE виконується один раз, тож `shared` є єдиним екземпляром з одним `n` (синглтоном). `create` є тим самим шаблоном без негайного виклику: кожен виклик створює нову область видимості з власним `n`, тож `a` і `b` рахують незалежно. Обирайте фабрику завжди, коли може знадобитися більше одного екземпляра, наприклад для кожного користувача, запиту чи тесту.",
    ],
    { code: "const shared = (() => {\n  let n = 0;\n  return { inc: () => ++n };\n})();\nconst create = () => {\n  let n = 0;\n  return { inc: () => ++n };\n};\nconst a = create();\nconst b = create();\nshared.inc();\nshared.inc();\na.inc();\nconsole.log(shared.inc(), a.inc(), b.inc());", codeLanguage: "js" },
  ),
  quiz(
    "mod-revealing-patch",
    ["module-pattern", w("unit-testing", 0.3)],
    3,
    90,
    ["Patching a revealing module", "Заміна методу в revealing module"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1 99`", "`1 99`"],
      ["`99 99`", "`99 99`"],
      ["`1 1`", "`1 1`"],
      ["A `TypeError`: cannot assign to total", "`TypeError`: cannot assign to total"],
    ],
    "a",
    [
      "The revealing module returns references to its private functions, but `add` calls the **private** `total` directly, not `cart.total`. Replacing the public property only changes what outside callers see. It's a known drawback of the pattern when you try to stub methods in tests; inject dependencies instead, or call through the public object if overriding is intended.",
      "Revealing module повертає посилання на свої приватні функції, але `add` викликає **приватну** `total` напряму, а не `cart.total`. Заміна публічної властивості змінює лише те, що бачать зовнішні виклики. Це відомий недолік шаблону, коли намагаєтеся підмінити методи в тестах; натомість впроваджуйте залежності або викликайте через публічний об'єкт, якщо перевизначення задумане.",
    ],
    { code: 'const cart = (() => {\n  const items = [];\n  function add(item) {\n    items.push(item);\n    return total();\n  }\n  function total() {\n    return items.length;\n  }\n  return { add, total };\n})();\ncart.total = () => 99;\nconsole.log(cart.add("apple"), cart.total());', codeLanguage: "js" },
  ),
  quiz(
    "mod-leaking-internals",
    ["module-pattern", w("immutability-copying")],
    2,
    75,
    ["Returning internal state", "Повернення внутрішнього стану"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'a', 'x' ]`", "`[ 'a', 'x' ]`"],
      ["`[ 'a' ]`", "`[ 'a' ]`"],
      ["A `TypeError`: the array is private", "`TypeError`: масив приватний"],
      ["`[ 'x' ]`", "`[ 'x' ]`"],
    ],
    "a",
    [
      "`items` is private, but `all()` returns **the same array**, so any caller can mutate the module's internal state and skip every check `add` might do. Encapsulation leaks through returned references. Return a copy (`[...items]`), a frozen copy, or an iterator.",
      "`items` приватний, але `all()` повертає **той самий масив**, тож будь-хто може змінити внутрішній стан модуля й оминути всі перевірки, які могла б робити `add`. Інкапсуляція протікає через повернені посилання. Повертайте копію (`[...items]`), заморожену копію чи ітератор.",
    ],
    { code: 'function createTodos() {\n  const items = [];\n  return {\n    add(text) {\n      items.push(text);\n    },\n    all() {\n      return items;\n    },\n  };\n}\nconst todos = createTodos();\ntodos.add("a");\ntodos.all().push("x");\nconsole.log(todos.all());', codeLanguage: "js" },
  ),
  quiz(
    "mod-weakmap-private",
    ["module-pattern", w("js-collections")],
    3,
    90,
    ["Private data in a WeakMap", "Приватні дані у WeakMap"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`10 [] {} 0`", "`10 [] {} 0`"],
      ["`10 [ 'balance' ] {\"balance\":10} 1`", "`10 [ 'balance' ] {\"balance\":10} 1`"],
      ["`undefined [] {} 0`", "`undefined [] {} 0`"],
      ["`10 [] {} 1`", "`10 [] {} 1`"],
    ],
    "a",
    [
      "The data lives in a `WeakMap` keyed by the instance, so the object itself has **no own properties** at all: nothing for `Object.keys`, `JSON.stringify` or `Reflect.ownKeys` to find. Only code that can see `priv` (this module) can read it, and because the map holds keys weakly, discarded instances can still be garbage-collected. This was the standard privacy technique before `#private` fields.",
      "Дані живуть у `WeakMap` з ключем-екземпляром, тож сам об'єкт узагалі **не має власних властивостей**: `Object.keys`, `JSON.stringify` і `Reflect.ownKeys` нічого не знаходять. Прочитати їх може лише код, що бачить `priv` (цей модуль), а оскільки мапа тримає ключі слабко, непотрібні екземпляри все одно можна прибрати збирачем сміття. Це була стандартна техніка приватності до появи полів `#private`.",
    ],
    {
      code: "const priv = new WeakMap();\nclass Account {\n  constructor(balance) {\n    priv.set(this, { balance });\n  }\n  get balance() {\n    return priv.get(this).balance;\n  }\n}\nconst acc = new Account(10);\nconsole.log(acc.balance, Object.keys(acc), JSON.stringify(acc), Reflect.ownKeys(acc).length);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "mod-symbol-not-private",
    ["module-pattern", w("js-metaprogramming")],
    2,
    60,
    ["Are symbol keys private?", "Чи приватні ключі-символи?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`42 0`", "`42 0`"],
      ["`undefined 0`", "`undefined 0`"],
      ["`42 1`", "`42 1`"],
      ["A `TypeError`: symbols are private", "`TypeError`: символи приватні"],
    ],
    "a",
    [
      "Symbol-keyed properties are hidden from `Object.keys`, `for…in` and JSON, but anyone can list them with `Object.getOwnPropertySymbols` (or `Reflect.ownKeys`) and read them. They prevent accidental clashes and casual access, not deliberate access. For real privacy use closures, `#private` fields or a module-scoped `WeakMap`.",
      "Властивості з ключами-символами приховані від `Object.keys`, `for…in` і JSON, але будь-хто може перелічити їх через `Object.getOwnPropertySymbols` (чи `Reflect.ownKeys`) і прочитати. Вони запобігають випадковим конфліктам і побіжному доступу, а не навмисному. Для справжньої приватності використовуйте замикання, поля `#private` чи `WeakMap` в області видимості модуля.",
    ],
    { code: 'const secret = Symbol("secret");\nconst obj = { [secret]: 42 };\nconst [key] = Object.getOwnPropertySymbols(obj);\nconsole.log(obj[key], Object.keys(obj).length);', codeLanguage: "js" },
  ),
  quiz(
    "mod-detached-methods",
    ["module-pattern", w("this-prototypes")],
    2,
    75,
    ["Passing methods around", "Передавання методів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 'TypeError' ]`", "`[ 1, 'TypeError' ]`"],
      ["`[ 1, 1 ]`", "`[ 1, 1 ]`"],
      ["`[ 'TypeError', 'TypeError' ]`", "`[ 'TypeError', 'TypeError' ]`"],
      ["`[ 1, NaN ]`", "`[ 1, NaN ]`"],
    ],
    "a",
    [
      "The factory's method uses a closure variable, not `this`, so it keeps working when detached and passed around as a callback. The class method relies on `this`; called without a receiver (in strict class code) `this` is `undefined`, and reading `this.n` throws a `TypeError`. That's one practical advantage of the module/factory pattern, at the cost of a method copy per instance.",
      "Метод фабрики використовує змінну замикання, а не `this`, тож продовжує працювати, коли його від'єднують і передають як колбек. Метод класу покладається на `this`; без отримувача (у строгому коді класу) `this` дорівнює `undefined`, і читання `this.n` кидає `TypeError`. Це одна з практичних переваг шаблону модуля/фабрики, ціною копії методу для кожного екземпляра.",
    ],
    {
      code: "function createCounter() {\n  let n = 0;\n  return {\n    inc() {\n      return ++n;\n    },\n  };\n}\nclass Counter {\n  n = 0;\n  inc() {\n    return ++this.n;\n  }\n}\nconst f = createCounter().inc;\nconst c = new Counter().inc;\nconst out = [f()];\ntry {\n  out.push(c());\n} catch (e) {\n  out.push(e.name);\n}\nconsole.log(out);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "mod-esm-singleton-server",
    ["module-pattern", w("es-modules"), w("nodejs")],
    3,
    90,
    ["Module-level state on a server", "Стан рівня модуля на сервері"],
    [
      "A Node.js API has `cart.js` with `const items = []; export function addToCart(item) { items.push(item); } export function getCart() { return items; }`, used by request handlers. What's wrong?",
      "API на Node.js має `cart.js` з `const items = []; export function addToCart(item) { items.push(item); } export function getCart() { return items; }`, що використовують обробники запитів. Що не так?",
    ],
    [
      ["A module is evaluated once per process, so every request and every user shares one `items` array: users see each other's carts", "Модуль обчислюється один раз на процес, тож кожен запит і кожен користувач ділять один масив `items`: користувачі бачать кошики одне одного"],
      ["Each import gets its own copy of `items`, so the cart is always empty", "Кожен імпорт отримує власну копію `items`, тож кошик завжди порожній"],
      ["ES modules can't contain mutable state", "ES-модулі не можуть містити змінний стан"],
      ["Nothing, as long as the server runs a single process", "Нічого, якщо сервер працює в одному процесі"],
    ],
    "a",
    [
      "Module scope is a natural singleton: the module body runs once, and every importer shares the same bindings. That's fine for configuration or caches of public data, but per-user state on a server leaks between requests (and is lost on restart or split across instances). Keep per-request state in a factory instance, the request context, or a database or session store.",
      "Область видимості модуля є природним синглтоном: тіло модуля виконується один раз, і всі, хто імпортує, ділять ті самі зв'язування. Це прийнятно для конфігурації чи кешів публічних даних, але стан окремого користувача на сервері протікає між запитами (а ще губиться після перезапуску чи розділяється між екземплярами). Тримайте стан запиту в екземплярі фабрики, контексті запиту чи базі даних або сховищі сесій.",
    ],
  ),
  quiz(
    "mod-cjs-wrapper",
    ["module-pattern", w("nodejs")],
    3,
    90,
    ["What Node does with a CommonJS file", "Що Node робить із файлом CommonJS"],
    ["Why are top-level variables in a CommonJS module private to that file, and where do `require`, `module` and `__dirname` come from?", "Чому змінні верхнього рівня в модулі CommonJS приватні для цього файлу і звідки беруться `require`, `module` і `__dirname`?"],
    [
      ["Node wraps the file's code in a function `(exports, require, module, __filename, __dirname) => { … }` and calls it once: the module pattern, applied for you", "Node загортає код файлу у функцію `(exports, require, module, __filename, __dirname) => { … }` і викликає її один раз: шаблон модуля, застосований за вас"],
      ["They're globals that Node creates for each file", "Це глобальні змінні, які Node створює для кожного файлу"],
      ["The V8 engine gives every file a separate global object", "Рушій V8 дає кожному файлу окремий глобальний об'єкт"],
      ["`var` declarations are automatically converted to `let`", "Оголошення `var` автоматично перетворюються на `let`"],
    ],
    "a",
    [
      "Node's CommonJS loader wraps each file in a function, so top-level declarations are local to that function's scope, and the module's tools arrive as parameters. The wrapper runs once and the result (`module.exports`) is cached, which is why modules behave like singletons and why `this` at the top level of a CommonJS file is `module.exports`. ES modules get the same isolation natively from the language.",
      "Завантажувач CommonJS у Node загортає кожен файл у функцію, тож оголошення верхнього рівня локальні для області видимості цієї функції, а інструменти модуля приходять параметрами. Обгортка виконується один раз, а результат (`module.exports`) кешується, тому модулі поводяться як синглтони, а `this` на верхньому рівні файлу CommonJS дорівнює `module.exports`. ES-модулі отримують ту саму ізоляцію нативно від мови.",
    ],
  ),
  practice({
    slug: "mod-session-manager",
    skills: ["module-pattern", w("closures-scope"), w("auth", 0.3)],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A tamper-proof session manager", "Менеджер сесій, захищений від втручання"],
    prompt: [
      "Rewrite `createSessionManager({ ttlMs, now, generateId })` in `src/sessions.ts` as a proper module factory. Its state must be private, and nothing it returns may be usable to change that state:\n\n- The returned API object is **frozen** and exposes only the methods `create`, `get`, `touch`, `revoke`, `revokeAll`, `activeCount` and `sessionsFor`. No map or other internals are reachable (`JSON.stringify(api)` is `\"{}\"`).\n- `create(userId)` returns `{ id, userId, createdAt, expiresAt }` using the injected `generateId` and `now`, and throws a `TypeError` for an empty `userId`.\n- Sessions handed out are **frozen copies**: mutating them throws, and `sessionsFor` returns a fresh array each time.\n- Expired sessions (`expiresAt <= now()`) are invisible: `get` returns `undefined`, `touch` returns `false`, `activeCount` doesn't count them. `touch` extends a live session by `ttlMs` from now.\n- `revoke(id)` returns whether a session was removed; `revokeAll(userId)` returns how many were removed.\n- Separate managers don't share anything.",
      "Перепишіть `createSessionManager({ ttlMs, now, generateId })` у `src/sessions.ts` як правильну фабрику модулів. Її стан має бути приватним, і ніщо з того, що вона повертає, не повинно дозволяти змінити цей стан:\n\n- Повернений об'єкт API **заморожений** і показує лише методи `create`, `get`, `touch`, `revoke`, `revokeAll`, `activeCount` і `sessionsFor`. Жодна мапа чи інші внутрішні деталі недосяжні (`JSON.stringify(api)` дорівнює `\"{}\"`).\n- `create(userId)` повертає `{ id, userId, createdAt, expiresAt }`, використовуючи підмінні `generateId` і `now`, і кидає `TypeError` для порожнього `userId`.\n- Видані сесії є **замороженими копіями**: їхня зміна кидає помилку, а `sessionsFor` щоразу повертає новий масив.\n- Прострочені сесії (`expiresAt <= now()`) невидимі: `get` повертає `undefined`, `touch` повертає `false`, `activeCount` їх не рахує. `touch` подовжує живу сесію на `ttlMs` від поточного моменту.\n- `revoke(id)` повертає, чи сесію видалено; `revokeAll(userId)` повертає, скільки сесій видалено.\n- Окремі менеджери нічого не ділять між собою.",
    ],
    files: { "/src/sessions.ts": SESSIONS_STARTER, "/index.ts": SESSIONS_INDEX },
    visibleFiles: ["/src/sessions.ts", "/index.ts"],
    activeFile: "/src/sessions.ts",
    tests: SESSIONS_TESTS,
    solution: { "/src/sessions.ts": SESSIONS_SOLUTION },
    explanation: [
      "The `Map` lives only in the factory's scope, so the returned methods are the sole way to reach it, and each call to the factory creates an independent store. Encapsulation also has to hold at the **edges**: returning stored objects or arrays would hand out mutable references, so every result is a frozen copy, and the API object itself is frozen so methods can't be swapped. Injecting `now` and `generateId` keeps the module deterministic in tests without exposing any internals.",
      "`Map` живе лише в області видимості фабрики, тож повернені методи є єдиним способом до неї дістатися, а кожен виклик фабрики створює незалежне сховище. Інкапсуляція також має триматися на **межах**: повернення збережених об'єктів чи масивів видало б змінні посилання, тож кожен результат є замороженою копією, а сам об'єкт API заморожений, щоб методи не можна було підмінити. Підміна `now` і `generateId` тримає модуль детермінованим у тестах, не відкриваючи внутрішніх деталей.",
    ],
  }),
  practice({
    slug: "mod-private-account",
    skills: ["module-pattern", w("js-classes"), w("js-collections")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["One account, three privacy techniques", "Один рахунок, три техніки приватності"],
    prompt: [
      "Implement the same bank account three ways in `src/accounts.ts`: `createClosureAccount(initial)` (closure state), `PrivateFieldAccount` (`#private` fields) and `WeakMapAccount` (a module-level `WeakMap`). All three must:\n\n- Support `deposit(amount)` and `withdraw(amount)` (both return the new balance) and `getBalance()`. Amounts must be positive finite numbers, a withdrawal can't exceed the balance (`\"Insufficient funds\"`), and the initial balance can't be negative (all `RangeError`s).\n- Keep the balance invisible: no own property (string or symbol key) holds it, `JSON.stringify` doesn't reveal it, and assigning `acc.balance = …` can't change it.\n- `transfer(to, amount)` works only with **real accounts of the same implementation**. Look-alike objects and accounts from the other implementations throw a `TypeError`, and a failed transfer changes nothing.",
      "Реалізуйте той самий банківський рахунок трьома способами в `src/accounts.ts`: `createClosureAccount(initial)` (стан у замиканні), `PrivateFieldAccount` (поля `#private`) і `WeakMapAccount` (`WeakMap` рівня модуля). Усі три мають:\n\n- Підтримувати `deposit(amount)` і `withdraw(amount)` (обидва повертають новий баланс) і `getBalance()`. Суми мають бути додатними скінченними числами, зняття не може перевищувати баланс (`\"Insufficient funds\"`), а початковий баланс не може бути від'ємним (усе це `RangeError`).\n- Тримати баланс невидимим: жодна власна властивість (з рядковим чи символьним ключем) його не містить, `JSON.stringify` його не показує, а присвоєння `acc.balance = …` не може його змінити.\n- `transfer(to, amount)` працює лише зі **справжніми рахунками тієї самої реалізації**. Схожі об'єкти й рахунки інших реалізацій кидають `TypeError`, а невдалий переказ нічого не змінює.",
    ],
    files: { "/src/accounts.ts": ACCOUNT_STARTER, "/index.ts": ACCOUNT_INDEX },
    visibleFiles: ["/src/accounts.ts", "/index.ts"],
    activeFile: "/src/accounts.ts",
    tests: ACCOUNT_TESTS,
    solution: { "/src/accounts.ts": ACCOUNT_SOLUTION },
    explanation: [
      "Each technique stores the balance somewhere only trusted code can reach: a factory's scope, a class's private slot, or a module-scoped `WeakMap`. The interesting part is `transfer`, which needs to recognise genuine accounts: duck typing would accept any object with a `deposit` method. The closure version brands accounts in a `WeakSet`, the class can read `#balance` on **any** instance of the same class (privacy is per class, not per object) and uses a failed private-field read as a brand check, and the `WeakMap` version checks `balances.has(to)`. Withdrawing first makes transfers atomic, since it's the only step that can fail.",
      "Кожна техніка зберігає баланс там, куди може дістатися лише довірений код: в області видимості фабрики, в приватному слоті класу чи у `WeakMap` в області видимості модуля. Найцікавіша частина є `transfer`, якому треба розпізнавати справжні рахунки: «качина типізація» прийняла б будь-який об'єкт із методом `deposit`. Версія на замиканнях позначає рахунки у `WeakSet`, клас може читати `#balance` у **будь-якому** екземплярі того самого класу (приватність діє на рівні класу, а не об'єкта) і використовує невдале читання приватного поля як перевірку бренду, а версія з `WeakMap` перевіряє `balances.has(to)`. Зняття першим робить перекази атомарними, бо це єдиний крок, що може не вдатися.",
    ],
  }),
]);
