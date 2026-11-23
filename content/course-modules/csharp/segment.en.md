A segment is built from two points, and it is a nice example of objects that **contain other objects**. The class `Point` (with `X`, `Y`, a constructor and `ToString()`, which prints `(x, y)`) is **already written**. Write the class `Segment`.

A `Segment` has:

- a constructor `Segment(a, b)` with two `Point` objects;
- the property `Length`: the distance between the two points;
- the method `Midpoint()`: a **new** `Point` in the middle;
- the method `Contains(p)`: `true` if the point `p` lies **on the segment**, endpoints included. The point must be on the straight line through `a` and `b`, **and** inside the box that the two points span. Compare the cross product with zero using a small tolerance such as `1e-9`;
- the property `IsHorizontal`: `true` when both points have the same `Y`;
- the method `Translate(dx, dy)`: returns a **new** segment, moved by the given amounts. The original must stay unchanged.

Do not change `Main`. Expected output:

```text
10
(3, 4)
True
False
False
True
(4, 5)
(3, 4)
True
False
```

The lines in order, for the segment from `(0, 0)` to `(6, 8)`: its length; its midpoint; whether `(3, 4)` lies on it; whether `(3, 5)` does (it is off the line); whether `(9, 12)` does (it is on the line, but beyond the end); whether the endpoint `(0, 0)` does; the midpoint of the translated segment; the midpoint of the **original** (unchanged); and `IsHorizontal` for a horizontal segment and for this one.

Hint: for a point `p`, the cross product is `(b.X − a.X)·(p.Y − a.Y) − (b.Y − a.Y)·(p.X − a.X)`. It is 0 for points on the line. Then check that `p.X` is between `Math.Min(a.X, b.X)` and `Math.Max(a.X, b.X)`, and the same for `Y`.
