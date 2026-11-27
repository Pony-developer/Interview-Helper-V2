## Three layers under every C# program

```
  Your code  (C#, compiled to IL)
  ─────────────────────────────────────────
  Application layers  (ASP.NET Core, WPF, MAUI, ...)
  Base Class Library  (System.*, collections, I/O, LINQ, HTTP, ...)
  Common Language Runtime  (JIT, GC, type loader, exceptions, threads)
  ─────────────────────────────────────────
  Operating system
```

### The CLR: the engine

The **Common Language Runtime** loads your assemblies and runs them. Its jobs:

- **JIT compilation.** The C# compiler emits **IL** (Intermediate Language), a CPU-independent bytecode, plus **metadata** describing every type and member. When a method is called for the first time, the JIT turns its IL into native code for the actual CPU.
- **Garbage collection** of the managed heap.
- **Type safety and verification**, exception handling, thread management, security boundaries.

Because C#, F# and VB.NET all compile to IL, they share the same runtime and can call each other freely. Code that runs under the CLR is called **managed code**.

### Tiered compilation and ahead-of-time options

JIT compiling costs time at startup. .NET reduces it in several ways:

- **Tiered compilation**: a method is first compiled quickly with few optimizations; if it turns out to be hot, it is recompiled with full optimization.
- **ReadyToRun**: assemblies ship with precompiled native code, so startup needs little JIT. The IL is still there as a fallback.
- **Native AOT** (fully ahead-of-time): the whole app becomes a single native executable with no JIT at all. Faster startup and smaller memory, at the price of limits on reflection and dynamic code generation.

### The BCL: the toolbox

The **Base Class Library** is the set of assemblies every .NET app gets for free: primitive types, strings and text, collections, LINQ, I/O, networking, threading and tasks, reflection, cryptography, XML and JSON. Most of this course is about the BCL.

### Runtimes

A *runtime* is a CLR plus a BCL, packaged for a family of platforms.

| Runtime | Where it runs | Notes |
| --- | --- | --- |
| **.NET 6** (and later) | Windows, macOS, Linux | The modern, cross-platform, open-source line. Successor to .NET Core. |
| **.NET Framework 4.x** | Windows only | The original runtime. Still supported, no new features. |
| **Mono / Xamarin** | Mobile, Unity, WebAssembly | Now merged into the .NET 6+ family for mobile and Blazor. |
| **UWP** | Windows 10+ devices | Legacy sandboxed app model. |

.NET Core 3.1 was followed by .NET 5 (the "Core" was dropped to signal that it replaces .NET Framework) and then .NET 6, a long-term support release.

### Self-contained vs framework-dependent

- **Framework-dependent**: the app needs the matching .NET runtime installed on the machine. Small deployment.
- **Self-contained**: the runtime is copied next to the app. Larger, but runs on a machine with nothing installed. Can be trimmed to remove unused library code.

## Interview takeaways

- C# → IL + metadata → JIT → native code. The CLR also gives you GC, exceptions and type safety.
- The BCL is the standard library; the application layers (ASP.NET Core, WPF) sit on top of it.
- ReadyToRun and Native AOT trade build-time work for faster startup.
