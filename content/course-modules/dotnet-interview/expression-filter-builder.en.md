## Task

Question 135: "What is an expression tree?" Build one by hand — this is how dynamic filters in admin grids, OData and report builders work, and the same tree could be handed to EF Core to become SQL.

Complete **`FilterBuilder.Build<T>(conditions)`** so that it returns `x => cond1 && cond2 && …`:

1. Create the parameter: `Expression.Parameter(typeof(T), "x")`.
2. Start with `Expression.Constant(true)` (so an empty list means "everything").
3. For each condition:
   - the member: `Expression.Property(x, c.Property)`;
   - the value converted to the property's type: `Expression.Constant(Convert.ChangeType(c.Value, member.Type), member.Type)` — this is why `5` works for a `decimal` property;
   - the test by operator: `"=="` → `Expression.Equal`, `">"` → `Expression.GreaterThan`, `"<"` → `Expression.LessThan`, `"contains"` → `Expression.Call(member, typeof(string).GetMethod("Contains", new[] { typeof(string) }), value)`;
   - any other operator → `NotSupportedException`;
   - combine: `body = Expression.AndAlso(body, test)`.
4. Return `Expression.Lambda<Func<T, bool>>(body, x)`.

`Show` compiles the tree into a delegate with `.Compile()` and filters the in-memory list.

Expected output:

```
[C# in Depth, Clean Code, Refactoring, Mouse Pro, Keyboard Pro, USB cable]
[Clean Code, Refactoring]
[Mouse Pro]
[USB cable]
NotSupportedException
```
