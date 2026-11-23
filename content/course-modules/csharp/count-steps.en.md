A complexity claim becomes real when you **count**. Implement three methods that return the number of steps, and watch how the numbers grow.

1. `LinearSteps(sorted, value)` runs a linear search from the start of the array. It looks at the elements one by one, and it stops at the **first match**, or at the end. Return how many elements it looked at.
2. `BinarySteps(sorted, value)` runs the binary search and returns the number of times the **loop body** ran. Use exactly this form, so that the counts agree:

   ```csharp
   int left = 0, right = sorted.Length - 1;
   while (left <= right)
   {
       steps++;
       int middle = left + (right - left) / 2;
       if (sorted[middle] == value) return steps;
       if (sorted[middle] < value) left = middle + 1;
       else right = middle - 1;
   }
   ```

   (The step is counted **before** the comparison, so a value found at the first look takes 1 step.)
3. `PairCount(n)` returns how many pairs `(i, j)` with `i < j` there are among `n` elements, which is the number of times the body of two nested loops runs: `for i in 0..n-1`, `for j in i+1..n-1`. The result is a `long`. Notice that `n` in `Main` goes up to 100 000, so counting with the loops would take about 5 · 10⁹ steps: find the **formula** instead.

`Main` creates the sorted array `1, 2, ..., 1000`, and prints the number of steps for several values. Look at what it shows: the linear search needs up to 1 000 steps, and the binary one never more than 10. Do not change `Main`. Expected output:

```text
1
500
1000
1000
1
9
10
10
45
499500
4999950000
```

The first four lines are `LinearSteps` for the values 1, 500, 1000 and 5000 (which is absent). The next four are `BinarySteps` for 500, 1, 1000 and 5000. The last three are `PairCount` for 10, 1000 and 100 000.

Hint: the number of pairs is `n · (n − 1) / 2`. Remember to calculate it in `long`, because `n · (n − 1)` for `n = 100 000` does not fit in an `int`.
