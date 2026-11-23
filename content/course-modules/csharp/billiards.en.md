On a billiard table, the cue ball is at the point `(1, 2)` and the pocket is at `(4, 6)`. To pot the ball you need to know how far it must travel, in which direction to hit it, and how long it will roll.

Implement three methods, keeping the code clean:

- `Distance(x1, y1, x2, y2)`: the straight-line distance between two points, `√((x2 − x1)² + (y2 − y1)²)`.
- `AngleDegrees(x1, y1, x2, y2)`: the direction from the first point to the second, in degrees, measured from the x axis. Use `Math.Atan2(dy, dx)`, which returns radians, and convert them to degrees: `degrees = radians · 180 / π`.
- `TravelTime(distance, speed)`: the time to cover the distance at a constant speed.

The constant `CueSpeed` (2.5) is already declared. Do not change `Main`. Expected output:

```text
Distance: 5
Angle: 53.13
Time: 2
```

Hint: `Math.Sqrt` gives the square root, and `Math.Atan2` takes `y` first and `x` second.
