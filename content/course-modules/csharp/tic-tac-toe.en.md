A tic-tac-toe board is a 3 × 3 array of characters: `X`, `O` or `.` for an empty cell. The method `Parse` that builds the board from a text such as `"XXX/OO./..."` is already written, with `/` between the rows.

Implement `Winner(board)`. It returns:

- `'X'` if `X` has three in a row: in a row, in a column or on one of the two diagonals;
- `'O'` if `O` has three in a row;
- `'-'` if nobody has won, whether the game is a draw or not finished yet.

An empty cell `.` never counts: three dots in a row do not make a winner.

Do not change `Parse` or `Main`. Expected output:

```text
X
O
X
X
-
-
O
```

The boards in `Main` include a win in a row, in a column, on each diagonal, a full board without a winner and an unfinished game.

Hint: two checks inside one loop over `i = 0..2` cover all three rows and all three columns: `board[i, 0]`, `board[i, 1]`, `board[i, 2]` and `board[0, i]`, `board[1, i]`, `board[2, i]`. Then check the diagonals separately.
