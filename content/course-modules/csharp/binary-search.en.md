Implement `BinarySearch`: return the index of `value` in the sorted array `sorted`, or `-1` if it is not there.

Don't walk through the whole array: look at the middle element, compare it with `value` and keep only the half where `value` can be. Repeat until you find it or the range is empty.

`Main` is already written. Expected output:

```text
7 -> 3
1 -> 0
13 -> 6
4 -> -1
20 -> -1
```
