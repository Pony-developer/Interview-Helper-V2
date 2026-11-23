The most common closure mistake: a lambda captures a **loop variable**, and all the lambdas share the same variable.

```csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.Write(i + " "));
}

foreach (Action a in actions)
{
    a();                                 // 3 3 3, not 0 1 2
}
```

Each lambda captures the **same** variable `i`, which is one variable for the whole loop. When the loop ends, `i` is 3, and every lambda prints 3.

## The fix: a copy inside the loop

Create a new variable inside each iteration, and capture that one:

```csharp
for (int i = 0; i < 3; i++)
{
    int copy = i;                        // a new variable on each iteration
    actions.Add(() => Console.Write(copy + " "));
}
// 0 1 2
```

Each iteration now has its own `copy`, and each lambda keeps its own.

## foreach is different

Since C# 5, the `foreach` loop variable is a new variable on each iteration, so the trap does not happen there:

```csharp
foreach (int n in new[] { 0, 1, 2 })
{
    actions.Add(() => Console.Write(n + " "));
}
// 0 1 2
```

The `for` loop is the case to be careful with.

## Other places where the trap appears

- a lambda in a loop that captures a variable declared outside the loop, and changed in it;
- event handlers created in a loop;
- tasks or threads started in a loop without passing the value as an argument.

## The rule

When a lambda will run later, and the variable it captures may change, copy the variable into a new local variable first. Ask yourself: "which value will this lambda see when it runs?"
