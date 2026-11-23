Two small statistics and text tools, each with a LINQ solution.

- `Median(IEnumerable<double> values)`: the median of the values. Sort them; for an odd count, the middle value; for an even count, the average of the two middle values. For no values, return `0`. Do not change the input sequence;
- `Bigrams(string text)`: the **bigrams** of the text: every two adjacent characters, in order, as a string. `"hello"` gives `he`, `el`, `ll`, `lo`. A text of one character gives no bigrams.

The method `ShowAll` is ready. Do not change `Main`. Expected output:

```text
4
5.5
he el ll lo

3
```

The lines in order: the median of `5, 1, 9, 3` (sorted `1, 3, 5, 9`; the average of `3` and `5`); the median of `2, 7, 4, 10` (the average of `4` and `7`); the bigrams of `hello`; the bigrams of `a`, which is an empty line; and the number of different bigrams of `abcabc`, which is `3` (`ab`, `bc`, `ca`).

Hint: `values.OrderBy(v => v).ToList()` sorts the values. `Enumerable.Range(0, text.Length - 1)` gives the starting positions of the bigrams; use `Math.Max(0, ...)` so that a one-letter text gives an empty range.
