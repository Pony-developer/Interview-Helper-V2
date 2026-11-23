Write two methods that return **tuples**.

1. `Stats(int[] values)` returns `(int Min, int Max, double Average)` of the array. For an empty array it throws an `ArgumentException` with the message `The array is empty`.
2. `SplitName(string fullName)` returns `(string First, string Last)`: the part before the first space and the part after it. A name without a space has the whole text as `First` and an empty `Last`.

Do not change `Main`. It reads the results in both ways: by **deconstruction** (`var (min, max, average) = ...`) and by **element names** (`stats.Min`). Expected output:

```text
4 42 18
7 7 7
Lovelace, Ada
[Plato] []
The array is empty
```

Hint: a tuple is created with parentheses: `return (min, max, (double)sum / values.Length);`. Without the cast to `double`, the division would be an integer one.
