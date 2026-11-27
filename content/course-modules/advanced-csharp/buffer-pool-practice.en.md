## Task

Build a tiny version of `ArrayPool<byte>` to understand what renting and returning buffers really means.

Buffers are grouped into **buckets** by power-of-two size (16, 32, 64, ...); `BucketSize(n)` (already written) gives the bucket for a request.

1. **`Rent(minimumLength)`**: find the bucket size; if that bucket has a returned buffer, pop and return it (reuse!); otherwise allocate a new `byte[bucketSize]` and increment `Allocations`. Note that the buffer may be **larger** than requested.
2. **`Return(buffer, clear)`**: a buffer whose length isn't exactly a bucket size can't have come from this pool: throw `ArgumentException("Buffer is not from this pool")`. If `clear` is true, zero it with `Array.Clear` first. Then push it onto its bucket's stack.

Watch the "dirty reuse" line: without clearing, the next renter sees the previous renter's data. That's why `ArrayPool.Return` has a `clearArray` parameter for sensitive buffers.

Expected output:

```
1000 rents of 100 bytes -> allocations: 1
sizes: 16, 32, 1024
distinct while both rented: True
dirty reuse: 42
cleared reuse: 0
Buffer is not from this pool
allocations: 6
```
