## Blittable vs non-blittable types

A **blittable** type has the same memory representation in managed and native code, so it can be passed with no conversion (often by pinning and passing a pointer):

- `byte`, `sbyte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `float`, `double`, `IntPtr`/`nint`;
- one-dimensional arrays of those;
- structs containing only blittable fields with sequential or explicit layout.

**Non-blittable** types need conversion: `bool` (1 byte in C#, but the Win32 `BOOL` is 4 bytes), `char` (UTF-16 or ANSI?), `string`, classes, arrays of non-blittable types. Conversions cost time and sometimes copies.

## Strings

```csharp
[DllImport("kernel32.dll", CharSet = CharSet.Unicode)]   // pass as UTF-16 (the "W" functions on Windows)
static extern uint GetEnvironmentVariable(string name, StringBuilder buffer, uint size);

[DllImport("mylib", CharSet = CharSet.Ansi)]             // pass as 8-bit code-page text
static extern void log_message([MarshalAs(UnmanagedType.LPUTF8Str)] string message);   // or force UTF-8
```

- `string` parameters are **in-only** (immutable); for output buffers pass a `StringBuilder` with capacity, or a `char[]`/`Span<char>`.
- Windows has `xxxA` (ANSI) and `xxxW` (wide/UTF-16) variants; `CharSet.Unicode` picks `W`. Linux libraries usually expect UTF-8: `LPUTF8Str` (or `StringMarshalling.Utf8` with `LibraryImport`).
- Who frees a string returned by native code? If the native side allocated it, you need its matching free function; the marshaler can't guess.

## Structs and layout

```csharp
[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
struct SystemTime
{
    public ushort Year, Month, DayOfWeek, Day, Hour, Minute, Second, Milliseconds;
}

[DllImport("kernel32.dll")]
static extern void GetSystemTime(out SystemTime time);
```

- `LayoutKind.Sequential` (default for structs): fields in declaration order, with **padding** for alignment, matching C compilers. A `byte` followed by an `int` puts 3 padding bytes in between.
- `Pack = n` changes the alignment, matching `#pragma pack(n)` in C.
- `LayoutKind.Explicit` + `[FieldOffset(x)]` places each field at an exact offset; overlapping offsets create a **union**.
- `Marshal.SizeOf<T>()` and `Marshal.OffsetOf<T>(nameof(Field))` show the unmanaged layout; compare with `sizeof` and `offsetof` in C when debugging.
- Inline arrays and strings: `[MarshalAs(UnmanagedType.ByValArray, SizeConst = 16)]`, `ByValTStr`.

## Parameter direction

| C# | Native view |
| --- | --- |
| `int x` | value |
| `ref int x` | `int*` in/out |
| `out int x` | `int*` out |
| `[In] T[]` / `[Out] T[]` | control which direction array contents are copied |
| `ref MyStruct s` | `MyStruct*` |
| class parameter | pointer to the marshaled fields (in by default) |

## Unions in practice

```csharp
[StructLayout(LayoutKind.Explicit)]
struct Variant
{
    [FieldOffset(0)] public int Type;
    [FieldOffset(8)] public long AsLong;     // these three overlap
    [FieldOffset(8)] public double AsDouble;
    [FieldOffset(8)] public IntPtr AsPointer;
}
```

You can't overlap a reference-type field with a value-type field (the GC would be confused); unions are for unmanaged data.

## Interview takeaways

- Blittable types pass without conversion; strings, bools and classes need marshaling.
- Choose the string encoding explicitly (`CharSet.Unicode`, `LPUTF8Str`).
- `StructLayout`, `Pack` and `FieldOffset` reproduce C layouts and unions; `Marshal.SizeOf/OffsetOf` verify them.
