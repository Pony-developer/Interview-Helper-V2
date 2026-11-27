## A general-purpose, type-safe, object-oriented language

C# was designed to make large codebases manageable. Four ideas run through the whole language.

### 1. Object orientation, done thoroughly

- **Unified type system.** Every type, from `int` to your own `Customer`, ultimately derives from `object`. That is why `42.ToString()` works and why any value can be stored in an `object` variable.
- **Classes and interfaces.** A class bundles state and behavior; an interface describes behavior with no state. A class inherits from one base class but can implement many interfaces.
- **Properties, methods and events** are the three kinds of function members. Properties look like fields to callers but run code; events let an object announce that something happened.

C# is not *only* object-oriented. It borrows heavily from functional programming:

- functions are values (delegates and lambdas);
- `record` types, `init` accessors and `readonly` structs encourage immutability;
- pattern matching, `switch` expressions and LINQ make data transformations declarative.

### 2. Type safety

The compiler checks that values are used according to their types. You cannot call a method that a type doesn't have or pass a `string` where an `int` is expected.

- C# is mostly **statically typed**: errors are caught at compile time, and the IDE can offer precise IntelliSense and refactorings.
- It is **strongly typed**: conversions that may lose data must be written explicitly (`(int)3.9`).
- The `dynamic` keyword lets you opt out locally and defer binding to run time, but that is the exception.

### 3. Memory management

You never free objects yourself. The **garbage collector** (GC) periodically finds objects that nothing references any more and reclaims their memory. This removes whole classes of bugs: dangling pointers, double frees, most leaks.

C# still lets you go low-level when performance needs it:

```csharp
unsafe
{
    int value = 10;
    int* p = &value;   // a real pointer, allowed in an unsafe block
    *p = 20;
}
```

Modern C# offers safer tools for the same goals: `Span<T>`, `stackalloc` and `ref` locals give pointer-like speed without `unsafe`.

### 4. Platform support

C# code runs on Windows, macOS, Linux, Android and iOS (through .NET MAUI), in the browser (through Blazor WebAssembly) and on servers and containers. The language is the same everywhere; what differs is the runtime and the libraries available.

## Interview takeaways

- "C# is a type-safe, object-oriented language with strong functional features, running on the .NET runtime with automatic memory management."
- Static typing catches errors early; `dynamic` is the deliberate escape hatch.
- The GC manages memory, but you still release *unmanaged* resources (files, sockets) yourself, usually with `using`.
