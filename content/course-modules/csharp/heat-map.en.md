A heat map shows a table of numbers as a picture: the larger the value, the "hotter" the symbol. The temperatures here are whole numbers from 0 to 9, and each one has its own symbol in the ramp `".:-=+*#%@X"`: the symbol at position 0 is for the value 0, and the symbol at position 9 is for the value 9.

Implement two methods for a rectangular array `int[,] grid`:

- `Render(grid)` prints the map, one text line per row. For every cell it prints the ramp symbol that belongs to its value.
- `Hottest(grid)` finds the largest value and returns its position as the text `"row,column"` (counting from 0). If the largest value occurs more than once, return the **first** one in reading order: row by row, left to right.

For the grid in `Main`:

```text
0 1 2 1 0
1 3 5 3 1
2 5 9 5 2
1 3 5 3 1
```

the picture is `.:-:.`, `:=*=:`, `-*X*-`, `:=*=:`, and the hottest cell is in row 2, column 2.

Do not change `Main`. Expected output:

```text
.:-:.
:=*=:
-*X*-
:=*=:
2,2
X.
.X
0,0
```

The second map has two cells with the value 9, and the answer is the first of them.

Hint: use `grid.GetLength(0)` for the rows and `grid.GetLength(1)` for the columns, and index the string `Ramp` (a constant that is already declared) with the value, like an array of characters.
