---
skill: async-javascript
title: "Async JavaScript: the event loop, promises and async/await"
summary: "Why setTimeout(0) runs after a resolved promise, how to combine promises, and how to run async work with limited concurrency."
readingMinutes: 8
---

JavaScript runs your code on **one thread**. Asynchronous APIs let it start work (network, timers) and continue later without blocking.

## The event loop in one picture

1. Run the current script (the **call stack**) to completion.
2. Run **all microtasks**: promise callbacks, `queueMicrotask`, `await` continuations.
3. Render if needed (in browsers).
4. Take **one macrotask** (a timer, an I/O callback, a UI event) and go back to step 1.

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// A, D, C, B
```

Microtasks always drain before the next macrotask, so `C` comes before `B`. A long synchronous loop blocks everything, including rendering.

## Promises

A promise is pending, fulfilled or rejected, and settles only once. `then` returns a **new** promise, which is what makes chaining work. Return values flow forward; thrown errors jump to the next `catch`.

| Combinator | Resolves when | Rejects when |
| --- | --- | --- |
| `Promise.all` | all fulfil (array of values) | any rejects (fail-fast) |
| `Promise.allSettled` | all settle (status objects) | never |
| `Promise.race` | the first settles | the first settles with an error |
| `Promise.any` | the first fulfils | all reject (`AggregateError`) |

## async/await

`async` functions always return a promise. `await` pauses only that function, and the rest of the program keeps running.

```ts
// Sequential: total time = sum
for (const id of ids) results.push(await load(id));

// Parallel: total time = slowest
const results = await Promise.all(ids.map(load));
```

Common mistakes:

- **Forgetting `await`**: you get a promise instead of a value, and errors become unhandled rejections.
- **`await` inside `forEach`**: `forEach` ignores returned promises. Use `for…of` or `Promise.all`.
- **Swallowing errors**: wrap awaits in `try/catch` at the level that can actually handle them.

## Limiting concurrency

Firing 1,000 requests at once can overload a server. Run at most `limit` at a time instead:

```ts
async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
```

Each worker picks the next index synchronously (no race, because there is one thread). Results keep their input order.

## Cancellation and timeouts

Use `AbortController` with `fetch`. For a timeout, `Promise.race([work, timeoutPromise])` works, but remember the losing work keeps running unless you abort it.

## Interview checklist

- Predict the output order of mixed timers and promises.
- Choose between `all`, `allSettled`, `race` and `any`.
- Turn a sequential loop into parallel or limited-concurrency work.
- Never leave a promise without error handling.
