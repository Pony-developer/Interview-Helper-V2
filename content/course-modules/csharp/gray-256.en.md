A grayscale image has pixels of **256 shades**: from 0 (black) to 255 (white). Let us give it a class, so that the pixels and the operations on them live together.

Write the class `GrayImage` (above `Program`):

- a constructor `GrayImage(width, height)`: all the pixels are 0 (black);
- `Set(x, y, value)`: sets a pixel. A value below 0 becomes **0**, and a value above 255 becomes **255** (it is **clamped**). `x` is the column and `y` is the row;
- `Get(x, y)`: reads a pixel;
- `Row(y)`: the pixels of the row `y` as text, separated by single spaces, such as `0 128 255`;
- `Invert()`: returns a **new** image in which every pixel is `255 − value`. The original is not changed;
- `Histogram()`: an `int[256]`, where element `v` is **how many pixels** have the value `v`;
- `Average()`: the average brightness of all the pixels, a `double`.

The pixels must be **private**: the outside code uses only the methods. Do not change `Main`. Expected output:

```text
0 128 255
255 0 128
255 127 0
0 128 255
2 2 2 256
127.67
```

The lines in order, for an image of 3 × 2 pixels: the first row; the second row (a pixel set to 300 became 255, and one set to −5 became 0); the first row of the **inverted** image; the first row of the **original**, which shows that it was not changed; the numbers of pixels with the values 0, 128 and 255, and the length of the histogram; and the average brightness, rounded to two decimal places: (0 + 128 + 255 + 255 + 0 + 128) / 6.

Hint: store the pixels in an `int[,]` or in a one-dimensional array of the size `width · height`. `Math.Clamp` does not exist in older .NET versions, so use `Math.Max(0, Math.Min(255, value))`.
