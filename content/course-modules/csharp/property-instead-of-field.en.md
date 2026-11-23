The class `Rectangle` below keeps the **area** in a field, and it is calculated only once, in the constructor. When the width changes, the area stays **old**: the data contradicts itself. Also, anybody can write `0` or `-5` into the width.

Replace the public fields with **properties**:

- `Width` and `Height`: properties that can be read and written. A value of **zero or less** is rejected with an `ArgumentOutOfRangeException`, and the old value stays. The constructor uses the same properties, so `new Rectangle(-1, 5)` also throws;
- `Area` and `Perimeter`: **computed** read-only properties, which are always right;
- `IsSquare`: a computed read-only property, `true` when the width equals the height.

Do not change `Main`. Expected output:

```text
12
14
40
28
rejected
4
False
True
100
bad rectangle
```

The lines in order: the area and the perimeter of the rectangle 3 × 4; the same after the width becomes 10 (`40` and `28`: no stale values); an attempt to set the height to 0 (`rejected`), and the height is still 4; whether it is a square (`False`); the height changes to 10, and it is a square now (`True`); the new area (`100`); and the creation of the rectangle with the width −1 (`bad rectangle`).

Hint: a full property needs a private backing field, `private int width;`, with the check in `set`. `Area` and the others are one line each: `public int Area => Width * Height;`. When a value is computed, there is nothing to update, and nothing to forget.
