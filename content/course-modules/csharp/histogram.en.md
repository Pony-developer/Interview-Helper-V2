A histogram shows numbers as bars. Implement `PrintHistogram(values)`, which draws vertical bars for an array of digits (each value from 0 to 9).

- A column is one value, and a bar of height `v` is `v` cells high, growing up from the bottom.
- A filled cell is `#`, and an empty one is `.`.
- Under the bars come a line of `-`, as long as the array, and then a line with the values themselves.
- The picture is as tall as the largest value. For an array with only zeros there are no bar rows at all.

For `{ 3, 1, 4, 2 }`:

```text
..#.
#.#.
#.##
####
----
3142
```

Do not change `Main`. Expected output:

```text
..#.
#.#.
#.##
####
----
3142
===
#..
#..
#..
#.#
#.#
---
502
```

(The line `===` is printed by `Main` to separate the two histograms.)

Hint: find the maximum first. Then count the **level** from the maximum down to 1, and in each row print `#` for the columns with `values[i] >= level`, and `.` for the others.
