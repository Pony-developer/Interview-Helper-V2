Find the distance from a point to a **segment**, which is a finite piece of a line between the points `A` and `B`. This differs from the distance to the whole line: if the point lies "beyond" an end of the segment, the nearest point of the segment is that end.

Implement `DistanceToSegment(px, py, ax, ay, bx, by)`, in three steps:

1. Let `d = B − A`, so `dx = bx − ax` and `dy = by − ay`. If `A` and `B` coincide (`dx` and `dy` are both zero), the answer is simply the distance from `P` to `A`.
2. Otherwise, compute the position of the projection of `P` on the line `AB` as a fraction of the segment:

   `t = ((px − ax) · dx + (py − ay) · dy) / (dx² + dy²)`

   If `t < 0`, the nearest point is `A`, and if `t > 1`, it is `B`. So squeeze `t` into the range from 0 to 1.
3. The nearest point is `(ax + t · dx, ay + t · dy)`. Return its distance to `P`.

Examples, with the segment from `(0, 0)` to `(4, 0)`:

- the point `(2, 3)` projects inside the segment, and the distance is `3`;
- the point `(-3, 4)` is beyond `A`, so the distance is `5` (to `A`);
- the point `(7, 4)` is beyond `B`, so the distance is `5` (to `B`).

Do not change `Main`, which rounds each result to two decimals. Expected output:

```text
3
5
5
0
5
0
1.41
```

Hint: write a small helper `Distance(x1, y1, x2, y2)` and reuse it, instead of repeating the square-root formula.
