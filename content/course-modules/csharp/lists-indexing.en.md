A `List<T>` is an array that grows by itself. You read and write items by index, the same way as an array:

```csharp
var names = new List<string> { "Ann", "Bob" };
names.Add("Cy");                  // grows automatically
Console.WriteLine(names[0]);      // Ann: indexing is fast, O(1)
names[1] = "Bobby";               // writing by index works too
Console.WriteLine(names.Count);   // 3
```

The index starts at `0`, and it must be between `0` and `Count - 1`. An index outside that range throws an `ArgumentOutOfRangeException`:

```csharp
// names[3] = "Dan";              // exception: the list has only 3 items
```

## The cost of each operation

| Operation | Cost | Why |
|---|---|---|
| `names[i]` | O(1) | the item is at a known place in the array |
| `Add(x)` | O(1) on average | the free space is at the end |
| `Insert(i, x)` | O(n) | all items after `i` move one place right |
| `RemoveAt(i)` | O(n) | all items after `i` move one place left |

Insert and remove in the middle are slow, because the rest of the list is shifted. If you often need to add and remove at the front, a queue or a linked list may fit better.

## Index versus position

When you iterate, you may need both the index and the item. Use a `for` loop with the index, or `foreach` when you only need the items:

```csharp
for (int i = 0; i < names.Count; i++)
{
    Console.WriteLine(i + ": " + names[i]);
}
```

The next lectures cover `Contains`, `Equals` and the way a list decides that two items are the same.
