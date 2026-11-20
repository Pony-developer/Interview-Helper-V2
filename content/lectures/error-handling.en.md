---
skill: error-handling
title: "Error handling in JavaScript: throwing, catching and recovering on purpose"
summary: "Built-in error types and what each one signals, custom errors and cause chains, the surprising rules of try/catch/finally, errors in callbacks, promises and async functions, global handlers, and how to decide between throwing, returning a result, retrying and failing fast."
readingMinutes: 10
---

Good error handling is about **deciding**: which failures you expect and can recover from, which ones are bugs that should crash loudly, and what information the person debugging at 3 a.m. will need. JavaScript gives you the tools; the language rules around them have a few traps.

## Error types

| Type | Typical meaning |
| --- | --- |
| `TypeError` | wrong type: calling a non-function, reading a property of `null`, writing to a frozen object in strict mode |
| `ReferenceError` | an undeclared variable, or using `let`/`const`/`class` in the TDZ |
| `RangeError` | a value outside the allowed range: `new Array(-1)`, `toFixed(200)`, stack overflow |
| `SyntaxError` | invalid code, or `JSON.parse` on bad input |
| `URIError`, `EvalError` | rare |
| `AggregateError` | several errors at once: `Promise.any`, or your own batch operations |
| `DOMException` | browser APIs: `AbortError`, `NotAllowedError`, `QuotaExceededError` (check `.name`) |

You can `throw` any value, but always throw `Error` objects: only they carry a **stack trace**, and code that reads `err.message` breaks on a thrown string.

## Custom errors and causes

```js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);           // options.cause is supported by Error itself
    this.name = "HttpError";
    this.status = status;
  }
}

try {
  await saveOrder(order);
} catch (err) {
  throw new Error(`Couldn't save order ${order.id}`, { cause: err });
}
```

- Give errors a `name` and machine-readable fields (`status`, `code`), so handlers can branch with `instanceof` or `err.code` instead of parsing messages.
- Wrap low-level errors with **context** using `{ cause }` instead of losing the original or concatenating messages. DevTools and Node print the whole cause chain.
- Keep messages for humans and codes for programs, and never put secrets in either.

## try / catch / finally rules

- `catch (err)` catches **everything** thrown in the `try`, including bugs. Catch narrowly: check the type and rethrow what you can't handle.
- Optional catch binding: `catch { … }` when you don't need the error.
- `finally` always runs: after a normal completion, a `return`, a `break`, or an exception.
- A `return` (or `throw`) inside `finally` **overrides** the result of `try`/`catch`, including swallowing an exception. Avoid control flow in `finally`.
- The value of a `return` in `try` is computed **before** `finally` runs, so changing the returned variable in `finally` doesn't change the result (mutating the returned object does).
- `try/catch` only catches synchronous errors and awaited rejections. An error thrown later in a `setTimeout` callback, or a promise you didn't `await`, escapes it.

## Errors in asynchronous code

- **Callbacks** use the Node convention `(err, result)`. Errors must be passed, not thrown, because the caller's stack is gone by then.
- **Promises** turn throws into rejections. Handle them with `.catch` at the end of each chain.
- **`async` functions**: `await` turns a rejection into a throw, so normal `try/catch` works. But `return promise` inside `try` without `await` lets a rejection skip your `catch`, so use `return await` there.
- **Concurrency**: `Promise.all` rejects on the first failure (the others keep running unobserved), while `Promise.allSettled` reports every result. Choose deliberately.
- **Event handlers and streams** report errors through `error` events: listen for them, because an unhandled `error` event on a Node `EventEmitter` throws.

## Global handlers

Last-resort handlers are for **logging and reporting**, not recovery:

- Browser: `window.addEventListener("error", …)` for uncaught exceptions and failed resources, `unhandledrejection` for promises.
- Node: `process.on("uncaughtException")` and `unhandledRejection`. After an uncaught exception the process state is unknown, so log and exit, and let a supervisor restart it.
- Frameworks add their own layers, like React error boundaries for render errors.

## Designing error handling

- **Expected failures** (validation, "not found", a declined payment) are part of the domain. Return them as values (`{ ok: false, error }`, a `Result` type) or throw specific error classes, but handle them close to where they happen.
- **Unexpected failures** (bugs, broken invariants) should **fail fast** and loudly, with enough context to debug. Don't silently `catch` and continue in an invalid state.
- **Transient failures** (network timeouts, 503s, lock conflicts) can be **retried** with exponential backoff and jitter, a maximum number of attempts, and only for idempotent operations.
- Handle each error **once**: either log it or rethrow it with context, not both at every layer.
- At boundaries (an HTTP handler, a queue consumer, a UI action) convert errors into a response: a status code, a user-friendly message and a correlation id, while the details go to logs.

## Interview checklist

- Name the built-in error types and when each occurs.
- Write a custom error class with a `name`, extra fields and a `cause`.
- Explain how `return` interacts with `finally`, and what `try/catch` can't catch.
- Explain error handling in callbacks, promises and `async` functions, including `return await`.
- Explain expected vs unexpected vs transient failures, and what global handlers are for.
