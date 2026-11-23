Marking the whole heap on every collection would be slow. The .NET GC relies on an observation called the **generational hypothesis**: most objects die young. A temporary string, a list built inside a method, the result of a LINQ step: they are garbage a few microseconds after they were created.

## Three generations

- **Generation 0**: every new small object starts here. Gen 0 is small and collected very often, and each collection takes little time, because it looks only at the young objects.
- **Generation 1**: the objects that survived one collection. It is a buffer between young and old.
- **Generation 2**: long-lived objects: caches, singletons, data loaded at startup. A gen 2 collection is a **full** collection of the whole heap, and it is the expensive one.

An object that survives a collection is **promoted** to the next generation. A gen 0 collection does not look into gen 2 at all, except for the few old objects that were recently changed to point to young ones (the runtime tracks them).

## The Large Object Heap

An object of **85,000 bytes or more** (in practice, a big array or string) goes straight to the **Large Object Heap** (LOH). It is collected together with gen 2, and by default it is **not compacted**, because moving big blocks is expensive. Frequent large temporary arrays therefore cause full collections and fragmentation. The cure is to reuse buffers, for example with `ArrayPool<T>.Shared`.

## What this means for your code

- Short-lived objects are cheap. Do not be afraid of small temporary objects.
- Objects that live "a little too long" are expensive: they survive into gen 2 and then die there (the "mid-life crisis"). A cache that keeps items for a few minutes is a typical source.
- Fewer allocations mean fewer collections: `StringBuilder` instead of `+` in a loop, no boxing, structs for small values, reused buffers.

## Modes

- **Workstation GC** (desktop apps): one heap, designed for short pauses.
- **Server GC** (the default for ASP.NET Core): a heap and a GC thread per core, more throughput, more memory.
- **Background GC**: gen 2 is collected while the program keeps running.

## Do not call `GC.Collect()`

The GC tunes its budgets by watching the program. A forced collection promotes live objects to older generations and usually makes things worse. For diagnostics, use `GC.CollectionCount(0)`, `GC.GetTotalMemory(false)`, and tools such as `dotnet-counters` and `dotnet-gcdump`.

## The rule

Young garbage is cheap, old garbage is expensive. Keep temporary objects temporary, avoid large temporary arrays, and leave the timing of collections to the GC.
