A class that keeps a **collection** has a special danger: if it hands out the inner list, the outside code can add and delete the items without any check. Let us build a class that guards its list well.

Write the class `GradeBook` (marks from 0 to 100):

- a **private** list of marks;
- `Add(mark)`: adds a mark. A mark outside `0..100` throws an `ArgumentOutOfRangeException`, and the book does not change;
- `Remove(mark)`: removes the **first** mark with this value and returns `true`, or returns `false` if there is no such mark;
- `Count`: the number of marks;
- `Average`: the average mark as a `double`, and `0` for an empty book;
- `Best`: the highest mark. For an empty book, it throws an `InvalidOperationException`;
- `CountAtLeast(threshold)`: how many marks are `threshold` or higher;
- `Marks`: a property that returns a **copy** of the marks as an `int[]`. Changing the copy must **not** change the book.

Do not change `Main`. Expected output:

```text
4
82.5
95
2
rejected
4
80
True
False
80 60 95
0
no marks
```

The lines in order: the count after adding `80, 95, 60, 95`; the average; the best mark; how many marks are 90 or more; the attempt to add 101 (`rejected`), and the count is still 4; after the program writes `0` into the **copy** of the marks, the first real mark is still `80`; removing `95` (`True`); removing `10` (`False`); the marks that remain (only the **first** `95` is gone); the average of an empty book; and the best mark of an empty book (`no marks`).

Hint: `List<T>` has `Add`, `Remove` (it removes the first match and returns a `bool`), `Count` and `ToArray()`. `ToArray()` creates a new array, which is the safe copy. `using System.Collections.Generic;` is already in the program. Never write `return marks;` for the `Marks` property: that would give the outside code the list itself.
