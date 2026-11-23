Two generic pieces of code need the right constraints.

1. `MaxOf<T>(T[] items)` returns the largest item of the array. If the array is empty, it throws an `InvalidOperationException` with the message `The array is empty`. To compare items, `T` must implement `IComparable<T>`: add the constraint and use `CompareTo`.
2. `Registry<T>` creates and remembers named objects. `Create(string name)` makes a **new** `T`, sets its `Name`, adds it to the list, and returns it. For this, `T` must implement `INamed` and have a parameterless constructor: add both constraints.

Do not change `Main`, `INamed`, `Cat` or `Robot`. Expected output:

```text
9
pear
The array is empty
Cat Tom
2
Robot R2
```

Hint: `a.CompareTo(b) > 0` means that `a` is greater than `b`. Constraints for a class go after its name: `class Registry<T> where T : ...`.
