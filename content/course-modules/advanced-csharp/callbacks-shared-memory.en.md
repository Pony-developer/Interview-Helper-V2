## Callbacks from native code

Many native APIs call **you** back: enumeration functions, event hooks, sort comparers. Pass a delegate whose signature matches the native function pointer:

```csharp
delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

[DllImport("user32.dll")]
static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

EnumWindows((hWnd, _) =>
{
    Console.WriteLine(hWnd);
    return true;                 // continue enumerating
}, IntPtr.Zero);
```

The marshaler creates a native-callable **thunk** for the delegate.

### Keeping the delegate alive

If native code stores the callback and calls it **later** (after the P/Invoke returns), the GC doesn't know about that reference. The delegate may be collected, and the next native call into it crashes the process ("CallbackOnCollectedDelegate"). Keep a reference for as long as native code can call it:

```csharp
private static readonly LogCallback KeepAlive = OnNativeLog;   // a static field holds it
static void Init() => register_log_callback(KeepAlive);
```

### Function pointers and UnmanagedCallersOnly

C# 9 function pointers and `[UnmanagedCallersOnly]` let native code call a **static method** directly, with no delegate and no thunk allocation:

```csharp
[UnmanagedCallersOnly(CallConvs = new[] { typeof(CallConvCdecl) })]
static int Compare(int* a, int* b) => *a - *b;

unsafe
{
    delegate* unmanaged[Cdecl]<int*, int*, int> cmp = &Compare;
    qsort(array, (nuint)count, sizeof(int), cmp);
}
```

Exceptions must never escape a callback into native code: catch everything inside.

## Calling conventions

`CallingConvention.StdCall` (the Win32 default on x86), `Cdecl` (C libraries on x86), and on x64/ARM64 there's essentially one convention. Mismatches on 32-bit x86 corrupt the stack.

## Sharing memory with native code

- **Pinning**: `fixed` statements or `GCHandle.Alloc(obj, GCHandleType.Pinned)` keep a managed buffer at a fixed address while native code uses it. Unpin (`handle.Free()`) as soon as possible.
- **Native allocation**: `Marshal.AllocHGlobal`/`NativeMemory.Alloc` give memory the GC never moves; copy data in and out with `Marshal.Copy`, or wrap it in a `Span<T>`.
- **Mapping a struct onto native memory**: `Marshal.PtrToStructure<T>(ptr)` copies native bytes into a struct; `Marshal.StructureToPtr(value, ptr, false)` copies the other way. With an `unsafe` pointer to a blittable struct you can read and write fields in place, with no copy.
- **Between processes**: memory-mapped files (see the streams module) with a struct layout both sides agree on.

```csharp
IntPtr buffer = Marshal.AllocHGlobal(Marshal.SizeOf<SystemTime>());
try
{
    get_time(buffer);
    SystemTime t = Marshal.PtrToStructure<SystemTime>(buffer);
}
finally
{
    Marshal.FreeHGlobal(buffer);
}
```

## Interview takeaways

- Native callbacks take delegates (or function pointers with `UnmanagedCallersOnly`).
- Keep callback delegates referenced while native code may call them; never let exceptions cross into native code.
- Pin briefly, or use native memory plus `Marshal.Copy`/`PtrToStructure` to share data.
