---
skill: nodejs
title: "Node.js essentials: the event loop, streams and the runtime"
summary: "How Node.js runs JavaScript on the server, its event loop phases, non-blocking I/O, streams and backpressure, modules, error handling and scaling across cores."
readingMinutes: 8
---

Node.js runs JavaScript outside the browser on V8, with **libuv** providing an event loop, a thread pool and non-blocking I/O. Frontend developers meet it in tooling, SSR (Next.js) and BFF APIs.

## Non-blocking I/O

Node handles thousands of connections on one JavaScript thread because I/O doesn't block: it starts the operation, registers a callback, and keeps serving other requests. The flip side: **CPU-heavy work blocks everyone**. A 2-second JSON transform freezes every request.

```js
const data = fs.readFileSync("big.json");        // ✗ blocks the event loop
const data = await fs.promises.readFile("big.json"); // ✓ non-blocking
```

Offload CPU work to **worker threads**, a separate service or a queue.

## Event loop phases

libuv cycles through phases: **timers** (`setTimeout`/`setInterval`) → pending callbacks → **poll** (I/O) → **check** (`setImmediate`) → close callbacks. Between callbacks, Node drains microtasks: `process.nextTick` first, then promise callbacks.

```js
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
// nextTick, promise, then timeout/immediate (their order varies in the main module)
```

Recursive `process.nextTick` can starve I/O, so prefer `setImmediate` to yield.

## Modules

Node supports **CommonJS** (`require`, `module.exports`) and **ES modules** (`import`, `"type": "module"` or `.mjs`). ESM can `import` CJS; CJS loads ESM via dynamic `import()` (newer versions also support `require` of synchronous ESM). Built-ins use the `node:` prefix: `import fs from "node:fs/promises"`.

## Streams and backpressure

Streams process data in chunks instead of loading everything into memory:

```js
import { pipeline } from "node:stream/promises";
await pipeline(fs.createReadStream("in.log"), zlib.createGzip(), fs.createWriteStream("in.log.gz"));
```

`pipeline` handles **backpressure** (pausing a fast reader when the writer is slow) and propagates errors and cleanup. Manual `.pipe()` chains don't forward errors.

## Error handling

- Async/await with `try/catch`; always handle promise rejections. An unhandled rejection crashes the process in modern Node.
- Operational errors (network down, invalid input) should be handled. Programmer errors (bugs) should crash and restart via a process manager.
- `EventEmitter` "error" events without a listener throw.

## Using all CPU cores

One Node process uses one core for JavaScript. Scale with multiple processes (the `cluster` module, PM2, containers behind a load balancer) and keep processes stateless, with sessions in Redis or a database.

## Configuration and security

Read config from environment variables (`process.env`), validate it at startup, never log secrets, keep dependencies updated (`npm audit`), and set timeouts on outbound requests.

## Interview checklist

- Explain why Node is fast for I/O and slow for CPU-bound work.
- Order `nextTick`, promises, timers and `setImmediate`.
- Stream large files with `pipeline` and explain backpressure.
- Describe how to scale across cores and handle errors safely.
