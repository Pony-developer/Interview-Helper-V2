Implement `PrintBoard(size)`. It prints a square chessboard with `size` rows and `size` columns, where `#` is a dark square and `.` is a light one. The top-left square is dark, and the colours alternate along every row and every column.

For `size = 3`:

```text
#.#
.#.
#.#
```

Think about what the squares of one colour have in common: the sum `row + col` is even for dark squares and odd for light ones, if you count from 0.

Do not change `Main`. Expected output:

```text
#.#.#.#.
.#.#.#.#
#.#.#.#.
.#.#.#.#
#.#.#.#.
.#.#.#.#
#.#.#.#.
.#.#.#.#
---
#.#
.#.
#.#
```

Hint: a nested loop over the rows and the columns, and in the inner loop one `if` (or `? :`) with the condition `(row + col) % 2 == 0`.
