## Two built-in diagnostic channels

`System.Diagnostics.Debug` and `System.Diagnostics.Trace` both write diagnostic messages to a set of **listeners**. The difference is when they exist:

| Class | Its methods are marked | So calls survive in |
| --- | --- | --- |
| `Debug` | `[Conditional("DEBUG")]` | Debug builds only |
| `Trace` | `[Conditional("TRACE")]` | Debug and Release (the SDK defines TRACE in both by default) |

```csharp
Debug.WriteLine($"cache miss for {key}");        // gone in Release, including the string building
Trace.TraceWarning("Retrying payment {0}", id);
Debug.Assert(total >= 0, "Total can't be negative");
Debug.Fail("Unreachable state");
```

Because the **call** is removed (not just the body), the arguments aren't evaluated in Release either, so expensive diagnostic expressions cost nothing.

## Assertions

`Debug.Assert(condition, message)` checks an assumption that should always hold. On failure in a Debug build it reports the message (with a stack trace) and, under a debugger, breaks. Use asserts for **internal invariants**; use exceptions for **input validation**, since asserts vanish in Release.

## Listeners

Output goes to every listener in `Trace.Listeners` (Debug shares the same collection):

```csharp
Trace.Listeners.Add(new TextWriterTraceListener("app.log"));
Trace.Listeners.Add(new ConsoleTraceListener());
Trace.AutoFlush = true;
Trace.IndentSize = 2;
Trace.Indent(); Trace.WriteLine("nested"); Trace.Unindent();
```

`DefaultTraceListener` writes to the debugger output window (`OutputDebugString`). You can write your own by subclassing `TraceListener` and overriding `Write`/`WriteLine`.

`TraceSource` adds named sources and severity filtering (`SourceSwitch`).

## The modern view

`Debug`/`Trace` still matter for asserts and quick debugger output, but production logging in modern .NET goes through **`Microsoft.Extensions.Logging`** (`ILogger<T>`): structured messages, levels, scopes, many providers (console, files via Serilog/NLog, Application Insights, OpenTelemetry).

```csharp
public class OrderService
{
    private readonly ILogger<OrderService> _log;
    public OrderService(ILogger<OrderService> log) => _log = log;

    public void Place(Order o)
    {
        _log.LogInformation("Placing order {OrderId} for {Customer}", o.Id, o.Customer);   // structured, not interpolated
    }
}
```

Use message templates with placeholders, not string interpolation: the values are captured as properties for querying, and the message isn't formatted at all when the level is disabled. The `[LoggerMessage]` source generator (.NET 6) makes it allocation-free.

## Conditional compilation recap

- `#if DEBUG ... #endif` removes code entirely (and skips type-checking it).
- `[Conditional("DEBUG")]` removes calls but keeps the method compiled and checked.
- You can define your own symbols (`<DefineConstants>VERBOSE_SQL</DefineConstants>`) for opt-in diagnostics.

## Interview takeaways

- `Debug.*` calls disappear in Release; `Trace.*` calls stay.
- Asserts check invariants in development; they're not input validation.
- Production logging: `ILogger` with structured message templates.
