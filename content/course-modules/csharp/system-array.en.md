You already know the helper methods of the class `Array`: `Array.Sort`, `Array.IndexOf`, `Array.Copy` and others. Now look at the class from the point of view of **inheritance**: `System.Array` is the **base class of every array** in C#.

```csharp
int[] numbers = { 3, 1, 2 };
string[] words = { "b", "a" };
int[,] grid = new int[2, 2];

Array a1 = numbers;                        // int[] is derived from Array
Array a2 = words;                          // string[] is too
Array a3 = grid;                           // and so is a two-dimensional array
object o = numbers;                        // and Array is derived from object
```

So a variable of the type `Array` can hold **an array of any element type and any number of dimensions**. This is useful for code that does not care what is inside.

## A method for any array

```csharp
static void PrintInfo(Array array)
{
    Console.WriteLine(array.GetType().Name + ": " + array.Length + " elements, " + array.Rank + " dimension(s)");
}

PrintInfo(new int[5]);                     // Int32[]: 5 elements, 1 dimension(s)
PrintInfo(new string[2, 3]);               // String[,]: 6 elements, 2 dimension(s)
```

What `Array` offers to every array:

- `Length`: the total number of elements, in all dimensions;
- `Rank`: the number of dimensions;
- `GetLength(d)`: the size of the dimension `d`;
- `GetValue(i)` and `SetValue(value, i)`: read and write an element by its index, as `object`;
- `Clone()`: a shallow copy (returns `object`, so it needs a cast);
- `CopyTo(target, index)`: copy the elements into another array.

## `foreach` over an `Array`

An `Array` can be used in `foreach`. The elements come out as `object`, one by one, **across all the dimensions**:

```csharp
static string Show(Array array)
{
    string text = "";
    foreach (object item in array)
    {
        text += item + " ";
    }
    return text.Trim();
}

Console.WriteLine(Show(new[] { 1, 2, 3 }));                  // 1 2 3
Console.WriteLine(Show(new[] { "x", "y" }));                 // x y
Console.WriteLine(Show(new int[,] { { 1, 2 }, { 3, 4 } }));  // 1 2 3 4
```

The method works for all arrays, and we wrote it once. It is the same idea as `Greet(Person)` from the beginning of the module: one **base type** instead of a copy of the method for every case.

## Array.Copy for any array

The method `Array.Copy` takes two `Array` parameters, so it also works for all element types:

```csharp
int[] source = { 1, 2, 3, 4, 5 };
int[] part = new int[3];
Array.Copy(source, 1, part, 0, 3);         // from source[1], into part[0], 3 elements
Console.WriteLine(string.Join(" ", part)); // 2 3 4
```

The arguments: the source array, the start index in it, the target array, the start index in it, the number of elements. The target array must be **big enough**, and it must already exist: `Array.Copy` does not create it.

When you need a **new** array of the type that you do not know at the compile time, there is `Array.CreateInstance(elementType, length)`. It is rarely needed, but it shows that array types are real types that can be asked for at run time:

```csharp
Array created = Array.CreateInstance(typeof(int), 3);
created.SetValue(7, 0);
Console.WriteLine(created.GetValue(0));    // 7
```

## Covariance of arrays: a trap

A `string[]` can be used as `object[]`, because `string` is derived from `object`:

```csharp
object[] objects = new string[] { "a", "b" };      // compiles
objects[0] = "c";                                   // fine
objects[1] = 42;                                    // ArrayTypeMismatchException at run time!
```

The actual array is still a `string[]`, and it refuses an `int`. The compiler cannot see it. This is why reference-type arrays are used in this way carefully. A value-type array does not work like this: `int[]` is **not** an `object[]`, but it **is** an `Array`.
