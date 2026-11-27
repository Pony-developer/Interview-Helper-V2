## Anonymous types

```csharp
var person = new { Name = "Ann", Age = 31 };
Console.WriteLine(person.Name);   // Ann
Console.WriteLine(person);        // { Name = Ann, Age = 31 }

var name = "Bob"; var age = 25;
var other = new { name, age };    // property names inferred: { name = Bob, age = 25 }
```

The compiler generates a **class** with:

- read-only properties (anonymous types are immutable, though `with` works on them since C# 10);
- value-based `Equals` and `GetHashCode` over all properties;
- a readable `ToString`.

Two anonymous object expressions with the same property names and types, in the same order, in the same assembly share **one** generated type.

Their main home is LINQ projections:

```csharp
var summary = orders.Select(o => new { o.Id, o.Customer.Name, Total = o.Lines.Sum(l => l.Price) });
```

Limitation: the type has no name you can write, so it can't appear in a method signature, a field or a property. Returning one through `object` or `dynamic` loses static typing. When data has to leave the method, use a tuple or a record.

## Value tuples (C# 7)

```csharp
(string Name, int Age) p = ("Ann", 31);
Console.WriteLine(p.Name);              // named element
Console.WriteLine(p.Item2);             // underlying field name still works

var q = (Name: "Bob", Age: 25);         // names in the literal
var r = ("Cat", 4);                     // unnamed: Item1, Item2
```

Tuples are `System.ValueTuple<...>`: **mutable value types**. Element names are a compile-time convenience; they're erased at run time (reflection sees `Item1`, `Item2`).

### Returning several values

```csharp
static (int Min, int Max) Range(int[] values) { /* ... */ return (min, max); }

var (lo, hi) = Range(data);             // deconstruct into two variables
(int lo2, _) = Range(data);             // discard what you don't need
```

That's cleaner than `out` parameters, especially in async methods (which can't have `out`).

### Equality and other tricks

```csharp
Console.WriteLine((1, "a") == (1, "a"));     // True: element-wise (C# 7.3)
(a, b) = (b, a);                             // swap without a temp variable
var dict = new Dictionary<(int, int), string>();   // tuple as a composite key: value equality + good hash
```

## Anonymous type, tuple or record?

| Need | Use |
| --- | --- |
| A temporary shape inside a method, especially a LINQ query that may become SQL | anonymous type |
| Return two or three values from a private/internal method | tuple |
| Data that crosses API boundaries, needs a name, documentation or behavior | `record` or class |

Tuples in public APIs are acceptable but get unclear fast: `(string, string, int)` says much less than `CustomerSummary`.

## Interview takeaways

- Anonymous types: compiler-generated immutable classes with value equality; local use only.
- Tuples: mutable `ValueTuple` structs; names are compile-time only; great for multiple return values and deconstruction.
- Reach for a record when the data deserves a name.
