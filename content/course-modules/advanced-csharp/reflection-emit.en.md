## Generating code at run time

Sometimes the fastest code depends on information you only have at run time: the shape of a type to serialize, a mapping configuration, a dynamic proxy. .NET can **generate IL** on the fly and JIT it into real machine code.

Three levels, from most convenient to most powerful:

| Tool | Writes | Typical users |
| --- | --- | --- |
| Expression trees + `Compile()` | expressions (no IL knowledge needed) | mappers, query providers, fast getters |
| `DynamicMethod` + `ILGenerator` | IL for a single method | serializers, dynamic invokers |
| `AssemblyBuilder` / `TypeBuilder` (Reflection.Emit) | whole types in a dynamic assembly | proxy libraries (Castle DynamicProxy, Moq), ORMs |

## DynamicMethod

```csharp
// builds: int Square(int x) => x * x;
var method = new DynamicMethod("Square", typeof(int), new[] { typeof(int) });
ILGenerator il = method.GetILGenerator();
il.Emit(OpCodes.Ldarg_0);   // push x
il.Emit(OpCodes.Ldarg_0);   // push x
il.Emit(OpCodes.Mul);       // multiply the top two values
il.Emit(OpCodes.Ret);       // return the top of the stack

var square = (Func<int, int>)method.CreateDelegate(typeof(Func<int, int>));
Console.WriteLine(square(7));   // 49
```

IL is a **stack machine**: instructions push values onto an evaluation stack and pop their operands from it. Locals are declared with `il.DeclareLocal(type)`, and branches use labels (`il.DefineLabel()`, `il.MarkLabel(label)`, `OpCodes.Brtrue`). A `DynamicMethod` is garbage-collected when no longer referenced, and with `skipVisibility` it can access private members.

## Emitting types

```csharp
AssemblyBuilder asm = AssemblyBuilder.DefineDynamicAssembly(new AssemblyName("Dyn"), AssemblyBuilderAccess.RunAndCollect);
ModuleBuilder module = asm.DefineDynamicModule("Dyn");
TypeBuilder tb = module.DefineType("Greeter", TypeAttributes.Public);

MethodBuilder mb = tb.DefineMethod("Hello", MethodAttributes.Public, typeof(string), Type.EmptyTypes);
ILGenerator il = mb.GetILGenerator();
il.Emit(OpCodes.Ldstr, "Hello from emitted code");
il.Emit(OpCodes.Ret);

Type greeter = tb.CreateType()!;
object g = Activator.CreateInstance(greeter)!;
Console.WriteLine(greeter.GetMethod("Hello")!.Invoke(g, null));
```

You can define fields, properties, constructors (remember to call the base constructor), generic parameters, and implement interfaces: that's how mocking libraries create a class implementing `IOrderService` at run time.

## Inspecting IL

To learn what IL to emit, write the method in C# and look at the compiled IL with **ILSpy**, **dotPeek**, **SharpLab** or `ildasm`. Copying the compiler's IL is far easier than writing it from scratch. Libraries like Mono.Cecil read and rewrite IL in existing assemblies (used by weavers like Fody).

## Limitations

- Errors are discovered only at run time (`InvalidProgramException` for bad IL).
- **Native AOT and iOS** can't JIT, so Reflection.Emit isn't available there; trimming can remove the members emitted code relies on.
- It's hard to read and maintain.

That's why modern .NET increasingly moves this work to **compile time** with source generators (next lecture).

## Interview takeaways

- Run-time code generation: expression trees (easiest), `DynamicMethod` (one method of IL), `TypeBuilder` (whole types).
- IL is a stack-based instruction set; look at compiler output to learn it.
- Emit is used by proxies, serializers and ORMs; it doesn't work under Native AOT.
