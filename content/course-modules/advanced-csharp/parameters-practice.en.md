## Task

Complete the three methods of `Params`:

1. **`Swap<T>(ref T a, ref T b)`** swaps the caller's two variables. It must work for any type.
2. **`TryParsePoint(string text, out int x, out int y)`** parses text like `"3,4"` or `" 10 , -2 "` (spaces around the numbers are allowed). On success it sets `x` and `y` and returns `true`. On any invalid input (not exactly two parts, or a part that is not a number) it returns `false` and sets **both** `x` and `y` to `0`. Remember: an `out` parameter must be assigned on every path.
3. **`Sum(params int[] values)`** returns the sum of its arguments, `0` when there are none.

Expected output:

```
a=2 b=1
right left
'3,4' -> True (3, 4)
' 10 , -2 ' -> True (10, -2)
'7' -> False (0, 0)
'x,1' -> False (0, 0)
0
5
10
30
```
