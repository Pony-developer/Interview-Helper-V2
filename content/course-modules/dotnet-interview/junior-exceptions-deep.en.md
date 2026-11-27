## The exception hierarchy

```text
System.Exception
├── SystemException
│   ├── ArgumentException → ArgumentNullException, ArgumentOutOfRangeException
│   ├── InvalidOperationException → ObjectDisposedException
│   ├── NullReferenceException, IndexOutOfRangeException, InvalidCastException
│   ├── FormatException, NotSupportedException, NotImplementedException
│   ├── IOException → FileNotFoundException, DirectoryNotFoundException
│   ├── OperationCanceledException → TaskCanceledException
│   └── OutOfMemoryException, StackOverflowException
├── AggregateException          (several exceptions from tasks / Parallel)
└── your own: OrderNotFoundException, ...
```

Throw the most specific built-in type that fits (`ArgumentNullException` for a null argument, `InvalidOperationException` when the object is in the wrong state). Create your own when callers need to catch it separately:

```csharp
public sealed class InsufficientFundsException : Exception
{
    public decimal Missing { get; }
    public InsufficientFundsException(decimal missing)
        : base($"Not enough money: {missing} missing") => Missing = missing;
}
```

## catch, filters and order

```csharp
try { await client.SendAsync(request); }
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
{
    // only 429 lands here; other HttpRequestExceptions keep searching for a handler
}
catch (TaskCanceledException) when (!ct.IsCancellationRequested)
{
    // a timeout, not a user cancellation
}
```

- Catch blocks are checked **top to bottom**; put the most specific first (the compiler rejects an unreachable one).
- An exception **filter** (`when`) is evaluated *before* the stack unwinds, so if it returns false the original stack is untouched — great for logging and debugging.
- Catch only what you can handle. Letting an exception go up to a global handler (ASP.NET Core `UseExceptionHandler`, `ProblemDetails`) is usually better than swallowing it.

## What happens when you throw

1. The runtime creates the exception object, captures the stack trace and searches up the call stack for a matching handler (running filters).
2. When it finds one, it **unwinds** the stack: every `finally` (and `using`'s `Dispose`) between the throw point and the handler runs, innermost first.
3. The `catch` block runs; execution continues after the `try` statement.
4. If nothing matches, the process ends with an "unhandled exception".

```text
A() { try { B(); } catch { log("caught"); } }
B() { try { C(); } finally { log("B finally"); } }
C() { throw new Exception(); }
→ "B finally", then "caught"
```

## The call stack (Q15)

Each thread has its own stack. Calling a method pushes a **frame** (return address, arguments, locals, saved registers); returning pops it. The debugger's *Call Stack* window and `Exception.StackTrace` / `Environment.StackTrace` show it. Related keywords: `throw`, `try`/`catch`/`finally`, `return`, `stackalloc` (allocates a buffer on the stack), `ref` locals and `Span<T>` (stack-only types). The default stack is about 1 MB, which is why runaway recursion ends in a `StackOverflowException` that kills the process.

## Exceptions and async code

Exceptions in an `async` method are stored in the returned `Task` and rethrown at `await`. `Task.WhenAll` throws the first exception at `await`, but the task's `Exception` property holds an `AggregateException` with all of them. `.Wait()` and `.Result` wrap exceptions in `AggregateException`; `GetAwaiter().GetResult()` does not.

## Good practice

- Don't use exceptions for normal control flow (`TryParse`, `TryGetValue` exist for that).
- Never `catch (Exception) { }` silently.
- Keep the original as `InnerException` when wrapping.
- Use `throw;` to rethrow, and `ExceptionDispatchInfo.Capture(ex).Throw()` if you must rethrow later, elsewhere.
- Validate arguments early: `ArgumentNullException.ThrowIfNull(order);`.
