A lambda that uses a local variable from its surroundings is a **closure**. It **captures** the variable: the lambda keeps a link to the variable itself, not a copy of its value, and the variable stays alive as long as the lambda does.

```csharp
static Func<int> MakeCounter()
{
    int count = 0;                       // a local variable of MakeCounter
    return () =>
    {
        count++;                         // the lambda changes the captured variable
        return count;
    };
}

Func<int> next = MakeCounter();
Console.WriteLine(next());               // 1
Console.WriteLine(next());               // 2
Console.WriteLine(next());               // 3
```

When `MakeCounter` returns, its local variable `count` should disappear. It does not: the lambda still uses it, so the variable lives on as long as the delegate. Each call to `MakeCounter` creates its own variable:

```csharp
Func<int> other = MakeCounter();
Console.WriteLine(other());              // 1: a new counter, its own count
Console.WriteLine(next());               // 4: the first counter continues
```

## Capture is by reference

The closure sees the **current** value of the variable, every time it runs:

```csharp
int limit = 10;
Func<int, bool> below = x => x < limit;
Console.WriteLine(below(5));             // True
limit = 3;
Console.WriteLine(below(5));             // False: the new value of limit is used
```

## What can be captured

Local variables, parameters of the enclosing method, and `this` in an instance method. A lambda cannot capture a `ref` or `out` parameter. This is a rare case.

## Why it matters

Closures are the reason the code of a lambda can live on after the method that wrote it has finished. They are used everywhere in event handlers, LINQ and asynchronous code. The next lecture shows how the compiler implements them, and the lecture after that shows the most common mistake.
