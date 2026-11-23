The GC frees **memory**, and it does so **at an unknown moment**. A file that stays open until the next full collection blocks other programs; a database connection that is returned to the pool an hour later exhausts the pool. Such resources need **deterministic** release: exactly when the program is done with them. In .NET this is the interface `IDisposable`:

```csharp
public interface IDisposable
{
    void Dispose();
}
```

## `using`

```csharp
using (var reader = new StreamReader("data.txt"))
{
    Console.WriteLine(reader.ReadLine());
}   // reader.Dispose() is called here, even if an exception was thrown
```

The compiler turns this into `try { ... } finally { if (reader != null) reader.Dispose(); }`.

Since C# 8 there is also the **using declaration**. The object is disposed at the end of the enclosing block:

```csharp
using var reader = new StreamReader("data.txt");
Console.WriteLine(reader.ReadLine());
// reader.Dispose() runs when the method (or block) ends
```

## Who disposes

The **owner** disposes: the code that created the object and keeps it. If you received an object from outside (a parameter, a constructor argument from a DI container), you are not its owner, so do not dispose it.

If your class keeps a disposable object in a field, your class owns it. Then your class must implement `IDisposable` too, and dispose the field in its own `Dispose`.

## Writing `Dispose` correctly

```csharp
public sealed class ReportWriter : IDisposable
{
    private readonly StreamWriter writer;
    private bool disposed;

    public ReportWriter(string path) { writer = new StreamWriter(path); }

    public void Write(string line)
    {
        if (disposed) throw new ObjectDisposedException(nameof(ReportWriter));
        writer.WriteLine(line);
    }

    public void Dispose()
    {
        if (disposed) return;   // calling Dispose twice must be safe
        writer.Dispose();
        disposed = true;
    }
}
```

Three rules: `Dispose` may be called many times; after it, other methods throw `ObjectDisposedException`; `Dispose` itself should not throw.

## Async cleanup

Some objects need to do I/O while closing (flush a network stream). They implement `IAsyncDisposable`, and you use `await using`:

```csharp
await using var stream = new FileStream(path, FileMode.Create);
```

## The `HttpClient` trap

`HttpClient` is disposable, but creating and disposing one **per request** exhausts the sockets of the machine: closed connections stay in a waiting state for a while. Use one shared instance or `IHttpClientFactory`. This is a popular interview question.

## The rule

Everything that implements `IDisposable` and that you own goes into a `using`. A class that owns a disposable field is itself disposable.
