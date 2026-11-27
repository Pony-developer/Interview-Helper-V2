## Task

Four small problems, each solved with one LINQ expression and no explicit loops.

1. **`RunningTotals`**: `[3, 1, 4, 1, 5]` → `[3, 4, 8, 9, 14]`. Use `Aggregate` with a `List<int>` as the seed, appending the previous total plus the current item.
2. **`Pairs`**: pairs each item with the next one: `Zip` the list with itself shifted by one (`items.Skip(1)`).
3. **`LongWords`**: split the text on spaces, commas, dots and `!`, keep words longer than 3 letters, and remove duplicates **ignoring case** while keeping the first spelling met (`Distinct` with `StringComparer.OrdinalIgnoreCase`).
4. **`MostFrequentLetter`**: count letters only, ignoring case; return the most frequent, and on a tie the alphabetically first (`GroupBy`, `OrderByDescending(count)`, `ThenBy(key)`).

Expected output:

```
3 4 8 9 14
Kyiv-Lviv Lviv-Odesa Odesa-Dnipro
This code that Always TEST tests
l
a
35
```
