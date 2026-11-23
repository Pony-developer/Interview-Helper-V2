Sort points **counter-clockwise** around the origin `(0, 0)`: start from the positive direction of the axis `x` (to the right) and go **up** and around, in the direction opposite to the hands of a clock.

The class `Point` is ready. Write the class `AngleComparer`, which implements `IComparer<Point>`, so that `Array.Sort(points, new AngleComparer())` gives this order:

1. a smaller **angle** goes first. The angle of a point is measured from the positive direction of `x`, counter-clockwise, from `0` (included) to a full turn (excluded). So `(1, 0)` is at 0°, `(1, 1)` at 45°, `(0, 2)` at 90°, `(-2, 0)` at 180°, `(0, -1)` at 270°, and `(1, -1)` at 315°;
2. if two points have the **same angle** (they lie on one ray from the origin), the one **closer** to the origin goes first.

No point is the origin itself. Do not change `Main`. Expected output:

```text
(1, 0) (3, 0) (1, 1) (0, 2) (0, 5) (-1, 1) (-2, 0) (-1, -1) (0, -1) (1, -1)
-1
1
0
-1
```

The first line is the sorted array. The next four lines are the signs of `Compare`: the point `(1, 0)` against `(0, 1)` (`-1`: it has a smaller angle), `(0, 1)` against `(1, 0)` (`1`), `(1, 0)` against itself (`0`), and `(1, 0)` against `(3, 0)` (`-1`: the same angle, but it is closer).

Hint: `Math.Atan2(y, x)` gives the angle in radians, from `-π` to `π`. For the points below the axis `x` it is negative, so add `2 * Math.PI` to bring it into the range from `0` to `2π`. Compare the two angles with `CompareTo`; if they are equal (`0`), compare the squared distances `x * x + y * y`. In this task, the points of the same angle lie on the axes, where the angle is computed exactly.
