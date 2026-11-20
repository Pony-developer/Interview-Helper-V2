---
skill: event-loop
title: "The event loop: tasks, microtasks and rendering"
summary: "How a single-threaded runtime schedules work: the call stack, task (macrotask) and microtask queues, where promises, await, timers and rendering fit, how to predict output order, and how to keep long work from freezing the page."
readingMinutes: 9
---

JavaScript runs your code on **one thread**. Only one piece of JavaScript executes at a time, and it runs to completion: nothing interrupts a function halfway. Everything asynchronous (timers, network, user input) is handled by the browser or Node, which later **queues a callback**. The **event loop** decides which queued callback runs next.

## The pieces

- **Call stack.** The functions currently executing. When it's empty, the loop can pick new work.
- **Task queue (macrotasks).** Callbacks from `setTimeout`, `setInterval`, I/O, `MessageChannel`, and user events. The loop runs **one task at a time**.
- **Microtask queue.** Promise reactions (`then`, `catch`, `finally`), the continuation after `await`, `queueMicrotask`, and `MutationObserver`. After every task, the loop **drains the whole microtask queue**, including microtasks queued by other microtasks.
- **Rendering.** In browsers, between tasks the loop may update the screen: run `requestAnimationFrame` callbacks, then recalculate style and layout, then paint. That happens at most about once per display frame.

One turn of the loop, simplified:

```
run one task → run all microtasks → (maybe) rAF callbacks + render → repeat
```

The initial script is itself a task, so its microtasks run before any timer.

## Predicting output

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
queueMicrotask(() => console.log("D"));
console.log("E");
// A E C D B
```

Rules of thumb:

1. Synchronous code first, top to bottom, including the **executor** of `new Promise(...)` and an `async` function's body up to its first `await`.
2. Then microtasks, in the order they were queued; new ones join the back of the same queue.
3. Then the next task (the earliest due timer, an event, …), followed by its microtasks.

`await x` pauses the async function and schedules the rest of it as a microtask once `x` settles. Awaiting a value or a native promise costs one microtask tick; awaiting a non-native thenable costs extra ticks, because its `then` is called in a job first.

`setTimeout(fn, 0)` means "no earlier than now". Browsers clamp nested timers to about 4 ms, and the callback waits for every task ahead of it.

## Starvation and long tasks

Because microtasks are drained completely, a microtask that keeps scheduling microtasks never lets the loop reach rendering or input, and the page freezes, just like a `while (true)` loop. A function that reschedules itself with `setTimeout` lets other tasks and rendering run in between.

Any task longer than about 50 ms is a **long task**: clicks and frames wait for it, which hurts Interaction to Next Paint (INP). To keep the UI responsive:

- split work into chunks and **yield** between them (`await new Promise(r => setTimeout(r, 0))`, or `scheduler.yield()` where supported);
- move heavy computation to a **Web Worker**;
- use `requestAnimationFrame` for visual updates and `requestIdleCallback` for low-priority work.

## Errors and timing

`try/catch` only covers code that runs **synchronously** inside it. An error thrown in a `setTimeout` callback later escapes to `window.onerror`; a rejected promise without a handler fires `unhandledrejection`. Catch inside the callback, or `await` the promise inside `try`.

## Node.js differences

Node's loop has phases (timers, poll for I/O, check for `setImmediate`, close callbacks). `process.nextTick` callbacks run before promise microtasks. Inside an I/O callback, `setImmediate` always fires before a `setTimeout(…, 0)`; in the main module their order can vary.

## Interview checklist

- Explain task vs microtask with examples of each.
- Predict the output of mixed `setTimeout`, `then`, `await` and `queueMicrotask` code.
- Explain why an infinite microtask loop freezes the page but a `setTimeout` loop doesn't.
- Describe how to break up a long task and why it matters for INP.
