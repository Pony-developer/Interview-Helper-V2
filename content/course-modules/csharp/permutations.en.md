A **permutation** is an ordering of all the elements of a set. For `a, b, c` there are six: `abc`, `acb`, `bac`, `bca`, `cab`, `cba`. For `n` elements there are **n!** of them: `n` choices for the first position, `n − 1` for the second, and so on.

| n | n! |
| --- | --- |
| 3 | 6 |
| 5 | 120 |
| 8 | 40 320 |
| 10 | 3 628 800 |
| 12 | 479 001 600 |
| 15 | about 1.3 · 10¹² |
| 20 | about 2.4 · 10¹⁸ |

The factorial grows faster than anything we have met. Enumerating all the permutations is realistic only for about `n ≤ 10` or 11.

## Building an ordering position by position

The recursive thought: choose **which element goes first**, and then arrange **the rest** in all possible ways.

```csharp
static void Permute(string prefix, string rest, List<string> result)
{
    if (rest.Length == 0)                    // nothing left to place
    {
        result.Add(prefix);
        return;
    }
    for (int i = 0; i < rest.Length; i++)
    {
        // take rest[i] as the next element, and leave the others
        Permute(prefix + rest[i], rest.Remove(i, 1), result);
    }
}

var result = new List<string>();
Permute("", "abc", result);
```

`result` is `abc, acb, bac, bca, cab, cba`, in this order: for every choice of the first letter, the rest are arranged in the same order.

The decision tree for `abc`:

```text
                 ("", "abc")
            /        |        \
        a            b          c
    ("a","bc")   ("b","ac")  ("c","ab")
      /    \       /    \       /    \
    ab      ac   ba      bc   ca      cb
   ("ab","c")  ...
     |
    abc
```

## The same, with "used" flags

For larger inputs, and for arrays, it is cheaper not to create new strings. Keep **one** shared array that marks which elements are already used, and a **shared** prefix. This is the classic **backtracking**: make a choice, recurse, and **undo** the choice.

```csharp
static void Permute(string letters, bool[] used, string prefix, List<string> result)
{
    if (prefix.Length == letters.Length)
    {
        result.Add(prefix);
        return;
    }
    for (int i = 0; i < letters.Length; i++)
    {
        if (used[i]) continue;               // already in the prefix

        used[i] = true;                      // make the choice
        Permute(letters, used, prefix + letters[i], result);
        used[i] = false;                     // UNDO it, for the other branches
    }
}
```

The last line is the heart of backtracking. After the recursive call, the element must become available again, because the **next** iteration of the loop starts a different branch, in which this element is allowed to be at the current position.

If you forget `used[i] = false;`, the permutations will be missing: the first branch uses up the letters for everyone.

## Swapping in place

Another way: permute an **array** by swapping, and put each element, in turn, to the current position.

```csharp
static void Permute(int[] a, int position, List<string> result)
{
    if (position == a.Length)
    {
        result.Add(string.Join(" ", a));
        return;
    }
    for (int i = position; i < a.Length; i++)
    {
        Swap(a, position, i);                // choose a[i] for the position
        Permute(a, position + 1, result);
        Swap(a, position, i);                // undo
    }
}
```

It uses no extra memory, but the order of the results is **not** lexicographic.

## The cost

There are `n!` results, and each takes `n` steps to build or copy: the total is about **O(n · n!)**. The depth of the recursion is only `n`, so memory for the stack is not a problem. The number of results is.

## Duplicates

When some elements are equal, `"aab"` should have only **3** distinct permutations, not 6. Two common solutions:

- **Sort** the letters, and skip a letter in a loop if it equals the previous one **and the previous one has not been used** in this position:

```csharp
if (i > 0 && letters[i] == letters[i - 1] && !used[i - 1]) continue;
```

- Or put all the results in a `HashSet<string>` to remove the duplicates (simple, but it still generates all `n!`).

## Where it is used

- **Brute force** over all the orders: the travelling salesman problem for a small number of cities, a schedule of tasks, the order of operations.
- **Puzzles**: anagrams, cryptarithms (`SEND + MORE = MONEY`), the N queens problem (a permutation of columns).
- **Testing** every ordering of some inputs.

## The next permutation without recursion

The order of the permutations in the list above is called **lexicographic**. There is a short loop that produces the next permutation in that order directly from the current one (it is the idea behind `std::next_permutation` in C++):

1. Find the largest `i` such that `a[i] < a[i + 1]`. If there is none, this was the last permutation.
2. Find the largest `j` such that `a[j] > a[i]`.
3. Swap `a[i]` and `a[j]`.
4. Reverse the part after position `i`.

It lets you walk over the permutations one by one, without storing them all.
