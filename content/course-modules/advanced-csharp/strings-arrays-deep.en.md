## char and string

- `char` is a single **UTF-16 code unit** (16 bits). Characters outside the Basic Multilingual Plane, such as most emoji, take *two* `char`s (a surrogate pair).
- `string` is an immutable sequence of `char`. Every "modification" (`Replace`, `+`, `ToUpper`) returns a **new** string.
- `string` is a reference type, but `==` compares **contents**, because the operator is overloaded.

### Literals

```csharp
string path1 = "C:\\temp\\log.txt";   // escape sequences
string path2 = @"C:\temp\log.txt";    // verbatim: backslashes are literal, "" is a quote
string msg   = $"Total: {total:C2}";   // interpolated with a format string
string both  = $@"Folder: {dir}\logs"; // interpolated + verbatim
```

C# 10 allows **constant interpolated strings** when all the parts are constants:

```csharp
const string Product = "Shop";
const string Title = $"{Product} admin";   // fine in C# 10
```

### Building strings in loops

Because strings are immutable, `s += x` inside a loop copies the whole string each time: O(n²). Use `StringBuilder` (or `string.Join`, `string.Concat`) instead.

## Arrays

An array is a fixed-size, zero-indexed block of elements of one type. Arrays are always reference types, even an array of structs.

```csharp
int[] numbers = { 5, 3, 8 };
var names = new string[3];        // { null, null, null }
var points = new Point[1000];     // 1000 structs inline: one allocation
```

Every access is **bounds-checked**; an index out of range throws `IndexOutOfRangeException`. The JIT removes the check when it can prove the index is safe, for example in a simple `for (i = 0; i < a.Length; i++)` loop.

### Rectangular vs jagged

```csharp
int[,] grid = new int[3, 4];          // one block, 3 rows x 4 columns
grid[1, 2] = 7;
int rows = grid.GetLength(0);         // 3

int[][] jagged = new int[3][];        // 3 separate arrays, created later
jagged[0] = new int[] { 1 };
jagged[1] = new int[] { 1, 2, 3 };    // rows of different length
```

### Indices and ranges (C# 8)

```csharp
int[] a = { 10, 20, 30, 40, 50 };
int last = a[^1];         // 50: ^1 means "1 from the end"
int[] mid = a[1..4];      // { 20, 30, 40 }: start inclusive, end exclusive
int[] tail = a[2..];      // { 30, 40, 50 }
```

A range on an array creates a **copy**. On a `Span<T>` it creates a **view** with no copy, which is why spans are used in performance-sensitive code.

## Interview takeaways

- Strings are immutable; build them with `StringBuilder` in loops.
- `char` is UTF-16, so `"😀".Length` is 2.
- `int[,]` is rectangular, `int[][]` is jagged; ranges copy arrays but slice spans.
