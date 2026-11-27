## Task

Implement the classic bit tricks behind `System.Numerics.BitOperations` yourself (the practice runtime doesn't have that class).

1. **`PopCount(uint)`**: the number of 1 bits. Hint: `value &= value - 1` clears the lowest set bit; count how many times you can do it.
2. **`IsPowerOfTwo(uint)`**: a power of two has exactly one bit set, so `value & (value - 1)` is zero. Remember that 0 is **not** a power of two.
3. **`RoundUpToPowerOf2(uint)`**: the smallest power of two that is `>=` the value. Hint: subtract 1, "smear" the highest bit into every lower position with `value |= value >> 1`, `>> 2`, `>> 4`, `>> 8`, `>> 16`, then add 1.
4. **`Log2(uint)`**: the index of the highest set bit (shift right until the value becomes 0, counting).

The last line of `Main` shows setting and testing single bits in a flags word.

Expected output:

```
0: pop=0 pow2=False
1: pop=1 pow2=True
11: pop=3 pow2=False
64: pop=1 pow2=True
1000: pop=6 pow2=False
4294967295: pop=32 pow2=False
1 -> 1, log2=0
5 -> 8, log2=2
64 -> 64, log2=6
1000 -> 1024, log2=9
00001001 True
```
