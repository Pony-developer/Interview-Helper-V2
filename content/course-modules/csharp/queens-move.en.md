On a chessboard, a queen moves any number of squares along a **row**, a **column** or a **diagonal**. A square is given as a pair `(x, y)`, the column and the row, each from 1 to 8.

Implement `CanQueenMove(fromX, fromY, toX, toY)`. It returns `true` when the queen can get from the first square to the second in one move, and `false` otherwise. Staying on the same square is not a move.

Examples:

- `(1, 1)` to `(1, 8)`: the same column, so `True`.
- `(3, 5)` to `(6, 2)`: a diagonal, so `True`.
- `(1, 1)` to `(2, 3)`: a knight's jump, so `False`.

Do not change `Main`. Expected output:

```text
True
True
True
True
False
False
False
True
```

Hint: two squares lie on one diagonal when the distance between the columns equals the distance between the rows. Use `Math.Abs`.
