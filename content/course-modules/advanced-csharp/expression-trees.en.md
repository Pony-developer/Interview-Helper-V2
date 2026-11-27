## Code as data

Assign a lambda to `Expression<TDelegate>` and the compiler builds a **tree of objects** describing it instead of IL:

```csharp
Func<int, bool> f = x => x > 5;                    // compiled code
Expression<Func<int, bool>> e = x => x > 5;        // a data structure

Console.WriteLine(e.Body);                          // (x > 5)
Console.WriteLine(e.Body.NodeType);                 // GreaterThan
var gt = (BinaryExpression)e.Body;
Console.WriteLine(gt.Left);                         // x  (ParameterExpression)
Console.WriteLine(gt.Right);                        // 5  (ConstantExpression)

Func<int, bool> compiled = e.Compile();             // turn data back into code
Console.WriteLine(compiled(7));                     // True
```

Only **expression lambdas** can become trees: no statement bodies, no assignments, no `async`.

## The node types

All nodes derive from `System.Linq.Expressions.Expression`:

| Node | Represents |
| --- | --- |
| `ParameterExpression` | a lambda parameter |
| `ConstantExpression` | a literal value |
| `MemberExpression` | property or field access (`c.Name`); captured variables appear here too |
| `MethodCallExpression` | a method call (`c.Name.StartsWith("A")`) |
| `BinaryExpression` | `==`, `>`, `&&`, `+`, ... |
| `UnaryExpression` | `!`, negation, conversions |
| `LambdaExpression` | the lambda itself: parameters + body |
| `NewExpression`, `MemberInitExpression` | `new { ... }`, object initializers |

## Building trees by hand

Static factory methods on `Expression` let you build queries dynamically, which is the basis of generic filters, sort-by-column APIs and specification patterns:

```csharp
// builds: c => c.<propertyName> == value
static Expression<Func<T, bool>> PropertyEquals<T>(string propertyName, object value)
{
    ParameterExpression c = Expression.Parameter(typeof(T), "c");
    MemberExpression prop = Expression.Property(c, propertyName);
    ConstantExpression constant = Expression.Constant(value, prop.Type);
    BinaryExpression body = Expression.Equal(prop, constant);
    return Expression.Lambda<Func<T, bool>>(body, c);
}

var filter = PropertyEquals<Customer>("Country", "UA");
var result = db.Customers.Where(filter);   // EF Core translates it like a hand-written lambda
```

## Combining predicates

You can't simply `&&` two `Expression<Func<T,bool>>` values; you combine their bodies over a **shared parameter**. The simple approach uses `Expression.Invoke` (which some providers don't support); the robust one rewrites the second body's parameter with an `ExpressionVisitor`:

```csharp
class ReplaceParameter : ExpressionVisitor
{
    private readonly ParameterExpression _from, _to;
    public ReplaceParameter(ParameterExpression from, ParameterExpression to) { _from = from; _to = to; }
    protected override Expression VisitParameter(ParameterExpression node) => node == _from ? _to : node;
}

static Expression<Func<T, bool>> And<T>(Expression<Func<T, bool>> a, Expression<Func<T, bool>> b)
{
    var body = new ReplaceParameter(b.Parameters[0], a.Parameters[0]).Visit(b.Body);
    return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(a.Body, body), a.Parameters);
}
```

`ExpressionVisitor` is also how providers walk a tree to translate it.

## Compiling expressions for speed

`Expression.Compile()` generates real IL at run time. Build an expression once, compile it, cache the delegate, and you get near-native speed for dynamic code: fast property getters, mappers (AutoMapper does this), serializers. Compiling is slow (milliseconds), so always cache.

## Interview takeaways

- `Expression<Func<...>>` is a tree describing code; `Func<...>` is the compiled code.
- Providers like EF Core translate trees; `Compile()` turns them into delegates.
- Build trees with `Expression.Parameter/Property/Equal/Lambda` for dynamic filters; use `ExpressionVisitor` to rewrite them.
