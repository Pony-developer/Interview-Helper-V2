## Preprocessor directives

C# has no real preprocessor (no macros, no `#include`), but the compiler honors a set of directives that start with `#`.

### Conditional compilation

```csharp
#define TRACE_SQL          // must appear before any code in the file

#if DEBUG
    Console.WriteLine("debug build");
#elif TRACE_SQL
    Console.WriteLine("tracing SQL");
#else
    // release-only path
#endif

#if NET6_0_OR_GREATER
    ArgumentNullException.ThrowIfNull(arg);
#else
    if (arg == null) throw new ArgumentNullException(nameof(arg));
#endif
```

- Symbols are defined with `#define` in a file or with `<DefineConstants>` in the project. The SDK defines `DEBUG` in Debug builds, `TRACE`, and framework symbols such as `NET6_0`, `NETSTANDARD2_0`, `NET6_0_OR_GREATER`.
- Expressions support `!`, `&&`, `||`, `==`, `!=`: `#if DEBUG && !TESTS`.
- Code excluded by `#if` isn't compiled at all, so it isn't checked either.

### [Conditional] vs #if

```csharp
[Conditional("DEBUG")]
static void Trace(string message) => Console.WriteLine(message);

Trace(ExpensiveDescription());   // in Release, the whole call, including the argument, disappears
```

The method still exists and compiles in every build; only **calls** are removed when the symbol isn't defined at the call site. That's how `Debug.WriteLine` works. Unlike `#if`, it keeps the code type-checked.

### Other directives

| Directive | Purpose |
| --- | --- |
| `#warning text` / `#error text` | emit a compiler warning or error |
| `#region` / `#endregion` | collapsible blocks in the editor; no effect on code |
| `#pragma warning disable CS0618` / `restore` | silence specific warnings locally |
| `#nullable enable` / `disable` / `restore` | control nullable reference analysis per section |
| `#line 100 "Generated.cs"` / `#line hidden` | change reported line numbers (used by code generators) |

## XML documentation comments

Triple-slash comments become documentation that IntelliSense shows and tools can publish:

```csharp
/// <summary>
/// Calculates the total price of an order, including tax.
/// </summary>
/// <param name="order">The order to price. Must not be null.</param>
/// <param name="taxRate">The tax rate as a fraction, e.g. <c>0.2m</c> for 20%.</param>
/// <returns>The gross total, rounded to two decimals.</returns>
/// <exception cref="ArgumentNullException"><paramref name="order"/> is null.</exception>
/// <remarks>Discounts are applied before tax. See <see cref="DiscountPolicy"/>.</remarks>
/// <example>
/// <code>var total = pricing.Total(order, 0.2m);</code>
/// </example>
public decimal Total(Order order, decimal taxRate) { /* ... */ }
```

Turn on `<GenerateDocumentationFile>true</GenerateDocumentationFile>` to produce an `.xml` file next to the assembly; NuGet packages ship it so consumers get IntelliSense. The compiler then also warns (CS1591) about public members without docs.

Useful tags: `<summary>`, `<param>`, `<typeparam>`, `<returns>`, `<exception>`, `<remarks>`, `<example>`, `<code>`, `<c>`, `<see cref>`, `<seealso>`, `<paramref>`, `<inheritdoc/>` (copy docs from the base member or interface).

`cref` references are checked by the compiler, so a rename refactoring keeps docs correct.

## Interview takeaways

- `#if` removes code from compilation; `[Conditional]` removes calls but keeps the code compiled.
- Framework symbols like `NET6_0_OR_GREATER` enable multi-targeted code.
- `///` comments + `GenerateDocumentationFile` produce IntelliSense docs; `<inheritdoc/>` avoids duplication.
