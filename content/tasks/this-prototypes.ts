import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const BIND_STARTER = String.raw`/** Calls fn with this = thisArg, without Function.prototype.call/apply/bind. */
export function myCall<T>(fn: (...args: any[]) => T, thisArg: unknown, ...args: unknown[]): T {
  // TODO
  return fn(...args);
}

/** Like fn.bind(thisArg, ...preset), including what happens with \`new\`. */
export function myBind(fn: (...args: any[]) => any, thisArg: unknown, ...preset: unknown[]) {
  // TODO
  return (...args: unknown[]) => fn(...preset, ...args);
}
`.replace(/\\`/g, "`");

const BIND_SOLUTION = String.raw`export function myCall<T>(fn: (...args: any[]) => T, thisArg: unknown, ...args: unknown[]): T {
  // Default binding: a plain call gives strict-mode functions this === undefined.
  if (thisArg === null || thisArg === undefined) return fn(...args);
  // Implicit binding: temporarily make fn a method of the object, then call it as obj[key]().
  const target = Object(thisArg);
  const key = Symbol("myCall");
  Object.defineProperty(target, key, { value: fn, configurable: true }); // non-enumerable, unique key
  try {
    return target[key](...args);
  } finally {
    delete target[key];
  }
}

export function myBind(fn: (...args: any[]) => any, thisArg: unknown, ...preset: unknown[]) {
  function bound(...args: unknown[]) {
    // new beats bind: construct a real instance of fn and ignore thisArg.
    if (new.target) return new (fn as any)(...preset, ...args);
    return myCall(fn, thisArg, ...preset, ...args);
  }
  Object.defineProperty(bound, "name", { value: "bound " + fn.name });
  return bound;
}
`;

const BIND_INDEX = String.raw`import "./styles.css";
import { myBind, myCall } from "./src/bind";

function introduce(this: { name: string }, greeting: string) {
  return greeting + ", I'm " + this.name;
}
let text: string;
try {
  const ada = { name: "Ada" };
  text = myCall(introduce, ada, "Hello") + " / " + myBind(introduce, ada, "Hi")();
} catch (e) {
  text = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>call and bind</h1><p><output id="out"></output></p>';
document.getElementById("out")!.textContent = text;
`;

const BIND_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { myBind, myCall } from "../src/bind";

function describeSelf(greeting, punct) {
  return greeting + ", " + this.name + punct;
}

describe("myCall", () => {
  it("sets this and passes the arguments", () => {
    expect(myCall(describeSelf, { name: "Ada" }, "Hi", "!")).toBe("Hi, Ada!");
  });
  it("gives no this for null or undefined", () => {
    function self() { return this; }
    expect(myCall(self, null)).toBe(undefined);
    expect(myCall(self, undefined)).toBe(undefined);
  });
  it("leaves no trace on the object, even when the function throws", () => {
    const obj = { name: "Bo" };
    myCall(describeSelf, obj, "Yo", ".");
    expect(Reflect.ownKeys(obj)).toEqual(["name"]);
    const empty = {};
    expect(() => myCall(() => { throw new Error("boom"); }, empty)).toThrow("boom");
    expect(Reflect.ownKeys(empty)).toEqual([]);
  });
  it("doesn't clash with existing properties", () => {
    const obj = { name: "Cy", fn: "keep me" };
    expect(myCall(describeSelf, obj, "Hey", "?")).toBe("Hey, Cy?");
    expect(obj.fn).toBe("keep me");
  });
});

describe("myBind", () => {
  it("fixes this and presets arguments", () => {
    const hi = myBind(describeSelf, { name: "Ada" }, "Hi");
    expect(hi("!")).toBe("Hi, Ada!");
  });
  it("can't be re-bound by myCall or by calling it as a method", () => {
    const hi = myBind(describeSelf, { name: "Ada" }, "Hi");
    expect(myCall(hi, { name: "Eve" }, "?")).toBe("Hi, Ada?");
    const other = { name: "Eve", hi };
    expect(other.hi("!")).toBe("Hi, Ada!");
  });
  it("lets new override the bound this", () => {
    function Point(x, y) { this.x = x; this.y = y; }
    const AtX1 = myBind(Point, { ignored: true }, 1);
    const p = new AtX1(2);
    expect(p instanceof Point).toBe(true);
    expect([p.x, p.y]).toEqual([1, 2]);
  });
  it("names the bound function like bind does", () => {
    expect(myBind(describeSelf, {}).name).toBe("bound describeSelf");
  });
});
`;

const PROTO_STARTER = String.raw`/** Like Object.create(proto): a new empty object whose prototype is proto (an object or null). */
export function myCreate(proto: object | null): any {
  // TODO
  return {};
}

/** Like \`new Ctor(...args)\` for constructor functions. */
export function myNew(Ctor: (...args: any[]) => any, ...args: unknown[]): any {
  // TODO
  const obj = {};
  Ctor.apply(obj, args);
  return obj;
}

/** Like \`value instanceof Ctor\`. */
export function myInstanceof(value: unknown, Ctor: { prototype: unknown }): boolean {
  // TODO
  return (value as any)?.constructor === Ctor;
}
`.replace(/\\`/g, "`");

const PROTO_SOLUTION = String.raw`const isObjectLike = (v: unknown): v is object => (typeof v === "object" && v !== null) || typeof v === "function";

export function myCreate(proto: object | null): any {
  if (proto !== null && !isObjectLike(proto)) throw new TypeError("Object prototype may only be an Object or null");
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  return obj;
}

export function myNew(Ctor: (...args: any[]) => any, ...args: unknown[]): any {
  if (typeof Ctor !== "function") throw new TypeError("Not a constructor");
  // 1-2: a fresh object linked to Ctor.prototype (or Object.prototype if that isn't an object)
  const obj = myCreate(isObjectLike(Ctor.prototype) ? Ctor.prototype : Object.prototype);
  // 3: run the constructor with this = obj
  const result = Ctor.apply(obj, args);
  // 4: an explicitly returned object wins; primitives are ignored
  return isObjectLike(result) ? result : obj;
}

export function myInstanceof(value: unknown, Ctor: { prototype: unknown }): boolean {
  if (!isObjectLike(value)) return false;
  for (let p = Object.getPrototypeOf(value); p !== null; p = Object.getPrototypeOf(p)) {
    if (p === Ctor.prototype) return true;
  }
  return false;
}
`;

const PROTO_INDEX = String.raw`import "./styles.css";
import { myCreate, myInstanceof, myNew } from "./src/proto";

function Person(this: { name: string }, name: string) {
  this.name = name;
}
Person.prototype.greet = function (this: { name: string }) {
  return "Hi, I'm " + this.name;
};
let text: string;
try {
  const ada = myNew(Person, "Ada");
  text = ada.greet() + " (instance: " + myInstanceof(ada, Person) + ", bare: " + (Object.getPrototypeOf(myCreate(null)) === null) + ")";
} catch (e) {
  text = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>new from scratch</h1><p><output id="out"></output></p>';
document.getElementById("out")!.textContent = text;
`;

const PROTO_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { myCreate, myInstanceof, myNew } from "../src/proto";

function withoutObjectCreate(fn) {
  const original = Object.create;
  Object.create = () => { throw new Error("Object.create is off limits"); };
  try { return fn(); } finally { Object.create = original; }
}

describe("myCreate", () => {
  it("links a new empty object to the prototype", () => {
    const proto = { hello() { return "hi"; } };
    const obj = withoutObjectCreate(() => myCreate(proto));
    expect(Object.getPrototypeOf(obj)).toBe(proto);
    expect(obj.hello()).toBe("hi");
    expect(Reflect.ownKeys(obj)).toEqual([]);
  });
  it("supports a null prototype", () => {
    const bare = withoutObjectCreate(() => myCreate(null));
    expect(Object.getPrototypeOf(bare)).toBe(null);
    expect("toString" in bare).toBe(false);
  });
  it("rejects primitives", () => {
    expect(() => myCreate(5)).toThrow(TypeError);
  });
});

describe("myNew", () => {
  function Person(name) { this.name = name; }
  Person.prototype.greet = function () { return "Hi " + this.name; };

  it("creates an instance linked to Ctor.prototype and runs the constructor", () => {
    const ada = myNew(Person, "Ada");
    expect(Object.getPrototypeOf(ada)).toBe(Person.prototype);
    expect(ada.greet()).toBe("Hi Ada");
    expect(ada instanceof Person).toBe(true);
  });
  it("returns an object the constructor returns, but ignores primitives", () => {
    const special = { special: true };
    expect(myNew(function () { this.a = 1; return special; })).toBe(special);
    const plain = myNew(function () { this.a = 1; return 42; });
    expect(plain.a).toBe(1);
  });
  it("falls back to Object.prototype when Ctor.prototype isn't an object", () => {
    function Odd() {}
    Odd.prototype = null;
    expect(Object.getPrototypeOf(myNew(Odd))).toBe(Object.prototype);
  });
});

describe("myInstanceof", () => {
  class Animal {}
  class Dog extends Animal {}
  it("walks the whole prototype chain", () => {
    const rex = new Dog();
    expect(myInstanceof(rex, Dog)).toBe(true);
    expect(myInstanceof(rex, Animal)).toBe(true);
    expect(myInstanceof(rex, Object)).toBe(true);
    expect(myInstanceof(rex, Array)).toBe(false);
  });
  it("matches instanceof for tricky values", () => {
    const cases = [[[], Array], [[], Object], [Object.create(null), Object], [5, Number], ["s", String], [null, Object], [() => {}, Function]];
    const wrong = cases.filter(([v, C]) => myInstanceof(v, C) !== (v instanceof C)).map(([v, C]) => String(v) + " / " + C.name);
    expect(wrong).toEqual([]);
  });
  it("isn't fooled by a fake constructor property", () => {
    const fake = { constructor: Dog };
    expect(myInstanceof(fake, Dog)).toBe(false);
  });
});
`;

export default defineTasks([
  quiz(
    "tp-call-site",
    ["this-prototypes"],
    1,
    45,
    ["What decides `this`", "Що визначає `this`"],
    ["For a regular (non-arrow) function, what determines the value of `this`?", "Що визначає значення `this` у звичайній (не стрілочній) функції?"],
    [
      ["How the function is called (the call site): plain call, method call, call/apply/bind, or new", "Спосіб виклику функції (місце виклику): простий виклик, виклик методу, call/apply/bind чи new"],
      ["Where the function is written in the source code", "Місце, де функцію написано в коді"],
      ["The object the function was first assigned to", "Об'єкт, до якого функцію вперше присвоїли"],
      ["The function itself", "Сама функція"],
    ],
    "a",
    [
      "`this` is a runtime binding, set fresh on every call by how the call is made. The same function can see a different `this` each time (`obj.fn()`, `fn()`, `fn.call(other)`). Only arrow functions take `this` lexically from where they're written.",
      "`this` є прив'язкою часу виконання, що встановлюється заново при кожному виклику залежно від способу виклику. Та сама функція може щоразу бачити інший `this` (`obj.fn()`, `fn()`, `fn.call(other)`). Лише стрілочні функції беруть `this` лексично, з місця, де їх написано.",
    ],
  ),
  quiz(
    "tp-call-apply-bind",
    ["this-prototypes"],
    2,
    90,
    ["call, apply and bind", "call, apply і bind"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`Hi, Ada! Hey, Ada? Yo, Ada.`", "`Hi, Ada! Hey, Ada? Yo, Ada.`"],
      ["`Hi, Ada! Hey, undefined? Yo, Ada.`", "`Hi, Ada! Hey, undefined? Yo, Ada.`"],
      ["`Hi, Ada! Hey, Ada? Yo, undefined.`", "`Hi, Ada! Hey, Ada? Yo, undefined.`"],
      ["A `TypeError`", "`TypeError`"],
    ],
    "a",
    [
      "All three set `this` explicitly. `call` takes the arguments one by one, `apply` takes them as an array, and `bind` returns a new function with `this` (and here the first argument) fixed, which is then called with the rest.",
      "Усі три явно встановлюють `this`. `call` приймає аргументи по одному, `apply` масивом, а `bind` повертає нову функцію з фіксованим `this` (і тут першим аргументом), яку потім викликають з рештою.",
    ],
    {
      code: 'function intro(greeting, punct) {\n  return greeting + ", " + this.name + punct;\n}\nconst ada = { name: "Ada" };\nconsole.log(intro.call(ada, "Hi", "!"), intro.apply(ada, ["Hey", "?"]), intro.bind(ada, "Yo")("."));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "tp-arrow-callback",
    ["this-prototypes", w("closures-scope")],
    3,
    90,
    ["Arrow vs regular callbacks", "Стрілочні й звичайні колбеки"],
    ["This runs as an ES module. What does it print?", "Цей код виконується як ES-модуль. Що він виведе?"],
    [
      ["`3`", "`3`"],
      ["`6`", "`6`"],
      ["`NaN`", "`NaN`"],
      ["`0`", "`0`"],
    ],
    "a",
    [
      "The arrow callback has no `this` of its own, so it uses the `this` of `startArrow`, which is `timer`: +3. The regular callback is called by `forEach` without a receiver, so its `this` is `undefined` in strict code (the guard skips the increment); in a sloppy script it would be the global object. Either way `timer` only gets the 3 from the arrow version.",
      "Стрілочний колбек не має власного `this`, тож використовує `this` методу `startArrow`, тобто `timer`: +3. Звичайний колбек `forEach` викликає без отримувача, тож його `this` у строгому коді дорівнює `undefined` (перевірка пропускає збільшення); у нестрогому скрипті це був би глобальний об'єкт. Так чи інакше `timer` отримує лише 3 від стрілочної версії.",
    ],
    {
      code: "const timer = {\n  seconds: 0,\n  startArrow() {\n    [1, 2, 3].forEach(() => this.seconds++);\n  },\n  startRegular() {\n    [1, 2, 3].forEach(function () {\n      if (this) this.seconds++;\n    });\n  },\n};\ntimer.startArrow();\ntimer.startRegular();\nconsole.log(timer.seconds);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "tp-binding-precedence",
    ["this-prototypes"],
    3,
    120,
    ["Which binding wins?", "Яка прив'язка перемагає?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`a` and then `a c`", "`a`, а потім `a c`"],
      ["`b` and then `c c`", "`b`, а потім `c c`"],
      ["`a` and then `c c`", "`a`, а потім `c c`"],
      ["`b` and then `a c`", "`b`, а потім `a c`"],
    ],
    "a",
    [
      "A bound function ignores the `this` passed to `call`, so explicit `bind` beats `call`: `a`. But `new` beats `bind`: `new BoundCtor(\"c\")` creates a fresh object as `this`, sets its `id` to `\"c\"`, and leaves `a` untouched. Precedence: `new` > `bind`/`call`/`apply` > method call > plain call.",
      "Прив'язана функція ігнорує `this`, переданий через `call`, тож явний `bind` сильніший за `call`: `a`. Але `new` сильніший за `bind`: `new BoundCtor(\"c\")` створює новий об'єкт як `this`, встановлює його `id` у `\"c\"` і не чіпає `a`. Пріоритет: `new` > `bind`/`call`/`apply` > виклик методу > простий виклик.",
    ],
    {
      code: 'function Who(id) {\n  this.id = id;\n}\nconst a = { id: "a" };\n\nconst read = function () {\n  return this.id;\n}.bind(a);\nconsole.log(read.call({ id: "b" }));\n\nconst BoundCtor = Who.bind(a);\nconst made = new BoundCtor("c");\nconsole.log(a.id, made.id);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "tp-new-return",
    ["this-prototypes", w("oop")],
    3,
    90,
    ["What `new` returns", "Що повертає `new`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`override bmx`", "`override bmx`"],
      ["`vw bmx`", "`vw bmx`"],
      ["`override ignored`", "`override ignored`"],
      ["`vw ignored`", "`vw ignored`"],
    ],
    "a",
    [
      "`new` creates an object, links it to the prototype, runs the constructor with that object as `this`, and returns it, unless the constructor returns another **object**, which then replaces it. A returned primitive like `\"ignored\"` is discarded. (In classes, returning an object works the same way.)",
      "`new` створює об'єкт, прив'язує його до прототипу, виконує конструктор із цим об'єктом як `this` і повертає його, якщо конструктор не повертає інший **об'єкт**, який тоді його замінює. Повернений примітив на кшталт `\"ignored\"` відкидається. (У класах повернення об'єкта працює так само.)",
    ],
    {
      code: 'function Car(make) {\n  this.make = make;\n  return { make: "override" };\n}\nfunction Bike(make) {\n  this.make = make;\n  return "ignored";\n}\nconsole.log(new Car("vw").make, new Bike("bmx").make);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "tp-shadowing",
    ["this-prototypes"],
    3,
    90,
    ["Writing to an inherited property", "Запис в успадковану властивість"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 1 true`", "`2 1 true`"],
      ["`2 2 false`", "`2 2 false`"],
      ["`NaN 1 true`", "`NaN 1 true`"],
      ["`1 2 false`", "`1 2 false`"],
    ],
    "a",
    [
      "`child.count++` means `child.count = child.count + 1`. The read finds `1` on the prototype; the write then creates an **own** `count` on `child` (shadowing), leaving `base.count` unchanged. Reads delegate up the chain, but ordinary writes land on the object itself.",
      "`child.count++` означає `child.count = child.count + 1`. Читання знаходить `1` у прототипі; потім запис створює **власну** `count` у `child` (затінення), не змінюючи `base.count`. Читання делегується вгору ланцюжком, а звичайний запис потрапляє на сам об'єкт.",
    ],
    { code: "const base = { count: 1 };\nconst child = Object.create(base);\nchild.count++;\nconsole.log(child.count, base.count, Object.hasOwn(child, \"count\"));", codeLanguage: "js" },
  ),
  quiz(
    "tp-readonly-inherited",
    ["this-prototypes", w("js-metaprogramming")],
    4,
    120,
    ["A read-only inherited property", "Успадкована властивість лише для читання"],
    ["This runs as an ES module (strict mode). What does it print?", "Цей код виконується як ES-модуль (строгий режим). Що він виведе?"],
    [
      ["`TypeError`, then `1 false`", "`TypeError`, потім `1 false`"],
      ["`2 true`", "`2 true`"],
      ["`1 true`", "`1 true`"],
      ["Nothing is thrown; it prints `2 false`", "Нічого не кидається; виводиться `2 false`"],
    ],
    "a",
    [
      "Normally a write creates an own property that shadows the prototype's. But if the inherited property is non-writable, assignment is forbidden (a `TypeError` in strict code; silently ignored in sloppy scripts), so no own property is created. Shadowing still works with `Object.defineProperty`, which doesn't consult the prototype.",
      "Зазвичай запис створює власну властивість, що затіняє властивість прототипу. Але якщо успадкована властивість недоступна для запису, присвоєння заборонене (`TypeError` у строгому коді; мовчки ігнорується в нестрогих скриптах), тож власна властивість не створюється. Затінення все ще можливе через `Object.defineProperty`, що не зважає на прототип.",
    ],
    {
      code: 'const base = Object.defineProperty({}, "id", { value: 1, writable: false });\nconst child = Object.create(base);\ntry {\n  child.id = 2;\n} catch (e) {\n  console.log(e.constructor.name);\n}\nconsole.log(child.id, Object.hasOwn(child, "id"));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "tp-prototype-property",
    ["this-prototypes"],
    4,
    120,
    ["`.prototype` vs the actual prototype", "`.prototype` проти справжнього прототипу"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true undefined`, then `false undefined`", "`true undefined`, потім `false undefined`"],
      ["`true Dog.prototype`, then `true function`", "`true Dog.prototype`, потім `true function`"],
      ["`true undefined`, then `true function`", "`true undefined`, потім `true function`"],
      ["`false undefined`, then `false undefined`", "`false undefined`, потім `false undefined`"],
    ],
    "a",
    [
      "`Dog.prototype` is just a property of the function, used as the prototype for objects created by `new Dog()`; instances don't have a `.prototype` property themselves. Replacing `Dog.prototype` later doesn't relink existing objects: `rex` still points at the old object, so `instanceof` (which compares against the current `Dog.prototype`) is `false`, and `bark` isn't reachable.",
      "`Dog.prototype` є просто властивістю функції, що стає прототипом об'єктів, створених через `new Dog()`; самі екземпляри не мають властивості `.prototype`. Заміна `Dog.prototype` пізніше не перепривʼязує наявні об'єкти: `rex` і далі вказує на старий об'єкт, тож `instanceof` (що порівнює з поточним `Dog.prototype`) дає `false`, а `bark` недосяжний.",
    ],
    {
      code: "function Dog() {}\nconst rex = new Dog();\nconsole.log(Object.getPrototypeOf(rex) === Dog.prototype, rex.prototype);\nDog.prototype = { bark() {} };\nconsole.log(rex instanceof Dog, typeof rex.bark);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "tp-super-home-object",
    ["this-prototypes", w("oop")],
    5,
    150,
    ["Borrowing a method that uses `super`", "Запозичення методу з `super`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`woof ...`", "`woof ...`"],
      ["`woof beep`", "`woof beep`"],
      ["`beep`", "`beep`"],
      ["A `TypeError`: `super` can't be used here", "`TypeError`: `super` тут використати не можна"],
    ],
    "a",
    [
      "Unlike `this`, `super` isn't decided by the call site. A method defined with method syntax remembers its **home object** (here `dog`), and `super.speak` means \"`speak` on the prototype of the home object\", i.e. `animal.speak`. Copying the method to `robot` doesn't change that, so it never reaches robot's own prototype. (`this` inside `animal.speak` would still be `robot`.)",
      "На відміну від `this`, `super` не визначається місцем виклику. Метод, визначений синтаксисом методу, пам'ятає свій **домашній об'єкт** (тут `dog`), і `super.speak` означає «`speak` у прототипі домашнього об'єкта», тобто `animal.speak`. Копіювання методу в `robot` цього не змінює, тож він ніколи не дістається власного прототипу robot. (`this` усередині `animal.speak` усе одно був би `robot`.)",
    ],
    {
      code: 'const animal = { speak() { return "..."; } };\nconst dog = {\n  __proto__: animal,\n  speak() { return "woof " + super.speak(); },\n};\nconst robot = {\n  __proto__: { speak() { return "beep"; } },\n  speak: dog.speak,\n};\nconsole.log(robot.speak());',
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "tp-call-bind",
    skills: ["this-prototypes", w("closures-scope"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Implement call and bind", "Реалізуйте call і bind"],
    prompt: [
      "Implement `myCall` and `myBind` in `src/bind.ts` **without** using `Function.prototype.call`, `apply` or `bind`. Use the binding rules instead:\n\n- **`myCall(fn, thisArg, ...args)`** calls `fn` with `this` = `thisArg` and returns its result. For `null`/`undefined`, call it with no `this` (a plain call). Hint: implicit binding: temporarily attach `fn` to the object under a key that can't clash with anything, call it as a method, and clean up afterwards, even if it throws. (The object isn't frozen.)\n- **`myBind(fn, thisArg, ...preset)`** returns a function that calls `fn` with the fixed `this` and the preset arguments followed by new ones. It can't be re-bound (not by `myCall`, not by calling it as a method), but when called with **`new`** it constructs a real instance of `fn`, ignoring `thisArg`. Name it `\"bound <name>\"` like `bind` does.",
      "Реалізуйте `myCall` і `myBind` у `src/bind.ts` **без** `Function.prototype.call`, `apply` чи `bind`. Натомість скористайтеся правилами прив'язки:\n\n- **`myCall(fn, thisArg, ...args)`** викликає `fn` з `this` = `thisArg` і повертає результат. Для `null`/`undefined` викликайте без `this` (простий виклик). Підказка: неявна прив'язка: тимчасово прикріпіть `fn` до об'єкта під ключем, що ні з чим не конфліктує, викличте як метод і приберіть після цього, навіть якщо виклик кинув помилку. (Об'єкт не заморожений.)\n- **`myBind(fn, thisArg, ...preset)`** повертає функцію, що викликає `fn` з фіксованим `this` і попередніми аргументами, за якими йдуть нові. Її не можна перепривʼязати (ні через `myCall`, ні викликом як методу), але з **`new`** вона створює справжній екземпляр `fn`, ігноруючи `thisArg`. Назвіть її `\"bound <name>\"`, як це робить `bind`.",
    ],
    files: { "/src/bind.ts": BIND_STARTER, "/index.ts": BIND_INDEX },
    visibleFiles: ["/src/bind.ts", "/index.ts"],
    activeFile: "/src/bind.ts",
    tests: BIND_TESTS,
    solution: { "/src/bind.ts": BIND_SOLUTION },
    explanation: [
      "`myCall` turns explicit binding into implicit binding: storing `fn` under a fresh `Symbol` (non-enumerable, so nothing observes it) and calling `target[key]()` makes the object the call-site receiver; `finally` removes it again. `myBind` closes over `thisArg` and the preset arguments, so later calls can't change them, and checks `new.target` to give `new` priority, as the language does.",
      "`myCall` перетворює явну прив'язку на неявну: збереження `fn` під новим `Symbol` (неперелічуваним, тож ніхто цього не помітить) і виклик `target[key]()` робить об'єкт отримувачем у місці виклику; `finally` прибирає його назад. `myBind` замикає `thisArg` і попередні аргументи, тож пізніші виклики не можуть їх змінити, і перевіряє `new.target`, щоб надати пріоритет `new`, як це робить мова.",
    ],
  }),
  practice({
    slug: "tp-new-from-scratch",
    skills: ["this-prototypes", w("oop"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["new, instanceof and Object.create from scratch", "new, instanceof і Object.create з нуля"],
    prompt: [
      "Re-implement three prototype primitives in `src/proto.ts`:\n\n- **`myCreate(proto)`**: a new empty object whose prototype is `proto` (an object, a function or `null`); throw a `TypeError` for primitives. Don't use `Object.create` (the tests disable it); `Object.setPrototypeOf` is allowed.\n- **`myNew(Ctor, ...args)`** for constructor functions: create an object linked to `Ctor.prototype` (or `Object.prototype` if that isn't an object), run `Ctor` with it as `this`, and return it, unless `Ctor` returns an object of its own.\n- **`myInstanceof(value, Ctor)`**: `true` if `Ctor.prototype` appears anywhere in `value`'s prototype chain; `false` for primitives. Don't trust the `constructor` property.",
      "Повторно реалізуйте три базові операції з прототипами в `src/proto.ts`:\n\n- **`myCreate(proto)`**: новий порожній об'єкт із прототипом `proto` (об'єкт, функція чи `null`); для примітивів киньте `TypeError`. Не використовуйте `Object.create` (тести його вимикають); `Object.setPrototypeOf` дозволено.\n- **`myNew(Ctor, ...args)`** для функцій-конструкторів: створіть об'єкт, прив'язаний до `Ctor.prototype` (або до `Object.prototype`, якщо той не є об'єктом), виконайте `Ctor` з ним як `this` і поверніть його, якщо `Ctor` не повернула власний об'єкт.\n- **`myInstanceof(value, Ctor)`**: `true`, якщо `Ctor.prototype` трапляється будь-де в ланцюжку прототипів `value`; `false` для примітивів. Не довіряйте властивості `constructor`.",
    ],
    files: { "/src/proto.ts": PROTO_STARTER, "/index.ts": PROTO_INDEX },
    visibleFiles: ["/src/proto.ts", "/index.ts"],
    activeFile: "/src/proto.ts",
    tests: PROTO_TESTS,
    solution: { "/src/proto.ts": PROTO_SOLUTION },
    explanation: [
      "All three come down to the `[[Prototype]]` link. `myCreate` sets it directly (including to `null`). `myNew` performs the four steps of `new`: create, link, call with `this`, and return the object unless the constructor returned its own. `myInstanceof` walks `Object.getPrototypeOf` until `null`, comparing each link with `Ctor.prototype`, which is exactly what `instanceof` does (ignoring `Symbol.hasInstance`), and why a forged `constructor` property can't fool it.",
      "Усі три зводяться до посилання `[[Prototype]]`. `myCreate` встановлює його напряму (зокрема в `null`). `myNew` виконує чотири кроки `new`: створити, прив'язати, викликати з `this` і повернути об'єкт, якщо конструктор не повернув власний. `myInstanceof` іде через `Object.getPrototypeOf` до `null`, порівнюючи кожне посилання з `Ctor.prototype`, що саме й робить `instanceof` (без урахування `Symbol.hasInstance`), і тому підроблена властивість `constructor` його не обдурить.",
    ],
  }),
]);
