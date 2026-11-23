Find one array inside another.

Implement `IndexOfSub(numbers, part)`. It returns the index in `numbers` where the **first** occurrence of the whole sequence `part` starts, so that the elements `numbers[i]`, `numbers[i + 1]`, ... are equal to `part[0]`, `part[1]`, ... one by one. If there is no such place, it returns `-1`.

Special cases:

- an **empty** `part` is found at index `0`;
- a `part` longer than `numbers` cannot be found: `-1`.

With `numbers = { 1, 2, 3, 2, 3, 4, 2, 3, 4, 5 }`:

- `{ 2, 3, 4 }` starts at index 3, not at 1, because at index 1 the sequence reads `2, 3, 2`;
- `{ 4, 5 }` starts at index 8;
- `{ 5, 6 }` does not occur;
- `{ 3, 2, 3 }` starts at index 2.

Do not change `Main`. Expected output:

```text
3
8
-1
0
0
-1
2
```

Hint: the start position runs over `0 .. numbers.Length - part.Length`. For each start, check the elements of `part` with an inner loop, and give up on the position as soon as one element differs.
