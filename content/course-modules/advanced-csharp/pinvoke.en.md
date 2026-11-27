## Platform Invoke

**P/Invoke** lets managed code call functions exported by native libraries: Windows APIs (`kernel32`, `user32`), the C runtime (`libc`), or your own C/C++/Rust DLLs.

```csharp
using System.Runtime.InteropServices;

static class Win32
{
    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern uint GetCurrentDirectory(uint bufferLength, char[] buffer);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int MessageBox(IntPtr hWnd, string text, string caption, uint type);
}

Win32.MessageBox(IntPtr.Zero, "Hello from C#", "P/Invoke", 0);
```

You declare a `static extern` method with the native signature; the runtime:

1. loads the library (searching the app folder, system folders, `LD_LIBRARY_PATH` on Linux; you can omit the extension and let it add `.dll`/`.so`/`.dylib`);
2. finds the entry point (by method name, or `EntryPoint = "..."`);
3. **marshals** arguments from managed to native representations, calls the function, and marshals results back.

## Errors

Native functions usually report errors through return codes plus a thread-local "last error". Use `SetLastError = true` and read it right after the call:

```csharp
[DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
static extern bool DeleteFile(string path);

if (!DeleteFile(@"C:\missing.txt"))
    throw new Win32Exception(Marshal.GetLastWin32Error());   // "The system cannot find the file specified"
```

The runtime captures the error immediately; calling `GetLastError` yourself later may read a value overwritten by the runtime's own calls.

## Handles

Native resources come back as handles (`IntPtr`). Wrap them in a `SafeHandle` subclass as the return type, and the marshaler does it for you:

```csharp
[DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
static extern SafeFileHandle CreateFile(string name, uint access, uint share, IntPtr security,
                                        uint creation, uint flags, IntPtr template);
```

`SafeHandle` guarantees release even on exceptions or thread aborts and prevents handle-recycling attacks.

## LibraryImport (.NET 7)

```csharp
static partial class Native
{
    [LibraryImport("libc", EntryPoint = "getpid")]
    internal static partial int GetPid();

    [LibraryImport("kernel32.dll", SetLastError = true, StringMarshalling = StringMarshalling.Utf16)]
    [return: MarshalAs(UnmanagedType.Bool)]
    internal static partial bool DeleteFileW(string path);
}
```

A source generator writes the marshaling code at compile time: no runtime IL stub generation, better performance, and it works with Native AOT and trimming. Prefer it for new code.

## Cross-platform tips

- Use `OperatingSystem.IsWindows()` / `IsLinux()` guards, or `NativeLibrary.SetDllImportResolver` to map library names per platform.
- Native libraries must match the process architecture (x64 vs ARM64).
- Package native binaries per runtime identifier under `runtimes/{rid}/native/` in NuGet packages.

## When to avoid P/Invoke

Every call has a cost (argument marshaling, a GC transition) and a risk (a wrong signature corrupts memory or crashes the process). Check first whether .NET already wraps the API; prefer batch-style native APIs over chatty ones.

## Interview takeaways

- `[DllImport]`/`[LibraryImport]` + `static extern` declare a native function; the runtime loads and marshals.
- `SetLastError = true` + `Marshal.GetLastWin32Error()` for error codes; `SafeHandle` for native handles.
- `LibraryImport` generates marshaling at compile time and works with Native AOT.
