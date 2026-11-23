You have inherited a project from a developer who left, and there is a file that ends with a note: *"TODO: finish the permutations before the demo :("*. The method `Permutations` and its helper `Build` are half written. The skeleton is there: the list, the array of flags, and the call. The **body of `Build` is empty**, and the comments say what is missing.

Finish `Build`, so that `Permutations(letters)` returns **all the permutations** of the letters of the string, treating every position as a different element. The permutations must come in this order: at every position, try the unused letters **from left to right**. For `abc` it is `abc, acb, bac, bca, cab, cba`.

A string with no letters has exactly one permutation: the empty string.

The pieces that the previous developer left:

- `used[i]` is `true` when the letter at index `i` is already in the current prefix;
- `prefix` is the permutation being built;
- `result` collects the finished permutations.

Complete the two TODO comments: the **base case** (the prefix is as long as the letters, so record it), and the **loop with backtracking** (for every unused letter: mark it, recurse, **unmark** it). Do not change `Permutations` or `Main`. Expected output:

```text
abc acb bac bca cab cba
24
dcba
1
1
```

The lines: all the permutations of `abc`, the number of permutations of `abcd` (4! = 24), the last one of them, then the numbers of permutations of `a` and of the empty string.

Hint: if the permutations come out in the wrong order or are missing, you probably forgot to **undo** the mark (`used[i] = false`) after the recursive call.
