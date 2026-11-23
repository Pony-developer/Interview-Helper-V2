Implement `Middle(a, b, c)`. It returns the **middle** of three whole numbers: the one that would be in the second place if you sorted them.

Examples:

- `Middle(1, 2, 3)` is `2`, and so is `Middle(3, 1, 2)`: the order of arguments does not matter.
- `Middle(5, 5, 1)` is `5`: when two numbers are equal, the repeated value is the middle one.
- `Middle(-1, -5, -3)` is `-3`.

Do not sort anything: write the conditions with `if`. Do not change `Main`. Expected output:

```text
2
2
5
-3
7
4
10
```

Hint: a number is the middle one when it lies between the other two, in either order. Check `a`, then `b`, and the remaining one is `c`.
