A robot stands on a grid at the point `(x, y)` and faces one of four directions: `N` (north), `E` (east), `S` (south) or `W` (west). **North** is the direction in which `y` grows, and **east** is the one in which `x` grows.

Implement `Execute(x, y, direction, command)`. It carries out **one** command and returns the new state as the text `"x y direction"`:

| Command | Action |
| --- | --- |
| `L` | turn 90° left, staying on the same square |
| `R` | turn 90° right, staying on the same square |
| `F` | move one square forward, in the direction it faces |
| `B` | move one square backward, without turning |
| anything else | ignore the command: the state does not change |

Examples:

- `Execute(0, 0, "N", "F")` gives `0 1 N`.
- `Execute(2, 3, "W", "L")` gives `2 3 S`: turning left from west makes it face south.
- `Execute(1, 1, "W", "B")` gives `2 1 W`: moving backward from a west-facing position goes east.

Do not change `Main`. Expected output:

```text
0 1 N
0 0 E
3 3 E
2 2 S
2 3 S
0 0 W
2 1 W
1 0 N
1 1 N
```

Hint: `switch` is a natural fit here. A good design splits the work into small methods, for instance `TurnLeft` and `TurnRight`, which return the new direction.
