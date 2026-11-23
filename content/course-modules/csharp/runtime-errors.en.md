A runtime error happens after a successful compilation, while the program is running. The runtime stops normal execution and **throws an exception**. If nothing handles it, the program crashes.

## Common exceptions

| Exception | Typical cause |
| --- | --- |
| `FormatException` | `int.Parse("abc")`: the text is not a number |
| `OverflowException` | `int.Parse("99999999999")`: the number does not fit |
| `DivideByZeroException` | integer division by zero: `10 / zero` |
| `IndexOutOfRangeException` | `"abc"[5]` or `numbers[10]`: a position that does not exist |
| `ArgumentOutOfRangeException` | `"abc".Substring(5)`: an argument outside the allowed range |
| `NullReferenceException` | calling a method on `null`: `string s = null; s.Length` |
| `ArgumentException` | a method received an argument it cannot accept |

## The stack trace

When a program crashes, it prints the exception type, a message and the **stack trace**: the chain of method calls that led to the failure.

```text
Unhandled Exception:
System.DivideByZeroException: Attempted to divide by zero.
  at Program.Average (System.Int32 sum, System.Int32 count) in prog.cs:8
  at Program.Main () in prog.cs:14
```

Read it from the top. The first line that points into **your** code (`prog.cs:8`) is where the exception was thrown. The lines below show who called whom, which tells you how the program got there. The exact layout differs between runtimes, but the idea is the same.

## try / catch / finally

You can catch an exception and react to it instead of crashing:

```csharp
try
{
    int n = int.Parse(text);
    Console.WriteLine(n * 2);
}
catch (FormatException)
{
    Console.WriteLine("Not a number");
}
catch (OverflowException)
{
    Console.WriteLine("Number is too big");
}
finally
{
    Console.WriteLine("Done");   // runs whether or not an exception happened
}
```

- Code in `try` runs until an exception occurs; the rest of the block is skipped.
- The first `catch` whose type matches handles it. Several `catch` blocks are checked from top to bottom.
- `finally` always runs, which makes it the right place to release resources.
- To see the details, write `catch (FormatException ex)` and use `ex.Message`.

## Throwing your own

A method can refuse bad input by throwing an exception:

```csharp
static int Half(int x)
{
    if (x < 0) throw new ArgumentException("x must not be negative");
    return x / 2;
}
```

## Use exceptions wisely

- **Catch only what you can handle.** `catch (Exception)` with an empty body swallows every error, including your own bugs, and the program silently does the wrong thing. That is worse than a crash.
- **Do not use exceptions for ordinary situations.** If bad input is expected, as with text typed by a user, check it with `int.TryParse` instead of waiting for `FormatException`.
- **Fix the cause when it is a bug.** A `NullReferenceException` or `IndexOutOfRangeException` usually means your code has a mistake. Catching it hides the mistake rather than removing it.
