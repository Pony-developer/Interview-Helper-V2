Several AI "thinking" jobs are independent of each other, so they can run in parallel. The method `Think(int seed)` is ready, and so is `Show`, which prints an array of numbers on one line. Write three methods:

- `ThinkAll(int[] seeds)`: returns an array where element `i` is `Think(seeds[i])`. Use `Parallel.For`, and write each result into its own element, so that no lock is needed;
- `TotalScore(int[] seeds)`: returns the sum of `Think` over all seeds. Use `Parallel.ForEach`. Several threads add to one total, so protect the addition with `Interlocked.Add(ref total, ...)` or a lock;
- `BestSeed(int[] seeds)`: returns the seed whose `Think` result is the largest. Use `ThinkAll` for the results.

Do not change `Main`. Expected output:

```text
100 400 900 1600 2500
5500
5
```

The lines in order: the scores of the seeds `1` to `5`; their total, `100 + 400 + 900 + 1600 + 2500`; and the seed with the highest score, `5`.

Hint: `Parallel.For(0, seeds.Length, i => { results[i] = Program.Think(seeds[i]); })` fills the array. Since the lambda captures `total`, it can pass it by reference to `Interlocked.Add`.
