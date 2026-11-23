Implement `PrintX(size)`. It prints a square of `size` rows and `size` columns, in which both diagonals are drawn with `*` and every other cell is `.`.

For `size = 7`:

```text
*.....*
.*...*.
..*.*..
...*...
..*.*..
.*...*.
*.....*
```

A cell `(row, col)`, counting from 0, lies on:

- the main diagonal (from the top-left to the bottom-right) when `row == col`;
- the other diagonal (from the top-right to the bottom-left) when `row + col == size − 1`.

For an odd `size` the diagonals cross in the middle cell, and for an even one they do not touch.

Do not change `Main`. Expected output:

```text
*.....*
.*...*.
..*.*..
...*...
..*.*..
.*...*.
*.....*
---
*..*
.**.
.**.
*..*
```
