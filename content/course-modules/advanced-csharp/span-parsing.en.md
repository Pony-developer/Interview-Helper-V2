## The problem with Split and Substring

A typical parser:

```csharp
foreach (string line in text.Split('\n'))              // allocates an array and a string per line
{
    string[] fields = line.Split(',');                  // more arrays and strings
    total += int.Parse(fields[2].Trim());               // and another string from Trim
}
```

For a large file, this creates millions of short-lived strings: lots of GC work for data you only look at once.

## Forward-only parsing with ReadOnlySpan<char>

The span way walks the text with indexes and slices, allocating nothing:

```csharp
static long SumThirdColumn(ReadOnlySpan<char> text)
{
    long total = 0;
    while (!text.IsEmpty)
    {
        int nl = text.IndexOf('\n');
        ReadOnlySpan<char> line = nl < 0 ? text : text[..nl];
        text = nl < 0 ? ReadOnlySpan<char>.Empty : text[(nl + 1)..];

        for (int field = 0; ; field++)
        {
            int comma = line.IndexOf(',');
            ReadOnlySpan<char> value = comma < 0 ? line : line[..comma];
            if (field == 2)
            {
                if (int.TryParse(value.Trim(), out int n)) total += n;   // parses straight from the span
                break;
            }
            if (comma < 0) break;
            line = line[(comma + 1)..];
        }
    }
    return total;
}
```

The text is consumed **forward only**: each step slices off what was processed. `int.TryParse`, `double.TryParse`, `DateTime.TryParse`, `Guid.TryParse` and many others accept `ReadOnlySpan<char>` directly.

## Span-based enumerators

You can write `ref struct` enumerators that yield slices without allocating, and use them with `foreach`:

```csharp
public ref struct SplitEnumerator
{
    private ReadOnlySpan<char> _rest;
    private readonly char _sep;
    public SplitEnumerator(ReadOnlySpan<char> text, char sep) { _rest = text; _sep = sep; Current = default; }
    public ReadOnlySpan<char> Current { get; private set; }
    public SplitEnumerator GetEnumerator() => this;
    public bool MoveNext()
    {
        if (_rest.IsEmpty) return false;
        int i = _rest.IndexOf(_sep);
        Current = i < 0 ? _rest : _rest[..i];
        _rest = i < 0 ? ReadOnlySpan<char>.Empty : _rest[(i + 1)..];
        return true;
    }
}

foreach (ReadOnlySpan<char> part in new SplitEnumerator("a,b,c", ','))
    Console.WriteLine(part.ToString());
```

`foreach` works because of the **pattern** (a `GetEnumerator` with `MoveNext` and `Current`), not an interface, so a ref struct can be enumerated. `string.EnumerateLines()` and `MemoryExtensions.EnumerateRunes()` are built-in examples.

## Binary parsing

For bytes, `BinaryPrimitives` reads integers in a specified endianness from spans, and `Utf8Parser`/`Utf8Formatter` parse and format numbers directly in UTF-8:

```csharp
ReadOnlySpan<byte> packet = buffer.AsSpan(0, read);
ushort type = BinaryPrimitives.ReadUInt16BigEndian(packet);
uint length = BinaryPrimitives.ReadUInt32BigEndian(packet[2..]);
ReadOnlySpan<byte> body = packet.Slice(6, (int)length);
```

## Interview takeaways

- `Split`/`Substring` allocate per piece; span slicing allocates nothing.
- Parse forward-only with `IndexOf` + slicing; most `TryParse` methods accept spans.
- `ref struct` enumerators let `foreach` yield spans; `BinaryPrimitives` parses binary formats.
