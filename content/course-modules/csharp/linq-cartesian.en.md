The **Cartesian product** of two sequences is every pair of an item from the first with an item from the second. In LINQ, `SelectMany` builds it: for each item of the first sequence, a `Select` over the second.

Write two methods:

- `Board(char[] letters, int[] numbers)`: returns the names of all squares, such as `A1`, `A2`, `B1`, `B2`. The letters are the outer loop;
- `Sums(int[] a, int[] b)`: returns the sum of every pair, with the items of `a` in the outer loop.

The method `ShowAll` is ready. Do not change `Main`. Expected output:

```text
A1 A2 B1 B2
11 21 12 22
4
```

The lines in order: the squares of the board; the sums of every pair (`1+10`, `1+20`, `2+10`, `2+20`); and the number of pairs in `Sums`, which is `4`.

Hint: `letters.SelectMany(l => numbers.Select(n => l.ToString() + n))` builds the board. The same shape works for `Sums`, with `a` in place of `letters`.
