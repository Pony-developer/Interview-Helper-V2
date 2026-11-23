## Exception filters: `when`

A `catch` block can have a condition. The block catches the exception only if the condition is `true`:

```csharp
try
{
    response = await client.GetAsync(url);
}
catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.ServiceUnavailable)
{
    // only 503: try again later
}
```

If the filter is `false`, it is as if this `catch` did not exist: the runtime looks at the next `catch` blocks, then at the callers. This is better than catching, checking, and rethrowing:

- the code says what it handles right in the `catch` line;
- the filter runs **before** the stack is unwound, so a crash dump or the debugger still shows the exact state at the place of the throw.

A known trick uses a filter only for its side effect:

```csharp
catch (Exception e) when (Log(e))   // Log writes the exception and returns false
{
    // never runs: the exception continues up, but it has been logged
}
```

## `finally`: the code that always runs

```csharp
var file = File.OpenRead(path);
try
{
    return Parse(file);
}
finally
{
    file.Dispose();   // runs after a normal return, after an exception, after break or continue
}
```

`finally` runs when control leaves the `try` block for any reason. It does **not** run if the process dies: `Environment.FailFast`, a `StackOverflowException`, the process being killed, or a `try` block that never ends.

The `using` statement is exactly a `try`/`finally` that calls `Dispose`.

## The order and two traps

The order is: `try` → the filters → the matching `catch` → `finally`.

**Trap 1: the return value is computed before `finally`.**

```csharp
static int GetValue()
{
    int x = 1;
    try { return x; }      // the value 1 is saved here
    finally { x = 2; }     // changes the variable, not the saved result
}
// GetValue() returns 1
```

**Trap 2: an exception in `finally` replaces the original one.** If `try` throws and then `finally` throws too, the first exception is lost for good. Keep `finally` blocks simple and never throw from them on purpose.

## The rule

Use `when` to catch only the cases you really handle, and use `finally` (or `using`) for cleanup that must happen no matter how the block ends.
