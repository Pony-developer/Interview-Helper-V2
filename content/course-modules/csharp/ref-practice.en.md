The class `Counter` is a struct, and `Main` already uses three methods that do not exist yet. Write them in the class `Program`, above `Main`:

- `Swap(ref int a, ref int b)`: exchanges the values of the two variables;
- `Double(ref int x)`: doubles the value;
- `Reset(ref Counter counter)`: sets the field `Value` of the counter to `0`.

Each method must **change the caller's variable**, so use `ref`. Do not change `Main` or the struct `Counter`. Expected output:

```text
7 3
14
0
2
8
8
```

The lines in order: the swap of `3` and `7`; the doubling of `7` (after the swap, `a` holds `7`) gives `14`; `Reset` makes the counter `0`; adding `2` after the reset gives `2`; three doublings of `1` give `8`; and `Swap(ref x, ref x)` leaves `8` unchanged, because the two parameters are the same variable.

Hint: `Swap` needs a temporary variable: `int t = a; a = b; b = t;`. `Double` is `x = x * 2;`. `Reset` changes the field of the struct that the parameter refers to: `counter.Value = 0;`.
