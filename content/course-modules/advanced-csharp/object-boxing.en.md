## object: the root of everything

`System.Object` is the ultimate base type. Its public members are available on every value:

| Member | Purpose |
| --- | --- |
| `ToString()` | text representation; override it to help debugging and logging |
| `Equals(object)` | equality; reference equality by default for classes, field-by-field for structs |
| `GetHashCode()` | hash for dictionaries; must agree with `Equals` |
| `GetType()` | the exact runtime type, as a `System.Type` |
| `ReferenceEquals(a, b)` (static) | true only if both refer to the same object |

`GetType()` gives the runtime type of an instance; `typeof(T)` gives a type known at compile time:

```csharp
object o = "hi";
Console.WriteLine(o.GetType() == typeof(string));   // True
Console.WriteLine(o.GetType().Name);                 // String
```

## Boxing and unboxing

A value type can be treated as an `object` (or an interface). To do that, the runtime **boxes** it: allocates an object on the heap and copies the value into it.

```csharp
int n = 42;
object boxed = n;        // boxing: heap allocation + copy
int back = (int)boxed;   // unboxing: type check + copy out
```

Three things to remember:

1. **Boxing copies.** Changing `n` afterwards doesn't change `boxed`.
2. **Unboxing needs the exact type.** `(long)boxed` throws `InvalidCastException`, even though `int` converts to `long`. Write `(long)(int)boxed`.
3. **Boxing costs** an allocation and later GC work. In hot paths it adds up.

### Where boxing hides

```csharp
ArrayList list = new ArrayList(); list.Add(5);       // non-generic collection: boxes
string s = string.Format("{0}", 5);                  // params object[]: boxes
IComparable c = 5;                                    // interface on a struct: boxes
Console.WriteLine($"{5}");                           // modern compilers avoid this one
enumValue.HasFlag(Flags.A);                           // boxed in old runtimes; optimized since .NET Core 2.1
```

Generics are the main cure: `List<int>` stores `int`s directly, and `where T : IComparable<T>` lets you call `CompareTo` on a struct without boxing.

## Static and runtime type checking

- **Static**: the compiler checks `string s = 5;` and refuses.
- **Runtime**: a downcast or unboxing is checked by the CLR, which throws `InvalidCastException` if the object isn't what you said.

## Interview takeaways

- Boxing = wrap a value type in a heap object; unboxing = copy it back out, with an exact type check.
- Boxing is implicit, so look for it in non-generic APIs, `object` parameters and interfaces implemented by structs.
- Override `ToString` for debugging; override `Equals` and `GetHashCode` together or not at all.
