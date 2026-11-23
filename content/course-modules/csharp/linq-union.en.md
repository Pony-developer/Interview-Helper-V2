Write four methods that combine two arrays of numbers, each with a LINQ method. Each returns an `IEnumerable<int>`:

- `AllValues(int[] a, int[] b)`: all the numbers of `a` followed by all the numbers of `b`, duplicates included (`Concat`);
- `UniqueValues(int[] a, int[] b)`: the distinct numbers of both arrays, in the order of their first appearance (`Union`);
- `Common(int[] a, int[] b)`: the distinct numbers that are in both arrays, in the order of `a` (`Intersect`);
- `OnlyInFirst(int[] a, int[] b)`: the distinct numbers of `a` that are not in `b` (`Except`).

The method `ShowAll` is ready. Do not change `Main`. Expected output:

```text
1 2 3 2 2 4 3
1 2 3 4
2 3
1
```

The lines in order: `AllValues` (keeps everything); `UniqueValues` (each number once); `Common` (`2` and `3`); and `OnlyInFirst` (only `1` is in `a` and not in `b`).

Hint: each of the four methods is one LINQ call: `a.Concat(b)`, `a.Union(b)`, `a.Intersect(b)` and `a.Except(b)`.
