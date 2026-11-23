Parsing text with `Substring` and `Split` creates a new string for every piece. In a server that parses millions of lines, this is millions of objects for the GC. `Span<T>` (C# 7.2, .NET Core 2.1) lets you work with **a part of existing memory without copying it**.

## `Span<T>` and `ReadOnlySpan<T>`

A span is a "window" over a contiguous block of memory: an array, a part of an array, a string, memory on the stack, or native memory. It stores only a reference to the start and a length.

```csharp
string date = "2024-05-17";
ReadOnlySpan<char> span = date.AsSpan();

int year  = int.Parse(span.Slice(0, 4));   // no new strings are created
int month = int.Parse(span.Slice(5, 2));
int day   = int.Parse(span.Slice(8, 2));
```

`Slice` makes a new window over the same memory, so it costs nothing. Most parsing and formatting methods in modern .NET (`int.Parse`, `TryFormat`, `Encoding.GetBytes`, streams) accept spans.

## `stackalloc`

A small temporary buffer can live on the stack, where it costs no GC work at all:

```csharp
Span<byte> buffer = stackalloc byte[256];
int written = Encoding.UTF8.GetBytes("hello", buffer);
```

Keep stack buffers small (hundreds of bytes, a few kilobytes at most): the stack is only about 1 MB.

## Why spans have strict rules

A span may point into the stack. If it could outlive the method, it would point into memory that is already reused. So `Span<T>` is a `ref struct`, and the compiler guarantees that it stays on the stack:

- it cannot be a field of a class or of an ordinary struct;
- it cannot be boxed or stored as `object`;
- it cannot be captured by a lambda;
- it cannot live across an `await`.

## `Memory<T>`

When you need to keep a window over memory in a field, or use it in an `async` method, use `Memory<T>` (or `ReadOnlyMemory<T>`). It has no stack restrictions, because it can only point to the heap. When you need the actual work, take `memory.Span` inside synchronous code.

## `ArrayPool<T>`

For big temporary buffers, rent instead of allocating:

```csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(64 * 1024);
try { /* use buffer; it may be larger than asked */ }
finally { ArrayPool<byte>.Shared.Return(buffer); }
```

## When to use all this

In hot paths: parsers, serializers, network protocols, high-load servers. In ordinary business code, simple and readable code with strings and lists is better. These types are not available on the C# 7 compiler that runs this course's practices; try them in a local .NET 8 project.

## The rule

Measure first. When allocations are the bottleneck, use spans to avoid copies, `stackalloc` for small buffers, and `ArrayPool` for large ones.
