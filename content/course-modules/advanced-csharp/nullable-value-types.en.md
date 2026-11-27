## Giving value types a "no value"

A value type always holds a value: an `int` can't be null. But data often has a "not set" state: an optional rating, a nullable database column, a date that hasn't happened yet. C# solves that with `T?`, which is shorthand for the struct `System.Nullable<T>`.

```csharp
int? rating = null;
DateTime? shippedOn = order.IsShipped ? order.ShipDate : null;

Console.WriteLine(rating.HasValue);           // False
Console.WriteLine(rating.GetValueOrDefault()); // 0
// Console.WriteLine(rating.Value);           // InvalidOperationException when null
```

`Nullable<T>` is a struct with two fields: the value and a `bool hasValue`. It doesn't allocate, and it can wrap only value types (`string?` means something different; see the next lecture).

## Conversions

```csharp
int? a = 5;          // implicit: T → T?
int b = (int)a;      // explicit: T? → T, throws if null
int c = a ?? 0;      // the idiomatic way to unwrap with a fallback
```

## Boxing a nullable

Boxing an `int?` that has a value boxes the **inner** `int`; boxing a null `int?` gives a **null reference**. So `object o = (int?)null;` is just `null`, and `o is int` works on a boxed nullable.

## Lifted operators

Operators defined for `T` are "lifted" to `T?`:

```csharp
int? x = 5, y = null;
Console.WriteLine(x + y);    // null: arithmetic with null gives null
Console.WriteLine(x > y);    // False: comparisons with null are false
Console.WriteLine(x < y);    // False too!
Console.WriteLine(x == y);   // False
Console.WriteLine(y == null);// True: equality treats null == null as true
```

The rule: `==` and `!=` treat null like a normal value; `<`, `>`, `<=`, `>=` return `false` if either side is null; arithmetic returns null.

### bool? and three-valued logic

`bool?` behaves like SQL's three-valued logic with `&` and `|`:

| | `true` | `false` | `null` |
| --- | --- | --- | --- |
| `null & ...` | null | **false** | null |
| `null \| ...` | **true** | null | null |

(`&&` and `||` aren't allowed on `bool?`.)

## Patterns with nullables

```csharp
if (rating is int r) Console.WriteLine($"Rated {r}");   // test and unwrap in one go
if (rating is null) Console.WriteLine("Not rated");
string label = rating switch { null => "n/a", > 3 => "good", _ => "meh" };
```

## Alternatives: magic values

Before `Nullable<T>`, code used "magic values" such as `-1` or `DateTime.MinValue` to mean "none". Those leak into calculations silently. `T?` makes the "no value" case explicit and checked by the compiler.

## Interview takeaways

- `T?` on a value type is `Nullable<T>`: a struct with `HasValue` and `Value`.
- Unwrap with `??`, `GetValueOrDefault()` or a type pattern; `.Value` throws when null.
- Lifted comparisons with null are false; lifted arithmetic yields null.
