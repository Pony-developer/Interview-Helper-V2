Photographs often contain noise: isolated pixels that are much too bright or too dark. The **median filter** removes them. It replaces every pixel with the **median** of the 3 × 3 neighbourhood around it (the pixel itself and its 8 neighbours). A single wrong pixel is an outlier among nine, and it never becomes the middle value. Unlike averaging, the median also keeps the sharp edges.

Implement `MedianFilter(image)` for a grayscale `int[,]`:

- the result is a **new** image of the same size; the original stays unchanged;
- for every **inner** pixel (not on the border), the new value is the median of its 3 × 3 neighbourhood: sort the 9 values, and take the 5th, in the middle;
- the pixels on the **border** (the first and last row and the first and last column) have no full neighbourhood, so they are copied **unchanged**.

The cost is **O(w · h)**: for each pixel you sort only nine values, and nine is a constant.

An important detail: take the neighbours from the **original** image, not from the result that you are building. Otherwise, the pixels that were already filtered would change the answer for the next ones.

`Main` filters two 5 × 5 images. The first is flat (all 10), with two noisy pixels, 255 and 0. The second has a vertical edge between the values 0 and 100, and one noisy pixel of 255 in the dark area. After filtering, the noise must be gone, **and the edge must stay sharp**. Do not change `Main`. Expected output:

```text
10 10 10 10 10
10 10 10 10 10
10 10 10 10 10
10 10 10 10 10
10 10 10 10 10
---
0 0 100 100 100
0 0 100 100 100
0 0 100 100 100
0 0 100 100 100
0 0 100 100 100
```

Hint: collect the nine values in an `int[9]`, call `Array.Sort`, and take the element with the index 4.
