## One type for any contiguous memory

`Span<T>` is a view over a **contiguous block** of `T`s, wherever it lives:

```csharp
int[] array = { 1, 2, 3, 4, 5 };
Span<int> all = array;                       // over a managed array
Span<int> middle = all.Slice(1, 3);          // { 2, 3, 4 }: no copy
Span<int> tail = all[2..];                   // ranges work too
middle[0] = 20;                              // writes into the array
Console.WriteLine(array[1]);                 // 20

Span<byte> stackBuffer = stackalloc byte[128];   // over stack memory
ReadOnlySpan<char> word = "hello world".AsSpan(6);   // over a string's characters, read-only
```

A span is just a **reference + a length**. Slicing creates another reference + length: no allocation, no copying. Indexing is bounds-checked and, in hot loops, as fast as array access.

`ReadOnlySpan<T>` is the read-only variant; strings give you `ReadOnlySpan<char>` because they're immutable.

## Why it exists

Before spans, working on "part of a buffer" meant either copying (`Substring`, `Array.Copy`, `ToArray`) or passing `(array, offset, count)` triples everywhere. Spans make sub-buffer APIs safe and allocation-free, which is why the BCL uses them heavily:

```csharp
int n = int.Parse("orders: 42".AsSpan(8));            // parse part of a string, no Substring
bool ok = Guid.TryParse(input.AsSpan().Trim(), out var id);
int written = Encoding.UTF8.GetBytes("hi", buffer);   // write into a caller-provided span
stream.Read(buffer.AsSpan(0, 512));
"a,b,c".AsSpan().IndexOf(',');
```

Many APIs have `TryFormat(Span<char> destination, out int charsWritten)` methods that format numbers and dates into a buffer without creating strings.

## The ref struct rules

`Span<T>` is a **`ref struct`**: it may point into the stack, so the compiler keeps it on the stack too. You can't:

- store it in a field of a class or normal struct;
- box it, cast it to `object` or an interface;
- use it in an `async` method across `await`, in an iterator across `yield`, or capture it in a lambda;
- use it as a generic type argument (until C# 13).

These restrictions are what make it **safe**: a span can never outlive the memory it points to.

## Useful operations

```csharp
span.Fill(0);
span.Clear();
source.CopyTo(destination);          // throws if destination is too short; TryCopyTo returns false
span.Reverse();
span.Sort();                         // MemoryExtensions (.NET 5)
bool same = a.SequenceEqual(b);
int idx = text.AsSpan().IndexOfAny(" ,;");
foreach (ref int x in span) x *= 2;  // ref iteration: modify in place
```

`MemoryMarshal.Cast<byte, int>(bytes)` reinterprets memory as another unmanaged type without copying (watch alignment and endianness).

## Interview takeaways

- `Span<T>` = safe, bounds-checked view over arrays, stack or native memory; slicing doesn't copy.
- It's a `ref struct`: stack-only, no fields, no boxing, no await.
- Use `ReadOnlySpan<char>` to parse parts of strings without `Substring`.
