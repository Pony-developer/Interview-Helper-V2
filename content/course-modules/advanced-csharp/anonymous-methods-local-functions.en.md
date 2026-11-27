## Anonymous methods: the C# 2 ancestor of lambdas

```csharp
Func<int, int> square = delegate (int x) { return x * x; };
```

Lambdas replaced them, but one feature is unique: you can **omit the parameter list** entirely, and the anonymous method then fits any delegate signature.

```csharp
button.Click += delegate { Console.WriteLine("clicked"); };   // ignores sender and e
```

Anonymous methods can't be converted to expression trees and have no expression body. In new code, use lambdas (with discards `(_, _) => ...` for ignored parameters).

## Local functions (C# 7)

A local function is a named method declared inside another method:

```csharp
public static IEnumerable<int> Range(int start, int count)
{
    if (count < 0) throw new ArgumentOutOfRangeException(nameof(count));   // runs immediately
    return Iterate();

    IEnumerable<int> Iterate()            // local function: an iterator
    {
        for (int i = 0; i < count; i++) yield return start + i;
    }
}
```

Compared with a lambda, a local function:

- has a **name** and can be **recursive** without tricks;
- can be **generic**, use `ref`/`out`/`params` parameters, and be an **iterator** or `async`;
- can be called **before** its declaration in the method;
- is **cheaper**: if it isn't turned into a delegate, captured variables live in a struct on the stack, so there's no heap allocation.

The example shows a classic use: argument validation happens eagerly in the outer method, while the iterator body is deferred.

```csharp
int Fibonacci(int n)
{
    return Fib(n);
    static int Fib(int k) => k < 2 ? k : Fib(k - 1) + Fib(k - 2);
}
```

## Static lambdas and static local functions

Marking a lambda or local function `static` (C# 8 for local functions, C# 9 for lambdas) forbids capturing locals, parameters or `this`:

```csharp
int threshold = 10;
Func<int, bool> big = static x => x > 10;         // fine
// Func<int, bool> bad = static x => x > threshold;  // error: captures threshold
```

Benefits:

- no closure allocation, guaranteed by the compiler;
- intent is clear: this code depends only on its inputs.

Common use: a callback that receives its state explicitly.

```csharp
cache.GetOrAdd(key, static (k, factory) => factory.Create(k), factory);
```

## Choosing between them

| Situation | Use |
| --- | --- |
| Short inline callback for LINQ or events | lambda |
| Helper used only inside one method, maybe recursive or an iterator | local function |
| Hot path, must not allocate | `static` lambda or `static` local function |
| Event handler that ignores its arguments | lambda with discards `(_, _) => ...` |

## Interview takeaways

- Anonymous methods are legacy; their one trick is the omitted parameter list.
- Local functions can be recursive, generic, iterators, async, and avoid allocations.
- `static` prevents accidental capture and the hidden allocation that comes with it.
