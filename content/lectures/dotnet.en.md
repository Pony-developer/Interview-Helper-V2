---
skill: dotnet
title: ".NET runtime: CLR, JIT, memory and the garbage collector"
summary: "How C# becomes running code (IL, JIT, tiered compilation, AOT), assemblies and the BCL, the managed heap and stack, generational GC and the LOH, IDisposable and the Dispose pattern, finalizers, and Span<T>."
readingMinutes: 9
---

"What happens between `dotnet build` and your code running?" and "how does the garbage collector work?" are the two platform questions almost every .NET interview asks. Middle and Senior candidates are expected to connect them to performance.

## From C# to machine code

1. The C# compiler (Roslyn) turns source into **IL** (Intermediate Language) plus metadata, packed into an **assembly** (`.dll`).
2. At run time the **CLR** (Common Language Runtime) loads the assembly, verifies types and hands each method to the **JIT** compiler the first time it is called.
3. **Tiered compilation** first produces quick, unoptimised code (tier 0), counts calls, and recompiles hot methods with full optimisations (tier 1). Dynamic PGO uses the counts to optimise for the real workload.
4. **ReadyToRun** precompiles to cut start-up time; **Native AOT** compiles the whole app ahead of time, with no JIT at all (fast start, small memory, but limited reflection).

The **BCL** (Base Class Library) is the standard library: collections, I/O, threading, networking. **.NET Framework** is the old Windows-only runtime; **.NET (Core) 5+** is the cross-platform, open-source one you should target today. The **SDK** contains the compiler and the `dotnet` CLI; the **runtime** is what a server needs to run the app.

## Stack and managed heap

Each thread has a **stack** with frames for method calls: local value types and references live there and disappear when the method returns. Objects created with `new` (class instances, arrays, boxed values, strings) live on the **managed heap** and are cleaned up by the garbage collector. Allocation on the heap is cheap (a pointer bump); collecting is what costs.

## The garbage collector

The GC is **generational**, based on the observation that most objects die young:

- **Gen 0**: new objects. Collected often and fast.
- **Gen 1**: survivors of one collection, a buffer between short- and long-lived data.
- **Gen 2**: long-lived objects (caches, singletons). Full collections are expensive.
- **LOH** (Large Object Heap): objects of 85,000 bytes and more. Collected only with gen 2 and not compacted by default, so it fragments. Pool big buffers (`ArrayPool<T>`).

A collection marks everything reachable from **roots** (static fields, locals on the stack, CPU registers, GC handles), then sweeps and compacts the rest. **Workstation** GC suits desktop apps; **Server** GC uses a heap and a GC thread per core and is the default for ASP.NET Core. **Concurrent/background** GC does most gen 2 work while your threads keep running.

Typical leaks in a GC world: static collections that only grow, event handlers never unsubscribed, caches without expiry, and timers that hold `this`.

## IDisposable and the Dispose pattern

The GC frees memory, not **unmanaged resources** (file handles, sockets, database connections). Types that own them implement `IDisposable`, and callers release them deterministically:

```csharp
using var conn = new SqlConnection(cs); // Dispose() at the end of the scope
await using var stream = File.OpenRead(path); // IAsyncDisposable
```

A **finalizer** (`~MyType()`) is a safety net that runs on the finalizer thread at some unknown time after the object becomes unreachable. It makes the object survive an extra collection, so only types that directly own an unmanaged handle should have one. The full pattern is `Dispose()` calling `Dispose(true)` plus `GC.SuppressFinalize(this)`, and the finalizer calling `Dispose(false)`. In modern code, wrap handles in `SafeHandle` and you rarely need a finalizer at all.

## Allocation-free code

- `Span<T>` and `ReadOnlySpan<T>` are views over arrays, stack memory (`stackalloc`) or native memory, so slicing does not copy. They are `ref struct`s: they can't be boxed, captured by lambdas or used across `await`.
- `Memory<T>` is the heap-friendly version you can store in fields and use in async code.
- `StringBuilder`, `ArrayPool<T>`, `ValueTask` and structs avoid allocations in hot paths. Measure with BenchmarkDotNet and `dotnet-counters`, don't guess.

## Interview checklist

- Walk from C# source to running code: IL, assembly, CLR, JIT, tiered compilation, AOT.
- Explain generations, the LOH and what a GC root is.
- Explain why `IDisposable` exists when there is a GC, and what a finalizer costs.
- Name three ways to leak memory in .NET.
- Say when `Span<T>` helps and why it can't cross an `await`.
