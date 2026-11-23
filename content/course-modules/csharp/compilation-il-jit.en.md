A C# program goes through **two** compilations before the processor runs it. Knowing both explains startup time, "warm-up", why reflection works, and what Native AOT changes.

## Step 1: C# to IL

The C# compiler (**Roslyn**) does not produce machine code. It produces an **assembly**: a `.dll` file (a Windows PE file, on every OS) that contains

- **IL** (Intermediate Language, also called CIL or MSIL): instructions for an abstract stack machine, the same for every processor;
- **metadata**: tables that describe every type, method, field, parameter and attribute, and every reference to other assemblies;
- a **manifest**: the assembly's name, version, culture, public key, and its list of dependencies;
- resources (embedded files, localized strings).

```csharp
static int Add(int a, int b) => a + b;
```

compiles to

```text
.method private hidebysig static int32 Add(int32 a, int32 b) cil managed
{
    ldarg.0     // push a
    ldarg.1     // push b
    add         // pop both, push a + b
    ret         // return the top of the stack
}
```

F# and Visual Basic compile to the same IL, which is why they can use each other's libraries. Even a console app is a `.dll`: the small `MyApp.exe` next to it is just a native launcher (the **apphost**).

Metadata is what makes **reflection** (`typeof(T).GetMethods()`), IntelliSense, serializers, and dependency injection containers possible: the description of the code travels with the code. You can look at IL and metadata with **ILSpy**, `dotnet-ildasm` or **sharplab.io**.

## Step 2: IL to machine code, just in time

At run time the **JIT compiler** (Just-In-Time, called **RyuJIT** in modern .NET) turns IL into native code for the current CPU:

1. Every method starts as a small stub.
2. On the **first call**, the stub calls the JIT, which compiles the method and patches the stub to jump to the new code.
3. Later calls go straight to the native code.

So the first call of a method is slower, and an app that touches thousands of methods at startup pays for compiling them. In exchange, the JIT knows the exact CPU (it can use AVX-512 if it exists) and the actual values of `static readonly` fields.

## Tiered compilation

Optimizing well takes time, so modern .NET compiles in **tiers** (on by default since .NET Core 3.0):

- **Tier 0**: a quick, unoptimized compilation, so the app starts fast.
- A method that is called often (about 30 times) is recompiled at **tier 1** with full optimizations, on a background thread. Its callers switch to the new code.
- **OSR** (on-stack replacement): a method that is stuck in a long loop can switch to optimized code in the middle of the loop.
- **Dynamic PGO** (profile-guided optimization, on by default since .NET 8): the tier-0 code records which types and branches really occur, and tier 1 uses that profile, for example to call a virtual or interface method directly when it is almost always the same class.

That is why a .NET service gets faster during its first seconds or minutes, and why **benchmarks need a warm-up** (BenchmarkDotNet does it for you).

## Ahead-of-time options

| Option | What it does | Trade-off |
| --- | --- | --- |
| **ReadyToRun** (`PublishReadyToRun`) | Stores precompiled native code inside the assembly, next to the IL | Faster startup, bigger files; hot methods are still re-JITted at tier 1 |
| **Native AOT** (`PublishAot`, .NET 7+) | Compiles the whole app into one native executable; no JIT and no IL at run time | Very fast startup, low memory; no `Reflection.Emit`, no loading of assemblies at run time, limited reflection, one build per OS and CPU |

Native AOT suits command-line tools, serverless functions and small containers. Libraries that rely on runtime code generation need source generators instead (for example, `System.Text.Json` and `Regex` both have them).

## Compared with Java

The idea is the same as Java bytecode and the JVM. Two differences that interviewers like: .NET generics exist in IL and at run time (Java erases them), and .NET has user-defined value types (`struct`).

## The answer for the interview

Roslyn compiles C# into IL plus metadata, stored in an assembly. At run time the CLR's JIT compiles each method to native code on its first call; tiered compilation first makes quick code and later recompiles hot methods with full optimizations and profile data. ReadyToRun precompiles code to speed up startup, and Native AOT removes the JIT altogether at the cost of dynamic features.
