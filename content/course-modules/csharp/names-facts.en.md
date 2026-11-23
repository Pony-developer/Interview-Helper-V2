Names make nice material for arrays of strings. `Main` has a list of seven names, and you will find a few facts about them.

Implement three methods:

- `Longest(names)` returns the longest name. If several are equally long, return the **first** of them. For an empty array, return an empty string `""`.
- `CountEndingWith(names, letter)` returns how many names end with the given letter. The comparison is exact, so `'a'` and `'A'` are different. Use `name[name.Length - 1]` for the last letter.
- `AverageLength(names)` returns the average length of a name as a `double`, or `0` for an empty array. Be careful with integer division.

For the names `Olena, Bohdan, Iryna, Taras, Oksana, Andriy, Maryna`, the lengths are 5, 6, 5, 5, 6, 6 and 6, which add up to 39. Four of the names end with `a`, and one ends with `y`.

Do not change `Main`, which rounds the average to two decimal places. Expected output:

```text
Bohdan
4
1
5.57
[]
0
```

Hint: for the average, sum the lengths in an `int`, and then divide with `(double)` or `/ 1.0` so that the fraction is not lost.
