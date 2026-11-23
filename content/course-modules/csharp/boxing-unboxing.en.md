A value type (`int`, `double`, a struct) lives inline in a variable. An `object` variable, however, must hold a **reference** to a heap object. So when a value is put into an `object`, C# creates a wrapper object on the heap and copies the value into it. This is **boxing**.

```csharp
int n = 42;
object o = n;                  // boxing: a new heap object holds a copy of 42
n = 7;
Console.WriteLine(o);          // 42: the box has its own copy
```

Going back is **unboxing**: an explicit cast from `object` to the value type.

```csharp
object o = 42;
int n = (int)o;                // unboxing: copies the value out of the box
Console.WriteLine(n + 1);      // 43
```

## Why it matters

Boxing is **hidden**. Many calls box without you noticing:

```csharp
Console.WriteLine("{0} and {1}", 1, 2.5);   // both numbers are boxed into object[]
```

Each boxing allocates memory, and the garbage collector must clean it up later. In a loop with millions of iterations, this becomes slow. The cure is to avoid `object` for values:

```csharp
var numbers = new List<int>();      // no boxing: List<int> stores ints directly
var old = new ArrayList();          // boxing: every int becomes an object
```

`List<int>` is a **generic** collection: it stores plain integers. `ArrayList` stores `object`, so every number is boxed. Prefer generic collections.

## Boxing into interfaces

A struct that implements an interface is boxed when it is used through that interface:

```csharp
IComparable c = 5;             // boxing: the int goes into a heap object
```

This is the same mechanism, and it is why the generic `IComparable<int>` is more efficient than the old `IComparable`.
