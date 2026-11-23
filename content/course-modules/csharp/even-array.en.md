Implement two methods that work with arrays of even numbers.

- `EvenNumbers(count)` creates and returns an array with the first `count` positive even numbers: `2, 4, 6, ...`. For `count = 0` it returns an empty array.
- `AllEven(numbers)` returns `true` when **every** element of the array is even, and `false` as soon as there is an odd one. An empty array counts as `true`: no element breaks the rule.

The helper `Show` that prints an array is already written. Do not change it or `Main`. Expected output:

```text
2 4 6 8 10
2

2 4 6 8 10 12 14 16
True
False
True
```

The empty line in the middle is the printed empty array.

Hint: the number at position `i` is `2 * (i + 1)`. Test evenness with `n % 2 == 0`: unlike `n % 2 == 1`, it is also right for negative numbers, because `-3 % 2` is `-1` in C#.
