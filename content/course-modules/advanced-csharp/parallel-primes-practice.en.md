## Task

Two classic data-parallel patterns.

1. **`CountParallel(from, to)`** counts primes in `[from, to)` with the `Parallel.For` overload that has **thread-local state**:
   - `localInit: () => 0L` gives each worker its own subtotal;
   - the body returns `local + 1` when `IsPrime(i)`, otherwise `local`;
   - `localFinally` adds each worker's subtotal to the shared result with `Interlocked.Add`.

   Updating one shared counter from every iteration would be a race (or, with a lock, slow). The result must equal the sequential count.

2. **`FirstPrimes(start, count)`** returns the first `count` primes `>= start`, **in order**, with PLINQ: `Enumerable.Range(...)` → `AsParallel()` → `AsOrdered()` → `Where(IsPrime)` → `Take(count)` → `ToList()`. Without `AsOrdered()`, the five primes you get may not be the smallest five, and may come back in any order.

Expected output:

```
primes up to 200000: 17984 (sequential 17984)
1000003, 1000033, 1000037, 1000039, 1000081
```
