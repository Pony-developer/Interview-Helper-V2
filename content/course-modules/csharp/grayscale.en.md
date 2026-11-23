A digital image is a two-dimensional array of pixels, and the algorithms that process it are loops over that array. The cost is **O(w · h)**: every pixel is visited a constant number of times. This task is your first image filter.

A colour pixel has three components: **red**, **green** and **blue**, each from 0 to 255. Here an image is given as three arrays of the same size, `red`, `green` and `blue`, where `red[row, col]` is the red component of the pixel in that position.

Implement `Grayscale(red, green, blue)`. It returns a new `int[,]` of the same size with the **brightness** of every pixel, calculated with the standard weights that follow the sensitivity of the human eye (green looks brighter than blue):

```text
gray = (299 · R + 587 · G + 114 · B) / 1000
```

The division is an **integer** division: the fraction is dropped. The three weights add up to 1000, so white `(255, 255, 255)` gives exactly 255 and black gives 0.

`Main` converts a 2 × 3 image: the first row is pure red, pure green and pure blue, and the second one is white, black and the colour `(100, 150, 200)`. The result is printed with `Show`. Do not change `Main`. Expected output:

```text
76 149 29
255 0 140
```

For example, pure red: `299 · 255 / 1000 = 76 245 / 1000 = 76`. Pure green is much brighter than pure blue: 149 against 29.

Hint: the size of the image is `red.GetLength(0)` rows and `red.GetLength(1)` columns. Create the result with the same size, and fill it with two nested loops.
