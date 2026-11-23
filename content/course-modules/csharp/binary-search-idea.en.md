Think of the game "guess my number from 1 to 100". A good player never guesses 1, 2, 3... Instead, they ask "is it more than 50?", and with every answer throw away **half** of the candidates. Seven questions are enough, because 2⁷ = 128 > 100. **Binary search** is exactly this strategy, applied to a **sorted** array.

## The idea

Compare the value you are looking for with the **middle** element of the current range:

- if they are equal, you have found it;
- if the middle element is **smaller** than the value, the value can only be to the **right**: discard the left half and the middle;
- if the middle element is **larger**, the value can only be to the **left**: discard the right half and the middle.

Repeat on the remaining range, until you find the value or the range becomes empty.

```text
Looking for 23 in:   2  5  8 12 16 23 38 56 72 91
                     0  1  2  3  4  5  6  7  8  9

range 0..9, middle = 4 (16)   16 < 23   -> go right:  range 5..9
range 5..9, middle = 7 (56)   56 > 23   -> go left:   range 5..6
range 5..6, middle = 5 (23)   found!    -> index 5
```

Three looks instead of up to ten.

## The code

```csharp
static int BinarySearch(int[] sorted, int value)
{
    int left = 0;
    int right = sorted.Length - 1;

    while (left <= right)                          // while the range is not empty
    {
        int middle = left + (right - left) / 2;

        if (sorted[middle] == value)
            return middle;                         // found
        if (sorted[middle] < value)
            left = middle + 1;                     // discard the left half and the middle
        else
            right = middle - 1;                    // discard the right half and the middle
    }
    return -1;                                     // not found
}
```

The range of candidates is `sorted[left..right]`, both ends **included**. The loop runs while this range is not empty.

## The loop invariant

A good way to keep such code correct is to state what is always true:

> If the value is in the array at all, it is somewhere in `sorted[left..right]`.

- At the start, the range is the whole array: true.
- Each step removes only elements that **cannot** be the answer: the invariant stays true.
- When the range becomes empty (`left > right`), the value cannot be anywhere: return `-1`.

The range shrinks by at least one element each time (`middle ± 1`), so the loop always ends.

## The traps

Binary search is famous for being easy to describe and easy to get wrong.

**1. The array must be sorted.** On unsorted data the result is meaningless: the algorithm discards halves on the strength of an order that does not exist.

**2. `middle + 1` and `middle - 1`.** If you write `left = middle`, the range may stop shrinking (when `left` and `right` are adjacent), and the loop never ends.

**3. `left <= right`, not `left < right`.** With `<`, a range of **one** element is never checked, and a value in it is missed.

**4. Overflow.** `(left + right) / 2` can overflow `int` for huge arrays, when `left + right` exceeds 2³¹ − 1. The form `left + (right - left) / 2` cannot. This bug sat in the standard libraries of several languages for years.

**5. Duplicates.** With repeated values, the plain version returns **some** index of the value, not necessarily the first or the last. To find the **first** or **last** position, a variant of the algorithm is needed (the practice tasks in this module do exactly that).

## What it returns when the value is not found

The version above returns `-1`. The library method `Array.BinarySearch` returns something more informative: a **negative** number, which is the **bitwise complement** (`~`) of the position where the value **would be inserted** to keep the array sorted:

```csharp
int[] a = { 2, 5, 8, 12, 16 };
int found = Array.BinarySearch(a, 8);      // 2
int missing = Array.BinarySearch(a, 10);   // negative
int insertAt = ~missing;                   // 3: it belongs between 8 and 12
```

So "is it present?" is `Array.BinarySearch(a, x) >= 0`, and "where does it go?" is `~result`.

## Binary search is more than searching arrays

The idea of "ask a yes/no question, and discard half" works whenever the answers are **monotone**: all "no" first, then all "yes".

- **Search on the answer**: the integer square root of `n` is the largest `k` with `k * k <= n`. The question `k * k <= n` is "yes" up to the answer and "no" after it, so binary search finds `k` in log n steps.
- **Finding a bug**: `git bisect` binary-searches the history for the commit that broke something. Commenting out half of the code to see whether the bug stays is the same idea.
- **A guessing game** and a dictionary lookup, as you do it by hand.
- **Numerical methods**: finding the root of an increasing function by halving an interval.

## Where it does not work

- **Unsorted data.** Sort first, or use a hash table.
- **A structure with slow access to the middle.** On a linked list, reaching the middle takes O(n), so there is no gain. Binary search needs **random access**, like an array or a `List<T>`.
- **A data set that is searched only once.** Sorting costs more than a single linear search.
