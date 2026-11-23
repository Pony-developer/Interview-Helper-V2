The class `Point` is ready, and so is the helper `ShowAll`, which prints any sequence on one line. Write three methods that take a `List<Point>`:

- `Outside(List<Point> points, int radius)`: the points whose distance from the origin is greater than `radius`. Compare the squared distance `X*X + Y*Y` with `radius*radius`, so that no square roots are needed. Keep the original order;
- `AverageX(List<Point> points)`: the average of the `X` coordinates, as a `double`;
- `YsDescending(List<Point> points)`: the `Y` coordinates, sorted from the largest to the smallest.

Do not change `Main`. Expected output:

```text
(3, 4) (-5, 0)
0.25
4 2 2 0
```

The lines in order: the points outside a circle of radius `3`; the average of `1, 3, -5, 2`, which is `0.25`; and the `Y` values `2, 4, 0, 2` in descending order.

Hint: `Where`, `Average(p => p.X)` and `Select(p => p.Y).OrderByDescending(y => y)` are enough. The average of integers must be computed as a `double`: `Average` over `int` gives a `double`, so this works directly.
