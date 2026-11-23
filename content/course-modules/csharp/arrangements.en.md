The previous lectures counted the ways to choose and order **all** the elements. **Arrangements** and **combinations** choose only **some** of them. Four questions decide which formula you need:

1. Do you take **all** the elements, or only `k` of them?
2. Does the **order** matter? (`ab` and `ba` are different, or the same.)
3. May the elements **repeat**?

## The four cases

For `n` elements, taking `k`:

| Name | Order matters? | Repeats? | Count | `n = 3, k = 2` from `a, b, c` |
| --- | --- | --- | --- | --- |
| **Arrangements with repetition** | yes | yes | nᵏ | 9: `aa ab ac ba bb bc ca cb cc` |
| **Arrangements** (without repetition) | yes | no | n! / (n − k)! | 6: `ab ac ba bc ca cb` |
| **Combinations** | no | no | n! / (k! · (n − k)!) | 3: `ab ac bc` |
| **Permutations** (all of them) | yes | no | n! | 6 of the 3 elements: `abc acb ...` |

A permutation is the special case of an arrangement with `k = n`.

Real-life examples:

- **A password** of 4 digits: order matters, digits repeat: 10⁴ = **10 000**.
- **A podium**: gold, silver and bronze among 5 runners: order matters, no repeats: 5 · 4 · 3 = **60**.
- **A team** of 3 people out of 5: order does not matter: C(5, 3) = **10**.

## Arrangements with repetition: n^k

At each of the `k` positions, any of the `n` elements may stand. Think of a lock with `k` wheels of `n` symbols each. This is what a **brute-force password attack** enumerates:

```csharp
static void Passwords(string alphabet, int length, string prefix, List<string> result)
{
    if (prefix.Length == length)
    {
        result.Add(prefix);
        return;
    }
    foreach (char c in alphabet)
        Passwords(alphabet, length, prefix + c, result);
}
```

With `alphabet = "ab"` and `length = 3`, the order is `aaa, aab, aba, abb, baa, bab, bba, bbb`, like counting in binary. The tree has `length` levels, with `n` children in each node, so `n^length` leaves.

For passwords of 8 characters, drawn from 62 letters and digits, that is 62⁸ ≈ 2 · 10¹⁴ attempts: why a long password is a good defence, and why a program checks the first characters and gives up early (pruning), when it can.

## Arrangements without repetition: n! / (n − k)!

The same as a permutation, but we stop after `k` positions:

```csharp
static void Arrange(string items, int k, bool[] used, string prefix, List<string> result)
{
    if (prefix.Length == k)                       // k positions are filled
    {
        result.Add(prefix);
        return;
    }
    for (int i = 0; i < items.Length; i++)
    {
        if (used[i]) continue;
        used[i] = true;
        Arrange(items, k, used, prefix + items[i], result);
        used[i] = false;                          // backtrack
    }
}
```

`Arrange("abc", 2, ...)` gives `ab, ac, ba, bc, ca, cb`: 6 results = 3 · 2. The only difference from permutations is the base case: `k` instead of `n`.

The formula comes from the same product as before, but cut short: `n · (n − 1) · ... · (n − k + 1)`. For the podium, `5 · 4 · 3 = 60`.

## Combinations: n! / (k! · (n − k)!)

When the order does not matter, each group is counted `k!` times by the arrangements (all the orders of the same `k` elements), so we divide by `k!`.

To generate each group **once**, impose an order yourself: always choose elements **in increasing index**, so that `ba` is never generated after `ab`:

```csharp
static void Combine(string items, int k, int start, string prefix, List<string> result)
{
    if (prefix.Length == k)
    {
        result.Add(prefix);
        return;
    }
    for (int i = start; i < items.Length; i++)
        Combine(items, k, i + 1, prefix + items[i], result);     // continue AFTER i
}
```

`Combine("abcd", 2, 0, "", r)` gives `ab, ac, ad, bc, bd, cd`: 6 = "4 choose 2".

## The numbers C(n, k)

The binomial coefficients form **Pascal's triangle**, in which every number is the sum of the two above it. This is also a recursion:

```text
C(n, k) = C(n − 1, k − 1) + C(n − 1, k)       the last element is chosen, or it is not
C(n, 0) = C(n, n) = 1
```

```csharp
static long C(int n, int k)
{
    if (k == 0 || k == n) return 1;
    return C(n - 1, k - 1) + C(n - 1, k);
}
```

The tree has overlapping sub-problems (like Fibonacci), so for larger values, memoize it, or compute the product directly. A few values: C(5, 2) = 10, C(10, 5) = 252, C(20, 10) = 184 756, C(32, 16) = 601 080 390.

The numbers in a row of the triangle add up to **2ⁿ**: C(n, 0) + C(n, 1) + ... + C(n, n) = 2ⁿ. This is the count of the subsets of an `n`-element set, grouped by size.

## Choosing the right tool

| The task | The tool |
| --- | --- |
| all the subsets | include or skip, 2ⁿ |
| all the subsets of a given size `k` | combinations |
| all the orders of all the elements | permutations |
| all the ordered selections of `k` | arrangements |
| all the words of a given length over an alphabet | arrangements with repetition |

## Limits and pruning

All of these grow explosively. Before you write the code, **calculate how many results there will be**. If it is a billion, you need a smarter idea or a stronger pruning: stop building a partial answer as soon as it can no longer be valid (a rule about neighbours, a sum that has gone too high), instead of building all of it and checking at the end.
