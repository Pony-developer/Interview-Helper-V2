A delegate type can have type parameters, just like a generic class. One delegate type then works for any element type:

```csharp
delegate T Maker<T>();                    // "a method that takes nothing and returns a T"

static int MakeNumber() { return 42; }
static string MakeText() { return "hi"; }

Maker<int> a = MakeNumber;
Maker<string> b = MakeText;
Console.WriteLine(a() + 1);               // 43
Console.WriteLine(b());                   // hi
```

## Two delegate types from the standard library

You have already met them through the list methods. The framework defines them for the common cases:

- `Predicate<T>`: `delegate bool Predicate<in T>(T obj);` — a test that says yes or no for an item.
- `Comparison<T>`: `delegate int Comparison<in T>(T x, T y);` — a comparison that returns negative, zero or positive.

```csharp
var numbers = new List<int> { 5, 12, 7, 30 };
Predicate<int> isBig = n => n > 10;           // a delegate of the standard type
Console.WriteLine(numbers.Find(isBig));       // 12
numbers.Sort((x, y) => y.CompareTo(x));       // Comparison<int>: descending
```

The lambda expressions in the last line are explained in the next lectures.

## Why generic delegates are useful

A delegate written once for `T` replaces many delegates written for each type. A method that works with any kind of item takes a `Predicate<T>` or a `Func<T, bool>`, and the caller decides the rule.

## The variance keywords

`in` and `out` in the declarations allow a delegate of a more general type to be used where a more specific one is expected. You do not need to write them yourself at this stage; the important part is that the standard delegates are already set up correctly.
