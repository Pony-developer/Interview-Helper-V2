You have already found the middle of three **numbers**. Now write it for **anything that can be compared**: numbers, strings, characters. The interface `IComparable` makes it possible: the method sees only "something with `CompareTo`".

Write the method `static IComparable Middle(IComparable a, IComparable b, IComparable c)`. It returns the **middle** of the three values: the one that is neither the smallest nor the biggest. If some values are equal, the result is still a value of the middle position of the sorted three (for `5, 5, 1` it is `5`).

The three arguments are always of the **same type**, so `CompareTo` works between them. Do not change `Main`. Expected output:

```text
2
mango
2.5
5
7
b
```

The lines in order: the middle of the integers `3, 1, 2`; the middle of the strings `"pear", "apple", "mango"`; of the `double` values `2.5, 9.0, 1.0`; of `5, 5, 1`; of `7, 7, 7`; and of the characters `'b', 'c', 'a'`.

Hint: a value `x` is the middle one when it is not smaller than one of the other two and not bigger than the other. Compare with the signs of `a.CompareTo(b)`, `a.CompareTo(c)` and `b.CompareTo(c)`. The easy way: check each of the three values with `if`. Be careful with the equal values: `<=` and `>=` give the correct answer when the checks are written as "between".
