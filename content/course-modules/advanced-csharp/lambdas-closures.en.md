## Lambda syntax

A lambda is an unnamed method written inline: `(parameters) => expression-or-block`.

```csharp
Func<int, int> square = x => x * x;                    // one parameter, expression body
Func<int, int, int> add = (a, b) => a + b;             // several parameters
Func<string, int, bool> longer = (string s, int n) => s.Length > n;   // explicit types
Action greet = () => Console.WriteLine("hi");          // no parameters
Func<int, string> describe = n =>
{
    if (n < 0) return "negative";
    return n == 0 ? "zero" : "positive";
};                                                     // statement body
Func<int, int, int> first = (a, _) => a;               // discard parameter (C# 9)
```

A lambda has no type of its own: the compiler converts it to a **delegate** (`Func`, `Action`, ...) or to an **expression tree** (`Expression<Func<...>>`), depending on the target.

### Natural types (C# 10)

```csharp
var parse = (string s) => int.Parse(s);    // inferred as Func<string, int>
var choose = object (bool b) => b ? 1 : "one";   // explicit return type
```

## Closures: capturing outer variables

A lambda can use local variables and parameters of the method around it. Those are **captured variables**, and the lambda plus its captured variables is a **closure**.

```csharp
int factor = 3;
Func<int, int> multiply = x => x * factor;
factor = 10;
Console.WriteLine(multiply(2));   // 20, not 6
```

The key fact: **variables, not values, are captured**. The lambda sees the variable's current value when it *runs*. The compiler moves captured variables into a hidden class, so their lifetime is extended to that of the delegate.

```csharp
static Func<int> MakeCounter()
{
    int count = 0;
    return () => ++count;          // count outlives MakeCounter
}

var next = MakeCounter();
Console.WriteLine(next());         // 1
Console.WriteLine(next());         // 2
```

### The loop trap

```csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
    actions.Add(() => Console.Write(i));
foreach (var a in actions) a();    // 333: one variable i, which ends at 3
```

Fix by copying into a variable declared **inside** the loop:

```csharp
for (int i = 0; i < 3; i++)
{
    int copy = i;
    actions.Add(() => Console.Write(copy));   // 012
}
```

Since C# 5, `foreach` declares a **fresh variable per iteration**, so `foreach (var x in items) actions.Add(() => Use(x));` works as expected. `for` loops still share one variable.

## The cost of closures

Each closure means a heap allocation for the hidden class and one for the delegate. In hot paths:

- avoid capturing (pass state as a parameter instead);
- use `static` lambdas (next lecture) so the compiler prevents accidental capture;
- lambdas that capture nothing are cached by the compiler and allocate only once.

## Interview takeaways

- A lambda becomes a delegate or an expression tree depending on what it's assigned to.
- Closures capture variables, so they see later changes and extend the variable's lifetime.
- `for` loop variables are shared across iterations; `foreach` variables aren't (since C# 5).
