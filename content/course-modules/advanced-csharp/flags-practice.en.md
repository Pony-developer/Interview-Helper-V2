## Task

`Permission` is a `[Flags]` enum. Implement the four helpers with bitwise operators:

- **`Grant(current, extra)`** adds the `extra` flags.
- **`Revoke(current, removed)`** removes the `removed` flags and keeps the rest.
- **`HasAll(current, required)`** is `true` only if **every** flag in `required` is set (so `HasAll(x, Permission.Editor)` needs both Read and Write).
- **`Describe(current)`** lists the single-bit flags that are set, in the order Read, Write, Delete, Share, joined with `", "`; returns `"None"` when nothing is set. (Don't rely on `ToString()` here: for Read | Write it would print the composite name `Editor`.)

Expected output:

```
Read, Write, Share
True
False
Read, Share
None
Read, Write, Delete, Share
Editor
```
