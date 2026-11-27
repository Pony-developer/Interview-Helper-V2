You've been using design patterns since your first C# program; .NET just didn't call them by name. Recognizing them makes the framework easier to understand, and it's the best material for an interview answer.

## A quick map

| You write... | The pattern | Why it is that pattern |
| --- | --- | --- |
| `foreach`, `IEnumerable<T>`, `yield return` | **Iterator** | Walk a collection without knowing how it's stored |
| `button.Click += Handler;` `event` | **Observer** | Many subscribers, one publisher that doesn't know them |
| `new GZipStream(new BufferedStream(fileStream))` | **Decorator** | Each stream wraps another and adds one ability |
| `list.Sort(comparer)`, `OrderBy(x => x.Name)` | **Strategy** | The comparison algorithm is passed in |
| `new StringBuilder().Append(...).ToString()` | **Builder** | Assemble step by step, then get the result |
| `WebApplication.CreateBuilder(args)` ... `builder.Build()` | **Builder** | Configure the app, then build it |
| `HttpClient` + `DelegatingHandler` | **Decorator / Chain** | Handlers wrap each other around the HTTP call |
| ASP.NET Core middleware, `app.Use(...)` | **Chain of Responsibility** | Each piece handles the request or calls `next()` |
| `IHttpClientFactory.CreateClient()` | **Factory** | One place decides how clients are created and pooled |
| `Lazy<T>` | **Proxy** (virtual) | The real object is created on first `.Value` |
| `services.AddSingleton<T>()` | **Singleton** (the safe kind) | One instance, but injected, not global |
| `File.ReadAllText(path)` | **Facade** | One call hides streams, encodings and closing |
| `Task.ContinueWith`, `async/await` continuations | **Command**-like | Work packed into objects and run later |
| Entity Framework lazy loading | **Proxy** | Related data loaded when first touched |
| `DbContext` | **Unit of Work + Repository** | Tracks changes, saves them in one go |
| `ExpressionVisitor`, Roslyn `SyntaxVisitor` | **Visitor** | Operations over a stable tree of node types |

## LINQ: several patterns at once

```csharp
var bigCustomers = orders
    .Where(o => o.Total > 10000)       // Strategy: the filter is passed in
    .GroupBy(o => o.CustomerId)        // Strategy: the key selector
    .Select(g => g.Key)
    .ToList();                         // Iterator: nothing ran until here (deferred execution)
```

Each LINQ operator wraps the previous sequence in a new iterator, which is the Decorator idea applied to sequences.

## How to use this in an interview

When asked about a pattern, connect it to something .NET does: "Decorator is how streams work: `GZipStream` wraps a `FileStream`." It shows you understand the idea, not just the UML diagram.

## Remember

Patterns aren't something exotic you add to a project: the framework you already use is built from them. Learn to see them, and new libraries will feel familiar.
