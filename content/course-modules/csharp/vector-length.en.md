A vector on a plane is a pair `(x, y)`. Its coordinates are hidden, and the outside code works with its **length** and direction. Write the class `Vector`:

- the **private** fields for `x` and `y`, and the read-only properties `X` and `Y`;
- the constructor `Vector(x, y)`, and the constructor without parameters for the zero vector, which **calls the first one** with `: this(0, 0)`;
- the **static factory** `FromPolar(length, degrees)`: the vector of this length that points at this angle from the axis `x`, counter-clockwise (`x = length · cos`, `y = length · sin`, with the angle in radians: `degrees · π / 180`);
- the property **`Length`**:
  - `get` returns `√(x² + y²)`;
  - `set` **changes the length and keeps the direction**: both coordinates are multiplied by `new length / old length`. A **negative** value throws an `ArgumentOutOfRangeException`. For a **zero** vector, which has no direction, a positive length throws an `InvalidOperationException` (and `0` is accepted, and changes nothing);
- `ToString()`: `(x, y)` with each number rounded to 2 decimal places, such as `(0.5, 0.87)`.

Do not change `Main`. Expected output:

```text
(3, 4)
5
(6, 8)
10
(0, 0)
(0, 2)
(0.5, 0.87)
negative length
(6, 8)
no direction
(0, 0)
```

The lines in order: the vector `(3, 4)` and its length; the vector after `Length = 10` (it is stretched to `(6, 8)`) and its new length; the zero vector; `FromPolar(2, 90)` (it points up); `FromPolar(1, 60)`; the rejected negative length, and the vector is unchanged; the rejected attempt to give a length to the zero vector; and the zero vector after `Length = 0`.

Hint: `Math.Cos` and `Math.Sin` need radians. `Math.Round(value, 2)` rounds the numbers for `ToString`; the text of a `double` has no `.0` for whole numbers. Do the checks in the setter **before** you change the fields.
