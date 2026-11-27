## Three layers

.NET's I/O is built from three kinds of pieces that plug together:

```
 Adapters        StreamReader / StreamWriter, BinaryReader / BinaryWriter, XmlReader ...
                 (turn bytes into text, numbers, XML)
 Decorators      BufferedStream, GZipStream, BrotliStream, CryptoStream, SslStream ...
                 (transform bytes; wrap another stream)
 Backing stores  FileStream, MemoryStream, NetworkStream, PipeStream ...
                 (where the bytes actually live)
```

```csharp
using var file = new FileStream("log.gz", FileMode.Create);         // backing store
using var gzip = new GZipStream(file, CompressionLevel.Optimal);   // decorator
using var writer = new StreamWriter(gzip, Encoding.UTF8);          // adapter
writer.WriteLine("hello");
```

Because each layer only knows `Stream`, any decorator works over any backing store: you can compress to a network stream or encrypt into memory without new code.

## The Stream class

```csharp
public abstract class Stream : IDisposable, IAsyncDisposable
{
    bool CanRead, CanWrite, CanSeek, CanTimeout;
    int Read(byte[] buffer, int offset, int count);   // also Read(Span<byte>), ReadAsync(Memory<byte>)
    void Write(byte[] buffer, int offset, int count);
    long Length; long Position; long Seek(long offset, SeekOrigin origin); void SetLength(long);
    void Flush();
    void CopyTo(Stream destination); Task CopyToAsync(Stream destination);
}
```

Key rules:

- **`Read` may return fewer bytes than requested**, even when more data is coming (network streams, decompression). It returns **0 only at the end**. Always loop:

```csharp
int total = 0;
while (total < buffer.Length)
{
    int n = stream.Read(buffer, total, buffer.Length - total);
    if (n == 0) throw new EndOfStreamException();
    total += n;
}
// .NET 7: stream.ReadExactly(buffer);
```

- **Seeking** is only possible when `CanSeek` is true (files, memory; not network or compression streams). `Length` and `Position` throw otherwise.
- **Flushing** pushes buffered data to the underlying store. `Dispose` flushes and closes.
- Prefer the async methods for files and networks in server code; pass a `CancellationToken`.

## The backing stores

| Stream | Notes |
| --- | --- |
| `FileStream` | `new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize, useAsync: true)`, or `File.OpenRead`/`OpenWrite`/`Create`. `FileMode`: `CreateNew`, `Create`, `Open`, `OpenOrCreate`, `Truncate`, `Append` |
| `MemoryStream` | an in-memory byte array that grows; `ToArray()`, `GetBuffer()`, `TryGetBuffer`. Great for tests and building payloads |
| `NetworkStream` | over a socket (see networking) |
| `PipeStream` | named and anonymous pipes for inter-process communication |
| `BufferedStream` | a decorator that adds a buffer to a stream that has none (FileStream already buffers) |

## Thread safety

Streams are **not thread-safe**. `Stream.Synchronized(stream)` wraps one with a lock, but concurrent reads/writes of one stream rarely make sense anyway.

## Modern alternatives

- `System.IO.Pipelines` (`PipeReader`/`PipeWriter`) handles buffering and partial reads for high-performance parsers (used by Kestrel).
- `RandomAccess` (.NET 6) offers thread-safe, offset-based file reads and writes without a shared `Position`.

## Interview takeaways

- Backing stores hold bytes, decorators transform them, adapters interpret them.
- `Read` can return fewer bytes than asked; loop until 0 or until you have enough.
- Dispose flushes; check `CanSeek` before using `Position`/`Length`.
