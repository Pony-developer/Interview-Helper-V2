---
skill: oop
title: "Object-oriented programming in JavaScript and TypeScript"
summary: "Encapsulation, inheritance, polymorphism and abstraction with ES classes; private fields vs TypeScript `private`; how classes map onto prototypes; `this` pitfalls; and why composition often beats inheritance."
readingMinutes: 8
---

Object-oriented programming (OOP) groups **data and the behaviour that operates on it** into objects. In JavaScript, `class` is syntax over prototypes, and TypeScript adds compile-time checks (`private`, `abstract`, `interface`) on top. Interviews usually test the four pillars, how they look in JS, and the trade-offs.

## The four pillars

| Pillar | Idea | In JS/TS |
| --- | --- | --- |
| Encapsulation | Hide internal state and keep it valid through methods | `#private` fields, getters, validation in methods |
| Abstraction | Expose *what* an object does, not *how* | interfaces, `abstract` classes, small public APIs |
| Inheritance | Reuse and specialise behaviour | `class Dog extends Animal`, `super` |
| Polymorphism | One call, different behaviour per type | overriding methods, duck typing |

## Encapsulation: `#private` vs `private`

```ts
class Account {
  #balance = 0;             // runtime-private: inaccessible outside the class body
  private audit: string[] = []; // TypeScript-only: erased at compile time
  get balance() { return this.#balance; } // read-only from outside
  deposit(amount: number) {
    if (!(amount > 0)) throw new RangeError("Amount must be positive");
    this.#balance += amount;
  }
}
```

TypeScript's `private` and `protected` only exist for the type checker, so `(acc as any).audit` still works at runtime. `#fields` are enforced by the engine. A getter without a setter makes a property read-only, and methods that validate input keep the object's **invariants** true (a balance never goes negative).

## Inheritance and `super`

```ts
class SavingsAccount extends Account {
  constructor(private rate: number) {
    super(); // must run before `this` is used
  }
}
```

In a derived class, `this` doesn't exist until `super()` returns; touching it earlier throws a `ReferenceError`. Methods are looked up along the **prototype chain**: an instance's own properties, then `SavingsAccount.prototype`, then `Account.prototype`, then `Object.prototype`. Methods live on the prototype and are shared; class fields (including arrow-function fields) are created on every instance.

## Polymorphism

```ts
abstract class Shape {
  abstract area(): number;
  describe() { return `${this.constructor.name}: ${this.area().toFixed(2)}`; }
}
```

`describe` is written once, and `this.area()` calls whichever override the actual object has. Code that depends on `Shape` works with every subclass, and with any object that has the right methods (duck typing; TypeScript checks shapes **structurally**). `abstract` is compile-time only; to forbid `new Shape()` at runtime, check `new.target === Shape` in the constructor.

## The `this` trap

Class bodies run in strict mode, so a method detached from its object gets `this === undefined`:

```ts
const { deposit } = account;
deposit(5); // TypeError: cannot read private member from undefined
button.addEventListener("click", account.deposit); // same problem
```

Fix it with `account.deposit.bind(account)`, a wrapper `() => account.deposit(5)`, or an arrow-function class field (one function per instance).

## Composition over inheritance

Deep hierarchies are rigid. A subclass depends on its parent's implementation details (the **fragile base class** problem), and real-world categories rarely form clean trees (`Penguin extends Bird` but can't `fly()`). Composition builds objects from small parts instead:

```ts
class Player {
  constructor(private movement: Movement, private weapon: Weapon) {}
  attack(target: Enemy) { this.weapon.hit(target); }
}
```

Behaviour can be swapped at runtime, tested in isolation and combined freely. Use inheritance for a genuine "is-a" relationship where a subclass can stand in for its parent everywhere (Liskov substitution), and composition ("has-a") for everything else.

## Interview checklist

- Name the four pillars and give a JS example of each.
- Explain `#field` vs TypeScript `private`.
- Explain why `super()` must come first and where methods vs fields live.
- Show how a detached method loses `this`, and three ways to fix it.
- Argue when you'd choose composition over inheritance.
