## Task

`SemVer` models versions like `2.1.0` or `2.0.0-beta`. Make it sortable and usable as a dictionary or set key.

1. **`CompareTo(SemVer other)`**: compare `Major`, then `Minor`, then `Patch` numerically (so `1.10.0 > 1.2.0`). If they're all equal:
   - no tag on either → equal;
   - a version **with** a tag is **lower** than the same version without one (`2.0.0-beta < 2.0.0`);
   - two tags compare with `string.CompareOrdinal`.
   - A null `other` sorts first: return a positive number.
2. **`Equals(SemVer)`**, **`Equals(object)`** and **`GetHashCode()`**: consistent with `CompareTo` (equal exactly when the comparison is 0).
3. Operators **`<`** and **`>`**.

`Main` then sorts with the natural order and with a custom `IComparer` built by `Comparer<T>.Create`.

Expected output:

```
0.9.12 < 1.2.0-alpha < 1.2.0 < 1.10.0 < 2.0.0-alpha < 2.0.0-beta < 2.0.0
True
False
2
2.0.0, 1.10.0, 1.2.0, 0.9.12
```
