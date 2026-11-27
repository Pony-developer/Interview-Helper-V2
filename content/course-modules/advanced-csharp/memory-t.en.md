## The heap-friendly sibling

`Span<T>` can't live in fields or survive an `await`. `Memory<T>` (and `ReadOnlyMemory<T>`) represents the same idea, a slice of contiguous memory, but as an **ordinary struct** that can go anywhere:

```csharp
public class MessageBuffer
{
    private readonly Memory<byte> _payload;                 // allowed in a field
    public MessageBuffer(byte[] data, int offset, int length) => _payload = data.AsMemory(offset, length);

    public async Task SendAsync(Stream stream, CancellationToken ct)
    {
        await stream.WriteAsync(_payload, ct);             // async APIs take Memory<T>/ReadOnlyMemory<T>
    }

    public int Checksum()
    {
        Span<byte> span = _payload.Span;                   // get a Span for fast synchronous work
        int sum = 0;
        foreach (byte b in span) sum += b;
        return sum;
    }
}
```

The pattern: **store and pass** `Memory<T>`; **process** via `.Span` inside synchronous code.

`Memory<T>` can't point to stack memory (that's exactly why it can live on the heap): it wraps arrays, strings (`ReadOnlyMemory<char>`) or memory owned by a `MemoryManager<T>` (native buffers, pooled blocks).

## Ownership with IMemoryOwner

Who returns a pooled buffer? `IMemoryOwner<T>` makes ownership explicit: whoever holds the owner disposes it.

```csharp
using IMemoryOwner<byte> owner = MemoryPool<byte>.Shared.Rent(4096);
Memory<byte> buffer = owner.Memory;                  // may be larger than requested
int read = await stream.ReadAsync(buffer, ct);
Process(buffer.Span[..read]);
// disposing the owner returns the buffer to the pool
```

## Span vs Memory: choosing

| Need | Use |
| --- | --- |
| a synchronous method parameter for a buffer | `Span<T>` / `ReadOnlySpan<T>` |
| a parameter of an `async` method | `Memory<T>` / `ReadOnlyMemory<T>` |
| a field, a collection element, a lambda capture | `Memory<T>` |
| work on stack memory | `Span<T>` |

`Memory<T>.Span` has a small cost (it checks what kind of memory it wraps), so get the span once per operation, not per element.

## ArraySegment<T>

The older, pre-span type for "part of an array": an array + offset + count. It converts implicitly to `Span<T>`/`Memory<T>` and still appears in older APIs (sockets, `MemoryStream.TryGetBuffer`).

## System.IO.Pipelines and ReadOnlySequence

For data that arrives in several chunks (network reads), `System.IO.Pipelines` hands you a `ReadOnlySequence<T>`: a linked list of `ReadOnlyMemory<T>` segments. `SequenceReader<T>` lets you parse across segment boundaries. This is how Kestrel parses HTTP without copying request bytes.

## Interview takeaways

- `Memory<T>` is the storable, await-friendly version of `Span<T>`; call `.Span` for processing.
- Async APIs (`Stream.ReadAsync`, sockets, pipes) take `Memory<T>`/`ReadOnlyMemory<T>`.
- `IMemoryOwner<T>` + `MemoryPool<T>` make ownership of pooled buffers explicit.
