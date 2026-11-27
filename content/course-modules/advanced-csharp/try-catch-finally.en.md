## The shape of a try statement

```csharp
try
{
    // code that may throw
}
catch (FileNotFoundException ex)               // most specific first
{
    // handle one kind of error
}
catch (IOException ex) when (IsTransient(ex))  // exception filter (C# 6)
{
    // handle only when the condition holds
}
catch (Exception)                              // most general last; variable optional
{
    // ...
}
finally
{
    // always runs: release resources, restore state
}
```

A `try` needs at least one `catch` or a `finally`.

## How the runtime finds a handler

When an exception is thrown, the CLR walks up the call stack looking for a `catch` whose type matches (the exception's type or a base type) and whose filter, if any, returns `true`. Catch blocks are checked **in order**, so the compiler rejects a general catch placed before a more specific one.

If no handler is found, the exception is **unhandled**: the process prints the exception and terminates (in ASP.NET Core, the framework catches it per request and returns HTTP 500).

## Exception filters

```csharp
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.ServiceUnavailable)
{
    // retry
}
```

A filter is evaluated **before** the stack unwinds. That has two useful consequences:

- if the filter is `false`, it's as if the catch didn't exist: the stack, including local variables at the throw site, is intact for the debugger and crash dumps;
- you can **log without catching**:

```csharp
catch (Exception ex) when (Log(ex)) { }   // Log returns false, so nothing is caught
```

## finally

`finally` runs when control leaves the `try` block for **any** reason: normal completion, `return`, `break`, `continue`, `goto`, or an exception (caught or not). It doesn't run if the process is killed, on `Environment.FailFast`, or on a stack overflow.

Typical uses: closing files and connections, releasing locks, resetting a "busy" flag. Most of the time you don't write `finally` yourself; `using` does it for you.

## The using statement

```csharp
using (var reader = new StreamReader(path))
{
    Console.WriteLine(reader.ReadLine());
}

// C# 8 using declaration: disposed at the end of the enclosing scope
using var writer = new StreamWriter(output);
writer.WriteLine("done");
```

`using` compiles to `try { ... } finally { if (x != null) ((IDisposable)x).Dispose(); }`.

## Costs

- Entering a `try` block is essentially free.
- **Throwing** is expensive: hundreds of times slower than a method return, because the runtime captures a stack trace and walks the stack. That's why exceptions are for exceptional situations, not for normal control flow.

## Interview takeaways

- Catch specific exceptions first; general ones last (if at all).
- Filters (`when`) decide before unwinding and can be used for logging without catching.
- `finally` always runs except for process-level failures; `using` is the usual way to get it.
