A "snake" maze has a single winding corridor. Implement `PrintSnake(width, height)`, where `width` and `height` are odd numbers, both at least 5.

The rules:

- The first and the last column are always walls `#`, and so are the first and the last row.
- The rows 1, 3, 5, ... are **corridors**: free cells `.` between the walls.
- The rows 2, 4, 6, ... are **partitions**: walls all along, except for a one-cell **gap**.
- The gaps alternate: the first partition (row 2) has its gap at the **right** end (column `width − 2`), the next one at the **left** end (column 1), then right again, and so on.

For `width = 7` and `height = 7`:

```text
#######
#.....#
#####.#
#.....#
#.#####
#.....#
#######
```

Do not change `Main`. Expected output:

```text
#######
#.....#
#####.#
#.....#
#.#####
#.....#
#######
---
#########
#.......#
#######.#
#.......#
#########
```

Hint: for a partition row, the gap is on the right when `row % 4 == 2`, and on the left when `row % 4 == 0`.
