## Task

Implement **`Retry.Run<T>(Func<int, T> action, int maxAttempts)`**. It calls `action(attempt)` with attempt numbers 1, 2, 3, ... and returns the first successful result.

- A **`TransientException`** means "try again". Print `attempt N failed: <message>` and retry, **unless** this was attempt number `maxAttempts`: then the exception must propagate to the caller unchanged.
- Any **other** exception propagates immediately, without retrying or printing.

Use an **exception filter**: `catch (TransientException e) when (attempt < maxAttempts)`. When the filter is false, the exception simply isn't caught here, so you don't need `throw;` at all.

Expected output:

```
attempt 1 failed: timeout #1
attempt 2 failed: timeout #2
ok on attempt 3
attempt 1 failed: still down
gave up: still down
not retried: bad input
```
