A loop can contain another loop. The inner loop runs **completely** on every iteration of the outer one.

```csharp
for (int row = 0; row < 3; row++)
{
    for (int col = 0; col < 4; col++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}
```

```text
****
****
****
```

The outer loop counts the rows. For each row, the inner loop prints four stars on one line (`Console.Write` does not move to a new line), and then `Console.WriteLine()` ends the row. The body of the inner loop runs 3 × 4 = **12** times.

## The pattern for a grid

Almost every picture made of characters has the same skeleton:

```csharp
for (int row = 0; row < height; row++)
{
    for (int col = 0; col < width; col++)
    {
        // decide which character belongs at (row, col)
        Console.Write(...);
    }
    Console.WriteLine();   // finish the row
}
```

The whole art is in the decision. For each cell, ask: what do I know about `row` and `col`?

| Picture | Rule for the cell `(row, col)` |
| --- | --- |
| a filled rectangle | always `*` |
| a frame | `*` if `row == 0 \|\| row == height - 1 \|\| col == 0 \|\| col == width - 1`, otherwise a space |
| a checkerboard | `#` if `(row + col) % 2 == 0`, otherwise `.` |
| the main diagonal | `*` if `row == col` |
| the other diagonal | `*` if `row + col == size - 1` |
| a triangle | `*` if `col <= row` |

The triangle, for example:

```csharp
for (int row = 0; row < 4; row++)
{
    for (int col = 0; col <= row; col++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}
```

```text
*
**
***
****
```

Here the inner loop depends on the outer counter: its limit is `row`, so each line is one star longer.

## A multiplication table

```csharp
for (int i = 1; i <= 3; i++)
{
    for (int j = 1; j <= 3; j++)
    {
        Console.Write(i * j + " ");
    }
    Console.WriteLine();
}
```

```text
1 2 3 
2 4 6 
3 6 9 
```

Note the trailing space after the last number of each line. When the exact output matters, as it does in the practice tasks, avoid that, for example by writing the separator only **between** the items.

## Names and rules

- Give the counters meaningful names: `row` and `col`, or `i` and `j`. Do not use the same name in both loops: the inner `i` would clash with the outer one.
- The inner loop starts again from the beginning on every outer iteration, so declare its counter **inside** the outer loop.
- `break` and `continue` affect **only the innermost** loop. To leave both loops at once, put them in a method and use `return`, or use a flag.

```csharp
static bool HasPair(int target)
{
    for (int a = 1; a < 10; a++)
    {
        for (int b = 1; b < 10; b++)
        {
            if (a * b == target) return true;   // leaves both loops
        }
    }
    return false;
}
```

## The cost

If both loops repeat `n` times, the body runs `n × n` times. Ten times as much data means a hundred times as much work. This is **O(n²)** (see the lecture on Big O): fine for a chessboard, a problem for a million items.
