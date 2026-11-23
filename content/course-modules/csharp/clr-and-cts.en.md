The **CLR** (Common Language Runtime) is the virtual machine that runs .NET code. Code that runs under its control is called **managed code**; everything else (the operating system, C++ libraries) is **unmanaged** or **native** code.

## What the CLR does

- **Loads assemblies** and builds the in-memory description of their types (the type loader).
- **Compiles IL** to native code with the JIT (see the previous lesson).
- **Manages memory**: allocates objects on the managed heap and frees them with the garbage collector.
- **Keeps code type-safe**: you cannot treat a `string` as an `int[]`, read past the end of an array or call a method on a wrong type; violations become exceptions (`InvalidCastException`, `IndexOutOfRangeException`), not memory corruption.
- **Handles exceptions**: unwinds the stack, runs `finally` blocks, finds the matching `catch`.
- **Runs threads**: the thread pool, synchronization, `async` continuations.
- **Talks to native code**: P/Invoke (`[DllImport]`, `[LibraryImport]`) and COM interop.

There are several implementations: the original CLR of .NET Framework, **CoreCLR** of .NET Core and .NET 5+, the **Mono** runtime (mobile and WebAssembly), and the small runtime that Native AOT links into the executable. They all follow one standard, **ECMA-335** (the Common Language Infrastructure, CLI).

## The common type system (CTS)

The **CTS** defines what a type is for every .NET language: classes, structs, interfaces, enums, delegates; fields, methods, properties, events; visibility; inheritance rules (one base class, many interfaces).

Its key split:

- **Value types** derive from `System.ValueType`: `int`, `double`, `bool`, `DateTime`, any `struct` or `enum`. A variable holds the value itself.
- **Reference types**: classes, interfaces, arrays, delegates, `string`. A variable holds a reference to an object on the heap.

Every type, value types included, ultimately derives from `System.Object`. That is why an `int` can be passed as `object` (it is **boxed** into a heap object).

## C# keywords are aliases

The built-in C# type names are just keywords for CTS types:

| C# | CTS type | | C# | CTS type |
| --- | --- | --- | --- | --- |
| `int` | `System.Int32` | | `bool` | `System.Boolean` |
| `long` | `System.Int64` | | `char` | `System.Char` |
| `double` | `System.Double` | | `decimal` | `System.Decimal` |
| `string` | `System.String` | | `object` | `System.Object` |

`int` and `System.Int32` are the **same type**: same IL, same size (always 32 bits, on any CPU). Using the keyword is the usual style. `DateTime`, `Guid` and `List<T>` have no keyword.

## The common language specification (CLS)

The **CLS** is the subset of the CTS that every .NET language must support. A library that sticks to it in its **public** API can be used from any language. For example, the CLS has no unsigned integers (`uint`, `ulong`) and does not allow two public names that differ only in case. With `[assembly: CLSCompliant(true)]`, the C# compiler warns about violations.

## Generics are real at run time

In IL a generic type has its arity in its name: `List<T>` is `` List`1 ``, `Dictionary<TKey, TValue>` is `` Dictionary`2 ``. Unlike Java, the type arguments are **not erased**: `List<int>` and `List<string>` are different runtime types, and reflection can see `int` inside `List<int>`.

```csharp
Console.WriteLine(typeof(List<int>).Name);                         // List`1
Console.WriteLine(typeof(List<int>) == typeof(List<string>));      // False
Console.WriteLine(typeof(List<int>).GetGenericArguments()[0]);     // System.Int32
Console.WriteLine(typeof(int?) == typeof(Nullable<int>));          // True
```

`int?` is likewise only C# syntax for the generic struct `Nullable<int>`.

## Isolation: AppDomains are gone

.NET Framework could split one process into several **AppDomains** and unload them. Modern .NET has a single AppDomain; for plugins that must be loaded and unloaded, it offers **`AssemblyLoadContext`**. For real isolation, use separate processes or containers.

## The answer for the interview

The CLR is the runtime of .NET: it loads assemblies, JIT-compiles IL, manages memory with the GC, enforces type safety, handles exceptions and threads, and calls native code. The CTS defines the types that all .NET languages share, split into value and reference types, all deriving from `System.Object`; C# keywords such as `int` are aliases for CTS types such as `System.Int32`. The CLS is the subset of the CTS a library should use in its public API to be usable from every language.
