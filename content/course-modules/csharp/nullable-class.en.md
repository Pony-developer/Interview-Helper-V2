A value type such as `int` cannot be `null`: every `int` variable always holds a number. Yet sometimes a value is **missing**: a person's age may be unknown, a search may find nothing. For that, C# has `Nullable<T>`, written with a question mark: `int?`.

```csharp
int? age = null;                 // no age known yet
age = 30;                        // now it holds a value

if (age.HasValue)
{
    Console.WriteLine(age.Value + 1);    // 31
}
```

`int?` is the same as `Nullable<int>`. It is a **struct** that holds a flag (`HasValue`) and the value (`Value`). Reading `Value` when there is no value throws an `InvalidOperationException`, so check `HasValue` first.

## Useful operators

```csharp
int? a = null;
int? b = 7;

int x = a ?? 0;                  // the null-coalescing operator: 0, because a is null
int y = b ?? 0;                  // 7
int z = a.GetValueOrDefault(5);  // 5: the value, or 5 if there is none

int? sum = a + b;                // null: any operation with null gives null
Console.WriteLine(sum == null);  // True
```

- `??` gives the left side if it is not null, otherwise the right side.
- Arithmetic with a `null` gives `null`, not an error.
- `GetValueOrDefault(d)` gives the value, or `d` if there is none.

## Where it comes from

A lookup that might find nothing is a natural case:

```csharp
static int? FindIndex(int[] items, int target)
{
    for (int i = 0; i < items.Length; i++)
    {
        if (items[i] == target)
        {
            return i;                    // the int converts to int? automatically
        }
    }
    return null;                         // not found
}

int? pos = FindIndex(new[] { 4, 8, 15 }, 8);
Console.WriteLine(pos.HasValue ? pos.Value.ToString() : "not found");   // 1
```

This is clearer than returning `-1`, because a `-1` can be mistaken for a real index, while `null` cannot.

## Reference types already have null

`string` and classes can be `null` without `?`. The `?` is needed only for value types. In C# 8 and later, nullable reference types add checks for reference types too, but that is a separate feature.
