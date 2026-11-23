Two rectangles lie on a plane, and their sides are parallel to the axes. A rectangle is given by its lower-left corner `(x1, y1)` and upper-right corner `(x2, y2)`, with `x1 < x2` and `y1 < y2`.

Implement `Relation(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2)` for the rectangles `A` and `B`. It returns one of three words:

- `disjoint`: the rectangles have **no common points** at all.
- `touch`: they have common points, but only on the border: a shared piece of a side, or a single corner. The common part has no area.
- `overlap`: the common part has a **positive area**. This includes the case when one rectangle lies inside the other, and the case of equal rectangles.

Examples:

| A | B | Result |
| --- | --- | --- |
| (0,0)–(4,4) | (5,5)–(8,8) | `disjoint` |
| (0,0)–(4,4) | (4,0)–(8,4) | `touch` (a shared side) |
| (0,0)–(4,4) | (4,4)–(8,8) | `touch` (a shared corner) |
| (0,0)–(4,4) | (2,2)–(6,6) | `overlap` |
| (0,0)–(4,4) | (4,5)–(8,8) | `disjoint` (the `x` ranges touch, but the `y` ranges are apart) |

Do not change `Main`. Expected output:

```text
disjoint
touch
touch
overlap
overlap
disjoint
disjoint
overlap
touch
```

Hint: the common part of the two `x` ranges is `Math.Min(ax2, bx2) - Math.Max(ax1, bx1)` long. Work out the same for `y`. What does a negative, a zero and a positive length mean?
