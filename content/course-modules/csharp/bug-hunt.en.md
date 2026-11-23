Four small methods compile and run, but **each one has a logic error**. Find the bugs and fix them, without changing `Main`.

- `Average(a, b)` is the arithmetic mean of two whole numbers, and it may have a fractional part.
- `ToFahrenheit(c)` converts Celsius to Fahrenheit: `F = C × 9 / 5 + 32`.
- `Percent(part, total)` is what percentage `part` makes of `total`.
- `Perimeter(w, h)` is the perimeter of a rectangle.

Expected output:

```text
1.5
212
25
14
```

Hint: the bugs come from the lecture topics: integer division and operator precedence. Work out the right answers by hand first, then see which method prints something else.
