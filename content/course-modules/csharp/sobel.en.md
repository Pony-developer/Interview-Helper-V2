An **edge** in a picture is a place where the brightness changes quickly. The **Sobel filter** finds edges by measuring how strongly the brightness changes in each direction around a pixel. It is one of the classic algorithms of computer vision.

For an **inner** pixel `p` with the 3 × 3 neighbourhood

```text
a b c
d p e
f g h
```

the filter computes two numbers:

- the horizontal change: `gx = (c + 2·e + h) − (a + 2·d + f)`, the right column minus the left column, and the pixels in the middle row count double;
- the vertical change: `gy = (f + 2·g + h) − (a + 2·b + c)`, the bottom row minus the top row.

The strength of the edge is `|gx| + |gy|` (the sum of the absolute values), **limited to 255**: a larger value is replaced by 255.

Implement `Sobel(image)` for a grayscale `int[,]`:

- the result is a **new** image of the same size;
- for the inner pixels, use the formula above, reading the neighbours from the **original** image;
- the pixels on the **border** are `0`.

`Main` runs two 5 × 5 pictures. The first has a vertical edge between the values 0 and 10, so the horizontal change is strong, and the vertical one is zero. The second has a horizontal edge between 0 and 100: its strength is above 255, so the limit comes into play. The cost is **O(w · h)**. Do not change `Main`. Expected output:

```text
0 0 0 0 0
0 40 40 0 0
0 40 40 0 0
0 40 40 0 0
0 0 0 0 0
---
0 0 0 0 0
0 255 255 255 0
0 255 255 255 0
0 0 0 0 0
0 0 0 0 0
```

Let us check one number. In the first picture, every row reads `0 0 10 10 10`. For the pixel at row 1, column 1, the left column of its neighbourhood is `0, 0, 0` and the right column is `10, 10, 10`, so `(c + 2e + h) = 10 + 20 + 10 = 40` and `(a + 2d + f) = 0`. Hence `gx = 40`, `gy = 0`, and the strength is 40. For the pixel at column 3, both the left and the right columns hold 10, so `gx = 0` and the strength is 0.

Hint: write a small helper `int At(int[,] image, int r, int c)` if the formulas get long. Remember `Math.Abs` and `Math.Min(255, ...)`.
