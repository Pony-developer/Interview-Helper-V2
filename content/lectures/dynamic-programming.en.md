---
skill: dynamic-programming
title: "Dynamic programming: from recursion to tables"
summary: "Recognising overlapping subproblems and optimal substructure, memoisation (top-down) vs tabulation (bottom-up), defining the state and recurrence, classic problems (stairs, grid paths, coin change, knapsack, edit distance), space optimisation, and when greedy fails."
readingMinutes: 9
---

Dynamic programming (DP) solves a problem by combining solutions to **smaller versions of the same problem**, computing each of them only once. It turns many exponential brute-force recursions into polynomial algorithms.

## When DP applies

Two properties together signal DP:

1. **Optimal substructure**: the best answer is built from best answers to subproblems (the cheapest path to C via B uses the cheapest path to B).
2. **Overlapping subproblems**: naive recursion solves the same subproblem many times. Naive Fibonacci calls `fib(30)` more than a million times to compute a handful of distinct values.

If subproblems don't overlap (merge sort), it's plain divide and conquer.

## The recipe

1. **State**: what describes a subproblem? (`dp[i]` = ways to reach step `i`; `dp[i][j]` = edit distance of the first `i` and `j` characters.)
2. **Recurrence**: how does a state follow from smaller ones?
3. **Base cases**: the smallest states you know directly.
4. **Order**: compute states so dependencies are ready (or let memoisation handle it).
5. **Answer**: which state holds the result?

## Top-down vs bottom-up

```js
// Top-down: recursion + memo (computes only the states it needs)
const memo = new Map();
function ways(n) {
  if (n <= 1) return 1;
  if (memo.has(n)) return memo.get(n);
  const r = ways(n - 1) + ways(n - 2);
  memo.set(n, r);
  return r;
}

// Bottom-up: fill a table in dependency order (no recursion depth limit)
function waysTable(n) {
  const dp = [1, 1];
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}
```

The memo key must include **every** parameter that affects the result: a two-argument function memoised by only one argument returns wrong answers. Bottom-up tables avoid stack overflows for large inputs and often allow **space optimisation**: if row `i` only needs row `i - 1`, keep two rows (or one) instead of the whole grid.

## Classic problems

| Problem | State | Recurrence |
| --- | --- | --- |
| Climbing stairs (1 or 2 steps) | `dp[i]` ways to reach `i` | `dp[i-1] + dp[i-2]` |
| Grid paths (right/down) | `dp[r][c]` | `dp[r-1][c] + dp[r][c-1]` |
| Coin change (min coins) | `dp[a]` fewest coins for amount `a` | `min(dp[a - c] + 1)` over coins |
| Coin change (ways) | `dp[a]` combinations | for each coin, `dp[a] += dp[a - c]` |
| 0/1 knapsack | `dp[i][w]` best value with first `i` items, capacity `w` | `max(skip, take)` |
| Edit distance | `dp[i][j]` | `min(insert, delete, replace)` |

For **counting combinations** in coin change, loop over coins in the outer loop so each combination is counted once regardless of order; looping over amounts first counts permutations.

## Greedy vs DP

Greedy picks the locally best choice and never looks back. It's fast and correct for some problems (US coin denominations, interval scheduling), but fails in general: with coins `[1, 3, 4]` and amount 6, greedy takes `4 + 1 + 1` (3 coins), while DP finds `3 + 3` (2 coins). Prove greedy works or use DP.

## Complexity

Time ≈ number of states × work per state. Edit distance is O(n·m) time; knapsack is O(n·W) (pseudo-polynomial in the capacity). Space is the table size, often reducible by one dimension.

## Interview checklist

- Name the two properties and show the overlapping calls in a recursion tree.
- Define the state, recurrence and base cases out loud before coding.
- Convert a memoised solution to a bottom-up table and reduce its space.
- Explain why greedy fails for coin change with `[1, 3, 4]`.
- Know coin change, knapsack, LCS/edit distance and grid paths.
