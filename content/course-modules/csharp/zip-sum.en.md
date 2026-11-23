Write the iterator `ZipSum(IEnumerable<int> a, IEnumerable<int> b)`. It walks **both** sequences side by side, and yields the sum of each pair of items. When one sequence ends, it stops. It must be lazy: it reads the items only when they are requested.

The methods `Evens`, `Countdown` and `Print` are ready. Do not change `Main`. Expected output:

```text
11 22 33
6 8

2 3 4
```

The lines in order: `1 2 3` with `10 20 30`; `1 2 3 4` with `5 6`, which stops at the shorter one; two empty sequences give an empty line; and the evens `0 2 4` with the countdown `2 1 0` give `2 3 4`.

Hint: get an enumerator for each sequence with `GetEnumerator()`, and use `MoveNext()` and `Current`. Wrap the enumerators in `using` blocks, so that they are disposed. Inside the loop `while (first.MoveNext() && second.MoveNext())`, yield `first.Current + second.Current`.
