This lecture goes through questions 36–44 with code you can reproduce at the whiteboard.

## Class, abstract class, interface (Q36–38)

```csharp
public interface INotifier                        // contract: what, not how
{
    Task SendAsync(string to, string text);
}

public abstract class NotifierBase : INotifier    // shared plumbing + template method
{
    private readonly ILogger _log;
    protected NotifierBase(ILogger log) => _log = log;   // abstract classes can have constructors

    public async Task SendAsync(string to, string text)
    {
        if (string.IsNullOrWhiteSpace(to)) throw new ArgumentException("No recipient", nameof(to));
        await SendCoreAsync(to, text);            // the varying step
        _log.LogInformation("Sent to {To}", to);
    }

    protected abstract Task SendCoreAsync(string to, string text);
}

public sealed class SmsNotifier(ILogger log, ISmsApi api) : NotifierBase(log)
{
    protected override Task SendCoreAsync(string to, string text) => api.SendAsync(to, text);
}
```

| | Abstract class | Interface |
|---|---|---|
| Instances | no | no |
| Fields / state | yes | no instance fields |
| Constructors | yes | no |
| Implementation | yes | default methods since C# 8 |
| Access modifiers on members | any | public by default (others allowed since C# 8) |
| How many per class | one base class | many |
| Expresses | "is a kind of", shared code | "can do", a role |

Interfaces exist so that code depends on a role (`INotifier`) rather than a class: mocking in tests, swapping implementations, plug-ins, and DI.

## Access modifiers (Q39)

```csharp
public class Account                      // visible everywhere
{
    private decimal _balance;             // this class only
    protected void Audit() { }            // this class + derived classes
    internal void Recalculate() { }       // the same assembly (project)
    protected internal void Sync() { }    // same assembly OR derived anywhere
    private protected void Lock() { }     // derived classes in the same assembly only
}
file class Helper { }                     // this source file only (C# 11)
```

`[InternalsVisibleTo("Shop.Tests")]` lets a test project see `internal` members.

## Static classes (Q40)

```csharp
public static class StringExtensions
{
    public static bool IsBlank(this string? s) => string.IsNullOrWhiteSpace(s);
}
```

A static class is `abstract` + `sealed` in IL: no instances, no inheritance, no interfaces, only static members. It is initialized once, lazily, by its static constructor. Good for pure helpers and extension methods; bad for anything with state or I/O, because callers can't replace it in tests.

## new vs override (Q41)

```csharp
class Base    { public virtual string Who() => "Base";  public string Plain() => "Base"; }
class Derived : Base
{
    public override string Who() => "Derived";   // replaces in the virtual table
    public new string Plain() => "Derived";      // hides; a different method with the same name
}

Base b = new Derived();
b.Who();    // "Derived" — runtime type decides
b.Plain();  // "Base"    — compile-time type decides
((Derived)b).Plain();  // "Derived"
```

Without either keyword, hiding still happens but the compiler warns (CS0108). `new` is rare in good code — it usually means a design problem.

## const vs readonly (Q42)

```csharp
public class Limits
{
    public const int MaxItems = 100;                         // compile-time, baked into callers
    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(30);   // computed at run time
    public readonly Guid InstanceId = Guid.NewGuid();        // per instance, set once
}
```

`const` works only for primitives, `string` and `null`; it is implicitly static. Because the value is copied into every assembly that uses it, a public `const` that may change between versions should be `static readonly` instead.

## Structs (Q43–44)

```csharp
public readonly record struct Money(decimal Amount, string Currency)
{
    public Money Add(Money other) =>
        Currency == other.Currency ? this with { Amount = Amount + other.Amount }
                                   : throw new InvalidOperationException("Currency mismatch");
}
```

Use a struct for small, immutable values without identity: `DateTime`, `TimeSpan`, `Guid`, `decimal`, `KeyValuePair<K,V>`, `ValueTuple`, `Span<T>`, `CancellationToken`. Make it `readonly`; mutable structs cause bugs because you often modify a copy.

A struct ends up on the **heap** when it is a field of a class, an element of an array or `List<T>`, boxed (cast to `object`/an interface), captured in a lambda closure, or kept across `await`/`yield` (the state machine stores it in a heap object). `ref struct` types (`Span<T>`) are the only ones guaranteed to stay on the stack — that's why they can't be boxed, captured or used in async methods.
