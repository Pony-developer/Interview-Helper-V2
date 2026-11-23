The methods `Filter`, `Sort` and `Transform` take a lambda as a parameter. `Main` passes `null` in place of each lambda. Replace every `null` with a lambda that does what the comment says:

- the lambda for `Filter`: keeps the numbers greater than `10`;
- the lambda for `Sort`: a `Comparison<string>` that orders the words by length, and for equal lengths alphabetically (use `string.CompareOrdinal`);
- the lambda for `Transform` on numbers: doubles each number;
- the lambda for `Transform` on words: the first letter, as a text (`w.Substring(0, 1)`).

The methods `Show`, `Filter`, `Sort` and `Transform` are ready, except that `Filter`, `Sort` and `Transform` need the lambda. Do not change `Main`. Expected output:

```text
12 30
fig kiwi pear apple
10 24 14 60 4
f k p a
```

The lines in order: the numbers above `10`; the sorted words (`fig` is the shortest, and `kiwi` and `pear` have the same length); the doubled numbers; and the first letters of the sorted words.

Hint: the parameter type of `Filter` is `Func<T, bool>`, of `Transform` is `Func<T, R>`, and of `Sort` is `Comparison<T>`. In the comparison lambda, compare lengths first: `a.Length != b.Length ? a.Length.CompareTo(b.Length) : string.CompareOrdinal(a, b)`.
