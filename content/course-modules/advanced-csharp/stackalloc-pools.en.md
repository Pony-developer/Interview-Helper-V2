## stackalloc: buffers that cost nothing to free

```csharp
Span<char> buffer = stackalloc char[64];
if (value.TryFormat(buffer, out int written, "N2", CultureInfo.InvariantCulture))
    Log(buffer[..written]);
```

- Memory comes from the current method's **stack frame** and disappears when the method returns: no GC involvement at all.
- Assigning to a `Span<T>` means no `unsafe` code is needed.
- The stack is small (around 1 MB per thread), and overflowing it **kills the process** (`StackOverflowException` can't be caught). Keep `stackalloc` sizes small and **bounded**: a common pattern switches to a pooled array above a threshold.

```csharp
const int MaxStack = 256;
char[]? rented = null;
Span<char> buf = length <= MaxStack
    ? stackalloc char[MaxStack]
    : (rented = ArrayPool<char>.Shared.Rent(length));
try
{
    // ... use buf[..length]
}
finally
{
    if (rented != null) ArrayPool<char>.Shared.Return(rented);
}
```

Don't `stackalloc` inside a loop: the memory is only released when the method returns.

## ArrayPool<T>

Renting and returning arrays avoids allocating (and later collecting) temporary buffers, especially big ones that would land on the Large Object Heap:

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(81920);    // may return a LARGER array
try
{
    int read;
    while ((read = await source.ReadAsync(buffer.AsMemory(0, 81920), ct)) > 0)
        await destination.WriteAsync(buffer.AsMemory(0, read), ct);
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: false);
}
```

Rules:

- The array can be **longer** than requested: always track the length you're using.
- It may contain **old data** from a previous renter; pass `clearArray: true` when returning buffers that held sensitive data.
- **Return exactly once**, and never touch the array after returning it (another renter may be using it).
- `ArrayPool<T>.Shared` is thread-safe and keeps per-thread caches; `ArrayPool<T>.Create(...)` makes a private pool.

## Native memory

When you need memory outside the GC heap entirely (huge buffers, interop):

```csharp
unsafe
{
    void* p = NativeMemory.Alloc((nuint)size);          // .NET 6; Marshal.AllocHGlobal earlier
    try
    {
        var span = new Span<byte>(p, size);              // safe access through a span
        span.Clear();
    }
    finally
    {
        NativeMemory.Free(p);                            // manual lifetime: free exactly once
    }
}
```

Wrap native allocations in a `SafeHandle` or `MemoryManager<T>` so they're freed reliably. `GC.AddMemoryPressure` tells the GC about large native allocations owned by managed objects.

## MemoryMarshal and Unsafe

`System.Runtime.InteropServices.MemoryMarshal` (`Cast`, `AsBytes`, `GetReference`, `CreateSpan`) and `System.Runtime.CompilerServices.Unsafe` let advanced code reinterpret memory and skip checks. They're how the BCL implements fast paths, and they bypass type safety: use only with a benchmark showing it matters.

## Interview takeaways

- `stackalloc` into a `Span<T>`: free, GC-free buffers, but small and bounded only.
- `ArrayPool<T>.Shared.Rent/Return`: reuse temporary arrays; mind the length, old data and single return.
- Native memory needs manual freeing; wrap it in safe types.
