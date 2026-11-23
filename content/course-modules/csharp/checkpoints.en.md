A robot walks over a grid of `rows × cols` cells. It starts in the top-left cell `(0, 0)` and must reach the bottom-right cell `(rows − 1, cols − 1)`. It may move only **one step right** (`col + 1`) or **one step down** (`row + 1`).

On the way, the robot must pass through **checkpoints**, cells that are visited **in the given order**. Count the number of different paths.

Implement `CountPaths(rows, cols, checkRows, checkCols)`, where `checkRows[i]` and `checkCols[i]` are the coordinates of the `i`-th checkpoint. It returns a `long`.

The rules:

- With no checkpoints, count all the paths from the start to the end.
- The checkpoints are visited in the order of the arrays. If a checkpoint cannot be reached from the previous one (it lies **above** or **to the left** of it), there is no path: the answer is `0`.
- A checkpoint that coincides with the start or the end is satisfied automatically.

Examples: in a 3 × 3 grid there are 6 paths. If the robot must pass through the middle cell `(1, 1)`, there are 4 (2 ways to get there, times 2 ways to leave).

Be careful with the size: in a 17 × 17 grid, there are **601 080 390** paths. A plain recursion that follows every path one by one makes more than a billion calls, and takes far too long. Use **memoization**: the number of paths from a cell depends only on the cell, so calculate it once.

Do not change `Main`. Expected output:

```text
6
4
36
24
601080390
165636900
0
6
18
```

The cases in order: a 3 × 3 grid with no checkpoints; with the checkpoint `(1, 1)`; a 5 × 5 grid with `(2, 2)`; with `(1, 1)` and `(3, 3)`; a 17 × 17 grid with no checkpoints; with `(8, 8)`; a 5 × 5 grid with the checkpoints in the wrong order `(3, 3)`, `(1, 1)`; a 3 × 3 grid with `(0, 0)`; and a 4 × 6 grid with `(1, 2)` and `(2, 4)`.

Hint: the whole path splits into **segments** between consecutive points (the start, the checkpoints, the end). The number of paths is the **product** of the numbers of paths of the segments. For one segment, the number of paths with `down` steps down and `right` steps right is `Paths(down, right) = Paths(down − 1, right) + Paths(down, right − 1)`, with 1 when either is 0.
