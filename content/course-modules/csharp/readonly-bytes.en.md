Write the class `ReadonlyBytes`: an immutable sequence of bytes that can be a dictionary key. Its contents never change after creation, and two objects with the same bytes are equal.

- the constructor `ReadonlyBytes(byte[] data)` **copies** the array, so changing the original array later does not change the object;
- `Length`: the number of bytes;
- the indexer `this[int index]`: reads a byte, without a setter;
- `Append(other)`: returns a **new** `ReadonlyBytes` with the bytes of this object followed by those of `other`;
- `Equals(object)` and `GetHashCode()`: value equality, consistent with each other;
- the operators `==` and `!=`, which compare the contents, and which work with `null`;
- `ToString()`: each byte as two uppercase hexadecimal digits, separated by spaces, such as `01 FF 10`. An empty sequence gives an empty text.

The class `Program` already has the `using System.Collections.Generic;` line for you. Do not change `Main`. Expected output:

```text
01 FF 10
True
True
False
01 FF 10 00
4
255
07
1
2
0
True
```

The lines in order: the bytes of `a`; `a == b` for two objects with the same bytes; `a.Equals(b)`; `a == c` for a longer sequence; the appended sequence `c`; its length; the byte at index 1; the copy `d` made from an array that was then changed (it still shows `07`); the count of the dictionary after adding `a` and then `b` (the same key, so one entry); the value of that key, `2`; the length of an empty sequence; and `a != c`.

Hint: `data.ToString("X2")` formats a byte as two uppercase hex digits. Collect the parts in a `string[]` and join them with `string.Join(" ", parts)`. For `GetHashCode`, combine the bytes with `hash = hash * 31 + b` inside an `unchecked` block. The operator `==` can call `Equals` after the `null` checks, and `!=` returns the opposite of `==`.
