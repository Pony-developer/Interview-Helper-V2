A maze is drawn with characters: `#` is a wall, `.` is a free cell, `S` is the start and `E` is the exit.

Implement `PrintMaze(width, height)`, which draws an **empty** maze: the walls only around the edge, and free cells inside. The start `S` is in the first free cell, in the top-left corner inside the walls (row 1, column 1), and the exit `E` is in the last free cell, in the bottom-right corner inside the walls (row `height − 2`, column `width − 2`). The width and the height are at least 4.

For `width = 7` and `height = 5`:

```text
#######
#S....#
#.....#
#....E#
#######
```

Do not change `Main`. Expected output:

```text
#######
#S....#
#.....#
#....E#
#######
---
####
#S.#
#.E#
####
```

Hint: use two nested loops, and for each cell check, in this order: is it on the border (a wall)? Is it the start? Is it the exit? Otherwise it is free.
