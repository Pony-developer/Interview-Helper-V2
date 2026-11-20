---
skill: this-prototypes
title: "this and prototypes: how JavaScript objects really work"
summary: "The four rules that bind this (default, implicit, explicit, new) and their precedence, arrow functions, call/apply/bind, what new does step by step, the prototype chain, shadowing, Object.create and delegation, and what class syntax adds on top."
readingMinutes: 10
---

Two ideas cause more confusion than anything else in JavaScript: `this` and prototypes. Both become predictable once you know that **`this` is decided by how a function is called**, and that **objects delegate failed property lookups to their prototype**.

## Finding `this`: look at the call site

`this` is not the function itself, and not the scope it was written in. For a normal (non-arrow) function it's set at call time by one of four rules:

| Rule | Call looks like | `this` is |
| --- | --- | --- |
| `new` binding | `new Fn()` | the newly created object |
| Explicit binding | `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)()` | `obj` |
| Implicit binding | `obj.fn()` | `obj` (the object before the dot) |
| Default binding | `fn()` | `undefined` in strict mode (modules, classes); the global object in sloppy scripts |

When several could apply, the order of the table is the **precedence**: `new` beats `bind`, `bind` beats a method call, and a method call beats a plain call. Once a function is bound with `bind`, `call` and `apply` can't change its `this`, but `new` still can.

The classic bug is a lost implicit binding: `const f = obj.method; f()` or `setTimeout(obj.method, 100)` pass only the function, so the call site has no object.

```js
function greet(greeting) { return `${greeting}, ${this.name}`; }
const ada = { name: "Ada", greet };
ada.greet("Hi");                   // implicit: "Hi, Ada"
greet.call({ name: "Bo" }, "Hey"); // explicit: "Hey, Bo"
const hi = greet.bind(ada, "Hi");  // a new function with this and an argument fixed
```

`call` passes arguments one by one, `apply` as an array (`fn.apply(obj, args)`, now mostly replaced by spread), and `bind` returns a new function without calling it.

## Arrow functions: no `this` of their own

Arrow functions don't get a `this` binding at all; they read `this` from the surrounding scope, like any other variable (lexical `this`). That's exactly what you want for callbacks inside methods (`items.forEach(() => this.count++)`), and exactly wrong for methods on object literals: `{ count: 0, inc: () => this.count++ }` uses the outer `this`, not the object. `call`/`bind` can't change an arrow function's `this`.

## What `new` does

`new Fn(args)`:

1. creates a fresh object,
2. links its prototype to `Fn.prototype`,
3. calls `Fn` with `this` set to the new object,
4. returns the new object, **unless** `Fn` explicitly returns another object (returned primitives are ignored).

## Objects and property descriptors

Each property has a descriptor: `value`, `writable`, `enumerable`, `configurable` (or `get`/`set` for accessors). Object literals create properties with all flags `true`; `Object.defineProperty` defaults them to `false`. `Object.preventExtensions`, `seal` and `freeze` progressively lock an object, but only **shallowly**.

## The prototype chain

Every object has an internal link, `[[Prototype]]` (read it with `Object.getPrototypeOf`). When you read `obj.prop` and `obj` doesn't have it, the lookup continues on its prototype, then that object's prototype, up to `Object.prototype` and finally `null`.

```js
const animal = { speak() { return `${this.name} makes a sound`; } };
const dog = Object.create(animal); // dog's prototype is animal
dog.name = "Rex";
dog.speak(); // found on animal; this is still dog
```

Methods found on the prototype still run with `this` = the object you called them on. That's **delegation**: objects share behaviour through links instead of copying it.

Don't confuse the two "prototypes": `Fn.prototype` is an ordinary property of a function, used as the prototype of objects created with `new Fn()`; `Object.getPrototypeOf(obj)` (or the legacy `obj.__proto__`) is the actual link of a specific object.

### Shadowing

**Writing** a property normally creates it on the object itself, shadowing the prototype's version. `child.count++` reads `count` from the prototype and then creates an own `count` on `child`. Two exceptions: if the inherited property is **read-only**, the assignment fails (a `TypeError` in strict mode), and if it's an inherited **setter**, the setter runs instead of creating a property.

## `class` is (mostly) syntax for prototypes

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${super.speak()} (woof)`; }
}
```

`Dog.prototype.speak` lives on the prototype, `Object.getPrototypeOf(Dog.prototype) === Animal.prototype`, and `instanceof` simply walks the prototype chain. What `class` adds: methods are non-enumerable, the body is strict, constructors can't be called without `new`, `extends` works with built-ins like `Array` and `Error`, plus private `#fields`, static blocks and `super`. Note that `super` is bound to the object where the method was **defined** (its "home object"), not to `this`, so borrowing a method that uses `super` keeps pointing at the original parent.

## Delegation vs classes

Classes model "is-a" hierarchies. The prototype system also allows a lighter style: plain objects linked with `Object.create` that delegate to each other ("objects linked to other objects"). Either way, prefer composition for sharing behaviour across unrelated types.

## Interview checklist

- Determine `this` for any call site using the four rules and their precedence.
- Explain why arrow functions behave differently and when that's useful.
- Describe the four steps of `new`, including the return-value rule.
- Explain the prototype chain, `Fn.prototype` vs `Object.getPrototypeOf`, and shadowing.
- Explain what `class` and `super` add on top of prototypes.
