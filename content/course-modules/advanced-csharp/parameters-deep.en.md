## By value is the default

Without a modifier, an argument is **copied** into the parameter. For a value type that's a copy of the data; for a reference type it's a copy of the *reference*, so the method can change the object's contents but cannot make the caller's variable point somewhere else.

```csharp
void Reset(StringBuilder sb) { sb.Clear(); sb = new StringBuilder("x"); }
var b = new StringBuilder("hello");
Reset(b);
Console.WriteLine(b.Length);   // 0: Clear() affected our object, the reassignment did not
```

## The modifiers

| Modifier | Passed by | Caller must assign before? | Method must assign? | Method may modify? |
| --- | --- | --- | --- | --- |
| *(none)* | value | yes | no | its own copy |
| `ref` | reference | **yes** | no | yes, and the caller sees it |
| `out` | reference | no | **yes**, before returning | yes |
| `in` | reference (read-only) | yes | no | **no** |

```csharp
static void Swap(ref int a, ref int b) { int t = a; a = b; b = t; }

if (int.TryParse(text, out int value))   // out var: declare at the call site
    Console.WriteLine(value);

_ = int.TryParse(text, out _);           // discard an out value you don't need

static double Length(in Vector3 v) => Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);
```

`in` exists for performance: a large struct is passed by reference with no copy, yet the method promises not to change it. If the struct isn't `readonly`, calling one of its methods may still create a hidden *defensive copy*; marking the struct `readonly` avoids that.

## params

```csharp
static int Max(params int[] values) { /* ... */ }
Max(3, 9, 4);          // the compiler builds the array
Max(new[] { 3, 9 });   // or you pass one yourself
Max();                 // an empty array, not null
```

`params` must be the last parameter and there can be only one.

## Optional and named parameters

```csharp
void Log(string message, int level = 1, bool timestamp = true) { }

Log("start");                         // level = 1, timestamp = true
Log("disk full", timestamp: false);   // skip a parameter by naming the next one
Log(level: 3, message: "boom");       // named arguments in any order
```

Default values are **baked into the caller** at compile time. If a library changes a default, callers compiled against the old version keep using the old value until they recompile.

## ref locals and ref returns

```csharp
ref int FindSlot(int[] array, int value)
{
    for (int i = 0; i < array.Length; i++)
        if (array[i] == value) return ref array[i];
    throw new InvalidOperationException();
}

int[] data = { 1, 2, 3 };
ref int slot = ref FindSlot(data, 2);
slot = 20;                     // writes straight into data[1]
```

## var

`var` means "infer the type from the initializer". The variable is still statically typed; `var x = 5;` is an `int` forever. Use it when the type is obvious from the right-hand side.

## Interview takeaways

- Reference types are passed *by value* too: the reference is copied. `ref` passes the variable itself.
- `out` must be assigned by the callee; `ref` must be assigned by the caller; `in` is read-only by-reference.
- Default parameter values are compiled into the call site.
