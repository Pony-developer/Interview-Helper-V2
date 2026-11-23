A **generic class** has one or more **type parameters** in angle brackets. The class is written once, and the type is given when it is used:

```csharp
class Box<T>
{
    private T content;

    public Box(T content)
    {
        this.content = content;
    }

    public T Get()
    {
        return content;
    }
}

var numbers = new Box<int>(42);
int n = numbers.Get();          // no cast: the compiler knows it is an int

var words = new Box<string>("hi");
string w = words.Get();
```

`Box<int>` and `Box<string>` are two different types made from the same code. `T` is a placeholder: inside the class, you can use `T` as a type, but you cannot call methods that a random type might not have.

## Constraints

To call a method on `T`, say what `T` must be, with a **constraint**:

```csharp
class SortedPair<T> where T : IComparable<T>
{
    public T Smaller;
    public T Larger;

    public SortedPair(T a, T b)
    {
        if (a.CompareTo(b) <= 0)
        {
            Smaller = a;
            Larger = b;
        }
        else
        {
            Smaller = b;
            Larger = a;
        }
    }
}

var p = new SortedPair<int>(9, 4);      // Smaller 4, Larger 9
```

Without `where T : IComparable<T>`, the call `a.CompareTo(b)` does not compile, because the compiler does not know that every `T` has that method.

Common constraints: `where T : class` (a reference type), `where T : struct` (a value type), `where T : new()` (has a parameterless constructor), `where T : SomeBaseClass`.

## default(T)

For a type parameter, `default(T)` gives the default value of whatever type `T` is: `0` for `int`, `null` for `string`. Use it when a generic code needs "an empty value":

```csharp
T empty = default(T);
```
