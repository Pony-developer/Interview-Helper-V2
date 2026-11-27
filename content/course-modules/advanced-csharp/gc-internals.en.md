## Reachability

An object is **alive** while it's reachable from a **root**:

- local variables and parameters in active stack frames (and CPU registers);
- static fields;
- GC handles (pinned objects, objects passed to native code);
- the finalization queue.

The GC starts from the roots, **marks** everything reachable by following references, and treats the rest as garbage. Cycles don't matter: two objects referencing each other but unreachable from any root are both collected.

The JIT is precise about locals: an object can be collected **before** the method returns if the variable isn't used any more. (`GC.KeepAlive(obj)` extends that when native code still uses the object.)

## Allocation is cheap

The managed heap allocates by bumping a pointer: `new` is usually just "advance the pointer and zero the memory". The cost of allocation is paid later, in collections.

## Mark, sweep, compact

A collection:

1. **pauses** managed threads (at safe points);
2. **marks** reachable objects;
3. **compacts**: slides live objects together, updating every reference, so free space is one contiguous block again (no fragmentation);
4. resumes the threads.

## Generations

The **generational hypothesis**: most objects die young (temporary strings, LINQ iterators, request DTOs), while objects that survive a while tend to live long (caches, singletons).

| Generation | Contains | Collected |
| --- | --- | --- |
| Gen 0 | newly allocated objects | very often, very fast (a few ms or less) |
| Gen 1 | survivors of one gen-0 collection (a buffer) | often |
| Gen 2 | long-lived survivors | rarely; a "full" collection |

A gen-0 collection looks only at gen 0 (plus references into it from older objects, tracked by a **card table** updated by a write barrier). That's why it's cheap.

**Mid-life crisis**: objects that live just long enough to reach gen 2 and then die (e.g. cached for a few seconds) are expensive, because they're only reclaimed by full collections.

## The Large Object Heap

Objects of **85,000 bytes or more** (big arrays and strings) go to the **LOH**:

- they're logically part of gen 2, collected only in full collections;
- the LOH isn't compacted by default (copying is costly), so it can fragment;
- you can request one compaction with `GCSettings.LargeObjectHeapCompactionMode = CompactOnce`.

Pooling big buffers (`ArrayPool<T>.Shared`) avoids repeatedly allocating on the LOH.

.NET 5 added the **Pinned Object Heap** for buffers allocated pinned up front (`GC.AllocateArray<T>(n, pinned: true)`), so they don't fragment the normal heap.

## GC modes

| Setting | Effect |
| --- | --- |
| **Workstation** GC | one heap; tuned for desktop responsiveness |
| **Server** GC | a heap and a GC thread per core; higher throughput, more memory. Default in ASP.NET Core |
| **Concurrent / background** GC | gen-2 collections run mostly alongside your threads, shortening pauses (on by default) |
| `GCSettings.LatencyMode` | `SustainedLowLatency` avoids blocking full collections during critical periods |

Configure in the project (`<ServerGarbageCollection>true</ServerGarbageCollection>`) or `runtimeconfig.json`.

## Forcing a collection

`GC.Collect()` exists, but calling it in application code is almost always wrong: it promotes objects to older generations and disrupts the GC's own tuning. Legitimate uses: benchmarks, tests that check for leaks, after a one-off huge temporary allocation in a batch tool.

Useful diagnostics: `GC.CollectionCount(gen)`, `GC.GetTotalMemory(false)`, `GC.GetGCMemoryInfo()`, and the `dotnet-counters` tool (next module).

## Interview takeaways

- Liveness = reachability from roots; cycles aren't a problem.
- Three generations: gen 0 is collected cheaply and often; gen 2 rarely and expensively.
- Objects ≥ 85 KB go to the LOH, which isn't compacted by default.
- Server GC for throughput (ASP.NET Core default); don't call `GC.Collect` in normal code.
