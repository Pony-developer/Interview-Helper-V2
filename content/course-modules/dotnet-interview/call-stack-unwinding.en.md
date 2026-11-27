## Task

See for yourself how an exception travels up the call stack. Complete the three methods of `Tracer`:

1. **`Dive(depth, failAt, log)`** — a recursive method:
   - log `"enter <depth>"`;
   - if `depth == failAt`, throw `new InvalidOperationException("boom at <depth>")`;
   - if `depth == 5`, return (the bottom);
   - otherwise call `Dive(depth + 1, failAt, log)`;
   - in a **`finally`** block, log `"leave <depth>"`.
2. **`Run(failAt)`** — create the log, call `Dive(1, failAt, log)`, catch an `InvalidOperationException` **only if its message contains "boom"** (use an exception filter, `when`) and log `"caught: <message>"`. In a `finally`, log `"done"`. Return the log.
3. **`Wrap(failAt)`** — call `Dive`, and if it throws, wrap the exception: `throw new ApplicationException("wrapped", original)`. The caller prints the message and the inner exception's message.

Watch the order in the first line: the `finally` blocks of all three levels run (innermost first) **before** the `catch` in `Run`.

Expected output:

```
enter 1, enter 2, enter 3, leave 3, leave 2, leave 1, caught: boom at 3, done
enter 1, enter 2, enter 3, enter 4, enter 5, leave 5, leave 4, leave 3, leave 2, leave 1, done
wrapped <- boom at 2
```
