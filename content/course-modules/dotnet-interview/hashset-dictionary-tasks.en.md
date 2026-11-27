## Task

Question 33 asks about the complexity of `Array`, `List`, `HashSet` and `Dictionary`. The classic follow-up is: "Now solve this in O(n)". Each of these tasks has an obvious O(n²) solution with nested loops — use a hash-based collection instead.

1. **`TwoSum(nums, target)`** — return the indices `[i, j]` (i < j) of two numbers that add up to `target`, or `null`. Walk the array once; for each number check whether `target - number` was already seen (a `Dictionary<int, int>` from value to index). If several pairs exist, return the one found first this way.
2. **`FirstUnique(s)`** — the first character that occurs exactly once, or `'\0'`. Two passes: count with a `Dictionary<char, int>`, then find the first character with count 1.
3. **`Intersect(a, b)`** — the values present in both arrays, without duplicates, in the order they first appear in `a`. Put `b` into a `HashSet<int>`; use a second set to avoid adding a value twice (`HashSet.Add` returns `false` for a duplicate).

Expected output:

```
0 1
1 2
0 1
none
w
none
l
4 9
[]
```
