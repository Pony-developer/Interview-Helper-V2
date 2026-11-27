## Task

Write three extension methods.

1. **`string.Truncate(int maxLength)`**: if the text is longer than `maxLength`, cut it so that the result, **including** a trailing `"..."`, is exactly `maxLength` characters long. Shorter text is returned unchanged. A `null` receiver returns `null` (an extension method can be called on null!). `maxLength < 3` throws `ArgumentOutOfRangeException`.
2. **`IEnumerable<int>.MinMax()`** returns a named tuple `(int Min, int Max)` computed in **one pass**. An empty sequence throws `InvalidOperationException` with the message `Sequence contains no elements`.
3. **`IEnumerable<int?>.AverageOrNull()`** returns the average of the non-null values as a `double?`, or `null` when there are none.

Note how `Main` deconstructs the tuple (`var (min, max) = ...`), reads it by name (`range.Min`) and prints it whole (`(7, 7)`).

Expected output:

```
Hello, ex...
short
(null)
min=-2 max=9
7..7 (7, 7)
Sequence contains no elements
4
no data
-1
```
