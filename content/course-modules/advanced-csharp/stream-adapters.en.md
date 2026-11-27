## Text adapters

`TextReader`/`TextWriter` are abstract classes for reading and writing characters. The main implementations:

| Type | Reads/writes |
| --- | --- |
| `StreamReader` / `StreamWriter` | text over a `Stream`, with an `Encoding` |
| `StringReader` / `StringWriter` | text over a `string` / `StringBuilder` |

```csharp
using (var writer = new StreamWriter("orders.csv", append: false, Encoding.UTF8))
{
    writer.WriteLine("id,total");
    writer.WriteLine($"{42},{99.5m.ToString(CultureInfo.InvariantCulture)}");
}

using (var reader = new StreamReader("orders.csv"))
{
    string? line;
    while ((line = reader.ReadLine()) != null) Process(line);
}

foreach (string line in File.ReadLines("big.log")) { }   // lazy, streaming
string all = File.ReadAllText("small.json");             // whole file at once
```

`StreamReader` detects a BOM to pick the encoding; otherwise it uses the one you pass (UTF-8 by default). `ReadLine` handles `\n`, `\r\n` and `\r`. `File.ReadLines` streams line by line; `File.ReadAllLines` loads everything into an array.

`StringWriter`/`StringReader` are handy for testing code that takes a `TextWriter`/`TextReader`, such as a report generator.

## Binary adapters

`BinaryWriter` and `BinaryReader` read and write primitive types in a compact binary form (little-endian):

```csharp
using var w = new BinaryWriter(File.Create("points.bin"));
w.Write(points.Count);              // int32
foreach (var p in points) { w.Write(p.X); w.Write(p.Y); w.Write(p.Label); }   // doubles + a string

using var r = new BinaryReader(File.OpenRead("points.bin"));
int count = r.ReadInt32();
for (int i = 0; i < count; i++) list.Add(new Point(r.ReadDouble(), r.ReadDouble(), r.ReadString()));
```

- Strings are **length-prefixed** (a 7-bit encoded length, then the bytes in the chosen encoding), so `ReadString` knows where each one ends.
- You must read in exactly the order and types you wrote; there's no schema. Put a **magic header** and a version number at the start of your format so you can reject wrong files and evolve the format.
- For a fixed byte order regardless of the platform, use `BinaryPrimitives.WriteInt32BigEndian` and friends.

## Closing and disposing adapters

Disposing an adapter **also disposes the underlying stream** by default. That's convenient for files, but wrong when you don't own the stream (a stream passed in by a caller, an HTTP response body, a `MemoryStream` you want to read afterwards). Use the `leaveOpen` constructor parameter:

```csharp
using (var writer = new StreamWriter(stream, Encoding.UTF8, bufferSize: 1024, leaveOpen: true))
    writer.Write(payload);
stream.Position = 0;    // the stream is still usable
```

Always dispose (or at least `Flush`) a writer: adapters buffer data, and anything still in the buffer is lost if the writer is just abandoned.

## Order of disposal

With layered streams, dispose the **outermost** layer first (adapter → decorator → store). Nested `using` statements do this naturally, because they dispose in reverse order of creation. Disposing the inner stream first means the outer layer can't flush its buffered data.

## Interview takeaways

- `StreamReader/Writer` for text with an encoding; `BinaryReader/Writer` for compact primitives.
- Adapters dispose the stream they wrap unless `leaveOpen: true`.
- Flush/dispose writers, outermost first, or buffered data is lost.
