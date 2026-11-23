A dictionary with a custom key class works only if the class defines `GetHashCode` and `Equals` **consistently**. Here is a key class `Coordinate`:

```csharp
class Coordinate
{
    public int Row { get; }
    public int Col { get; }

    public Coordinate(int row, int col) { Row = row; Col = col; }

    public override bool Equals(object obj)
    {
        Coordinate other = obj as Coordinate;
        if (other == null) return false;
        return Row == other.Row && Col == other.Col;
    }

    public override int GetHashCode()
    {
        unchecked
        {
            return Row * 31 + Col;           // the same fields as Equals
        }
    }
}

var visited = new Dictionary<Coordinate, bool>();
visited[new Coordinate(1, 2)] = true;
Console.WriteLine(visited.ContainsKey(new Coordinate(1, 2)));   // True
```

## The rules

- **Equal objects must have equal hash codes.** Otherwise the dictionary looks in the wrong bucket and does not find the key.
- **Use the same fields in both methods.** If `Equals` compares `Row` and `Col`, `GetHashCode` must use them and only them. A field that `Equals` ignores can be left out of the hash, but it must not decide equality.
- **Equal hashes do not mean equal objects.** The dictionary still calls `Equals` to confirm.

## What goes wrong without GetHashCode

If you override `Equals` but not `GetHashCode`, the class inherits the default hash, which is based on the object's identity. Then two equal coordinates have different hashes, and the lookup fails:

```csharp
// without GetHashCode:
visited[new Coordinate(1, 2)] = true;
Console.WriteLine(visited.ContainsKey(new Coordinate(1, 2)));   // False: a different bucket
```

The compiler warns about this, so pay attention to the warning.

## Keys must not change

If a key's field changes after it was put in the dictionary, its hash changes too, and the item is lost. Make keys **immutable**: use read-only properties, and set the values only in the constructor.

## A note on modern code

In .NET Core 2.1 and later, the struct `System.HashCode` helps to combine fields: `HashCode.Combine(Row, Col)`. The course tasks use the manual `31` method, which works in every version.
