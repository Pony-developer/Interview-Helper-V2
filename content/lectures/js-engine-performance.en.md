---
skill: js-engine-performance
title: "JS engines, memory and benchmarking: making code fast without guessing"
summary: "How engines like V8 parse, interpret and JIT-compile JavaScript, hidden classes and inline caches, what causes deoptimisation, how garbage collection works and the usual memory leaks, and how to measure performance honestly instead of trusting microbenchmarks."
readingMinutes: 10
---

Most performance problems in JavaScript apps come from doing too much work (too many renders, requests or DOM writes), not from slow language features. But knowing how engines execute code explains why some patterns are much faster than others, why memory grows, and why naive benchmarks lie.

## How an engine runs your code

Modern engines (V8 in Chrome and Node, SpiderMonkey in Firefox, JavaScriptCore in Safari) use a **tiered** pipeline:

1. **Parse** source into an AST. Functions that aren't called yet are only pre-parsed, which is why shipping less JavaScript speeds up start-up.
2. **Interpret** bytecode (V8's Ignition) while collecting **type feedback**: which shapes of objects and which types each operation sees.
3. **Optimise** hot functions with JIT compilers (V8's Sparkplug, Maglev and TurboFan), which generate machine code that assumes the types seen so far.
4. **Deoptimise** back to bytecode when an assumption breaks, for example when a function that always got integers receives a string.

## Hidden classes and inline caches

Engines give objects internal **shapes** (hidden classes or "maps") describing their property layout. Objects created the same way, with the same properties added in the same order, share a shape, so a property read can be compiled to "load from offset 16". An **inline cache** at each property access remembers the shapes it has seen:

- **Monomorphic** (one shape): fastest.
- **Polymorphic** (a few shapes): still fast.
- **Megamorphic** (many shapes): falls back to a slow generic lookup.

Practical consequences:

- Initialise all properties in the constructor, in the same order; avoid adding properties later or using `delete` on hot objects (set to `undefined` instead).
- Keep arrays of one element kind (all small integers, all doubles, or all objects) and avoid holes: `new Array(1000)` creates a holey array that stays slower.
- Keep functions monomorphic: don't pass wildly different object types to the same hot function.

These are guidelines for hot paths, not rules for all code. Measure before restructuring.

## Garbage collection and memory leaks

JavaScript frees memory automatically by **reachability**: anything not reachable from roots (globals, the stack, active closures) can be collected. V8 uses a **generational** collector: most objects die young, so a fast "scavenger" cleans the young generation often, and a slower mark-sweep-compact handles the old generation, mostly concurrently and incrementally to keep pauses short.

A **leak** is memory that stays reachable even though you no longer need it. Common sources:

- Event listeners, `setInterval` timers and subscriptions that are never removed, which keep their closures and everything they capture alive.
- Detached DOM nodes still referenced from JavaScript (a cached list, a closure).
- Ever-growing caches and maps keyed by objects: bound them (LRU), or use `WeakMap` when the key's lifetime should decide.
- Closures capturing large objects they don't need, and accidental globals.

Find leaks with heap snapshots in DevTools: take a snapshot, repeat an action several times, take another, and compare what keeps growing, following retainer paths back to the root.

## Benchmarking honestly

Microbenchmarks like "is `for` faster than `forEach`?" are easy to get wrong:

- **Timer resolution**: `Date.now()` has 1 ms granularity, and browsers coarsen `performance.now()` for security. Run enough iterations to measure well above the resolution.
- **Warm-up and JIT**: the first runs are interpreted and later ones optimised, so results depend on what ran before. Discard warm-up runs.
- **Dead-code elimination**: if the result isn't used, the optimiser may delete the work you're "measuring". Consume the result.
- **Unrealistic inputs**: constant inputs let the engine specialise in ways real data won't allow.
- **Noise**: GC pauses, other tabs and CPU throttling. Repeat runs and compare medians or distributions with a margin of error, not a single number.

Use a benchmarking library (Benchmark.js, tinybench, mitata, Vitest's `bench`) that handles warm-up and statistics, and remember that a 2× difference in a loop that takes 0.1% of the time doesn't matter. Profile the real app first (the Performance panel, `--cpu-prof` in Node), find the hot path, then optimise it and measure again.

## Tuning techniques that matter

- Do less work: memoise pure computations, cache results, batch DOM reads and writes, debounce and throttle event handlers.
- Choose better algorithms and data structures (`Set.has` vs `array.includes` in a loop).
- Avoid blocking the main thread: split long tasks (`scheduler.yield()`, `setTimeout`) or move them to a Web Worker.
- Avoid allocating in hot loops when it measurably matters (reusing objects, typed arrays).
- Proper tail calls are in the spec, but only Safari implements them, so don't rely on deep recursion; convert it to a loop or an explicit stack.

## Interview checklist

- Describe the parse → interpret → JIT → deopt pipeline.
- Explain hidden classes, inline caches and mono/poly/megamorphic access, with two coding guidelines that follow.
- Explain generational GC and reachability, and list four common leak sources and how to find them.
- List the pitfalls of microbenchmarks and how a good benchmark avoids them.
- Explain why profiling the real app comes before micro-optimising.
