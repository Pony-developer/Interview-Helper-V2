The class `Array` is the base class of **all** arrays, so one method with a parameter of the type `Array` can work with an array of integers, of strings, of characters, and even with a two-dimensional one. Write two such methods:

- `PrintAll(Array items)`: prints **all** the elements of the array in one line, separated by a comma and a space, inside square brackets: `[1, 2, 3]`. An empty array gives `[]`. The elements of a two-dimensional array are printed row by row, as one list;
- `CountOf(Array items, object value)`: returns how many elements of the array are **equal** to `value` (use `Equals`). The result is an `int`.

Do not change `Main`. Expected output:

```text
[1, 2, 3]
[a, b]
[x, y]
[True, False]
[]
[1, 2, 3, 4]
[1.5, 2]
2
2
3
0
```

The lines in order: an array of integers; an array of strings; an array of characters; an array of booleans; an empty array; the two-dimensional array `{ { 1, 2 }, { 3, 4 } }`; an array of `double` values; and then four results of `CountOf`: the number of `1` in `{ 1, 2, 1, 3 }`, the number of `"a"` in `{ "a", "b", "a" }`, the number of `1` in the two-dimensional array `{ { 1, 1 }, { 2, 1 } }`, and the number of `5` in `{ 1, 2, 3 }`.

Hint: `foreach (object item in items)` goes over **all** the elements of any array, in all dimensions. `item.ToString()` or the string concatenation gives the text of an element (`True` and `False` for booleans). Compare the elements with `item.Equals(value)`: `1.Equals(1)` is `true`, and `"a".Equals("a")` too, because `Equals` is a virtual method of `object` that every type redefines for itself.
