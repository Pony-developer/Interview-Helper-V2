A library sorts its books. The class `Book` below has no order, so `Array.Sort(books)` fails with an `InvalidOperationException` (and `CompareTo` does not even exist yet).

Make `Book` **implement `IComparable<Book>`**. The order of the books:

1. by **author**, in alphabetical order (compare ordinally, with `string.CompareOrdinal`);
2. for the same author, by **year**, the **newest first**;
3. for the same author and year, by **title**, in alphabetical order.

Keep the class otherwise as it is. Do not change `Main`. Expected output:

```text
Austen: Persuasion (1817)
Austen: Emma (1815)
Austen: Mansfield Park (1814)
Herbert: Dune (1965)
Herbert: Zorro (1965)
Joyce: Ulysses (1922)
1
-1
0
-1
1
```

The first six lines are the sorted array. The next five are the **signs** of the comparisons: `Emma` against `Persuasion` (the same author, and `Emma` is older, so it goes **after**: `1`); `Persuasion` against `Emma` (`-1`); `Emma` against itself (`0`); `Dune` against `Zorro` (the same author and year, so by title: `-1`); and `Ulysses` against `Dune` (the author Joyce goes after Herbert: `1`).

Hint: the class must be declared as `class Book : IComparable<Book>`, and `CompareTo(Book other)` is public. Compare the first criterion, and `return` it if it is not zero. Otherwise go to the next criterion. For "newest first", swap the operands: `other.Year.CompareTo(Year)`. Do not subtract the numbers.
