Implement `PrintFrame(width, height)`. It prints a rectangular frame made of `*`: the border is stars, and the inside is filled with spaces.

For `width = 5` and `height = 4` the frame is:

```text
*****
*   *
*   *
*****
```

Special cases follow from the same rule:

- if `height` is 1, there is a single row of stars;
- if `width` is 1, there is a column of stars.

Use two nested `for` loops. For each cell `(row, col)`, decide whether it lies on the border: in the first or last row, or in the first or last column. Print the line break after each row. Lines must never end with a space.

Do not change `Main`. Expected output:

```text
*****
*   *
*   *
*****
---
***
* *
***
---
****
---
*
*
*
```
