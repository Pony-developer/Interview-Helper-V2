## When to throw

A method throws when it **cannot do what its name promises**. `LoadUser(42)` that finds no user, `Parse("abc")` that gets no number, `Save()` with a full disk: these are exceptions. A user who types a wrong password is not exceptional: it is a normal result that the program expects.

## Exceptions are expensive

Throwing captures the stack trace and unwinds the stack. It is thousands of times slower than returning a value. So:

- **do not use exceptions for control flow** (to exit a loop, to signal "not found" in a hot path);
- for operations that often fail, offer the **Try pattern**:

```csharp
int value;
if (int.TryParse(text, out value))   // no exception, just false
    Use(value);
```

Good APIs provide both: `Parse` (throws) for input that must be correct, and `TryParse` (returns `bool`) for input that is often wrong. `Dictionary` has the same pair: the indexer throws `KeyNotFoundException`, `TryGetValue` does not.

Some teams also use a `Result<T>` type (success or error) for expected failures in business logic.

## Fail fast

Check the arguments at the **entry** of a public method, and throw at once. An error found early points at its cause. An error found later, deep in other code, points at a symptom.

## Where to catch

Catch an exception only where you can **do something** about it: retry, use a default, show a message. Everywhere else, let it go up. Every application has a few **boundaries** where all unhandled exceptions are caught, logged and turned into a response:

- `Main` of a console program;
- an event handler in a desktop UI;
- a middleware in ASP.NET Core that turns an exception into an HTTP 500 response;
- the loop of a background job, so that one failed item does not stop the others.

There are also last-chance global handlers: `AppDomain.CurrentDomain.UnhandledException` (it can only log, the process still ends) and `TaskScheduler.UnobservedTaskException`.

## What cannot be caught

- `StackOverflowException` ends the process: no `catch` and no `finally` will run.
- `OutOfMemoryException` can technically be caught, but there is usually nothing sensible to do after it.
- `Environment.FailFast` ends the process at once, on purpose.

## The rule

Throw when a method cannot keep its promise, prefer `TryXxx` for expected failures, validate early, and catch only where you can handle the problem or at the application boundary.
