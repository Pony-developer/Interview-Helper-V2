A **jagged array** is an array whose elements are themselves arrays. The inner arrays may have different lengths, which is where the name comes from.

```csharp
int[][] rows = new int[3][];   // an array of 3 references, all null for now
rows[0] = new int[] { 1 };
rows[1] = new int[] { 2, 3 };
rows[2] = new int[] { 4, 5, 6 };
```

```text
rows ──▶ [ ● ● ● ]
           │ │ └──▶ [ 4, 5, 6 ]
           │ └────▶ [ 2, 3 ]
           └──────▶ [ 1 ]
```

## Creating one

```csharp
int[][] a = new int[3][];                     // the rows do not exist yet
a[0] = new int[2];                            // each row is created separately

int[][] b =                                   // with values
{
    new[] { 1 },
    new[] { 2, 3 },
    new[] { 4, 5, 6 },
};
```

Note the second pair of brackets in the type, `int[][]`, and the **empty** brackets in `new int[3][]`: only the first size is given.

## Indexing

Two separate index operations, one in each pair of brackets:

```csharp
Console.WriteLine(b[2][1]);        // 5: row 2, then element 1
Console.WriteLine(b[1].Length);    // 2: the length of one row
Console.WriteLine(b.Length);       // 3: the number of rows
```

Compare `b[2][1]` with the rectangular `grid[2, 1]`.

If a row was not created yet, `a[0]` is `null`, and `a[0][1]` throws a `NullReferenceException`.

## Walking over it

```csharp
for (int i = 0; i < b.Length; i++)
{
    for (int j = 0; j < b[i].Length; j++)
    {
        Console.Write(b[i][j] + " ");
    }
    Console.WriteLine();
}
```

```text
1 
2 3 
4 5 6 
```

The inner loop uses the length of **this** row, `b[i].Length`, because the rows differ. With `foreach`:

```csharp
foreach (int[] row in b)
{
    foreach (int value in row)
    {
        Console.Write(value + " ");
    }
    Console.WriteLine();
}
```

## An example: Pascal's triangle

Each number is the sum of the two above it, so row `i` has `i + 1` numbers. This shape is natural for a jagged array:

```csharp
int[][] triangle = new int[5][];
for (int i = 0; i < triangle.Length; i++)
{
    triangle[i] = new int[i + 1];
    triangle[i][0] = 1;
    triangle[i][i] = 1;
    for (int j = 1; j < i; j++)
    {
        triangle[i][j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
    }
}
```

```text
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
```

## Jagged or rectangular?

| | Rectangular `int[,]` | Jagged `int[][]` |
| --- | --- | --- |
| Row lengths | all equal | each row has its own |
| Indexing | `a[r, c]` | `a[r][c]` |
| Memory | one block | one array of references plus one array per row |
| Creating | `new int[3, 4]` | `new int[3][]`, then every row |
| Length of a row | `GetLength(1)` | `a[r].Length` |
| Good for | boards, images, matrices | triangles, lists of lists, a table of rows of different sizes |

If all the rows have the same length, the rectangular array is simpler. If they do not, or you want to **replace or swap whole rows**, choose the jagged one:

```csharp
int[] temp = b[0];
b[0] = b[2];
b[2] = temp;    // swapped two rows with no copying of elements
```

## Pitfalls

- **Forgetting to create the rows.** `new int[3][]` gives three `null`s, not three arrays.
- **Sharing a row by accident.** If you write `a[0] = a[1]`, both rows are the same array, and a change through one shows in the other (see the lecture on reference types).
- **Using `GetLength` on a jagged array.** It describes only the outer array. The inner lengths are `a[i].Length`.
- **Copying with `Clone`.** It copies only the outer array. The rows themselves are shared between the copy and the original.
