---
skill: js-classes
title: "JavaScript classes in depth: fields, #private, static and inheritance"
summary: "What class syntax adds on top of prototypes, how fields are defined and in what order they initialise, hard-private #members and brand checks, static members and static blocks, extends and super with built-ins, mixins, abstract classes with new.target, and the pitfalls that show up in code reviews."
readingMinutes: 10
---

`class` is often called "syntactic sugar over prototypes". That's mostly true: methods still live on `Class.prototype`, and instances still delegate to it. But classes also add things plain constructor functions can't do: fields with define semantics, truly private members, `super` with a fixed home object, and derived constructors whose `this` doesn't exist until `super()` returns.

## What a class declaration does

```js
class Account {
  static #count = 0;                 // static private field
  balance = 0;                       // public instance field
  #history = [];                     // private instance field

  constructor(owner) {
    this.owner = owner;
    Account.#count++;
  }
  deposit(amount) {                  // on Account.prototype, non-enumerable
    this.#history.push(amount);
    this.balance += amount;
    return this;
  }
  get history() { return [...this.#history]; }
  static get count() { return Account.#count; }
}
```

- The body runs in **strict mode**.
- Class declarations are hoisted but stay in the **temporal dead zone**, so you can't use a class before its declaration.
- Calling a class without `new` throws a `TypeError`.
- Methods are **non-enumerable**, so `for…in` over an instance doesn't list them.
- `typeof Account` is `"function"`: a class is a constructor function with extra rules.

## Fields and initialisation order

Instance fields are created on **each instance** with *define* semantics, like `Object.defineProperty`, not assignment. So a field doesn't run a setter inherited from a parent class; it shadows it.

Order of construction for `class B extends A`:

1. `new B()` runs B's constructor up to `super(...)`. `this` is in the TDZ before that, so touching it throws a `ReferenceError`.
2. `super()` runs A's constructor: A's fields are initialised first, then A's constructor body.
3. After `super()` returns, **B's fields** are initialised, then the rest of B's constructor runs.

So if A's constructor calls a method that B overrides, that method sees B's fields as `undefined`: a classic bug. A field initialiser can use `this` and the fields declared above it.

**Arrow-function fields** (`handleClick = () => {…}`) are created per instance with `this` bound lexically, which is handy for callbacks. But they aren't on the prototype, so subclasses can't call them with `super.handleClick()`, tests can't spy on the prototype, and each instance gets its own copy.

## Private members

`#name` fields, methods and accessors are **hard private**: they can only be used inside the class body that declares them, not by subclasses, `Object.keys`, `JSON.stringify`, `Reflect.ownKeys` or `obj["#name"]`. Reading `#x` on an object that doesn't have it throws a `TypeError`, and `#x in obj` is a safe **brand check**:

```js
class Point {
  #x;
  static isPoint(value) { return #x in value; }
}
```

Private names are looked up on the **object itself**, not through the prototype chain. That's why a `Proxy` around an instance breaks methods that use `#fields`: inside the method `this` is the proxy, which doesn't have the private slot. TypeScript's `private` keyword, by contrast, is only a compile-time check.

## Static members and static blocks

Static fields and methods live on the class itself. Inside a static method `this` is the class it was called on, so subclasses inherit statics, because `B.__proto__ === A`. A `static { … }` block runs once while the class is being defined and can initialise complex statics or share private access with code defined next to it.

## extends and super

- `extends` accepts any expression that evaluates to a constructor (or `null`), which is how mixins work.
- `super.method()` calls the parent's prototype method with the current `this`. It's resolved through the method's fixed **home object**, so copying the method to another object doesn't change what `super` means.
- Extending built-ins works with classes (unlike old `Parent.call(this)` patterns): `class Stack extends Array` instances have a magic `length`, and `class NotFound extends Error` gets a proper stack. Set `this.name` (or a `name` field) so logs show the subclass name.
- Methods like `map` and `filter` on an `Array` subclass return instances of the subclass, via `Symbol.species`.

## Patterns

- **Mixins**: `const Timestamped = (Base) => class extends Base { createdAt = Date.now(); };` then `class User extends Timestamped(Model) {}`. They give multiple-inheritance-like reuse without a deep hierarchy.
- **Abstract classes**: `if (new.target === Shape) throw new TypeError("Shape is abstract");` in the base constructor.
- **Factories** (`static from(json)`) and private constructors via a module-private token.
- Prefer **composition** for behaviour that varies independently; keep hierarchies shallow.

## Interview checklist

- Explain how classes differ from constructor functions: TDZ, strict mode, `new` required, non-enumerable methods, fields, `#private`, `super`.
- Walk through construction order and the "overridden method called from the base constructor" bug.
- Explain define vs assign semantics for fields and arrow-function fields' trade-offs.
- Use `#x in obj`, and explain why Proxies and `#private` don't mix.
- Write a mixin and an abstract base class.
