## What an interface is

An interface is a **contract**: a set of members a type promises to provide. It has no instance fields, so it carries no state.

```csharp
public interface IShippingCalculator
{
    decimal Calculate(Order order);
    string Carrier { get; }
}
```

- A class or struct can implement **many** interfaces but inherit only one class.
- Interface members are implicitly `public` and abstract (unless they have a default body).
- An interface can extend other interfaces: `interface IRepository<T> : IReadRepository<T>`.

## Implicit vs explicit implementation

```csharp
public class FileLogger : ILogger, IDisposable
{
    public void Log(string msg) { /* ... */ }   // implicit: callable on FileLogger and ILogger
    void IDisposable.Dispose() { /* ... */ }    // explicit: only via an IDisposable reference
}

var logger = new FileLogger();
logger.Log("hi");                  // ok
// logger.Dispose();               // error: not visible on FileLogger
((IDisposable)logger).Dispose();   // ok
```

Use explicit implementation when:

- two interfaces have members with the same signature but different meanings;
- a member is an implementation detail you don't want on the class's public surface;
- you want a strongly typed public member and a weakly typed interface one (e.g. `IEnumerable.GetEnumerator` vs `IEnumerable<T>.GetEnumerator`).

## Interfaces and virtual members

An implicitly implemented interface member is **sealed** by default. Mark it `virtual` if subclasses should be able to override it. Otherwise a subclass can only **reimplement** the interface, which works only for callers that go through the interface.

## Interfaces and boxing

Casting a struct to an interface boxes it. Calling an interface method through a generic constraint (`where T : IComparable<T>`) doesn't.

## Default interface members (C# 8)

```csharp
public interface ILogger
{
    void Log(string message);
    void LogError(Exception ex) => Log("ERROR: " + ex.Message);   // default body
}
```

The point is **versioning**: you can add `LogError` to an interface that hundreds of classes already implement without breaking them. The default member is only accessible through the interface (`((ILogger)x).LogError(...)`). Interfaces may also have static members, including static fields; they still can't have instance fields.

## Static abstract members (C# 11, preview in C# 10)

```csharp
public interface IParsable<TSelf> where TSelf : IParsable<TSelf>
{
    static abstract TSelf Parse(string s);
}
```

They let generic code call static methods and operators on `T`: the foundation of generic math in .NET 7.

## Class or interface?

- Use **classes** (and inheritance) for types that share an implementation and an identity ("a `Report` is a `Document`").
- Use **interfaces** for capabilities that unrelated types share ("can be saved", "can be compared").
- Depend on interfaces at boundaries (repositories, external services) so you can substitute fakes in tests.

## Interview takeaways

- Abstract class: shared state and code, single inheritance. Interface: contract, many per type.
- Explicit implementation hides a member from the class surface and resolves name clashes.
- Default interface members exist for evolving published interfaces.
