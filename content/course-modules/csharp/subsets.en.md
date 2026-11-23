A set of `n` elements has **2ⁿ subsets**: for every element you decide "in" or "out", and the decisions are independent. Generating all of them is a perfect job for recursion.

## The decision tree

For the elements `a`, `b`, `c`, decide about each one in turn:

```text
                      (start)
                 /               \
           skip a                 take a
          /      \               /      \
     skip b      take b     skip b      take b
      /  \        /  \       /  \        /  \
   skip  take  skip take  skip take   skip take     <- c
    c     c     c    c     c    c      c     c
   {}    {c}   {b}  {bc}  {a}  {ac}   {ab}  {abc}
```

Each path from the root to a leaf is one subset. There are **8 = 2³** leaves.

## The code

```csharp
static void Subsets(string items, int index, string current, List<string> result)
{
    if (index == items.Length)               // all decisions are made
    {
        result.Add(current);
        return;
    }
    Subsets(items, index + 1, current, result);                     // skip items[index]
    Subsets(items, index + 1, current + items[index], result);      // take items[index]
}

var all = new List<string>();
Subsets("abc", 0, "", all);
```

`all` is `"", "c", "b", "bc", "a", "ac", "ab", "abc"` (the first element is the "most significant" decision, so the subsets come out in the order of the leaves above). The empty string is the **empty subset**, and it counts.

The recursion has the three standard ingredients:

- **State**: the index of the element being decided, and the subset built so far.
- **Base case**: the index has reached the end, and one complete subset is recorded.
- **Choices**: for each element, two branches.

## The same without recursion: a bit mask

Each subset corresponds to a number from `0` to `2ⁿ − 1`, whose binary digits tell which elements are in:

```csharp
int n = items.Length;
for (int mask = 0; mask < (1 << n); mask++)          // 1 << n is 2ⁿ
{
    string subset = "";
    for (int j = 0; j < n; j++)
        if ((mask & (1 << j)) != 0)                  // is bit j set?
            subset += items[j];
    Console.WriteLine("{" + subset + "}");
}
```

It does the same, in a loop. It is compact for `n` up to about 30. The recursion is more flexible: it is easy to **cut a branch early**, as the next sections show.

## The size of the answer

| n | 2ⁿ |
| --- | --- |
| 10 | 1 024 |
| 20 | 1 048 576 |
| 25 | 33 554 432 |
| 30 | over a billion |
| 40 | about 10¹² |

The running time is at least the **size of the output**, and it doubles with each new element. Generating all the subsets is only practical for `n` up to about 20 to 25.

## Subsets with a condition: counting

Often you do not need the subsets themselves, only how many satisfy a condition. **How many subsets of `{3, 34, 4, 12, 5, 2}` add up to 9?**

```csharp
static int CountSubsets(int[] numbers, int index, int remaining)
{
    if (remaining == 0) return 1;                        // the sum is reached
    if (index == numbers.Length) return 0;               // no elements left
    int without = CountSubsets(numbers, index + 1, remaining);
    int with = CountSubsets(numbers, index + 1, remaining - numbers[index]);
    return without + with;
}
```

The two branches add up, because every subset either skips the element or takes it. For the example, the subsets with the sum 9 are `{4, 5}` and `{3, 4, 2}`, so the answer is 2. (The first line means that the empty remainder counts as success. With non-negative numbers, take care that the zero-valued elements may then be counted in both ways.)

## Pruning

When the numbers are all positive and `remaining` becomes **negative**, no extension can help. Cut the branch at once:

```csharp
if (remaining < 0) return 0;
```

This idea is **backtracking** with **pruning**: build the answer step by step, and give up on a partial answer as soon as it cannot lead to a solution. It does not change the worst case, but it can make the search fast in practice.

## Subsets of a fixed size: combinations

To choose exactly `k` of `n` elements, pass `k` along and stop when enough are chosen:

```csharp
static void Choose(string items, int start, int k, string current, List<string> result)
{
    if (k == 0) { result.Add(current); return; }
    for (int i = start; i < items.Length; i++)
        Choose(items, i + 1, k - 1, current + items[i], result);   // only the elements AFTER i
}
```

`Choose("abcd", 0, 2, "", r)` gives `ab, ac, ad, bc, bd, cd`: 6 subsets, which is "4 choose 2". There is a lecture on this soon, together with arrangements.

## The backtracking template

Subsets, permutations, puzzles and many search problems fit one pattern:

```text
Solve(state):
    if state is complete:   record the answer; return
    for each choice available in this state:
        make the choice
        Solve(new state)
        undo the choice      <- only if the state is shared, not passed as a copy
```

In the code above the strings are passed as **new** values, so there is nothing to undo. When you use a shared array or list, you must undo the change after the recursive call, or the branches will disturb each other. The next lecture shows it.
