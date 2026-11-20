---
skill: iterators-generators
title: "Iterators and generators: lazy sequences and pausable functions"
summary: "The iteration protocol behind for…of and spread, writing custom iterables, generator functions and how they pause, two-way communication with next(value) and throw(), delegation with yield*, cleanup with return() and finally, async generators with for await, and generators as coroutines."
readingMinutes: 9
---

`for…of`, spread (`[...x]`), destructuring, `Array.from`, `Promise.all`, `new Map(entries)`: all of these work with any object that follows the **iteration protocol**. Generators are the easiest way to write such objects, and they're also functions that can **pause** and **resume**, which is how JavaScript grew async/await.

## The iteration protocol

- An **iterable** has a `[Symbol.iterator]()` method that returns an iterator.
- An **iterator** has `next()`, which returns `{ value, done }`. Optionally it has `return()` (called when a consumer stops early) and `throw()`.

```js
const countdown = {
  from: 3,
  [Symbol.iterator]() {
    let n = this.from;
    return { next: () => (n > 0 ? { value: n--, done: false } : { value: undefined, done: true }) };
  },
};
[...countdown]; // [3, 2, 1]
```

Arrays, strings (by code point), `Map`, `Set`, `arguments` and NodeLists are iterable; plain objects are not (use `Object.entries`). Each call to `[Symbol.iterator]()` should give a fresh iterator, so an iterable can be consumed many times, while an **iterator** is single-use.

## Generators

```js
function* idGenerator(prefix) {
  let i = 1;
  while (true) yield `${prefix}-${i++}`;
}
const ids = idGenerator("user");
ids.next().value; // "user-1"
```

Calling a generator function runs **nothing**: it returns a generator object (both an iterator and an iterable). Each `next()` runs the body until the next `yield`, which pauses it and hands out a value; the function's local state survives between calls. A `return` value appears as the final `{ value, done: true }`, which `for…of` and spread ignore.

Because values are produced on demand, generators describe **lazy** and even infinite sequences; only what the consumer pulls is computed. Pipelines of small generators (`take(filter(map(source)))`) process one item at a time without building intermediate arrays.

## Two-way communication

`yield` is an expression: the argument of the **next** `next(value)` call becomes its result. The first `next()` starts the generator, and its argument is ignored.

```js
function* conversation() {
  const name = yield "What's your name?";
  const lang = yield `Hi ${name}! Favourite language?`;
  return `${name} likes ${lang}`;
}
```

`it.throw(error)` raises an error **at the paused `yield`**, so a `try/catch` inside the generator can handle it; `it.return(value)` finishes the generator early.

## Delegation with `yield*`

`yield* other` yields every value of another iterable or generator, forwards `next`/`throw`/`return` to it, and evaluates to the delegated generator's return value. Useful for recursion (walking trees) and composing generators.

## Early exit and cleanup

When `for…of` stops early (`break`, `return`, an exception), it calls the iterator's `return()`. For generators that runs any pending `finally` blocks, a good place to release resources (close a file, cancel a subscription). Array iterators have no `return()`, so a partly consumed array iterator can still continue later, while a generator closed this way is done for good.

## Async iteration

An **async generator** (`async function*`) can `await` and `yield`; consumers use `for await…of`. It fits data that arrives over time: paginated APIs, streams (`ReadableStream` is async iterable in modern runtimes), WebSocket messages.

```js
async function* fetchAll(url) {
  while (url) {
    const page = await (await fetch(url)).json();
    yield* page.items;
    url = page.next;
  }
}
for await (const item of fetchAll("/api/items")) render(item);
```

## Generators as coroutines

A runner that resolves each yielded promise and sends the result back with `next(result)` (or the error with `throw(error)`) turns a generator into sequential-looking async code. That's exactly what libraries like `co` and Redux-Saga do, and what `async`/`await` later built into the language. Redux-Saga still uses generators because yielded *descriptions* of effects can be tested without running them.

## Interview checklist

- Explain the iterable and iterator protocols and make a custom object iterable.
- Explain that calling a generator runs nothing, and how `yield`/`next` pause and resume.
- Use `next(value)`, `throw()`, `return()` and `yield*`.
- Explain laziness and why `take` must not pull an extra value.
- Use async generators with `for await…of`, and relate generators to async/await.
