Write a generic method that returns the **largest element** of an array, for any type that can be compared:

```csharp
static T Max<T>(T[] items) where T : IComparable<T>
```

Keep the first element as the best so far, and compare every other element with it. Do not change `Main`. Expected output:

```text
9
plum
2.5
z
7
```

The lines in order: the maximum of `3, 9, 2`; the largest of the strings `"pear", "apple", "plum"` (strings compare alphabetically, and `plum` comes last); the largest `double`, `2.5`; the largest character, `z`; and the only element of a one-element array, `7`.

Hint: `items[i].CompareTo(best) > 0` means that `items[i]` is larger than `best`. Start the loop at index `1`, because index `0` is already the best. The method works for every type that has the constraint, so no separate version is needed for each type.
