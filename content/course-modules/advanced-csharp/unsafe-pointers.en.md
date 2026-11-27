## Stepping outside the safety net

C# supports raw pointers inside `unsafe` code. You must opt in twice: mark code `unsafe`, and allow it in the project (`<AllowUnsafeBlocks>true</AllowUnsafeBlocks>`).

```csharp
unsafe static void Fill(int* p, int count, int value)
{
    for (int i = 0; i < count; i++) p[i] = value;   // no bounds checks
}
```

Pointer operators:

| Operator | Meaning |
| --- | --- |
| `&x` | address of `x` |
| `*p` | the value `p` points to |
| `p->Field` | member access through a pointer (same as `(*p).Field`) |
| `p[i]` | same as `*(p + i)` |
| `p + n`, `p++` | pointer arithmetic, in units of the pointee's size |

Pointers can only point to **unmanaged** types: primitives, enums, pointers, and structs that contain only such types (no references).

## fixed: pinning managed memory

The garbage collector compacts the heap, which moves objects. To take a pointer to something on the heap, you must **pin** it so it can't move while you use the pointer:

```csharp
byte[] buffer = new byte[1024];
unsafe
{
    fixed (byte* p = buffer)          // pins the array for the duration of the block
    {
        for (int i = 0; i < buffer.Length; i++) p[i] = 0xFF;
    }
}
fixed (char* c = "text") { }          // also works on strings
```

Keep `fixed` blocks short: pinned objects get in the way of heap compaction.

## stackalloc

```csharp
unsafe
{
    int* numbers = stackalloc int[100];   // 100 ints on the stack: no GC at all
}

Span<int> safe = stackalloc int[100];     // C# 7.2+: no unsafe needed when assigned to a Span
```

Stack memory is freed automatically when the method returns. It's small (typically 1 MB per thread), so use it only for small, bounded buffers.

## Fixed-size buffers

```csharp
unsafe struct PacketHeader
{
    public fixed byte Magic[4];   // an inline array inside the struct
    public int Length;
}
```

Useful when matching native struct layouts.

## Function pointers (C# 9)

```csharp
unsafe
{
    delegate*<int, int, int> add = &Add;   // a raw pointer to a static method, no delegate allocation
    Console.WriteLine(add(2, 3));
}
static int Add(int a, int b) => a + b;
```

Used in high-performance interop to call native functions directly.

## void* and conversions

`void*` points to untyped memory; cast it to a typed pointer before dereferencing. Pointers convert to and from `IntPtr`/`nint`, which is how they're passed around in interop APIs.

## Why (and why not)

Reasons for unsafe code:

- interop with native libraries that take pointers;
- squeezing out the last bit of performance in tight loops (image processing, parsers, serializers).

Reasons to avoid it:

- no bounds checking: bugs corrupt memory silently;
- the assembly is marked unverifiable;
- in modern C#, **`Span<T>`, `stackalloc` into spans, `ref` returns, `MemoryMarshal` and `Unsafe`** give similar speed with safety. Reach for them first.

## Interview takeaways

- `unsafe` + `AllowUnsafeBlocks`; pointers only to unmanaged types.
- `fixed` pins heap objects so the GC doesn't move them.
- `stackalloc` allocates on the stack; assign it to a `Span<T>` to avoid `unsafe`.
- Prefer spans; use pointers for interop and measured hot spots.
