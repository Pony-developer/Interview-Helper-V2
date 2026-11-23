Every C# type is either a **value type** or a **reference type**. The difference decides what happens when you copy a variable, compare two of them or pass one to a method.

## Value types

A variable of a value type **contains the value itself**.

Value types are the numbers (`int`, `long`, `double`, `decimal`, ...), `bool`, `char`, enums and structs.

```csharp
int a = 5;
int b = a;       // b gets its own copy of 5
b = 10;
Console.WriteLine(a);   // 5
```

## Reference types

A variable of a reference type **contains a reference**: the address of an object somewhere else in memory. Arrays, `string` and classes are reference types.

```csharp
int[] x = { 1, 2, 3 };
int[] y = x;            // y refers to the SAME array
y[0] = 100;
Console.WriteLine(x[0]);   // 100
```

```text
x ──┐
    ├──▶ [ 100, 2, 3 ]
y ──┘
```

`int[] y = x;` copies the reference, not the array. There is one array and two names for it.

## null

A reference may point to nothing. That is `null`, which is also the default value of an unassigned reference field or an array element of a reference type:

```csharp
int[] data = null;
Console.WriteLine(data.Length);   // NullReferenceException: there is no array to ask
```

A value-type variable can never be `null`.

## Comparing

`==` on value types compares the **values**. On arrays it compares the **references**, that is, whether they are the same array:

```csharp
int[] p = { 1, 2 };
int[] q = { 1, 2 };
int[] r = p;
Console.WriteLine(p == q);   // False: two different arrays with equal contents
Console.WriteLine(p == r);   // True: the same array
```

To compare the contents you have to go through the elements yourself.

## string is special

`string` is a reference type, but it is **immutable**: no method changes an existing string, and `==` is defined to compare the text. So it behaves like a value type in everyday use:

```csharp
string s = "hi";
string t = s;
t = t + "!";            // creates a new string; s is unchanged
Console.WriteLine(s);   // hi
```

## What an array holds

- `int[]` is an array of values: the numbers are stored in the array itself.
- `string[]` is an array of **references**: each element refers to a string, or is `null`.
- The array variable itself is a reference, whatever the element type.

## Copying an array

To get an independent array, create a new one and copy the elements:

```csharp
int[] original = { 1, 2, 3 };

int[] copy1 = (int[])original.Clone();        // a shallow copy
int[] copy2 = new int[original.Length];
Array.Copy(original, copy2, original.Length);

int[] copy3 = new int[original.Length];       // or by hand
for (int i = 0; i < original.Length; i++) copy3[i] = original[i];
```

"Shallow" means that the elements themselves are copied as they are. For an array of numbers that is enough. For an array of references, the copy holds the same objects as the original.

## Why it matters

- A change made through one reference is visible through all the others.
- Passing an array to a method gives the method access to the **same** data (see the next lecture).
- Storing an array you received, instead of copying it, ties your data to the caller's data.
- Comparing arrays with `==` is almost never what you want.
