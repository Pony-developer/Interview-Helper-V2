Write three methods that answer questions about an array of numbers, using LINQ:

- `CountEven(int[] numbers)`: how many numbers are even;
- `SumOdd(int[] numbers)`: the sum of the odd numbers;
- `SquaresAboveFive(int[] numbers)`: an array with the squares of the numbers greater than `5`, in the original order.

The method `Show` is ready: it prints a sequence of numbers on one line, separated by spaces. Do not change `Main`. Expected output:

```text
3
9
64 100 36
```

The lines in order: the count of even numbers (`8`, `10`, `6`); the sum of the odd numbers (`3 + 5 + 1`); and the squares of `8`, `10` and `6`.

Hint: `Count(predicate)`, `Where(predicate).Sum()` and `Where(predicate).Select(selector).ToArray()` are the three tools you need.
