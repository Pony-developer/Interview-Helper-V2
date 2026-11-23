A vector on a plane is a pair of numbers `(x, y)`: a direction and a length. It is a good first class with **behaviour**: it knows how to add, scale and measure itself.

Write the class `Vector` (above `Program`). It is **immutable**: once created, a vector never changes, and every operation returns a **new** vector.

- a constructor `Vector(x, y)` with `double` values;
- the read-only properties `X` and `Y`;
- the property `Length`: `√(x² + y²)`;
- the method `Dot(other)`: the **dot product** `x₁·x₂ + y₁·y₂`, a `double`;
- the method `Normalized()`: a vector with the same direction and the length 1 (each component divided by the length);
- the operators `+` and `-` for two vectors, and `*` for a vector and a `double`;
- `ToString()`: the text `(x, y)`, such as `(3, 4)`;
- a **static** property `Zero` for the vector `(0, 0)`.

The operators are `public static Vector operator +(Vector a, Vector b)` and so on. Do not change `Main`. Expected output:

```text
(3, 4)
5
(4, 2)
(6, 8)
-5
(0.6, 0.8)
(0, 0)
(2, 6)
```

The lines in order: the vector `(3, 4)` itself; its length; the sum with `(1, -2)`; the product by 2; the dot product with `(1, -2)`, which is `3·1 + 4·(−2) = −5`; the normalized vector; the static zero vector; and the difference with `(1, -2)`.

Hint: `Math.Sqrt` gives the length. In `ToString`, `"(" + X + ", " + Y + ")"` prints whole `double` values without a decimal point: `3`, not `3.0`.
