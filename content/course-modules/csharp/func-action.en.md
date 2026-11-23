Writing a new delegate type for every case is tedious. The framework provides two families of generic delegates that cover almost all needs:

- **`Func<..., TResult>`**: a method that **returns** a value. `Func<int, int, int>` takes two ints and returns an int.
- **`Action<...>`**: a method that **returns nothing** (`void`). `Action<string>` takes a string.

```csharp
Func<int, int, int> add = (a, b) => a + b;     // returns int
Action<string> print = s => Console.WriteLine(s);   // returns nothing

Console.WriteLine(add(2, 3));                  // 5
print("hello");                                // hello
```

The last type parameter of `Func` is always the return type. Every earlier one is a parameter. `Action` has only parameters. Both come with versions for 0 to 16 parameters:

| Type | Meaning |
|---|---|
| `Func<TResult>` | no parameters, returns `TResult` |
| `Func<T, TResult>` | one parameter of type `T` |
| `Action` | no parameters, returns nothing |
| `Action<T1, T2>` | two parameters, returns nothing |

## Why use them

- No need to declare a delegate type for each signature: `Func<int, bool>` is enough for "a test on an int".
- Other code and libraries understand them immediately, because they are shared.
- `Predicate<T>` is the same as `Func<T, bool>`, and `Comparison<T>` is the same as `Func<T, T, int>`, though the list methods use their own names.

## The rule of thumb

If the delegate returns a value, use `Func`. If it does not, use `Action`. Declare your own delegate type only when the name of the type makes the code clearer, for example `delegate int Operation(int a, int b);` tells the reader more than `Func<int, int, int>`.
