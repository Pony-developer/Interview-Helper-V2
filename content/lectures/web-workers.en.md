---
skill: web-workers
title: "Web Workers: JavaScript off the main thread"
summary: "Why the main thread must stay free, dedicated, shared and service workers compared, postMessage and the structured clone algorithm, transferable objects, module workers and bundlers, RPC with request IDs (Comlink), OffscreenCanvas, SharedArrayBuffer with cross-origin isolation, and when workers aren't worth it."
readingMinutes: 8
---

The browser's **main thread** runs your JavaScript, handles input, and does style, layout and paint. A task that takes 300 ms (parsing a large file, image processing, a heavy search index, syntax highlighting) blocks all of that: clicks lag, animations stutter, and Interaction to Next Paint suffers. A **Web Worker** runs JavaScript on a separate thread, so the page stays responsive.

## Creating a worker

```js
// main.js
const worker = new Worker(new URL("./search.worker.js", import.meta.url), { type: "module" });
worker.postMessage({ type: "query", text: "react" });
worker.onmessage = (event) => render(event.data);
worker.onerror = (event) => console.error(event.message);

// search.worker.js
self.onmessage = (event) => {
  const results = runExpensiveSearch(event.data.text);
  self.postMessage(results);
};
```

The `new URL(…, import.meta.url)` form is understood by Vite and webpack, which bundle the worker file separately. `worker.terminate()` stops it immediately.

## What a worker can and can't do

Workers have their own global scope (`self`), event loop and memory. They **can** use `fetch`, WebSockets, IndexedDB, timers, `crypto`, WebAssembly and `OffscreenCanvas`. They **can't** touch the DOM, `window` or `localStorage`. All communication happens through messages.

| Kind | Scope | Typical use |
| --- | --- | --- |
| Dedicated worker | one page | heavy computation for that page |
| Shared worker | all same-origin tabs | one shared connection or cache across tabs |
| Service worker | network proxy for a scope, runs without open pages | offline caching, push, background sync |

## Messages: structured clone and transfer

`postMessage` copies data with the **structured clone algorithm**. It supports plain objects, arrays, `Date`, `Map`, `Set`, `RegExp`, typed arrays, `Blob` and cyclic references, but **not** functions or DOM nodes (they throw `DataCloneError`), and class instances arrive as plain objects without their prototype or methods.

Copying is not free: posting a 100 MB array clones 100 MB on the sending thread. For binary data, **transfer** ownership instead:

```js
const buffer = new ArrayBuffer(50_000_000);
worker.postMessage(buffer, [buffer]); // moved, not copied
buffer.byteLength; // 0: the main thread can no longer use it
```

`ArrayBuffer`, `MessagePort`, `ImageBitmap`, `OffscreenCanvas` and streams are transferable.

## Request/response over messages (RPC)

Messages are one-way, so request/response needs a protocol: give each request an **id**, keep a map of pending promises, and resolve the one whose id comes back. Without ids, two concurrent requests can get each other's answers. Add timeouts and error messages. **Comlink** wraps all of this so you can `await api.search("react")` on a worker as if it were local.

## Shared memory

`SharedArrayBuffer` lets threads share the same memory, with `Atomics` for safe updates and waiting, which is useful for WebAssembly threads and real-time audio. After Spectre it's only available when the page is **cross-origin isolated**: serve it with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (or `credentialless`). Check `crossOriginIsolated` at runtime.

## Patterns and pitfalls

- **Worker pool**: create about `navigator.hardwareConcurrency - 1` workers and hand out tasks from a queue instead of creating a worker per task (start-up costs tens of milliseconds and memory).
- **Chunk progress**: post progress messages for long jobs, and support cancellation (`terminate()` or a "cancel" message).
- **Don't over-use**: for short tasks, cloning data and coordination cost more than they save. First measure, then try algorithmic fixes, chunking with yields or `requestIdleCallback`.
- **Errors** inside the worker don't reach your `try/catch` on the main thread: listen to `error` and `messageerror`, and send error responses explicitly.
- **OffscreenCanvas** moves rendering (charts, maps, games) into a worker: `canvas.transferControlToOffscreen()` and post it to the worker.

## Interview checklist

- Explain why long tasks on the main thread hurt responsiveness and how workers help.
- Compare dedicated, shared and service workers.
- Explain structured clone limits and transferable objects.
- Design a request/response protocol with ids, errors and timeouts.
- Explain the requirements for `SharedArrayBuffer` and when workers aren't worth the overhead.
