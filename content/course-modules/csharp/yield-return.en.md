Writing an enumerator by hand is long. The keyword **`yield return`** lets you write a method that produces a sequence item by item, and the compiler builds the enumerator for you.

```csharp
static IEnumerable<int> Evens(int limit)
{
    for (int i = 0; i <= limit; i += 2)
    {
        yield return i;               // gives one item, then pauses here
    }
}

foreach (int n in Evens(6))
{
    Console.Write(n + " ");           // 0 2 4 6
}
```

The method returns `IEnumerable<int>`, and its body contains `yield return`. Nothing else is special about it. Each time `foreach` asks for the next item, the method runs from where it stopped until the next `yield return`.

## What happens step by step

```csharp
static IEnumerable<string> Demo()
{
    Console.WriteLine("start");
    yield return "first";
    Console.WriteLine("middle");
    yield return "second";
    Console.WriteLine("end");
}

foreach (string s in Demo())
{
    Console.WriteLine("got " + s);
}
// start
// got first
// middle
// got second
// end
```

The output shows that the code of the method runs **interleaved** with the loop. Nothing runs when `Demo()` is called. The body starts only when `foreach` asks for the first item.

## yield break

`yield break` ends the sequence early, with no value:

```csharp
static IEnumerable<int> UntilNegative(int[] items)
{
    foreach (int x in items)
    {
        if (x < 0)
        {
            yield break;              // the sequence ends here
        }
        yield return x;
    }
}
```

## Rules

- The method must return `IEnumerable<T>`, `IEnumerator<T>`, or their non-generic versions.
- It cannot use `return value;` with a value. Use `yield return` for every item.
- It can be a method, but not a lambda in the way you might expect, and it cannot have `out` or `ref` parameters.

The next lecture shows why the laziness matters.

## Special cases

### 1. The method does not run when you call it

```csharp
static IEnumerable<int> Parse(string[] items)
{
    foreach (string s in items)
    {
        if (s == "") throw new ArgumentException("empty item");
        yield return int.Parse(s);
    }
}

var numbers = Parse(new[] { "1", "" });    // no exception here!
foreach (int n in numbers)                 // the exception happens here, during enumeration
{
    Console.WriteLine(n);
}
```

Because the body runs only when enumerated, an argument check inside an iterator is **delayed**. The error appears far away from the call that caused it. The usual fix is to split the method in two: a normal public method that checks the arguments at once, and a private iterator that does the work:

```csharp
static IEnumerable<int> Parse(string[] items)
{
    if (items == null) throw new ArgumentNullException("items");   // checked at once
    return ParseIterator(items);
}

static IEnumerable<int> ParseIterator(string[] items)
{
    foreach (string s in items)
    {
        yield return int.Parse(s);
    }
}
```

### 2. try with catch is forbidden

`yield return` cannot appear inside a `try` block that has a `catch` clause. The compiler reports an error. A `try` with only `finally` is allowed:

```csharp
static IEnumerable<int> Read()
{
    // try { yield return 1; } catch (Exception) { }   // compile error
    try
    {
        yield return 1;
    }
    finally
    {
        Console.WriteLine("cleanup");     // runs when enumeration ends
    }
}
```

### 3. Other restrictions

- A `return value;` statement is not allowed, only `yield return` and `yield break`.
- `out` and `ref` parameters are not allowed.
- You cannot use `yield return` inside a `catch` or `finally` block.

### The practical summary

An iterator is a **lazy program**: it runs in pieces, when someone asks. Check the arguments in a normal method, and keep the iterator small and focused.
