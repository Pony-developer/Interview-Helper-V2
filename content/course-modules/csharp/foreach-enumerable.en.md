You have used `foreach` many times. It works on arrays, lists, strings and dictionaries. How does one loop work on so many different types? The answer is a pair of interfaces, `IEnumerable` and `IEnumerator`.

`foreach` asks the collection for an **enumerator**, and then moves it step by step:

```csharp
int[] numbers = { 10, 20, 30 };

foreach (int n in numbers)
{
    Console.WriteLine(n);
}

// The compiler turns the loop into roughly this:
IEnumerator<int> e = numbers.GetEnumerator();
while (e.MoveNext())
{
    int n = e.Current;
    Console.WriteLine(n);
}
```

## The two interfaces

- **`IEnumerable<T>`** has one method, `GetEnumerator()`, which returns an enumerator. It means "I can be walked through".
- **`IEnumerator<T>`** is the walker. Its `MoveNext()` moves to the next item and returns `true` if there is one. Its `Current` property is the item where the walker stands. Before the first `MoveNext()`, `Current` is not valid.

```csharp
var list = new List<string> { "a", "b" };
IEnumerator<string> it = list.GetEnumerator();
Console.WriteLine(it.MoveNext());   // True
Console.WriteLine(it.Current);      // a
Console.WriteLine(it.MoveNext());   // True
Console.WriteLine(it.Current);      // b
Console.WriteLine(it.MoveNext());   // False: no more items
```

## Why foreach needs only this

`foreach` does not know what the collection is. It needs only `GetEnumerator`. So any type that provides it can be used in `foreach`, including your own classes. That is the real meaning of "a collection": **something that can produce an enumerator**.

`IEnumerator<T>` is also `IDisposable`. A `foreach` loop disposes the enumerator when it ends, even if you leave it early with `break`. This matters for enumerators that hold a file or a connection.

## The non-generic versions

`IEnumerable` and `IEnumerator` without `<T>` are the old versions, from before generics. They return `object` instead of `T`. New code uses the generic versions.

The next lecture shows how to write an enumerator yourself.
