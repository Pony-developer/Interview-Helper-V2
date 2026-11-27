## Getting a Type

`System.Type` describes a type: its name, base type, interfaces, members, attributes, generic arguments.

```csharp
Type a = typeof(Order);                     // compile-time known type
Type b = order.GetType();                   // runtime type of an instance (maybe a subclass)
Type? c = Type.GetType("Shop.Core.Order, Shop.Core");   // by assembly-qualified name
Type d = typeof(Program).Assembly.GetType("Shop.Core.Order")!;
```

## Inspecting a type

```csharp
Type t = typeof(List<string>);
t.Name;                 // List`1
t.FullName;             // System.Collections.Generic.List`1[[System.String, ...]]
t.Namespace;            // System.Collections.Generic
t.BaseType;             // System.Object
t.IsClass; t.IsValueType; t.IsInterface; t.IsAbstract; t.IsSealed; t.IsEnum; t.IsPublic;
t.GetInterfaces();      // IList<string>, ICollection<string>, ...
t.IsAssignableTo(typeof(IEnumerable<string>));          // .NET 5; or typeof(IEnumerable<string>).IsAssignableFrom(t)
t.GetCustomAttributes(inherit: true);
```

`IsAssignableFrom` reads backwards: `typeof(Base).IsAssignableFrom(typeof(Derived))` is true.

## Generic types

```csharp
Type open = typeof(Dictionary<,>);                          // unbound generic type definition
Type closed = open.MakeGenericType(typeof(string), typeof(int));   // Dictionary<string, int>
closed.IsGenericType;               // true
closed.GetGenericTypeDefinition();  // Dictionary<,>
closed.GetGenericArguments();       // [String, Int32]
open.ContainsGenericParameters;     // true: can't be instantiated
```

Detecting "is this any `IRepository<T>`?" requires checking generic interfaces:

```csharp
bool isRepo = t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRepository<>));
```

## Arrays, nested and nullable types

```csharp
typeof(int[]).GetElementType();          // Int32
typeof(int).MakeArrayType();             // Int32[]
typeof(Order.Line).DeclaringType;        // Order (nested type)
Nullable.GetUnderlyingType(typeof(int?)); // Int32, or null for non-nullable types
```

## Activating: creating instances

```csharp
object o1 = Activator.CreateInstance(typeof(Order))!;                    // parameterless constructor
object o2 = Activator.CreateInstance(typeof(Money), 10m, "EUR")!;        // matching constructor
T Create<T>() where T : new() => new T();                                 // generic: compiles to Activator under the hood

ConstructorInfo ctor = typeof(Money).GetConstructor(new[] { typeof(decimal), typeof(string) })!;
object o3 = ctor.Invoke(new object[] { 5m, "UAH" });
```

`Activator.CreateInstance` is how DI containers, serializers, plug-in hosts and test frameworks build objects they only know at run time.

## Reflecting assemblies

```csharp
Assembly asm = typeof(Program).Assembly;
IEnumerable<Type> handlers = asm.GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && typeof(IHandler).IsAssignableFrom(t));
```

`GetTypes` can throw `ReflectionTypeLoadException` if some types reference missing assemblies; its `Types` property still contains the ones that loaded. `GetExportedTypes` returns only public types.

## Interview takeaways

- `typeof(T)` (compile time) vs `obj.GetType()` (runtime type).
- `MakeGenericType`/`GetGenericTypeDefinition` work with open and closed generics.
- `Activator.CreateInstance` and `ConstructorInfo.Invoke` create objects of types known only at run time.
