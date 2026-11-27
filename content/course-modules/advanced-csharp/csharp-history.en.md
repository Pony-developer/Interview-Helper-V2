## Why the history matters

Interviewers often ask "which version introduced X?" more to check that you know *what X is for* than to test dates. Knowing the order also explains why the language has several ways to do one thing.

## The big milestones

| Version | Year | Headline features |
| --- | --- | --- |
| C# 1 | 2002 | Classes, structs, interfaces, delegates, events, properties |
| C# 2 | 2005 | **Generics**, nullable value types (`int?`), iterators (`yield return`), anonymous methods, partial classes |
| C# 3 | 2007 | **LINQ**, lambda expressions, extension methods, `var`, anonymous types, object and collection initializers, expression trees |
| C# 4 | 2010 | `dynamic`, optional and named parameters, generic variance (`in`/`out`) |
| C# 5 | 2012 | **`async` / `await`**, caller info attributes |
| C# 6 | 2015 | Null-conditional `?.`, string interpolation `$"..."`, `nameof`, expression-bodied members, `using static`, exception filters |
| C# 7.x | 2017 | **Tuples** and deconstruction, pattern matching (`is`, `switch` with types), `out var`, local functions, `ref` locals and returns, `Span<T>` support, `in` parameters |
| C# 8 | 2019 | **Nullable reference types**, `switch` expressions, ranges and indices (`^1`, `1..3`), default interface members, async streams, `using` declarations |
| C# 9 | 2020 | **Records**, `init` accessors, top-level statements, relational and logical patterns, target-typed `new()` |
| C# 10 | 2021 | File-scoped namespaces, `global using`, record structs, extended property patterns, lambdas with natural types, constant interpolated strings |

## C# 10 in a closer look

```csharp
// file-scoped namespace: no braces, the whole file is in it
namespace Shop.Orders;

// global using: applies to every file in the project (often in a GlobalUsings.cs)
global using System.Text.Json;

// record struct: a value-type record with value equality and a nice ToString
public readonly record struct Money(decimal Amount, string Currency);

// extended property pattern
if (order is { Customer.Address.Country: "UA" }) { /* ... */ }

// lambdas get a natural type, so 'var' works
var parse = (string s) => int.Parse(s);   // Func<string, int>
```

## Reading the timeline as a story

- **C# 2–3** made the language *expressive* with generics and LINQ.
- **C# 5** made it *asynchronous*.
- **C# 7–10** made it *concise and safe*: tuples, patterns, records, nullable reference types and fewer ceremony lines.

## Interview takeaways

- Generics (C# 2), LINQ (C# 3), async (C# 5), nullable reference types (C# 8) and records (C# 9) are the five landmarks to remember.
- C# 10 shipped with .NET 6 and focused on removing boilerplate: file-scoped namespaces and global usings.
