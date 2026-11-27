## The six levels

| Modifier | Accessible from |
| --- | --- |
| `public` | anywhere |
| `internal` | the same assembly (project) |
| `protected` | the declaring class and classes derived from it |
| `protected internal` | the same assembly **or** derived classes anywhere (the union) |
| `private protected` (C# 7.2) | derived classes **in the same assembly** (the intersection) |
| `private` | the declaring type only |

```csharp
public class Engine
{
    private int _rpm;                       // only Engine
    protected void Ignite() { }             // Engine and subclasses
    internal void Calibrate() { }           // anything in this assembly
    private protected void Tune() { }       // subclasses in this assembly only
}
```

## Defaults

- Members of a class or struct: **`private`**.
- Top-level types (not nested): **`internal`**.
- Interface members: `public` (C# 8+ allows other modifiers for default implementations).
- Enum members: always `public`.

Writing the modifier explicitly is a good habit even when it matches the default.

## Rules the compiler enforces

- A type can't expose a less accessible type in its public signature: a `public` method can't return an `internal` class.
- An override must keep the same accessibility as the member it overrides.
- A subclass can be less accessible than its base, never more: `internal class B : PublicBase` is fine, `public class B : InternalBase` isn't.

## Friend assemblies

```csharp
[assembly: InternalsVisibleTo("Shop.Billing.Tests")]
```

This lets a test project see `internal` members, so you don't need to make things `public` just to test them. For signed assemblies, include the public key.

## Encapsulation in practice

- Keep fields `private`; expose behavior through methods and properties.
- Use `private set` or `init` instead of public setters when callers shouldn't change state.
- Return read-only views (`IReadOnlyList<T>`, `ReadOnlyCollection<T>`) instead of your internal `List<T>`, otherwise callers can add or remove items behind your back.

```csharp
private readonly List<OrderLine> _lines = new();
public IReadOnlyList<OrderLine> Lines => _lines;
public void AddLine(OrderLine line) { Validate(line); _lines.Add(line); }
```

## Interview takeaways

- `protected internal` is OR, `private protected` is AND.
- Class members default to `private`, top-level types to `internal`.
- Use `InternalsVisibleTo` for tests instead of widening access.
