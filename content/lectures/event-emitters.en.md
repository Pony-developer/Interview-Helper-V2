---
skill: event-emitters
title: "Events and pub/sub: EventEmitter, EventTarget and their sharp edges"
summary: "The publish/subscribe model and why it decouples code, Node's EventEmitter and the DOM's EventTarget compared, synchronous dispatch and listener order, once, removing listeners during emit, the special error event, max-listener warnings and leaks, CustomEvent, and turning events into promises and async iterators."
readingMinutes: 9
---

In the publish/subscribe model, a producer **emits** named events and any number of consumers **subscribe** to them without knowing about each other. It's how the DOM reports clicks, how Node streams and servers report data and errors, and how many apps decouple features (an event bus, a store's change notifications). Interviews often ask you to implement an emitter, and then probe the edge cases.

## Two built-in implementations

| | Node `EventEmitter` | DOM / web `EventTarget` |
| --- | --- | --- |
| Subscribe / unsubscribe | `on`/`addListener`, `off`/`removeListener` | `addEventListener`, `removeEventListener` |
| Payload | any arguments: `emit("data", a, b)` | an `Event` object: `dispatchEvent(new CustomEvent("x", { detail }))` |
| Duplicates | the same function can be added several times | the same function + options is added once |
| One-time | `once` | `{ once: true }` |
| Cleanup | `off`, `removeAllListeners` | `removeEventListener`, or `{ signal }` from an `AbortController` |
| Errors | an `"error"` event with no listener **throws** | a throwing listener is reported, and other listeners still run |

`EventTarget` is also available in Node, and `CustomEvent` carries data in `detail`. DOM events add propagation (capture, target, bubble), `preventDefault` and `stopPropagation`, which plain emitters don't have.

## Dispatch is synchronous

`emit` and `dispatchEvent` call listeners **immediately, in registration order**, before returning. Consequences:

- Code after `emit(…)` runs after every listener has finished, so slow listeners slow the emitter.
- A listener that throws (in `EventEmitter`) stops the remaining listeners and propagates to the code that called `emit`.
- If you need async delivery, schedule it explicitly (`queueMicrotask`, `setImmediate`).
- `emit` returns `true` if there were listeners and `false` otherwise.

## Edge cases interviewers ask about

- **Removing during emit**: Node copies the listener array before calling them, so a listener removed (or added) during an emit still runs (or doesn't) for that emit and the change applies from the next one.
- **`once`** wraps the listener so it removes itself before running; `off(event, originalFn)` must still be able to remove it, so wrappers keep a reference to the original.
- **The `"error"` event**: emitting `"error"` with no listener throws the error (or a generic one), which crashes a Node process. Always handle `"error"` on streams, sockets and other emitters.
- **Leaks**: every listener keeps its closure alive for as long as the emitter lives. Node warns ("MaxListenersExceededWarning") when more than 10 listeners are added for one event, a common sign of subscribing in a loop or on every request without unsubscribing.
- **`newListener` and `removeListener`** meta-events and `prependListener` exist in Node for advanced cases.

## From events to promises and streams

- `await once(emitter, "ready")` (from `node:events`, or a few lines of your own code) turns a single event into a promise that rejects if `"error"` fires first and supports an `AbortSignal`.
- `for await (const [msg] of on(emitter, "message"))` turns a stream of events into an async iterator.
- Observables (RxJS) go further: they compose event streams with operators like `debounceTime`, `switchMap` and `takeUntil`, and unsubscribe for you.

## Design guidance

- Return an **unsubscribe function** from `on` (as many libraries do), so cleanup is hard to forget.
- Keep listeners small and non-throwing, or catch errors per listener if one subscriber shouldn't break the others.
- Type your events (a map from event name to payload) in TypeScript.
- Don't overuse a global event bus: invisible coupling through string event names makes data flow hard to follow. Prefer explicit calls or state management for core logic.

## Interview checklist

- Implement `on`, `off`, `once` and `emit`, including removal during emit and `off` for `once` listeners.
- Explain synchronous dispatch and what happens when a listener throws.
- Explain Node's `"error"` event rule and the max-listeners warning.
- Compare `EventEmitter` with `EventTarget`/`CustomEvent`.
- Turn an event into a promise with a timeout or `AbortSignal`.
