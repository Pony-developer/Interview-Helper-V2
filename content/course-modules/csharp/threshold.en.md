The simplest way to turn a grayscale picture into a black-and-white one is the **threshold filter**: every pixel that is bright enough becomes white, and every other pixel becomes black. This is how a scanner separates text from the paper.

Implement two methods for a grayscale image `int[,]` (each value from 0 to 255):

- `Threshold(image, t)` returns a **new** image of the same size. A pixel with the value **at least `t`** becomes `255` (white), and any other pixel becomes `0` (black). The original image must stay unchanged.
- `CountWhite(image)` returns how many pixels equal `255`.

The cost of both is **O(w · h)**, one visit per pixel.

`Main` uses this 3 × 4 image and the threshold 128:

```text
10 200 30 250
128 127 129 0
255 90 160 60
```

Note the pixels 128 and 127 near the border: 128 is **white**, because "at least" includes the threshold itself, and 127 is **black**. Do not change `Main`. Expected output:

```text
0 255 0 255
255 0 255 0
255 0 255 0
6
10 200 30 250
```

The last line shows the first row of the **original** image after the filter, to check that it was not modified.

Hint: create the result with `new int[rows, cols]`, and fill it in a double loop. A condition `image[r, c] >= t ? 255 : 0` does the job in one line.
