## Two kinds of types

Every C# type is either a **value type** or a **reference type**. The difference decides what assignment, equality and `null` mean.

| | Value types | Reference types |
| --- | --- | --- |
| Examples | `int`, `double`, `bool`, `char`, `decimal`, `DateTime`, any `struct`, any `enum` | `string`, arrays, any `class`, `interface`, `delegate`, `record` (class) |
| A variable holds | the data itself | a reference (an address) to an object |
| Assignment copies | the whole value | the reference only; both variables see the same object |
| Can be `null` | no (unless `Nullable<T>`, written `T?`) | yes |

```csharp
struct PointS { public int X; }
class  PointC { public int X; }

var s1 = new PointS { X = 1 };
var s2 = s1;          // copy
s2.X = 9;
Console.WriteLine(s1.X);   // 1

var c1 = new PointC { X = 1 };
var c2 = c1;          // same object
c2.X = 9;
Console.WriteLine(c1.X);   // 9
```

## Where things live

- **Stack**: method locals and parameters. Freed automatically when the method returns. Fast.
- **Heap**: objects created with `new` for reference types. Freed by the garbage collector.

A common oversimplification is "value types live on the stack". More precisely: a value type lives *where it is declared*. A local `int` sits on the stack, but an `int` field of a class lives inside that object on the heap, and the elements of an `int[]` live inside the array on the heap.

A reference-type object always costs a header (object type pointer and sync block, 16 bytes on 64-bit) plus its fields, rounded up. A value type costs only its fields. That is why millions of small structs in an array are far cheaper than millions of small objects.

## Default values

Every field and array element is automatically initialized to its type's default: `0` for numbers, `false` for `bool`, `'\0'` for `char`, `null` for references, and for a struct each field set to its default. You can write `default(T)` or just `default` to get it.

Local variables, however, must be **definitely assigned** before use; the compiler refuses to read an unassigned local.

## Predefined types and their aliases

C# keywords are aliases for BCL types: `int` is `System.Int32`, `string` is `System.String`, `object` is `System.Object`, `bool` is `System.Boolean`. They are identical; the keyword is just shorter.

## Interview takeaways

- Assignment copies the value for structs and the reference for classes.
- "Value types on the stack" is only true for locals; fields live inside their containing object.
- Use a struct for small, immutable, value-like data (a point, money, a date range). Use a class for anything with identity or a big state.
