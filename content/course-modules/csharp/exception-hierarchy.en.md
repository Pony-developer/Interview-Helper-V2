Every exception in .NET is an object of a class derived from `System.Exception`. Its most useful members:

- `Message`: a human-readable description;
- `StackTrace`: where the exception was thrown and which calls led there;
- `InnerException`: the exception that caused this one, or `null`;
- `ToString()`: everything above in one text, which is what logs should store.

## The tree you should know

```text
Exception
└── SystemException
    ├── ArgumentException
    │   ├── ArgumentNullException
    │   └── ArgumentOutOfRangeException
    ├── InvalidOperationException
    │   └── ObjectDisposedException
    ├── NotSupportedException
    ├── NotImplementedException
    ├── FormatException
    ├── KeyNotFoundException
    ├── OperationCanceledException
    ├── IOException
    │   └── FileNotFoundException
    ├── NullReferenceException        (thrown only by the runtime)
    └── IndexOutOfRangeException      (thrown only by the runtime)
```

## Which one to throw

| Situation | Exception |
|---|---|
| An argument is `null` | `ArgumentNullException` |
| An argument is outside the allowed range | `ArgumentOutOfRangeException` |
| An argument is wrong in another way | `ArgumentException` |
| The object is in a state where the call makes no sense (`Pop` on an empty stack) | `InvalidOperationException` |
| The object was already disposed | `ObjectDisposedException` |
| The operation is never supported (`Add` on a read-only list) | `NotSupportedException` |
| A text has a wrong format | `FormatException` |

```csharp
public void Withdraw(decimal amount)
{
    if (amount <= 0)
        throw new ArgumentOutOfRangeException(nameof(amount), "The amount must be positive");
    if (amount > balance)
        throw new InvalidOperationException("Not enough money on the account");
    balance -= amount;
}
```

`nameof(amount)` gives the parameter name as a string, which survives renaming. Since .NET 6 there are also shortcuts like `ArgumentNullException.ThrowIfNull(user)`.

**Never throw** `Exception` or `SystemException` themselves (nobody can catch them selectively), and never throw `NullReferenceException`, `IndexOutOfRangeException` or `StackOverflowException`: they are reserved for the runtime and mean a bug, not a checked condition. `NotImplementedException` is a placeholder for unfinished code and must not reach a release.

## Catch from specific to general

The first `catch` whose type matches wins. A more general `catch` above a more specific one would make the second unreachable, so the compiler forbids it:

```csharp
try { File.ReadAllText(path); }
catch (FileNotFoundException) { Console.WriteLine("No such file"); }
catch (IOException e)         { Console.WriteLine("Disk problem: " + e.Message); }
// catch (IOException) above FileNotFoundException would be a compile error
```

## The rule

Throw the **most specific** standard exception that describes the problem, with a message that says what was expected. Catch the most specific type you can handle, and put general `catch` blocks last.
