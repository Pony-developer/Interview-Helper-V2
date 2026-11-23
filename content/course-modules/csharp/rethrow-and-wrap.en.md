Sometimes a `catch` block does something (logs, cleans up) and then lets the exception continue. There are three ways to do it, and only two of them are right.

## `throw;` versus `throw ex;`

```csharp
try
{
    LoadOrders();
}
catch (Exception ex)
{
    logger.Log("Loading failed");
    throw;        // right: the same exception continues with its original stack trace
    // throw ex;  // wrong: the stack trace now starts HERE, the real place is lost
}
```

`throw ex;` throws the same object again, but resets its `StackTrace` to the current line. In the log you will see that the error happened in the `catch` block, not deep inside `LoadOrders`, where it really did. This is one of the most frequent interview questions about exceptions.

## Wrapping: adding context

A low-level exception often means nothing at a higher level. `SqlException: timeout` does not say **which** operation failed. Wrap it into an exception of your layer and pass the original as `InnerException`:

```csharp
try
{
    return repository.Load(userId);
}
catch (DbException ex)
{
    throw new UserLoadException("Cannot load user " + userId, ex);   // ex becomes InnerException
}
```

`ToString()` of the new exception prints the whole chain, the inner one after `--->`, with both stack traces. Never wrap without passing the inner exception: that throws away the cause.

Wrap at **layer boundaries** (the data layer, an external service), not in every method.

## Rethrowing later: `ExceptionDispatchInfo`

To throw a caught exception later, from another place, without losing its stack trace:

```csharp
ExceptionDispatchInfo saved = null;
try { Work(); }
catch (Exception ex) { saved = ExceptionDispatchInfo.Capture(ex); }
// ... later
saved?.Throw();   // the original stack trace is kept, with a note where it was rethrown
```

`await` uses exactly this mechanism to rethrow the exception of a task.

## Two anti-patterns

- **Swallowing**: `catch (Exception) { }` hides bugs. The program continues in a broken state, and nobody knows why.
- **Log and rethrow at every level**: one error appears in the log five times. Either handle the exception (log it **and** stop it), or let it go up. Log it once, where it is finally handled.

## The rule

Use `throw;` to let an exception continue, wrap it with an inner exception to add context at a layer boundary, and never write `throw ex;`.
