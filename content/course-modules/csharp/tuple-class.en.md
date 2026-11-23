A **tuple** is a small generic class that holds a fixed number of values of possibly different types. Such a class is useful, and .NET already has one: `System.Tuple<T1, T2>`.

```csharp
var pair = Tuple.Create("Ann", 30);
Console.WriteLine(pair.Item1);          // Ann
Console.WriteLine(pair.Item2 + 1);      // 31
```

The properties are called `Item1`, `Item2`, and so on. They do not say what the values mean, which is the weakness of tuples in general. Compare with a class that has named fields.

## Writing your own pair

The same idea, written as a generic class with two type parameters:

```csharp
class Pair<TFirst, TSecond>
{
    public TFirst First { get; }
    public TSecond Second { get; }

    public Pair(TFirst first, TSecond second)
    {
        First = first;
        Second = second;
    }

    public override string ToString()
    {
        return "(" + First + ", " + Second + ")";
    }
}

var p = new Pair<string, int>("Ann", 30);
Console.WriteLine(p);                   // (Ann, 30)
```

Each type parameter can be different: `Pair<int, int>`, `Pair<string, bool>`, and so on, and the compiler checks the types of `First` and `Second`.

## Where a pair is useful

- a **dictionary-like** result, such as a key and its value (the standard `KeyValuePair<TKey, TValue>` is this idea);
- a method that must return two related values for a short time, such as the position of the minimum and its value;
- the items of a list when a whole class would be too much for one small use.

If the pair is used in many places with a meaning, give it a name instead: `Score`, `Point`, `Range`.
