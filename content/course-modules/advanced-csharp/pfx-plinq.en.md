## Why parallel programming

CPU clock speeds stopped growing years ago; machines got more cores instead. Code that runs on one thread uses one core. **Parallel Framework (PFX)** helps you spread **CPU-bound** work across all cores:

| Layer | API | Style |
| --- | --- | --- |
| Data parallelism | PLINQ (`AsParallel`), `Parallel.For`/`ForEach` | same operation on many items |
| Task parallelism | `Task`, `Parallel.Invoke`, `Task.WhenAll` | different operations at once |
| Coordination | concurrent collections, `BlockingCollection`, `Channel<T>` | producers and consumers |

Parallelism is **not** the tool for I/O-bound work (waiting for HTTP or a database): use async for that.

## Amdahl's law in one sentence

If 20% of the work is inherently sequential, no number of cores can make it more than 5× faster. Also: splitting work, scheduling and merging results costs time, so tiny workloads often get **slower** in parallel. Measure.

## PLINQ

Add `.AsParallel()` to a LINQ to Objects query and the following operators run on multiple threads:

```csharp
int primeCount = Enumerable.Range(1, 5_000_000)
    .AsParallel()
    .Where(IsPrime)
    .Count();

var thumbnails = photos
    .AsParallel()
    .WithDegreeOfParallelism(4)                 // cap the threads
    .WithCancellation(ct)
    .Select(p => CreateThumbnail(p))
    .ToList();
```

What happens: PLINQ **partitions** the input, runs the query on several threads, and **merges** the results.

Things to know:

- **Order isn't preserved** by default. `AsOrdered()` restores it (extra cost); `AsUnordered()` drops it again later in the query.
- **Side effects** in lambdas must be thread-safe: no `list.Add` from inside `Select`.
- Some operators force sequential execution or buffering; `ForAll(action)` runs an action in parallel without merging results back to one thread.
- Results come back through a merge buffer; `WithMergeOptions(ParallelMergeOptions.NotBuffered)` streams them sooner.
- Exceptions are collected into an `AggregateException`.
- PLINQ is for in-memory data; it has nothing to do with EF Core queries.

## When PLINQ helps

Good: expensive per-item computation (image processing, parsing, simulations, hashing) over many items.
Bad: cheap operations like `x * 2` over small lists (overhead dominates), anything I/O-bound, queries whose result order matters but you forgot `AsOrdered`.

## Interview takeaways

- PFX = PLINQ + `Parallel` + tasks + concurrent collections, for CPU-bound work.
- `AsParallel()` partitions, runs on many threads and merges; order is lost unless `AsOrdered()`.
- Parallelism has overhead; measure, and use async (not PLINQ) for I/O.
