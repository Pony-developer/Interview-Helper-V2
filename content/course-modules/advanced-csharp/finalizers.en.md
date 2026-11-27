## What a finalizer is

A finalizer (C# syntax `~ClassName()`, which overrides `Object.Finalize`) runs **before** the GC reclaims an object's memory. It's a last-chance cleanup for **unmanaged** resources if the user forgot to call `Dispose`.

```csharp
public class NativeBuffer : IDisposable
{
    private IntPtr _ptr = Marshal.AllocHGlobal(1024);

    ~NativeBuffer() => Free();                 // safety net

    public void Dispose()
    {
        Free();
        GC.SuppressFinalize(this);             // cleanup done: skip the finalizer
    }

    private void Free()
    {
        if (_ptr != IntPtr.Zero) { Marshal.FreeHGlobal(_ptr); _ptr = IntPtr.Zero; }
    }
}
```

## How finalization works

1. When an object with a finalizer is allocated, the runtime registers it in the **finalization queue**.
2. When the GC finds it unreachable, it **doesn't** reclaim it; it moves it to the **f-reachable queue**, which is a root, so the object (and everything it references) survives this collection and gets **promoted** to an older generation.
3. A dedicated **finalizer thread** runs finalizers from that queue.
4. Only a **later** collection actually reclaims the memory.

Consequences:

- Finalizable objects cost at least an extra collection and survive longer: **don't add finalizers you don't need**.
- Finalizers run at an **unpredictable** time, in an unpredictable order, on another thread.
- During a finalizer, objects it references may already have been finalized. Don't touch other managed objects.
- An exception thrown from a finalizer **crashes the process**.
- On process exit, .NET Core doesn't guarantee finalizers run at all.

## Rules for writing one

- Only if your class **directly** owns an unmanaged resource (an `IntPtr` handle, native memory).
- Keep it short, fast and exception-free.
- Always pair it with `Dispose` + `GC.SuppressFinalize(this)`.
- Never block (no locks, no waits): the single finalizer thread serves the whole process.

## Prefer SafeHandle

In modern .NET you almost never write a finalizer. Wrap a native handle in a `SafeHandle` subclass instead:

```csharp
sealed class FileMappingHandle : SafeHandleZeroOrMinusOneIsInvalid
{
    public FileMappingHandle() : base(ownsHandle: true) { }
    protected override bool ReleaseHandle() => CloseHandle(handle);

    [DllImport("kernel32", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr h);
}
```

`SafeHandle` already has a robust critical finalizer, protects against handle-recycling races, and is understood by P/Invoke marshaling. Your class then just holds a `SafeHandle` field and implements a plain `Dispose` that disposes it.

## Resurrection

A finalizer can store `this` in a static field, making the object reachable again ("resurrection"). It works, but the finalizer won't run a second time unless you call `GC.ReRegisterForFinalize(this)`. It's a curiosity, occasionally used for object pools; avoid it in normal code.

## Interview takeaways

- Finalizers are a safety net for unmanaged resources, run on a finalizer thread at an unknown time.
- They make objects live longer and cost performance; suppress them in `Dispose`.
- Prefer `SafeHandle` over writing finalizers yourself.
