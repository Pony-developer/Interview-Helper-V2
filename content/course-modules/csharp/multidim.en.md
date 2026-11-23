Tables, boards, images and matrices have two dimensions. C# has a **rectangular** array for them: one array object with rows and columns, written with a comma inside the brackets.

## Creating and indexing

```csharp
int[,] grid = new int[3, 4];   // 3 rows, 4 columns, all zeros
grid[1, 2] = 7;                // row 1, column 2
Console.WriteLine(grid[1, 2]); // 7
```

An element is addressed by **two indexes in one pair of brackets**: `grid[row, col]`. Both start from 0. `grid[1][2]` is a different syntax, for arrays of arrays (see the next lecture), and it does not work here.

## Initializing with values

```csharp
int[,] matrix =
{
    { 1, 2, 3 },
    { 4, 5, 6 },
};
```

Each inner pair of braces is one row, and every row must have the same number of elements.

## Sizes

| Expression | Meaning | For `matrix` |
| --- | --- | --- |
| `matrix.GetLength(0)` | the number of rows | 2 |
| `matrix.GetLength(1)` | the number of columns | 3 |
| `matrix.Length` | the number of **all** elements | 6 |
| `matrix.Rank` | the number of dimensions | 2 |

Be careful: `Length` is not the number of rows.

## Walking over a 2D array

Two nested loops, the first over rows and the second over columns:

```csharp
for (int row = 0; row < matrix.GetLength(0); row++)
{
    for (int col = 0; col < matrix.GetLength(1); col++)
    {
        Console.Write(matrix[row, col] + " ");
    }
    Console.WriteLine();
}
```

```text
1 2 3 
4 5 6 
```

`foreach` also works, but it flattens the array and goes through all the elements one after another, row by row, without telling you where a row ends:

```csharp
foreach (int value in matrix)
{
    Console.Write(value + " ");   // 1 2 3 4 5 6
}
```

## Typical tasks

**The sum of all elements**

```csharp
int sum = 0;
for (int r = 0; r < matrix.GetLength(0); r++)
    for (int c = 0; c < matrix.GetLength(1); c++)
        sum += matrix[r, c];
```

**The diagonal of a square matrix**: the elements where the row equals the column.

```csharp
for (int i = 0; i < n; i++) Console.Write(square[i, i] + " ");
```

**Transposing**: swapping rows and columns into a new array.

```csharp
int[,] t = new int[matrix.GetLength(1), matrix.GetLength(0)];
for (int r = 0; r < matrix.GetLength(0); r++)
    for (int c = 0; c < matrix.GetLength(1); c++)
        t[c, r] = matrix[r, c];
```

**A board of characters**

```csharp
char[,] board = new char[3, 3];
for (int r = 0; r < 3; r++)
    for (int c = 0; c < 3; c++)
        board[r, c] = '.';
board[1, 1] = 'X';
```

## Three and more dimensions

The same idea extends: `int[,,] cube = new int[2, 3, 4];` is two layers of 3 × 4. Dimensions above three are rare.

## Neighbours and the edge

When you look at the neighbours of a cell, check the bounds first. The cell above `(row, col)` is `(row - 1, col)`, and for `row == 0` it does not exist:

```csharp
bool hasAbove = row > 0;
bool hasRight = col < grid.GetLength(1) - 1;
```

Reading `grid[-1, col]` throws `IndexOutOfRangeException`, just as with a one-dimensional array.

## Keep in mind

- A rectangular array is **one object** with all the cells in one block of memory.
- All the rows have the same length. If the rows differ in length, use an array of arrays.
- Passing it to a method works as it does for any array: the method gets the reference, and can change the cells.
