The `System.Array` class has ready-made static methods for the common jobs, so you do not have to write the loops yourself. They live in `System`, which you already import.

```csharp
int[] a = { 5, 2, 9, 1 };
```

## Sort and Reverse

```csharp
Array.Sort(a);      // 1 2 5 9    the array itself is sorted in place
Array.Reverse(a);   // 9 5 2 1    reversed in place
```

Both change the array and return nothing. Strings are sorted alphabetically, and numbers numerically.

## IndexOf

```csharp
int where = Array.IndexOf(a, 2);   // 2: the position of the first 2
int none = Array.IndexOf(a, 7);    // -1: not found
```

`IndexOf` is the standard way to ask "does the array contain this value?": the answer is `Array.IndexOf(a, value) >= 0`.

## BinarySearch

For a **sorted** array it is much faster than a scan. It returns the index, or a negative number when the value is absent:

```csharp
int[] sorted = { 1, 2, 5, 9 };
Console.WriteLine(Array.BinarySearch(sorted, 5));   // 2
Console.WriteLine(Array.BinarySearch(sorted, 4) < 0);   // True: not found
```

On an unsorted array the result is meaningless.

## Copying

```csharp
int[] copy = new int[a.Length];
Array.Copy(a, copy, a.Length);        // copy.Length elements from the start

int[] clone = (int[])a.Clone();       // a new array with the same elements
```

`Array.Copy` can also copy a part: `Array.Copy(source, sourceIndex, target, targetIndex, count)`. The target array must be large enough.

## Clear

```csharp
Array.Clear(a, 0, a.Length);          // every element becomes the default value (0)
```

## Resize

An array cannot grow, but `Array.Resize` creates a **new** array of the requested size, copies the elements into it, and makes your variable point to it:

```csharp
int[] data = { 1, 2, 3 };
Array.Resize(ref data, 5);   // 1 2 3 0 0
Array.Resize(ref data, 2);   // 1 2   (the rest is cut off)
```

The `ref` keyword lets the method change the variable itself. Another reference to the old array does not see the change. If your data keeps growing, use a `List<T>`, which comes in the next module.

## Sizes and dimensions

```csharp
Console.WriteLine(a.Length);        // the total number of elements
Console.WriteLine(a.Rank);          // 1: the number of dimensions
Console.WriteLine(a.GetLength(0));  // the length of the first dimension
```

For multidimensional arrays, which are the next topic, `Length` is the number of all elements, and `GetLength(d)` is the size of one dimension.

## When to write your own loop

The library methods cover the usual tasks. Write the loop yourself when the rule is specific to your task: counting values in a range, searching for a pattern, finding the first element that meets a condition. You will do exactly that in the practice tasks.
