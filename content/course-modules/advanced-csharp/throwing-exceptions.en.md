## Throwing

```csharp
if (amount <= 0)
    throw new ArgumentOutOfRangeException(nameof(amount), amount, "Amount must be positive.");

// throw expressions (C# 7) work in ?:, ??, and expression-bodied members
public string Name
{
    get => _name;
    set => _name = value ?? throw new ArgumentNullException(nameof(value));
}

// .NET 6 guard helper
ArgumentNullException.ThrowIfNull(order);
```

## Rethrowing

```csharp
catch (Exception ex)
{
    Log(ex);
    throw;          // rethrows the SAME exception, stack trace preserved
}

catch (Exception ex)
{
    throw ex;       // DON'T: resets the stack trace to this line
}

catch (SqlException ex)
{
    throw new DataAccessException("Could not load order 42", ex);   // wrap, keeping InnerException
}
```

Wrapping is useful at layer boundaries: callers of a repository shouldn't need to know about `SqlException`, but the original error stays available through `InnerException`.

To rethrow an exception captured elsewhere (for example on another thread) with its original trace, use `ExceptionDispatchInfo.Capture(ex).Throw();`. That's what `await` uses internally.

## Key properties of System.Exception

| Property | Contains |
| --- | --- |
| `Message` | human-readable description |
| `StackTrace` | the call stack from the throw site to the catch site |
| `InnerException` | the exception that caused this one, if wrapped |
| `Data` | a dictionary for extra diagnostic info |
| `HResult` | an integer code, mostly for interop |

## Common exception types

| Type | Throw it when |
| --- | --- |
| `ArgumentException` / `ArgumentNullException` / `ArgumentOutOfRangeException` | a caller passed a bad argument |
| `InvalidOperationException` | the object's state doesn't allow this call right now (e.g. reading a closed reader) |
| `NotSupportedException` | the operation is never supported by this type (e.g. `Add` on a read-only collection) |
| `NotImplementedException` | a placeholder for unfinished code; should never ship |
| `ObjectDisposedException` | a member is used after `Dispose` |
| `KeyNotFoundException`, `FormatException`, `TimeoutException` | specific, self-explanatory failures |

Never throw `Exception`, `SystemException`, `NullReferenceException` or `IndexOutOfRangeException` yourself: they're too general or reserved for the runtime.

## The TryXxx pattern

```csharp
public bool TryGetPrice(string sku, out decimal price) { /* ... */ }
public decimal GetPrice(string sku) =>
    TryGetPrice(sku, out var price) ? price : throw new KeyNotFoundException(sku);
```

Offer a `Try` version when failure is a **normal outcome** (bad input, a missing key), so callers don't pay for an exception or write try/catch for ordinary cases.

## Custom exceptions

```csharp
public class InsufficientFundsException : Exception
{
    public decimal Shortfall { get; }
    public InsufficientFundsException(decimal shortfall)
        : base($"Insufficient funds: {shortfall:C} short.") => Shortfall = shortfall;
    public InsufficientFundsException(string message, Exception inner) : base(message, inner) { }
}
```

Create one only when callers will **catch it specifically** or need extra data. Name it with an `Exception` suffix and derive from `Exception` (not `ApplicationException`).

## Alternatives to exceptions

For expected failures in domain logic, a result type (`Result<T>`, `bool` + `out`, or a nullable return) is often clearer than throwing. Reserve exceptions for bugs and conditions the current method can't handle.

## Interview takeaways

- `throw;` preserves the stack trace; `throw ex;` destroys it.
- Wrap low-level exceptions at layer boundaries and keep them as `InnerException`.
- Use the specific argument exceptions; offer `TryXxx` for expected failures.
