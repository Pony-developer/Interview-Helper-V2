## Task

Write two iterators in `Seq`.

1. **`Batch<T>(IEnumerable<T> source, int size)`** splits a sequence into `List<T>` batches of `size` items; the last batch may be shorter. If `size < 1`, it must throw `ArgumentOutOfRangeException` **as soon as `Batch` is called**, not later when somebody enumerates. Since an iterator's body is deferred, split it in two: `Batch` validates and then returns the result of a private iterator method (or local function) that contains the `yield return`s.

2. **`Primes()`** is an **infinite** sequence of prime numbers. It never ends by itself; `Main` stops after 10 with `break`.

Expected output:

```
1,2,3
4,5,6
7
rejected eagerly
2 3 5 7 11 13 17 19 23 29 
```
