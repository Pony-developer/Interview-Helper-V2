There are several ways to write the same array. They differ in length, and in where they are allowed.

## Creating an array of a given size

```csharp
int[] scores = new int[5];        // five zeros
string[] names = new string[3];   // three nulls
bool[] flags = new bool[2];       // two falses
```

A new array is filled with the **default value** of its type: `0` for numbers, `false` for `bool`, `'\0'` for `char`, and `null` for strings and other reference types. The size may be a variable: `new int[n]`. A negative size throws an exception.

## Creating an array with values

The full form lists the type twice:

```csharp
int[] a = new int[] { 1, 2, 3 };
int[] b = new int[3] { 1, 2, 3 };   // the size is optional; if given, it must match
```

The **short form** leaves out `new`:

```csharp
int[] c = { 1, 2, 3 };
string[] names = { "Ann", "Bo", "Cy" };
```

The short form is allowed **only in the declaration** of a variable. You cannot use it for a later assignment, or as an argument:

```csharp
int[] c;
c = { 1, 2, 3 };          // error
Sum({ 1, 2, 3 });         // error
```

In those places the `new` form is needed:

```csharp
c = new int[] { 1, 2, 3 };
Sum(new int[] { 1, 2, 3 });
```

## Letting the compiler find the type

If the elements show their type, you can leave it out after `new` as well, and use `var`:

```csharp
var d = new[] { 1, 2, 3 };         // int[]
var e = new[] { "a", "b" };        // string[]
var f = new[] { 1, 2.5, 3 };       // double[]: the best common type is double
Sum(new[] { 4, 5, 6 });
```

When there is no common type, it is a compile error:

```csharp
var g = new[] { 1, "two" };        // error CS0826: no best type found for an implicitly-typed array
```

## A summary of the forms

| Form | Where it works |
| --- | --- |
| `int[] a = new int[5];` | anywhere; a size, and default values |
| `int[] a = new int[] { 1, 2, 3 };` | anywhere |
| `int[] a = { 1, 2, 3 };` | only in a declaration |
| `var a = new[] { 1, 2, 3 };` | anywhere; the type is inferred |

Newer versions of C# also allow `int[] a = [1, 2, 3];`. The online runner in this course uses an older compiler, so keep to the forms above.

## Good to know

- A trailing comma is allowed in the list, which is convenient for a list that spans several lines:

```csharp
string[] days =
{
    "Mon",
    "Tue",
    "Wed",
};
```

- If the size and the values are both given, they must agree: `new int[2] { 1, 2, 3 }` does not compile.
- An empty array is `new int[0]` or `new int[] { }`. It is not `null`.
- The size of an array is `Length` (a property, with no parentheses). Collections such as `List<T>` use `Count` instead.
- Arrays in a method signature look the same: `static int[] Squares(int[] numbers)` receives and returns an array.
