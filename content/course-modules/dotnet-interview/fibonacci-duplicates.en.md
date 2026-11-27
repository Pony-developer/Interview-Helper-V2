## Task

Two Middle-level tasks from the list, with a twist that interviewers love.

1. **`Fibonacci(int count)`** returns the first `count` Fibonacci numbers as a **lazy** sequence (use `yield return`): `0, 1, 1, 2, 3, 5, …`. Use `long`: the 90th number does not fit in `int`.

   The twist: a negative `count` must throw `ArgumentOutOfRangeException` **immediately at the call**, not later when someone enumerates the result. In an iterator method the whole body, including the argument check, runs only on the first `MoveNext()`. The standard fix (used by LINQ itself) is to split the method: a public non-iterator method validates the arguments and returns the result of a private iterator method.

2. **`HasDuplicates<T>(IEnumerable<T> items)`** returns `true` if any element occurs more than once. Do it in one pass, O(n): `HashSet<T>.Add` returns `false` when the item is already there. Stop as soon as you find the first duplicate.

Expected output:

```
0 1 1 2 3 5 8 13 21 34
[]
1779979416004714189
thrown at the call
False
True
False
False
```
