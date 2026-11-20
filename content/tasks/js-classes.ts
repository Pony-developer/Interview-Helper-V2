import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const MIXINS_STARTER = String.raw`export type Ctor<T = object> = new (...args: any[]) => T;

/** Wraps a mixin factory so hasMixin can recognise the classes it produces. */
export function defineMixin<F extends (Base: Ctor) => Ctor>(factory: F): F {
  // TODO
  return factory;
}

/** True if obj's class chain includes a class produced by mixin. */
export function hasMixin(obj: unknown, mixin: Function): boolean {
  // TODO
  return false;
}

/** Adds createdAt / updatedAt (from Date.now()) and touch(). */
export const Timestamped = defineMixin(<B extends Ctor>(Base: B) => class extends Base {
  // TODO
});

/** Adds on(event, fn) → unsubscribe, and emit(event, payload). Listeners must stay private. */
export const Observable = defineMixin(<B extends Ctor>(Base: B) => class extends Base {
  // TODO
});

/** Adds toJSON() → { type: class name, ...data fields } and static fromJSON(json). */
export const Serializable = defineMixin(<B extends Ctor>(Base: B) => class extends Base {
  // TODO
});
`;

const MIXINS_SOLUTION = String.raw`export type Ctor<T = object> = new (...args: any[]) => T;

// For each mixin, the set of classes it has produced. Weak, so unused classes can be collected.
const produced = new WeakMap<Function, WeakSet<Function>>();

export function defineMixin<F extends (Base: Ctor) => Ctor>(factory: F): F {
  const classes = new WeakSet<Function>();
  const mixin = ((Base: Ctor) => {
    const Mixed = factory(Base);
    classes.add(Mixed);
    return Mixed;
  }) as F;
  produced.set(mixin, classes);
  return mixin;
}

export function hasMixin(obj: unknown, mixin: Function): boolean {
  const classes = produced.get(mixin);
  if (!classes || typeof obj !== "object" || obj === null) return false;
  for (let proto = Object.getPrototypeOf(obj); proto; proto = Object.getPrototypeOf(proto)) {
    if (classes.has(proto.constructor)) return true;
  }
  return false;
}

export const Timestamped = defineMixin(<B extends Ctor>(Base: B) => class extends Base {
  createdAt = Date.now();
  updatedAt = this.createdAt;
  touch() {
    this.updatedAt = Date.now();
    return this;
  }
});

export const Observable = defineMixin(<B extends Ctor>(Base: B) => class extends Base {
  #listeners = new Map<string, Set<(payload?: unknown) => void>>();
  on(event: string, fn: (payload?: unknown) => void) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event)!.add(fn);
    return () => {
      this.#listeners.get(event)?.delete(fn);
    };
  }
  emit(event: string, payload?: unknown) {
    for (const fn of [...(this.#listeners.get(event) ?? [])]) fn(payload);
  }
});

export const Serializable = defineMixin(<B extends Ctor>(Base: B) => class extends Base {
  toJSON() {
    const data: Record<string, unknown> = { type: this.constructor.name };
    for (const [key, value] of Object.entries(this)) {
      if (typeof value !== "function") data[key] = value;
    }
    return data;
  }
  static fromJSON<T>(this: new () => T, json: Record<string, unknown>): T {
    const { type: _type, ...data } = json;
    // "this" is the class fromJSON was called on, so subclasses get instances of themselves.
    return Object.assign(new this(), data);
  }
});
`;

const MIXINS_INDEX = String.raw`import "./styles.css";
import { Observable, Serializable, Timestamped, hasMixin } from "./src/mixins";

class Model {
  id: string;
  constructor(id = "none") {
    this.id = id;
  }
}
class User extends Serializable(Observable(Timestamped(Model))) {
  name = "anon";
}

const lines: string[] = [];
try {
  const user: any = new User("u1");
  user.on?.("change", (p: unknown) => lines.push("change: " + JSON.stringify(p)));
  user.name = "Ada";
  user.emit?.("change", { name: "Ada" });
  lines.push(JSON.stringify(user));
  lines.push("observable? " + hasMixin(user, Observable));
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Mixins</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const MIXINS_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { Observable, Serializable, Timestamped, defineMixin, hasMixin } from "../src/mixins";

class Model {
  constructor(id = "none") {
    this.id = id;
  }
  describe() {
    return "model " + this.id;
  }
}
class User extends Serializable(Observable(Timestamped(Model))) {
  name = "anon";
  rename(name) {
    this.name = name;
    this.touch();
    this.emit("change", { name });
    return this;
  }
}

function atTime(t, run) {
  const realNow = Date.now;
  Date.now = () => t.now;
  try {
    return run();
  } finally {
    Date.now = realNow;
  }
}

describe("mixins", () => {
  it("keep the base class working", () => {
    const u = new User("u1");
    expect(u.id).toBe("u1");
    expect(u).toBeInstanceOf(Model);
    expect(u.describe()).toBe("model u1");
  });
  it("Timestamped records creation and update times", () => {
    const t = { now: 1000 };
    atTime(t, () => {
      const u = new User("u1");
      expect(u.createdAt).toBe(1000);
      expect(u.updatedAt).toBe(1000);
      t.now = 2500;
      expect(u.touch()).toBe(u);
      expect(u.updatedAt).toBe(2500);
      expect(u.createdAt).toBe(1000);
    });
  });
  it("Observable emits events and supports unsubscribing", () => {
    const u = new User("u1");
    const onChange = fn();
    const off = u.on("change", onChange);
    u.rename("Ada");
    expect(onChange).toHaveBeenCalledWith({ name: "Ada" });
    off();
    u.rename("Bob");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it("keeps listeners private", () => {
    const u = new User("u1");
    u.on("change", () => {});
    expect(Object.keys(u)).toEqual(["id", "createdAt", "updatedAt", "name"]);
  });
  it("Serializable produces JSON with the class name", () => {
    atTime({ now: 7 }, () => {
      const u = new User("u1").rename("Ada");
      expect(JSON.parse(JSON.stringify(u))).toEqual({ type: "User", id: "u1", createdAt: 7, updatedAt: 7, name: "Ada" });
    });
  });
  it("fromJSON restores an instance of the class it's called on", () => {
    const copy = User.fromJSON({ type: "User", id: "u2", name: "Bob", createdAt: 5, updatedAt: 6 });
    expect(copy).toBeInstanceOf(User);
    expect(copy.name).toBe("Bob");
    expect(copy.createdAt).toBe(5);
    expect(copy.type).toBeUndefined();
    expect(copy.rename("Bo").name).toBe("Bo");
  });
  it("works with subclasses and super", () => {
    class Admin extends User {
      touches = 0;
      touch() {
        this.touches++;
        return super.touch();
      }
    }
    const admin = new Admin("a1").rename("Root");
    expect(admin.touches).toBe(1);
    expect(admin.toJSON().type).toBe("Admin");
    expect(Admin.fromJSON({ id: "a2" })).toBeInstanceOf(Admin);
  });
  it("hasMixin recognises classes built from a mixin", () => {
    const Tagged = defineMixin((Base) => class extends Base { tags = []; });
    class Post extends Tagged(Model) {}
    expect(hasMixin(new User(), Observable)).toBe(true);
    expect(hasMixin(new User(), Timestamped)).toBe(true);
    expect(hasMixin(new Post(), Tagged)).toBe(true);
    expect(hasMixin(new Post(), Observable)).toBe(false);
    expect(hasMixin(new Model(), Tagged)).toBe(false);
    expect(hasMixin(null, Tagged)).toBe(false);
  });
});
`;

const SHAPES_STARTER = String.raw`export type ShapeData = { type: string; [key: string]: unknown };

export class Shape {
  static type = "shape";

  // TODO: make Shape abstract, keep a private registry of subclasses by type,
  // and implement register / from / types / toJSON.
  static register(cls: any) {}
  static from(data: ShapeData): Shape {
    throw new Error("Not implemented");
  }
  static get types(): string[] {
    return [];
  }

  get area(): number {
    return 0;
  }
  protected data(): Record<string, unknown> {
    return {};
  }
}

export class Circle extends Shape {
  static type = "circle";
  radius: number; // TODO: private, validated
  constructor({ radius }: { radius: number }) {
    super();
    this.radius = radius;
  }
  get area() {
    return Math.PI * this.radius ** 2;
  }
}

export class Rect extends Shape {
  static type = "rect";
  width: number; // TODO: private, validated
  height: number;
  constructor({ width, height }: { width: number; height: number }) {
    super();
    this.width = width;
    this.height = height;
  }
  get area() {
    return this.width * this.height;
  }
}
`;

const SHAPES_SOLUTION = String.raw`export type ShapeData = { type: string; [key: string]: unknown };
type ShapeClass = (new (data: any) => Shape) & { type: string };

export class Shape {
  static type = "shape";
  static #registry = new Map<string, ShapeClass>();

  static register(cls: ShapeClass) {
    Shape.#registry.set(cls.type, cls);
  }
  static from(data: ShapeData): Shape {
    const cls = Shape.#registry.get(data?.type);
    if (!cls) throw new TypeError("Unknown shape type: " + String(data?.type));
    return new cls(data);
  }
  static get types(): string[] {
    return [...Shape.#registry.keys()];
  }

  constructor() {
    if (new.target === Shape) throw new TypeError("Shape is abstract");
  }
  get area(): number {
    throw new Error("area is not implemented");
  }
  protected data(): Record<string, unknown> {
    return {};
  }
  toJSON() {
    return { type: (this.constructor as ShapeClass).type, ...this.data() };
  }
}

function positive(name: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(name + " must be a positive number");
  }
  return value;
}

export class Circle extends Shape {
  static type = "circle";
  static {
    Shape.register(this);
  }
  #radius = 0;
  constructor({ radius }: { radius: number }) {
    super();
    this.radius = radius;
  }
  get radius() {
    return this.#radius;
  }
  set radius(value: number) {
    this.#radius = positive("radius", value);
  }
  get area() {
    return Math.PI * this.#radius ** 2;
  }
  protected data() {
    return { radius: this.#radius };
  }
}

export class Rect extends Shape {
  static type = "rect";
  static {
    Shape.register(this);
  }
  #width = 0;
  #height = 0;
  constructor({ width, height }: { width: number; height: number }) {
    super();
    this.width = width;
    this.height = height;
  }
  get width() {
    return this.#width;
  }
  set width(value: number) {
    this.#width = positive("width", value);
  }
  get height() {
    return this.#height;
  }
  set height(value: number) {
    this.#height = positive("height", value);
  }
  get area() {
    return this.#width * this.#height;
  }
  protected data(): Record<string, unknown> {
    return { width: this.#width, height: this.#height };
  }
}
`;

const SHAPES_INDEX = String.raw`import "./styles.css";
import { Circle, Rect, Shape } from "./src/shapes";

const lines: string[] = [];
try {
  const shapes: Shape[] = [new Circle({ radius: 1 }), new Rect({ width: 2, height: 3 })];
  for (const s of shapes) lines.push(JSON.stringify(s) + " area=" + s.area.toFixed(2));
  lines.push("registered: " + Shape.types.join(", "));
  lines.push("restored: " + Shape.from({ type: "rect", width: 4, height: 5 }).area);
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Shapes</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const SHAPES_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { Circle, Rect, Shape } from "../src/shapes";

class Square extends Rect {
  static type = "square";
  static {
    Shape.register(this);
  }
  constructor({ side }) {
    super({ width: side, height: side });
  }
  data() {
    return { side: this.width };
  }
}

describe("Shape", () => {
  it("is abstract", () => {
    expect(() => new Shape()).toThrow(TypeError);
    class Blob extends Shape {}
    const blob = new Blob();
    expect(blob).toBeInstanceOf(Shape);
    expect(() => blob.area).toThrow("not implemented");
  });
  it("computes areas", () => {
    expect(new Circle({ radius: 1 }).area).toBeCloseTo(Math.PI);
    expect(new Rect({ width: 2, height: 3 }).area).toBe(6);
  });
  it("validates on construction and on assignment", () => {
    expect(() => new Circle({ radius: -1 })).toThrow(RangeError);
    expect(() => new Rect({ width: 2, height: NaN })).toThrow(RangeError);
    const c = new Circle({ radius: 2 });
    expect(() => { c.radius = 0; }).toThrow(RangeError);
    expect(c.radius).toBe(2);
    c.radius = 3;
    expect(c.area).toBeCloseTo(9 * Math.PI);
  });
  it("keeps its state private and serialises with its type", () => {
    const c = new Circle({ radius: 2 });
    expect(Object.keys(c)).toEqual([]);
    expect(JSON.stringify(c)).toBe('{"type":"circle","radius":2}');
    expect(JSON.stringify(new Rect({ width: 2, height: 3 }))).toBe('{"type":"rect","width":2,"height":3}');
  });
  it("lets subclasses register themselves", () => {
    expect(Shape.types).toContain("circle");
    expect(Shape.types).toContain("rect");
    expect(Shape.types).toContain("square");
    expect(Shape.registry).toBeUndefined();
  });
  it("creates the right class from JSON", () => {
    const rect = Shape.from({ type: "rect", width: 2, height: 3 });
    expect(rect).toBeInstanceOf(Rect);
    expect(rect.area).toBe(6);
    const square = Shape.from({ type: "square", side: 2 });
    expect(square).toBeInstanceOf(Square);
    expect(square).toBeInstanceOf(Rect);
    expect(square.area).toBe(4);
    expect(JSON.stringify(square)).toBe('{"type":"square","side":2}');
    expect(() => Shape.from({ type: "hexagon" })).toThrow(TypeError);
  });
  it("round-trips through JSON", () => {
    for (const shape of [new Circle({ radius: 1.5 }), new Rect({ width: 1, height: 4 }), new Square({ side: 3 })]) {
      const copy = Shape.from(JSON.parse(JSON.stringify(shape)));
      expect(copy.constructor).toBe(shape.constructor);
      expect(copy.area).toBeCloseTo(shape.area);
    }
  });
});
`;

export default defineTasks([
  quiz(
    "cls-tdz",
    ["js-classes", w("closures-scope")],
    1,
    45,
    ["Using a class before its declaration", "Використання класу до його оголошення"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`ReferenceError`", "`ReferenceError`"],
      ["`TypeError`", "`TypeError`"],
      ["Nothing: the class is hoisted, so `new Foo()` works", "Нічого: клас спливає, тож `new Foo()` працює"],
      ["`SyntaxError`", "`SyntaxError`"],
    ],
    "a",
    [
      "Class declarations are hoisted like `let` and `const`: the name exists for the whole scope but stays in the **temporal dead zone** until the declaration runs, so using it earlier throws a `ReferenceError`. Function declarations, by contrast, are fully hoisted and can be called before they appear.",
      "Оголошення класів спливають як `let` і `const`: ім'я існує в усій області видимості, але лишається в **тимчасовій мертвій зоні**, доки не виконається оголошення, тож використання раніше кидає `ReferenceError`. Оголошення функцій, натомість, спливають повністю, і їх можна викликати до того, як вони з'являються в коді.",
    ],
    { code: "try {\n  new Foo();\n} catch (e) {\n  console.log(e.constructor.name);\n}\nclass Foo {}", codeLanguage: "js" },
  ),
  quiz(
    "cls-methods-not-enumerable",
    ["js-classes", w("this-prototypes")],
    2,
    60,
    ["Where do class members live?", "Де живуть члени класу?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'x' ] function`", "`[ 'x' ] function`"],
      ["`[ 'x', 'move' ] function`", "`[ 'x', 'move' ] function`"],
      ["`[ 'x', 'move' ] object`", "`[ 'x', 'move' ] object`"],
      ["`[] class`", "`[] class`"],
    ],
    "a",
    [
      "`for…in` lists enumerable properties, own and inherited. `x` is an own property set in the constructor; `move` lives on `Point.prototype` and class methods are **non-enumerable**, so it's skipped (a method assigned as `Point.prototype.move = …` would show up). `typeof` a class is `\"function\"`: classes are constructor functions with extra rules.",
      "`for…in` перелічує перелічувані властивості, власні й успадковані. `x` є власною властивістю, заданою в конструкторі; `move` живе в `Point.prototype`, а методи класу **неперелічувані**, тож він пропускається (метод, присвоєний як `Point.prototype.move = …`, з'явився б). `typeof` класу дає `\"function\"`: класи є функціями-конструкторами з додатковими правилами.",
    ],
    { code: "class Point {\n  constructor() {\n    this.x = 1;\n  }\n  move() {}\n}\nconst keys = [];\nfor (const k in new Point()) keys.push(k);\nconsole.log(keys, typeof Point);", codeLanguage: "js" },
  ),
  quiz(
    "cls-this-before-super",
    ["js-classes"],
    2,
    60,
    ["`this` in a derived constructor", "`this` у похідному конструкторі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`ReferenceError`", "`ReferenceError`"],
      ["`TypeError`", "`TypeError`"],
      ["`SyntaxError`", "`SyntaxError`"],
      ["Nothing; `x` is set to 1", "Нічого; `x` отримує значення 1"],
    ],
    "a",
    [
      "In a derived class, the object is created by the **base** constructor, so `this` doesn't exist until `super()` returns. Touching it earlier throws a `ReferenceError` at run time. It's not a `SyntaxError` because the engine can't know statically whether `super()` was called on every path.",
      "У похідному класі об'єкт створює **базовий** конструктор, тож `this` не існує, доки не поверне `super()`. Звернення до нього раніше кидає `ReferenceError` під час виконання. Це не `SyntaxError`, бо рушій не може статично знати, чи `super()` викликано на кожному шляху.",
    ],
    { code: "class A {}\nclass B extends A {\n  constructor() {\n    this.x = 1;\n    super();\n  }\n}\ntry {\n  new B();\n} catch (e) {\n  console.log(e.constructor.name);\n}", codeLanguage: "js" },
  ),
  quiz(
    "cls-extends-error",
    ["js-classes", w("javascript", 0.3)],
    2,
    75,
    ["Custom errors", "Власні помилки"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true NotFound NotFound: no user`", "`true NotFound NotFound: no user`"],
      ["`true Error Error: no user`", "`true Error Error: no user`"],
      ["`false NotFound NotFound: no user`", "`false NotFound NotFound: no user`"],
      ["`true NotFound Error: no user`", "`true NotFound Error: no user`"],
    ],
    "a",
    [
      "`class … extends Error` creates real errors: they pass `instanceof Error`, have a stack trace and keep the message. The default `name` is inherited from `Error.prototype` (`\"Error\"`), so set it yourself; `String(e)` (and most loggers) print `name: message`.",
      "`class … extends Error` створює справжні помилки: вони проходять `instanceof Error`, мають стек викликів і зберігають повідомлення. Типовий `name` успадковується з `Error.prototype` (`\"Error\"`), тож задайте його самі; `String(e)` (і більшість журналів) виводять `name: message`.",
    ],
    { code: 'class NotFound extends Error {\n  name = "NotFound";\n}\nconst e = new NotFound("no user");\nconsole.log(e instanceof Error, e.name, String(e));', codeLanguage: "js" },
  ),
  quiz(
    "cls-arrow-field",
    ["js-classes", w("react", 0.3)],
    3,
    90,
    ["Arrow-function fields", "Поля-стрілочні функції"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`hello A! true false`", "`hello A! true false`"],
      ["`hello A! false true`", "`hello A! false true`"],
      ["`hello A! true true`", "`hello A! true true`"],
      ["A `TypeError` from `super.hello`", "`TypeError` через `super.hello`"],
    ],
    "a",
    [
      "Methods live once on the prototype and can be reached with `super`. A field like `greet = () => …` is created **on every instance** (so it's an own property, not on `A.prototype`). That gives a bound `this` for callbacks, but costs a function per instance and can't be called through `super.greet()` from a subclass.",
      "Методи живуть один раз у прототипі, і до них можна дістатися через `super`. Поле на кшталт `greet = () => …` створюється **на кожному екземплярі** (тож це власна властивість, а не в `A.prototype`). Це дає прив'язаний `this` для колбеків, але коштує по функції на екземпляр і не викликається через `super.greet()` з підкласу.",
    ],
    { code: 'class A {\n  greet = () => "A";\n  hello() {\n    return "hello A";\n  }\n}\nclass B extends A {\n  hello() {\n    return super.hello() + "!";\n  }\n}\nconst b = new B();\nconsole.log(b.hello(), Object.hasOwn(b, "greet"), Object.hasOwn(A.prototype, "greet"));', codeLanguage: "js" },
  ),
  quiz(
    "cls-static-inheritance",
    ["js-classes", w("this-prototypes")],
    3,
    90,
    ["Static members and `this`", "Статичні члени й `this`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true models true`", "`true models true`"],
      ["`false models true`", "`false models true`"],
      ["`true undefined false`", "`true undefined false`"],
      ["`false undefined true`", "`false undefined true`"],
    ],
    "a",
    [
      "`extends` links two prototype chains: instances (`User.prototype → Model.prototype`) and the constructors themselves (`User → Model`). So `User.table` is found on `Model`, and inside the static method `this` is `User`, the class it was called on, so `new this()` creates a `User`. That's how static factories like `Model.create()` work for every subclass.",
      "`extends` пов'язує два ланцюжки прототипів: екземплярів (`User.prototype → Model.prototype`) і самих конструкторів (`User → Model`). Тож `User.table` знаходиться в `Model`, а всередині статичного методу `this` є `User`, класом, на якому його викликали, тож `new this()` створює `User`. Саме так статичні фабрики на кшталт `Model.create()` працюють для кожного підкласу.",
    ],
    { code: 'class Model {\n  static table = "models";\n  static create() {\n    return new this();\n  }\n}\nclass User extends Model {}\nconsole.log(User.create() instanceof User, User.table, Object.getPrototypeOf(User) === Model);', codeLanguage: "js" },
  ),
  quiz(
    "cls-private-brand-check",
    ["js-classes"],
    3,
    90,
    ["Private fields and brand checks", "Приватні поля й перевірка бренду"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ true, false, 'TypeError' ]`", "`[ true, false, 'TypeError' ]`"],
      ["`[ true, true, 1 ]`", "`[ true, true, 1 ]`"],
      ["`[ true, false, undefined ]`", "`[ true, false, undefined ]`"],
      ["`[ true, true, 'TypeError' ]`", "`[ true, true, 'TypeError' ]`"],
    ],
    "a",
    [
      "Private fields are installed by the constructor on the object itself; they're **not** inherited through the prototype. `Object.create(Point.prototype)` makes an object that looks like a `Point` (it passes `instanceof`) but never ran the constructor, so it has no `#x`. `#x in obj` checks for it safely, while reading `this.#x` on such an object throws a `TypeError`.",
      "Приватні поля встановлює конструктор на самому об'єкті; вони **не** успадковуються через прототип. `Object.create(Point.prototype)` створює об'єкт, схожий на `Point` (він проходить `instanceof`), але конструктор для нього не виконувався, тож `#x` у нього немає. `#x in obj` безпечно це перевіряє, а читання `this.#x` на такому об'єкті кидає `TypeError`.",
    ],
    {
      code: "class Point {\n  #x = 1;\n  static isPoint(o) {\n    return #x in o;\n  }\n  getX() {\n    return this.#x;\n  }\n}\nconst fake = Object.create(Point.prototype);\nconst out = [Point.isPoint(new Point()), Point.isPoint(fake)];\ntry {\n  out.push(fake.getX());\n} catch (e) {\n  out.push(e.constructor.name);\n}\nconsole.log(out);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "cls-init-order",
    ["js-classes", w("oop")],
    4,
    120,
    ["A base constructor calling an overridden method", "Базовий конструктор викликає перевизначений метод"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`label: undefined`", "`label: undefined`"],
      ["`label: child`", "`label: child`"],
      ["`base`", "`base`"],
      ["A `ReferenceError`: `this` isn't ready", "`ReferenceError`: `this` ще не готовий"],
    ],
    "a",
    [
      "`this.describe()` dispatches to `Child`'s override, because the object is already a `Child`. But `Child`'s fields are initialised only **after** `super()` returns, and the base constructor is still running, so `this.label` is `undefined`. Avoid calling overridable methods from constructors, or move that work to an explicit `init()` step.",
      "`this.describe()` переходить до перевизначення в `Child`, бо об'єкт уже є `Child`. Але поля `Child` ініціалізуються лише **після** повернення з `super()`, а базовий конструктор ще виконується, тож `this.label` дорівнює `undefined`. Не викликайте перевизначувані методи з конструкторів або перенесіть цю роботу в явний крок `init()`.",
    ],
    { code: 'class Base {\n  constructor() {\n    this.describe();\n  }\n  describe() {\n    console.log("base");\n  }\n}\nclass Child extends Base {\n  label = "child";\n  describe() {\n    console.log("label:", this.label);\n  }\n}\nnew Child();', codeLanguage: "js" },
  ),
  quiz(
    "cls-field-define-semantics",
    ["js-classes", w("js-metaprogramming")],
    4,
    120,
    ["A field with the same name as an inherited setter", "Поле з тим самим ім'ям, що й успадкований сетер"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'value' ]`", "`[ 'value' ]`"],
      ["`setter 1` and then `[]`", "`setter 1`, а потім `[]`"],
      ["`setter 1` and then `[ 'value' ]`", "`setter 1`, а потім `[ 'value' ]`"],
      ["`[]`", "`[]`"],
    ],
    "a",
    [
      "Class fields are created with **define** semantics (like `Object.defineProperty`), not assignment. So `value = 1` adds an own data property that shadows the inherited accessor, and `A`'s setter never runs. With TypeScript's legacy `useDefineForClassFields: false` it would have been an assignment that calls the setter, a real difference when migrating code.",
      "Поля класу створюються із семантикою **визначення** (як `Object.defineProperty`), а не присвоєння. Тож `value = 1` додає власну властивість-дані, що затінює успадкований аксесор, і сетер `A` ніколи не виконується. Зі застарілим налаштуванням TypeScript `useDefineForClassFields: false` це було б присвоєння, що викликає сетер, і це реальна відмінність під час міграції коду.",
    ],
    { code: 'class A {\n  set value(v) {\n    console.log("setter", v);\n  }\n}\nclass B extends A {\n  value = 1;\n}\nconsole.log(Object.keys(new B()));', codeLanguage: "js" },
  ),
  quiz(
    "cls-array-subclass",
    ["js-classes", w("arrays-strings")],
    4,
    120,
    ["Subclassing `Array`", "Наслідування `Array`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true 3 3`", "`true 3 3`"],
      ["`false 3 3`", "`false 3 3`"],
      ["`true 2 3`", "`true 2 3`"],
      ["A `TypeError`: `peek` isn't a function", "`TypeError`: `peek` не є функцією"],
    ],
    "a",
    [
      "Built-ins can be subclassed with `class`, and array methods that create new arrays (`filter`, `map`, `slice`) use `Symbol.species`, which defaults to the subclass. So `evens` (actually the odd numbers `[1, 3]`) is a `Stack` and has `peek`, and `Stack.from` builds a `Stack` too. `length` stays magic in subclasses.",
      "Вбудовані типи можна наслідувати через `class`, а методи масивів, що створюють нові масиви (`filter`, `map`, `slice`), використовують `Symbol.species`, що за замовчуванням є підкласом. Тож `evens` (насправді непарні числа `[1, 3]`) є `Stack` і має `peek`, а `Stack.from` теж будує `Stack`. `length` у підкласах лишається «магічним».",
    ],
    { code: "class Stack extends Array {\n  peek() {\n    return this.at(-1);\n  }\n}\nconst s = Stack.from([1, 2, 3]);\nconst evens = s.filter((n) => n % 2);\nconsole.log(evens instanceof Stack, evens.peek(), s.length);", codeLanguage: "js" },
  ),
  quiz(
    "cls-private-proxy",
    ["js-classes", w("js-metaprogramming")],
    5,
    150,
    ["Proxies and `#private`", "Proxy і `#private`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`TypeError`", "`TypeError`"],
      ["`1`", "`1`"],
      ["`NaN`", "`NaN`"],
      ["`undefined`", "`undefined`"],
    ],
    "a",
    [
      "`c.inc` is found through the proxy's default `get`, but it's then called with `this` = the **proxy**. Private fields aren't properties and can't be forwarded by traps; they live only on the original instance. So `this.#n` on the proxy throws a `TypeError`. This is why Vue and MobX can't make classes with `#private` fields reactive without workarounds (like binding methods to the raw object).",
      "`c.inc` знаходиться через типовий `get` проксі, але потім викликається з `this` = **проксі**. Приватні поля не є властивостями, і пастки не можуть їх перенаправити; вони живуть лише на початковому екземплярі. Тож `this.#n` на проксі кидає `TypeError`. Тому Vue і MobX не можуть зробити реактивними класи з полями `#private` без обхідних шляхів (як-от прив'язування методів до сирого об'єкта).",
    ],
    { code: "class Counter {\n  #n = 0;\n  inc() {\n    return ++this.#n;\n  }\n}\nconst c = new Proxy(new Counter(), {});\ntry {\n  console.log(c.inc());\n} catch (e) {\n  console.log(e.constructor.name);\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "cls-mixins",
    skills: ["js-classes", w("design-patterns"), w("typescript")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["Composable class mixins", "Компоновані міксини класів"],
    prompt: [
      "A mixin is a function that takes a class and returns a subclass of it: `class User extends Serializable(Observable(Timestamped(Model))) {}`. Implement the following in `src/mixins.ts`:\n\n- `Timestamped`: `createdAt` and `updatedAt` fields set from `Date.now()`, and `touch()`, which updates `updatedAt` and returns `this`.\n- `Observable`: `on(event, fn)` returns an unsubscribe function, and `emit(event, payload)` calls the listeners. The listeners must be **private**, so they don't appear in `Object.keys` or JSON.\n- `Serializable`:\n  - `toJSON()` returns `{ type: <class name>, ...own data fields }`.\n  - `static fromJSON(json)` returns an instance of **the class it's called on** with the data copied in, without the `type` key.\n- `defineMixin(factory)` wraps a factory, and `hasMixin(obj, mixin)` says whether an object's class chain includes a class that mixin produced.\n\nThe base class must keep working, constructor arguments must pass through, and subclasses must be able to override methods and call `super`.",
      "Міксин є функцією, що приймає клас і повертає його підклас: `class User extends Serializable(Observable(Timestamped(Model))) {}`. Реалізуйте в `src/mixins.ts` таке:\n\n- `Timestamped`: поля `createdAt` і `updatedAt` зі значенням `Date.now()` і `touch()`, що оновлює `updatedAt` і повертає `this`.\n- `Observable`: `on(event, fn)` повертає функцію відписки, а `emit(event, payload)` викликає слухачів. Слухачі мають бути **приватними**, тож вони не з'являються в `Object.keys` чи JSON.\n- `Serializable`:\n  - `toJSON()` повертає `{ type: <назва класу>, ...власні поля даних }`.\n  - `static fromJSON(json)` повертає екземпляр **класу, на якому його викликали**, зі скопійованими даними, без ключа `type`.\n- `defineMixin(factory)` загортає фабрику, а `hasMixin(obj, mixin)` каже, чи включає ланцюжок класів об'єкта клас, створений цим міксином.\n\nБазовий клас має й далі працювати, аргументи конструктора мають проходити далі, а підкласи мають могти перевизначати методи й викликати `super`.",
    ],
    files: { "/src/mixins.ts": MIXINS_STARTER, "/index.ts": MIXINS_INDEX },
    visibleFiles: ["/src/mixins.ts", "/index.ts"],
    activeFile: "/src/mixins.ts",
    tests: MIXINS_TESTS,
    solution: { "/src/mixins.ts": MIXINS_SOLUTION },
    explanation: [
      "Because `extends` accepts any expression, each mixin is just `(Base) => class extends Base { … }`, and stacking them builds an ordinary prototype chain, so `super`, `instanceof` and constructor arguments keep working. `#listeners` keeps listener storage private per instance. `fromJSON` uses `this` in a static method, which refers to the class it was called on, so subclasses get the right instances. Since every application of a mixin creates a new class, `hasMixin` can't compare classes directly: `defineMixin` records each produced class in a `WeakSet`, and `hasMixin` walks the object's prototype chain looking for one.",
      "Оскільки `extends` приймає будь-який вираз, кожен міксин є просто `(Base) => class extends Base { … }`, а їхнє накладання будує звичайний ланцюжок прототипів, тож `super`, `instanceof` і аргументи конструктора й далі працюють. `#listeners` тримає сховище слухачів приватним для кожного екземпляра. `fromJSON` використовує `this` у статичному методі, що посилається на клас, на якому його викликали, тож підкласи отримують правильні екземпляри. Оскільки кожне застосування міксину створює новий клас, `hasMixin` не може порівнювати класи напряму: `defineMixin` записує кожен створений клас у `WeakSet`, а `hasMixin` проходить ланцюжок прототипів об'єкта в пошуку такого класу.",
    ],
  }),
  practice({
    slug: "cls-shape-registry",
    skills: ["js-classes", w("oop"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["An abstract class with a self-registering hierarchy", "Абстрактний клас з ієрархією, що реєструється сама"],
    prompt: [
      "Finish the shape hierarchy in `src/shapes.ts`:\n\n- `Shape` is **abstract**: `new Shape()` throws a `TypeError`, while subclasses can be created. Its default `area` getter throws `\"area is not implemented\"`.\n- `Circle({ radius })` and `Rect({ width, height })` keep their dimensions in **private** fields, exposed through getters and setters that throw a `RangeError` for anything that isn't a positive finite number (the old value stays).\n- Serialisation: `JSON.stringify(shape)` gives `{\"type\": …, …data}`, where `type` is the class's static `type`; `Object.keys(shape)` is empty.\n- Registry: subclasses register themselves with `static { Shape.register(this); }`. The registry itself is private. `Shape.types` lists the registered types, and `Shape.from(json)` creates the right class, throwing a `TypeError` for unknown types.\n\nThe tests also define a `Square extends Rect` that registers itself and overrides `data()`.",
      "Завершіть ієрархію фігур у `src/shapes.ts`:\n\n- `Shape` є **абстрактним**: `new Shape()` кидає `TypeError`, а підкласи створювати можна. Його типовий гетер `area` кидає `\"area is not implemented\"`.\n- `Circle({ radius })` і `Rect({ width, height })` тримають свої розміри в **приватних** полях, доступних через гетери й сетери, що кидають `RangeError` для будь-чого, крім додатного скінченного числа (старе значення зберігається).\n- Серіалізація: `JSON.stringify(shape)` дає `{\"type\": …, …data}`, де `type` є статичним `type` класу; `Object.keys(shape)` порожній.\n- Реєстр: підкласи реєструють себе через `static { Shape.register(this); }`. Сам реєстр приватний. `Shape.types` перелічує зареєстровані типи, а `Shape.from(json)` створює потрібний клас і кидає `TypeError` для невідомих типів.\n\nТести також визначають `Square extends Rect`, що реєструє себе й перевизначає `data()`.",
    ],
    files: { "/src/shapes.ts": SHAPES_STARTER, "/index.ts": SHAPES_INDEX },
    visibleFiles: ["/src/shapes.ts", "/index.ts"],
    activeFile: "/src/shapes.ts",
    tests: SHAPES_TESTS,
    solution: { "/src/shapes.ts": SHAPES_SOLUTION },
    explanation: [
      "`new.target` holds the class that `new` was called with, so the base constructor can reject direct instantiation while allowing subclasses. A `static #registry` keeps the type map private to `Shape`, and `static { Shape.register(this); }` runs once while each subclass is defined, so adding a shape needs no central switch statement (the open/closed principle). `toJSON` combines the static `type` (looked up via `this.constructor`) with each class's `data()`, so private fields stay hidden but serialisation still works, and `from` reverses it.",
      "`new.target` містить клас, з яким викликали `new`, тож базовий конструктор може відхилити пряме створення, дозволяючи підкласи. `static #registry` тримає мапу типів приватною для `Shape`, а `static { Shape.register(this); }` виконується один раз під час визначення кожного підкласу, тож додавання фігури не потребує центрального `switch` (принцип відкритості/закритості). `toJSON` поєднує статичний `type` (знайдений через `this.constructor`) з `data()` кожного класу, тож приватні поля лишаються прихованими, а серіалізація все одно працює, і `from` виконує зворотне перетворення.",
    ],
  }),
]);
