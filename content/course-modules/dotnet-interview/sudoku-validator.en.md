## Task

"Write a program that checks whether a 9×9 Sudoku grid is filled in correctly."

Complete **`Sudoku.IsValid(int[,] grid)`**. A grid is valid when:

- every **row** contains each digit 1..9 exactly once;
- every **column** contains each digit 1..9 exactly once;
- every one of the nine **3×3 boxes** contains each digit 1..9 exactly once.

Any value outside 1..9 (for example an empty cell stored as `0`) makes the grid invalid.

Aim for one pass over the grid with a "seen" marker per row, column and box (a `bool[10]` or a bit mask). A neat trick: in the `i`-th iteration you can check row `i`, column `i` and box `i` at the same time — the `j`-th cell of box `i` is at row `(i / 3) * 3 + j / 3`, column `(i % 3) * 3 + j % 3`.

The last test grid is a Latin square: every row and column is fine, but the boxes are not — so don't forget the boxes.

Expected output:

```
valid: True
swapped in a row: False
with a zero: False
rows and columns only: False
```
