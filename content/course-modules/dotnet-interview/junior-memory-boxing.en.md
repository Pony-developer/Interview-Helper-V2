## Copy semantics in code (Q28–29)

```csharp
struct PointS { public int X; }
class  PointC { public int X; }

var s1 = new PointS { X = 1 };
var s2 = s1;          // the whole value is copied
s2.X = 9;             // s1.X is still 1

var c1 = new PointC { X = 1 };
var c2 = c1;          // only the reference is copied
c2.X = 9;             // c1.X is 9 now: one object, two references
```

The same applies to method parameters: a struct argument is copied (the method changes its own copy), a class argument passes a copy of the **reference** (the method can change the object, but assigning a new object to the parameter doesn't affect the caller). `ref` passes the variable itself.

```csharp
void Reset(PointC p) { p.X = 0; p = new PointC(); }   // the caller sees X = 0, not the new object
```

## Where things live

```text
void M()
{
    int n = 5;                 // stack (or register)
    var p = new PointC();      // reference on the stack → object on the heap
    var arr = new int[3];      // reference on the stack → array (all 3 ints inline) on the heap
    var s = new PointS();      // stack
}
class Holder { PointS pos; }   // pos lives inside the Holder object, on the heap
```

The precise rule: **reference-type objects** always live on the managed heap; **value types live wherever their container lives** — a local in a stack frame, a field inside its object, an element inside its array.

## Boxing costs (Q32)

```csharp
int n = 42;
object o = n;                 // boxing: allocate an object on the heap, copy 42 into it
int m = (int)o;               // unboxing: type check + copy out

IComparable c = n;            // boxing too: converting a struct to an interface
string.Format("{0}", n);      // boxing: params object[]
var list = new ArrayList { n };   // boxing; List<int> would not box
```

Each box is a heap allocation (≈24 bytes on 64-bit) that the GC must collect later. In a loop of millions of items this shows up in profiles. Generics, `$"{n}"` (interpolation handlers in modern C#) and overloads taking `int` avoid it.

## Nullable value types (Q27)

```csharp
int? age = null;
if (age.HasValue) Console.WriteLine(age.Value);
int years = age ?? 18;               // default when null
int? next = age + 1;                 // lifted operator: null + 1 = null
bool adult = age >= 18;              // false when null (comparison with null is false)
```

`Nullable<T>` is a struct `{ bool hasValue; T value; }` — no heap allocation. Boxing a null `int?` gives a real `null` reference; boxing a non-null one boxes the underlying `int`. **Nullable reference types** (`string?`, C# 8) are a different feature: compile-time annotations and warnings, no runtime change.

## Strings (Q29–30)

- Immutable: every "modification" (`Replace`, `ToUpper`, `+`) returns a **new** string. That makes strings thread-safe and safe as dictionary keys.
- `==` compares **contents** (operator overloaded); `ReferenceEquals` compares references.
- **Interning**: string literals are stored once per process (`"abc"` and `"abc"` are the same object); strings built at run time are not interned unless you call `string.Intern`.
- Compare with an explicit rule: `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)`.
- Building text in a loop: `StringBuilder`, `string.Join`, `string.Concat`, or `string.Create` for hot paths.
