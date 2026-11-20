---
skill: main-thread-scheduling
title: "Main-thread scheduling: keeping the page responsive while doing real work"
summary: "Why one long task freezes a page, how INP measures it, splitting work into chunks and yielding with scheduler.yield, setTimeout or MessageChannel, what requestAnimationFrame and requestIdleCallback are for, task priorities with scheduler.postTask, avoiding layout thrashing by batching reads and writes, and when to move work off the main thread."
readingMinutes: 10
---

The browser's main thread runs your JavaScript, style and layout calculations, painting, and input handling, **one task at a time**. While a task runs, nothing else can: clicks wait, animations stall, typing lags. JavaScript's single-threaded, run-to-completion model makes code easier to reason about, but it means you have to **cooperate**: break big jobs into small pieces and give the browser chances to do its own work.

## Long tasks and responsiveness

Any task over **50 ms** counts as a **long task**. Interaction to Next Paint (**INP**), a Core Web Vital, measures the delay from an interaction to the next frame, including time spent waiting behind long tasks; under 200 ms is "good". Common culprits: parsing huge JSON, filtering or sorting big lists, rendering thousands of DOM nodes, and expensive synchronous work in event handlers. Find them in the DevTools Performance panel (red-flagged tasks) or with a `PerformanceObserver` for `longtask` and `long-animation-frame` entries.

## Chunking and yielding

Split the work and **yield** between chunks, so pending input and rendering can run:

```js
async function processAll(items, handle) {
  let deadline = performance.now() + 10;
  for (const item of items) {
    handle(item);
    if (performance.now() > deadline) {
      await yieldToMain();
      deadline = performance.now() + 10;
    }
  }
}

function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

- **`scheduler.yield()`** returns a promise that resumes your work with high priority (ahead of other queued tasks), after the browser has handled input.
- **`setTimeout(fn, 0)`** queues a new task but is clamped to about 4 ms after a few nested levels and lands at the back of the queue.
- **`MessageChannel`** posting gives a fast, unclamped task (React's scheduler used this).
- **Microtasks don't yield**: `await Promise.resolve()` or `queueMicrotask` run before rendering and input, so a loop that only awaits resolved promises still blocks the page.

Yield on a **time budget** (every few milliseconds) rather than every N items, since item cost varies.

## requestAnimationFrame and requestIdleCallback

- **`requestAnimationFrame(cb)`** runs `cb` just before the next paint, once per frame (usually every 16.7 ms at 60 Hz). Use it for visual updates and animations, reading the timestamp argument to compute progress. It's paused in background tabs. Don't use it for non-visual work.
- **`requestIdleCallback(cb, { timeout })`** runs `cb` when the browser is idle, passing a `deadline` with `timeRemaining()`. It's good for low-priority work like analytics batching, prefetching or warming caches. It may not run for a long time on a busy page, so set `timeout` if it must happen eventually. (Not available in Safari, so feature-detect and fall back.)

## Priorities with `scheduler.postTask`

`scheduler.postTask(fn, { priority })` queues work at `"user-blocking"`, `"user-visible"` (default) or `"background"` priority, and accepts an `AbortSignal` (or a `TaskController` for changing priority later). Use it to keep background work, like syncing or indexing, from delaying what the user is waiting for.

## Layout thrashing

Reading layout properties (`offsetHeight`, `getBoundingClientRect`, `scrollTop`, `getComputedStyle`) right after writing styles forces the browser to **recalculate layout synchronously**. Doing that in a loop, read, write, read, write, causes **layout thrashing**:

```js
// Bad: forces a layout on every iteration
for (const el of items) el.style.height = el.offsetWidth / 2 + "px";

// Good: read everything, then write everything
const widths = items.map((el) => el.offsetWidth);
items.forEach((el, i) => (el.style.height = widths[i] / 2 + "px"));
```

Libraries like fastdom batch reads and writes per frame. Animate `transform` and `opacity` instead of layout properties, so frames can be composited without layout.

## Moving work elsewhere

When chunking isn't enough, take the work off the main thread: **Web Workers** for CPU-heavy computation (parsing, image processing, search indexes), `OffscreenCanvas` for drawing, and doing less work in the first place: virtualise long lists, paginate, debounce input handlers and memoise expensive derivations. React's concurrent features (`startTransition`, `useDeferredValue`) apply the same idea inside rendering: urgent updates first, the rest interruptibly.

## Interview checklist

- Explain why a long task blocks input and rendering, and what INP measures.
- Write a chunked loop that yields on a time budget, and explain why microtasks don't yield.
- Explain when to use `requestAnimationFrame`, `requestIdleCallback`, `setTimeout` and `scheduler.postTask`.
- Explain layout thrashing and fix it by batching reads and writes.
- Decide when to move work to a Web Worker instead.
