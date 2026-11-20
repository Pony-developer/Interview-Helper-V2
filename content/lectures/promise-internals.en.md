---
skill: promise-internals
title: "Promises in depth: from callback trust issues to writing your own"
summary: "What goes wrong with plain callbacks (inversion of control, Zalgo), the guarantees promises add, states and the resolution procedure, thenables and assimilation, how then builds chains and propagates errors, unhandled rejections, and the structure of a promise implementation."
readingMinutes: 10
---

You can use promises for years without knowing how they work, until an interviewer asks you to implement one, or a bug depends on when a callback runs. This lecture looks underneath `then`.

## What's wrong with callbacks

Nesting ("callback hell") is the visible problem, but the deeper one is **trust**. Passing a callback to someone else's code is an **inversion of control**: you hand over the continuation of your program and hope it's called

- exactly once (not zero times, not twice),
- with either an error or a result, not both,
- and consistently **async** or consistently **sync**.

That last one has a name: **Zalgo**. A function that calls back synchronously when data is cached and asynchronously otherwise makes the order of the surrounding code unpredictable:

```js
function getUser(id, cb) {
  if (cache.has(id)) return cb(cache.get(id)); // sync
  fetchUser(id).then(cb);                      // async
}
getUser(1, render);
showSpinner(); // runs after render on a cache hit, before it otherwise
```

The fix is to always be async (for example `queueMicrotask(() => cb(value))`). Promises bake these guarantees in.

## The guarantees promises give

A promise is a placeholder for a future value, in one of three states: **pending**, **fulfilled** or **rejected**. Once **settled**, it never changes again.

- `resolve` and `reject` take effect only once; later calls (and throws after settling) are ignored.
- `then` callbacks always run **asynchronously**, as microtasks, even if the promise is already settled: no Zalgo.
- Each callback runs at most once, with either the value or the reason.
- An exception thrown in the executor or in a `then` callback becomes a rejection instead of escaping.

## Resolving is not fulfilling

`resolve(x)` runs the **promise resolution procedure**:

1. If `x` is the promise itself, reject with a `TypeError` (a cycle).
2. If `x` is an object or function with a callable `then` (a **thenable**), call `then` asynchronously and adopt its outcome. This is how promises from different libraries (or jQuery's deferreds) interoperate, and it's why `resolve(otherPromise)` waits for `otherPromise`.
3. Otherwise, fulfil with `x`.

So `resolve` can still end in rejection: `new Promise((r) => r(Promise.reject(err)))` is rejected. `Promise.resolve(p)` returns `p` itself when `p` is a native promise, and wraps anything else. Because adopting a thenable costs extra microtask ticks, `return await p` vs `return p` and `resolve(promise)` can change ordering in subtle ways.

## How `then` builds chains

`p.then(onFulfilled, onRejected)` always returns a **new** promise, resolved with whatever the handler returns (via the same procedure, so returning a promise waits for it), or rejected with whatever it throws.

- A missing or non-function handler passes the value or reason through: `p.then(null, handle)` is `p.catch(handle)`, and `.then(5)` is ignored.
- `catch` handles rejections from **everything above it** in the chain, and the chain continues as fulfilled after it unless the handler rethrows.
- `then(onOk, onErr)` differs from `then(onOk).catch(onErr)`: in the first form, errors thrown inside `onOk` aren't caught by `onErr`.
- `finally(fn)` runs on both outcomes, doesn't receive a value, and passes the original result through unless it throws or returns a rejected promise.

## Unhandled rejections

A rejected promise with no rejection handler attached is reported as **unhandled**: browsers fire `unhandledrejection` on `window`, and Node crashes the process by default. The check happens once the current task's microtasks have run, so attaching a `catch` in a later `setTimeout` is too late (you'll then get `rejectionhandled`). Always end chains with a `catch`, or `await` inside `try/catch`.

## Implementing a promise

An interview-sized implementation needs:

- **State**: `state`, `value`, and a list of pending handlers.
- **`resolve` and `reject`**, guarded so only the first call counts. `resolve` applies the resolution procedure: self-check, then thenable detection with a `called` flag, because a thenable may call both of its callbacks.
- **`then`**: creates the next promise, and on settlement runs the right handler in a microtask, resolving or rejecting the next promise with its result.
- **Statics** on top: `resolve`, `reject`, `all`, `race`, `allSettled`, `any`. `Promise.withResolvers()` returns `{ promise, resolve, reject }` for cases where the resolvers are needed outside the executor.

Converting callback APIs is a smaller version of the same idea: `promisify(fn)` returns a function that calls `fn` with an extra `(err, value)` callback and settles a new promise from it (`util.promisify` in Node).

## Interview checklist

- Explain inversion of control and Zalgo, and how promises remove both.
- Explain the difference between resolving and fulfilling, and what thenables are.
- Predict `then`/`catch`/`finally` chains, including pass-through and `then(a, b)` vs `then(a).catch(b)`.
- Explain when a rejection counts as unhandled.
- Sketch a promise implementation and `promisify`.
