## System.Array

Every array type (`int[]`, `string[,]`, `Order[][]`) derives from the abstract class `System.Array`, which provides static helpers for searching, sorting, copying and resizing. Arrays are reference types allocated as one contiguous block.

```csharp
int[] numbers = { 5, 3, 9, 1 };
int[,] grid = new int[3, 4];

numbers.Length;          // 4
grid.Length;             // 12: total elements
grid.Rank;               // 2 dimensions
grid.GetLength(1);       // 4: size of dimension 1
```

## Copying: shallow by nature

```csharp
int[] copy = (int[])numbers.Clone();          // new array, same elements
Order[] orders2 = (Order[])orders.Clone();     // new array, SAME Order objects (shallow)

Array.Copy(source, sourceIndex: 2, destination, destinationIndex: 0, length: 3);
numbers.CopyTo(target, 0);
numbers.AsSpan(1, 2).CopyTo(target);          // fast, no bounds re-checks per element
```

To deep-copy an array of objects you must copy each object yourself.

## Searching

```csharp
int idx = Array.IndexOf(numbers, 9);                   // linear, O(n); -1 if missing
bool any = Array.Exists(numbers, n => n > 8);
int firstBig = Array.Find(numbers, n => n > 4);        // default(T) if none
int[] bigOnes = Array.FindAll(numbers, n => n > 4);

Array.Sort(numbers);                                    // must be sorted for binary search
int pos = Array.BinarySearch(numbers, 9);              // O(log n); negative if missing
```

`BinarySearch` returns the **bitwise complement** of the insertion point when the item isn't found: `~pos` tells you where it would go.

## Sorting

```csharp
Array.Sort(numbers);                                   // natural order (IComparable)
Array.Sort(words, StringComparer.OrdinalIgnoreCase);   // with a comparer
Array.Sort(people, (a, b) => a.Age.CompareTo(b.Age));  // with a Comparison<T> lambda
Array.Sort(keys, values);                               // sort two arrays in parallel by keys
Array.Reverse(numbers);
```

`Array.Sort` uses **introsort** (quicksort + heapsort + insertion sort): O(n log n) and **unstable**.

## Resizing and filling

```csharp
Array.Resize(ref numbers, 10);        // allocates a new array and copies; the variable is updated
Array.Fill(buffer, (byte)0xFF);       // .NET Core 2.0+
Array.Clear(buffer, 0, buffer.Length);
var empty = Array.Empty<int>();       // cached zero-length array: no allocation
```

## Converting and creating

```csharp
string[] texts = Array.ConvertAll(numbers, n => n.ToString());
Array dyn = Array.CreateInstance(typeof(int), 5);     // when the element type is known only at run time
dyn.SetValue(42, 0);
```

## Arrays vs List<T>

| | Array | `List<T>` |
| --- | --- | --- |
| Size | fixed | grows (doubles its internal array) |
| Overhead | minimal | a wrapper object + spare capacity |
| Multi-dimensional | yes | no |
| Spans/interop | natural | `CollectionsMarshal.AsSpan(list)` (.NET 5) |

Use arrays for fixed-size data, buffers and performance-critical code; `List<T>` when the size changes.

## Interview takeaways

- `Clone` and `Array.Copy` are shallow.
- `BinarySearch` needs sorted data and returns `~insertionPoint` when not found.
- `Array.Resize` allocates a new array; `Array.Empty<T>()` avoids allocating empty ones.
