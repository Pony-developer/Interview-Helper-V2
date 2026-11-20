---
skill: async-cancellation
title: "Cancellation and async control flow: stopping work you no longer need"
summary: "Why promises can't be cancelled and what AbortController gives you instead, writing abortable functions, timeouts with AbortSignal.timeout and any, stale-response race conditions in search boxes and effects, latest-wins vs queued vs exhaust strategies, and channels for coordinating producers and consumers."
readingMinutes: 10
---

Real applications start a lot of async work that stops mattering: the user typed another letter, navigated away or closed the dialog. If that work keeps running, it wastes bandwidth and battery, and worse, its **late results overwrite newer ones**. Cancellation is how you say "stop, and don't report back".

## Promises aren't cancellable

A promise represents a result, not the operation that produces it, and anyone holding it can only observe it. There's no `promise.cancel()`. Ignoring a result (for example with `Promise.race` against a timeout) doesn't stop the underlying request or computation; it only stops you from waiting for it.

## AbortController and AbortSignal

The platform's answer is a separate **signal** object passed to the operation:

```js
const controller = new AbortController();
fetch(url, { signal: controller.signal })
  .then((res) => res.json())
  .then(render)
  .catch((err) => {
    if (err.name === "AbortError") return; // cancelled on purpose: not an error to report
    showError(err);
  });

controller.abort(); // the fetch rejects with a DOMException named "AbortError"
```

- `controller.abort(reason)` sets `signal.aborted = true`, stores `signal.reason` and fires an `abort` event, once.
- Many APIs accept a signal: `fetch`, `addEventListener` (abort removes the listener), streams, Node's `fs`, `setTimeout` in `timers/promises`, and most HTTP clients.
- `AbortSignal.timeout(ms)` creates a signal that aborts with a `TimeoutError`, and `AbortSignal.any([a, b])` combines signals (aborts when any does), for example "user cancel or 10-second timeout".
- `signal.throwIfAborted()` throws the reason if it's already aborted.

## Making your own functions abortable

Accept a signal, check it **before** starting and **between** steps, and listen for `abort` while waiting:

```js
function sleep(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(id);
      reject(signal.reason);
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
```

Pass the same signal down to every nested operation, clean up timers and listeners on both paths (abort and success), and reject with `signal.reason`, so callers can tell cancellation from failure.

## Race conditions with stale responses

The classic bug: a search box sends a request for every keystroke. Responses can arrive **out of order**, so the result for "re" can arrive after the one for "react" and overwrite it. Fixes:

- **Abort the previous request** when a new one starts (latest wins). This also saves bandwidth.
- **Ignore stale results**: keep a request counter or a `cancelled` flag and only apply the result if it's still the latest. React effects use this pattern with a cleanup function that sets `ignore = true`.
- Combine with **debouncing**, so you send fewer requests in the first place.

## Concurrency strategies

When a new trigger arrives while work is in progress, pick a strategy deliberately (RxJS names in brackets):

| Strategy | Behaviour | Typical use |
| --- | --- | --- |
| Latest wins (`switchMap`) | cancel the running task and start the new one | search, autocomplete, route data |
| Queue (`concatMap`) | run tasks one after another, in order | saving edits, sending chat messages |
| Exhaust (`exhaustMap`) | ignore new triggers until the current task finishes | "Submit" and "Refresh" buttons |
| Parallel (`mergeMap`) | run everything, possibly with a limit | uploading many files |

## Channels and coordination

Beyond single requests, async code often needs **producers and consumers** to cooperate: a crawler producing URLs for workers, a log shipper batching events. A **channel** (from CSP, communicating sequential processes, as in Go) is a queue where `send` waits when the buffer is full and `receive` waits when it's empty. That gives **backpressure** for free: fast producers slow down instead of filling memory. Async iterators make channels pleasant to consume (`for await (const job of channel)`), and closing a channel ends those loops.

## Interview checklist

- Explain why promises can't be cancelled, and how `AbortController` works.
- Write an abortable `sleep` or `fetchWithTimeout` using `AbortSignal.timeout` and `AbortSignal.any`.
- Explain and fix the stale-response race condition in a search box or React effect.
- Choose between latest-wins, queue, exhaust and parallel for a given UI action.
- Explain what a channel is and how it gives backpressure.
