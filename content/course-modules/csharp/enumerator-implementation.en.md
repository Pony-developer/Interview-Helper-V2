A class can be used in `foreach` if it implements `IEnumerable<T>`. Here is a collection of the numbers from `from` up to `to`, written without any built-in list:

```csharp
class Range : IEnumerable<int>
{
    private readonly int from;
    private readonly int to;

    public Range(int from, int to)
    {
        this.from = from;
        this.to = to;
    }

    public IEnumerator<int> GetEnumerator()
    {
        return new RangeEnumerator(from, to);
    }

    // The non-generic method is required by the interface too
    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}

class RangeEnumerator : IEnumerator<int>
{
    private readonly int from;
    private readonly int to;
    private int current;
    private bool started;

    public RangeEnumerator(int from, int to)
    {
        this.from = from;
        this.to = to;
        current = from - 1;               // "before the first item"
    }

    public int Current { get { return current; } }

    object IEnumerator.Current { get { return Current; } }

    public bool MoveNext()
    {
        if (current < to)
        {
            current++;
            return true;
        }
        return false;
    }

    public void Reset()
    {
        current = from - 1;
    }

    public void Dispose() { }
}
```

```csharp
foreach (int n in new Range(3, 6))
{
    Console.Write(n + " ");           // 3 4 5 6
}
```

## The pattern

- The **collection** (`Range`) only knows how to create enumerators.
- The **enumerator** (`RangeEnumerator`) keeps the position. Each object of it walks the sequence once.
- `MoveNext` advances the position and says whether there is an item. `Current` returns it.

Two enumerators of the same collection are independent: each has its own position, so nested `foreach` loops over one `Range` work correctly.

## The field `started`

The class above declares `started` but does not need it, because `current` starts one step before the first item. This is one common design; another keeps a state flag. Use whichever makes the logic clearer, and remove unused fields.

## The next step

Writing an enumerator by hand is long. The `yield return` keyword makes the compiler write this class for you, as the following lectures show.
