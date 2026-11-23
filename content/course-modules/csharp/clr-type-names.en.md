The runtime names types differently from C#: `int` is `Int32`, `int[]` is `Int32[]`, `List<int>` is `` List`1 ``, and `int?` is `` Nullable`1 ``. Error messages, logs and reflection all show these CLR names. Write `CSharpName(Type type)`, which turns a `Type` back into the name you would write in C#:

- a type from the `Aliases` dictionary gets its C# keyword. The dictionary has only `int` and `string` so far: add the other keywords that `Main` needs;
- an array gets the C# name of its element type followed by `[]` (`type.IsArray`, `type.GetElementType()`);
- `Nullable<T>` becomes the C# name of `T` followed by `?`. Check it with `type.GetGenericTypeDefinition() == typeof(Nullable<>)`;
- any other generic type (`type.IsGenericType`) gets its name without the `` `N `` arity suffix, then the C# names of its type arguments (`type.GetGenericArguments()`) in angle brackets, separated by `", "`;
- any other type keeps `type.Name`.

Type arguments and array elements can themselves be generic, so the method calls itself. Do not change `Main`. Expected output:

```text
Int32 -> int
String -> string
Boolean -> bool
Object -> object
DateTime -> DateTime
Double[] -> double[]
List`1 -> List<int>
Dictionary`2 -> Dictionary<string, List<long>>
Nullable`1 -> int?
KeyValuePair`2[] -> KeyValuePair<char, decimal>[]
```

Hint: check for an alias first, then for an array, then for a generic type. `` type.Name.IndexOf('`') `` finds where the arity suffix starts.
