A service sometimes fails with a `TransientException`: a temporary problem that may go away on the next try. Write `Retry(Func<string> action, int maxAttempts)`:

- it calls `action` and returns its result;
- if `action` throws a `TransientException` and this is **not** the last attempt, it prints `  retrying` and tries again;
- on the last attempt, the `TransientException` goes up to the caller unchanged (not wrapped, not rethrown with `throw ex`);
- any other exception goes up at once, without retries;
- after **every** attempt, whatever its result, it prints `  attempt N finished`.

Use an exception filter (`catch ... when (...)`) for the retry condition and a `finally` block for the line after each attempt. Do not change `Main` or the classes. Expected output:

```text
Service A:
  call 1
  retrying
  attempt 1 finished
  call 2
  retrying
  attempt 2 finished
  call 3
  attempt 3 finished
ok after 3 calls
Service B:
  call 1
  retrying
  attempt 1 finished
  call 2
  retrying
  attempt 2 finished
  call 3
  attempt 3 finished
gave up: Temporary failure on attempt 3
Service C:
  attempt 1 finished
not retried: broken
```

Notice the order: the `catch` block runs before `finally`, and `finally` runs even when the method returns or the exception leaves it.

Hint: a loop `for (int attempt = 1; ; attempt++)` with `return action();` inside `try` ends only through the `return` or an exception.
